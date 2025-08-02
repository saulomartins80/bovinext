/***************************************
 * 📊 RPA DASHBOARD - COMPONENTE FRONTEND
 * (Dashboard em tempo real para visualização do sistema)
 ***************************************/

import React, { useState, useCallback } from 'react';
import {
  Activity, AlertTriangle, Bot, CheckCircle, Clock, Cpu, DollarSign, MessageCircle, RefreshCw, Target, TrendingUp, Users, Wifi, XCircle, Zap, Play, Square
} from 'lucide-react';

// Função para retornar o ícone de status
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online':
    case 'healthy':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'offline':
    case 'critical':
    case 'error':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-gray-500" />;
  }
};

// Função simples para toast
const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${message}`);
  // Aqui você pode integrar com seu sistema de toast existente
};

interface DashboardMetrics {
  rpa: {
    status: 'online' | 'offline' | 'error';
    workers: {
      total: number;
      online: number;
      offline: number;
      busy: number;
      idle: number;
    };
    tasks: {
      total: number;
      pending: number;
      running: number;
      completed: number;
      failed: number;
      queue: number;
    };
    performance: {
      avgResponseTime: number;
      throughput: number;
      memoryUsage: number;
      cpuUsage: number;
      uptime: number;
    };
  };
  chatbot: {
    status: 'online' | 'offline' | 'error';
    sessions: {
      active: number;
      total: number;
      today: number;
    };
    performance: {
      avgResponseTime: number;
      requestsPerMinute: number;
      cacheHitRate: number;
      errorRate: number;
    };
    actions: {
      total: number;
      successful: number;
      failed: number;
      pending: number;
    };
  };
  system: {
    status: 'healthy' | 'warning' | 'critical';
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
      cores: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
    network: {
      requestsPerSecond: number;
      bandwidth: number;
    };
  };
  financial: {
    users: {
      total: number;
      active: number;
      premium: number;
    };
    transactions: {
      total: number;
      today: number;
      thisMonth: number;
    };
    goals: {
      total: number;
      active: number;
      completed: number;
    };
    investments: {
      total: number;
      active: number;
      value: number;
    };
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
    recent: Array<{
      id: string;
      type: 'critical' | 'warning' | 'info';
      message: string;
      timestamp: Date;
      resolved: boolean;
    }>;
  };
}

interface RPADashboardProps {
  className?: string;
}

export default function RPADashboard({ className = '' }: RPADashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🔄 CARREGAR MÉTRICAS INICIAIS
  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMetrics(data.data);
      setLastUpdate(new Date());
      setIsLoading(false);

    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      // Fixed constant condition lint error
      setIsLoading(false);
    }
  }, []);

  // 📡 INICIAR STREAMING
  const startStreaming = useCallback(async () => {
    try {
      setIsStreaming(true);
      setError(null);

      const response = await fetch('/api/dashboard/stream', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream não disponível');
      }

      const decoder = new TextDecoder();

      let streaming = true;
      while (streaming) {
        const { done, value } = await reader.read();
        
        if (done) {
          streaming = false;
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'update') {
                setMetrics(data.data);
                setLastUpdate(new Date());
              } else if (data.type === 'alert') {
                handleNewAlert(data.data);
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.error('Erro ao processar dados do stream:', error);
            }
          }
        }
      }

    } catch (error) {
      console.error('Erro no streaming:', error);
      setError(error instanceof Error ? error.message : 'Erro no streaming');
      // Fixed constant condition lint error
      setIsStreaming(false);
    }
  }, []);

  // 🚨 HANDLER PARA NOVOS ALERTAS
  const handleNewAlert = useCallback((alert: { type: 'critical' | 'warning' | 'info'; message: string }) => {
    const alertType = alert.type === 'critical' ? 'error' : alert.type === 'warning' ? 'warning' : 'info';
    // Removed unused variable icon
    
    showToast(alert.message, alertType as 'success' | 'error' | 'warning');
  }, []);

  // 🔄 RESOLVER ALERTA
  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/dashboard/alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Recarregar métricas para atualizar alertas
      await loadMetrics();
      showToast('Alerta resolvido com sucesso', 'success');

    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
      showToast('Erro ao resolver alerta', 'error');
      // Fixed constant condition lint error
    }
  }, [loadMetrics]);

  // 🚀 INICIAR DASHBOARD
  const startDashboard = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showToast('Dashboard iniciado com sucesso', 'success');
      await loadMetrics();

    } catch (error) {
      console.error('Erro ao iniciar dashboard:', error);
      showToast('Erro ao iniciar dashboard', 'error');
      // Fixed constant condition lint error
    }
  }, [loadMetrics]);

  // 🛑 PARAR DASHBOARD
  const stopDashboard = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stop', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      showToast('Dashboard parado com sucesso', 'success');

    } catch (error) {
      console.error('Erro ao parar dashboard:', error);
      showToast('Erro ao parar dashboard', 'error');
      // Fixed constant condition lint error
    }
  }, []);

  // 🎯 OBTER TOKEN DE AUTENTICAÇÃO
  const getAuthToken = async (): Promise<string> => {
    // Implementar lógica para obter token do Firebase
    return 'your-auth-token';
  };

  // 📊 FORMATAR BYTES
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ⏱️ FORMATAR TEMPO
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // O restante do componente segue normalmente aqui, começando pelos estados e hooks do componente.

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700">Erro ao carregar dashboard: {error}</span>
          </div>
        </div>
        <button 
          onClick={loadMetrics} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <RefreshCw className="w-4 h-4 mr-2 inline" />
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`p-8 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
            <span className="text-yellow-700">Nenhuma métrica disponível</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 🎛️ CONTROLES */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>RPA Dashboard</span>
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {isStreaming ? 'Streaming' : 'Polling'}
            </span>
            {lastUpdate && (
              <span className="text-sm text-gray-600">
                Última atualização: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-2">
          <button 
            onClick={loadMetrics} 
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            <RefreshCw className="w-4 h-4 mr-2 inline" />
            Atualizar
          </button>
          <button 
            onClick={isStreaming ? stopDashboard : startStreaming} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isStreaming ? (
              <>
                <Square className="w-4 h-4 mr-2 inline" />
                Parar Streaming
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2 inline" />
                Iniciar Streaming
              </>
            )}
          </button>
          <button 
            onClick={startDashboard} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Zap className="w-4 h-4 mr-2 inline" />
            Iniciar Dashboard
          </button>
          <button 
            onClick={stopDashboard} 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <Square className="w-4 h-4 mr-2 inline" />
            Parar Dashboard
          </button>
        </div>
      </div>

      {/* 📊 TABS PRINCIPAIS */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center space-x-2 mb-4">
          <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Visão Geral</button>
          <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Sistema RPA</button>
          <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Chatbot</button>
          <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Sistema</button>
          <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Financeiro</button>
          <button className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Alertas</button>
        </div>

        {/* 🎯 VISÃO GERAL */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Visão Geral</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status RPA */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium">RPA Status</h4>
                {getStatusIcon(metrics.rpa.status)}
              </div>
              <p className="text-2xl font-bold capitalize">{metrics.rpa.status}</p>
              <p className="text-xs text-gray-600">
                {metrics.rpa.workers.online} workers online
              </p>
            </div>

            {/* Status Chatbot */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium">Chatbot Status</h4>
                {getStatusIcon(metrics.chatbot.status)}
              </div>
              <p className="text-2xl font-bold capitalize">{metrics.chatbot.status}</p>
              <p className="text-xs text-gray-600">
                {metrics.chatbot.sessions.active} sessões ativas
              </p>
            </div>

            {/* Status Sistema */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium">Sistema</h4>
                {getStatusIcon(metrics.system.status)}
              </div>
              <p className="text-2xl font-bold capitalize">{metrics.system.status}</p>
              <p className="text-xs text-gray-600">
                CPU: {metrics.system.cpu.usage.toFixed(1)}%
              </p>
            </div>

            {/* Alertas */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium">Alertas</h4>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-500">
                {metrics.alerts.critical + metrics.alerts.warning}
              </p>
              <p className="text-xs text-gray-600">
                {metrics.alerts.critical} críticos, {metrics.alerts.warning} avisos
              </p>
            </div>
          </div>

          {/* 📈 GRÁFICOS DE PERFORMANCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold mb-3">Performance RPA</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Tempo de Resposta</span>
                    <span>{metrics.rpa.performance.avgResponseTime.toFixed(2)}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(metrics.rpa.performance.avgResponseTime / 1000 * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Throughput</span>
                    <span>{metrics.rpa.performance.throughput.toFixed(2)}/s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(metrics.rpa.performance.throughput / 10 * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold mb-3">Performance Chatbot</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Tempo de Resposta</span>
                    <span>{metrics.chatbot.performance.avgResponseTime.toFixed(2)}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(metrics.chatbot.performance.avgResponseTime / 1000 * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Cache Hit Rate</span>
                    <span>{metrics.chatbot.performance.cacheHitRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${metrics.chatbot.performance.cacheHitRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🤖 SISTEMA RPA */}
        <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
          <h3 className="text-lg font-semibold mb-4">Sistema RPA</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Workers */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <span>Workers</span>
              </h4>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-bold text-green-600">{metrics.rpa.workers.total}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Online:</span>
                  <span className="font-bold text-green-600">{metrics.rpa.workers.online}</span>
                </div>
                <div className="flex justify-between text-yellow-600">
                  <span>Ocupados:</span>
                  <span className="font-bold text-yellow-600">{metrics.rpa.workers.busy}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ociosos:</span>
                  <span className="font-bold text-gray-600">{metrics.rpa.workers.idle}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Offline:</span>
                  <span className="font-bold text-red-600">{metrics.rpa.workers.offline}</span>
                </div>
              </div>
            </div>

            {/* Tarefas */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Tarefas</span>
              </h4>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-bold text-blue-600">{metrics.rpa.tasks.total}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Pendentes:</span>
                  <span className="font-bold text-blue-600">{metrics.rpa.tasks.pending}</span>
                </div>
                <div className="flex justify-between text-yellow-600">
                  <span>Executando:</span>
                  <span className="font-bold text-yellow-600">{metrics.rpa.tasks.running}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Concluídas:</span>
                  <span className="font-bold text-green-600">{metrics.rpa.tasks.completed}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Falharam:</span>
                  <span className="font-bold text-red-600">{metrics.rpa.tasks.failed}</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Performance</span>
              </h4>
              <div className="space-y-3 mt-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span>{formatUptime(metrics.rpa.performance.uptime)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Memória</span>
                    <span>{formatBytes(metrics.rpa.performance.memoryUsage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${metrics.rpa.performance.memoryUsage / (1024 * 1024 * 1024) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>CPU</span>
                    <span>{metrics.rpa.performance.cpuUsage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${metrics.rpa.performance.cpuUsage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 💬 CHATBOT */}
        <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
          <h3 className="text-lg font-semibold mb-4">Chatbot</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sessões */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Sessões</span>
              </h4>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Ativas:</span>
                  <span className="font-bold text-green-600">{metrics.chatbot.sessions.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-bold text-blue-600">{metrics.chatbot.sessions.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hoje:</span>
                  <span className="font-bold text-blue-600">{metrics.chatbot.sessions.today}</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Performance</span>
              </h4>
              <div className="space-y-3 mt-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>RPS</span>
                    <span>{metrics.chatbot.performance.requestsPerMinute.toFixed(1)}/min</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min(metrics.chatbot.performance.requestsPerMinute / 60 * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Cache Hit</span>
                    <span>{metrics.chatbot.performance.cacheHitRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${metrics.chatbot.performance.cacheHitRate}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Error Rate</span>
                    <span>{metrics.chatbot.performance.errorRate.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${metrics.chatbot.performance.errorRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Ações</span>
              </h4>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-bold text-green-600">{metrics.chatbot.actions.total}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Sucesso:</span>
                  <span className="font-bold text-green-600">{metrics.chatbot.actions.successful}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Falharam:</span>
                  <span className="font-bold text-red-600">{metrics.chatbot.actions.failed}</span>
                </div>
                <div className="flex justify-between text-yellow-600">
                  <span>Pendentes:</span>
                  <span className="font-bold text-yellow-600">{metrics.chatbot.actions.pending}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 💻 SISTEMA */}
        <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
          <h3 className="text-lg font-semibold mb-4">Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recursos */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <Cpu className="w-4 h-4" />
                <span>Recursos do Sistema</span>
              </h4>
              <div className="space-y-3 mt-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>CPU ({metrics.system.cpu.cores} cores)</span>
                    <span>{metrics.system.cpu.usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: `${metrics.system.cpu.usage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Memória</span>
                    <span>{formatBytes(metrics.system.memory.used)} / {formatBytes(metrics.system.memory.total)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${metrics.system.memory.percentage}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Disco</span>
                    <span>{formatBytes(metrics.system.disk.used)} / {formatBytes(metrics.system.disk.total)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${metrics.system.disk.percentage}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rede */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <Wifi className="w-4 h-4" />
                <span>Rede</span>
              </h4>
              <div className="space-y-3 mt-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Requisições/s</span>
                    <span>{metrics.system.network.requestsPerSecond.toFixed(1)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${Math.min(metrics.system.network.requestsPerSecond / 10 * 100, 100)}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Banda</span>
                    <span>{formatBytes(metrics.system.network.bandwidth)}/s</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(metrics.system.network.bandwidth / (1024 * 1024) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 💰 FINANCEIRO */}
        <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
          <h3 className="text-lg font-semibold mb-4">Financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Usuários */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Usuários</span>
              </h4>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-bold text-green-600">{metrics.financial.users.total}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Ativos:</span>
                  <span className="font-bold text-green-600">{metrics.financial.users.active}</span>
                </div>
                <div className="flex justify-between text-purple-600">
                  <span>Premium:</span>
                  <span className="font-bold text-purple-600">{metrics.financial.users.premium}</span>
                </div>
              </div>
            </div>

            {/* Transações */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Transações</span>
              </h4>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-bold text-green-600">{metrics.financial.transactions.total}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Hoje:</span>
                  <span className="font-bold text-green-600">{metrics.financial.transactions.today}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Este mês:</span>
                  <span className="font-bold text-blue-600">{metrics.financial.transactions.thisMonth}</span>
                </div>
              </div>
            </div>

            {/* Metas */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Metas</span>
              </h4>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-bold text-blue-600">{metrics.financial.goals.total}</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Ativas:</span>
                  <span className="font-bold text-blue-600">{metrics.financial.goals.active}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Concluídas:</span>
                  <span className="font-bold text-green-600">{metrics.financial.goals.completed}</span>
                </div>
              </div>
            </div>

            {/* Investimentos */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-md font-medium flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Investimentos</span>
              </h4>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-bold text-green-600">{metrics.financial.investments.total}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Ativos:</span>
                  <span className="font-bold text-green-600">{metrics.financial.investments.active}</span>
                </div>
                <div className="flex justify-between text-purple-600">
                  <span>Valor Total:</span>
                  <span className="font-bold text-purple-600">R$ {metrics.financial.investments.value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🚨 ALERTAS */}
        <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
          <h3 className="text-lg font-semibold mb-4">Alertas</h3>
          {/* Resumo de Alertas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-red-700">Críticos</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{metrics.alerts.critical}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-yellow-700">Avisos</span>
              </div>
              <p className="text-2xl font-bold text-yellow-500">{metrics.alerts.warning}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-blue-700">Informações</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">{metrics.alerts.info}</p>
            </div>
          </div>

          {/* Lista de Alertas Recentes */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="text-lg font-semibold mb-3">Alertas Recentes</h4>
            <div className="space-y-2">
              {metrics.alerts.recent.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum alerta recente
                </div>
              ) : (
                <div className="space-y-2">
                  {metrics.alerts.recent.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        alert.resolved ? 'bg-gray-50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {alert.type === 'critical' ? (
                          <XCircle className="w-4 h-4 text-red-500" />
                        ) : alert.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        <div>
                          <p className={`text-sm ${alert.resolved ? 'line-through text-muted-foreground' : ''}`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!alert.resolved && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          Resolver
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 