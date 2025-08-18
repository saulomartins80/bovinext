import OpenAI from 'openai';
import { AppError } from '../core/errors/AppError';
import { ChatMessage } from '../types/chat';
import { EventEmitter } from 'events';
import ExternalAPIService from './ExternalAPIService';
import { createTransaction, createGoal, createInvestment } from '../controllers/automatedActionsController';
import { User } from '../models/User';
import { ITransacao } from '../models/Transacoes';
import { Goal } from '../models/Goal';
import { Investimento } from '../models/Investimento';

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
    create_transaction: [
      /gast[ei]|comprei|paguei|despesa|receita|transação/i,
      /registr[ao]|adicionar|criar.*transação/i,
      /valor.*r\$|\$|real|reais/i,
      /\d+.*r\$|r\$.*\d+/i,
      /\d+.*reais|reais.*\d+/i,
      /conta.*luz|conta.*água|conta.*gás/i,
      /supermercado|mercado|farmácia/i,
      /uber|99|taxi|gasolina|combustível/i
    ],
    create_goal: [
      /meta|objetivo|juntar|poupar|economizar/i,
      /quero.*r\$|preciso.*r\$/i,
      /plano.*financeiro|planejamento/i
    ],
    create_investment: [
      /invest[ir]|aplicar|render|cdb|tesouro|ações/i,
      /bolsa|b3|nubank|inter|btg/i,
      /rentabilidade|juros|dividendos/i
    ],
    analyze_data: [
      /analis[ae]|relatório|gráfico|dashboard/i,
      /como.*gast[oa]|onde.*gast[oa]/i,
      /resumo|balanço|situação.*financeira/i
    ],
    mileage: [
      /milhas|pontos|smiles|tudoazul|latam/i,
      /cartão.*crédito|programa.*fidelidade/i,
      /resgat[ae]|acumular.*pontos/i
    ],
    help: [
      /ajuda|help|como.*usar|não.*sei/i,
      /tutorial|explicar|ensinar/i,
      /o que.*posso|funcionalidades/i
    ],
    greeting: [
      /oi|olá|hey|bom.*dia|boa.*tarde|boa.*noite/i,
      /tudo.*bem|como.*vai|beleza/i
    ]
  };

  detect(message: string): { intent: string; confidence: number; entities: any } {
    const lowerMessage = message.toLowerCase();
    let bestMatch = { intent: 'UNKNOWN', confidence: 0.0, entities: {} };

    console.log(`[FastIntentDetector] 🔍 Analisando mensagem: "${message}"`);

    for (const [intent, patterns] of Object.entries(this.patterns)) {
      let matches = 0;
      const entities: any = {};

      console.log(`[FastIntentDetector] 🎯 Testando intent: ${intent}`);

      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          matches++;
          console.log(`[FastIntentDetector] ✅ Pattern match: ${pattern} para intent: ${intent}`);
        }
      }

      // Extrair entidades específicas para TRANSAÇÃO
      if (intent === 'create_transaction') {
        // Extrair valor - padrões mais flexíveis
        const valuePatterns = [
          /r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /(\d+(?:[.,]\d{1,2})?)\s*reais?/i,
          /(\d+(?:[.,]\d{1,2})?)\s*r\$/i,
          /valor.*?(\d+(?:[.,]\d{1,2})?)/i,
          /(\d+(?:[.,]\d{1,2})?)/
        ];
        
        for (const pattern of valuePatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.valor = parseFloat(match[1].replace(',', '.'));
            break;
          }
        }
        
        // Extrair descrição baseada no contexto
        if (lowerMessage.includes('gastei')) {
          entities.descricao = 'Despesa';
          entities.tipo = 'despesa';
        } else if (lowerMessage.includes('recebi')) {
          entities.descricao = 'Receita';
          entities.tipo = 'receita';
        } else if (lowerMessage.includes('paguei')) {
          entities.descricao = 'Pagamento';
          entities.tipo = 'despesa';
        } else if (lowerMessage.includes('comprei')) {
          entities.descricao = 'Compra';
          entities.tipo = 'despesa';
        } else {
          entities.descricao = 'Transação';
          entities.tipo = 'despesa';
        }
        
        // Extrair categoria com mais opções
        if (lowerMessage.includes('comida') || lowerMessage.includes('restaurante') || lowerMessage.includes('ifood') || lowerMessage.includes('lanche')) {
          entities.categoria = 'Alimentação';
        } else if (lowerMessage.includes('uber') || lowerMessage.includes('99') || lowerMessage.includes('taxi') || lowerMessage.includes('gasolina') || lowerMessage.includes('combustível') || lowerMessage.includes('transporte')) {
          entities.categoria = 'Transporte';
        } else if (lowerMessage.includes('supermercado') || lowerMessage.includes('mercado') || lowerMessage.includes('compras')) {
          entities.categoria = 'Alimentação';
        } else if (lowerMessage.includes('luz') || lowerMessage.includes('água') || lowerMessage.includes('gás') || lowerMessage.includes('energia') || lowerMessage.includes('conta')) {
          entities.categoria = 'Contas';
        } else if (lowerMessage.includes('farmácia') || lowerMessage.includes('remédio') || lowerMessage.includes('médico') || lowerMessage.includes('saúde')) {
          entities.categoria = 'Saúde';
        } else {
          entities.categoria = 'Geral';
        }
        
        // Definir conta padrão
        entities.conta = 'Principal';
        entities.data = new Date().toISOString().split('T')[0];
        
        // Extrair descrição mais específica baseada na mensagem
        const palavrasChave = lowerMessage.split(' ');
        const excludeWords = ['gastei', 'paguei', 'comprei', 'reais', 'valor', 'quero', 'registrar', 'despesa', 'uma', 'de'];
        
        // Procurar por palavras relevantes (empresas, estabelecimentos, etc.)
        for (const palavra of palavrasChave) {
          if (palavra.length > 2 && !excludeWords.includes(palavra) && !palavra.includes('100') && !palavra.includes('r$')) {
            entities.descricao = palavra.charAt(0).toUpperCase() + palavra.slice(1);
            break;
          }
        }
        
        // Se não encontrou uma boa descrição, usar uma padrão baseada na categoria
        if (!entities.descricao || entities.descricao === 'Quero') {
          entities.descricao = entities.categoria || 'Despesa';
        }
      }

      // Extrair entidades específicas para META
      if (intent === 'create_goal') {
        const valuePatterns = [
          /meta.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /objetivo.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /juntar.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /poupar.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /(\d+(?:[.,]\d{1,2})?)\s*reais?/i
        ];
        
        for (const pattern of valuePatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.valor_total = parseFloat(match[1].replace(',', '.'));
            entities.valor = entities.valor_total; // Compatibilidade
            break;
          }
        }
        
        // Extrair prazo se mencionado
        const prazoPatterns = [
          /(\d+)\s*meses?/i,
          /(\d+)\s*anos?/i,
          /até.*?(\d{1,2})\/(\d{1,2})/i
        ];
        
        for (const pattern of prazoPatterns) {
          const match = message.match(pattern);
          if (match) {
            if (pattern.source.includes('meses')) {
              entities.prazo_meses = parseInt(match[1]);
            } else if (pattern.source.includes('anos')) {
              entities.prazo_meses = parseInt(match[1]) * 12;
            }
            break;
          }
        }
        
        entities.descricao = entities.descricao || 'Meta financeira';
        entities.categoria = 'Economia';
      }

      // Extrair entidades específicas para INVESTIMENTO
      if (intent === 'create_investment') {
        const valuePatterns = [
          /invest.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /aplicar.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /(\d+(?:[.,]\d{1,2})?)\s*reais?/i
        ];
        
        for (const pattern of valuePatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.valor = parseFloat(match[1].replace(',', '.'));
            break;
          }
        }
        
        // Detectar tipo de investimento
        if (lowerMessage.includes('cdb') || lowerMessage.includes('banco')) {
          entities.tipo = 'CDB';
        } else if (lowerMessage.includes('tesouro') || lowerMessage.includes('selic')) {
          entities.tipo = 'Tesouro Direto';
        } else if (lowerMessage.includes('ações') || lowerMessage.includes('bolsa')) {
          entities.tipo = 'Ações';
        } else if (lowerMessage.includes('fii') || lowerMessage.includes('fundos')) {
          entities.tipo = 'Fundos Imobiliários';
        } else {
          entities.tipo = 'Renda Fixa';
        }
        
        entities.descricao = entities.descricao || `Investimento em ${entities.tipo}`;
        entities.categoria = 'Investimentos';
      }

      // Calcular confiança de forma mais inteligente
      let confidence = 0;
      
      if (intent === 'create_transaction') {
        // Para transações, se tem pelo menos 2 matches, já é alta confiança
        if (matches >= 2) {
          confidence = 0.8;
        } else if (matches >= 1) {
          confidence = 0.6;
        }
        // Boost se encontrou valor
        if (entities.valor && entities.valor > 0) {
          confidence = Math.min(confidence + 0.1, 1.0);
        }
      } else if (intent === 'create_goal') {
        confidence = matches >= 1 ? 0.7 : 0;
        if (entities.valor_total && entities.valor_total > 0) {
          confidence = Math.min(confidence + 0.2, 1.0);
        }
      } else if (intent === 'create_investment') {
        confidence = matches >= 1 ? 0.7 : 0;
        if (entities.valor && entities.valor > 0) {
          confidence = Math.min(confidence + 0.2, 1.0);
        }
      } else {
        // Para outros intents, usar cálculo original
        confidence = matches / patterns.length;
      }
      
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
        max_tokens: 800,
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
  // Cache de contexto por usuário
  private userContexts = new Map<string, any>();
  private externalAPI = new ExternalAPIService();

  // Enriquecer resposta com dados financeiros em tempo real
  private async enrichResponseWithMarketData(message: string, response: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    let enrichedResponse = response;

    try {
      // Detectar menções a ações específicas
      const stockSymbols = ['petr4', 'vale3', 'itub4', 'bbdc4', 'abev3', 'wege3'];
      const mentionedStocks = stockSymbols.filter(symbol => 
        lowerMessage.includes(symbol) || lowerMessage.includes(symbol.replace(/\d/, ''))
      );

      if (mentionedStocks.length > 0) {
        const quotes = await Promise.all(
          mentionedStocks.map(symbol => this.externalAPI.getStockQuote(symbol))
        );
        
        const validQuotes = quotes.filter(q => q !== null);
        if (validQuotes.length > 0) {
          enrichedResponse += '\n\n📊 **Cotações atuais:**\n';
          validQuotes.forEach(quote => {
            const changeIcon = quote!.change >= 0 ? '📈' : '📉';
            enrichedResponse += `${changeIcon} ${quote!.symbol}: R$ ${quote!.price.toFixed(2)} (${quote!.changePercent.toFixed(2)}%)\n`;
          });
        }
      }

      // Detectar menções a moedas
      if (lowerMessage.includes('dólar') || lowerMessage.includes('usd')) {
        const usdRate = await this.externalAPI.getCurrencyRate('USD', 'BRL');
        if (usdRate) {
          enrichedResponse += `\n\n💱 **Dólar hoje:** R$ ${usdRate.rate.toFixed(2)}`;
        }
      }

      if (lowerMessage.includes('euro') || lowerMessage.includes('eur')) {
        const eurRate = await this.externalAPI.getCurrencyRate('EUR', 'BRL');
        if (eurRate) {
          enrichedResponse += `\n\n💱 **Euro hoje:** R$ ${eurRate.rate.toFixed(2)}`;
        }
      }

      // Detectar menções a criptomoedas
      if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
        const btcPrice = await this.externalAPI.getCryptoPrice('bitcoin');
        if (btcPrice) {
          const changeIcon = btcPrice.change24h >= 0 ? '📈' : '📉';
          enrichedResponse += `\n\n₿ **Bitcoin:** R$ ${btcPrice.price.toLocaleString('pt-BR')} ${changeIcon} ${btcPrice.change24h.toFixed(2)}%`;
        }
      }

      // Detectar menções a programas de milhas
      if (lowerMessage.includes('milhas') || lowerMessage.includes('pontos')) {
        const programs = await this.externalAPI.getMileagePrograms();
        if (programs.length > 0) {
          enrichedResponse += '\n\n✈️ **Programas de Milhas:**\n';
          programs.slice(0, 2).forEach(program => {
            const bestRedemption = program.bestRedemptions[0];
            enrichedResponse += `• ${program.program}: ${bestRedemption.points.toLocaleString()} pts = R$ ${bestRedemption.value}\n`;
          });
        }
      }

      // Detectar menções ao Tesouro Direto
      if (lowerMessage.includes('tesouro') || lowerMessage.includes('selic')) {
        const treasuryRates = await this.externalAPI.getTreasuryRates();
        if (treasuryRates.length > 0) {
          enrichedResponse += '\n\n🏛️ **Tesouro Direto:**\n';
          treasuryRates.slice(0, 2).forEach(rate => {
            enrichedResponse += `• ${rate.titulo}: ${rate.taxa}% a.a.\n`;
          });
        }
      }

    } catch (error) {
      console.error('Erro ao enriquecer resposta com dados de mercado:', error);
      // Continua sem os dados externos se houver erro
    }

    return enrichedResponse;
  }

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
  private externalAPI = new ExternalAPIService();

  // Sistema de prompts (inicializado no construtor)
  private SYSTEM_PROMPTS = {
    FINN_CORE: `Você é Finn, o assistente financeiro pessoal da FinNextHo. Seja natural, amigável e direto.

Suas principais funções:
- Registrar transações, metas e investimentos
- Analisar gastos e dar insights financeiros
- Responder dúvidas sobre finanças pessoais
- Ajudar com planejamento financeiro

Sempre seja:
✅ Conciso e objetivo
✅ Amigável mas profissional
✅ Focado em soluções práticas
✅ Proativo em sugerir ações

❌ Não seja verboso ou repetitivo
❌ Não mencione limitações técnicas
❌ Não peça desculpas desnecessárias
❌ Não mencione datas a menos que o usuário pergunte especificamente`
  };

  constructor() {
    this.SYSTEM_PROMPTS = {
      FINN_CORE: this.getSystemPrompt()
    };
  }

  // Prompts otimizados e mais diretos
  private getSystemPrompt(): string {
    const now = new Date();
    const currentMonth = now.toLocaleDateString('pt-BR', { month: 'long' });
    const currentYear = now.getFullYear();
    const currentDate = now.toLocaleDateString('pt-BR');
    const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);

    return `Você é Finn, o assistente financeiro da Finnextho. Hoje é ${currentDate} (${currentMonth} de ${currentYear}, Q${currentQuarter}).

    CONTEXTO TEMPORAL ATUAL:
    - Data atual: ${currentDate}
    - Mês atual: ${currentMonth} de ${currentYear}
    - Trimestre: Q${currentQuarter}
    - Semana do ano: ${Math.ceil(((now.getTime() - new Date(currentYear, 0, 1).getTime()) / 86400000 + new Date(currentYear, 0, 1).getDay() + 1) / 7)}

    CAPACIDADES PRINCIPAIS:
    - Análise de gastos e receitas (com foco no período atual)
    - Planejamento financeiro e orçamento
    - Consultoria em investimentos
    - Gestão de cartões de crédito
    - Acompanhamento de metas financeiras
    - Otimização de programas de milhas
    - Educação financeira

    PERSONALIDADE:
    - Profissional mas amigável
    - Didático e paciente
    - Proativo em sugestões
    - Focado em resultados práticos
    - Consciente do tempo e prazos

    DIRETRIZES:
    - Sempre forneça informações precisas e atualizadas
    - Use linguagem clara e acessível
    - Seja proativo em identificar oportunidades de melhoria
    - Mantenha o foco na saúde financeira do usuário
    - Confirme ações importantes (transações > R$1000)
    - Considere sempre o contexto temporal atual nas análises
    - Mencione datas relevantes (vencimentos, prazos, sazonalidades)
    
    Responda sempre em português brasileiro de forma clara e objetiva, considerando o contexto temporal atual.`;
  }

  private prompts = {
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
      // Temporariamente desabilitar cache para debug de intent detection
      if (false && cached) {
        console.log(`[AI] Cache hit for key: ${cacheKey.substring(0, 50)}...`);
        return { ...cached, cached: true };
      }

      // 2. Deixar a IA processar tudo diretamente - SEM detecção de intenção
      console.log(`🤖 Processando mensagem com IA: "${message}"`);
      
      // 3. Atualizar contexto
      this.contextManager.updateContext(userId, message, '');

      // 4. Gerar resposta diretamente com IA - SEM automação complexa
      const context = await this.buildContextPrompt(conversationHistory, userContext);
      const prompt = `${this.SYSTEM_PROMPTS.FINN_CORE}

IMPORTANTE: Se o usuário está pedindo para criar/registrar algo (transação, meta, investimento), você deve:
1. Responder de forma amigável
2. Se tiver todos os dados necessários, perguntar "Posso confirmar e registrar isso para você?"
3. Se faltar dados, perguntar pelos dados faltantes de forma natural

Contexto: ${context}
Usuário: ${message}
Finn:`;

      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
      });

      const response = completion.choices[0]?.message?.content || 'Como posso te ajudar?';

      // Detectar se a resposta indica necessidade de confirmação
      const requiresConfirmation = /posso confirmar|confirmar e registrar|pode confirmar|confirmo isso/i.test(response);
      
      let actionData = null;
      if (requiresConfirmation) {
        // Extrair dados da mensagem original para actionData
        // Extrair entidades básicas da mensagem
        const entities = {
          valor: this.extractValue(message),
          categoria: this.extractCategory(message),
          tipo: this.extractType(message),
          data: new Date().toISOString().split('T')[0],
          descricao: this.extractCategory(message) || 'Transação',
          conta: 'Principal'
        };
        if (entities.valor) {
          actionData = {
            type: 'create_transaction',
            entities,
            userId
          };
        }
      }

      // 5. Pós-processamento
      const finalResponse = this.postProcessResponse(response, userContext);

      // Log final do processamento
      console.log(`[AI] Processamento concluído:`, {
        requiresConfirmation: requiresConfirmation,
        actionData: actionData,
        message: message.substring(0, 100) + '...'
      });

      // 6. Salvar no cache
      const result = {
        text: finalResponse,
        requiresConfirmation,
        actionData,
        confidence: requiresConfirmation ? 0.9 : 0.7,
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
  ): Promise<{ response: string; requiresConfirmation?: boolean; actionData?: any }> {
    // Verificar se requer confirmação
    const requiresConfirmation = this.shouldRequireConfirmation(intentResult);
    
    // Remover execução automática - sempre pedir confirmação para melhor UX
    console.log('🔍 Intent detectado:', intentResult.intent, 'Confiança:', intentResult.confidence, 'Requer confirmação:', requiresConfirmation);

    // Verificar se deve pedir confirmação
    if (requiresConfirmation && intentResult.confidence > 0.3 && userContext?.userId) {
      const actionData = {
        type: intentResult.intent,
        entities: intentResult.entities,
        userId: userContext.userId
      };

      let confirmationMessage = '';
      
      switch (intentResult.intent) {
        case 'create_transaction':
          if (intentResult.entities.valor && intentResult.entities.valor > 0) {
            confirmationMessage = `💰 Detectei uma transação de R$ ${intentResult.entities.valor.toFixed(2)} em ${intentResult.entities.categoria || 'Geral'}. Confirmar?`;
          } else {
            // MESMO SEM VALOR, AINDA DEVE PEDIR CONFIRMAÇÃO PARA COLETA DE DADOS
            confirmationMessage = `💰 Vou te ajudar a registrar uma transação. Qual foi o valor?`;
          }
          break;
        case 'create_goal':
          if (intentResult.entities.valor_total || intentResult.entities.valor) {
            confirmationMessage = `🎯 Vou criar uma meta de R$ ${(intentResult.entities.valor_total || intentResult.entities.valor).toFixed(2)}. Confirmar?`;
          } else {
            confirmationMessage = `🎯 Para criar a meta, preciso do valor total. Qual é o valor da meta?`;
          }
          break;
        case 'create_investment':
          if (intentResult.entities.valor && intentResult.entities.valor > 0) {
            confirmationMessage = `📈 Registrar investimento de R$ ${intentResult.entities.valor.toFixed(2)}. Confirmar?`;
          } else {
            confirmationMessage = `📈 Para registrar o investimento, preciso do valor. Qual foi o valor investido?`;
          }
          break;
        default:
          confirmationMessage = `Encontrei uma ${intentResult.intent.toLowerCase().replace('create_', '')}. Posso criar para você?`;
      }

      return {
        response: confirmationMessage,
        requiresConfirmation: true,
        actionData
      };
    }

    // Gerar resposta de fallback baseada na confiança
    const fallbackResponse = await this.generateFallbackResponse(message, intentResult);
    return { response: fallbackResponse };
  }

  private async executeAction(intent: string, entities: any, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { createTransaction, createGoal, createInvestment } = require('../controllers/automatedActionsController');
      
      switch (intent) {
        case 'CREATE_TRANSACTION':
          if (!entities.valor || entities.valor <= 0) {
            return { success: false, message: 'Valor inválido para transação' };
          }
          
          const transactionData = {
            valor: entities.valor,
            descricao: entities.descricao || 'Transação',
            categoria: entities.categoria || 'Geral',
            tipo: entities.tipo || 'despesa',
            conta: entities.conta || 'Principal',
            data: entities.data || new Date().toISOString().split('T')[0]
          };
          
          console.log('📝 Criando transação:', transactionData);
          const transactionResult = await createTransaction(userId, transactionData);
          
          if (transactionResult) {
            return {
              success: true,
              message: `✅ Transação registrada! R$ ${entities.valor.toFixed(2)} em ${entities.categoria}`
            };
          }
          return { success: false, message: 'Erro ao registrar transação' };
        
        case 'CREATE_GOAL':
          const goalData = {
            meta: entities.meta || 'Meta',
            valor_total: entities.valor_total || entities.valor,
            data_conclusao: entities.data_conclusao || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            categoria: entities.categoria || 'Pessoal'
          };
          
          const goalResult = await createGoal(userId, goalData);
          return {
            success: !!goalResult,
            message: goalResult ? '🎯 Meta criada com sucesso!' : 'Erro ao criar meta'
          };
          
        case 'CREATE_INVESTMENT':
          const investmentData = {
            nome: entities.nome || 'Investimento',
            tipo: entities.tipo || 'Renda Fixa',
            valor: entities.valor,
            data: entities.data || new Date().toISOString().split('T')[0],
            instituicao: entities.instituicao || 'Não informado'
          };
          
          const investmentResult = await createInvestment(userId, investmentData);
          return {
            success: !!investmentResult,
            message: investmentResult ? '📈 Investimento registrado!' : 'Erro ao registrar investimento'
          };
          
        default:
          return { success: false, message: 'Ação não reconhecida' };
      }
    } catch (error) {
      console.error('❌ Erro na executeAction:', error);
      return { success: false, message: 'Erro interno ao executar ação' };
    }
  }

  private async generateFallbackResponse(message: string, intentResult: any): Promise<string> {
    if (intentResult.confidence > 0.3) {
      return `Entendi que você quer ${intentResult.intent.toLowerCase().replace('create_', 'criar ')}, mas preciso de mais informações. Pode me dar mais detalhes?`;
    }
    
    return 'Como posso te ajudar com suas finanças hoje?';
  }

  // Consultar registros existentes para dar contexto à IA
  private async getExistingRecords(userId: string): Promise<{ transactions: any[], goals: any[], investments: any[] }> {
    try {
      const user = await require('../models/User').default.findOne({ firebaseUid: userId });
      if (!user) {
        console.warn('[OptimizedAI] User not found for context:', userId);
        return { transactions: [], goals: [], investments: [] };
      }

      const [transactions, goals, investments] = await Promise.all([
        require('../models/Transacoes').default.find({ userId: user._id }).limit(10).sort({ createdAt: -1 }),
        Goal.find({ userId: user._id }).limit(5).sort({ createdAt: -1 }),
        Investimento.find({ userId: user._id }).limit(5).sort({ createdAt: -1 })
      ]);

      return {
        transactions: transactions || [],
        goals: goals || [],
        investments: investments || []
      };
    } catch (error) {
      console.error('❌ Erro ao buscar registros existentes:', error);
      return { transactions: [], goals: [], investments: [] };
    }
  }


  private async generateConversationalResponse(
    message: string,
    conversationHistory: ChatMessage[],
    userContext?: any
  ): Promise<string> {
    const context = await this.buildContextPrompt(conversationHistory, userContext);
    const prompt = `${this.SYSTEM_PROMPTS.FINN_CORE}\n\nContexto: ${context}\n\nUsuário: ${message}\n\nFinn:`;

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });

    return completion.choices[0]?.message?.content || 'Como posso te ajudar?';
  }

  private shouldRequireConfirmation(intentResult: any): boolean {
    // Sempre pedir confirmação para criar registros - facilita UX
    if (intentResult.intent === 'create_transaction') {
      return true;
    }
    
    if (intentResult.intent === 'create_goal') {
      return true;
    }
    
    if (intentResult.intent === 'create_investment' && intentResult.entities.valor > 0) {
      return true;
    }

    return false;
  }

  private getPersonalizedGreeting(userContext?: any): string {
    const greetings = [
      'Oi! Como posso te ajudar hoje?',
      'Olá! Pronto para cuidar das suas finanças?',
      'Hey! O que vamos fazer hoje?',
      'Oi! Como estão suas finanças?'
    ];

    if (userContext?.messageCount > 10) {
      greetings.push('E aí! Bom te ver de novo!');
    }

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private async buildContextPrompt(conversationHistory: ChatMessage[], userContext?: any): Promise<string> {
    let context = '';
    
    // Informações do usuário (sem mencionar na resposta)
    if (userContext?.userId) {
      context += `[CONTEXTO INTERNO - NÃO MENCIONAR]\n`;
      context += `Usuário: ${userContext.nome || 'Usuário'}\n`;
      context += `Plano: ${userContext.subscription?.plan || 'Básico'}\n`;
      context += `Status: ${userContext.subscription?.status || 'ativo'}\n`;
      context += `Data atual: ${new Date().toLocaleDateString('pt-BR')}\n`;
      
      // Buscar registros existentes
      try {
        const records = await this.getExistingRecords(userContext.userId);
        context += `Transações existentes: ${records.transactions.length}\n`;
        context += `Metas existentes: ${records.goals.length}\n`;
        context += `Investimentos existentes: ${records.investments.length}\n`;
        
        if (records.transactions.length > 0) {
          const recent = records.transactions.slice(-3);
          context += `Últimas transações: ${recent.map(t => `R$ ${t.valor} - ${t.categoria}`).join(', ')}\n`;
        }
      } catch (error) {
        console.error('Erro ao buscar contexto de registros:', error);
      }
      
      context += `[FIM CONTEXTO INTERNO]\n\n`;
    }
    
    if (conversationHistory.length > 0) {
      context += 'Histórico da conversa:\n';
      conversationHistory.slice(-5).forEach((msg, index) => {
        const role = msg.sender === 'user' ? 'Usuário' : 'Finn';
        context += `${role}: ${msg.content}\n`;
      });
    }
    
    return context;
  }

  private buildStreamPrompt(message: string, userId: string): string {
    const context = this.contextManager.getContext(userId);
    return `${this.SYSTEM_PROMPTS.FINN_CORE}\n\nTópicos recentes: ${context.recentTopics.join(', ')}\n\nUsuário: ${message}\n\nFinn:`;
  }

  private postProcessResponse(response: string, userContext?: any): string {
    // Remover formatação excessiva e limitar tamanho
    let cleanResponse = response
      .replace(/\*\*/g, '') // Remove ** 
      .replace(/\n\n+/g, '\n') // Remove quebras duplas
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();

    // Limitar tamanho da resposta (máximo 600 caracteres)
    if (cleanResponse.length > 600) {
      // Tentar cortar em uma frase completa
      const sentences = cleanResponse.split(/[.!?]/);
      let truncated = '';
      for (const sentence of sentences) {
        if ((truncated + sentence + '.').length <= 597) {
          truncated += sentence + '.';
        } else {
          break;
        }
      }
      cleanResponse = truncated || cleanResponse.substring(0, 597) + '...';
    }

    return cleanResponse;
  }

  private getCacheKey(userId: string, message: string, historyKey: string = ''): string {
    const base = `${userId}_${message.substring(0, 50).toLowerCase().replace(/\s+/g, '_')}`;
    if (!historyKey) return base;
    const hist = historyKey.substring(0, 80).replace(/\s+/g, '_');
    return `${base}__h:${hist}`;
  }

  // Métodos de utilidade
  // Métodos auxiliares para extração de entidades
  private extractValue(message: string): number | null {
    const valorMatch = message.match(/r\$\s*(\d+(?:[,.]\d{2})?)|\$(\d+(?:[,.]\d{2})?)|reais?\s*(\d+)|\b(\d+)\s*reais?/i);
    if (valorMatch) {
      return parseFloat((valorMatch[1] || valorMatch[2] || valorMatch[3] || valorMatch[4]).replace(',', '.'));
    }
    return null;
  }

  private extractCategory(message: string): string | null {
    if (/supermercado|mercado|alimentação|comida/i.test(message)) return 'Alimentação';
    if (/transporte|uber|taxi|ônibus|metro/i.test(message)) return 'Transporte';
    if (/farmácia|remédio|saúde/i.test(message)) return 'Saúde';
    return null;
  }

  private extractType(message: string): string {
    if (/gast[ei]|comprei|paguei|despesa/i.test(message)) return 'despesa';
    if (/recebi|ganho|receita|salário/i.test(message)) return 'receita';
    return 'despesa';
  }

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
