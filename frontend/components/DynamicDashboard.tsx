/* eslint-disable no-unused-vars */
/***************************************
 * 🎛️ DYNAMIC DASHBOARD - CONTROLADO PELO CHATBOT
 * (Dashboard que responde aos comandos do chatbot)
 ***************************************/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, DollarSign, AlertTriangle,
  Zap, RefreshCw, X, List
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { StockData, MarketData } from '../context/DashboardContext';
import { StockItem, CryptoItem, MarketIndices } from '../types/market';

// Tipo union consolidado para todos os tipos de dados suportados pelo widget
export type WidgetData = 
  | MetricData 
  | ListData 
  | ChartData 
  | AlertData 
  | ActionData 
  | StockData 
  | MarketData 
  | StockItem 
  | CryptoItem 
  | MarketIndices;

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'list' | 'alert' | 'action';
  title: string;
  data: WidgetData;
  position: { x: number; y: number; w: number; h: number };
  isVisible: boolean;
  isEditable: boolean;
  refreshInterval?: number;
}

interface DashboardConfig {
  layout: 'grid' | 'flexible' | 'compact';
  theme: 'light' | 'dark' | 'auto';
  widgets: DashboardWidget[];
  autoRefresh: boolean;
  refreshInterval: number;
}

interface DynamicDashboardProps {
  isVisible: boolean;
  onClose: () => void;
  chatbotCommand?: string;
  onCommandResponse?: (response: CommandResponse) => void;
}

interface CommandResponse {
  success: boolean;
  message: string;
  action?: string;
  data?: unknown;
  error?: string;
}

interface MetricData {
  type: 'metric';
  value: number;
  currency?: string;
  lastUpdated?: Date;
}

interface ListData {
  type: 'list';
  items: Array<{
    name: string;
    value: number;
  }>;
  lastUpdated?: Date;
}

interface ChartData {
  type: 'chart';
  data: Array<{
    name: string;
    value: number;
  }>;
  lastUpdated?: Date;
}

interface AlertData {
  type: 'alert';
  items: Array<{
    message: string;
    severity?: 'info' | 'warning' | 'error';
  }>;
  lastUpdated?: Date;
}

interface ActionData {
  type: 'action';
  actions: Array<{
    name: string;
    description?: string;
    icon?: string;
    onClick: () => void;
  }>;
  lastUpdated?: Date;
}

export default function DynamicDashboard({ 
  isVisible, 
  onClose, 
  chatbotCommand,
  onCommandResponse 
}: DynamicDashboardProps) {
  const { theme } = useTheme();
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({
    layout: 'grid',
    theme: 'auto',
    widgets: [],
    autoRefresh: true,
    refreshInterval: 30000
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // 🎯 PROCESSAR COMANDOS DO CHATBOT
  useEffect(() => {
    if (chatbotCommand) {
      processChatbotCommand(chatbotCommand);
    }
  }, [chatbotCommand]);

  const processChatbotCommand = async (command: string) => {
    setIsLoading(true);
    
    try {
      const lowerCommand = command.toLowerCase();
      
      // 📊 COMANDOS DE VISUALIZAÇÃO
      if (lowerCommand.includes('mostrar') || lowerCommand.includes('exibir') || lowerCommand.includes('ver')) {
        if (lowerCommand.includes('saldo') || lowerCommand.includes('balanço')) {
          await addWidget('balance', 'Saldo Atual', { type: 'metric', value: 0 });
        }
        else if (lowerCommand.includes('transação') || lowerCommand.includes('gasto')) {
          await addWidget('transactions', 'Transações Recentes', { type: 'list', items: [] });
        }
        else if (lowerCommand.includes('meta') || lowerCommand.includes('objetivo')) {
          await addWidget('goals', 'Metas Ativas', { type: 'list', items: [] });
        }
        else if (lowerCommand.includes('investimento') || lowerCommand.includes('portfólio')) {
          await addWidget('investments', 'Portfólio', { type: 'chart', data: [] });
        }
        else if (lowerCommand.includes('relatório') || lowerCommand.includes('análise')) {
          await addWidget('analysis', 'Análise Financeira', { type: 'chart', data: [] });
        }
      }
      
      // 🔄 COMANDOS DE ATUALIZAÇÃO
      else if (lowerCommand.includes('atualizar') || lowerCommand.includes('refresh') || lowerCommand.includes('recarregar')) {
        await refreshDashboard();
      }
      
      // ⚙️ COMANDOS DE CONFIGURAÇÃO
      else if (lowerCommand.includes('configurar') || lowerCommand.includes('ajustar') || lowerCommand.includes('personalizar')) {
        if (lowerCommand.includes('layout')) {
          const layout = lowerCommand.includes('compacto') ? 'compact' : 
                        lowerCommand.includes('flexível') ? 'flexible' : 'grid';
          setDashboardConfig(prev => ({ ...prev, layout }));
        }
        else if (lowerCommand.includes('tema')) {
          const theme = lowerCommand.includes('escuro') ? 'dark' : 
                       lowerCommand.includes('claro') ? 'light' : 'auto';
          setDashboardConfig(prev => ({ ...prev, theme }));
        }
        else if (lowerCommand.includes('refresh') || lowerCommand.includes('atualização')) {
          const autoRefresh = !lowerCommand.includes('desativar');
          setDashboardConfig(prev => ({ ...prev, autoRefresh }));
        }
      }
      
      // 🗑️ COMANDOS DE REMOÇÃO
      else if (lowerCommand.includes('remover') || lowerCommand.includes('excluir') || lowerCommand.includes('ocultar')) {
        if (lowerCommand.includes('widget') || lowerCommand.includes('todos')) {
          await removeAllWidgets();
        }
        else {
          // Remover widget específico baseado no conteúdo
          const widgetType = getWidgetTypeFromCommand(lowerCommand);
          if (widgetType) {
            await removeWidget(widgetType);
          }
        }
      }
      
      // ➕ COMANDOS DE ADIÇÃO
      else if (lowerCommand.includes('adicionar') || lowerCommand.includes('criar') || lowerCommand.includes('novo')) {
        if (lowerCommand.includes('widget')) {
          const widgetType = getWidgetTypeFromCommand(lowerCommand);
          if (widgetType) {
            await addWidget(widgetType, getWidgetTitle(widgetType), getWidgetData(widgetType));
          }
        }
      }
      
      // 📈 COMANDOS DE ANÁLISE
      else if (lowerCommand.includes('analisar') || lowerCommand.includes('estatística')) {
        await addWidget('analytics', 'Análise Detalhada', { type: 'chart', data: [] });
      }
      
      // 🚨 COMANDOS DE ALERTA
      else if (lowerCommand.includes('alerta') || lowerCommand.includes('notificação')) {
        await addWidget('alerts', 'Alertas', { type: 'alert', items: [] });
      }

      onCommandResponse?.({
        success: true,
        message: `Comando executado: ${command}`,
        action: 'dashboard_command',
        data: { command, timestamp: new Date() }
      });

    } catch (error) {
      console.error('❌ Erro ao processar comando do dashboard:', error);
      onCommandResponse?.({
        success: false,
        message: 'Erro ao processar comando do dashboard',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 ADICIONAR WIDGET
  const addWidget = async (type: string, title: string, data: WidgetData) => {
    const newWidget: DashboardWidget = {
      id: `${type}_${Date.now()}`,
      type: getWidgetType(type),
      title,
      data,
      position: getDefaultPosition(type),
      isVisible: true,
      isEditable: true,
      refreshInterval: getRefreshInterval(type)
    };

    setDashboardConfig(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
  };

  // 🗑️ REMOVER WIDGET
  const removeWidget = async (type: string) => {
    setDashboardConfig(prev => ({
      ...prev,
      widgets: prev.widgets.filter(widget => !widget.id.startsWith(type))
    }));
  };

  // 🗑️ REMOVER TODOS OS WIDGETS
  const removeAllWidgets = async () => {
    setDashboardConfig(prev => ({
      ...prev,
      widgets: []
    }));
  };

  // 🔄 ATUALIZAR DASHBOARD
  const refreshDashboard = async () => {
    setIsLoading(true);
    
    try {
      // Simular atualização de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLastRefresh(new Date());
      
      // Atualizar dados dos widgets
      setDashboardConfig(prev => ({
        ...prev,
        widgets: prev.widgets.map(widget => ({
          ...widget,
          data: { ...widget.data, lastUpdated: new Date() }
        }))
      }));

    } catch (error) {
      console.error('❌ Erro ao atualizar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 FUNÇÕES AUXILIARES
  const getWidgetType = (type: string): 'chart' | 'metric' | 'list' | 'alert' | 'action' => {
    switch (type) {
      case 'balance': return 'metric';
      case 'transactions': return 'list';
      case 'goals': return 'list';
      case 'investments': return 'chart';
      case 'analysis': return 'chart';
      case 'analytics': return 'chart';
      case 'alerts': return 'alert';
      default: return 'metric';
    }
  };

  const getDefaultPosition = (type: string) => {
    const positions = {
      balance: { x: 0, y: 0, w: 2, h: 1 },
      transactions: { x: 2, y: 0, w: 2, h: 2 },
      goals: { x: 0, y: 1, w: 2, h: 2 },
      investments: { x: 4, y: 0, w: 2, h: 2 },
      analysis: { x: 0, y: 3, w: 3, h: 2 },
      analytics: { x: 3, y: 3, w: 3, h: 2 },
      alerts: { x: 4, y: 2, w: 2, h: 1 }
    };
    
    return positions[type as keyof typeof positions] || { x: 0, y: 0, w: 1, h: 1 };
  };

  const getRefreshInterval = (type: string) => {
    const intervals = {
      balance: 30000, // 30s
      transactions: 60000, // 1min
      goals: 300000, // 5min
      investments: 300000, // 5min
      analysis: 600000, // 10min
      analytics: 600000, // 10min
      alerts: 30000 // 30s
    };
    
    return intervals[type as keyof typeof intervals] || 60000;
  };

  const getWidgetTypeFromCommand = (command: string): string | null => {
    if (command.includes('saldo') || command.includes('balanço')) return 'balance';
    if (command.includes('transação') || command.includes('gasto')) return 'transactions';
    if (command.includes('meta') || command.includes('objetivo')) return 'goals';
    if (command.includes('investimento') || command.includes('portfólio')) return 'investments';
    if (command.includes('análise') || command.includes('estatística')) return 'analytics';
    if (command.includes('alerta') || command.includes('notificação')) return 'alerts';
    return null;
  };

  const getWidgetTitle = (type: string): string => {
    const titles = {
      balance: 'Saldo Atual',
      transactions: 'Transações Recentes',
      goals: 'Metas Ativas',
      investments: 'Portfólio',
      analytics: 'Análise Detalhada',
      alerts: 'Alertas'
    };
    
    return titles[type as keyof typeof titles] || 'Widget';
  };

  const getWidgetData = (type: string): MetricData | ListData | ChartData | AlertData | ActionData => {
    const data = {
      balance: { type: 'metric' as const, value: 0, currency: 'BRL' },
      transactions: { type: 'list' as const, items: [] },
      goals: { type: 'list' as const, items: [] },
      investments: { type: 'chart' as const, data: [] },
      analytics: { type: 'chart' as const, data: [] },
      alerts: { type: 'alert' as const, items: [] }
    };
    
    return data[type as keyof typeof data] || { type: 'metric' as const, value: 0 };
  };

  // �� RENDERIZAR WIDGET
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'metric':
        return <MetricWidget widget={widget} />;
      case 'list':
        return <ListWidget widget={widget} />;
      case 'chart':
        return <ChartWidget widget={widget} />;
      case 'alert':
        return <AlertWidget widget={widget} />;
      case 'action':
        return <ActionWidget widget={widget} />;
      default:
        return <MetricWidget widget={widget} />;
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden ${theme === 'dark' ? 'dark' : ''}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Dashboard Dinâmico</h1>
                <p className="text-indigo-100">Controlado pelo Chatbot</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshDashboard}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
              
              <button
                onClick={onClose}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-indigo-100">
            Última atualização: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {dashboardConfig.widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <BarChart3 className="w-16 h-16 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dashboard Vazio</h3>
              <p className="text-center max-w-md">
                Use o chatbot para adicionar widgets e personalizar seu dashboard.
                <br />
                Exemplo: "Mostrar saldo", "Adicionar widget de transações"
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              dashboardConfig.layout === 'compact' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
              dashboardConfig.layout === 'flexible' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              <AnimatePresence>
                {dashboardConfig.widgets.map((widget) => (
                  <motion.div
                    key={widget.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                  >
                    {renderWidget(widget)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// 🎯 COMPONENTES DE WIDGET

const MetricWidget = ({ widget }: { widget: DashboardWidget }) => {
  if (widget.type !== 'metric') return null;
  const data = widget.data as MetricData;

  return (
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{widget.title}</h3>
      <DollarSign className="w-5 h-5 text-green-500" />
    </div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white">
        R$ {data.value?.toFixed(2) || '0,00'}
    </div>
    <div className="text-sm text-gray-500 mt-2">
      Atualizado agora
    </div>
  </div>
);
};

const ListWidget = ({ widget }: { widget: DashboardWidget }) => {
  if (widget.type !== 'list') return null;
  const data = widget.data as ListData; // Type assertion

  return (
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{widget.title}</h3>
      <List className="w-5 h-5 text-blue-500" />
    </div>
    <div className="space-y-3">
        {data.items?.length > 0 ? (
          data.items.map((item: { name: string; value: number }, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              R$ {item.value?.toFixed(2) || '0,00'}
            </span>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">
          Nenhum item encontrado
        </div>
      )}
    </div>
  </div>
);
};

const ChartWidget = ({ widget }: { widget: DashboardWidget }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{widget.title}</h3>
      <BarChart3 className="w-5 h-5 text-purple-500" />
    </div>
    <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Gráfico em desenvolvimento</span>
    </div>
  </div>
);

const AlertWidget = ({ widget }: { widget: DashboardWidget }) => {
  if (widget.type !== 'alert') return null;
  const data = widget.data as AlertData; // Type assertion
  
  return (
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{widget.title}</h3>
      <AlertTriangle className="w-5 h-5 text-yellow-500" />
    </div>
    <div className="space-y-3">
        {data.items?.length > 0 ? (
          data.items.map((alert: { message: string; severity?: 'info' | 'warning' | 'error' }, index: number) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">{alert.message}</span>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">
          Nenhum alerta ativo
        </div>
      )}
    </div>
  </div>
);
};

const ActionWidget = ({ widget }: { widget: DashboardWidget }) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{widget.title}</h3>
      <Zap className="w-5 h-5 text-orange-500" />
    </div>
    <div className="space-y-3">
      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors">
        Ação Rápida
      </button>
    </div>
  </div>
); 