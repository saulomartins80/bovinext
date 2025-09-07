import twilio from 'twilio';
import crypto from 'crypto';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  webhookUrl?: string;
}

export interface TwilioMessage {
  from: string;
  to: string;
  body: string;
  messageId?: string;
  timestamp?: Date;
}

export class TwilioService {
  private client: twilio.Twilio;
  private config: TwilioConfig;

  constructor(config: TwilioConfig) {
    this.config = config;
    this.client = twilio(config.accountSid, config.authToken);
    console.log(`[TwilioService] Inicializado com número: ${config.phoneNumber}`);
  }

  /**
   * Enviar mensagem BOVINEXT via WhatsApp
   */
  async sendBovinoMessage(to: string, message: string): Promise<boolean> {
    try {
      console.log(`[BOVINEXT] Enviando mensagem para: ${to}`);
      
      // Adicionar prefixo BOVINEXT
      const bovinoMessage = `🐂 *BOVINEXT*\n\n${message}`;
      
      const result = await this.client.messages.create({
        from: `whatsapp:+14155238886`, // Número do Sandbox
        to: `whatsapp:${to}`,
        body: bovinoMessage
      });

      console.log(`[BOVINEXT] Mensagem enviada com sucesso. SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('[BOVINEXT] Erro ao enviar mensagem:', error);
      return false;
    }
  }

  /**
   * Enviar mensagem via Twilio WhatsApp (método original mantido)
   */
  async sendMessage(to: string, message: string): Promise<boolean> {
    return this.sendBovinoMessage(to, message);
  }

  /**
   * Enviar mensagem com mídia
   */
  async sendMediaMessage(to: string, message: string, mediaUrl: string): Promise<boolean> {
    try {
      console.log(`[TwilioService] Enviando mensagem com mídia para: ${to}`);
      
      const result = await this.client.messages.create({
        from: `whatsapp:${this.config.phoneNumber}`,
        to: `whatsapp:${to}`,
        body: message,
        mediaUrl: [mediaUrl]
      });

      console.log(`[TwilioService] Mensagem com mídia enviada. SID: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('[TwilioService] Erro ao enviar mensagem com mídia:', error);
      return false;
    }
  }

  /**
   * Validar assinatura do webhook Twilio
   */
  validateWebhook(signature: string, url: string, body: any): boolean {
    try {
      return twilio.validateRequest(
        this.config.authToken,
        signature,
        url,
        body
      );
    } catch (error) {
      console.error('[TwilioService] Erro ao validar webhook:', error);
      return false;
    }
  }

  /**
   * Processar mensagem recebida do webhook
   */
  parseIncomingMessage(body: any): TwilioMessage | null {
    try {
      if (!body.From || !body.Body) {
        console.error('[TwilioService] Mensagem inválida recebida:', body);
        return null;
      }

      // Remover prefixo whatsapp: do número
      const from = body.From.replace('whatsapp:', '');
      const to = body.To?.replace('whatsapp:', '') || this.config.phoneNumber;

      return {
        from,
        to,
        body: body.Body,
        messageId: body.MessageSid,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('[TwilioService] Erro ao processar mensagem:', error);
      return null;
    }
  }

  /**
   * Verificar status da conta Twilio
   */
  async getAccountInfo(): Promise<any> {
    try {
      const account = await this.client.api.accounts(this.config.accountSid).fetch();
      return {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type
      };
    } catch (error) {
      console.error('[TwilioService] Erro ao obter info da conta:', error);
      return null;
    }
  }

  /**
   * Listar números Twilio disponíveis
   */
  async getPhoneNumbers(): Promise<any[]> {
    try {
      const phoneNumbers = await this.client.incomingPhoneNumbers.list();
      return phoneNumbers.map(number => ({
        sid: number.sid,
        phoneNumber: number.phoneNumber,
        friendlyName: number.friendlyName,
        capabilities: number.capabilities
      }));
    } catch (error) {
      console.error('[TwilioService] Erro ao listar números:', error);
      return [];
    }
  }
}

// Instância singleton para uso global
let twilioServiceInstance: TwilioService | null = null;

export function initializeTwilioService(config: TwilioConfig): TwilioService {
  if (!twilioServiceInstance) {
    twilioServiceInstance = new TwilioService(config);
  }
  return twilioServiceInstance;
}

export function getTwilioService(): TwilioService | null {
  return twilioServiceInstance;
}
