import { Request, Response } from 'express';
import { RobotOrchestrator } from '../rpa/RobotOrchestrator';
import { BankAutomationService, BankCredentials } from '../rpa/services/BankAutomationService';
import { FinnexthoIntegrationService } from '../rpa/services/FinnexthoIntegrationService';
import { RpaSecurityService } from '../rpa/services/RpaSecurityService';
import { RpaMonitoringService } from '../rpa/services/RpaMonitoringService';
import { User } from '../models/User';

export class RpaController {
  private orchestrator: RobotOrchestrator;
  private bankAutomation: BankAutomationService;
  private finnexthoIntegration: FinnexthoIntegrationService;
  private securityService: RpaSecurityService;
  private monitoringService: RpaMonitoringService;

  constructor() {
    this.orchestrator = new RobotOrchestrator();
    this.bankAutomation = new BankAutomationService();
    this.finnexthoIntegration = new FinnexthoIntegrationService();
    this.securityService = new RpaSecurityService();
    this.monitoringService = new RpaMonitoringService();

    this.initializeServices();
  }

  private async initializeServices() {
    try {
      await this.bankAutomation.init();
      await this.orchestrator.startOrchestration();
      
      // Configurar listeners de eventos
      this.orchestrator.on('taskCompleted', this.handleTaskCompleted.bind(this));
      this.orchestrator.on('taskFailed', this.handleTaskFailed.bind(this));
      this.monitoringService.on('alertCreated', this.handleAlertCreated.bind(this));
      
      console.log('🚀 RPA Controller inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar RPA Controller:', error);
    }
  }

  // 🏦 AUTOMAÇÃO BANCÁRIA
  async syncBankData(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { bankUrl, username, password, selectors } = req.body;

      // Validar entrada
      const credentials: BankCredentials = {
        username: this.securityService.sanitizeInput(username),
        password: this.securityService.sanitizeInput(password),
        bankUrl: this.securityService.sanitizeInput(bankUrl),
        selectors
      };

      const validation = this.securityService.validateBankCredentials(credentials);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Credenciais inválidas',
          details: validation.errors
        });
      }

      // Criptografar credenciais
      const encryptedCredentials = this.securityService.encryptCredentials(credentials);

      // Adicionar tarefa ao orquestrador
      const taskId = await this.orchestrator.addTask({
        type: 'DATA_SYNC',
        priority: 'HIGH',
        payload: {
          operation: 'SYNC_BANK_DATA',
          userId,
          encryptedCredentials
        },
        userId,
        maxRetries: 3
      });

      // Log de auditoria
      this.securityService.logAuditEvent('BANK_SYNC_REQUESTED', userId, {
        bankUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        taskId,
        message: 'Sincronização bancária iniciada',
        estimatedTime: '2-5 minutos'
      });

    } catch (error) {
      console.error('Erro na sincronização bancária:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 📊 ANÁLISE FINANCEIRA
  async analyzeUserFinances(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const taskId = await this.orchestrator.addTask({
        type: 'USER_ANALYSIS',
        priority: 'MEDIUM',
        payload: {
          operation: 'ANALYZE_USER_FINANCES',
          userId
        },
        userId,
        maxRetries: 2
      });

      res.json({
        success: true,
        taskId,
        message: 'Análise financeira iniciada'
      });

    } catch (error) {
      console.error('Erro na análise financeira:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 📋 RELATÓRIOS
  async generateFinancialReport(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { period = 'month' } = req.query;

      const taskId = await this.orchestrator.addTask({
        type: 'REPORT_GENERATION',
        priority: 'LOW',
        payload: {
          operation: 'GENERATE_FINANCIAL_REPORT',
          userId,
          period
        },
        userId,
        maxRetries: 2
      });

      res.json({
        success: true,
        taskId,
        message: 'Relatório financeiro sendo gerado',
        period
      });

    } catch (error) {
      console.error('Erro na geração de relatório:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 🧹 LIMPEZA AUTOMÁTICA
  async cleanupOldData(req: Request, res: Response) {
    try {
      const taskId = await this.orchestrator.addTask({
        type: 'CLEANUP',
        priority: 'LOW',
        payload: {
          operation: 'CLEANUP_OLD_DATA',
          daysToKeep: 90
        },
        maxRetries: 1
      });

      res.json({
        success: true,
        taskId,
        message: 'Limpeza de dados antigos iniciada'
      });

    } catch (error) {
      console.error('Erro na limpeza:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 📈 MONITORAMENTO
  async getSystemHealth(req: Request, res: Response) {
    try {
      const metrics = this.monitoringService.getMetrics();
      const workerMetrics = this.monitoringService.getWorkerMetrics();
      const alerts = this.monitoringService.getAlerts();
      const performanceReport = this.monitoringService.generatePerformanceReport();

      res.json({
        success: true,
        data: {
          metrics,
          workers: workerMetrics,
          alerts: alerts.slice(0, 10), // Últimos 10 alertas
          performance: performanceReport
        }
      });

    } catch (error) {
      console.error('Erro ao obter saúde do sistema:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  async getTaskStatus(req: Request, res: Response) {
    try {
      const { taskId } = req.params;
      const task = await this.orchestrator.getTask(taskId);

      if (!task) {
        return res.status(404).json({
          success: false,
          error: 'Tarefa não encontrada'
        });
      }

      res.json({
        success: true,
        task
      });

    } catch (error) {
      console.error('Erro ao obter status da tarefa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  async getAllTasks(req: Request, res: Response) {
    try {
      const tasks = await this.orchestrator.getAllTasks();
      
      res.json({
        success: true,
        data: {
          tasks,
          total: tasks.length,
          pending: tasks.filter(t => t.status === 'PENDING').length,
          running: tasks.filter(t => t.status === 'RUNNING').length,
          completed: tasks.filter(t => t.status === 'COMPLETED').length,
          failed: tasks.filter(t => t.status === 'FAILED').length
        }
      });

    } catch (error) {
      console.error('Erro ao obter tarefas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 🔧 CONFIGURAÇÃO
  async updateUserBankCredentials(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { bankUrl, username, password, selectors } = req.body;

      // Validar credenciais
      const credentials: BankCredentials = {
        username: this.securityService.sanitizeInput(username),
        password: this.securityService.sanitizeInput(password),
        bankUrl: this.securityService.sanitizeInput(bankUrl),
        selectors
      };

      const validation = this.securityService.validateBankCredentials(credentials);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Credenciais inválidas',
          details: validation.errors
        });
      }

      // Criptografar e salvar
      const encryptedCredentials = this.securityService.encryptCredentials(credentials);
      
      await User.findOneAndUpdate(
        { firebaseUid: userId },
        { 
          $set: { 
            bankCredentials: encryptedCredentials,
            autoSync: true,
            lastCredentialsUpdate: new Date()
          }
        }
      );

      // Log de auditoria
      this.securityService.logAuditEvent('BANK_CREDENTIALS_UPDATED', userId, {
        bankUrl,
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Credenciais bancárias atualizadas com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar credenciais:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 🚨 ALERTAS
  async acknowledgeAlert(req: Request, res: Response) {
    try {
      const { alertId } = req.params;
      const acknowledged = this.monitoringService.acknowledgeAlert(alertId);

      if (!acknowledged) {
        return res.status(404).json({
          success: false,
          error: 'Alerta não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Alerta reconhecido'
      });

    } catch (error) {
      console.error('Erro ao reconhecer alerta:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 🔄 HANDLERS DE EVENTOS
  private async handleTaskCompleted(task: any) {
    try {
      const startTime = Date.now();
      
      if (task.payload.operation === 'SYNC_BANK_DATA') {
        // Descriptografar credenciais
        const encryptedCredentials = task.payload.encryptedCredentials;
        const credentials = this.securityService.decryptCredentials(encryptedCredentials);
        
        // Executar sincronização
        const syncResult = await this.bankAutomation.syncBankData(task.userId, credentials);
        
        if (syncResult.status === 'COMPLETED') {
          // Salvar transações no Finnextho
          const saveResult = await this.finnexthoIntegration.saveTransactions(
            task.userId,
            syncResult.payload.transactions
          );
          
          // Atualizar métricas
          this.monitoringService.logTaskExecution(
            task.id,
            'BANK_SYNC',
            'SUCCESS',
            Date.now() - startTime
          );
          
          console.log(`✅ Sincronização bancária concluída para usuário ${task.userId}`);
        }
      }
      
      if (task.payload.operation === 'ANALYZE_USER_FINANCES') {
        const analysis = await this.finnexthoIntegration.analyzeUserFinances(task.userId);
        
        // Salvar análise no banco ou enviar para o usuário
        console.log(`📊 Análise financeira concluída para usuário ${task.userId}`);
      }
      
      if (task.payload.operation === 'GENERATE_FINANCIAL_REPORT') {
        const report = await this.finnexthoIntegration.generateFinancialReport(
          task.userId,
          task.payload.period
        );
        
        // Salvar relatório ou enviar por email
        console.log(`📋 Relatório financeiro gerado para usuário ${task.userId}`);
      }
      
    } catch (error) {
      console.error('Erro no handler de tarefa completada:', error);
      this.monitoringService.createAlert('ERROR', `Erro no processamento da tarefa ${task.id}: ${error.message}`);
    }
  }

  private async handleTaskFailed(task: any) {
    console.error(`❌ Tarefa ${task.id} falhou:`, task.error);
    
    this.monitoringService.logTaskExecution(
      task.id,
      task.type,
      'FAILED',
      0,
      task.error
    );
  }

  private handleAlertCreated(alert: any) {
    // Aqui você pode implementar notificações por email, Slack, etc.
    console.log(`🚨 Novo alerta criado: ${alert.message}`);
  }

  // 🧹 LIMPEZA
  async cleanup() {
    try {
      await this.bankAutomation.close();
      await this.orchestrator.stopOrchestration();
      this.monitoringService.cleanup();
      console.log('🧹 RPA Controller limpo com sucesso');
    } catch (error) {
      console.error('Erro na limpeza do RPA Controller:', error);
    }
  }
} 