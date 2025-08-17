import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth';
import { rateLimitMiddleware } from '../middlewares/rateLimitMiddleware';
import {
  getUserStats,
  getGlobalStats,
  getModels,
  addModel,
  updateModel,
  setAlert,
  getRealtimeStats,
  getCostAnalysis,
  getModelComparison,
  exportUsageReport,
  getOptimizationSuggestions,
  trackAIUsageMiddleware
} from '../controllers/AIUsageController';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Rotas de estatísticas do usuário
router.get('/stats', rateLimitMiddleware(100, 15 * 60 * 1000), getUserStats);
router.get('/stats/realtime', getRealtimeStats);
router.get('/stats/cost-analysis', getCostAnalysis);
router.get('/stats/model-comparison', getModelComparison);
router.get('/stats/export', exportUsageReport);

// Rotas de otimização
router.get('/optimization/suggestions', getOptimizationSuggestions);

// Rotas de alertas
router.post('/alerts', setAlert);

// Rotas de modelos
router.get('/models', getModels);
router.post('/models', addModel);
router.put('/models/:modelId', updateModel);

// Rotas administrativas
router.get('/admin/stats', getGlobalStats);

export { router as aiUsageRoutes };
