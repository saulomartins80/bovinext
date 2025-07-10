/***************************************
 * 🤖 CHATBOT RPA SERVICE - INTEGRAÇÃO INTELIGENTE
 * (Serviço de integração entre chatbot e RPA)
 ***************************************/

import { RobotOrchestrator } from '../core/RobotOrchestrator';
import { FinancialBrain } from '../modules/FinancialBrain';
import { AutomationService } from './AutomationService';
import { db } from '../core/MemoryDB';

interface ChatbotAction {
  type: 'CREATE_GOAL' | 'ADD_TRANSACTION' | 'ANALYZE_INVESTMENT' | 'EMERGENCY_ACTION' | 'GET_DASHBOARD';
  userId: string;
  data: any;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresConfirmation: boolean;
  context?: any;
}

interface ChatbotResponse {
  success: boolean;
  message: string;
  action?: any;
  recommendations?: any[];
  nextSteps?: string[];
  automationId?: string;
  taskId?: string;
  requiresConfirmation?: boolean;
  emergencyMode?: boolean;
}

export class ChatbotRPAService {
  private static instance: ChatbotRPAService;
  private orchestrator: RobotOrchestrator;
  private financialBrain: FinancialBrain;
  private automationService: AutomationService;
  private actionHistory: Map<string, any[]> = new Map();

  private constructor() {
    this.orchestrator = RobotOrchestrator.getInstance();
    this.financialBrain = FinancialBrain.getInstance();
    this.automationService = AutomationService.getInstance();
  }

  static getInstance(): ChatbotRPAService {
    if (!ChatbotRPAService.instance) {
      ChatbotRPAService.instance = new ChatbotRPAService();
    }
    return ChatbotRPAService.instance;
  }

  // 🎯 PROCESSAMENTO PRINCIPAL DE AÇÕES DO CHATBOT
  async processChatbotAction(action: ChatbotAction): Promise<ChatbotResponse> {
    console.log(`🤖 Processando ação do chatbot: ${action.type} para usuário ${action.userId}`);

    try {
      // Registrar ação no histórico
      this.recordAction(action);

      // Processar baseado no tipo
      switch (action.type) {
        case 'CREATE_GOAL':
          return await this.handleCreateGoal(action);
        
        case 'ADD_TRANSACTION':
          return await this.handleAddTransaction(action);
        
        case 'ANALYZE_INVESTMENT':
          return await this.handleAnalyzeInvestment(action);
        
        case 'EMERGENCY_ACTION':
          return await this.handleEmergencyAction(action);
        
        case 'GET_DASHBOARD':
          return await this.handleGetDashboard(action);
        
        default:
          throw new Error(`Tipo de ação não suportado: ${action.type}`);
      }

    } catch (error) {
      console.error(`❌ Erro no processamento da ação:`, error);
      return {
        success: false,
        message: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
        requiresConfirmation: true
      };
    }
  }

  // 🎯 CRIAÇÃO AUTOMÁTICA DE METAS
  private async handleCreateGoal(action: ChatbotAction): Promise<ChatbotResponse> {
    const { userId, data, priority } = action;

    console.log(`🎯 Criando meta automaticamente para ${userId}: ${data.meta}`);

    try {
      // 1. Análise financeira para recomendações
      const analysis = await this.financialBrain.analyzeUser(userId);
      
      // 2. Criar tarefa no RPA
      const taskId = await this.orchestrator.addTask('GOAL_CREATION', {
        userId,
        goalData: data,
        priority,
        analysis
      }, this.getPriorityNumber(priority));

      // 3. Executar automação no frontend
      const automationResult = await this.automationService.automateGoalCreation(userId, data);

      // 4. Gerar recomendações personalizadas
      const recommendations = this.generateGoalRecommendations(data, analysis);

      // 5. Salvar no banco
      await this.saveGoalToDatabase(userId, data, taskId);

      return {
        success: true,
        message: `🎯 Meta "${data.meta}" criada com sucesso! ${recommendations.suggestion}`,
        action: {
          type: 'GOAL_CREATED',
          data: { ...data, taskId }
        },
        recommendations: recommendations.recommendations,
        nextSteps: recommendations.nextSteps,
        taskId
      };

    } catch (error) {
      console.error(`❌ Erro na criação da meta:`, error);
      throw error;
    }
  }

  // 💰 ADIÇÃO AUTOMÁTICA DE TRANSAÇÕES
  private async handleAddTransaction(action: ChatbotAction): Promise<ChatbotResponse> {
    const { userId, data, priority } = action;

    console.log(`💰 Adicionando transação automaticamente para ${userId}: ${data.descricao}`);

    try {
      // 1. Análise de impacto na saúde financeira
      const impact = await this.analyzeTransactionImpact(userId, data);
      
      // 2. Criar tarefa no RPA
      const taskId = await this.orchestrator.addTask('TRANSACTION_ADDITION', {
        userId,
        transactionData: data,
        priority,
        impact
      }, this.getPriorityNumber(priority));

      // 3. Executar automação no frontend
      const automationResult = await this.automationService.automateTransactionAddition(userId, data);

      // 4. Gerar alertas se necessário
      const alerts = this.generateTransactionAlerts(impact);

      // 5. Salvar no banco
      await this.saveTransactionToDatabase(userId, data, taskId);

      return {
        success: true,
        message: `💰 Transação "${data.descricao}" adicionada! ${impact.message}`,
        action: {
          type: 'TRANSACTION_ADDED',
          data: { ...data, taskId, impact }
        },
        recommendations: alerts.recommendations,
        nextSteps: alerts.nextSteps,
        taskId
      };

    } catch (error) {
      console.error(`❌ Erro na adição da transação:`, error);
      throw error;
    }
  }

  // 📈 ANÁLISE AUTOMÁTICA DE INVESTIMENTOS
  private async handleAnalyzeInvestment(action: ChatbotAction): Promise<ChatbotResponse> {
    const { userId, data, priority } = action;

    console.log(`📈 Analisando investimentos para ${userId}`);

    try {
      // 1. Análise financeira completa
      const analysis = await this.financialBrain.analyzeUser(userId);
      
      // 2. Criar tarefa no RPA
      const taskId = await this.orchestrator.addTask('INVESTMENT_ANALYSIS', {
        userId,
        investmentData: data,
        priority,
        analysis
      }, this.getPriorityNumber(priority));

      // 3. Executar automação no frontend
      const automationResult = await this.automationService.automateMarketData(userId);

      // 4. Gerar conselhos de investimento
      const investmentAdvice = this.generateInvestmentAdvice(data, analysis);

      return {
        success: true,
        message: `📈 Análise de investimento concluída! ${investmentAdvice.summary}`,
        action: {
          type: 'INVESTMENT_ANALYZED',
          data: { ...data, taskId, analysis: investmentAdvice }
        },
        recommendations: investmentAdvice.recommendations,
        nextSteps: investmentAdvice.nextSteps,
        taskId
      };

    } catch (error) {
      console.error(`❌ Erro na análise de investimento:`, error);
      throw error;
    }
  }

  // 🚨 AÇÕES DE EMERGÊNCIA
  private async handleEmergencyAction(action: ChatbotAction): Promise<ChatbotResponse> {
    const { userId, data, priority } = action;

    console.log(`🚨 Executando ação de emergência para ${userId}`);

    try {
      // 1. Ativar modo de emergência
      await this.activateEmergencyMode(userId);
      
      // 2. Análise crítica
      const criticalAnalysis = await this.performCriticalAnalysis(userId);
      
      // 3. Criar tarefa crítica no RPA
      const taskId = await this.orchestrator.addTask('EMERGENCY_ACTION', {
        userId,
        emergencyData: data,
        priority: 'CRITICAL',
        analysis: criticalAnalysis
      }, 4); // Prioridade máxima

      // 4. Executar ações automáticas
      const emergencyActions = await this.executeEmergencyActions(userId, criticalAnalysis);

      return {
        success: true,
        message: `🚨 Modo de emergência ativado! ${emergencyActions.summary}`,
        action: {
          type: 'EMERGENCY_ACTIVATED',
          data: { taskId, analysis: criticalAnalysis, actions: emergencyActions }
        },
        recommendations: emergencyActions.recommendations,
        nextSteps: emergencyActions.immediateSteps,
        taskId,
        emergencyMode: true
      };

    } catch (error) {
      console.error(`❌ Erro na ação de emergência:`, error);
      throw error;
    }
  }

  // 📊 DASHBOARD PROFISSIONAL
  private async handleGetDashboard(action: ChatbotAction): Promise<ChatbotResponse> {
    const { userId } = action;

    console.log(`📊 Gerando dashboard profissional para ${userId}`);

    try {
      // 1. Gerar dashboard completo
      const dashboard = await this.financialBrain.generateProfessionalDashboard(userId);
      
      // 2. Executar automação para capturar dados do frontend
      const automationResult = await this.automationService.automateDashboard(userId);

      // 3. Salvar dashboard no banco
      await db.set(`dashboard_${userId}`, dashboard);

      return {
        success: true,
        message: `📊 Dashboard profissional gerado com sucesso!`,
        action: {
          type: 'DASHBOARD_GENERATED',
          data: { dashboard, automationResult }
        },
        recommendations: dashboard.recommendations?.immediate || [],
        nextSteps: [
          'Revisar alertas financeiros',
          'Analisar recomendações de investimento',
          'Ajustar metas conforme necessário'
        ]
      };

    } catch (error) {
      console.error(`❌ Erro na geração do dashboard:`, error);
      throw error;
    }
  }

  // 🔧 MÉTODOS AUXILIARES
  private recordAction(action: ChatbotAction): void {
    const userActions = this.actionHistory.get(action.userId) || [];
    userActions.push({
      ...action,
      timestamp: new Date()
    });
    this.actionHistory.set(action.userId, userActions.slice(-50)); // Manter últimas 50 ações
  }

  private generateGoalRecommendations(goalData: any, analysis: any): any {
    const recommendations = {
      suggestion: 'Excelente meta! Considere investir em fundos de renda fixa para alcançar seu objetivo.',
      recommendations: [
        'Configurar aportes automáticos mensais',
        'Monitorar progresso semanal',
        'Ajustar estratégia conforme necessário'
      ],
      nextSteps: [
        'Definir valor do aporte mensal',
        'Escolher investimento adequado',
        'Configurar lembretes de acompanhamento'
      ]
    };

    // Personalizar baseado no perfil de risco
    if (analysis.riskProfile === 'CONSERVADOR') {
      recommendations.recommendations.push('Priorizar segurança sobre rentabilidade');
    } else if (analysis.riskProfile === 'AGRESSIVO') {
      recommendations.recommendations.push('Considerar investimentos de maior risco/retorno');
    }

    return recommendations;
  }

  private async analyzeTransactionImpact(userId: string, transactionData: any): Promise<any> {
    // Simular análise de impacto
    const impact = {
      message: 'Transação registrada com sucesso!',
      impactOnBudget: 'NEUTRAL',
      impactOnGoals: 'POSITIVE',
      recommendations: []
    };

    // Análise baseada no valor
    if (transactionData.valor > 1000) {
      impact.message += ' Transação de alto valor detectada.';
      impact.recommendations.push('Revisar orçamento mensal');
    }

    return impact;
  }

  private generateTransactionAlerts(impact: any): any {
    const alerts = {
      recommendations: [],
      nextSteps: []
    };

    if (impact.impactOnBudget === 'NEGATIVE') {
      alerts.recommendations.push('Considerar reduzir gastos em outras categorias');
      alerts.nextSteps.push('Revisar orçamento mensal');
    }

    return alerts;
  }

  private generateInvestmentAdvice(investmentData: any, analysis: any): any {
    return {
      summary: 'Baseado no seu perfil de risco, recomendamos diversificar seus investimentos.',
      recommendations: [
        `${analysis.riskProfile === 'CONSERVADOR' ? '70%' : '60%'} em renda fixa`,
        `${analysis.riskProfile === 'CONSERVADOR' ? '20%' : '30%'} em renda variável`,
        '10% em reserva de emergência'
      ],
      nextSteps: [
        'Abrir conta em corretora',
        'Definir estratégia de aportes',
        'Configurar diversificação'
      ]
    };
  }

  private async activateEmergencyMode(userId: string): Promise<void> {
    console.log(`🚨 Ativando modo de emergência para ${userId}`);
    await db.set(`emergency_mode_${userId}`, {
      active: true,
      activatedAt: new Date(),
      userId
    });
  }

  private async performCriticalAnalysis(userId: string): Promise<any> {
    const analysis = await this.financialBrain.analyzeUser(userId);
    
    return {
      riskLevel: analysis.emergencyFund < analysis.monthlyExpenses * 3 ? 'HIGH' : 'MEDIUM',
      immediateActions: [
        'Revisar gastos desnecessários',
        'Criar reserva de emergência',
        'Reestruturar dívidas'
      ],
      priority: 'CRITICAL'
    };
  }

  private async executeEmergencyActions(userId: string, analysis: any): Promise<any> {
    return {
      summary: 'Ações de emergência executadas com sucesso',
      recommendations: analysis.immediateActions,
      immediateSteps: [
        'Pausar gastos não essenciais',
        'Revisar contratos e assinaturas',
        'Buscar fontes de renda alternativas'
      ]
    };
  }

  private async saveGoalToDatabase(userId: string, goalData: any, taskId: string): Promise<void> {
    await db.set(`goal_${userId}_${Date.now()}`, {
      ...goalData,
      userId,
      taskId,
      createdAt: new Date(),
      status: 'ACTIVE'
    });
  }

  private async saveTransactionToDatabase(userId: string, transactionData: any, taskId: string): Promise<void> {
    await db.set(`transaction_${userId}_${Date.now()}`, {
      ...transactionData,
      userId,
      taskId,
      createdAt: new Date(),
      status: 'CONFIRMED'
    });
  }

  private getPriorityNumber(priority: string): number {
    const priorities = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'CRITICAL': 4
    };
    return priorities[priority] || 1;
  }

  // 📊 MÉTODOS DE CONSULTA
  async getUserActionHistory(userId: string): Promise<any[]> {
    return this.actionHistory.get(userId) || [];
  }

  async getSystemStatus(): Promise<any> {
    return await this.orchestrator.getSystemMetrics();
  }

  async getAutomationStatus(automationId: string): Promise<any> {
    return await this.automationService.getAutomationStatus(automationId);
  }
} 