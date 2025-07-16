// 📂 core/FraudDetector.ts
import AIService from '../services/aiService';
import { EmergencySystem } from '../services/EmergencySystem';

export class FraudDetector {
  async checkTransactionRisk(transaction: any) {
    const riskScore = await AIService.deepFraudAnalysis(transaction);
    if (riskScore > 80) {
      await EmergencySystem.blockTransaction(transaction);
      return '🚨 BLOQUEADO: Transação suspeita detectada!';
    }
    return null;
  }
} 