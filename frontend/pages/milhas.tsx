import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Plus, X, Search, DollarSign, CheckCircle,
  CreditCard as CreditCardIcon, Banknote, Wallet, Award,
  Star, ArrowUpRight, Eye, EyeOff, Zap,
  PieChart, Filter, Download, Loader2, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../context/ThemeContext';

// Componente dinâmico para os gráficos
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-blue-500" size={24} />
    </div>
  )
});

// Tipos
interface CreditCard {
  id: string;
  name: string;
  bank: string;
  program: string;
  limit: number;
  used: number;
  dueDate: number;
  closingDate: number;
  pointsPerReal: number;
  annualFee: number;
  benefits: string[];
  status: 'active' | 'inactive';
  lastFourDigits: string;
  color: string;
  bankLogo: string;
  category: 'premium' | 'standard' | 'basic';
  nextInvoiceAmount: number;
  nextInvoiceDue: string;
  cashback?: number;
}

interface MileageProgram {
  id: string;
  name: string;
  airline: string;
  pointsBalance: number;
  estimatedValue: number;
  conversionRate: number;
  status: 'active' | 'inactive';
  programLogo: string;
  bestUse: string;
  expirationPolicy: string;
  recentEarned: number;
  expiringPoints: number;
  expirationDate: string;
}

interface Invoice {
  id: string;
  cardId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

type ModalItem = CreditCard | MileageProgram | Invoice | null;

// Type guards
const isCreditCard = (item: ModalItem): item is CreditCard => item !== null && 'limit' in item;
const isMileageProgram = (item: ModalItem): item is MileageProgram => item !== null && 'pointsBalance' in item;

const MilhasRedesign = () => {
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('cards');
  const [analyticsForm, setAnalyticsForm] = useState({
    open: false,
    data: {
      periodo: 'mensal',
      categoria: '',
      valor: '',
      descricao: ''
    }
  });
  const [showBalances, setShowBalances] = useState(true);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    cardId: '',
    amount: 0,
    cardName: ''
  });
  const [editModal, setEditModal] = useState({
    open: false,
    type: '', // 'card', 'program', 'invoice'
    item: null as ModalItem,
    index: -1
  });
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    type: '',
    item: null as ModalItem,
    index: -1
  });

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dados mock com logos reais dos bancos
  const creditCards: CreditCard[] = [
    {
      id: '1',
      name: 'Itaú Personnalité Black',
      bank: 'Itaú',
      program: 'Smiles',
      limit: 25000,
      used: 8950,
      dueDate: 15,
      closingDate: 30,
      pointsPerReal: 2.5,
      annualFee: 1295,
      benefits: ['Sala VIP Prioritária', 'Seguro Viagem Premium', 'Concierge 24h', 'Milhas em Dobro'],
      status: 'active',
      lastFourDigits: '4539',
      color: '#FF6B00',
      bankLogo: 'https://logoeps.com/wp-content/uploads/2013/03/itau-vector-logo.png',
      category: 'premium',
      nextInvoiceAmount: 8950,
      nextInvoiceDue: '2024-08-15',
      cashback: 250
    },
    {
      id: '2',
      name: 'Nubank Ultravioleta',
      bank: 'Nubank',
      program: 'Rewards',
      limit: 15000,
      used: 4320,
      dueDate: 20,
      closingDate: 5,
      pointsPerReal: 2.0,
      annualFee: 0,
      benefits: ['Sem Anuidade', 'Cashback Ilimitado', 'Investimentos', 'Cartão Virtual'],
      status: 'active',
      lastFourDigits: '1234',
      color: '#8A05BE',
      bankLogo: 'https://logos-world.net/wp-content/uploads/2021/02/Nubank-Logo.png',
      category: 'premium',
      nextInvoiceAmount: 4320,
      nextInvoiceDue: '2024-08-20',
      cashback: 180
    },
    {
      id: '3',
      name: 'Santander Select',
      bank: 'Santander',
      program: 'Esfera',
      limit: 12000,
      used: 2150,
      dueDate: 25,
      closingDate: 10,
      pointsPerReal: 1.8,
      annualFee: 800,
      benefits: ['Pontos que não Vencem', 'Desconto em Combustível', 'Cashback Restaurantes'],
      status: 'active',
      lastFourDigits: '5678',
      color: '#EC0000',
      bankLogo: 'https://logoeps.com/wp-content/uploads/2013/12/santander-vector-logo.png',
      category: 'standard',
      nextInvoiceAmount: 2150,
      nextInvoiceDue: '2024-08-25'
    }
  ];

  const mileagePrograms: MileageProgram[] = [
    {
      id: '1',
      name: 'Smiles',
      airline: 'Gol',
      pointsBalance: 125000,
      estimatedValue: 3125,
      conversionRate: 1.4,
      status: 'active',
      programLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Smiles_logo.png',
      bestUse: 'Voos Nacionais e Internacionais',
      expirationPolicy: '36 meses',
      recentEarned: 15420,
      expiringPoints: 8500,
      expirationDate: '2024-12-15'
    },
    {
      id: '2',
      name: 'TudoAzul',
      airline: 'Azul',
      pointsBalance: 89000,
      estimatedValue: 2225,
      conversionRate: 1.2,
      status: 'active',
      programLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/TudoAzul_logo.png/200px-TudoAzul_logo.png',
      bestUse: 'Voos Internacionais',
      expirationPolicy: '24 meses',
      recentEarned: 8950,
      expiringPoints: 12000,
      expirationDate: '2024-10-30'
    },
    {
      id: '3',
      name: 'Latam Pass',
      airline: 'Latam',
      pointsBalance: 67500,
      estimatedValue: 1687,
      conversionRate: 1.0,
      status: 'active',
      programLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/LATAM_Pass_Logo.png/200px-LATAM_Pass_Logo.png',
      bestUse: 'Voos Internacionais Premium',
      expirationPolicy: '36 meses',
      recentEarned: 4320,
      expiringPoints: 5000,
      expirationDate: '2025-01-20'
    }
  ];

  // Função para obter classes de tema
  const getThemeClasses = () => {
    const isDark = resolvedTheme === 'dark';
    
    return {
      bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
      cardBg: isDark ? 'bg-gray-800' : 'bg-white',
      text: isDark ? 'text-gray-100' : 'text-gray-900',
      textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
      border: isDark ? 'border-gray-700' : 'border-gray-200',
      hover: isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
    };
  };

  const themeClasses = getThemeClasses();

  // Componente de Header moderno
  const ModernHeader = () => (
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Wallet className="text-white" size={24} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Meus Cartões</h1>
                <p className={`${themeClasses.textSecondary}`}>Gerencie suas finanças com inteligência</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBalances(!showBalances)}
              className={`p-2 rounded-lg ${themeClasses.cardBg} ${themeClasses.border} border`}
            >
              {showBalances ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`${themeClasses.cardBg} p-6 rounded-2xl border ${themeClasses.border} backdrop-blur-sm border-l-4 border-l-blue-500`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CreditCardIcon className="text-blue-600" size={20} />
              </div>
              <span className="text-xs text-green-500 font-medium">+12%</span>
            </div>
            <h3 className={`text-2xl font-bold ${themeClasses.text} mb-1`}>
              {showBalances ? `R$ ${creditCards.reduce((total, card) => total + card.limit, 0).toLocaleString()}` : '••••••'}
            </h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>Limite Total</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`${themeClasses.cardBg} p-6 rounded-2xl border ${themeClasses.border} backdrop-blur-sm border-l-4 border-l-orange-500`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Banknote className="text-orange-600" size={20} />
              </div>
              <span className="text-xs text-red-500 font-medium">-5%</span>
            </div>
            <h3 className={`text-2xl font-bold ${themeClasses.text} mb-1`}>
              {showBalances ? `R$ ${creditCards.reduce((total, card) => total + card.nextInvoiceAmount, 0).toLocaleString()}` : '••••••'}
            </h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>Fatura Total</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`${themeClasses.cardBg} p-6 rounded-2xl border ${themeClasses.border} backdrop-blur-sm border-l-4 border-l-purple-500`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Award className="text-purple-600" size={20} />
              </div>
              <span className="text-xs text-green-500 font-medium">+25%</span>
            </div>
            <h3 className={`text-2xl font-bold ${themeClasses.text} mb-1`}>
              {showBalances ? mileagePrograms.reduce((total, program) => total + program.pointsBalance, 0).toLocaleString() : '••••••'}
            </h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>Pontos Totais</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              toast.info('Cashback acumulado este mês! Resgate disponível a partir de R$ 50.');
            }}
            className={`${themeClasses.cardBg} p-6 rounded-2xl border ${themeClasses.border} backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all border-l-4 border-l-green-500`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="text-green-600" size={20} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-500 font-medium">+8%</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${themeClasses.text} mb-1`}>
              {showBalances ? `R$ ${creditCards.reduce((total, card) => total + (card.cashback || 0), 0).toLocaleString()}` : '••••••'}
            </h3>
            <div className="flex items-center justify-between">
              <p className={`text-sm ${themeClasses.textSecondary}`}>Cashback</p>
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                Disponível
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );

  // Componente de Navegação moderna
  const ModernNavigation = () => (
    <div className={`${themeClasses.cardBg} rounded-2xl p-2 border ${themeClasses.border} mb-6`}>
      <div className="flex space-x-1">
        {[
          { id: 'cards', label: 'Cartões', icon: CreditCardIcon },
          { id: 'programs', label: 'Programas', icon: Award },
          { id: 'invoices', label: 'Faturas', icon: Banknote },
          { id: 'analytics', label: 'Análises', icon: PieChart }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? `bg-blue-600 text-white shadow-lg`
                : `${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-700`
            }`}
          >
            <tab.icon size={18} />
            {!isMobile && <span className="font-medium">{tab.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );

  // Componente de Cartão Moderno
  const ModernCreditCard = ({ card }: { card: CreditCard }) => {
    const utilizationPercentage = (card.used / card.limit) * 100;
    
    return (
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`relative overflow-hidden rounded-3xl p-6 cursor-pointer group ${themeClasses.cardBg} border ${themeClasses.border}`}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedCard(selectedCard === card.id ? null : card.id);
        }}
      >

        
        {/* Card Header */}
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white p-2">
              <Image 
                src={card.bankLogo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzNCODJGNiIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPkM8L3RleHQ+Cjwvc3ZnPgo='} 
                alt={card.bank}
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className={`font-bold ${themeClasses.text}`}>{card.name}</h3>
              <p className={`text-sm ${themeClasses.textSecondary}`}>•••• {card.lastFourDigits}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {card.category === 'premium' && (
              <div className="p-1 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Star className="text-yellow-600" size={14} />
              </div>
            )}
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditModal({
                    open: true,
                    type: 'card',
                    item: card,
                    index: creditCards.findIndex(c => c.id === card.id)
                  });
                }}
                className={`p-2 rounded-lg ${themeClasses.hover} transition-colors text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20`}
                title="Editar cartão"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModal({
                    open: true,
                    type: 'card',
                    item: card,
                    index: creditCards.findIndex(c => c.id === card.id)
                  });
                }}
                className={`p-2 rounded-lg ${themeClasses.hover} transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}
                title="Excluir cartão"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3,6 5,6 21,6" />
                  <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Card Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className={`text-sm ${themeClasses.textSecondary} mb-1`}>Limite Disponível</p>
            <p className={`text-xl font-bold ${themeClasses.text}`}>
              {showBalances ? `R$ ${(card.limit - card.used).toLocaleString()}` : '••••••'}
            </p>
          </div>
          <div>
            <p className={`text-sm ${themeClasses.textSecondary} mb-1`}>Próxima Fatura</p>
            <p className={`text-xl font-bold ${themeClasses.text}`}>
              {showBalances ? `R$ ${card.nextInvoiceAmount.toLocaleString()}` : '••••••'}
            </p>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="relative z-10 mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className={themeClasses.textSecondary}>Utilização</span>
            <span className={`font-medium ${utilizationPercentage > 80 ? 'text-red-500' : 'text-green-500'}`}>
              {utilizationPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                utilizationPercentage > 80 ? 'bg-red-500' : 
                utilizationPercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${utilizationPercentage}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative z-10 flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setPaymentModal({
                open: true,
                cardId: card.id,
                amount: card.nextInvoiceAmount,
                cardName: card.name
              });
            }}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
          >
            Pagar Fatura
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            className={`px-3 py-2 rounded-xl text-sm ${themeClasses.hover} ${themeClasses.text} border ${themeClasses.border}`}
          >
            Detalhes
          </button>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {selectedCard === card.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${themeClasses.textSecondary} mb-1`}>Pontos por R$</p>
                    <p className={`font-medium ${themeClasses.text}`}>{card.pointsPerReal} pts</p>
                  </div>
                  <div>
                    <p className={`text-sm ${themeClasses.textSecondary} mb-1`}>Anuidade</p>
                    <p className={`font-medium ${themeClasses.text}`}>
                      {card.annualFee === 0 ? 'Isento' : `R$ ${card.annualFee}`}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className={`text-sm ${themeClasses.textSecondary} mb-2`}>Benefícios Principais</p>
                  <div className="flex flex-wrap gap-2">
                    {card.benefits.slice(0, 3).map((benefit, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Componente de Programa de Milhas Moderno
  const ModernMileageProgram = ({ program }: { program: MileageProgram }) => (
    <motion.div
      whileHover={{ y: -3 }}
      className={`${themeClasses.cardBg} rounded-3xl p-6 border ${themeClasses.border} group hover:shadow-xl transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white p-2">
            <Image 
              src={program.programLogo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzEwQjk4MSIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPk08L3RleHQ+Cjwvc3ZnPgo='} 
              alt={program.name}
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className={`font-bold ${themeClasses.text}`}>{program.name}</h3>
            <p className={`text-sm ${themeClasses.textSecondary}`}>{program.airline}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
            Ativo
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setEditModal({
                  open: true,
                  type: 'program',
                  item: program,
                  index: mileagePrograms.findIndex(p => p.id === program.id)
                });
              }}
              className={`p-2 rounded-lg ${themeClasses.hover} transition-colors text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20`}
              title="Editar programa"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModal({
                  open: true,
                  type: 'program',
                  item: program,
                  index: mileagePrograms.findIndex(p => p.id === program.id)
                });
              }}
              className={`p-2 rounded-lg ${themeClasses.hover} transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}
              title="Excluir programa"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6" />
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Points Balance */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-bold ${themeClasses.text}`}>
            {showBalances ? program.pointsBalance.toLocaleString() : '••••••'}
          </span>
          <span className={`text-sm ${themeClasses.textSecondary}`}>pontos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-semibold text-green-600`}>
            {showBalances ? `R$ ${program.estimatedValue.toLocaleString()}` : '••••••'}
          </span>
          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
            +{program.recentEarned.toLocaleString()} este mês
          </span>
        </div>
      </div>

      {/* Expiring Points Alert */}
      {program.expiringPoints > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Bell className="text-yellow-600" size={16} />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Pontos Expirando
            </span>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            {program.expiringPoints.toLocaleString()} pontos vencem em {program.expirationDate}
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className={`text-sm ${themeClasses.textSecondary} mb-1`}>Taxa de Conversão</p>
          <p className={`font-medium ${themeClasses.text}`}>{program.conversionRate} pts/R$</p>
        </div>
        <div>
          <p className={`text-sm ${themeClasses.textSecondary} mb-1`}>Melhor Uso</p>
          <p className={`font-medium ${themeClasses.text} text-xs`}>{program.bestUse}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <Zap size={16} />
          Resgatar
        </button>
        <button className={`px-4 py-3 rounded-xl ${themeClasses.hover} ${themeClasses.text} border ${themeClasses.border}`}>
          <ArrowUpRight size={16} />
        </button>
      </div>
    </motion.div>
  );

  // Componente de Lista de Faturas Moderna
  const ModernInvoicesList = () => (
    <div className="space-y-4">
      {creditCards.map((card) => (
        <motion.div
          key={card.id}
          whileHover={{ scale: 1.01 }}
          className={`${themeClasses.cardBg} rounded-3xl p-6 border ${themeClasses.border} hover:shadow-lg transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white p-2">
                <Image 
                  src={card.bankLogo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzNCODJGNiIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPkM8L3RleHQ+Cjwvc3ZnPgo='} 
                  alt={card.bank}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className={`font-bold ${themeClasses.text}`}>{card.name}</h3>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Vence em {new Date(card.nextInvoiceDue).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-2xl font-bold ${themeClasses.text}`}>
                {showBalances ? `R$ ${card.nextInvoiceAmount.toLocaleString()}` : '••••••'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {card.nextInvoiceAmount > 0 ? (
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                    Pendente
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
                    Paga
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className={themeClasses.textSecondary}>Utilização do limite</span>
              <span className={themeClasses.text}>
                {((card.used / card.limit) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(card.used / card.limit) * 100}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setPaymentModal({
                  open: true,
                  cardId: card.id,
                  amount: card.nextInvoiceAmount,
                  cardName: card.name
                });
              }}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CreditCardIcon size={16} />
              Pagar Fatura
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // Simular download de PDF da fatura
                toast.success(`PDF da fatura do ${card.name} baixado com sucesso!`);
                // Aqui seria implementada a lógica real de download do PDF
                // window.open(`/api/invoices/${card.id}/pdf`, '_blank');
              }}
              className={`px-4 py-3 rounded-xl ${themeClasses.hover} ${themeClasses.text} border ${themeClasses.border} flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
              title="Baixar PDF da fatura"
            >
              <Download size={16} />
              PDF
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setEditModal({
                  open: true,
                  type: 'invoice',
                  item: card,
                  index: creditCards.findIndex(c => c.id === card.id)
                });
              }}
              className={`px-4 py-3 rounded-xl ${themeClasses.hover} transition-colors text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 border ${themeClasses.border}`}
              title="Editar fatura"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setDeleteModal({
                  open: true,
                  type: 'invoice',
                  item: card,
                  index: creditCards.findIndex(c => c.id === card.id)
                });
              }}
              className={`px-4 py-3 rounded-xl ${themeClasses.hover} transition-colors text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border ${themeClasses.border}`}
              title="Excluir fatura"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6" />
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
              </svg>
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Modal de Adicionar Cartão/Programa
  const AddModal = () => (
    <AnimatePresence>
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`${themeClasses.cardBg} rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg p-4 sm:p-6`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                {activeTab === 'cards' ? 'Novo Cartão' : 
                 activeTab === 'programs' ? 'Novo Programa' : 
                 activeTab === 'invoices' ? 'Nova Fatura' : 'Novo Item'}
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className={`p-2 rounded-lg ${themeClasses.hover}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {activeTab === 'cards' ? (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Nome do Cartão
                    </label>
                    <input
                      type="text"
                      className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}
                      placeholder="Ex: Itaú Personnalité Black"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Banco
                      </label>
                      <select className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}>
                        <option>Selecione o banco</option>
                        <option>Itaú</option>
                        <option>Nubank</option>
                        <option>Santander</option>
                        <option>Bradesco</option>
                        <option>Inter</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Programa
                      </label>
                      <select className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}>
                        <option>Selecione o programa</option>
                        <option>Smiles</option>
                        <option>TudoAzul</option>
                        <option>Latam Pass</option>
                        <option>Livelo</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Limite (R$)
                      </label>
                      <input
                        type="number"
                        className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}
                        placeholder="5000"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Pontos por R$
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                        placeholder="2.5"
                      />
                    </div>
                  </div>
                </>
              ) : activeTab === 'programs' ? (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Programa de Milhas
                    </label>
                    <select className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}>
                      <option>Selecione o programa</option>
                      <option>Smiles (Gol)</option>
                      <option>TudoAzul (Azul)</option>
                      <option>Latam Pass (Latam)</option>
                      <option>Livelo</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Saldo Atual
                      </label>
                      <input
                        type="number"
                        className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                        placeholder="125000"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Valor Estimado (R$)
                      </label>
                      <input
                        type="number"
                        className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                        placeholder="3125"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Cartão
                    </label>
                    <select className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}>
                      <option>Selecione o cartão</option>
                      {creditCards.map(card => (
                        <option key={card.id} value={card.id}>{card.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Valor da Fatura (R$)
                      </label>
                      <input
                        type="number"
                        className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                        placeholder="1500"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Data de Vencimento
                      </label>
                      <input
                        type="date"
                        className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Descrição
                    </label>
                    <textarea
                      className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} h-20 resize-none`}
                      placeholder="Descrição da fatura..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className={`flex-1 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.text} font-medium`}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    // Aqui você adicionaria a lógica para salvar
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Modal de Edição
  const EditModal = () => {
    const [editData, setEditData] = useState<Partial<CreditCard | MileageProgram | Invoice>>({});

    useEffect(() => {
      if (editModal.open && editModal.item) {
        setEditData({ ...editModal.item });
      }
    }, []);

    const handleEditSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const itemType = editModal.type === 'card' ? 'cartão' : 
                      editModal.type === 'program' ? 'programa' : 'fatura';
      
      // Simular atualização dos dados
      setTimeout(() => {
        toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} atualizado com sucesso!`);
        setEditModal({ open: false, type: '', item: null, index: -1 });
        setEditData({});
      }, 500);
    };

    const getEditTitle = () => {
      switch (editModal.type) {
        case 'card': return 'Editar Cartão';
        case 'program': return 'Editar Programa';
        case 'invoice': return 'Editar Fatura';
        default: return 'Editar Item';
      }
    };

    return (
      <AnimatePresence>
        {editModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`${themeClasses.cardBg} rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg p-4 sm:p-6`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                  {getEditTitle()}
                </h2>
                <button 
                  onClick={() => setEditModal({ open: false, type: '', item: null, index: -1 })}
                  className={`p-2 rounded-lg ${themeClasses.hover}`}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-3 sm:space-y-4">
                {editModal.type === 'card' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Nome do Cartão
                      </label>
                      <input
                        type="text"
                        value={(editData as Partial<CreditCard>).name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}
                        placeholder="Nome do cartão"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                          Limite (R$)
                        </label>
                        <input
                          type="number"
                          value={(editData as Partial<CreditCard>).limit || ''}
                          onChange={(e) => setEditData({ ...editData, limit: Number(e.target.value) })}
                          className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}
                          placeholder="25000"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                          Usado (R$)
                        </label>
                        <input
                          type="number"
                          value={(editData as Partial<CreditCard>).used || ''}
                          onChange={(e) => setEditData({ ...editData, used: Number(e.target.value) })}
                          className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}
                          placeholder="5000"
                        />
                      </div>
                    </div>
                  </>
                )}

                {editModal.type === 'program' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Nome do Programa
                      </label>
                      <input
                        type="text"
                        value={(editData as Partial<MileageProgram>).name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}
                        placeholder="Nome do programa"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                          Saldo Atual
                        </label>
                        <input
                          type="number"
                          value={(editData as Partial<MileageProgram>).pointsBalance || ''}
                          onChange={(e) => setEditData({ ...editData, pointsBalance: Number(e.target.value) })}
                          className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}
                          placeholder="125000"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                          Valor Estimado (R$)
                        </label>
                        <input
                          type="number"
                          value={(editData as Partial<MileageProgram>).estimatedValue || ''}
                          onChange={(e) => setEditData({ ...editData, estimatedValue: Number(e.target.value) })}
                          className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}
                          placeholder="3125"
                        />
                      </div>
                    </div>
                  </>
                )}

                {editModal.type === 'invoice' && (
                  <>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Valor da Fatura (R$)
                      </label>
                      <input
                        type="number"
                        value={(editData as Partial<CreditCard>).nextInvoiceAmount || ''}
                        onChange={(e) => setEditData({ ...editData, nextInvoiceAmount: Number(e.target.value) })}
                        className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}
                        placeholder="1500"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                        Data de Vencimento
                      </label>
                      <input
                        type="date"
                        value={(editData as Partial<CreditCard>).nextInvoiceDue ? new Date((editData as Partial<CreditCard>).nextInvoiceDue!).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditData({ ...editData, nextInvoiceDue: e.target.value })}
                        className={`w-full p-2 sm:p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} text-sm sm:text-base`}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 sm:gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditModal({ open: false, type: '', item: null, index: -1 })}
                    className={`flex-1 py-2 px-4 rounded-xl border ${themeClasses.border} ${themeClasses.text} text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Modal de Exclusão
  const DeleteModal = () => {
    const handleDeleteConfirm = () => {
      const itemType = deleteModal.type === 'card' ? 'cartão' : 
                      deleteModal.type === 'program' ? 'programa' : 'fatura';
      
      // Simular exclusão dos dados
      setTimeout(() => {
        toast.success(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} excluído com sucesso!`);
        setDeleteModal({ open: false, type: '', item: null, index: -1 });
      }, 500);
    };

    const getDeleteTitle = () => {
      switch (deleteModal.type) {
        case 'card': return 'Excluir Cartão';
        case 'program': return 'Excluir Programa';
        case 'invoice': return 'Excluir Fatura';
        default: return 'Excluir Item';
      }
    };

    const getItemName = () => {
      if (!deleteModal.item) return '';
      if (isCreditCard(deleteModal.item) || isMileageProgram(deleteModal.item)) {
        return deleteModal.item.name || 'este item';
      }
      return 'este item';
    };

    return (
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`${themeClasses.cardBg} rounded-3xl shadow-2xl w-full max-w-sm p-4 sm:p-6`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                  {getDeleteTitle()}
                </h2>
                <button 
                  onClick={() => setDeleteModal({ open: false, type: '', item: null, index: -1 })}
                  className={`p-2 rounded-lg ${themeClasses.hover}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </div>
                
                <div className="text-center">
                  <p className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
                    Tem certeza?
                  </p>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Você está prestes a excluir <strong>{getItemName()}</strong>. 
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ open: false, type: '', item: null, index: -1 })}
                  className={`flex-1 py-2 px-4 rounded-xl border ${themeClasses.border} ${themeClasses.text} text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                  </svg>
                  Excluir
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Modal de Pagamento de Fatura
  const PaymentModal = () => {
    const [paymentData, setPaymentData] = useState({
      method: 'pix',
      installments: '1',
      bankAccount: '',
      notes: '',
      paymentType: 'full', // 'full' or 'minimum'
      customAmount: ''
    });

    const handlePaymentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const paymentAmount = paymentData.paymentType === 'minimum' 
        ? Math.round(paymentModal.amount * 0.15)
        : paymentModal.amount;
      
      const paymentTypeText = paymentData.paymentType === 'minimum' ? 'Mínimo' : 'Total';
      
      // Simular processamento de pagamento
      setTimeout(() => {
        toast.success(`Pagamento ${paymentTypeText} de R$ ${paymentAmount.toLocaleString()} realizado com sucesso! Cartão: ${paymentModal.cardName}`);
        setPaymentModal({ open: false, cardId: '', amount: 0, cardName: '' });
        setPaymentData({ 
          method: 'pix', 
          installments: '1', 
          bankAccount: '', 
          notes: '',
          paymentType: 'full',
          customAmount: ''
        });
      }, 1000);
    };

    return (
      <AnimatePresence>
        {paymentModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`${themeClasses.cardBg} rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md p-4 sm:p-6`}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${themeClasses.text}`}>Pagar Fatura</h2>
                  <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>{paymentModal.cardName}</p>
                </div>
                <button 
                  onClick={() => setPaymentModal({ open: false, cardId: '', amount: 0, cardName: '' })}
                  className={`p-2 rounded-lg ${themeClasses.hover}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className={`p-4 rounded-xl ${themeClasses.hover} mb-6`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${themeClasses.textSecondary}`}>Valor Total da Fatura</span>
                    <span className={`text-2xl font-bold ${themeClasses.text}`}>
                      R$ {paymentModal.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${themeClasses.textSecondary}`}>Pagamento Mínimo</span>
                    <span className={`text-lg font-semibold text-green-600`}>
                      R$ {Math.round(paymentModal.amount * 0.15).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    Tipo de Pagamento
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentData({ ...paymentData, paymentType: 'full' })}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        paymentData.paymentType === 'full'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : `${themeClasses.border} ${themeClasses.text} ${themeClasses.hover}`
                      }`}
                    >
                      Pagamento Total
                      <div className="text-xs mt-1 opacity-80">
                        R$ {paymentModal.amount.toLocaleString()}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentData({ ...paymentData, paymentType: 'minimum' })}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        paymentData.paymentType === 'minimum'
                          ? 'bg-green-600 text-white border-green-600'
                          : `${themeClasses.border} ${themeClasses.text} ${themeClasses.hover}`
                      }`}
                    >
                      Pagamento Mínimo
                      <div className="text-xs mt-1 opacity-80">
                        R$ {Math.round(paymentModal.amount * 0.15).toLocaleString()}
                      </div>
                    </button>
                  </div>
                </div>

                {paymentData.paymentType === 'minimum' && (
                  <div className={`p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800`}>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Atenção: Pagamento Mínimo
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          Ao pagar apenas o valor mínimo, juros serão aplicados sobre o saldo restante.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    Método de Pagamento
                  </label>
                  <select 
                    value={paymentData.method}
                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                    className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                  >
                    <option value="pix">PIX</option>
                    <option value="debito">Cartão de Débito</option>
                    <option value="transferencia">Transferência Bancária</option>
                    <option value="boleto">Boleto</option>
                  </select>
                </div>

                {paymentData.method === 'debito' && (
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Parcelamento
                    </label>
                    <select 
                      value={paymentData.installments}
                      onChange={(e) => setPaymentData({ ...paymentData, installments: e.target.value })}
                      className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                    >
                      <option value="1">À vista</option>
                      <option value="2">2x sem juros</option>
                      <option value="3">3x sem juros</option>
                      <option value="6">6x sem juros</option>
                      <option value="12">12x sem juros</option>
                    </select>
                  </div>
                )}

                {(paymentData.method === 'transferencia' || paymentData.method === 'debito') && (
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Conta Bancária
                    </label>
                    <select 
                      value={paymentData.bankAccount}
                      onChange={(e) => setPaymentData({ ...paymentData, bankAccount: e.target.value })}
                      className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                    >
                      <option value="">Selecione a conta</option>
                      <option value="itau">Itaú - Conta Corrente</option>
                      <option value="nubank">Nubank - Conta</option>
                      <option value="inter">Inter - Conta Corrente</option>
                      <option value="c6">C6 Bank - Conta</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                    Observações (opcional)
                  </label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} h-20 resize-none`}
                    placeholder="Adicione observações sobre o pagamento..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setPaymentModal({ open: false, cardId: '', amount: 0, cardName: '' })}
                    className={`flex-1 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.text} font-medium`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Confirmar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Componente de Análise com Gráficos e Formulários
  const AnalyticsDashboard = () => {
    const isDark = resolvedTheme === 'dark';
    
    // Dados para os gráficos
    const chartData = {
      pie: {
        labels: ['Smiles', 'TudoAzul', 'Latam Pass'],
        series: [125000, 89000, 67500]
      },
      line: {
        categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        series: [{
          name: 'Pontos Acumulados',
          data: [15000, 22000, 18000, 28000, 35000, 42000]
        }]
      },
      bar: {
        categories: ['Cartão 1', 'Cartão 2', 'Cartão 3'],
        series: [{
          name: 'Gastos Mensais',
          data: [8950, 4320, 2150]
        }]
      }
    };

    const chartOptions = {
      theme: {
        mode: isDark ? 'dark' as const : 'light' as const
      },
      chart: {
        background: 'transparent',
        toolbar: {
          show: false
        }
      },
      colors: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth' as const,
        width: 3
      },
      grid: {
        borderColor: isDark ? '#374151' : '#E5E7EB'
      },
      xaxis: {
        labels: {
          style: {
            colors: isDark ? '#9CA3AF' : '#6B7280'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: isDark ? '#9CA3AF' : '#6B7280'
          }
        }
      },
      legend: {
        labels: {
          colors: isDark ? '#9CA3AF' : '#6B7280'
        }
      }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      toast.success('Análise adicionada com sucesso!');
      setAnalyticsForm({
        open: false,
        data: {
          periodo: 'mensal',
          categoria: '',
          valor: '',
          descricao: ''
        }
      });
    };

    return (
      <div className="space-y-6">
        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${themeClasses.cardBg} p-6 rounded-xl shadow-lg border-l-4 border-blue-500`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`${themeClasses.textSecondary} text-sm font-medium`}>Total de Pontos</p>
                <p className={`text-2xl md:text-3xl font-bold ${themeClasses.text} mt-2`}>
                  {showBalances ? mileagePrograms.reduce((total, program) => total + program.pointsBalance, 0).toLocaleString() : '••••••'}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <Award className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${themeClasses.cardBg} p-6 rounded-xl shadow-lg border-l-4 border-green-500`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`${themeClasses.textSecondary} text-sm font-medium`}>Valor Estimado</p>
                <p className={`text-2xl md:text-3xl font-bold ${themeClasses.text} mt-2`}>
                  {showBalances ? `R$ ${mileagePrograms.reduce((total, program) => total + program.estimatedValue, 0).toLocaleString()}` : '••••••'}
                </p>
                <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>
                  Valor total das milhas
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <DollarSign className="text-green-600 dark:text-green-400" size={20} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Título da seção */}
        <div className="mb-6">
          <h2 className={`text-xl font-bold ${themeClasses.text}`}>Análises Detalhadas</h2>
          <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>Visualize a evolução dos seus pontos e gastos</p>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza - Distribuição de Pontos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`${themeClasses.cardBg} p-6 rounded-xl shadow-lg border ${themeClasses.border}`}
          >
            <h3 className={`text-lg font-bold ${themeClasses.text} mb-4`}>Distribuição de Pontos</h3>
            <Chart
              options={{
                ...chartOptions,
                labels: chartData.pie.labels,
                plotOptions: {
                  pie: {
                    donut: {
                      size: '60%'
                    }
                  }
                }
              }}
              series={chartData.pie.series}
              type="donut"
              height={300}
            />
          </motion.div>

          {/* Gráfico de Linha - Evolução Mensal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`${themeClasses.cardBg} p-6 rounded-xl shadow-lg border ${themeClasses.border}`}
          >
            <h3 className={`text-lg font-bold ${themeClasses.text} mb-4`}>Evolução Mensal</h3>
            <Chart
              options={{
                ...chartOptions,
                xaxis: {
                  ...chartOptions.xaxis,
                  categories: chartData.line.categories
                }
              }}
              series={chartData.line.series}
              type="line"
              height={300}
            />
          </motion.div>

          {/* Gráfico de Barras - Gastos por Cartão */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className={`${themeClasses.cardBg} p-6 rounded-xl shadow-lg border ${themeClasses.border} lg:col-span-2`}
          >
            <h3 className={`text-lg font-bold ${themeClasses.text} mb-4`}>Gastos por Cartão</h3>
            <Chart
              options={{
                ...chartOptions,
                xaxis: {
                  ...chartOptions.xaxis,
                  categories: chartData.bar.categories
                },
                plotOptions: {
                  bar: {
                    borderRadius: 8,
                    horizontal: false
                  }
                }
              }}
              series={chartData.bar.series}
              type="bar"
              height={300}
            />
          </motion.div>
        </div>

        {/* Modal do Formulário */}
        <AnimatePresence>
          {analyticsForm.open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`${themeClasses.cardBg} rounded-3xl shadow-2xl w-full max-w-md p-6`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-xl font-bold ${themeClasses.text}`}>Nova Análise</h2>
                  <button 
                    onClick={() => setAnalyticsForm({ ...analyticsForm, open: false })}
                    className={`p-2 rounded-lg ${themeClasses.hover}`}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Período
                    </label>
                    <select 
                      value={analyticsForm.data.periodo}
                      onChange={(e) => setAnalyticsForm({
                        ...analyticsForm,
                        data: { ...analyticsForm.data, periodo: e.target.value }
                      })}
                      className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                    >
                      <option value="mensal">Mensal</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Categoria
                    </label>
                    <select 
                      value={analyticsForm.data.categoria}
                      onChange={(e) => setAnalyticsForm({
                        ...analyticsForm,
                        data: { ...analyticsForm.data, categoria: e.target.value }
                      })}
                      className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="pontos">Acúmulo de Pontos</option>
                      <option value="gastos">Análise de Gastos</option>
                      <option value="cashback">Cashback</option>
                      <option value="beneficios">Benefícios</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      value={analyticsForm.data.valor}
                      onChange={(e) => setAnalyticsForm({
                        ...analyticsForm,
                        data: { ...analyticsForm.data, valor: e.target.value }
                      })}
                      className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}
                      placeholder="Digite o valor"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
                      Descrição
                    </label>
                    <textarea
                      value={analyticsForm.data.descricao}
                      onChange={(e) => setAnalyticsForm({
                        ...analyticsForm,
                        data: { ...analyticsForm.data, descricao: e.target.value }
                      })}
                      className={`w-full p-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} h-24 resize-none`}
                      placeholder="Descreva sua análise..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setAnalyticsForm({ ...analyticsForm, open: false })}
                      className={`flex-1 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.text} font-medium`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Salvar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Renderização do conteúdo baseado na aba ativa
  const renderContent = () => {
    switch (activeTab) {
      case 'cards':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>Meus Cartões</h2>
                <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>Gerencie seus cartões de crédito</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${themeClasses.cardBg} border ${themeClasses.border} ${themeClasses.text} font-medium hover:shadow-lg transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20`}
              >
                <Plus size={18} className="text-blue-600" />
                Novo Cartão
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creditCards.map((card) => (
                <ModernCreditCard key={card.id} card={card} />
              ))}
            </div>
          </div>
        );
      
      case 'programs':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>Programas de Milhas</h2>
                <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>Gerencie seus programas de fidelidade</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${themeClasses.cardBg} border ${themeClasses.border} ${themeClasses.text} font-medium hover:shadow-lg transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20`}
              >
                <Plus size={18} className="text-blue-600" />
                Novo Programa
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mileagePrograms.map((program) => (
                <ModernMileageProgram key={program.id} program={program} />
              ))}
            </div>
          </div>
        );
      
      case 'invoices':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>Faturas dos Cartões</h2>
                <p className={`text-sm ${themeClasses.textSecondary} mt-1`}>Acompanhe suas faturas e vencimentos</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl ${themeClasses.cardBg} border ${themeClasses.border} ${themeClasses.text} font-medium hover:shadow-lg transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20`}
              >
                <Plus size={18} className="text-blue-600" />
                Nova Fatura
              </button>
            </div>
            <ModernInvoicesList />
          </div>
        );
      
      case 'analytics':
        return <AnalyticsDashboard />;
      
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      <ModernHeader />
      
      <div className="px-6 pb-20 relative">
        <ModernNavigation />
        
        {/* Search and Filters */}
        {activeTab !== 'dashboard' && (
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary}`} size={20} />
              <input
                type="text"
                placeholder={`Buscar ${activeTab === 'cards' ? 'cartões' : activeTab === 'programs' ? 'programas' : 'faturas'}...`}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text} placeholder-gray-400`}
              />
            </div>
            <button className={`px-4 py-3 rounded-xl border ${themeClasses.border} ${themeClasses.cardBg} ${themeClasses.text}`}>
              <Filter size={20} />
            </button>
          </div>
        )}
        
        {renderContent()}
      </div>

      {/* Modal de Adicionar */}
      <AddModal />
      
      {/* Modal de Edição */}
      <EditModal />
      
      {/* Modal de Exclusão */}
      <DeleteModal />
      
      {/* Modal de Pagamento */}
      <PaymentModal />
    </div>
  );
};

export default MilhasRedesign;