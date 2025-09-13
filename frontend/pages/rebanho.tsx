import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiMapPin,
  FiCamera,
  FiTrendingUp,
  FiEye
} from 'react-icons/fi';
import { 
  GiCow,
  GiBull,
  GiMilkCarton
} from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Interfaces conforme especificação BOVINEXT
interface Animal {
  id: string;
  brinco: string;
  categoria: 'BEZERRO' | 'NOVILHO' | 'BOI' | 'BEZERRA' | 'NOVILHA' | 'VACA';
  peso: number;
  idade: number;
  raca: string;
  pai?: string;
  mae?: string;
  status: 'ATIVO' | 'VENDIDO' | 'MORTO' | 'TRANSFERIDO';
  lote: string;
  pasto: string;
  dataEntrada: Date;
  valorCompra?: number;
  custoAcumulado: number;
  previsaoVenda?: Date;
  observacoes?: string;
}

interface FilterState {
  categoria: string;
  status: string;
  lote: string;
  raca: string;
  search: string;
}

export default function RebanhoPage() {
  const { loading } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    categoria: '',
    status: '',
    lote: '',
    raca: '',
    search: ''
  });
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - será substituído pela integração com Supabase
  useEffect(() => {
    const mockAnimals: Animal[] = [
      {
        id: '1',
        brinco: 'BV001',
        categoria: 'BOI',
        peso: 485,
        idade: 36,
        raca: 'Nelore',
        status: 'ATIVO',
        lote: 'Lote A',
        pasto: 'Pasto 1',
        dataEntrada: new Date('2021-03-15'),
        valorCompra: 2500,
        custoAcumulado: 850,
        previsaoVenda: new Date('2024-12-15'),
        observacoes: 'Animal em excelente estado'
      },
      {
        id: '2',
        brinco: 'BV002',
        categoria: 'NOVILHO',
        peso: 380,
        idade: 24,
        raca: 'Angus',
        status: 'ATIVO',
        lote: 'Lote B',
        pasto: 'Pasto 2',
        dataEntrada: new Date('2022-06-10'),
        valorCompra: 2200,
        custoAcumulado: 650,
        observacoes: 'Bom ganho de peso'
      },
      {
        id: '3',
        brinco: 'BV003',
        categoria: 'VACA',
        peso: 420,
        idade: 60,
        raca: 'Brahman',
        status: 'ATIVO',
        lote: 'Lote C',
        pasto: 'Pasto 1',
        dataEntrada: new Date('2020-01-20'),
        valorCompra: 3000,
        custoAcumulado: 1200,
        observacoes: 'Matriz reprodutora'
      }
    ];
    
    setTimeout(() => {
      setAnimals(mockAnimals);
      setFilteredAnimals(mockAnimals);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtros
  useEffect(() => {
    let filtered = animals;

    if (filters.search) {
      filtered = filtered.filter(animal => 
        animal.brinco.toLowerCase().includes(filters.search.toLowerCase()) ||
        animal.raca.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.categoria) {
      filtered = filtered.filter(animal => animal.categoria === filters.categoria);
    }

    if (filters.status) {
      filtered = filtered.filter(animal => animal.status === filters.status);
    }

    if (filters.lote) {
      filtered = filtered.filter(animal => animal.lote === filters.lote);
    }

    if (filters.raca) {
      filtered = filtered.filter(animal => animal.raca === filters.raca);
    }

    setFilteredAnimals(filtered);
  }, [filters, animals]);

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'BOI':
      case 'NOVILHO':
        return <GiBull className="h-6 w-6" />;
      case 'VACA':
      case 'NOVILHA':
        return <GiMilkCarton className="h-6 w-6" />;
      default:
        return <GiCow className="h-6 w-6" />;
    }
  };

  const getCategoryColor = (categoria: string) => {
    const colorMap = {
      'BOI': 'bg-blue-100 text-blue-800',
      'NOVILHO': 'bg-green-100 text-green-800',
      'VACA': 'bg-pink-100 text-pink-800',
      'NOVILHA': 'bg-purple-100 text-purple-800',
      'BEZERRO': 'bg-yellow-100 text-yellow-800',
      'BEZERRA': 'bg-orange-100 text-orange-800'
    };
    return colorMap[categoria as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const statusMap = {
      'ATIVO': 'bg-green-100 text-green-800',
      'VENDIDO': 'bg-blue-100 text-blue-800',
      'MORTO': 'bg-red-100 text-red-800',
      'TRANSFERIDO': 'bg-yellow-100 text-yellow-800'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
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
              <GiCow className="h-8 w-8 text-green-600" />
              Gestão do Rebanho
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Controle total dos seus animais • {filteredAnimals.length} de {animals.length} animais
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiPlus className="h-5 w-5" />
              Novo Animal
            </button>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
              <FiCamera className="h-5 w-5" />
              Foto IA
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Animais</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{animals.length}</p>
            </div>
            <GiCow className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Peso Médio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(animals.reduce((acc, animal) => acc + animal.peso, 0) / animals.length)} kg
              </p>
            </div>
            <FiTrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {(animals.reduce((acc, animal) => acc + (animal.valorCompra || 0), 0) / 1000).toFixed(0)}K
              </p>
            </div>
            <FiTrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {animals.filter(a => a.status === 'ATIVO').length}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </motion.div>

      {/* Filtros e Busca */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por brinco ou raça..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <select
            value={filters.categoria}
            onChange={(e) => setFilters({...filters, categoria: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todas Categorias</option>
            <option value="BOI">Boi</option>
            <option value="NOVILHO">Novilho</option>
            <option value="VACA">Vaca</option>
            <option value="NOVILHA">Novilha</option>
            <option value="BEZERRO">Bezerro</option>
            <option value="BEZERRA">Bezerra</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos Status</option>
            <option value="ATIVO">Ativo</option>
            <option value="VENDIDO">Vendido</option>
            <option value="MORTO">Morto</option>
            <option value="TRANSFERIDO">Transferido</option>
          </select>
          
          <select
            value={filters.lote}
            onChange={(e) => setFilters({...filters, lote: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todos Lotes</option>
            <option value="Lote A">Lote A</option>
            <option value="Lote B">Lote B</option>
            <option value="Lote C">Lote C</option>
          </select>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {viewMode === 'grid' ? 'Lista' : 'Grade'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Lista/Grade de Animais */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={viewMode === 'grid' ? 
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
          "space-y-4"
        }
      >
        {filteredAnimals.map((animal, index) => (
          <motion.div
            key={animal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedAnimal(animal)}
          >
            {viewMode === 'grid' ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      {getCategoryIcon(animal.categoria)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{animal.brinco}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{animal.raca}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(animal.categoria)}`}>
                      {animal.categoria}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(animal.status)}`}>
                      {animal.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Peso</p>
                      <p className="font-medium text-gray-900 dark:text-white">{animal.peso} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Idade</p>
                      <p className="font-medium text-gray-900 dark:text-white">{animal.idade} meses</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FiMapPin className="h-4 w-4" />
                    <span>{animal.lote} • {animal.pasto}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Ver Detalhes
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <FiEdit3 className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    {getCategoryIcon(animal.categoria)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{animal.brinco}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{animal.raca} • {animal.peso} kg</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(animal.categoria)}`}>
                    {animal.categoria}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(animal.status)}`}>
                    {animal.status}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <FiEye className="h-4 w-4" />
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
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Modal de Detalhes do Animal */}
      <AnimatePresence>
        {selectedAnimal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedAnimal(null)}
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
                    Detalhes - {selectedAnimal.brinco}
                  </h2>
                  <button
                    onClick={() => setSelectedAnimal(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                {/* Conteúdo do modal será expandido aqui */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informações Básicas</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Brinco:</span> {selectedAnimal.brinco}</p>
                      <p><span className="text-gray-600">Categoria:</span> {selectedAnimal.categoria}</p>
                      <p><span className="text-gray-600">Raça:</span> {selectedAnimal.raca}</p>
                      <p><span className="text-gray-600">Peso:</span> {selectedAnimal.peso} kg</p>
                      <p><span className="text-gray-600">Idade:</span> {selectedAnimal.idade} meses</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Localização</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Lote:</span> {selectedAnimal.lote}</p>
                      <p><span className="text-gray-600">Pasto:</span> {selectedAnimal.pasto}</p>
                      <p><span className="text-gray-600">Status:</span> {selectedAnimal.status}</p>
                    </div>
                  </div>
                </div>
                
                {selectedAnimal.observacoes && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Observações</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedAnimal.observacoes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
