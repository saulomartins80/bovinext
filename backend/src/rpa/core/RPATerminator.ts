/***************************************
 * ⚔️ RPA TERMINATOR - AUTO-CURA
 * (Sistema de tratamento de erros avançado)
 ***************************************/

export interface ErrorSolution {
  pattern: RegExp;
  action: () => Promise<void>;
  successRate: number;
  lastUsed: Date;
}

export class RPATerminator {
  private solutions: ErrorSolution[] = [
    {
      pattern: /element not found|selector.*not found/i,
      action: async () => {
        await this.reloadPage();
        await this.delay(2000);
      },
      successRate: 0.8,
      lastUsed: new Date()
    },
    {
      pattern: /timeout|exceeded/i,
      action: async () => {
        await this.increaseTimeout(5000);
      },
      successRate: 0.7,
      lastUsed: new Date()
    },
    {
      pattern: /network.*error|connection.*failed/i,
      action: async () => {
        await this.restartConnection();
      },
      successRate: 0.6,
      lastUsed: new Date()
    },
    {
      pattern: /captcha|verification/i,
      action: async () => {
        await this.solveCaptcha();
      },
      successRate: 0.5,
      lastUsed: new Date()
    },
    {
      pattern: /session.*expired|login.*required/i,
      action: async () => {
        await this.relogin();
      },
      successRate: 0.9,
      lastUsed: new Date()
    },
    {
      pattern: /rate.*limit|too.*many.*requests/i,
      action: async () => {
        await this.handleRateLimit();
      },
      successRate: 0.7,
      lastUsed: new Date()
    },
    {
      pattern: /forbidden|403|unauthorized/i,
      action: async () => {
        await this.switchIdentity();
      },
      successRate: 0.6,
      lastUsed: new Date()
    }
  ];

  async handleError(error: Error): Promise<'RECOVERED' | 'CRITICAL'> {
    console.log(`💥 Erro detectado: ${error.message}`);
    
    const solution = this.solutions.find(s => s.pattern.test(error.message));
    
    if (solution) {
      try {
        await solution.action();
        solution.successRate = Math.min(1, solution.successRate + 0.1);
        solution.lastUsed = new Date();
        console.log('✅ Erro recuperado com sucesso');
        return 'RECOVERED';
      } catch (recoveryError) {
        solution.successRate = Math.max(0, solution.successRate - 0.2);
        console.error('❌ Falha na recuperação:', recoveryError.message);
        return 'CRITICAL';
      }
    }
    
    console.error('❌ Nenhuma solução encontrada para o erro');
    return 'CRITICAL';
  }

  async executeWithTerminator(action: () => Promise<void>): Promise<void> {
    try {
      return await action();
    } catch (error) {
      const result = await this.handleError(error as Error);
      
      if (result === 'RECOVERED') {
        console.log('🔥 Aplicando solução e tentando novamente...');
        await this.applySolution();
        return this.executeWithTerminator(action); // Tenta novamente
      } else {
        throw new Error(`❌ Erro crítico não recuperável: ${error.message}`);
      }
    }
  }

  private async reloadPage(): Promise<void> {
    console.log('🔄 Recarregando página...');
    // Implementar recarregamento da página
    await this.delay(2000);
  }

  private async increaseTimeout(ms: number): Promise<void> {
    console.log(`⏰ Aumentando timeout para ${ms}ms...`);
    // Implementar aumento de timeout
    await this.delay(ms);
  }

  private async restartConnection(): Promise<void> {
    console.log('🌐 Reiniciando conexão...');
    // Implementar reinicialização de conexão
    await this.delay(3000);
  }

  private async solveCaptcha(): Promise<void> {
    console.log('🤖 Resolvendo CAPTCHA...');
    // Implementar solução de CAPTCHA
    await this.delay(5000);
  }

  private async relogin(): Promise<void> {
    console.log('🔐 Refazendo login...');
    // Implementar novo login
    await this.delay(3000);
  }

  private async handleRateLimit(): Promise<void> {
    console.log('⏳ Aguardando rate limit...');
    // Implementar tratamento de rate limit
    await this.delay(10000);
  }

  private async switchIdentity(): Promise<void> {
    console.log('🕵️ Trocando identidade...');
    // Implementar troca de identidade
    await this.delay(2000);
  }

  private async applySolution(): Promise<void> {
    console.log('🛠️ Aplicando solução genérica...');
    await this.delay(2000);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 📊 MÉTRICAS DE PERFORMANCE
  getSuccessRate(): number {
    const totalSuccess = this.solutions.reduce((sum, s) => sum + s.successRate, 0);
    return totalSuccess / this.solutions.length;
  }

  getMostSuccessfulSolutions(): ErrorSolution[] {
    return this.solutions
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3);
  }

  getRecentErrors(): ErrorSolution[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.solutions.filter(s => s.lastUsed > oneHourAgo);
  }
} 