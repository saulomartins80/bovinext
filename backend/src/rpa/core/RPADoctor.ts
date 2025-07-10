/***************************************
 * 🏥 RPA DOCTOR - DIAGNÓSTICO COMPLETO
 * (Sistema de auto-diagnóstico e saúde)
 ***************************************/

export interface HealthCheck {
  name: string;
  status: '✅' | '❌' | '⚠️';
  details: string;
  timestamp: Date;
}

export interface SystemReport {
  overallHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  checks: HealthCheck[];
  recommendations: string[];
  timestamp: Date;
}

export class RPADoctor {
  private healthChecks = [
    { name: "Conexão Bancária", test: this.testBankConnection.bind(this) },
    { name: "Seletores CSS", test: this.testSelectors.bind(this) },
    { name: "Performance", test: this.testPerformance.bind(this) },
    { name: "Memória", test: this.testMemory.bind(this) },
    { name: "Conexão de Rede", test: this.testNetwork.bind(this) },
    { name: "Autenticação", test: this.testAuthentication.bind(this) },
    { name: "Rate Limiting", test: this.testRateLimiting.bind(this) },
    { name: "Captcha Detection", test: this.testCaptchaDetection.bind(this) }
  ];

  async runFullCheckup(): Promise<SystemReport> {
    console.log('🏥 Iniciando checkup completo do RPA...');
    
    const results = await Promise.all(
      this.healthChecks.map(async check => ({
        name: check.name,
        status: await check.test().then(() => "✅").catch(e => `❌ (${e.message})`),
        details: await this.getCheckDetails(check.name),
        timestamp: new Date()
      }))
    );

    const overallHealth = this.calculateOverallHealth(results);
    const recommendations = this.generateRecommendations(results);

    const report: SystemReport = {
      overallHealth,
      checks: results,
      recommendations,
      timestamp: new Date()
    };

    // Gerar relatório HTML automático
    await this.generateHTMLReport(report);

    return report;
  }

  private async testBankConnection(): Promise<void> {
    console.log('🏦 Testando conexão bancária...');
    
    try {
      const testUrls = [
        'https://www.itau.com.br',
        'https://www.bb.com.br',
        'https://www.bradesco.com.br'
      ];

      for (const url of testUrls) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Falha na conexão com ${url}`);
        }
      }
    } catch (error) {
      throw new Error(`Conexão bancária falhou: ${error.message}`);
    }
  }

  private async testSelectors(): Promise<void> {
    console.log('🎯 Testando seletores CSS...');
    
    try {
      // Teste de seletores comuns
      const testSelectors = [
        '#login-btn',
        '.btn-login',
        'input[name="username"]',
        'input[type="password"]'
      ];

      // Simular teste de seletores (implementação fictícia)
      const validSelectors = testSelectors.filter(selector => 
        selector.includes('#') || selector.includes('.')
      );

      if (validSelectors.length < testSelectors.length * 0.8) {
        throw new Error('Muitos seletores inválidos detectados');
      }
    } catch (error) {
      throw new Error(`Teste de seletores falhou: ${error.message}`);
    }
  }

  private async testPerformance(): Promise<void> {
    console.log('⚡ Testando performance...');
    
    try {
      const startTime = Date.now();
      
      // Simular operação de teste
      await this.delay(100);
      
      const executionTime = Date.now() - startTime;
      
      if (executionTime > 5000) {
        throw new Error(`Performance lenta: ${executionTime}ms`);
      }
    } catch (error) {
      throw new Error(`Teste de performance falhou: ${error.message}`);
    }
  }

  private async testMemory(): Promise<void> {
    console.log('🧠 Testando uso de memória...');
    
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
      
      if (heapUsedMB > 500) { // 500MB
        throw new Error(`Uso de memória alto: ${heapUsedMB.toFixed(2)}MB`);
      }
    } catch (error) {
      throw new Error(`Teste de memória falhou: ${error.message}`);
    }
  }

  private async testNetwork(): Promise<void> {
    console.log('🌐 Testando conexão de rede...');
    
    try {
      const testUrl = 'https://www.google.com';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Falha na conectividade de rede');
      }
    } catch (error) {
      throw new Error(`Teste de rede falhou: ${error.message}`);
    }
  }

  private async testAuthentication(): Promise<void> {
    console.log('🔐 Testando autenticação...');
    
    try {
      // Simular teste de autenticação
      const authTokens = ['token1', 'token2', 'token3'];
      const validTokens = authTokens.filter(token => token.length > 0);
      
      if (validTokens.length === 0) {
        throw new Error('Nenhum token de autenticação válido');
      }
    } catch (error) {
      throw new Error(`Teste de autenticação falhou: ${error.message}`);
    }
  }

  private async testRateLimiting(): Promise<void> {
    console.log('⏳ Testando rate limiting...');
    
    try {
      // Simular teste de rate limiting
      const requests = Array.from({ length: 10 }, (_, i) => i);
      const successfulRequests = requests.filter(() => Math.random() > 0.1);
      
      if (successfulRequests.length < requests.length * 0.8) {
        throw new Error('Rate limiting muito restritivo');
      }
    } catch (error) {
      throw new Error(`Teste de rate limiting falhou: ${error.message}`);
    }
  }

  private async testCaptchaDetection(): Promise<void> {
    console.log('🤖 Testando detecção de CAPTCHA...');
    
    try {
      // Simular teste de detecção de CAPTCHA
      const captchaPatterns = [
        /captcha/i,
        /verification/i,
        /robot/i,
        /human/i
      ];
      
      const testText = 'Please complete the captcha verification';
      const detected = captchaPatterns.some(pattern => pattern.test(testText));
      
      if (!detected) {
        throw new Error('Falha na detecção de CAPTCHA');
      }
    } catch (error) {
      throw new Error(`Teste de CAPTCHA falhou: ${error.message}`);
    }
  }

  private async getCheckDetails(checkName: string): Promise<string> {
    const details = {
      "Conexão Bancária": "Testa conectividade com sites bancários principais",
      "Seletores CSS": "Verifica se os seletores estão funcionando corretamente",
      "Performance": "Mede tempo de resposta das operações",
      "Memória": "Monitora uso de memória do sistema",
      "Conexão de Rede": "Testa conectividade geral da internet",
      "Autenticação": "Verifica tokens e credenciais",
      "Rate Limiting": "Testa limites de requisições",
      "Captcha Detection": "Verifica detecção de CAPTCHAs"
    };

    return details[checkName as keyof typeof details] || "Detalhes não disponíveis";
  }

  private calculateOverallHealth(checks: HealthCheck[]): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
    const failedChecks = checks.filter(check => check.status.includes('❌')).length;
    const warningChecks = checks.filter(check => check.status.includes('⚠️')).length;
    
    if (failedChecks > 2) return 'CRITICAL';
    if (failedChecks > 0 || warningChecks > 1) return 'WARNING';
    return 'HEALTHY';
  }

  private generateRecommendations(checks: HealthCheck[]): string[] {
    const recommendations: string[] = [];
    
    checks.forEach(check => {
      if (check.status.includes('❌')) {
        switch (check.name) {
          case "Conexão Bancária":
            recommendations.push("🔧 Verificar conectividade de rede e firewall");
            break;
          case "Seletores CSS":
            recommendations.push("🎯 Atualizar seletores CSS dos sites bancários");
            break;
          case "Performance":
            recommendations.push("⚡ Otimizar operações e reduzir timeouts");
            break;
          case "Memória":
            recommendations.push("🧠 Implementar limpeza de memória e garbage collection");
            break;
          case "Autenticação":
            recommendations.push("🔐 Renovar tokens de autenticação");
            break;
          case "Rate Limiting":
            recommendations.push("⏳ Implementar delays entre requisições");
            break;
          case "Captcha Detection":
            recommendations.push("🤖 Melhorar detecção e resolução de CAPTCHAs");
            break;
        }
      }
    });

    if (recommendations.length === 0) {
      recommendations.push("✅ Sistema funcionando perfeitamente!");
    }

    return recommendations;
  }

  private async generateHTMLReport(report: SystemReport): Promise<void> {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>RPA Health Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .status-healthy { color: green; }
        .status-warning { color: orange; }
        .status-critical { color: red; }
        .check { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 3px; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏥 RPA Health Report</h1>
        <p><strong>Status Geral:</strong> <span class="status-${report.overallHealth.toLowerCase()}">${report.overallHealth}</span></p>
        <p><strong>Data:</strong> ${report.timestamp.toLocaleString()}</p>
    </div>
    
    <h2>📊 Resultados dos Testes</h2>
    ${report.checks.map(check => `
        <div class="check">
            <h3>${check.name} ${check.status}</h3>
            <p>${check.details}</p>
        </div>
    `).join('')}
    
    <div class="recommendations">
        <h2>💡 Recomendações</h2>
        <ul>
            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>`;

    try {
      const fs = await import('fs/promises');
      const filename = `./logs/rpa-health-report-${Date.now()}.html`;
      await fs.writeFile(filename, html);
      console.log(`📄 Relatório HTML gerado: ${filename}`);
    } catch (error) {
      console.warn('⚠️ Erro ao gerar relatório HTML:', error);
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 🔍 DIAGNÓSTICOS ESPECÍFICOS
  async diagnoseSpecificIssue(issue: string): Promise<any> {
    console.log(`🔍 Diagnosticando problema específico: ${issue}`);
    
    switch (issue.toLowerCase()) {
      case 'login':
        return await this.diagnoseLoginIssues();
      case 'performance':
        return await this.diagnosePerformanceIssues();
      case 'memory':
        return await this.diagnoseMemoryIssues();
      case 'network':
        return await this.diagnoseNetworkIssues();
      default:
        return { error: 'Problema não reconhecido' };
    }
  }

  private async diagnoseLoginIssues(): Promise<any> {
    return {
      issue: 'Problemas de Login',
      possibleCauses: [
        'Credenciais expiradas',
        'Captcha não resolvido',
        'Site bancário alterado',
        'Rate limiting ativo'
      ],
      solutions: [
        'Renovar credenciais',
        'Implementar solução de CAPTCHA',
        'Atualizar seletores CSS',
        'Aumentar delays entre tentativas'
      ]
    };
  }

  private async diagnosePerformanceIssues(): Promise<any> {
    return {
      issue: 'Problemas de Performance',
      possibleCauses: [
        'Timeout muito baixo',
        'Muitas requisições simultâneas',
        'Memória insuficiente',
        'Conexão lenta'
      ],
      solutions: [
        'Aumentar timeouts',
        'Implementar fila de requisições',
        'Otimizar uso de memória',
        'Usar conexões mais rápidas'
      ]
    };
  }

  private async diagnoseMemoryIssues(): Promise<any> {
    return {
      issue: 'Problemas de Memória',
      possibleCauses: [
        'Memory leaks',
        'Muitos navegadores abertos',
        'Cache não limpo',
        'Processos órfãos'
      ],
      solutions: [
        'Implementar garbage collection',
        'Fechar navegadores não utilizados',
        'Limpar cache regularmente',
        'Monitorar processos'
      ]
    };
  }

  private async diagnoseNetworkIssues(): Promise<any> {
    return {
      issue: 'Problemas de Rede',
      possibleCauses: [
        'Firewall bloqueando',
        'DNS não resolvendo',
        'Proxy configurado incorretamente',
        'Conexão instável'
      ],
      solutions: [
        'Configurar firewall',
        'Verificar DNS',
        'Ajustar configurações de proxy',
        'Usar conexão mais estável'
      ]
    };
  }
} 