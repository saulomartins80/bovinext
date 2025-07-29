import express from 'express';
import { RPAController } from '../controllers/rpaController';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = express.Router();

// Middleware de autenticação (se necessário)
// router.use(authMiddleware);

// Rotas de métricas e analytics
router.get('/guidance/metrics', asyncHandler(RPAController.getGuidanceMetrics));
router.get('/guidance/journey/progress', asyncHandler(RPAController.getJourneyProgress));
router.get('/guidance/journey/active', asyncHandler(RPAController.getActiveJourney));

// Rotas de interação e ações
router.post('/guidance/interaction', asyncHandler(RPAController.processInteraction));
router.post('/guidance/action', asyncHandler(RPAController.executeGuidanceAction));

// Status do sistema
router.get('/status', asyncHandler(RPAController.getRPAStatus));

export default router; 