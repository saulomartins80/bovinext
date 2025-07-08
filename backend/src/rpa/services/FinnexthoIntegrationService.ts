import { User } from '../../models/User';
import { Transacoes } from '../../models/Transacoes';
import { BankTransaction } from './BankAutomationService';

export interface SyncResult {
  success: boolean;
  transactionsAdded: number;
  transactionsUpdated: number;
  errors: string[];
  executionTime: number;
}

export class FinnexthoIntegrationService {
  
  async saveTransactions(userId: string, transactions: BankTransaction[]): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let transactionsAdded = 0;
    let transactionsUpdated = 0;

    try {
      // Buscar usuário
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Processar cada transação
      for (const transaction of transactions) {
        try {
          // Verificar se transação já existe (por data, descrição e valor)
          const existingTransaction = await Transacoes.findOne({
            userId: user._id,
            valor: transaction.amount,
            descricao: transaction.description,
            data: {
              $gte: new Date(transaction.date),
              $lt: new Date(new Date(transaction.date).getTime() + 24 * 60 * 60 * 1000) // +1 dia
            }
          });

          if (existingTransaction) {
            // Atualizar transação existente
            await Transacoes.updateOne(
              { _id: existingTransaction._id },
              {
                $set: {
                  categoria: transaction.category,
                  tipo: transaction.type,
                  updatedAt: new Date()
                }
              }
            );
            transactionsUpdated++;
          } else {
            // Criar nova transação
            await Transacoes.create({
              userId: user._id,
              valor: transaction.amount,
              descricao: transaction.description,
              tipo: transaction.type,
              categoria: transaction.category,
              data: new Date(transaction.date),
              createdAt: new Date(),
              updatedAt: new Date()
            });
            transactionsAdded++;
          }
        } catch (error) {
          errors.push(`Erro ao processar transação: ${transaction.description} - ${error.message}`);
        }
      }

      const executionTime = Date.now() - startTime;

      return {
        success: errors.length === 0,
        transactionsAdded,
        transactionsUpdated,
        errors,
        executionTime
      };

    } catch (error) {
      return {
        success: false,
        transactionsAdded: 0,
        transactionsUpdated: 0,
        errors: [error.message],
        executionTime: Date.now() - startTime
      };
    }
  }

  async analyzeUserFinances(userId: string): Promise<any> {
    try {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Buscar transações dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const transactions = await Transacoes.find({
        userId: user._id,
        data: { $gte: thirtyDaysAgo }
      });

      // Análise por categoria
      const categoryAnalysis = transactions.reduce((acc, transaction) => {
        const category = transaction.categoria || 'Outros';
        if (!acc[category]) {
          acc[category] = { total: 0, count: 0, transactions: [] };
        }
        acc[category].total += transaction.valor;
        acc[category].count += 1;
        acc[category].transactions.push({
          descricao: transaction.descricao,
          valor: transaction.valor,
          data: transaction.data
        });
        return acc;
      }, {} as any);

      // Calcular totais
      const totalExpenses = transactions
        .filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + t.valor, 0);

      const totalIncome = transactions
        .filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + t.valor, 0);

      const balance = totalIncome - totalExpenses;

      // Top categorias de gastos
      const topCategories = Object.entries(categoryAnalysis)
        .filter(([_, data]: [string, any]) => data.total > 0)
        .sort(([_, a]: [string, any], [__, b]: [string, any]) => b.total - a.total)
        .slice(0, 5);

      return {
        period: '30 dias',
        totalIncome,
        totalExpenses,
        balance,
        categoryAnalysis,
        topCategories,
        transactionCount: transactions.length,
        averageDailySpending: totalExpenses / 30
      };

    } catch (error) {
      throw new Error(`Erro na análise financeira: ${error.message}`);
    }
  }

  async generateFinancialReport(userId: string, period: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    try {
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Calcular período
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }

      const transactions = await Transacoes.find({
        userId: user._id,
        data: { $gte: startDate, $lte: endDate }
      });

      // Análise completa
      const analysis = await this.analyzeUserFinances(userId);

      // Tendências
      const dailySpending = this.calculateDailySpending(transactions, startDate, endDate);

      // Recomendações
      const recommendations = this.generateRecommendations(analysis);

      return {
        userId,
        period,
        startDate,
        endDate,
        analysis,
        dailySpending,
        recommendations,
        generatedAt: new Date()
      };

    } catch (error) {
      throw new Error(`Erro ao gerar relatório: ${error.message}`);
    }
  }

  private calculateDailySpending(transactions: any[], startDate: Date, endDate: Date): any[] {
    const dailyData: { [key: string]: number } = {};
    
    // Inicializar todos os dias com 0
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dailyData[d.toISOString().split('T')[0]] = 0;
    }

    // Somar gastos por dia
    transactions
      .filter(t => t.tipo === 'despesa')
      .forEach(t => {
        const dateKey = t.data.toISOString().split('T')[0];
        if (dailyData[dateKey] !== undefined) {
          dailyData[dateKey] += t.valor;
        }
      });

    return Object.entries(dailyData).map(([date, amount]) => ({
      date,
      amount
    }));
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    // Análise de gastos por categoria
    const topCategory = analysis.topCategories[0];
    if (topCategory && topCategory[1].total > analysis.totalExpenses * 0.4) {
      recommendations.push(`⚠️ ${topCategory[0]} representa ${((topCategory[1].total / analysis.totalExpenses) * 100).toFixed(1)}% dos seus gastos. Considere reduzir gastos nesta categoria.`);
    }

    // Análise de saldo
    if (analysis.balance < 0) {
      recommendations.push('🔴 Seu saldo está negativo. Considere reduzir gastos ou aumentar receitas.');
    } else if (analysis.balance < analysis.totalExpenses * 0.2) {
      recommendations.push('🟡 Seu saldo está baixo. Recomendamos economizar mais.');
    } else {
      recommendations.push('🟢 Excelente! Você está mantendo um bom saldo.');
    }

    // Análise de gasto diário
    if (analysis.averageDailySpending > analysis.totalIncome / 30) {
      recommendations.push('📈 Seu gasto diário está acima da sua receita diária. Considere ajustar seu orçamento.');
    }

    return recommendations;
  }
} 