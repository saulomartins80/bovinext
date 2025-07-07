export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  category: string;
  type: 'credit' | 'debit';
}

export interface Account {
  id: string;
  name: string;
  type: string;
  subtype: string;
  currency: string;
  balance: {
    current: number;
    available: number;
  };
  institution: {
    name: string;
    type: string;
  };
}

export interface Institution {
  id: string;
  name: string;
  type: string;
  logo?: string;
} 