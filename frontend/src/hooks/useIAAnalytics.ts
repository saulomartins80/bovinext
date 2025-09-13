/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

export interface IAMetrics {
  ai: {
    status: string;
    models: { active: number; total: number };
    requests: { today: number; total: number; limit: number };
    performance: { latency: number; throughput: number; accuracy: number };
    usage: { daily: number[]; weekly: number[]; monthly: number[] };
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
  userProgress?: {
    progress: number;
    status: string;
    currentStep: string;
    completedSteps: string[];
    remainingSteps: string[];
    guidanceLevel: string;
  };
}

// Local stub for IA analytics
const IAAnalyticsStub = {
  async getIAMetrics(): Promise<IAMetrics> {
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
    } as IAMetrics;
  },
  async getUserProgress(_userId: string) {
    return {
      progress: 70,
      status: 'in-progress',
      currentStep: 'Refinar metas',
      completedSteps: ['Cadastro', 'Configurações iniciais'],
      remainingSteps: ['Conectar dados', 'Explorar IA'],
      guidanceLevel: 'medium'
    };
  },
  async processInteraction(_type: string, _data: any, _userId: string) { return true; },
  async executeGuidanceAction(_action: any, _userId: string) { return true; },
  getPlanLimits() { return { daily: 2000, monthly: 100000 }; }
};

export function useIAAnalytics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<IAMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      let realMetrics = await IAAnalyticsStub.getIAMetrics();
      if (user?.uid) {
        try {
          const userProgress = await IAAnalyticsStub.getUserProgress(user.uid);
          realMetrics = { ...realMetrics, userProgress } as IAMetrics;
        } catch (progressError) {
          console.warn('Erro ao carregar progresso do usuário:', progressError);
        }
      }
      setMetrics(realMetrics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Erro ao carregar métricas de IA:', err);
      setError('Erro ao carregar métricas de IA. Tente novamente.');
      setMetrics(await IAAnalyticsStub.getIAMetrics());
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  const refreshMetrics = useCallback(async () => {
    await loadMetrics();
  }, [loadMetrics]);

  const processInteraction = useCallback(async (type: string, data: any) => {
    if (!user?.uid) return;
    try {
      await IAAnalyticsStub.processInteraction(type, data, user.uid);
      await loadMetrics();
    } catch (err) {
      console.error('Erro ao processar interação:', err);
    }
  }, [user?.uid, loadMetrics]);

  const executeGuidanceAction = useCallback(async (action: any) => {
    if (!user?.uid) return;
    try {
      await IAAnalyticsStub.executeGuidanceAction(action, user.uid);
      await loadMetrics();
    } catch (err) {
      console.error('Erro ao executar ação de orientação:', err);
    }
  }, [user?.uid, loadMetrics]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    const interval = setInterval(() => { if (!isLoading) loadMetrics(); }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadMetrics, isLoading]);

  const getPlanLimits = useCallback(() => IAAnalyticsStub.getPlanLimits(), []);
  const getUsagePercentage = useCallback((current: number, limit: number) => Math.min(100, (current / limit) * 100), []);
  const isNearLimit = useCallback((current: number, limit: number, threshold: number = 0.8) => (current / limit) > threshold, []);

  return { metrics, isLoading, error, lastUpdated, refreshMetrics, processInteraction, executeGuidanceAction, getPlanLimits, getUsagePercentage, isNearLimit };
} 