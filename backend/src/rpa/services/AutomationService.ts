import { Page } from 'puppeteer';

interface AutomationAction {
  type: 'click' | 'type' | 'wait' | 'navigate' | 'screenshot' | 'extract' | 'scroll' | 'select';
  selector?: string;
  value?: string;
  delay?: number;
  url?: string;
  options?: any;
}

interface AutomationResult {
  success: boolean;
  data?: any;
  error?: string;
  screenshot?: string;
  timestamp: number;
}

export class AutomationService {
  private static instance: AutomationService;
  private page: Page | null = null;
  private isRunning: boolean = false;
  private automationQueue: Array<{ id: string; actions: AutomationAction[]; priority: number }> = [];
  private automationCache: Map<string, AutomationResult> = new Map();

  static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  async initialize(page: Page): Promise<void> {
    this.page = page;
    console.log('🤖 AutomationService inicializado');
  }

  async executeAutomation(actions: AutomationAction[], priority: number = 1): Promise<AutomationResult> {
    if (!this.page) {
      throw new Error('Página não inicializada');
    }

    const automationId = `automation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`🚀 Executando automação: ${automationId}`);
      this.isRunning = true;

      const result: AutomationResult = {
        success: true,
        data: {},
        timestamp: Date.now()
      };

      for (const action of actions) {
        const actionResult = await this.executeAction(action);
        
        if (!actionResult.success) {
          result.success = false;
          result.error = actionResult.error;
          break;
        }

        if (actionResult.data) {
          result.data = { ...result.data, ...actionResult.data };
        }

        if (actionResult.screenshot) {
          result.screenshot = actionResult.screenshot;
        }
      }

      // Salvar resultado no cache
      this.automationCache.set(automationId, result);
      
      console.log(`✅ Automação ${automationId} concluída`);
      return result;

    } catch (error) {
      console.error(`❌ Erro na automação ${automationId}:`, error);
      
      const errorResult: AutomationResult = {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };

      this.automationCache.set(automationId, errorResult);
      return errorResult;
    } finally {
      this.isRunning = false;
    }
  }

  private async executeAction(action: AutomationAction): Promise<AutomationResult> {
    if (!this.page) {
      return { success: false, error: 'Página não inicializada', timestamp: Date.now() };
    }

    try {
      switch (action.type) {
        case 'click':
          await this.page.click(action.selector!);
          break;

        case 'type':
          await this.page.type(action.selector!, action.value!);
          break;

        case 'wait':
          await this.page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, action.delay || 1000)));
          break;

        case 'navigate':
          await this.page.goto(action.url!, { waitUntil: 'networkidle2' });
          break;

        case 'screenshot':
          const screenshot = await this.page.screenshot({ 
            fullPage: action.options?.fullPage || false,
            path: action.options?.path
          });
          return { 
            success: true, 
            screenshot: screenshot.toString(),
            timestamp: Date.now() 
          };

        case 'extract':
          const data = await this.page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.textContent : null;
          }, action.selector);
          
          return { 
            success: true, 
            data: { [action.options?.key || 'extracted']: data },
            timestamp: Date.now() 
          };

        case 'scroll':
          await this.page.evaluate((options) => {
            window.scrollTo(options?.x || 0, options?.y || 0);
          }, action.options);
          break;

        case 'select':
          await this.page.select(action.selector!, action.value!);
          break;

        default:
          throw new Error(`Tipo de ação não suportado: ${action.type}`);
      }

      if (action.delay) {
        await this.page.waitForFunction(() => new Promise(resolve => setTimeout(resolve, action.delay)));
      }

      return { success: true, timestamp: Date.now() };

    } catch (error) {
      return { 
        success: false, 
        error: `Erro na ação ${action.type}: ${error.message}`,
        timestamp: Date.now() 
      };
    }
  }

  // Automações específicas para o frontend
  async automateDashboard(userId: string): Promise<AutomationResult> {
    const actions: AutomationAction[] = [
      { type: 'navigate', url: 'http://localhost:3000/dashboard' },
      { type: 'wait', delay: 2000 },
      { type: 'screenshot', options: { fullPage: true } },
      { type: 'extract', selector: '.financial-summary', options: { key: 'summary' } },
      { type: 'extract', selector: '.transactions-list', options: { key: 'transactions' } }
    ];

    return await this.executeAutomation(actions, 2);
  }

  async automateChatbot(userId: string, message: string): Promise<AutomationResult> {
    const actions: AutomationAction[] = [
      { type: 'navigate', url: 'http://localhost:3000/dashboard' },
      { type: 'wait', delay: 2000 },
      { type: 'click', selector: '.chatbot-toggle' },
      { type: 'wait', delay: 1000 },
      { type: 'type', selector: '.chatbot-input', value: message },
      { type: 'click', selector: '.chatbot-send' },
      { type: 'wait', delay: 3000 },
      { type: 'extract', selector: '.chatbot-messages', options: { key: 'response' } }
    ];

    return await this.executeAutomation(actions, 1);
  }

  async automateGoalCreation(userId: string, goalData: any): Promise<AutomationResult> {
    const actions: AutomationAction[] = [
      { type: 'navigate', url: 'http://localhost:3000/metas' },
      { type: 'wait', delay: 2000 },
      { type: 'click', selector: '.add-goal-button' },
      { type: 'wait', delay: 1000 },
      { type: 'type', selector: 'input[name="meta"]', value: goalData.meta },
      { type: 'type', selector: 'input[name="valor"]', value: goalData.valor.toString() },
      { type: 'type', selector: 'input[name="data"]', value: goalData.data },
      { type: 'click', selector: '.save-goal-button' },
      { type: 'wait', delay: 2000 },
      { type: 'screenshot', options: { fullPage: false } }
    ];

    return await this.executeAutomation(actions, 2);
  }

  async automateTransactionAddition(userId: string, transactionData: any): Promise<AutomationResult> {
    const actions: AutomationAction[] = [
      { type: 'navigate', url: 'http://localhost:3000/transacoes' },
      { type: 'wait', delay: 2000 },
      { type: 'click', selector: '.add-transaction-button' },
      { type: 'wait', delay: 1000 },
      { type: 'type', selector: 'input[name="descricao"]', value: transactionData.descricao },
      { type: 'type', selector: 'input[name="valor"]', value: transactionData.valor.toString() },
      { type: 'select', selector: 'select[name="categoria"]', value: transactionData.categoria },
      { type: 'click', selector: '.save-transaction-button' },
      { type: 'wait', delay: 2000 },
      { type: 'screenshot', options: { fullPage: false } }
    ];

    return await this.executeAutomation(actions, 2);
  }

  async automateMarketData(userId: string): Promise<AutomationResult> {
    const actions: AutomationAction[] = [
      { type: 'navigate', url: 'http://localhost:3000/investimentos' },
      { type: 'wait', delay: 3000 },
      { type: 'extract', selector: '.market-data', options: { key: 'marketData' } },
      { type: 'extract', selector: '.portfolio-summary', options: { key: 'portfolio' } },
      { type: 'screenshot', options: { fullPage: true } }
    ];

    return await this.executeAutomation(actions, 1);
  }

  // Sistema de fila para automações
  async queueAutomation(actions: AutomationAction[], priority: number = 1): Promise<string> {
    const automationId = `queued_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.automationQueue.push({
      id: automationId,
      actions,
      priority
    });

    // Ordenar fila por prioridade
    this.automationQueue.sort((a, b) => b.priority - a.priority);

    console.log(`📋 Automação enfileirada: ${automationId} (prioridade: ${priority})`);
    return automationId;
  }

  async processQueue(): Promise<void> {
    if (this.isRunning || this.automationQueue.length === 0) {
      return;
    }

    const automation = this.automationQueue.shift();
    if (!automation) return;

    try {
      await this.executeAutomation(automation.actions, automation.priority);
    } catch (error) {
      console.error(`❌ Erro ao processar automação ${automation.id}:`, error);
    }
  }

  // Métodos de utilidade
  async getAutomationStatus(automationId: string): Promise<any> {
    return this.automationCache.get(automationId) || null;
  }

  async getAllAutomations(): Promise<any[]> {
    const automations = [];
    for (const [id, result] of this.automationCache.entries()) {
      automations.push({
        id,
        ...result
      });
    }
    
    return automations;
  }

  getQueueStatus(): any {
    return {
      queueLength: this.automationQueue.length,
      isRunning: this.isRunning,
      nextAutomation: this.automationQueue[0] || null
    };
  }

  clearQueue(): void {
    this.automationQueue = [];
    console.log('🗑️ Fila de automações limpa');
  }

  // Métodos para integração com o frontend
  async automateFrontendAction(action: string, data: any): Promise<AutomationResult> {
    switch (action) {
      case 'dashboard':
        return await this.automateDashboard(data.userId);
      
      case 'chatbot':
        return await this.automateChatbot(data.userId, data.message);
      
      case 'create_goal':
        return await this.automateGoalCreation(data.userId, data.goalData);
      
      case 'add_transaction':
        return await this.automateTransactionAddition(data.userId, data.transactionData);
      
      case 'market_data':
        return await this.automateMarketData(data.userId);
      
      default:
        throw new Error(`Ação não suportada: ${action}`);
    }
  }
} 