import { ObjectId } from 'mongodb';

// ===== INTERFACES PARA ESTADO DA CONVERSA =====
export interface ConversationState {
  chatId: string;
  userId: string;
  currentAction: string | null;        // 'CREATE_GOAL', 'CREATE_CARD', 'CREATE_INVESTMENT'
  pendingEntities: any;               // { valor: 5000, meta: 'Viagem', banco: 'Nubank' }
  confirmationRequired: boolean;
  lastUpdated: Date;
  conversationFlow: string[];         // Histórico de ações na conversa
  missingFields: string[];           // Campos que ainda precisam ser preenchidos
}

export interface EntityContext {
  type: string;
  value: any;
  confidence: number;
  source: 'user_input' | 'detected' | 'inferred';
  timestamp: Date;
}

// ===== GERENCIADOR DE CONTEXTO INTELIGENTE =====
export class ContextManager {
  private conversationStates = new Map<string, ConversationState>();
  private entityContexts = new Map<string, Map<string, EntityContext>>();
  private readonly TTL = 30 * 60 * 1000; // 30 minutos

  // ===== MÉTODOS PRINCIPAIS =====
  
  /**
   * Obtém o estado atual da conversa (OTIMIZADO)
   */
  getConversationState(chatId: string): ConversationState | null {
    // ⚡ OTIMIZAÇÃO: Map lookup direto (0.01ms)
    const state = this.conversationStates.get(chatId);
    if (!state) return null;

    // ⚡ OTIMIZAÇÃO: Verificação de expiração mais rápida
    const now = Date.now();
    if (now - state.lastUpdated.getTime() > this.TTL) {
      // ⚡ OTIMIZAÇÃO: Limpeza assíncrona (não bloqueia resposta)
      setImmediate(() => this.clearConversationState(chatId));
      return null;
    }

    return state;
  }

  /**
   * Atualiza o estado da conversa (OTIMIZADO)
   */
  updateConversationState(
    chatId: string, 
    userId: string, 
    action: string, 
    entities: any,
    requiresConfirmation: boolean = false
  ): void {
    // ⚡ OTIMIZAÇÃO: Operações em lote
    const now = new Date();
    
    // Obter estado atual ou criar novo
    let state = this.conversationStates.get(chatId);
    if (!state) {
      state = this.createNewState(chatId, userId);
    }

    // ⚡ OTIMIZAÇÃO: Atualização em lote
    Object.assign(state, {
      currentAction: action,
      pendingEntities: { ...state.pendingEntities, ...entities },
      confirmationRequired: requiresConfirmation,
      lastUpdated: now
    });
    
    // ⚡ OTIMIZAÇÃO: Manter apenas últimas 5 ações (reduzido de 10)
    state.conversationFlow.push(action);
    if (state.conversationFlow.length > 5) {
      state.conversationFlow = state.conversationFlow.slice(-5);
    }

    // ⚡ OTIMIZAÇÃO: Salvar estado (Map.set é instantâneo)
    this.conversationStates.set(chatId, state);
    
    // ⚡ OTIMIZAÇÃO: Contexto das entidades assíncrono
    setImmediate(() => this.updateEntityContext(chatId, entities));
    
    console.log(`[ContextManager] Updated state for ${chatId}: ${action}`);
  }

  /**
   * Completa uma ação com entidades adicionais
   */
  completeAction(chatId: string, entities: any): boolean {
    const state = this.getConversationState(chatId);
    if (!state || !state.currentAction) return false;

    // Mesclar entidades
    state.pendingEntities = { ...state.pendingEntities, ...entities };
    state.lastUpdated = new Date();

    // Verificar se tem todos os campos necessários
    const missingFields = this.getMissingFields(state.currentAction, state.pendingEntities);
    state.missingFields = missingFields;

    // Se não tem campos faltando, ação está completa
    if (missingFields.length === 0) {
      state.confirmationRequired = false;
      console.log(`[ContextManager] Action ${state.currentAction} completed for ${chatId}`);
    }

    this.conversationStates.set(chatId, state);
    return true;
  }

  /**
   * Limpa o estado da conversa (após ação completada)
   */
  clearConversationState(chatId: string): void {
    this.conversationStates.delete(chatId);
    this.entityContexts.delete(chatId);
    console.log(`[ContextManager] Cleared state for ${chatId}`);
  }

  /**
   * Obtém contexto das entidades para uma conversa
   */
  getEntityContext(chatId: string, entityType: string): EntityContext | null {
    const contexts = this.entityContexts.get(chatId);
    if (!contexts) return null;
    
    return contexts.get(entityType) || null;
  }

  /**
   * Verifica se uma conversa tem contexto ativo
   */
  hasActiveContext(chatId: string): boolean {
    const state = this.getConversationState(chatId);
    return state !== null && state.currentAction !== null;
  }

  // ===== MÉTODOS PRIVADOS =====

  private createNewState(chatId: string, userId: string): ConversationState {
    return {
      chatId,
      userId,
      currentAction: null,
      pendingEntities: {},
      confirmationRequired: false,
      lastUpdated: new Date(),
      conversationFlow: [],
      missingFields: []
    };
  }

  private updateEntityContext(chatId: string, entities: any): void {
    let contexts = this.entityContexts.get(chatId);
    if (!contexts) {
      contexts = new Map<string, EntityContext>();
      this.entityContexts.set(chatId, contexts);
    }

    // Atualizar contexto de cada entidade
    Object.entries(entities).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        contexts.set(key, {
          type: key,
          value,
          confidence: 1.0,
          source: 'user_input',
          timestamp: new Date()
        });
      }
    });
  }

  private getMissingFields(action: string, entities: any): string[] {
    const requiredFields = this.getRequiredFieldsForAction(action);
    return requiredFields.filter(field => !entities[field]);
  }

  private getRequiredFieldsForAction(action: string): string[] {
    const requirements: { [key: string]: string[] } = {
      'CREATE_GOAL': ['valor_total', 'meta'],
      'CREATE_CARD': ['nome', 'limite'],
      'CREATE_INVESTMENT': ['valor', 'nome'],
      'CREATE_TRANSACTION': ['valor']
    };

    return requirements[action] || [];
  }

  // ===== MÉTODOS DE UTILIDADE =====

  /**
   * Obtém estatísticas do contexto
   */
  getStats(): any {
    return {
      activeConversations: this.conversationStates.size,
      totalEntityContexts: Array.from(this.entityContexts.values())
        .reduce((total, contexts) => total + contexts.size, 0),
      memoryUsage: this.getMemoryUsage()
    };
  }

  private getMemoryUsage(): number {
    // Estimativa simples de uso de memória
    let totalSize = 0;
    
    // Tamanho dos estados
    for (const state of this.conversationStates.values()) {
      totalSize += JSON.stringify(state).length;
    }
    
    // Tamanho dos contextos de entidades
    for (const contexts of this.entityContexts.values()) {
      for (const context of contexts.values()) {
        totalSize += JSON.stringify(context).length;
      }
    }
    
    return totalSize;
  }

  /**
   * Limpa conversas expiradas
   */
  cleanupExpiredStates(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [chatId, state] of this.conversationStates.entries()) {
      if (now - state.lastUpdated.getTime() > this.TTL) {
        this.clearConversationState(chatId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[ContextManager] Cleaned up ${cleaned} expired states`);
    }
  }
}

// ===== INSTÂNCIA SINGLETON =====
export const contextManager = new ContextManager();

// ===== LIMPEZA AUTOMÁTICA =====
setInterval(() => {
  contextManager.cleanupExpiredStates();
}, 5 * 60 * 1000); // A cada 5 minutos
