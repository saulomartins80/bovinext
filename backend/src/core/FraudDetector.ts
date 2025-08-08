// 📂 core/FraudDetector.ts
import { EnterpriseAIEngine } from '../services/EnterpriseAIEngine';
import { EmergencySystem } from '../services/EmergencySystem';

export class FraudDetector {
  private aiEngine: EnterpriseAIEngine;

  constructor() {
    this.aiEngine = new EnterpriseAIEngine();
  }

  async checkTransactionRisk(transaction: any) {
    try {
      // Use EnterpriseAIEngine to analyze transaction risk
      const analysis = await this.aiEngine.processEnterpriseRequest(
        'fraud_detector',
        `Analyze this transaction for fraud risk: ${JSON.stringify(transaction)}`,
        { type: 'fraud_analysis', transaction }
      );
      
      // Extract risk score from analysis (0-100)
      const riskScore = analysis.insights?.riskScore || 0;
      
      if (riskScore > 80) {
        await EmergencySystem.blockTransaction(transaction);
        return '🚨 BLOQUEADO: Transação suspeita detectada!';
      }
      return null;
    } catch (error) {
      console.error('Error in fraud detection:', error);
      return null;
    }
  }
} 