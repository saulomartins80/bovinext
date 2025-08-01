// 📂 core/VoiceOfCustomer.ts
import { RealTimeStream } from '../services/RealTimeStream';
import AIService from '../services/aiService';
import { SuperMemory } from './SuperMemory';

export class VoiceOfCustomer {
  private feedbackStream: RealTimeStream;

  constructor() {
    this.feedbackStream = new RealTimeStream();
  }

  async processLiveFeedback(userId: string, feedback: string) {
    const insights = await AIService.extractInsights([feedback]);
    const superMemory = new SuperMemory();
    await superMemory.storeUserInsight(userId, insights);
    if (insights.length > 0 && insights.some((insight: any) => insight.priority === 'high')) {
      await this.triggerLiveAgentCall(userId);
    }
  }

  private async triggerLiveAgentCall(userId: string) {
    // Lógica para acionar agente humano
    // Exemplo: enviar alerta para equipe de suporte
  }
} 