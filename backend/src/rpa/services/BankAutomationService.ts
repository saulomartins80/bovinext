import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import { RobotTask } from '../RobotOrchestrator';

// Configurar Puppeteer com Stealth
puppeteer.use(StealthPlugin());

export interface BankCredentials {
  username: string;
  password: string;
  bankUrl: string;
  selectors?: {
    usernameField?: string;
    passwordField?: string;
    loginButton?: string;
    transactionRows?: string;
    dateField?: string;
    descriptionField?: string;
    amountField?: string;
  };
}

export interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category?: string;
}

export class BankAutomationService {
  private browser: Browser | null = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    // Verificar se está em produção (Render)
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      console.log('🤖 Puppeteer desabilitado em produção');
      this.isInitialized = true;
      return;
    }

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

      this.isInitialized = true;
      console.log('🤖 Browser inicializado para automação bancária');
    } catch (error) {
      console.log('⚠️ Erro ao inicializar Puppeteer:', error.message);
      this.isInitialized = true; // Marcar como inicializado para evitar tentativas repetidas
    }
  }

  async syncBankData(userId: string, credentials: BankCredentials): Promise<RobotTask> {
    // Verificar se está em produção
    if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
      return {
        id: `bank-sync-${userId}-${Date.now()}`,
        type: 'DATA_SYNC',
        priority: 'HIGH',
        status: 'FAILED',
        payload: {
          operation: 'SYNC_BANK_DATA',
          userId,
          error: 'Automação bancária não disponível em produção',
          executionTime: 0
        },
        userId,
        createdAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        error: 'Automação bancária não disponível em produção',
        retries: 0,
        maxRetries: 3
      };
    }

    if (!this.browser) {
      throw new Error('Browser não inicializado');
    }

    const page = await this.browser.newPage();
    const startTime = Date.now();

    try {
      // Configuração do navegador
      await page.setViewport({ width: 1366, height: 768 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Navegação e login
      await page.goto(credentials.bankUrl, { waitUntil: 'networkidle2' });
      
      // Login
      const usernameField = credentials.selectors?.usernameField || '#user, #username, input[name="user"], input[name="username"]';
      const passwordField = credentials.selectors?.passwordField || '#password, input[name="password"]';
      const loginButton = credentials.selectors?.loginButton || '#login-btn, button[type="submit"], input[type="submit"]';

      await page.waitForSelector(usernameField);
      await page.type(usernameField, credentials.username);
      await page.type(passwordField, credentials.password);
      await page.click(loginButton);

      // Aguardar login
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Extração de transações
      const transactions = await this.extractTransactions(page, credentials.selectors);

      // Categorização automática
      const categorizedTransactions = transactions.map(t => ({
        ...t,
        category: this.detectCategory(t.description)
      }));

      const executionTime = Date.now() - startTime;

      return {
        id: `bank-sync-${userId}-${Date.now()}`,
        type: 'DATA_SYNC',
        priority: 'HIGH',
        status: 'COMPLETED',
        payload: {
          operation: 'SYNC_BANK_DATA',
          userId,
          transactions: categorizedTransactions,
          executionTime
        },
        userId,
        createdAt: new Date(),
        startedAt: new Date(startTime),
        completedAt: new Date(),
        retries: 0,
        maxRetries: 3
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        id: `bank-sync-${userId}-${Date.now()}`,
        type: 'DATA_SYNC',
        priority: 'HIGH',
        status: 'FAILED',
        payload: {
          operation: 'SYNC_BANK_DATA',
          userId,
          error: error.message,
          executionTime
        },
        userId,
        createdAt: new Date(),
        startedAt: new Date(startTime),
        completedAt: new Date(),
        error: error.message,
        retries: 0,
        maxRetries: 3
      };
    } finally {
      await page.close();
    }
  }

  private async extractTransactions(page: Page, selectors?: BankCredentials['selectors']): Promise<BankTransaction[]> {
    const transactionRows = selectors?.transactionRows || '.transaction-row, .movement-row, tr[data-transaction]';
    const dateField = selectors?.dateField || '.date, .transaction-date';
    const descriptionField = selectors?.descriptionField || '.description, .transaction-description';
    const amountField = selectors?.amountField || '.amount, .transaction-amount';

    // Aguardar carregamento das transações
    await page.waitForSelector(transactionRows, { timeout: 10000 });

    const transactions = await page.evaluate((rows, date, desc, amount) => {
      const elements = document.querySelectorAll(rows);
      return Array.from(elements).map(row => {
        const dateEl = row.querySelector(date);
        const descEl = row.querySelector(desc);
        const amountEl = row.querySelector(amount);

        if (!dateEl || !descEl || !amountEl) return null;

        const amountText = amountEl.textContent?.replace(/[^\d,.-]/g, '').replace(',', '.') || '0';
        const amountValue = parseFloat(amountText);
        const isCredit = amountEl.classList.contains('credit') || amountValue > 0;

        return {
          date: dateEl.textContent?.trim() || '',
          description: descEl.textContent?.trim() || '',
          amount: Math.abs(amountValue),
          type: isCredit ? 'receita' : 'despesa'
        };
      }).filter(t => t !== null);
    }, transactionRows, dateField, descriptionField, amountField);

    return transactions as BankTransaction[];
  }

  private detectCategory(description: string): string {
    const desc = description.toLowerCase();
    
    // Categorias principais
    if (desc.includes('mercado') || desc.includes('supermercado') || desc.includes('carrefour') || desc.includes('extra')) {
      return 'Alimentação';
    }
    
    if (desc.includes('posto') || desc.includes('combustível') || desc.includes('gasolina') || desc.includes('etanol')) {
      return 'Transporte';
    }
    
    if (desc.includes('uber') || desc.includes('99') || desc.includes('taxi')) {
      return 'Transporte';
    }
    
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('youtube') || desc.includes('streaming')) {
      return 'Entretenimento';
    }
    
    if (desc.includes('farmacia') || desc.includes('drogaria') || desc.includes('medicamento')) {
      return 'Saúde';
    }
    
    if (desc.includes('restaurante') || desc.includes('ifood') || desc.includes('rappi') || desc.includes('delivery')) {
      return 'Alimentação';
    }
    
    if (desc.includes('shopping') || desc.includes('loja') || desc.includes('roupa') || desc.includes('calçado')) {
      return 'Vestuário';
    }
    
    if (desc.includes('energia') || desc.includes('luz') || desc.includes('eletricidade')) {
      return 'Moradia';
    }
    
    if (desc.includes('agua') || desc.includes('saneamento')) {
      return 'Moradia';
    }
    
    if (desc.includes('internet') || desc.includes('wi-fi') || desc.includes('banda larga')) {
      return 'Tecnologia';
    }
    
    if (desc.includes('salario') || desc.includes('pagamento') || desc.includes('transferencia recebida')) {
      return 'Receita';
    }
    
    return 'Outros';
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
    }
  }
} 