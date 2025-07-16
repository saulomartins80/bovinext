#!/usr/bin/env ts-node

/**
 * 🚀 SCRIPT DE TESTE PARA CRIAÇÃO DINÂMICA DE TAREFAS RPA
 * 
 * Este script testa a criação de tarefas via API para ativar
 * o sistema RPA dinamicamente.
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/rpa';

// Configuração do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 🎯 TIPOS DE TAREFAS DISPONÍVEIS
const TASK_TYPES = [
  'DATA_SYNC',
  'REPORT_GENERATION', 
  'USER_ANALYSIS',
  'MARKET_UPDATE',
  'CLEANUP',
  'CUSTOM'
];

// 🎨 PRIORIDADES DISPONÍVEIS
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

// 📊 PAYLOADS DE EXEMPLO PARA CADA TIPO
const TASK_PAYLOADS = {
  DATA_SYNC: {
    operation: 'SYNC_USER_DATA',
    userId: 'test-user-123',
    dataTypes: ['transactions', 'goals', 'investments']
  },
  REPORT_GENERATION: {
    operation: 'GENERATE_MONTHLY_REPORT',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    reportType: 'financial_summary'
  },
  USER_ANALYSIS: {
    operation: 'ANALYZE_USER_BEHAVIOR',
    userId: 'test-user-456',
    analysisType: 'spending_patterns'
  },
  MARKET_UPDATE: {
    operation: 'UPDATE_STOCK_PRICES',
    symbols: ['PETR4', 'VALE3', 'ITUB4', 'BBDC4'],
    updateType: 'real_time'
  },
  CLEANUP: {
    operation: 'CLEANUP_OLD_DATA',
    dataTypes: ['logs', 'temp_files', 'cache'],
    retentionDays: 30
  },
  CUSTOM: {
    operation: 'CUSTOM_ANALYSIS',
    userId: 'test-user-789',
    customAction: 'analyze_investment_portfolio'
  }
};

// 🚀 FUNÇÕES DE TESTE

/**
 * Testa a criação de uma única tarefa
 */
async function testSingleTaskCreation() {
  console.log('\n🎯 TESTANDO CRIAÇÃO DE TAREFA ÚNICA');
  console.log('=====================================');

  try {
    const randomType = TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
    const randomPriority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
    const payload = TASK_PAYLOADS[randomType as keyof typeof TASK_PAYLOADS];

    console.log(`📋 Criando tarefa: ${randomType} (${randomPriority})`);

    const response = await api.post('/tasks/create', {
      type: randomType,
      priority: randomPriority,
      payload,
      userId: 'test-user-' + Date.now()
    });

    if (response.data.success) {
      console.log('✅ Tarefa criada com sucesso!');
      console.log(`   ID: ${response.data.taskId}`);
      console.log(`   Tipo: ${response.data.task.type}`);
      console.log(`   Prioridade: ${response.data.task.priority}`);
      console.log(`   Status: ${response.data.task.status}`);
      return response.data.taskId;
    } else {
      console.log('❌ Erro ao criar tarefa:', response.data.error);
      return null;
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Testa a criação de múltiplas tarefas em lote
 */
async function testBatchTaskCreation() {
  console.log('\n🎯 TESTANDO CRIAÇÃO DE TAREFAS EM LOTE');
  console.log('=======================================');

  try {
    const batchTasks: any[] = [];
    
    // Criar 5 tarefas diferentes
    for (let i = 0; i < 5; i++) {
      const randomType = TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
      const randomPriority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
      const payload = TASK_PAYLOADS[randomType as keyof typeof TASK_PAYLOADS];

      batchTasks.push({
        type: randomType,
        priority: randomPriority,
        payload: {
          ...payload,
          batchIndex: i + 1,
          timestamp: new Date().toISOString()
        },
        userId: `batch-user-${i + 1}`
      });
    }

    console.log(`📋 Criando ${batchTasks.length} tarefas em lote...`);

    const response = await api.post('/tasks/batch', {
      tasks: batchTasks
    });

    if (response.data.success) {
      console.log('✅ Tarefas em lote criadas com sucesso!');
      console.log(`   Total: ${response.data.summary.total}`);
      console.log(`   Criadas: ${response.data.summary.created}`);
      console.log(`   Falharam: ${response.data.summary.failed}`);
      
      if (response.data.createdTasks.length > 0) {
        console.log('\n📋 Tarefas criadas:');
        response.data.createdTasks.forEach((task: any, index: number) => {
          console.log(`   ${index + 1}. ${task.type} (${task.priority}) - ${task.id}`);
        });
      }

      if (response.data.errors.length > 0) {
        console.log('\n❌ Erros:');
        response.data.errors.forEach((error: any, index: number) => {
          console.log(`   ${index + 1}. ${error.error}`);
        });
      }

      return response.data.createdTasks.map((task: any) => task.id);
    } else {
      console.log('❌ Erro ao criar tarefas em lote:', response.data.error);
      return [];
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Lista todas as tarefas atuais
 */
async function listAllTasks() {
  console.log('\n📊 LISTANDO TODAS AS TAREFAS');
  console.log('=============================');

  try {
    const response = await api.get('/tasks?limit=20');

    if (response.data.success) {
      console.log(`📋 Total de tarefas: ${response.data.total}`);
      
      if (response.data.tasks.length > 0) {
        console.log('\n📋 Últimas tarefas:');
        response.data.tasks.slice(0, 10).forEach((task: any, index: number) => {
          const status = task.status === 'COMPLETED' ? '✅' : 
                        task.status === 'RUNNING' ? '🔄' : 
                        task.status === 'FAILED' ? '❌' : '⏳';
          
          console.log(`   ${index + 1}. ${status} ${task.type} (${task.priority}) - ${task.id}`);
          console.log(`      Status: ${task.status} | Criada: ${task.createdAt}`);
        });
      } else {
        console.log('📭 Nenhuma tarefa encontrada');
      }
    } else {
      console.log('❌ Erro ao listar tarefas:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.response?.data || error.message);
  }
}

/**
 * Verifica o status do sistema
 */
async function checkSystemStatus() {
  console.log('\n🔍 VERIFICANDO STATUS DO SISTEMA');
  console.log('=================================');

  try {
    const response = await api.get('/status');

    if (response.data.status === 'OK') {
      console.log('✅ Sistema RPA está funcionando');
      console.log(`   Ambiente: ${response.data.environment}`);
      console.log(`   Uptime: ${Math.floor(response.data.metrics.uptime)}s`);
      console.log(`   Memória: ${Math.round(response.data.metrics.memory.heapUsed / 1024 / 1024)}MB`);
    } else {
      console.log('❌ Sistema RPA com problemas:', response.data);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar status:', error.response?.data || error.message);
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 INICIANDO TESTES DE CRIAÇÃO DE TAREFAS RPA');
  console.log('=============================================');
  console.log(`🌐 API Base URL: ${API_BASE_URL}`);

  // 1. Verificar status do sistema
  await checkSystemStatus();

  // 2. Listar tarefas existentes
  await listAllTasks();

  // 3. Testar criação de tarefa única
  const singleTaskId = await testSingleTaskCreation();

  // 4. Testar criação de tarefas em lote
  const batchTaskIds = await testBatchTaskCreation();

  // 5. Aguardar um pouco para processamento
  console.log('\n⏳ Aguardando 3 segundos para processamento...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 6. Listar tarefas novamente para ver as novas
  await listAllTasks();

  // 7. Resumo final
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('====================');
  console.log(`✅ Tarefa única criada: ${singleTaskId ? 'SIM' : 'NÃO'}`);
  console.log(`✅ Tarefas em lote criadas: ${batchTaskIds.length}`);
  console.log(`📋 Total de novas tarefas: ${batchTaskIds.length + (singleTaskId ? 1 : 0)}`);

  console.log('\n🎉 Testes concluídos!');
  console.log('\n💡 Para criar mais tarefas, use:');
  console.log('   curl -X POST http://localhost:5000/api/rpa/tasks/create \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"type": "DATA_SYNC", "priority": "MEDIUM", "payload": {"operation": "test"}}\'');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export {
  testSingleTaskCreation,
  testBatchTaskCreation,
  listAllTasks,
  checkSystemStatus
}; 