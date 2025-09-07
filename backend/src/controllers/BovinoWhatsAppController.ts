import { Request, Response } from 'express';
import { BovinoAIService } from '../services/BovinoAIService';
import { supabaseService } from '../services/SupabaseService';
import logger from '../utils/logger';

export class BovinoWhatsAppController {
  // Processar mensagens do WhatsApp especializadas em pecuária
  static async processMessage(req: Request, res: Response) {
    try {
      const { From, Body, MediaUrl0 } = req.body;
      
      // Extrair número do telefone
      const phoneNumber = From.replace('whatsapp:', '');
      
      // Buscar usuário pelo telefone
      const user = await supabaseService.getUserByPhone(phoneNumber);
      
      if (!user) {
        return res.status(200).send(`
          Olá! 👋 
          
          Para usar o BOVINEXT WhatsApp, você precisa:
          1️⃣ Criar sua conta em bovinext.com
          2️⃣ Vincular seu WhatsApp no painel
          
          🐂 BOVINEXT - Gestão Pecuária Inteligente
        `);
      }

      let response: string;

      // Se tem imagem, processar com IA visual
      if (MediaUrl0) {
        response = await BovinoAIService.analyzeAnimalPhoto(MediaUrl0, user.id);
      } else {
        // Processar comando de texto
        response = await BovinoAIService.processBovinoCommand(Body, user.id);
      }

      // Salvar conversa no histórico
      await supabaseService.createChatMessage({
        user_id: user.id,
        message: Body,
        response,
        channel: 'whatsapp',
        phone_number: phoneNumber,
        media_url: MediaUrl0 || null
      });

      logger.info('Mensagem WhatsApp processada', { 
        userId: user.id, 
        phone: phoneNumber,
        hasMedia: !!MediaUrl0 
      });

      res.status(200).send(response);
    } catch (error) {
      logger.error('Erro ao processar mensagem WhatsApp:', error);
      res.status(200).send('❌ Erro interno. Tente novamente em alguns minutos.');
    }
  }

  // Enviar mensagem proativa (alertas, lembretes)
  static async sendProactiveMessage(req: Request, res: Response) {
    try {
      const { userId, message, type } = req.body;
      
      const user = await supabaseService.getUserById(userId);
      if (!user || !user.phone_number) {
        return res.status(404).json({ error: 'Usuário não encontrado ou sem telefone' });
      }

      // Aqui integraria com Twilio para enviar
      // Por enquanto, apenas log
      logger.info('Mensagem proativa enviada', { 
        userId, 
        phone: user.phone_number, 
        type 
      });

      res.json({ success: true, message: 'Mensagem enviada' });
    } catch (error) {
      logger.error('Erro ao enviar mensagem proativa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Configurar webhooks e validações
  static async validateWebhook(req: Request, res: Response) {
    try {
      // Validação do webhook do WhatsApp Business API
      const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;
      
      if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
        res.status(200).send(challenge);
      } else {
        res.status(403).send('Forbidden');
      }
    } catch (error) {
      logger.error('Erro na validação do webhook:', error);
      res.status(500).send('Error');
    }
  }

  // Processar comandos de voz (futura integração)
  static async processVoiceCommand(req: Request, res: Response) {
    try {
      const { audioUrl, userId } = req.body;
      
      // Placeholder para integração com Speech-to-Text
      const transcription = "quantos animais tenho"; // Simulado
      
      const response = await BovinoAIService.processBovinoCommand(transcription, userId);
      
      res.json({ 
        transcription, 
        response,
        success: true 
      });
    } catch (error) {
      logger.error('Erro ao processar comando de voz:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Histórico de conversas WhatsApp
  static async getChatHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { limit = 50, offset = 0 } = req.query;
      
      const messages = await supabaseService.getChatMessages(userId, {
        channel: 'whatsapp',
        limit: Number(limit),
        offset: Number(offset)
      });

      res.json(messages);
    } catch (error) {
      logger.error('Erro ao buscar histórico:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Estatísticas de uso do WhatsApp
  static async getWhatsAppStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const messages = await supabaseService.getChatMessages(userId, {
        channel: 'whatsapp'
      });

      const hoje = new Date();
      const ontem = new Date(hoje);
      ontem.setDate(hoje.getDate() - 1);

      const stats = {
        total_mensagens: messages.length,
        mensagens_hoje: messages.filter(m => 
          new Date(m.created_at) >= ontem
        ).length,
        comandos_mais_usados: this.getTopCommands(messages),
        ultima_interacao: messages[0]?.created_at || null,
        media_enviadas: messages.filter(m => m.media_url).length
      };

      res.json(stats);
    } catch (error) {
      logger.error('Erro ao calcular estatísticas WhatsApp:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Analisar comandos mais usados
  private static getTopCommands(messages: any[]): Record<string, number> {
    const commands: Record<string, number> = {};
    
    messages.forEach(msg => {
      const intent = BovinoAIService.detectIntention(msg.message);
      if (intent.intent !== 'unknown') {
        commands[intent.intent] = (commands[intent.intent] || 0) + 1;
      }
    });

    // Retornar top 5
    return Object.entries(commands)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, number>);
  }
}
