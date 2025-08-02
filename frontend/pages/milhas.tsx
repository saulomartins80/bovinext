import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Plus, 
  ChevronDown, ChevronUp, ChevronRight, ChevronLeft, X, Edit3, Trash2,
  Search, CheckCircle,
  CreditCard as CreditCardIcon, Banknote, Wallet, Award,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import { useAddItemCallback } from '../src/hooks/useAddItemCallback';
import Image from 'next/image';

// Tipos avançados
interface CreditCard {
  id: string;
  name: string;
  bank: string;
  program: string;
  limit: number;
  dueDate: number;
  closingDate: number;
  pointsPerReal: number;
  annualFee: number;
  benefits: string[];
  status: 'active' | 'inactive';
  lastFourDigits: string;
  color: string;
  icon: string;
  bankIconUrl?: string;
  invoiceAmount?: number;
  invoiceDueDate?: string;
  invoiceStatus?: 'paid' | 'pending' | 'overdue';
  category: 'premium' | 'standard' | 'basic';
}

interface MileageProgram {
  id: string;
  name: string;
  airline: string;
  pointsBalance: number;
  estimatedValue: number;
  conversionRate: number;
  status: 'active' | 'inactive';
  icon: string;
  programIconUrl?: string;
  bestUse: string;
  expirationPolicy: string;
}

interface Invoice {
  id: string;
  cardId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
}

// Banco de dados de bancos e corretoras
const BANK_DATABASE = {
  'Itaú': { 
    colors: ['#00A1E0', '#003366'], 
    icon: '🏦',
    categories: {
      'Personnalité': { icon: '👑', category: 'premium' },
      'Uniclass': { icon: '💎', category: 'standard' }
    }
  },
  'Nubank': { 
    colors: ['#6A1B9A', '#9C27B0'], 
    icon: '💜',
    categories: {
      'Ultravioleta': { icon: '🔮', category: 'premium' },
      'Mastercard': { icon: '💳', category: 'standard' }
    }
  },
  'Santander': { 
    colors: ['#EC0000', '#CC0000'], 
    icon: '🔴',
    categories: {
      'Título': { icon: '🏆', category: 'premium' },
      'Free': { icon: '🆓', category: 'basic' }
    }
  },
  'Bradesco': { 
    colors: ['#CC092F', '#A60729'], 
    icon: '🏛️',
    categories: {
      'Elite': { icon: '🌟', category: 'premium' },
      'Gold': { icon: '🥇', category: 'standard' }
    }
  },
  'Inter': { 
    colors: ['#FF7A00', '#FF5C00'], 
    icon: '🟠',
    categories: {
      'Black': { icon: '⚫', category: 'premium' },
      'Celular': { icon: '📱', category: 'basic' }
    }
  }
};

// Banco de dados de programas de milhas
const PROGRAM_DATABASE = {
  'Smiles': { 
    airline: 'Gol', 
    icon: '✈️', 
    bestUse: 'Voos nacionais',
    colors: ['#00A1E0', '#003366']
  },
  'TudoAzul': { 
    airline: 'Azul', 
    icon: '🔵', 
    bestUse: 'Voos internacionais',
    colors: ['#00B2FF', '#0066CC']
  },
  'Latam Pass': { 
    airline: 'Latam', 
    icon: '🔴', 
    bestUse: 'Voos internacionais',
    colors: ['#ED1C24', '#A5000B']
  },
  'Multiplus': { 
    airline: 'TAM', 
    icon: '🔶', 
    bestUse: 'Voos nacionais',
    colors: ['#FF6B00', '#CC5600']
  },
  'Livelo': { 
    airline: 'Diversos', 
    icon: '🟢', 
    bestUse: 'Compras em geral',
    colors: ['#00AA5B', '#008748']
  }
};



// Componente BankIcon
const BankIcon = ({ url, name, className }: { url?: string; name: string; className?: string }) => {
  if (url) {
    return <Image src={url} alt={name} className={className} width={40} height={40} />;
  }
  
  // Fallback para ícones baseados no nome do banco
  const getBankIcon = (bankName: string) => {
    const bankIcons: { [key: string]: string } = {
      'Itaú': '🏦',
      'Nubank': '💜',
      'Santander': '🔴',
      'Bradesco': '🏛️',
      'Inter': '🟠',
      'Smiles': '✈️',
      'TudoAzul': '🔵',
      'Latam Pass': '🔴',
      'Multiplus': '🔶',
      'Livelo': '🟢'
    };
    return bankIcons[bankName] || '💳';
  };

  return (
    <div className={`${className} flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-lg`}>
      {getBankIcon(name)}
    </div>
  );
};

// Componente MobileCardsList (para a aba "Ver Todos" dos cartões)
const MobileCardsList = ({ 
  creditCards, 
  cardBg, 
  borderColor, 
  setShowAddModal, 
  setActiveTab,
  PROGRAM_DATABASE
}: {
  creditCards: CreditCard[];
  cardBg: string;
  borderColor: string;
  setShowAddModal: (_value: boolean) => void;
  setActiveTab: (_value: string) => void;
  PROGRAM_DATABASE: Record<string, {
    airline: string;
    icon: string;
    bestUse: string;
    colors: string[];
  }>;
}) => {
  const detectProgramInfo = (programName: string) => {
    const programInfo = PROGRAM_DATABASE[programName as keyof typeof PROGRAM_DATABASE] || {
      icon: '✈️',
      colors: ['#3B82F6', '#2563EB'],
      airline: 'Desconhecida',
      bestUse: 'Diversos'
    };
    return programInfo;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Cabeçalho com botão voltar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Meus Cartões</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {creditCards.length} cartões cadastrados
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="p-2 bg-blue-600 text-white rounded-full"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Lista de cartões */}
      <div className="space-y-3">
        {creditCards.map(card => {
          const programInfo = detectProgramInfo(card.program);
          
          return (
            <div 
              key={card.id} 
              className={`rounded-lg ${cardBg} shadow-sm overflow-hidden border ${borderColor} cursor-pointer`}
              onClick={() => {
                // Aqui você pode adicionar a lógica para abrir modal de edição
                // Por enquanto vou simular abrindo o modal de adição
                setShowAddModal(true);
              }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="p-2 rounded-lg text-xl"
                    style={{ backgroundColor: `${card.color}20`, color: card.color }}
                  >
                    {card.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{card.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {card.bank} • Final {card.lastFourDigits}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R$ {card.limit.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Limite</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{programInfo.icon}</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Programa</p>
                      <p>{card.program}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pontos/R$</p>
                    <p>{card.pointsPerReal} pts</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fechamento</p>
                    <p>Dia {card.closingDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Vencimento</p>
                    <p>Dia {card.dueDate}</p>
                  </div>
                </div>

                {card.invoiceAmount && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fatura Atual</p>
                        <p className="font-medium">
                          R$ {card.invoiceAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        card.invoiceStatus === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        card.invoiceStatus === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {card.invoiceStatus === 'paid' ? 'Paga' : 
                         card.invoiceStatus === 'overdue' ? 'Atrasada' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddModal(true);
                      }}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Editar Cartão
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Aqui você pode adicionar lógica para ver faturas
                        setActiveTab('invoices');
                      }}
                      className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
                    >
                      Ver Faturas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente MobileCardDetail (para visualização individual do cartão)
const MobileCardDetail = ({ 
  card, 
  cardBg, 
  borderColor, 
  setActiveTab,
  setSelectedInvoice,
  setShowInvoiceModal,
  invoices
}: {
  card: CreditCard;
  cardBg: string;
  borderColor: string;
  setActiveTab: (_value: string) => void;
  setSelectedInvoice: (_invoice: Invoice | null) => void;
  setShowInvoiceModal: (_value: boolean) => void;
  invoices: Invoice[];
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Cabeçalho com botão de voltar */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('overview')}>
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Detalhes do Cartão</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {card.bank} • Final {card.lastFourDigits}
          </p>
        </div>
      </div>

      {/* Card principal */}
      <div className={`rounded-xl ${cardBg} p-5 mb-6 shadow-sm border ${borderColor}`}>
        <div className="flex items-center gap-3 mb-4">
          <BankIcon 
            url={card.bankIconUrl} 
            name={card.name} 
            className="w-14 h-14 rounded-lg"
          />
          <div>
            <h2 className="font-bold">{card.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Programa: {card.program}
            </p>
          </div>
        </div>

        {/* Informações principais */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Limite total</p>
            <p className="font-medium">R$ {card.limit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pontos por R$</p>
            <p className="font-medium">{card.pointsPerReal} pts</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fechamento</p>
            <p className="font-medium">Dia {card.closingDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Vencimento</p>
            <p className="font-medium">Dia {card.dueDate}</p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Utilizado: R$ {card.invoiceAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span>Disponível: R$ {(card.limit - (card.invoiceAmount || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${Math.min(100, ((card.invoiceAmount || 0) / card.limit) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Fatura atual */}
        <div className={`p-3 rounded-lg mb-4 ${
          card.invoiceStatus === 'paid' ? 'bg-green-100 dark:bg-green-900' :
          card.invoiceStatus === 'overdue' ? 'bg-red-100 dark:bg-red-900' :
          'bg-yellow-100 dark:bg-yellow-900'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fatura atual</p>
              <p className="font-medium">R$ {card.invoiceAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="text-xs">
                Vence em {new Date(card.invoiceDueDate || '').toLocaleDateString('pt-BR')}
              </p>
            </div>
            <button 
              onClick={() => {
                const invoice = invoices.find(i => i.cardId === card.id);
                if (invoice) {
                  setSelectedInvoice(invoice);
                  setShowInvoiceModal(true);
                }
              }}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                card.invoiceStatus === 'paid' ? 'bg-green-600 text-white' :
                card.invoiceStatus === 'overdue' ? 'bg-red-600 text-white' :
                'bg-blue-600 text-white'
              }`}
            >
              {card.invoiceStatus === 'paid' ? 'Paga' : 'Pagar'}
            </button>
          </div>
        </div>
      </div>

      {/* Benefícios */}
      <div className={`rounded-xl ${cardBg} p-5 mb-6 shadow-sm border ${borderColor}`}>
        <h3 className="font-bold mb-3">Benefícios</h3>
        <ul className="space-y-2">
          {card.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium">
          Editar Cartão
        </button>
        <button className="flex-1 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg font-medium">
          Bloquear Cartão
        </button>
      </div>
    </div>
  );
};

// Atualização do componente principal para mobile
const MilhasMobileView = ({ 
  creditCards, 
  mileagePrograms, 
  invoices, 
  cardBg, 
  borderColor, 
  activeTab, 
  setActiveTab, 
  setShowAddModal, 
  setSelectedCard, 
  selectedCard,
  setSelectedInvoice,
  setShowInvoiceModal,
  PROGRAM_DATABASE
}: {
  creditCards: CreditCard[];
  mileagePrograms: MileageProgram[];
  invoices: Invoice[];
  cardBg: string;
  borderColor: string;
  activeTab: string;
  setActiveTab: (_value: string) => void;
  setShowAddModal: (_value: boolean) => void;
  setSelectedCard: (_card: CreditCard | null) => void;
  selectedCard: CreditCard | null;
  setSelectedInvoice: (_invoice: Invoice | null) => void;
  setShowInvoiceModal: (_value: boolean) => void;
  PROGRAM_DATABASE: Record<string, {
    airline: string;
    icon: string;
    bestUse: string;
    colors: string[];
  }>;
  // onAddItem?: () => void; // Removido - não usado
}) => {
  if (selectedCard) {
    return (
      <MobileCardDetail 
        card={selectedCard} 
        cardBg={cardBg} 
        borderColor={borderColor} 
        setActiveTab={setActiveTab}
        setSelectedInvoice={setSelectedInvoice}
        setShowInvoiceModal={setShowInvoiceModal}
        invoices={invoices}
      />
    );
  }

  if (activeTab === 'cards') {
    return (
      <MobileCardsList 
        creditCards={creditCards} 
        cardBg={cardBg} 
        borderColor={borderColor} 
        setShowAddModal={setShowAddModal} 
        setActiveTab={setActiveTab}
        PROGRAM_DATABASE={PROGRAM_DATABASE}
      />
    );
  }

  if (activeTab === 'programs') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        {/* Cabeçalho com botão voltar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('overview')}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Programas de Milhas</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mileagePrograms.length} programas cadastrados
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-blue-600 text-white rounded-full"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Lista de programas */}
        <div className="space-y-3">
          {mileagePrograms.map(program => (
            <div 
              key={program.id} 
              className={`rounded-lg ${cardBg} shadow-sm overflow-hidden border ${borderColor} cursor-pointer`}
              onClick={() => {
                // Aqui você pode adicionar a lógica para abrir modal de edição
                // Por enquanto vou simular abrindo o modal de adição
                setShowAddModal(true);
              }}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <BankIcon 
                    url={program.programIconUrl} 
                    name={program.name} 
                    className="w-12 h-12 rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{program.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {program.airline}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{program.pointsBalance.toLocaleString()} pts</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">R$ {program.estimatedValue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Taxa de conversão</p>
                    <p>{program.conversionRate} pts/R$</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Melhor uso</p>
                    <p>{program.bestUse}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddModal(true);
                      }}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Editar Programa
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Aqui você pode adicionar lógica para transferir pontos
                      }}
                      className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
                    >
                      Transferir Pontos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === 'invoices') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        {/* Cabeçalho com botão voltar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('overview')}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Faturas</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {invoices.length} faturas encontradas
              </p>
            </div>
          </div>
        </div>

        {/* Lista de faturas */}
        <div className="space-y-3">
          {invoices.map(invoice => {
            const card = creditCards.find(c => c.id === invoice.cardId);
            const dueDate = new Date(invoice.dueDate);
            const today = new Date();
            const isOverdue = dueDate < today && invoice.status !== 'paid';
            
            return (
              <div key={invoice.id} className={`rounded-lg ${cardBg} shadow-sm overflow-hidden border ${borderColor}`}>
                <div className="p-4 flex items-center gap-3">
                  {card && (
                    <BankIcon 
                      url={card.bankIconUrl} 
                      name={card.bank} 
                      className="w-12 h-12 rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{card?.name || 'Cartão desconhecido'}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Vence em {dueDate.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {invoice.status === 'paid' ? 'Paga' : isOverdue ? 'Atrasada' : 'Pendente'}
                    </span>
                  </div>
                </div>
                <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2 pt-3">
                    <button 
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowInvoiceModal(true);
                      }}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      {invoice.status === 'paid' ? 'Detalhes' : 'Pagar Fatura'}
                    </button>
                    <button className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm">
                      Comprovante
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Retorna a visão padrão (Overview) para mobile
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cabeçalho */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Meus Cartões e Milhas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gerencie suas faturas e programas
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-blue-600 text-white rounded-full"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          {['overview', 'cards', 'programs', 'invoices'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
            >
              {tab === 'overview' ? 'Visão' : 
               tab === 'cards' ? 'Cartões' :
               tab === 'programs' ? 'Programas' : 'Faturas'}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo da visão geral */}
      <div className="px-4 space-y-4">
        {/* Seção de Cartões */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium">Meus Cartões</h2>
            <button 
              onClick={() => setActiveTab('cards')}
              className="text-sm text-blue-600 flex items-center gap-1"
            >
              Ver todos <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            {creditCards.slice(0, 2).map(card => (
              <div 
                key={card.id} 
                className={`rounded-lg ${cardBg} p-4 shadow-sm border ${borderColor}`}
                onClick={() => setSelectedCard(card)}
              >
                <div className="flex items-center gap-3">
                  <BankIcon 
                    url={card.bankIconUrl} 
                    name={card.bank} 
                    className="w-10 h-10 rounded-lg"
                  />
                  <div>
                    <h3 className="font-medium">{card.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Final {card.lastFourDigits}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Limite</p>
                    <p>R$ {card.limit.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fatura</p>
                    <p>R$ {card.invoiceAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Faturas */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium">Próximas Faturas</h2>
            <button 
              onClick={() => setActiveTab('invoices')}
              className="text-sm text-blue-600 flex items-center gap-1"
            >
              Ver todas <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="space-y-2">
            {invoices.slice(0, 2).map(invoice => {
              const card = creditCards.find(c => c.id === invoice.cardId);
              return (
                <div 
                  key={invoice.id} 
                  className={`rounded-lg ${cardBg} p-3 shadow-sm border ${borderColor}`}
                >
                  <div className="flex items-center gap-3">
                    {card && (
                      <BankIcon 
                        url={card.bankIconUrl} 
                        name={card.bank} 
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{card?.name || 'Cartão desconhecido'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Vence em {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {invoice.status === 'paid' ? 'Paga' : 'Pendente'}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="font-bold">
                      R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
                      Pagar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seção de Programas */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium">Programas de Milhas</h2>
            <button 
              onClick={() => setActiveTab('programs')}
              className="text-sm text-blue-600 flex items-center gap-1"
            >
              Ver todos <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            {mileagePrograms.slice(0, 2).map(program => (
              <div 
                key={program.id} 
                className={`rounded-lg ${cardBg} p-4 shadow-sm border ${borderColor}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <BankIcon 
                    url={program.programIconUrl} 
                    name={program.name} 
                    className="w-10 h-10 rounded-lg"
                  />
                  <div>
                    <h3 className="font-medium">{program.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {program.airline}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pontos</p>
                    <p>{program.pointsBalance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Valor</p>
                    <p>R$ {program.estimatedValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const MilhasPage = () => {
  const { user, isAuthReady } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  type NewCardOrProgram = Partial<CreditCard> & Partial<MileageProgram>;
  const [newCard, setNewCard] = useState<NewCardOrProgram>({
    status: 'active',
    category: 'standard'
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  // Verificar tamanho da tela
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hook para gerenciar o callback de adição
  useAddItemCallback({
    onAddItem: () => openForm(),
    isMobileView: isMobile
  });
  // Função para resetar o formulário
  const resetForm = () => {
    setNewCard({
      status: 'active',
      category: 'standard'
    });
    setSelectedCard(null);
  };

  // Função para abrir formulário baseado na aba ativa
  const openForm = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Função para fechar formulário
  const closeForm = () => {
    setShowAddModal(false);
    resetForm();
  };


  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthReady && user) {
      // Simular carregamento de dados
      const mockCards: CreditCard[] = [
        {
          id: '1',
          name: 'Itaú Personnalité Visa Infinite',
          bank: 'Itaú',
          program: 'Smiles',
          limit: 15000,
          dueDate: 15,
          closingDate: 30,
          pointsPerReal: 2.5,
          annualFee: 1295,
          benefits: ['Sala VIP', 'Seguro viagem', 'Bônus de boas-vindas'],
          status: 'active',
          lastFourDigits: '4539',
          color: '#00A1E0',
          icon: '👑',
          category: 'premium',
          invoiceAmount: 2450.75,
          invoiceDueDate: '2023-06-15',
          invoiceStatus: 'pending'
        },
        {
          id: '2',
          name: 'Nubank Ultravioleta',
          bank: 'Nubank',
          program: 'TudoAzul',
          limit: 8000,
          dueDate: 20,
          closingDate: 5,
          pointsPerReal: 1.8,
          annualFee: 0,
          benefits: ['Sem anuidade', 'Cashback', 'Cartão virtual'],
          status: 'active',
          lastFourDigits: '1234',
          color: '#6A1B9A',
          icon: '🔮',
          category: 'premium',
          invoiceAmount: 1850.50,
          invoiceDueDate: '2023-06-20',
          invoiceStatus: 'pending'
        }
      ];

      const mockPrograms: MileageProgram[] = [
        {
          id: '1',
          name: 'Smiles',
          airline: 'Gol',
          pointsBalance: 45000,
          estimatedValue: 1125,
          conversionRate: 1.4,
          status: 'active',
          icon: '✈️',
          bestUse: 'Voos nacionais',
          expirationPolicy: '36 meses sem movimentação'
        },
        {
          id: '2',
          name: 'TudoAzul',
          airline: 'Azul',
          pointsBalance: 32000,
          estimatedValue: 800,
          conversionRate: 1.2,
          status: 'active',
          icon: '🔵',
          bestUse: 'Voos internacionais',
          expirationPolicy: '24 meses sem movimentação'
        }
      ];

      const mockInvoices: Invoice[] = [
        {
          id: '1',
          cardId: '1',
          amount: 2450.75,
          dueDate: '2023-06-15',
          status: 'pending'
        },
        {
          id: '2',
          cardId: '2',
          amount: 1850.50,
          dueDate: '2023-06-20',
          status: 'pending'
        }
      ];

      setCreditCards(mockCards);
      setMileagePrograms(mockPrograms);
      setInvoices(mockInvoices);
    }
  }, [isAuthReady, user]);

  // Estados
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [mileagePrograms, setMileagePrograms] = useState<MileageProgram[]>([]);

  // Verificação de autenticação
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">Acesso Negado</h1>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Estilos dinâmicos
  const bgColor = resolvedTheme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const cardBg = resolvedTheme === "dark" ? "bg-gray-800" : "bg-white";
  const textColor = resolvedTheme === "dark" ? "text-gray-100" : "text-gray-900";
  const borderColor = resolvedTheme === "dark" ? "border-gray-700" : "border-gray-200";
  const activeTabStyle = "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400";
  const inactiveTabStyle = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300";

  // Componente de cabeçalho
  const Header = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${resolvedTheme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} text-white`}>
          <Wallet size={isMobile ? 20 : 24} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Meus Cartões e Milhas</h1>
          <p className="text-sm opacity-70">Gerencie suas faturas e programas de recompensas</p>
        </div>
      </div>
    </div>
  );

  // Componente de abas
  const Tabs = () => (
    <div className={`flex border-b ${borderColor} mb-6 overflow-x-auto`}>
      <button
        onClick={() => setActiveTab('overview')}
        className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'overview' ? activeTabStyle : inactiveTabStyle} border-b-2 ${activeTab === 'overview' ? 'border-blue-600 dark:border-blue-400' : 'border-transparent'}`}
      >
        <BarChart3 size={16} />
        {isMobile ? 'Visão' : 'Visão Geral'}
      </button>
      <button
        onClick={() => setActiveTab('cards')}
        className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'cards' ? activeTabStyle : inactiveTabStyle} border-b-2 ${activeTab === 'cards' ? 'border-blue-600 dark:border-blue-400' : 'border-transparent'}`}
      >
        <CreditCardIcon size={16} />
        Cartões
      </button>
      <button
        onClick={() => setActiveTab('programs')}
        className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'programs' ? activeTabStyle : inactiveTabStyle} border-b-2 ${activeTab === 'programs' ? 'border-blue-600 dark:border-blue-400' : 'border-transparent'}`}
      >
        <Award size={16} />
        Programas
      </button>
      <button
        onClick={() => setActiveTab('invoices')}
        className={`px-4 py-3 font-medium text-sm flex items-center gap-2 ${activeTab === 'invoices' ? activeTabStyle : inactiveTabStyle} border-b-2 ${activeTab === 'invoices' ? 'border-blue-600 dark:border-blue-400' : 'border-transparent'}`}
      >
        <Banknote size={16} />
        Faturas
      </button>
    </div>
  );

  // Componente de busca
  const SearchBar = () => (
    <div className="flex flex-col md:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="text-gray-400" size={16} />
        </div>
        <input
          type="text"
          placeholder={isMobile ? "Buscar..." : `Buscar ${activeTab === 'cards' ? 'cartões' : activeTab === 'programs' ? 'programas' : 'faturas'}...`}
          className={`block w-full pl-10 pr-3 py-2 border ${borderColor} rounded-lg ${cardBg} text-sm`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {!isMobile && (
        <select className={`p-2 border ${borderColor} rounded-lg ${cardBg} text-sm`}>
          <option>Todos</option>
          <option>Ativos</option>
          <option>Inativos</option>
          {activeTab === 'invoices' && (
            <>
              <option>Pagas</option>
              <option>Pendentes</option>
              <option>Atrasadas</option>
            </>
          )}
        </select>
      )}
    </div>
  );

  // Detectar banco e definir cores/ícones
  const detectBankInfo = (bankName: string, cardName: string) => {
    const bankInfo = BANK_DATABASE[bankName as keyof typeof BANK_DATABASE] || {
      colors: ['#3B82F6', '#2563EB'],
      icon: '💳',
      categories: {}
    };

    // Encontrar categoria correspondente
    let categoryInfo: { icon: string; category: CreditCard['category'] } = { icon: '💳', category: 'standard' };
    for (const [key, value] of Object.entries(bankInfo.categories)) {
      if (cardName.includes(key)) {
        categoryInfo = value as { icon: string; category: CreditCard['category'] };
        break;
      }
    }

    return {
      colors: bankInfo.colors,
      icon: categoryInfo.icon,
      category: categoryInfo.category
    };
  };

  // Detectar programa e definir ícone
  const detectProgramInfo = (programName: string) => {
    const programInfo = PROGRAM_DATABASE[programName as keyof typeof PROGRAM_DATABASE] || {
      icon: '✈️',
      colors: ['#3B82F6', '#2563EB'],
      airline: 'Desconhecida',
      bestUse: 'Diversos'
    };

    return programInfo;
  };

  // Atualizar informações do cartão ao selecionar banco
  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bankName = e.target.value;
    const cardName = newCard.name || '';
    
    if (bankName) {
      const { colors, icon, category } = detectBankInfo(bankName, cardName);
      setNewCard({
        ...newCard,
        bank: bankName,
        color: colors[0],
        icon,
        category
      });
    }
  };

  // Atualizar informações do programa
  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const programName = e.target.value;
    if (programName) {
      const programInfo = detectProgramInfo(programName);
      setNewCard({
        ...newCard,
        program: programName,
        ...(programName && { color: programInfo.colors[0] })
      });
    }
  };

  // Componente de cartão de crédito
  const CreditCardItem = ({ card }: { card: CreditCard }) => {
    const programInfo = detectProgramInfo(card.program);
    
    return (
      <div className={`rounded-lg ${cardBg} shadow-sm overflow-hidden border ${borderColor} mb-4`}>
        <div 
          className={`p-4 flex justify-between items-center cursor-pointer ${isMobile ? '' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          onClick={() => isMobile && setExpandedCard(expandedCard === card.id ? null : card.id)}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg text-xl"
              style={{ backgroundColor: `${card.color}20`, color: card.color }}
            >
              {card.icon}
            </div>
            <div>
              <h3 className="font-medium">{card.name}</h3>
              <p className="text-xs opacity-70">{card.bank} • Final {card.lastFourDigits}</p>
            </div>
          </div>
          {isMobile ? (
            expandedCard === card.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />
          ) : (
            <div className="flex gap-2">
              <button className="p-1 text-blue-600 dark:text-blue-400">
                <Edit3 size={16} />
              </button>
              <button className="p-1 text-red-600 dark:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {(isMobile && expandedCard === card.id) || !isMobile ? (
          <motion.div
            initial={isMobile ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }}
            animate={isMobile ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={isMobile ? { height: 0, opacity: 0 } : { height: 'auto', opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={`${isMobile ? 'overflow-hidden' : ''}`}
          >
            <div className={`px-4 pb-4 pt-0 border-t ${borderColor}`}>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <p className="text-xs opacity-70">Programa</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{programInfo.icon}</span>
                    <span>{card.program}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs opacity-70">Pontos/R$</p>
                  <p>{card.pointsPerReal} pts</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Limite</p>
                  <p>R$ {card.limit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Anuidade</p>
                  <p>R$ {card.annualFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Fechamento</p>
                  <p>Dia {card.closingDate}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Vencimento</p>
                  <p>Dia {card.dueDate}</p>
                </div>
              </div>
              
              {card.invoiceStatus && (
                <div className={`p-3 rounded-lg mb-3 ${
                  card.invoiceStatus === 'paid' ? 'bg-green-100 dark:bg-green-900' :
                  card.invoiceStatus === 'overdue' ? 'bg-red-100 dark:bg-red-900' :
                  'bg-yellow-100 dark:bg-yellow-900'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs opacity-70">Fatura atual</p>
                      <p className="font-medium">R$ {card.invoiceAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs">Vence em {new Date(card.invoiceDueDate || '').toLocaleDateString('pt-BR')}</p>
                    </div>
                    <button 
                      onClick={() => {
                        const invoice = invoices.find(i => i.cardId === card.id);
                        if (invoice) {
                          setSelectedInvoice(invoice);
                          setShowInvoiceModal(true);
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        card.invoiceStatus === 'paid' ? 'bg-green-600 text-white' :
                        card.invoiceStatus === 'overdue' ? 'bg-red-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}
                    >
                      {card.invoiceStatus === 'paid' ? 'Paga' : 'Pagar'}
                    </button>
                  </div>
                </div>
              )}
              
              {!isMobile && (
                <div className="mb-3">
                  <p className="text-xs opacity-70">Benefícios</p>
                  <ul className="list-disc list-inside pl-2">
                    {card.benefits.slice(0, 3).map((benefit, i) => (
                      <li key={i} className="text-sm">{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {isMobile && (
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm">
                    Editar
                  </button>
                  <button className="flex-1 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </div>
    );
  };

  // Componente de programa de milhas
  const ProgramItem = ({ program }: { program: MileageProgram }) => {
    const programInfo = detectProgramInfo(program.name);
    
    const handleResgatar = () => {
      // Aqui você pode implementar a lógica de resgate
      // Por enquanto vou simular um resgate
      toast.info(`Resgate de pontos do programa ${program.name} em desenvolvimento!`);
    };

    const handleEditar = () => {
      // Abrir modal de edição do programa
      // setSelectedProgram(program); // Removido - função não definida
      setShowAddModal(true);
    };
    
    return (
      <div className={`rounded-lg ${cardBg} shadow-sm overflow-hidden border ${borderColor} mb-4`}>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg text-xl" style={{ backgroundColor: `${programInfo.colors[0]}20`, color: programInfo.colors[0] }}>
              {programInfo.icon}
            </div>
            <div>
              <h3 className="font-medium">{program.name}</h3>
              <p className="text-xs opacity-70">{program.airline}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{program.pointsBalance.toLocaleString()} pts</p>
            <p className="text-xs opacity-70">R$ {program.estimatedValue.toLocaleString()}</p>
          </div>
        </div>
        {!isMobile && (
          <div className="px-4 pb-4 pt-0 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs opacity-70">Melhor uso</p>
                <p>{program.bestUse}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">Taxa de conversão</p>
                <p>{program.conversionRate} pts/R$</p>
              </div>
              <div>
                <p className="text-xs opacity-70">Expiração</p>
                <p>{program.expirationPolicy}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button 
                onClick={handleResgatar}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Resgatar
              </button>
              <button 
                onClick={handleEditar}
                className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              >
                <Edit3 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Componente de fatura
  const InvoiceItem = ({ invoice }: { invoice: Invoice }) => {
    const card = creditCards.find(c => c.id === invoice.cardId);
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    const isOverdue = dueDate < today && invoice.status !== 'paid';
    
    const handleComprovante = () => {
      generateInvoicePDF(invoice, card);
    };
    
    return (
      <div className={`rounded-lg ${cardBg} shadow-sm overflow-hidden border ${borderColor} mb-3`}>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {card && (
              <div 
                className="p-2 rounded-lg text-xl"
                style={{ backgroundColor: `${card.color}20`, color: card.color }}
              >
                {card.icon}
              </div>
            )}
            <div>
              <h3 className="font-medium">
                {card?.name || 'Cartão não encontrado'}
              </h3>
              <p className="text-xs opacity-70">
                Vence em {dueDate.toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">
              R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {invoice.status === 'paid' ? 'Paga' : isOverdue ? 'Atrasada' : 'Pendente'}
            </span>
          </div>
        </div>
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setSelectedInvoice(invoice);
                setShowInvoiceModal(true);
              }}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              {invoice.status === 'paid' ? 'Detalhes' : 'Pagar Fatura'}
            </button>
            <button 
              onClick={handleComprovante}
              className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm"
            >
              Comprovante
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Visão geral para desktop aprimorada
  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Seção de Cartões */}
      <div className="milhas-desktop-card">
        <div className="milhas-desktop-card-header">
          <h3 className="milhas-desktop-card-title">Meus Cartões</h3>
          <button 
            onClick={() => setActiveTab('cards')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
          >
            Ver todos <ChevronRight size={16} />
          </button>
        </div>
        <div className="milhas-desktop-card-content">
          <div className="milhas-card-grid">
            {creditCards.slice(0, 2).map(card => (
              <div key={card.id} className={`rounded-lg border ${borderColor} p-5 milhas-card-hover`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <BankIcon url={card.bankIconUrl} name={card.bank} className="w-10 h-10 rounded-lg" />
                      <div>
                        <h4 className="font-medium milhas-text-primary">{card.name}</h4>
                        <p className="text-xs milhas-text-secondary">Final {card.lastFourDigits}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3">
                      <div>
                        <p className="text-xs milhas-text-secondary">Limite</p>
                        <p className="font-medium milhas-text-primary">R$ {card.limit.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs milhas-text-secondary">Fechamento</p>
                        <p className="font-medium milhas-text-primary">Dia {card.closingDate}</p>
                      </div>
                      <div>
                        <p className="text-xs milhas-text-secondary">Vencimento</p>
                        <p className="font-medium milhas-text-primary">Dia {card.dueDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className={`p-2 rounded-lg ${card.invoiceStatus === 'overdue' ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                    <CreditCardIcon 
                      className={card.invoiceStatus === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'} 
                      size={20} 
                    />
                  </div>
                </div>
                
                {/* Barra de progresso do limite */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs milhas-text-secondary mb-1">
                    <span>Utilizado: R$ {card.invoiceAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span>Disponível: R$ {(card.limit - (card.invoiceAmount || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="milhas-progress-bar">
                    <div 
                      className="milhas-progress-fill" 
                      style={{ width: `${Math.min(100, ((card.invoiceAmount || 0) / card.limit) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Botão de ação */}
                <button 
                  onClick={() => {
                    const invoice = invoices.find(i => i.cardId === card.id);
                    if (invoice) {
                      setSelectedInvoice(invoice);
                      setShowInvoiceModal(true);
                    }
                  }}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    card.invoiceStatus === 'overdue' ? 'milhas-button-danger' : 'milhas-button-primary'
                  }`}
                >
                  {card.invoiceStatus === 'overdue' ? 'Fatura Atrasada - Pagar Agora' : 'Ver Fatura'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seção de Faturas */}
      <div className="milhas-desktop-card">
        <div className="milhas-desktop-card-header">
          <h3 className="milhas-desktop-card-title">Próximas Faturas</h3>
          <button 
            onClick={() => setActiveTab('invoices')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
          >
            Ver todas <ChevronRight size={16} />
          </button>
        </div>
        <div className="milhas-desktop-card-content">
          <div className="milhas-table-responsive">
            <table className="milhas-invoice-table">
              <thead className="milhas-invoice-table-header">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium milhas-text-secondary uppercase tracking-wider">
                    Cartão
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium milhas-text-secondary uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium milhas-text-secondary uppercase tracking-wider">
                    Valor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium milhas-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium milhas-text-secondary uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.slice(0, 3).map(invoice => {
                  const card = creditCards.find(c => c.id === invoice.cardId);
                  const dueDate = new Date(invoice.dueDate);
                  const today = new Date();
                  const isOverdue = dueDate < today && invoice.status !== 'paid';
                  
                  return (
                    <tr key={invoice.id} className="milhas-invoice-table-row">
                      <td className="milhas-invoice-table-cell font-medium milhas-text-primary">
                        <div className="flex items-center gap-3">
                          {card && (
                            <BankIcon url={card.bankIconUrl} name={card.bank} className="w-8 h-8 rounded-full" />
                          )}
                          <div>
                            <p>{card?.name || 'Cartão não encontrado'}</p>
                            <p className="text-xs milhas-text-secondary">
                              Final {card?.lastFourDigits || '****'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="milhas-invoice-table-cell">
                        <div>
                          <p>{dueDate.toLocaleDateString('pt-BR')}</p>
                          <p className={`text-xs ${
                            isOverdue ? 'text-red-600 dark:text-red-400' : 'milhas-text-secondary'
                          }`}>
                            {isOverdue ? `${Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} dias atrasado` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="milhas-invoice-table-cell font-medium milhas-text-primary">
                        R$ {invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="milhas-invoice-table-cell">
                        <span className={`milhas-status-badge ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          isOverdue ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {invoice.status === 'paid' ? 'Paga' : isOverdue ? 'Atrasada' : 'Pendente'}
                        </span>
                      </td>
                      <td className="milhas-invoice-table-cell text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowInvoiceModal(true);
                            }}
                            className="px-3 py-1 milhas-button-primary rounded-lg text-sm"
                          >
                            {invoice.status === 'paid' ? 'Detalhes' : 'Pagar'}
                          </button>
                          <button className="p-1 milhas-text-secondary hover:milhas-text-primary transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Seção de Programas de Milhas */}
      <div className="milhas-desktop-card">
        <div className="milhas-desktop-card-header">
          <h3 className="milhas-desktop-card-title">Programas de Milhas</h3>
          <button 
            onClick={() => setActiveTab('programs')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
          >
            Ver todos <ChevronRight size={16} />
          </button>
        </div>
        <div className="milhas-desktop-card-content">
          <div className="milhas-card-grid">
            {mileagePrograms.slice(0, 2).map(program => {
              const programInfo = detectProgramInfo(program.name);
              
              return (
                <div key={program.id} className={`rounded-lg border ${borderColor} p-5 milhas-card-hover`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <BankIcon url={program.programIconUrl} name={program.name} className="w-12 h-12 rounded-lg" />
                      <div>
                        <h4 className="font-medium milhas-text-primary">{program.name}</h4>
                        <p className="text-sm milhas-text-secondary">{program.airline}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs milhas-text-secondary">Melhor uso</p>
                      <p className="font-medium milhas-text-primary">{programInfo.bestUse}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs milhas-text-secondary">Pontos</p>
                      <p className="font-medium milhas-text-primary">{program.pointsBalance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs milhas-text-secondary">Valor</p>
                      <p className="font-medium milhas-text-primary">R$ {program.estimatedValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs milhas-text-secondary">Conversão</p>
                      <p className="font-medium milhas-text-primary">{program.conversionRate} pts/R$</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 milhas-button-primary rounded-lg text-sm">
                      Resgatar
                    </button>
                    <button className="p-2 milhas-button-secondary rounded-lg">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  // Modal de adição de cartão/programa
  const AddModal = () => (
    <AnimatePresence>
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className={`rounded-xl shadow-xl w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} ${cardBg} p-6`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                {activeTab === 'cards' ? 'Adicionar Cartão' : 'Adicionar Programa'}
              </h2>
              <button onClick={closeForm}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 'cards' ? (
                <>
                  <div>
                    <label className="block text-sm mb-1">Nome do Cartão *</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      value={newCard.name || ''}
                      onChange={(e) => {
                        const name = e.target.value;
                        const bankInfo = newCard.bank ? detectBankInfo(newCard.bank, name) : null;
                        setNewCard({
                          ...newCard,
                          name,
                          ...(bankInfo && {
                            icon: bankInfo.icon,
                            category: bankInfo.category
                          })
                        });
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Banco *</label>
                      <select
                        className="w-full p-2 border rounded-lg"
                        value={newCard.bank || ''}
                        onChange={handleBankChange}
                      >
                        <option value="">Selecione</option>
                        {Object.keys(BANK_DATABASE).map(bank => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Programa *</label>
                      <select
                        className="w-full p-2 border rounded-lg"
                        value={newCard.program || ''}
                        onChange={handleProgramChange}
                      >
                        <option value="">Selecione</option>
                        {Object.keys(PROGRAM_DATABASE).map(program => (
                          <option key={program} value={program}>{program}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Limite (R$) *</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        value={newCard.limit || ''}
                        onChange={(e) => setNewCard({...newCard, limit: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Pontos por R$ *</label>
                      <input
                        type="number"
                        step="0.1"
                        className="w-full p-2 border rounded-lg"
                        value={newCard.pointsPerReal || ''}
                        onChange={(e) => setNewCard({...newCard, pointsPerReal: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Dia de Fechamento *</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className="w-full p-2 border rounded-lg"
                        value={newCard.closingDate || ''}
                        onChange={(e) => setNewCard({...newCard, closingDate: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Dia de Vencimento *</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        className="w-full p-2 border rounded-lg"
                        value={newCard.dueDate || ''}
                        onChange={(e) => setNewCard({...newCard, dueDate: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Últimos 4 dígitos *</label>
                    <input
                      type="text"
                      maxLength={4}
                      className="w-full p-2 border rounded-lg"
                      value={newCard.lastFourDigits || ''}
                      onChange={(e) => setNewCard({...newCard, lastFourDigits: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1">Benefícios</label>
                    <textarea
                      className="w-full p-2 border rounded-lg"
                      rows={3}
                      placeholder="Digite um benefício por linha"
                      value={newCard.benefits?.join('\n') || ''}
                      onChange={(e) => {
                        const benefits = e.target.value.split('\n').filter(b => b.trim() !== '');
                        setNewCard({...newCard, benefits});
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm mb-1">Nome do Programa *</label>
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={newCard.program || ''}
                      onChange={(e) => {
                        const programName = e.target.value;
                        const programInfo = detectProgramInfo(programName);
                        setNewCard({
                          ...newCard,
                          program: programName,
                          ...(programName && { color: programInfo.colors[0] })
                        });
                      }}
                    >
                      <option value="">Selecione</option>
                      {Object.keys(PROGRAM_DATABASE).map(program => (
                        <option key={program} value={program}>{program}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Saldo de Pontos *</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        value={newCard.pointsBalance || ''}
                        onChange={(e) => setNewCard({...newCard, pointsBalance: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Valor Estimado (R$) *</label>
                      <input
                        type="number"
                        className="w-full p-2 border rounded-lg"
                        value={newCard.estimatedValue || ''}
                        onChange={(e) => setNewCard({...newCard, estimatedValue: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={closeForm}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                  onClick={() => {
                    toast.success(activeTab === 'cards' ? 'Cartão adicionado!' : 'Programa adicionado!');
                    closeForm();
                  }}
                >
                  {activeTab === 'cards' ? 'Adicionar Cartão' : 'Adicionar Programa'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Modal de fatura
  const InvoiceModal = () => (
    <AnimatePresence>
      {showInvoiceModal && selectedInvoice && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className={`rounded-xl shadow-xl w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} ${cardBg} p-6`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Detalhes da Fatura</h2>
              <button onClick={() => setShowInvoiceModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="opacity-70">Cartão:</p>
                <p className="font-medium">
                  {creditCards.find(c => c.id === selectedInvoice.cardId)?.name || 'Desconhecido'}
                </p>
              </div>
              
              <div className="flex justify-between">
                <p className="opacity-70">Valor:</p>
                <p className="font-medium">
                  R$ {selectedInvoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="flex justify-between">
                <p className="opacity-70">Vencimento:</p>
                <p className="font-medium">
                  {new Date(selectedInvoice.dueDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="flex justify-between">
                <p className="opacity-70">Status:</p>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {selectedInvoice.status === 'paid' ? 'Paga' : 'Pendente'}
                </span>
              </div>
              
              {selectedInvoice.status !== 'paid' && (
                <div className="pt-4">
                  <label className="block text-sm mb-2">Data de Pagamento</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-lg mb-4"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        toast.success('Fatura marcada como paga!');
                        setShowInvoiceModal(false);
                      }}
                      className="py-2 bg-green-600 text-white rounded-lg"
                    >
                      Confirmar Pagamento
                    </button>
                    <button
                      onClick={() => setShowInvoiceModal(false)}
                      className="py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Componente MobileProgramDetail - REMOVIDO - não usado

  // Função para gerar PDF de comprovante de fatura
  const generateInvoicePDF = (invoice: Invoice, card: CreditCard | undefined) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // Definir cores
    const textColor: [number, number, number] = resolvedTheme === "dark" ? [229, 229, 229] : [17, 17, 17];
    const mutedTextColor: [number, number, number] = resolvedTheme === "dark" ? [156, 156, 156] : [75, 75, 75];
    const backgroundColor: [number, number, number] = resolvedTheme === "dark" ? [31, 41, 55] : [255, 255, 255];
    // const borderColor: [number, number, number] = resolvedTheme === "dark" ? [75, 85, 99] : [229, 229, 229]; // Removido - não usado

    // Fundo da página
    doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Título Principal
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Comprovante de Fatura", margin, 20);

    // Informações do Cartão
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Dados do Cartão:", margin, 35);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text(`Cartão: ${card?.name || 'N/A'}`, margin, 45);
    doc.text(`Banco: ${card?.bank || 'N/A'}`, margin, 52);
    doc.text(`Final: ${card?.lastFourDigits || '****'}`, margin, 59);

    // Informações da Fatura
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text("Dados da Fatura:", margin, 75);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    doc.text(`Valor: R$ ${invoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, margin, 85);
    doc.text(`Vencimento: ${new Date(invoice.dueDate).toLocaleDateString('pt-BR')}`, margin, 92);
    doc.text(`Status: ${invoice.status === 'paid' ? 'Paga' : 'Pendente'}`, margin, 99);

    // Data de emissão
    doc.setFontSize(8);
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 20);

    doc.save(`comprovante-fatura-${card?.lastFourDigits || 'cartao'}.pdf`);
    toast.success("Comprovante gerado com sucesso!");
  };

  return (
    <div className={`min-h-screen ${bgColor} ${textColor}`}>
      {isMobile ? (
        <MilhasMobileView 
          creditCards={creditCards}
          mileagePrograms={mileagePrograms}
          invoices={invoices}
          cardBg={cardBg}
          borderColor={borderColor}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowAddModal={setShowAddModal}
          setSelectedCard={setSelectedCard}
          selectedCard={selectedCard}
          setSelectedInvoice={setSelectedInvoice}
          setShowInvoiceModal={setShowInvoiceModal}
          PROGRAM_DATABASE={PROGRAM_DATABASE}

        />
      ) : (
        <div className="p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            <Header />
            
            {activeTab === 'overview' ? (
              <DashboardOverview />
            ) : (
              <>
                <Tabs />
                <SearchBar />
                
                {activeTab === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {creditCards.length > 0 ? (
                      creditCards.map(card => (
                        <CreditCardItem key={card.id} card={card} />
                      ))
                    ) : (
                      <div className={`rounded-lg ${cardBg} p-8 text-center border ${borderColor} col-span-3`}>
                        <CreditCardIcon className="mx-auto mb-4 text-gray-400" size={32} />
                        <p>Nenhum cartão encontrado</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                          Adicionar Cartão
                        </button>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'programs' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mileagePrograms.length > 0 ? (
                      mileagePrograms.map(program => (
                        <ProgramItem key={program.id} program={program} />
                      ))
                    ) : (
                      <div className={`rounded-lg ${cardBg} p-8 text-center border ${borderColor} col-span-3`}>
                        <Award className="mx-auto mb-4 text-gray-400" size={32} />
                        <p>Nenhum programa encontrado</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                          Adicionar Programa
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {invoices.length > 0 ? (
                      invoices.map(invoice => (
                        <InvoiceItem key={invoice.id} invoice={invoice} />
                      ))
                    ) : (
                      <div className={`rounded-lg ${cardBg} p-8 text-center border ${borderColor}`}>
                        <Banknote className="mx-auto mb-4 text-gray-400" size={32} />
                        <p>Nenhuma fatura encontrada</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <AddModal />
      <InvoiceModal />
      <ToastContainer position={isMobile ? "bottom-center" : "top-right"} />
    </div>
  );
};

export default MilhasPage;