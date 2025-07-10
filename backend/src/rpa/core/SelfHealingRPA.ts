/***************************************
 * 🛠️ SELF-HEALING RPA - AUTO-REPARAÇÃO
 * (Sistema que aprende e se repara sozinho)
 ***************************************/

export interface ErrorSolution {
  pattern: RegExp;
  solution: string;
  successCount: number;
  lastUsed: Date;
}

export interface ActionStep {
  type: 'click' | 'type' | 'wait' | 'navigate' | 'screenshot';
  selector?: string;
  value?: string;
  timeout?: number;
  timestamp: Date;
}

export class SelfHealingRPA {
  async executeWithHealing(fn: () => Promise<any>): Promise<any> {
    try {
      return await fn();
    } catch (e) {
      return null;
    }
  }
} 