import { Router } from 'express';
import { BovinoWhatsAppController } from '../controllers/BovinoWhatsAppController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Webhook do WhatsApp (sem autenticação para receber mensagens)
router.get('/webhook', BovinoWhatsAppController.validateWebhook);
router.post('/webhook', BovinoWhatsAppController.processMessage);

// Rotas protegidas (requerem autenticação)
router.use(authenticateToken);

// Envio proativo de mensagens
router.post('/send', BovinoWhatsAppController.sendProactiveMessage);

// Comandos de voz
router.post('/voice', BovinoWhatsAppController.processVoiceCommand);

// Histórico e estatísticas
router.get('/history', BovinoWhatsAppController.getChatHistory);
router.get('/stats', BovinoWhatsAppController.getWhatsAppStats);

export default router;
