import axios from 'axios';
import { getAuth, getIdToken } from 'firebase/auth';
import {
  Transacao,
  NovaTransacaoPayload,
  AtualizarTransacaoPayload,
  Investimento,
  Meta
} from "../types";
import { MarketData } from '../types/market';

// Chat types
interface ChatMessage {
  message: string;
  chatId: string;
  context?: Record<string, unknown>;
  history?: Array<{ role: string; content: string; }>;
}

interface AutomatedAction {
  action: string;
  payload: Record<string, unknown>;
  chatId?: string;
}

// Market data types
interface MarketDataResponse {
  symbols: Record<string, { price: number; change: number; }>;
  cryptos: Record<string, { price: number; change: number; }>;
  commodities: Record<string, { price: number; change: number; }>;
}

// Dashboard types
interface DashboardDataPayload {
  symbols: string[];
  timeframe?: string;
  indicators?: string[];
}

// Error response type
interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
    statusText?: string;
  };
  message?: string;
}

// Card and Mileage types
interface CreditCard {
  id?: string;
  name: string;
  bank: string;
  program: string;
  number: string; // Últimos 4 dígitos
  limit: number;
  used: number;
  dueDate: number; // Dia do vencimento
  closingDate: number; // Dia do fechamento
  pointsPerReal: number;
  annualFee: number;
  benefits: string[];
  status: 'active' | 'inactive' | 'blocked';
  color: string;
  bankLogo?: string;
  category: 'premium' | 'standard' | 'basic';
  cashback?: number;
  // Campos para compatibilidade com o frontend
  nextInvoiceAmount?: number;
  nextInvoiceDue?: string;
}

interface MileageCard {
  id?: string;
  name: string;
  program: string;
  number: string;
  expiryDate: string;
  mileageBalance: number;
}

interface MileageProgram {
  id: string;
  name: string;
  balance: number;
  lastUpdate: string;
}

interface MileageTransaction {
  id?: string;
  programId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

interface MileageCalculatorParams {
  spendAmount: number;
  cardType: string;
  program: string;
  bonusMultiplier?: number;
}

export interface MarketDataRequest {
  symbols: string[];
  cryptos: string[];
  commodities: string[];
  fiis: string[];
  etfs: string[];
  currencies: string[];
  manualAssets: { symbol: string; price: number; change: number; }[];
  customIndicesList: string[];
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 120000, // Aumentando para 2 minutos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para autenticação com logs detalhados
api.interceptors.request.use(async (config) => {
  console.log(`[api.ts] 🚀 Iniciando requisição para: ${config.method?.toUpperCase()} ${config.url}`);
  
  const auth = getAuth();
  const user = auth.currentUser;

  console.log(`[api.ts] 👤 Estado do usuário:`, {
    userExists: !!user,
    uid: user?.uid,
    email: user?.email,
    emailVerified: user?.emailVerified
  });

  if (user) {
    console.log(`[api.ts] 🔑 Usuário encontrado (UID: ${user.uid}). Obtendo ID token para: ${config.url}`);
    try {
      const token = await getIdToken(user, true);
      console.log(`[api.ts] ✅ Token obtido com sucesso para: ${config.url}`);
      console.log(`[api.ts] 🔑 Token (primeiros 20 chars): ${token.substring(0, 20)}...`);
      console.log(`[api.ts] 📏 Tamanho do token: ${token.length}`);
      
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[api.ts] ✅ Header Authorization configurado para: ${config.url}`);
    } catch (error) {
      console.error(`[api.ts] ❌ Erro ao obter ID token para: ${config.url}`, error);
      throw new Error(`Failed to get authentication token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    console.warn(`[api.ts] ⚠️ Nenhum usuário autenticado encontrado. Requisição para ${config.url} será não autenticada.`);
    console.warn(`[api.ts] 📋 Headers da requisição:`, config.headers);
  }

  return config;
}, (error) => {
  console.error('[api.ts] ❌ Erro no interceptor de requisição:', error);
  return Promise.reject(error);
});

// Interceptor para tratamento de erros com logs detalhados
api.interceptors.response.use(
  (response) => {
    console.log(`[api.ts] ✅ Resposta bem-sucedida de ${response.config.url}`, {
      status: response.status,
      method: response.config.method,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error(`[api.ts] ❌ Erro de resposta de ${error.config?.url || 'endpoint desconhecido'}:`, {
      code: error.code,
      status: error.response?.status,
      message: error.message,
      method: error.config?.method,
      responseData: error.response?.data,
      headers: error.config?.headers
    });

    if (error.code === 'ECONNABORTED') {
      console.error('[api.ts] ⏰ Timeout da requisição');
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }
    
    if (error.response?.status === 401) {
      console.warn('[api.ts] 🔒 401 Unauthorized - Redirecionando para login');
      console.warn('[api.ts] 📋 Detalhes do erro 401:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        responseData: error.response?.data
      });
      const currentPath = window.location.pathname;
      const redirectPath = currentPath === '/' ? '' : currentPath;
      window.location.href = `/auth/login?redirect=${encodeURIComponent(redirectPath)}`;
    }
    
    if (error.response?.status === 404) {
      console.error('[api.ts] 🔍 404 Not Found - Recurso não disponível');
      return Promise.reject(new Error('The requested resource was not found.'));
    }
    
    if (error.response?.status >= 500) {
      console.error('[api.ts] 💥 Erro do servidor');
      return Promise.reject(new Error('Server error. Please try again later.'));
    }

    const errorMessage = error.response?.data?.message || 
                       error.message || 
                       'An unexpected error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// --- MARKET DATA API ---
export const marketDataAPI = {
  getMarketData: async (requestBody: MarketDataRequest): Promise<MarketData> => {
    try {
      console.log('[marketDataAPI] Buscando dados do mercado:', requestBody);
      const response = await api.post('/api/market-data', requestBody, {
        timeout: 30000 // Aumentando timeout para 30 segundos
      });
      console.log('[marketDataAPI] Dados do mercado obtidos com sucesso:', response.data);
      
      // Garantir que lastUpdated seja sempre uma string
      const marketData: MarketData = {
        ...response.data,
        lastUpdated: typeof response.data.lastUpdated === 'string' 
          ? response.data.lastUpdated 
          : new Date().toISOString()
      };
      
      return marketData;
    } catch (error) {
      console.error('[marketDataAPI] Erro ao buscar dados do mercado:', error);
      throw error;
    }
  }
};

// --- CHATBOT API ---
export const chatbotAPI = {
  healthCheck: async () => {
    try {
      const response = await api.get('/api/chatbot/health', { timeout: 10000 });
      return response.data;
    } catch (error) {
      console.error('[chatbotAPI] ❌ Erro no health check:', error);
      throw error;
    }
  },
  sendQuery: async (data: ChatMessage) => {
    try {
      console.log('[chatbotAPI] 📤 Enviando consulta:', data);
      
      // ✅ CORREÇÃO: Usar endpoint correto que salva nas sessões
      const response = await api.post('/api/chatbot/query', {
        message: data.message,
        chatId: data.chatId
      });

      console.log('[chatbotAPI] ✅ Resposta recebida com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[chatbotAPI] ❌ Erro ao enviar consulta:', error);
      console.error('[chatbotAPI] ❌ Detalhes do erro:', {
        message: (error as ErrorResponse)?.response?.data?.message,
        status: (error as ErrorResponse)?.response?.status,
        statusText: (error as ErrorResponse)?.response?.statusText
      });
      throw error;
    }
  },
  openStream: async ({ message, chatId }: { message: string; chatId: string }): Promise<EventSource> => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = user ? await getIdToken(user, true) : '';

      const base = (api.defaults.baseURL || '').replace(/\/$/, '');
      const url = `${base}/api/chatbot/stream?message=${encodeURIComponent(message)}&chatId=${encodeURIComponent(chatId)}&token=${encodeURIComponent(token)}`;

      console.log('[chatbotAPI] 🔌 Abrindo stream via EventSource:', { url: `${base}/api/chatbot/stream?...`, hasToken: !!token, withCredentials: false });
      return new EventSource(url, { withCredentials: false });
    } catch (error) {
      console.error('[chatbotAPI] ❌ Erro ao abrir stream:', error);
      throw error;
    }
  },
  executeAction: async (actionData: AutomatedAction) => {
    console.log('[chatbotAPI] Executando ação:', actionData);
    try {
      const response = await api.post('/api/automated-actions/execute', actionData);
      console.log('[chatbotAPI] Ação executada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[chatbotAPI] Erro ao executar ação:', error);
      throw error;
    }
  },
  getSessions: async () => {
    console.log('[chatbotAPI] Buscando sessões');
    try {
      const response = await api.get('/api/chatbot/sessions', {
        timeout: 90000 // 90 segundos para sessões
      });
      console.log('[chatbotAPI] Sessões obtidas com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[chatbotAPI] Erro ao buscar sessões:', error);
      throw error;
    }
  },
  startNewSession: async () => {
    console.log('[chatbotAPI] Iniciando nova sessão');
    try {
      const response = await api.post('/api/chatbot/sessions');
      console.log('[chatbotAPI] Nova sessão iniciada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[chatbotAPI] Erro ao iniciar nova sessão:', error);
      throw error;
    }
  },
  deleteSession: async (chatId: string) => {
    console.log('[chatbotAPI] Deletando sessão:', chatId);
    try {
      const response = await api.delete(`/api/chatbot/sessions/${encodeURIComponent(chatId)}`);
      console.log('[chatbotAPI] Sessão deletada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[chatbotAPI] Erro ao deletar sessão:', error);
      throw error;
    }
  },
  deleteAllSessions: async () => {
    console.log('[chatbotAPI] Deletando todas as sessões do usuário logado');
    try {
      const response = await api.delete('/api/chatbot/sessions');
      console.log('[chatbotAPI] Todas as sessões deletadas com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[chatbotAPI] Erro ao deletar todas as sessões:', error);
      throw error;
    }
  },
  getSession: async (chatId: string) => {
    console.log('[chatbotAPI] Buscando sessão:', chatId);
    try {
      const response = await api.get(`/api/chatbot/sessions/${chatId}`);
      console.log('[chatbotAPI] Sessão obtida com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[chatbotAPI] Erro ao buscar sessão:', error);
      throw error;
    }
  },
  saveUserFeedback: async (feedback: {
    messageId: string;
    rating: number;
    helpful: boolean;
    comment?: string;
    category: 'accuracy' | 'helpfulness' | 'clarity' | 'relevance';
    context?: string;
  }) => {
    console.log('[chatbotAPI] Enviando feedback:', feedback);
    try {
      const response = await api.post('/api/chatbot/feedback', feedback);
      console.log('[chatbotAPI] Feedback enviado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[chatbotAPI] Erro ao enviar feedback:', error);
      throw error;
    }
  }
};

// --- SUBSCRIPTION API ---
export const subscriptionAPI = {
  getPlans: async () => {
    const response = await api.get('/api/subscriptions/plans');
    return response.data;
  },
  createCheckoutSession: async (priceId: string, planName: string) => {
    try {
      console.log('[subscriptionAPI] Criando sessão de checkout:', { priceId, planName });
      const response = await api.post('/api/subscriptions/create-checkout-session', {
        priceId,
        planName
      });
      console.log('[subscriptionAPI] Sessão criada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[subscriptionAPI] Erro ao criar sessão de checkout:', error);
      throw error;
    }
  },
  verifySession: async (sessionId: string) => {
    try {
      const response = await api.post('/api/subscriptions/verify-session', { sessionId });
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      throw error;
    }
  },
  cancelSubscription: async (subscriptionId: string) => {
    try {
      const response = await api.post('/api/subscriptions/cancel', {
        subscriptionId,
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw error;
    }
  },
  getSubscriptionStatus: async () => {
    try {
      const response = await api.get('/api/subscriptions/status');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter status da assinatura:', error);
      throw error;
    }
  },
};

// API para Investimentos com logs
export const investimentoAPI = {
  getAll: async (): Promise<Investimento[]> => {
    console.log('[investimentoAPI] Fetching all investments');
    try {
      const response = await api.get("/api/investimentos");
      console.log('[investimentoAPI] Successfully fetched investments', {
        count: response.data?.length || 0
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('[investimentoAPI] Error fetching investments:', error);
      throw error;
    }
  },
  create: async (investimento: Omit<Investimento, '_id'>): Promise<Investimento> => {
    console.log('[investimentoAPI] Creating new investment:', investimento);
    try {
      const response = await api.post("/api/investimentos", investimento);
      console.log('[investimentoAPI] Investment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[investimentoAPI] Error creating investment:', error);
      throw error;
    }
  },
  update: async (id: string, investimento: Partial<Investimento>): Promise<Investimento> => {
    console.log(`[investimentoAPI] Updating investment ${id}:`, investimento);
    try {
      const response = await api.put(`/api/investimentos/${id}`, investimento);
      console.log(`[investimentoAPI] Investment ${id} updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[investimentoAPI] Error updating investment ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: string): Promise<void> => {
    console.log(`[investimentoAPI] Deleting investment ${id}`);
    try {
      await api.delete(`/api/investimentos/${id}`);
      console.log(`[investimentoAPI] Investment ${id} deleted successfully`);
    } catch (error) {
      console.error(`[investimentoAPI] Error deleting investment ${id}:`, error);
      throw error;
    }
  }
};

// API para Transações com logs
export const transacaoAPI = {
  getAll: async (): Promise<Transacao[]> => {
    console.log('[transacaoAPI] Fetching all transactions');
    try {
      const response = await api.get("/api/transacoes");
      console.log('[transacaoAPI] Successfully fetched transactions', {
        count: response.data?.length || 0
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('[transacaoAPI] Error fetching transactions:', error);
      throw error;
    }
  },
  create: async (transacao: NovaTransacaoPayload): Promise<Transacao> => {
    console.log('[transacaoAPI] Creating new transaction:', transacao);
    try {
      const response = await api.post("/api/transacoes", transacao);
      console.log('[transacaoAPI] Transaction created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[transacaoAPI] Error creating transaction:', error);
      throw error;
    }
  },
  update: async (id: string, transacao: AtualizarTransacaoPayload): Promise<Transacao> => {
    console.log(`[transacaoAPI] Updating transaction ${id}:`, transacao);
    try {
      const response = await api.put(`/api/transacoes/${id}`, transacao);
      console.log(`[transacaoAPI] Transaction ${id} updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[transacaoAPI] Error updating transaction ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: string): Promise<void> => {
    console.log(`[transacaoAPI] Deleting transaction ${id}`);
    try {
      await api.delete(`/api/transacoes/${id}`);
      console.log(`[transacaoAPI] Transaction ${id} deleted successfully`);
    } catch (error) {
      console.error(`[transacaoAPI] Error deleting transaction ${id}:`, error);
      throw error;
    }
  },
};

// API para Metas com logs
export const metaAPI = {
  getAll: async (): Promise<Meta[]> => {
    console.log('[metaAPI] Fetching all goals');
    try {
      const response = await api.get("/api/goals");
      console.log('[metaAPI] Successfully fetched goals', {
        count: response.data?.length || 0
      });
      
      const metas = response.data?.metas || response.data || [];
      const normalizedMetas = metas.map((meta: Partial<Meta>) => ({
        _id: meta._id,
        meta: meta.meta || '',
        valor_total: meta.valor_total || 0,
        valor_atual: meta.valor_atual || 0,
        data_conclusao: meta.data_conclusao || '',
        concluida: ((meta.valor_atual || 0) >= (meta.valor_total || 0)) || meta.concluida || false,
        categoria: meta.categoria,
        prioridade: meta.prioridade,
        createdAt: meta.createdAt,
        descricao: meta.descricao
        
      }));
      
      console.log('[metaAPI] Normalized goals:', normalizedMetas);
      return normalizedMetas;
    } catch (error) {
      console.error('[metaAPI] Error fetching goals:', error);
      throw error;
    }
  },
  create: async (meta: Omit<Meta, '_id' | 'concluida' | 'createdAt'>): Promise<Meta> => {
    console.log('[metaAPI] Creating new goal:', meta);
    try {
      const response = await api.post("/api/goals", meta);
      console.log('[metaAPI] Goal created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[metaAPI] Error creating goal:', error);
      throw error;
    }
  },
  update: async (id: string, meta: Partial<Omit<Meta, '_id' | 'concluida' | 'createdAt'>>): Promise<Meta> => {
    console.log(`[metaAPI] Updating goal ${id}:`, meta);
    try {
      const response = await api.put(`/api/goals/${id}`, meta);
      console.log(`[metaAPI] Goal ${id} updated successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[metaAPI] Error updating goal ${id}:`, error);
      throw error;
    }
  },
  delete: async (id: string): Promise<void> => {
    console.log(`[metaAPI] Deleting goal ${id}`);
    try {
      await api.delete(`/api/goals/${id}`);
      console.log(`[metaAPI] Goal ${id} deleted successfully`);
    } catch (error) {
      console.error(`[metaAPI] Error deleting goal ${id}:`, error);
      throw error;
    }
  }
};

// API para Dashboard com logs
export const dashboardAPI = {
  getMarketData: async (payload: DashboardDataPayload): Promise<MarketDataResponse> => {
    console.log('[dashboardAPI] Buscando dados do mercado:', payload);
    try {
      const response = await api.post('/api/market-data', payload);
      console.log('[dashboardAPI] Dados do mercado obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[dashboardAPI] Erro ao buscar dados do mercado:', error);
      throw error;
    }
  }
};

// API para Sistema de Cartões, Milhas e Faturas
export const cardAPI = {
  // CARTÕES
  getCards: async () => {
    console.log('[cardAPI] Buscando cartões');
    try {
      const response = await api.get('/api/cards/cards');
      console.log('[cardAPI] Cartões obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao buscar cartões:', error);
      throw error;
    }
  },

  createCard: async (cardData: Omit<CreditCard, 'id'>) => {
    console.log('[cardAPI] Criando cartão:', cardData);
    try {
      const response = await api.post('/api/cards/cards', cardData);
      console.log('[cardAPI] Cartão criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao criar cartão:', error);
      throw error;
    }
  },

  updateCard: async (cardId: string, cardData: Partial<CreditCard>) => {
    console.log('[cardAPI] Atualizando cartão:', cardId, cardData);
    try {
      const response = await api.put(`/api/cards/cards/${cardId}`, cardData);
      console.log('[cardAPI] Cartão atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao atualizar cartão:', error);
      throw error;
    }
  },

  deleteCard: async (cardId: string) => {
    console.log('[cardAPI] Removendo cartão:', cardId);
    try {
      await api.delete(`/api/cards/cards/${cardId}`);
      console.log('[cardAPI] Cartão removido com sucesso');
    } catch (error) {
      console.error('[cardAPI] Erro ao remover cartão:', error);
      throw error;
    }
  },

  // FATURAS
  getInvoices: async (filters?: { cardId?: string; status?: string }) => {
    console.log('[cardAPI] Buscando faturas:', filters);
    try {
      const response = await api.get('/api/cards/invoices', { params: filters });
      console.log('[cardAPI] Faturas obtidas com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao buscar faturas:', error);
      throw error;
    }
  },

  createInvoice: async (invoiceData: {
    cardId: string;
    amount: number;
    dueDate: string;
    closingDate: string;
    description?: string;
    transactions?: Array<{
      date: string;
      description: string;
      amount: number;
      category?: string;
      points?: number;
    }>;
  }) => {
    console.log('[cardAPI] Criando fatura:', invoiceData);
    try {
      const response = await api.post('/api/cards/invoices', invoiceData);
      console.log('[cardAPI] Fatura criada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao criar fatura:', error);
      throw error;
    }
  },

  updateInvoice: async (invoiceId: string, invoiceData: {
    amount?: number;
    dueDate?: string;
    closingDate?: string;
    status?: 'paid' | 'pending' | 'overdue';
    description?: string;
    paymentMethod?: string;
  }) => {
    console.log('[cardAPI] Atualizando fatura:', invoiceId, invoiceData);
    try {
      const response = await api.put(`/api/cards/invoices/${invoiceId}`, invoiceData);
      console.log('[cardAPI] Fatura atualizada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao atualizar fatura:', error);
      throw error;
    }
  },

  payInvoice: async (invoiceId: string, paymentData: { paymentMethod: string; amount: number }) => {
    console.log('[cardAPI] Pagando fatura:', invoiceId, paymentData);
    try {
      const response = await api.post(`/api/cards/invoices/${invoiceId}/pay`, paymentData);
      console.log('[cardAPI] Fatura paga com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao pagar fatura:', error);
      throw error;
    }
  },

  // PROGRAMAS DE MILHAS
  getMileagePrograms: async () => {
    console.log('[cardAPI] Buscando programas de milhas');
    try {
      const response = await api.get('/api/cards/programs');
      console.log('[cardAPI] Programas obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao buscar programas:', error);
      throw error;
    }
  },

  createMileageProgram: async (programData: Omit<MileageProgram, 'id'>) => {
    console.log('[cardAPI] Criando programa de milhas:', programData);
    try {
      const response = await api.post('/api/cards/programs', programData);
      console.log('[cardAPI] Programa criado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao criar programa:', error);
      throw error;
    }
  },

  updateMileageProgram: async (programId: string, programData: Partial<MileageProgram>) => {
    console.log('[cardAPI] Atualizando programa:', programId, programData);
    try {
      const response = await api.put(`/api/cards/programs/${programId}`, programData);
      console.log('[cardAPI] Programa atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao atualizar programa:', error);
      throw error;
    }
  },

  deleteMileageProgram: async (programId: string) => {
    console.log('[cardAPI] Removendo programa:', programId);
    try {
      await api.delete(`/api/cards/programs/${programId}`);
      console.log('[cardAPI] Programa removido com sucesso');
    } catch (error) {
      console.error('[cardAPI] Erro ao remover programa:', error);
      throw error;
    }
  },

  // ANALYTICS
  getAnalytics: async () => {
    console.log('[cardAPI] Buscando analytics');
    try {
      const response = await api.get('/api/cards/analytics');
      console.log('[cardAPI] Analytics obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[cardAPI] Erro ao buscar analytics:', error);
      throw error;
    }
  }
};

// API para Sistema de Milhas (mantida para compatibilidade)
export const mileageAPI = {
  // Pluggy Integration
  getConnectToken: async () => {
    console.log('[mileageAPI] Obtendo token de conexão Pluggy');
    try {
      const response = await api.get('/api/pluggy/connect-token');
      console.log('[mileageAPI] Token de conexão obtido com sucesso');
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao obter token de conexão:', error);
      throw error;
    }
  },

  getMileageSummary: async () => {
    console.log('[mileageAPI] Obtendo resumo de milhas');
    try {
      const response = await api.get('/api/pluggy/mileage-summary');
      console.log('[mileageAPI] Resumo de milhas obtido com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao obter resumo de milhas:', error);
      throw error;
    }
  },

  // Mileage Programs
  getMileagePrograms: async () => {
    console.log('[mileageAPI] Buscando programas de milhas');
    try {
      const response = await api.get('/api/mileage/programs');
      console.log('[mileageAPI] Programas de milhas obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao buscar programas de milhas:', error);
      throw error;
    }
  },

  updateMileageProgram: async (programId: string, data: Partial<MileageProgram>) => {
    console.log('[mileageAPI] Atualizando programa de milhas:', programId, data);
    try {
      const response = await api.put(`/api/mileage/programs/${programId}`, data);
      console.log('[mileageAPI] Programa de milhas atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao atualizar programa de milhas:', error);
      throw error;
    }
  },

  // Mileage Cards
  getMileageCards: async () => {
    console.log('[mileageAPI] Buscando cartões de milhas');
    try {
      const response = await api.get('/api/mileage/cards');
      console.log('[mileageAPI] Cartões de milhas obtidos com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao buscar cartões de milhas:', error);
      throw error;
    }
  },

  addMileageCard: async (cardData: Omit<MileageCard, 'id'>) => {
    console.log('[mileageAPI] Adicionando cartão de milhas:', cardData);
    try {
      const response = await api.post('/api/mileage/cards', cardData);
      console.log('[mileageAPI] Cartão de milhas adicionado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao adicionar cartão de milhas:', error);
      throw error;
    }
  },

  updateMileageCard: async (cardId: string, cardData: Partial<MileageCard>) => {
    console.log('[mileageAPI] Atualizando cartão de milhas:', cardId, cardData);
    try {
      const response = await api.put(`/api/mileage/cards/${cardId}`, cardData);
      console.log('[mileageAPI] Cartão de milhas atualizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao atualizar cartão de milhas:', error);
      throw error;
    }
  },

  deleteMileageCard: async (cardId: string) => {
    console.log('[mileageAPI] Removendo cartão de milhas:', cardId);
    try {
      await api.delete(`/api/mileage/cards/${cardId}`);
      console.log('[mileageAPI] Cartão de milhas removido com sucesso');
    } catch (error) {
      console.error('[mileageAPI] Erro ao remover cartão de milhas:', error);
      throw error;
    }
  },

  // Mileage Transactions
  getMileageTransactions: async (filters?: { programId?: string; startDate?: string; endDate?: string; type?: 'credit' | 'debit' }) => {
    console.log('[mileageAPI] Buscando transações de milhas:', filters);
    try {
      const response = await api.get('/api/mileage/transactions', { params: filters });
      console.log('[mileageAPI] Transações de milhas obtidas com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao buscar transações de milhas:', error);
      throw error;
    }
  },

  addMileageTransaction: async (transactionData: Omit<MileageTransaction, 'id'>) => {
    console.log('[mileageAPI] Adicionando transação de milhas:', transactionData);
    try {
      const response = await api.post('/api/mileage/transactions', transactionData);
      console.log('[mileageAPI] Transação de milhas adicionada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao adicionar transação de milhas:', error);
      throw error;
    }
  },

  // Mileage Analytics
  getMileageAnalytics: async (period: string = 'month') => {
    console.log('[mileageAPI] Buscando análises de milhas:', period);
    try {
      const response = await api.get(`/api/mileage/analytics?period=${period}`, {
        timeout: 90000 // 90 segundos para análises
      });
      console.log('[mileageAPI] Análises de milhas obtidas com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao buscar análises de milhas:', error);
      throw error;
    }
  },

  // Mileage Recommendations
  getCardRecommendations: async (monthlySpending: number, preferredPrograms?: string[]) => {
    console.log('[mileageAPI] Buscando recomendações de cartões:', { monthlySpending, preferredPrograms });
    try {
      const response = await api.post('/api/mileage/recommendations', {
        monthlySpending,
        preferredPrograms
      });
      console.log('[mileageAPI] Recomendações obtidas com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao buscar recomendações:', error);
      throw error;
    }
  },

  // Mileage Calculator
  calculateMiles: async (params: MileageCalculatorParams) => {
    console.log('[mileageAPI] Calculando milhas:', params);
    try {
      const response = await api.post('/api/mileage/calculate', params);
      console.log('[mileageAPI] Cálculo de milhas realizado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao calcular milhas:', error);
      throw error;
    }
  },

  // Pluggy Connections
  getPluggyConnections: async () => {
    console.log('[mileageAPI] Buscando conexões Pluggy');
    try {
      const response = await api.get('/api/pluggy/connections', {
        timeout: 90000 // 90 segundos para conexões Pluggy
      });
      console.log('[mileageAPI] Conexões Pluggy obtidas com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[mileageAPI] Erro ao buscar conexões Pluggy:', error);
      throw error;
    }
  },

  disconnectPluggyConnection: async (connectionId: string) => {
    console.log('[mileageAPI] Desconectando conexão Pluggy:', connectionId);
    try {
      await api.delete(`/api/pluggy/connections/${connectionId}`);
      console.log('[mileageAPI] Conexão Pluggy desconectada com sucesso');
    } catch (error) {
      console.error('[mileageAPI] Erro ao desconectar Pluggy:', error);
      throw error;
    }
  }
};

export default api;