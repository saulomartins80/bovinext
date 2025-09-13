import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Simple icons as text/emoji - no external dependencies
const PlusIcon = () => <span className="text-lg">+</span>;
const DollarIcon = () => <span className="text-lg">💰</span>;
const TrendingIcon = () => <span className="text-lg">📈</span>;
const CowIcon = () => <span className="text-lg">🐄</span>;
const FactoryIcon = () => <span className="text-lg">🏭</span>;
const MeatIcon = () => <span className="text-lg">🥩</span>;
const EditIcon = () => <span className="text-lg">✏️</span>;
const TrashIcon = () => <span className="text-lg">🗑️</span>;
const CloseIcon = () => <span className="text-lg">✕</span>;

// Interfaces conforme especificação BOVINEXT
interface Venda {
  id: string;
  animais: string[];
  comprador: string;
  tipoVenda: 'FRIGORIFICO' | 'LEILAO' | 'DIRETO';
  pesoTotal: number;
  precoArroba: number;
  valorTotal: number;
  dataVenda: Date;
  dataEntrega?: Date;
  impostos: {
    funrural: number;
    icms: number;
    outros: number;
  };
  lucroLiquido: number;
  observacoes?: string;
  status: 'PENDENTE' | 'CONFIRMADA' | 'ENTREGUE' | 'CANCELADA';
}

export default function VendasPage() {
  const { loading } = useAuth();
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockVendas: Venda[] = [
      {
        id: '1',
        animais: ['BV001', 'BV002', 'BV003'],
        comprador: 'JBS Frigorífico',
        tipoVenda: 'FRIGORIFICO',
        pesoTotal: 1455,
        precoArroba: 315.80,
        valorTotal: 153420,
        dataVenda: new Date('2024-09-15'),
        dataEntrega: new Date('2024-09-20'),
        impostos: {
          funrural: 3835,
          icms: 7671,
          outros: 1534
        },
        lucroLiquido: 140380,
        status: 'CONFIRMADA',
        observacoes: 'Animais prontos para abate'
      },
      {
        id: '2',
        animais: ['BV004', 'BV005'],
        comprador: 'Fazenda Vizinha',
        tipoVenda: 'DIRETO',
        pesoTotal: 970,
        precoArroba: 320.00,
        valorTotal: 103467,
        dataVenda: new Date('2024-09-10'),
        impostos: {
          funrural: 2587,
          icms: 0,
          outros: 517
        },
        lucroLiquido: 100363,
        status: 'ENTREGUE'
      }
    ];
    
    setTimeout(() => {
      setVendas(mockVendas);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'FRIGORIFICO':
        return <FactoryIcon />;
      case 'LEILAO':
        return <MeatIcon />;
      case 'DIRETO':
        return <CowIcon />;
      default:
        return <DollarIcon />;
    }
  };

  const getTipoColor = (tipo: string) => {
    const colorMap = {
      'FRIGORIFICO': 'bg-blue-100 text-blue-800',
      'LEILAO': 'bg-green-100 text-green-800',
      'DIRETO': 'bg-purple-100 text-purple-800'
    };
    return colorMap[tipo as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const statusMap = {
      'PENDENTE': 'bg-yellow-100 text-yellow-800',
      'CONFIRMADA': 'bg-blue-100 text-blue-800',
      'ENTREGUE': 'bg-green-100 text-green-800',
      'CANCELADA': 'bg-red-100 text-red-800'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  const totalVendas = vendas.reduce((acc, venda) => acc + venda.valorTotal, 0);
  const totalLucro = vendas.reduce((acc, venda) => acc + venda.lucroLiquido, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <DollarIcon />
              Gestão de Vendas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Marketplace e controle de vendas • {vendas.length} vendas
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
              <PlusIcon />
              Nova Venda
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Vendas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalVendas)}
              </p>
            </div>
            <DollarIcon />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Líquido</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalLucro)}
              </p>
            </div>
            <TrendingIcon />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Preço Médio/@</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                R$ {vendas.length > 0 ? (vendas.reduce((acc, v) => acc + v.precoArroba, 0) / vendas.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <CowIcon />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Animais Vendidos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {vendas.reduce((acc, v) => acc + v.animais.length, 0)}
              </p>
            </div>
            <MeatIcon />
          </div>
        </div>
      </div>

      {/* Lista de Vendas */}
      <div className="space-y-4">
        {vendas.map((venda) => (
          <div
            key={venda.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    {getTipoIcon(venda.tipoVenda)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {venda.comprador}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {venda.animais.length} animais • {venda.pesoTotal} kg total
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTipoColor(venda.tipoVenda)}`}>
                    {venda.tipoVenda}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(venda.status)}`}>
                    {venda.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(venda.valorTotal)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Preço/@</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">R$ {venda.precoArroba.toFixed(2)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data Venda</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(venda.dataVenda)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Líquido</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(venda.lucroLiquido)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Animais: {venda.animais.join(', ')}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSelectedVenda(venda)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver Detalhes
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <EditIcon />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600">
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {selectedVenda && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVenda(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Detalhes da Venda
                </h2>
                <button
                  onClick={() => setSelectedVenda(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <CloseIcon />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informações da Venda</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Comprador:</span> {selectedVenda.comprador}</p>
                      <p><span className="text-gray-600">Tipo:</span> {selectedVenda.tipoVenda}</p>
                      <p><span className="text-gray-600">Status:</span> {selectedVenda.status}</p>
                      <p><span className="text-gray-600">Data Venda:</span> {formatDate(selectedVenda.dataVenda)}</p>
                      {selectedVenda.dataEntrega && (
                        <p><span className="text-gray-600">Data Entrega:</span> {formatDate(selectedVenda.dataEntrega)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Valores</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Peso Total:</span> {selectedVenda.pesoTotal} kg</p>
                      <p><span className="text-gray-600">Preço/@:</span> R$ {selectedVenda.precoArroba.toFixed(2)}</p>
                      <p><span className="text-gray-600">Valor Total:</span> {formatCurrency(selectedVenda.valorTotal)}</p>
                      <p><span className="text-gray-600">Lucro Líquido:</span> {formatCurrency(selectedVenda.lucroLiquido)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Impostos</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-600">FUNRURAL</p>
                      <p className="font-medium">{formatCurrency(selectedVenda.impostos.funrural)}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-600">ICMS</p>
                      <p className="font-medium">{formatCurrency(selectedVenda.impostos.icms)}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-600">Outros</p>
                      <p className="font-medium">{formatCurrency(selectedVenda.impostos.outros)}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Animais Vendidos</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVenda.animais.map((animal) => (
                      <span key={animal} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {animal}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedVenda.observacoes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Observações</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      {selectedVenda.observacoes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
