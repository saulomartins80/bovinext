// 📂 core/VoiceOfCustomer.ts
import { RealTimeStream } from '../services/RealTimeStream';
import { EnterpriseAIEngine } from '../services/EnterpriseAIEngine';
import { SuperMemory } from './SuperMemory';

export class VoiceOfCustomer {
  private feedbackStream: RealTimeStream;
  private aiEngine: EnterpriseAIEngine;

  constructor() {
    this.feedbackStream = new RealTimeStream();
    this.aiEngine = new EnterpriseAIEngine();
  }

  async processLiveFeedback(userId: string, feedback: string) {
    const result = await this.aiEngine.processEnterpriseRequest(userId, feedback, { type: 'feedback_analysis' });
    const insights = result.insights || { urgent: false };
    const superMemory = new SuperMemory();
    await superMemory.storeUserInsight(userId, insights);
    
    // Verificar se o feedback é urgente baseado na estrutura real do retorno
    if (insights.urgent) {
      await this.triggerLiveAgentCall(userId);
    }
  }

  private async triggerLiveAgentCall(userId: string) {
    // Lógica para acionar agente humano
    // Exemplo: enviar alerta para equipe de suporte
    console.log(`[VoiceOfCustomer] Acionando agente humano para usuário: ${userId}`);
  }
} 