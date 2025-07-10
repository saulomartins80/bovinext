/***************************************
 * 🚨 EMERGENCY AI - IA DE EMERGÊNCIA
 * (Sistema de IA para situações críticas)
 ***************************************/

import { db } from '../core/MemoryDB';
import { RobotOrchestrator } from '../core/RobotOrchestrator';
import { FinancialBrain } from './FinancialBrain';

interface EmergencySituation {
  type: 'FINANCIAL_CRISIS' | 'FRAUD_DETECTION' | 'MARKET_CRASH' | 'PERSONAL_EMERGENCY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId: string;
  description: string;
  detectedAt: Date;
  data: any;
}

interface EmergencyAction {
  type: string;
  priority: 'IMMEDIATE' | 'URGENT' | 'HIGH' | 'NORMAL';
  description: string;
  automated: boolean;
  requiresHumanApproval: boolean;
  estimatedTime: number; // minutos
}

interface EmergencyResponse {
  situation: EmergencySituation;
  actions: EmergencyAction[];
  recommendations: string[];
  riskAssessment: any;
  timeline: any;
  status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED';
}

export class EmergencyAI {
  private static instance: EmergencyAI;
  private orchestrator: RobotOrchestrator;
  private financialBrain: FinancialBrain;
  private activeEmergencies: Map<string, EmergencyResponse> = new Map();
  private emergencyHistory: EmergencyResponse[] = [];

  private constructor() {
    this.orchestrator = RobotOrchestrator.getInstance();
    this.financialBrain = FinancialBrain.getInstance();
  }

  static getInstance(): EmergencyAI {
    if (!EmergencyAI.instance) {
      EmergencyAI.instance = new EmergencyAI();
    }
    return EmergencyAI.instance;
  }

  // 🚨 DETECÇÃO AUTOMÁTICA DE EMERGÊNCIAS
  async detectEmergency(userId: string, data: any): Promise<EmergencySituation | null> {
    console.log(`🚨 Analisando dados para detecção de emergência: ${userId}`);

    try {
      // 1. Análise financeira crítica
      const analysis = await this.financialBrain.analyzeUser(userId);
      
      // 2. Verificar indicadores de crise
      const crisisIndicators = this.analyzeCrisisIndicators(analysis, data);
      
      // 3. Detectar fraudes
      const fraudIndicators = this.detectFraudIndicators(data);
      
      // 4. Verificar crash de mercado
      const marketIndicators = this.detectMarketCrash(data);
      
      // 5. Verificar emergências pessoais
      const personalIndicators = this.detectPersonalEmergency(data);

      // Determinar situação mais crítica
      const emergency = this.determineEmergencySituation(
        crisisIndicators,
        fraudIndicators,
        marketIndicators,
        personalIndicators,
        userId
      );

      if (emergency) {
        console.log(`🚨 Emergência detectada: ${emergency.type} - Severidade: ${emergency.severity}`);
        await this.handleEmergency(emergency);
      }

      return emergency;

    } catch (error) {
      console.error(`❌ Erro na detecção de emergência:`, error);
      return null;
    }
  }

  // 🎯 ANÁLISE DE INDICADORES DE CRISE
  private analyzeCrisisIndicators(analysis: any, data: any): any {
    const indicators = {
      financialCrisis: false,
      severity: 'LOW',
      reasons: []
    };

    // Verificar fundo de emergência
    if (analysis.emergencyFund < analysis.monthlyExpenses * 2) {
      indicators.financialCrisis = true;
      indicators.severity = 'HIGH';
      indicators.reasons.push('Fundo de emergência insuficiente');
    }

    // Verificar dívidas altas
    if (analysis.monthlyExpenses > analysis.monthlyIncome * 0.8) {
      indicators.financialCrisis = true;
      indicators.severity = 'MEDIUM';
      indicators.reasons.push('Gastos muito altos em relação à renda');
    }

    // Verificar score de crédito baixo
    if (analysis.creditScore < 600) {
      indicators.financialCrisis = true;
      indicators.severity = 'HIGH';
      indicators.reasons.push('Score de crédito crítico');
    }

    return indicators;
  }

  // 🔍 DETECÇÃO DE FRAUDE
  private detectFraudIndicators(data: any): any {
    const indicators = {
      fraudDetected: false,
      severity: 'LOW',
      reasons: []
    };

    // Verificar transações suspeitas
    if (data.transactions) {
      const suspiciousTransactions = data.transactions.filter((t: any) => 
        t.valor > 10000 || // Transações muito altas
        t.categoria === 'Transferência' && t.valor > 5000 || // Transferências suspeitas
        t.descricao.toLowerCase().includes('suspicious') // Descrições suspeitas
      );

      if (suspiciousTransactions.length > 0) {
        indicators.fraudDetected = true;
        indicators.severity = 'CRITICAL';
        indicators.reasons.push('Transações suspeitas detectadas');
      }
    }

    // Verificar múltiplos logins
    if (data.loginAttempts && data.loginAttempts > 10) {
      indicators.fraudDetected = true;
      indicators.severity = 'HIGH';
      indicators.reasons.push('Múltiplas tentativas de login');
    }

    return indicators;
  }

  // 📉 DETECÇÃO DE CRASH DE MERCADO
  private detectMarketCrash(data: any): any {
    const indicators = {
      marketCrash: false,
      severity: 'LOW',
      reasons: []
    };

    // Verificar queda brusca em investimentos
    if (data.investments) {
      const totalLoss = data.investments.reduce((sum: number, inv: any) => 
        sum + (inv.loss || 0), 0
      );

      if (totalLoss > 10000) {
        indicators.marketCrash = true;
        indicators.severity = 'HIGH';
        indicators.reasons.push('Perdas significativas em investimentos');
      }
    }

    // Verificar volatilidade do mercado
    if (data.marketVolatility && data.marketVolatility > 0.3) {
      indicators.marketCrash = true;
      indicators.severity = 'MEDIUM';
      indicators.reasons.push('Alta volatilidade de mercado');
    }

    return indicators;
  }

  // 👤 DETECÇÃO DE EMERGÊNCIA PESSOAL
  private detectPersonalEmergency(data: any): any {
    const indicators = {
      personalEmergency: false,
      severity: 'LOW',
      reasons: []
    };

    // Verificar gastos médicos altos
    if (data.medicalExpenses && data.medicalExpenses > 5000) {
      indicators.personalEmergency = true;
      indicators.severity = 'HIGH';
      indicators.reasons.push('Gastos médicos elevados');
    }

    // Verificar perda de emprego
    if (data.employmentStatus === 'UNEMPLOYED') {
      indicators.personalEmergency = true;
      indicators.severity = 'CRITICAL';
      indicators.reasons.push('Perda de emprego detectada');
    }

    return indicators;
  }

  // 🎯 DETERMINAR SITUAÇÃO DE EMERGÊNCIA
  private determineEmergencySituation(
    crisisIndicators: any,
    fraudIndicators: any,
    marketIndicators: any,
    personalIndicators: any,
    userId: string
  ): EmergencySituation | null {
    
    // Priorizar por severidade
    if (fraudIndicators.fraudDetected && fraudIndicators.severity === 'CRITICAL') {
      return {
        type: 'FRAUD_DETECTION',
        severity: 'CRITICAL',
        userId,
        description: 'Fraude crítica detectada',
        detectedAt: new Date(),
        data: { fraudIndicators }
      };
    }

    if (personalIndicators.personalEmergency && personalIndicators.severity === 'CRITICAL') {
      return {
        type: 'PERSONAL_EMERGENCY',
        severity: 'CRITICAL',
        userId,
        description: 'Emergência pessoal crítica',
        detectedAt: new Date(),
        data: { personalIndicators }
      };
    }

    if (crisisIndicators.financialCrisis && crisisIndicators.severity === 'HIGH') {
      return {
        type: 'FINANCIAL_CRISIS',
        severity: 'HIGH',
        userId,
        description: 'Crise financeira detectada',
        detectedAt: new Date(),
        data: { crisisIndicators }
      };
    }

    if (marketIndicators.marketCrash && marketIndicators.severity === 'HIGH') {
      return {
        type: 'MARKET_CRASH',
        severity: 'HIGH',
        userId,
        description: 'Crash de mercado detectado',
        detectedAt: new Date(),
        data: { marketIndicators }
      };
    }

    return null; // Nenhuma emergência detectada
  }

  // 🚨 MANIPULAR EMERGÊNCIA
  private async handleEmergency(situation: EmergencySituation): Promise<void> {
    console.log(`🚨 Iniciando protocolo de emergência: ${situation.type}`);

    try {
      // 1. Criar resposta de emergência
      const response = await this.createEmergencyResponse(situation);
      
      // 2. Executar ações automáticas
      await this.executeEmergencyActions(response);
      
      // 3. Registrar emergência
      this.activeEmergencies.set(situation.userId, response);
      this.emergencyHistory.push(response);
      
      // 4. Salvar no banco
      await db.set(`emergency_${situation.userId}_${Date.now()}`, response);
      
      // 5. Notificar stakeholders se necessário
      if (situation.severity === 'CRITICAL') {
        await this.notifyStakeholders(response);
      }

      console.log(`✅ Protocolo de emergência iniciado para ${situation.userId}`);

    } catch (error) {
      console.error(`❌ Erro ao manipular emergência:`, error);
    }
  }

  // 📋 CRIAR RESPOSTA DE EMERGÊNCIA
  private async createEmergencyResponse(situation: EmergencySituation): Promise<EmergencyResponse> {
    const actions = this.generateEmergencyActions(situation);
    const recommendations = this.generateEmergencyRecommendations(situation);
    const riskAssessment = await this.assessRisk(situation);
    const timeline = this.generateTimeline(situation);

    return {
      situation,
      actions,
      recommendations,
      riskAssessment,
      timeline,
      status: 'ACTIVE'
    };
  }

  // ⚡ GERAR AÇÕES DE EMERGÊNCIA
  private generateEmergencyActions(situation: EmergencySituation): EmergencyAction[] {
    const actions: EmergencyAction[] = [];

    switch (situation.type) {
      case 'FRAUD_DETECTION':
        actions.push(
          {
            type: 'FREEZE_ACCOUNTS',
            priority: 'IMMEDIATE',
            description: 'Congelar contas suspeitas',
            automated: true,
            requiresHumanApproval: false,
            estimatedTime: 5
          },
          {
            type: 'NOTIFY_BANK',
            priority: 'IMMEDIATE',
            description: 'Notificar banco sobre fraude',
            automated: true,
            requiresHumanApproval: true,
            estimatedTime: 10
          },
          {
            type: 'GENERATE_FRAUD_REPORT',
            priority: 'URGENT',
            description: 'Gerar relatório de fraude',
            automated: true,
            requiresHumanApproval: false,
            estimatedTime: 15
          }
        );
        break;

      case 'FINANCIAL_CRISIS':
        actions.push(
          {
            type: 'CREATE_EMERGENCY_BUDGET',
            priority: 'IMMEDIATE',
            description: 'Criar orçamento de emergência',
            automated: true,
            requiresHumanApproval: false,
            estimatedTime: 10
          },
          {
            type: 'IDENTIFY_COST_CUTS',
            priority: 'URGENT',
            description: 'Identificar cortes de custos',
            automated: true,
            requiresHumanApproval: false,
            estimatedTime: 20
          },
          {
            type: 'CONTACT_CREDIT_COUNSELOR',
            priority: 'HIGH',
            description: 'Contatar conselheiro de crédito',
            automated: false,
            requiresHumanApproval: true,
            estimatedTime: 60
          }
        );
        break;

      case 'MARKET_CRASH':
        actions.push(
          {
            type: 'REBALANCE_PORTFOLIO',
            priority: 'IMMEDIATE',
            description: 'Rebalancear portfólio',
            automated: true,
            requiresHumanApproval: true,
            estimatedTime: 15
          },
          {
            type: 'HEDGE_POSITIONS',
            priority: 'URGENT',
            description: 'Proteger posições',
            automated: true,
            requiresHumanApproval: false,
            estimatedTime: 30
          },
          {
            type: 'ANALYZE_OPPORTUNITIES',
            priority: 'HIGH',
            description: 'Analisar oportunidades de compra',
            automated: true,
            requiresHumanApproval: false,
            estimatedTime: 45
          }
        );
        break;

      case 'PERSONAL_EMERGENCY':
        actions.push(
          {
            type: 'ACCESS_EMERGENCY_FUND',
            priority: 'IMMEDIATE',
            description: 'Acessar fundo de emergência',
            automated: true,
            requiresHumanApproval: false,
            estimatedTime: 5
          },
          {
            type: 'CONTACT_INSURANCE',
            priority: 'URGENT',
            description: 'Contatar seguradora',
            automated: false,
            requiresHumanApproval: true,
            estimatedTime: 30
          },
          {
            type: 'CREATE_RECOVERY_PLAN',
            priority: 'HIGH',
            description: 'Criar plano de recuperação',
            automated: true,
            requiresHumanApproval: false,
            estimatedTime: 60
          }
        );
        break;
    }

    return actions;
  }

  // 💡 GERAR RECOMENDAÇÕES DE EMERGÊNCIA
  private generateEmergencyRecommendations(situation: EmergencySituation): string[] {
    const recommendations: string[] = [];

    switch (situation.type) {
      case 'FRAUD_DETECTION':
        recommendations.push(
          'Mude imediatamente todas as senhas',
          'Ative autenticação de dois fatores',
          'Monitore todas as contas bancárias',
          'Entre em contato com o banco',
          'Considere congelar o crédito'
        );
        break;

      case 'FINANCIAL_CRISIS':
        recommendations.push(
          'Pare imediatamente gastos não essenciais',
          'Priorize pagamento de dívidas de alto juros',
          'Considere vender ativos não essenciais',
          'Busque fontes de renda alternativas',
          'Negocie prazos com credores'
        );
        break;

      case 'MARKET_CRASH':
        recommendations.push(
          'Não venda em pânico',
          'Mantenha a estratégia de longo prazo',
          'Considere comprar mais ativos',
          'Diversifique ainda mais o portfólio',
          'Mantenha fundo de emergência'
        );
        break;

      case 'PERSONAL_EMERGENCY':
        recommendations.push(
          'Acesse o fundo de emergência',
          'Priorize saúde e segurança',
          'Comunique-se com empregador',
          'Considere opções de seguro',
          'Planeje recuperação financeira'
        );
        break;
    }

    return recommendations;
  }

  // 📊 AVALIAR RISCO
  private async assessRisk(situation: EmergencySituation): Promise<any> {
    const riskLevels = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'CRITICAL': 4
    };

    const baseRisk = riskLevels[situation.severity];
    
    // Fatores adicionais
    let additionalRisk = 0;
    
    if (situation.type === 'FRAUD_DETECTION') additionalRisk += 2;
    if (situation.type === 'PERSONAL_EMERGENCY') additionalRisk += 1;
    if (situation.type === 'FINANCIAL_CRISIS') additionalRisk += 1;

    const totalRisk = Math.min(baseRisk + additionalRisk, 4);

    return {
      level: Object.keys(riskLevels)[totalRisk - 1],
      score: totalRisk,
      factors: [
        `Severidade: ${situation.severity}`,
        `Tipo: ${situation.type}`,
        'Análise em tempo real'
      ],
      mitigation: this.generateRiskMitigation(totalRisk)
    };
  }

  // 🕐 GERAR TIMELINE
  private generateTimeline(situation: EmergencySituation): any {
    const now = new Date();
    
    return {
      detected: now,
      immediateActions: new Date(now.getTime() + 5 * 60 * 1000), // 5 min
      urgentActions: new Date(now.getTime() + 30 * 60 * 1000), // 30 min
      highPriorityActions: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2h
      resolution: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24h
      followUp: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    };
  }

  // ⚡ EXECUTAR AÇÕES DE EMERGÊNCIA
  private async executeEmergencyActions(response: EmergencyResponse): Promise<void> {
    console.log(`⚡ Executando ${response.actions.length} ações de emergência`);

    for (const action of response.actions) {
      try {
        if (action.automated) {
          await this.executeAutomatedAction(action, response.situation);
        } else {
          console.log(`⏳ Ação manual pendente: ${action.description}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao executar ação ${action.type}:`, error);
      }
    }
  }

  // 🤖 EXECUTAR AÇÃO AUTOMATIZADA
  private async executeAutomatedAction(action: EmergencyAction, situation: EmergencySituation): Promise<void> {
    console.log(`🤖 Executando ação automática: ${action.type}`);

    // Adicionar tarefa ao orchestrator
    await this.orchestrator.addTask('EMERGENCY_ACTION', {
      actionType: action.type,
      situation: situation.type,
      userId: situation.userId,
      priority: action.priority,
      description: action.description
    }, this.getPriorityNumber(action.priority));

    // Simular execução
    await new Promise(resolve => setTimeout(resolve, action.estimatedTime * 1000));
    
    console.log(`✅ Ação ${action.type} executada com sucesso`);
  }

  // 📢 NOTIFICAR STAKEHOLDERS
  private async notifyStakeholders(response: EmergencyResponse): Promise<void> {
    console.log(`📢 Notificando stakeholders sobre emergência crítica`);
    
    // Em produção, enviaria notificações para:
    // - Usuário
    // - Suporte técnico
    // - Gerente de conta
    // - Compliance (se necessário)
  }

  // 🔧 MÉTODOS AUXILIARES
  private generateRiskMitigation(riskScore: number): string[] {
    const mitigations = {
      1: ['Monitoramento contínuo', 'Avaliação semanal'],
      2: ['Ações preventivas', 'Monitoramento diário'],
      3: ['Intervenção imediata', 'Monitoramento em tempo real'],
      4: ['Ação crítica imediata', 'Intervenção 24/7']
    };

    return mitigations[riskScore] || mitigations[1];
  }

  private getPriorityNumber(priority: string): number {
    const priorities = {
      'IMMEDIATE': 4,
      'URGENT': 3,
      'HIGH': 2,
      'NORMAL': 1
    };
    return priorities[priority] || 1;
  }

  // 📊 MÉTODOS DE CONSULTA
  async getActiveEmergencies(): Promise<EmergencyResponse[]> {
    return Array.from(this.activeEmergencies.values());
  }

  async getEmergencyHistory(userId?: string): Promise<EmergencyResponse[]> {
    if (userId) {
      return this.emergencyHistory.filter(e => e.situation.userId === userId);
    }
    return this.emergencyHistory;
  }

  async resolveEmergency(userId: string): Promise<void> {
    const emergency = this.activeEmergencies.get(userId);
    if (emergency) {
      emergency.status = 'RESOLVED';
      this.activeEmergencies.delete(userId);
      console.log(`✅ Emergência resolvida para ${userId}`);
    }
  }

  async getEmergencyStats(): Promise<any> {
    const active = this.activeEmergencies.size;
    const total = this.emergencyHistory.length;
    const critical = this.emergencyHistory.filter(e => e.situation.severity === 'CRITICAL').length;

    return {
      active,
      total,
      critical,
      resolved: total - active,
      resolutionRate: total > 0 ? ((total - active) / total * 100).toFixed(2) : '0.00'
    };
  }
} 