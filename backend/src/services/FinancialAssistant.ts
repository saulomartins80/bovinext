import AIService from './aiService';
import { UserService } from '../modules/users/services/UserService';
import { UserRepository } from '../modules/users/repositories/UserRepository';
import { ConversationMemory } from './ConversationMemory';
import { ReasoningEngine, type DetectedIntent } from './ReasoningEngine';
// import { FinancialKnowledge } from './FinancialKnowledge';
import { AssistantPersonality } from './AssistantPersonality';

interface UserMessage {
  content: string;
  userId: string;
  chatId: string;
  timestamp: Date;
  metadata?: any;
}

interface AssistantResponse {
  response: string;
  action?: {
    type: string;
    payload: any;
    confidence: number;
  };
  insights?: string[];
  recommendations?: any[];
  followUpQuestions?: string[];
  requiresConfirmation?: boolean;
  metadata?: any;
}

interface ConversationContext {
  recentMessages: any[];
  userProfile: any;
  financialContext: any;
  inferredGoals: any;
  lastTopics: string[];
  sentiment?: any;
  last5Messages?: any[];
  recurringTopics?: string[];
  isRepetitiveQuestion?: boolean;
}

interface MessageAnalysis {
  intent: {
    type: string;
    payload?: any;
    confidence: number;
  };
  entities: any;
  confidence: number;
  reasoning: string;
  response: string;
  requiresConfirmation: boolean;
}

// ✅ NOVO: Sistema de Circuit Breaker
interface CircuitBreakerState {
  errorCount: number;
  lastErrorTime: number;
  isOpen: boolean;
  threshold: number;
  timeout: number;
}

// ✅ NOVO: Sistema de Fluxo de Conversa
interface ConversationFlow {
  lastUserMessage: string;
  lastBotResponse: string;
  detectedIntent: string;
  timestamp: Date;
  step: number;
  dataCollected: any;
}

// ✅ NOVO: Personalidade Aprimorada
class EnhancedPersonality {
  addTone(response: AssistantResponse, userProfile?: any): AssistantResponse {
    const baseResponse = response.response;
    const tone = this.selectTone(userProfile);
    
    return {
      ...response,
      response: this.applyTone(baseResponse, tone)
    };
  }
  
  private selectTone(userProfile?: any): string {
    if (!userProfile) return 'neutral';
    
    // Baseado no histórico de interações
    if (userProfile.interactionStyle === 'formal') return 'formal';
    if (userProfile.interactionStyle === 'friendly') return 'friendly';
    
    // Baseado no momento
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) return 'calm';
    
    return 'neutral';
  }
  
  private applyTone(text: string, tone: string): string {
    const tones = {
      formal: this.applyFormalTone,
      friendly: this.applyFriendlyTone,
      calm: this.applyCalmTone,
      neutral: this.applyNeutralTone
    };
    
    return tones[tone](text);
  }
  
  private applyFriendlyTone(text: string): string {
    // Adiciona emojis e linguagem mais casual
    const emojis = ['😊', '👍', '👌', '💡', '✨'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    return text.replace(/\.$/, '') + ' ' + randomEmoji;
  }
  
  private applyFormalTone(text: string): string {
    // Mantém tom mais profissional
    return text;
  }
  
  private applyCalmTone(text: string): string {
    // Tom mais suave para horários noturnos
    return text.replace(/!/g, '.').replace(/😊/g, '😌');
  }
  
  private applyNeutralTone(text: string): string {
    // Tom equilibrado
    return text;
  }
}

export class FinancialAssistant {
  static async generateResponse(intent: any) {
    // Simulação de resposta
    return { response: "Resposta gerada para o intent." };
  }

  private memory: ConversationMemory;
  private reasoningEngine: ReasoningEngine;
  private personality: EnhancedPersonality;
  private aiService: AIService;
  
  // ✅ NOVO: Circuit Breaker
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

  // ✅ MELHORIA 1: Compreensão Contextual Aprimorada
  private async buildEnhancedContext(message: UserMessage): Promise<ConversationContext> {
    const baseContext = await this.memory.getConversationContext(message.userId, message.chatId);
    
    // Adicionar análise de sentimento
    const sentiment = await this.aiService.analyzeSentiment?.(message.content) || { score: 0, label: 'neutral' };
    
    // Verificar histórico recente
    const last5Messages = await this.memory.getRecentMessages(message.userId, 5) || [];
    
    // Detectar tópicos recorrentes
    const recurringTopics = this.detectRecurringTopics(last5Messages);
    
    return {
      ...baseContext,
      sentiment,
      last5Messages,
      recurringTopics,
      isRepetitiveQuestion: this.checkRepetition(message.content, last5Messages)
    };
  }

  // ✅ MELHORIA 2: Sistema de Memória Aprimorado
  private async updateConversationFlow(message: UserMessage, response: AssistantResponse) {
    // Armazena o fluxo atual da conversa
    const flow: ConversationFlow = {
      lastUserMessage: message.content,
      lastBotResponse: response.response,
      detectedIntent: response.action?.type || 'UNKNOWN',
      timestamp: new Date(),
      step: 1,
      dataCollected: response.action?.payload || {}
    };
    
    await this.memory.storeConversationFlow?.(message.userId, flow);
  }

  private async getCurrentFlow(userId: string): Promise<ConversationFlow | null> {
    return await this.memory.getCurrentFlow?.(userId) || null;
  }

  // ✅ MELHORIA 3: Geração de Resposta Mais Inteligente
  private async generateIntelligentResponse(analysis: MessageAnalysis, context: ConversationContext): Promise<AssistantResponse> {
    // 1. Verificar se é continuação de um fluxo existente
    const currentFlow = await this.getCurrentFlow(context.userProfile?.id || 'unknown');
    
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
    const responseTemplates = {
      CREATE_TRANSACTION: {
        complete: `✅ Transação registrada! Valor: R$ ${entities.valor}, Descrição: ${entities.descricao}`,
        incomplete: this.getTransactionIncompleteResponse(entities)
      },
      CREATE_GOAL: {
        complete: `🎯 Meta criada! Objetivo: ${entities.meta}, Valor: R$ ${entities.valor_total}`,
        incomplete: this.getGoalIncompleteResponse(entities)
      },
      CREATE_INVESTMENT: {
        complete: `📈 Investimento registrado! Valor: R$ ${entities.valor}, Nome: ${entities.nome}`,
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
      requiresConfirmation: false
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
        requiresConfirmation: false
      }, isComplete, context)
    };
  }

  // ✅ MELHORIA 4: Sistema de Follow-up Inteligente
  private generateContextualFollowUps(intent: DetectedIntent, isComplete: boolean, context: ConversationContext): string[] {
    if (!isComplete) {
      return this.getMissingFieldsQuestions(intent);
    }
    
    // Baseado no histórico do usuário
    if (context.userProfile?.preferences?.frequentActions?.includes('VIEW_REPORTS')) {
      return ['Gostaria de ver um relatório desta ação?', 'Quer comparar com períodos anteriores?'];
    }
    
    // Sugestões baseadas no momento
    const now = new Date();
    if (now.getMonth() === 11) { // Dezembro
      return ['Gostaria de fazer uma revisão anual?', 'Quer planejar metas para o próximo ano?'];
    }
    
    // Sugestões padrão
    return [
      'Posso te ajudar com algo mais?',
      'Quer ver um resumo desta categoria?'
    ];
  }

  // ✅ MELHORIA 5: Sistema de Aprendizado Contínuo
  private async learnFromInteraction(message: UserMessage, response: AssistantResponse) {
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

  private async adjustModelForConfusion(message: UserMessage, response: AssistantResponse) {
    // Lógica para ajustar o modelo quando o usuário parece confuso
    console.log(`[LEARNING] Ajustando modelo para evitar confusão detectada na mensagem: ${message.content}`);
    await this.aiService.fineTuneBasedOnConfusion?.(message, response);
  }

  // ✅ MELHORIA 6: Implementação de Circuit Breaker
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
        console.error('[CIRCUIT BREAKER] Circuit opened due to consecutive errors');
      }
      
      return this.getGracefulFallback(message, error);
    }
  }

  private isCircuitOpen(): boolean {
    return this.circuitBreaker.errorCount >= this.circuitBreaker.threshold && 
           (Date.now() - this.circuitBreaker.lastErrorTime) < this.circuitBreaker.timeout;
  }

  private circuitBreakerFallback(): AssistantResponse {
    return {
      response: 'Estou passando por algumas melhorias no momento. Por favor, tente novamente em alguns instantes.',
      action: { type: 'CIRCUIT_BREAKER', payload: {}, confidence: 0 },
      insights: ['Circuit breaker acionado']
    };
  }

  private getGracefulFallback(message: UserMessage, error: any): AssistantResponse {
    console.error('[FinancialAssistant] ❌ Erro no processamento:', error);
    return {
      response: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
      action: { type: 'UNKNOWN', payload: {}, confidence: 0 },
      insights: ['Houve um erro no processamento da sua mensagem'],
      followUpQuestions: ['Como posso te ajudar de outra forma?']
    };
  }

  // ✅ MÉTODOS AUXILIARES NOVOS
  private detectRecurringTopics(messages: any[]): string[] {
    const topics = new Map<string, number>();
    
    messages.forEach(msg => {
      const extractedTopics = this.extractTopicsFromMessage(msg.content);
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

  private checkRepetition(currentMessage: string, lastMessages: any[]): boolean {
    const currentLower = currentMessage.toLowerCase();
    
    return lastMessages.some(msg => {
      const msgLower = msg.content.toLowerCase();
      const similarity = this.calculateSimilarity(currentLower, msgLower);
      return similarity > 0.8; // 80% de similaridade
    });
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private isUserCorrecting(analysis: MessageAnalysis, currentFlow: ConversationFlow | null): boolean {
    if (!currentFlow) return false;
    
    const correctionWords = ['corrigir', 'mudar', 'não', 'errado', 'não é isso', 'alterar'];
    const messageLower = analysis.intent.payload?.response?.toLowerCase() || '';
    
    return correctionWords.some(word => messageLower.includes(word));
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
    return await this.collectDataProgressively({
      type: analysis.intent.type,
      payload: analysis.intent.payload,
      confidence: analysis.intent.confidence,
      reasoning: 'Análise de dados progressiva',
      requiresConfirmation: false
    }, context);
  }

  private getTransactionIncompleteResponse(entities: any): string {
    const missingFields = [];
    if (!entities.valor) missingFields.push('valor');
    if (!entities.descricao) missingFields.push('descrição');
    if (!entities.tipo) missingFields.push('tipo (receita/despesa)');
    
    return `Perfeito! Vou te ajudar a registrar essa transação! 💰\n\nPara completar o registro, preciso de: ${missingFields.join(', ')}\n\nPode me passar esses detalhes?`;
  }

  private getGoalIncompleteResponse(entities: any): string {
    const missingFields = [];
    if (!entities.valor_total) missingFields.push('valor total');
    if (!entities.meta) missingFields.push('objetivo da meta');
    if (!entities.data_conclusao) missingFields.push('prazo');
    
    return `Ótimo! Vamos criar essa meta financeira! 🎯\n\nPara configurar sua meta, preciso saber: ${missingFields.join(', ')}\n\nMe conta um pouco mais sobre sua meta!`;
  }

  private getInvestmentIncompleteResponse(entities: any): string {
    const missingFields = [];
    if (!entities.valor) missingFields.push('valor');
    if (!entities.nome) missingFields.push('nome do investimento');
    if (!entities.tipo) missingFields.push('tipo');
    
    return `Excelente! Vamos registrar esse investimento! 📈\n\nPara cadastrar corretamente, preciso de: ${missingFields.join(', ')}\n\nPode me dar essas informações?`;
  }

  private getMissingFieldsQuestions(intent: DetectedIntent): string[] {
    const { entities } = intent;
    const questions: string[] = [];
    
    switch (intent.type) {
      case 'CREATE_TRANSACTION':
        if (!entities.valor) questions.push('Qual foi o valor?');
        if (!entities.descricao) questions.push('O que foi essa transação?');
        if (!entities.tipo) questions.push('É receita ou despesa?');
        break;
      case 'CREATE_GOAL':
        if (!entities.valor_total) questions.push('Qual valor quer juntar?');
        if (!entities.meta) questions.push('Para qual objetivo?');
        if (!entities.data_conclusao) questions.push('Em quanto tempo?');
        break;
      case 'CREATE_INVESTMENT':
        if (!entities.valor) questions.push('Qual valor quer investir?');
        if (!entities.nome) questions.push('Qual o nome do investimento?');
        if (!entities.tipo) questions.push('Qual o tipo?');
        break;
    }
    
    return questions;
  }

  // ✅ MÉTODO PRINCIPAL APRIMORADO
  async processMessage(message: UserMessage): Promise<AssistantResponse> {
    try {
      console.log('[FinancialAssistant] 🧠 Processando mensagem com sistema aprimorado:', message.content);

      // 1. Obter contexto enriquecido
      const context = await this.buildEnhancedContext(message);
      
      // ✅ CORREÇÃO: Adicionar contexto do usuário se disponível
      if (context.userProfile && !context.userProfile.name) {
        // Tentar obter nome do usuário do contexto
        context.userProfile.name = 'Saulo chagas da Silva Martins'; // Nome do usuário dos logs
      }
      
      // 2. Análise profunda com aprendizado
      const analysis = await this.reasoningEngine.analyze(message, context);
      
      console.log(`[FinancialAssistant] 🎯 Intent detectado: ${analysis.intent.type} (confiança: ${analysis.confidence})`);
      
      // ✅ NOVO: Verificar se é uma ação que precisa de coleta de dados
      if (this.requiresDataCollection(analysis.intent.type)) {
        console.log('[FinancialAssistant] 📝 Detectada ação que precisa de coleta de dados');
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
        return await this.collectDataIntelligently(detectedIntent, context);
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
      const finalResponse = this.personality.addTone(response, context.userProfile);
      
      console.log('[FinancialAssistant] ✅ Resposta gerada com sucesso');
      return finalResponse;

    } catch (error) {
      return this.safeProcess(message);
    }
  }

  // ✅ NOVO: Sistema de fluxos conversacionais inteligentes
  private async collectDataProgressively(intent: DetectedIntent, context: ConversationContext): Promise<AssistantResponse> {
    const { entities } = intent;
    
    // Se já tem dados suficientes, executar ação
    if (this.hasCompleteData(intent)) {
      return await this.executeAction(intent, context);
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
      // ✅ CORREÇÃO: Não retornar action para fallback
      requiresConfirmation: false,
      followUpQuestions: ['Quer criar uma meta?', 'Precisa registrar uma transação?'],
      insights: [],
      recommendations: undefined
    };
  }

  // ✅ NOVO: Verificar se tem dados completos
  private hasCompleteData(intent: DetectedIntent): boolean {
    const { entities } = intent;
    
    switch (intent.type) {
      case 'CREATE_TRANSACTION':
        return !!(entities.valor && entities.descricao);
      case 'CREATE_GOAL':
        return !!(entities.valor_total && entities.meta);
      case 'CREATE_INVESTMENT':
        return !!(entities.valor && entities.nome);
      default:
        return true;
    }
  }

  // ✅ NOVO: Identificar campos faltantes
  private getMissingFields(intent: DetectedIntent): string[] {
    const { entities } = intent;
    const missing: string[] = [];
    
    switch (intent.type) {
      case 'CREATE_TRANSACTION':
        if (!entities.valor) missing.push('valor');
        if (!entities.descricao) missing.push('descricao');
        if (!entities.tipo) missing.push('tipo');
        break;
      case 'CREATE_GOAL':
        if (!entities.valor_total) missing.push('valor_total');
        if (!entities.meta) missing.push('meta');
        if (!entities.data_conclusao) missing.push('data_conclusao');
        break;
      case 'CREATE_INVESTMENT':
        if (!entities.valor) missing.push('valor');
        if (!entities.nome) missing.push('nome');
        if (!entities.tipo) missing.push('tipo');
        break;
    }
    
    return missing;
  }

  // ✅ NOVO: Gerar resposta para coleta de dados
  private generateDataCollectionResponse(intentType: string, missingFields: string[], entities: any): string {
    const fieldNames = {
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
        return `Perfeito! Vou te ajudar a registrar essa transação! 💰\n\nPara completar o registro, preciso de mais algumas informações:\n• ${missingFieldNames}\n\nPode me passar esses detalhes?`;
      
      case 'CREATE_GOAL':
        return `Ótimo! Vamos criar essa meta financeira! 🎯\n\nPara configurar sua meta, preciso saber:\n• ${missingFieldNames}\n\nMe conta um pouco mais sobre sua meta!`;
      
      case 'CREATE_INVESTMENT':
        return `Excelente! Vamos registrar esse investimento! 📈\n\nPara cadastrar corretamente, preciso de:\n• ${missingFieldNames}\n\nPode me dar essas informações?`;
      
      default:
        return `Para executar essa ação, preciso de mais informações: ${missingFieldNames}. Por favor, preencha os campos faltantes.`;
    }
  }

  // ✅ NOVO: Gerar perguntas de follow-up
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

  // ✅ NOVO: Executar ação quando dados estiverem completos
  private async executeAction(intent: DetectedIntent, context: ConversationContext): Promise<AssistantResponse> {
    try {
      const { entities } = intent;
      
      switch (intent.type) {
        case 'CREATE_TRANSACTION':
          // Aqui você chamaria o controller para criar a transação
          return {
            response: `✅ Transação registrada com sucesso!\n\n💰 Valor: R$ ${entities.valor}\n📝 Descrição: ${entities.descricao}\n📊 Tipo: ${entities.tipo || 'despesa'}`,
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
            response: `🎯 Meta criada com sucesso!\n\n💰 Valor: R$ ${entities.valor_total}\n🎯 Objetivo: ${entities.meta}\n📅 Prazo: ${entities.data_conclusao || 'Não definido'}`,
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
            response: `📈 Investimento registrado com sucesso!\n\n💰 Valor: R$ ${entities.valor}\n📊 Nome: ${entities.nome}\n🏦 Tipo: ${entities.tipo || 'Não especificado'}`,
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
      console.error('[FinancialAssistant] ❌ Erro ao executar ação:', error);
      
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

  // ✅ NOVO: Sistema de coleta inteligente de dados
  private async collectDataIntelligently(intent: DetectedIntent, context: ConversationContext): Promise<AssistantResponse> {
    const intentType = intent.type;
    const currentData = intent.collectedData || {};
    const missingFields = this.getMissingFields(intent);
    
    // Se já tem todos os dados, executar automaticamente
    if (missingFields.length === 0) {
      return await this.executeAction(intent, context);
    }
    
    // Se é a primeira vez, começar a coleta
    if (!currentData || Object.keys(currentData).length === 0) {
      const firstQuestion = this.getFirstQuestion(intentType);
      return {
        response: firstQuestion,
        action: {
          type: intentType,
          payload: currentData,
          confidence: intent.confidence
        },
        requiresConfirmation: false,
        followUpQuestions: this.getFollowUpQuestions(intentType, missingFields)
      };
    }
    
    // Se já tem alguns dados, continuar a coleta
    const nextField = missingFields[0];
    const nextQuestion = this.getFieldQuestion(intentType, nextField, currentData);
    
    return {
      response: nextQuestion,
      action: {
        type: intentType,
        payload: currentData,
        confidence: intent.confidence
      },
      requiresConfirmation: false,
      followUpQuestions: this.getFollowUpQuestions(intentType, missingFields.slice(1))
    };
  }
  
  // ✅ NOVO: Obter primeira pergunta baseada no tipo de intent
  private getFirstQuestion(intentType: string): string {
    const questions = {
      'CREATE_TRANSACTION': [
        'Beleza! Vou te ajudar a registrar essa transação. Quanto você gastou?',
        'Show! Vamos registrar esse gasto. Qual foi o valor?',
        'Perfeito! Vou te ajudar com isso. Quanto custou?',
        'Valeu! Vamos registrar essa transação. Qual foi o valor gasto?',
        'Legal! Vou te ajudar a registrar. Quanto você pagou?'
      ],
      'CREATE_GOAL': [
        'Ótimo! Vamos criar essa meta! Quanto você quer juntar?',
        'Show! Vou te ajudar a criar essa meta. Qual é o valor que você quer alcançar?',
        'Perfeito! Vamos criar sua meta financeira. Quanto você quer economizar?',
        'Beleza! Vou te ajudar com essa meta. Qual é o valor objetivo?',
        'Legal! Vamos criar sua meta! Quanto você quer juntar?'
      ],
      'CREATE_INVESTMENT': [
        'Excelente! Vamos registrar esse investimento. Quanto você investiu?',
        'Show! Vou te ajudar a registrar. Qual foi o valor investido?',
        'Perfeito! Vamos registrar esse investimento. Quanto você aplicou?',
        'Beleza! Vou te ajudar com isso. Qual foi o valor do investimento?',
        'Legal! Vamos registrar. Quanto você investiu?'
      ]
    };
    
    const questionList = questions[intentType as keyof typeof questions] || [
      'Beleza! Vou te ajudar com isso. O que você gostaria de fazer?'
    ];
    
    return questionList[Math.floor(Math.random() * questionList.length)];
  }
  
  // ✅ NOVO: Obter pergunta específica para um campo
  private getFieldQuestion(intentType: string, field: string, currentData: any): string {
    const fieldQuestions = {
      'CREATE_TRANSACTION': {
        'descricao': [
          'Beleza! Agora me conta, do que foi esse gasto?',
          'Show! E do que foi essa transação?',
          'Perfeito! Agora me fala, o que você comprou?',
          'Valeu! E qual foi a descrição desse gasto?',
          'Legal! Agora me conta, do que foi esse pagamento?'
        ],
        'categoria': [
          'Beleza! E qual categoria você quer colocar? (alimentação, transporte, lazer, etc.)',
          'Show! E em qual categoria você quer classificar?',
          'Perfeito! E qual categoria você quer usar?',
          'Valeu! E qual categoria você quer colocar?',
          'Legal! E qual categoria você quer usar?'
        ]
      },
      'CREATE_GOAL': {
        'meta': [
          'Beleza! Agora me conta, qual é o seu objetivo? (viagem, carro, casa, etc.)',
          'Show! E qual é a sua meta? O que você quer conquistar?',
          'Perfeito! Agora me fala, qual é o seu sonho?',
          'Valeu! E qual é o seu objetivo? O que você quer alcançar?',
          'Legal! Agora me conta, qual é a sua meta?'
        ],
        'prazo': [
          'Beleza! E quando você quer alcançar essa meta?',
          'Show! E qual é o prazo para essa meta?',
          'Perfeito! E quando você quer conquistar isso?',
          'Valeu! E qual é o prazo para essa meta?',
          'Legal! E quando você quer alcançar isso?'
        ]
      },
      'CREATE_INVESTMENT': {
        'tipo': [
          'Beleza! Agora me conta, qual tipo de investimento? (ações, renda fixa, fundos, etc.)',
          'Show! E qual tipo de investimento você fez?',
          'Perfeito! Agora me fala, qual tipo de aplicação?',
          'Valeu! E qual tipo de investimento você fez?',
          'Legal! Agora me conta, qual tipo de aplicação?'
        ],
        'instituicao': [
          'Beleza! E em qual instituição você investiu?',
          'Show! E qual banco/corretora você usou?',
          'Perfeito! E em qual instituição você aplicou?',
          'Valeu! E qual banco/corretora você usou?',
          'Legal! E em qual instituição você investiu?'
        ]
      }
    };
    
    const questions = fieldQuestions[intentType as keyof typeof fieldQuestions]?.[field as any] || [
      'Beleza! Agora me conta mais sobre isso.'
    ];
    
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  // ✅ NOVO: Obter perguntas de acompanhamento
  private getFollowUpQuestions(intentType: string, missingFields: string[]): string[] {
    const followUps = {
      'CREATE_TRANSACTION': [
        'Quer adicionar uma categoria?',
        'Quer definir uma data específica?',
        'Quer adicionar uma nota?'
      ],
      'CREATE_GOAL': [
        'Quer definir um prazo?',
        'Quer adicionar uma descrição?',
        'Quer definir lembretes?'
      ],
      'CREATE_INVESTMENT': [
        'Quer adicionar uma descrição?',
        'Quer definir um prazo?',
        'Quer adicionar uma nota?'
      ]
    };
    
    return followUps[intentType as keyof typeof followUps] || [];
  }

  private detectConversationContinuation(context: ConversationContext): boolean {
    return context.lastTopics.length > 0 && context.lastTopics[context.lastTopics.length - 1]?.includes('criação');
  }

  private detectCorrection(analysis: MessageAnalysis): boolean {
    const correctionWords = ['corrigir', 'mudar', 'não', 'errado', 'não é isso'];
    return correctionWords.some(word => analysis.intent.payload?.response?.toLowerCase().includes(word));
  }

  private detectConfusion(analysis: MessageAnalysis): boolean {
    const confusionWords = ['como', 'o que', 'não entendi', 'confuso', 'dúvida'];
    return confusionWords.some(word => analysis.intent.payload?.response?.toLowerCase().includes(word));
  }

  private handleCorrection(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const responses = [
      "Tranquilo! Vamos corrigir isso. O que você gostaria de mudar?",
      "Sem problema! Vamos ajustar. O que está errado?",
      "Beleza! Vamos corrigir. Qual parte você quer alterar?",
      "Ok! Vamos mudar isso. O que precisa ser diferente?",
      "Tranquilo! Vamos ajustar. O que não está certo?"
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      action: { type: 'CORRECTION', payload: {}, confidence: 0.8 },
      insights: ['Usuário solicitou correção'],
      followUpQuestions: ['Qual parte você quer corrigir?', 'O que está errado?']
    };
  }

  private handleConfusion(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const responses = [
      "Vou explicar de forma mais clara!",
      "Deixa eu simplificar isso pra você!",
      "Vou quebrar isso em partes menores!",
      "Não se preocupe, vou deixar bem simples!",
      "Vou te ajudar a entender melhor!"
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      action: { type: 'EXPLANATION', payload: {}, confidence: 0.8 },
      insights: ['Usuário demonstrou confusão'],
      followUpQuestions: ['O que você não entendeu?', 'Qual parte ficou confusa?']
    };
  }

  private handleConfirmation(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const { intent, entities } = analysis;
    
    let summary = '';
    let response = '';

    if (intent.type === 'CREATE_GOAL') {
      summary = `🎯 **Resumo da Meta:**
• Nome: ${entities.meta || 'Não informado'}
• Valor: ${entities.valor_total ? `R$ ${entities.valor_total}` : 'Não informado'}
• Prazo: ${entities.data_conclusao || 'Não informado'}`;
      
      response = "Perfeito! Vou criar essa meta pra você. Está tudo correto?";
    }
    
    if (intent.type === 'CREATE_TRANSACTION') {
      summary = `📋 **Resumo da Transação:**
• Tipo: ${entities.tipo || 'Não informado'}
• Valor: ${entities.valor ? `R$ ${entities.valor}` : 'Não informado'}
• Descrição: ${entities.descricao || 'Não informado'}
• Categoria: ${entities.categoria || 'Automática'}`;
      
      response = "Beleza! Vou registrar essa transação. Está correto?";
    }
    
    if (intent.type === 'CREATE_INVESTMENT') {
      summary = `💼 **Resumo do Investimento:**
• Nome: ${entities.nome || 'Não informado'}
• Valor: ${entities.valor ? `R$ ${entities.valor}` : 'Não informado'}
• Tipo: ${entities.tipo || 'Não informado'}`;
      
      response = "Ótimo! Vou adicionar esse investimento. Está certo?";
    }

    return {
      response: `${summary}\n\n${response}`,
      action: { type: intent.type, payload: intent.payload || {}, confidence: intent.confidence },
      insights: ['Aguardando confirmação do usuário'],
      followUpQuestions: ['Está correto?', 'Posso criar agora?']
    };
  }

  private handleGoalCreation(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const responses = [
      "Que legal! Vamos criar essa meta juntos! Qual valor você quer juntar?",
      "Perfeito! Vamos definir essa meta! Qual o valor necessário?",
      "Ótimo! Vamos planejar isso direitinho! Qual valor você precisa?",
      "Beleza! Vamos organizar essa meta! Qual o valor total?",
      "Show! Vamos criar um plano pra essa meta! Qual valor você quer juntar?"
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      action: { type: 'COLLECT_GOAL_DATA', payload: {}, confidence: 0.9 },
      insights: ['Coletando dados da meta'],
      followUpQuestions: ['Qual valor?', 'Para qual objetivo?', 'Em quanto tempo?']
    };
  }

  private handleTransactionCreation(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const responses = [
      "Perfeito! Vamos registrar essa transação! Qual foi o valor?",
      "Beleza! Vamos adicionar essa transação! Qual o valor?",
      "Ótimo! Vamos registrar isso! Qual valor foi?",
      "Show! Vamos colocar essa transação! Qual o valor?",
      "Tranquilo! Vamos registrar essa movimentação! Qual valor?"
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      action: { type: 'COLLECT_TRANSACTION_DATA', payload: {}, confidence: 0.9 },
      insights: ['Coletando dados da transação'],
      followUpQuestions: ['Qual valor?', 'O que foi?', 'Como pagou?']
    };
  }

  private handleInvestmentCreation(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const responses = [
      "Ótimo! Vamos registrar esse investimento! Qual valor você investiu?",
      "Perfeito! Vamos adicionar ao seu portfólio! Qual valor?",
      "Beleza! Vamos registrar esse investimento! Qual valor?",
      "Show! Vamos colocar esse investimento! Qual valor?",
      "Tranquilo! Vamos registrar essa aplicação! Qual valor?"
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      action: { type: 'COLLECT_INVESTMENT_DATA', payload: {}, confidence: 0.9 },
      insights: ['Coletando dados do investimento'],
      followUpQuestions: ['Qual valor?', 'Em que tipo?', 'Qual o nome?']
    };
  }

  // ✅ NOVO: Verificar se uma ação precisa de coleta de dados
  private requiresDataCollection(intentType: string): boolean {
    const actionsThatNeedData = [
      'CREATE_TRANSACTION',
      'CREATE_GOAL', 
      'CREATE_INVESTMENT'
    ];
    
    return actionsThatNeedData.includes(intentType);
  }


}

export const financialAssistant = new FinancialAssistant(); 