// backend/src/controllers/chatbotController.ts
import { Request, Response, NextFunction } from 'express';
import { container } from '../core/container';
import { TYPES } from '../core/types';
import { AppError } from '@core/errors/AppError';
import { UserService } from '../modules/users/services/UserService';
import AIService from '../services/aiService';
import { ChatHistoryService } from '../services/chatHistoryService';
import cacheService from '../services/cacheService';
import suggestionService from '../services/suggestionService';
import sentimentService from '../services/sentimentService';
import { IUser } from '../types/user';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { Transacoes } from '../models/Transacoes';
import Investimento from '../models/Investimento';
import { Goal } from '../models/Goal';
import { PassThrough } from 'stream';
import { ChatMessage, ChatMessageMetadata } from '../types/chat';
import OpenAI from 'openai';

// ✅ IMPORTAR FUNÇÕES DO AUTOMATED ACTIONS CONTROLLER
// import { 
//   detectUserIntent,
//   createTransaction,
//   createInvestment,
//   createGoal,
//   analyzeData,
//   generateReport
// } from './automatedActionsController';

const userService = container.get<UserService>(TYPES.UserService);
const chatHistoryService = new ChatHistoryService();
const aiService = new AIService();

// ✅ CORREÇÃO: Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
  timeout: 10000,
});

// Função para verificar se os dados estão completos para execução automática
function hasCompleteData(action: any): boolean {
  console.log('[hasCompleteData] Checking action:', action);
  
  switch (action.type) {
    case 'CREATE_TRANSACTION':
      // Remover verificação de tipo - pode ser inferido automaticamente
      const hasTransactionData = !!(action.payload.valor && action.payload.descricao);
      console.log('[hasCompleteData] CREATE_TRANSACTION check:', {
        valor: action.payload.valor,
        descricao: action.payload.descricao,
        tipo: action.payload.tipo,
        hasData: hasTransactionData
      });
      return hasTransactionData;
    case 'CREATE_INVESTMENT':
      const hasInvestmentData = !!(action.payload.valor && action.payload.nome);
      console.log('[hasCompleteData] CREATE_INVESTMENT check:', {
        valor: action.payload.valor,
        nome: action.payload.nome,
        tipo: action.payload.tipo,
        hasData: hasInvestmentData
      });
      return hasInvestmentData;
    case 'CREATE_GOAL':
      const hasGoalData = !!(action.payload.valor_total && action.payload.meta);
      console.log('[hasCompleteData] CREATE_GOAL check:', {
        valor_total: action.payload.valor_total,
        meta: action.payload.meta,
        hasData: hasGoalData
      });
      return hasGoalData;
    case 'ANALYZE_DATA':
    case 'GENERATE_REPORT':
      return true;
    default:
      return false;
  }
}

// Função para gerar perguntas mais naturais para ações
function generateQuestionForAction(action: any): string {
  switch (action.type) {
    case 'CREATE_TRANSACTION':
      if (!action.payload.valor) {
        return 'Perfeito! Qual foi o valor dessa transação?';
      }
      if (!action.payload.descricao) {
        return 'Entendi! O que foi essa transação? (ex: mercado, combustível, salário)';
      }
      if (!action.payload.tipo) {
        return 'É uma receita ou despesa?';
      }
      if (!action.payload.categoria) {
        return 'Qual categoria? (ex: alimentação, transporte, trabalho)';
      }
      return 'Quer que eu registre essa transação agora?';
      
    case 'CREATE_INVESTMENT':
      if (!action.payload.valor) {
        return 'Ótimo! Qual valor você investiu?';
      }
      if (!action.payload.nome) {
        return 'Qual o nome do investimento? (ex: Petrobras, Tesouro Direto)';
      }
      if (!action.payload.tipo) {
        return 'Qual tipo de investimento? (ex: ações, renda fixa, criptomoedas)';
      }
      return 'Quer que eu registre esse investimento agora?';
      
    case 'CREATE_GOAL':
      if (!action.payload.valor_total) {
        return 'Que legal! Qual valor você quer juntar?';
      }
      if (!action.payload.meta) {
        return 'Para qual objetivo? (ex: viagem, carro, casa)';
      }
      return 'Quer que eu crie essa meta agora?';
      
    default:
      return 'Posso te ajudar com isso! Pode me dar mais detalhes?';
  }
}

export const handleChatQuery = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    const { message, chatId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!message || !chatId) {
      return res.status(400).json({ success: false, message: 'message and chatId are required' });
    }

    const startTime = Date.now();
    console.log(`[ChatbotController] Processando mensagem para usuário ${userId}, chatId: ${chatId}`);

    // ✅ OTIMIZAÇÃO: Buscar tudo em paralelo para melhorar performance
    const [conversationHistory, user] = await Promise.all([
      chatHistoryService.getConversation(chatId).catch(() => chatHistoryService.startNewConversation(userId)),
      User.findOne({ firebaseUid: userId })
    ]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // ✅ OTIMIZAÇÃO CRÍTICA: Buscar dados financeiros apenas se necessário
    const messageLower = message.toLowerCase();
    const needsFinancialData = messageLower.includes('transação') || 
                               messageLower.includes('investimento') || 
                               messageLower.includes('meta') || 
                               messageLower.includes('gasto') ||
                               messageLower.includes('receita');

    let transacoes = [], investimentos = [], metas = [];
    
    if (needsFinancialData) {
      [transacoes, investimentos, metas] = await Promise.all([
        Transacoes.find({ userId: user._id.toString() }).limit(20).lean(),
        Investimento.find({ userId: user._id.toString() }).limit(20).lean(),
        Goal.find({ userId: user._id.toString() }).limit(20).lean()
      ]);
      console.log(`[ChatbotController] Dados encontrados: ${transacoes.length} transações, ${investimentos.length} investimentos, ${metas.length} metas`);
    }

    // ✅ OTIMIZAÇÃO: Adicionar mensagem do usuário ANTES de processar
    const userMessageId = `${conversationHistory.chatId}_user_${Date.now()}`;
    await chatHistoryService.addMessage({
      chatId: conversationHistory.chatId,
      userId: userId,
      sender: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {
        messageType: 'basic',
        isImportant: false,
        messageId: userMessageId
      }
    });

    const subscriptionStatus = user.subscription?.status;
    const subscriptionPlan = user.subscription?.plan;
    
    // Verificar se é premium - incluir diferentes variações do nome do plano
    const isPremium = subscriptionStatus === 'active' && (
      subscriptionPlan === 'top' || 
      subscriptionPlan === 'Plano Top' || 
      subscriptionPlan === 'Top-anual' ||
      subscriptionPlan === 'Plano Top Anual' ||
      subscriptionPlan === 'premium' || 
      subscriptionPlan === 'Premium' ||
      subscriptionPlan === 'enterprise' ||
      subscriptionPlan === 'Enterprise'
    );

    console.log('Chatbot - Status da assinatura:', {
      status: subscriptionStatus,
      plan: subscriptionPlan,
      isPremium: isPremium
    });

    // ✅ OTIMIZAÇÃO: Preparar dados do usuário de forma mais eficiente
    const userRealData = {
      name: user.name || 'Usuário',
      email: user.email || '',
      subscriptionPlan: subscriptionPlan || 'Gratuito',
      subscriptionStatus: subscriptionStatus || 'inactive',
      isPremium: isPremium,
      totalTransacoes: transacoes.length,
      totalInvestimentos: investimentos.length,
      totalMetas: metas.length,
      hasTransactions: transacoes.length > 0,
      hasInvestments: investimentos.length > 0,
      hasGoals: metas.length > 0,
      transacoes: transacoes,
      investimentos: investimentos,
      metas: metas
    };

    console.log('[ChatbotController] Dados reais do usuário:', {
      name: userRealData.name,
      subscriptionPlan: userRealData.subscriptionPlan,
      subscriptionStatus: userRealData.subscriptionStatus,
      isPremium: userRealData.isPremium,
      totalTransacoes: userRealData.totalTransacoes,
      totalInvestimentos: userRealData.totalInvestimentos,
      totalMetas: userRealData.totalMetas,
      hasTransactions: userRealData.hasTransactions,
      hasInvestments: userRealData.hasInvestments,
      hasGoals: userRealData.hasGoals
    });

    let response;
    const processingStartTime = Date.now();

    try {
      // ✅ OTIMIZAÇÃO: Buscar histórico completo da conversa apenas uma vez
      const fullConversationHistory = await chatHistoryService.getConversation(conversationHistory.chatId);
      console.log(`[ChatbotController] Histórico completo: ${fullConversationHistory.messages.length} mensagens`);

      // ✅ OTIMIZAÇÃO: Usar histórico completo para contexto
      const userContext = {
        name: userRealData.name,
        email: userRealData.email,
        subscriptionPlan: userRealData.subscriptionPlan,
        subscriptionStatus: userRealData.subscriptionStatus,
        hasTransactions: userRealData.hasTransactions,
        hasInvestments: userRealData.hasInvestments,
        hasGoals: userRealData.hasGoals,
        totalTransacoes: userRealData.totalTransacoes,
        totalInvestimentos: userRealData.totalInvestimentos,
        totalMetas: userRealData.totalMetas,
        transacoes: transacoes,
        investimentos: investimentos,
        metas: metas,
        conversationHistory: fullConversationHistory.messages
      };

      // ✅ OTIMIZAÇÃO: Importar função de detecção de ações apenas quando necessário
      const { detectUserIntent } = require('./automatedActionsController');
      const detectedAction = await detectUserIntent(message, userContext, fullConversationHistory.messages);
      
      if (detectedAction && detectedAction.confidence && detectedAction.confidence > 0.7) {
        console.log('[ChatbotController] Action detected with confidence:', detectedAction.confidence);
        console.log('[ChatbotController] Action details:', {
          type: detectedAction.type,
          payload: detectedAction.payload,
          confidence: detectedAction.confidence
        });
        
        // ✅ CORREÇÃO: Executar automaticamente se confiança é alta e dados estão completos
        const hasComplete = hasCompleteData(detectedAction);
        console.log('[ChatbotController] Has complete data:', hasComplete);
        
        if (detectedAction.confidence > 0.85 && hasComplete) {
          console.log('[ChatbotController] Executing action automatically...');
          try {
            let result;
            switch (detectedAction.type) {
              case 'CREATE_TRANSACTION':
                console.log('[ChatbotController] Creating transaction with payload:', detectedAction.payload);
                result = await createTransaction(userId, detectedAction.payload);
                console.log('[ChatbotController] Transaction created successfully:', result);
                break;
              case 'CREATE_INVESTMENT':
                console.log('[ChatbotController] Creating investment with payload:', detectedAction.payload);
                result = await createInvestment(userId, detectedAction.payload);
                console.log('[ChatbotController] Investment created successfully:', result);
                break;
              case 'CREATE_GOAL':
                console.log('[ChatbotController] Creating goal with payload:', detectedAction.payload);
                result = await createGoal(userId, detectedAction.payload);
                console.log('[ChatbotController] Goal created successfully:', result);
                break;
              case 'ANALYZE_DATA':
                result = await analyzeData(userId, detectedAction.payload);
                break;
              case 'GENERATE_REPORT':
                result = await generateReport(userId, detectedAction.payload);
                break;
              default:
                throw new Error('Ação não suportada');
            }

            console.log('[ChatbotController] Action executed successfully, returning response...');
            // ✅ CORREÇÃO: Adicionar resposta de sucesso ao histórico
            const successMessageId = `${conversationHistory.chatId}_success_${Date.now()}`;
            await chatHistoryService.addMessage({
              chatId: conversationHistory.chatId,
              userId: userId,
              sender: 'assistant',
              content: `✅ ${detectedAction.successMessage}`,
              metadata: {
                messageType: 'premium',
                isImportant: true,
                messageId: successMessageId,
                actionExecuted: true,
                actionType: detectedAction.type,
                result: result
              },
              timestamp: new Date()
            });

            return res.status(200).json({
              success: true,
              type: 'ACTION_DETECTED',
              message: detectedAction.successMessage,
              metadata: {
                chatId: conversationHistory.chatId,
                messageId: successMessageId,
                isPremium,
                actionExecuted: true,
                actionType: detectedAction.type
              },
              automatedAction: {
                ...detectedAction,
                executed: true,
                result: result
              }
            });
          } catch (actionError) {
            console.error('[ChatbotController] Error executing action:', actionError);
            // Se falhar, continuar para confirmação manual
          }
        } else {
          // ✅ CORREÇÃO: Pedir mais detalhes de forma mais natural
          const questionMessage = generateQuestionForAction(detectedAction);
          
          const questionMessageId = `${conversationHistory.chatId}_question_${Date.now()}`;
          await chatHistoryService.addMessage({
            chatId: conversationHistory.chatId,
            userId: userId,
            sender: 'assistant',
            content: questionMessage,
            metadata: {
              messageType: 'premium',
              isImportant: true,
              messageId: questionMessageId,
              action: detectedAction,
              requiresConfirmation: true
            },
            timestamp: new Date()
          });

          return res.status(200).json({
            success: true,
            type: 'ACTION_DETECTED',
            message: questionMessage,
            metadata: {
              chatId: conversationHistory.chatId,
              messageId: questionMessageId,
              isPremium,
              actionDetected: true,
              actionType: detectedAction.type
            },
            automatedAction: {
              ...detectedAction,
              executed: false,
              requiresConfirmation: true
            }
          });
        }
      }

      // ✅ OTIMIZAÇÃO CRÍTICA: Gerar resposta simplificada
      let finalResponse;
      if (detectedAction && detectedAction.confidence && detectedAction.confidence > 0.5) {
        // Usar resposta da detecção de ações
        finalResponse = {
          text: detectedAction.response || 'Olá! Como posso te ajudar hoje?',
          analysisText: detectedAction.response || 'Olá! Como posso te ajudar hoje?'
        };
        console.log('[ChatbotController] Using action detection response:', finalResponse.text);
      } else {
        // ✅ OTIMIZAÇÃO CRÍTICA: Usar sistema simplificado para respostas rápidas
        const recentHistory = fullConversationHistory.messages.slice(-5); // Apenas últimas 5 mensagens
        
        // ✅ OTIMIZAÇÃO CRÍTICA: Prompt simplificado
        const simplePrompt = `
Você é o Finn, assistente financeiro da Finnextho. 
${isPremium ? 'Você é um consultor premium com acesso aos dados do usuário.' : 'Você é um assistente básico.'}

Dados do usuário:
- Nome: ${userRealData.name}
- Plano: ${userRealData.subscriptionPlan}
${userRealData.hasTransactions ? `- Transações: ${userRealData.totalTransacoes} registradas` : ''}
${userRealData.hasInvestments ? `- Investimentos: ${userRealData.totalInvestimentos} registrados` : ''}
${userRealData.hasGoals ? `- Metas: ${userRealData.totalMetas} definidas` : ''}

Histórico recente:
${recentHistory.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}

Responda de forma natural e útil à mensagem: "${message}"

Resposta (máximo 2 frases):`;

        // ✅ OTIMIZAÇÃO CRÍTICA: Chamada direta à API
        const completion = await openai.chat.completions.create({
          model: 'deepseek-chat',
          messages: [{ role: 'system', content: simplePrompt }],
          temperature: 0.7,
          max_tokens: 200, // ✅ REDUZIDO: Menos tokens = resposta mais rápida
        });

        finalResponse = {
          text: completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.',
          analysisText: completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.'
        };
        console.log('[ChatbotController] Using simplified response:', finalResponse.text);
      }

      // ✅ OTIMIZAÇÃO CRÍTICA: Usar resposta direta sem processamentos extras
      let completeResponse = finalResponse.analysisText || finalResponse.text;

      // ✅ CORREÇÃO: Gerar ID único para a mensagem para feedback
      const botMessageId = `${conversationHistory.chatId}_bot_${Date.now()}`;

      // ✅ CORREÇÃO: Adicionar resposta ao histórico com contexto completo
      await chatHistoryService.addMessage({
        chatId: conversationHistory.chatId,
        userId: userId,
        sender: 'assistant',
        content: completeResponse,
        metadata: {
          analysisData: finalResponse.analysisData,
          processingTime: Date.now() - processingStartTime,
          expertise: isPremium ? 'CFA, CFP, CNAI, CNPI' : 'Assistente Finnextho',
          confidence: isPremium ? 0.95 : 0.85,
          messageType: isPremium ? 'premium' : 'basic',
          isImportant: false,
          messageId: botMessageId, // ID para feedback
          userDataAccessed: {
            name: userRealData.name,
            totalTransacoes: userRealData.totalTransacoes,
            totalInvestimentos: userRealData.totalInvestimentos,
            totalMetas: userRealData.totalMetas
          },
          celebrations: [],
          motivationalMessage: '',
          upsellMessage: '',
          // ✅ NOVO: Incluir contexto da conversa
          conversationContext: {
            totalMessages: fullConversationHistory.messages.length,
            lastUserMessage: message,
            conversationId: conversationHistory.chatId
          }
        },
        timestamp: new Date()
      });

      // ✅ CORREÇÃO: Retornar resposta com ID para feedback e contexto
      const cleanResponse = {
        text: completeResponse,
        chatId: conversationHistory.chatId,
        messageId: botMessageId,
        isPremium,
        userData: {
          name: userRealData.name,
          totalTransacoes: userRealData.totalTransacoes,
          totalInvestimentos: userRealData.totalInvestimentos,
          totalMetas: userRealData.totalMetas
        },
        celebrations: [],
        motivationalMessage: '',
        upsellMessage: '',
        // ✅ NOVO: Incluir contexto da conversa
        conversationContext: {
          totalMessages: fullConversationHistory.messages.length,
          conversationId: conversationHistory.chatId
        }
      };

      console.log(`[ChatbotController] Resposta processada em ${Date.now() - startTime}ms`);

      return res.status(200).json({ 
        success: true, 
        type: 'TEXT_RESPONSE',
        message: completeResponse,
        metadata: {
          chatId: conversationHistory.chatId,
          messageId: botMessageId,
          isPremium,
          userData: {
            name: userRealData.name,
            totalTransacoes: userRealData.totalTransacoes,
            totalInvestimentos: userRealData.totalInvestimentos,
            totalMetas: userRealData.totalMetas
          },
          celebrations: [],
          motivationalMessage: '',
          upsellMessage: '',
          conversationContext: {
            totalMessages: fullConversationHistory.messages.length,
            conversationId: conversationHistory.chatId
          }
        }
      });

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      // ✅ CORREÇÃO: Adicionar mensagem de erro ao histórico
      const errorMessageId = `${conversationHistory.chatId}_error_${Date.now()}`;
      const errorMessage = {
        chatId: conversationHistory.chatId,
        userId: userId,
        sender: 'assistant' as const,
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
        metadata: {
          analysisData: null,
          processingTime: Date.now() - processingStartTime,
          error: true,
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
          messageId: errorMessageId
        } as {
          analysisData: null;
          processingTime: number;
          error: boolean;
          errorMessage: string;
          messageId: string;
        }
      };

      await chatHistoryService.addMessage(errorMessage);

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        metadata: {
          chatId: conversationHistory.chatId,
          messageId: errorMessageId,
          error: true
        }
      });
    }
  } catch (error) {
    console.error('Erro geral no handleChatQuery:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

export const startNewSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // ✅ CORREÇÃO: Criar conversa real no banco de dados
    const conversation = await chatHistoryService.startNewConversation(userId);
    
    console.log(`[ChatbotController] Nova sessão criada: ${conversation.chatId}`);
    
    return res.status(200).json({ 
      success: true,
      chatId: conversation.chatId,
      session: {
        chatId: conversation.chatId,
        title: 'Nova Conversa',
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        userId: conversation.userId,
        isActive: conversation.isActive,
        lastActivity: conversation.lastActivity
      }
    });
  } catch (error) {
    console.error('Erro ao iniciar sessão do chatbot:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao iniciar sessão do chatbot' 
    });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const sessions = await chatHistoryService.getSessions(userId);
    return res.status(200).json({ 
      success: true, 
      data: sessions 
    });
  } catch (error) {
    console.error('Erro ao buscar sessões do chatbot:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar sessões do chatbot' 
    });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.uid;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const conversation = await chatHistoryService.getConversation(chatId);
    
    // Verificar se a conversa pertence ao usuário
    if (conversation.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Acesso negado' });
    }

    // ✅ CORREÇÃO: Retornar no formato esperado pelo frontend
    return res.status(200).json({ 
      success: true, 
      messages: conversation.messages.map((msg: any) => ({
        _id: msg._id || msg.id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp || msg.createdAt,
        metadata: msg.metadata || {}
      })),
      session: {
        chatId: conversation.chatId,
        title: conversation.messages[conversation.messages.length - 1]?.content.slice(0, 30) + '...',
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        userId: conversation.userId,
        isActive: conversation.isActive,
        lastActivity: conversation.lastActivity
      }
    });
  } catch (error) {
    console.error('Erro ao buscar sessão do chatbot:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar sessão do chatbot' 
    });
  }
};

// NOVO ENDPOINT PARA FEEDBACK
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    const { messageId, rating, helpful, comment, category } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!messageId || !rating || typeof helpful !== 'boolean' || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'messageId, rating, helpful e category são obrigatórios' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating deve ser entre 1 e 5' 
      });
    }

    const validCategories = ['accuracy', 'helpfulness', 'clarity', 'relevance'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category deve ser: accuracy, helpfulness, clarity ou relevance' 
      });
    }

    const feedback = await aiService.saveUserFeedback(userId, messageId, {
      rating,
      helpful,
      comment,
      category,
      context: req.body.context || ''
    });

    return res.status(200).json({ 
      success: true, 
      data: feedback 
    });

  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao salvar feedback' 
    });
  }
};

// NOVO ENDPOINT PARA ANALYTICS DE FEEDBACK
export const getFeedbackAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const analytics = await aiService.getUserFeedbackAnalytics(userId);

    return res.status(200).json({ 
      success: true, 
      data: analytics 
    });

  } catch (error) {
    console.error('Erro ao buscar analytics de feedback:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar analytics' 
    });
  }
};

// NOVO ENDPOINT PARA EXCLUIR CONVERSA
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const userId = (req as any).user?.uid;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!chatId) {
      return res.status(400).json({ success: false, message: 'chatId é obrigatório' });
    }

    // Verificar se a conversa pertence ao usuário
    try {
      const conversation = await chatHistoryService.getConversation(chatId);
      if (conversation.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }
    } catch (error) {
      // Se a conversa não existe, retornar sucesso (já foi excluída)
      return res.status(200).json({ 
        success: true, 
        message: 'Conversa não encontrada ou já foi excluída' 
      });
    }

    // Excluir a conversa
    await chatHistoryService.deleteConversation(chatId);

    return res.status(200).json({ 
      success: true, 
      message: 'Conversa excluída com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao excluir conversa:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir conversa' 
    });
  }
};

// NOVO ENDPOINT PARA EXCLUIR TODAS AS CONVERSAS
export const deleteAllConversations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Excluir todas as conversas do usuário
    await chatHistoryService.deleteAllUserConversations(userId);

    return res.status(200).json({ 
      success: true, 
      message: 'Todas as conversas foram excluídas com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao excluir todas as conversas:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir conversas' 
    });
  }
};

export const streamChatResponse = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    const { message, chatId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!message || !chatId) {
      return res.status(400).json({ success: false, message: 'message and chatId are required' });
    }

    // Configurar headers para Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    res.flushHeaders();

    // Buscar ou criar conversa
    let conversationHistory;
    try {
      conversationHistory = await chatHistoryService.getConversation(chatId);
    } catch (error) {
      conversationHistory = await chatHistoryService.startNewConversation(userId);
    }

    // Adicionar mensagem do usuário
    await chatHistoryService.addMessage({
      chatId: conversationHistory.chatId,
      userId: userId,
      sender: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {
        messageType: 'streaming',
        isImportant: false
      }
    });

    // Buscar dados do usuário
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      res.write(`data: ${JSON.stringify({ error: 'User not found' })}\n\n`);
      return res.end();
    }

    const [transacoes, investimentos, metas] = await Promise.all([
      Transacoes.find({ userId: user._id }),
      Investimento.find({ userId: user._id }),
      Goal.find({ userId: user._id })
    ]);

    const subscriptionStatus = user.subscription?.status;
    const subscriptionPlan = user.subscription?.plan;
    
    const isPremium = subscriptionStatus === 'active' && (
      subscriptionPlan === 'top' || 
      subscriptionPlan === 'Plano Top' || 
      subscriptionPlan === 'Top-anual' ||
      subscriptionPlan === 'Plano Top Anual' ||
      subscriptionPlan === 'premium' || 
      subscriptionPlan === 'Premium' ||
      subscriptionPlan === 'enterprise' ||
      subscriptionPlan === 'Enterprise'
    );

    const userRealData = {
      name: user.name || 'Usuário',
      email: user.email || '',
      createdAt: user.createdAt,
      transacoes: transacoes,
      investimentos: investimentos,
      metas: metas,
      totalTransacoes: transacoes.length,
      totalInvestimentos: investimentos.length,
      totalMetas: metas.length,
      resumoTransacoes: transacoes.length > 0 ? {
        total: transacoes.length,
        categorias: transacoes.reduce((acc: any, t: any) => {
          const cat = t.categoria || 'Sem categoria';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {}),
        ultimas: transacoes.slice(-5).map(t => ({
          descricao: t.descricao,
          valor: t.valor,
          categoria: t.categoria,
          tipo: t.tipo,
          data: t.data
        }))
      } : null,
      resumoInvestimentos: investimentos.length > 0 ? {
        total: investimentos.length,
        tipos: investimentos.reduce((acc: any, i: any) => {
          const tipo = i.tipo || 'Sem tipo';
          acc[tipo] = (acc[tipo] || 0) + 1;
          return acc;
        }, {}),
        ultimos: investimentos.slice(-5).map(i => ({
          nome: i.nome,
          valor: i.valor,
          tipo: i.tipo,
          data: i.data
        }))
      } : null,
      resumoMetas: metas.length > 0 ? {
        total: metas.length,
        status: metas.reduce((acc: any, m: any) => {
          const status = m.prioridade || 'media';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        ativas: metas.filter((m: any) => m.valor_atual < m.valor_total).slice(-5).map(m => ({
          titulo: m.meta,
          valor: m.valor_total,
          valorAtual: m.valor_atual,
          prazo: m.data_conclusao,
          prioridade: m.prioridade
        }))
      } : null
    };

    // Enviar início do streaming
    res.write(`data: ${JSON.stringify({ type: 'start', message: 'Iniciando análise...' })}\n\n`);

    try {
      let response;
      const startTime = Date.now();

      if (isPremium) {
        const financialContext = {
          userData: {
            name: userRealData.name,
            email: userRealData.email,
            createdAt: userRealData.createdAt,
            hasTransactions: userRealData.totalTransacoes > 0,
            hasInvestments: userRealData.totalInvestimentos > 0,
            hasGoals: userRealData.totalMetas > 0,
            subscriptionPlan: subscriptionPlan,
            isPremium: true
          },
          financialData: {
            transactions: userRealData.resumoTransacoes,
            investments: userRealData.resumoInvestimentos,
            goals: userRealData.resumoMetas
          }
        };

        response = await aiService.generateStreamingResponse(
          'premium',
          message,
          conversationHistory.messages,
          financialContext
        );
      } else {
        const basicContext = {
          userData: {
            name: userRealData.name,
            hasTransactions: userRealData.totalTransacoes > 0,
            hasInvestments: userRealData.totalInvestimentos > 0,
            hasGoals: userRealData.totalMetas > 0,
            subscriptionPlan: subscriptionPlan,
            isPremium: false
          },
          financialData: {
            transactions: userRealData.resumoTransacoes,
            investments: userRealData.resumoInvestimentos,
            goals: userRealData.resumoMetas
          }
        };

        response = await aiService.generateStreamingResponse(
          'basic',
          message,
          conversationHistory.messages,
          basicContext
        );
      }

      // Processar resposta em streaming
      let fullResponse = '';
      let chunkCount = 0;

      for await (const chunk of response) {
        if (chunk.trim()) {
          fullResponse += chunk;
          chunkCount++;
          
          // Enviar chunk para o cliente
          res.write(`data: ${JSON.stringify({ 
            type: 'chunk', 
            content: chunk,
            chunkNumber: chunkCount
          })}\n\n`);
        }
      }

      const processingTime = Date.now() - startTime;

      // Salvar resposta completa no histórico
      await chatHistoryService.addMessage({
        chatId: conversationHistory.chatId,
        userId: userId,
        sender: 'assistant',
        content: fullResponse,
        timestamp: new Date(),
        metadata: {
          messageType: 'streaming',
          processingTime: processingTime,
          chunkCount: chunkCount,
          isPremium: isPremium
        }
      });

      // Enviar finalização
      res.write(`data: ${JSON.stringify({ 
        type: 'end', 
        message: 'Análise concluída',
        processingTime: processingTime,
        totalChunks: chunkCount
      })}\n\n`);

    } catch (error) {
      console.error('Error in streaming response:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        message: 'Erro ao processar resposta',
        error: errorMessage 
      })}\n\n`);
    }

    res.end();

  } catch (error) {
    console.error('Error in streamChatResponse:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      message: 'Erro interno do servidor',
      error: errorMessage 
    })}\n\n`);
    res.end();
  }
  
  return; // Return statement explícito para satisfazer o TypeScript
};

// NOVO ENDPOINT PARA SUGESTÕES
export const getSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    const { message, chatId, type = 'contextual' } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let suggestions: string[] = [];

    switch (type) {
      case 'contextual':
        if (!message) {
          return res.status(400).json({ success: false, message: 'message is required for contextual suggestions' });
        }
        
        // Buscar histórico da conversa
        let conversationHistory;
        try {
          conversationHistory = await chatHistoryService.getConversation(chatId);
        } catch (error) {
          conversationHistory = { messages: [] };
        }

        // Buscar contexto do usuário
        const user = await User.findOne({ firebaseUid: userId });
        const userContext = user ? {
          isPremium: user.subscription?.status === 'active' && ['top', 'premium', 'enterprise'].includes(user.subscription?.plan || ''),
          hasInvestments: false, // Será preenchido abaixo
          hasGoals: false // Será preenchido abaixo
        } : null;

        if (user) {
          const [investimentos, metas] = await Promise.all([
            Investimento.find({ userId: user._id }).limit(1),
            Goal.find({ userId: user._id }).limit(1)
          ]);
          
          if (userContext) {
            userContext.hasInvestments = investimentos.length > 0;
            userContext.hasGoals = metas.length > 0;
          }
        }

        suggestions = await suggestionService.generateSuggestions(
          message,
          conversationHistory.messages,
          userContext
        );
        break;

      case 'trending':
        suggestions = await suggestionService.getTrendingSuggestions();
        break;

      case 'personalized':
        const userForPersonalized = await User.findOne({ firebaseUid: userId });
        if (!userForPersonalized) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        const [investimentosPersonalized, metasPersonalized] = await Promise.all([
          Investimento.find({ userId: userForPersonalized._id }),
          Goal.find({ userId: userForPersonalized._id })
        ]);

        const userContextPersonalized = {
          isPremium: userForPersonalized.subscription?.status === 'active' && ['top', 'premium', 'enterprise'].includes(userForPersonalized.subscription?.plan || ''),
          hasInvestments: investimentosPersonalized.length > 0,
          hasGoals: metasPersonalized.length > 0
        };

        suggestions = await suggestionService.getPersonalizedSuggestions(userId, userContextPersonalized);
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid suggestion type' });
    }

    return res.status(200).json({
      success: true,
      data: {
        suggestions,
        type,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar sugestões'
    });
  }
};

// NOVO ENDPOINT PARA ANÁLISE DE SENTIMENTOS
export const analyzeSentiment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    const { message, chatId } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }

    let sentimentAnalysis;

    if (chatId) {
      // Análise de sentimento da conversa completa
      try {
        const conversation = await chatHistoryService.getConversation(chatId);
        sentimentAnalysis = await sentimentService.analyzeConversationSentiment(conversation.messages);
      } catch (error) {
        // Se não encontrar a conversa, analisar apenas a mensagem atual
        sentimentAnalysis = await sentimentService.analyzeSentiment(message, userId);
      }
    } else {
      // Análise de sentimento da mensagem individual
      sentimentAnalysis = await sentimentService.analyzeSentiment(message, userId);
    }

    return res.status(200).json({
      success: true,
      data: sentimentAnalysis
    });

  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao analisar sentimento'
    });
  }
};

// NOVO ENDPOINT PARA ESTATÍSTICAS DO CACHE
export const getCacheStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const stats = await cacheService.getCacheStats();
    const health = await cacheService.healthCheck();

    return res.status(200).json({
      success: true,
      data: {
        stats,
        health,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error getting cache stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas do cache'
    });
  }
};

// NOVO ENDPOINT PARA LIMPAR CACHE
export const clearCache = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    const { type = 'user' } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (type === 'user') {
      await cacheService.clearUserCache(userId);
      return res.status(200).json({
        success: true,
        message: 'Cache do usuário limpo com sucesso'
      });
    } else if (type === 'all') {
      // Verificar se é admin (implementar lógica de admin se necessário)
      await cacheService.clearAllCache();
      return res.status(200).json({
        success: true,
        message: 'Todo o cache foi limpo com sucesso'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo de limpeza inválido. Use "user" ou "all"'
      });
    }

  } catch (error) {
    console.error('Error clearing cache:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao limpar cache'
    });
  }
};

// NOVO ENDPOINT PARA ADAPTAR RESPOSTA AO SENTIMENTO
export const adaptResponseToSentiment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.uid;
    const { response, sentiment } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!response || !sentiment) {
      return res.status(400).json({ success: false, message: 'response and sentiment are required' });
    }

    const adaptedResponse = sentimentService.adaptResponseToSentiment(response, sentiment);

    return res.status(200).json({
      success: true,
      data: {
        originalResponse: response,
        adaptedResponse,
        sentiment,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error adapting response to sentiment:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro ao adaptar resposta'
    });
  }
};

// Funções auxiliares para executar ações
async function createTransaction(userId: string, payload: any) {
  console.log('[createTransaction] Creating transaction with payload:', payload);
  console.log('[createTransaction] User ID:', userId);
  
  // ✅ CORREÇÃO CRÍTICA: Buscar o usuário pelo firebaseUid para obter o _id correto
  const user = await User.findOne({ firebaseUid: userId });
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  
  console.log('[createTransaction] User found:', user._id);
  
  // ✅ CORREÇÃO CRÍTICA: Função para parsear datas em português
  function parsePortugueseDate(dateString: string): Date {
    if (!dateString) return new Date();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Mapear expressões em português para datas
    const dateMap: { [key: string]: Date } = {
      'hoje': today,
      'ontem': new Date(today.getTime() - 24 * 60 * 60 * 1000),
      'amanhã': new Date(today.getTime() + 24 * 60 * 60 * 1000),
      'amanha': new Date(today.getTime() + 24 * 60 * 60 * 1000),
      'hoje de manhã': new Date(today.getTime() + 6 * 60 * 60 * 1000), // 6h da manhã
      'hoje de manha': new Date(today.getTime() + 6 * 60 * 60 * 1000),
      'hoje à tarde': new Date(today.getTime() + 14 * 60 * 60 * 1000), // 14h da tarde
      'hoje a tarde': new Date(today.getTime() + 14 * 60 * 60 * 1000),
      'hoje à noite': new Date(today.getTime() + 20 * 60 * 60 * 1000), // 20h da noite
      'hoje a noite': new Date(today.getTime() + 20 * 60 * 60 * 1000),
    };
    
    // Verificar se é uma expressão conhecida
    const lowerDateString = dateString.toLowerCase().trim();
    if (dateMap[lowerDateString]) {
      return dateMap[lowerDateString];
    }
    
    // Tentar parsear como data normal
    const parsedDate = new Date(dateString);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
    
    // Se não conseguir parsear, usar data atual
    console.log('[createTransaction] Could not parse date:', dateString, 'using current date');
    return new Date();
  }
  
  // Garantir que os campos obrigatórios estejam presentes
  const transactionData = {
    userId: user._id.toString(), // ✅ CORREÇÃO: Usar o _id do MongoDB
    valor: parseFloat(payload.valor) || 0,
    descricao: payload.descricao || 'Transação',
    tipo: payload.tipo || 'despesa',
    categoria: payload.categoria || 'Outros',
    conta: payload.conta || 'Conta Corrente',
    data: parsePortugueseDate(payload.data), // ✅ CORREÇÃO: Usar função de parse
    createdAt: new Date()
  };
  
  console.log('[createTransaction] Final transaction data:', transactionData);
  
  const transacao = new Transacoes(transactionData);
  const savedTransaction = await transacao.save();
  
  console.log('[createTransaction] Transaction saved successfully:', savedTransaction);
  return savedTransaction;
}

async function createInvestment(userId: string, payload: any) {
  console.log('[createInvestment] Creating investment with payload:', payload);
  console.log('[createInvestment] User ID:', userId);
  
  // ✅ CORREÇÃO CRÍTICA: Buscar o usuário pelo firebaseUid para obter o _id correto
  const user = await User.findOne({ firebaseUid: userId });
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  
  console.log('[createInvestment] User found:', user._id);
  
  // Validar e mapear o tipo de investimento
  const tipoMapping: { [key: string]: string } = {
    'criptomoeda': 'Criptomoedas',
    'criptomoedas': 'Criptomoedas',
    'crypto': 'Criptomoedas',
    'bitcoin': 'Criptomoedas',
    'btc': 'Criptomoedas',
    'tesouro': 'Tesouro Direto',
    'tesouro direto': 'Tesouro Direto',
    'acoes': 'Ações',
    'ações': 'Ações',
    'fii': 'Fundos Imobiliários',
    'fundos imobiliarios': 'Fundos Imobiliários',
    'fundos imobiliário': 'Fundos Imobiliários',
    'fundos imobiliários': 'Fundos Imobiliários',
    'fundos imobiliario': 'Fundos Imobiliários',
    'previdencia': 'Previdência Privada',
    'previdência': 'Previdência Privada',
    'etf': 'ETF',
    'internacional': 'Internacional',
    'renda variavel': 'Renda Variável',
    'renda variável': 'Renda Variável',
    'renda fixa': 'Renda Fixa',
    'lci': 'LCI',
    'lca': 'LCA',
    'cdb': 'CDB',
    'cdi': 'CDI',
    'poupanca': 'Poupança',
    'poupança': 'Poupança',
    'fundos de investimento': 'Fundos de Investimento',
    'debentures': 'Debêntures',
    'debêntures': 'Debêntures',
    'cra': 'CRA',
    'cri': 'CRI',
    'letras de cambio': 'Letras de Câmbio',
    'letras de câmbio': 'Letras de Câmbio',
    'coe': 'COE',
    'fundos multimercado': 'Fundos Multimercado',
    'fundos cambiais': 'Fundos Cambiais',
    'fundos de acoes': 'Fundos de Ações',
    'fundos de ações': 'Fundos de Ações',
    'fundos de renda fixa': 'Fundos de Renda Fixa',
    'fundos de previdencia': 'Fundos de Previdência',
    'fundos de previdência': 'Fundos de Previdência',
    'fundos de credito privado': 'Fundos de Crédito Privado',
    'fundos de crédito privado': 'Fundos de Crédito Privado'
  };

  // Mapear o tipo se necessário
  let tipo = payload.tipo;
  if (tipoMapping[tipo.toLowerCase()]) {
    tipo = tipoMapping[tipo.toLowerCase()];
  }

  // Validar valor mínimo
  const valor = parseFloat(payload.valor) || 0;
  if (valor < 0.01) {
    throw new Error('O valor do investimento deve ser maior que R$ 0,01');
  }

  // Validar se o tipo é válido
  const tiposValidos = [
    'Renda Fixa', 'Tesouro Direto', 'Ações', 'Fundos Imobiliários',
    'Criptomoedas', 'Previdência Privada', 'ETF', 'Internacional', 'Renda Variável',
    'LCI', 'LCA', 'CDB', 'CDI', 'Poupança', 'Fundos de Investimento', 'Debêntures',
    'CRA', 'CRI', 'Letras de Câmbio', 'COE', 'Fundos Multimercado', 'Fundos Cambiais',
    'Fundos de Ações', 'Fundos de Renda Fixa', 'Fundos de Previdência', 'Fundos de Crédito Privado'
  ];
  
  if (!tiposValidos.includes(tipo)) {
    throw new Error(`Tipo de investimento inválido. Tipos válidos: ${tiposValidos.join(', ')}`);
  }

  // Preparar dados do investimento
  const investmentData = {
    userId: user._id.toString(), // ✅ CORREÇÃO: Usar o _id do MongoDB
    nome: payload.nome || 'Investimento',
    tipo,
    valor,
    data: payload.data ? new Date(payload.data) : new Date(),
    instituicao: payload.instituicao || 'Não informado',
    rentabilidade: payload.rentabilidade ? parseFloat(payload.rentabilidade) : undefined,
    vencimento: payload.vencimento ? new Date(payload.vencimento) : undefined,
    liquidez: payload.liquidez || undefined,
    risco: payload.risco || undefined,
    categoria: payload.categoria || undefined,
    createdAt: new Date()
  };

  console.log('[createInvestment] Final investment data:', investmentData);

  const investimento = new Investimento(investmentData);
  const savedInvestment = await investimento.save();
  
  console.log('[createInvestment] Investment saved successfully:', savedInvestment);
  return savedInvestment;
}

async function createGoal(userId: string, payload: any) {
  // ✅ CORREÇÃO CRÍTICA: Buscar o usuário pelo firebaseUid para obter o _id correto
  const user = await User.findOne({ firebaseUid: userId });
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  
  console.log('[createGoal] User found:', user._id);
  
  const goal = new Goal({
    userId: user._id.toString(), // ✅ CORREÇÃO: Usar o _id do MongoDB
    ...payload,
    valor_atual: 0,
    prioridade: 'media',
    createdAt: new Date()
  });
  
  await goal.save();
  return goal;
}

async function analyzeData(userId: string, payload: any) {
  // ✅ CORREÇÃO CRÍTICA: Buscar o usuário pelo firebaseUid para obter o _id correto
  const user = await User.findOne({ firebaseUid: userId });
  if (!user) {
    throw new Error('Usuário não encontrado');
  }
  
  // Implementar análise de dados
  const [transacoes, investimentos, metas] = await Promise.all([
    Transacoes.find({ userId: user._id.toString() }),
    Investimento.find({ userId: user._id.toString() }),
    Goal.find({ userId: user._id.toString() })
  ]);

  return {
    analysisType: payload.analysisType,
    summary: {
      totalTransacoes: transacoes.length,
      totalInvestimentos: investimentos.length,
      totalMetas: metas.length,
      valorTotalInvestido: investimentos.reduce((sum, inv) => sum + inv.valor, 0),
      valorTotalMetas: metas.reduce((sum, meta) => sum + meta.valor_total, 0)
    }
  };
}

async function generateReport(userId: string, payload: any) {
  // Implementar geração de relatório
  const analysis = await analyzeData(userId, payload);
  
  return {
    reportId: uuidv4(),
    generatedAt: new Date(),
    type: payload.reportType || 'general',
    data: analysis
  };
}