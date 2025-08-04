// Fixed version of aiService.ts
import { OpenAI } from 'openai';

interface ChatMessage {
  sender: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

class AIService {
  private openai: OpenAI;
  private responseCache: Map<string, any> = new Map();

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'test-key'
    });
  }

  async processMessage(
    userId: string,
    query: string,
    conversationHistory: ChatMessage[],
    userContext?: unknown
  ): Promise<any> {
    try {
      const startTime = Date.now();
      
      // Analisar a mensagem do usuário
      const lowerQuery = query.toLowerCase();
      
      // Detectar intenção baseada no conteúdo da mensagem
      let response = '';
      let intent = { name: 'general', confidence: 0.7, payload: {} };
      
      if (lowerQuery.includes('olá') || lowerQuery.includes('oi') || lowerQuery.includes('hello')) {
        response = this.generateGreetingResponse(userContext);
        intent = { name: 'greeting', confidence: 0.9, payload: {} };
      } else if (lowerQuery.includes('ajuda') || lowerQuery.includes('help')) {
        response = this.generateHelpResponse(userContext);
        intent = { name: 'help', confidence: 0.8, payload: {} };
      } else if (lowerQuery.includes('transação') || lowerQuery.includes('gasto') || lowerQuery.includes('receita')) {
        response = this.generateTransactionResponse(userContext);
        intent = { name: 'transaction', confidence: 0.8, payload: {} };
      } else if (lowerQuery.includes('investimento') || lowerQuery.includes('investir')) {
        response = this.generateInvestmentResponse(userContext);
        intent = { name: 'investment', confidence: 0.8, payload: {} };
      } else if (lowerQuery.includes('meta') || lowerQuery.includes('objetivo')) {
        response = this.generateGoalResponse(userContext);
        intent = { name: 'goal', confidence: 0.8, payload: {} };
      } else if (lowerQuery.includes('saldo') || lowerQuery.includes('dinheiro') || lowerQuery.includes('quanto')) {
        response = this.generateBalanceResponse(userContext);
        intent = { name: 'balance', confidence: 0.7, payload: {} };
      } else if (lowerQuery.includes('dica') || lowerQuery.includes('conselho')) {
        response = this.generateTipResponse(userContext);
        intent = { name: 'tip', confidence: 0.7, payload: {} };
      } else {
        response = this.generateGeneralResponse(query, userContext);
        intent = { name: 'general', confidence: 0.5, payload: {} };
      }
      
      return {
        response: response,
        intent: intent,
        entities: this.extractEntities(query),
        context: userContext,
        reasoning: `Processei a mensagem "${query}" e identifiquei a intenção: ${intent.name}`,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        response: 'Desculpe, houve um erro. Tente novamente.',
        intent: {
          name: 'error',
          confidence: 0.1,
          payload: {}
        },
        entities: {},
        context: userContext,
        reasoning: 'Erro na comunicação com IA'
      };
    }
  }

  private generateGreetingResponse(userContext: any): string {
    const userName = userContext?.userProfile?.name || 'Amigo';
    const timeOfDay = this.getTimeOfDay();
    
    return `${timeOfDay}, ${userName}! 👋 

Sou seu assistente financeiro pessoal. Posso ajudar você com:

💳 **Transações**: Registrar gastos e receitas
📈 **Investimentos**: Acompanhar seus investimentos  
🎯 **Metas**: Criar e gerenciar objetivos financeiros
💰 **Análises**: Relatórios e insights sobre suas finanças

Como posso te ajudar hoje?`;
  }

  private generateHelpResponse(userContext: any): string {
    return `Aqui estão as principais funcionalidades que posso te ajudar:

**📊 Gestão Financeira:**
• Registrar transações (gastos e receitas)
• Categorizar seus gastos
• Acompanhar seu saldo

**📈 Investimentos:**
• Adicionar novos investimentos
• Acompanhar performance
• Receber recomendações

**🎯 Metas Financeiras:**
• Criar objetivos de economia
• Acompanhar progresso
• Receber lembretes

**💡 Dicas e Insights:**
• Análise de gastos
• Sugestões de economia
• Tendências financeiras

Basta me dizer o que você quer fazer!`;
  }

  private generateTransactionResponse(userContext: any): string {
    const hasTransactions = userContext?.hasTransactions;
    
    if (hasTransactions) {
      const totalTransacoes = userContext?.totalTransacoes || 0;
      return `Vejo que você já tem ${totalTransacoes} transações registradas! 

Para **adicionar uma nova transação**, me diga:
• O valor
• A descrição
• A categoria (ex: alimentação, transporte, lazer)

Exemplo: "Registrar gasto de R$ 50 com almoço na categoria alimentação"

Para **ver suas transações**, posso mostrar um resumo dos seus últimos gastos e receitas.`;
    } else {
      return `Perfeito! Vamos começar a registrar suas transações.

Para **adicionar uma transação**, me diga:
• O valor
• A descrição  
• A categoria

Exemplo: "Registrar gasto de R$ 30 com Uber na categoria transporte"

Isso vai te ajudar a ter controle total das suas finanças! 💰`;
    }
  }

  private generateInvestmentResponse(userContext: any): string {
    const hasInvestments = userContext?.hasInvestments;
    
    if (hasInvestments) {
      const totalInvestimentos = userContext?.totalInvestimentos || 0;
      return `Ótimo! Você já tem ${totalInvestimentos} investimentos registrados.

Posso te ajudar a:
• **Adicionar** novos investimentos
• **Acompanhar** a performance dos seus ativos
• **Analisar** a diversificação da sua carteira
• **Receber** recomendações baseadas no seu perfil

Quer adicionar um novo investimento ou ver o resumo dos seus atuais?`;
    } else {
      return `Que ótimo que você quer começar a investir! 💪

Para **adicionar um investimento**, me informe:
• O tipo (ações, fundos, cripto, etc.)
• O valor investido
• A data da aplicação

Exemplo: "Adicionar investimento de R$ 1000 em ações da Petrobras"

Posso também te dar dicas sobre:
• Diversificação de carteira
• Tipos de investimentos
• Estratégias de longo prazo

Vamos começar?`;
    }
  }

  private generateGoalResponse(userContext: any): string {
    const hasGoals = userContext?.hasGoals;
    
    if (hasGoals) {
      const totalMetas = userContext?.totalMetas || 0;
      return `Excelente! Você já tem ${totalMetas} metas financeiras ativas.

Posso te ajudar a:
• **Acompanhar** o progresso das suas metas
• **Adicionar** novas metas
• **Ajustar** valores ou prazos
• **Comemorar** quando atingir um objetivo! 🎉

Quer ver o status das suas metas atuais ou criar uma nova?`;
    } else {
      return `Ótima ideia! Metas financeiras são essenciais para o sucesso.

Para **criar uma meta**, me diga:
• O objetivo (ex: viagem, carro, casa)
• O valor total necessário
• O prazo desejado

Exemplo: "Criar meta de R$ 5000 para viagem em 6 meses"

Vou te ajudar a:
• Calcular quanto economizar por mês
• Acompanhar o progresso
• Manter a motivação

Qual é o seu primeiro objetivo? 🎯`;
    }
  }

  private generateBalanceResponse(userContext: any): string {
    const hasTransactions = userContext?.hasTransactions;
    
    if (hasTransactions) {
      const resumoTransacoes = userContext?.resumoTransacoes;
      const total = resumoTransacoes?.total || 0;
      
      return `Baseado nas suas transações registradas:

💰 **Total de transações**: R$ ${total.toFixed(2)}
📊 **Número de registros**: ${userContext?.totalTransacoes || 0}

Para ter um **saldo mais preciso**, certifique-se de:
• Registrar todas as suas receitas
• Incluir todos os gastos
• Atualizar regularmente

Quer que eu analise seus gastos por categoria ou ajude a registrar mais transações?`;
    } else {
      return `Para te dar informações sobre seu saldo, preciso que você registre suas transações primeiro.

Vamos começar registrando:
• Suas **receitas** (salário, bônus, etc.)
• Seus **gastos** (contas, alimentação, lazer)

Exemplo: "Registrar receita de R$ 3000 do salário"

Assim que tivermos alguns registros, posso te dar análises detalhadas sobre suas finanças! 💰`;
    }
  }

  private generateTipResponse(userContext: any): string {
    const tips = [
      "💡 **Regra 50/30/20**: 50% para necessidades, 30% para desejos, 20% para investimentos",
      "💡 **Reserva de emergência**: Mantenha 3-6 meses de despesas em uma conta separada",
      "💡 **Automatize**: Configure transferências automáticas para seus investimentos",
      "💡 **Revise mensalmente**: Analise seus gastos para identificar oportunidades de economia",
      "💡 **Diversifique**: Não coloque todos os ovos na mesma cesta - diversifique seus investimentos",
      "💡 **Metas SMART**: Específicas, Mensuráveis, Atingíveis, Relevantes e Temporais"
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    return `Aqui está uma dica financeira para você:

${randomTip}

Quer mais dicas ou tem alguma dúvida específica sobre finanças?`;
  }

  private generateGeneralResponse(query: string, userContext: any): string {
    return `Entendi que você disse: "${query}"

Como seu assistente financeiro, posso te ajudar com:

• 📊 **Gestão de transações** e controle de gastos
• 📈 **Acompanhamento de investimentos**
• 🎯 **Criação e gestão de metas financeiras**
• 💡 **Dicas e conselhos financeiros**
• 📋 **Relatórios e análises**

Me diga especificamente o que você gostaria de fazer e vou te guiar! 😊`;
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  private extractEntities(query: string): any {
    // Extrair entidades básicas da mensagem
    const entities: any = {};
    
    // Extrair valores monetários
    const moneyMatch = query.match(/R?\$?\s*(\d+[.,]?\d*)/gi);
    if (moneyMatch) {
      entities.money = moneyMatch.map(m => m.replace(/[^\d,.]/g, ''));
    }
    
    // Extrair categorias
    const categories = ['alimentação', 'transporte', 'lazer', 'saúde', 'educação', 'moradia'];
    const foundCategories = categories.filter(cat => query.toLowerCase().includes(cat));
    if (foundCategories.length > 0) {
      entities.categories = foundCategories;
    }
    
    return entities;
  }

  private async callAI(prompt: string, context: unknown = {}): Promise<any> {
    // Simulated AI response
    return {
      choices: [{
        message: {
          content: 'Resposta simulada da IA'
        }
      }]
    };
  }

  private postProcess(text: string): string {
    return text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  private extractTopicsFromHistory(messages: ChatMessage[]): string[] {
    const topics = ['investimentos', 'economia', 'metas', 'transações'];
    const detectedTopics: string[] = [];
    
    messages.forEach(msg => {
      topics.forEach(topic => {
        if (msg.content.toLowerCase().includes(topic) && !detectedTopics.includes(topic)) {
          detectedTopics.push(topic);
        }
      });
    });
    
    return detectedTopics;
  }

  // Missing methods that are called by other services
  async detectAutomatedAction(prompt: string): Promise<any> {
    try {
      // Simulate AI detection of automated actions
      const actions = {
        'criar transação': { type: 'CREATE_TRANSACTION', confidence: 0.9 },
        'criar meta': { type: 'CREATE_GOAL', confidence: 0.9 },
        'criar investimento': { type: 'CREATE_INVESTMENT', confidence: 0.9 },
        'análise': { type: 'ANALYSIS', confidence: 0.8 },
        'relatório': { type: 'REPORT', confidence: 0.8 }
      };

      const promptLower = prompt.toLowerCase();
      for (const [key, action] of Object.entries(actions)) {
        if (promptLower.includes(key)) {
          return {
            action: action.type,
            confidence: action.confidence,
            payload: this.extractPayloadFromPrompt(prompt, action.type)
          };
        }
      }

      return {
        action: 'UNKNOWN',
        confidence: 0.1,
        payload: {}
      };
    } catch (error) {
      console.error('Error detecting automated action:', error);
      return {
        action: 'ERROR',
        confidence: 0,
        payload: {}
      };
    }
  }

  async generateContextualResponse(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[],
    userContext?: unknown
  ): Promise<string> {
    try {
      // Generate contextual response based on conversation history
      const topics = this.extractTopicsFromHistory(conversationHistory);
      const context = userContext || {};
      
      // Simple contextual response generation
      if (userMessage.toLowerCase().includes('ajuda')) {
        return 'Como posso te ajudar com suas finanças hoje?';
      }
      
      if (topics.includes('investimentos')) {
        return 'Vejo que você tem interesse em investimentos. Posso te ajudar com análises de portfólio!';
      }
      
      if (topics.includes('metas')) {
        return 'Que bom que você está pensando em metas financeiras! Vamos planejar juntos?';
      }
      
      return 'Entendi. Como posso te ajudar com suas finanças?';
    } catch (error) {
      console.error('Error generating contextual response:', error);
      return 'Desculpe, tive um problema. Como posso te ajudar?';
    }
  }

  async analyzeSentiment(text: string): Promise<{ score: number; label: string }> {
    try {
      // Simple sentiment analysis
      const positiveWords = ['bom', 'ótimo', 'excelente', 'obrigado', 'legal', 'gostei'];
      const negativeWords = ['ruim', 'péssimo', 'problema', 'erro', 'difícil', 'não gosto'];
      
      const textLower = text.toLowerCase();
      let score = 0;
      
      positiveWords.forEach(word => {
        if (textLower.includes(word)) score += 0.2;
      });
      
      negativeWords.forEach(word => {
        if (textLower.includes(word)) score -= 0.2;
      });
      
      // Normalize score between -1 and 1
      score = Math.max(-1, Math.min(1, score));
      
      let label = 'neutral';
      if (score > 0.1) label = 'positive';
      else if (score < -0.1) label = 'negative';
      
      return { score, label };
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { score: 0, label: 'neutral' };
    }
  }

  static async deepFraudAnalysis(transaction: any): Promise<number> {
    try {
      // Simple fraud analysis based on transaction patterns
      let riskScore = 0;
      
      // High amount transactions are riskier
      if (transaction.valor > 10000) riskScore += 0.3;
      if (transaction.valor > 50000) riskScore += 0.5;
      
      // Unusual times
      const hour = new Date(transaction.timestamp || new Date()).getHours();
      if (hour < 6 || hour > 23) riskScore += 0.2;
      
      // Suspicious descriptions
      const suspiciousWords = ['urgent', 'winner', 'prize', 'click now'];
      if (transaction.descricao && suspiciousWords.some(word => 
        transaction.descricao.toLowerCase().includes(word))) {
        riskScore += 0.4;
      }
      
      return Math.min(1, riskScore);
    } catch (error) {
      console.error('Error in fraud analysis:', error);
      return 0;
    }
  }

  static async analyzeCorrection(userMessage: string, lastResponse: string): Promise<any> {
    try {
      const correctionWords = ['não', 'errado', 'incorreto', 'corrigir', 'mudar'];
      const isCorrection = correctionWords.some(word => 
        userMessage.toLowerCase().includes(word));
      
      if (isCorrection) {
        return {
          needsCorrection: true,
          suggestion: 'Peço desculpas pelo mal-entendido. Vou reformular minha resposta.',
          confidence: 0.8
        };
      }
      
      return {
        needsCorrection: false,
        suggestion: null,
        confidence: 0.2
      };
    } catch (error) {
      console.error('Error analyzing correction:', error);
      return {
        needsCorrection: false,
        suggestion: null,
        confidence: 0
      };
    }
  }

  static async extractInsights(feedback: string[]): Promise<any[]> {
    try {
      const insights = [];
      const feedbackText = feedback.join(' ').toLowerCase();
      
      // Common themes analysis
      if (feedbackText.includes('lento') || feedbackText.includes('demorado')) {
        insights.push({
          type: 'performance',
          message: 'Usuários reportam lentidão no sistema',
          priority: 'high'
        });
      }
      
      if (feedbackText.includes('confuso') || feedbackText.includes('difícil')) {
        insights.push({
          type: 'usability',
          message: 'Interface pode ser melhorada para facilitar uso',
          priority: 'medium'
        });
      }
      
      if (feedbackText.includes('gostei') || feedbackText.includes('bom')) {
        insights.push({
          type: 'positive',
          message: 'Feedback positivo dos usuários',
          priority: 'low'
        });
      }
      
      return insights;
    } catch (error) {
      console.error('Error extracting insights:', error);
      return [];
    }
  }

  private extractPayloadFromPrompt(prompt: string, actionType: string): any {
    const promptLower = prompt.toLowerCase();
    
    switch (actionType) {
      case 'CREATE_TRANSACTION':
        // Extract transaction data from prompt
        const valorMatch = prompt.match(/r\$?\s*(\d+(?:,\d{2})?)/i);
        const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : 0;
        
        return {
          valor,
          descricao: this.extractDescription(prompt),
          tipo: promptLower.includes('receita') ? 'receita' : 'despesa',
          categoria: 'geral',
          data: new Date().toISOString()
        };
        
      case 'CREATE_GOAL':
        const goalValorMatch = prompt.match(/r\$?\s*(\d+(?:,\d{2})?)/i);
        const goalValor = goalValorMatch ? parseFloat(goalValorMatch[1].replace(',', '.')) : 0;
        
        return {
          meta: this.extractGoalName(prompt),
          valor_total: goalValor,
          data_conclusao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          categoria: 'pessoal'
        };
        
      case 'CREATE_INVESTMENT':
        const invValorMatch = prompt.match(/r\$?\s*(\d+(?:,\d{2})?)/i);
        const invValor = invValorMatch ? parseFloat(invValorMatch[1].replace(',', '.')) : 0;
        
        return {
          nome: this.extractInvestmentName(prompt),
          valor: invValor,
          tipo: 'outros',
          data: new Date().toISOString()
        };
        
      default:
        return {};
    }
  }

  private extractDescription(prompt: string): string {
    // Simple extraction of description from prompt
    const words = prompt.split(' ');
    const stopWords = ['criar', 'registrar', 'adicionar', 'nova', 'novo', 'transação', 'de', 'para', 'com', 'em', 'r$'];
    const description = words.filter(word => 
      !stopWords.includes(word.toLowerCase()) && 
      !word.match(/^r\$?\d+/i)
    ).join(' ');
    
    return description || 'Transação';
  }

  private extractGoalName(prompt: string): string {
    const words = prompt.split(' ');
    const stopWords = ['criar', 'nova', 'meta', 'para', 'de', 'r$'];
    const goalName = words.filter(word => 
      !stopWords.includes(word.toLowerCase()) && 
      !word.match(/^r\$?\d+/i)
    ).join(' ');
    
    return goalName || 'Nova Meta';
  }

  private extractInvestmentName(prompt: string): string {
    const words = prompt.split(' ');
    const stopWords = ['criar', 'novo', 'investimento', 'em', 'de', 'r$'];
    const invName = words.filter(word => 
      !stopWords.includes(word.toLowerCase()) && 
      !word.match(/^r\$?\d+/i)
    ).join(' ');
    
    return invName || 'Novo Investimento';
  }
}

export default AIService;
