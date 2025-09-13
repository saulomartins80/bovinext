import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// Rota de login
router.post('/login', authController.login);

// Rota de registro
router.post('/register', authController.register);

// Rota de logout
router.post('/logout', authController.logout);

// Verificar sessão
router.get('/session', authController.getSession);

// Reenviar email de verificação
router.post('/resend-verification', authController.resendVerification);

// Esqueci minha senha (envia email)
router.post('/forgot-password', authController.forgotPassword);

// Admin: resetar senha diretamente
router.post('/admin/reset-password', authController.adminResetPassword);

export { router as authRoutes };

// Adicione esta rota ao seu arquivo de rotas principal (index.ts) com o prefixo /api/auth
