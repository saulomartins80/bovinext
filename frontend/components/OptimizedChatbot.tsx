import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, X, Send, Bot, 
  Sparkles, Lightbulb,
  Copy, ThumbsUp,
  Target, Trash2,
  CheckCircle, XCircle,
  Brain, Zap as ZapIcon,
  TrendingUp, Shield, Rocket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOptimizedChat } from '../src/hooks/useOptimizedChat';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ===== TIPOS ENTERPRISE =====
interface EnterpriseMessage {
  id: string;
  sender: 'user' | 'assistant' | 'bot';
  content: string | React.ReactElement;
  timestamp: Date;
  metadata?: {
    // Funcionalidades Enterprise
    reasoning?: string;
    actions?: Array<{
      type: string;
      description: string;
      executed: boolean;
    }>;
    insights?: {
      type: string;
      content: string;
      confidence: number;
    };
    confidence?: number;
    complexity?: number;
    personalityAdaptation?: {
      level: string;
      adjustments: string[];
    };
    
    // Funcionalidades existentes
    isStreaming?: boolean;
    isComplete?: boolean;
    actionExecuted?: boolean;
    requiresConfirmation?: boolean;
    recommendations?: Array<{
      title: string;
      action?: string;
      description?: string;
    }>;
    nextSteps?: string[];
    followUpQuestions?: string[];
    
    // Novos campos Enterprise
    userSophistication?: number;
    businessImpact?: number;
    automationSuccess?: boolean;
    competitiveAdvantage?: string[];
    roiProjection?: {
      timeSaved: string;
      moneySaved: string;
      decisionsImproved: string;
    };
  };
}

interface ChatbotProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

// ===== SISTEMA DE TEMAS ENTERPRISE =====
const getEnterpriseTheme = (plan?: string) => {
  const themes = {
    enterprise: {
      name: 'Enterprise',
      primary: '#6366f1',
      secondary: '#8b5cf6',
      gradient: 'from-indigo-600 via-purple-600 to-blue-600',
      bubbleUser: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      bubbleBot: 'bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800',
      text: 'text-gray-900 dark:text-white',
      icon: '🚀',
      accent: 'text-indigo-600 dark:text-indigo-400',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      border: 'border-indigo-300 dark:border-indigo-600',
      chatBg: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-900',
      headerBg: 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
      inputBg: 'bg-white dark:bg-gray-700 border-indigo-300 dark:border-indigo-600'
    },
    premium: {
      name: 'Premium',
      primary: '#f59e0b',
      secondary: '#d97706',
      gradient: 'from-amber-500 to-orange-600',
      bubbleUser: 'bg-gradient-to-r from-amber-500 to-orange-600',
      bubbleBot: 'bg-white dark:bg-gray-800 border-2 border-amber-200 dark:border-amber-800',
      text: 'text-gray-900 dark:text-white',
      icon: '⭐',
      accent: 'text-amber-600 dark:text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700',
      border: 'border-amber-300 dark:border-amber-600',
      chatBg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-amber-900',
      headerBg: 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm',
      inputBg: 'bg-white dark:bg-gray-700 border-amber-300 dark:border-amber-600'
    },
    default: {
      name: 'Standard',
      primary: '#3b82f6',
      secondary: '#1d4ed8',
      gradient: 'from-blue-500 to-blue-600',
      bubbleUser: 'bg-gradient-to-r from-blue-500 to-blue-600',
      bubbleBot: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      text: 'text-gray-900 dark:text-white',
      icon: '💬',
      accent: 'text-blue-600 dark:text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700',
      border: 'border-blue-300 dark:border-blue-600',
      chatBg: 'bg-gray-50 dark:bg-gray-800',
      headerBg: 'bg-white dark:bg-gray-900',
      inputBg: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
    }
  };

  if (plan?.toLowerCase().includes('enterprise')) return themes.enterprise;
  if (plan?.toLowerCase().includes('premium') || plan?.toLowerCase().includes('top')) return themes.premium;
  return themes.default;
};

// ===== COMPONENTE DE INSIGHTS ENTERPRISE =====
const EnterpriseInsights: React.FC<{ 
  insights: {
    type: string;
    content: string;
    confidence: number;
    userSophistication?: number;
    businessImpact?: number;
    roiProjection?: {
      timeSaved: string;
      moneySaved: string;
      decisionsImproved: string;
    };
    competitiveAdvantage?: string[];
  }; 
  theme: {
    accent: string;
    text: string;
    border: string;
    gradient: string;
  }; 
}> = ({ insights, theme }) => {
  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-4 p-4 rounded-lg border ${theme.border} bg-gradient-to-r ${theme.gradient} bg-opacity-10`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Brain className={`w-5 h-5 ${theme.accent}`} />
        <span className="font-semibold text-sm">Insights Enterprise</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        {insights.userSophistication && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Sofisticação:</span>
            <div className="flex items-center gap-1">
              <div className={`w-full bg-gray-200 rounded-full h-2`}>
                <div 
                  className={`bg-gradient-to-r ${theme.gradient} h-2 rounded-full`}
                  style={{ width: `${insights.userSophistication * 10}%` }}
                />
              </div>
              <span className="text-xs">{insights.userSophistication}/10</span>
            </div>
          </div>
        )}
        
        {insights.businessImpact && (
          <div>
            <span className="text-gray-600 dark:text-gray-400">Impacto:</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-medium">{insights.businessImpact}/10</span>
            </div>
          </div>
        )}
        
        {insights.roiProjection && (
          <div className="col-span-2">
            <span className="text-gray-600 dark:text-gray-400">ROI Projetado:</span>
            <div className="flex gap-4 mt-1 text-xs">
              <span>⏱️ {insights.roiProjection.timeSaved}</span>
              <span>💰 {insights.roiProjection.moneySaved}</span>
              <span>📈 {insights.roiProjection.decisionsImproved}</span>
            </div>
          </div>
        )}
      </div>
      
      {insights.competitiveAdvantage && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-600 dark:text-gray-400">Vantagens:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {insights.competitiveAdvantage.slice(0, 3).map((advantage: string, index: number) => (
              <span 
                key={index}
                className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs"
              >
                {advantage}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ===== COMPONENTE DE AÇÕES EXECUTADAS =====
const ExecutedActions: React.FC<{ 
  actions: Array<{
    type: string;
    description: string;
    executed: boolean;
    data?: {
      financial_health_score?: number;
      projected_savings?: string;
      expected_improvement?: string;
    };
  }>; 
  theme: {
    accent: string;
    text: string;
    border: string;
  }; 
}> = ({ actions, theme }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 space-y-2"
    >
      {actions.map((action, index) => (
        <div 
          key={index}
          className={`p-3 rounded-lg border ${theme.border} bg-green-50 dark:bg-green-900/20`}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-medium text-sm">Ação Executada</span>
          </div>
          
          {action.data && (
            <div className="text-sm space-y-1">
              {action.data.financial_health_score && (
                <div className="flex justify-between">
                  <span>Score de Saúde:</span>
                  <span className="font-medium">{action.data.financial_health_score}/100</span>
                </div>
              )}
              
              {action.data.projected_savings && (
                <div className="flex justify-between">
                  <span>Economia Projetada:</span>
                  <span className="font-medium text-green-600">R$ {action.data.projected_savings}</span>
                </div>
              )}
              
              {action.data.expected_improvement && (
                <div className="flex justify-between">
                  <span>Melhoria Esperada:</span>
                  <span className="font-medium text-blue-600">{action.data.expected_improvement}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
};

// ===== COMPONENTE DE MENSAGEM ENTERPRISE =====
const EnterpriseMessageBubble: React.FC<{
  message: EnterpriseMessage;
  theme: {
    accent: string;
    text: string;
    bubbleUser: string;
    bubbleBot: string;
    border: string;
    name: string;
    gradient: string;
  };
  onFeedback: (messageId: string) => void;
}> = ({ message, theme, onFeedback }) => {
  const isUser = message.sender === 'user';
  const isStreaming = message.metadata?.isStreaming;
  const confidence = message.metadata?.confidence || 0;
  
  console.log('[EnterpriseMessageBubble] Rendering message:', {
    id: message.id,
    sender: message.sender,
    content: typeof message.content === 'string' ? message.content.substring(0, 50) + '...' : '[ReactElement]',
    isStreaming,
    timestamp: message.timestamp
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {!isUser && (
          <div className={`w-8 h-8 rounded-full ${theme.bubbleBot} flex items-center justify-center mb-2 border-2 ${theme.border}`}>
            {theme.name === 'Enterprise' ? <Rocket className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
        )}
        
        {/* Bubble */}
        <div className={`
          px-4 py-3 rounded-2xl shadow-sm
          ${isUser 
            ? `${theme.bubbleUser} text-white` 
            : `${theme.bubbleBot} ${theme.text}`
          }
          ${isStreaming ? 'animate-pulse' : ''}
        `}>
          {/* Conteúdo */}
          <div className="whitespace-pre-wrap">
            {typeof message.content === 'string' ? message.content : message.content}
          </div>
          
          {/* Indicador de confiança */}
          {!isUser && confidence > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
              <Shield className="w-3 h-3" />
              <span>Confiança: {Math.round(confidence * 100)}%</span>
            </div>
          )}
          
          {/* Streaming indicator */}
          {isStreaming && (
            <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span>Processando...</span>
            </div>
          )}
        </div>
        
        {/* Insights Enterprise */}
        {!isUser && message.metadata?.insights && (
          <EnterpriseInsights insights={message.metadata.insights} theme={theme} />
        )}
        
        {/* Ações Executadas */}
        {!isUser && message.metadata?.actions && (
          <ExecutedActions actions={message.metadata.actions} theme={theme} />
        )}
        
        {/* Recomendações */}
        {!isUser && message.metadata?.recommendations && message.metadata.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-2"
          >
            <div className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Recomendações:
            </div>
            {message.metadata.recommendations.map((rec, index) => (
              <div key={index} className={`p-2 rounded border ${theme.border} bg-yellow-50 dark:bg-yellow-900/20`}>
                <div className="font-medium text-sm">{rec.title}</div>
                {rec.description && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.description}</div>
                )}
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Próximos Passos */}
        {!isUser && message.metadata?.nextSteps && message.metadata.nextSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 space-y-2"
          >
            <div className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Próximos Passos:
            </div>
            {message.metadata.nextSteps.map((step, index) => (
              <div key={index} className={`p-2 rounded border ${theme.border} bg-blue-50 dark:bg-blue-900/20`}>
                <div className="text-sm flex items-center gap-2">
                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  {step}
                </div>
              </div>
            ))}
          </motion.div>
        )}
        
        {/* Timestamp e ações */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{message.timestamp.toLocaleTimeString()}</span>
          
          {!isUser && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(typeof message.content === 'string' ? message.content : '')}
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => onFeedback(message.id)}
                className="hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
export default function OptimizedChatbot({ isOpen: externalIsOpen, onToggle }: ChatbotProps) {
  const { subscription } = useAuth();
  
  // Estados principais
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [, setFeedbackModal] = useState<{ messageId: string; isOpen: boolean }>({ 
    messageId: '', 
    isOpen: false 
  });
  
  // Hook otimizado
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    chatId,
    connectionStatus,
    sendMessage,
    createSession,
    clearMessages,
    retryLastMessage,
    cancelCurrentRequest,
    hasMessages
  } = useOptimizedChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Usar estado externo se fornecido, senão usar interno
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleToggle = externalIsOpen !== undefined ? onToggle || (() => {}) : setInternalIsOpen;

  // Detectar se é usuário premium/enterprise
  const isPremiumUser = subscription?.status === 'active' && (
    subscription?.plan === 'premium' || 
    subscription?.plan === 'enterprise' ||
    (subscription?.plan && typeof subscription.plan === 'string' && 
     (subscription.plan.toLowerCase().includes('top') || 
      subscription.plan.toLowerCase().includes('premium') ||
      subscription.plan.toLowerCase().includes('enterprise')))
  );

  // Tema enterprise
  const theme = getEnterpriseTheme(subscription?.plan?.toString());

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Criar sessão inicial
  useEffect(() => {
    if (isOpen && !chatId) {
      createSession();
    }
  }, [isOpen, chatId, createSession]);

  // Handler para envio de mensagem
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    try {
      // Sempre usar streaming para usuários premium/enterprise (você tem Plano Top Anual)
      const useStreaming = true; // Forçar streaming
      console.log('[OptimizedChatbot] Enviando mensagem com streaming:', { content, useStreaming, isPremiumUser });
      await sendMessage(content, { useStreaming });
      setInputValue('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erro ao enviar mensagem');
    }
  }, [sendMessage, isPremiumUser]);

  // Handler para feedback
  const handleFeedback = useCallback((messageId: string) => {
    setFeedbackModal({ messageId, isOpen: true });
  }, []);

  // Converter mensagens para formato Enterprise
  const enterpriseMessages: EnterpriseMessage[] = messages.map(msg => ({
    ...msg,
    metadata: {
      ...msg.metadata,
      // Adicionar campos enterprise se disponíveis
      reasoning: msg.metadata?.reasoning,
      actions: msg.metadata?.actions,
      insights: msg.metadata?.insights,
      confidence: msg.metadata?.confidence,
      complexity: msg.metadata?.complexity,
      personalityAdaptation: msg.metadata?.personalityAdaptation,
      userSophistication: msg.metadata?.userSophistication,
      businessImpact: msg.metadata?.businessImpact,
      automationSuccess: msg.metadata?.automationSuccess,
      roiProjection: msg.metadata?.roiProjection,
      competitiveAdvantage: msg.metadata?.competitiveAdvantage
    }
  }));

  // Debug: Log das mensagens
  console.log('[OptimizedChatbot] Raw messages from hook:', messages);
  console.log('[OptimizedChatbot] Enterprise messages:', enterpriseMessages);
  console.log('[OptimizedChatbot] Messages length:', enterpriseMessages.length);

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => handleToggle(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 ${theme.button} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden"
      >
        {/* Header Enterprise */}
        <div className={`${theme.headerBg} border-b border-gray-200 dark:border-gray-700 p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${theme.bubbleBot} flex items-center justify-center border-2 ${theme.border}`}>
                {theme.name === 'Enterprise' ? <Rocket className="w-5 h-5" /> : theme.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm">Finn {theme.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' : 
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span>{connectionStatus === 'connected' ? 'Online' : 
                         connectionStatus === 'connecting' ? 'Conectando...' : 'Offline'}</span>
                  {isStreaming && <span className="text-blue-500">• Streaming</span>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasMessages && (
                <button
                  onClick={clearMessages}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Limpar conversa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => handleToggle(!isOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-4 ${theme.chatBg}`}>
          {enterpriseMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className={`w-16 h-16 rounded-full ${theme.bubbleBot} flex items-center justify-center mx-auto mb-4 border-2 ${theme.border}`}>
                {theme.name === 'Enterprise' ? <Rocket className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
              </div>
              <h4 className="font-medium mb-2">Olá! Sou o Finn {theme.name}</h4>
              <p className="text-sm">
                {theme.name === 'Enterprise' 
                  ? 'Seu consultor financeiro com IA avançada e automação inteligente.'
                  : 'Como posso ajudar você hoje?'
                }
              </p>
            </div>
          ) : (
            enterpriseMessages.map((message, index) => {
              console.log(`[OptimizedChatbot] Rendering message ${index}:`, message);
              return (
                <EnterpriseMessageBubble
                  key={message.id}
                  message={message}
                  theme={theme}
                  onFeedback={handleFeedback}
                />
              );
            })
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4"
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                <button
                  onClick={retryLastMessage}
                  className="ml-auto text-xs text-red-600 hover:text-red-800 underline"
                >
                  Tentar novamente
                </button>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputValue)}
              placeholder={
                theme.name === 'Enterprise' 
                  ? 'Digite sua solicitação financeira...'
                  : 'Digite sua mensagem...'
              }
              className={`flex-1 px-4 py-2 rounded-lg ${theme.inputBg} focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm`}
              disabled={isLoading || isStreaming}
            />
            
            {isLoading || isStreaming ? (
              <button
                onClick={cancelCurrentRequest}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className={`p-2 ${theme.button} text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Status indicators */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {isPremiumUser && (
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-yellow-500" />
                  {theme.name}
                </span>
              )}
              
              {isStreaming && (
                <span className="flex items-center gap-1 text-blue-500">
                  <ZapIcon className="w-3 h-3" />
                  Streaming ativo
                </span>
              )}
            </div>
            
            <span>{enterpriseMessages.length} mensagens</span>
          </div>
        </div>
      </motion.div>

      <ToastContainer
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}
