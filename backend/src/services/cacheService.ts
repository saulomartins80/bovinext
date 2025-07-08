//cacheService.ts
import Redis from 'ioredis';
import { AppError } from '../core/errors/AppError';

class CacheService {
  private redis: Redis;
  private localCache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      showFriendlyErrorStack: true,
    });

    this.localCache = new Map();
    
    // Conectar ao Redis
    this.redis.on('connect', () => {
      console.log('✅ Conectado ao Redis');
    });

    this.redis.on('error', (error) => {
      console.error('❌ Erro na conexão com Redis:', error);
    });
  }

  // ✅ NOVO: Método healthCheck
  async healthCheck(): Promise<{ status: string; connected: boolean; latency?: number }> {
    try {
      const startTime = Date.now();
      await this.redis.ping();
      const latency = Date.now() - startTime;
      
      return {
        status: 'healthy',
        connected: true,
        latency
      };
    } catch (error) {
      console.error('[CacheService] Health check failed:', error);
      return {
        status: 'unhealthy',
        connected: false
      };
    }
  }

  // ✅ NOVO: Cache para análise de sentimento
  async cacheSentimentAnalysis(key: string, analysis: any, ttl: number = 1800): Promise<void> {
    try {
      const cacheKey = `sentiment:${key}`;
      await this.redis.setex(cacheKey, ttl, JSON.stringify(analysis));
      console.log(`[CacheService] Análise de sentimento salva para ${key}`);
    } catch (error) {
      console.error('[CacheService] Erro ao salvar análise de sentimento:', error);
    }
  }

  async getCachedSentimentAnalysis(key: string): Promise<any | null> {
    try {
      const cacheKey = `sentiment:${key}`;
      const data = await this.redis.get(cacheKey);
      if (data) {
        console.log(`[CacheService] Análise de sentimento recuperada para ${key}`);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('[CacheService] Erro ao recuperar análise de sentimento:', error);
      return null;
    }
  }

  // ✅ NOVO: Cache para sugestões
  async cacheSuggestions(key: string, suggestions: any[], ttl: number = 1800): Promise<void> {
    try {
      const cacheKey = `suggestions:${key}`;
      await this.redis.setex(cacheKey, ttl, JSON.stringify(suggestions));
      console.log(`[CacheService] Sugestões salvas para ${key}`);
    } catch (error) {
      console.error('[CacheService] Erro ao salvar sugestões:', error);
    }
  }

  async getCachedSuggestions(key: string): Promise<any[] | null> {
    try {
      const cacheKey = `suggestions:${key}`;
      const data = await this.redis.get(cacheKey);
      if (data) {
        console.log(`[CacheService] Sugestões recuperadas para ${key}`);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('[CacheService] Erro ao recuperar sugestões:', error);
      return null;
    }
  }

  // ✅ NOVO: Cache para contexto de conversa
  async setConversationContext(chatId: string, context: any, ttl: number = 3600): Promise<void> {
    try {
      const key = `conversation:${chatId}:context`;
      await this.redis.setex(key, ttl, JSON.stringify(context));
      console.log(`[CacheService] Contexto salvo para chat ${chatId}`);
    } catch (error) {
      console.error('[CacheService] Erro ao salvar contexto:', error);
    }
  }

  async getConversationContext(chatId: string): Promise<any | null> {
    try {
      const key = `conversation:${chatId}:context`;
      const data = await this.redis.get(key);
      if (data) {
        console.log(`[CacheService] Contexto recuperado para chat ${chatId}`);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('[CacheService] Erro ao recuperar contexto:', error);
      return null;
    }
  }

  // ✅ NOVO: Cache para dados do usuário
  async setUserData(userId: string, data: any, ttl: number = 1800): Promise<void> {
    try {
      const key = `user:${userId}:data`;
      await this.redis.setex(key, ttl, JSON.stringify(data));
      console.log(`[CacheService] Dados do usuário salvos para ${userId}`);
    } catch (error) {
      console.error('[CacheService] Erro ao salvar dados do usuário:', error);
    }
  }

  async getUserData(userId: string): Promise<any | null> {
    try {
      const key = `user:${userId}:data`;
      const data = await this.redis.get(key);
      if (data) {
        console.log(`[CacheService] Dados do usuário recuperados para ${userId}`);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('[CacheService] Erro ao recuperar dados do usuário:', error);
      return null;
    }
  }

  // ✅ NOVO: Cache para itens similares
  async setSimilarItems(userId: string, type: string, items: any[], ttl: number = 3600): Promise<void> {
    try {
      const key = `similar:${userId}:${type}`;
      await this.redis.setex(key, ttl, JSON.stringify(items));
      console.log(`[CacheService] Itens similares salvos para ${userId}:${type}`);
    } catch (error) {
      console.error('[CacheService] Erro ao salvar itens similares:', error);
    }
  }

  async getSimilarItems(userId: string, type: string): Promise<any[] | null> {
    try {
      const key = `similar:${userId}:${type}`;
      const data = await this.redis.get(key);
      if (data) {
        console.log(`[CacheService] Itens similares recuperados para ${userId}:${type}`);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('[CacheService] Erro ao recuperar itens similares:', error);
      return null;
    }
  }

  // ✅ MELHORIA: Cache para respostas de IA
  async setAIResponse(key: string, response: any, ttl: number = 1800): Promise<void> {
    try {
      const cacheKey = `ai:${key}`;
      await this.redis.setex(cacheKey, ttl, JSON.stringify(response));
      console.log(`[CacheService] Resposta de IA salva para ${key}`);
    } catch (error) {
      console.error('[CacheService] Erro ao salvar resposta de IA:', error);
    }
  }

  async getAIResponse(key: string): Promise<any | null> {
    try {
      const cacheKey = `ai:${key}`;
      const data = await this.redis.get(cacheKey);
      if (data) {
        console.log(`[CacheService] Resposta de IA recuperada para ${key}`);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('[CacheService] Erro ao recuperar resposta de IA:', error);
      return null;
    }
  }

  // ✅ MELHORIA: Cache para sessões de chat
  async setChatSession(sessionId: string, session: any, ttl: number = 7200): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.redis.setex(key, ttl, JSON.stringify(session));
      console.log(`[CacheService] Sessão salva para ${sessionId}`);
    } catch (error) {
      console.error('[CacheService] Erro ao salvar sessão:', error);
    }
  }

  async getChatSession(sessionId: string): Promise<any | null> {
    try {
      const key = `session:${sessionId}`;
      const data = await this.redis.get(key);
      if (data) {
        console.log(`[CacheService] Sessão recuperada para ${sessionId}`);
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('[CacheService] Erro ao recuperar sessão:', error);
      return null;
    }
  }

  // ✅ MELHORIA: Limpar cache específico
  async clearUserCache(userId: string): Promise<void> {
    try {
      const pattern = `*:${userId}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`[CacheService] Cache limpo para usuário ${userId}`);
      }
    } catch (error) {
      console.error('[CacheService] Erro ao limpar cache do usuário:', error);
    }
  }

  async clearConversationCache(chatId: string): Promise<void> {
    try {
      const pattern = `conversation:${chatId}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`[CacheService] Cache limpo para conversa ${chatId}`);
      }
    } catch (error) {
      console.error('[CacheService] Erro ao limpar cache da conversa:', error);
    }
  }

  // ✅ MELHORIA: Estatísticas do cache
  async getCacheStats(): Promise<any> {
    try {
      const info = await this.redis.info();
      const keys = await this.redis.dbsize();
      
      return {
        connected: this.redis.status === 'ready',
        totalKeys: keys,
        info: info
      };
    } catch (error) {
      console.error('[CacheService] Erro ao obter estatísticas:', error);
      return {
        connected: false,
        totalKeys: 0,
        error: error.message
      };
    }
  }

  // ✅ MELHORIA: Limpar todo o cache
  async clearAllCache(): Promise<void> {
    try {
      await this.redis.flushall();
      this.localCache.clear();
      console.log('[CacheService] Todo o cache foi limpo');
    } catch (error) {
      console.error('[CacheService] Erro ao limpar todo o cache:', error);
    }
  }

  // Métodos existentes mantidos para compatibilidade
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('[CacheService] Erro ao salvar no cache:', error);
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[CacheService] Erro ao recuperar do cache:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('[CacheService] Erro ao deletar do cache:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('[CacheService] Erro ao verificar existência:', error);
      return false;
    }
  }
}

export default new CacheService(); 