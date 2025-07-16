import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

async function diagnoseRpaLoop() {
  console.log('🔍 DIAGNÓSTICO DO SISTEMA RPA - LOOP INFINITO');
  console.log('=' .repeat(60));

  try {
    // 1. Verificar status geral do sistema
    console.log('\n📊 1. Status Geral do Sistema:');
    const statusResponse = await axios.get(`${API_BASE}/rpa/status`);
    console.log('Status:', statusResponse.data);

    // 2. Verificar workers
    console.log('\n🤖 2. Workers Registrados:');
    const workersResponse = await axios.get(`${API_BASE}/rpa/workers`);
    const workers = workersResponse.data;
    console.log(`Total de workers: ${workers.length}`);
    
    workers.forEach((worker: any) => {
      console.log(`- ${worker.name} (${worker.id}): ${worker.status}`);
      console.log(`  Último heartbeat: ${new Date(worker.lastHeartbeat).toLocaleString()}`);
      console.log(`  Tarefas completadas: ${worker.performance.tasksCompleted}`);
      console.log(`  Tarefas falharam: ${worker.performance.tasksFailed}`);
    });

    // 3. Verificar tarefas
    console.log('\n📋 3. Tarefas no Sistema:');
    const tasksResponse = await axios.get(`${API_BASE}/rpa/tasks`);
    const tasks = tasksResponse.data;
    
    const statusCount = tasks.reduce((acc: any, task: any) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Distribuição por status:', statusCount);
    
    // Mostrar tarefas pendentes
    const pendingTasks = tasks.filter((t: any) => t.status === 'PENDING');
    console.log(`\nTarefas pendentes (${pendingTasks.length}):`);
    pendingTasks.slice(0, 5).forEach((task: any) => {
      console.log(`- ${task.id}: ${task.type} (${task.priority})`);
    });

    // 4. Verificar métricas
    console.log('\n📈 4. Métricas do Sistema:');
    const metricsResponse = await axios.get(`${API_BASE}/rpa/metrics`);
    const metrics = metricsResponse.data;
    console.log('Métricas:', metrics);

    // 5. Verificar se há tarefas sendo processadas
    console.log('\n🔄 5. Tarefas em Execução:');
    const runningTasks = tasks.filter((t: any) => t.status === 'RUNNING');
    console.log(`Tarefas em execução: ${runningTasks.length}`);
    
    runningTasks.forEach((task: any) => {
      const startTime = task.startedAt ? new Date(task.startedAt) : null;
      const duration = startTime ? Date.now() - startTime.getTime() : 0;
      console.log(`- ${task.id}: ${task.type} (${Math.round(duration/1000)}s)`);
    });

    // 6. Verificar se há workers disponíveis
    console.log('\n✅ 6. Workers Disponíveis:');
    const availableWorkers = workers.filter((w: any) => w.status === 'IDLE');
    console.log(`Workers disponíveis: ${availableWorkers.length}`);
    
    if (availableWorkers.length === 0) {
      console.log('❌ PROBLEMA: Nenhum worker disponível para processar tarefas!');
      console.log('Isso pode estar causando o loop infinito.');
    }

    // 7. Verificar se há tarefas pendentes mas nenhum worker
    if (pendingTasks.length > 0 && availableWorkers.length === 0) {
      console.log('\n🚨 PROBLEMA IDENTIFICADO:');
      console.log(`- ${pendingTasks.length} tarefas pendentes`);
      console.log(`- ${availableWorkers.length} workers disponíveis`);
      console.log('O sistema está em loop porque há tarefas para processar mas nenhum worker disponível!');
    }

    // 8. Verificar logs recentes
    console.log('\n📝 8. Sugestões de Correção:');
    if (availableWorkers.length === 0) {
      console.log('1. Verificar se os workers estão sendo registrados corretamente');
      console.log('2. Verificar se o heartbeat dos workers está funcionando');
      console.log('3. Verificar se há erros na inicialização dos workers');
    }
    
    if (pendingTasks.length > 0 && availableWorkers.length > 0) {
      console.log('1. Verificar se o processamento de tarefas está funcionando');
      console.log('2. Verificar se há deadlocks no processamento');
      console.log('3. Verificar se as tarefas estão sendo atribuídas corretamente');
    }

  } catch (error: any) {
    console.error('❌ Erro no diagnóstico:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar diagnóstico
diagnoseRpaLoop().then(() => {
  console.log('\n✅ Diagnóstico concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro no diagnóstico:', error);
  process.exit(1);
}); 