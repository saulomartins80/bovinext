import OpenAI from 'openai';
import { AppError } from '../core/errors/AppError';
import { ChatMessage } from '../types/chat';
import { EventEmitter } from 'events';

// ===== CONFIGURAÇÃO OTIMIZADA =====
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
  timeout: 30000, // Aumentado para 30 segundos
});

// ===== SISTEMA DE CACHE INTELIGENTE =====
class IntelligentCache {
  private cache = new Map<string, any>();
  private accessCount = new Map<string, number>();
  private lastAccess = new Map<string, number>();
  private readonly MAX_SIZE = 100;
  private readonly TTL = 30 * 60 * 1000; // 30 minutos

  set(key: string, value: any): void {
    // Limpar cache se necessário
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictLeastUsed();
    }

    this.cache.set(key, value);
    this.accessCount.set(key, 1);
    this.lastAccess.set(key, Date.now());
  }

  get(key: string): any {
    const value = this.cache.get(key);
    if (!value) return null;

    // Verificar TTL
    const lastAccess = this.lastAccess.get(key) || 0;
    if (Date.now() - lastAccess > this.TTL) {
      this.delete(key);
      return null;
    }

    // Atualizar estatísticas
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.lastAccess.set(key, Date.now());
    
    return value;
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastCount = Infinity;

    for (const [key, count] of this.accessCount) {
      if (count < leastCount) {
        leastCount = count;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.delete(leastUsedKey);
    }
  }

  private delete(key: string): void {
    this.cache.delete(key);
    this.accessCount.delete(key);
    this.lastAccess.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessCount.clear();
    this.lastAccess.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate(),
      mostAccessed: this.getMostAccessed()
    };
  }

  private calculateHitRate(): number {
    const total = Array.from(this.accessCount.values()).reduce((a, b) => a + b, 0);
    return total > 0 ? (this.cache.size / total) * 100 : 0;
  }

  private getMostAccessed(): Array<{key: string, count: number}> {
    return Array.from(this.accessCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => ({ key: key.substring(0, 50), count }));
  }
}

// ===== SISTEMA DE DETECÇÃO DE INTENÇÕES RÁPIDO =====
class FastIntentDetector {
  private patterns = {
    CREATE_TRANSACTION: [
      /gast[ei]|comprei|paguei|despesa|receita|transação/i,
      /registr[ao]|adicionar|criar.*transação/i,
      /valor.*r\$|\$|real|reais/i
    ],
    CREATE_GOAL: [
      /meta|objetivo|juntar|poupar|economizar/i,
      /quero.*r\$|preciso.*r\$/i,
      /plano.*financeiro|planejamento/i
    ],
    CREATE_INVESTMENT: [
      /invest[ir]|aplicar|render|cdb|tesouro|ações/i,
      /bolsa|b3|nubank|inter|btg/i,
      /rentabilidade|juros|dividendos/i
    ],
    ANALYZE_DATA: [
      /analis[ae]|relatório|gráfico|dashboard/i,
      /como.*gast[oa]|onde.*gast[oa]/i,
      /resumo|balanço|situação.*financeira/i
    ],
    MILEAGE: [
      /milhas|pontos|smiles|tudoazul|latam/i,
      /cartão.*crédito|programa.*fidelidade/i,
      /resgat[ae]|acumular.*pontos/i
    ],
    HELP: [
      /ajuda|help|como.*usar|não.*sei/i,
      /tutorial|explicar|ensinar/i,
      /o que.*posso|funcionalidades/i
    ],
    GREETING: [
      /oi|olá|hey|bom.*dia|boa.*tarde|boa.*noite/i,
      /tudo.*bem|como.*vai|beleza/i
    ]
  };

  detect(message: string): { intent: string; confidence: number; entities: any } {
    const lowerMessage = message.toLowerCase();
    let bestMatch = { intent: 'UNKNOWN', confidence: 0.0, entities: {} };

    for (const [intent, patterns] of Object.entries(this.patterns)) {
      let matches = 0;
      const entities: any = {};

      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          matches++;
        }
      }

      // Extrair entidades específicas
      if (intent === 'CREATE_TRANSACTION') {
        const valueMatch = message.match(/r\$\s*(\d+(?:[.,]\d{2})?)/i);
        if (valueMatch) {
          entities.valor = parseFloat(valueMatch[1].replace(',', '.'));
        }
      }

      const confidence = matches / patterns.length;
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent, confidence, entities };
      }
    }

    return bestMatch;
  }
}

// ===== SISTEMA DE STREAMING INTELIGENTE =====
class StreamingResponse extends EventEmitter {
  private buffer = '';
  private isComplete = false;

  async streamResponse(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
    try {
      const stream = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
        stream: true,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
          this.emit('chunk', content);
        }
      }

      this.isComplete = true;
      this.emit('complete', fullResponse);
      return fullResponse;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
}

// ===== SISTEMA DE CONTEXTO OTIMIZADO =====
class OptimizedContext {
  private userContexts = new Map<string, any>();

  updateContext(userId: string, message: string, response: string): void {
    const existing = this.userContexts.get(userId) || {
      recentTopics: [],
      preferences: { style: 'balanced' },
      lastInteraction: Date.now(),
      messageCount: 0
    };

    existing.recentTopics.unshift(this.extractTopic(message));
    existing.recentTopics = existing.recentTopics.slice(0, 5); // Manter apenas 5 tópicos recentes
    existing.lastInteraction = Date.now();
    existing.messageCount++;

    this.userContexts.set(userId, existing);
  }

  getContext(userId: string): any {
    return this.userContexts.get(userId) || {
      recentTopics: [],
      preferences: { style: 'balanced' },
      lastInteraction: Date.now(),
      messageCount: 0
    };
  }

  private extractTopic(message: string): string {
    const topics = {
      'investimento': /invest|aplicar|render|cdb|tesouro/i,
      'gastos': /gast|compra|despesa|pagar/i,
      'metas': /meta|objetivo|poupar|juntar/i,
      'milhas': /milhas|pontos|cartão/i,
      'análise': /analis|relatório|gráfico/i
    };

    for (const [topic, pattern] of Object.entries(topics)) {
      if (pattern.test(message)) {
        return topic;
      }
    }

    return 'geral';
  }
}

// ===== CLASSE PRINCIPAL OTIMIZADA =====
export class OptimizedAIService {
  private cache = new IntelligentCache();
  private intentDetector = new FastIntentDetector();
  private contextManager = new OptimizedContext();
  private responseCount = 0;

  // Prompts otimizados e mais diretos
  private readonly SYSTEM_PROMPTS = {
    FINN_CORE: `Você é Finn, assistente financeiro da Finnextho. Seja direto, útil e amigável.
    
REGRAS:
- Respostas em português brasileiro
- Máximo 150 palavras por resposta
- Use emojis moderadamente
- Seja proativo em sugerir ações
- Confirme apenas ações importantes (>R$1000 ou exclusões)

AÇÕES DISPONÍVEIS:
- Criar transações, metas, investimentos
- Analisar dados financeiros
- Gerenciar milhas e pontos
- Explicar funcionalidades

Responda de forma natural e conversacional.`,

    QUICK_HELP: `Responda rapidamente sobre funcionalidades da FinNEXTHO. Seja conciso e direto.`,
    
    AUTOMATION: `Analise a mensagem e determine se é uma solicitação de automação. Responda em JSON:
{
  "intent": "CREATE_TRANSACTION|CREATE_GOAL|CREATE_INVESTMENT|ANALYZE_DATA|HELP|GREETING|UNKNOWN",
  "confidence": 0.0-1.0,
  "requiresConfirmation": boolean,
  "entities": {},
  "response": "resposta amigável"
}`
  };

  async generateResponse(
    userId: string,
    message: string,
    conversationHistory: ChatMessage[] = [],
    userContext?: any
  ): Promise<{
    text: string;
    intent?: string;
    confidence?: number;
    requiresConfirmation?: boolean;
    entities?: any;
    responseTime: number;
    cached?: boolean;
  }> {
    const startTime = Date.now();
    
    try {
      // 1. Verificar cache primeiro (inclui "impressão" do histórico recente para evitar respostas fora de contexto)
      const historyKey = (conversationHistory || [])
        .slice(-3)
        .map(m => (typeof m.content === 'string' ? m.content : ''))
        .join('|')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .substring(0, 120);
      const cacheKey = this.getCacheKey(userId, message, historyKey);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log(`[OptimizedAI] Cache hit for user ${userId}`);
        return {
          ...cached,
          responseTime: Date.now() - startTime,
          cached: true
        };
      }

      // 2. Detecção rápida de intenção
      const intentResult = this.intentDetector.detect(message);
      
      // 3. Atualizar contexto
      this.contextManager.updateContext(userId, message, '');

      // 4. Gerar resposta baseada na intenção
      let response: string;
      let requiresConfirmation = false;

      if (intentResult.confidence > 0.7) {
        // Alta confiança - usar automação
        response = await this.generateAutomatedResponse(intentResult, message, userContext);
        requiresConfirmation = this.shouldRequireConfirmation(intentResult);
      } else {
        // Baixa confiança - usar resposta conversacional
        response = await this.generateConversationalResponse(message, conversationHistory, userContext);
      }

      // 5. Pós-processamento
      response = this.postProcessResponse(response, userContext);

      // 6. Salvar no cache
      const result = {
        text: response,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        requiresConfirmation,
        entities: intentResult.entities,
        responseTime: Date.now() - startTime
      };

      this.cache.set(cacheKey, result);
      this.responseCount++;

      return result;

    } catch (error) {
      console.error('[OptimizedAI] Error generating response:', error);
      return {
        text: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
        responseTime: Date.now() - startTime,
        confidence: 0.0
      };
    }
  }

  async streamResponse(
    userId: string,
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const streamer = new StreamingResponse();
    const prompt = this.buildStreamPrompt(message, userId);
    
    return streamer.streamResponse(prompt, onChunk);
  }

  private async generateAutomatedResponse(
    intentResult: any,
    message: string,
    userContext?: any
  ): Promise<string> {
    const responses = {
      CREATE_TRANSACTION: `Perfeito! Vou ajudar você a registrar essa transação. ${
        intentResult.entities.valor ? 
        `Vi que o valor é R$ ${intentResult.entities.valor}. ` : 
        'Qual foi o valor? '
      }Preciso só de mais alguns detalhes.`,
      
      CREATE_GOAL: `Ótima ideia criar uma meta! Metas são fundamentais para organizar as finanças. Qual o valor que você quer juntar e para quando?`,
      
      CREATE_INVESTMENT: `Investir é sempre uma boa! 📈 Vou te ajudar a registrar esse investimento. Qual foi o valor e onde você aplicou?`,
      
      ANALYZE_DATA: `Vou analisar seus dados financeiros! ${
        userContext?.totalTransacoes > 0 ? 
        'Com base no seu histórico, posso gerar insights interessantes.' :
        'Assim que você tiver algumas transações, posso fazer análises detalhadas.'
      }`,
      
      MILEAGE: `Milhas e pontos são ótimos para economizar! ✈️ Posso te ajudar a gerenciar seus programas de fidelidade. O que você quer fazer?`,
      
      HELP: `Estou aqui para ajudar! 🤝 Posso te ajudar com transações, investimentos, metas, análises e muito mais. O que você gostaria de saber?`,
      
      GREETING: this.getPersonalizedGreeting(userContext)
    };

    return responses[intentResult.intent as keyof typeof responses] || 
           'Como posso te ajudar hoje?';
  }

  private async generateConversationalResponse(
    message: string,
    conversationHistory: ChatMessage[],
    userContext?: any
  ): Promise<string> {
    const context = this.buildContextPrompt(conversationHistory, userContext);
    const prompt = `${this.SYSTEM_PROMPTS.FINN_CORE}\n\nContexto: ${context}\n\nUsuário: ${message}\n\nFinn:`;

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || 'Como posso te ajudar?';
  }

  private shouldRequireConfirmation(intentResult: any): boolean {
    // Confirmar apenas para ações importantes
    if (intentResult.entities.valor && intentResult.entities.valor > 1000) {
      return true;
    }
    
    if (intentResult.intent === 'CREATE_INVESTMENT' && intentResult.entities.valor > 500) {
      return true;
    }

    return false;
  }

  private getPersonalizedGreeting(userContext?: any): string {
    const greetings = [
      'Oi! Como posso te ajudar hoje? 😊',
      'Olá! Pronto para cuidar das suas finanças? 💰',
      'Hey! O que vamos fazer hoje? 🚀',
      'Oi! Como estão suas finanças? 📊'
    ];

    if (userContext?.messageCount > 10) {
      greetings.push('E aí! Bom te ver de novo! 👋');
    }

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private buildContextPrompt(conversationHistory: ChatMessage[], userContext?: any): string {
    const recentMessages = conversationHistory.slice(-3);
    const context = recentMessages.map(msg => 
      `${msg.sender}: ${typeof msg.content === 'string' ? msg.content : '[Conteúdo complexo]'}`
    ).join('\n');

    const userInfo = userContext ? 
      `Usuário tem ${userContext.totalTransacoes || 0} transações, ${userContext.totalMetas || 0} metas.` : 
      '';

    return `${context}\n${userInfo}`;
  }

  private buildStreamPrompt(message: string, userId: string): string {
    const context = this.contextManager.getContext(userId);
    return `${this.SYSTEM_PROMPTS.FINN_CORE}\n\nTópicos recentes: ${context.recentTopics.join(', ')}\n\nUsuário: ${message}\n\nFinn:`;
  }

  private postProcessResponse(response: string, userContext?: any): string {
    // Adicionar elementos premium se aplicável
    if (userContext?.subscriptionPlan === 'top' || userContext?.subscriptionPlan === 'enterprise') {
      if (Math.random() < 0.3) { // 30% das vezes
        response += '\n\n💎 Como cliente premium, você tem acesso a análises exclusivas!';
      }
    }

    return response.trim();
  }

  private getCacheKey(userId: string, message: string, historyKey: string = ''): string {
    const base = `${userId}_${message.substring(0, 50).toLowerCase().replace(/\s+/g, '_')}`;
    if (!historyKey) return base;
    const hist = historyKey.substring(0, 80).replace(/\s+/g, '_');
    return `${base}__h:${hist}`;
  }

  // Métodos de utilidade
  getCacheStats() {
    return {
      ...this.cache.getStats(),
      totalResponses: this.responseCount
    };
  }

  clearCache() {
    this.cache.clear();
  }

  // Método para compatibilidade com o sistema existente
  async generateContextualResponse(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[],
    userContext?: any
  ) {
    const userId = userContext?.userId || 'anonymous';
    const result = await this.generateResponse(userId, userMessage, conversationHistory, userContext);
    
    return {
      text: result.text,
      analysisData: {
        responseTime: result.responseTime,
        engine: 'optimized',
        confidence: result.confidence || 0.8,
        cached: result.cached || false
      }
    };
  }
}

export default OptimizedAIService;
