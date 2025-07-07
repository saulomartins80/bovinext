import api from './api';
import { MileageCard, MileageTransaction, MileageProgram, MileageGoal } from '../types/Mileage';

// API para Cartões de Milhas
export const mileageCardAPI = {
  getAll: async (): Promise<MileageCard[]> => {
    const response = await api.get('/api/mileage/cards');
    return response.data;
  },

  create: async (data: Omit<MileageCard, '_id' | 'createdAt' | 'updatedAt'>): Promise<MileageCard> => {
    const response = await api.post('/api/mileage/cards', data);
    return response.data;
  },

  update: async (id: string, data: Partial<MileageCard>): Promise<MileageCard> => {
    const response = await api.put(`/api/mileage/cards/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/mileage/cards/${id}`);
  }
};

// API para Transações de Milhas
export const mileageTransactionAPI = {
  getAll: async (): Promise<MileageTransaction[]> => {
    const response = await api.get('/api/mileage/transactions');
    return response.data;
  },

  create: async (data: Omit<MileageTransaction, '_id' | 'createdAt' | 'updatedAt'>): Promise<MileageTransaction> => {
    const response = await api.post('/api/mileage/transactions', data);
    return response.data;
  },

  update: async (id: string, data: Partial<MileageTransaction>): Promise<MileageTransaction> => {
    const response = await api.put(`/api/mileage/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/mileage/transactions/${id}`);
  },

  getByProgram: async (program: string): Promise<MileageTransaction[]> => {
    const response = await api.get(`/api/mileage/transactions/program/${program}`);
    return response.data;
  }
};

// API para Programas de Milhas
export const mileageProgramAPI = {
  getAll: async (): Promise<MileageProgram[]> => {
    const response = await api.get('/api/mileage/programs');
    return response.data;
  },

  create: async (data: Omit<MileageProgram, '_id' | 'createdAt' | 'updatedAt'>): Promise<MileageProgram> => {
    const response = await api.post('/api/mileage/programs', data);
    return response.data;
  },

  update: async (id: string, data: Partial<MileageProgram>): Promise<MileageProgram> => {
    const response = await api.put(`/api/mileage/programs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/mileage/programs/${id}`);
  }
};

// API para Metas de Milhas
export const mileageGoalAPI = {
  getAll: async (): Promise<MileageGoal[]> => {
    const response = await api.get('/api/mileage/goals');
    return response.data;
  },

  create: async (data: Omit<MileageGoal, '_id' | 'createdAt' | 'updatedAt'>): Promise<MileageGoal> => {
    const response = await api.post('/api/mileage/goals', data);
    return response.data;
  },

  update: async (id: string, data: Partial<MileageGoal>): Promise<MileageGoal> => {
    const response = await api.put(`/api/mileage/goals/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/mileage/goals/${id}`);
  }
};

// API para Análises e Cálculos
export const mileageAnalyticsAPI = {
  getAnalytics: async () => {
    const response = await api.get('/api/mileage/analytics');
    return response.data;
  },

  calculatePoints: async (value: number, category: string, program: string) => {
    const response = await api.post('/api/mileage/calculate-points', {
      value,
      category,
      program
    });
    return response.data;
  },

  getRecommendations: async () => {
    const response = await api.get('/api/mileage/recommendations');
    return response.data;
  },

  simulateCard: async (monthlySpending: number, categories: string[]) => {
    const response = await api.post('/api/mileage/simulate-card', {
      monthlySpending,
      categories
    });
    return response.data;
  }
}; 