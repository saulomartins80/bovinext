// 📂 core/SelfHealingBot.ts
import AIService from '../services/aiService';
import { FinancialAssistant } from '../services/FinancialAssistant';

export class SelfHealingBot {
  async handleUserCorrection(userMessage: string, lastResponse: any) {
    const analysis = await AIService.analyzeCorrection(userMessage, lastResponse);
    if (analysis.isCorrection) {
      const correctedResponse = await this.rebuildResponse(analysis.correctIntent);
      return {
        response: correctedResponse || 'Resposta corrigida',
        apology: 'Ah, entendi agora! Vamos corrigir... 😊',
        timestamp: new Date(),
        corrected: true
      };
    }
    return null;
  }

  private async rebuildResponse(correctIntent: any) {
    // Lógica para reconstruir a resposta correta
    return FinancialAssistant.generateResponse(correctIntent);
  }
} 