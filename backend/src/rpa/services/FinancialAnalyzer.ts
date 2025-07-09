import winston from 'winston';

interface Transaction {
  id: string;
  description: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  data: Date;
}

interface FinancialAnalysis {
  userId: string;
  totalGastos: number;
  totalReceitas: number;
  saldo: number;
  gastosPorCategoria: Record<string, number>;
  tendencias: {
    gastosUltimos30Dias: number;
    gastosUltimos7Dias: number;
    previsaoProximos30Dias: number;
  };
  categorias: {
    maiorGasto: string;
    menorGasto: string;
    categoriaMaisFrequente: string;
  };
  recomendacoes: string[];
  scoreFinanceiro: number;
  lastAnalysis: Date;
}

export class FinancialAnalyzer {
  private logger: winston.Logger;
  private categories: Record<string, string[]> = {
    alimentacao: ['mercado', 'restaurante', 'padaria', 'ifood', 'rappi', 'uber eats', 'mcdonalds', 'burger king'],
    transporte: ['uber', 'taxi', 'posto', 'combustivel', 'gasolina', 'etanol', 'metro', 'onibus'],
    moradia: ['aluguel', 'condominio', 'energia', 'agua', 'internet', 'telefone', 'iptu'],
    lazer: ['cinema', 'teatro', 'show', 'bar', 'balada', 'netflix', 'spotify', 'youtube'],
    saude: ['farmacia', 'medico', 'dentista', 'hospital', 'plano de saude'],
    educacao: ['escola', 'universidade', 'curso', 'livro', 'material escolar'],
    vestuario: ['roupa', 'sapato', 'acessorio', 'shopping', 'loja'],
    tecnologia: ['celular', 'computador', 'notebook', 'tablet', 'apple', 'samsung'],
    investimentos: ['acoes', 'fii', 'tesouro', 'cdb', 'lci', 'lca'],
    outros: []
  };

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'financial-analyzer' },
      transports: [
        new winston.transports.File({ filename: 'logs/rpa-financial.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  async analyzeUserFinances(userId: string, transactions: Transaction[]): Promise<FinancialAnalysis> {
    this.logger.info(`📊 Analisando finanças do usuário: ${userId}`);

    // Categorizar transações automaticamente
    const categorizedTransactions = this.categorizeTransactions(transactions);
    
    // Calcular métricas básicas
    const totalGastos = categorizedTransactions
      .filter(t => t.tipo === 'despesa')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const totalReceitas = categorizedTransactions
      .filter(t => t.tipo === 'receita')
      .reduce((sum, t) => sum + t.valor, 0);

    const saldo = totalReceitas - totalGastos;

    // Análise por categoria
    const gastosPorCategoria = this.analyzeByCategory(categorizedTransactions);

    // Análise de tendências
    const tendencias = this.analyzeTrends(categorizedTransactions);

    // Categorias mais relevantes
    const categorias = this.findTopCategories(gastosPorCategoria);

    // Gerar recomendações
    const recomendacoes = this.generateRecommendations({
      totalGastos,
      totalReceitas,
      saldo,
      gastosPorCategoria,
      tendencias
    });

    // Calcular score financeiro
    const scoreFinanceiro = this.calculateFinancialScore({
      totalGastos,
      totalReceitas,
      saldo,
      gastosPorCategoria
    });

    const analysis: FinancialAnalysis = {
      userId,
      totalGastos,
      totalReceitas,
      saldo,
      gastosPorCategoria,
      tendencias,
      categorias,
      recomendacoes,
      scoreFinanceiro,
      lastAnalysis: new Date()
    };

    this.logger.info(`✅ Análise financeira concluída para ${userId}. Score: ${scoreFinanceiro}`);
    return analysis;
  }

  private categorizeTransactions(transactions: Transaction[]): Transaction[] {
    return transactions.map(transaction => {
      const category = this.detectCategory(transaction.description);
      return {
        ...transaction,
        categoria: category
      };
    });
  }

  private detectCategory(description: string): string {
    const descLower = description.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.categories)) {
      if (keywords.some(keyword => descLower.includes(keyword))) {
        return category;
      }
    }
    
    return 'outros';
  }

  private analyzeByCategory(transactions: Transaction[]): Record<string, number> {
    const gastos = transactions.filter(t => t.tipo === 'despesa');
    
    return gastos.reduce((acc, transaction) => {
      acc[transaction.categoria] = (acc[transaction.categoria] || 0) + transaction.valor;
      return acc;
    }, {} as Record<string, number>);
  }

  private analyzeTrends(transactions: Transaction[]): FinancialAnalysis['tendencias'] {
    const now = new Date();
    const ultimos30Dias = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ultimos7Dias = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const gastosUltimos30Dias = transactions
      .filter(t => t.tipo === 'despesa' && t.data >= ultimos30Dias)
      .reduce((sum, t) => sum + t.valor, 0);

    const gastosUltimos7Dias = transactions
      .filter(t => t.tipo === 'despesa' && t.data >= ultimos7Dias)
      .reduce((sum, t) => sum + t.valor, 0);

    // Previsão simples baseada na média dos últimos 30 dias
    const previsaoProximos30Dias = gastosUltimos30Dias * 1.1; // +10% para inflação

    return {
      gastosUltimos30Dias,
      gastosUltimos7Dias,
      previsaoProximos30Dias
    };
  }

  private findTopCategories(gastosPorCategoria: Record<string, number>): FinancialAnalysis['categorias'] {
    const entries = Object.entries(gastosPorCategoria);
    
    if (entries.length === 0) {
      return {
        maiorGasto: 'nenhuma',
        menorGasto: 'nenhuma',
        categoriaMaisFrequente: 'nenhuma'
      };
    }

    const sorted = entries.sort((a, b) => b[1] - a[1]);
    
    return {
      maiorGasto: sorted[0][0],
      menorGasto: sorted[sorted.length - 1][0],
      categoriaMaisFrequente: sorted[0][0]
    };
  }

  private generateRecommendations(data: {
    totalGastos: number;
    totalReceitas: number;
    saldo: number;
    gastosPorCategoria: Record<string, number>;
    tendencias: FinancialAnalysis['tendencias'];
  }): string[] {
    const recomendacoes: string[] = [];

    // Análise de saldo
    if (data.saldo < 0) {
      recomendacoes.push('⚠️ Seu saldo está negativo. Considere reduzir gastos ou aumentar receitas.');
    }

    // Análise de gastos por categoria
    const topGastos = Object.entries(data.gastosPorCategoria)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topGastos.length > 0) {
      const [categoria, valor] = topGastos[0];
      if (valor > data.totalReceitas * 0.3) {
        recomendacoes.push(`💰 ${categoria} representa mais de 30% dos seus gastos. Considere reduzir.`);
      }
    }

    // Análise de tendências
    if (data.tendencias.gastosUltimos7Dias > data.tendencias.gastosUltimos30Dias / 4) {
      recomendacoes.push('📈 Seus gastos da última semana estão acima da média. Atenção!');
    }

    // Recomendações positivas
    if (data.saldo > 0) {
      recomendacoes.push('✅ Excelente! Você está com saldo positivo. Continue assim!');
    }

    if (Object.keys(data.gastosPorCategoria).length > 5) {
      recomendacoes.push('📊 Você tem boa diversificação de gastos. Isso é positivo!');
    }

    return recomendacoes;
  }

  private calculateFinancialScore(data: {
    totalGastos: number;
    totalReceitas: number;
    saldo: number;
    gastosPorCategoria: Record<string, number>;
  }): number {
    let score = 0;

    // Score baseado no saldo
    if (data.saldo > 0) {
      score += 30;
    } else if (data.saldo > -data.totalReceitas * 0.1) {
      score += 15;
    }

    // Score baseado na proporção gastos/receitas
    const proporcao = data.totalGastos / data.totalReceitas;
    if (proporcao < 0.7) {
      score += 25;
    } else if (proporcao < 0.9) {
      score += 15;
    } else if (proporcao < 1.0) {
      score += 5;
    }

    // Score baseado na diversificação
    const numCategorias = Object.keys(data.gastosPorCategoria).length;
    if (numCategorias >= 5) {
      score += 20;
    } else if (numCategorias >= 3) {
      score += 10;
    }

    // Score baseado no valor absoluto dos gastos
    if (data.totalGastos < 1000) {
      score += 15;
    } else if (data.totalGastos < 3000) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }
} 