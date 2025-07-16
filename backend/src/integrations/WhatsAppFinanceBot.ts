// 📂 integrations/WhatsAppFinanceBot.ts
import { WhatsAppAPI } from '../services/WhatsAppAPI';

export class WhatsAppFinanceBot {
  async sendFinancialAlert(userPhone: string, message: string) {
    await WhatsAppAPI.sendTemplateMessage(
      userPhone,
      'finance_alert',
      { text: message }
    );
  }
} 