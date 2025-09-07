import express from 'express';
import authRoutes from './authRoutes';
import transacoesRoutes from './transacoesRoutes';
import investimentoRoutes from './investimentoRoutes';
import marketDataRoutes from './marketDataRoutes';
import goalsRoutes from './goalsRoutes';
import optimizedChatbotRoutes from './optimizedChatbotRoutes';
import automatedActions from './automatedActions';
import subscriptionRoutes from './subscriptionRoutes';
import pluggyRoutes from './pluggyRoutes';
import mileageRoutes from './mileageRoutes';
import cardRoutes from './cardRoutes';
import rpaRoutes from './rpaRoutes';

const router = express.Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas protegidas (adaptadas para BOVINEXT)
router.use('/transacoes', transacoesRoutes);        // → Manejos
router.use('/investimentos', investimentoRoutes);   // → Animais  
router.use('/market-data', marketDataRoutes);       // → Preços Boi
router.use('/goals', goalsRoutes);                  // → Metas Produção
router.use('/chatbot', optimizedChatbotRoutes);     // → Bovino Assistant
router.use('/automated-actions', automatedActions); // → Ações Pecuárias
router.use('/subscriptions', subscriptionRoutes);
router.use('/pluggy', pluggyRoutes);
router.use('/mileage', mileageRoutes);
router.use('/cards', cardRoutes);
router.use('/rpa', rpaRoutes);

export default router;