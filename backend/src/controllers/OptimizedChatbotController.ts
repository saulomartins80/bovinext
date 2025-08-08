import { Request, Response } from 'express';
import { OptimizedAIService } from '../services/OptimizedAIService';
import { ChatHistoryService } from '../services/chatHistoryService';
import { UserService } from '../modules/users/services/UserService';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

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
    this.actionHandlers.set('CREATE_TRANSACTION', this.handleCreateTransaction.bind(this));
    this.actionHandlers.set('CREATE_GOAL', this.handleCreateGoal.bind(this));
    this.actionHandlers.set('CREATE_INVESTMENT', this.handleCreateInvestment.bind(this));
    this.actionHandlers.set('ANALYZE_DATA', this.handleAnalyzeData.bind(this));
    this.actionHandlers.set('MILEAGE', this.handleMileage.bind(this));
  }

  async executeAction(intent: string, entities: any, userId: string): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    const handler = this.actionHandlers.get(intent);
    
    if (!handler) {
      return {
        success: false,
        message: 'Ação não reconhecida. Como posso te ajudar?'
      };
    }

    try {
      return await handler(entities, userId);
    } catch (error) {
      console.error(`[AutomationEngine] Error executing ${intent}:`, error);
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

    // Simular criação da transação (integrar com seu sistema real)
    const transactionData = {
      id: uuidv4(),
      userId,
      valor: entities.valor,
      descricao: entities.descricao || 'Transação via chat',
      tipo: entities.tipo || 'despesa',
      categoria: entities.categoria || 'outros',
      data: entities.data || new Date().toISOString()
    };

    // Aqui você integraria com seu serviço de transações real
    console.log('[AutomationEngine] Creating transaction:', transactionData);

    return {
      success: true,
      message: `✅ Transação de R$ ${entities.valor} criada com sucesso! Já está no seu histórico.`,
      data: transactionData
    };
  }

  private async handleCreateGoal(entities: any, userId: string): Promise<any> {
    const requiredFields = ['valor_total', 'meta'];
    const missingFields = requiredFields.filter(field => !entities[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        message: 'Para criar a meta, preciso saber o valor total e o objetivo. Pode me contar mais?',
        requiresInput: true,
        missingFields
      };
    }

    const goalData = {
      id: uuidv4(),
      userId,
      meta: entities.meta,
      valor_total: entities.valor_total,
      valor_atual: 0,
      data_conclusao: entities.data_conclusao || null,
      criado_em: new Date().toISOString()
    };

    console.log('[AutomationEngine] Creating goal:', goalData);

    return {
      success: true,
      message: `🎯 Meta "${entities.meta}" de R$ ${entities.valor_total} criada! Vamos alcançá-la juntos!`,
      data: goalData
    };
  }

  private async handleCreateInvestment(entities: any, userId: string): Promise<any> {
    const requiredFields = ['valor', 'nome'];
    const missingFields = requiredFields.filter(field => !entities[field]);

    if (missingFields.length > 0) {
      return {
        success: false,
        message: 'Para registrar o investimento, preciso do valor e onde você aplicou. Pode me contar?',
        requiresInput: true,
        missingFields
      };
    }

    const investmentData = {
      id: uuidv4(),
      userId,
      valor: entities.valor,
      nome: entities.nome,
      instituicao: entities.instituicao || 'Não informado',
      tipo: entities.tipo || 'outros',
      data: new Date().toISOString()
    };

    console.log('[AutomationEngine] Creating investment:', investmentData);

    return {
      success: true,
      message: `📈 Investimento de R$ ${entities.valor} em ${entities.nome} registrado! Que seus lucros sejam grandes!`,
      data: investmentData
    };
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
      message: `📊 Análise concluída!\n\n💰 Receitas: R$ ${analysisData.totalReceitas}\n💸 Gastos: R$ ${analysisData.totalGastos}\n📈 Saldo: R$ ${analysisData.saldo}\n\n🎯 Categoria que mais gasta: ${analysisData.categoriaMaisGasta}\n\n✨ Recomendações:\n${analysisData.recomendacoes.map(r => `• ${r}`).join('\n')}`,
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

      // Gerar resposta com IA otimizada
      const aiResult = await this.aiService.generateResponse(
        userId,
        message,
        conversationHistory,
        userContext
      );

      // Executar automação se necessário
      let automationResult = null;
      if (aiResult.intent && aiResult.confidence && aiResult.confidence > 0.7) {
        automationResult = await this.automationEngine.executeAction(
          aiResult.intent,
          aiResult.entities || {},
          userId
        );
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
        .catch(error => console.error('[OptimizedChatbot] Error saving to history:', error));

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
          requiresConfirmation: aiResult.requiresConfirmation,
          entities: aiResult.entities
        }
      };

      res.status(200).json(response);

    } catch (error) {
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
    } catch (error) {
      console.error('[OptimizedChatbot] Error getting user context:', error);
      return { userId };
    }
  }

  private async getConversationHistory(chatId: string): Promise<any[]> {
    if (!chatId) return [];
    
    try {
      const conversation = await this.chatHistoryService.getConversation(chatId);
      return conversation.messages.slice(-5); // Últimas 5 mensagens
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error('[OptimizedChatbot] Error getting sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar sessões',
        sessions: []
      });
    }
  }

  async getCacheStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = this.aiService.getCacheStats();
      res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
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
    } catch (error) {
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
        } catch (error) {
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

        // Simular streaming dividindo a resposta em chunks
        const text = response.text || 'Desculpe, não consegui processar sua mensagem.';
        const chunks = text.match(/.{1,10}/g) || [text];

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
            confidence: response.confidence
          });
        }

        // Finalizar stream
        sendSSE('complete', { 
          success: true,
          totalChunks: chunks.length
        });

        // Salvar no histórico
        await this.saveMessageToHistory(realChatId, userId, message as string, text);

      } catch (error) {
        console.error('[OptimizedChatbot] Streaming error:', error);
        sendSSE('error', {
          success: false,
          message: 'Erro ao processar mensagem'
        });
      }

      res.end();

    } catch (error) {
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

export default optimizedChatbotController;
