import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import { EventEmitter } from 'events';

// Interfaces para o sistema RPA
export interface RobotTask {
  id: string;
  type: 'DATA_SYNC' | 'REPORT_GENERATION' | 'USER_ANALYSIS' | 'MARKET_UPDATE' | 'CLEANUP' | 'CUSTOM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  payload: any;
  userId?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retries: number;
  maxRetries: number;
  metadata?: {
    estimatedDuration?: number;
    dependencies?: string[];
    tags?: string[];
  };
}

export interface RobotWorker {
  id: string;
  name: string;
  type: string;
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  currentTask?: string;
  lastHeartbeat: Date;
  capabilities: string[];
  performance: {
    tasksCompleted: number;
    tasksFailed: number;
    averageExecutionTime: number;
  };
}

export interface RobotMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingTasks: number;
  runningTasks: number;
  averageExecutionTime: number;
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  lastUpdate: Date;
}

export class RobotOrchestrator extends EventEmitter {
  private redis: Redis;
  private logger: winston.Logger;
  private workers: Map<string, RobotWorker> = new Map();
  private taskQueue: string[] = [];
  private isRunning: boolean = false;
  private heartbeatInterval: NodeJS.Timeout;
  private metricsInterval: NodeJS.Timeout;

  constructor() {
    super();
    
    // Configurar Redis (opcional)
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        maxRetriesPerRequest: 3,
        lazyConnect: true,        
        enableReadyCheck: false
      });

      this.redis.on('error', (error) => {
        this.logger.warn('⚠️ Redis não disponível, usando armazenamento local:', error.message);
      });
    } catch (error) {
      this.logger.warn('⚠️ Redis não configurado, usando armazenamento local');
      this.redis = null;
    }

    // Configurar Logger
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'robot-orchestrator' },
      transports: [
        new winston.transports.File({ filename: 'logs/rpa-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/rpa-combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // Inicializar intervalos
    this.heartbeatInterval = setInterval(() => this.checkWorkerHealth(), 30000);
    this.metricsInterval = setInterval(() => this.updateMetrics(), 60000);

    this.logger.info('🤖 Robot Orchestrator inicializado');
  }

  // 🎯 GESTÃO DE TAREFAS
  async addTask(task: Omit<RobotTask, 'id' | 'status' | 'createdAt' | 'retries'>): Promise<string> {
    const taskId = uuidv4();
    const newTask: RobotTask = {
      ...task,
      id: taskId,
      status: 'PENDING',
      createdAt: new Date(),
      retries: 0,
      maxRetries: task.maxRetries || 3
    };

    // Salvar no Redis
    await this.redis.hset(`task:${taskId}`, newTask);
    await this.redis.zadd('task_queue', this.getPriorityScore(task.priority), taskId);
    
    this.taskQueue.push(taskId);
    this.logger.info(`📋 Nova tarefa adicionada: ${taskId} (${task.type})`);
    
    this.emit('taskAdded', newTask);
    return taskId;
  }

  async getTask(taskId: string): Promise<RobotTask | null> {
    const taskData = await this.redis.hgetall(`task:${taskId}`);
    if (!taskData || Object.keys(taskData).length === 0) {
      return null;
    }
    
    return {
      ...taskData,
      createdAt: new Date(taskData.createdAt),
      startedAt: taskData.startedAt ? new Date(taskData.startedAt) : undefined,
      completedAt: taskData.completedAt ? new Date(taskData.completedAt) : undefined,
      retries: parseInt(taskData.retries),
      maxRetries: parseInt(taskData.maxRetries)
    } as RobotTask;
  }

  async updateTaskStatus(taskId: string, status: RobotTask['status'], error?: string): Promise<void> {
    const task = await this.getTask(taskId);
    if (!task) {
      throw new Error(`Tarefa ${taskId} não encontrada`);
    }

    const updates: any = { status };
    
    if (status === 'RUNNING' && !task.startedAt) {
      updates.startedAt = new Date().toISOString();
    } else if (status === 'COMPLETED' || status === 'FAILED') {
      updates.completedAt = new Date().toISOString();
      if (error) updates.error = error;
    }

    await this.redis.hset(`task:${taskId}`, updates);
    this.logger.info(`🔄 Status da tarefa ${taskId} atualizado para: ${status}`);
    
    this.emit('taskStatusUpdated', { taskId, status, error });
  }

  // 🤖 GESTÃO DE WORKERS
  async registerWorker(worker: Omit<RobotWorker, 'id' | 'status' | 'lastHeartbeat' | 'performance'>): Promise<string> {
    const workerId = uuidv4();
    const newWorker: RobotWorker = {
      ...worker,
      id: workerId,
      status: 'IDLE',
      lastHeartbeat: new Date(),
      performance: {
        tasksCompleted: 0,
        tasksFailed: 0,
        averageExecutionTime: 0
      }
    };

    this.workers.set(workerId, newWorker);
    await this.redis.hset(`worker:${workerId}`, newWorker);
    
    this.logger.info(`🤖 Worker registrado: ${workerId} (${worker.name})`);
    this.emit('workerRegistered', newWorker);
    
    return workerId;
  }

  async updateWorkerHeartbeat(workerId: string): Promise<void> {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.lastHeartbeat = new Date();
      worker.status = 'IDLE';
      await this.redis.hset(`worker:${workerId}`, { 
        lastHeartbeat: worker.lastHeartbeat.toISOString(),
        status: worker.status 
      });
    }
  }

  async assignTaskToWorker(taskId: string, workerId: string): Promise<boolean> {
    const worker = this.workers.get(workerId);
    const task = await this.getTask(taskId);
    
    if (!worker || !task) {
      return false;
    }

    if (worker.status !== 'IDLE') {
      return false;
    }

    // Verificar se o worker tem as capacidades necessárias
    if (!this.canWorkerHandleTask(worker, task)) {
      return false;
    }

    // Atribuir tarefa
    worker.status = 'BUSY';
    worker.currentTask = taskId;
    task.status = 'RUNNING';
    task.startedAt = new Date();

    await this.redis.hset(`worker:${workerId}`, { 
      status: worker.status,
      currentTask: taskId 
    });
    await this.updateTaskStatus(taskId, 'RUNNING');

    this.logger.info(`📤 Tarefa ${taskId} atribuída ao worker ${workerId}`);
    this.emit('taskAssigned', { taskId, workerId });
    
    return true;
  }

  // 📊 MONITORAMENTO E MÉTRICAS
  async getMetrics(): Promise<RobotMetrics> {
    const tasks = await this.getAllTasks();
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    const failedTasks = tasks.filter(t => t.status === 'FAILED');
    const pendingTasks = tasks.filter(t => t.status === 'PENDING');
    const runningTasks = tasks.filter(t => t.status === 'RUNNING');

    const avgExecutionTime = completedTasks.length > 0 
      ? completedTasks.reduce((sum, task) => {
          if (task.startedAt && task.completedAt) {
            return sum + (task.completedAt.getTime() - task.startedAt.getTime());
          }
          return sum;
        }, 0) / completedTasks.length
      : 0;

    const systemHealth = this.calculateSystemHealth();

    return {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      pendingTasks: pendingTasks.length,
      runningTasks: runningTasks.length,
      averageExecutionTime: avgExecutionTime,
      systemHealth,
      lastUpdate: new Date()
    };
  }

  async getAllTasks(): Promise<RobotTask[]> {
    const taskKeys = await this.redis.keys('task:*');
    const tasks: RobotTask[] = [];
    
    for (const key of taskKeys) {
      const task = await this.getTask(key.replace('task:', ''));
      if (task) tasks.push(task);
    }
    
    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllWorkers(): Promise<RobotWorker[]> {
    return Array.from(this.workers.values());
  }

  // 🔄 ORQUESTRAÇÃO AUTOMÁTICA
  async startOrchestration(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Orquestração já está rodando');
      return;
    }

    this.isRunning = true;
    this.logger.info('🚀 Iniciando orquestração de tarefas');

    // Iniciar processamento em background sem bloquear
    setInterval(async () => {
      if (this.isRunning) {
        try {
          await this.processTaskQueue();
        } catch (error) {
          this.logger.error('Erro na orquestração:', error);
        }
      }
    }, 5000); // Verificar a cada 5 segundos
  }

  async stopOrchestration(): Promise<void> {
    this.isRunning = false;
    this.logger.info('🛑 Orquestração parada');
  }

  private async processTaskQueue(): Promise<void> {
    const availableWorkers = Array.from(this.workers.values())
      .filter(w => w.status === 'IDLE');

    if (availableWorkers.length === 0) {
      return;
    }

    // Pegar próxima tarefa da fila
    const nextTaskId = await this.redis.zpopmax('task_queue');
    if (!nextTaskId || nextTaskId.length === 0) {
      return;
    }

    const taskId = nextTaskId[0];
    const task = await this.getTask(taskId);
    
    if (!task || task.status !== 'PENDING') {
      return;
    }

    // Encontrar worker adequado
    const suitableWorker = availableWorkers.find(w => 
      this.canWorkerHandleTask(w, task)
    );

    if (suitableWorker) {
      await this.assignTaskToWorker(taskId, suitableWorker.id);
    } else {
      // Recolocar na fila se não há worker adequado
      await this.redis.zadd('task_queue', this.getPriorityScore(task.priority), taskId);
    }
  }

  // 🛠️ MÉTODOS AUXILIARES
  private getPriorityScore(priority: RobotTask['priority']): number {
    const scores = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    return scores[priority];
  }

  private canWorkerHandleTask(worker: RobotWorker, task: RobotTask): boolean {
    // Verificar se o worker tem as capacidades necessárias
    return worker.capabilities.includes(task.type) || 
           worker.capabilities.includes('GENERAL');
  }

  private calculateSystemHealth(): 'HEALTHY' | 'WARNING' | 'CRITICAL' {
    const activeWorkers = Array.from(this.workers.values())
      .filter(w => w.status !== 'OFFLINE').length;
    
    const totalWorkers = this.workers.size;
    
    if (totalWorkers === 0) return 'CRITICAL';
    if (activeWorkers / totalWorkers < 0.5) return 'CRITICAL';
    if (activeWorkers / totalWorkers < 0.8) return 'WARNING';
    return 'HEALTHY';
  }

  private async checkWorkerHealth(): Promise<void> {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutos

    for (const [workerId, worker] of this.workers) {
      if (now.getTime() - worker.lastHeartbeat.getTime() > timeout) {
        worker.status = 'OFFLINE';
        this.logger.warn(`⚠️ Worker ${workerId} marcado como offline`);
        this.emit('workerOffline', workerId);
      }
    }
  }

  private async updateMetrics(): Promise<void> {
    const metrics = await this.getMetrics();
    await this.redis.set('rpa:metrics', JSON.stringify(metrics));
    this.emit('metricsUpdated', metrics);
  }

  // 🔧 MÉTODOS PÚBLICOS PARA ACESSO AO REDIS
  async setRedisData(key: string, data: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.setex(key, ttl, JSON.stringify(data));
    } else {
      await this.redis.set(key, JSON.stringify(data));
    }
  }

  async getRedisData(key: string): Promise<any> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setRedisHash(key: string, data: any): Promise<void> {
    await this.redis.hset(key, data);
  }

  async getRedisHash(key: string): Promise<any> {
    return await this.redis.hgetall(key);
  }

  // 🧹 LIMPEZA
  async cleanup(): Promise<void> {
    clearInterval(this.heartbeatInterval);
    clearInterval(this.metricsInterval);
    await this.redis.quit();
    this.logger.info('🧹 Robot Orchestrator finalizado');
  }
}

// Exportar instância singleton
export const robotOrchestrator = new RobotOrchestrator(); 