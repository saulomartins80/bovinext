import { RobotWorker } from '../RobotOrchestrator';
import { User } from '../../models/User';
import { Transacoes } from '../../models/Transacoes';
import { Goal } from '../../models/Goal';
import Investimento from '../../models/Investimento';
import winston from 'winston';

export class DataSyncWorker {
  private worker: RobotWorker;
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'data-sync-worker' },
      transports: [
        new winston.transports.File({ filename: 'logs/rpa-data-sync.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  async register(): Promise<string> {
    this.worker = {
      id: '',
      name: 'DataSyncWorker',
      type: 'DATA_SYNC',
      status: 'IDLE',
      lastHeartbeat: new Date(),
      capabilities: ['DATA_SYNC', 'USER_ANALYSIS', 'REPORT_GENERATION'],
      performance: {
        tasksCompleted: 0,
        tasksFailed: 0,
        averageExecutionTime: 0
      }
    };

    // Registrar no orquestrador
    const { robotOrchestrator } = await import('../RobotOrchestrator');
    const workerId = await robotOrchestrator.registerWorker(this.worker);
    this.worker.id = workerId;

    this.logger.info(`📊 DataSyncWorker registrado: ${workerId}`);
    return workerId;
  }

  async processTask(taskId: string, payload: any): Promise<void> {
    try {
      this.logger.info(`🔄 Processando tarefa de sincronização: ${taskId}`);
      
      switch (payload.operation) {
        case 'SYNC_USER_DATA':
          await this.syncUserData(payload.userId);
          break;
        case 'ANALYZE_USER_FINANCES':
          await this.analyzeUserFinances(payload.userId);
          break;
        case 'GENERATE_FINANCIAL_REPORT':
          await this.generateFinancialReport(payload.userId);
          break;
        case 'CLEANUP_OLD_DATA':
          await this.cleanupOldData();
          break;
        default:
          throw new Error(`Operação não suportada: ${payload.operation}`);
      }

      this.logger.info(`✅ Tarefa ${taskId} concluída com sucesso`);
    } catch (error) {
      this.logger.error(`❌ Erro na tarefa ${taskId}:`, error);
      throw error;
    }
  }

  private async syncUserData(userId: string): Promise<void> {
    this.logger.info(`🔄 Sincronizando dados do usuário: ${userId}`);
    
    // Buscar usuário
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      throw new Error(`Usuário não encontrado: ${userId}`);
    }

    // Sincronizar transações
    const transacoes = await Transacoes.find({ userId: user._id.toString() });
    this.logger.info(`📊 ${transacoes.length} transações sincronizadas`);

    // Sincronizar metas
    const metas = await Goal.find({ userId: user._id.toString() });
    this.logger.info(`🎯 ${metas.length} metas sincronizadas`);

    // Sincronizar investimentos
    const investimentos = await Investimento.find({ userId: user._id.toString() });
    this.logger.info(`💰 ${investimentos.length} investimentos sincronizados`);

    // Calcular métricas
    const totalGastos = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const totalReceitas = transacoes
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);

    const totalInvestido = investimentos.reduce((sum, i) => sum + i.valor, 0);
    const totalMetas = metas.reduce((sum, m) => sum + m.valor_total, 0);

    // Salvar métricas no Redis
    const { robotOrchestrator } = await import('../RobotOrchestrator');
    await robotOrchestrator.setRedisHash(`user:${userId}:metrics`, {
      totalGastos: totalGastos.toFixed(2),
      totalReceitas: totalReceitas.toFixed(2),
      totalInvestido: totalInvestido.toFixed(2),
      totalMetas: totalMetas.toFixed(2),
      saldo: (totalReceitas - totalGastos).toFixed(2),
      lastSync: new Date().toISOString()
    });

    this.logger.info(`✅ Dados do usuário ${userId} sincronizados`);
  }

  private async analyzeUserFinances(userId: string): Promise<void> {
    this.logger.info(`📈 Analisando finanças do usuário: ${userId}`);
    
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      throw new Error(`Usuário não encontrado: ${userId}`);
    }

    // Buscar dados
    const transacoes = await Transacoes.find({ userId: user._id.toString() });
    const metas = await Goal.find({ userId: user._id.toString() });
    const investimentos = await Investimento.find({ userId: user._id.toString() });

    // Análise de gastos por categoria
    const gastosPorCategoria = transacoes
      .filter(t => t.tipo === 'despesa')
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
        return acc;
      }, {} as Record<string, number>);

    // Análise de tendências
    const ultimos30Dias = new Date();
    ultimos30Dias.setDate(ultimos30Dias.getDate() - 30);
    
    const gastosRecentes = transacoes
      .filter(t => t.tipo === 'despesa' && t.data >= ultimos30Dias)
      .reduce((sum, t) => sum + t.valor, 0);

    // Salvar análise
    const { robotOrchestrator } = await import('../RobotOrchestrator');
    await robotOrchestrator.setRedisHash(`user:${userId}:analysis`, {
      gastosPorCategoria: JSON.stringify(gastosPorCategoria),
      gastosUltimos30Dias: gastosRecentes.toFixed(2),
      totalTransacoes: transacoes.length,
      totalMetas: metas.length,
      totalInvestimentos: investimentos.length,
      lastAnalysis: new Date().toISOString()
    });

    this.logger.info(`✅ Análise financeira do usuário ${userId} concluída`);
  }

  private async generateFinancialReport(userId: string): Promise<void> {
    this.logger.info(`📋 Gerando relatório financeiro: ${userId}`);
    
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      throw new Error(`Usuário não encontrado: ${userId}`);
    }

    // Buscar dados
    const transacoes = await Transacoes.find({ userId: user._id.toString() });
    const metas = await Goal.find({ userId: user._id.toString() });
    const investimentos = await Investimento.find({ userId: user._id.toString() });

    // Gerar relatório
    const report = {
      userId,
      userName: user.name,
      generatedAt: new Date().toISOString(),
      summary: {
        totalTransacoes: transacoes.length,
        totalGastos: transacoes.filter(t => t.tipo === 'despesa').reduce((sum, t) => sum + t.valor, 0),
        totalReceitas: transacoes.filter(t => t.tipo === 'receita').reduce((sum, t) => sum + t.valor, 0),
        totalInvestimentos: investimentos.reduce((sum, i) => sum + i.valor, 0),
        totalMetas: metas.reduce((sum, m) => sum + m.valor_total, 0)
      },
      topGastos: transacoes
        .filter(t => t.tipo === 'despesa')
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5)
        .map(t => ({ descricao: t.descricao, valor: t.valor, data: t.data })),
      metasProgresso: metas.map(m => ({
        meta: m.meta,
        valorTotal: m.valor_total,
        valorAtual: m.valor_atual,
        percentual: ((m.valor_atual / m.valor_total) * 100).toFixed(1)
      }))
    };

    // Salvar relatório
    const { robotOrchestrator } = await import('../RobotOrchestrator');
    const reportId = `report_${userId}_${Date.now()}`;
    await robotOrchestrator.setRedisData(`report:${reportId}`, report, 86400); // 24h

    this.logger.info(`✅ Relatório financeiro gerado: ${reportId}`);
  }

  private async cleanupOldData(): Promise<void> {
    this.logger.info(`🧹 Iniciando limpeza de dados antigos`);
    
    // Limpar transações antigas (mais de 2 anos)
    const doisAnosAtras = new Date();
    doisAnosAtras.setFullYear(doisAnosAtras.getFullYear() - 2);
    
    const resultado = await Transacoes.deleteMany({
      data: { $lt: doisAnosAtras }
    });

    this.logger.info(`✅ ${resultado.deletedCount} transações antigas removidas`);
  }
} 