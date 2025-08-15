import express from 'express';
import { cardController } from '../controllers/cardController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// Todas as rotas de cartões requerem autenticação
router.use(authMiddleware);

// ROTAS DE CARTÕES
router.get('/cards', asyncHandler(cardController.getCards));
router.post('/cards', asyncHandler(cardController.createCard));
router.put('/cards/:id', asyncHandler(cardController.updateCard));
router.delete('/cards/:id', asyncHandler(cardController.deleteCard));

// ROTAS DE FATURAS
router.get('/invoices', asyncHandler(cardController.getInvoices));
router.post('/invoices', asyncHandler(cardController.createInvoice));
router.put('/invoices/:id', asyncHandler(cardController.updateInvoice));
router.post('/invoices/:id/pay', asyncHandler(cardController.payInvoice));

// ROTAS DE PROGRAMAS DE MILHAS
router.get('/programs', asyncHandler(cardController.getMileagePrograms));
router.post('/programs', asyncHandler(cardController.createMileageProgram));
router.put('/programs/:id', asyncHandler(cardController.updateMileageProgram));
router.delete('/programs/:id', asyncHandler(cardController.deleteMileageProgram));

// ANALYTICS
router.get('/analytics', asyncHandler(cardController.getAnalytics));

export default router;
