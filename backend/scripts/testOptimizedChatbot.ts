import { OptimizedAIService } from '../src/services/OptimizedAIService';
import { OptimizedChatbotController } from '../src/controllers/OptimizedChatbotController';
import { ChatbotMigration, ChatbotMonitor, ChatbotHealthCheck } from '../src/config/optimizedChatbotConfig';

// ===== SISTEMA DE TESTES AUTOMATIZADOS =====
class OptimizedChatbotTester {
  private aiService: OptimizedAIService;
  private controller: OptimizedChatbotController;
  private testResults: Array<{
    test: string;
    success: boolean;
    responseTime: number;
    details: any;
  }> = [];

  constructor() {
    this.aiService = new OptimizedAIService();
    this.controller = OptimizedChatbotController.getInstance();
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Iniciando testes do sistema otimizado...\n');

    await this.testPerformance();
    await this.testIntentDetection();
    await this.testAutomation();
    await this.testCaching();
    await this.testErrorHandling();
    await this.testHealthCheck();

    this.printResults();
  }

  // ===== TESTE DE PERFORMANCE =====
  async testPerformance(): Promise<void> {
    console.log('⚡ Testando performance...');
    
    const testMessages = [
      'Olá, como você está?',
      'Quero criar uma transação de R$ 100',
      'Analise meus gastos do mês',
      'Como funciona o sistema de investimentos?',
      'Preciso de ajuda com milhas'
    ];

    const startTime = Date.now();
    const promises = testMessages.map(async (message, index) => {
      const messageStart = Date.now();
      
      try {
        const result = await this.aiService.generateResponse(
          `test_user_${index}`,
          message,
          [],
          { userId: `test_user_${index}` }
        );
        
        const responseTime = Date.now() - messageStart;
        
        return {
          message,
          success: true,
          responseTime,
          cached: result.cached || false,
          confidence: result.confidence || 0
        };
      } catch (error) {
        return {
          message,
          success: false,
          responseTime: Date.now() - messageStart,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    const successRate = (results.filter(r => r.success).length / results.length) * 100;
    
    this.testResults.push({
      test: 'Performance',
      success: avgResponseTime < 2000 && successRate > 80, // Menos de 2s e 80% de sucesso
      responseTime: totalTime,
      details: {
        averageResponseTime: avgResponseTime,
        successRate,
        totalMessages: results.length,
        parallelExecution: true
      }
    });

    console.log(`  ✅ Tempo médio de resposta: ${avgResponseTime.toFixed(0)}ms`);
    console.log(`  ✅ Taxa de sucesso: ${successRate.toFixed(1)}%`);
    console.log(`  ✅ Execução paralela: ${totalTime.toFixed(0)}ms\n`);
  }

  // ===== TESTE DE DETECÇÃO DE INTENÇÕES =====
  async testIntentDetection(): Promise<void> {
    console.log('🎯 Testando detecção de intenções...');
    
    const intentTests = [
      { message: 'Gastei R$ 50 no supermercado', expectedIntent: 'CREATE_TRANSACTION' },
      { message: 'Quero juntar R$ 5000 para uma viagem', expectedIntent: 'CREATE_GOAL' },
      { message: 'Investi R$ 1000 no Tesouro Direto', expectedIntent: 'CREATE_INVESTMENT' },
      { message: 'Como estão meus gastos este mês?', expectedIntent: 'ANALYZE_DATA' },
      { message: 'Preciso de ajuda com milhas do Smiles', expectedIntent: 'MILEAGE' },
      { message: 'Oi, tudo bem?', expectedIntent: 'GREETING' }
    ];

    let correctDetections = 0;
    const detectionResults: Array<{
      message: string;
      expected: string;
      detected: string | undefined;
      confidence: number | undefined;
      correct: boolean;
    }> = [];

    for (const test of intentTests) {
      try {
        const result = await this.aiService.generateResponse(
          'test_intent_user',
          test.message,
          [],
          { userId: 'test_intent_user' }
        );

        const isCorrect = result.intent === test.expectedIntent;
        if (isCorrect) correctDetections++;

        detectionResults.push({
          message: test.message,
          expected: test.expectedIntent,
          detected: result.intent,
          confidence: result.confidence,
          correct: isCorrect
        });

        console.log(`  ${isCorrect ? '✅' : '❌'} "${test.message}" -> ${result.intent} (${(result.confidence || 0 * 100).toFixed(0)}%)`);
      } catch (error) {
        console.log(`  ❌ "${test.message}" -> ERROR: ${error}`);
        detectionResults.push({
          message: test.message,
          expected: test.expectedIntent,
          detected: 'ERROR',
          confidence: 0,
          correct: false
        });
      }
    }

    const accuracy = (correctDetections / intentTests.length) * 100;

    this.testResults.push({
      test: 'Intent Detection',
      success: accuracy > 70, // 70% de precisão mínima
      responseTime: 0,
      details: {
        accuracy,
        correctDetections,
        totalTests: intentTests.length,
        results: detectionResults
      }
    });

    console.log(`  📊 Precisão: ${accuracy.toFixed(1)}% (${correctDetections}/${intentTests.length})\n`);
  }

  // ===== TESTE DE AUTOMAÇÃO =====
  async testAutomation(): Promise<void> {
    console.log('🤖 Testando sistema de automação...');
    
    const automationTests = [
      {
        message: 'Gastei R$ 25 no almoço',
        shouldAutomate: true,
        expectedAction: 'CREATE_TRANSACTION'
      },
      {
        message: 'Investi R$ 2000 em ações',
        shouldAutomate: false, // Valor alto, deve pedir confirmação
        expectedAction: 'CREATE_INVESTMENT'
      },
      {
        message: 'Olá!',
        shouldAutomate: true,
        expectedAction: 'GREETING'
      }
    ];

    let automationSuccess = 0;

    for (const test of automationTests) {
      try {
        const result = await this.aiService.generateResponse(
          'test_automation_user',
          test.message,
          [],
          { userId: 'test_automation_user' }
        );

        const wasAutomated = !result.requiresConfirmation;
        const correctAutomation = wasAutomated === test.shouldAutomate;

        if (correctAutomation) automationSuccess++;

        console.log(`  ${correctAutomation ? '✅' : '❌'} "${test.message}" -> ${wasAutomated ? 'Automatizado' : 'Requer confirmação'}`);
      } catch (error) {
        console.log(`  ❌ "${test.message}" -> ERROR: ${error}`);
      }
    }

    const automationAccuracy = (automationSuccess / automationTests.length) * 100;

    this.testResults.push({
      test: 'Automation',
      success: automationAccuracy > 70,
      responseTime: 0,
      details: {
        accuracy: automationAccuracy,
        successfulAutomations: automationSuccess,
        totalTests: automationTests.length
      }
    });

    console.log(`  🎯 Precisão da automação: ${automationAccuracy.toFixed(1)}%\n`);
  }

  // ===== TESTE DE CACHE =====
  async testCaching(): Promise<void> {
    console.log('💾 Testando sistema de cache...');
    
    const testMessage = 'Como funciona o sistema de investimentos?';
    const userId = 'test_cache_user';

    // Primeira chamada (sem cache)
    const start1 = Date.now();
    const result1 = await this.aiService.generateResponse(userId, testMessage, [], { userId });
    const time1 = Date.now() - start1;

    // Segunda chamada (com cache)
    const start2 = Date.now();
    const result2 = await this.aiService.generateResponse(userId, testMessage, [], { userId });
    const time2 = Date.now() - start2;

    const cacheWorking = result2.cached === true;
    const speedImprovement = time2 < time1 * 0.5; // 50% mais rápido

    this.testResults.push({
      test: 'Caching',
      success: cacheWorking && speedImprovement,
      responseTime: time2,
      details: {
        firstCallTime: time1,
        secondCallTime: time2,
        speedImprovement: ((time1 - time2) / time1 * 100).toFixed(1) + '%',
        cacheHit: result2.cached
      }
    });

    console.log(`  ✅ Primeira chamada: ${time1}ms`);
    console.log(`  ✅ Segunda chamada: ${time2}ms (${result2.cached ? 'CACHE HIT' : 'CACHE MISS'})`);
    console.log(`  📈 Melhoria: ${((time1 - time2) / time1 * 100).toFixed(1)}%\n`);
  }

  // ===== TESTE DE TRATAMENTO DE ERROS =====
  async testErrorHandling(): Promise<void> {
    console.log('🛡️ Testando tratamento de erros...');
    
    const errorTests = [
      { message: '', description: 'Mensagem vazia' },
      { message: 'a'.repeat(2000), description: 'Mensagem muito longa' },
      { message: 'Teste com caracteres especiais: 🚀💰📊', description: 'Caracteres especiais' }
    ];

    let errorHandlingSuccess = 0;

    for (const test of errorTests) {
      try {
        const result = await this.aiService.generateResponse(
          'test_error_user',
          test.message,
          [],
          { userId: 'test_error_user' }
        );

        // Se chegou aqui, o erro foi tratado graciosamente
        const hasResponse = result.text && result.text.length > 0;
        if (hasResponse) errorHandlingSuccess++;

        console.log(`  ${hasResponse ? '✅' : '❌'} ${test.description}: ${hasResponse ? 'Tratado' : 'Falhou'}`);
      } catch (error) {
        console.log(`  ❌ ${test.description}: Erro não tratado - ${error}`);
      }
    }

    const errorHandlingRate = (errorHandlingSuccess / errorTests.length) * 100;

    this.testResults.push({
      test: 'Error Handling',
      success: errorHandlingRate > 60, // 60% dos casos de erro tratados
      responseTime: 0,
      details: {
        handlingRate: errorHandlingRate,
        successfulHandling: errorHandlingSuccess,
        totalTests: errorTests.length
      }
    });

    console.log(`  🛡️ Taxa de tratamento: ${errorHandlingRate.toFixed(1)}%\n`);
  }

  // ===== TESTE DE HEALTH CHECK =====
  async testHealthCheck(): Promise<void> {
    console.log('🏥 Testando health check...');
    
    try {
      const healthResult = await ChatbotHealthCheck.checkHealth();
      const isHealthy = healthResult.status === 'healthy';
      
      this.testResults.push({
        test: 'Health Check',
        success: isHealthy,
        responseTime: 0,
        details: healthResult
      });

      console.log(`  📊 Status: ${healthResult.status.toUpperCase()}`);
      
      for (const [check, result] of Object.entries(healthResult.checks)) {
        console.log(`  ${result.status ? '✅' : '❌'} ${check}: ${result.message}`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`  ❌ Health check falhou: ${error}\n`);
    }
  }

  // ===== RELATÓRIO FINAL =====
  private printResults(): void {
    console.log('📋 RELATÓRIO FINAL DOS TESTES\n');
    console.log('=' .repeat(50));
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const overallSuccess = (passedTests / totalTests) * 100;

    for (const result of this.testResults) {
      const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
      console.log(`${status} - ${result.test}`);
      
      if (result.details) {
        const details = Object.entries(result.details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        console.log(`    ${details}`);
      }
    }

    console.log('=' .repeat(50));
    console.log(`📊 RESULTADO GERAL: ${passedTests}/${totalTests} testes passaram (${overallSuccess.toFixed(1)}%)`);
    
    if (overallSuccess >= 80) {
      console.log('🎉 SISTEMA OTIMIZADO FUNCIONANDO PERFEITAMENTE!');
    } else if (overallSuccess >= 60) {
      console.log('⚠️ Sistema funcionando, mas precisa de ajustes');
    } else {
      console.log('🚨 Sistema precisa de correções importantes');
    }

    // Métricas do monitor
    const metrics = ChatbotMonitor.getMetrics();
    console.log('\n📈 MÉTRICAS DE PERFORMANCE:');
    console.log(`   Tempo médio de resposta: ${metrics.averageResponseTime.toFixed(0)}ms`);
    console.log(`   Taxa de sucesso: ${metrics.successRate.toFixed(1)}%`);
    console.log(`   Uso de memória: ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`);
  }
}

// ===== EXECUÇÃO DOS TESTES =====
async function runTests() {
  try {
    console.log('🔧 Verificando migração...');
    const migrationResult = await ChatbotMigration.migrateToOptimized();
    
    if (!migrationResult.success) {
      console.error('❌ Falha na migração:', migrationResult.message);
      return;
    }
    
    console.log('✅ Migração concluída com sucesso!\n');
    
    const tester = new OptimizedChatbotTester();
    await tester.runAllTests();
    
  } catch (error) {
    console.error('💥 Erro durante os testes:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests();
}

export { OptimizedChatbotTester, runTests };
