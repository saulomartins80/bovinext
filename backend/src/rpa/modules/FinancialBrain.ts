/***************************************
 * 🧠 FINANCIAL BRAIN - CÉREBRO FINANCEIRO
 * (Análise financeira inteligente e automação)
 ***************************************/

import { db } from '../core/MemoryDB';
import { RobotOrchestrator } from '../core/RobotOrchestrator';
import { AutomationService } from '../services/AutomationService';

interface FinancialAnalysis {
  userId: string;
  riskProfile: 'CONSERVADOR' | 'MODERADO' | 'AGRESSIVO';
  investmentRecommendations: string[];
  savingsGoals: any[];
  spendingPatterns: any;
  creditScore: number;
  emergencyFund: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorth: number;
  timestamp: Date;
}

interface AutomationRequest {
  type: 'CREATE_GOAL' | 'ADD_TRANSACTION' | 'ANALYZE_INVESTMENT' | 'EMERGENCY_ACTION';
  userId: string;
  data: any;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresConfirmation: boolean;
}

export class FinancialBrain {
  private static instance: FinancialBrain;
  private orchestrator: RobotOrchestrator;
  private automationService: AutomationService;
  private analysisCache: Map<string, FinancialAnalysis> = new Map();

  private constructor() {
    this.orchestrator = RobotOrchestrator.getInstance();
    this.automationService = AutomationService.getInstance();
  }

  static getInstance(): FinancialBrain {
    if (!FinancialBrain.instance) {
      FinancialBrain.instance = new FinancialBrain();
    }
    return FinancialBrain.instance;
  }

  // 🎯 ANÁLISE FINANCEIRA INTELIGENTE
  async analyzeUser(userId: string): Promise<FinancialAnalysis> {
    console.log(`🧠 Analisando perfil financeiro do usuário ${userId}`);

    // Verificar cache primeiro
    const cacheKey = `analysis_${userId}`;
    const cachedAnalysis = this.analysisCache.get(cacheKey);
    if (cachedAnalysis && Date.now() - cachedAnalysis.timestamp.getTime() < 3600000) {
      return cachedAnalysis; // Cache válido por 1 hora
    }

    try {
      // Carregar dados do usuário
      const userData = await this.loadUserFinancialData(userId);
      
      // Análise de risco
      const riskProfile = this.calculateRiskProfile(userData);
      
      // Recomendações de investimento
      const investmentRecommendations = this.generateInvestmentRecommendations(userData, riskProfile);
      
      // Análise de padrões de gastos
      const spendingPatterns = this.analyzeSpendingPatterns(userData.transactions);
      
      // Score de crédito simulado
      const creditScore = this.calculateCreditScore(userData);
      
      // Fundo de emergência
      const emergencyFund = this.calculateEmergencyFund(userData);
      
      // Patrimônio líquido
      const netWorth = this.calculateNetWorth(userData);

      const analysis: FinancialAnalysis = {
        userId,
        riskProfile,
        investmentRecommendations,
        savingsGoals: userData.goals || [],
        spendingPatterns,
        creditScore,
        emergencyFund,
        monthlyIncome: userData.monthlyIncome || 0,
        monthlyExpenses: userData.monthlyExpenses || 0,
        netWorth,
        timestamp: new Date()
      };

      // Salvar no cache e banco
      this.analysisCache.set(cacheKey, analysis);
      await db.set(`financial_analysis_${userId}`, analysis);

      console.log(`✅ Análise financeira concluída para ${userId}`);
      return analysis;

    } catch (error) {
      console.error(`❌ Erro na análise financeira:`, error);
      throw error;
    }
  }

  // 🤖 AUTOMAÇÃO VIA CHATBOT
  async processChatbotRequest(request: AutomationRequest): Promise<any> {
    console.log(`🤖 Processando requisição de automação: ${request.type}`);

    try {
      switch (request.type) {
        case 'CREATE_GOAL':
          return await this.automateGoalCreation(request);
        
        case 'ADD_TRANSACTION':
          return await this.automateTransactionAddition(request);
        
        case 'ANALYZE_INVESTMENT':
          return await this.automateInvestmentAnalysis(request);
        
        case 'EMERGENCY_ACTION':
          return await this.handleEmergencyAction(request);
        
        default:
          throw new Error(`Tipo de automação não suportado: ${request.type}`);
      }
    } catch (error) {
      console.error(`❌ Erro na automação:`, error);
      throw error;
    }
  }

  // 🎯 CRIAÇÃO AUTOMÁTICA DE METAS
  private async automateGoalCreation(request: AutomationRequest): Promise<any> {
    const { userId, data, priority } = request;
    
    console.log(`🎯 Automatizando criação de meta para ${userId}`);

    // Adicionar tarefa ao orchestrator
    const taskId = await this.orchestrator.addTask('GOAL_CREATION', {
      userId,
      goalData: data,
      priority
    }, this.getPriorityNumber(priority));

    // Executar automação no frontend
    const automationResult = await this.automationService.automateGoalCreation(userId, data);

    // Análise financeira para recomendações
    const analysis = await this.analyzeUser(userId);
    const recommendations = this.generateGoalRecommendations(data, analysis);

    return {
      success: true,
      taskId,
      automationResult,
      recommendations,
      message: `Meta "${data.meta}" criada com sucesso! ${recommendations.suggestion}`,
      nextSteps: recommendations.nextSteps
    };
  }

  // 💰 ADIÇÃO AUTOMÁTICA DE TRANSAÇÕES
  private async automateTransactionAddition(request: AutomationRequest): Promise<any> {
    const { userId, data, priority } = request;
    
    console.log(`💰 Automatizando adição de transação para ${userId}`);

    // Adicionar tarefa ao orchestrator
    const taskId = await this.orchestrator.addTask('TRANSACTION_ADDITION', {
      userId,
      transactionData: data,
      priority
    }, this.getPriorityNumber(priority));

    // Executar automação no frontend
    const automationResult = await this.automationService.automateTransactionAddition(userId, data);

    // Análise de impacto na saúde financeira
    const impact = await this.analyzeTransactionImpact(userId, data);

    return {
      success: true,
      taskId,
      automationResult,
      impact,
      message: `Transação "${data.descricao}" adicionada! ${impact.message}`,
      alerts: impact.alerts
    };
  }

  // 📈 ANÁLISE AUTOMÁTICA DE INVESTIMENTOS
  private async automateInvestmentAnalysis(request: AutomationRequest): Promise<any> {
    const { userId, data, priority } = request;
    
    console.log(`📈 Automatizando análise de investimento para ${userId}`);

    // Adicionar tarefa ao orchestrator
    const taskId = await this.orchestrator.addTask('INVESTMENT_ANALYSIS', {
      userId,
      investmentData: data,
      priority
    }, this.getPriorityNumber(priority));

    // Executar automação no frontend
    const automationResult = await this.automationService.automateMarketData(userId);

    // Análise financeira completa
    const analysis = await this.analyzeUser(userId);
    const investmentAdvice = this.generateInvestmentAdvice(data, analysis);

    return {
      success: true,
      taskId,
      automationResult,
      analysis: investmentAdvice,
      message: `Análise de investimento concluída! ${investmentAdvice.summary}`,
      recommendations: investmentAdvice.recommendations
    };
  }

  // 🚨 AÇÕES DE EMERGÊNCIA
  private async handleEmergencyAction(request: AutomationRequest): Promise<any> {
    const { userId, data, priority } = request;
    
    console.log(`🚨 Executando ação de emergência para ${userId}`);

    // Ativar modo de emergência
    await this.activateEmergencyMode(userId);

    // Análise crítica
    const criticalAnalysis = await this.performCriticalAnalysis(userId);
    
    // Ações automáticas baseadas na situação
    const emergencyActions = await this.executeEmergencyActions(userId, criticalAnalysis);

    return {
      success: true,
      emergencyMode: true,
      criticalAnalysis,
      actions: emergencyActions,
      message: `🚨 Modo de emergência ativado! ${emergencyActions.summary}`,
      priority: 'CRITICAL'
    };
  }

  // 📊 DASHBOARD PROFISSIONAL
  async generateProfessionalDashboard(userId: string): Promise<any> {
    console.log(`📊 Gerando dashboard profissional para ${userId}`);

    try {
      // Análise financeira completa
      const analysis = await this.analyzeUser(userId);
      
      // Métricas do RPA
      const rpaMetrics = await this.orchestrator.getSystemMetrics();
      
      // Histórico de automações
      const automationHistory = await this.automationService.getAllAutomations();
      
      // Alertas e recomendações
      const alerts = await this.generateFinancialAlerts(analysis);
      
      // Projeções futuras
      const projections = this.generateFinancialProjections(analysis);

      return {
        userId,
        timestamp: new Date(),
        analysis,
        rpaMetrics,
        automationHistory: automationHistory.filter(a => a.userId === userId),
        alerts,
        projections,
        recommendations: {
          immediate: alerts.filter(a => a.severity === 'HIGH'),
          shortTerm: projections.shortTerm,
          longTerm: projections.longTerm
        }
      };

    } catch (error) {
      console.error(`❌ Erro ao gerar dashboard:`, error);
      throw error;
    }
  }

  // 🔧 MÉTODOS AUXILIARES
  private async loadUserFinancialData(userId: string): Promise<any> {
    // Simular carregamento de dados (em produção seria do banco real)
    return {
      transactions: [],
      investments: [],
      goals: [],
      monthlyIncome: 5000,
      monthlyExpenses: 3000
    };
  }

  private calculateRiskProfile(userData: any): 'CONSERVADOR' | 'MODERADO' | 'AGRESSIVO' {
    // Lógica simplificada de cálculo de perfil de risco
    return 'MODERADO';
  }

  private generateInvestmentRecommendations(userData: any, riskProfile: string): string[] {
    const recommendations = {
      CONSERVADOR: [
        'Tesouro Direto (SELIC) - Baixo risco, boa liquidez',
        'CDB de bancos grandes - Segurança e rentabilidade',
        'Fundos DI - Diversificação conservadora'
      ],
      MODERADO: [
        'Fundos Multimercado - Diversificação moderada',
        'Ações de empresas sólidas - Crescimento equilibrado',
        'Fundos Imobiliários - Renda passiva'
      ],
      AGRESSIVO: [
        'Ações de crescimento - Alto potencial',
        'Fundos de ações - Diversificação agressiva',
        'Criptomoedas - Inovação e risco'
      ]
    };

    return recommendations[riskProfile] || recommendations.MODERADO;
  }

  private analyzeSpendingPatterns(transactions: any[]): any {
    return {
      topCategories: ['Alimentação', 'Transporte', 'Lazer'],
      monthlyAverage: 3000,
      trend: 'DECREASING'
    };
  }

  private calculateCreditScore(userData: any): number {
    // Simulação de score de crédito
    return Math.floor(Math.random() * 200) + 600; // 600-800
  }

  private calculateEmergencyFund(userData: any): number {
    return userData.monthlyExpenses * 6; // 6 meses de despesas
  }

  private calculateNetWorth(userData: any): number {
    return userData.monthlyIncome * 12 - userData.monthlyExpenses * 12;
  }

  private generateGoalRecommendations(goalData: any, analysis: FinancialAnalysis): any {
    return {
      suggestion: 'Excelente meta! Considere investir em fundos de renda fixa para alcançar seu objetivo.',
      nextSteps: [
        'Configurar aportes automáticos',
        'Monitorar progresso mensal',
        'Ajustar estratégia conforme necessário'
      ]
    };
  }

  private async analyzeTransactionImpact(userId: string, transactionData: any): Promise<any> {
    return {
      message: 'Transação registrada com sucesso!',
      alerts: []
    };
  }

  private generateInvestmentAdvice(investmentData: any, analysis: FinancialAnalysis): any {
    return {
      summary: 'Baseado no seu perfil, recomendamos diversificar seus investimentos.',
      recommendations: [
        '60% em renda fixa',
        '30% em renda variável',
        '10% em reserva de emergência'
      ]
    };
  }

  private async activateEmergencyMode(userId: string): Promise<void> {
    console.log(`🚨 Ativando modo de emergência para ${userId}`);
    // Implementar lógica de emergência
  }

  private async performCriticalAnalysis(userId: string): Promise<any> {
    return {
      riskLevel: 'HIGH',
      immediateActions: ['Revisar gastos', 'Criar reserva de emergência'],
      priority: 'CRITICAL'
    };
  }

  private async executeEmergencyActions(userId: string, analysis: any): Promise<any> {
    return {
      summary: 'Ações de emergência executadas com sucesso',
      actions: analysis.immediateActions
    };
  }

  private async generateFinancialAlerts(analysis: FinancialAnalysis): Promise<any[]> {
    const alerts = [];
    
    if (analysis.emergencyFund < analysis.monthlyExpenses * 3) {
      alerts.push({
        type: 'WARNING',
        message: 'Fundo de emergência baixo',
        severity: 'HIGH'
      });
    }

    if (analysis.creditScore < 650) {
      alerts.push({
        type: 'WARNING',
        message: 'Score de crédito precisa de melhoria',
        severity: 'MEDIUM'
      });
    }

    return alerts;
  }

  private generateFinancialProjections(analysis: FinancialAnalysis): any {
    return {
      shortTerm: {
        nextMonth: analysis.netWorth * 1.02,
        nextQuarter: analysis.netWorth * 1.06
      },
      longTerm: {
        nextYear: analysis.netWorth * 1.25,
        nextFiveYears: analysis.netWorth * 2.5
      }
    };
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
} 