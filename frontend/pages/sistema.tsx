/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
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
  MessageCircle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Interfaces
interface AIUsageData {
  summary: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    successRate: number;
    activeModels: number;
    peakHour: string;
    topModel: string;
  };
  breakdown: {
    byPeriod: {
      today: { requests: number; tokens: number; cost: number };
      week: { requests: number; tokens: number; cost: number };
      month: { requests: number; tokens: number; cost: number };
    };
    byModel: Record<string, {
      requests: number;
      tokens: number;
      cost: number;
      latency: number;
    }>;
    byFeature: Record<string, {
      requests: number;
      tokens: number;
      cost: number;
    }>;
  };
  timeSeries: Array<{
    timestamp: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  realtimeStats: {
    requests: number;
    tokens: number;
    cost: number;
    latency: number[];
    lastUpdate: Date;
  };
}

interface PlanLimits {
  essencial: {
    requests: number;
    tokens: number;
    cost: number;
  };
  profissional: {
    requests: number;
    tokens: number;
    cost: number;
  };
  empresarial: {
    requests: number;
    tokens: number;
    cost: number;
  };
}

// Hook personalizado para dados de IA
function useAIUsageData() {
  const [data, setData] = useState<AIUsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtime, setIsRealtime] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchData = async (timeframe: string = '7d') => {
    console.log('Fetching data for timeframe:', timeframe);
    try {
      setIsLoading(true);
      
      // Mock data para desenvolvimento
      const mockData: AIUsageData = {
        summary: {
          totalRequests: 2847,
          totalTokens: 1250000,
          totalCost: 47.83,
          averageLatency: 1.2,
          successRate: 98.5,
          activeModels: 3,
          peakHour: '14:00',
          topModel: 'deepseek-chat'
        },
        breakdown: {
          byPeriod: {
            today: { requests: 342, tokens: 150000, cost: 5.75 },
            week: { requests: 2100, tokens: 950000, cost: 32.15 },
            month: { requests: 8500, tokens: 3800000, cost: 142.30 }
          },
          byModel: {
            'deepseek-chat': { requests: 2100, tokens: 950000, cost: 32.15, latency: 1.1 },
            'gpt-4-turbo': { requests: 500, tokens: 200000, cost: 12.50, latency: 1.8 },
            'claude-3': { requests: 247, tokens: 100000, cost: 3.18, latency: 0.9 }
          },
          byFeature: {
            'chatbot': { requests: 1800, tokens: 800000, cost: 28.50 },
            'analysis': { requests: 650, tokens: 300000, cost: 12.75 },
            'automation': { requests: 397, tokens: 150000, cost: 6.58 }
          }
        },
        timeSeries: generateMockTimeSeries(),
        realtimeStats: {
          requests: 15,
          tokens: 8500,
          cost: 2.35,
          latency: [1.1, 1.3, 0.9, 1.5, 1.2],
          lastUpdate: new Date()
        }
      };
      
      setData(mockData);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setError('Falha ao carregar dados de uso da IA');
    } finally {
      setIsLoading(false);
    }
  };

  const startRealtime = () => {
    if (eventSourceRef.current) return;
    
    const eventSource = new EventSource('/api/ai-usage/stats/realtime');
    eventSourceRef.current = eventSource;
    
    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData((prevData: AIUsageData | null) => ({ ...prevData!, realtimeStats: newData }));
    };
    
    eventSource.addEventListener('alert', (event) => {
      const alert = JSON.parse(event.data);
      console.log('Alerta de IA:', alert);
    });
    
    setIsRealtime(true);
  };

  const stopRealtime = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsRealtime(false);
    }
  };

  useEffect(() => {
    fetchData();
    return () => stopRealtime();
  }, []);

  return { data, isLoading, error, fetchData, startRealtime, stopRealtime, isRealtime };
}

function generateMockTimeSeries() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      timestamp: date.toISOString().split('T')[0],
      requests: Math.floor(Math.random() * 200) + 50,
      tokens: Math.floor(Math.random() * 50000) + 10000,
      cost: Math.random() * 5 + 1
    });
  }
  return data;
}

// Função para obter limites do plano
function getPlanLimits(): PlanLimits {
  return {
    essencial: {
      requests: 1000,
      tokens: 100000,
      cost: 50
    },
    profissional: {
      requests: 5000,
      tokens: 500000,
      cost: 200
    },
    empresarial: {
      requests: 20000,
      tokens: 2000000,
      cost: 1000
    }
  };
}

// Função para calcular porcentagem de uso
function getUsagePercentage(current: number, limit: number): number {
  return Math.min((current / limit) * 100, 100);
}

// Função para verificar se está próximo do limite
function isNearLimit(current: number, limit: number): boolean {
  return (current / limit) >= 0.8;
}

export default function AISystemDashboard() {
  const { resolvedTheme } = useTheme();
  const { data, isLoading, error, fetchData, startRealtime, stopRealtime, isRealtime } = useAIUsageData();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Planos e limites
  const planLimits = getPlanLimits();
  const userPlan = 'essencial'; // Pode vir do contexto do usuário
  const currentPlan = planLimits[userPlan as keyof typeof planLimits];
  const lastUpdated = data?.realtimeStats?.lastUpdate || new Date();

  // Classes condicionais para tema
  const isDark = resolvedTheme === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimaryClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondaryClass = isDark ? 'text-gray-300' : 'text-gray-600';

  // Função para atualizar dados
  const refreshMetrics = async () => {
    setIsRefreshing(true);
    await fetchData(selectedTimeframe);
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className={`${cardBgClass} p-8 rounded-lg border`}>
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className={`text-xl font-bold ${textPrimaryClass} text-center mb-2`}>
              Erro ao Carregar Dados
            </h2>
            <p className={`${textSecondaryClass} text-center mb-4`}>{error}</p>
            <button
              onClick={refreshMetrics}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                IA & Analytics
              </h1>
              <p className={`text-sm ${textSecondaryClass} transition-colors duration-300`}>
                Métricas e uso da Inteligência Artificial Finnextho
                {lastUpdated && (
                  <span className="ml-2">
                    • Atualizado {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Controles de tempo real */}
            <button
              onClick={isRealtime ? stopRealtime : startRealtime}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                isRealtime 
                  ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300'
                  : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
              }`}
            >
              {isRealtime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="text-sm">{isRealtime ? 'Pausar' : 'Tempo Real'}</span>
            </button>

            {/* Botão de refresh */}
            <button
              onClick={refreshMetrics}
              disabled={isRefreshing}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                isRefreshing 
                  ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-300'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">Atualizar</span>
            </button>

            {/* Seletor de período */}
            <select
              value={selectedTimeframe}
              onChange={(e) => {
                setSelectedTimeframe(e.target.value);
                fetchData(e.target.value);
              }}
              className={`px-3 py-2 rounded-lg border ${cardBgClass} ${textPrimaryClass} text-sm`}
            >
              <option value="1d">Último dia</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
          </div>
        </div>

        {/* Métricas principais */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total de Requisições */}
            <div className={`${cardBgClass} p-6 rounded-lg border`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className={`text-xs ${textSecondaryClass} uppercase tracking-wide`}>
                  Requisições
                </span>
              </div>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${textPrimaryClass}`}>
                  {data.summary.totalRequests.toLocaleString()}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isNearLimit(data.summary.totalRequests, currentPlan.requests) 
                        ? 'bg-red-500' 
                        : 'bg-blue-500'
                    }`}
                    style={{ 
                      width: `${getUsagePercentage(data.summary.totalRequests, currentPlan.requests)}%` 
                    }}
                  />
                </div>
                <div className={`text-xs ${textSecondaryClass}`}>
                  {getUsagePercentage(data.summary.totalRequests, currentPlan.requests).toFixed(1)}% do limite ({currentPlan.requests.toLocaleString()})
                </div>
              </div>
            </div>

            {/* Total de Tokens */}
            <div className={`${cardBgClass} p-6 rounded-lg border`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Cpu className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className={`text-xs ${textSecondaryClass} uppercase tracking-wide`}>
                  Tokens
                </span>
              </div>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${textPrimaryClass}`}>
                  {(data.summary.totalTokens / 1000).toFixed(0)}K
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isNearLimit(data.summary.totalTokens, currentPlan.tokens) 
                        ? 'bg-red-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${getUsagePercentage(data.summary.totalTokens, currentPlan.tokens)}%` 
                    }}
                  />
                </div>
                <div className={`text-xs ${textSecondaryClass}`}>
                  {getUsagePercentage(data.summary.totalTokens, currentPlan.tokens).toFixed(1)}% do limite ({(currentPlan.tokens / 1000).toFixed(0)}K)
                </div>
              </div>
            </div>

            {/* Custo Total */}
            <div className={`${cardBgClass} p-6 rounded-lg border`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className={`text-xs ${textSecondaryClass} uppercase tracking-wide`}>
                  Custo
                </span>
              </div>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${textPrimaryClass}`}>
                  R$ {data.summary.totalCost.toFixed(2)}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isNearLimit(data.summary.totalCost, currentPlan.cost) 
                        ? 'bg-red-500' 
                        : 'bg-yellow-500'
                    }`}
                    style={{ 
                      width: `${getUsagePercentage(data.summary.totalCost, currentPlan.cost)}%` 
                    }}
                  />
                </div>
                <div className={`text-xs ${textSecondaryClass}`}>
                  {getUsagePercentage(data.summary.totalCost, currentPlan.cost).toFixed(1)}% do limite (R$ {currentPlan.cost})
                </div>
              </div>
            </div>

            {/* Taxa de Sucesso */}
            <div className={`${cardBgClass} p-6 rounded-lg border`}>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className={`text-xs ${textSecondaryClass} uppercase tracking-wide`}>
                  Sucesso
                </span>
              </div>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${textPrimaryClass}`}>
                  {data.summary.successRate.toFixed(1)}%
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${data.summary.successRate}%` }}
                  />
                </div>
                <div className={`text-xs ${textSecondaryClass}`}>
                  Latência média: {data.summary.averageLatency.toFixed(2)}s
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Uso por funcionalidade */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico de uso por funcionalidade */}
            <div className={`${cardBgClass} p-6 rounded-lg border`}>
              <h3 className={`text-lg font-semibold ${textPrimaryClass} mb-4`}>
                Uso por Funcionalidade
              </h3>
              <div className="space-y-4">
                {Object.entries(data.breakdown.byFeature).map(([feature, stats]: [string, any], index) => (
                  <div key={feature} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${textPrimaryClass} capitalize`}>
                        {feature}
                      </span>
                      <span className={`text-sm ${textSecondaryClass}`}>
                        {stats.requests} req • R$ {stats.cost.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 'bg-purple-500'
                        }`}
                        style={{ 
                          width: `${(stats.requests / data.summary.totalRequests) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Uso por modelo */}
            <div className={`${cardBgClass} p-6 rounded-lg border`}>
              <h3 className={`text-lg font-semibold ${textPrimaryClass} mb-4`}>
                Uso por Modelo de IA
              </h3>
              <div className="space-y-4">
                {Object.entries(data.breakdown.byModel).map(([model, stats]: [string, any], index) => (
                  <div key={model} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${textPrimaryClass}`}>
                        {model}
                      </span>
                      <span className={`text-sm ${textSecondaryClass}`}>
                        {stats.latency.toFixed(2)}s • R$ {stats.cost.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-indigo-500' : 
                          index === 1 ? 'bg-pink-500' : 'bg-orange-500'
                        }`}
                        style={{ 
                          width: `${(stats.requests / data.summary.totalRequests) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alertas e Status */}
        {data && (
          <div className={`${cardBgClass} p-6 rounded-lg border mb-8`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${textPrimaryClass}`}>
                Status do Sistema
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className={`text-sm ${textSecondaryClass}`}>Sistema Operacional</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Alerta de custo */}
              {isNearLimit(data.summary.totalCost, currentPlan.cost) && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                      Limite de Custo
                    </span>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Você está próximo do limite de custo do seu plano ({getUsagePercentage(data.summary.totalCost, currentPlan.cost).toFixed(1)}%)
                  </p>
                </div>
              )}

              {/* Status de performance */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Performance
                  </span>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Latência média: {data.summary.averageLatency.toFixed(2)}s
                </p>
              </div>

              {/* Próxima atualização */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Atualização
                  </span>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Última: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
