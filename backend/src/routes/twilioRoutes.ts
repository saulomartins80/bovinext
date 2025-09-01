import { Router } from 'express';
import { TwilioWebhookController } from '../controllers/TwilioWebhookController';

const router = Router();
const twilioController = new TwilioWebhookController();

// Webhook para receber mensagens do WhatsApp
router.post('/webhook', async (req, res) => {
  await twilioController.receiveMessage(req, res);
});

// Endpoint para testar conexão Twilio
router.get('/test', async (req, res) => {
  await twilioController.testConnection(req, res);
});

// Endpoint para enviar mensagem de teste
router.post('/send-test', async (req, res) => {
  await twilioController.sendTestMessage(req, res);
});

export default router;
