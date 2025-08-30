/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Cpu,
  Brain,
  Pause,
  Play,
  MessageCircle,
  BarChart,
  PieChart,
  Loader2,
  // Server,
  // Zap,
  TrendingUp,
  Database,
  Shield,
  Globe,
  // Eye,
  // Settings,
  Users,
  FileText,
  Image,
  Mic
  // Video
} from 'lucide-react';

// Simulando hooks externos
const useTheme = () => ({ resolvedTheme: 'light' });
const LoadingSpinner = () => <Loader2 className="animate-spin" size={24} />;

// Tipos e interfaces
interface AIUsageData {
  summary: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    successRate: number;
    averageLatency: number;
  };
  breakdown: {
    byFeature: Array<{
      name: string;
      requests: number;
      cost: number;
      percentage: number;
    }>;
    byModel: Array<{
      name: string;
      requests: number;
      tokens: number;
      cost: number;
    }>;
    byPeriod: Array<{
      date: string;
      requests: number;
      cost: number;
      tokens: number;
    }>;
  };
  timeSeries: Array<{
    timestamp: string;
    requests: number;
    cost: number;
    latency: number;
    successRate: number;
  }>;
  realtimeStats: {
    activeConnections: number;
    requestsPerMinute: number;
    currentLatency: number;
    errorRate: number;
  };
}

interface PlanLimits {
  requests: number;
  tokens: number;
  cost: number;
  features: string[];
}

// Hook principal para dados de uso de IA
const useAIUsageData = () => {
  const [data, setData] = useState<AIUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtime, setIsRealtime] = useState(false);
  const eventSourceRef = useRef<any>(null);

  // Função para gerar dados mock de série temporal
  const generateMockTimeSeries = useCallback((timeframe: string) => {
    const now = new Date();
    const data = [];
    let intervals: number;
    let stepMs: number;

    switch (timeframe) {
      case '1d':
        intervals = 24;
        stepMs = 60 * 60 * 1000; // 1 hora
        break;
      case '7d':
        intervals = 7 * 24;
        stepMs = 60 * 60 * 1000; // 1 hora
        break;
      case '30d':
        intervals = 30;
        stepMs = 24 * 60 * 60 * 1000; // 1 dia
        break;
      case '90d':
        intervals = 90;
        stepMs = 24 * 60 * 60 * 1000; // 1 dia
        break;
      default:
        intervals = 24;
        stepMs = 60 * 60 * 1000;
    }

    for (let i = intervals - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * stepMs);
      data.push({
        timestamp: timestamp.toISOString(),
        requests: Math.floor(Math.random() * 1000) + 100,
        cost: Math.random() * 50 + 10,
        latency: Math.random() * 200 + 50,
        successRate: 95 + Math.random() * 5
      });
    }

    return data;
  }, []);

  // Buscar dados (mock)
  const fetchData = useCallback(async (timeframe: string = '7d') => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: AIUsageData = {
        summary: {
          totalRequests: Math.floor(Math.random() * 100000) + 50000,
          totalTokens: Math.floor(Math.random() * 10000000) + 5000000,
          totalCost: Math.random() * 2000 + 500,
          successRate: 95 + Math.random() * 5,
          averageLatency: Math.random() * 100 + 50
        },
        breakdown: {
          byFeature: [
            { name: 'Processamento de Texto', requests: 25000, cost: 450, percentage: 35 },
            { name: 'Geração de Imagens', requests: 18000, cost: 380, percentage: 28 },
            { name: 'Análise de Sentimentos', requests: 15000, cost: 220, percentage: 22 },
            { name: 'Tradução Automática', requests: 8000, cost: 150, percentage: 12 },
            { name: 'Reconhecimento de Voz', requests: 2000, cost: 80, percentage: 3 }
          ],
          byModel: [
            { name: 'GPT-4', requests: 35000, tokens: 8500000, cost: 850 },
            { name: 'Claude Sonnet', requests: 20000, tokens: 4200000, cost: 420 },
            { name: 'DALL-E 3', requests: 8000, tokens: 0, cost: 320 },
            { name: 'Whisper', requests: 5000, tokens: 850000, cost: 85 }
          ],
          byPeriod: Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
              date: date.toISOString().split('T')[0],
              requests: Math.floor(Math.random() * 10000) + 5000,
              cost: Math.random() * 200 + 100,
              tokens: Math.floor(Math.random() * 1000000) + 500000
            };
          })
        },
        timeSeries: generateMockTimeSeries(timeframe),
        realtimeStats: {
          activeConnections: Math.floor(Math.random() * 50) + 10,
          requestsPerMinute: Math.floor(Math.random() * 100) + 20,
          currentLatency: Math.random() * 150 + 50,
          errorRate: Math.random() * 5
        }
      };

      setData(mockData);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados de uso de IA');
    } finally {
      setIsLoading(false);
    }
  }, [generateMockTimeSeries]);

  // Iniciar conexão em tempo real (SSE)
  const startRealtime = useCallback(() => {
    if (eventSourceRef.current) return;

    try {
      setIsRealtime(true);
      
      const interval = setInterval(() => {
        setData(prevData => {
          if (!prevData) return prevData;
          
          return {
            ...prevData,
            realtimeStats: {
              activeConnections: Math.floor(Math.random() * 50) + 10,
              requestsPerMinute: Math.floor(Math.random() * 100) + 20,
              currentLatency: Math.random() * 150 + 50,
              errorRate: Math.random() * 5
            }
          };
        });
      }, 2000);

      // Simular EventSource
      eventSourceRef.current = { close: () => clearInterval(interval) } as any;
      
    } catch (err) {
      console.error('Erro ao iniciar conexão em tempo real:', err);
      setIsRealtime(false);
    }
  }, []);

  // Parar conexão em tempo real
  const stopRealtime = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsRealtime(false);
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopRealtime();
    };
  }, [stopRealtime]);

  return {
    data,
    isLoading,
    error,
    isRealtime,
    fetchData,
    startRealtime,
    stopRealtime,
    refreshMetrics: () => fetchData()
  };
};

// Função para obter limites do plano
const getPlanLimits = (plan: 'essencial' | 'profissional' | 'empresarial'): PlanLimits => {
  const limits = {
    essencial: {
      requests: 100000,
      tokens: 10000000,
      cost: 1000,
      features: ['Processamento de Texto', 'Análise de Sentimentos']
    },
    profissional: {
      requests: 500000,
      tokens: 50000000,
      cost: 5000,
      features: ['Processamento de Texto', 'Análise de Sentimentos', 'Geração de Imagens', 'Tradução']
    },
    empresarial: {
      requests: 2000000,
      tokens: 200000000,
      cost: 20000,
      features: ['Todos os recursos']
    }
  };
  return limits[plan];
};

// Funções utilitárias
const getUsagePercentage = (current: number, limit: number): number => {
  return Math.min((current / limit) * 100, 100);
};

const isNearLimit = (current: number, limit: number): boolean => {
  return getUsagePercentage(current, limit) >= 80;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

// Componente principal
const AISystemDashboard = () => {
  const { resolvedTheme } = useTheme();
  const [timeframe, setTimeframe] = useState('7d');
  const [currentPlan] = useState<'essencial' | 'profissional' | 'empresarial'>('profissional');
  
  const {
    data,
    isLoading,
    error,
    isRealtime,
    fetchData,
    startRealtime,
    stopRealtime,
    refreshMetrics
  } = useAIUsageData();

  const planLimits = getPlanLimits(currentPlan);

  // Buscar dados iniciais
  useEffect(() => {
    fetchData(timeframe);
  }, [fetchData, timeframe]);

  const getFeatureIcon = (featureName: string) => {
    switch (featureName) {
      case 'Processamento de Texto':
        return <FileText size={16} />;
      case 'Geração de Imagens':
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image size={16} />;
      case 'Análise de Sentimentos':
        return <Brain size={16} />;
      case 'Tradução Automática':
        return <Globe size={16} />;
      case 'Reconhecimento de Voz':
        return <Mic size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  const getModelIcon = (modelName: string) => {
    switch (modelName) {
      case 'GPT-4':
        return <Brain size={16} className="text-green-500" />;
      case 'Claude Sonnet':
        return <MessageCircle size={16} className="text-blue-500" />;
      case 'DALL-E 3':
        // eslint-disable-next-line jsx-a11y/alt-text
        return <Image size={16} className="text-purple-500" />;
      case 'Whisper':
        return <Mic size={16} className="text-orange-500" />;
      default:
        return <Cpu size={16} />;
    }
  };

  if (isLoading && !data) {
    return (
      <div className={`flex items-center justify-center h-screen ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner />
          <p className="text-gray-600 dark:text-gray-400">Carregando métricas de IA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-screen ${resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`p-6 rounded-lg max-w-md text-center ${resolvedTheme === 'dark' ? 'bg-red-900/20 text-red-300 border border-red-700' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <AlertTriangle className="mx-auto mb-3" size={48} />
          <h3 className="font-bold mb-2">Erro ao carregar dados</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={refreshMetrics}
            className={`px-4 py-2 rounded ${resolvedTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      resolvedTheme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
    } p-4 md:p-6`}>
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className={`p-3 rounded-xl ${resolvedTheme === 'dark' ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' : 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'} shadow-lg`}>
              <Brain size={28} />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Monitoramento de IA
              </h1>
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                Acompanhe seus gastos e uso de inteligência artificial em tempo real.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Seletor de período */}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className={`px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${resolvedTheme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-800'}`}
            >
              <option value="1d">Últimas 24h</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>

            {/* Controles */}
            <div className="flex gap-2">
              <button
                onClick={isRealtime ? stopRealtime : startRealtime}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  isRealtime 
                    ? (resolvedTheme === 'dark' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white')
                    : (resolvedTheme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white')
                }`}
              >
                {isRealtime ? <Pause size={18} /> : <Play size={18} />}
                {isRealtime ? 'Pausar' : 'Tempo Real'}
              </button>
              <button
                onClick={refreshMetrics}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${resolvedTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              >
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Cards de métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Requisições */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Activity className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Requisições</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(data?.summary.totalRequests || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Limite do plano</span>
                <span>{getUsagePercentage(data?.summary.totalRequests || 0, planLimits.requests).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isNearLimit(data?.summary.totalRequests || 0, planLimits.requests) ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${getUsagePercentage(data?.summary.totalRequests || 0, planLimits.requests)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tokens */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Database className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tokens</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(data?.summary.totalTokens || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Limite do plano</span>
                <span>{getUsagePercentage(data?.summary.totalTokens || 0, planLimits.tokens).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isNearLimit(data?.summary.totalTokens || 0, planLimits.tokens) ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${getUsagePercentage(data?.summary.totalTokens || 0, planLimits.tokens)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Custo */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                  <DollarSign className="text-orange-600 dark:text-orange-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Custo Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(data?.summary.totalCost || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Limite do plano</span>
                <span>{getUsagePercentage(data?.summary.totalCost || 0, planLimits.cost).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isNearLimit(data?.summary.totalCost || 0, planLimits.cost) ? 'bg-red-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${getUsagePercentage(data?.summary.totalCost || 0, planLimits.cost)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Taxa de Sucesso */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <CheckCircle className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(data?.summary.successRate || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Latência média</span>
                <span>{(data?.summary.averageLatency || 0).toFixed(0)}ms</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data?.summary.successRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status do Sistema em Tempo Real */}
        {isRealtime && data?.realtimeStats && (
          <div className={`rounded-xl shadow-sm p-6 mb-8 ${resolvedTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Status em Tempo Real</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users size={16} className="text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Conexões Ativas</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.realtimeStats.activeConnections}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Activity size={16} className="text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Req/min</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.realtimeStats.requestsPerMinute}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock size={16} className="text-orange-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Latência</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.realtimeStats.currentLatency.toFixed(0)}ms
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <AlertTriangle size={16} className="text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de Erro</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {data.realtimeStats.errorRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {isNearLimit(data.summary.totalCost, planLimits.cost) && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-red-600 dark:text-red-400" size={20} />
                  <h3 className="font-semibold text-red-800 dark:text-red-300">Limite de Custo</h3>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Você está próximo do limite de custo do seu plano.
                </p>
              </div>
            )}

            {data.summary.averageLatency > 150 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Alta Latência</h3>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  A latência média está acima do recomendado ({data.summary.averageLatency.toFixed(0)}ms).
                </p>
              </div>
            )}

            {data.summary.successRate < 95 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="text-orange-600 dark:text-orange-400" size={20} />
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300">Taxa de Sucesso Baixa</h3>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  A taxa de sucesso está abaixo do ideal ({data.summary.successRate.toFixed(1)}%).
                </p>
              </div>
            )}

            {!isNearLimit(data.summary.totalCost, planLimits.cost) && data.summary.averageLatency <= 150 && data.summary.successRate >= 95 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                  <h3 className="font-semibold text-green-800 dark:text-green-300">Sistema Saudável</h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Todos os sistemas estão operando normalmente.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Gráficos - Uso por Funcionalidade e Modelo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Uso por Funcionalidade */}
          <div className={`rounded-xl shadow-sm p-6 ${resolvedTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <PieChart className={`${resolvedTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Uso por Funcionalidade</h2>
            </div>
            <div className="space-y-4">
              {data?.breakdown.byFeature.map((feature, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getFeatureIcon(feature.name)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {feature.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(feature.cost)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatNumber(feature.requests)} req
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-orange-500' : 'bg-pink-500'
                      }`}
                      style={{ width: `${feature.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{feature.percentage}% do total</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uso por Modelo */}
          <div className={`rounded-xl shadow-sm p-6 ${resolvedTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <BarChart className={`${resolvedTheme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Uso por Modelo</h2>
            </div>
            <div className="space-y-4">
              {data?.breakdown.byModel.map((model, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      {getModelIcon(model.name)}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {model.name}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(model.cost)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Requisições:</span>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatNumber(model.requests)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Tokens:</span>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatNumber(model.tokens)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gráfico de Série Temporal */}
        <div className={`rounded-xl shadow-sm p-6 mb-8 ${resolvedTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className={`${resolvedTheme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tendência de Uso</h2>
          </div>
          
          {data?.timeSeries && data.timeSeries.length > 0 ? (
            <div className="space-y-6">
              {/* Gráfico de Custos */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Custos ao Longo do Tempo</h3>
                <div className="relative h-32">
                  <svg className="w-full h-full" viewBox="0 0 800 120">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 25 + 10}
                        x2="800"
                        y2={i * 25 + 10}
                        stroke={resolvedTheme === 'dark' ? '#374151' : '#E5E7EB'}
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Cost line */}
                    <polyline
                      points={data.timeSeries.map((point, index) => {
                        const x = (index / (data.timeSeries.length - 1)) * 780 + 10;
                        const maxCost = Math.max(...data.timeSeries.map(p => p.cost));
                        const y = 110 - (point.cost / maxCost) * 90;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    
                    {/* Data points */}
                    {data.timeSeries.map((point, index) => {
                      const x = (index / (data.timeSeries.length - 1)) * 780 + 10;
                      const maxCost = Math.max(...data.timeSeries.map(p => p.cost));
                      const y = 110 - (point.cost / maxCost) * 90;
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#3B82F6"
                          className="cursor-pointer"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Gráfico de Requisições */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Requisições ao Longo do Tempo</h3>
                <div className="relative h-32">
                  <svg className="w-full h-full" viewBox="0 0 800 120">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 25 + 10}
                        x2="800"
                        y2={i * 25 + 10}
                        stroke={resolvedTheme === 'dark' ? '#374151' : '#E5E7EB'}
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Requests bars */}
                    {data.timeSeries.map((point, index) => {
                      const x = (index / (data.timeSeries.length - 1)) * 780 + 10;
                      const maxRequests = Math.max(...data.timeSeries.map(p => p.requests));
                      const height = (point.requests / maxRequests) * 90;
                      const y = 110 - height;
                      return (
                        <rect
                          key={index}
                          x={x - 8}
                          y={y}
                          width="16"
                          height={height}
                          fill="#10B981"
                          rx="2"
                          className="cursor-pointer"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Taxa de Sucesso */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Taxa de Sucesso (%)</h3>
                <div className="relative h-32">
                  <svg className="w-full h-full" viewBox="0 0 800 120">
                    <defs>
                      <linearGradient id="successGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map(i => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 25 + 10}
                        x2="800"
                        y2={i * 25 + 10}
                        stroke={resolvedTheme === 'dark' ? '#374151' : '#E5E7EB'}
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Success rate area */}
                    <path
                      d={`M 10 110 ${data.timeSeries.map((point, index) => {
                        const x = (index / (data.timeSeries.length - 1)) * 780 + 10;
                        const y = 110 - ((point.successRate - 90) / 10) * 90; // Scale from 90-100%
                        return `L ${x} ${y}`;
                      }).join(' ')} L 790 110 Z`}
                      fill="url(#successGradient)"
                      opacity="0.7"
                    />
                    
                    {/* Success rate line */}
                    <polyline
                      points={data.timeSeries.map((point, index) => {
                        const x = (index / (data.timeSeries.length - 1)) * 780 + 10;
                        const y = 110 - ((point.successRate - 90) / 10) * 90; // Scale from 90-100%
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Sem dados de série temporal disponíveis.
            </div>
          )}
        </div>

        {/* Uso por Período */}
        <div className={`rounded-xl shadow-sm p-6 ${resolvedTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Clock className={`${resolvedTheme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico Diário</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Data</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Requisições</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Tokens</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Custo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data?.breakdown.byPeriod.map((period, index) => {
                  const [, month, day] = period.date.split('-');
                  const formattedDate = `${day}/${month}`;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {formattedDate}
                      </td>
                      <td className="py-4 text-sm text-right text-gray-900 dark:text-white">
                        {formatNumber(period.requests)}
                      </td>
                      <td className="py-4 text-sm text-right text-gray-900 dark:text-white">
                        {formatNumber(period.tokens)}
                      </td>
                      <td className="py-4 text-sm text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(period.cost)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer com informações do plano */}
        <div className={`rounded-xl shadow-sm p-6 mt-8 ${resolvedTheme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Plano Atual: <span className="capitalize text-blue-600 dark:text-blue-400">{currentPlan}</span>
              </h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Limite de requisições: {formatNumber(planLimits.requests)}</span>
                <span>Limite de tokens: {formatNumber(planLimits.tokens)}</span>
                <span>Limite de custo: {formatCurrency(planLimits.cost)}</span>
              </div>
              <div className="mt-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Recursos disponíveis: </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {planLimits.features.join(', ')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Última atualização
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date().toLocaleString('pt-BR')}
              </p>
              {isRealtime && (
                <div className="flex items-center justify-end gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">Atualizando em tempo real</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISystemDashboard;