import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { 
  MessageCircle, X, Send, Bot, 
  Sparkles, BarChart2, Lightbulb,
  Copy, ThumbsUp, ThumbsDown,
  Star, Target, Trash2,
  CheckCircle, XCircle,
  Edit3, Brain, Zap as ZapIcon, Plane, ClipboardList
} from 'lucide-react';
import { chatbotAPI } from '../services/api';
import { chatbotDeleteAPI } from '../services/chatbotDeleteAPI';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import DynamicDashboard from './DynamicDashboard';


// Tipos para o sistema de automação inteligente
// Tipos para payloads específicos
type TransactionPayload = {
  valor: number;
  descricao: string;
  tipo?: 'receita' | 'despesa';
  categoria?: string;
  conta?: string;
  data?: string;
};

type InvestmentPayload = {
  valor: number;
  nome: string;
  instituicao?: string;
  tipo?: string;
};

type GoalPayload = {
  meta: string;
  valor_total: number;
  data_conclusao?: string;
};

type AutomatedAction = {
  type: 'CREATE_TRANSACTION' | 'CREATE_INVESTMENT' | 'CREATE_GOAL' | 'ANALYZE_DATA' | 'GENERATE_REPORT' | 
        'CREATE_MILEAGE' | 'REDEEM_MILEAGE' | 'ANALYZE_MILEAGE' | 'CONNECT_PLUGGY' | 'CALCULATE_VALUE' |
        'DASHBOARD_COMMAND' | 'GREETING' | 'GENERAL_HELP' | 'FRUSTRATION' | 'CONFIRMATION' | 'UNKNOWN';
  payload: TransactionPayload | InvestmentPayload | GoalPayload | Record<string, unknown>;
  confidence: number;
  requiresConfirmation: boolean;
  successMessage: string;
  errorMessage: string;
  followUpQuestions?: string[];
  isAutomated?: boolean;
};

type ChatMessage = {
  id: string;
  sender: 'user' | 'bot' | 'assistant'; // ✅ CORREÇÃO: Adicionar 'assistant' como tipo válido
  content: string | React.ReactElement;
  timestamp: Date;
  metadata?: {
    action?: AutomatedAction;
    isAutomated?: boolean;
    processingTime?: number;
    confidence?: number;
    analysisData?: Record<string, unknown>;
    suggestions?: string[];
    isPremium?: boolean;
    expertise?: string;
    userLevel?: 'basic' | 'intermediate' | 'advanced';
    actionExecuted?: boolean;
    requiresConfirmation?: boolean;
    mileageProgram?: string;
    pointsEarned?: number;
    estimatedValue?: number;
    followUpQuestions?: string[]; // ✅ ADICIONADO: followUpQuestions
    recommendations?: Array<{
      title: string;
      action?: string;
      description?: string;
    }>; // ✅ ADICIONADO: recommendations
    nextSteps?: string[]; // ✅ ADICIONADO: nextSteps
    isError?: boolean; // ✅ CORREÇÃO: Adicionar propriedade isError
    isDataCollection?: boolean; // ✅ ADICIONADO: para coleta progressiva
    currentField?: string; // ✅ ADICIONADO: para coleta progressiva
    missingFields?: string[]; // ✅ ADICIONADO: para coleta progressiva
    collectedData?: Record<string, unknown>; // ✅ ADICIONADO: para coleta progressiva
    isComplete?: boolean; // ✅ ADICIONADO: para coleta progressiva
    actionType?: string; // ✅ ADICIONADO: para resumo
    isRecommendations?: boolean; // ✅ ADICIONADO: para recomendações
    isNextSteps?: boolean; // ✅ ADICIONADO: para próximos passos
    isSummary?: boolean; // ✅ ADICIONADO: para resumo
  };
  isError?: boolean; // ✅ CORREÇÃO: Adicionar propriedade isError
};

type ChatSession = {
  chatId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

// Sistema de Temas Dinâmicos
const getChatTheme = (plan?: string) => {
  const planName = (plan || '').toLowerCase();
  
  if (planName.includes('premium')) {
    return {
      name: 'premium',
      primary: '#8b5cf6',
      secondary: '#6366f1',
      gradient: 'from-purple-600 to-indigo-600',
      bubbleUser: 'bg-gradient-to-r from-purple-600 to-indigo-600',
      bubbleBot: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      text: 'text-gray-900 dark:text-white',
      icon: '🏆',
      accent: 'text-purple-600 dark:text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-700',
      border: 'border-purple-300 dark:border-purple-600',
      chatBg: 'bg-gray-50 dark:bg-gray-800',
      headerBg: 'bg-white dark:bg-gray-900',
      inputBg: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
    };
  }
  
  if (planName.includes('top')) {
    return {
      name: 'top',
      primary: '#f59e0b',
      secondary: '#f97316',
      gradient: 'from-amber-500 to-orange-500',
      bubbleUser: 'bg-gradient-to-r from-amber-500 to-orange-500',
      bubbleBot: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      text: 'text-gray-900 dark:text-white',
      icon: '👑',
      accent: 'text-amber-600 dark:text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700',
      border: 'border-amber-300 dark:border-amber-600',
      chatBg: 'bg-gray-50 dark:bg-gray-800',
      headerBg: 'bg-white dark:bg-gray-900',
      inputBg: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
    };
  }
  
  if (planName.includes('essencial')) {
    return {
      name: 'essencial',
      primary: '#10b981',
      secondary: '#059669',
      gradient: 'from-emerald-500 to-green-500',
      bubbleUser: 'bg-gradient-to-r from-emerald-500 to-green-500',
      bubbleBot: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      text: 'text-gray-900 dark:text-white',
      icon: '⭐',
      accent: 'text-emerald-600 dark:text-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      border: 'border-emerald-300 dark:border-emerald-600',
      chatBg: 'bg-gray-50 dark:bg-gray-800',
      headerBg: 'bg-white dark:bg-gray-900',
      inputBg: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
    };
  }
  
  // Plano padrão (free)
  return {
    name: 'default',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    gradient: 'from-indigo-500 to-purple-500',
    bubbleUser: 'bg-indigo-600',
    bubbleBot: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    text: 'text-gray-900 dark:text-white',
    icon: '💬',
    accent: 'text-indigo-600 dark:text-indigo-400',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    border: 'border-indigo-300 dark:border-indigo-600',
    chatBg: 'bg-gray-50 dark:bg-gray-800',
    headerBg: 'bg-white dark:bg-gray-900',
    inputBg: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
  };
};

// Componente de Ação Automatizada
const AutomatedActionCard = ({ 
  action, 
  onConfirm, 
  onEdit, 
  onCancel,
  theme 
}: {
  action: AutomatedAction;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
  theme: ReturnType<typeof getChatTheme>;
}) => {
  const getActionIcon = () => {
    switch (action.type) {
      case 'CREATE_TRANSACTION': return '💰';
      case 'CREATE_INVESTMENT': return '📈';
      case 'CREATE_GOAL': return '🎯';
      case 'ANALYZE_DATA': return '📊';
      case 'GENERATE_REPORT': return '📋';
      case 'CREATE_MILEAGE': return '✈️';
      case 'REDEEM_MILEAGE': return '🎫';
      case 'ANALYZE_MILEAGE': return '📊';
      case 'CONNECT_PLUGGY': return '🔗';
      case 'CALCULATE_VALUE': return '💰';
      default: return '🤖';
    }
  };

  const getActionTitle = () => {
    switch (action.type) {
      case 'CREATE_TRANSACTION': return 'Transação Detectada';
      case 'CREATE_INVESTMENT': return 'Investimento Detectado';
      case 'CREATE_GOAL': return 'Meta Detectada';
      case 'ANALYZE_DATA': return 'Análise Automática';
      case 'GENERATE_REPORT': return 'Relatório Gerado';
      case 'CREATE_MILEAGE': return 'Milhas Detectadas';
      case 'REDEEM_MILEAGE': return 'Resgate de Milhas';
      case 'ANALYZE_MILEAGE': return 'Análise de Milhas';
      case 'CONNECT_PLUGGY': return 'Conectar Conta';
      case 'CALCULATE_VALUE': return 'Cálculo de Valor';
      default: return 'Ação Automatizada';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${theme.border} p-4 mb-4 shadow-sm`}>
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">{getActionIcon()}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{getActionTitle()}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Brain size={14} className="text-blue-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Confiança: {Math.round(action.confidence * 100)}%
              </span>
            </div>
            {action.isAutomated && (
              <div className="flex items-center gap-1">
                <ZapIcon size={14} className="text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">Automático</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
          {action.successMessage}
        </p>
        
        {action.payload && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(action.payload).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {typeof value === 'number' && key.includes('valor') 
                      ? `R$ ${value.toFixed(2)}` 
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col space-y-2">
        <button
          onClick={onConfirm}
          className={`w-full ${theme.button} text-white px-4 py-3 rounded-lg flex items-center justify-center font-medium transition-all duration-200 hover:scale-105`}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirmar
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg flex items-center justify-center text-sm transition-colors"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            Editar
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center text-sm transition-colors"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Cancelar
          </button>
        </div>
      </div>
      
      {action.followUpQuestions && action.followUpQuestions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Perguntas relacionadas:</p>
          <div className="flex flex-wrap gap-2">
            {action.followUpQuestions.map((question, index) => (
              <button
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // Implementar envio automático da pergunta
                  console.log('Pergunta sugerida:', question);
                }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Mensagem Avançado com Automação
const AdvancedMessageBubble = ({ 
  message, 
  theme, 
  _isPremium, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
  onFeedback,
  onActionConfirm,
  onActionEdit,
  onActionCancel
}: {
  message: ChatMessage; 
  theme: ReturnType<typeof getChatTheme>;
  _isPremium: boolean;
  onFeedback: (_messageId: string) => void; // eslint-disable-line no-unused-vars
  onActionConfirm: (_action: AutomatedAction) => void; // eslint-disable-line no-unused-vars
  onActionEdit: (_action: AutomatedAction) => void; // eslint-disable-line no-unused-vars
  onActionCancel: (_action: AutomatedAction) => void; // eslint-disable-line no-unused-vars
}) => {
  const copyToClipboard = async (text: string | React.ReactElement) => {
    try {
      if (typeof text === 'string') {
        await navigator.clipboard.writeText(text);
      } else {
        await navigator.clipboard.writeText('Conteúdo copiado');
      }
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const getLevelBadge = (level?: string) => {
    if (!level) return null;
    
    const badges = {
      basic: { color: 'bg-blue-100 text-blue-800', icon: '🌱', text: 'Iniciante' },
      intermediate: { color: 'bg-yellow-100 text-yellow-800', icon: '📈', text: 'Intermediário' },
      advanced: { color: 'bg-purple-100 text-purple-800', icon: '🚀', text: 'Avançado' }
    };
    
    const badge = badges[level as keyof typeof badges];
    if (!badge) return null;
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <span>{badge.icon}</span>
        <span>{badge.text}</span>
      </div>
    );
  };

  // 🏷️ OBTER NOME DE EXIBIÇÃO DO CAMPO
  const getFieldDisplayName = (field: string): string => {
    const displayNames: Record<string, string> = {
      meta: 'Nome da meta',
      valor_total: 'Valor total',
      data_conclusao: 'Data de conclusão',
      valor: 'Valor',
      descricao: 'Descrição',
      tipo: 'Tipo',
      categoria: 'Categoria',
      conta: 'Conta',
      data: 'Data',
      nome: 'Nome do investimento',
      instituicao: 'Instituição'
    };
    
    return displayNames[field] || field;
  };

  // 🏷️ FORMATAR VALOR DO CAMPO
  const formatFieldValue = (field: string, value: unknown): string => {
    if (value === null || value === undefined) return '-';
    
    switch (field) {
      case 'valor':
      case 'valor_total':
        return `R$ ${Number(value).toFixed(2)}`;
      case 'data':
      case 'data_conclusao':
        if (
          typeof value === 'string' ||
          typeof value === 'number' ||
          value instanceof Date
        ) {
          const date = new Date(value);
          return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
        }
        return '-';
      case 'tipo':
        return value === 'receita' ? 'Receita' : 'Despesa';
      default:
        return String(value);
    }
  };

  // 🎯 HANDLER PARA CLIQUE EM RECOMENDAÇÃO
  const handleRecommendationClick = (recommendation: { action?: string; title: string }) => {
    if (recommendation.action) {
      // Simular envio de mensagem baseada na recomendação
      const message = getRecommendationMessage(recommendation.action);
      console.log('Recomendação clicada:', message);
      // O usuário pode enviar manualmente ou podemos enviar automaticamente
    }
  };

  // 🎯 OBTER MENSAGEM BASEADA NA AÇÃO DA RECOMENDAÇÃO
  const getRecommendationMessage = (action: string): string => {
    const messages: Record<string, string> = {
      'VIEW_GOALS': 'Mostre minhas metas',
      'CREATE_TRANSACTION': 'Quero criar uma transação',
      'CREATE_GOAL': 'Quero criar uma meta',
      'VIEW_TRANSACTIONS': 'Mostre minhas transações',
      'VIEW_INVESTMENTS': 'Mostre meus investimentos'
    };
    
    return messages[action] || action;
  };

  return (
    <div className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.sender === 'bot' && (
        <div className="flex-shrink-0">
          <div className={`p-2 rounded-full ${theme.bubbleBot} text-${theme.primary}`}>
            <Bot className="w-5 h-5" />
          </div>
        </div>
      )}
      
      <div className={`relative max-w-[85%] rounded-2xl ${
        message.sender === 'user' 
          ? `${theme.bubbleUser} text-white rounded-tr-none`
          : `${theme.bubbleBot} shadow-sm rounded-tl-none dark:text-gray-100`
      }`}>
        {/* Cabeçalho da mensagem (apenas para bot) */}
        {message.sender === 'bot' && message.metadata && (
          <div className="px-4 pt-3 pb-1 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {message.metadata.isPremium && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Sparkles size={14} />
                    <span className="text-xs font-medium">Premium</span>
                  </div>
                )}
                {getLevelBadge(message.metadata.userLevel)}
                {message.metadata.confidence && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Confiança: {Math.round(message.metadata.confidence * 100)}%
                  </div>
                )}
                {message.metadata.isAutomated && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <ZapIcon size={14} />
                    <span className="text-xs font-medium">Automático</span>
                  </div>
                )}
              </div>
              {message.metadata.processingTime && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {message.metadata.processingTime}ms
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Conteúdo da mensagem */}
        <div className="p-4">
          <div className={`prose dark:prose-invert prose-sm max-w-none chat-message-content ${message.sender === 'user' ? 'text-white' : ''}`}>
            {typeof message.content === 'string' ? (
              <div dangerouslySetInnerHTML={{ __html: message.content }} />
            ) : (
              message.content
            )}
          </div>
          
          {/* ✅ NOVO: Mostrar ação apenas se realmente precisar de confirmação */}
          {message.metadata?.action && 
           message.metadata.action.requiresConfirmation &&
           message.metadata.action.type !== 'GREETING' &&
           message.metadata.action.type !== 'GENERAL_HELP' &&
           message.metadata.action.type !== 'UNKNOWN' && (
            <div className="mt-4">
              <AutomatedActionCard
                action={message.metadata.action}
                onConfirm={() => onActionConfirm(message.metadata!.action!)}
                onEdit={() => onActionEdit(message.metadata!.action!)}
                onCancel={() => onActionCancel(message.metadata!.action!)}
                theme={theme}
              />
            </div>
          )}
          
          {/* Metadados ricos */}
          {message.sender === 'bot' && message.metadata && !message.metadata.action && (
            <div className="mt-4 space-y-3">
              {/* 🎯 PROGRESSO DA COLETA DE DADOS */}
              {message.metadata?.isDataCollection && message.metadata?.collectedData && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList size={16} className="text-blue-600 dark:text-blue-400" />
                    <h4 className="font-bold text-sm text-blue-800 dark:text-blue-200">📋 Dados coletados:</h4>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(message.metadata.collectedData).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-blue-700 dark:text-blue-300">{getFieldDisplayName(key)}:</span>
                        <span className="font-medium text-blue-800 dark:text-blue-200">{formatFieldValue(key, value)}</span>
                      </div>
                    ))}
                  </div>
                  {message.metadata?.missingFields && message.metadata.missingFields.length > 0 && (
                    <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                      ⏳ Faltam: {message.metadata.missingFields.length} campo(s)
                    </div>
                  )}
                </div>
              )}

              {/* 📋 RESUMO PARA CONFIRMAÇÃO */}
              {message.metadata?.isSummary && message.metadata?.collectedData && (
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                    <h4 className="font-bold text-sm text-green-800 dark:text-green-200">✅ Todos os dados foram coletados!</h4>
                  </div>
                  <div className="space-y-2 mb-3">
                    {Object.entries(message.metadata.collectedData).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-green-700 dark:text-green-300">{getFieldDisplayName(key)}:</span>
                        <span className="font-medium text-green-800 dark:text-green-200">{formatFieldValue(key, value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onActionConfirm({
                        type: (message.metadata?.actionType as AutomatedAction['type']) || 'UNKNOWN',
                        payload: message.metadata?.collectedData || {},
                        confidence: 1.0,
                        requiresConfirmation: false,
                        successMessage: 'Ação executada com sucesso!',
                        errorMessage: 'Erro ao executar ação'
                      })}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      ✅ Confirmar
                    </button>
                    <button
                      onClick={() => {
                        // Limpar dados e recomeçar
                        console.log('Recomeçar coleta de dados');
                      }}
                      className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                    >
                      🔄 Recomeçar
                    </button>
                  </div>
                </div>
              )}

              {/* 💡 RECOMENDAÇÕES */}
              {message.metadata.isRecommendations && message.metadata.recommendations && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={16} className="text-purple-600 dark:text-purple-400" />
                    <h4 className="font-bold text-sm text-purple-800 dark:text-purple-200">💡 Recomendações:</h4>
                  </div>
                  <div className="space-y-2">
                    {message.metadata.recommendations.map((rec, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecommendationClick(rec)}
                        className="block w-full text-left p-2 bg-purple-100 dark:bg-purple-800 rounded hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors text-sm text-purple-700 dark:text-purple-300"
                      >
                        {rec.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 🎯 PRÓXIMOS PASSOS */}
              {message.metadata.isNextSteps && message.metadata.nextSteps && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-orange-600 dark:text-orange-400" />
                    <h4 className="font-bold text-sm text-orange-800 dark:text-orange-200">🎯 Próximos passos:</h4>
                  </div>
                  <ul className="space-y-1">
                    {message.metadata.nextSteps.map((step: string, index: number) => (
                      <li key={index} className="text-sm text-orange-700 dark:text-orange-300 flex items-center">
                        <span className="mr-2">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Informações específicas de milhas */}
              {message.metadata.pointsEarned && (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane size={16} className="text-green-600 dark:text-green-400" />
                    <h4 className="font-bold text-sm text-green-800 dark:text-green-200">Milhas Acumuladas</h4>
                  </div>
                  <div className="text-sm">
                    <p className="text-green-700 dark:text-green-300">
                      <strong>{message.metadata.pointsEarned.toLocaleString()}</strong> pontos no {message.metadata.mileageProgram}
                    </p>
                    {message.metadata.estimatedValue && (
                      <p className="text-green-600 dark:text-green-400 text-xs">
                        Valor estimado: R$ {message.metadata.estimatedValue.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Análise de dados */}
              {message.metadata.analysisData && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-bold text-sm text-indigo-800 dark:text-indigo-200">Análise Detalhada</h4>
                  </div>
                  <div className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    <pre className="text-gray-700 dark:text-gray-300">
                      {JSON.stringify(message.metadata.analysisData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Sugestões */}
              {message.metadata.suggestions && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={16} className="text-blue-600 dark:text-blue-400" />
                    <h4 className="font-bold text-sm text-blue-800 dark:text-blue-200">Sugestões</h4>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {message.metadata.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400">•</span>
                        <span className="text-blue-700 dark:text-blue-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Rodapé com tempo e ações */}
        <div className={`px-4 pb-2 pt-1 text-xs flex justify-between items-center ${
          message.sender === 'user' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          <div className="flex gap-2">
            <button 
              onClick={() => copyToClipboard(message.content)}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Copiar mensagem"
            >
              <Copy size={14} />
            </button>
            
            {message.sender === 'bot' && (
              <button 
                onClick={() => onFeedback(message.id)}
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Dar feedback"
              >
                <ThumbsUp size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Barra de Comando Avançada
const CommandBar = ({ 
  onSubmit, 
  isLoading, 
  theme,
  placeholder 
}: { 
  onSubmit: (_message: string) => void; // eslint-disable-line no-unused-vars
  isLoading: boolean;
  theme: ReturnType<typeof getChatTheme>;
  placeholder: string;
}) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      onSubmit(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={`w-full px-4 py-3 rounded-lg ${theme.inputBg} text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
        />
        {inputMessage && (
          <button
            type="button"
            onClick={() => setInputMessage('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!inputMessage.trim() || isLoading}
        className={`px-4 py-3 rounded-lg ${theme.button} text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Send size={16} />
        )}
      </button>
    </form>
  );
};

// Novo: Formulário dinâmico para campos obrigatórios
const DynamicForm = ({
  _actionType, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
  missingFields,
  onSubmit,
  onCancel
}: {
  _actionType: string;
  missingFields: string[];
  onSubmit: (_values: Record<string, string | number>) => void; // eslint-disable-line no-unused-vars
  onCancel: () => void;
}) => {
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  // Labels amigáveis
  const fieldLabels: Record<string, string> = {
    meta: 'Descrição da Meta',
    valor_total: 'Valor Total da Meta',
    data_conclusao: 'Data de Conclusão',
    valor: 'Valor',
    descricao: 'Descrição',
    tipo: 'Tipo',
    nome: 'Nome do Investimento',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-4 shadow-md max-w-md mx-auto">
      <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
        Preencha os campos obrigatórios
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {missingFields.map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {fieldLabels[field] || field}
            </label>
            <input
              type={field.includes('data') ? 'date' : (field.includes('valor') ? 'number' : 'text')}
              step={field.includes('valor') ? '0.01' : undefined}
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formValues[field] || ''}
              onChange={e => handleChange(field, e.target.value)}
              required
            />
          </div>
        ))}
        <div className="flex gap-2 mt-4">
          <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium">Enviar</button>
          <button type="button" className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

export default function Chatbot({ isOpen: externalIsOpen, onToggle }: ChatbotProps) {
  const { user, subscription } = useAuth();
  const router = useRouter();
  
  // Estados principais
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId] = useState<string>('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  
  // 🎛️ ESTADOS DO DASHBOARD DINÂMICO
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardCommand, setDashboardCommand] = useState<string>('');
  
  // 🛫 ESTADOS PARA PÁGINA DE MILHAS
  const [isMileagePage, setIsMileagePage] = useState(false);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ messageId: string; isOpen: boolean }>({ messageId: '', isOpen: false });
  
  // 🎯 ESTADOS PARA FORMULÁRIO DINÂMICO
  const [showDynamicForm, setShowDynamicForm] = useState(false);
  const [dynamicFormFields, setDynamicFormFields] = useState<string[]>([]);
  const [dynamicFormAction, setDynamicFormAction] = useState<string>('');
  const [dynamicFormPayload, setDynamicFormPayload] = useState<Record<string, unknown>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const [inputValue, setInputValue] = useState('');


  // Usar estado externo se fornecido, senão usar interno
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleToggle = externalIsOpen !== undefined ? onToggle || (() => {}) : setInternalIsOpen;

  // Detectar se é usuário premium
  const isPremiumUser = subscription?.status === 'active' && (
    subscription?.plan === 'premium' || 
    (subscription?.plan && typeof subscription.plan === 'string' && 
     (subscription.plan.toLowerCase().includes('top') || 
      subscription.plan.toLowerCase().includes('premium')))
  );

  // Detectar se está na página de milhas
  useEffect(() => {
    setIsMileagePage(router.pathname === '/milhas');
  }, [router.pathname]);

  // Obter tema dinâmico baseado no contexto
  const getContextualTheme = () => {
    if (isMileagePage) {
      // Tema específico para milhas
      return {
        name: 'mileage',
        primary: '#00A1E0', // Azul Smiles
        secondary: '#0066CC', // Azul TudoAzul
        gradient: 'from-blue-500 to-cyan-500',
        bubbleUser: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        bubbleBot: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
        text: 'text-gray-900 dark:text-white',
        icon: '✈️',
        accent: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700',
        border: 'border-blue-300 dark:border-blue-600',
        chatBg: 'bg-gray-50 dark:bg-gray-800',
        headerBg: 'bg-white dark:bg-gray-900',
        inputBg: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
      };
    }
    return getChatTheme(subscription?.plan?.toString());
  };

  const theme = getContextualTheme();

  // Obter o nome do plano para exibição
  const getPlanDisplayName = () => {
    if (!subscription?.plan) return 'Gratuito';
    
    const plan = subscription.plan.toString().toLowerCase();
    if (plan.includes('top anual')) return 'Top Anual';
    if (plan.includes('top')) return 'Top';
    if (plan.includes('essencial anual')) return 'Essencial Anual';
    if (plan.includes('essencial')) return 'Essencial';
    if (plan.includes('premium')) return 'Premium';
    return subscription.plan;
  };

  // Obter expertise do consultor baseado no contexto
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const _getExpertiseDisplay = () => {
    if (isMileagePage) {
      if (isPremiumUser) {
        return {
          title: 'Finn Milhas Premium',
          subtitle: 'Especialista em Programas de Fidelidade',
          description: 'Consultor certificado em milhas aéreas e cartões de crédito',
          icon: '✈️'
        };
      }
      return {
        title: 'Finn Milhas',
        subtitle: 'Assistente de Milhas',
        description: 'Especialista em programas de fidelidade e cartões',
        icon: '✈️'
      };
    }
    
    if (isPremiumUser) {
      return {
        title: 'Dr. Finn',
        subtitle: 'Consultor Financeiro CFA, CFP, CNAI, CNPI',
        description: 'Especialista em análise fundamentalista, planejamento financeiro e gestão de risco',
        icon: '👨‍💼'
      };
    }
    return {
      title: 'Finn',
      subtitle: 'Assistente Finnextho',
      description: 'Especialista em educação financeira e uso da plataforma',
      icon: '🤖'
    };
  };

  // ✅ OTIMIZAÇÃO: Usar useCallback para funções que não mudam frequentemente
  const loadChatSessions = useCallback(async () => {
    try {
      console.log('[FRONTEND] Carregando sessões...');
      const response = await chatbotAPI.getSessions();
      console.log('[FRONTEND] Sessões recebidas:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        setSessions(response.data);
      } else if (Array.isArray(response)) {
        setSessions(response);
      } else {
        console.log('[FRONTEND] Formato de resposta inesperado:', response);
        setSessions([]);
      }
    } catch (error) {
      console.error('Failed to load sessions', error);
      setSessions([]);
    }
  }, []);

  // ✅ OTIMIZAÇÃO: Usar useCallback para startNewSession
  const startNewSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await chatbotAPI.startNewSession();
      const newSession: ChatSession = {
        chatId: response.chatId,
        title: isMileagePage ? 'Nova Consulta de Milhas' : 'Nova Conversa',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setActiveSession(newSession);
      setSessions(prev => [newSession, ...prev]);
      setMessages([]);
      
      // ✅ CORREÇÃO: Fechar modal automaticamente
      setIsNewSessionModalOpen(false);
      
      console.log('[FRONTEND] Nova sessão criada:', response.chatId);
    } catch (error) {
      console.error('Failed to start new session', error);
      toast.error('Erro ao criar nova sessão');
    } finally {
      setIsLoading(false);
    }
  }, [isMileagePage]);

  // 🎯 HANDLER PARA AÇÕES AUTOMATIZADAS COM COLETA PROGRESSIVA
  const executeAutomatedAction = async (action: AutomatedAction) => {
    try {
      console.log('🤖 Executando ação automatizada:', action);

      // Se a ação for UNKNOWN, não executar
      if (action.type === 'UNKNOWN') {
        console.log('🤖 Ação UNKNOWN detectada, não executando');
        return;
      }

      const response = await chatbotAPI.executeAction({
        action: action.type,
        payload: action.payload,
        chatId: chatId || undefined
      });

      if (response.success) {
        // Adicionar mensagem de sucesso
        const successMessage: ChatMessage = {
          id: `success-${Date.now()}`,
          sender: 'bot',
          content: response.message || action.successMessage || 'Ação executada com sucesso!',
          timestamp: new Date(),
          metadata: {
            actionExecuted: true,
            isAutomated: false,
            actionType: action.type,
            recommendations: response.metadata?.recommendations || [],
            nextSteps: response.metadata?.nextSteps || []
          }
        };

        setMessages(prev => [...prev, successMessage]);

        // Mostrar recomendações se houver
        if (response.metadata?.recommendations?.length > 0) {
          const recommendationsMessage: ChatMessage = {
            id: `recommendations-${Date.now()}`,
            sender: 'bot',
            content: '💡 **Sugestões para você:**',
            timestamp: new Date(),
            metadata: {
              recommendations: response.metadata.recommendations,
              isRecommendations: true
            }
          };
          setMessages(prev => [...prev, recommendationsMessage]);
        }

        // Mostrar próximos passos se houver
        if (response.metadata?.nextSteps?.length > 0) {
          const nextStepsMessage: ChatMessage = {
            id: `nextsteps-${Date.now()}`,
            sender: 'bot',
            content: '🎯 **Próximos passos:**',
            timestamp: new Date(),
            metadata: {
              nextSteps: response.metadata.nextSteps,
              isNextSteps: true
            }
          };
          setMessages(prev => [...prev, nextStepsMessage]);
        }

      } else {
        // ❌ ERRO NA EXECUÇÃO
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          sender: 'bot',
          content: response.message || 'Desculpe, tive um problema ao executar a ação. Pode tentar novamente?',
          timestamp: new Date(),
          metadata: {
            isError: true
          }
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('❌ Erro ao executar ação automatizada:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        content: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
        timestamp: new Date(),
        metadata: {
          isError: true
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };


  // 🎯 HANDLER PARA ENVIO DE MENSAGENS
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      content: message,
      timestamp: new Date(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chatbotAPI.sendQuery({
        message: message,
        chatId: activeSession?.chatId || chatId || 'new-session'
      });
      
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}-${Math.random()}`,
        content: response.message,
        timestamp: new Date(),
        sender: 'bot',
        metadata: response.metadata
      };

      setMessages(prev => [...prev, botMessage]);

      // ✅ NOVO: Mostrar toast baseado na ação
      if (response.metadata?.action?.type) {
        const actionType = response.metadata.action.type;
        const payload = response.metadata.action.payload;
        
        if (actionType.includes('CREATE') || actionType.includes('UPDATE') || actionType.includes('DELETE')) {
          let details = '';
          
          if (payload?.valor) details += `R$ ${payload.valor}`;
          if (payload?.descricao) details += ` - ${payload.descricao}`;
          if (payload?.meta) details += ` - ${payload.meta}`;
          if (payload?.nome) details += ` - ${payload.nome}`;
          
          showSuccessToast(actionType, details);
        }
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showErrorToast('Erro ao processar mensagem. Tente novamente.');
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}-${Math.random()}`,
        content: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
        timestamp: new Date(),
        sender: 'bot'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 HANDLER PARA CONFIRMAÇÃO DE AÇÃO
  const handleActionConfirm = async (action: AutomatedAction) => {
    try {
      const response = await chatbotAPI.executeAction({
        action: action.type,
        payload: action.payload,
        chatId: chatId || undefined
      });

      if (response.success) {
        const successMessage: ChatMessage = {
          id: `success-${Date.now()}`,
          sender: 'bot',
          content: response.message || 'Ação executada com sucesso!',
          timestamp: new Date(),
          metadata: {
            actionExecuted: true,
            isAutomated: false
          }
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          sender: 'bot',
          content: response.message || 'Desculpe, tive um problema ao executar a ação.',
          timestamp: new Date(),
          metadata: {
            isError: true
          }
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('❌ Erro ao confirmar ação:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'bot',
        content: 'Desculpe, tive um problema técnico.',
        timestamp: new Date(),
        metadata: {
        isError: true
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // ✅ OTIMIZAÇÃO: Carregar sessões apenas uma vez ao montar o componente
  useEffect(() => {
    loadChatSessions();
  }, [loadChatSessions]);

  // ✅ OTIMIZAÇÃO: Carregar mensagens da sessão ativa apenas quando necessário
  const loadSessionMessages = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true);
      // ✅ CORREÇÃO: Usar getSession em vez de getSessionMessages
      const response = await chatbotAPI.getSession(chatId);
      
      console.log('[FRONTEND] Resposta da sessão:', response);
      
      // ✅ CORREÇÃO: Verificar se response e response.messages existem
      if (response && response.success && response.messages && Array.isArray(response.messages)) {
      const formattedMessages: ChatMessage[] = response.messages.map((msg: {
        metadata?: { messageId?: string; [key: string]: unknown };
        _id?: string;
        sender?: string;
        content?: string;
        timestamp?: string | Date;
      }) => ({
          id: msg.metadata?.messageId || msg._id || `msg-${Date.now()}-${Math.random()}`,
          sender: msg.sender === 'assistant' ? 'bot' : (msg.sender || 'bot'),
          content: msg.content || 'Mensagem sem conteúdo',
          timestamp: new Date(msg.timestamp || Date.now()),
          metadata: msg.metadata as ChatMessage['metadata'] || {}
        }));
        
        setMessages(formattedMessages);
        console.log(`[FRONTEND] Carregadas ${formattedMessages.length} mensagens da sessão ${chatId}`);
      } else {
        // ✅ CORREÇÃO: Se não há mensagens, definir array vazio
        console.log('[FRONTEND] Nenhuma mensagem encontrada na sessão ou formato inválido');
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to load session messages', error);
      toast.error('Erro ao carregar mensagens da sessão');
      // ✅ CORREÇÃO: Em caso de erro, definir array vazio
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ OTIMIZAÇÃO: Trocar sessão com melhor tratamento
  const switchSession = useCallback(async (session: ChatSession) => {
    setActiveSession(session);
    setMessages([]);
    await loadSessionMessages(session.chatId);
  }, [loadSessionMessages]);

  // ✅ OTIMIZAÇÃO: Deletar sessão com confirmação
  const deleteSession = useCallback(async (chatId: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta conversa?')) {
      return;
    }

    try {
      // ✅ CORREÇÃO: Usar chatbotDeleteAPI em vez de chatbotAPI.deleteSession
      await chatbotDeleteAPI.deleteSession(chatId);
      
      setSessions(prev => prev.filter(s => s.chatId !== chatId));
      
      if (activeSession?.chatId === chatId) {
        setActiveSession(null);
        setMessages([]);
      }
      
      toast.success('Conversa deletada com sucesso');
    } catch (error) {
      console.error('Failed to delete session', error);
      toast.error('Erro ao deletar conversa');
    }
  }, [activeSession]);


  const handleActionEdit = (action: AutomatedAction) => {
    // Implementar edição da ação
    console.log('Editar ação:', action);
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  const handleActionCancel = (_action?: AutomatedAction) => { // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars
    const cancelMessage: ChatMessage = {
      id: `cancel-${Date.now()}`,
      sender: 'bot',
      content: 'Ação cancelada. Como posso ajudar?',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, cancelMessage]);
    
    // ✅ ADICIONADO: Toast de cancelamento
    toast.info('Ação cancelada');
  };

  const handleFeedback = async (feedbackData: {
    messageId: string;
    rating: number;
    helpful: boolean;
    comment: string;
    category: 'helpfulness' | 'accuracy' | 'clarity' | 'relevance';
    context: string;
  }) => {
    try {
      await chatbotAPI.saveUserFeedback(feedbackData);
      console.log('Feedback enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
    }
  };

  const openFeedbackModal = (messageId: string) => {
    setFeedbackModal({ messageId, isOpen: true });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({ messageId: '', isOpen: false });
  };
  
  const handleDashboardResponse = (response: CommandResponse) => {
    // Adicionar resposta do dashboard como mensagem do bot
    if (response.success) {
      // Ensure data is a Record<string, unknown> if needed
      const payload = (response.data && typeof response.data === 'object' && !Array.isArray(response.data))
        ? response.data as Record<string, unknown>
        : {};

      const dashboardMessage: ChatMessage = {
        id: `dashboard-${Date.now()}`,
        sender: 'bot',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          action: {
            type: 'DASHBOARD_COMMAND', // ✅ CORRIGIDO: Usando tipo correto
            payload,
            confidence: 1.0,
            requiresConfirmation: false,
            successMessage: response.message,
            errorMessage: '',
            isAutomated: true
          },
          actionExecuted: true,
          processingTime: 0
        }
      };
      
      setMessages(prev => [...prev, dashboardMessage]);
    }
  };

  const closeDashboard = () => {
    setShowDashboard(false);
    setDashboardCommand('');
  };


  // Novo: Submissão do formulário dinâmico
  const handleDynamicFormSubmit = async (values: Record<string, string | number>) => {
    setShowDynamicForm(false);
    // Mesclar valores preenchidos com o payload anterior
    const mergedPayload = { ...dynamicFormPayload, ...values };
    await executeAutomatedAction({
      type: dynamicFormAction as AutomatedAction['type'],
      payload: mergedPayload,
      confidence: 1,
      requiresConfirmation: false,
      successMessage: '',
      errorMessage: ''
    });
  };

  const handleDynamicFormCancel = () => {
    setShowDynamicForm(false);
    setDynamicFormFields([]);
    setDynamicFormAction('');
    setDynamicFormPayload({});
  };

  // ✅ NOVO: Função para mostrar toast de sucesso
  const showSuccessToast = (action: string, details: string) => {
    const messages = {
      'CREATE_GOAL': `🎯 Meta criada com sucesso! ${details}`,
      'CREATE_TRANSACTION': `📋 Transação registrada! ${details}`,
      'CREATE_INVESTMENT': `💼 Investimento adicionado! ${details}`,
      'UPDATE_GOAL': `🎯 Meta atualizada! ${details}`,
      'DELETE_GOAL': `🗑️ Meta removida! ${details}`,
      'UPDATE_TRANSACTION': `📋 Transação atualizada! ${details}`,
      'DELETE_TRANSACTION': `🗑️ Transação removida! ${details}`,
      'UPDATE_INVESTMENT': `💼 Investimento atualizado! ${details}`,
      'DELETE_INVESTMENT': `🗑️ Investimento removido! ${details}`
    };

    const message = messages[action as keyof typeof messages] || `✅ ${action} realizado com sucesso!`;
    toast.success(message);
  };

  // ✅ NOVO: Função para mostrar toast de erro
  const showErrorToast = (error: string) => {
    toast.error(`❌ ${error}`);
  };


  if (!user) return null;

  return (
    <>
      {/* Botão de toggle */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => handleToggle(!isOpen)}
          className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
            isOpen ? 'bg-red-500 hover:bg-red-600' : theme.button
          } text-white relative`}
          aria-label={isOpen ? 'Fechar chat' : 'Abrir chat'}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          {isPremiumUser && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-xs rounded-full px-2 py-1">
              <Sparkles size={12} />
            </span>
          )}
        </button>
      </div>

      {/* Chat principal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-24 right-6 w-[90vw] max-w-md h-[70vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col z-50 border-2 ${theme.border} overflow-hidden`}
          >
            {!activeSession ? (
              // Visualização de seleção de sessão
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {isMileagePage ? 'Consultas de Milhas' : 'Conversas'}
                  </h3>
                  <button
                    onClick={() => setIsNewSessionModalOpen(true)}
                    className={`${theme.button} text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2`}
                  >
                    {isMileagePage ? 'Nova Consulta' : 'Nova Conversa'}
                  </button>
                </div>
                
                {Array.isArray(sessions) && sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map(session => (
                      <div
                        key={session.chatId}
                        className="p-3 chat-border-bottom rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div 
                          className="cursor-pointer"
                          onClick={() => switchSession(session)}
                        >
                          <h4 className="font-medium text-gray-900 dark:text-white">{session.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(session.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => deleteSession(session.chatId)}
                            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                            title="Excluir conversa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma conversa encontrada</h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Comece uma nova conversa para interagir com o assistente
                    </p>
                    <button
                      onClick={startNewSession}
                      className={`${theme.button} text-white px-6 py-2 rounded-lg flex items-center gap-2`}
                    >
                      Iniciar Chat
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Chat ativo
              <>
                <header className={`${theme.headerBg} p-4 chat-border-bottom flex justify-between items-center`}>
                  <div>
                    <h3 className="font-bold chat-title">{activeSession.title}</h3>
                    <p className="text-xs chat-subtitle">
                      {isPremiumUser ? (
                        <span className="flex items-center gap-1">
                          <Sparkles size={12} /> {getPlanDisplayName()}
                        </span>
                      ) : 'Modo Básico'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSession(null)}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X size={18} />
                  </button>
                </header>

                <div className={`flex-1 p-4 overflow-y-auto ${theme.chatBg}`}>
                  <div className="space-y-6">
                    {messages.map((msg) => (
                      <AdvancedMessageBubble 
                        key={msg.id}
                        message={msg}
                        theme={theme}
                        _isPremium={isPremiumUser}
                        onFeedback={openFeedbackModal}
                        onActionConfirm={handleActionConfirm}
                        onActionEdit={handleActionEdit}
                        onActionCancel={handleActionCancel}
                      />
                    ))}
                    {isLoading && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                          <Bot className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
                        </div>
                        <div className="p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${theme.headerBg}`}>
                  <CommandBar 
                    onSubmit={handleSendMessage}
                    isLoading={isLoading}
                    theme={theme}
                    placeholder={isMileagePage 
                      ? "Pergunte sobre suas milhas, cartões ou resgates..."
                      : "Como posso te ajudar hoje?"
                    }
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de nova sessão */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold mb-4 dark:text-white">
              {isMileagePage ? 'Nova Consulta de Milhas' : 'Nova Conversa'}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {isMileagePage
                ? (isPremiumUser
                    ? "Você está iniciando uma nova consulta com o especialista premium em milhas. Posso analisar seus cartões, calcular pontos e otimizar seus resgates."
                    : "Você está iniciando uma nova consulta sobre milhas. Posso ajudar com dúvidas sobre programas de fidelidade e cartões de crédito.")
                : (isPremiumUser
                    ? "Você está iniciando uma nova sessão com o consultor financeiro premium. Posso executar ações automaticamente e analisar seus dados em tempo real."
                    : "Você está iniciando uma nova conversa com o assistente básico. Posso ajudar com dúvidas sobre o app e conceitos financeiros gerais.")}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsNewSessionModalOpen(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={startNewSession}
                disabled={isLoading}
                className={`px-4 py-2 ${theme.button} text-white rounded-lg disabled:opacity-50 flex items-center gap-2`}
              >
                {isLoading ? 'Iniciando...' : (isMileagePage ? 'Começar Consulta' : 'Começar Conversa')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de feedback */}
      <AnimatePresence>
        {feedbackModal.isOpen && (
          <FeedbackModal
            messageId={feedbackModal.messageId}
            onClose={closeFeedbackModal}
            onSubmit={handleFeedback}
          />
        )}
      </AnimatePresence>

      {/* 🎛️ Dashboard Dinâmico */}
      <DynamicDashboard
        isVisible={showDashboard}
        onClose={closeDashboard}
        chatbotCommand={dashboardCommand}
        onCommandResponse={handleDashboardResponse}
      />

      {/* Novo: Modal de formulário dinâmico */}
      {showDynamicForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold mb-4 dark:text-white">
              Preencha os campos obrigatórios para {dynamicFormAction}
            </h3>
            <DynamicForm
              _actionType={dynamicFormAction}
              missingFields={dynamicFormFields}
              onSubmit={handleDynamicFormSubmit}
              onCancel={handleDynamicFormCancel}
            />
          </motion.div>
        </div>
      )}

      {/* ToastContainer para notificações */}
      <ToastContainer />
    </>
  );
}

// Componente de Feedback Modal
const FeedbackModal = ({ messageId, onClose, onSubmit }: {
  messageId: string;
  onClose: () => void;
  onSubmit: (_feedback: { // eslint-disable-line no-unused-vars
    messageId: string;
    rating: number;
    helpful: boolean;
    comment: string;
    category: 'accuracy' | 'helpfulness' | 'clarity' | 'relevance';
    context: string;
  }) => void;
}) => {
  const [feedback, setFeedback] = useState({
    rating: 0,
    helpful: true,
    comment: '',
    category: 'helpfulness' as 'accuracy' | 'helpfulness' | 'clarity' | 'relevance'
  });

  const handleSubmit = () => {
    onSubmit({
      messageId,
      rating: feedback.rating,
      helpful: feedback.helpful,
      comment: feedback.comment,
      category: feedback.category,
      context: ''
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-lg font-bold mb-4 dark:text-white">Avalie esta resposta</h3>
        
        <div className="mb-4">
          <label className="block mb-2 dark:text-gray-300">Qualidade:</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                onClick={() => setFeedback({...feedback, rating: star})}
                className={`p-2 rounded-full transition-colors ${
                  feedback.rating >= star 
                    ? 'bg-yellow-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                <Star size={16} fill={feedback.rating >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 dark:text-gray-300">Foi útil?</label>
          <div className="flex gap-2">
            <button
              onClick={() => setFeedback({...feedback, helpful: true})}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                feedback.helpful 
                  ? 'bg-green-500 text-white border-green-500' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              <ThumbsUp size={16} className="mr-2" />
              Sim
            </button>
            <button
              onClick={() => setFeedback({...feedback, helpful: false})}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                !feedback.helpful 
                  ? 'bg-red-500 text-white border-red-500' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              <ThumbsDown size={16} className="mr-2" />
              Não
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 dark:text-gray-300">Categoria:</label>
          <select
            value={feedback.category}
            onChange={(e) => setFeedback({...feedback, category: e.target.value as 'accuracy' | 'helpfulness' | 'clarity' | 'relevance'})}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="helpfulness">Utilidade</option>
            <option value="accuracy">Precisão</option>
            <option value="clarity">Clareza</option>
            <option value="relevance">Relevância</option>
          </select>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 dark:text-gray-300">Comentário (opcional):</label>
          <textarea
            value={feedback.comment}
            onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
            placeholder="Conte-nos mais sobre sua experiência..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            rows={3}
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={feedback.rating === 0}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            Enviar Feedback
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

