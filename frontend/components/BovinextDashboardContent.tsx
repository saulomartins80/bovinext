import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiTrendingUp, 
  FiDollarSign, 
  FiActivity,
  FiAlertTriangle,
  FiClock,
  FiMapPin,
  FiPhone,
  FiMic,
  FiCamera,
  FiBarChart,
  FiPieChart,
  FiCalendar
} from 'react-icons/fi';
import { 
  GiCow,
  GiBullHorns,
} from 'react-icons/gi';

// Interfaces conforme especificação BOVINEXT
interface KPICard {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

interface SmartAlert {
  type: 'urgent' | 'opportunity' | 'health';
  message: string;
  action: string;
  icon: React.ReactNode;
}

interface DashboardStats {
  totalAnimais: number;
  receitaMensal: number;
  gmdMedio: number;
  precoArroba: number;
  alertasAtivos: number;
}

export default function BovinextDashboardContent() {
  const [stats] = useState<DashboardStats>({
    totalAnimais: 1247,
    receitaMensal: 1200000,
    gmdMedio: 1.12,
    precoArroba: 315.80,
    alertasAtivos: 3
  });

  // KPI Cards principais conforme especificação
  const kpiCards: KPICard[] = [
    {
      title: 'REBANHO TOTAL',
      value: `${stats.totalAnimais.toLocaleString()} animais`,
      change: '+23 este mês',
      icon: <GiCow className="h-8 w-8" />,
      color: 'blue'
    },
    {
      title: 'RECEITA MENSAL',
      value: `R$ ${(stats.receitaMensal / 1000000).toFixed(1)}M`,
      change: '+15% vs mês anterior',
      icon: <FiDollarSign className="h-8 w-8" />,
      color: 'green'
    },
    {
      title: 'GMD MÉDIO',
      value: `${stats.gmdMedio} kg/dia`,
      change: '+8% acima da meta',
      icon: <FiTrendingUp className="h-8 w-8" />,
      color: 'purple'
    },
    {
      title: 'PREÇO BOI HOJE',
      value: `R$ ${stats.precoArroba.toFixed(2)}/@`,
      change: '+1.2% hoje',
      icon: <FiBarChart className="h-8 w-8" />,
      color: 'orange'
    }
  ];

  // Alertas inteligentes conforme especificação
  const smartAlerts: SmartAlert[] = [
    {
      type: 'urgent',
      message: '15 animais precisam vacinação hoje',
      action: 'Agendar via WhatsApp',
      icon: <FiAlertTriangle className="h-5 w-5" />
    },
    {
      type: 'opportunity',
      message: 'Preço boi subiu 5% - momento ideal venda',
      action: 'Ver animais prontos',
      icon: <FiTrendingUp className="h-5 w-5" />
    },
    {
      type: 'health',
      message: 'Animal #1234 com comportamento anômalo',
      action: 'Verificar no campo',
      icon: <FiActivity className="h-5 w-5" />
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      purple: 'bg-purple-500 text-white',
      orange: 'bg-orange-500 text-white'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-500 text-white';
  };

  const getAlertClasses = (type: string) => {
    const alertMap = {
      urgent: 'border-red-200 bg-red-50 text-red-800',
      opportunity: 'border-green-200 bg-green-50 text-green-800',
      health: 'border-yellow-200 bg-yellow-50 text-yellow-800'
    };
    return alertMap[type as keyof typeof alertMap] || 'border-gray-200 bg-gray-50 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header da Fazenda */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <GiBullHorns className="h-8 w-8 text-green-600" />
                Fazenda São José
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                📍 Ribeirão Preto - SP • ☀️ Ensolarado 28°C - Ideal para pastejo
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">FINN BOVINO Online</span>
              </div>
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {stats.alertasAtivos} alertas importantes
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                {card.icon}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {card.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {card.value}
            </p>
            {card.change && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <FiTrendingUp className="h-4 w-4" />
                {card.change}
              </p>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráficos e Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gráfico de Performance */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Evolução GMD - Últimos 12 meses
              </h2>
              <div className="flex items-center gap-2">
                <FiPieChart className="h-5 w-5 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Monitore a &quot;saúde&quot; do seu rebanho com IA
                </p>
              </div>
            </div>
            
            {/* Placeholder para gráfico */}
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FiBarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Gráfico de Performance</p>
                <p className="text-sm text-gray-500">GMD Médio: 1.12 kg/dia (Meta: 1.20 kg/dia)</p>
              </div>
            </div>
          </motion.div>

          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Ações Rápidas - Campo
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <FiCamera className="h-8 w-8 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Foto Animal</span>
              </button>
              
              <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <FiMic className="h-8 w-8 text-green-600" />
                <span className="text-sm font-medium text-green-800">Comando Voz</span>
              </button>
              
              <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <FiMapPin className="h-8 w-8 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Localizar Animal</span>
              </button>
              
              <button className="flex flex-col items-center gap-2 p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                <FiPhone className="h-8 w-8 text-red-600" />
                <span className="text-sm font-medium text-red-800">Emergência</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Alertas e Próximas Ações */}
        <div className="space-y-6">
          
          {/* Alertas IA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiAlertTriangle className="h-5 w-5 text-orange-500" />
              Alertas FINN IA
            </h2>
            
            <div className="space-y-4">
              {smartAlerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getAlertClasses(alert.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {alert.icon}
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{alert.message}</p>
                      <button className="text-xs underline hover:no-underline">
                        {alert.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Próximas Ações */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FiCalendar className="h-5 w-5 text-blue-500" />
              Próximas Ações
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <FiClock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Vacinação Lote 5</p>
                  <p className="text-xs text-yellow-600">Amanhã</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <FiUsers className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Pesagem mensal</p>
                  <p className="text-xs text-blue-600">3 dias</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <FiDollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Venda programada</p>
                  <p className="text-xs text-green-600">15 dias</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FINN Bovino Voice */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-500 to-blue-600 rounded-xl shadow-sm p-6 text-white"
          >
            
            <div className="mt-4 text-xs text-green-100">
              <p>Últimos comandos:</p>
              <p className="opacity-75">• &quot;Bovino, quantos animais tenho?&quot;</p>
              <p className="opacity-75">• &quot;Bovino, preço do boi hoje&quot;</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
