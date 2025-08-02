// types/market.ts
export interface MarketIndices {
  [key: string]: number;
}

export interface StockItem {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  currency?: string;
  marketCap?: number;
  name?: string;
  exchange?: string;
}

export interface CryptoItem {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  currency?: string;
  marketCap?: number;
  name?: string;
  exchange?: string;
}

export interface MarketData {
  stocks: StockItem[];
  cryptos: CryptoItem[];
  commodities: StockItem[];
  fiis: StockItem[];
  etfs: StockItem[];
  currencies: StockItem[];
  indices: StockItem[];
  lastUpdated: string;
}

export interface CustomIndex {
  symbol: string;
  name: string;
}