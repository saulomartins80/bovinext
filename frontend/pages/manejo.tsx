import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiDollarSign,
  FiCheck,
  FiX,
  FiEdit3,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import { 
  GiMedicines,
  GiWeight,
  GiHeartBeats,
  GiSyringe
} from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Interfaces conforme especificação BOVINEXT
interface Manejo {
  id: string;
  tipo: 'VACINACAO' | 'VERMIFUGACAO' | 'PESAGEM' | 'REPRODUCAO' | 'TRATAMENTO';
  animais: string[];
  data: Date;
  produto?: string;
  dosagem?: string;
  custo: number;
  responsavel: string;
  observacoes?: string;
  proximaAplicacao?: Date;
  status: 'PENDENTE' | 'CONCLUIDO' | 'ATRASADO';
}

interface FilterState {
  tipo: string;
  status: string;
  responsavel: string;
  periodo: string;
  search: string;
}

export default function ManejoPage() {
  const { loading } = useAuth();
  const [manejos, setManejos] = useState<Manejo[]>([]);
  const [filteredManejos, setFilteredManejos] = useState<Manejo[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    tipo: '',
    status: '',
    responsavel: '',
    periodo: '',
    search: ''
  });
  const [selectedManejo, setSelectedManejo] = useState<Manejo | null>(null);
  const [, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - será substituído pela integração com Supabase
  useEffect(() => {
    const mockManejos: Manejo[] = [
      {
        id: '1',
        tipo: 'VACINACAO',
        animais: ['BV001', 'BV002', 'BV003'],
        data: new Date('2024-09-08'),
        produto: 'Vacina Aftosa',
        dosagem: '5ml',
        custo: 450,
        responsavel: 'João Silva',
        observacoes: 'Vacinação anual obrigatória',
        proximaAplicacao: new Date('2025-09-08'),
        status: 'PENDENTE'
      },
      {
        id: '2',
        tipo: 'PESAGEM',
        animais: ['BV001', 'BV004', 'BV005'],
        data: new Date('2024-09-10'),
        custo: 0,
        responsavel: 'Maria Santos',
        observacoes: 'Pesagem mensal de controle',
        status: 'PENDENTE'
      },
      {
        id: '3',
        tipo: 'VERMIFUGACAO',
        animais: ['BV002'],
        data: new Date('2024-09-05'),
        produto: 'Ivermectina',
        dosagem: '10ml',
        custo: 85,
        responsavel: 'Carlos Oliveira',
        observacoes: 'Animal apresentava sintomas',
        status: 'CONCLUIDO'
      },
      {
        id: '4',
        tipo: 'TRATAMENTO',
        animais: ['BV006'],
        data: new Date('2024-09-03'),
        produto: 'Antibiótico',
        dosagem: '20ml',
        custo: 120,
        responsavel: 'Dr. Veterinário',
        observacoes: 'Tratamento de ferida',
        status: 'ATRASADO'
      }
    ];
    
    setTimeout(() => {
      setManejos(mockManejos);
      setFilteredManejos(mockManejos);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtros
  useEffect(() => {
    let filtered = manejos;

    if (filters.search) {
      filtered = filtered.filter(manejo => 
        manejo.animais.some(animal => animal.toLowerCase().includes(filters.search.toLowerCase())) ||
        manejo.produto?.toLowerCase().includes(filters.search.toLowerCase()) ||
        manejo.responsavel.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.tipo) {
      filtered = filtered.filter(manejo => manejo.tipo === filters.tipo);
    }

    if (filters.status) {
      filtered = filtered.filter(manejo => manejo.status === filters.status);
    }

    if (filters.responsavel) {
      filtered = filtered.filter(manejo => manejo.responsavel === filters.responsavel);
    }

    setFilteredManejos(filtered);
  }, [filters, manejos]);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'VACINACAO':
        return <GiSyringe className="h-6 w-6" />;
      case 'VERMIFUGACAO':
        return <GiMedicines className="h-6 w-6" />;
      case 'PESAGEM':
        return <GiWeight className="h-6 w-6" />;
      case 'REPRODUCAO':
        return <GiHeartBeats className="h-6 w-6" />;
      case 'TRATAMENTO':
        return <GiMedicines className="h-6 w-6" />;
      default:
        return <FiCalendar className="h-6 w-6" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    const colorMap = {
      'VACINACAO': 'bg-blue-100 text-blue-800',
      'VERMIFUGACAO': 'bg-green-100 text-green-800',
      'PESAGEM': 'bg-purple-100 text-purple-800',
      'REPRODUCAO': 'bg-pink-100 text-pink-800',
      'TRATAMENTO': 'bg-red-100 text-red-800'
    };
    return colorMap[tipo as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const statusMap = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800',
      'CONCLUIDO': 'bg-green-100 text-green-800',
      'ATRASADO': 'bg-red-100 text-red-800'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONCLUIDO':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'ATRASADO':
        return <FiAlertCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
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
              <FiCalendar className="h-8 w-8 text-blue-600" />
              Gestão de Manejo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Cronograma e controle de atividades • {filteredManejos.length} atividades
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiPlus className="h-5 w-5" />
              Nova Atividade
            </button>
            
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              {viewMode === 'list' ? <FiCalendar className="h-5 w-5" /> : <FiFilter className="h-5 w-5" />}
              {viewMode === 'list' ? 'Calendário' : 'Lista'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Estatísticas Rápidas */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {manejos.filter(m => m.status === 'PENDENTE').length}
              </p>
            </div>
            <FiClock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Concluídas</p>
              <p className="text-2xl font-bold text-green-600">
                {manejos.filter(m => m.status === 'CONCLUIDO').length}
              </p>
            </div>
            <FiCheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Atrasadas</p>
              <p className="text-2xl font-bold text-red-600">
                {manejos.filter(m => m.status === 'ATRASADO').length}
              </p>
            </div>
            <FiAlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Custo Mensal</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {manejos.reduce((acc, m) => acc + m.custo, 0).toLocaleString()}
              </p>
            </div>
            <FiDollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por animal, produto ou responsável..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={filters.tipo}
            onChange={(e) => setFilters({...filters, tipo: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos os Tipos</option>
            <option value="VACINACAO">Vacinação</option>
            <option value="VERMIFUGACAO">Vermifugação</option>
            <option value="PESAGEM">Pesagem</option>
            <option value="REPRODUCAO">Reprodução</option>
            <option value="TRATAMENTO">Tratamento</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos Status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="ATRASADO">Atrasado</option>
          </select>
          
          <select
            value={filters.responsavel}
            onChange={(e) => setFilters({...filters, responsavel: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos Responsáveis</option>
            <option value="João Silva">João Silva</option>
            <option value="Maria Santos">Maria Santos</option>
            <option value="Carlos Oliveira">Carlos Oliveira</option>
            <option value="Dr. Veterinário">Dr. Veterinário</option>
          </select>
        </div>
      </motion.div>

      {/* Lista de Manejos */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredManejos.map((manejo, index) => (
          <motion.div
            key={manejo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    {getTipoIcon(manejo.tipo)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {manejo.tipo.replace('_', ' ')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {manejo.animais.length} animal(is): {manejo.animais.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(manejo.tipo)}`}>
                    {manejo.tipo}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(manejo.status)}`}>
                    {getStatusIcon(manejo.status)}
                    {manejo.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiCalendar className="h-4 w-4" />
                  <span>{formatDate(manejo.data)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiUser className="h-4 w-4" />
                  <span>{manejo.responsavel}</span>
                </div>
                
                {manejo.produto && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <GiMedicines className="h-4 w-4" />
                    <span>{manejo.produto} {manejo.dosagem && `(${manejo.dosagem})`}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FiDollarSign className="h-4 w-4" />
                  <span>R$ {manejo.custo.toLocaleString()}</span>
                </div>
              </div>
              
              {manejo.observacoes && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Observações:</strong> {manejo.observacoes}
                  </p>
                </div>
              )}
              
              {manejo.proximaAplicacao && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Próxima aplicação:</strong> {formatDate(manejo.proximaAplicacao)}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  {manejo.status === 'PENDENTE' && (
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                      <FiCheck className="h-4 w-4" />
                      Marcar como Concluído
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedManejo(manejo)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver Detalhes
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <FiEdit3 className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedManejo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedManejo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Detalhes do Manejo
                  </h2>
                  <button
                    onClick={() => setSelectedManejo(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informações Básicas</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Tipo:</span> {selectedManejo.tipo}</p>
                        <p><span className="text-gray-600">Data:</span> {formatDate(selectedManejo.data)}</p>
                        <p><span className="text-gray-600">Status:</span> {selectedManejo.status}</p>
                        <p><span className="text-gray-600">Responsável:</span> {selectedManejo.responsavel}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Detalhes</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Animais:</span> {selectedManejo.animais.join(', ')}</p>
                        {selectedManejo.produto && (
                          <p><span className="text-gray-600">Produto:</span> {selectedManejo.produto}</p>
                        )}
                        {selectedManejo.dosagem && (
                          <p><span className="text-gray-600">Dosagem:</span> {selectedManejo.dosagem}</p>
                        )}
                        <p><span className="text-gray-600">Custo:</span> R$ {selectedManejo.custo.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedManejo.observacoes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Observações</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                        {selectedManejo.observacoes}
                      </p>
                    </div>
                  )}
                  
                  {selectedManejo.proximaAplicacao && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Próxima Aplicação</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(selectedManejo.proximaAplicacao)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
