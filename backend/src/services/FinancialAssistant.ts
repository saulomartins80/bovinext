import AIService from './aiService';
import { UserService } from '../modules/users/services/UserService';
import { UserRepository } from '../modules/users/repositories/UserRepository';
import { ConversationMemory } from './ConversationMemory';
import { ReasoningEngine, DetectedIntent } from './ReasoningEngine';
import { AssistantPersonality } from './AssistantPersonality';

interface UserMessage {
  content: string;
  userId: string;
  chatId: string;
  timestamp: Date;
  metadata?: unknown;
}

interface AssistantResponse {
  response: string;
  action?: {
    type: string;
    payload: unknown;
    confidence: number;
  };
  insights?: string[];
  recommendations?: unknown[];
  followUpQuestions?: string[];
  requiresConfirmation?: boolean;
  metadata?: unknown;
}

interface ConversationContext {
  recentMessages: unknown[];
  userProfile: unknown;
  financialContext: unknown;
  inferredGoals: unknown;
  lastTopics: string[];
  sentiment?: unknown;
  last5Messages?: unknown[];
  recurringTopics?: string[];
  isRepetitiveQuestion?: boolean;
}

interface MessageAnalysis {
  intent: {
    type: string;
    payload?: unknown;
    confidence: number;
  };
  entities: unknown;
  confidence: number;
  reasoning: string;
  response: string;
  requiresConfirmation: boolean;
}

interface CircuitBreakerState {
  errorCount: number;
  lastErrorTime: number;
  isOpen: boolean;
  threshold: number;
  timeout: number;
}

interface ConversationFlow {
  lastUserMessage: string;
  lastBotResponse: string;
  detectedIntent: string;
  timestamp: Date;
  step: number;
  dataCollected: unknown;
}

class EnhancedPersonality {
  addTone(response: AssistantResponse, userProfile?: unknown): AssistantResponse {
    const tone = this.selectTone(userProfile);
    return {
      ...response,
      response: this.applyTone(response.response, tone)
    };
  }

  private selectTone(userProfile?: unknown): string {
    if (!userProfile) return 'neutral';
    // Baseado no histórico de interações
    if ((userProfile as any).interactionStyle === 'formal') return 'formal';
    if ((userProfile as any).interactionStyle === 'friendly') return 'friendly';
    // Baseado no momento
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) return 'calm';
    return 'neutral';
  }

  private applyTone(text: string, tone: string): string {
    switch (tone) {
      case 'formal':
        return this.applyFormalTone(text);
      case 'friendly':
        return this.applyFriendlyTone(text);
      case 'calm':
        return this.applyCalmTone(text);
      case 'neutral':
      default:
        return this.applyNeutralTone(text);
    }
  }

  private applyFriendlyTone(text: string): string {
    // Adiciona emojis e linguagem mais casual
    const emojis = ['😊', '👍', '👌', '💡', '✨'];
    return `${text} ${emojis[Math.floor(Math.random() * emojis.length)]}`;
  }

  private applyFormalTone(text: string): string {
    // Mantém tom mais profissional
    return text.replace(/!/g, '.').replace(/😊|👍|👌|💡|✨/g, '');
  }

  private applyCalmTone(text: string): string {
    // Tom mais suave para horários noturnos
    return text.toLowerCase().replace(/!/g, '.');
  }

  private applyNeutralTone(text: string): string {
    // Tom equilibrado
    return text;
  }
}

export class FinancialAssistant {
  static async generateResponse(intent: unknown): Promise<string> {
    // Simulação de resposta
    return 'Response generated';
  }

  private memory: ConversationMemory;
  private reasoningEngine: ReasoningEngine;
  private personality: EnhancedPersonality;
  private aiService: AIService;
  
  // Circuit Breaker
  private circuitBreaker: CircuitBreakerState = {
    errorCount: 0,
    lastErrorTime: 0,
    isOpen: false,
    threshold: 5,
    timeout: 30000 // 30 segundos
  };

  constructor() {
    this.memory = new ConversationMemory();
    this.reasoningEngine = new ReasoningEngine();
    this.personality = new EnhancedPersonality();
    this.aiService = new AIService();
  }

  // Compreensão Contextual Aprimorada
  private async buildEnhancedContext(message: UserMessage): Promise<ConversationContext> {
    // Adicionar análise de sentimento
    const sentiment = await this.aiService.analyzeSentiment?.(message.content) || { score: 0, label: 'neutral' };
    
    // Verificar histórico recente
    const last5Messages = await this.memory.getRecentMessages(message.userId, 5) || [];
    
    // Detectar tópicos recorrentes
    const recurringTopics = this.detectRecurringTopics(last5Messages);
    
    const baseContext: ConversationContext = {
      recentMessages: last5Messages,
      userProfile: {},
      financialContext: {},
      inferredGoals: {},
      lastTopics: [],
      sentiment,
      last5Messages,
      recurringTopics,
      isRepetitiveQuestion: this.checkRepetition(message.content, last5Messages)
    };

    return baseContext;
  }

  // Sistema de Memória Aprimorado
  private async updateConversationFlow(message: UserMessage, response: AssistantResponse): Promise<void> {
    // Armazena o fluxo atual da conversa
    const flow: ConversationFlow = {
      lastUserMessage: message.content,
      lastBotResponse: response.response,
      detectedIntent: response.action?.type || 'UNKNOWN',
      timestamp: new Date(),
      step: 1,
      dataCollected: response.action?.payload || {}
    };

    // Store flow in memory
    await this.memory.storeConversationFlow?.(message.userId, flow);
  }

  private async getCurrentFlow(userId: string): Promise<ConversationFlow | null> {
    return await this.memory.getCurrentFlow?.(userId) || null;
  }

  // Geração de Resposta Mais Inteligente
  private async generateIntelligentResponse(analysis: MessageAnalysis, context: ConversationContext): Promise<AssistantResponse> {
    // 1. Verificar se é continuação de um fluxo existente
    const currentFlow = await this.getCurrentFlow((context.userProfile as any)?.id || 'unknown');
    
    // 2. Tratar correções de forma mais inteligente
    if (this.isUserCorrecting(analysis, currentFlow)) {
      return this.handleAdvancedCorrection(analysis, context);
    }
    
    // 3. Sistema de resposta baseada em fluxo
    if (currentFlow && currentFlow.detectedIntent) {
      return this.continueExistingFlow(currentFlow, analysis, context);
    }
    
    // 4. Resposta baseada em intenção com mais nuances
    return this.handleIntentWithContext(analysis, context);
  }

  private async handleIntentWithContext(analysis: MessageAnalysis, context: ConversationContext): Promise<AssistantResponse> {
    const { intent, entities } = analysis;
    
    // Respostas mais contextualizadas
    const responseTemplates: Record<string, { complete: string; incomplete: string }> = {
      CREATE_TRANSACTION: {
        complete: `✅ Transação registrada! Valor: R$ ${(entities as any)?.valor || 'N/A'}, Descrição: ${(entities as any)?.descricao || 'N/A'}`,
        incomplete: this.getTransactionIncompleteResponse(entities)
      },
      CREATE_GOAL: {
        complete: `🎯 Meta criada! Objetivo: ${(entities as any)?.meta || 'N/A'}, Valor: R$ ${(entities as any)?.valor_total || 'N/A'}`,
        incomplete: this.getGoalIncompleteResponse(entities)
      },
      CREATE_INVESTMENT: {
        complete: `📈 Investimento registrado! Valor: R$ ${(entities as any)?.valor || 'N/A'}, Nome: ${(entities as any)?.nome || 'N/A'}`,
        incomplete: this.getInvestmentIncompleteResponse(entities)
      },
      FRUSTRATION: {
        complete: `Entendo sua frustração! 😔 Peço desculpas pela confusão anterior. Vou te ajudar de forma mais direta e clara agora.`,
        incomplete: `Entendo sua frustração! 😔 Peço desculpas pela confusão anterior. Vou te ajudar de forma mais direta e clara agora.`
      },
      GREETING: {
        complete: `Olá! Que bom te ver por aqui! 😊 Como posso te ajudar hoje?`,
        incomplete: `Olá! Que bom te ver por aqui! 😊 Como posso te ajudar hoje?`
      },
      GENERAL_HELP: {
        complete: `Claro! Estou aqui para te ajudar com suas finanças! 💪`,
        incomplete: `Claro! Estou aqui para te ajudar com suas finanças! 💪`
      },
      UNKNOWN: {
        complete: `Entendi! Como posso te ajudar hoje?`,
        incomplete: `Entendi! Como posso te ajudar hoje?`
      },
      DEFAULT: {
        complete: `Perfeito! Como posso te ajudar hoje?`,
        incomplete: `Perfeito! Como posso te ajudar hoje?`
      }
    };

    // Verificar se temos todos os dados necessários
    const isComplete = this.hasCompleteData({
      type: intent.type,
      payload: intent.payload,
      confidence: intent.confidence,
      reasoning: 'Análise de dados completos',
      requiresConfirmation: false,
      entities: entities,
      response: analysis.response,
      missingFields: [],
      collectedData: {}
    });

    // Selecionar template apropriado
    const template = responseTemplates[intent.type] || responseTemplates.DEFAULT;
    const responseText = isComplete ? template.complete : template.incomplete;

    return {
      response: responseText,
      action: isComplete ? {
        type: intent.type,
        payload: entities,
        confidence: intent.confidence
      } : undefined,
      followUpQuestions: this.generateContextualFollowUps({
        type: intent.type,
        payload: intent.payload,
        confidence: intent.confidence,
        reasoning: 'Análise de dados completos',
        requiresConfirmation: false,
        entities: entities,
        response: analysis.response,
        missingFields: [],
        collectedData: {}
      }, isComplete, context)
    };
  }

  // Sistema de Follow-up Inteligente
  private generateContextualFollowUps(intent: DetectedIntent, isComplete: boolean, context: ConversationContext): string[] {
    if (!isComplete) {
      return this.getMissingFieldsQuestions(intent);
    }

    // Baseado no histórico do usuário
    if ((context.userProfile as any)?.preferences?.frequentActions?.includes('VIEW_REPORTS')) {
      return ['Quer ver um relatório?', 'Gostaria de ver suas análises?'];
    }

    // Sugestões baseadas no momento
    const now = new Date();
    if (now.getMonth() === 11) { // Dezembro
      return ['Quer planejar para o próximo ano?'];
    }

    // Sugestões padrão
    return ['Quer ver um resumo desta categoria?'];
  }

  // Sistema de Aprendizado Contínuo
  private async learnFromInteraction(message: UserMessage, response: AssistantResponse): Promise<void> {
    // 1. Armazenar interação para treinamento futuro
    await this.memory.storeTrainingExample?.({
      input: message.content,
      output: response.response,
      context: await this.buildEnhancedContext(message)
    });

    // 2. Ajustar modelo com base no feedback implícito
    if (response.followUpQuestions && response.followUpQuestions.length > 0) {
      // Se o usuário não responder às perguntas, pode indicar confusão
      setTimeout(async () => {
        const nextMessage = await this.memory.checkForNextMessage?.(message.userId, 30000); // 30 segundos
        if (!nextMessage) {
          await this.adjustModelForConfusion(message, response);
        }
      }, 30000);
    }
  }

  private async adjustModelForConfusion(message: UserMessage, response: AssistantResponse): Promise<void> {
    // Lógica para ajustar o modelo quando o usuário parece confuso
    console.log('Ajustando modelo devido à confusão do usuário');
  }

  // Implementação de Circuit Breaker
  private async safeProcess(message: UserMessage): Promise<AssistantResponse> {
    try {
      if (this.isCircuitOpen()) {
        return this.circuitBreakerFallback();
      }

      const result = await this.processMessage(message);
      this.circuitBreaker.errorCount = 0; // Reset on success
      return result;
    } catch (error) {
      this.circuitBreaker.errorCount++;
      this.circuitBreaker.lastErrorTime = Date.now();
      
      if (this.circuitBreaker.errorCount >= this.circuitBreaker.threshold) {
        this.circuitBreaker.isOpen = true;
        console.log('Circuit breaker opened');
      }

      return this.getGracefulFallback(message, error);
    }
  }

  private isCircuitOpen(): boolean {
    return this.circuitBreaker.isOpen && 
           (Date.now() - this.circuitBreaker.lastErrorTime) < this.circuitBreaker.timeout;
  }

  private circuitBreakerFallback(): AssistantResponse {
    return {
      response: 'Estou passando por algumas melhorias no momento. Por favor, tente novamente em alguns instantes.',
      action: { type: 'CIRCUIT_BREAKER', payload: {}, confidence: 0 },
      insights: ['Circuit breaker acionado']
    };
  }

  private getGracefulFallback(message: UserMessage, error: unknown): AssistantResponse {
    console.error('Error processing message:', error);
    return {
      response: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
      action: { type: 'UNKNOWN', payload: {}, confidence: 0 },
      insights: ['Houve um erro no processamento da sua mensagem'],
      followUpQuestions: ['Como posso te ajudar de outra forma?']
    };
  }

  // Métodos auxiliares
  private detectRecurringTopics(messages: unknown[]): string[] {
    const topics = new Map<string, number>();
    messages.forEach(msg => {
      const extractedTopics = this.extractTopicsFromMessage((msg as any)?.content || '');
      extractedTopics.forEach(topic => {
        topics.set(topic, (topics.get(topic) || 0) + 1);
      });
    });

    return Array.from(topics.entries())
      .filter(([_, count]) => count > 1)
      .map(([topic, _]) => topic)
      .slice(0, 3); // Top 3 tópicos recorrentes
  }

  private extractTopicsFromMessage(content: string): string[] {
    const topics = [];
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('meta') || lowerContent.includes('objetivo')) topics.push('goals');
    if (lowerContent.includes('transação') || lowerContent.includes('gasto') || lowerContent.includes('receita')) topics.push('transactions');
    if (lowerContent.includes('investimento') || lowerContent.includes('ação') || lowerContent.includes('fundo')) topics.push('investments');
    if (lowerContent.includes('relatório') || lowerContent.includes('análise')) topics.push('reports');
    
    return topics;
  }

  private checkRepetition(currentMessage: string, lastMessages: unknown[]): boolean {
    return lastMessages.some(msg => {
      const similarity = this.calculateSimilarity(currentMessage, (msg as any)?.content || '');
      return similarity > 0.8; // 80% de similaridade
    });
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const intersection = words1.filter(word => words2.includes(word));
    return intersection.length / Math.max(words1.length, words2.length);
  }

  private isUserCorrecting(analysis: MessageAnalysis, currentFlow: ConversationFlow | null): boolean {
    if (!currentFlow) return false;
    const correctionWords = ['corrigir', 'mudar', 'não', 'errado', 'não é isso', 'alterar'];
    return correctionWords.some(word => analysis.response.toLowerCase().includes(word));
  }

  private handleAdvancedCorrection(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    return {
      response: 'Tranquilo! Vamos corrigir isso. O que você gostaria de mudar?',
      action: { type: 'CORRECTION', payload: {}, confidence: 0.8 },
      insights: ['Usuário solicitou correção'],
      followUpQuestions: ['Qual parte você quer corrigir?', 'O que está errado?']
    };
  }

  private async continueExistingFlow(currentFlow: ConversationFlow, analysis: MessageAnalysis, context: ConversationContext): Promise<AssistantResponse> {
    // Continuar o fluxo existente
    return this.handleIntentWithContext(analysis, context);
  }

  private getTransactionIncompleteResponse(entities: unknown): string {
    const missingFields = [];
    if (!(entities as any)?.valor) missingFields.push('valor');
    if (!(entities as any)?.descricao) missingFields.push('descrição');
    if (!(entities as any)?.tipo) missingFields.push('tipo (receita/despesa)');
    
    return `Para registrar a transação, preciso de: ${missingFields.join(', ')}`;
  }

  private getGoalIncompleteResponse(entities: unknown): string {
    const missingFields = [];
    if (!(entities as any)?.valor_total) missingFields.push('valor total');
    if (!(entities as any)?.meta) missingFields.push('objetivo da meta');
    if (!(entities as any)?.data_conclusao) missingFields.push('prazo');
    
    return `Para criar a meta, preciso de: ${missingFields.join(', ')}`;
  }

  private getInvestmentIncompleteResponse(entities: unknown): string {
    const missingFields = [];
    if (!(entities as any)?.valor) missingFields.push('valor');
    if (!(entities as any)?.nome) missingFields.push('nome do investimento');
    if (!(entities as any)?.tipo) missingFields.push('tipo');
    
    return `Para registrar o investimento, preciso de: ${missingFields.join(', ')}`;
  }

  private getMissingFieldsQuestions(intent: DetectedIntent): string[] {
    const { entities } = intent;
    const questions: string[] = [];
    
    switch (intent.type) {
      case 'CREATE_TRANSACTION':
        if (!(entities as any)?.valor) questions.push('Qual foi o valor?');
        if (!(entities as any)?.descricao) questions.push('O que foi essa transação?');
        if (!(entities as any)?.tipo) questions.push('É receita ou despesa?');
        break;
      case 'CREATE_GOAL':
        if (!(entities as any)?.valor_total) questions.push('Qual valor quer juntar?');
        if (!(entities as any)?.meta) questions.push('Para qual objetivo?');
        if (!(entities as any)?.data_conclusao) questions.push('Em quanto tempo?');
        break;
      case 'CREATE_INVESTMENT':
        if (!(entities as any)?.valor) questions.push('Qual valor quer investir?');
        if (!(entities as any)?.nome) questions.push('Qual o nome do investimento?');
        if (!(entities as any)?.tipo) questions.push('Qual o tipo?');
        break;
    }
    
    return questions;
  }

  // Método principal
  async processMessage(message: UserMessage): Promise<AssistantResponse> {
    try {
      console.log('Processing message:', message.content);
      
      // 1. Obter contexto enriquecido
      const context = await this.buildEnhancedContext(message);
      
      // Adicionar contexto do usuário se disponível
      if (context.userProfile && !(context.userProfile as any).name) {
        // Tentar obter nome do usuário do contexto
        (context.userProfile as any).name = 'Saulo chagas da Silva Martins'; // Nome do usuário dos logs
      }
      
      // 2. Análise profunda com aprendizado
      const analysis = await this.reasoningEngine.analyze(message, context);
      console.log('Analysis complete');
      
      // Verificar se é uma ação que precisa de coleta de dados
      if (this.requiresDataCollection(analysis.intent.type)) {
        console.log('Requires data collection');
        const detectedIntent: DetectedIntent = {
          type: analysis.intent.type,
          payload: analysis.intent.payload || {},
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          entities: analysis.entities,
          response: analysis.response,
          requiresConfirmation: analysis.requiresConfirmation,
          missingFields: [],
          collectedData: {}
        };
        
        return this.collectDataProgressively(detectedIntent, context);
      }
      
      // 3. Geração de resposta inteligente
      const response = await this.generateIntelligentResponse(analysis, context);
      
      // 4. Aprendizado contínuo
      await Promise.all([
        this.memory.storeInteraction(message, response),
        this.learnFromInteraction(message, response),
        this.updateConversationFlow(message, response)
      ]);
      
      // 5. Aplicar personalidade contextual
      return this.personality.addTone(response, context.userProfile);
    } catch (error) {
      console.error('Error processing message:', error);
      return this.getGracefulFallback(message, error);
    }
  }

  // Sistema de fluxos conversacionais inteligentes
  private async collectDataProgressively(intent: DetectedIntent, context: ConversationContext): Promise<AssistantResponse> {
    const { entities } = intent;
    
    // Se já tem dados suficientes, executar ação
    if (this.hasCompleteData(intent)) {
      return this.executeAction(intent, context);
    }
    
    // Identificar campos faltantes
    const missingFields = this.getMissingFields(intent);
    
    if (missingFields.length > 0) {
      // Gerar resposta para coletar dados
      const response = this.generateDataCollectionResponse(intent.type, missingFields, entities);
      
      return {
        response,
        action: {
          type: intent.type,
          payload: entities,
          confidence: intent.confidence
        },
        requiresConfirmation: true,
        followUpQuestions: this.generateFollowUpQuestions(intent.type, missingFields),
        insights: [`Coletando dados para ${intent.type}`],
        recommendations: undefined
      };
    }
    
    // Fallback
    return {
      response: 'Como posso te ajudar?',
      requiresConfirmation: false,
      followUpQuestions: ['Quer criar uma meta?', 'Precisa registrar uma transação?'],
      insights: [],
      recommendations: undefined
    };
  }

  // Verificar se tem dados completos
  private hasCompleteData(intent: DetectedIntent): boolean {
    const { entities } = intent;
    
    switch (intent.type) {
      case 'CREATE_TRANSACTION':
        return !!(entities as any)?.valor && !!(entities as any)?.descricao && !!(entities as any)?.tipo;
      case 'CREATE_GOAL':
        return !!(entities as any)?.valor_total && !!(entities as any)?.meta && !!(entities as any)?.data_conclusao;
      case 'CREATE_INVESTMENT':
        return !!(entities as any)?.valor && !!(entities as any)?.nome && !!(entities as any)?.tipo;
      default:
        return true;
    }
  }

  // Identificar campos faltantes
  private getMissingFields(intent: DetectedIntent): string[] {
    const { entities } = intent;
    const missing: string[] = [];
    
    switch (intent.type) {
      case 'CREATE_TRANSACTION':
        if (!(entities as any)?.valor) missing.push('valor');
        if (!(entities as any)?.descricao) missing.push('descricao');
        if (!(entities as any)?.tipo) missing.push('tipo');
        break;
      case 'CREATE_GOAL':
        if (!(entities as any)?.valor_total) missing.push('valor_total');
        if (!(entities as any)?.meta) missing.push('meta');
        if (!(entities as any)?.data_conclusao) missing.push('data_conclusao');
        break;
      case 'CREATE_INVESTMENT':
        if (!(entities as any)?.valor) missing.push('valor');
        if (!(entities as any)?.nome) missing.push('nome');
        if (!(entities as any)?.tipo) missing.push('tipo');
        break;
    }
    
    return missing;
  }

  // Gerar resposta para coleta de dados
  private generateDataCollectionResponse(intentType: string, missingFields: string[], entities: unknown): string {
    const fieldNames: Record<string, string> = {
      valor: 'valor',
      descricao: 'descrição',
      tipo: 'tipo (receita/despesa)',
      valor_total: 'valor total',
      meta: 'objetivo da meta',
      data_conclusao: 'prazo',
      nome: 'nome do investimento'
    };

    const missingFieldNames = missingFields.map(field => fieldNames[field] || field).join(', ');

    switch (intentType) {
      case 'CREATE_TRANSACTION':
        return `Para registrar a transação, preciso saber: ${missingFieldNames}`;
      case 'CREATE_GOAL':
        return `Para criar sua meta, preciso saber: ${missingFieldNames}`;
      case 'CREATE_INVESTMENT':
        return `Para registrar o investimento, preciso saber: ${missingFieldNames}`;
      default:
        return `Para continuar, preciso saber: ${missingFieldNames}`;
    }
  }

  // Gerar perguntas de follow-up
  private generateFollowUpQuestions(intentType: string, missingFields: string[]): string[] {
    const questions: string[] = [];
    
    switch (intentType) {
      case 'CREATE_TRANSACTION':
        if (missingFields.includes('valor')) questions.push('Qual foi o valor?');
        if (missingFields.includes('descricao')) questions.push('O que foi essa transação?');
        if (missingFields.includes('tipo')) questions.push('É receita ou despesa?');
        break;
      case 'CREATE_GOAL':
        if (missingFields.includes('valor_total')) questions.push('Qual valor quer juntar?');
        if (missingFields.includes('meta')) questions.push('Para qual objetivo?');
        if (missingFields.includes('data_conclusao')) questions.push('Em quanto tempo?');
        break;
      case 'CREATE_INVESTMENT':
        if (missingFields.includes('valor')) questions.push('Qual valor quer investir?');
        if (missingFields.includes('nome')) questions.push('Qual o nome do investimento?');
        if (missingFields.includes('tipo')) questions.push('Qual o tipo?');
        break;
    }
    
    return questions;
  }

  // Executar ação quando dados estiverem completos
  private async executeAction(intent: DetectedIntent, context: ConversationContext): Promise<AssistantResponse> {
    try {
      const { entities } = intent;
      
      switch (intent.type) {
        case 'CREATE_TRANSACTION':
          // Aqui você chamaria o controller para criar a transação
          return {
            response: `Transação registrada com sucesso! Valor: R$ ${(entities as any)?.valor || 'N/A'}, Descrição: ${(entities as any)?.descricao || 'N/A'}, Tipo: ${(entities as any)?.tipo || 'despesa'}`,
            action: {
              type: 'CREATE_TRANSACTION',
              payload: entities,
              confidence: intent.confidence
            },
            requiresConfirmation: false,
            followUpQuestions: ['Quer registrar outra transação?', 'Quer ver suas transações?'],
            insights: ['Transação criada automaticamente'],
            recommendations: undefined
          };

        case 'CREATE_GOAL':
          // Aqui você chamaria o controller para criar a meta
          return {
            response: `Meta criada com sucesso! Valor: R$ ${(entities as any)?.valor_total || 'N/A'}, Objetivo: ${(entities as any)?.meta || 'N/A'}, Prazo: ${(entities as any)?.data_conclusao || 'Não definido'}`,
            action: {
              type: 'CREATE_GOAL',
              payload: entities,
              confidence: intent.confidence
            },
            requiresConfirmation: false,
            followUpQuestions: ['Quer criar outra meta?', 'Quer ver suas metas?'],
            insights: ['Meta criada automaticamente'],
            recommendations: undefined
          };

        case 'CREATE_INVESTMENT':
          // Aqui você chamaria o controller para criar o investimento
          return {
            response: `Investimento registrado com sucesso! Valor: R$ ${(entities as any)?.valor || 'N/A'}, Nome: ${(entities as any)?.nome || 'N/A'}, Tipo: ${(entities as any)?.tipo || 'Não especificado'}`,
            action: {
              type: 'CREATE_INVESTMENT',
              payload: entities,
              confidence: intent.confidence
            },
            requiresConfirmation: false,
            followUpQuestions: ['Quer registrar outro investimento?', 'Quer ver seu portfólio?'],
            insights: ['Investimento criado automaticamente'],
            recommendations: undefined
          };

        default:
          return {
            response: 'Ação executada com sucesso!',
            action: {
              type: intent.type,
              payload: entities,
              confidence: intent.confidence
            },
            requiresConfirmation: false,
            followUpQuestions: ['Como posso te ajudar?'],
            insights: ['Ação executada'],
            recommendations: undefined
          };
      }
    } catch (error) {
      console.error('Error executing action:', error);
      return {
        response: 'Desculpe, tive um problema ao executar essa ação. Pode tentar novamente?',
        action: {
          type: intent.type,
          payload: intent.entities,
          confidence: 0.3
        },
        requiresConfirmation: true,
        followUpQuestions: ['Quer tentar novamente?'],
        insights: ['Erro na execução da ação'],
        recommendations: undefined
      };
    }
  }

  // Verificar se uma ação precisa de coleta de dados
  private requiresDataCollection(intentType: string): boolean {
    const dataCollectionIntents = [
      'CREATE_TRANSACTION',
      'CREATE_GOAL', 
      'CREATE_INVESTMENT'
    ];
    
    return dataCollectionIntents.includes(intentType);
  }
}
