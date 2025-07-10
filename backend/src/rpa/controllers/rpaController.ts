import { Request, Response } from 'express';
import { RobotOrchestrator } from '../RobotOrchestrator';
import { DataSyncWorker } from '../workers/DataSyncWorker';
import { EnhancedSecurityService } from '../services/EnhancedSecurityService';
import { FinancialAnalyzer } from '../services/FinancialAnalyzer';
import { AutomationService } from '../services/AutomationService';
import winston from 'winston';

// Tipo para ações de automação
type AutomationAction = {
  type: 'click' | 'type' | 'wait' | 'screenshot' | 'extract' | 'navigate';
  selector?: string;
  value?: string;
  delay?: number;
  description: string;
};

export class RpaController {
  private logger: winston.Logger;
  private robotOrchestrator: RobotOrchestrator;
  private securityService: EnhancedSecurityService;
  private financialAnalyzer: FinancialAnalyzer;
  private automationService: AutomationService;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'rpa-controller' },
      transports: [
        new winston.transports.File({ filename: 'logs/rpa-controller.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    this.robotOrchestrator = new RobotOrchestrator();
    this.securityService = new EnhancedSecurityService();
    this.financialAnalyzer = new FinancialAnalyzer();
    this.automationService = new AutomationService();
  }

  // 🎯 SINCRONIZAÇÃO BANCÁRIA
  async syncBankData(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { bankUrl, username, password, selectors } = req.body;

      this.logger.info(`🏦 Iniciando sincronização bancária para usuário: ${userId}`);

      // Validar entrada
      if (!this.securityService.validateInput({ bankUrl, username, password })) {
        res.status(400).json({ error: 'Dados inválidos' });
        return;
      }

      // Criar tarefa de automação bancária
      const taskId = await this.robotOrchestrator.addTask({
        type: 'CUSTOM',
        priority: 'HIGH',
        payload: {
          operation: 'BANK_SYNC',
          bankUrl,
          username,
          password,
          selectors,
          userId
        },
        userId,
        maxRetries: 3
      });

      // Executar automação
      const actions: AutomationAction[] = [
        { type: 'wait', delay: 2000, description: 'Aguardar carregamento' },
        { type: 'screenshot', description: 'Capturar tela inicial' },
        { type: 'extract', selector: '.balance', description: 'extrair_saldo' },
        { type: 'extract', selector: '.transactions', description: 'extrair_transacoes' }
      ];

      const automationConfig = {
        type: "web",
        target: bankUrl,
        credentials: { username, password },
        selectors,
        actions,
        stealth: true,
        timeout: 60000
      };

      // Corrigido: passar apenas as actions, não o objeto de configuração completo
      const result = await this.automationService.executeAutomation(actions);

      if (result.success) {
        // Processar dados extraídos
        await this.processBankData(userId, result.data);
        
        res.json({
          success: true,
          taskId,
          message: 'Sincronização bancária iniciada',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      this.logger.error('❌ Erro na sincronização bancária:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 📊 ANÁLISE FINANCEIRA
  async analyzeFinances(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      this.logger.info(`📈 Iniciando análise financeira para usuário: ${userId}`);

      // Buscar transações do usuário
      const { Transacoes } = await import('../../models/Transacoes');
      const { User } = await import('../../models/User');

      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const transactions = await Transacoes.find({ userId: user._id.toString() });

      // Mapear transações para a interface Transaction
      const mappedTransactions = transactions.map(t => ({
        id: t._id.toString(),
        description: t.descricao || 'Transação sem descrição',
        valor: t.valor,
        tipo: t.tipo as 'receita' | 'despesa',
        categoria: t.categoria || 'outros',
        data: t.data
      }));

      // Analisar finanças
      const analysis = await this.financialAnalyzer.analyzeUserFinances(userId, mappedTransactions);

      // Salvar análise no Redis
      await this.robotOrchestrator.setRedisHash(`user:${userId}:analysis`, analysis);

      res.json({
        success: true,
        analysis,
        message: 'Análise financeira concluída'
      });

    } catch (error) {
      this.logger.error('❌ Erro na análise financeira:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 📋 GERAÇÃO DE RELATÓRIOS
  async generateReport(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { period = 'month' } = req.query;

      this.logger.info(`📋 Gerando relatório para usuário: ${userId}, período: ${period}`);

      // Criar tarefa de geração de relatório
      const taskId = await this.robotOrchestrator.addTask({
        type: 'REPORT_GENERATION',
        priority: 'MEDIUM',
        payload: {
          operation: 'GENERATE_FINANCIAL_REPORT',
          userId,
          period
        },
        userId,
        maxRetries: 2
      });

      // Buscar dados do usuário
      const { User } = await import('../../models/User');
      const { Transacoes } = await import('../../models/Transacoes');
      const { Goal } = await import('../../models/Goal');
      const Investimento = await import('../../models/Investimento');

      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const transactions = await Transacoes.find({ userId: user._id.toString() });
      const goals = await Goal.find({ userId: user._id.toString() });
      const investments = await Investimento.default.find({ userId: user._id.toString() });

      // Gerar relatório
      const report = {
        userId,
        userName: user.name,
        period,
        generatedAt: new Date().toISOString(),
        summary: {
          totalTransactions: transactions.length,
          totalExpenses: transactions.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0),
          totalIncome: transactions.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0),
          totalInvestments: investments.reduce((sum, i) => sum + i.valor, 0),
          totalGoals: goals.reduce((sum, g) => sum + g.valor_total, 0)
        },
        topExpenses: transactions
          .filter(t => t.tipo === 'despesa')
          .sort((a, b) => b.valor - a.valor)
          .slice(0, 10),
        categoryBreakdown: this.calculateCategoryBreakdown(transactions),
        goals: goals,
        investments: investments
      };

      res.json({
        success: true,
        taskId,
        report,
        message: 'Relatório gerado com sucesso'
      });

    } catch (error) {
      this.logger.error('❌ Erro na geração de relatório:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 🏥 SAÚDE DO SISTEMA
  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.robotOrchestrator.getMetrics();
      const workers = await this.robotOrchestrator.getAllWorkers();
      const tasks = await this.robotOrchestrator.getAllTasks();

      const health = {
        system: {
          status: metrics.systemHealth,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        },
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
        lastUpdate: new Date().toISOString()
      };

      res.json({
        success: true,
        health
      });

    } catch (error) {
      this.logger.error('❌ Erro ao obter saúde do sistema:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 🧹 LIMPEZA AUTOMÁTICA
  async cleanupSystem(req: Request, res: Response): Promise<void> {
    try {
      this.logger.info('🧹 Iniciando limpeza do sistema');

      const taskId = await this.robotOrchestrator.addTask({
        type: 'CLEANUP',
        priority: 'LOW',
        payload: {
          operation: 'SYSTEM_CLEANUP'
        },
        maxRetries: 1
      });

      // Limpar dados antigos do Redis
      await this.robotOrchestrator.cleanup();

      res.json({
        success: true,
        taskId,
        message: 'Limpeza do sistema iniciada'
      });

    } catch (error) {
      this.logger.error('❌ Erro na limpeza do sistema:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // 🔐 SEGURANÇA
  async encryptData(req: Request, res: Response): Promise<void> {
    try {
      const { data } = req.body;

      if (!data) {
        res.status(400).json({ error: 'Dados não fornecidos' });
        return;
      }

      const encrypted = await this.securityService.encryptData(JSON.stringify(data));

      res.json({
        success: true,
        encrypted
      });

    } catch (error) {
      this.logger.error('❌ Erro na criptografia:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // Métodos auxiliares
  private async processBankData(userId: string, data: any): Promise<void> {
    // Processar dados bancários extraídos
    this.logger.info(`💾 Processando dados bancários para usuário: ${userId}`);
    
    // Aqui você implementaria a lógica para salvar os dados no banco
    // Por exemplo, criar transações baseadas nos dados extraídos
  }

  private calculateCategoryBreakdown(transactions: any[]): Record<string, number> {
    return transactions
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
        return acc;
      }, {} as Record<string, number>);
  }
} 