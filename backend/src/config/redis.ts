import Redis from 'ioredis';

let redis: Redis | null = null;

export const initRedis = () => {
  // Verificar se está em produção e se o Redis está configurado
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      console.log('⚠️ Redis não configurado em produção, usando armazenamento local');
      return null;
    }
  }

  try {
    const config: any = {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
    };

    if (process.env.REDIS_URL) {
      redis = new Redis(process.env.REDIS_URL, config);
    } else if (process.env.REDIS_HOST) {
      redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        ...config
      });
    } else {
      // Fallback para localhost
      redis = new Redis({
        host: 'localhost',
        port: 6379,
        ...config
      });
    }

    redis.on('connect', () => {
      console.log('✅ Conectado ao Redis');
    });

    redis.on('error', (error) => {
      console.log('⚠️ Erro na conexão Redis:', error.message);
      redis = null;
    });

    return redis;
  } catch (error) {
    console.log('⚠️ Erro ao inicializar Redis:', error.message);
    return null;
  }
};

export const getRedis = () => redis;

export const isRedisAvailable = () => redis !== null && redis.status === 'ready'; 