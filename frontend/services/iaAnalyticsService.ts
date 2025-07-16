import api from './api';

export interface IAMetrics {
  ai: {
    status: string;
    models: { active: number; total: number };
    requests: { today: number; total: number; limit: number };
    performance: { latency: number; throughput: number; accuracy: number };
    usage: {
      daily: number[];
      weekly: number[];
      monthly: number[];
    };
  };
  chatbot: {
    status: string;
    sessions: { active: number; total: number; limit: number };
    performance: { responseTime: number; accuracy: number; satisfaction: number };
    interactions: { today: number; total: number; limit: number };
    topics: Array<{ name: string; count: number; percentage: number }>;
  };
  guidance: {
    status: string;
    activeJourneys: number;
    completedJourneys: number;
    averageProgress: number;
    userSatisfaction: number;
  };
  system: {
    status: string;
    financialHealth: { score: number; trend: string };
    userActivity: { activeDays: number; totalActions: number };
    goals: { completed: number; total: number };
    investments: { active: number; totalValue: number };
  };
}

export interface PlanLimits {
  free: PlanInfo;
  essencial: PlanInfo;
  top: PlanInfo;
  enterprise: PlanInfo;
}

export interface PlanInfo {
  name: string;
  aiRequests: number;
  chatbotSessions: number;
  guidanceSessions: number;
  features: string[];
}

export class IAAnalyticsService {
  // Buscar métricas de IA
  static async getIAMetrics(): Promise<IAMetrics> {
    try {
      const response = await api.get('/api/rpa/guidance/metrics');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar métricas de IA:', error);
      // Retornar dados mockados em caso de erro
      return this.getMockMetrics();
    }
  }

  // Buscar progresso da jornada do usuário
  static async getUserProgress(userId?: string): Promise<any> {
    try {
      if (!userId) {
        console.warn('userId não fornecido para getUserProgress');
        return null;
      }
      
      const response = await api.get(`/api/rpa/guidance/journey/progress?userId=${userId}`);
      return response.data.userProgress;
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      return null;
    }
  }

  // Buscar jornada ativa do usuário
  static async getActiveJourney(userId?: string): Promise<any> {
    try {
      if (!userId) {
        console.warn('userId não fornecido para getActiveJourney');
        return null;
      }
      
      const response = await api.get(`/api/rpa/guidance/journey/active?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar jornada ativa:', error);
      return null;
    }
  }

  // Processar interação do usuário
  static async processInteraction(type: string, data: any, userId?: string): Promise<any> {
    try {
      if (!userId) {
        console.warn('userId não fornecido para processInteraction');
        return null;
      }
      
      const response = await api.post(`/api/rpa/guidance/interaction?userId=${userId}`, { type, data });
      return response.data;
    } catch (error) {
      console.error('Erro ao processar interação:', error);
      return null;
    }
  }

  // Executar ação de orientação
  static async executeGuidanceAction(action: any, userId?: string): Promise<any> {
    try {
      if (!userId) {
        console.warn('userId não fornecido para executeGuidanceAction');
        return null;
      }
      
      const response = await api.post(`/api/rpa/guidance/action?userId=${userId}`, action);
      return response.data;
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      return null;
    }
  }

  // Obter limites dos planos
  static getPlanLimits(): PlanLimits {
    return {
      free: {
        name: 'Gratuito',
        aiRequests: 100,
        chatbotSessions: 10,
        guidanceSessions: 1,
        features: ['Chatbot básico', 'Análises simples', 'Suporte por email']
      },
      essencial: {
        name: 'Essencial',
        aiRequests: 2000,
        chatbotSessions: 50,
        guidanceSessions: 5,
        features: ['Chatbot inteligente', 'Análises avançadas', 'Suporte prioritário', 'Relatórios mensais']
      },
      top: {
        name: 'Top',
        aiRequests: 10000,
        chatbotSessions: 200,
        guidanceSessions: 20,
        features: ['IA personalizada', 'Consultoria financeira', 'Suporte 24/7', 'Relatórios semanais', 'API access']
      },
      enterprise: {
        name: 'Enterprise',
        aiRequests: 50000,
        chatbotSessions: 1000,
        guidanceSessions: 100,
        features: ['IA customizada', 'Consultoria dedicada', 'Suporte VIP', 'Relatórios diários', 'API completa', 'Integração personalizada']
      }
    };
  }

  // Dados mockados para desenvolvimento
  private static getMockMetrics(): IAMetrics {
    return {
      ai: {
        status: 'online',
        models: { active: 3, total: 5 },
        requests: { today: 1250, total: 45000, limit: 2000 },
        performance: { latency: 150, throughput: 85, accuracy: 96.5 },
        usage: {
          daily: [120, 180, 150, 200, 250, 300, 280],
          weekly: [1200, 1400, 1600, 1800, 2000, 2200, 2400],
          monthly: [5000, 6000, 7000, 8000, 9000, 10000, 11000]
        }
      },
      chatbot: {
        status: 'online',
        sessions: { active: 5, total: 25, limit: 50 },
        performance: { responseTime: 1.8, accuracy: 95.2, satisfaction: 4.8 },
        interactions: { today: 89, total: 3200, limit: 100 },
        topics: [
          { name: 'Investimentos', count: 45, percentage: 35 },
          { name: 'Metas', count: 28, percentage: 22 },
          { name: 'Transações', count: 32, percentage: 25 },
          { name: 'Suporte', count: 25, percentage: 18 }
        ]
      },
      guidance: {
        status: 'online',
        activeJourneys: 12,
        completedJourneys: 89,
        averageProgress: 67,
        userSatisfaction: 4.6
      },
      system: {
        status: 'healthy',
        financialHealth: { score: 85, trend: 'stable' },
        userActivity: { activeDays: 7, totalActions: 150 },
        goals: { completed: 10, total: 20 },
        investments: { active: 5, totalValue: 12000 }
      }
    };
  }

  // Gerar dados para gráficos
  static generateChartData(usage: number[], labels: string[]): any[] {
    return usage.map((value, index) => ({
      name: labels[index] || `Dia ${index + 1}`,
      value
    }));
  }

  // Calcular estatísticas
  static calculateStats(usage: number[]) {
    const total = usage.reduce((sum, value) => sum + value, 0);
    const average = total / usage.length;
    const max = Math.max(...usage);
    const min = Math.min(...usage);
    
    return { total, average, max, min };
  }
} 