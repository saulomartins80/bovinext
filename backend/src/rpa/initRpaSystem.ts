import { robotOrchestrator } from './RobotOrchestrator';
import { DataSyncWorker } from './workers/DataSyncWorker';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'rpa-init' },
  transports: [
    new winston.transports.File({ filename: 'logs/rpa-init.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export async function initializeRpaSystem(): Promise<void> {
  try {
    logger.info('🚀 Iniciando sistema RPA do Finnnextho...');

    // 1. Registrar workers (simplificado)
    logger.info('🤖 Registrando workers...');
    
    try {
      const dataSyncWorker = new DataSyncWorker();
      const dataSyncWorkerId = await dataSyncWorker.register();
      logger.info(`✅ DataSyncWorker registrado: ${dataSyncWorkerId}`);
    } catch (workerError) {
      logger.warn('⚠️ Erro ao registrar worker (continuando):', workerError);
    }

    // 2. Iniciar orquestração (simplificado)
    logger.info('🎼 Iniciando orquestração...');
    try {
      await robotOrchestrator.startOrchestration();
      logger.info('✅ Orquestração iniciada');
    } catch (orchestrationError) {
      logger.warn('⚠️ Erro na orquestração (continuando):', orchestrationError);
    }

    // 3. Configurar listeners de eventos
    setupEventListeners();

    // 4. Adicionar tarefas de manutenção periódica (opcional)
    try {
      await setupPeriodicTasks();
    } catch (taskError) {
      logger.warn('⚠️ Erro ao configurar tarefas periódicas (continuando):', taskError);
    }

    logger.info('🎉 Sistema RPA inicializado com sucesso!');
    
    // Log das métricas iniciais (opcional)
    try {
      const metrics = await robotOrchestrator.getMetrics();
      logger.info('📊 Métricas iniciais:', metrics);
    } catch (metricsError) {
      logger.warn('⚠️ Erro ao obter métricas (continuando):', metricsError);
    }

  } catch (error) {
    logger.error('❌ Erro ao inicializar sistema RPA:', error);
    // Não lançar erro para não interromper o servidor
    logger.info('🔄 Continuando inicialização do servidor...');
  }
}

function setupEventListeners(): void {
  // Listener para tarefas adicionadas
  robotOrchestrator.on('taskAdded', (task) => {
    logger.info(`📋 Nova tarefa adicionada: ${task.id} (${task.type})`);
  });

  // Listener para mudanças de status
  robotOrchestrator.on('taskStatusUpdated', ({ taskId, status, error }) => {
    if (error) {
      logger.error(`❌ Tarefa ${taskId} falhou: ${error}`);
    } else {
      logger.info(`🔄 Tarefa ${taskId} atualizada para: ${status}`);
    }
  });

  // Listener para workers registrados
  robotOrchestrator.on('workerRegistered', (worker) => {
    logger.info(`🤖 Worker registrado: ${worker.id} (${worker.name})`);
  });

  // Listener para workers offline
  robotOrchestrator.on('workerOffline', (workerId) => {
    logger.warn(`⚠️ Worker offline: ${workerId}`);
  });

  // Listener para métricas atualizadas
  robotOrchestrator.on('metricsUpdated', (metrics) => {
    logger.info(`📊 Métricas atualizadas: ${metrics.completedTasks}/${metrics.totalTasks} tarefas concluídas`);
  });

  logger.info('👂 Listeners de eventos configurados');
}

async function setupPeriodicTasks(): Promise<void> {
  try {
    // Tarefa de limpeza diária (executa às 2h da manhã)
    const cleanupTask = await robotOrchestrator.addTask({
      type: 'CLEANUP',
      priority: 'LOW',
      payload: {
        operation: 'CLEANUP_OLD_DATA',
        schedule: 'daily',
        time: '02:00'
      },
      maxRetries: 1,
      metadata: {
        estimatedDuration: 300000, // 5 minutos
        tags: ['maintenance', 'cleanup']
      }
    });

    logger.info(`🧹 Tarefa de limpeza periódica configurada: ${cleanupTask}`);

    // Tarefa de análise de usuários premium (executa às 6h da manhã)
    const analysisTask = await robotOrchestrator.addTask({
      type: 'USER_ANALYSIS',
      priority: 'MEDIUM',
      payload: {
        operation: 'ANALYZE_PREMIUM_USERS',
        schedule: 'daily',
        time: '06:00'
      },
      maxRetries: 3,
      metadata: {
        estimatedDuration: 1800000, // 30 minutos
        tags: ['analysis', 'premium']
      }
    });

    logger.info(`📈 Tarefa de análise periódica configurada: ${analysisTask}`);

  } catch (error) {
    logger.error('❌ Erro ao configurar tarefas periódicas:', error);
  }
}

export async function shutdownRpaSystem(): Promise<void> {
  try {
    logger.info('🛑 Finalizando sistema RPA...');
    
    // Parar orquestração
    await robotOrchestrator.stopOrchestration();
    logger.info('✅ Orquestração parada');

    // Limpar recursos
    await robotOrchestrator.cleanup();
    logger.info('✅ Recursos limpos');

    logger.info('🎉 Sistema RPA finalizado com sucesso!');
  } catch (error) {
    logger.error('❌ Erro ao finalizar sistema RPA:', error);
    throw error;
  }
}

// Função para obter status do sistema
export async function getRpaSystemStatus(): Promise<any> {
  try {
    const metrics = await robotOrchestrator.getMetrics();
    const workers = await robotOrchestrator.getAllWorkers();
    const tasks = await robotOrchestrator.getAllTasks();

    return {
      status: 'RUNNING',
      metrics,
      workers: {
        total: workers.length,
        online: workers.filter(w => w.status !== 'OFFLINE').length,
        busy: workers.filter(w => w.status === 'BUSY').length,
        idle: workers.filter(w => w.status === 'IDLE').length
      },
      tasks: {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'PENDING').length,
        running: tasks.filter(t => t.status === 'RUNNING').length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
        failed: tasks.filter(t => t.status === 'FAILED').length
      },
      lastUpdate: new Date()
    };
  } catch (error) {
    logger.error('❌ Erro ao obter status do sistema:', error);
    return {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      lastUpdate: new Date()
    };
  }
}

// Exportar funções para uso externo
export { robotOrchestrator }; 