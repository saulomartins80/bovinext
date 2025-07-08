import { robotOrchestrator } from './RobotOrchestrator';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'rpa-dashboard' },
  transports: [
    new winston.transports.File({ filename: 'logs/rpa-dashboard.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export interface DashboardData {
  system: {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    uptime: number;
    lastUpdate: Date;
  };
  workers: {
    total: number;
    online: number;
    busy: number;
    idle: number;
    offline: number;
    list: Array<{
      id: string;
      name: string;
      status: string;
      currentTask?: string;
      lastHeartbeat: Date;
      performance: {
        tasksCompleted: number;
        tasksFailed: number;
        averageExecutionTime: number;
      };
    }>;
  };
  tasks: {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
    recent: Array<{
      id: string;
      type: string;
      status: string;
      priority: string;
      createdAt: Date;
      startedAt?: Date;
      completedAt?: Date;
      error?: string;
    }>;
  };
  performance: {
    successRate: string;
    averageExecutionTime: number;
    tasksPerHour: number;
    errorsPerHour: number;
  };
  alerts: Array<{
    id: string;
    type: 'ERROR' | 'WARNING' | 'INFO';
    message: string;
    timestamp: Date;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
}

export class RpaDashboard {
  private alerts: Array<{
    id: string;
    type: 'ERROR' | 'WARNING' | 'INFO';
    message: string;
    timestamp: Date;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }> = [];

  constructor() {
    this.setupEventListeners();
  }

  async getDashboardData(): Promise<DashboardData> {
    try {
      const metrics = await robotOrchestrator.getMetrics();
      const workers = await robotOrchestrator.getAllWorkers();
      const tasks = await robotOrchestrator.getAllTasks();

      // Calcular estatísticas dos workers
      const workerStats = {
        total: workers.length,
        online: workers.filter(w => w.status !== 'OFFLINE').length,
        busy: workers.filter(w => w.status === 'BUSY').length,
        idle: workers.filter(w => w.status === 'IDLE').length,
        offline: workers.filter(w => w.status === 'OFFLINE').length
      };

      // Calcular estatísticas das tarefas
      const taskStats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'PENDING').length,
        running: tasks.filter(t => t.status === 'RUNNING').length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
        failed: tasks.filter(t => t.status === 'FAILED').length,
        cancelled: tasks.filter(t => t.status === 'CANCELLED').length
      };

      // Calcular performance
      const successRate = metrics.totalTasks > 0 
        ? ((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(2)
        : '0.00';

      // Pegar tarefas recentes (últimas 10)
      const recentTasks = tasks
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10)
        .map(t => ({
          id: t.id,
          type: t.type,
          status: t.status,
          priority: t.priority,
          createdAt: t.createdAt,
          startedAt: t.startedAt,
          completedAt: t.completedAt,
          error: t.error
        }));

      // Calcular uptime (simulado - em produção seria baseado no start time)
      const uptime = Date.now() - (new Date().getTime() - 24 * 60 * 60 * 1000); // 24h

      return {
        system: {
          status: metrics.systemHealth,
          uptime,
          lastUpdate: new Date()
        },
        workers: {
          ...workerStats,
          list: workers.map(w => ({
            id: w.id,
            name: w.name,
            status: w.status,
            currentTask: w.currentTask,
            lastHeartbeat: w.lastHeartbeat,
            performance: w.performance
          }))
        },
        tasks: {
          ...taskStats,
          recent: recentTasks
        },
        performance: {
          successRate,
          averageExecutionTime: metrics.averageExecutionTime,
          tasksPerHour: this.calculateTasksPerHour(tasks),
          errorsPerHour: this.calculateErrorsPerHour(tasks)
        },
        alerts: this.alerts.slice(-20) // Últimas 20 alertas
      };
    } catch (error) {
      logger.error('Erro ao obter dados do dashboard:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    // Listener para erros de tarefas
    robotOrchestrator.on('taskStatusUpdated', ({ taskId, status, error }) => {
      if (status === 'FAILED' && error) {
        this.addAlert('ERROR', `Tarefa ${taskId} falhou: ${error}`, 'HIGH');
      }
    });

    // Listener para workers offline
    robotOrchestrator.on('workerOffline', (workerId) => {
      this.addAlert('WARNING', `Worker ${workerId} está offline`, 'MEDIUM');
    });

    // Listener para métricas críticas
    robotOrchestrator.on('metricsUpdated', (metrics) => {
      if (metrics.systemHealth === 'CRITICAL') {
        this.addAlert('ERROR', 'Sistema RPA em estado crítico', 'CRITICAL');
      } else if (metrics.systemHealth === 'WARNING') {
        this.addAlert('WARNING', 'Sistema RPA com problemas', 'MEDIUM');
      }
    });

    logger.info('👂 Listeners do dashboard configurados');
  }

  private addAlert(
    type: 'ERROR' | 'WARNING' | 'INFO',
    message: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ): void {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      severity
    };

    this.alerts.push(alert);
    logger.info(`🚨 Alerta adicionado: ${message} (${severity})`);

    // Manter apenas as últimas 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  private calculateTasksPerHour(tasks: any[]): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentTasks = tasks.filter(t => t.createdAt >= oneHourAgo);
    return recentTasks.length;
  }

  private calculateErrorsPerHour(tasks: any[]): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentFailedTasks = tasks.filter(t => 
      t.status === 'FAILED' && t.createdAt >= oneHourAgo
    );
    return recentFailedTasks.length;
  }

  // Método para limpar alertas antigos
  async cleanupOldAlerts(): Promise<void> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => alert.timestamp >= oneDayAgo);
    logger.info(`🧹 Alertas antigos removidos. Restantes: ${this.alerts.length}`);
  }

  // Método para obter alertas por severidade
  getAlertsBySeverity(severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): any[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  // Método para obter estatísticas de alertas
  getAlertStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const byType = this.alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.alerts.length,
      byType,
      bySeverity
    };
  }
}

// Exportar instância singleton
export const rpaDashboard = new RpaDashboard(); 