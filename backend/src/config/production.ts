// Configurações específicas para produção no Render
export const productionConfig = {
  // Desabilitar RPA em produção no Render
  rpa: {
    enabled: false,
    chromePath: null,
    headless: true
  },
  
  // Desabilitar Redis em produção no Render
  redis: {
    enabled: false,
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: 0
  },
  
  // Configurações de segurança para produção
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100 // limite por IP
    }
  }
}; 