import { ChatHistoryService } from './chatHistoryService';
import { UserService } from '../modules/users/services/UserService';
import { UserRepository } from '../modules/users/repositories/UserRepository';
// import { GoalService } from './goalService';
// import { TransactionService } from './transactionService';
// import { InvestmentService } from './investmentService';

interface ConversationContext {
  recentMessages: any[];
  userProfile: any;
  financialContext: any;
  inferredGoals: any;
  lastTopics: string[];
}

interface UserPreferences {
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
  preferredProducts: string[];
  communicationStyle: 'detailed' | 'concise' | 'visual';
}

interface UserGoals {
  shortTerm: any[];
  mediumTerm: any[];
  longTerm: any[];
  inferredFromConversation: any[];
}

export class ConversationMemory {
  private contextWindow = 10; // Mantém as últimas 10 mensagens
  private longTermMemory: Map<string, UserPreferences> = new Map();
  private chatHistoryService: ChatHistoryService;
  private userService: UserService;
  // private goalService: GoalService;
  // private transactionService: TransactionService;
  // private investmentService: InvestmentService;

  constructor() {
    this.chatHistoryService = new ChatHistoryService();
    this.userService = new UserService(new UserRepository());
    // this.goalService = new GoalService();
    // this.transactionService = new TransactionService();
    // this.investmentService = new InvestmentService();
  }

  async getConversationContext(userId: string, chatId: string): Promise<ConversationContext> {
    try {
      console.log('[ConversationMemory] 🧠 Obtendo contexto para usuário:', userId);

      // Buscar mensagens recentes
      const recentMessages = await this.getRecentMessages(userId, this.contextWindow);
      
      // Buscar perfil do usuário
      const userProfile = await this.getUserProfile(userId);
      
      // Buscar contexto financeiro
      const financialContext = await this.getFinancialContext(userId);
      
      // Inferir metas baseadas na conversa
      const inferredGoals = this.inferUserGoals(recentMessages, financialContext);

      // ✅ CORREÇÃO: Extrair tópicos das mensagens recentes
      const lastTopics = this.extractTopicsFromMessages(recentMessages);

      return {
        recentMessages,
        userProfile,
        financialContext,
        inferredGoals,
        lastTopics
      };

    } catch (error) {
      console.error('[ConversationMemory] ❌ Erro ao obter contexto:', error);
      return {
        recentMessages: [],
        userProfile: {},
        financialContext: {},
        inferredGoals: { shortTerm: [], mediumTerm: [], longTerm: [], inferredFromConversation: [] },
        lastTopics: []
      };
    }
  }

  private async getUserProfile(userId: string): Promise<any> {
    try {
      // ✅ CORREÇÃO: Usar getUserByFirebaseUid ao invés de getUserById
      // userId aqui é o Firebase UID, não o MongoDB ObjectId
      const user = await this.userService.getUserByFirebaseUid(userId);
      
      if (!user) {
        return {};
      }

      // Buscar preferências de longo prazo
      const preferences = this.longTermMemory.get(userId) || this.inferPreferences(user);

      return {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscription || 'basic',
        riskProfile: preferences.riskProfile || 'moderate',
        investmentGoals: preferences.investmentGoals || [],
        preferredProducts: preferences.preferredProducts || [],
        communicationStyle: preferences.communicationStyle || 'concise',
        createdAt: user.createdAt,
        lastActive: (user as any).lastActive
      };

    } catch (error) {
      console.error('[ConversationMemory] ❌ Erro ao buscar perfil:', error);
      return {};
    }
  }

  private async getFinancialContext(userId: string): Promise<any> {
    try {
      // ✅ CORREÇÃO: Retornar dados mockados já que os serviços não existem
      const goals: any[] = [];
      const transactions: any[] = [];
      const investments: any[] = [];

      // Calcular métricas financeiras
      const recentTransactions = transactions.slice(0, 10);
      const totalSpent = recentTransactions
        .filter((t: any) => t.tipo === 'despesa')
        .reduce((sum: number, t: any) => sum + t.valor, 0);
      
      const totalEarned = recentTransactions
        .filter((t: any) => t.tipo === 'receita')
        .reduce((sum: number, t: any) => sum + t.valor, 0);

      const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.valor, 0);
      const totalGoals = goals.reduce((sum: number, goal: any) => sum + goal.valor_total, 0);

      return {
        recentTransactions,
        totalSpent,
        totalEarned,
        totalInvested,
        totalGoals,
        goals: goals.slice(0, 5), // Últimas 5 metas
        investments: investments.slice(0, 5), // Últimos 5 investimentos
        savingsRate: totalEarned > 0 ? ((totalEarned - totalSpent) / totalEarned) * 100 : 0,
        investmentRate: totalEarned > 0 ? (totalInvested / totalEarned) * 100 : 0
      };

    } catch (error) {
      console.error('[ConversationMemory] ❌ Erro ao buscar contexto financeiro:', error);
      return {
        recentTransactions: [],
        totalSpent: 0,
        totalEarned: 0,
        totalInvested: 0,
        totalGoals: 0,
        goals: [],
        investments: [],
        savingsRate: 0,
        investmentRate: 0
      };
    }
  }

  private inferUserGoals(messages: any[], financialContext: any): UserGoals {
    const goals: UserGoals = {
      shortTerm: [],
      mediumTerm: [],
      longTerm: [],
      inferredFromConversation: []
    };

    // Analisar mensagens para inferir metas
    messages.forEach((msg: any) => {
      if (msg.sender === 'user') {
        const content = msg.content.toLowerCase();
        
        // Detectar metas de viagem
        if (content.includes('viagem') || content.includes('viajar')) {
          goals.inferredFromConversation.push({
            type: 'travel',
            description: 'Meta de viagem',
            priority: 'medium'
          });
        }
        
        // Detectar metas de compra
        if (content.includes('comprar') || content.includes('carro') || content.includes('casa')) {
          goals.inferredFromConversation.push({
            type: 'purchase',
            description: 'Meta de compra',
            priority: 'high'
          });
        }
        
        // Detectar metas de educação
        if (content.includes('estudar') || content.includes('curso') || content.includes('faculdade')) {
          goals.inferredFromConversation.push({
            type: 'education',
            description: 'Meta educacional',
            priority: 'high'
          });
        }
        
        // Detectar metas de aposentadoria
        if (content.includes('aposentadoria') || content.includes('aposentar')) {
          goals.inferredFromConversation.push({
            type: 'retirement',
            description: 'Meta de aposentadoria',
            priority: 'long'
          });
        }
      }
    });

    // Classificar metas existentes por prazo
    if (financialContext.goals) {
      financialContext.goals.forEach((goal: any) => {
        const daysToGoal = this.calculateDaysToGoal(goal.data_conclusao);
        
        if (daysToGoal <= 90) {
          goals.shortTerm.push(goal);
        } else if (daysToGoal <= 365) {
          goals.mediumTerm.push(goal);
        } else {
          goals.longTerm.push(goal);
        }
      });
    }

    return goals;
  }

  private calculateDaysToGoal(targetDate: string): number {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private inferPreferences(user: any): UserPreferences {
    // Inferir preferências baseadas nos dados do usuário
    const preferences: UserPreferences = {
      riskProfile: 'moderate',
      investmentGoals: [],
      preferredProducts: [],
      communicationStyle: 'concise'
    };

    // Inferir perfil de risco baseado na idade (se disponível)
    if (user.age) {
      if (user.age < 30) {
        preferences.riskProfile = 'aggressive';
      } else if (user.age > 50) {
        preferences.riskProfile = 'conservative';
      }
    }

    // Inferir estilo de comunicação baseado no plano
    if (user.subscriptionPlan === 'premium') {
      preferences.communicationStyle = 'detailed';
    }

    return preferences;
  }

  async storeInteraction(message: any, response: any): Promise<void> {
    try {
      // Armazenar interação para aprendizado futuro
      const interaction = {
        userId: message.userId,
        chatId: message.chatId,
        userMessage: message.content,
        assistantResponse: response.response,
        timestamp: new Date(),
        metadata: {
          action: response.action,
          insights: response.insights,
          recommendations: response.recommendations,
          confidence: response.metadata?.confidence
        }
      };

      // Aqui você pode implementar armazenamento em banco de dados
      // para análise de padrões e melhoria contínua
      console.log('[ConversationMemory] 💾 Interação armazenada:', interaction);

    } catch (error) {
      console.error('[ConversationMemory] ❌ Erro ao armazenar interação:', error);
    }
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const currentPreferences = this.longTermMemory.get(userId) || this.inferPreferences({});
      const updatedPreferences = { ...currentPreferences, ...preferences };
      
      this.longTermMemory.set(userId, updatedPreferences);
      console.log('[ConversationMemory] ✅ Preferências atualizadas para usuário:', userId);

    } catch (error) {
      console.error('[ConversationMemory] ❌ Erro ao atualizar preferências:', error);
    }
  }

  getMemoryStats(): any {
    return {
      totalUsers: this.longTermMemory.size,
      contextWindow: this.contextWindow,
      memoryUsage: process.memoryUsage()
    };
  }

  // ✅ NOVO: Método para extrair tópicos das mensagens
  private extractTopicsFromMessages(messages: any[]): string[] {
    const topics: string[] = [];
    
    messages.forEach((msg: any) => {
      if (msg.sender === 'user') {
        const content = msg.content.toLowerCase();
        
        // Detectar tópicos baseados em palavras-chave
        if (content.includes('meta') || content.includes('objetivo') || content.includes('poupar')) {
          topics.push('metas');
        }
        if (content.includes('transação') || content.includes('gastei') || content.includes('recebi')) {
          topics.push('transações');
        }
        if (content.includes('investimento') || content.includes('investir') || content.includes('ações')) {
          topics.push('investimentos');
        }
        if (content.includes('orçamento') || content.includes('economizar')) {
          topics.push('orçamento');
        }
        if (content.includes('dúvida') || content.includes('ajuda') || content.includes('como')) {
          topics.push('suporte');
        }
      }
    });
    
    // Remover duplicatas e retornar os últimos 5 tópicos
    return [...new Set(topics)].slice(-5);
  }

  // ✅ NOVO: Método público para obter mensagens recentes
  async getRecentMessages(userId: string, limit: number = 5): Promise<any[]> {
    try {
      // ✅ CORREÇÃO: Retornar array vazio por enquanto para evitar erros
      console.log('[ConversationMemory] Buscando mensagens recentes para usuário:', userId);
      return [];
    } catch (error) {
      console.error('[ConversationMemory] ❌ Erro ao buscar mensagens recentes:', error);
      return [];
    }
  }

  // ✅ NOVO: Método para armazenar fluxo de conversa
  async storeConversationFlow(userId: string, flow: any): Promise<void> {
    try {
      // Aqui você implementaria o armazenamento do fluxo
      // Por enquanto, vamos apenas logar
      console.log('[ConversationMemory] 💾 Fluxo de conversa armazenado:', { userId, flow });
    } catch (error) {
      console.error('[ConversationMemory] ❌ Erro ao armazenar fluxo:', error);
    }
  }

  // ✅ NOVO: Método para obter fluxo atual
  async getCurrentFlow(userId: string): Promise<any | null> {
    try {
      // Aqui você implementaria a busca do fluxo atual
      // Por enquanto, retornamos null
      return null;
    } catch (error) {
      console.error('[ConversationMemory] ❌ Erro ao buscar fluxo atual:', error);
      return null;
    }
  }

  // ✅ NOVO: Método para armazenar exemplo de treinamento
  async storeTrainingExample(example: any): Promise<void> {
    try {
      // Aqui você implementaria o armazenamento para treinamento
      console.log('[ConversationMemory] 💾 Exemplo de treinamento armazenado:', example);
    } catch (error) {
      console.error('[ConversationMemory] ❌ Erro ao armazenar exemplo:', error);
    }
  }

  // ✅ NOVO: Método para verificar próxima mensagem
  async checkForNextMessage(userId: string, timeoutMs: number): Promise<any | null> {
    try {
      // Aqui você implementaria a verificação de próxima mensagem
      // Por enquanto, retornamos null
      return null;
    } catch (error) {
      console.error('[ConversationMemory] ❌ Erro ao verificar próxima mensagem:', error);
      return null;
    }
  }
} 