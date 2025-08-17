import axios, { AxiosInstance, AxiosResponse } from 'axios';
import NodeCache from 'node-cache';

// Interfaces para tipos de dados
interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  lastUpdate: Date;
}

interface CurrencyRate {
  from: string;
  to: string;
  rate: number;
  lastUpdate: Date;
}

interface BankData {
  bankCode: string;
  bankName: string;
  products: {
    savings: { rate: number };
    cdb: { rate: number; minAmount: number };
    creditCard: { annualFee: number; benefits: string[] };
  };
}

interface MileageProgram {
  airline: string;
  program: string;
  conversionRate: number; // pontos por real
  transferPartners: string[];
  bestRedemptions: { destination: string; points: number; value: number }[];
}

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  lastUpdate: Date;
}

// Cache inteligente com TTLs diferentes por tipo de dados
class SmartCache {
  private cache: NodeCache;
  
  constructor() {
    this.cache = new NodeCache({ 
      stdTTL: 300, // 5 minutos padrão
      checkperiod: 60 
    });
  }

  set(key: string, value: any, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || 300);
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  del(key: string): number {
    return this.cache.del(key);
  }

  flush(): void {
    this.cache.flushAll();
  }
}

export class ExternalAPIService {
  private cache: SmartCache;
  private httpClient: AxiosInstance;
  
  // TTLs em segundos para diferentes tipos de dados
  private readonly TTL = {
    STOCK_QUOTES: 60,        // 1 minuto
    CURRENCY_RATES: 300,     // 5 minutos
    CRYPTO_PRICES: 30,       // 30 segundos
    BANK_DATA: 3600,         // 1 hora
    MILEAGE_PROGRAMS: 86400, // 24 horas
    TREASURY_RATES: 1800     // 30 minutos
  };

  constructor() {
    this.cache = new SmartCache();
    this.httpClient = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'Finnextho-Bot/1.0',
        'Accept': 'application/json'
      }
    });
  }

  // ===== COTAÇÕES DE AÇÕES =====
  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    const cacheKey = `stock_${symbol.toUpperCase()}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get<StockQuote>(cacheKey) || null;
    }

    try {
      // Usando Alpha Vantage API (gratuita com limitações)
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) {
        console.warn('Alpha Vantage API key not configured');
        return this.getMockStockData(symbol);
      }

      const response = await this.httpClient.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
      );

      const data = response.data['Global Quote'];
      if (!data) {
        return this.getMockStockData(symbol);
      }

      const quote: StockQuote = {
        symbol: symbol.toUpperCase(),
        price: parseFloat(data['05. price']),
        change: parseFloat(data['09. change']),
        changePercent: parseFloat(data['10. change percent'].replace('%', '')),
        volume: parseInt(data['06. volume']),
        lastUpdate: new Date()
      };

      this.cache.set(cacheKey, quote, this.TTL.STOCK_QUOTES);
      return quote;
    } catch (error) {
      console.error(`Erro ao buscar cotação de ${symbol}:`, error);
      return this.getMockStockData(symbol);
    }
  }

  // ===== COTAÇÕES DE MOEDAS =====
  async getCurrencyRate(from: string, to: string): Promise<CurrencyRate | null> {
    const cacheKey = `currency_${from}_${to}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get<CurrencyRate>(cacheKey) || null;
    }

    try {
      // Usando ExchangeRate-API (gratuita)
      const response = await this.httpClient.get(
        `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`
      );

      const rate = response.data.rates[to.toUpperCase()];
      if (!rate) {
        return null;
      }

      const currencyRate: CurrencyRate = {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate: rate,
        lastUpdate: new Date()
      };

      this.cache.set(cacheKey, currencyRate, this.TTL.CURRENCY_RATES);
      return currencyRate;
    } catch (error) {
      console.error(`Erro ao buscar taxa ${from}/${to}:`, error);
      return this.getMockCurrencyData(from, to);
    }
  }

  // ===== PREÇOS DE CRIPTOMOEDAS =====
  async getCryptoPrice(symbol: string): Promise<CryptoPrice | null> {
    const cacheKey = `crypto_${symbol.toLowerCase()}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get<CryptoPrice>(cacheKey) || null;
    }

    try {
      // Usando CoinGecko API (gratuita)
      const response = await this.httpClient.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=brl&include_24hr_change=true&include_market_cap=true`
      );

      const data = response.data[symbol.toLowerCase()];
      if (!data) {
        return null;
      }

      const cryptoPrice: CryptoPrice = {
        symbol: symbol.toUpperCase(),
        price: data.brl,
        change24h: data.brl_24h_change || 0,
        marketCap: data.brl_market_cap || 0,
        lastUpdate: new Date()
      };

      this.cache.set(cacheKey, cryptoPrice, this.TTL.CRYPTO_PRICES);
      return cryptoPrice;
    } catch (error) {
      console.error(`Erro ao buscar preço de ${symbol}:`, error);
      return this.getMockCryptoData(symbol);
    }
  }

  // ===== DADOS BANCÁRIOS =====
  async getBankData(bankCode: string): Promise<BankData | null> {
    const cacheKey = `bank_${bankCode}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get<BankData>(cacheKey) || null;
    }

    // Por enquanto, retornamos dados mock
    // Em produção, integraria com APIs dos bancos ou serviços agregadores
    const bankData = this.getMockBankData(bankCode);
    
    if (bankData) {
      this.cache.set(cacheKey, bankData, this.TTL.BANK_DATA);
    }
    
    return bankData;
  }

  // ===== PROGRAMAS DE MILHAS =====
  async getMileagePrograms(): Promise<MileageProgram[]> {
    const cacheKey = 'mileage_programs';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get<MileageProgram[]>(cacheKey) || [];
    }

    // Dados atualizados dos principais programas brasileiros
    const programs: MileageProgram[] = [
      {
        airline: 'LATAM',
        program: 'LATAM Pass',
        conversionRate: 1.0,
        transferPartners: ['Banco do Brasil', 'Bradesco', 'Itaú', 'Santander'],
        bestRedemptions: [
          { destination: 'São Paulo - Rio de Janeiro', points: 15000, value: 300 },
          { destination: 'Brasil - Europa', points: 68000, value: 2500 },
          { destination: 'Brasil - EUA', points: 60000, value: 2200 }
        ]
      },
      {
        airline: 'GOL',
        program: 'Smiles',
        conversionRate: 1.0,
        transferPartners: ['Banco do Brasil', 'Bradesco', 'Santander'],
        bestRedemptions: [
          { destination: 'São Paulo - Rio de Janeiro', points: 10000, value: 300 },
          { destination: 'Brasil - Europa', points: 70000, value: 2500 },
          { destination: 'Brasil - EUA', points: 65000, value: 2200 }
        ]
      },
      {
        airline: 'Azul',
        program: 'TudoAzul',
        conversionRate: 1.0,
        transferPartners: ['Itaú', 'Bradesco', 'BTG'],
        bestRedemptions: [
          { destination: 'São Paulo - Rio de Janeiro', points: 9000, value: 300 },
          { destination: 'Brasil - Europa', points: 75000, value: 2500 },
          { destination: 'Brasil - EUA', points: 70000, value: 2200 }
        ]
      }
    ];

    this.cache.set(cacheKey, programs, this.TTL.MILEAGE_PROGRAMS);
    return programs;
  }

  // ===== TAXAS DO TESOURO DIRETO =====
  async getTreasuryRates(): Promise<any[]> {
    const cacheKey = 'treasury_rates';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get<any[]>(cacheKey) || [];
    }

    try {
      // API oficial do Tesouro Nacional
      const response = await this.httpClient.get(
        'https://www.tesourotransparente.gov.br/ckan/api/3/action/datastore_search?resource_id=796d2059-14e9-44e3-80c9-2d9e30b405c1&limit=10'
      );

      const rates = response.data.result?.records || [];
      this.cache.set(cacheKey, rates, this.TTL.TREASURY_RATES);
      return rates;
    } catch (error) {
      console.error('Erro ao buscar taxas do Tesouro:', error);
      return this.getMockTreasuryData();
    }
  }

  // ===== MÉTODOS DE DADOS MOCK =====
  private getMockStockData(symbol: string): StockQuote {
    const mockPrices: { [key: string]: number } = {
      'PETR4': 28.50,
      'VALE3': 65.80,
      'ITUB4': 25.30,
      'BBDC4': 13.20,
      'ABEV3': 11.90,
      'WEGE3': 45.60
    };

    return {
      symbol: symbol.toUpperCase(),
      price: mockPrices[symbol.toUpperCase()] || 50.00,
      change: (Math.random() - 0.5) * 5,
      changePercent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 1000000),
      lastUpdate: new Date()
    };
  }

  private getMockCurrencyData(from: string, to: string): CurrencyRate {
    const rates: { [key: string]: number } = {
      'USD_BRL': 5.20,
      'EUR_BRL': 5.65,
      'BRL_USD': 0.19,
      'BRL_EUR': 0.18
    };

    return {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate: rates[`${from.toUpperCase()}_${to.toUpperCase()}`] || 1.0,
      lastUpdate: new Date()
    };
  }

  private getMockCryptoData(symbol: string): CryptoPrice {
    const prices: { [key: string]: number } = {
      'BITCOIN': 280000,
      'ETHEREUM': 18000,
      'BNB': 1200,
      'CARDANO': 2.50
    };

    return {
      symbol: symbol.toUpperCase(),
      price: prices[symbol.toUpperCase()] || 1000,
      change24h: (Math.random() - 0.5) * 20,
      marketCap: Math.random() * 1000000000,
      lastUpdate: new Date()
    };
  }

  private getMockBankData(bankCode: string): BankData | null {
    const banks: { [key: string]: BankData } = {
      'nubank': {
        bankCode: 'nubank',
        bankName: 'Nubank',
        products: {
          savings: { rate: 100 }, // % do CDI
          cdb: { rate: 105, minAmount: 1000 },
          creditCard: { annualFee: 0, benefits: ['Sem anuidade', 'Programa de pontos', 'Cashback'] }
        }
      },
      'itau': {
        bankCode: 'itau',
        bankName: 'Itaú',
        products: {
          savings: { rate: 70 },
          cdb: { rate: 110, minAmount: 5000 },
          creditCard: { annualFee: 300, benefits: ['Programa de milhas', 'Seguro viagem', 'Concierge'] }
        }
      }
    };

    return banks[bankCode.toLowerCase()] || null;
  }

  private getMockTreasuryData(): any[] {
    return [
      {
        titulo: 'Tesouro Selic 2029',
        taxa: 12.50,
        vencimento: '2029-03-01',
        preco: 98.50
      },
      {
        titulo: 'Tesouro IPCA+ 2035',
        taxa: 5.85,
        vencimento: '2035-05-15',
        preco: 85.30
      }
    ];
  }

  // ===== MÉTODOS UTILITÁRIOS =====
  async getMultipleStockQuotes(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map(symbol => this.getStockQuote(symbol));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter((result): result is PromiseFulfilledResult<StockQuote | null> => 
        result.status === 'fulfilled' && result.value !== null)
      .map(result => result.value!);
  }

  async getPortfolioSummary(symbols: string[]): Promise<{ totalValue: number; totalChange: number; quotes: StockQuote[] }> {
    const quotes = await this.getMultipleStockQuotes(symbols);
    
    const totalValue = quotes.reduce((sum, quote) => sum + quote.price, 0);
    const totalChange = quotes.reduce((sum, quote) => sum + quote.change, 0);
    
    return {
      totalValue,
      totalChange,
      quotes
    };
  }

  // Limpar cache manualmente
  clearCache(pattern?: string): void {
    if (pattern) {
      // Implementar limpeza por padrão se necessário
      this.cache.flush();
    } else {
      this.cache.flush();
    }
  }

  // Status do serviço
  getServiceStatus(): { cache: any; uptime: number } {
    return {
      cache: {
        keys: this.cache['cache'].keys().length,
        stats: this.cache['cache'].getStats()
      },
      uptime: process.uptime()
    };
  }
}

export default ExternalAPIService;
