// types/index.ts
export * from './Transacao';
export * from './Meta';
export * from './Investimento';
export * from './Ebook';
export * from './ApiResponse';

// Exportação das implementações
export * from './transacoes';
export * from './investimentos';
export * from './metas';
export * from './Subscription';

// Defina apenas UMA interface Subscription
export interface Subscription {
  id: string;
  plan: 'free' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'expired' | 'pending';
  expiresAt: Date | string; // Accepts both Date and string
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  userId?: string;
}

export interface UserProfile {
  displayName?: string;
  email?: string;
  photoURL?: string;
  uid: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Interface para respostas paginadas
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  error?: string;
}

export interface CommandResponse {
  success: boolean;
  message: string;
  action?: string;
  data?: unknown;
  error?: string;
}

export interface MarketDataRequest {
  indices: string[];
  period?: string;
}