import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  Bot, 
  Sparkles, ZapIcon,
  ClipboardList, Lightbulb, Target, Plane, BarChart2, CheckCircle, Edit3, XCircle
} from 'lucide-react';
import { chatbotAPI } from '../services/api';
import { chatbotDeleteAPI } from '../services/chatbotDeleteAPI';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Tipos para o sistema de automação inteligente
type AutomatedAction = {
  type: 'CREATE_TRANSACTION' | 'CREATE_INVESTMENT' | 'CREATE_GOAL' | 'ANALYZE_DATA' | 'GENERATE_REPORT' | 
        'CREATE_MILEAGE' | 'REDEEM_MILEAGE' | 'ANALYZE_MILEAGE' | 'CONNECT_PLUGGY' | 'CALCULATE_VALUE' |
        'DASHBOARD_COMMAND' | 'GREETING' | 'GENERAL_HELP' | 'FRUSTRATION' | 'CONFIRMATION' | 'UNKNOWN';
  payload: Record<string, unknown>; // Substituído de `any`
  confidence: number;
  requiresConfirmation: boolean;
  successMessage: string;
  errorMessage: string;
  followUpQuestions?: string[];
  isAutomated?: boolean;
};

interface CollectedData {
  [key: string]: string | number | Date | null | undefined;
}

interface Recommendation {
  title: string;
  action: string;
  content?: React.ReactNode; // Adicione esta linha
}

// Tipo simplificado para recomendações
interface SimpleRecommendation {
  title: string;
  action: string;
  id: string;
}

// Tipo seguro e compatível para mensagens de chat
type ChatMessage = {
  id: string;
  sender: 'user' | 'bot' | 'assistant';
  content: string;
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
    followUpQuestions?: string[];
    recommendations?: SimpleRecommendation[];
    nextSteps?: string[];
    isError?: boolean;
    isDataCollection?: boolean;
    currentField?: string;
    missingFields?: string[];
    collectedData?: CollectedData;
    isComplete?: boolean;
    actionType?: string;
    isRecommendations?: boolean;
    isNextSteps?: boolean;
    isSummary?: boolean;
  };
  isError?: boolean;
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

type ThemeType = {
  name: string;
  primary: string;
  secondary: string;
  gradient: string;
  bubbleUser: string;
  bubbleBot: string;
  text: string;
  icon: string;
  accent: string;
  button: string;
  border: string;
  chatBg: string;
  headerBg: string;
  inputBg: string;
};

interface AutomatedActionCardProps {
  action: AutomatedAction;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
  theme: ThemeType;
}

type DynamicFormValues = Record<string, string | number | Date>;

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
}: AutomatedActionCardProps) => {
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
  isPremium,
  onFeedback,
  onActionConfirm,
  onActionEdit,
  onActionCancel
}: { 
  message: ChatMessage; 
  theme: ThemeType;
  isPremium: boolean;
  onFeedback: (messageId: string) => void;
  onActionConfirm: (action: AutomatedAction) => void;
  onActionEdit: (action: AutomatedAction) => void;
  onActionCancel: (action: AutomatedAction) => void;
}) => {
  const copyToClipboard = async (text: string | React.ReactElement | React.ReactNode) => {
    try {
      if (typeof text === 'string') {
        await navigator.clipboard.writeText(text);
      } else if (React.isValidElement(text)) {
        await navigator.clipboard.writeText('Conteúdo copiado');
      } else {
        await navigator.clipboard.writeText(String(text || 'Conteúdo copiado'));
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
    if (value === null || value === undefined || (typeof value === 'object' && Object.keys(value).length === 0)) return '-';
    
    switch (field) {
      case 'valor':
      case 'valor_total':
        return `R$ ${Number(value).toFixed(2)}`;
      case 'data':
      case 'data_conclusao':
        return new Date(value as string | number | Date).toLocaleDateString('pt-BR');
      case 'tipo':
        return value === 'receita' ? 'Receita' : 'Despesa';
      default:
        return String(value);
    }
  };

  // 🎯 HANDLER PARA CLIQUE EM RECOMENDAÇÃO
  const handleRecommendationClick = (recommendation: Recommendation) => {
    if (recommendation.action) {
      // Simular envio de mensagem baseada na recomendação
      const message = getRecommendationMessage(recommendation.action);
      console.log('Recomendação clicada:', message);
      // O usuário pode enviar manualmente ou podemos enviar automaticamente
    }
  };

  // 🎯 OBTER MENSAGEM BASEADA NA AÇÃO DA RECOMENDAÇÃO
  const getRecommendationMessage = (action: string): string => {
    const recommendationMessages: Record<string, string> = {
      'VIEW_GOALS': 'Mostre minhas metas',
      'CREATE_TRANSACTION': 'Quero criar uma transação',
      'CREATE_GOAL': 'Quero criar uma meta',
      'VIEW_TRANSACTIONS': 'Mostre minhas transações',
      'VIEW_INVESTMENTS': 'Mostre meus investimentos'
    };
    
    return recommendationMessages[action] || action;
  };

  // Função auxiliar para validar mensagens
  const validateMessage = (message: any): message is ChatMessage => {
    return (
      typeof message.id === 'string' &&
      (message.sender === 'user' || message.sender === 'bot' || message.sender === 'assistant') &&
      (typeof message.content === 'string' || React.isValidElement(message.content)) &&
      message.timestamp instanceof Date
    );
  };

  // Implementar uma função de renderização simplificada
  const renderMessageContent = (content: string) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
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
            {renderMessageContent(message.content)}
            
            {/* Para recomendações */}
            {message.metadata?.recommendations?.map((rec) => (
              <div key={rec.id}>
                <strong>{rec.title}</strong>
                <p>{rec.action}</p>
              </div>
            ))}
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
                    {Object.entries(message.metadata.collectedData as CollectedData).map(([key, value]) => (
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
                        console.log('Recomeçar coleta de dados');
                      }}
                      className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                    >
                      🔄 Recomeçar
                    </button>
                  </div>
                </div>
              )}
             
              {/* 💡 RECOMENDAÇÕES SIMPLIFICADAS */}
              {message.metadata?.isRecommendations && message.metadata?.recommendations && Array.isArray(message.metadata.recommendations) && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb size={16} className="text-purple-600 dark:text-purple-400" />
                      <h4 className="font-bold text-sm text-purple-800 dark:text-purple-200">💡 Recomendações:</h4>
                    </div>
                    <div className="space-y-2">
                    {message.metadata.recommendations.map((rec: any, index: number) => (
                      <div key={`rec-${index}`} className="p-2 bg-purple-100 dark:bg-purple-800 rounded text-sm text-purple-700 dark:text-purple-300">
                        <strong>{rec?.title || 'Recomendação'}</strong>
                        {rec?.action && <p className="text-xs mt-1">{rec.action}</p>}
                      </div>
                      ))}
                    </div>
                  </div>
              )}

              {/* 🎯 PRÓXIMOS PASSOS */}
              {message.metadata?.isNextSteps && message.metadata?.nextSteps && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={16} className="text-orange-600 dark:text-orange-400" />
                      <h4 className="font-bold text-sm text-orange-800 dark:text-orange-200">🎯 Próximos passos:</h4>
                    </div>
                    <ul className="space-y-1">
                    {message.metadata.nextSteps.map((step, index) => (
                      <li key={`step-${index}`} className="text-sm text-orange-700 dark:text-orange-300 flex items-center">
                          <span className="mr-2">•</span>
                        {String(step)}
                        </li>
                      ))}
                    </ul>
                  </div>
              )}

              {/* Informações específicas de milhas */}
              {message.metadata?.pointsEarned && (
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
              {message.metadata?.analysisData && (
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
              {message.metadata?.suggestions && (
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
              <span className="text-gray-600 dark:text-gray-400">📋</span>
            </button>
            
            {message.sender === 'bot' && (
              <button 
                onClick={() => onFeedback(message.id)}
                className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                title="Dar feedback"
              >
                <span className="text-gray-600 dark:text-gray-400">👍</span>
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
  onSubmit: (message: string) => void; 
  isLoading: boolean;
  theme: ThemeType;
  placeholder: string;
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSubmit(message.trim());
        setMessage('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={`w-full px-4 py-3 rounded-lg ${theme.inputBg} text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
        />
        {message && (
          <button
            type="button"
            onClick={() => setMessage('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span className="text-gray-600 dark:text-gray-400">🗑️</span>
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className={`px-4 py-3 rounded-lg ${theme.button} text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2`}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-gray-600 dark:text-gray-400">💬</span>
        )}
      </button>
    </form>
  );
};

// Novo: Formulário dinâmico para campos obrigatórios
interface DynamicFormProps {
  actionType: string;
  missingFields: string[];
  onSubmit: (values: DynamicFormValues) => void;
  onCancel: () => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  missingFields,
  onSubmit,
  onCancel
}) => {
  const [values, setValues] = useState<DynamicFormValues>({});

  const handleChange = (field: string, value: string | number | Date) => {
    setValues((prev: DynamicFormValues) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
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
              value={typeof values[field] === 'object' && values[field] instanceof Date ? values[field].toISOString().split('T')[0] : String(values[field] || '')}
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
  const { subscription } = useAuth();
  const router = useRouter();
  
  // Estados principais
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{ messageId: string; isOpen: boolean }>({ messageId: '', isOpen: false });
  const [isMileagePage, setIsMileagePage] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardCommand, setDashboardCommand] = useState<string>('');
  const [showDynamicForm, setShowDynamicForm] = useState(false);
  const [dynamicFormFields, setDynamicFormFields] = useState<string[]>([]);
  const [dynamicFormAction, setDynamicFormAction] = useState<string>('');
  const [dynamicFormPayload, setDynamicFormPayload] = useState<Record<string, unknown>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Usar estado externo se fornecido, senão usar interno
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  
  // ✅ CORREÇÃO: Função de toggle que funciona em ambos os casos
  const handleToggle = () => {
    if (onToggle) {
      // Se há uma função onToggle fornecida, usá-la
      onToggle();
    } else if (externalIsOpen !== undefined) {
      // Se controlado externamente mas sem onToggle, apenas log para debug
      console.log('Toggle controlado externamente - isOpen:', externalIsOpen);
    } else {
      // Se controlado internamente, alternar o estado
      setInternalIsOpen(prev => !prev);
    }
  };

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
  const getExpertiseDisplay = () => {
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
      icon: '💬'
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
        content: typeof response.message === 'string' ? 
            response.message : 
            String(response.message),
        timestamp: new Date(),
        sender: 'bot',
        metadata: {
          ...response.metadata,
          recommendations: response.metadata?.recommendations?.map((rec: any, index: number) => ({
            title: rec?.title || '',
            action: rec?.action || '',
            id: rec?.id || `rec-${index}-${Date.now()}`
          }))
        }
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
        const formattedMessages: ChatMessage[] = response.messages.map((msg: Record<string, unknown>) => ({
          id: String((msg.metadata as Record<string, unknown>)?.messageId || msg._id || `msg-${Date.now()}-${Math.random()}`),
          sender: (msg.sender === 'assistant' ? 'bot' : (msg.sender || 'bot')) as 'user' | 'bot' | 'assistant',
          content: String(msg.content || 'Mensagem sem conteúdo'),
          timestamp: new Date(msg.timestamp as string | number || Date.now()),
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

  // ✅ REMOVIDO: Funções não utilizadas - o CommandBar tem seu próprio estado interno

  // Handlers para ações automatizadas
  const handleActionConfirmWithForm = async (action: AutomatedAction) => {
    // Se faltar campos obrigatórios, abrir formulário dinâmico
    if (action.requiresConfirmation && action.payload && Array.isArray(action.payload.missingFields)) {
      setDynamicFormFields(action.payload.missingFields as string[]);
      setDynamicFormAction(action.type);
      setDynamicFormPayload(action.payload);
      setShowDynamicForm(true);
      return;
    }
    await executeAutomatedAction(action);
  };

  const handleActionEdit = (action: AutomatedAction) => {
    // Implementar edição da ação
    console.log('Editar ação:', action);
    toast.info('Funcionalidade de edição em desenvolvimento');
  };

  const handleActionCancel = (action: AutomatedAction) => {
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
    category: 'accuracy' | 'helpfulness' | 'clarity' | 'relevance';
    context?: string;
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

  // 🎛️ FUNÇÕES DO DASHBOARD DINÂMICO
  const handleDashboardCommand = (command: string) => {
    setDashboardCommand(command);
    setShowDashboard(true);
  };

  const handleDashboardResponse = async (response: { success: boolean; message: string; data?: unknown }) => {
    // Adicionar resposta do dashboard como mensagem do bot
    if (response.success) {
      const dashboardMessage: ChatMessage = {
        id: `dashboard-${Date.now()}`,
        sender: 'bot',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          action: {
            type: 'DASHBOARD_COMMAND', // ✅ CORRIGIDO: Usando tipo correto
            payload: response.data as Record<string, unknown>,
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

  // 🎯 PROCESSAR COMANDOS ESPECIAIS DO CHATBOT
  const processSpecialCommands = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Comandos do dashboard
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('mostrar') || lowerMessage.includes('exibir')) {
      handleDashboardCommand(message);
      return true;
    }
    
    // Comandos de navegação
    if (lowerMessage.includes('ir para') || lowerMessage.includes('navegar para')) {
      if (lowerMessage.includes('transações') || lowerMessage.includes('gastos')) {
        router.push('/transacoes');
        return true;
      }
      if (lowerMessage.includes('metas') || lowerMessage.includes('objetivos')) {
        router.push('/goals');
        return true;
      }
      if (lowerMessage.includes('investimentos') || lowerMessage.includes('portfólio')) {
        router.push('/investimentos');
        return true;
      }
      if (lowerMessage.includes('relatórios') || lowerMessage.includes('análise')) {
        router.push('/relatorios');
        return true;
      }
    }
    
    return false;
  };

  // Novo: Submissão do formulário dinâmico
  const handleDynamicFormSubmit = async (values: Record<string, unknown>) => {
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
    const successMessages = {
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

    const message = successMessages[action as keyof typeof successMessages] || `✅ ${action} realizado com sucesso!`;
    toast.success(message);
  };

  // ✅ NOVO: Função para mostrar toast de erro
  const showErrorToast = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <ToastContainer />
      
      {/* Botão de toggle do chatbot - MELHORADO */}
      {!isOpen && (
        <div className="relative">
          {/* Efeito de pulsação para chamar atenção */}
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          
          <button
            onClick={handleToggle}
            className={`relative p-4 rounded-full shadow-xl ${theme.button} text-white hover:scale-110 active:scale-95 transition-all duration-300 ease-out hover:shadow-2xl group`}
            title="Abrir Finn - Assistente Financeiro"
            aria-label="Abrir chatbot"
          >
            <Bot className="w-6 h-6 group-hover:animate-bounce" />
            
            {/* Badge de notificação */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            
            {/* Tooltip melhorado */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              💬 Pergunte sobre suas finanças
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </button>
        </div>
      )}

      {/* Interface principal do chatbot - RESPONSIVA MELHORADA */}
      {isOpen && (
        <div className={`
          w-96 max-w-[calc(100vw-2rem)] 
          h-[600px] max-h-[calc(100vh-2rem)] 
          bg-white dark:bg-gray-900 
          rounded-xl shadow-2xl border ${theme.border} 
          flex flex-col
          animate-in slide-in-from-bottom-4 fade-in duration-300
          md:w-96 sm:w-80
        `}>
          {/* Header - MELHORADO */}
          <div className={`p-4 ${theme.headerBg} border-b ${theme.border} rounded-t-xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${theme.bubbleBot} relative`}>
                  <Bot className="w-5 h-5" />
                  {/* Status online */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {getExpertiseDisplay().title}
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getExpertiseDisplay().subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
                  {getPlanDisplayName()}
                </span>
                <button
                  onClick={handleToggle}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  title="Fechar chat"
                  aria-label="Fechar chatbot"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Área de mensagens - MELHORADA */}
          <div className={`flex-1 overflow-y-auto p-4 ${theme.chatBg} scroll-smooth`}>
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8 space-y-4">
                <div className="relative mx-auto w-16 h-16">
                  <Bot className="w-16 h-16 mx-auto opacity-50 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent rounded-full"></div>
                </div>
                <div>
                  <p className="text-lg font-medium mb-2">Olá! Eu sou o Finn 🤖</p>
                  <p className="text-sm">Seu assistente financeiro inteligente</p>
                  <p className="text-xs mt-2 opacity-75">Como posso ajudar você hoje?</p>
                </div>
                
                {/* Sugestões rápidas */}
                <div className="grid grid-cols-1 gap-2 mt-6 text-left">
                  {[
                    { icon: "💰", text: "Como organizar meu orçamento?" },
                    { icon: "📈", text: "Qual o melhor investimento?" },
                    { icon: "🎯", text: "Como definir metas financeiras?" },
                    { icon: "💱", text: "Cotação do dólar hoje" }
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(suggestion.text)}
                      className="p-3 text-left rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm border border-gray-200 dark:border-gray-700"
                    >
                      <span className="mr-2">{suggestion.icon}</span>
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <AdvancedMessageBubble
                    key={message.id}
                    message={message}
                    theme={theme}
                    isPremium={isPremiumUser}
                    onFeedback={openFeedbackModal}
                    onActionConfirm={handleActionConfirm}
                    onActionEdit={handleActionEdit}
                    onActionCancel={handleActionCancel}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Área de input */}
          <div className={`p-4 ${theme.headerBg} border-t ${theme.border} rounded-b-lg`}>
            <CommandBar
              onSubmit={handleSendMessage}
              isLoading={isLoading}
              theme={theme}
              placeholder="Digite sua mensagem..."
            />
          </div>
        </div>
      )}

      {/* Modal de nova sessão */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Nova Conversa</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Deseja iniciar uma nova conversa?
            </p>
            <div className="flex gap-2">
              <button
                onClick={startNewSession}
                disabled={isLoading}
                className={`flex-1 ${theme.button} text-white px-4 py-2 rounded-lg disabled:opacity-50`}
              >
                {isLoading ? 'Criando...' : 'Sim, criar'}
              </button>
              <button
                onClick={() => setIsNewSessionModalOpen(false)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulário dinâmico */}
      {showDynamicForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <DynamicForm
            actionType={dynamicFormAction}
            missingFields={dynamicFormFields}
            onSubmit={handleDynamicFormSubmit}
            onCancel={handleDynamicFormCancel}
          />
        </div>
      )}

      {/* Dashboard */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Dashboard</h3>
              <button
                onClick={closeDashboard}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="text-gray-600 dark:text-gray-300">
              <p>Comando: {dashboardCommand}</p>
              <p className="mt-2">Dashboard em desenvolvimento...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}