import axios from 'axios';
// import { createClient } from '@supabase/supabase-js'; // Removido temporariamente
import { supabase } from '../lib/supabaseClient';
import {
  Transacao,
  NovaTransacaoPayload,
  AtualizarTransacaoPayload,
  Investimento,
  Meta
} from "../types";
import { MarketData } from '../types/market';

// Supabase client for BOVINEXT
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// const supabase = createClient(supabaseUrl, supabaseAnonKey); // Removido temporariamente

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
  message?: string; // 🔧 CORREÇÃO: Adicionar campo message
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

// Interceptor para autenticação BOVINEXT com Supabase
api.interceptors.request.use(async (config) => {
  console.log(`[api.ts] 🚀 Iniciando requisição BOVINEXT: ${config.method?.toUpperCase()} ${config.url}`);
  
  // Detectar mobile
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Obter sessão do Supabase
  let session = null as Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'] | null;
  try {
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch (e) {
    console.warn('[api.ts] Não foi possível obter sessão do Supabase:', e);
  }

  console.log(`[api.ts] 👤 Estado do usuário Supabase:`, {
    sessionExists: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    emailVerified: session?.user?.email_confirmed_at,
    isMobile,
    // error: error?.message // removed: no local error here
  });

  if (session?.user) {
    console.log(`[api.ts] 🔑 Usuário Supabase encontrado (ID: ${session.user.id}). Obtendo token para: ${config.url}`);
    try {
      // Obter token de acesso do Supabase
      const accessToken = session.access_token;
      
      console.log(`[api.ts] ✅ Token Supabase obtido com sucesso para: ${config.url} (mobile: ${isMobile})`);
      console.log(`[api.ts] 🔑 Token (primeiros 20 chars): ${accessToken.substring(0, 20)}...`);
      console.log(`[api.ts] 📏 Tamanho do token: ${accessToken.length}`);
      
      config.headers.Authorization = `Bearer ${accessToken}`;
      
      // Headers específicos para mobile
      if (isMobile) {
        config.headers['X-Mobile-Request'] = 'true';
        config.headers['X-User-Agent'] = navigator.userAgent;
      }
      
      console.log(`[api.ts] ✅ Header Authorization configurado para: ${config.url}`);
    } catch (error) {
      console.error(`[api.ts] ❌ Erro ao obter token Supabase para: ${config.url} (mobile: ${isMobile})`, error);
      
      // Tratamento específico para mobile
      if (isMobile && error instanceof Error) {
        if (error.message.includes('network-request-failed')) {
          console.error(`[api.ts] 📱 Erro de rede específico do mobile detectado`);
          throw new Error(`Mobile network error: ${error.message}`);
        }
      }
      
      throw new Error(`Failed to get authentication token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } else {
    console.warn(`[api.ts] ⚠️ Nenhum usuário autenticado encontrado. Requisição para ${config.url} será não autenticada (mobile: ${isMobile}).`);
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
      // Mock auth for BOVINEXT development
      const auth = null;
      const user = auth.currentUser;
      
      // Detectar mobile
      const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Configurações de token específicas para mobile
      // Mock token for BOVINEXT development
      const token = '';

      const base = (api.defaults.baseURL || '').replace(/\/$/, '');
      const url = `${base}/api/chatbot/stream?message=${encodeURIComponent(message)}&chatId=${encodeURIComponent(chatId)}&token=${encodeURIComponent(token)}&mobile=${isMobile}`;

      console.log('[chatbotAPI] 🔌 Abrindo stream via EventSource:', { 
        url: `${base}/api/chatbot/stream?...`, 
        hasToken: !!token, 
        withCredentials: false,
        isMobile 
      });
      
      // Configurações específicas para EventSource em mobile
      const eventSourceConfig = {
        withCredentials: false,
        ...(isMobile && {
          // Configurações específicas para mobile se necessário
        })
      };
      
      return new EventSource(url, eventSourceConfig);
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
  confirmAction: async (actionData: Record<string, unknown>, action: 'confirm' | 'cancel') => {
    console.log('[chatbotAPI] Confirmando ação:', { actionData, action });
    try {
      const response = await api.post('/api/chatbot/confirm-action', {
        actionData,
        action
      });
      console.log('[chatbotAPI] Ação confirmada com sucesso:', response.data);
      return response.data;
    } catch (error) {
      console.error('[chatbotAPI] Erro ao confirmar ação:', error);
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
// removed

// API para Investimentos com logs
// removed

// API para Transações com logs
// removed

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
// removed

// API para Sistema de Milhas (mantida para compatibilidade)
// removed

export default api;