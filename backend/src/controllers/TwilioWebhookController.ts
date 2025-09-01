import { Request, Response } from 'express';
import { getTwilioService, initializeTwilioService } from '../services/TwilioService';
import { OptimizedChatbotController } from './OptimizedChatbotController';

export class TwilioWebhookController {
  private chatbotController: OptimizedChatbotController;
  private memoryCache: Map<string, { message: string; timestamp: number }> = new Map();

  constructor() {
    this.chatbotController = OptimizedChatbotController.getInstance();
    
    // Inicializar Twilio Service com credenciais do .env
    const twilioConfig = {
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER!
    };
    
    initializeTwilioService(twilioConfig);
    console.log('[TwilioWebhook] Controller inicializado');
  }

  /**
   * Webhook para receber mensagens do WhatsApp via Twilio - OTIMIZADO
   */
  async receiveMessage(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Responder imediatamente ao Twilio para evitar timeout
      res.status(200).json({ message: 'Recebido' });
      
      const twilioService = getTwilioService();
      if (!twilioService) {
        console.error('[TwilioWebhook] TwilioService não inicializado');
        return;
      }

      // 1. Validação rápida de assinatura (opcional em dev)
      if (process.env.NODE_ENV === 'production') {
        const signature = req.headers['x-twilio-signature'] as string;
        const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        
        if (!twilioService.validateWebhook(signature, url, req.body)) {
          console.error('[TwilioWebhook] ❌ Assinatura inválida');
          return;
        }
      }

      // 2. Parse rápido da mensagem
      const message = twilioService.parseIncomingMessage(req.body);
      if (!message) {
        console.error('[TwilioWebhook] ❌ Mensagem inválida');
        return;
      }

      console.log(`[TwilioWebhook] 📨 ${message.from}: ${message.body.substring(0, 30)}...`);

      // 3. Mapear número para userId (cache futuro)
      const userId = await this.mapPhoneToUserId(message.from);
      if (!userId) {
        // Resposta rápida para usuário não registrado
        this.sendWelcomeMessage(twilioService, message.from);
        return;
      }

      // 4. Processar em paralelo (não bloquear)
      this.processMessageAsync(twilioService, message, userId, startTime);

    } catch (error) {
      console.error('[TwilioWebhook] ❌ Erro no webhook:', error);
    }
  }

  /**
   * Processamento assíncrono da mensagem com cache (não bloqueia webhook)
   */
  private async processMessageAsync(
    twilioService: any,
    message: any,
    userId: string,
    startTime: number
  ): Promise<void> {
    try {
      const chatId = `whatsapp_${message.from.replace(/\D/g, '')}`;
      
      // Cache simples em memória para respostas frequentes
      const messageHash = this.hashMessage(message.body);
      const cachedResponse = this.getFromMemoryCache(userId, messageHash);
      
      if (cachedResponse) {
        // Resposta em cache - enviar imediatamente
        await twilioService.sendMessage(message.from, cachedResponse);
        const totalTime = Date.now() - startTime;
        console.log(`[TwilioWebhook] ⚡ Cache hit! Resposta em ${totalTime}ms: ${cachedResponse.substring(0, 50)}...`);
        return;
      }
      
      // Interceptar resposta do chatbot
      let chatbotMessage = '';
      const mockRes = {
        json: (data: any) => {
          if (data && data.message) {
            chatbotMessage = data.message;
          }
          return data;
        },
        status: (code: number) => ({
          json: (data: any) => {
            if (data && data.message) {
              chatbotMessage = data.message;
            }
            return data;
          }
        })
      };

      // Processar com chatbot
      await this.chatbotController.processMessage({
        body: {
          message: message.body,
          userId: userId,
          chatId
        }
      } as Request, mockRes as Response);

      // Enviar resposta e cachear
      if (chatbotMessage) {
        await twilioService.sendMessage(message.from, chatbotMessage);
        
        // Cachear resposta em memória (30 min)
        this.setInMemoryCache(userId, messageHash, chatbotMessage);
        
        const totalTime = Date.now() - startTime;
        console.log(`[TwilioWebhook] ✅ Resposta enviada em ${totalTime}ms: ${chatbotMessage.substring(0, 50)}...`);
      }

    } catch (error) {
      console.error('[TwilioWebhook] ❌ Erro no processamento assíncrono:', error);
      // Enviar mensagem de erro ao usuário
      await twilioService.sendMessage(
        message.from,
        '❌ Ops! Tive um problema ao processar sua mensagem. Tente novamente em alguns segundos.'
      );
    }
  }

  /**
   * Gerar hash simples para cache de mensagens
   */
  private hashMessage(message: string): string {
    return Buffer.from(message.toLowerCase().trim()).toString('base64').substring(0, 16);
  }

  /**
   * Cache em memória para respostas rápidas
   */
  private getFromMemoryCache(userId: string, messageHash: string): string | null {
    const key = `${userId}:${messageHash}`;
    const cached = this.memoryCache.get(key);
    
    if (cached) {
      // Verificar se não expirou (30 min)
      const now = Date.now();
      if (now - cached.timestamp < 1800000) {
        return cached.message;
      } else {
        this.memoryCache.delete(key);
      }
    }
    
    return null;
  }

  private setInMemoryCache(userId: string, messageHash: string, message: string): void {
    const key = `${userId}:${messageHash}`;
    this.memoryCache.set(key, {
      message,
      timestamp: Date.now()
    });
    
    // Limpar cache antigo (manter apenas 100 entradas)
    if (this.memoryCache.size > 100) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }
  }

  /**
   * Enviar mensagem de boas-vindas (não bloquear)
   */
  private async sendWelcomeMessage(twilioService: any, phoneNumber: string): Promise<void> {
    try {
      await twilioService.sendMessage(
        phoneNumber,
        '👋 Olá! Sou o Finn da Finnextho. Para começar, preciso que você se registre em nosso app: https://finnextho.com\n\nApós o registro, volte aqui e digite "conectar" para vincular sua conta.'
      );
    } catch (error) {
      console.error('[TwilioWebhook] Erro ao enviar boas-vindas:', error);
    }
  }

  /**
   * Mapear número de telefone para userId do Firebase
   * TODO: Implementar sistema de autenticação mais robusto
   */
  private async mapPhoneToUserId(phoneNumber: string): Promise<string | null> {
    try {
      // Por enquanto, usar um mapeamento simples
      // Em produção, implementar tabela de vinculação phone -> firebaseUid
      const phoneMapping: { [key: string]: string } = {
        // Usuários cadastrados para teste WhatsApp
        '+556481478955': 'oNLJmPuDezXwjODvrprT0mpnWOf2', // Saulo - saulochagas29@gmail.com
        // Adicionar número da Sarah quando soubermos
        // '+55XXXXXXXXXXX': 'eRB3TLalt3YQynweRrgO6MhnT2H3', // Sarah - caminhodamoda3s@gmail.com
      };

      const userId = phoneMapping[phoneNumber];
      if (userId) {
        console.log(`[TwilioWebhook] 📞 Número ${phoneNumber} mapeado para usuário: ${userId}`);
        return userId;
      }

      console.log(`[TwilioWebhook] ❌ Número ${phoneNumber} não encontrado no mapeamento`);
      return null;
    } catch (error) {
      console.error('[TwilioWebhook] Erro ao mapear número:', error);
      return null;
    }
  }

  /**
   * Endpoint para testar conectividade Twilio
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const twilioService = getTwilioService();
      if (!twilioService) {
        res.status(500).json({ error: 'TwilioService não inicializado' });
        return;
      }

      // Testar informações da conta
      const accountInfo = await twilioService.getAccountInfo();
      const phoneNumbers = await twilioService.getPhoneNumbers();

      res.json({
        success: true,
        account: accountInfo,
        phoneNumbers,
        message: 'Twilio conectado com sucesso!'
      });
    } catch (error) {
      console.error('[TwilioWebhook] Erro no teste:', error);
      res.status(500).json({ error: 'Erro ao testar conexão' });
    }
  }

  /**
   * Endpoint para enviar mensagem de teste
   */
  async sendTestMessage(req: Request, res: Response): Promise<void> {
    try {
      const { to, message } = req.body;
      
      if (!to || !message) {
        res.status(400).json({ error: 'Parâmetros to e message são obrigatórios' });
        return;
      }

      const twilioService = getTwilioService();
      if (!twilioService) {
        res.status(500).json({ error: 'TwilioService não inicializado' });
        return;
      }

      const success = await twilioService.sendMessage(to, message);
      
      res.json({
        success,
        message: success ? 'Mensagem enviada com sucesso!' : 'Falha ao enviar mensagem'
      });
    } catch (error) {
      console.error('[TwilioWebhook] Erro ao enviar teste:', error);
      res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
  }
}
