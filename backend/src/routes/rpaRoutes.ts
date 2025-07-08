import { Router } from 'express';
import { RpaController } from '../controllers/rpaController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();
const rpaController = new RpaController();

// 🔐 Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// 🏦 AUTOMAÇÃO BANCÁRIA
router.post('/users/:userId/sync-bank', async (req, res) => {
  await rpaController.syncBankData(req, res);
});

// 📊 ANÁLISE FINANCEIRA
router.post('/users/:userId/analyze', async (req, res) => {
  await rpaController.analyzeUserFinances(req, res);
});

// 📋 RELATÓRIOS
router.post('/users/:userId/report', async (req, res) => {
  await rpaController.generateFinancialReport(req, res);
});

// 🧹 LIMPEZA
router.post('/cleanup', async (req, res) => {
  await rpaController.cleanupOldData(req, res);
});

// 📈 MONITORAMENTO
router.get('/health', async (req, res) => {
  await rpaController.getSystemHealth(req, res);
});

router.get('/tasks', async (req, res) => {
  await rpaController.getAllTasks(req, res);
});

router.get('/tasks/:taskId', async (req, res) => {
  await rpaController.getTaskStatus(req, res);
});

// 🔧 CONFIGURAÇÃO
router.put('/users/:userId/bank-credentials', async (req, res) => {
  await rpaController.updateUserBankCredentials(req, res);
});

// 🚨 ALERTAS
router.put('/alerts/:alertId/acknowledge', async (req, res) => {
  await rpaController.acknowledgeAlert(req, res);
});

// 🎯 ROTAS DE TESTE (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  router.post('/test/sync', async (req, res) => {
    try {
      const { userId } = req.body;
      
      // Simular tarefa de teste
      const taskId = await rpaController['orchestrator'].addTask({
        type: 'DATA_SYNC',
        priority: 'LOW',
        payload: {
          operation: 'TEST_SYNC',
          userId,
          testData: { message: 'Teste de sincronização' }
        },
        userId,
        maxRetries: 1
      });

      res.json({
        success: true,
        taskId,
        message: 'Tarefa de teste criada'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  router.post('/test/analysis', async (req, res) => {
    try {
      const { userId } = req.body;
      
      const analysis = await rpaController['finnexthoIntegration'].analyzeUserFinances(userId);
      
      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}

export default router; 