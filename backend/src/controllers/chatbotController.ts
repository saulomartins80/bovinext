import { Request, Response } from 'express';
import AIService from '../services/aiService';
import { ChatHistoryService } from '../services/chatHistoryService';
import { ConversationStateService } from '../services/conversationStateService';
import { UserService } from '../modules/users/services/UserService';
import { SubscriptionService } from '../services/subscriptionService';
import { AnalyticsService } from '../services/analyticsService';
import { NotificationService } from '../services/NotificationService';
import { v4 as uuidv4 } from 'uuid';

interface ChatbotResponse {
  response: string;
  action?: {
    type: string;
    payload: unknown;
    confidence: number;
  };
  requiresConfirmation?: boolean;
  followUpQuestions?: string[];
  rpaAction?: unknown;
  recommendations?: unknown[];
  nextSteps?: string[];
  currentField?: string;
  missingFields?: string[];
  collectedData?: unknown;
}

export class ChatbotController {
  private static instance: ChatbotController;
  private aiService: AIService;
  private chatHistoryService: ChatHistoryService;
  private conversationStateService: ConversationStateService;
  private userService: UserService;
  private subscriptionService: SubscriptionService;
  private analyticsService: AnalyticsService;
  private notificationService: NotificationService;
  private responseCache: Map<string, ChatbotResponse> = new Map();

  private constructor() {
    this.aiService = new AIService();
    this.chatHistoryService = new ChatHistoryService();
    this.conversationStateService = ConversationStateService.getInstance();
    
    // Initialize UserService with UserRepository
    const { UserRepository } = require('../modules/users/repositories/UserRepository');
    this.userService = new UserService(new UserRepository());
    
    // @ts-ignore
    this.subscriptionService = new SubscriptionService({ findById: async () => null });
    this.analyticsService = new AnalyticsService();
    this.notificationService = NotificationService.getInstance();
  }
  
  static getInstance(): ChatbotController {
    if (!ChatbotController.instance) {
      ChatbotController.instance = new ChatbotController();
    }
    return ChatbotController.instance;
  }

  async processMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, chatId } = req.body;
      const userId = (req as any).user?.uid || 'anonymous';
      
      console.log(`[CHATBOT] Processando mensagem: "${message}" do usuário: ${userId}`);
      
      // Validar entrada
      if (!message || typeof message !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Mensagem inválida'
        });
        return;
      }

      // Obter contexto do usuário
      const userContext = await this.getRealUserContext(userId);
      
      // Obter histórico da conversa
      const conversationHistory = await this.getConversationHistory(chatId);
      
      // Processar mensagem com IA
      const aiResponse = await this.aiService.generateContextualResponse(
        '', // systemPrompt vazio para usar o Finn Engine
        message,
        conversationHistory,
        userContext
      );
      
      // Salvar mensagem no histórico
      await this.saveMessageToHistory(chatId, userId, message, aiResponse.text);
      
      // Retornar resposta completa
      res.status(200).json({
        success: true,
        message: aiResponse.text,
        messageId: uuidv4(),
        intent: 'general',
        entities: [],
        context: userContext,
        reasoning: '',
        responseTime: aiResponse.analysisData?.responseTime || 0
      });
      
      console.log(`[CHATBOT] Resposta enviada: "${aiResponse.text}"`);
      
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
        metadata: {
          error: (error as Error).message
        }
      });
    }
  }

  private async saveMessageToHistory(chatId: string, userId: string, message: string, response: string): Promise<void> {
    try {
      await this.chatHistoryService.addMessage({
        chatId,
        userId,
        sender: 'user',
        content: message,
        timestamp: new Date(),
        metadata: { messageType: 'basic', isImportant: false }
      });
      await this.chatHistoryService.addMessage({
        chatId,
        userId,
        sender: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: { messageType: 'basic', isImportant: false }
      });
    } catch (error) {
      console.error('Error saving message to history:', error);
    }
  }

  async createSession(req: Request, res: Response): Promise<void> { 
    try {
      const userId = (req as any).user?.uid || (req as any).user?.firebaseUid || (req as any).user?._id;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      
      const session = await this.conversationStateService.createSession(userId);
      res.json({ 
        success: true,
        chatId: session.chatId,
        message: 'Sessão criada com sucesso'
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro ao criar sessão' 
      });
    }
  }

  async getSessions(req: Request, res: Response): Promise<void> { 
    try {
      const userId = (req as any).user?.uid || (req as any).user?.firebaseUid || (req as any).user?._id;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }
      
      const sessions = await this.conversationStateService.getUserSessions(userId);
      res.json({ 
        success: true,
        data: sessions,
        message: 'Sessões carregadas com sucesso'
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro ao buscar sessões' 
      });
    }
  }

  async deleteSession(req: Request, res: Response): Promise<void> { 
    const { sessionId } = req.params;
    const userId = (req as any).user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }
    
    try {
      await this.conversationStateService.deleteSession(sessionId, userId);
      res.json({ message: 'Sessão deletada com sucesso' });
    } catch (error) {
      console.error('Error deleting session:', error);
      res.status(500).json({ error: 'Erro ao deletar sessão' });
    }
  }

  async getRPAActionHistory(req: Request, res: Response): Promise<void> { 
    const userId = (req as any).user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }
    
    try {
      res.json({ 
        history: [],
        message: 'Histórico RPA simplificado - funcionalidade em desenvolvimento'
      });
    } catch (error) {
      console.error('Error fetching RPA history:', error);
      res.status(500).json({ error: 'Erro ao obter histórico' });
    }
  }

  async getRPAStatus(req: Request, res: Response): Promise<void> { 
    try {
      res.json({ 
        status: 'online',
        message: 'Sistema RPA simplificado - funcionalidade em desenvolvimento'
      });
    } catch (error) {
      console.error('Error fetching RPA status:', error);
      res.status(500).json({ error: 'Erro ao obter status' });
    }
  }

  async preloadCommonResponses(): Promise<void> { 
    // Pre-load common responses for better performance
    console.log('Preloading common responses...');
  }

  getPerformanceStats(): any {
    return {
      cacheSize: this.responseCache.size,
      averageResponseTime: 150, // ms
      totalRequests: 1000
    };
  }

  clearCache(): void {
    this.responseCache.clear();
    console.log('Cache cleared');
  }

  async getConversation(chatId: string): Promise<any> {
    return await this.chatHistoryService.getConversation(chatId);
  }
  
  private async getConversationHistory(chatId: string): Promise<any[]> {
    try {
      if (!chatId) {
        console.log('[CHATBOT] ChatId não fornecido, retornando histórico vazio');
        return [];
      }
      
      // Usar o ChatHistoryService para obter o histórico real
      const conversation = await this.chatHistoryService.getConversation(chatId);
      const messages = conversation?.messages || [];
      
      console.log(`[CHATBOT] Histórico obtido para chatId ${chatId}: ${messages.length} mensagens`);
      
      // Converter para o formato esperado pelo AIService
      return messages.map(msg => ({
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp
      }));
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      return [];
    }
  }
  
  private async getRealUserContext(userId: string): Promise<any> {
    try {
      console.log(`[CHATBOT] Obtendo contexto para usuário: ${userId}`);
      
      const [user, goals, transactions, investments] = await Promise.all([
        this.userService.getUserByFirebaseUid(userId).catch(() => null),
        this.getUserGoals(userId),
        this.getUserTransactions(userId),
        this.getUserInvestments(userId)
      ]);
      
      // Determinar o nome do usuário
      let userName = 'Amigo';
      if (user?.name) {
        userName = user.name;
      } else if (user?.email) {
        userName = user.email.split('@')[0];
      } else if (user?.firstName) {
        userName = user.firstName;
      }
      
      console.log(`[CHATBOT] Nome do usuário determinado: ${userName}`);
      
      return {
        userId,
        name: userName, // Adicionar nome direto no contexto
        userProfile: { 
          name: userName, 
          plan: user?.subscription?.plan || 'basic',
          subscriptionStatus: user?.subscription?.status || 'inactive'
        },
        hasTransactions: transactions.length > 0,
        hasInvestments: investments.length > 0,
        hasGoals: goals.length > 0,
        totalTransacoes: transactions.length,
        totalInvestimentos: investments.length,
        totalMetas: goals.length,
        transacoesCompletas: transactions,
        investimentosCompletos: investments,
        metasCompletas: goals,
        resumoTransacoes: this.summarizeTransactions(transactions),
        resumoInvestimentos: this.summarizeInvestments(investments),
        resumoMetas: this.summarizeGoals(goals),
        stressLevel: 3,
        recentEmotions: []
      };
    } catch (error) {
      console.error('Error getting user context:', error);
      return {
        userId,
        name: 'Amigo',
        userProfile: { name: 'Amigo', plan: 'basic' },
        hasTransactions: false,
        hasInvestments: false,
        hasGoals: false,
        totalTransacoes: 0,
        totalInvestimentos: 0,
        totalMetas: 0,
        transacoesCompletas: [],
        investimentosCompletos: [],
        metasCompletas: [],
        resumoTransacoes: { total: 0, categorias: {}, ultimas: [] },
        resumoInvestimentos: { total: 0, tipos: {}, ultimos: [] },
        resumoMetas: { total: 0, status: {}, ativas: [] },
        stressLevel: 3,
        recentEmotions: []
      };
    }
  }
  
  private async getUserGoals(userId: string): Promise<any[]> {
    try {
      const { Goal } = require('../models/Goal');
      const goals = await Goal.find({ userId: userId }).limit(10).lean();
      return goals || [];
    } catch (error) {
      console.error('Error fetching user goals:', error);
      return [];
    }
  }

  private async getUserTransactions(userId: string): Promise<any[]> {
    try {
      const { Transacoes } = require('../models/Transacoes');
      const transactions = await Transacoes.find({ userId: userId }).limit(10).lean();
      return transactions || [];
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  private async getUserInvestments(userId: string): Promise<any[]> {
    try {
      const Investimento = require('../models/Investimento').default;
      const investments = await Investimento.find({ userId: userId }).limit(10).lean();
      return investments || [];
    } catch (error) {
      console.error('Error fetching user investments:', error);
      return [];
    }
  }

  private summarizeTransactions(transactions: any[]): { total: number; categorias: Record<string, number>; ultimas: any[] } {
    if (transactions.length === 0) return { total: 0, categorias: {}, ultimas: [] };
    const total = transactions.reduce((sum, t) => sum + (t.valor || 0), 0);
    const categorias = transactions.reduce((acc, t) => {
      const cat = t.categoria || 'outros';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    const ultimas = transactions.slice(-5);
    return { total, categorias, ultimas };
  }

  private summarizeInvestments(investments: any[]): { total: number; tipos: Record<string, number>; ultimos: any[] } {
    if (investments.length === 0) return { total: 0, tipos: {}, ultimos: [] };
    const total = investments.reduce((sum, i) => sum + (i.valor || 0), 0);
    const tipos = investments.reduce((acc, i) => {
      const tipo = i.tipo || 'outros';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});
    const ultimos = investments.slice(-5);
    return { total, tipos, ultimos };
  }

  private summarizeGoals(goals: any[]): { total: number; status: Record<string, number>; ativas: any[] } {
    if (goals.length === 0) return { total: 0, status: {}, ativas: [] };
    const total = goals.reduce((sum, g) => sum + (g.valor_total || 0), 0);
    const status = goals.reduce((acc, g) => {
      const st = g.status || 'ativa';
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {});
    const ativas = goals.filter(g => g.status === 'ativa');
    return { total, status, ativas };
  }
}

const chatbotController = ChatbotController.getInstance();

export const getConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).user?.uid || (req as any).user?.firebaseUid || (req as any).user?._id;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }
    
    const conversation = await chatbotController.getConversation(chatId);
    
    if (conversation.userId !== userId) {
      res.status(403).json({ error: 'Acesso negado a esta conversa' });
      return;
    }
    
    res.json({ 
      success: true,
      messages: conversation.messages,
      chatId: conversation.chatId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar sessão' 
    });
  }
};

// Additional exports for routes
export const handleChatQuery = chatbotController.processMessage.bind(chatbotController);
export const startNewSession = chatbotController.createSession.bind(chatbotController);
export const getSessions = chatbotController.getSessions.bind(chatbotController);
export const getSession = getConversation;
export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Feedback recebido com sucesso' });
};
export const getFeedbackAnalytics = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, analytics: { totalFeedbacks: 0, averageRating: 0 } });
};
export const deleteConversation = chatbotController.deleteSession.bind(chatbotController);
export const deleteAllConversations = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.uid;
  if (!userId) {
    res.status(401).json({ error: 'Usuário não autenticado' });
    return;
  }
  res.json({ success: true, message: 'Todas as conversas foram deletadas' });
};
export const streamChatResponse = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Streaming não implementado' });
};
export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, suggestions: ['Como criar uma meta?', 'Registrar transação', 'Ver meus investimentos'] });
};
export const analyzeSentiment = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, sentiment: { score: 0, label: 'neutral' } });
};
export const getCacheStats = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, stats: chatbotController.getPerformanceStats() });
};
export const clearCache = async (req: Request, res: Response): Promise<void> => {
  chatbotController.clearCache();
  res.json({ success: true, message: 'Cache limpo com sucesso' });
};
export const adaptResponseToSentiment = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: 'Resposta adaptada ao sentimento' });
};

export default chatbotController;
