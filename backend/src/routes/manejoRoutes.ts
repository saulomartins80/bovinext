import { Router } from 'express';
import { ManejoController } from '../controllers/ManejoController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Rotas CRUD básicas
router.post('/', ManejoController.create);
router.get('/', ManejoController.list);
router.get('/agenda', ManejoController.getAgenda);
router.get('/stats', ManejoController.getEstatisticas);
router.get('/:id', ManejoController.getById);
router.put('/:id', ManejoController.update);
router.put('/:id/executar', ManejoController.marcarExecutado);
router.delete('/:id', ManejoController.delete);

export default router;
