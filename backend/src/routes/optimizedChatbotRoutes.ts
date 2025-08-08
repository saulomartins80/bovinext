import express from 'express';
import { 
  handleChatQuery, 
  streamChatResponse,
  startNewSession, 
  getSessions,
  getCacheStats,
  clearCache
} from '../controllers/OptimizedChatbotController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = express.Router();

// ===== ROTAS PÚBLICAS (SEM AUTENTICAÇÃO) =====
// Rota de health check otimizada (deve ser pública)
router.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0-optimized'
  });
});

// ===== MIDDLEWARE OTIMIZADO =====
// Autenticação simplificada (aplicada após rotas públicas)
router.use(authMiddleware);

// Rate limiting inteligente baseado no tipo de request
const createRateLimit = (windowMs: number, max: number): express.RequestHandler => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    let userRequests = requests.get(key);
    
    if (!userRequests || now > userRequests.resetTime) {
      userRequests = { count: 1, resetTime: now + windowMs };
      requests.set(key, userRequests);
      return next();
    }
    
    if (userRequests.count >= max) {
      res.status(429).json({
        success: false,
        message: 'Muitas mensagens! Aguarde um momento antes de tentar novamente.',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
      return;
    }
    
    userRequests.count++;
    next();
  };
};

// Validação otimizada de mensagem
const validateMessage = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const { message } = req.body;
  
  if (!message || typeof message !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Mensagem é obrigatória e deve ser texto'
    });
    return;
  }
  
  if (message.length > 1000) {
    res.status(400).json({
      success: false,
      message: 'Mensagem muito longa. Máximo 1000 caracteres.'
    });
    return;
  }
  
  if (message.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Mensagem não pode estar vazia'
    });
    return;
  }
  
  next();
};

// Middleware de logging otimizado
const logRequest = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const start = Date.now();
  const userId = (req as any).user?.uid || 'anonymous';
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[OptimizedChat] ${req.method} ${req.path} - User: ${userId} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// ===== ROTAS OTIMIZADAS =====

// Rota principal para mensagens (otimizada)
router.post('/query', 
  logRequest,
  createRateLimit(60000, 30), // 30 mensagens por minuto
  validateMessage,
  asyncHandler(handleChatQuery)
);

// Rota para streaming (mais restritiva)
router.post('/stream', 
  logRequest,
  createRateLimit(60000, 10), // 10 streams por minuto
  validateMessage,
  asyncHandler(streamChatResponse)
);

// Rota GET para streaming via EventSource
router.get('/stream', 
  logRequest,
  createRateLimit(60000, 10), // 10 streams por minuto
  asyncHandler(streamChatResponse)
);

// Gestão de sessões
router.post('/sessions', 
  createRateLimit(300000, 5), // 5 sessões por 5 minutos
  asyncHandler(startNewSession)
);

router.get('/sessions', 
  createRateLimit(60000, 20), // 20 consultas por minuto
  asyncHandler(getSessions)
);

// Rotas de administração
router.get('/cache/stats', 
  createRateLimit(60000, 10),
  asyncHandler(getCacheStats)
);

router.delete('/cache', 
  createRateLimit(300000, 2), // 2 limpezas de cache por 5 minutos
  asyncHandler(clearCache)
);



// Rota para métricas de performance
router.get('/metrics', (req: express.Request, res: express.Response) => {
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    success: true,
    metrics: {
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
      },
      uptime: `${Math.round(process.uptime())}s`,
      timestamp: new Date().toISOString()
    }
  });
});

// Middleware de tratamento de erros otimizado
router.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[OptimizedChatRoutes] Error:', error);
  
  // Não expor detalhes do erro em produção
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    ...(isDevelopment && { stack: error.stack })
  });
});

export default router;
