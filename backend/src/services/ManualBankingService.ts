import { Transacoes } from '../models/Transacoes';
import { User } from '../models/User';
import winston from 'winston';
import csv from 'csv-parser';
import { Readable } from 'stream';

interface TransactionData {
  data: Date;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria?: string;
}

export class ManualBankingService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'manual-banking' },
      transports: [
        new winston.transports.File({ filename: 'logs/manual-banking.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  async uploadCSV(userId: string, csvBuffer: Buffer): Promise<any> {
    try {
      this.logger.info(`Iniciando upload CSV para usuário: ${userId}`);

      // Verificar se usuário existe
      const user = await User.findOne({ firebaseUid: userId });
      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Processar CSV
      const transactions = await this.parseCSV(csvBuffer);
      
      // Categorizar automaticamente
      const categorizedTransactions = this.categorizeTransactions(transactions);
      
      // Salvar no banco
      const savedTransactions = await this.saveTransactions(userId, categorizedTransactions);

      this.logger.info(`Upload concluído: ${savedTransactions.length} transações salvas`);

      return {
        success: true,
        message: `${savedTransactions.length} transações importadas com sucesso!`,
        transactions: savedTransactions.length,
        categories: this.getCategorySummary(categorizedTransactions)
      };

    } catch (error) {
      this.logger.error('Erro no upload CSV:', error);
      throw error;
    }
  }

  private async parseCSV(csvBuffer: Buffer): Promise<TransactionData[]> {
    return new Promise((resolve, reject) => {
      const transactions: TransactionData[] = [];
      const stream = Readable.from(csvBuffer);

      stream
        .pipe(csv())
        .on('data', (row) => {
          try {
            const transaction = this.parseRow(row);
            if (transaction) {
              transactions.push(transaction);
            }
          } catch (error) {
            this.logger.warn('Erro ao processar linha:', error);
          }
        })
        .on('end', () => {
          resolve(transactions);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private parseRow(row: any): TransactionData | null {
    try {
      // Mapear diferentes formatos de CSV
      const date = this.parseDate(row.data || row.date || row.Data || row.Date);
      const description = row.descricao || row.description || row.Descrição || row.Description;
      const amount = this.parseAmount(row.valor || row.amount || row.Valor || row.Amount);
      
      if (!date || !description || amount === null) {
        return null;
      }

      return {
        data: date,
        descricao: description,
        valor: Math.abs(amount),
        tipo: amount > 0 ? 'receita' : 'despesa'
      };
    } catch (error) {
      this.logger.warn('Erro ao processar linha:', error);
      return null;
    }
  }

  private parseDate(dateStr: string): Date | null {
    try {
      // Tentar diferentes formatos de data
      const formats = [
        'DD/MM/YYYY',
        'YYYY-MM-DD',
        'DD-MM-YYYY',
        'MM/DD/YYYY'
      ];

      for (const format of formats) {
        try {
          // Implementar parser de data baseado no formato
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date;
          }
        } catch (e) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  private parseAmount(amountStr: string): number | null {
    try {
      // Remover símbolos de moeda e espaços
      const cleanAmount = amountStr
        .replace(/[R$\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      
      return parseFloat(cleanAmount);
    } catch (error) {
      return null;
    }
  }

  private categorizeTransactions(transactions: TransactionData[]): TransactionData[] {
    const categories = {
      alimentacao: ['mercado', 'restaurante', 'padaria', 'ifood', 'rappi', 'uber eats'],
      transporte: ['uber', 'taxi', 'posto', 'combustivel', 'gasolina', 'etanol'],
      moradia: ['aluguel', 'condominio', 'energia', 'agua', 'internet', 'telefone'],
      lazer: ['cinema', 'teatro', 'show', 'bar', 'balada', 'netflix', 'spotify'],
      saude: ['farmacia', 'medico', 'dentista', 'hospital', 'plano de saude'],
      educacao: ['escola', 'universidade', 'curso', 'livro', 'material escolar'],
      vestuario: ['roupa', 'sapato', 'acessorio', 'shopping', 'loja'],
      tecnologia: ['celular', 'computador', 'notebook', 'tablet', 'apple', 'samsung'],
      investimentos: ['acoes', 'fii', 'tesouro', 'cdb', 'lci', 'lca']
    };

    return transactions.map(transaction => {
      const descLower = transaction.descricao.toLowerCase();
      
      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => descLower.includes(keyword))) {
          return { ...transaction, categoria: category };
        }
      }
      
      return { ...transaction, categoria: 'outros' };
    });
  }

  private async saveTransactions(userId: string, transactions: TransactionData[]): Promise<any[]> {
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const savedTransactions = [];

    for (const transaction of transactions) {
      const newTransaction = new Transacoes({
        userId: user._id,
        descricao: transaction.descricao,
        valor: transaction.valor,
        tipo: transaction.tipo,
        categoria: transaction.categoria,
        data: transaction.data
      });

      const saved = await newTransaction.save();
      savedTransactions.push(saved);
    }

    return savedTransactions;
  }

  private getCategorySummary(transactions: TransactionData[]): Record<string, number> {
    return transactions.reduce((acc, transaction) => {
      const category = transaction.categoria || 'outros';
      acc[category] = (acc[category] || 0) + transaction.valor;
      return acc;
    }, {} as Record<string, number>);
  }

  async getUploadHistory(userId: string): Promise<any[]> {
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Buscar transações mais recentes
    const transactions = await Transacoes.find({ userId: user._id })
      .sort({ data: -1 })
      .limit(50);

    return transactions;
  }
} 