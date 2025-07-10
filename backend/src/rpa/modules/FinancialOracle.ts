/***************************************
 * 🔮 FINANCIAL ORACLE - VIDENTE FINANCEIRO
 * (Previsões e análises preditivas)
 ***************************************/

export interface CashFlowPrediction {
  next30Days: number;
  next90Days: number;
  next180Days: number;
  alert: 'SAFE' | 'WARNING' | 'RISK_OF_OVERDRAFT' | 'CRITICAL';
  suggestion: string;
  confidence: number;
  factors: {
    spendingTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
    incomeStability: 'HIGH' | 'MEDIUM' | 'LOW';
    emergencyFund: 'ADEQUATE' | 'INSUFFICIENT' | 'NONE';
  };
}

export interface Transaction {
  date: Date;
  amount: number;
  description: string;
  category?: string;
  type: 'income' | 'expense';
}

export class FinancialOracle {
  private readonly BLACK_MAGIC_FORMULA = 0.78; // Constante secreta
  private readonly EMERGENCY_FUND_THRESHOLD = 6; // 6 meses de gastos
  private readonly OVERDRAFT_THRESHOLD = 1000; // R$ 1000 de margem

  async predictCashFlow(userId: string): Promise<CashFlowPrediction> {
    try {
      const transactions = await this.getTransactions(userId);
      const balance = await this.getCurrentBalance(userId);
      
      const dailySpending = this.calculateDailyAverage(transactions);
      const monthlyIncome = this.calculateMonthlyIncome(transactions);
      const emergencyFund = this.calculateEmergencyFund(transactions);
      
      // Previsões usando fórmula mágica
      const next30Days = this.predictBalance(balance, dailySpending, monthlyIncome, 30);
      const next90Days = this.predictBalance(balance, dailySpending, monthlyIncome, 90);
      const next180Days = this.predictBalance(balance, dailySpending, monthlyIncome, 180);
      
      const alert = this.determineAlert(next30Days, emergencyFund);
      const suggestion = this.getSuggestion(next30Days, emergencyFund, dailySpending, monthlyIncome);
      const confidence = this.calculateConfidence(transactions);
      
      const factors = {
        spendingTrend: this.analyzeSpendingTrend(transactions),
        incomeStability: this.analyzeIncomeStability(transactions),
        emergencyFund: this.analyzeEmergencyFund(emergencyFund, dailySpending)
      };

      return {
        next30Days,
        next90Days,
        next180Days,
        alert,
        suggestion,
        confidence,
        factors
      };
    } catch (error) {
      console.error('❌ Erro na previsão de fluxo de caixa:', error);
      return this.getDefaultPrediction();
    }
  }

  private async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const { Transacoes } = await import('../../models/Transacoes');
      const transactions = await Transacoes.find({ userId })
        .sort({ data: -1 })
        .limit(1000); // Últimos 1000 registros
      
      return transactions.map(t => ({
        date: new Date(t.data),
        amount: t.valor,
        description: t.descricao,
        category: t.categoria,
        type: t.valor > 0 ? 'income' : 'expense'
      }));
    } catch (error) {
      console.warn('⚠️ Erro ao buscar transações:', error);
      return [];
    }
  }

  private async getCurrentBalance(userId: string): Promise<number> {
    try {
      const { Transacoes } = await import('../../models/Transacoes');
      const result = await Transacoes.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$valor' } } }
      ]);
      
      return result[0]?.total || 0;
    } catch (error) {
      console.warn('⚠️ Erro ao calcular saldo:', error);
      return 0;
    }
  }

  private calculateDailyAverage(transactions: Transaction[]): number {
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .map(t => Math.abs(t.amount));
    
    if (expenses.length === 0) return 0;
    
    const totalExpenses = expenses.reduce((sum, amount) => sum + amount, 0);
    const daysInPeriod = this.calculateDaysInPeriod(transactions);
    
    return totalExpenses / daysInPeriod;
  }

  private calculateMonthlyIncome(transactions: Transaction[]): number {
    const incomes = transactions
      .filter(t => t.type === 'income')
      .map(t => t.amount);
    
    if (incomes.length === 0) return 0;
    
    const totalIncome = incomes.reduce((sum, amount) => sum + amount, 0);
    const monthsInPeriod = this.calculateDaysInPeriod(transactions) / 30;
    
    return totalIncome / monthsInPeriod;
  }

  private calculateEmergencyFund(transactions: Transaction[]): number {
    const dailySpending = this.calculateDailyAverage(transactions);
    const currentBalance = transactions
      .reduce((sum, t) => sum + t.amount, 0);
    
    return currentBalance / dailySpending; // Meses de reserva
  }

  private predictBalance(
    currentBalance: number, 
    dailySpending: number, 
    monthlyIncome: number, 
    days: number
  ): number {
    const monthlySpending = dailySpending * 30;
    const netMonthlyFlow = monthlyIncome - monthlySpending;
    const months = days / 30;
    
    // Aplicar fórmula mágica
    const predictedBalance = currentBalance + (netMonthlyFlow * months * this.BLACK_MAGIC_FORMULA);
    
    return Math.round(predictedBalance * 100) / 100;
  }

  private determineAlert(predictedBalance: number, emergencyFund: number): CashFlowPrediction['alert'] {
    if (predictedBalance < -this.OVERDRAFT_THRESHOLD) {
      return 'CRITICAL';
    } else if (predictedBalance < 0) {
      return 'RISK_OF_OVERDRAFT';
    } else if (emergencyFund < this.EMERGENCY_FUND_THRESHOLD) {
      return 'WARNING';
    } else {
      return 'SAFE';
    }
  }

  private getSuggestion(
    predictedBalance: number, 
    emergencyFund: number, 
    dailySpending: number, 
    monthlyIncome: number
  ): string {
    if (predictedBalance < 0) {
      const deficit = Math.abs(predictedBalance);
      return `⚠️ ALERTA: Projeção de déficit de R$ ${deficit.toFixed(2)}. Reduzir gastos em ${Math.round((deficit / monthlyIncome) * 100)}%`;
    }
    
    if (emergencyFund < this.EMERGENCY_FUND_THRESHOLD) {
      const monthsNeeded = this.EMERGENCY_FUND_THRESHOLD - emergencyFund;
      const monthlySavings = monthlyIncome - (dailySpending * 30);
      const monthsToSave = monthsNeeded / (monthlySavings / (dailySpending * 30));
      
      return `💰 Construir reserva de emergência: economizar R$ ${(dailySpending * 30 * 0.2).toFixed(2)}/mês por ${Math.ceil(monthsToSave)} meses`;
    }
    
    const surplus = predictedBalance;
    if (surplus > monthlyIncome * 0.3) {
      return `💡 Considerar investimento de R$ ${(surplus * 0.5).toFixed(2)} em aplicações de renda fixa`;
    }
    
    return "✅ Fluxo de caixa saudável!";
  }

  private calculateConfidence(transactions: Transaction[]): number {
    const daysInPeriod = this.calculateDaysInPeriod(transactions);
    const transactionCount = transactions.length;
    
    // Fatores de confiança
    const dataCompleteness = Math.min(1, transactionCount / 100); // 100+ transações = 100% confiança
    const timeSpan = Math.min(1, daysInPeriod / 90); // 90+ dias = 100% confiança
    const consistency = this.calculateConsistency(transactions);
    
    const confidence = (dataCompleteness * 0.4 + timeSpan * 0.3 + consistency * 0.3);
    return Math.round(confidence * 100);
  }

  private calculateConsistency(transactions: Transaction[]): number {
    const monthlyIncomes = this.groupByMonth(transactions, 'income');
    const monthlyExpenses = this.groupByMonth(transactions, 'expense');
    
    const incomeVariance = this.calculateVariance(Object.values(monthlyIncomes));
    const expenseVariance = this.calculateVariance(Object.values(monthlyExpenses));
    
    // Menor variância = maior consistência
    const incomeConsistency = Math.max(0, 1 - (incomeVariance / 1000000));
    const expenseConsistency = Math.max(0, 1 - (expenseVariance / 1000000));
    
    return (incomeConsistency + expenseConsistency) / 2;
  }

  private analyzeSpendingTrend(transactions: Transaction[]): 'INCREASING' | 'DECREASING' | 'STABLE' {
    const monthlyExpenses = this.groupByMonth(transactions, 'expense');
    const values = Object.values(monthlyExpenses).sort();
    
    if (values.length < 2) return 'STABLE';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 10) return 'INCREASING';
    if (change < -10) return 'DECREASING';
    return 'STABLE';
  }

  private analyzeIncomeStability(transactions: Transaction[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    const monthlyIncomes = this.groupByMonth(transactions, 'income');
    const variance = this.calculateVariance(Object.values(monthlyIncomes));
    const average = this.calculateAverage(Object.values(monthlyIncomes));
    
    const coefficientOfVariation = variance / average;
    
    if (coefficientOfVariation < 0.1) return 'HIGH';
    if (coefficientOfVariation < 0.3) return 'MEDIUM';
    return 'LOW';
  }

  private analyzeEmergencyFund(emergencyFund: number, dailySpending: number): 'ADEQUATE' | 'INSUFFICIENT' | 'NONE' {
    if (emergencyFund >= this.EMERGENCY_FUND_THRESHOLD) return 'ADEQUATE';
    if (emergencyFund > 0) return 'INSUFFICIENT';
    return 'NONE';
  }

  private calculateDaysInPeriod(transactions: Transaction[]): number {
    if (transactions.length === 0) return 30; // Padrão
    
    const oldest = new Date(Math.min(...transactions.map(t => t.date.getTime())));
    const newest = new Date(Math.max(...transactions.map(t => t.date.getTime())));
    
    return Math.max(1, Math.ceil((newest.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24)));
  }

  private groupByMonth(transactions: Transaction[], type: 'income' | 'expense'): Record<string, number> {
    const monthly: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === type)
      .forEach(t => {
        const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
        monthly[monthKey] = (monthly[monthKey] || 0) + Math.abs(t.amount);
      });
    
    return monthly;
  }

  private calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = this.calculateAverage(numbers);
    const squaredDifferences = numbers.map(n => Math.pow(n - mean, 2));
    
    return this.calculateAverage(squaredDifferences);
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private getDefaultPrediction(): CashFlowPrediction {
    return {
      next30Days: 0,
      next90Days: 0,
      next180Days: 0,
      alert: 'WARNING',
      suggestion: 'Dados insuficientes para análise',
      confidence: 0,
      factors: {
        spendingTrend: 'STABLE',
        incomeStability: 'MEDIUM',
        emergencyFund: 'INSUFFICIENT'
      }
    };
  }

  // 🔮 PREVISÕES AVANÇADAS
  async predictInvestmentOpportunity(userId: string): Promise<any> {
    const prediction = await this.predictCashFlow(userId);
    
    if (prediction.alert === 'SAFE' && prediction.next30Days > 1000) {
      return {
        opportunity: true,
        amount: prediction.next30Days * 0.3,
        type: 'CDB',
        expectedReturn: '12% a.a.',
        risk: 'BAIXO'
      };
    }
    
    return { opportunity: false };
  }

  async predictFinancialCrisis(userId: string): Promise<any> {
    const prediction = await this.predictCashFlow(userId);
    
    if (prediction.alert === 'CRITICAL') {
      return {
        crisis: true,
        severity: 'ALTA',
        timeline: '30 dias',
        recommendations: [
          'Reduzir gastos em 50%',
          'Buscar fontes de renda alternativas',
          'Negociar dívidas',
          'Vender ativos não essenciais'
        ]
      };
    }
    
    return { crisis: false };
  }
} 