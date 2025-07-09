import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import winston from 'winston';
import { EnhancedSecurityService } from './EnhancedSecurityService';

puppeteer.use(StealthPlugin());

interface AutomationConfig {
  type: 'web' | 'api' | 'desktop' | 'mobile';
  target: string;
  credentials?: {
    username: string;
    password: string;
  };
  selectors?: {
    usernameField?: string;
    passwordField?: string;
    loginButton?: string;
    [key: string]: string | undefined;
  };
  actions: AutomationAction[];
  stealth?: boolean;
  timeout?: number;
}

interface AutomationAction {
  type: 'click' | 'type' | 'wait' | 'screenshot' | 'extract' | 'navigate';
  selector?: string;
  value?: string;
  delay?: number;
  description: string;
}

interface AutomationResult {
  success: boolean;
  data?: any;
  screenshots?: string[];
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export class AutomationService {
  private logger: winston.Logger;
  private securityService: EnhancedSecurityService;
  private browser: any;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'automation-service' },
      transports: [
        new winston.transports.File({ filename: 'logs/rpa-automation.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    this.securityService = new EnhancedSecurityService();
  }

  async initialize(): Promise<void> {
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

      this.logger.info('🤖 Serviço de automação inicializado');
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar automação:', error);
      throw error;
    }
  }

  async executeAutomation(config: AutomationConfig): Promise<AutomationResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`🚀 Iniciando automação: ${config.type} - ${config.target}`);

      // Validar entrada
      if (!this.securityService.validateInput(config)) {
        throw new Error('Configuração de automação inválida');
      }

      let result: AutomationResult;

      switch (config.type) {
        case 'web':
          result = await this.handleWebAutomation(config);
          break;
        case 'api':
          result = await this.handleAPIAutomation(config);
          break;
        default:
          throw new Error(`Tipo de automação não suportado: ${config.type}`);
      }

      result.executionTime = Date.now() - startTime;
      result.timestamp = new Date();

      this.logger.info(`✅ Automação concluída em ${result.executionTime}ms`);
      return result;

    } catch (error) {
      this.logger.error('❌ Erro na automação:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        executionTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  private async handleWebAutomation(config: AutomationConfig): Promise<AutomationResult> {
    const page = await this.browser.newPage();
    const screenshots: string[] = [];

    try {
      // Configurar stealth se necessário
      if (config.stealth) {
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await page.setViewport({ width: 1920, height: 1080 });
      }

      // Navegar para o site
      await page.goto(config.target, { 
        waitUntil: 'networkidle2',
        timeout: config.timeout || 30000 
      });

      // Login se credenciais fornecidas
      if (config.credentials && config.selectors) {
        await this.performLogin(page, config.credentials, config.selectors);
      }

      // Executar ações
      const data = await this.executeActions(page, config.actions, screenshots);

      await page.close();

      return {
        success: true,
        data,
        screenshots,
        executionTime: 0,
        timestamp: new Date()
      };

    } catch (error) {
      await page.close();
      throw error;
    }
  }

  private async handleAPIAutomation(config: AutomationConfig): Promise<AutomationResult> {
    try {
      // Implementar automação de API
      const response = await fetch(config.target, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'RPA-Automation-Service/1.0'
        }
      });

      const data = await response.json();

      return {
        success: true,
        data,
        executionTime: 0,
        timestamp: new Date()
      };

    } catch (error) {
      throw error;
    }
  }

  private async performLogin(page: any, credentials: any, selectors: any): Promise<void> {
    try {
      // Criptografar credenciais antes de usar
      const encryptedUsername = await this.securityService.encryptData(credentials.username);
      const encryptedPassword = await this.securityService.encryptData(credentials.password);

      // Descriptografar para uso
      const username = await this.securityService.decryptData(encryptedUsername);
      const password = await this.securityService.decryptData(encryptedPassword);

      if (selectors.usernameField) {
        await page.type(selectors.usernameField, username);
      }

      if (selectors.passwordField) {
        await page.type(selectors.passwordField, password);
      }

      if (selectors.loginButton) {
        await page.click(selectors.loginButton);
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
      }

      this.logger.info('🔐 Login realizado com sucesso');

    } catch (error) {
      this.logger.error('❌ Erro no login:', error);
      throw error;
    }
  }

  private async executeActions(page: any, actions: AutomationAction[], screenshots: string[]): Promise<any> {
    const data: any = {};

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'click':
            if (action.selector) {
              await page.click(action.selector);
            }
            break;

          case 'type':
            if (action.selector && action.value) {
              await page.type(action.selector, action.value);
            }
            break;

          case 'wait':
            await page.waitForTimeout(action.delay || 1000);
            break;

          case 'screenshot':
            const screenshotPath = `screenshots/${Date.now()}.png`;
            await page.screenshot({ path: screenshotPath });
            screenshots.push(screenshotPath);
            break;

          case 'extract':
            if (action.selector) {
              const extracted = await page.$eval(action.selector, (el: any) => el.textContent);
              data[action.description] = extracted;
            }
            break;

          case 'navigate':
            if (action.value) {
              await page.goto(action.value, { waitUntil: 'networkidle2' });
            }
            break;
        }

        if (action.delay) {
          await page.waitForTimeout(action.delay);
        }

      } catch (error) {
        this.logger.error(`❌ Erro na ação ${action.type}:`, error);
        throw error;
      }
    }

    return data;
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.logger.info('🧹 Automação limpa');
    }
  }
} 