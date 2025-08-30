import { useState, useCallback, useRef, useEffect } from 'react';
import { chatbotAPI } from '../../services/api';

// ===== TIPOS OTIMIZADOS =====
interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    responseTime?: number;
    cached?: boolean;
    actionExecuted?: boolean;
    automationData?: {
      type: string;
      success: boolean;
      data: Record<string, unknown>;
    };
    requiresConfirmation?: boolean;
    actionData?: {
      type: string;
      entities: Record<string, unknown>;
      userId: string;
    };
    entities?: Record<string, unknown>;
    isStreaming?: boolean;
    isComplete?: boolean;
    // Enterprise AI Engine properties 
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
    complexity?: number;
    personalityAdaptation?: {
      level: string;
      adjustments: string[];
    };
    userSophistication?: number;
    businessImpact?: number;
    automationSuccess?: boolean;
    roiProjection?: {
      value: number;
      timeframe: string;
    };
  };
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  chatId: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  pendingAction?: { action: string; payload: Record<string, unknown>; autoExecute?: boolean; executed?: boolean } | null;
}

interface SendMessageOptions {
  useStreaming?: boolean;
  priority?: 'high' | 'normal' | 'low';
}

// ===== SISTEMA DE CACHE INTELIGENTE =====
class MessageCache {
  private cache = new Map<string, ChatMessage[]>();
  private maxSize = 10; // Máximo 10 conversas em cache
  private ttl = 30 * 60 * 1000; // 30 minutos

  set(chatId: string, messages: ChatMessage[]): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as string;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(chatId, messages);
  }

  get(chatId: string): ChatMessage[] | null {
    return this.cache.get(chatId) || null;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(chatId: string): void {
    this.cache.delete(chatId);
  }
}

// ===== HOOK PRINCIPAL OTIMIZADO =====
export const useOptimizedChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isStreaming: false,
    error: null,
    chatId: null,
    connectionStatus: 'connected', // Iniciar como conectado
    pendingAction: null
  });

  // Refs para performance
  const messageCache = useRef(new MessageCache());
  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Utilitário de atualização de estado deve vir antes de efeitos que o usam
  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // ===== VERIFICAÇÃO DE SAÚDE DO BACKEND =====
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const res = await chatbotAPI.healthCheck();
        updateState({ connectionStatus: res ? 'connected' : 'disconnected' });
      } catch (error) {
        console.warn('[useOptimizedChat] Backend health check failed:', error);
        updateState({ connectionStatus: 'disconnected' });
      }
    };

    // Verificar saúde na inicialização
    checkBackendHealth();
    
    // Verificar saúde periodicamente (a cada 30 segundos)
    const healthInterval = setInterval(checkBackendHealth, 30000);
    
    return () => clearInterval(healthInterval);
  }, [updateState]);

  // ===== UTILITÁRIOS =====
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    console.log('[useOptimizedChat] Adding message:', message);
    setState(prev => {
      const newMessages = [...prev.messages, message];
      console.log('[useOptimizedChat] New messages array:', newMessages);
      
      // Cache das mensagens
      if (prev.chatId) {
        messageCache.current.set(prev.chatId, newMessages);
      }
      
      return { ...prev, messages: newMessages };
    });
  }, []);

  // Helper: extrair dados de transação do texto do streaming
  const extractTransactionFromText = (text: string): Record<string, unknown> | null => {
    try {
      const clean = text.replace(/\u00a0/g, ' ');
      // Valor: aceita com ou sem R$
      const valorMatch = clean.match(/R\$\s*([0-9]{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)/i) ||
                         clean.match(/\b(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)\b/);
      const valor = valorMatch ? Number(valorMatch[1].replace('.', '').replace(',', '.')) : undefined;
      // Categoria gasolina/transporte
      let categoria: string | undefined;
      if (/gasolin|etanol|combust/i.test(clean)) categoria = 'Transporte';
      // Forma de pagamento
      const formaPagamento = /cr[ée]dito/i.test(clean)
        ? 'cartao_credito'
        : (/d[ée]bito/i.test(clean) ? 'cartao_debito' : (/pix/i.test(clean) ? 'pix' : (/dinheiro/i.test(clean) ? 'dinheiro' : undefined)));
      // Descrição
      let descricao: string | undefined;
      if (/gasolin|etanol/i.test(clean)) descricao = 'Gasto com combustível';

      if (valor !== undefined) {
        return {
          valor,
          tipo: 'despesa',
          categoria: categoria || 'Outros',
          descricao: descricao || 'Transação registrada via assistente',
          data: new Date().toISOString(),
          forma_pagamento: formaPagamento
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  // Helper: extrair dados de meta do texto do streaming
  const extractGoalFromText = (text: string, entities?: Record<string, unknown>): Record<string, unknown> | null => {
    try {
      const clean = String(text || '').replace(/\u00a0/g, ' ');
      const valorMatch = clean.match(/R\$\s*([0-9]+(?:[.,][0-9]{1,2})?)/i);
      const valor_total = valorMatch ? Number(valorMatch[1].replace('.', '').replace(',', '.')) : undefined;

      // Meta/objetivo
      let meta: string | undefined = undefined;
      const objetivos = ['viagem', 'celular', 'tv', 'carro', 'casa', 'curso', 'computador', 'notebook'];
      for (const alvo of objetivos) {
        if (new RegExp(alvo, 'i').test(clean)) { meta = `Comprar/Planejar ${alvo}`; break; }
      }
      if (!meta) meta = 'Meta do usuário';

      // Prazos "em X meses"
      const prazoMatch = clean.match(/em\s+(\d{1,2})\s+mes/i);
      let data_conclusao: string | undefined = undefined;
      if (prazoMatch) {
        const meses = parseInt(prazoMatch[1], 10);
        const dt = new Date();
        dt.setMonth(dt.getMonth() + (isNaN(meses) ? 0 : meses));
        data_conclusao = dt.toISOString();
      }

      const merged: Record<string, unknown> = {
        valor_total,
        meta,
        valor_atual: 0,
        data_conclusao
      };

      // Mesclar entities se fornecidas pelo backend
      if (entities && typeof entities === 'object') {
        Object.assign(merged, entities);
      }

      if (merged.valor_total || merged.meta) {
        return merged;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Helper: extrair dados de investimento do texto do streaming
  const extractInvestmentFromText = (text: string, entities?: Record<string, unknown>): Record<string, unknown> | null => {
    try {
      const clean = String(text || '').replace(/\u00a0/g, ' ');
      const valorMatch = clean.match(/R\$\s*([0-9]+(?:[.,][0-9]{1,2})?)/i);
      const valor = valorMatch ? Number(valorMatch[1].replace('.', '').replace(',', '.')) : undefined;
      // Nome do ativo: palavras comuns
      const papeis = ['tesouro', 'cdb', 'poupan', 'fundo', 'ações', 'acao', 'ETF'];
      let nome: string | undefined;
      for (const k of papeis) {
        if (new RegExp(k, 'i').test(clean)) { nome = k.toUpperCase(); break; }
      }
      // Ticker simples (ex: PETR4, VALE3)
      const tickerMatch = clean.match(/\b[A-Z]{4}\d\b/);
      if (tickerMatch) nome = tickerMatch[0];

      const merged: Record<string, unknown> = { valor, nome, tipo: 'aporte' };
      if (entities && typeof entities === 'object') Object.assign(merged, entities);

      if (merged.valor || merged.nome) {
        return merged;
      }
      return null;
    } catch {
      return null;
    }
  };

  // ===== CRIAÇÃO DE SESSÃO OTIMIZADA =====
  const createSession = useCallback(async (): Promise<string> => {
    try {
      updateState({ isLoading: true, error: null });
      const data = await chatbotAPI.startNewSession();
      if (!data?.success || !data?.chatId) {
        throw new Error(data?.message || 'Erro ao criar sessão');
      }
      const chatId = data.chatId as string;
      updateState({ chatId, isLoading: false });
      return chatId;
    } catch (error) {
      console.error('[useOptimizedChat] Error creating session:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Erro ao criar sessão',
        isLoading: false 
      });
      throw error;
    }
  }, [updateState]);

  // Executa ação pendente e envia feedback ao chat
  const executePendingAction = useCallback(async () => {
    if (!state.pendingAction || state.pendingAction.executed) return;
    
    try {
      const { action, payload } = state.pendingAction;
      console.log('[useOptimizedChat] Executing pending action:', action, payload);
      
      // Executar ação baseada no tipo
      switch (action) {
        case 'CREATE_TRANSACTION':
          // Implementar criação de transação
          break;
        case 'CREATE_GOAL':
          // Implementar criação de meta
          break;
        case 'CREATE_INVESTMENT':
          // Implementar criação de investimento
          break;
      }
      
      // Marcar como executada
      setState(prev => ({
        ...prev,
        pendingAction: prev.pendingAction ? { ...prev.pendingAction, executed: true } : null
      }));
    } catch (error) {
      console.error('[useOptimizedChat] Error executing pending action:', error);
    }
  }, [state.pendingAction]);

  // ===== EXECUÇÃO PRINCIPAL =====
  const sendMessage = useCallback(async (
    content: string, 
    options: SendMessageOptions = {}
  ): Promise<void> => {
    const { useStreaming = false } = options;
    
    if (!content.trim()) return;

    // ===== ESCOLHA DO MÉTODO DE ENVIO =====

    // ===== STREAMING OTIMIZADO =====
    const sendStreamingMessage = async (
      content: string, 
      chatId: string
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Fechar conexão anterior se existir
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }

        updateState({ connectionStatus: 'connecting' });

        // Iniciar stream via service centralizado
        chatbotAPI.openStream({ message: content, chatId }).then((eventSource) => {
          eventSourceRef.current = eventSource;
          console.log('[useOptimizedChat] EventSource created, readyState:', eventSource.readyState);

          const streamingMessage: ChatMessage = {
            id: generateMessageId(),
            sender: 'assistant',
            content: '',
            timestamp: new Date(),
            metadata: { isStreaming: true, isComplete: false }
          };

          let hasStarted = false; // torna-se true ao receber o primeiro chunk
          let messageAdded = false; // controla se a bolha já foi inserida
          let timeoutId: NodeJS.Timeout;

          // Timeout para detectar se não recebemos dados
          const resetTimeout = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              if (!hasStarted) {
                console.warn('[useOptimizedChat] No data received within timeout, closing connection');
                eventSource.close();
                reject(new Error('No data received from server'));
              }
            }, 30000); // Reduzido para 30 segundos
          };

          // Iniciar timeout apenas depois de um delay para dar tempo da conexão estabelecer
          setTimeout(() => {
            if (!hasStarted && eventSource.readyState !== EventSource.CLOSED) {
              resetTimeout();
            }
          }, 5000); // Aguardar 5 segundos antes de iniciar o timeout

          eventSource.onopen = () => {
            console.log('[useOptimizedChat] EventSource opened, readyState:', eventSource.readyState);
            updateState({ connectionStatus: 'connected' });
            // Não altera hasStarted aqui; apenas marca conexão aberta
          };

          // Adicionar log de estado da conexão
          const checkConnectionState = setInterval(() => {
            console.log('[useOptimizedChat] EventSource readyState:', eventSource.readyState, {
              CONNECTING: 0,
              OPEN: 1,
              CLOSED: 2,
              current: eventSource.readyState
            });
            
            if (eventSource.readyState === EventSource.CLOSED) {
              console.error('[useOptimizedChat] EventSource closed unexpectedly');
              clearInterval(checkConnectionState);
            } else if (eventSource.readyState === EventSource.OPEN && !hasStarted) {
              console.log('[useOptimizedChat] EventSource is OPEN but no data received yet');
            }
          }, 2000);

          // Limpar interval após um tempo
          setTimeout(() => {
            clearInterval(checkConnectionState);
          }, 20000);

          // Listener para evento de conexão inicial
          eventSource.addEventListener('connected', (event) => {
            console.log('[useOptimizedChat] Stream connected:', event.data);
            if (!messageAdded) {
              addMessage(streamingMessage);
              messageAdded = true;
              updateState({ isStreaming: true, isLoading: true });
            }
            if (timeoutId) clearTimeout(timeoutId);
            // Se não receber nenhum chunk após conectar, fechar e fazer fallback
            timeoutId = setTimeout(() => {
              if (!hasStarted) {
                console.warn('[useOptimizedChat] No chunks after connected, closing and falling back');
                eventSource.close();
                reject(new Error('No chunks after connected'));
              }
            }, 15000);
          });

          const handleIncoming = (raw: MessageEvent) => {
            try {
              let data: Record<string, unknown>;
              try {
                data = JSON.parse(raw.data as string);
              } catch {
                data = { chunk: String((raw.data ?? '')), isComplete: false };
              }
              if (typeof data?.chunk !== 'string') {
                data.chunk = String(data?.chunk ?? '');
              }
              
              if (!messageAdded) {
                addMessage(streamingMessage);
                messageAdded = true;
                updateState({ isStreaming: true, isLoading: true });
              }
              if (!hasStarted) {
                hasStarted = true;
                if (timeoutId) clearTimeout(timeoutId);
              }

              if (data.chunk) {
                streamingMessage.content += data.chunk;
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg => 
                    msg.id === streamingMessage.id 
                      ? { ...streamingMessage, metadata: { ...streamingMessage.metadata, isStreaming: true, isComplete: false } }
                      : msg
                  )
                }));
              }

              if (data.isComplete) {
                streamingMessage.metadata = { ...streamingMessage.metadata, isStreaming: false, isComplete: true };
                setState(prev => ({
                  ...prev,
                  messages: prev.messages.map(msg => (msg.id === streamingMessage.id ? { ...streamingMessage } : msg))
                }));
                if (timeoutId) clearTimeout(timeoutId);
                updateState({ isStreaming: false, isLoading: false });
                // NÃO FECHAR AINDA - aguardar metadados
                // eventSource.close();
                // resolve();
              }
            } catch (error) {
              console.error('[useOptimizedChat] Error handling stream data:', error);
            }
          };

          eventSource.addEventListener('chunk', handleIncoming);
          // Captura fallback caso o backend envie como evento padrão "message"
          eventSource.addEventListener('message', handleIncoming);
          
          // Log all events for debugging
          eventSource.addEventListener('open', () => {
            console.log('[useOptimizedChat] EventSource opened');
          });
          
          eventSource.addEventListener('error', (error) => {
            console.log('[useOptimizedChat] EventSource error:', error);
          });
          
          // Listen for ALL events
          eventSource.onmessage = (event) => {
            console.log('[useOptimizedChat] Raw onmessage event:', event);
            console.log('[useOptimizedChat] Event type:', event.type);
            console.log('[useOptimizedChat] Event data:', event.data);
          };
          
          // Capturar metadados de intenção/ações
          eventSource.addEventListener('metadata', (event) => {
            try {
              const meta = JSON.parse((event as MessageEvent).data as string);
              console.log('[useOptimizedChat] ===== METADATA EVENT RECEIVED =====');
              console.log('[useOptimizedChat] Raw event:', event);
              console.log('[useOptimizedChat] Event data:', (event as MessageEvent).data);
              console.log('[useOptimizedChat] Parsed metadata:', meta);
              console.log('[useOptimizedChat] requiresConfirmation:', meta?.requiresConfirmation);
              console.log('[useOptimizedChat] actionData:', meta?.actionData);
              
              // Processar actionData do backend (novo formato)
              if (meta?.requiresConfirmation && meta?.actionData) {
                console.log('[useOptimizedChat] Processing actionData:', meta.actionData);
                console.log('[useOptimizedChat] SETTING PENDING ACTION NOW!');
                
                // ATUALIZAR A MENSAGEM COM OS METADADOS CORRETOS
                if (streamingMessage) {
                  streamingMessage.metadata = {
                    ...streamingMessage.metadata,
                    requiresConfirmation: true,
                    actionData: meta.actionData,
                    intent: meta.intent,
                    entities: meta.entities,
                    confidence: meta.confidence
                  };
                  console.log('[useOptimizedChat] Updated streamingMessage.metadata:', streamingMessage.metadata);
                  
                  // FORÇAR ATUALIZAÇÃO IMEDIATA DO ESTADO
                  setState(prev => {
                    const newState = {
                      ...prev,
                      pendingAction: { 
                        action: meta.actionData.type, 
                        payload: meta.actionData.entities || {}, 
                        autoExecute: false, 
                        executed: false 
                      },
                      // ATUALIZAR MENSAGENS COM METADADOS
                      messages: prev.messages.map(msg => 
                        msg.id === streamingMessage?.id 
                          ? { ...streamingMessage }
                          : msg
                      )
                    };
                    console.log('[useOptimizedChat] New state with pendingAction:', newState.pendingAction);
                    console.log('[useOptimizedChat] Updated message with metadata:', newState.messages.find(m => m.id === streamingMessage?.id));
                    return newState;
                  });
                }
              }
              // Fallback para formato antigo
              else if (meta?.intent && typeof streamingMessage?.content === 'string') {
                const intent = String(meta.intent);
                if (['CREATE_TRANSACTION', 'CREATE_GOAL', 'CREATE_INVESTMENT'].includes(intent)) {
                  let payload: Record<string, unknown> | null = null;
                  if (intent === 'CREATE_TRANSACTION') {
                    payload = extractTransactionFromText(streamingMessage.content);
                  } else if (intent === 'CREATE_GOAL') {
                    payload = extractGoalFromText(streamingMessage.content, meta.entities);
                  } else if (intent === 'CREATE_INVESTMENT') {
                    payload = extractInvestmentFromText(streamingMessage.content, meta.entities);
                  }
                  const autoExecute = Number(meta?.confidence) >= 0.85 && !!payload;
                  setState(prev => ({
                    ...prev,
                    pendingAction: { action: intent, payload: payload || {}, autoExecute, executed: false }
                  }));
                }
              }
            } catch (e) {
              console.warn('[useOptimizedChat] Failed to parse metadata:', e);
            }
          });

          eventSource.addEventListener('complete', async () => {
            console.log('[useOptimizedChat] Stream completed');
            
            // Aguardar um pouco para garantir que metadados foram processados
            setTimeout(() => {
              setState(prev => ({
                ...prev,
                messages: prev.messages.map(msg => 
                  msg.id === streamingMessage.id 
                    ? { 
                        ...streamingMessage, 
                        metadata: {
                          ...streamingMessage.metadata,
                          isComplete: true
                        }
                      }
                    : msg
                )
              }));
              
              updateState({ 
                isStreaming: false, 
                isLoading: false,
                connectionStatus: 'connected'
              });
              
              try {
                const currentState = { ...state };
                const shouldAuto = currentState.pendingAction?.autoExecute && !currentState.pendingAction?.executed;
                if (shouldAuto && currentState.chatId) {
                  executePendingAction();
                }
              } finally {
                eventSource.close();
                resolve();
              }
            }, 500); // Aguardar 500ms para metadados
          });

          // Tratamento de erro mais específico: não acionar fallback prematuro
          eventSource.addEventListener('error', (event) => {
            console.warn('[useOptimizedChat] EventSource error (não crítico, aguardando reconexão/timeout):', {
              event,
              readyState: eventSource.readyState
            });
            // Não rejeitar aqui; deixar o timeout cuidar do fallback
          });
        });
      });
    };

    try {
      // Confirmação de ação pendente: se usuário disser "sim"
      const isConfirm = /^(sim|pode confirmar|confirmo|ok|pode|confirma)$/i.test(content.trim());
      if (isConfirm && state.pendingAction && (state.chatId || null)) {
        const action = state.pendingAction;
        try {
          updateState({ isLoading: true });
          const result = await chatbotAPI.executeAction({ 
            action: action.action, 
            payload: action.payload, 
            chatId: state.chatId as string,
            message: content // 🔧 CORREÇÃO: Adicionar mensagem para evitar erro "Mensagem é obrigatória"
          });
          const successText = result?.text || '✅ Ação executada com sucesso!';
          const botMessage: ChatMessage = {
            id: generateMessageId(),
            sender: 'assistant',
            content: successText,
            timestamp: new Date(),
            metadata: { actions: [{ type: action.action, description: 'Executada', executed: true }] }
          };
          addMessage(botMessage);
          updateState({ isLoading: false, pendingAction: null });
          return;
        } catch (error) {
          console.error('[useOptimizedChat] Error executing action:', error);
          updateState({ isLoading: false, error: 'Erro ao executar ação' });
          return;
        }
      }

      // Criar nova sessão se necessário
      if (!state.chatId) {
        await createSession();
      }

      // Adicionar mensagem do usuário
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        sender: 'user',
        content,
        timestamp: new Date()
      };
      addMessage(userMessage);
      updateState({ isLoading: true, error: null });

      // Usar streaming se disponível
      if (useStreaming) {
        await sendStreamingMessage(content, state.chatId || '');
      } else {
        // Fallback to regular message - implement basic message sending
        const response = await chatbotAPI.sendQuery({
          message: content,
          chatId: state.chatId || ''
        });
        const botMessage: ChatMessage = {
          id: generateMessageId(),
          sender: 'assistant',
          content: response.text || 'Resposta recebida',
          timestamp: new Date(),
          metadata: response.metadata
        };
        addMessage(botMessage);
      }
    } catch (error) {
      console.error('[useOptimizedChat] Error in sendMessage:', error);
      updateState({ 
        error: error instanceof Error ? error.message : 'Erro ao enviar mensagem',
        isLoading: false,
        isStreaming: false
      });
    }
  }, [state, createSession, addMessage, updateState, generateMessageId, executePendingAction]);

  // Atualizar refs quando as funções mudarem
  useEffect(() => {
    // sendRegularMessageRef.current = sendRegularMessage; // This line is removed as per the edit hint
  }, []); // Empty dependency array as sendRegularMessage and sendStreamingMessage are now defined inline

  useEffect(() => {
    // sendStreamingMessageRef.current = sendStreamingMessage; // This line is removed as per the edit hint
  }, []); // Empty dependency array as sendRegularMessage and sendStreamingMessage are now defined inline

  // ===== LIMPEZA E UTILITÁRIOS =====
  const clearMessages = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: null
    }));
    messageCache.current.clear();
  }, []);

  const clearPendingAction = useCallback(() => {
    setState(prev => ({ ...prev, pendingAction: null }));
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = state.messages.filter(msg => msg.sender === 'user').pop();
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  }, [state.messages, sendMessage]);

  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    updateState({ 
      isLoading: false, 
      isStreaming: false 
    });
  }, [updateState]);

  const deleteSession = useCallback(async (sessionId: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(msg => msg.id !== sessionId)
    }));
    messageCache.current.remove(sessionId);
  }, []);

  const deleteAllSessions = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      chatId: null
    }));
    messageCache.current.clear();
  }, []);

  const getSessions = useCallback(() => {
    return Array.from(new Set(state.messages.map(msg => msg.id).filter(Boolean)));
  }, [state.messages]);

  // Cleanup on unmount
  useEffect(() => {
    const eventSource = eventSourceRef.current;
    const abortController = abortControllerRef.current;
    
    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  return {
    // Estado
    messages: state.messages,
    isLoading: state.isLoading,
    isStreaming: state.isStreaming,
    error: state.error,
    chatId: state.chatId,
    connectionStatus: state.connectionStatus,
    pendingAction: state.pendingAction,
    
    // Ações
    sendMessage,
    createSession,
    retryLastMessage,
    cancelCurrentRequest,
    clearMessages,
    clearPendingAction,
    deleteSession,
    deleteAllSessions,
    getSessions,
    
    // Utilitários
    hasMessages: state.messages.length > 0,
    lastMessage: state.messages[state.messages.length - 1] || null,
    messageCount: state.messages.length
  };
};

export default useOptimizedChat;