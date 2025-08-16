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
      timeSaved: string;
      moneySaved: string;
      decisionsImproved: string;
    };
    competitiveAdvantage?: string[];
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

// ===== SISTEMA DE RETRY INTELIGENTE =====
class RetryManager {
  private retryCount = new Map<string, number>();
  private maxRetries = 3;
  private backoffMultiplier = 1.5;

  async executeWithRetry<T>(
    key: string,
    operation: () => Promise<T>,
    onRetry?: (attempt: number) => void
  ): Promise<T> {
    const attempts = this.retryCount.get(key) || 0;
    
    try {
      const result = await operation();
      this.retryCount.delete(key); // Reset on success
      return result;
    } catch (error) {
      if (attempts >= this.maxRetries) {
        this.retryCount.delete(key);
        throw error;
      }

      const nextAttempt = attempts + 1;
      this.retryCount.set(key, nextAttempt);
      
      const delay = Math.pow(this.backoffMultiplier, attempts) * 1000;
      
      if (onRetry) {
        onRetry(nextAttempt);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.executeWithRetry(key, operation, onRetry);
    }
  }

  reset(key: string): void {
    this.retryCount.delete(key);
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
  const retryManager = useRef(new RetryManager());
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

    // ===== MENSAGEM REGULAR OTIMIZADA =====
    const sendRegularMessage = async (
      content: string, 
      chatId: string
    ): Promise<void> => {
      const retryKey = `regular_${chatId}_${Date.now()}`;
      const handleRetry = (attempt: number): void => {
        console.warn(`[useOptimizedChat] Retry attempt ${attempt} for regular message`);
        updateState({ error: `Tentativa ${attempt} falhou. Tentando novamente...` });
      };
      
      const operation = async (): Promise<void> => {
        try {
          const data = await chatbotAPI.sendQuery({ message: content, chatId });
          
          if (!data.success) {
            const fallbackMessage = typeof data.message === 'string' && data.message
              ? data.message
              : 'Não consegui processar sua solicitação agora. Tente novamente em instantes.';
          
            const botMessage: ChatMessage = {
              id: data.messageId || generateMessageId(),
              sender: 'assistant',
              content: fallbackMessage,
              timestamp: new Date(),
              metadata: { ...data.metadata, fallback: true }
            } as ChatMessage;
            addMessage(botMessage);
            updateState({ isLoading: false });
            return;
          }

          const botMessage: ChatMessage = {
            id: data.messageId || generateMessageId(),
            sender: 'assistant',
            content: data.message,
            timestamp: new Date(),
            metadata: data.metadata
          };

          addMessage(botMessage);
          updateState({ isLoading: false });
        } catch (fetchError) {
          console.error('[useOptimizedChat] Fetch failed completely:', fetchError);
          console.warn('[useOptimizedChat] Usando resposta simulada por falha na requisição');
          const botMessage: ChatMessage = {
            id: generateMessageId(),
            sender: 'assistant',
            content: `Desculpe, estou com problemas de conectividade no momento. Sua mensagem "${content}" foi recebida, mas não posso processar adequadamente agora. Tente novamente em alguns instantes.`,
            timestamp: new Date(),
            metadata: { fallback: true }
          } as ChatMessage;
          addMessage(botMessage);
          updateState({ isLoading: false });
        }
      };

      await retryManager.current.executeWithRetry(retryKey, operation, handleRetry);
    };

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
                eventSource.close();
                resolve();
              }
            } catch (error) {
              console.error('[useOptimizedChat] Error handling stream data:', error);
            }
          };

          eventSource.addEventListener('chunk', handleIncoming);
          // Captura fallback caso o backend envie como evento padrão "message"
          eventSource.addEventListener('message', handleIncoming);
          // Capturar metadados de intenção/ações
          eventSource.addEventListener('metadata', (event) => {
            try {
              const meta = JSON.parse((event as MessageEvent).data as string);
              console.log('[useOptimizedChat] Received metadata:', meta);
              if (meta?.intent && typeof streamingMessage?.content === 'string') {
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

          eventSource.addEventListener('complete', async (event) => {
            console.log('[useOptimizedChat] Stream completed:', event.data);
            
            // Limpar timeout
            if (timeoutId) clearTimeout(timeoutId);
            
            // Finalizar a mensagem de streaming
            if (hasStarted) {
              streamingMessage.metadata = { 
                ...streamingMessage.metadata, 
                isStreaming: false, 
                isComplete: true 
              };
              
              // Atualizar mensagem final
              setState(prev => ({
                ...prev,
                messages: prev.messages.map(msg => 
                  msg.id === streamingMessage.id 
                    ? { ...streamingMessage }
                    : msg
                )
              }));
            }
            
            updateState({ 
              isStreaming: false, 
              isLoading: false,
              connectionStatus: 'connected' // Manter conectado após streaming
            });
            
            // Garantir que a mensagem final esteja no estado
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(msg => 
                msg.id === streamingMessage.id 
                  ? { ...streamingMessage }
                  : msg
              )
            }));
            
            try {
              // Auto-executar se pendente e com alta confiança
              const currentState = { ...state };
              const shouldAuto = currentState.pendingAction?.autoExecute && !currentState.pendingAction?.executed;
              if (shouldAuto && currentState.chatId) {
                await executePendingAction();
              }
            } finally {
            eventSource.close();
            resolve();
            }
          });

          // Tratamento de erro mais específico: não acionar fallback prematuro
          eventSource.addEventListener('error', (event) => {
            console.warn('[useOptimizedChat] EventSource error (não crítico, aguardando reconexão/timeout):', {
              event,
              readyState: eventSource.readyState,
              hasStarted
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
          const result = await chatbotAPI.executeAction({ action: action.action, payload: action.payload, chatId: state.chatId as string });
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
        } catch (execError) {
          console.error('[useOptimizedChat] Erro ao executar ação pendente:', execError);
          updateState({ isLoading: false });
          // prosseguir com fluxo normal caso falhe
        }
      }

      const currentChatId = state.chatId || await createSession();
      
      // Adicionar mensagem do usuário imediatamente
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        sender: 'user',
        content,
        timestamp: new Date()
      };
      
      addMessage(userMessage);
      updateState({ 
        isLoading: true, 
        error: null,
        isStreaming: useStreaming 
      });

      // Usar streaming se solicitado
      if (useStreaming) {
        try {
          await sendStreamingMessage(content, currentChatId);
        } catch (streamError) {
          console.warn('[useOptimizedChat] Streaming falhou, usando mensagem regular como fallback:', streamError);
          await sendRegularMessage(content, currentChatId);
        }
      } else {
        await sendRegularMessage(content, currentChatId);
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[useOptimizedChat] Request aborted');
        return;
      }

      console.error('[useOptimizedChat] Error sending message:', error);
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
    setState(prev => ({ ...prev, messages: [], error: null }));
    if (state.chatId) {
      messageCache.current.remove(state.chatId);
    }
  }, [state.chatId]);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = state.messages
      .filter(msg => msg.sender === 'user')
      .pop();
    
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
      isStreaming: false,
      connectionStatus: 'disconnected'
    });
  }, [updateState]);

  // Limpar ação pendente manualmente
  const clearPendingAction = useCallback(() => {
    setState(prev => ({ ...prev, pendingAction: null }));
  }, []);

  // ===== DELEÇÃO DE SESSÕES =====
  const deleteSession = useCallback(async (targetChatId: string): Promise<void> => {
    try {
      await chatbotAPI.deleteSession(targetChatId);
      // Limpar cache da sessão deletada
      messageCache.current.remove(targetChatId);
      // Se for a sessão atual, limpar mensagens e chatId
      if (state.chatId === targetChatId) {
        setState(prev => ({ ...prev, messages: [], chatId: null }));
      }
    } catch (error) {
      console.error('[useOptimizedChat] Error deleting session:', error);
      throw error;
    }
  }, [state.chatId]);

  const deleteAllSessions = useCallback(async (): Promise<void> => {
    try {
      await chatbotAPI.deleteAllSessions();
      // Limpar todo cache e estado de mensagens
      messageCache.current.clear();
      setState(prev => ({ ...prev, messages: [], chatId: null }));
    } catch (error) {
      console.error('[useOptimizedChat] Error deleting all sessions:', error);
      throw error;
    }
  }, []);

  // ===== LISTAR SESSÕES (opcional, para futura UI) =====
  const getSessions = useCallback(async (): Promise<unknown> => {
    try {
      const sessions = await chatbotAPI.getSessions();
      return sessions;
    } catch (error) {
      console.error('[useOptimizedChat] Error fetching sessions:', error);
      throw error;
    }
  }, []);

  // ===== CLEANUP =====
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

  // ===== RETURN INTERFACE =====
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
    clearMessages,
    retryLastMessage,
    cancelCurrentRequest,
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
