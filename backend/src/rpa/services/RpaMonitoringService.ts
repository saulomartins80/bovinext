import { EventEmitter } from 'events';

export interface RpaMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  pendingTasks: number;
  runningTasks: number;
  averageExecutionTime: number;
  successRate: number;
  tasksPerHour: number;
  errorsPerHour: number;
  systemHealth: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  lastUpdate: Date;
}

export interface WorkerMetrics {
  workerId: string;
  name: string;
  status: 'IDLE' | 'BUSY' | 'OFFLINE';
  tasksCompleted: number;
  tasksFailed: number;
  averageExecutionTime: number;
  lastHeartbeat: Date;
  uptime: number;
}

export interface Alert {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  metadata?: any;
}

export class RpaMonitoringService extends EventEmitter {
  private metrics: RpaMetrics;
  private workerMetrics: Map<string, WorkerMetrics> = new Map();
  private alerts: Alert[] = [];
  private metricsHistory: RpaMetrics[] = [];
  private maxHistorySize = 1000;

  constructor() {
    super();
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      pendingTasks: 0,
      runningTasks: 0,
      averageExecutionTime: 0,
      successRate: 0,
      tasksPerHour: 0,
      errorsPerHour: 0,
      systemHealth: 'HEALTHY',
      lastUpdate: new Date()
    };
  }

  /**
   * Atualiza métricas do sistema
   */
  updateSystemMetrics(metrics: Partial<RpaMetrics>): void {
    this.metrics = { ...this.metrics, ...metrics, lastUpdate: new Date() };
    
    // Adicionar ao histórico
    this.metricsHistory.push({ ...this.metrics });
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }

    // Verificar saúde do sistema
    this.checkSystemHealth();
    
    // Emitir evento de atualização
    this.emit('metricsUpdated', this.metrics);
  }

  /**
   * Atualiza métricas de um worker
   */
  updateWorkerMetrics(workerId: string, metrics: Partial<WorkerMetrics>): void {
    const existing = this.workerMetrics.get(workerId);
    const updated = { ...existing, ...metrics, workerId };
    this.workerMetrics.set(workerId, updated as WorkerMetrics);
    
    this.emit('workerMetricsUpdated', updated);
  }

  /**
   * Registra execução de tarefa
   */
  logTaskExecution(taskId: string, taskType: string, status: 'SUCCESS' | 'FAILED', duration: number, error?: string): void {
    // Atualizar métricas
    this.metrics.totalTasks++;
    
    if (status === 'SUCCESS') {
      this.metrics.completedTasks++;
    } else {
      this.metrics.failedTasks++;
      this.createAlert('ERROR', `Tarefa ${taskId} falhou: ${error}`, { taskId, taskType, error });
    }

    // Calcular tempo médio de execução
    const totalCompleted = this.metrics.completedTasks + this.metrics.failedTasks;
    this.metrics.averageExecutionTime = 
      (this.metrics.averageExecutionTime * (totalCompleted - 1) + duration) / totalCompleted;

    // Calcular taxa de sucesso
    this.metrics.successRate = (this.metrics.completedTasks / this.metrics.totalTasks) * 100;

    this.emit('taskExecuted', { taskId, taskType, status, duration, error });
  }

  /**
   * Cria alerta
   */
  createAlert(type: Alert['type'], message: string, metadata?: any): void {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      acknowledged: false,
      metadata
    };

    this.alerts.push(alert);
    
    // Manter apenas os últimos 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    this.emit('alertCreated', alert);
    
    // Log do alerta
    console.log(`🚨 ALERTA [${type}]: ${message}`);
  }

  /**
   * Reconhece alerta
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alertAcknowledged', alert);
      return true;
    }
    return false;
  }

  /**
   * Verifica saúde do sistema
   */
  private checkSystemHealth(): void {
    const previousHealth = this.metrics.systemHealth;
    
    // Critérios para saúde do sistema
    if (this.metrics.successRate < 50) {
      this.metrics.systemHealth = 'CRITICAL';
    } else if (this.metrics.successRate < 80) {
      this.metrics.systemHealth = 'WARNING';
    } else {
      this.metrics.systemHealth = 'HEALTHY';
    }

    // Alertar mudança de saúde
    if (previousHealth !== this.metrics.systemHealth) {
      this.createAlert(
        this.metrics.systemHealth === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        `Saúde do sistema mudou de ${previousHealth} para ${this.metrics.systemHealth}`,
        { previousHealth, currentHealth: this.metrics.systemHealth }
      );
    }
  }

  /**
   * Obtém métricas atuais
   */
  getMetrics(): RpaMetrics {
    return { ...this.metrics };
  }

  /**
   * Obtém métricas de workers
   */
  getWorkerMetrics(): WorkerMetrics[] {
    return Array.from(this.workerMetrics.values());
  }

  /**
   * Obtém alertas
   */
  getAlerts(includeAcknowledged: boolean = false): Alert[] {
    return this.alerts.filter(alert => includeAcknowledged || !alert.acknowledged);
  }

  /**
   * Obtém histórico de métricas
   */
  getMetricsHistory(limit: number = 100): RpaMetrics[] {
    return this.metricsHistory.slice(-limit);
  }

  /**
   * Calcula estatísticas avançadas
   */
  getAdvancedStats(): any {
    const history = this.getMetricsHistory(24); // Últimas 24 entradas
    
    if (history.length < 2) {
      return { trend: 'stable', prediction: 'insufficient data' };
    }

    // Calcular tendência
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, m) => sum + m.successRate, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.successRate, 0) / older.length;
    
    const trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable';

    // Previsão simples
    const prediction = trend === 'improving' ? 'good' : trend === 'declining' ? 'concerning' : 'stable';

    return {
      trend,
      prediction,
      recentSuccessRate: recentAvg,
      olderSuccessRate: olderAvg,
      change: ((recentAvg - olderAvg) / olderAvg * 100).toFixed(2) + '%'
    };
  }

  /**
   * Gera relatório de performance
   */
  generatePerformanceReport(): any {
    const stats = this.getAdvancedStats();
    const workers = this.getWorkerMetrics();
    const activeWorkers = workers.filter(w => w.status !== 'OFFLINE').length;
    const totalWorkers = workers.length;

    return {
      timestamp: new Date(),
      systemHealth: this.metrics.systemHealth,
      successRate: this.metrics.successRate.toFixed(2) + '%',
      averageExecutionTime: this.metrics.averageExecutionTime.toFixed(2) + 'ms',
      activeWorkers: `${activeWorkers}/${totalWorkers}`,
      pendingTasks: this.metrics.pendingTasks,
      runningTasks: this.metrics.runningTasks,
      trend: stats.trend,
      prediction: stats.prediction,
      alerts: this.getAlerts().length,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Gera recomendações baseadas nas métricas
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.successRate < 80) {
      recommendations.push('🔴 Taxa de sucesso baixa. Verifique logs de erro e configurações.');
    }

    if (this.metrics.averageExecutionTime > 30000) {
      recommendations.push('⏱️ Tempo de execução alto. Considere otimizar workers ou adicionar mais recursos.');
    }

    if (this.metrics.pendingTasks > 100) {
      recommendations.push('📋 Muitas tarefas pendentes. Considere adicionar mais workers.');
    }

    const workers = this.getWorkerMetrics();
    const offlineWorkers = workers.filter(w => w.status === 'OFFLINE').length;
    if (offlineWorkers > workers.length * 0.3) {
      recommendations.push('🤖 Muitos workers offline. Verifique conectividade e recursos.');
    }

    return recommendations;
  }

  /**
   * Limpa dados antigos
   */
  cleanup(): void {
    // Limpar alertas antigos (mais de 7 dias)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    this.alerts = this.alerts.filter(alert => alert.timestamp > weekAgo);
    
    // Limpar workers offline há muito tempo
    const hourAgo = new Date();
    hourAgo.setHours(hourAgo.getHours() - 1);
    
    for (const [workerId, worker] of this.workerMetrics.entries()) {
      if (worker.status === 'OFFLINE' && worker.lastHeartbeat < hourAgo) {
        this.workerMetrics.delete(workerId);
      }
    }
  }
} 