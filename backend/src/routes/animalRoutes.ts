import { Router } from 'express';
import { AnimalController } from '../controllers/AnimalController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Rotas CRUD básicas
router.post('/', AnimalController.create);
router.get('/', AnimalController.list);
router.get('/stats', AnimalController.getEstatisticas);
router.get('/para-venda', AnimalController.getParaVenda);
router.get('/brinco/:brinco', AnimalController.getByBrinco);
router.get('/:id', AnimalController.getById);
router.put('/:id', AnimalController.update);
router.delete('/:id', AnimalController.delete);

export default router;
