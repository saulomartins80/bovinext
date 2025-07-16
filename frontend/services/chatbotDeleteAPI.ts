import axios from 'axios';
import { getAuth, getIdToken } from 'firebase/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para autenticação
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    try {
      const token = await getIdToken(user, true);
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Erro ao obter token:', error);
    }
  }

  return config;
});

export const chatbotDeleteAPI = {
  deleteSession: async (chatId: string) => {
    try {
      console.log('[chatbotDeleteAPI] Deletando sessão:', chatId);
      const response = await api.delete(`/api/chatbot/sessions/${chatId}`);
      console.log('[chatbotDeleteAPI] Sessão deletada com sucesso');
      return response.data;
    } catch (error) {
      console.error('[chatbotDeleteAPI] Erro ao deletar sessão:', error);
      throw error;
    }
  },

  deleteAllSessions: async () => {
    try {
      console.log('[chatbotDeleteAPI] Deletando todas as sessões');
      const response = await api.delete('/api/chatbot/sessions');
      console.log('[chatbotDeleteAPI] Todas as sessões deletadas com sucesso');
      return response.data;
    } catch (error) {
      console.error('[chatbotDeleteAPI] Erro ao deletar todas as sessões:', error);
      throw error;
    }
  }
}; 