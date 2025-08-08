import { EnterpriseAIEngine } from './EnterpriseAIEngine';

interface UserMessage {
  content: string;
  userId: string;
  chatId: string;
  timestamp: Date;
  metadata?: any;
}

interface ConversationContext {
  recentMessages: any[];
  userProfile: any;
  financialContext: any;
  inferredGoals: any;
}

interface MessageAnalysis {
  intent: DetectedIntent;
  entities: any;
  confidence: number;
  reasoning: string;
  response: string;
  action?: any;
  requiresConfirmation: boolean;
}

export interface DetectedIntent {
  type: string;
  payload: any;
  confidence: number;
  reasoning: string;
  response?: string; // Added for data collection
  requiresConfirmation: boolean; // Added for data collection
  missingFields?: string[]; // Added for data collection
  collectedData?: any; // Added for data collection
  entities?: any; // Added for entities
}

export class ReasoningEngine {
  private aiService: EnterpriseAIEngine;

  constructor() {
    this.aiService = new EnterpriseAIEngine();
  }

  async analyze(message: UserMessage, context: ConversationContext): Promise<MessageAnalysis> {
    try {
      console.log('[ReasoningEngine] 🧠 Analisando mensagem:', message.content);

      // 1. Análise de intenção avançada
      let intent = await this.detectIntent(message, context);
      
      // 2. Extração de entidades financeiras
      const entities = this.extractFinancialEntities(message.content, intent);
      
      // 3. Verificação de consistência
      const consistencyCheck = this.checkConsistency(intent, entities, context);
      
      // 4. Planejamento de resposta
      const response = await this.planResponse(intent, entities, consistencyCheck, context);
      
      // 5. Determinar se precisa de confirmação
      const requiresConfirmation = this.determineConfirmationNeed(intent, entities, context);

      return {
        intent,
        entities,
        confidence: intent.confidence,
        reasoning: intent.reasoning,
        response: response.text, // ✅ CORREÇÃO: Usar response.text
        requiresConfirmation
      };

    } catch (error) {
      console.error('[ReasoningEngine] ❌ Erro na análise:', error);
      return {
        intent: {
          type: 'UNKNOWN',
          payload: {},
          confidence: 0,
          reasoning: 'Erro na análise',
          requiresConfirmation: false
        },
        entities: {},
        confidence: 0,
        reasoning: 'Erro no processamento',
        response: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
        requiresConfirmation: false
      };
    }
  }

  private async detectIntent(message: UserMessage, context: ConversationContext): Promise<DetectedIntent> {
    // ✅ CORREÇÃO: Usar detecção por palavras-chave primeiro (mais rápido e preciso)
    const quickIntent = this.fallbackIntentDetection(message.content);
    
    // Se detectou uma intenção específica com alta confiança, usar ela
    if (quickIntent.confidence > 0.7 && quickIntent.type !== 'UNKNOWN') {
      console.log(`[ReasoningEngine] ✅ Intent detectado rapidamente: ${quickIntent.type} (confiança: ${quickIntent.confidence})`);
      return quickIntent;
    }
    
    // ✅ CORREÇÃO: Melhorar detecção de intents específicos
    const specificIntent = this.detectSpecificIntents(message.content);
    if (specificIntent && specificIntent.confidence > 0.8) {
      console.log(`[ReasoningEngine] ✅ Intent específico detectado: ${specificIntent.type} (confiança: ${specificIntent.confidence})`);
      return specificIntent;
    }
    
    // Se não detectou nada específico, tentar análise com IA
    const enhancedPrompt = this.buildEnhancedPrompt(message, context);
    
    try {
      // ✅ CORREÇÃO: Usar o método correto do AIService
      const result = await this.aiService.processEnterpriseRequest('reasoning_analysis', message.content, { type: 'reasoning', context });
      const aiResponse = { text: result.response };
      
      const response = aiResponse?.text || 'Não consegui processar sua mensagem. Pode tentar novamente?';
      
      // Parsear a resposta como JSON se possível
      let parsedResponse;
      try {
        const responseText = typeof response === 'string' ? response : String(response);
        parsedResponse = JSON.parse(responseText);
      } catch {
        // Se não for JSON válido, usar a detecção por palavras-chave
        console.log(`[ReasoningEngine] ⚠️ Resposta da IA não é JSON válido, usando fallback`);
        return quickIntent;
      }
      
      const intent = {
        type: parsedResponse.action?.type || quickIntent.type,
        payload: parsedResponse.action?.payload || {},
        confidence: this.calculateConfidence(parsedResponse),
        reasoning: parsedResponse.reasoning || quickIntent.reasoning,
        requiresConfirmation: false // Default to false for AI-generated intents
      };
      
      console.log(`[ReasoningEngine] ✅ Intent detectado via IA: ${intent.type} (confiança: ${intent.confidence})`);
      return intent;

    } catch (error) {
      console.error('[ReasoningEngine] ❌ Erro na detecção de intenção:', error);
      
      // Fallback para detecção simples
      console.log(`[ReasoningEngine] 🔄 Usando fallback para: ${message.content}`);
      return quickIntent;
    }
  }

  // ✅ NOVO: Detecção de intents específicos mais robusta
  private detectSpecificIntents(message: string): DetectedIntent | null {
    const lowerMessage = message.toLowerCase();
    
    // Detectar criação de investimento
    if (lowerMessage.includes('criar') && (lowerMessage.includes('investimento') || lowerMessage.includes('investir') || lowerMessage.includes('ivestimento'))) {
      return {
        type: 'CREATE_INVESTMENT',
        payload: {},
        confidence: 0.9,
        reasoning: 'Detectado pedido de criação de investimento',
        entities: {},
        requiresConfirmation: false
      };
    }
    
    // Detectar criação de transação
    if (lowerMessage.includes('criar') && (lowerMessage.includes('transação') || lowerMessage.includes('transacao') || lowerMessage.includes('gasto') || lowerMessage.includes('receita'))) {
      return {
        type: 'CREATE_TRANSACTION',
        payload: {},
        confidence: 0.9,
        reasoning: 'Detectado pedido de criação de transação',
        entities: {},
        requiresConfirmation: false
      };
    }
    
    // Detectar criação de meta
    if (lowerMessage.includes('criar') && (lowerMessage.includes('meta') || lowerMessage.includes('objetivo') || lowerMessage.includes('sonho'))) {
      return {
        type: 'CREATE_GOAL',
        payload: {},
        confidence: 0.9,
        reasoning: 'Detectado pedido de criação de meta',
        entities: {},
        requiresConfirmation: false
      };
    }
    
    // Detectar frustração
    if (lowerMessage.includes('cards') || lowerMessage.includes('repetindo') || lowerMessage.includes('mesma coisa') || lowerMessage.includes('não sabe dialogar')) {
      return {
        type: 'FRUSTRATION',
        payload: {},
        confidence: 0.95,
        reasoning: 'Detectada frustração do usuário',
        entities: {},
        requiresConfirmation: false
      };
    }
    
    // Detectar pedido de ajuda
    if (lowerMessage.includes('ajude') || lowerMessage.includes('ajuda') || lowerMessage.includes('ajudar')) {
      return {
        type: 'GENERAL_HELP',
        payload: {},
        confidence: 0.8,
        reasoning: 'Detectado pedido de ajuda',
        entities: {},
        requiresConfirmation: false
      };
    }
    
    return null;
  }

  // ✅ NOVO: Detecção rápida de intenções
  private quickIntentDetection(content: string): DetectedIntent | null {
    const lowerContent = content.toLowerCase();
    
    // Detectar criação de transação
    if (lowerContent.includes('criar transação') || lowerContent.includes('nova transação') || 
        lowerContent.includes('registrar transação') || lowerContent.includes('add transação') ||
        lowerContent.includes('quero criar uma nova transação') || lowerContent.includes('criar transaçao')) {
      return {
        type: 'CREATE_TRANSACTION',
        payload: {},
        confidence: 0.9,
        reasoning: 'Detectado pedido explícito para criar transação',
        requiresConfirmation: false
      };
    }
    
    // Detectar criação de meta
    if (lowerContent.includes('criar meta') || lowerContent.includes('nova meta') || 
        lowerContent.includes('quero criar uma meta') || lowerContent.includes('juntar dinheiro') ||
        lowerContent.includes('economizar para')) {
      return {
        type: 'CREATE_GOAL',
        payload: {},
        confidence: 0.9,
        reasoning: 'Detectado pedido explícito para criar meta',
        requiresConfirmation: false
      };
    }
    
    // Detectar criação de investimento
    if (lowerContent.includes('criar investimento') || lowerContent.includes('novo investimento') || 
        lowerContent.includes('quero investir') || lowerContent.includes('aplicar dinheiro')) {
      return {
        type: 'CREATE_INVESTMENT',
        payload: {},
        confidence: 0.9,
        reasoning: 'Detectado pedido explícito para criar investimento',
        requiresConfirmation: false
      };
    }
    
    // Detectar saudações
    if (lowerContent.includes('oi') || lowerContent.includes('olá') || lowerContent.includes('ola') ||
        lowerContent.includes('bom dia') || lowerContent.includes('boa tarde') || lowerContent.includes('boa noite')) {
      return {
        type: 'GREETING',
        payload: {},
        confidence: 0.95,
        reasoning: 'Detectada saudação',
        requiresConfirmation: false
      };
    }
    
    // Detectar pedidos de ajuda
    if (lowerContent.includes('ajuda') || lowerContent.includes('como funciona') || 
        lowerContent.includes('o que você pode fazer') || lowerContent.includes('me ajude')) {
      return {
        type: 'GENERAL_HELP',
        payload: {},
        confidence: 0.8,
        reasoning: 'Detectado pedido de ajuda',
        requiresConfirmation: false
      };
    }
    
    return null;
  }

  // ✅ NOVO: Análise de contexto da conversa
  private analyzeConversationContext(content: string, context: ConversationContext): DetectedIntent | null {
    const lowerContent = content.toLowerCase();
    const recentMessages = context.recentMessages;
    
    // Se há mensagens recentes, analisar contexto
    if (recentMessages.length > 0) {
      const lastMessage = recentMessages[recentMessages.length - 1];
      const lastContent = lastMessage.content.toLowerCase();
      
      // Se a última mensagem mencionou transação e esta mensagem confirma
      if (lastContent.includes('transação') && (lowerContent.includes('sim') || lowerContent.includes('ok') || lowerContent.includes('vamos'))) {
        return {
          type: 'CREATE_TRANSACTION',
          payload: {},
          confidence: 0.8,
          reasoning: 'Confirmação de criação de transação baseada no contexto',
          requiresConfirmation: false
        };
      }
      
      // Se a última mensagem mencionou meta e esta mensagem confirma
      if (lastContent.includes('meta') && (lowerContent.includes('sim') || lowerContent.includes('ok') || lowerContent.includes('vamos'))) {
        return {
          type: 'CREATE_GOAL',
          payload: {},
          confidence: 0.8,
          reasoning: 'Confirmação de criação de meta baseada no contexto',
          requiresConfirmation: false
        };
      }
      
      // Se o usuário está corrigindo algo
      if (lowerContent.includes('não') || lowerContent.includes('corrigir') || lowerContent.includes('mudar')) {
        return {
          type: 'CORRECTION',
          payload: {},
          confidence: 0.7,
          reasoning: 'Detectada correção baseada no contexto',
          requiresConfirmation: false
        };
      }
    }
    
    return null;
  }

  private buildEnhancedPrompt(message: UserMessage, context: ConversationContext): string {
    const userProfile = context.userProfile;
    const financialContext = context.financialContext;
    const recentMessages = context.recentMessages;

    return `Você é o Finn, um assistente financeiro inteligente com personalidade cativante. Suas características:

1. **Expertise**: CFA, CFP, MBA em Finanças
2. **Estilo**: Explicações claras com exemplos práticos
3. **Tom**: Amigável mas profissional, como um consultor de confiança
4. **Habilidades**:
   - Análise financeira avançada
   - Explicações didáticas de conceitos complexos
   - Detecção de padrões financeiros
   - Sugestões personalizadas

CONTEXTO DO USUÁRIO:
- Nome: ${userProfile.name || 'Usuário'}
- Plano: ${userProfile.subscriptionPlan || 'basic'}
- Perfil de Risco: ${userProfile.riskProfile || 'moderate'}
- Estilo de Comunicação: ${userProfile.communicationStyle || 'concise'}

SITUAÇÃO FINANCEIRA:
- Total Investido: R$ ${financialContext.totalInvested?.toFixed(2) || '0.00'}
- Taxa de Poupança: ${financialContext.savingsRate?.toFixed(1) || '0'}%
- Taxa de Investimento: ${financialContext.investmentRate?.toFixed(1) || '0'}%
- Metas Ativas: ${financialContext.goals?.length || 0}
- Investimentos Ativos: ${financialContext.investments?.length || 0}

HISTÓRICO RECENTE:
${recentMessages.slice(-3).map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

Regras:
- SEMPRE seja preciso com dados financeiros
- Adapte o nível técnico ao usuário
- Ofereça insights além do óbvio
- Mantenha contexto de conversas longas
- Seja natural e conversacional

Formato de resposta:
{
  "response": "resposta natural e conversacional",
  "action": {
    "type": "CREATE_TRANSACTION|CREATE_INVESTMENT|CREATE_GOAL|ANALYZE_DATA|GENERATE_REPORT|UNKNOWN",
    "payload": {dados extraídos}
  },
  "reasoning": "explicação do raciocínio usado",
  "insights": ["insight 1", "insight 2"],
  "followUp": ["pergunta 1", "pergunta 2"]
}

Analise a mensagem: "${message.content}"

RESPONDA APENAS COM JSON válido.`;
  }

  private calculateConfidence(response: any): number {
    // Calcular confiança baseada em múltiplos fatores
    let confidence = 0.5; // Base

    // Confiança baseada na presença de dados
    if (response.action?.payload && Object.keys(response.action.payload).length > 0) {
      confidence += 0.2;
    }

    // Confiança baseada na qualidade da resposta
    if (response.response && response.response.length > 20) {
      confidence += 0.1;
    }

    // Confiança baseada na presença de insights
    if (response.insights && response.insights.length > 0) {
      confidence += 0.1;
    }

    // Confiança baseada na coerência da ação
    if (response.action?.type && response.action.type !== 'UNKNOWN') {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  // ✅ CORREÇÃO: Sistema de coleta automática de dados
  private async collectMissingData(intent: DetectedIntent, context: ConversationContext): Promise<DetectedIntent> {
    const { entities } = intent;
    
    // Se já tem dados suficientes, retornar como está
    if (this.hasCompleteData(intent)) {
      return intent;
    }

    // Identificar campos faltantes baseado na intenção
    const missingFields = this.getMissingFields(intent);
    
    if (missingFields.length > 0) {
      // Modificar a resposta para coletar dados faltantes
      intent.response = this.generateDataCollectionResponse(intent.type, missingFields, entities);
      intent.requiresConfirmation = true;
      intent.missingFields = missingFields;
      intent.collectedData = entities;
    }

    return intent;
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

  // ✅ CORREÇÃO: Melhorar detecção de intenções
  private fallbackIntentDetection(content: string): DetectedIntent {
    const lowerContent = content.toLowerCase();
    
    // ✅ MELHORIA: Detecção mais robusta e específica de intenções
    
    // Detectar criação de transação (PRIORIDADE ALTA)
    if (lowerContent.includes('criar transação') || lowerContent.includes('nova transação') || 
        lowerContent.includes('registrar transação') || lowerContent.includes('add transação') ||
        lowerContent.includes('quero criar uma nova transação') || lowerContent.includes('criar transaçao') ||
        lowerContent.includes('transaçao') || lowerContent.includes('transação') ||
        (lowerContent.includes('quero') && lowerContent.includes('transação')) ||
        (lowerContent.includes('preciso') && lowerContent.includes('transação')) ||
        (lowerContent.includes('gastei') && lowerContent.includes('reais')) ||
        (lowerContent.includes('paguei') && lowerContent.includes('reais')) ||
        (lowerContent.includes('comprei') && lowerContent.includes('reais'))) {
      
      // Extrair valor se mencionado
      const valorMatch = lowerContent.match(/(\d+(?:[.,]\d{2})?)\s*(?:reais?|r\$)/i);
      const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : undefined;
      
      // Extrair descrição se mencionada
      const descricao = this.extractDescription(lowerContent);
      
      return {
        type: 'CREATE_TRANSACTION',
        payload: { valor, descricao },
        confidence: 0.95,
        reasoning: 'Detectado pedido de criação de transação',
        entities: { valor, descricao },
        response: 'Perfeito! Vou te ajudar a registrar essa transação! 💰',
        requiresConfirmation: !valor || !descricao
      };
    }
    
    // Detectar criação de meta (PRIORIDADE ALTA)
    if (lowerContent.includes('criar meta') || lowerContent.includes('nova meta') || 
        lowerContent.includes('quero criar uma meta') || lowerContent.includes('quero juntar') ||
        lowerContent.includes('meta de') || lowerContent.includes('juntar dinheiro') ||
        (lowerContent.includes('quero') && lowerContent.includes('meta')) ||
        (lowerContent.includes('preciso') && lowerContent.includes('meta'))) {
      
      // Extrair valor se mencionado
      const valorMatch = lowerContent.match(/(\d+(?:[.,]\d{2})?)\s*(?:reais?|r\$)/i);
      const valor_total = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : undefined;
      
      // Extrair objetivo se mencionado
      const meta = this.extractGoal(lowerContent);
      
      return {
        type: 'CREATE_GOAL',
        payload: { valor_total, meta },
        confidence: 0.9,
        reasoning: 'Detectado pedido de criação de meta',
        entities: { valor_total, meta },
        response: 'Ótimo! Vamos criar essa meta financeira! 🎯',
        requiresConfirmation: !valor_total || !meta
      };
    }
    
    // Detectar criação de investimento
    if (lowerContent.includes('criar investimento') || lowerContent.includes('novo investimento') || 
        lowerContent.includes('investir') || lowerContent.includes('comprar ações') ||
        (lowerContent.includes('quero') && lowerContent.includes('investimento'))) {
      
      return {
        type: 'CREATE_INVESTMENT',
        payload: {},
        confidence: 0.85,
        reasoning: 'Detectado pedido de criação de investimento',
        entities: {},
        response: 'Excelente! Vamos registrar esse investimento! 📈',
        requiresConfirmation: true
      };
    }
    
    // ✅ MELHORIA: Detectar saudações com respostas variadas
    if (lowerContent.includes('oi') || lowerContent.includes('olá') || lowerContent.includes('ola') ||
        lowerContent.includes('bom dia') || lowerContent.includes('boa tarde') || 
        lowerContent.includes('boa noite') || lowerContent.includes('tudo bem')) {
      
      const greetingResponses = [
        'Oi! Que bom te ver por aqui! 😊 Como posso te ajudar hoje?',
        'Olá! Fico feliz que você tenha vindo! O que você gostaria de fazer?',
        'Oi! Tudo bem? Estou aqui pra te ajudar com suas finanças!',
        'Olá! Que legal te ver! Como posso ser útil hoje?',
        'Oi! Bem-vindo de volta! O que você tem em mente?',
        'Olá! Fico animado quando você aparece! Como posso te ajudar?',
        'Oi! Que bom que você veio! O que você gostaria de fazer hoje?',
        'Olá! Estou aqui pra te ajudar! O que você tem em mente?'
      ];
      
      const randomResponse = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      
      return {
        type: 'GREETING',
        payload: {},
        confidence: 0.95,
        reasoning: 'Detectada saudação',
        entities: {},
        response: randomResponse,
        requiresConfirmation: false
      };
    }
    
    // ✅ MELHORIA: Detectar frustração e responder adequadamente
    if (lowerContent.includes('demora') || lowerContent.includes('lento') || lowerContent.includes('repetindo') || 
        lowerContent.includes('mesma coisa') || lowerContent.includes('não sabe dialogar') ||
        lowerContent.includes('robótico') || lowerContent.includes('robotico')) {
      
      const frustrationResponses = [
        'Desculpa se estou sendo repetitivo! Vou tentar ser mais natural. O que você realmente gostaria de fazer?',
        'Entendo sua frustração! Vou ser mais direto. Como posso te ajudar de verdade?',
        'Peço desculpas! Vou ser mais humano. O que você precisa?',
        'Você tem razão! Vou ser mais natural. O que você gostaria de fazer?',
        'Desculpa pela repetição! Vou ser mais direto. Como posso te ajudar?'
      ];
      
      const randomResponse = frustrationResponses[Math.floor(Math.random() * frustrationResponses.length)];
      
      return {
        type: 'FRUSTRATION',
        payload: {},
        confidence: 0.9,
        reasoning: 'Detectada frustração do usuário',
        entities: {},
        response: randomResponse,
        requiresConfirmation: false
      };
    }
    
    // ✅ MELHORIA: Detectar pedidos de ajuda com respostas variadas
    if (lowerContent.includes('ajuda') || lowerContent.includes('como funciona') || 
        lowerContent.includes('o que posso fazer') || lowerContent.includes('ajudar')) {
      
      const helpResponses = [
        'Claro! Estou aqui pra te ajudar com suas finanças. Posso criar metas, registrar transações, analisar investimentos e muito mais! O que você gostaria de fazer?',
        'Beleza! Posso te ajudar com várias coisas: criar metas, registrar gastos, analisar investimentos, dar dicas financeiras... O que te interessa?',
        'Tranquilo! Posso criar metas, registrar transações, analisar investimentos, dar conselhos financeiros... O que você tem em mente?',
        'Valeu! Posso te ajudar com metas, transações, investimentos, dicas financeiras... O que você gostaria de fazer?',
        'Show! Posso criar metas, registrar gastos, analisar investimentos, dar conselhos... O que você precisa?'
      ];
      
      const randomResponse = helpResponses[Math.floor(Math.random() * helpResponses.length)];
      
      return {
        type: 'GENERAL_HELP',
        payload: {},
        confidence: 0.9,
        reasoning: 'Detectado pedido de ajuda',
        entities: {},
        response: randomResponse,
        requiresConfirmation: false
      };
    }
    
    // ✅ MELHORIA: Detectar confirmações positivas
    if (lowerContent.includes('que ótimo') || lowerContent.includes('que otimo') || 
        lowerContent.includes('legal') || lowerContent.includes('massa') || 
        lowerContent.includes('show') || lowerContent.includes('beleza') ||
        lowerContent.includes('valeu') || lowerContent.includes('obrigado') ||
        lowerContent.includes('obrigada')) {
      
      const confirmationResponses = [
        'Que bom que você gostou! O que mais posso fazer por você?',
        'Fico feliz que tenha gostado! Tem mais alguma coisa que posso te ajudar?',
        'Show! Fico animado quando posso ajudar! O que você gostaria de fazer agora?',
        'Beleza! Que legal que foi útil! Tem mais alguma coisa em mente?',
        'Valeu! Fico feliz que tenha gostado! Como posso te ajudar mais?'
      ];
      
      const randomResponse = confirmationResponses[Math.floor(Math.random() * confirmationResponses.length)];
      
      return {
        type: 'CONFIRMATION',
        payload: {},
        confidence: 0.8,
        reasoning: 'Detectada confirmação positiva',
        entities: {},
        response: randomResponse,
        requiresConfirmation: false
      };
    }
    
    // ✅ MELHORIA: Padrão desconhecido com respostas variadas
    const unknownResponses = [
      'Entendi! Como posso te ajudar hoje? Posso criar metas, registrar transações, analisar investimentos ou responder suas dúvidas financeiras.',
      'Beleza! O que você gostaria de fazer? Posso te ajudar com metas, transações, investimentos ou qualquer dúvida financeira.',
      'Tranquilo! Como posso ser útil? Posso criar metas, registrar gastos, analisar investimentos ou dar conselhos financeiros.',
      'Valeu! O que você tem em mente? Posso te ajudar com metas, transações, investimentos ou dicas financeiras.',
      'Show! Como posso te ajudar? Posso criar metas, registrar transações, analisar investimentos ou responder suas perguntas.'
    ];
    
    const randomResponse = unknownResponses[Math.floor(Math.random() * unknownResponses.length)];
    
    return {
      type: 'UNKNOWN',
      payload: {},
      confidence: 0.3,
      reasoning: 'Intenção desconhecida',
      entities: {},
      response: randomResponse,
      requiresConfirmation: false
    };
  }

  // ✅ NOVO: Extrair descrição da transação
  private extractDescription(content: string): string | undefined {
    // Remover palavras comuns e números
    const cleanContent = content
      .replace(/\d+(?:[.,]\d{2})?\s*(?:reais?|r\$)/gi, '')
      .replace(/(criar|nova|transação|transaçao|quero|preciso|add|registrar)/gi, '')
      .trim();
    
    if (cleanContent.length > 3) {
      return cleanContent;
    }
    
    return undefined;
  }

  // ✅ NOVO: Extrair objetivo da meta
  private extractGoal(content: string): string | undefined {
    // Buscar por padrões como "para viagem", "para carro", etc.
    const goalMatch = content.match(/(?:para|de|em)\s+([a-záàâãéèêíìîóòôõúùûç\s]+?)(?:\s|$)/i);
    
    if (goalMatch && goalMatch[1].length > 2) {
      return goalMatch[1].trim();
    }
    
    return undefined;
  }

  private extractFinancialEntities(content: string, intent: DetectedIntent): any {
    const entities: any = {};
    
    // ✅ CORREÇÃO: Extrair valores monetários mais robustamente
    const moneyMatches = content.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/gi);
    if (moneyMatches) {
      const values = moneyMatches.map(match => 
        parseFloat(match.replace(/[r$\s]/gi, '').replace(',', '.'))
      );
      
      if (intent.type === 'CREATE_GOAL') {
        entities.valor_total = values[0];
      } else if (intent.type === 'CREATE_INVESTMENT') {
        entities.valor = values[0];
      } else if (intent.type === 'CREATE_TRANSACTION') {
        entities.valor = values[0];
      }
    }
    
    // ✅ CORREÇÃO: Extrair datas mais robustamente
    const dateMatches = content.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/g);
    if (dateMatches) {
      entities.data_conclusao = dateMatches[0];
    }
    
    // ✅ CORREÇÃO: Extrair nome da meta
    if (intent.type === 'CREATE_GOAL') {
      // Procurar por padrões como "nome da meta", "meta de", "para"
      const metaPatterns = [
        /nome da meta\s+([^.]+)/i,
        /meta\s+(?:de\s+)?([^.]+?)(?:\s+para|\s+até|$)/i,
        /juntar.*?para\s+([^.]+)/i,
        /economizar.*?para\s+([^.]+)/i
      ];
      
      for (const pattern of metaPatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          entities.meta = match[1].trim();
          break;
        }
      }
      
      // Se não encontrou com padrões, procurar por palavras após "meta"
      if (!entities.meta) {
        const metaIndex = content.toLowerCase().indexOf('meta');
        if (metaIndex !== -1) {
          const afterMeta = content.substring(metaIndex + 4).trim();
          const words = afterMeta.split(/\s+/);
          if (words.length > 0 && words[0].length > 2) {
            entities.meta = words[0];
          }
        }
      }
    }
    
    // ✅ CORREÇÃO: Extrair descrições para transações
    if (intent.type === 'CREATE_TRANSACTION') {
      const descriptionKeywords = ['para', 'comprar', 'gastei em', 'paguei'];
    for (const keyword of descriptionKeywords) {
      const index = content.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        const description = content.substring(index + keyword.length).trim();
        if (description.length > 3) {
          entities.descricao = description;
            break;
          }
        }
      }
    }
    
    // ✅ CORREÇÃO: Extrair tipo de transação
    if (intent.type === 'CREATE_TRANSACTION') {
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('gastei') || lowerContent.includes('paguei') || lowerContent.includes('comprei')) {
        entities.tipo = 'despesa';
      } else if (lowerContent.includes('recebi') || lowerContent.includes('ganhei')) {
        entities.tipo = 'receita';
      }
    }
    
    // ✅ CORREÇÃO: Extrair nome do investimento
    if (intent.type === 'CREATE_INVESTMENT') {
      const investmentPatterns = [
        /investir\s+(?:em\s+)?([^.]+)/i,
        /aplicar\s+(?:em\s+)?([^.]+)/i,
        /ações\s+(?:da\s+)?([^.]+)/i
      ];
      
      for (const pattern of investmentPatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          entities.nome = match[1].trim();
          break;
        }
      }
    }
    
    return entities;
  }

  private checkConsistency(intent: DetectedIntent, entities: any, context: ConversationContext): any {
    const issues: string[] = [];
    const warnings: string[] = [];
    
    // Verificar se o valor é razoável
    if (entities.valor && entities.valor > 1000000) {
      warnings.push('Valor muito alto detectado');
    }
    
    // Verificar se há conflito com metas existentes
    if (intent.type === 'CREATE_GOAL' && context.financialContext.goals) {
      const totalGoals = context.financialContext.totalGoals + (entities.valor_total || 0);
      const monthlyIncome = context.financialContext.totalEarned;
      
      if (totalGoals > monthlyIncome * 12) {
        warnings.push('Total de metas pode ser muito alto para sua renda');
      }
    }
    
    // Verificar se há dinheiro suficiente para investimento
    if (intent.type === 'CREATE_INVESTMENT' && entities.valor) {
      const availableFunds = context.financialContext.totalEarned - context.financialContext.totalSpent;
      if (entities.valor > availableFunds) {
        issues.push('Valor do investimento maior que fundos disponíveis');
      }
    }
    
    return { issues, warnings, isConsistent: issues.length === 0 };
  }

  private async planResponse(intent: DetectedIntent, entities: any, consistencyCheck: any, context: ConversationContext): Promise<any> {
    let response = '';
    let action = null;
    
    // Gerar resposta baseada na intenção
    switch (intent.type) {
      case 'CREATE_GOAL':
        response = this.generateGoalResponse(entities, context);
        action = {
          type: 'CREATE_GOAL',
          payload: entities,
          confidence: intent.confidence
        };
        break;
        
      case 'CREATE_INVESTMENT':
        response = this.generateInvestmentResponse(entities, context);
        action = {
          type: 'CREATE_INVESTMENT',
          payload: entities,
          confidence: intent.confidence
        };
        break;
        
      case 'CREATE_TRANSACTION':
        response = this.generateTransactionResponse(entities, context);
        action = {
          type: 'CREATE_TRANSACTION',
          payload: entities,
          confidence: intent.confidence
        };
        break;
        
      case 'ANALYZE_DATA':
        response = this.generateAnalysisResponse(context);
        action = {
          type: 'ANALYZE_DATA',
          payload: { analysisType: 'comprehensive' },
          confidence: intent.confidence
        };
        break;
        
      default:
        response = this.generateGeneralResponse(intent, context);
    }
    
    // Adicionar avisos de consistência
    if (consistencyCheck.warnings.length > 0) {
      response += `\n\n⚠️ ${consistencyCheck.warnings.join(', ')}`;
    }
    
    return { text: response, action };
  }

  private generateGoalResponse(entities: any, context: ConversationContext): string {
    const userName = context.userProfile.name || 'você';
    const amount = entities.valor_total;
    const description = entities.meta || 'sua meta';
    const date = entities.data_conclusao;
    
    if (amount && description) {
      let response = `🎯 Perfeito, ${userName}! Vou criar uma meta de R$ ${amount.toFixed(2)} para ${description}`;
      
      if (date) {
        response += ` até ${date}`;
      }
      
      response += `. Considerando sua situação financeira atual, essa meta parece bem alinhada com suas possibilidades.`;
      
      // Adicionar dica personalizada
      const monthlyAmount = amount / 12; // Assumindo 12 meses
      if (monthlyAmount > 100) {
        response += `\n\n💡 Dica: Para atingir essa meta, você precisará economizar aproximadamente R$ ${monthlyAmount.toFixed(2)} por mês.`;
      }
      
      return response;
    } else if (description) {
      return `🎯 Que legal, ${userName}! Vamos criar uma meta para ${description}. Qual valor você gostaria de juntar?`;
    } else {
      return `🎯 Ótimo, ${userName}! Vamos criar uma nova meta. Qual é o objetivo e quanto você quer juntar?`;
    }
  }

  private generateInvestmentResponse(entities: any, context: ConversationContext): string {
    const userName = context.userProfile.name || 'você';
    const amount = entities.valor;
    const name = entities.nome || 'seu investimento';
    
    if (amount && name) {
      return `📈 Excelente decisão, ${userName}! Vou registrar um investimento de R$ ${amount.toFixed(2)} em ${name}. Baseado no seu perfil ${context.userProfile.riskProfile}, posso sugerir algumas estratégias de diversificação.`;
    } else if (amount) {
      return `📈 Ótimo, ${userName}! Vou registrar um investimento de R$ ${amount.toFixed(2)}. Em qual tipo de investimento você aplicou?`;
    } else {
      return `📈 Perfeito, ${userName}! Vamos registrar seu investimento. Qual valor você investiu e em que tipo de aplicação?`;
    }
  }

  private generateTransactionResponse(entities: any, context: ConversationContext): string {
    const userName = context.userProfile.name || 'você';
    const amount = entities.valor;
    const description = entities.descricao || 'sua transação';
    const tipo = entities.tipo || 'transação';
    
    if (amount && description) {
      return `💰 Entendi, ${userName}! Vou registrar uma ${tipo} de R$ ${amount.toFixed(2)} para ${description}. Isso vai ajudar a manter seu controle financeiro em dia.`;
    } else if (amount) {
      return `💰 Perfeito, ${userName}! Vou registrar uma ${tipo} de R$ ${amount.toFixed(2)}. O que foi essa transação?`;
    } else {
      return `💰 Beleza, ${userName}! Vamos registrar sua ${tipo}. Qual foi o valor e o que foi?`;
    }
  }

  private generateAnalysisResponse(context: ConversationContext): string {
    const userName = context.userProfile.name || 'você';
    const savingsRate = context.financialContext.savingsRate;
    const investmentRate = context.financialContext.investmentRate;
    
    return `📊 ${userName}, analisando sua situação financeira atual:
• Taxa de poupança: ${savingsRate.toFixed(1)}%
• Taxa de investimento: ${investmentRate.toFixed(1)}%
• Total investido: R$ ${context.financialContext.totalInvested.toFixed(2)}

${savingsRate < 20 ? '💡 Sugestão: Considere aumentar sua taxa de poupança para pelo menos 20%' : '✅ Sua taxa de poupança está em um bom nível!'}`;
  }

  private generateGeneralResponse(intent: DetectedIntent, context: ConversationContext): string {
    const userName = context.userProfile.name || 'você';
    
    // ✅ CORREÇÃO: Respostas mais específicas e úteis baseadas na intenção
    switch (intent.type) {
      case 'GREETING':
        return `Olá ${userName}! Que bom te ver por aqui! 😊 Como posso te ajudar hoje? Posso criar metas, registrar transações, analisar investimentos ou responder suas dúvidas financeiras.`;
      
      case 'GENERAL_HELP':
        return `Claro, ${userName}! Estou aqui para te ajudar com suas finanças. Posso:
• 🎯 Criar metas de economia
• 💰 Registrar transações
• 📈 Analisar investimentos
• 📊 Gerar relatórios
• 💡 Dar dicas personalizadas

O que você gostaria de fazer?`;
      
      case 'CREATE_TRANSACTION':
        return `Perfeito! Vou te ajudar a criar uma nova transação. 💰

Para registrar sua transação, preciso de algumas informações:
• Qual foi o valor?
• O que foi essa transação? (ex: compra, pagamento, recebimento)
• É uma receita ou despesa?

Pode me passar essas informações?`;
      
      case 'CREATE_GOAL':
        return `Ótimo! Vamos criar uma meta financeira! 🎯

Para criar sua meta, preciso saber:
• Qual valor você quer juntar?
• Para qual objetivo? (ex: viagem, carro, casa)
• Em quanto tempo quer alcançar?

Me conta um pouco sobre sua meta!`;
      
      case 'CREATE_INVESTMENT':
        return `Excelente! Vamos registrar seu investimento! 📈

Para cadastrar seu investimento, preciso de:
• Qual valor você investiu?
• Em que tipo de investimento? (ex: ações, fundos, CDB)
• Qual instituição?

Pode me passar essas informações?`;
      
      case 'ANALYZE_DATA':
        return `Claro! Vou analisar seus dados financeiros! 📊

Posso te mostrar:
• Resumo das suas transações
• Performance dos investimentos
• Progresso das metas
• Dicas personalizadas

O que você gostaria de ver primeiro?`;
      
      case 'CONFIRMATION':
        return `Perfeito! Vamos continuar então! 👍

O que você gostaria de fazer agora?`;
      
      case 'DENIAL':
        return `Entendi! Sem problemas! 😊

Como posso te ajudar de outra forma?`;
      
      case 'CORRECTION':
        return `Claro! Vamos corrigir isso! 🔧

Me fala o que precisa ser ajustado.`;
      
      case 'FRUSTRATION':
        return `Entendo sua frustração, ${userName}! 😔 Peço desculpas pela confusão.

Vou te ajudar de forma mais direta e clara. O que você precisa fazer agora? Estou aqui para te auxiliar!`;
      
      default:
    return `Olá ${userName}! Como posso te ajudar hoje? Posso criar metas, registrar transações, analisar investimentos ou responder suas dúvidas financeiras.`;
    }
  }

  private determineConfirmationNeed(intent: DetectedIntent, entities: any, context: ConversationContext): boolean {
    // Precisa de confirmação se:
    // 1. É uma ação de criação com dados suficientes
    // 2. O valor é alto (> R$ 1000)
    // 3. É a primeira vez que o usuário faz esse tipo de ação
    
    const isCreationAction = ['CREATE_GOAL', 'CREATE_INVESTMENT', 'CREATE_TRANSACTION'].includes(intent.type);
    const hasSufficientData = Object.keys(entities).length >= 2;
    const isHighValue = entities.valor > 1000 || entities.valor_total > 1000;
    
    return isCreationAction && hasSufficientData && isHighValue;
  }
} 