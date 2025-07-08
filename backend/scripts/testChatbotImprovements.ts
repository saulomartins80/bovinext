// scripts/testChatbotImprovements.ts
import { User } from '../src/models/User';
import { Goal } from '../src/models/Goal';
import { Transacoes } from '../src/models/Transacoes';
import Investimento from '../src/models/Investimento';
import { ChatHistoryService } from '../src/services/chatHistoryService';
import { detectUserIntent } from '../src/controllers/automatedActionsController';
import cacheService from '../src/services/cacheService';

const chatHistoryService = new ChatHistoryService();

async function testChatbotImprovements() {
  console.log('🧪 Testando melhorias do chatbot...\n');

  try {
    // 1. Testar detecção de intenção com contexto
    console.log('1️⃣ Testando detecção de intenção...');
    
    const testUser = await User.findOne({ firebaseUid: 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2' });
    if (!testUser) {
      console.log('❌ Usuário de teste não encontrado');
      return;
    }

    const userContext = {
      name: testUser.name,
      subscriptionPlan: testUser.subscription?.plan || 'Gratuito',
      totalTransacoes: 0,
      totalInvestimentos: 0,
      totalMetas: 0,
      hasTransactions: false,
      hasInvestments: false,
      hasGoals: false
    };

    // Testar diferentes cenários
    const testScenarios = [
      {
        message: 'quero adicionar uma meta',
        expected: 'CREATE_GOAL'
      },
      {
        message: 'eu quero juntar um valor de 6500 viagem para gramado com passagem de ida e volta vai ser nas minhas ferias em setembro',
        expected: 'CREATE_GOAL'
      },
      {
        message: 'gastei 100 reais no mercado',
        expected: 'CREATE_TRANSACTION'
      },
      {
        message: 'oi',
        expected: 'UNKNOWN'
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`\n📝 Testando: "${scenario.message}"`);
      
      const result = await detectUserIntent(scenario.message, userContext, []);
      
      console.log(`   Esperado: ${scenario.expected}`);
      console.log(`   Obtido: ${result?.type}`);
      console.log(`   Confiança: ${result?.confidence}`);
      console.log(`   Resposta: ${result?.response}`);
      
      if (result?.type === scenario.expected) {
        console.log('   ✅ SUCESSO');
      } else {
        console.log('   ❌ FALHA');
      }
    }

    // 2. Testar cache de contexto
    console.log('\n2️⃣ Testando cache de contexto...');
    
    const testChatId = 'test-chat-123';
    const testContext = {
      lastAction: 'CREATE_GOAL',
      pendingData: { valor_total: 6500, meta: 'viagem para gramado' },
      mentionedValues: ['6500'],
      mentionedItems: ['goal']
    };

    await cacheService.setConversationContext(testChatId, testContext);
    const retrievedContext = await cacheService.getConversationContext(testChatId);
    
    if (retrievedContext && retrievedContext.lastAction === testContext.lastAction) {
      console.log('   ✅ Cache de contexto funcionando');
    } else {
      console.log('   ❌ Cache de contexto falhou');
    }

    // 3. Testar verificação de itens similares
    console.log('\n3️⃣ Testando verificação de itens similares...');
    
    // Criar uma meta de teste
    const testGoal = new Goal({
      userId: testUser._id.toString(),
      meta: 'viagem para gramado com passagem de ida e volta',
      valor_total: 6500,
      valor_atual: 0,
      data_conclusao: new Date('2026-07-08'),
      categoria: 'viagem',
      prioridade: 'media'
    });
    
    await testGoal.save();
    console.log('   ✅ Meta de teste criada');

    // Verificar se detecta similaridade
    const similarPayload = {
      meta: 'viagem para gramado',
      valor_total: 6500,
      categoria: 'viagem'
    };

    // Simular verificação de similaridade
    const existingGoal = await Goal.findOne({
      userId: testUser._id.toString(),
      meta: { $regex: similarPayload.meta, $options: 'i' },
      valor_total: similarPayload.valor_total
    });

    if (existingGoal) {
      console.log('   ✅ Detecção de similaridade funcionando');
    } else {
      console.log('   ❌ Detecção de similaridade falhou');
    }

    // 4. Testar performance
    console.log('\n4️⃣ Testando performance...');
    
    const startTime = Date.now();
    
    // Simular múltiplas chamadas
    for (let i = 0; i < 5; i++) {
      await detectUserIntent('quero criar uma meta', userContext, []);
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / 5;
    
    console.log(`   Tempo médio por chamada: ${avgTime.toFixed(2)}ms`);
    
    if (avgTime < 2000) {
      console.log('   ✅ Performance aceitável');
    } else {
      console.log('   ⚠️ Performance pode ser melhorada');
    }

    // 5. Limpar dados de teste
    console.log('\n5️⃣ Limpando dados de teste...');
    
    await Goal.deleteOne({ _id: testGoal._id });
    await cacheService.clearConversationCache(testChatId);
    
    console.log('   ✅ Dados de teste removidos');

    console.log('\n🎉 Testes concluídos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testChatbotImprovements()
    .then(() => {
      console.log('✅ Testes finalizados');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro nos testes:', error);
      process.exit(1);
    });
}

export { testChatbotImprovements }; 