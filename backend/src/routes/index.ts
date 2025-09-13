import express from 'express';
import bovinextRoutes from './bovinextRoutes';
import { authRoutes } from './authRoutes';
import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

// ==================== ROTAS PÚBLICAS ====================
router.use('/api/auth', authRoutes);

// Health check público para clientes (não requer auth)
router.get('/api/chatbot/health', (_req, res) => {
  res.status(200).json({ status: 'OK', service: 'chatbot', timestamp: new Date().toISOString() });
});

// ==================== ROTAS PROTEGIDAS ====================
// Todas as rotas abaixo deste middleware requerem autenticação
router.use('/api', authenticateToken, bovinextRoutes);

export default router;