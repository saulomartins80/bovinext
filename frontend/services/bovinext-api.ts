// services/bovinext-api.ts - BOVINEXT API Service
import axios from 'axios';
import { Animal, Manejo, Producao, Venda } from '../types/bovinext.types';

// BOVINEXT API Configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(async (config) => {
  console.log(`[BOVINEXT API] 🚀 ${config.method?.toUpperCase()} ${config.url}`);
  
  // Mock authentication for development
  const token = 'mock-bovinext-token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[BOVINEXT API] ✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`[BOVINEXT API] ❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// BOVINEXT API Endpoints
export const bovinextAPI = {
  // Animais (Rebanho)
  animals: {
    getAll: async (): Promise<Animal[]> => {
      try {
        const response = await api.get('/animals');
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar animais:', error);
        // Mock data for development
        return [
          {
            id: '1',
            brinco: 'BV001',
            categoria: 'BOI',
            raca: 'NELORE',
            peso: 485,
            idade: 18,
            lote: 'LOTE-A',
            pasto: 'PASTO-01',
            dataEntrada: new Date('2022-03-15'),
            status: 'ATIVO',
            valorCompra: 2500,
            custoAcumulado: 850,
            observacoes: 'Animal em excelente estado'
          }
        ];
      }
    },
    
    create: async (animal: Omit<Animal, 'id'>): Promise<Animal> => {
      try {
        const response = await api.post('/animals', animal);
        return response.data;
      } catch (error) {
        console.error('Erro ao criar animal:', error);
        throw error;
      }
    },
    
    update: async (id: string, animal: Partial<Animal>): Promise<Animal> => {
      try {
        const response = await api.put(`/animals/${id}`, animal);
        return response.data;
      } catch (error) {
        console.error('Erro ao atualizar animal:', error);
        throw error;
      }
    },
    
    delete: async (id: string): Promise<void> => {
      try {
        await api.delete(`/animals/${id}`);
      } catch (error) {
        console.error('Erro ao deletar animal:', error);
        throw error;
      }
    }
  },

  // Manejo
  manejo: {
    getAll: async (): Promise<Manejo[]> => {
      try {
        const response = await api.get('/manejo');
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar manejos:', error);
        // Mock data for development
        return [
          {
            id: '1',
            tipo: 'VACINACAO',
            animais: ['BV001', 'BV002'],
            data: new Date('2024-12-15'),
            produto: 'Vacina Aftosa',
            dosagem: '5ml por animal',
            custo: 450.00,
            responsavel: 'Dr. João Silva',
            observacoes: 'Aplicação realizada conforme protocolo',
            proximaAplicacao: new Date('2025-09-08'),
            status: 'REALIZADO'
          }
        ];
      }
    },
    
    create: async (manejo: Omit<Manejo, 'id'>): Promise<Manejo> => {
      try {
        const response = await api.post('/manejo', manejo);
        return response.data;
      } catch (error) {
        console.error('Erro ao criar manejo:', error);
        throw error;
      }
    }
  },

  // Produção
  producao: {
    getAll: async (): Promise<Producao[]> => {
      try {
        const response = await api.get('/producao');
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar produções:', error);
        // Mock data for development
        return [
          {
            id: '1',
            tipo: 'ENGORDA',
            animal: 'BV001',
            data: new Date('2024-09-01'),
            peso: 485,
            ganhoMedio: 1.15,
            custoProducao: 850,
            receita: 2400,
            margemLucro: 65,
            observacoes: 'Excelente ganho de peso'
          }
        ];
      }
    },
    
    create: async (producao: Omit<Producao, 'id'>): Promise<Producao> => {
      try {
        const response = await api.post('/producao', producao);
        return response.data;
      } catch (error) {
        console.error('Erro ao criar produção:', error);
        throw error;
      }
    }
  },

  // Vendas
  vendas: {
    getAll: async (): Promise<Venda[]> => {
      try {
        const response = await api.get('/vendas');
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar vendas:', error);
        // Mock data for development
        return [
          {
            id: '1',
            animais: ['BV001', 'BV002', 'BV003'],
            comprador: 'Frigorífico Central',
            tipoVenda: 'FRIGORIFICO',
            pesoTotal: 1650,
            precoArroba: 315.80,
            valorTotal: 347370.00,
            dataVenda: new Date('2024-12-10'),
            dataEntrega: new Date('2024-12-15'),
            impostos: {
              funrural: 6947.40,
              icms: 41684.40,
              outros: 3473.70
            },
            lucroLiquido: 295264.50,
            observacoes: 'Animal pronto para abate',
            status: 'ENTREGUE'
          }
        ];
      }
    },
    
    create: async (venda: Omit<Venda, 'id'>): Promise<Venda> => {
      try {
        const response = await api.post('/vendas', venda);
        return response.data;
      } catch (error) {
        console.error('Erro ao criar venda:', error);
        throw error;
      }
    }
  },

  // Dashboard Analytics
  dashboard: {
    getKPIs: async () => {
      try {
        const response = await api.get('/dashboard/kpis');
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar KPIs:', error);
        // Mock data for development
        return {
          totalAnimais: 1247,
          receitaMensal: 1200000,
          gmdMedio: 1.12,
          precoArroba: 315.80,
          alertasAtivos: 3
        };
      }
    },
    
    getChartData: async (type: string, period: string) => {
      try {
        const response = await api.get(`/dashboard/charts/${type}?period=${period}`);
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
        return [];
      }
    }
  },

  // IA FINN Bovino
  ia: {
    chat: async (message: string, context?: Record<string, unknown>) => {
      try {
        const response = await api.post('/ia/chat', { message, context });
        return response.data;
      } catch (error) {
        console.error('Erro no chat com IA:', error);
        // Mock response for development
        return {
          response: 'Olá! Sou o FINN Bovino, sua IA especializada em pecuária. Como posso ajudar você hoje?',
          suggestions: [
            'Quantos animais tenho no rebanho?',
            'Qual o preço da arroba hoje?',
            'Como está a performance do meu rebanho?'
          ]
        };
      }
    },
    
    analyze: async (data: Record<string, unknown>) => {
      try {
        const response = await api.post('/ia/analyze', data);
        return response.data;
      } catch (error) {
        console.error('Erro na análise da IA:', error);
        throw error;
      }
    }
  },

  // Relatórios
  reports: {
    generate: async (type: string, filters: Record<string, unknown>) => {
      try {
        const response = await api.post('/reports/generate', { type, filters });
        return response.data;
      } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        throw error;
      }
    },
    
    export: async (reportId: string, format: 'pdf' | 'excel') => {
      try {
        const response = await api.get(`/reports/${reportId}/export?format=${format}`, {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        console.error('Erro ao exportar relatório:', error);
        throw error;
      }
    }
  }
};

export default bovinextAPI;
