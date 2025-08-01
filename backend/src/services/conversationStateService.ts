// backend/src/services/conversationStateService.ts
import { v4 as uuidv4 } from 'uuid';

export interface ConversationState {
  userId: string;
  chatId: string;
  currentAction?: {
    type: 'CREATE_GOAL' | 'CREATE_TRANSACTION' | 'CREATE_INVESTMENT';
    collectedData: Record<string, any>;
    missingFields: string[];
    currentField?: string;
    isComplete: boolean;
  };
  context: {
    lastIntent?: string;
    lastMessage?: string;
    conversationHistory: Array<{
      message: string;
      response: string;
      timestamp: Date;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class ConversationStateService {
  private static instance: ConversationStateService;
  private states: Map<string, ConversationState> = new Map();

  private constructor() {}

  static getInstance(): ConversationStateService {
    if (!ConversationStateService.instance) {
      ConversationStateService.instance = new ConversationStateService();
    }
    return ConversationStateService.instance;
  }

  // Inicializar ou recuperar estado da conversa
  getOrCreateState(userId: string, chatId: string): ConversationState {
    const key = `${userId}_${chatId}`;
    
    if (!this.states.has(key)) {
      this.states.set(key, {
        userId,
        chatId,
        context: {
          conversationHistory: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return this.states.get(key)!;
  }

  // Atualizar estado da conversa
  updateState(userId: string, chatId: string, updates: Partial<ConversationState>): ConversationState {
    const key = `${userId}_${chatId}`;
    const currentState = this.getOrCreateState(userId, chatId);
    
    const updatedState: ConversationState = {
      ...currentState,
      ...updates,
      updatedAt: new Date()
    };
    
    this.states.set(key, updatedState);
    return updatedState;
  }

  // Iniciar coleta de dados para uma ação
  startDataCollection(
    userId: string, 
    chatId: string, 
    actionType: 'CREATE_GOAL' | 'CREATE_TRANSACTION' | 'CREATE_INVESTMENT'
  ): ConversationState {
    const requiredFields = this.getRequiredFields(actionType);
    
    return this.updateState(userId, chatId, {
      currentAction: {
        type: actionType,
        collectedData: {},
        missingFields: requiredFields,
        currentField: requiredFields[0],
        isComplete: false
      }
    });
  }

  // Coletar um campo específico
  collectField(
    userId: string, 
    chatId: string, 
    field: string, 
    value: any
  ): ConversationState {
    const state = this.getOrCreateState(userId, chatId);
    
    if (!state.currentAction) {
      throw new Error('Nenhuma ação em andamento');
    }

    const { currentAction } = state;
    const updatedCollectedData = {
      ...currentAction.collectedData,
      [field]: value
    };

    const updatedMissingFields = currentAction.missingFields.filter(f => f !== field);
    const nextField = updatedMissingFields.length > 0 ? updatedMissingFields[0] : undefined;
    const isComplete = updatedMissingFields.length === 0;

    return this.updateState(userId, chatId, {
      currentAction: {
        ...currentAction,
        collectedData: updatedCollectedData,
        missingFields: updatedMissingFields,
        currentField: nextField,
        isComplete
      }
    });
  }

  // Verificar se a ação está completa
  isActionComplete(userId: string, chatId: string): boolean {
    const state = this.getOrCreateState(userId, chatId);
    return state.currentAction?.isComplete || false;
  }

  // Obter dados coletados
  getCollectedData(userId: string, chatId: string): Record<string, any> {
    const state = this.getOrCreateState(userId, chatId);
    return state.currentAction?.collectedData || {};
  }

  // Obter próximo campo a ser coletado
  getNextField(userId: string, chatId: string): string | undefined {
    const state = this.getOrCreateState(userId, chatId);
    return state.currentAction?.currentField;
  }

  // Obter campos faltantes
  getMissingFields(userId: string, chatId: string): string[] {
    const state = this.getOrCreateState(userId, chatId);
    return state.currentAction?.missingFields || [];
  }

  // Finalizar ação (limpar estado)
  finishAction(userId: string, chatId: string): ConversationState {
    return this.updateState(userId, chatId, {
      currentAction: undefined
    });
  }

  // Adicionar mensagem ao histórico
  addToHistory(userId: string, chatId: string, message: string, response: string): ConversationState {
    const state = this.getOrCreateState(userId, chatId);
    const updatedHistory = [
      ...state.context.conversationHistory,
      {
        message,
        response,
        timestamp: new Date()
      }
    ];

    // Manter apenas as últimas 10 mensagens para performance
    const trimmedHistory = updatedHistory.slice(-10);

    return this.updateState(userId, chatId, {
      context: {
        ...state.context,
        conversationHistory: trimmedHistory
      }
    });
  }

  // Obter histórico da conversa
  getConversationHistory(userId: string, chatId: string): Array<{message: string, response: string, timestamp: Date}> {
    const state = this.getOrCreateState(userId, chatId);
    return state.context.conversationHistory;
  }

  // Gerar pergunta para o próximo campo
  generateFieldQuestion(actionType: string, field: string): string {
    const questions: Record<string, Record<string, string>> = {
      CREATE_GOAL: {
        meta: 'Qual é o nome da sua meta? (ex: Viagem para Europa)',
        valor_total: 'Qual valor você quer juntar? (ex: 5000)',
        data_conclusao: 'Para quando você quer atingir essa meta? (ex: 2025-12-31)'
      },
      CREATE_TRANSACTION: {
        valor: 'Qual foi o valor da transação? (ex: 150.50)',
        descricao: 'O que foi essa transação? (ex: Supermercado)',
        tipo: 'É uma receita ou despesa?',
        categoria: 'Qual categoria? (ex: Alimentação, Transporte, Lazer)',
        conta: 'De qual conta? (ex: Nubank, Itaú)',
        data: 'Para qual data? (ex: 2024-01-15)'
      },
      CREATE_INVESTMENT: {
        nome: 'Qual o nome do investimento? (ex: Tesouro Direto)',
        valor: 'Qual valor você investiu? (ex: 1000)',
        tipo: 'Qual tipo de investimento? (ex: Renda Fixa, Ações)',
        data: 'Quando foi feito o investimento? (ex: 2024-01-15)'
      }
    };

    return questions[actionType]?.[field] || `Por favor, informe o valor para ${field}`;
  }

  // Obter campos obrigatórios para cada tipo de ação
  private getRequiredFields(actionType: string): string[] {
    const fields: Record<string, string[]> = {
      CREATE_GOAL: ['meta', 'valor_total', 'data_conclusao'],
      CREATE_TRANSACTION: ['valor', 'descricao', 'tipo'],
      CREATE_INVESTMENT: ['nome', 'valor', 'tipo']
    };
    
    return fields[actionType] || [];
  }

  // Limpar estado
  clearState(userId: string, chatId: string): void {
    const key = `${userId}_${chatId}`;
    this.states.delete(key);
  }

  // Obter estatísticas
  getStats(): { totalStates: number; activeActions: number } {
    const totalStates = this.states.size;
    const activeActions = Array.from(this.states.values())
      .filter(state => state.currentAction)
      .length;
    
    return { totalStates, activeActions };
  }

  // Missing methods that are called by controllers
  async createSession(userId: string): Promise<{ chatId: string }> {
    try {
      const chatId = uuidv4();
      this.getOrCreateState(userId, chatId);
      
      return { chatId };
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<any[]> {
    try {
      const userSessions = [];
      
      // Find all sessions for this user
      for (const [key, state] of this.states.entries()) {
        if (state.userId === userId) {
          userSessions.push({
            chatId: state.chatId,
            createdAt: state.createdAt,
            updatedAt: state.updatedAt,
            messageCount: state.context.conversationHistory.length,
            lastActivity: state.updatedAt,
            isActive: true
          });
        }
      }
      
      return userSessions.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    try {
      const key = `${userId}_${sessionId}`;
      this.states.delete(key);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // Extrair valor de uma mensagem baseado no campo
  extractFieldValue(field: string, message: string): any {
    const lowerMessage = message.toLowerCase();
    
    switch (field) {
      case 'meta':
        // Extrair nome da meta - melhorar lógica para capturar apenas o nome
        if (lowerMessage.includes('meta') || lowerMessage.includes('objetivo') || lowerMessage.includes('sonho')) {
          // Remover palavras-chave e extrair o nome da meta
          let metaName = message
            .replace(/meta\s+(?:seria|é|eh|e)\s+/i, '')
            .replace(/objetivo\s+(?:seria|é|eh|e)\s+/i, '')
            .replace(/sonho\s+(?:seria|é|eh|e)\s+/i, '')
            .replace(/quero\s+(?:criar|fazer|ter)\s+/i, '')
            .replace(/vou\s+(?:criar|fazer|ter)\s+/i, '')
            .replace(/vamos\s+(?:criar|fazer|ter)\s+/i, '')
            .trim();
          
          // Se ainda contém muitas palavras, tentar extrair apenas a primeira parte
          if (metaName.split(' ').length > 5) {
            const words = metaName.split(' ');
            // Pegar até 4 palavras como nome da meta
            metaName = words.slice(0, 4).join(' ');
          }
          
          return metaName || null;
        }
        return null;
        
      case 'valor':
      case 'valor_total':
        // Extrair números da mensagem - melhorar regex para capturar valores
        const valorMatch = message.match(/(\d+[.,]?\d*)/g);
        if (valorMatch) {
          // Pegar o maior número encontrado (assumindo que é o valor)
          const valores = valorMatch.map(v => parseFloat(v.replace(',', '.')));
          const maxValor = Math.max(...valores);
          return maxValor;
        }
        return null;
      
      case 'descricao':
        // Extrair descrição da transação
        let descText = message;
        
        // Remover palavras-chave comuns
        descText = descText.replace(/transação|transacao|gasto|compra|paguei|gastei/gi, '');
        descText = descText.replace(/valor|reais|real|r\$/gi, '');
        descText = descText.replace(/\d+[.,]?\d*/g, ''); // Remover números
        
        // Limpar espaços extras e pontuação
        descText = descText.replace(/\s+/g, ' ').trim();
        descText = descText.replace(/^[,.\s]+|[,.\s]+$/g, '');
        
        return descText || null;
      
      case 'tipo':
        if (lowerMessage.includes('receita') || lowerMessage.includes('entrada') || lowerMessage.includes('ganho') || lowerMessage.includes('salário') || lowerMessage.includes('salario')) {
          return 'receita';
        } else if (lowerMessage.includes('despesa') || lowerMessage.includes('gasto') || lowerMessage.includes('saída') || lowerMessage.includes('saida') || lowerMessage.includes('paguei') || lowerMessage.includes('gastei')) {
          return 'despesa';
        } else if (lowerMessage.includes('transferência') || lowerMessage.includes('transferencia') || lowerMessage.includes('transferir')) {
          return 'transferencia';
        }
        return null;
      
      case 'forma_pagamento':
        if (lowerMessage.includes('pix') || lowerMessage.includes('pix')) {
          return 'pix';
        } else if (lowerMessage.includes('cartão') || lowerMessage.includes('cartao') || lowerMessage.includes('credito') || lowerMessage.includes('débito') || lowerMessage.includes('debito')) {
          return 'cartao';
        } else if (lowerMessage.includes('dinheiro') || lowerMessage.includes('cash')) {
          return 'dinheiro';
        } else if (lowerMessage.includes('boleto')) {
          return 'boleto';
        }
        return null;
      
      case 'categoria':
        // Detectar categoria automaticamente baseada na descrição
        const descLower = lowerMessage;
        if (descLower.includes('gasolina') || descLower.includes('combustível') || descLower.includes('combustivel') || descLower.includes('carro') || descLower.includes('uber')) {
          return 'Transporte';
        } else if (descLower.includes('supermercado') || descLower.includes('mercado') || descLower.includes('comida') || descLower.includes('alimento')) {
          return 'Alimentação';
        } else if (descLower.includes('restaurante') || descLower.includes('lanche') || descLower.includes('pizza')) {
          return 'Alimentação';
        } else if (descLower.includes('energia') || descLower.includes('luz') || descLower.includes('água') || descLower.includes('agua') || descLower.includes('internet')) {
          return 'Contas';
        } else if (descLower.includes('roupa') || descLower.includes('sapato') || descLower.includes('acessório')) {
          return 'Vestuário';
        } else if (descLower.includes('cinema') || descLower.includes('show') || descLower.includes('bar') || descLower.includes('balada')) {
          return 'Lazer';
        }
        return 'Outros';
      
      case 'data':
      case 'data_conclusao':
        // Tentar extrair data da mensagem - melhorar regex
        const dataMatch = message.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
        if (dataMatch) {
          const dataStr = dataMatch[0];
          // Converter formato dd/mm/yyyy para yyyy-mm-dd
          if (dataStr.includes('/')) {
            const parts = dataStr.split('/');
            if (parts.length === 3) {
              if (parts[2].length === 2) {
                parts[2] = '20' + parts[2]; // Converter yy para yyyy
              }
              return new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
            }
          }
          return new Date(dataStr);
        }
        // Se não encontrou data específica, verificar se é "hoje"
        if (lowerMessage.includes('hoje') || lowerMessage.includes('agora')) {
          return new Date();
        }
        return null;
      
      default:
        // Para outros campos, retornar a mensagem como está
        return message.trim();
    }
  }

  // Verificar se a mensagem contém o valor para o campo atual
  hasFieldValue(field: string, message: string): boolean {
    const value = this.extractFieldValue(field, message);
    return value !== null && value !== '';
  }

  // 🎯 NOVO: Extrair múltiplos campos de uma só vez
  extractMultipleFields(message: string, actionType: string): Record<string, any> {
    const fields = this.getRequiredFields(actionType);
    const extracted: Record<string, any> = {};
    
    // Verificar se a mensagem contém palavras-chave que indicam que o usuário está fornecendo dados
    const lowerMessage = message.toLowerCase();
    const hasRelevantContent = 
      lowerMessage.includes('meta') || 
      lowerMessage.includes('objetivo') || 
      lowerMessage.includes('valor') || 
      lowerMessage.includes('reais') || 
      lowerMessage.includes('r$') ||
      lowerMessage.includes('até') ||
      lowerMessage.includes('ate') ||
      lowerMessage.includes('para') ||
      lowerMessage.includes('quando') ||
      /\d/.test(message) || // Contém números
      /[0-9]{1,2}[\/\-][0-9]{1,2}/.test(message); // Contém formato de data
    
    // Se não tem conteúdo relevante, não extrair nada
    if (!hasRelevantContent) {
      return {};
    }
    
    for (const field of fields) {
      const value = this.extractFieldValue(field, message);
      if (value !== null && value !== '') {
        extracted[field] = value;
      }
    }
    
    return extracted;
  }

  // 🎯 NOVO: Gerar pergunta mais conversacional
  generateConversationalQuestion(actionType: string, field: string, context?: any): string {
    const questions: Record<string, Record<string, string>> = {
      CREATE_GOAL: {
        meta: 'Que legal! Qual é o nome da sua meta? (ex: Viagem para Europa)',
        valor_total: 'Qual valor você quer juntar? (ex: 5000)',
        data_conclusao: 'Para quando você quer atingir essa meta? (ex: 2025-12-31)'
      },
      CREATE_TRANSACTION: {
        tipo: 'Perfeito! Que tipo de transação é? (despesa, receita ou transferência)',
        valor: 'Qual foi o valor? (ex: 150.50)',
        descricao: 'O que foi essa transação? (ex: Gasolina do carro)',
        categoria: 'Qual categoria? (ex: Transporte, Alimentação, Lazer)',
        forma_pagamento: 'Como você pagou? (pix, cartão, dinheiro)',
        data: 'Quando foi? (ex: hoje, ontem, 15/07)'
      },
      CREATE_INVESTMENT: {
        valor: 'Qual valor você investiu? (ex: 1000)',
        nome: 'Qual o nome do investimento? (ex: PETR4, Tesouro Direto)',
        tipo: 'Que tipo de investimento? (ex: Ações, Renda Fixa, Fundos)',
        instituicao: 'Em qual instituição? (ex: Clear, XP)',
        data: 'Quando você fez esse investimento? (ex: hoje, 15/07)'
      }
    };

    return questions[actionType]?.[field] || `Por favor, me diga o ${field}:`;
  }

  // 🎯 NOVO: Gerar resumo para confirmação
  generateConfirmationSummary(actionType: string, collectedData: Record<string, any>): string {
    switch (actionType) {
      case 'CREATE_TRANSACTION':
        const tipo = collectedData.tipo || 'transação';
        const valor = collectedData.valor ? `R$ ${collectedData.valor.toFixed(2)}` : 'valor não informado';
        const descricao = collectedData.descricao || 'sem descrição';
        const categoria = collectedData.categoria || 'sem categoria';
        const formaPagamento = collectedData.forma_pagamento || 'não informado';
        const data = collectedData.data ? new Date(collectedData.data).toLocaleDateString() : 'não informada';
        
        return `📋 **Resumo da Transação:**
• Tipo: ${tipo}
• Valor: ${valor}
• Descrição: ${descricao}
• Categoria: ${categoria}
• Forma de pagamento: ${formaPagamento}
• Data: ${data}

Está correto? Posso criar essa transação?`;

      case 'CREATE_GOAL':
        const meta = collectedData.meta || 'sem nome';
        const valorTotal = collectedData.valor_total ? `R$ ${collectedData.valor_total.toFixed(2)}` : 'valor não informado';
        const dataConclusao = collectedData.data_conclusao ? new Date(collectedData.data_conclusao).toLocaleDateString() : 'não informada';
        
        return `🎯 **Resumo da Meta:**
• Nome: ${meta}
• Valor: ${valorTotal}
• Prazo: ${dataConclusao}

Está correto? Posso criar essa meta?`;

      case 'CREATE_INVESTMENT':
        const nome = collectedData.nome || 'sem nome';
        const valorInv = collectedData.valor ? `R$ ${collectedData.valor.toFixed(2)}` : 'valor não informado';
        const tipoInv = collectedData.tipo || 'não informado';
        const instituicao = collectedData.instituicao || 'não informada';
        const dataInv = collectedData.data ? new Date(collectedData.data).toLocaleDateString() : 'não informada';
        
        return `📈 **Resumo do Investimento:**
• Nome: ${nome}
• Valor: ${valorInv}
• Tipo: ${tipoInv}
• Instituição: ${instituicao}
• Data: ${dataInv}

Está correto? Posso registrar esse investimento?`;

      default:
        return 'Dados coletados. Posso prosseguir?';
    }
  }


  // Limpar estados antigos (mais de 1 hora)
  cleanupOldStates(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [key, state] of this.states.entries()) {
      if (state.updatedAt < oneHourAgo) {
        this.states.delete(key);
      }
    }
  }
} 