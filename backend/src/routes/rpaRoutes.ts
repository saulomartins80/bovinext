import { Router } from 'express';
import { RpaController } from '../controllers/rpaController';
import { authenticateToken } from '../middlewares/auth';
import { SovereignRPA } from '../rpa/core/SovereignRPA';
import { RPADoctor } from '../rpa/core/RPADoctor';
import { FeeHunter } from '../rpa/modules/FeeHunter';
import { FinancialOracle } from '../rpa/modules/FinancialOracle';
import { db } from '../rpa/core/MemoryDB';
import { wss } from '../rpa/core/WebSocketServer';

const router = Router();
const rpaController = new RpaController();

// 🎯 ROTAS PÚBLICAS (sem autenticação)
router.get('/status', async (req, res) => {
  try {
    const status = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        rpa: 'ACTIVE',
        database: 'CONNECTED',
        firebase: 'CONNECTED'
      },
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    };
    res.json(status);
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error.message });
  }
});

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

// 🎯 ROTAS AVANÇADAS DO RPA ROBUSTO

// 🏦 OPERAÇÕES BANCÁRIAS AVANÇADAS
router.post('/sovereign/bank-operation', async (req, res) => {
  try {
    const rpa = SovereignRPA.getInstance();
    const result = await rpa.executeBankOperation(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🔮 PREVISÕES FINANCEIRAS
router.post('/oracle/predict/:userId', async (req, res) => {
  try {
    const oracle = new FinancialOracle();
    const prediction = await oracle.predictCashFlow(req.params.userId);
    res.json({ success: true, data: prediction });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 💰 CAÇADOR DE TARIFAS
router.post('/fee-hunter/analyze/:userId', async (req, res) => {
  try {
    const feeHunter = new FeeHunter();
    const report = await feeHunter.generateFeeReport(req.params.userId);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🏥 DIAGNÓSTICO DO SISTEMA
router.get('/doctor/checkup', async (req, res) => {
  try {
    const doctor = new RPADoctor();
    const report = await doctor.runFullCheckup();
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🧠 APRENDIZADO COLETIVO
router.post('/swarm/learn', async (req, res) => {
  try {
    const rpa = SovereignRPA.getInstance();
    await rpa.learnFrom(req.body.botId, req.body.data);
    res.json({ success: true, message: 'Conhecimento compartilhado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/swarm/ask', async (req, res) => {
  try {
    const rpa = SovereignRPA.getInstance();
    const answer = await rpa.askSwarmAI(req.body.question);
    res.json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ⚡ PROCESSAMENTO LIGHTNING
router.post('/lightning/process', async (req, res) => {
  try {
    const rpa = SovereignRPA.getInstance();
    const result = await rpa.processTransactionsLightning(req.body.transactions);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🗄️ OPERAÇÕES DE DADOS
router.get('/data/:key', async (req, res) => {
  try {
    const data = db.get(req.params.key);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/data/:key', async (req, res) => {
  try {
    db.set(req.params.key, req.body.data);
    res.json({ success: true, message: 'Dados salvos' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📡 WEBSOCKET STATUS
router.get('/websocket/status', async (req, res) => {
  try {
    const stats = wss.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🎮 CONTROLE DE PODER
router.put('/power-level', async (req, res) => {
  try {
    const rpa = SovereignRPA.getInstance();
    rpa.setPowerLevel(req.body.level);
    res.json({ success: true, powerLevel: rpa.getPowerLevel() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🎯 ROTAS DE TESTE (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  router.post('/test/robust', async (req, res) => {
    try {
      const { testRpaRobust } = await import('../scripts/testRpaRobust');
      await testRpaRobust();
      res.json({ success: true, message: 'Teste robusto executado' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

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