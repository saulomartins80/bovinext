import { db } from './MemoryDB';
import { WebSocketServerManager } from './WebSocketServer';
import { RPADoctor } from './RPADoctor';

interface Task {
  id: string;
  type: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  priority: number;
  data: any;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  workerId?: string;
  error?: string;
}

interface Worker {
  id: string;
  name: string;
  status: 'ONLINE' | 'OFFLINE' | 'BUSY';
  lastHeartbeat: number;
  capabilities: string[];
  currentTask?: string;
  performance: {
    tasksCompleted: number;
    averageExecutionTime: number;
    successRate: number;
  };
}

export class RobotOrchestrator {
  private static instance: RobotOrchestrator;
  private tasks: Map<string, Task> = new Map();
  private workers: Map<string, Worker> = new Map();
  private taskQueue: string[] = [];
  private isRunning: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private taskProcessorInterval: NodeJS.Timeout | null = null;
  private doctor: RPADoctor;
  private wss: WebSocketServerManager;

  private constructor() {
    this.doctor = new RPADoctor();
    this.wss = new WebSocketServerManager(8080);
    this.loadFromDatabase();
  }

  static getInstance(): RobotOrchestrator {
    if (!RobotOrchestrator.instance) {
      RobotOrchestrator.instance = new RobotOrchestrator();
    }
    return RobotOrchestrator.instance;
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('🤖 Orchestrator já está rodando');
      return;
    }

    console.log('🚀 Iniciando Robot Orchestrator...');
    this.isRunning = true;

    // Iniciar WebSocket Server
    await this.wss.start();

    // Iniciar heartbeat dos workers
    this.startHeartbeatMonitoring();

    // Iniciar processamento de tarefas
    this.startTaskProcessing();

    // Configurar listeners de eventos
    this.setupEventListeners();

    console.log('✅ Robot Orchestrator iniciado com sucesso');
  }

  async stop(): Promise<void> {
    console.log('🛑 Parando Robot Orchestrator...');
    this.isRunning = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.taskProcessorInterval) {
      clearInterval(this.taskProcessorInterval);
      this.taskProcessorInterval = null;
    }

    await this.wss.stop();
    await this.saveToDatabase();
    console.log('✅ Robot Orchestrator parado');
  }

  async registerWorker(workerId: string, name: string, capabilities: string[] = []): Promise<void> {
    const worker: Worker = {
      id: workerId,
      name,
      status: 'ONLINE',
      lastHeartbeat: Date.now(),
      capabilities,
      performance: {
        tasksCompleted: 0,
        averageExecutionTime: 0,
        successRate: 100
      }
    };

    this.workers.set(workerId, worker);
    await this.saveToDatabase();
    
    console.log(`🤖 Worker registrado: ${workerId} (${name})`);
    
    // Notificar via WebSocket
    this.broadcastWorkerUpdate(worker);
  }

  async addTask(type: string, data: any, priority: number = 1): Promise<string> {
    const taskId = this.generateTaskId();
    const task: Task = {
      id: taskId,
      type,
      status: 'PENDING',
      priority,
      data,
      createdAt: new Date()
    };

    this.tasks.set(taskId, task);
    this.taskQueue.push(taskId);
    
    // Ordenar fila por prioridade
    this.taskQueue.sort((a, b) => {
      const taskA = this.tasks.get(a)!;
      const taskB = this.tasks.get(b)!;
      return taskB.priority - taskA.priority;
    });

    await this.saveToDatabase();
    
    console.log(`📋 Nova tarefa adicionada: ${taskId} (${type})`);
    
    // Notificar via WebSocket
    this.broadcastTaskUpdate(task);
    
    return taskId;
  }

  async getTaskStatus(taskId: string): Promise<Task | null> {
    return this.tasks.get(taskId) || null;
  }

  async getWorkerStatus(workerId: string): Promise<Worker | null> {
    return this.workers.get(workerId) || null;
  }

  async getSystemMetrics(): Promise<any> {
    const pendingTasks = Array.from(this.tasks.values()).filter(t => t.status === 'PENDING').length;
    const runningTasks = Array.from(this.tasks.values()).filter(t => t.status === 'RUNNING').length;
    const completedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'COMPLETED').length;
    const failedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'FAILED').length;
    
    const onlineWorkers = Array.from(this.workers.values()).filter(w => w.status === 'ONLINE').length;
    const totalWorkers = this.workers.size;

    const systemHealth = await this.doctor.runFullCheckup();

    return {
      tasks: {
        total: this.tasks.size,
        pending: pendingTasks,
        running: runningTasks,
        completed: completedTasks,
        failed: failedTasks
      },
      workers: {
        total: totalWorkers,
        online: onlineWorkers,
        offline: totalWorkers - onlineWorkers
      },
      systemHealth,
      queueLength: this.taskQueue.length,
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  }

  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      let workersMarkedOffline = 0;

      this.workers.forEach((worker, workerId) => {
        const timeSinceLastHeartbeat = now - worker.lastHeartbeat;
        
        // Marcar como offline se não houve heartbeat por mais de 30 segundos
        if (timeSinceLastHeartbeat > 30000) {
          if (worker.status !== 'OFFLINE') {
            console.warn(`⚠️ Worker ${workerId} marcado como offline`);
            worker.status = 'OFFLINE';
            workersMarkedOffline++;
          }
        } else if (worker.status === 'OFFLINE') {
          // Marcar como online se recebeu heartbeat recentemente
          worker.status = 'ONLINE';
          console.log(`✅ Worker ${workerId} voltou online`);
        }
      });

      if (workersMarkedOffline > 0) {
        console.warn(`⚠️ ${workersMarkedOffline} workers marcados como offline`);
      }

      // Salvar estado periodicamente
      this.saveToDatabase();
    }, 10000); // Verificar a cada 10 segundos
  }

  private startTaskProcessing(): void {
    this.taskProcessorInterval = setInterval(() => {
      if (!this.isRunning || this.taskQueue.length === 0) return;

      // Encontrar worker disponível
      const availableWorker = Array.from(this.workers.values()).find(w => 
        w.status === 'ONLINE' && !w.currentTask
      );

      if (!availableWorker) {
        return; // Nenhum worker disponível
      }

      // Pegar próxima tarefa da fila
      const taskId = this.taskQueue.shift();
      if (!taskId) return;

      const task = this.tasks.get(taskId);
      if (!task) return;

      // Atribuir tarefa ao worker
      task.status = 'RUNNING';
      task.startedAt = new Date();
      task.workerId = availableWorker.id;
      availableWorker.currentTask = taskId;
      availableWorker.status = 'BUSY';

      console.log(`📤 Tarefa ${taskId} atribuída ao worker ${availableWorker.id}`);

      // Simular execução da tarefa (em produção, seria uma chamada real)
      this.simulateTaskExecution(taskId, availableWorker.id);

      // Salvar estado
      this.saveToDatabase();
      
      // Notificar via WebSocket
      this.broadcastTaskUpdate(task);
    }, 1000); // Processar a cada segundo
  }

  private async simulateTaskExecution(taskId: string, workerId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    const worker = this.workers.get(workerId);
    
    if (!task || !worker) return;

    try {
      // Simular tempo de execução baseado no tipo de tarefa
      const executionTime = this.getTaskExecutionTime(task.type);
      await new Promise(resolve => setTimeout(resolve, executionTime));

      // Marcar como concluída
      task.status = 'COMPLETED';
      task.completedAt = new Date();
      
      // Atualizar métricas do worker
      worker.currentTask = undefined;
      worker.status = 'ONLINE';
      worker.performance.tasksCompleted++;
      
      const actualExecutionTime = task.completedAt.getTime() - task.startedAt!.getTime();
      worker.performance.averageExecutionTime = 
        (worker.performance.averageExecutionTime + actualExecutionTime) / 2;

      console.log(`✅ Tarefa ${taskId} concluída por ${workerId}`);

    } catch (error) {
      // Marcar como falhou
      task.status = 'FAILED';
      task.error = error.message;
      task.completedAt = new Date();
      
      // Atualizar worker
      worker.currentTask = undefined;
      worker.status = 'ONLINE';
      worker.performance.successRate = Math.max(0, worker.performance.successRate - 5);

      console.error(`❌ Tarefa ${taskId} falhou:`, error.message);
    }

    await this.saveToDatabase();
    this.broadcastTaskUpdate(task);
  }

  private getTaskExecutionTime(taskType: string): number {
    const executionTimes: { [key: string]: number } = {
      'CLEANUP': 2000,
      'USER_ANALYSIS': 5000,
      'DATA_SYNC': 3000,
      'REPORT_GENERATION': 4000,
      'CHATBOT_OPTIMIZATION': 1000
    };
    
    return executionTimes[taskType] || 2000;
  }

  private setupEventListeners(): void {
    // Listener para WebSocket connections
    this.wss.on('clientConnected', (client) => {
      console.log('🔌 Nova conexão WebSocket estabelecida');
      
      // Enviar status atual
      this.getSystemMetrics().then(metrics => {
        this.wss.sendToClient(client.id, {
          type: 'system_metrics',
          data: metrics,
          timestamp: new Date()
        });
      });
    });
  }

  private broadcastTaskUpdate(task: Task): void {
    this.wss.broadcastToAll({
      type: 'task_update',
      data: task,
      timestamp: new Date()
    });
  }

  private broadcastWorkerUpdate(worker: Worker): void {
    this.wss.broadcastToAll({
      type: 'worker_update',
      data: worker,
      timestamp: new Date()
    });
  }

  private generateTaskId(): string {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async loadFromDatabase(): Promise<void> {
    try {
      const savedTasks = await db.get('orchestrator_tasks') || {};
      const savedWorkers = await db.get('orchestrator_workers') || {};
      const savedQueue = await db.get('orchestrator_queue') || [];

      // Restaurar tarefas
      Object.values(savedTasks).forEach((task: any) => {
        this.tasks.set(task.id, {
          ...task,
          createdAt: new Date(task.createdAt),
          startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        });
      });

      // Restaurar workers
      Object.values(savedWorkers).forEach((worker: any) => {
        this.workers.set(worker.id, worker);
      });

      // Restaurar fila
      this.taskQueue = savedQueue;

      console.log(`📂 Backup carregado: ${Object.keys(savedTasks).length} tarefas, ${Object.keys(savedWorkers).length} workers`);
    } catch (error) {
      console.error('❌ Erro ao carregar backup:', error);
    }
  }

  private async saveToDatabase(): Promise<void> {
    try {
      const tasks = Object.fromEntries(this.tasks);
      const workers = Object.fromEntries(this.workers);

      await db.set('orchestrator_tasks', tasks);
      await db.set('orchestrator_workers', workers);
      await db.set('orchestrator_queue', this.taskQueue);
    } catch (error) {
      console.error('❌ Erro ao salvar backup:', error);
    }
  }
} 