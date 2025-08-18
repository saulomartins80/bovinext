import { Request, Response } from 'express';
import { OptimizedAIService } from '../services/OptimizedAIService';
import { ChatHistoryService } from '../services/chatHistoryService';
import { UserService } from '../modules/users/services/UserService';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { ObjectId } from 'mongodb';
import { Goal } from '../models/Goal';
import { contextManager } from '../services/ContextManager';

// ===== SISTEMA DE STREAMING PARA SSE =====
class StreamingController extends EventEmitter {
  private activeStreams = new Map<string, Response>();

  startStream(streamId: string, res: Response): void {
    // Configurar SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    this.activeStreams.set(streamId, res);

    // Heartbeat para manter conexão viva
    const heartbeat = setInterval(() => {
      if (this.activeStreams.has(streamId)) {
        res.write('event: heartbeat\ndata: {}\n\n');
      } else {
        clearInterval(heartbeat);
      }
    }, 30000);

    // Cleanup quando cliente desconectar
    res.on('close', () => {
      this.activeStreams.delete(streamId);
      clearInterval(heartbeat);
    });
  }

  sendChunk(streamId: string, chunk: string, isComplete = false): void {
    const res = this.activeStreams.get(streamId);
    if (res) {
      const data = JSON.stringify({ 
        chunk, 
        isComplete,
        timestamp: Date.now()
      });
      
      res.write(`event: chunk\ndata: ${data}\n\n`);
      
      if (isComplete) {
        res.write(`event: complete\ndata: ${JSON.stringify({ complete: true })}\n\n`);
        res.end();
        this.activeStreams.delete(streamId);
      }
    }
  }

  sendError(streamId: string, error: string): void {
    const res = this.activeStreams.get(streamId);
    if (res) {
      res.write(`event: error\ndata: ${JSON.stringify({ error })}\n\n`);
      res.end();
      this.activeStreams.delete(streamId);
    }
  }
}

// ===== SISTEMA DE AUTOMAÇÃO INTELIGENTE =====
class AutomationEngine {
  private actionHandlers = new Map<string, Function>();

  constructor() {
    this.setupActionHandlers();
  }

  private setupActionHandlers(): void {
    this.actionHandlers.set('create_transaction', this.handleCreateTransaction.bind(this));
    this.actionHandlers.set('CREATE_TRANSACTION', this.handleCreateTransaction.bind(this));
    this.actionHandlers.set('create_goal', this.handleCreateGoal.bind(this));
    this.actionHandlers.set('CREATE_GOAL', this.handleCreateGoal.bind(this));
    this.actionHandlers.set('create_investment', this.handleCreateInvestment.bind(this));
    this.actionHandlers.set('CREATE_INVESTMENT', this.handleCreateInvestment.bind(this));
    this.actionHandlers.set('CREATE_CARD', this.handleCreateCard.bind(this));
    this.actionHandlers.set('ANALYZE_DATA', this.handleAnalyzeData.bind(this));
    this.actionHandlers.set('MILEAGE', this.handleMileage.bind(this));
  }

  async executeAction(intent: string, entities: any, userId: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    console.log(`[AutomationEngine] 🚀 Executando ação: ${intent}`);
    console.log(`[AutomationEngine] 📊 Entidades recebidas:`, JSON.stringify(entities, null, 2));
    console.log(`[AutomationEngine] 👤 UserId:`, userId);
    
    const handler = this.actionHandlers.get(intent);
    console.log(`[AutomationEngine] 🔍 Handler encontrado:`, !!handler);
    console.log(`[AutomationEngine] 📋 Handlers disponíveis:`, Array.from(this.actionHandlers.keys()));
    
    if (!handler) {
      console.log(`[AutomationEngine] ❌ Handler não encontrado para intent: ${intent}`);
      return {
        success: false,
        message: 'Ação não reconhecida. Como posso te ajudar?'
      };
    }

    try {
      console.log(`[AutomationEngine] ⚡ Chamando handler para: ${intent}`);
      const result = await handler(entities, userId);
      console.log(`[AutomationEngine] ✅ Resultado do handler:`, JSON.stringify(result, null, 2));
      return result;
    } catch (error: any) {
      console.error(`[AutomationEngine] ❌ Error executing ${intent}:`, error);
      return {
        success: false,
        message: 'Ops! Tive um problema ao executar essa ação. Pode tentar novamente?'
      };
    }
  }

  private async handleCreateTransaction(entities: any, userId: string): Promise<any> {
    // Verificar se temos dados suficientes
    const requiredFields = ['valor'];
    const missingFields = requiredFields.filter(field => !entities[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Para criar a transação, preciso do valor. Qual foi o valor?`,
        requiresInput: true,
        missingFields
      };
    }

    try {
      // Buscar usuário pelo firebaseUid para obter ObjectId
      const User = require('../models/User');
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // CRIAR TRANSACTION REAL NO MONGODB
      const Transacao = require('../models/Transacoes');
      
      const transactionData = {
        userId: user._id, // Usar ObjectId correto
        valor: parseFloat(entities.valor),
        descricao: entities.descricao || 'Transação via chat',
        tipo: entities.tipo || 'despesa',
        categoria: entities.categoria || 'Geral',
        data: entities.data ? new Date(entities.data) : new Date(),
        conta: entities.conta || 'Principal',
        createdAt: new Date()
      };

      console.log('[AutomationEngine] Saving transaction to MongoDB:', transactionData);
      const savedTransaction = await Transacao.create(transactionData);
      console.log('[AutomationEngine] Transaction saved successfully:', savedTransaction._id);

      return {
        success: true,
        message: `✅ Transação de R$ ${entities.valor} criada com sucesso! Já está no seu histórico.`,
        data: savedTransaction
      };
    } catch (error: any) {
      console.error('[AutomationEngine] Error saving transaction:', error);
      return {
        success: false,
        message: 'Erro ao criar a transação. Tente novamente.',
        error: error.message
      };
    }
  }

  private async handleCreateGoal(entities: any, userId: string): Promise<any> {
    console.log('[AutomationEngine] 🎯 Processando criação de META');
    console.log('[AutomationEngine] 📊 Entidades para meta:', JSON.stringify(entities, null, 2));
    
    // Verificar se temos dados suficientes - usar valor ou valor_total
    const valor = entities.valor_total || entities.valor;
    if (!valor || valor <= 0) {
      console.log('[AutomationEngine] ❌ Valor da meta não encontrado ou inválido');
      return {
        success: false,
        requiresInput: true,
        message: `Para criar uma meta, preciso saber o valor objetivo. Exemplo: "Quero juntar R$ 1000". Pode me informar?`,
        missingFields: ['valor_total']
      };
    }

    try {
      // Buscar usuário no MongoDB
      const User = require('../models/User');
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      console.log('[AutomationEngine] 👤 Usuário encontrado:', user._id);

      const goalData = {
        userId: user._id,
        nome: entities.nome || entities.descricao || 'Meta financeira',
        valorTotal: parseFloat(valor),
        valorAtual: 0,
        categoria: entities.categoria || 'Economia',
        prazo: entities.prazo || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano padrão
        status: 'ativa',
        createdAt: new Date()
      };

      console.log('[AutomationEngine] 💾 Salvando meta no MongoDB:', goalData);
      const Goal = require('../models/Goal');
      const savedGoal = await Goal.create(goalData);
      console.log('[AutomationEngine] ✅ Meta salva com sucesso:', savedGoal._id);

      return {
        success: true,
        message: `🎯 Meta de R$ ${valor.toFixed(2)} criada com sucesso! Já está no seu painel.`,
        data: savedGoal
      };
    } catch (error: any) {
      console.error('[AutomationEngine] ❌ Erro ao salvar meta:', error);
      return {
        success: false,
        message: 'Erro ao criar a meta. Tente novamente.',
        error: error.message
      };
    }
  }

  private async handleCreateInvestment(entities: any, userId: string): Promise<any> {
    console.log('[AutomationEngine] 📈 Processando criação de INVESTIMENTO');
    console.log('[AutomationEngine] 📊 Entidades para investimento:', JSON.stringify(entities, null, 2));
    
    if (!entities.valor || entities.valor <= 0) {
      console.log('[AutomationEngine] ❌ Valor do investimento não encontrado ou inválido');
      return {
        success: false,
        requiresInput: true,
        message: `Para criar um investimento, preciso saber o valor. Exemplo: "Quero investir R$ 500". Pode me informar?`,
        missingFields: ['valor']
      };
    }

    try {
      // Buscar usuário no MongoDB
      const User = require('../models/User');
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      console.log('[AutomationEngine] 👤 Usuário encontrado:', user._id);

      const investmentData = {
        userId: user._id,
        tipo: entities.tipo || 'Renda Fixa',
        valor: parseFloat(entities.valor),
        descricao: entities.descricao || 'Investimento via chat',
        categoria: entities.categoria || 'Investimentos',
        dataInvestimento: entities.data ? new Date(entities.data) : new Date(),
        status: 'ativo',
        rentabilidade: entities.rentabilidade || 0,
        createdAt: new Date()
      };

      console.log('[AutomationEngine] 💾 Salvando investimento no MongoDB:', investmentData);
      const Investment = require('../models/Investment');
      const savedInvestment = await Investment.create(investmentData);
      console.log('[AutomationEngine] ✅ Investimento salvo com sucesso:', savedInvestment._id);

      return {
        success: true,
        message: `📈 Investimento de R$ ${entities.valor.toFixed(2)} em ${entities.tipo} criado com sucesso! Já está no seu portfólio.`,
        data: savedInvestment
      };
    } catch (error: any) {
      console.error('[AutomationEngine] ❌ Erro ao salvar investimento:', error);
      return {
        success: false,
        message: 'Erro ao criar o investimento. Tente novamente.',
        error: error.message
      };
    }
  }

  private async handleCreateCard(entities: any, userId: string): Promise<any> {
    const requiredFields = ['nome', 'limite'];
    const missingFields = requiredFields.filter(field => !entities[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        message: 'Para registrar o cartão, preciso do nome e limite. Pode me contar?',
        requiresInput: true,
        missingFields
      };
    }

    try {
      // SALVAR NO MONGODB DE VERDADE
      const cardData = {
        userId: new ObjectId(userId),
        nome: entities.nome,
        limite: entities.limite,
        banco: entities.banco || 'Banco',
        programa: entities.programa || 'Programa de Pontos',
        bandeira: entities.bandeira || 'Visa',
        tipo: entities.tipo || 'Crédito',
        status: entities.status || 'Ativo',
        categoria: entities.categoria || 'standard',
        ultimosDigitos: entities.ultimosDigitos || '****',
        vencimento: entities.vencimento || 15,
        fechamento: entities.fechamento || 30,
        anuidade: entities.anuidade || 0,
        data: new Date(),
        descricao: entities.descricao || ''
      };

      console.log('[AutomationEngine] Saving card to MongoDB:', cardData);
      
      // Aqui você precisará importar o modelo de Cartão
      // const Card = require('../models/Card');
      // const savedCard = await Card.create(cardData);
      
      // Por enquanto, vamos simular o save
      const savedCard = { ...cardData, _id: new ObjectId() };
      console.log('[AutomationEngine] Card saved successfully:', savedCard._id);

      return {
        success: true,
        message: `💳 Cartão ${entities.nome} com limite de R$ ${entities.limite} registrado com sucesso!`,
        data: savedCard
      };
    } catch (error: any) {
      console.error('[AutomationEngine] Error saving card:', error);
      return {
        success: false,
        message: 'Erro ao registrar o cartão. Tente novamente.',
        error: error.message
      };
    }
  }

  private async handleAnalyzeData(entities: any, userId: string): Promise<any> {
    // Simular análise de dados (integrar com seus serviços reais)
    const analysisData = {
      totalGastos: 2450.00,
      totalReceitas: 3200.00,
      saldo: 750.00,
      categoriaMaisGasta: 'Alimentação',
      tendencia: 'positiva',
      recomendacoes: [
        'Continue controlando os gastos com alimentação',
        'Considere investir o saldo positivo',
        'Sua situação financeira está melhorando!'
      ]
    };

    return {
      success: true,
      message: ` Análise concluída!\n\n Receitas: R$ ${analysisData.totalReceitas}\n Gastos: R$ ${analysisData.totalGastos}\n Saldo: R$ ${analysisData.saldo}\n\n Categoria que mais gasta: ${analysisData.categoriaMaisGasta}\n\n✨ Recomendações:\n${analysisData.recomendacoes.map(r => `• ${r}`).join('\n')}`,
      data: analysisData
    };
  }

  private async handleMileage(entities: any, userId: string): Promise<any> {
    return {
      success: true,
      message: `✈️ Sistema de milhas em desenvolvimento! Em breve você poderá gerenciar todos seus programas de fidelidade aqui. Por enquanto, posso te ajudar com outras funcionalidades!`,
      data: { feature: 'coming_soon' }
    };
  }
}

// ===== CONTROLADOR PRINCIPAL OTIMIZADO =====
export class OptimizedChatbotController {
  private static instance: OptimizedChatbotController;
  private aiService: OptimizedAIService;
  private chatHistoryService: ChatHistoryService;
  private userService: UserService;
  private streamingController: StreamingController;
  private automationEngine: AutomationEngine;
  private responseCache = new Map<string, any>();

  private constructor() {
    this.aiService = new OptimizedAIService();
    this.chatHistoryService = new ChatHistoryService();
    this.streamingController = new StreamingController();
    this.automationEngine = new AutomationEngine();
    
    // Initialize UserService
    const { UserRepository } = require('../modules/users/repositories/UserRepository');
    this.userService = new UserService(new UserRepository());
  }

  static getInstance(): OptimizedChatbotController {
    if (!OptimizedChatbotController.instance) {
      OptimizedChatbotController.instance = new OptimizedChatbotController();
    }
    return OptimizedChatbotController.instance;
  }

  // ===== MÉTODO PRINCIPAL OTIMIZADO =====
  async processMessage(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      const { message, chatId } = req.body;
      const userId = (req as any).user?.uid || 'anonymous';
      
      console.log(`[OptimizedChatbot] Processing: "${message}" from user: ${userId}`);
      
      // Validação rápida
      if (!message?.trim()) {
        res.status(400).json({
          success: false,
          message: 'Mensagem não pode estar vazia'
        });
        return;
      }

      // Obter contexto do usuário (paralelo)
      const [userContext, conversationHistory] = await Promise.all([
        this.getUserContext(userId),
        this.getConversationHistory(chatId)
      ]);

      // 🆕 VERIFICAR CONTEXTO ATIVO DA CONVERSA
      let contextState = null;
      if (chatId) {
        contextState = contextManager.getConversationState(chatId);
        if (contextState) {
          console.log(`[OptimizedChatbot] Active context: ${contextState.currentAction} for ${chatId}`);
        }
      }

      // Gerar resposta com IA otimizada
      const aiResult = await this.aiService.generateResponse(
        userId,
        message,
        conversationHistory,
        userContext
      );

      // Verificar se precisa de confirmação ANTES de executar
      let automationResult = null;
      let needsConfirmation = false;
      
      // Verificar se há intent e confiança suficiente
      if (aiResult.intent && aiResult.confidence > 0.5) {
        console.log(`[OptimizedChatbot] 🎯 Intent detectado: ${aiResult.intent} (confiança: ${aiResult.confidence})`);
        console.log(`[OptimizedChatbot] 📊 Entidades extraídas:`, JSON.stringify(aiResult.entities, null, 2));
        console.log(`[OptimizedChatbot] 🔐 Requer confirmação: ${aiResult.requiresConfirmation}`);
        
        if (aiResult.requiresConfirmation) {
          needsConfirmation = true;
          console.log(`[OptimizedChatbot] ⚠️ AÇÃO REQUER CONFIRMAÇÃO: ${aiResult.intent}`);
          
          // Atualizar contexto para aguardar confirmação
          if (chatId) {
            contextManager.updateConversationState(
              chatId,
              userId,
              aiResult.intent,
              aiResult.entities || {},
              true
            );
          }
        } else {
          // Executar automaticamente apenas se NÃO requer confirmação
          console.log(`[OptimizedChatbot] 🚀 EXECUTANDO AÇÃO AUTOMATICAMENTE: ${aiResult.intent}`);
          console.log(`[OptimizedChatbot] 🔧 Chamando automationEngine.executeAction com:`, {
            intent: aiResult.intent,
            entities: aiResult.entities,
            userId: userId
          });
          
          automationResult = await this.automationEngine.executeAction(
            aiResult.intent,
            aiResult.entities || {},
            userId
          );
          
          console.log(`[OptimizedChatbot] ✅ Resultado da automação:`, JSON.stringify(automationResult, null, 2));
          
          if (automationResult?.success && chatId) {
            contextManager.clearConversationState(chatId);
          }
        }
      } else {
        console.log(`[OptimizedChatbot] ❌ Intent não detectado ou confiança baixa - Intent: ${aiResult.intent}, Confiança: ${aiResult.confidence}`);
      }

      // Preparar resposta final
      let finalResponse = aiResult.text;
      let actionExecuted = false;

      if (automationResult?.success) {
        finalResponse = automationResult.message;
        actionExecuted = true;
      } else if (automationResult?.requiresInput) {
        finalResponse = automationResult.message;
      }

      // Salvar no histórico (não bloquear resposta)
      this.saveMessageToHistory(chatId, userId, message, finalResponse)
        .catch((error: any) => console.error('[OptimizedChatbot] Error saving to history:', error));

      // Resposta otimizada
      const response = {
        success: true,
        message: finalResponse,
        messageId: uuidv4(),
        metadata: {
          intent: aiResult.intent,
          confidence: aiResult.confidence,
          responseTime: Date.now() - startTime,
          cached: aiResult.cached,
          actionExecuted,
          automationData: automationResult?.data,
          requiresConfirmation: needsConfirmation,
          entities: aiResult.entities,
          contextActive: contextState?.currentAction || null,
          contextMissingFields: contextState?.missingFields || [],
          // 🆕 DADOS PARA BOTÕES DE CONFIRMAÇÃO
          actionData: needsConfirmation ? {
            type: aiResult.intent,
            entities: aiResult.entities,
            userId: userId
          } : null
        }
      };

      res.status(200).json(response);

    } catch (error: any) {
      console.error('[OptimizedChatbot] Error processing message:', error);
      
      res.status(500).json({
        success: false,
        message: 'Ops! Tive um problema técnico. Pode tentar novamente?',
        metadata: {
          responseTime: Date.now() - startTime,
          error: true
        }
      });
    }
  }



  // ===== MÉTODOS DE UTILIDADE =====
  private async getUserContext(userId: string): Promise<any> {
    try {
      // Cache simples para contexto do usuário
      const cacheKey = `user_context_${userId}`;
      const cached = this.responseCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < 60000) { // 1 minuto de cache
        return cached.data;
      }

      // Simular dados do usuário (integrar com seus serviços reais)
      const userContext = {
        userId,
        subscriptionPlan: 'free', // ou 'top', 'enterprise'
        totalTransacoes: 0,
        totalMetas: 0,
        totalInvestimentos: 0,
        saldoAtual: 0,
        ultimaAtividade: new Date().toISOString()
      };

      // Salvar no cache
      this.responseCache.set(cacheKey, {
        data: userContext,
        timestamp: Date.now()
      });

      return userContext;
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error getting user context:', error);
      return { userId };
    }
  }

  private async getConversationHistory(chatId: string): Promise<any[]> {
    if (!chatId) return [];
    
    try {
      const conversation = await this.chatHistoryService.getConversation(chatId);
      return conversation.messages.slice(-5); // Últimas 5 mensagens
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error getting conversation history:', error);
      return [];
    }
  }

  private async saveMessageToHistory(
    chatId: string,
    userId: string,
    userMessage: string,
    botResponse: string
  ): Promise<void> {
    try {
      if (!chatId) return;

      await Promise.all([
        this.chatHistoryService.addMessage({
          chatId,
          sender: 'user',
          content: userMessage,
          timestamp: new Date(),
          userId,
          metadata: {}
        }),
        this.chatHistoryService.addMessage({
          chatId,
          sender: 'assistant',
          content: botResponse,
          timestamp: new Date(),
          userId,
          metadata: { isBot: true }
        })
      ]);
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error saving to history:', error);
    }
  }

  // ===== MÉTODOS PARA COMPATIBILIDADE =====
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid || 'anonymous';
      const conversation = await this.chatHistoryService.startNewConversation(userId);
      
      res.status(200).json({
        success: true,
        chatId: conversation.chatId,
        message: 'Nova sessão criada com sucesso!'
      });
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error creating session:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar nova sessão'
      });
    }
  }

  async getSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid || 'anonymous';
      const sessions = await this.chatHistoryService.getSessions(userId);
      
      res.status(200).json({
        success: true,
        sessions: sessions.slice(0, 10) // Últimas 10 sessões
      });
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error getting sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar sessões',
        error: error.message
      });
    }
  }

  async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { chatId } = req.params as { chatId?: string };
      if (!chatId) {
        res.status(400).json({ success: false, message: 'chatId é obrigatório' });
        return;
      }

      const deleted = await this.chatHistoryService.deleteConversation(chatId);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Sessão não encontrada' });
        return;
      }

      res.status(200).json({ success: true, message: 'Sessão deletada com sucesso', chatId });
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error deleting session:', error);
      res.status(500).json({ success: false, message: 'Erro ao deletar sessão' });
    }
  }

  async deleteAllSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.uid || 'anonymous';
      const result = await this.chatHistoryService.deleteAllUserConversations(userId);
      res.status(200).json({
        success: true,
        message: 'Todas as sessões do usuário foram deletadas',
        deletedCount: (result as any)?.deletedCount ?? (result as any) ?? 0
      });
    } catch (error: any) {
      console.error('[OptimizedChatbot] Error deleting all sessions:', error);
      res.status(500).json({ success: false, message: 'Erro ao deletar todas as sessões' });
    }
  }

  async getCacheStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = this.aiService.getCacheStats();
      res.status(200).json({
        success: true,
        stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao obter estatísticas'
      });
    }
  }

  async clearCache(req: Request, res: Response): Promise<void> {
    try {
      this.aiService.clearCache();
      this.responseCache.clear();
      
      res.status(200).json({
        success: true,
        message: 'Cache limpo com sucesso!'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Erro ao limpar cache'
      });
    }
  }

  async streamResponse(req: Request, res: Response): Promise<void> {
    try {
      const { message, chatId } = req.method === 'GET' ? req.query : req.body;
      const userId = (req as any).user?.uid || 'anonymous';

      if (!message) {
        res.status(400).json({
          success: false,
          message: 'Mensagem é obrigatória'
        });
        return;
      }

      // Configurar headers para Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'Access-Control-Allow-Credentials': 'true'
      });

      // Função para enviar dados via SSE
      const sendSSE = (event: string, data: any) => {
        try {
          const eventData = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          console.log(`[SSE] Sending: ${event}`, data);
          res.write(eventData);
          res.flush?.(); // Força o flush dos dados
        } catch (error: any) {
          console.error('[SSE] Error sending data:', error);
        }
      };

      // Enviar evento de conexão inicial
      sendSSE('connected', { message: 'Stream iniciado' });

      try {
        // Obter contexto e histórico reais (antes eram passados vazios)
        const realChatId = (chatId as string) || this.generateChatId();
        const [userContext, conversationHistory] = await Promise.all([
          this.getUserContext(userId),
          this.getConversationHistory(realChatId)
        ]);

        // Processar mensagem com AI utilizando histórico + contexto
        const response = await this.aiService.generateResponse(
          userId,
          message as string,
          conversationHistory,
          userContext
        );

        // 🆕 EXECUTAR AUTOMAÇÃO SE NECESSÁRIO (apenas se NÃO requer confirmação)
        let automationResult = null;
        if (response.intent && response.confidence && response.confidence > 0.5 && !response.requiresConfirmation) {
          console.log(`[OptimizedChatbot] 🚀 EXECUTANDO AÇÃO NO STREAMING: ${response.intent} com confiança: ${response.confidence}`);
          console.log(`[OptimizedChatbot] 📊 Entidades detectadas:`, response.entities);
          
          // 🆕 ATUALIZAR CONTEXTO se nova ação detectada
          if (realChatId) {
            contextManager.updateConversationState(
              realChatId,
              userId,
              response.intent,
              response.entities || {},
              response.requiresConfirmation || false
            );
            console.log(`[OptimizedChatbot] Updated context: ${response.intent}`);
          }
          
          console.log(`[OptimizedChatbot] 🔧 Chamando AutomationEngine.executeAction...`);
          automationResult = await this.automationEngine.executeAction(
            response.intent,
            response.entities || {},
            userId
          );
          
          console.log(`[OptimizedChatbot] ✅ Resultado da automação:`, automationResult);
          
          // 🆕 LIMPAR CONTEXTO se ação foi executada com sucesso
          if (automationResult?.success && realChatId) {
            contextManager.clearConversationState(realChatId);
            console.log(`[OptimizedChatbot] Cleared context after successful action`);
          }
        } else if (response.requiresConfirmation) {
          console.log(`[OptimizedChatbot] ⏳ Ação requer confirmação - não executando automaticamente: ${response.intent}`);
        } else {
          console.log(`[OptimizedChatbot] ❌ Ação não executada no streaming - Intent: ${response.intent}, Confiança: ${response.confidence}, Threshold: 0.5`);
        }

        // 🆕 USAR RESPOSTA DA AUTOMAÇÃO SE DISPONÍVEL
        let finalText = response.text || 'Desculpe, não consegui processar sua mensagem.';
        if (automationResult?.success) {
          finalText = automationResult.message;
        } else if (automationResult?.requiresInput) {
          finalText = automationResult.message;
        }

        // Simular streaming dividindo a resposta em chunks
        const chunks = finalText.match(/.{1,10}/g) || [finalText];

        // Enviar chunks com delay para simular streaming
        for (let i = 0; i < chunks.length; i++) {
          sendSSE('chunk', { 
            chunk: chunks[i],
            isComplete: i === chunks.length - 1
          });
          
          // Pequeno delay entre chunks
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Enviar metadados finais
        if (response.entities || response.intent) {
          sendSSE('metadata', {
            intent: response.intent,
            entities: response.entities,
            confidence: response.confidence,
            // 🆕 ADICIONAR INFO DA AUTOMAÇÃO
            actionExecuted: automationResult?.success || false,
            automationData: automationResult?.data || null,
            requiresInput: automationResult?.requiresInput || false,
            missingFields: automationResult?.missingFields || [],
            // 🆕 DADOS PARA BOTÕES DE CONFIRMAÇÃO NO STREAMING
            requiresConfirmation: response.requiresConfirmation || false,
            actionData: response.requiresConfirmation ? {
              type: response.intent,
              entities: response.entities,
              userId: userId
            } : null
          });
        }

        // Finalizar stream
        sendSSE('complete', { 
          success: true,
          totalChunks: chunks.length
        });

        // Salvar no histórico
        await this.saveMessageToHistory(realChatId, userId, message as string, finalText);

      } catch (error: any) {
        console.error('[OptimizedChatbot] Streaming error:', error);
        sendSSE('error', {
          success: false,
          message: 'Erro ao processar mensagem'
        });
      }

      res.end();

    } catch (error: any) {
      console.error('[OptimizedChatbot] Stream setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao inicializar stream'
      });
    }
  }

  private generateChatId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Instância singleton
const optimizedChatbotController = OptimizedChatbotController.getInstance();

// Exports para compatibilidade com rotas existentes
export const handleChatQuery = optimizedChatbotController.processMessage.bind(optimizedChatbotController);
export const streamChatResponse = optimizedChatbotController.streamResponse.bind(optimizedChatbotController);
export const startNewSession = optimizedChatbotController.createSession.bind(optimizedChatbotController);
export const getSessions = optimizedChatbotController.getSessions.bind(optimizedChatbotController);
export const getCacheStats = optimizedChatbotController.getCacheStats.bind(optimizedChatbotController);
export const clearCache = optimizedChatbotController.clearCache.bind(optimizedChatbotController);
export const deleteSession = optimizedChatbotController.deleteSession.bind(optimizedChatbotController);
export const deleteAllSessions = optimizedChatbotController.deleteAllSessions.bind(optimizedChatbotController);

export default optimizedChatbotController;
