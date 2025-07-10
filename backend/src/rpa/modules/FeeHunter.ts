/***************************************
 * 💰 FEE HUNTER - CAÇADOR DE TARIFAS
 * (Detecção de taxas ocultas e tarifas escondidas)
 ***************************************/

export interface Transaction {
  description: string;
  amount: number;
  date: Date;
  category?: string;
  isFee?: boolean;
  suggestedAction?: string;
}

export interface FeeReport {
  totalHiddenFees: number;
  suspiciousTransactions: Transaction[];
  feeBreakdown: {
    monthlyFees: number;
    transactionFees: number;
    hiddenFees: number;
    iofFees: number;
    serviceFees: number;
  };
  recommendations: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class FeeHunter {
  private readonly FEE_KEYWORDS = [
    'tarifa',
    'taxa',
    'ajuste',
    'iof',
    'juros',
    'serviço',
    'manutenção',
    'administração',
    'custódia',
    'performance',
    'comissão',
    'spread',
    'corretagem',
    'custos',
    'encargos',
    'multa',
    'mora',
    'remuneração',
    'rendimento',
    'proventos'
  ];

  private readonly SUSPICIOUS_PATTERNS = [
    { regex: /taxa.*serviço/i, category: "Tarifa de Serviço" },
    { regex: /ajuste.*negativo/i, category: "Ajuste Cambial" },
    { regex: /iof.*\d+%/i, category: "IOF" },
    { regex: /manutenção.*conta/i, category: "Manutenção de Conta" },
    { regex: /custódia.*ativo/i, category: "Custódia" },
    { regex: /performance.*fee/i, category: "Taxa de Performance" },
    { regex: /comissão.*\d+%/i, category: "Comissão" },
    { regex: /spread.*\d+%/i, category: "Spread" },
    { regex: /corretagem.*\d+%/i, category: "Corretagem" },
    { regex: /multa.*atraso/i, category: "Multa por Atraso" },
    { regex: /juros.*mora/i, category: "Juros de Mora" },
    { regex: /encargos.*\d+%/i, category: "Encargos" }
  ];

  hunt(transactions: Transaction[]): Transaction[] {
    return transactions.map(t => ({
      ...t,
      isFee: this.isHiddenFee(t.description),
      suggestedAction: this.suggestAction(t)
    }));
  }

  private isHiddenFee(description: string): boolean {
    const lowerDescription = description.toLowerCase();
    
    // Verificar palavras-chave
    const hasFeeKeyword = this.FEE_KEYWORDS.some(keyword => 
      lowerDescription.includes(keyword)
    );

    // Verificar padrões suspeitos
    const hasSuspiciousPattern = this.SUSPICIOUS_PATTERNS.some(pattern => 
      pattern.regex.test(description)
    );

    // Verificar valores suspeitos (muito pequenos ou muito grandes)
    const amount = Math.abs(parseFloat(description.match(/\d+[.,]\d{2}/)?.[0] || '0'));
    const isSuspiciousAmount = amount > 0 && (amount < 5 || amount > 1000);

    return hasFeeKeyword || hasSuspiciousPattern || isSuspiciousAmount;
  }

  private suggestAction(transaction: Transaction): string {
    const description = transaction.description.toLowerCase();
    const amount = Math.abs(transaction.amount);

    if (/tarifa.*mensal/i.test(description)) {
      return "Negociar pacote de serviços com o banco";
    }
    
    if (/iof/i.test(description)) {
      return "Rever aplicações internacionais";
    }
    
    if (/manutenção.*conta/i.test(description)) {
      return "Verificar se há isenção disponível";
    }
    
    if (/custódia/i.test(description)) {
      return "Considerar transferência para custódia gratuita";
    }
    
    if (/performance.*fee/i.test(description)) {
      return "Avaliar se o fundo compensa a taxa";
    }
    
    if (/comissão/i.test(description)) {
      return "Negociar com o corretor";
    }
    
    if (/spread/i.test(description)) {
      return "Comparar com outras instituições";
    }
    
    if (/multa.*atraso/i.test(description)) {
      return "Configurar pagamentos automáticos";
    }
    
    if (/juros.*mora/i.test(description)) {
      return "Revisar datas de vencimento";
    }

    if (amount < 5) {
      return "Verificar se é tarifa desnecessária";
    }

    if (amount > 100) {
      return "Negociar ou trocar de instituição";
    }

    return "Revisar contrato e condições";
  }

  async generateFeeReport(userId: string): Promise<FeeReport> {
    try {
      // Importar modelo de transações
      const { Transacoes } = await import('../../models/Transacoes');
      const transactions = await Transacoes.find({ userId });
      
      // Mapear ITransacaoDocument para Transaction
      const mappedTransactions: Transaction[] = transactions.map(t => ({
        description: t.descricao,
        amount: t.valor,
        date: t.data,
        category: t.categoria
      }));
      
      const analyzed = this.hunt(mappedTransactions);
      const feeTransactions = analyzed.filter(t => t.isFee);
      
      const feeBreakdown = this.calculateFeeBreakdown(feeTransactions);
      const totalHiddenFees = feeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const recommendations = this.generateRecommendations(feeBreakdown, totalHiddenFees);
      const riskLevel = this.calculateRiskLevel(totalHiddenFees, feeTransactions.length);

      return {
        totalHiddenFees,
        suspiciousTransactions: feeTransactions,
        feeBreakdown,
        recommendations,
        riskLevel
      };
    } catch (error) {
      console.error('❌ Erro ao gerar relatório de tarifas:', error);
      return {
        totalHiddenFees: 0,
        suspiciousTransactions: [],
        feeBreakdown: {
          monthlyFees: 0,
          transactionFees: 0,
          hiddenFees: 0,
          iofFees: 0,
          serviceFees: 0
        },
        recommendations: ['Erro ao analisar tarifas'],
        riskLevel: 'LOW'
      };
    }
  }

  private calculateFeeBreakdown(feeTransactions: Transaction[]): FeeReport['feeBreakdown'] {
    const breakdown = {
      monthlyFees: 0,
      transactionFees: 0,
      hiddenFees: 0,
      iofFees: 0,
      serviceFees: 0
    };

    feeTransactions.forEach(t => {
      const description = t.description.toLowerCase();
      const amount = Math.abs(t.amount);

      if (/mensal|manutenção/i.test(description)) {
        breakdown.monthlyFees += amount;
      } else if (/transação|transferência/i.test(description)) {
        breakdown.transactionFees += amount;
      } else if (/iof/i.test(description)) {
        breakdown.iofFees += amount;
      } else if (/serviço|comissão|corretagem/i.test(description)) {
        breakdown.serviceFees += amount;
      } else {
        breakdown.hiddenFees += amount;
      }
    });

    return breakdown;
  }

  private generateRecommendations(feeBreakdown: FeeReport['feeBreakdown'], totalFees: number): string[] {
    const recommendations: string[] = [];

    if (feeBreakdown.monthlyFees > 50) {
      recommendations.push("💰 Negociar isenção de tarifa mensal");
    }

    if (feeBreakdown.transactionFees > 30) {
      recommendations.push("💳 Usar cartão de crédito para evitar tarifas de transferência");
    }

    if (feeBreakdown.iofFees > 20) {
      recommendations.push("🌍 Revisar aplicações internacionais");
    }

    if (feeBreakdown.serviceFees > 100) {
      recommendations.push("🏦 Comparar com outras instituições financeiras");
    }

    if (feeBreakdown.hiddenFees > 50) {
      recommendations.push("🔍 Solicitar detalhamento de todas as tarifas");
    }

    if (totalFees > 200) {
      recommendations.push("⚠️ Considerar mudança de banco");
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Tarifas em níveis aceitáveis");
    }

    return recommendations;
  }

  private calculateRiskLevel(totalFees: number, feeCount: number): FeeReport['riskLevel'] {
    if (totalFees > 500 || feeCount > 20) {
      return 'CRITICAL';
    } else if (totalFees > 200 || feeCount > 10) {
      return 'HIGH';
    } else if (totalFees > 100 || feeCount > 5) {
      return 'MEDIUM';
    } else {
      return 'LOW';
    }
  }

  // 🔍 DETECÇÃO AVANÇADA
  detectAnomalies(transactions: Transaction[]): Transaction[] {
    const amounts = transactions.map(t => Math.abs(t.amount));
    const median = this.calculateMedian(amounts);
    const threshold = median * 5; // 5x a mediana

    return transactions.filter(t => Math.abs(t.amount) > threshold);
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = numbers.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  // 📊 ANÁLISE DE TENDÊNCIAS
  analyzeFeeTrends(transactions: Transaction[], months: number = 6): any {
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    
    const recentTransactions = transactions.filter(t => t.date >= cutoffDate);
    const feeTransactions = this.hunt(recentTransactions).filter(t => t.isFee);

    const monthlyFees = this.groupByMonth(feeTransactions);
    const trend = this.calculateTrend(monthlyFees);

    return {
      monthlyFees,
      trend,
      averageMonthlyFee: this.calculateAverage(feeTransactions.map(t => Math.abs(t.amount))),
      totalFeesInPeriod: feeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    };
  }

  private groupByMonth(transactions: Transaction[]): Record<string, number> {
    const monthly: Record<string, number> = {};
    
    transactions.forEach(t => {
      const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      monthly[monthKey] = (monthly[monthKey] || 0) + Math.abs(t.amount);
    });

    return monthly;
  }

  private calculateTrend(monthlyFees: Record<string, number>): 'INCREASING' | 'DECREASING' | 'STABLE' {
    const values = Object.values(monthlyFees).sort();
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

  private calculateAverage(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
} 