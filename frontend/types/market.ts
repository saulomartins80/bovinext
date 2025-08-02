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
  marketCap?: number;
  name?: string;
}

export interface MarketData {
  stocks: StockItem[];
  cryptos: CryptoItem[];
  indices: MarketIndices;
  lastUpdated: string;
}

export interface CustomIndex {
  symbol: string;
  name: string;
}