//ChatHistoryService.ts
import { ChatMessage, Conversation, ChatAnalytics, ChatSession } from '../types/chat';
import { ChatMessage as ChatMessageModel, IChatMessage } from '../models/ChatMessage';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../core/errors/AppError';

export class ChatHistoryService {
  // Calcular data de expiração baseada no tipo de mensagem
  private calculateExpirationDate(messageType: string, isImportant: boolean = false): Date {
    const now = new Date();
    
    if (isImportant) {
      // Mensagens importantes duram 30 dias
      now.setDate(now.getDate() + 30);
      return now;
    }
    
    switch (messageType) {
      case 'premium':
        // Análises premium duram 7 dias
        now.setDate(now.getDate() + 7);
        break;
      case 'analysis':
        // Análises financeiras duram 7 dias
        now.setDate(now.getDate() + 7);
        break;
      case 'guidance':
        // Orientações da plataforma duram 3 dias
        now.setDate(now.getDate() + 3);
        break;
      case 'basic':
      default:
        // Mensagens básicas duram 24 horas
        now.setHours(now.getHours() + 24);
        break;
    }
    
    return now;
  }

  async getConversation(chatId: string): Promise<Conversation> {
    try {
      const messages = await ChatMessageModel.find({
        chatId,
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: { $exists: false } }
        ]
      })
        .sort({ timestamp: 1 })
        .limit(100)
        .lean();

      if (messages.length === 0) {
        throw new Error('Conversa expirada ou não encontrada');
      }

      return {
        chatId,
        messages: messages.map(msg => ({
          chatId: msg.chatId,
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata,
          expiresAt: msg.expiresAt,
          isImportant: msg.isImportant,
          userId: msg.userId
        })),
        createdAt: messages[0]?.createdAt || new Date(),
        updatedAt: messages[messages.length - 1]?.updatedAt || new Date(),
        userId: messages[0]?.userId,
        isActive: true,
        lastActivity: messages[messages.length - 1]?.timestamp
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async startNewConversation(userId: string): Promise<Conversation> {
    try {
      const chatId = uuidv4();

      const welcomeMessage = new ChatMessageModel({
        chatId,
        userId,
        sender: 'assistant',
        content: 'Conversa iniciada',
        timestamp: new Date(),
        metadata: {
          messageType: 'basic',
          isImportant: false
        },
        expiresAt: this.calculateExpirationDate('basic'),
        isImportant: false
      });

      await welcomeMessage.save();

      return {
        chatId,
        messages: [{
          chatId,
          sender: 'assistant',
          content: 'Conversa iniciada',
          timestamp: new Date(),
          metadata: {
            messageType: 'basic',
            isImportant: false
          },
          expiresAt: this.calculateExpirationDate('basic'),
          isImportant: false,
          userId
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        isActive: true,
        lastActivity: new Date()
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createConversation(userId: string): Promise<Conversation> {
    try {
      const chatId = uuidv4();

      const welcomeMessage = new ChatMessageModel({
        chatId,
        userId,
        sender: 'assistant',
        content: 'Olá! Sou o assistente Finn. Como posso te ajudar hoje?',
        timestamp: new Date(),
        metadata: {
          messageType: 'basic',
          isImportant: false
        },
        expiresAt: this.calculateExpirationDate('basic'),
        isImportant: false
      });

      await welcomeMessage.save();

      return {
        chatId,
        messages: [{
          chatId,
          sender: 'assistant',
          content: 'Olá! Sou o assistente Finn. Como posso te ajudar hoje?',
          timestamp: new Date(),
          metadata: {
            messageType: 'basic',
            isImportant: false
          },
          expiresAt: this.calculateExpirationDate('basic'),
          isImportant: false,
          userId
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        isActive: true,
        lastActivity: new Date()
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async addMessage(message: ChatMessage): Promise<void> {
    try {
      const messageType = message.metadata?.messageType || 'basic';
      const isImportant = message.metadata?.isImportant || false;

      const newMessage = new ChatMessageModel({
        chatId: message.chatId,
        userId: message.userId,
        sender: message.sender,
        content: message.content,
        timestamp: message.timestamp,
        metadata: {
          ...message.metadata,
          messageType,
          isImportant
        },
        expiresAt: this.calculateExpirationDate(messageType, isImportant),
        isImportant
      });

      await newMessage.save();
      
      // Atualizar analytics do usuário
      await this.updateUserAnalytics(message.userId!, messageType);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getSessions(userId: string): Promise<ChatSession[]> {
    try {
      // Buscar mensagens do usuário com limite para performance
      const messages = await ChatMessageModel.find({ 
        userId,
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: { $exists: false } }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(500) // Limitar a 500 mensagens para performance
      .lean();

      // Agrupar por chatId manualmente
      const sessionsMap = new Map();
      messages.forEach(msg => {
        if (!sessionsMap.has(msg.chatId)) {
          // Criar nova sessão
          const title = msg.content.length > 30 ? msg.content.substring(0, 30) + '...' 
            : msg.content;
          sessionsMap.set(msg.chatId, {
            chatId: msg.chatId,
            title: title,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
            messageCount: 1
          });
        } else {
          // Atualizar sessão existente
          const session = sessionsMap.get(msg.chatId);
          session.messageCount++;
          // Atualizar título e data se for mais recente
          if (msg.updatedAt > session.updatedAt) {
            session.updatedAt = msg.updatedAt;
            session.title = msg.content.length > 30 
              ? msg.content.substring(0, 30) + '...' 
              : msg.content;
          }
        }
      });

      // Converter para array e ordenar por data mais recente
      const sessions = Array.from(sessionsMap.values());
      sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return sessions.map(session => ({
        chatId: session.chatId,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        userId,
        isActive: true,
        lastActivity: session.updatedAt,
        messageCount: session.messageCount
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async markMessageAsImportant(chatId: string, messageId: string, userId: string): Promise<void> {
    try {
      await ChatMessageModel.updateOne(
        { 
          chatId, 
          _id: messageId, 
          userId,
          $or: [
            { expiresAt: { $gt: new Date() } },
            { expiresAt: { $exists: false } }
          ]
        },
        { 
          isImportant: true,
          expiresAt: this.calculateExpirationDate('basic', true)
        }
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateUserAnalytics(userId: string, messageType: string): Promise<void> {
    try {
      // Aqui você pode implementar lógica para atualizar analytics do usuário
      // Por exemplo, contar mensagens, calcular tempo médio de resposta, etc.
      console.log(`Atualizando analytics para usuário ${userId}, tipo: ${messageType}`);
    } catch (error) {
      console.error(error);
    }
  }

  async cleanupExpiredMessages(): Promise<number> {
    try {
      const result = await ChatMessageModel.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      console.log(`${result.deletedCount} mensagens expiradas foram removidas`);
      return result.deletedCount || 0;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  async deleteConversation(chatId: string): Promise<void> {
    try {
      console.log(`Excluindo conversa: ${chatId}`);
      // Excluir a conversa do MongoDB - CORRIGIDO: usar deleteMany em vez de deleteOne
      await ChatMessageModel.deleteMany({ chatId });
      console.log(`Conversa ${chatId} excluída com sucesso`);
    } catch (error) {
      console.error(error);
      throw new AppError(500, 'Erro ao excluir conversa');
    }
  }

  async deleteAllUserConversations(userId: string): Promise<void> {
    try {
      console.log(`Excluindo todas as conversas do usuário: ${userId}`);
      // Buscar todas as conversas do usuário
      const chatIds = await ChatMessageModel.distinct('chatId', { userId });
      
      if (chatIds.length === 0) {
        console.log('Nenhuma conversa encontrada para excluir');
        return;
      }

      // Excluir todas as conversas
      await ChatMessageModel.deleteMany({ userId });
      console.log(`${chatIds.length} conversas excluídas com sucesso`);
    } catch (error) {
      console.error(error);
      throw new AppError(500, 'Erro ao excluir conversas');
    }
  }
}
