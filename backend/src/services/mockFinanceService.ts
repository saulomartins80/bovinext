import { Transaction, Account, Institution } from '../types/finance';

interface MockConfig {
  enableMock: boolean;
  mockDelay: number;
}

class MockFinanceService {
  private config: MockConfig;

  constructor() {
    this.config = {
      enableMock: process.env.ENABLE_MOCK_FINANCE === 'true',
      mockDelay: parseInt(process.env.MOCK_DELAY || '1000')
    };
  }

  // Simular delay para parecer real
  private async delay(ms: number = this.config.mockDelay): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Gerar dados de instituições simuladas
  async getInstitutions(): Promise<Institution[]> {
    await this.delay();
    
    return [
      {
        id: 'mock-nubank',
        name: 'Nubank',
        type: 'bank',
        logo: 'https://via.placeholder.com/100x50/8A2BE2/FFFFFF?text=Nubank'
      },
      {
        id: 'mock-itau',
        name: 'Itaú',
        type: 'bank',
        logo: 'https://via.placeholder.com/100x50/FF6B35/FFFFFF?text=Itau'
      },
      {
        id: 'mock-bradesco',
        name: 'Bradesco',
        type: 'bank',
        logo: 'https://via.placeholder.com/100x50/FFD700/000000?text=Bradesco'
      },
      {
        id: 'mock-inter',
        name: 'Banco Inter',
        type: 'bank',
        logo: 'https://via.placeholder.com/100x50/FF6B6B/FFFFFF?text=Inter'
      }
    ];
  }

  // Gerar contas simuladas
  async getAccounts(): Promise<Account[]> {
    await this.delay();
    
    return [
      {
        id: 'mock-account-1',
        name: 'Conta Corrente',
        type: 'checking',
        subtype: 'checking',
        currency: 'BRL',
        balance: {
          current: 5420.50,
          available: 5420.50
        },
        institution: {
          name: 'Nubank',
          type: 'bank'
        }
      },
      {
        id: 'mock-account-2',
        name: 'Cartão de Crédito',
        type: 'credit',
        subtype: 'credit_card',
        currency: 'BRL',
        balance: {
          current: -1250.30,
          available: 8749.70
        },
        institution: {
          name: 'Nubank',
          type: 'bank'
        }
      },
      {
        id: 'mock-account-3',
        name: 'Conta Poupança',
        type: 'savings',
        subtype: 'savings',
        currency: 'BRL',
        balance: {
          current: 15000.00,
          available: 15000.00
        },
        institution: {
          name: 'Itaú',
          type: 'bank'
        }
      }
    ];
  }

  // Gerar transações simuladas
  async getTransactions(accountId: string, from?: string, to?: string): Promise<Transaction[]> {
    await this.delay();
    
    const mockTransactions: Transaction[] = [
      {
        id: 'mock-tx-1',
        accountId,
        amount: -150.00,
        currency: 'BRL',
        description: 'Supermercado Extra',
        date: '2024-01-15',
        category: 'supermarket',
        type: 'debit'
      },
      {
        id: 'mock-tx-2',
        accountId,
        amount: -45.50,
        currency: 'BRL',
        description: 'Posto de Gasolina',
        date: '2024-01-14',
        category: 'gas_station',
        type: 'debit'
      },
      {
        id: 'mock-tx-3',
        accountId,
        amount: 5000.00,
        currency: 'BRL',
        description: 'Salário',
        date: '2024-01-10',
        category: 'income',
        type: 'credit'
      },
      {
        id: 'mock-tx-4',
        accountId,
        amount: -89.90,
        currency: 'BRL',
        description: 'Restaurante',
        date: '2024-01-12',
        category: 'restaurant',
        type: 'debit'
      },
      {
        id: 'mock-tx-5',
        accountId,
        amount: -1200.00,
        currency: 'BRL',
        description: 'Aluguel',
        date: '2024-01-05',
        category: 'housing',
        type: 'debit'
      }
    ];

    // Filtrar por data se especificado
    if (from || to) {
      return mockTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        const fromDate = from ? new Date(from) : null;
        const toDate = to ? new Date(to) : null;
        
        if (fromDate && txDate < fromDate) return false;
        if (toDate && txDate > toDate) return false;
        
        return true;
      });
    }

    return mockTransactions;
  }

  // Calcular milhas baseado em transações
  calculateMilesFromTransactions(transactions: Transaction[]): {
    totalSpent: number;
    totalMiles: number;
    estimatedValue: number;
    categories: { [key: string]: { spent: number; miles: number } };
  } {
    const result = {
      totalSpent: 0,
      totalMiles: 0,
      estimatedValue: 0,
      categories: {} as { [key: string]: { spent: number; miles: number } }
    };

    // Multiplicadores por categoria
    const multipliers = {
      'supermarket': 2.5,
      'gas_station': 1.0,
      'restaurant': 2.0,
      'travel': 3.0,
      'pharmacy': 1.5,
      'default': 1.0
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'debit') {
        const amount = Math.abs(transaction.amount);
        const category = transaction.category?.toLowerCase() || 'default';
        const multiplier = multipliers[category as keyof typeof multipliers] || multipliers.default;
        const miles = amount * multiplier;

        result.totalSpent += amount;
        result.totalMiles += miles;

        if (!result.categories[category]) {
          result.categories[category] = { spent: 0, miles: 0 };
        }
        result.categories[category].spent += amount;
        result.categories[category].miles += miles;
      }
    });

    // Valor estimado das milhas (R$ 0,025 por milha)
    result.estimatedValue = result.totalMiles * 0.025;

    return result;
  }

  // Verificar se o modo mock está ativo
  isMockEnabled(): boolean {
    return this.config.enableMock;
  }
}

export default MockFinanceService; 