import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

async function testRpaLoopFix() {
  console.log('🔧 TESTANDO CORREÇÃO DO LOOP INFINITO RPA');
  console.log('=' .repeat(50));

  try {
    // 1. Verificar se o backend está rodando
    console.log('\n📡 1. Verificando conexão com o backend...');
    const statusResponse = await axios.get(`${API_BASE}/rpa/status`);
    console.log('✅ Backend está rodando:', statusResponse.data.status);

    // 2. Verificar workers
    console.log('\n🤖 2. Verificando workers...');
    const workersResponse = await axios.get(`${API_BASE}/rpa/workers`);
    const workers = workersResponse.data;
    console.log(`Total de workers: ${workers.length}`);
    
    const availableWorkers = workers.filter((w: any) => w.status === 'IDLE');
    console.log(`Workers disponíveis: ${availableWorkers.length}`);

    if (availableWorkers.length === 0) {
      console.log('⚠️ Nenhum worker disponível - isso pode causar o loop infinito');
    }

    // 3. Verificar tarefas pendentes
    console.log('\n📋 3. Verificando tarefas pendentes...');
    const tasksResponse = await axios.get(`${API_BASE}/rpa/tasks`);
    const tasks = tasksResponse.data;
    
    const pendingTasks = tasks.filter((t: any) => t.status === 'PENDING');
    console.log(`Tarefas pendentes: ${pendingTasks.length}`);

    // 4. Adicionar uma tarefa de teste
    console.log('\n🧪 4. Adicionando tarefa de teste...');
    const testTaskResponse = await axios.post(`${API_BASE}/rpa/tasks`, {
      type: 'DATA_SYNC',
      priority: 'MEDIUM',
      payload: {
        operation: 'SYNC_USER_DATA',
        userId: 'test-user-123'
      },
      maxRetries: 2
    });
    
    const testTaskId = testTaskResponse.data.taskId;
    console.log(`✅ Tarefa de teste criada: ${testTaskId}`);

    // 5. Aguardar um pouco e verificar se a tarefa foi processada
    console.log('\n⏳ 5. Aguardando processamento (10 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    // 6. Verificar status da tarefa
    console.log('\n📊 6. Verificando status da tarefa...');
    const taskStatusResponse = await axios.get(`${API_BASE}/rpa/tasks/${testTaskId}`);
    const taskStatus = taskStatusResponse.data;
    console.log(`Status da tarefa ${testTaskId}: ${taskStatus.status}`);

    // 7. Verificar métricas
    console.log('\n📈 7. Verificando métricas...');
    const metricsResponse = await axios.get(`${API_BASE}/rpa/metrics`);
    const metrics = metricsResponse.data;
    console.log('Métricas atuais:', {
      totalTasks: metrics.totalTasks,
      completedTasks: metrics.completedTasks,
      pendingTasks: metrics.pendingTasks,
      runningTasks: metrics.runningTasks
    });

    // 8. Verificar se há loop infinito
    console.log('\n🔍 8. Verificando se há loop infinito...');
    const currentPendingTasks = tasks.filter((t: any) => t.status === 'PENDING').length;
    
    if (currentPendingTasks === pendingTasks.length + 1) {
      console.log('❌ PROBLEMA: Tarefa ainda pendente - possível loop infinito');
      console.log('Sugestões:');
      console.log('1. Verificar se há workers disponíveis');
      console.log('2. Verificar se o processamento está funcionando');
      console.log('3. Verificar logs do sistema');
    } else {
      console.log('✅ Tarefa foi processada - não há loop infinito');
    }

    // 9. Limpar tarefa de teste
    console.log('\n🧹 9. Limpando tarefa de teste...');
    try {
      await axios.delete(`${API_BASE}/rpa/tasks/${testTaskId}`);
      console.log('✅ Tarefa de teste removida');
    } catch (error) {
      console.log('⚠️ Não foi possível remover a tarefa de teste');
    }

  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    }
  }
}

// Executar teste
testRpaLoopFix().then(() => {
  console.log('\n✅ Teste concluído');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro no teste:', error);
  process.exit(1);
}); 