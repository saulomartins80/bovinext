import { useState, useEffect } from 'react';
import { IAAnalyticsService, IAMetrics, PlanLimits } from '../services/iaAnalyticsService';

// Tipos específicos para o progresso do usuário e jornada
interface UserProgress {
  completedSteps: number;
  totalSteps: number;
  currentStep: string;
  progressPercentage: number;
  lastUpdated: Date;
  achievements: string[];
}

interface ActiveJourney {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  currentStep: number;
  totalSteps: number;
  estimatedCompletion: Date;
  category: string;
}

export function useIAAnalytics() {
  const [metrics, setMetrics] = useState<IAMetrics | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [activeJourney, setActiveJourney] = useState<ActiveJourney | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState('essencial');

  // Carregar métricas
  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await IAAnalyticsService.getIAMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Erro ao carregar métricas de IA');
      console.error('Erro ao carregar métricas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar progresso do usuário
  const loadUserProgress = async () => {
    try {
      const progress = await IAAnalyticsService.getUserProgress();
      setUserProgress(progress);
    } catch (err) {
      console.error('Erro ao carregar progresso:', err);
    }
  };

  // Carregar jornada ativa
  const loadActiveJourney = async () => {
    try {
      const journey = await IAAnalyticsService.getActiveJourney();
      setActiveJourney(journey);
    } catch (err) {
      console.error('Erro ao carregar jornada:', err);
    }
  };

  // Processar interação
  const processInteraction = async (type: string, data: Record<string, unknown>) => {
    try {
      const result = await IAAnalyticsService.processInteraction(type, data);
      if (result) {
        // Recarregar dados após interação
        await loadUserProgress();
        await loadActiveJourney();
      }
      return result;
    } catch (err) {
      console.error('Erro ao processar interação:', err);
      return null;
    }
  };

  // Executar ação de orientação
  const executeGuidanceAction = async (action: Record<string, unknown>) => {
    try {
      const result = await IAAnalyticsService.executeGuidanceAction(action);
      if (result) {
        // Recarregar dados após ação
        await loadUserProgress();
        await loadActiveJourney();
      }
      return result;
    } catch (err) {
      console.error('Erro ao executar ação:', err);
      return null;
    }
  };

  // Obter limites do plano atual
  const getCurrentPlanLimits = () => {
    const planLimits = IAAnalyticsService.getPlanLimits();
    return planLimits[userPlan as keyof PlanLimits] || planLimits.essencial;
  };

  // Calcular uso percentual
  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min(100, (current / limit) * 100);
  };

  // Verificar se está próximo do limite
  const isNearLimit = (current: number, limit: number, threshold: number = 0.8) => {
    return (current / limit) >= threshold;
  };

  // Gerar dados para gráficos
  const getChartData = (type: 'daily' | 'weekly' | 'monthly') => {
    if (!metrics?.ai?.usage) return [];
    
    const usage = metrics.ai.usage[type];
    const labels = type === 'daily' 
      ? ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
      : type === 'weekly'
      ? ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7']
      : ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
    
    return IAAnalyticsService.generateChartData(usage, labels);
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadMetrics();
    loadUserProgress();
    loadActiveJourney();
  }, []);

  // Atualizar dados periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      loadMetrics();
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return {
    // Estado
    metrics,
    userProgress,
    activeJourney,
    isLoading,
    error,
    userPlan,
    
    // Ações
    loadMetrics,
    loadUserProgress,
    loadActiveJourney,
    processInteraction,
    executeGuidanceAction,
    setUserPlan,
    
    // Utilitários
    getCurrentPlanLimits,
    getUsagePercentage,
    isNearLimit,
    getChartData,
    
    // Dados calculados
    currentPlanLimits: getCurrentPlanLimits(),
    aiUsagePercentage: metrics ? getUsagePercentage(metrics.ai.requests.today, getCurrentPlanLimits().aiRequests) : 0,
    chatbotUsagePercentage: metrics ? getUsagePercentage(metrics.chatbot.sessions.active, getCurrentPlanLimits().chatbotSessions) : 0,
    guidanceUsagePercentage: metrics ? getUsagePercentage(metrics.guidance.activeJourneys, getCurrentPlanLimits().guidanceSessions) : 0,
    
    // Alertas
    alerts: {
      aiNearLimit: metrics ? isNearLimit(metrics.ai.requests.today, getCurrentPlanLimits().aiRequests) : false,
      chatbotNearLimit: metrics ? isNearLimit(metrics.chatbot.sessions.active, getCurrentPlanLimits().chatbotSessions) : false,
      guidanceNearLimit: metrics ? isNearLimit(metrics.guidance.activeJourneys, getCurrentPlanLimits().guidanceSessions) : false,
    }
  };
} 