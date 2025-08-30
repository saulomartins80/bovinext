import express from "express";
import {
  handleChatQuery,
  streamChatResponse,
  startNewSession,
  getSessions,
  getCacheStats,
  clearCache,
  deleteSession,
  deleteAllSessions,
  executeConfirmedAction,
} from "../controllers/OptimizedChatbotController";
import { OptimizedChatbotController } from "../controllers/OptimizedChatbotController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = express.Router();

// ===== ROTA DE HEALTH CHECK (PÚBLICA) =====
router.get("/health", (req: express.Request, res: express.Response) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "2.0.0-optimized",
    features: ["intent_detection", "auto_execution", "confirmation_flow"],
  });
});

// ===== MIDDLEWARE DE AUTENTICAÇÃO =====
router.use(authMiddleware);

// ===== RATE LIMITING INTELIGENTE =====
const createRateLimit = (
  windowMs: number,
  max: number,
): express.RequestHandler => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): void => {
    const key = req.ip || "unknown";
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
        message: "Muitas mensagens! Aguarde um momento.",
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
      });
      return;
    }

    userRequests.count++;
    next();
  };
};

// ===== VALIDAÇÃO DE MENSAGEM =====
const validateMessage = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({
      success: false,
      message: "Mensagem é obrigatória e deve ser texto",
    });
    return;
  }

  if (message.length > 1000) {
    res.status(400).json({
      success: false,
      message: "Mensagem muito longa. Máximo 1000 caracteres.",
    });
    return;
  }

  if (message.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: "Mensagem não pode estar vazia",
    });
    return;
  }

  next();
};

// ===== LOGGING OTIMIZADO =====
const logRequest = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void => {
  const start = Date.now();
  const userId = (req as any).user?.uid || "anonymous";

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `🌐 [ChatbotRoutes] ${req.method} ${req.path} - User: ${userId.substring(0, 8)}... - ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
};

// ===== ROTAS PRINCIPAIS =====

// Rota principal para mensagens
router.post(
  "/query",
  logRequest,
  createRateLimit(60000, 30), // 30 mensagens por minuto
  validateMessage,
  asyncHandler(handleChatQuery),
);

// Rota para streaming
router.post(
  "/stream",
  logRequest,
  createRateLimit(60000, 15), // 15 streams por minuto
  validateMessage,
  asyncHandler(streamChatResponse),
);

// Rota GET para streaming via EventSource
router.get(
  "/stream",
  logRequest,
  createRateLimit(60000, 15),
  asyncHandler(streamChatResponse),
);

// ===== ROTA DE CONFIRMAÇÃO DE AÇÕES =====
router.post(
  "/confirm-action",
  logRequest,
  createRateLimit(60000, 50), // 50 confirmações por minuto
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { actionData, action } = req.body;

    if (!actionData || !action) {
      res.status(400).json({
        success: false,
        message: "Dados de ação e tipo de ação são obrigatórios",
      });
      return;
    }

    if (!["confirm", "cancel"].includes(action)) {
      res.status(400).json({
        success: false,
        message: 'Ação deve ser "confirm" ou "cancel"',
      });
      return;
    }

    next();
  },
  asyncHandler(async (req: express.Request, res: express.Response) => {
    const controller = OptimizedChatbotController.getInstance();
    await controller.executeConfirmedAction(req, res);
  }),
);

// ===== GESTÃO DE SESSÕES =====
router.post(
  "/sessions",
  createRateLimit(300000, 10), // 10 sessões por 5 minutos
  asyncHandler(startNewSession),
);

router.get(
  "/sessions",
  createRateLimit(60000, 30), // 30 consultas por minuto
  asyncHandler(getSessions),
);

router.delete(
  "/sessions/:chatId",
  createRateLimit(60000, 20), // 20 deleções por minuto
  asyncHandler(deleteSession),
);

router.delete(
  "/sessions",
  createRateLimit(300000, 5), // 5 deleções em massa por 5 minutos
  asyncHandler(deleteAllSessions),
);

// ===== ADMINISTRAÇÃO =====
router.get(
  "/cache/stats",
  createRateLimit(60000, 10),
  asyncHandler(getCacheStats),
);

router.delete(
  "/cache",
  createRateLimit(300000, 3), // 3 limpezas por 5 minutos
  asyncHandler(clearCache),
);

// ===== MÉTRICAS =====
router.get("/metrics", (req: express.Request, res: express.Response) => {
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    success: true,
    metrics: {
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      },
      uptime: `${Math.round(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      features: {
        intentDetection: true,
        autoExecution: true,
        confirmationFlow: true,
        streaming: true,
        caching: true,
      },
    },
  });
});

// ===== MIDDLEWARE DE ERRO =====
router.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("❌ [ChatbotRoutes] Erro:", error);

    const isDevelopment = process.env.NODE_ENV === "development";

    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Erro interno do servidor",
      timestamp: new Date().toISOString(),
      ...(isDevelopment && {
        stack: error.stack,
        details: error,
      }),
    });
  },
);

export default router;
