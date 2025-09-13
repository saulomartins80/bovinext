// routes/bovinextRoutes.ts - Rotas específicas do BOVINEXT
import express from 'express';
import { bovinextSupabaseService } from '../services/BovinextSupabaseService';
// import { authenticateToken } from '../middlewares/auth';

const router = express.Router();

// Middleware de autenticação para todas as rotas (desabilitado temporariamente para testes)
// router.use(authenticateToken);

// ==================== ANIMAIS (REBANHO) ====================
router.get('/animals', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || req.query.user_id || '';
    const animals = await bovinextSupabaseService.getAnimaisByUser(String(userId));
    res.json({ success: true, data: animals });
  } catch (error) {
    console.error('Erro ao buscar animais:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/animals', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || req.body.user_id;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id é obrigatório' });

    const animalData = req.body;
    if (!animalData.brinco || !animalData.raca || !animalData.sexo || !animalData.data_nascimento) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios: brinco, raca, sexo, data_nascimento' });
    }

    const created = await bovinextSupabaseService.createAnimal(String(userId), animalData);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Erro ao criar animal:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.put('/animals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await bovinextSupabaseService.updateAnimal(String(id), updateData);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erro ao atualizar animal:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.delete('/animals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await bovinextSupabaseService.deleteAnimal(String(id));
    res.json({ success: true, message: 'Animal removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar animal:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== MANEJO ====================
router.get('/manejo', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || String(req.query.user_id || '');
    const manejos = await bovinextSupabaseService.getManejosByUser(userId);
    res.json({ success: true, data: manejos });
  } catch (error) {
    console.error('Erro ao buscar manejos:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/manejo', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || req.body.user_id;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    const manejo = await bovinextSupabaseService.createManejo(String(userId), req.body);
    res.status(201).json({ success: true, data: manejo });
  } catch (error) {
    console.error('Erro ao criar manejo:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== PRODUÇÃO ====================
router.get('/producao', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || String(req.query.user_id || '');
    const producoes = await bovinextSupabaseService.getProducaoByUser(userId);
    res.json({ success: true, data: producoes });
  } catch (error) {
    console.error('Erro ao buscar produções:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/producao', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || req.body.user_id;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    const producao = await bovinextSupabaseService.createProducao(String(userId), req.body);
    res.status(201).json({ success: true, data: producao });
  } catch (error) {
    console.error('Erro ao criar produção:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== VENDAS ====================
router.get('/vendas', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || String(req.query.user_id || '');
    const vendas = await bovinextSupabaseService.getVendasByUser(userId);
    res.json({ success: true, data: vendas });
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/vendas', async (req, res) => {
  try {
    const userId = (req as any).user?.uid || req.body.user_id;
    if (!userId) return res.status(400).json({ success: false, message: 'user_id é obrigatório' });
    const venda = await bovinextSupabaseService.createVenda(String(userId), req.body, req.body.animais_ids || []);
    res.status(201).json({ success: true, data: venda });
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== DASHBOARD & KPIs ====================
router.get('/dashboard/kpis', async (req, res) => {
  try {
    const kpis = {
      totalAnimais: 1247,
      receitaMensal: 1200000,
      gmdMedio: 1.12,
      precoArroba: 315.80,
      alertasAtivos: 3,
      custoPorCabeca: 850,
      margemLucro: 65.2,
      taxaNatalidade: 85.5,
      taxaMortalidade: 2.1
    };
    
    res.json({ success: true, data: kpis });
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.get('/dashboard/charts/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { period } = req.query;
    
    // Mock chart data baseado no tipo
    let chartData = [];
    
    switch (type) {
      case 'peso':
        chartData = [
          { data: '2024-01', valor: 450 },
          { data: '2024-02', valor: 465 },
          { data: '2024-03', valor: 480 },
          { data: '2024-04', valor: 485 }
        ];
        break;
      case 'receita':
        chartData = [
          { data: '2024-01', valor: 980000 },
          { data: '2024-02', valor: 1050000 },
          { data: '2024-03', valor: 1150000 },
          { data: '2024-04', valor: 1200000 }
        ];
        break;
      default:
        chartData = [];
    }
    
    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== IA FINN BOVINO ====================
router.post('/ia/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Mock response da IA - substituir por integração real
    const response = {
      response: `Olá! Sou o FINN Bovino. Você perguntou: "${message}". Como posso ajudar com seu rebanho?`,
      suggestions: [
        'Quantos animais tenho no rebanho?',
        'Qual o preço da arroba hoje?',
        'Como está a performance do meu rebanho?',
        'Preciso vacinar algum animal?'
      ],
      context: context || {}
    };
    
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Erro no chat com IA:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.post('/ia/analyze', async (req, res) => {
  try {
    const analysisData = req.body;
    
    // Mock analysis response
    const analysis = {
      tipo: 'analise_rebanho',
      resultados: {
        gmd_medio: 1.15,
        peso_medio: 485,
        recomendacoes: [
          'Considere suplementação mineral',
          'Monitore peso dos animais semanalmente',
          'Verifique qualidade do pasto'
        ]
      },
      confianca: 0.95,
      timestamp: new Date()
    };
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Erro na análise da IA:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// ==================== RELATÓRIOS ====================
router.post('/reports/generate', async (req, res) => {
  try {
    const { type, filters } = req.body;
    
    const report = {
      id: Date.now().toString(),
      tipo: type,
      filtros: filters,
      status: 'PROCESSANDO',
      dataGeracao: new Date(),
      url: null
    };
    
    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

router.get('/reports/:reportId/export', async (req, res) => {
  try {
    const { reportId } = req.params;
    const { format } = req.query;
    
    // Mock export - substituir por geração real de PDF/Excel
    res.json({ 
      success: true, 
      message: `Relatório ${reportId} exportado em ${format}`,
      downloadUrl: `/downloads/report-${reportId}.${format}`
    });
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

export default router;
