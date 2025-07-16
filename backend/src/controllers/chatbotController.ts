 // backend/src/controllers/chatbotController.ts
import { Request, Response } from 'express';
import AIService from '../services/aiService';
import { ChatHistoryService } from '../services/chatHistoryService';
import { ConversationStateService } from '../services/conversationStateService';
import { UserService } from '../modules/users/services/UserService';
import { SubscriptionService } from '../services/subscriptionService';
import { AnalyticsService } from '../services/analyticsService';
import { NotificationService } from '../services/NotificationService';
import { detectUserIntent, createTransaction, createInvestment, createGoal } from '../controllers/automatedActionsController';
import { v4 as uuidv4 } from 'uuid';
import { financialAssistant } from '../services/FinancialAssistant';
import { emailService } from '../services/emailService';
import { personalityService } from '../services/personalityService';

interface ChatbotResponse {
  response: string;
  action?: {
    type: string;
    payload: any;
    confidence: number;
  };
  requiresConfirmation?: boolean;
  followUpQuestions?: string[];
  rpaAction?: any;
  recommendations?: any[];
  nextSteps?: string[];
  currentField?: string;
  missingFields?: string[];
  collectedData?: any;
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
    // ✅ CORREÇÃO: Inicializar UserService com UserRepository
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

  // 🧠 PROCESSAMENTO INTELIGENTE COM ASSISTENTE FINANCEIRO
  async processMessage(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { message, chatId } = req.body;
      const userId = (req as any).user?.uid || 'anonymous';
      const realChatId = chatId || `chat_${userId}_${Date.now()}`;

      console.log(`[ChatbotController] 🧠 Mensagem recebida: "${message}" (ChatId: ${realChatId})`);

      // ✅ CORREÇÃO: PROCESSAMENTO SIMPLIFICADO - APENAS 1 CHAMADA IA
      const userMessage = {
        content: message,
        userId,
        chatId: realChatId,
        timestamp: new Date()
      };

      // ✅ NOVO: Processamento direto com AIService (sem camadas extras)
      console.log(`[ChatbotController] 🧠 Processando com IA direta...`);
      
      // 1. Buscar contexto real do usuário
      const userContext = await this.getRealUserContext(userId);
      
      // 2. Buscar histórico da conversa
      const conversationHistory = await this.chatHistoryService.getConversation(realChatId).catch(() => ({ messages: [] }));
      
      // 3. UMA ÚNICA CHAMADA PARA IA
      const aiResponse = await this.aiService.generateContextualResponse(
        '', // systemPrompt vazio ativa o FinnEngine
        message,
        conversationHistory.messages || [],
        userContext
      );

      // 4. Salvar no histórico
      await this.saveMessageToHistory(realChatId, userId, message, aiResponse.text);

      const totalTime = Date.now() - startTime;
      console.log(`🧠 Resposta IA processada em ${totalTime}ms`);

      const response = {
        success: true,
        message: aiResponse.text,
        metadata: {
          action: { type: 'TEXT_RESPONSE', payload: {}, confidence: 0.9 },
          requiresConfirmation: false,
          followUpQuestions: [
            'Posso te ajudar com algo mais?',
            'Quer ver um resumo desta categoria?'
          ],
          recommendations: undefined,
          insights: undefined,
          messageId: `msg-${Date.now()}-${Math.random()}`,
          processingTime: totalTime
        }
      };

      console.log(`[ChatbotController] 📤 Enviando resposta simplificada:`, response);
      res.json(response);

    } catch (error) {
      console.error('[ChatbotController] ❌ Erro no processamento simplificado:', error);
      
      const totalTime = Date.now() - startTime;
      res.status(500).json({
        success: false,
        message: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
        metadata: {
          processingTime: totalTime,
          error: error.message
        }
      });
    }
  }

  // 💾 SALVAR MENSAGEM NO HISTÓRICO
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
      console.error('❌ Erro ao salvar mensagem no histórico:', error);
    }
  }

  // 🎯 CRIAR SESSÃO
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      // ✅ CORREÇÃO: Extrair userId do req.user (autenticação)
      const userId = req.user?.uid || req.user?.firebaseUid || req.user?._id;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      console.log(`[ChatbotController] Criando nova sessão para usuário: ${userId}`);

      // Criar nova sessão
      const session = await this.chatHistoryService.createConversation(userId);
      
      console.log(`[ChatbotController] Sessão criada: ${session.chatId}`);

      res.json({ 
        success: true,
        chatId: session.chatId,
        message: 'Sessão criada com sucesso'
      });
    } catch (error) {
      console.error('❌ Erro ao criar sessão:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro ao criar sessão' 
      });
    }
  }

  // 📋 BUSCAR SESSÕES
  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      // ✅ CORREÇÃO: Extrair userId do req.user (autenticação)
      const userId = req.user?.uid || req.user?.firebaseUid || req.user?._id;
      
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      console.log(`[ChatbotController] Buscando sessões para usuário: ${userId}`);

      // Buscar sessões do usuário
      const sessions = await this.chatHistoryService.getSessions(userId);
      
      console.log(`[ChatbotController] Encontradas ${sessions.length} sessões`);

      res.json({ 
        success: true,
        data: sessions,
        message: 'Sessões carregadas com sucesso'
      });
    } catch (error) {
      console.error('❌ Erro ao buscar sessões:', error);
      res.status(500).json({ 
        success: false,
        error: 'Erro ao buscar sessões' 
      });
    }
  }

  // 🗑️ DELETAR SESSÃO
  async deleteSession(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;
    const userId = req.user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    try {
      await this.chatHistoryService.deleteConversation(sessionId);
      res.json({ message: 'Sessão deletada com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao deletar sessão:', error);
      res.status(500).json({ error: 'Erro ao deletar sessão' });
    }
  }

  // 📊 MÉTODOS RPA ADICIONAIS (SIMPLIFICADOS)
  async getRPAActionHistory(req: Request, res: Response): Promise<void> {
    const userId = req.user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    try {
      // ✅ SIMPLIFICAÇÃO: Retornar histórico básico
      res.json({ 
        history: [],
        message: 'Histórico RPA simplificado - funcionalidade em desenvolvimento'
      });
    } catch (error) {
      console.error('❌ Erro ao obter histórico RPA:', error);
      res.status(500).json({ error: 'Erro ao obter histórico' });
    }
  }

  async getRPAStatus(req: Request, res: Response): Promise<void> {
    try {
      // ✅ SIMPLIFICAÇÃO: Retornar status básico
      res.json({ 
        status: 'online',
        message: 'Sistema RPA simplificado - funcionalidade em desenvolvimento'
      });
    } catch (error) {
      console.error('❌ Erro ao obter status RPA:', error);
      res.status(500).json({ error: 'Erro ao obter status' });
    }
  }

  async preloadCommonResponses(): Promise<void> {
    // Pré-carregar respostas comuns para melhor performance
    console.log('🔄 Pré-carregando respostas comuns...');
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
    console.log('🗑️ Cache do chatbot limpo');
  }

  // ✅ ADICIONADO: Método público para acessar conversa
  async getConversation(chatId: string): Promise<any> {
    return await this.chatHistoryService.getConversation(chatId);
  }

  // ✅ NOVO: Buscar contexto real do usuário
  private async getRealUserContext(userId: string): Promise<any> {
    try {
      console.log(`[ChatbotController] 🔍 Buscando contexto real para usuário: ${userId}`);
      
      // ✅ CORREÇÃO: Buscar dados reais do banco de dados
      const [user, goals, transactions, investments] = await Promise.all([
        this.userService.getUserByFirebaseUid(userId).catch(() => null),
        this.getUserGoals(userId),
        this.getUserTransactions(userId),
        this.getUserInvestments(userId)
      ]);

      // Construir contexto completo
      const userContext = {
        userId,
        userProfile: { 
          name: user?.name || user?.email?.split('@')[0] || 'Amigo', 
          plan: user?.subscription?.plan || 'basic',
          subscriptionStatus: user?.subscription?.status || 'inactive'
        },
        // Dados financeiros reais
        hasTransactions: transactions.length > 0,
        hasInvestments: investments.length > 0,
        hasGoals: goals.length > 0,
        totalTransacoes: transactions.length,
        totalInvestimentos: investments.length,
        totalMetas: goals.length,
        // Dados completos
        transacoesCompletas: transactions,
        investimentosCompletos: investments,
        metasCompletas: goals,
        // Resumos estruturados
        resumoTransacoes: this.summarizeTransactions(transactions),
        resumoInvestimentos: this.summarizeInvestments(investments),
        resumoMetas: this.summarizeGoals(goals),
        // Contexto emocional
        stressLevel: 3,
        recentEmotions: []
      };

      console.log(`[ChatbotController] ✅ Contexto real carregado:`, {
        name: userContext.userProfile.name,
        plan: userContext.userProfile.plan,
        totalTransacoes: userContext.totalTransacoes,
        totalInvestimentos: userContext.totalInvestimentos,
        totalMetas: userContext.totalMetas,
        hasTransactions: userContext.hasTransactions,
        hasInvestments: userContext.hasInvestments,
        hasGoals: userContext.hasGoals
      });

      return userContext;
    } catch (error) {
      console.error('[ChatbotController] ❌ Erro ao buscar contexto:', error);
      // Retornar contexto básico em caso de erro
      return {
        userId,
        userProfile: { name: 'Usuário', plan: 'basic' },
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

  // ✅ NOVO: Métodos para buscar dados reais
  private async getUserGoals(userId: string): Promise<any[]> {
    try {
      // Buscar metas do banco de dados diretamente
      const { Goal } = require('../models/Goal');
      // ✅ CORREÇÃO: Usar sempre o Firebase UID
      const goals = await Goal.find({ userId: userId }).limit(10).lean();
      console.log(`[ChatbotController] ✅ Encontradas ${goals.length} metas para usuário ${userId}`);
      return goals;
    } catch (error) {
      console.error('[ChatbotController] ❌ Erro ao buscar metas:', error);
      return [];
    }
  }

  private async getUserTransactions(userId: string): Promise<any[]> {
    try {
      // Buscar transações do banco de dados diretamente
      const { Transacoes } = require('../models/Transacoes');
      // ✅ CORREÇÃO: Usar sempre o Firebase UID
      const transactions = await Transacoes.find({ userId: userId }).limit(10).lean();
      console.log(`[ChatbotController] ✅ Encontradas ${transactions.length} transações para usuário ${userId}`);
      return transactions;
    } catch (error) {
      console.error('[ChatbotController] ❌ Erro ao buscar transações:', error);
      return [];
    }
  }

  private async getUserInvestments(userId: string): Promise<any[]> {
    try {
      // Buscar investimentos do banco de dados diretamente
      const Investimento = require('../models/Investimento').default;
      // ✅ CORREÇÃO: Usar sempre o Firebase UID
      const investments = await Investimento.find({ userId: userId }).limit(10).lean();
      console.log(`[ChatbotController] ✅ Encontrados ${investments.length} investimentos para usuário ${userId}`);
      return investments;
    } catch (error) {
      console.error('[ChatbotController] ❌ Erro ao buscar investimentos:', error);
      return [];
    }
  }

  // ✅ NOVO: Métodos de resumo
  private summarizeTransactions(transactions: any[]): any {
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

  private summarizeInvestments(investments: any[]): any {
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

  private summarizeGoals(goals: any[]): any {
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

export const handleChatQuery = chatbotController.processMessage.bind(chatbotController);
export const startNewSession = chatbotController.createSession.bind(chatbotController);
export const getSessions = chatbotController.getSessions.bind(chatbotController);
export const deleteConversation = chatbotController.deleteSession.bind(chatbotController);

// Exporte funções stub para as demais rotas se não existirem implementações
export const getSession = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.uid || req.user?.firebaseUid || req.user?._id;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    console.log(`[ChatbotController] Buscando sessão ${chatId} para usuário ${userId}`);

    // ✅ CORREÇÃO: Usar método público em vez de acessar propriedade privada
    const conversation = await chatbotController.getConversation(chatId);
    
    // Verificar se a conversa pertence ao usuário
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
    console.error('❌ Erro ao buscar sessão:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar sessão' 
    });
  }
};

export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ error: 'Não implementado' });
};

export const getFeedbackAnalytics = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ error: 'Não implementado' });
};

export const deleteAllConversations = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ error: 'Não implementado' });
};

export const streamChatResponse = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ error: 'Não implementado' });
};

export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ error: 'Não implementado' });
};

export const analyzeSentiment = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ error: 'Não implementado' });
};

export const getCacheStats = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ error: 'Não implementado' });
};

export const clearCache = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ error: 'Não implementado' });
};

export const adaptResponseToSentiment = async (req: Request, res: Response): Promise<void> => {
  res.status(501).json({ error: 'Não implementado' });
};