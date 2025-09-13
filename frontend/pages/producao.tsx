import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiTrendingUp,
  FiBarChart,
  FiDollarSign,
  FiDownload,
  FiActivity,
  FiTarget,
  FiPieChart
} from 'react-icons/fi';
import { 
  GiCow,
  GiWeight,
  GiMilkCarton,
  GiBullHorns
} from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Interfaces conforme especificação BOVINEXT
interface Producao {
  id: string;
  tipo: 'NASCIMENTO' | 'DESMAME' | 'ENGORDA' | 'REPRODUCAO';
  animal: string;
  data: Date;
  peso?: number;
  ganhoMedio?: number;
  custoProducao: number;
  receita?: number;
  margemLucro?: number;
  observacoes?: string;
}

// interface ProductionReport {
//   periodo: string;
//   gmdMedio: number;
//   conversaoAlimentar: number;
//   custoPorArroba: number;
//   margemLucro: number;
//   recomendacoes: string[];
// }

interface KPIMetrics {
  gmdMedio: number;
  pesoMedioRebanho: number;
  taxaNatalidade: number;
  custoProducaoMensal: number;
  receitaMensal: number;
  margemLucro: number;
}

export default function ProducaoPage() {
  const { loading } = useAuth();
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [kpiMetrics] = useState<KPIMetrics>({
    gmdMedio: 1.12,
    pesoMedioRebanho: 425,
    taxaNatalidade: 85,
    custoProducaoMensal: 45000,
    receitaMensal: 125000,
    margemLucro: 64
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - será substituído pela integração com Supabase
  useEffect(() => {
    const mockProducoes: Producao[] = [
      {
        id: '1',
        tipo: 'NASCIMENTO',
        animal: 'BV001',
        data: new Date('2024-08-15'),
        peso: 35,
        custoProducao: 0,
        observacoes: 'Nascimento normal, bezerro saudável'
      },
      {
        id: '2',
        tipo: 'ENGORDA',
        animal: 'BV002',
        data: new Date('2024-09-01'),
        peso: 485,
        ganhoMedio: 1.2,
        custoProducao: 850,
        receita: 2400,
        margemLucro: 65,
        observacoes: 'Excelente ganho de peso'
      },
      {
        id: '3',
        tipo: 'DESMAME',
        animal: 'BV003',
        data: new Date('2024-08-20'),
        peso: 180,
        custoProducao: 450,
        observacoes: 'Desmame aos 8 meses'
      },
      {
        id: '4',
        tipo: 'REPRODUCAO',
        animal: 'BV004',
        data: new Date('2024-09-05'),
        custoProducao: 200,
        observacoes: 'Inseminação artificial realizada'
      }
    ];
    
    setTimeout(() => {
      setProducoes(mockProducoes);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'NASCIMENTO':
        return <GiCow className="h-6 w-6" />;
      case 'DESMAME':
        return <GiMilkCarton className="h-6 w-6" />;
      case 'ENGORDA':
        return <GiWeight className="h-6 w-6" />;
      case 'REPRODUCAO':
        return <GiBullHorns className="h-6 w-6" />;
      default:
        return <FiActivity className="h-6 w-6" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    const colorMap = {
      'NASCIMENTO': 'bg-green-100 text-green-800',
      'DESMAME': 'bg-blue-100 text-blue-800',
      'ENGORDA': 'bg-purple-100 text-purple-800',
      'REPRODUCAO': 'bg-pink-100 text-pink-800'
    };
    return colorMap[tipo as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading || isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiBarChart className="h-8 w-8 text-purple-600" />
              Analytics de Produção
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Performance e indicadores zootécnicos • Período: {selectedPeriod} dias
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="7">7 dias</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
              <option value="365">1 ano</option>
            </select>
            
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
              <FiDownload className="h-5 w-5" />
              Relatório
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPIs Principais */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FiTrendingUp className="h-6 w-6 text-green-500" />
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+8%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">GMD Médio</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpiMetrics.gmdMedio} kg/dia</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <GiWeight className="h-6 w-6 text-blue-500" />
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">+5%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Peso Médio</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpiMetrics.pesoMedioRebanho} kg</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <GiCow className="h-6 w-6 text-pink-500" />
            <span className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded-full">+2%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Taxa Natalidade</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpiMetrics.taxaNatalidade}%</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FiDollarSign className="h-6 w-6 text-red-500" />
            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">-3%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Custo Produção</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(kpiMetrics.custoProducaoMensal)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FiTrendingUp className="h-6 w-6 text-green-500" />
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Receita Mensal</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(kpiMetrics.receitaMensal)}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <FiTarget className="h-6 w-6 text-purple-500" />
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">+7%</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Margem Lucro</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpiMetrics.margemLucro}%</p>
        </div>
      </motion.div>

      {/* Gráficos e Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Gráfico GMD Evolution */}
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
            <FiBarChart className="h-5 w-5 text-gray-400" />
          </div>
          
          {/* Placeholder para gráfico */}
          <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FiTrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Gráfico GMD Evolution</p>
              <p className="text-sm text-gray-500">Meta: 1.20 kg/dia | Atual: 1.12 kg/dia</p>
              <div className="mt-4 flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  GMD Atual
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Meta
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Distribuição por Categoria */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Performance por Categoria
            </h2>
            <FiPieChart className="h-5 w-5 text-gray-400" />
          </div>
          
          {/* Placeholder para gráfico pizza */}
          <div className="h-64 bg-gradient-to-br from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <FiPieChart className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Distribuição Performance</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    Bois
                  </span>
                  <span className="font-medium">1.25 kg/dia</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Novilhos
                  </span>
                  <span className="font-medium">1.15 kg/dia</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Vacas
                  </span>
                  <span className="font-medium">0.95 kg/dia</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Relatório de Produção Detalhado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Relatório de Produção - Setembro 2024
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Atualizado há 2 horas</span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Conversão Alimentar</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">6.8:1</p>
            <p className="text-xs text-green-600">Excelente</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Custo por @</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ 185</p>
            <p className="text-xs text-yellow-600">Dentro da meta</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Mortalidade</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">1.2%</p>
            <p className="text-xs text-green-600">Baixa</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Eficiência Reprodutiva</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">85%</p>
            <p className="text-xs text-green-600">Boa</p>
          </div>
        </div>
        
        {/* Recomendações IA */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <FiTarget className="h-5 w-5" />
            Recomendações FINN IA
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Ajustar ração do Lote B para melhorar GMD (+0.15 kg/dia estimado)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Considerar venda antecipada de 15 animais aproveitando alta do mercado
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              Implementar suplementação mineral no Pasto 3 para otimizar reprodução
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Histórico de Produção */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Histórico de Produção
          </h2>
          <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            Ver todos
          </button>
        </div>
        
        <div className="space-y-4">
          {producoes.map((producao, index) => (
            <motion.div
              key={producao.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  {getTipoIcon(producao.tipo)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {producao.tipo.replace('_', ' ')} - {producao.animal}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(producao.data)}
                    {producao.peso && ` • ${producao.peso} kg`}
                    {producao.ganhoMedio && ` • GMD: ${producao.ganhoMedio} kg/dia`}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(producao.tipo)}`}>
                    {producao.tipo}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Custo: {formatCurrency(producao.custoProducao)}
                </p>
                {producao.receita && (
                  <p className="text-sm text-green-600">
                    Receita: {formatCurrency(producao.receita)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
