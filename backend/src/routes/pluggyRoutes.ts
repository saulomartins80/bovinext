import express from 'express';
import { getConnectToken, handleItemCreation, getMileageSummary } from '../controllers/pluggyController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import PluggyService from '../services/pluggyServiceFixed';

const router = express.Router();

// Todas as rotas Pluggy requerem autenticação
router.use(authMiddleware);

// Gera token para conectar com a Pluggy
router.get('/connect-token', asyncHandler(async (req, res) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    console.log('[pluggyRoutes] Gerando token de conexão para usuário:', userId);
    
    // Verificar se as credenciais do Pluggy estão configuradas
    console.log('[pluggyRoutes] Verificando credenciais Pluggy:');
    console.log('[pluggyRoutes] PLUGGY_CLIENT_ID:', process.env.PLUGGY_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado');
    console.log('[pluggyRoutes] PLUGGY_API_KEY:', process.env.PLUGGY_API_KEY ? '✅ Configurado' : '❌ Não configurado');
    
    if (!process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_API_KEY) {
      console.log('[pluggyRoutes] Credenciais não configuradas, retornando token mockado');
      
      // Retornar token mockado para desenvolvimento
      const mockToken = {
        accessToken: 'mock-connect-token-' + Date.now(),
        expiresIn: 3600,
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/connect`
      };
      
      return res.json({
        success: true,
        token: mockToken.accessToken,
        expiresIn: mockToken.expiresIn,
        redirectUrl: mockToken.redirectUrl,
        message: 'Token mockado - Configure PLUGGY_CLIENT_ID e PLUGGY_API_KEY para token real'
      });
    }
    
    // ✅ IMPLEMENTAÇÃO REAL: Usar serviço Pluggy
    const pluggyServiceFixed = new PluggyService();
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/connect`;
    
    try {
      const tokenData = await pluggyServiceFixed.createConnectToken(redirectUrl);
      
      res.json({
        success: true,
        token: tokenData.accessToken,
        expiresIn: tokenData.expiresIn,
        redirectUrl: redirectUrl
      });
    } catch (error) {
      console.log('[pluggyRoutes] Erro ao gerar token real, retornando token mockado');
      
      // Retorna token mock quando há erro na API
      const mockToken = {
        accessToken: 'mock-connect-token-' + Date.now(),
        expiresIn: 3600,
        redirectUrl: redirectUrl
      };
      
      res.json({
        success: true,
        token: mockToken.accessToken,
        expiresIn: mockToken.expiresIn,
        redirectUrl: mockToken.redirectUrl,
        message: 'Token mockado - Configure credenciais Pluggy válidas para token real'
      });
    }
  } catch (error: any) {
    console.error('❌ Erro na API Pluggy:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao gerar token de conexão Pluggy',
      details: error.message
    });
  }
}));

// Callback para quando o item é criado na Pluggy
router.post('/item-created', asyncHandler(handleItemCreation));

// Resumo de milhas acumuladas
router.get('/mileage-summary', asyncHandler(async (req, res) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    
    // ✅ IMPLEMENTAÇÃO REAL: Buscar dados reais do Pluggy
    const pluggyServiceFixed = new PluggyService();
    const items = await pluggyServiceFixed.getItems();
    
    let totalMiles = 0;
    let totalValue = 0;
    let totalTransactions = 0;
    
    // Processar cada item (conexão bancária)
    for (const item of items) {
      if (item.status === 'UPDATED') {
        for (const account of item.accounts) {
          try {
            const transactions = await pluggyServiceFixed.getTransactions(
              item.id, 
              account.id,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Últimos 30 dias
            );
            
            const milesData = pluggyServiceFixed.calculateMilesFromTransactions(transactions);
            totalMiles += milesData.totalMiles;
            totalValue += milesData.estimatedValue;
            totalTransactions += transactions.length;
          } catch (error) {
            console.error(`Erro ao processar transações da conta ${account.id}:`, error);
          }
        }
      }
    }
    
    res.json({
      success: true,
      summary: {
        totalConnections: items.length,
        activeConnections: items.filter(item => item.status === 'UPDATED').length,
        lastSync: new Date().toISOString(),
        totalPoints: Math.round(totalMiles),
        estimatedValue: totalValue,
        totalTransactions: totalTransactions
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar resumo de milhas',
      details: error.message
    });
  }
}));

// ✅ IMPLEMENTAÇÃO REAL: Buscar conexões Pluggy
router.get('/connections', asyncHandler(async (req, res) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    console.log('[pluggyRoutes] Buscando conexões para usuário:', userId);
    
    // Verificar se as credenciais do Pluggy estão configuradas
    console.log('[pluggyRoutes] Verificando credenciais Pluggy:');
    console.log('[pluggyRoutes] PLUGGY_CLIENT_ID:', process.env.PLUGGY_CLIENT_ID ? '✅ Configurado' : '❌ Não configurado');
    console.log('[pluggyRoutes] PLUGGY_API_KEY:', process.env.PLUGGY_API_KEY ? '✅ Configurado' : '❌ Não configurado');
    
    if (!process.env.PLUGGY_CLIENT_ID || !process.env.PLUGGY_API_KEY) {
      console.log('[pluggyRoutes] Credenciais não configuradas, retornando dados mockados');
      
      // Retornar dados mockados para desenvolvimento
      const mockConnections = [
        {
          id: 'mock-connection-1',
          bankName: 'Banco do Brasil',
          accountType: 'CHECKING',
          lastSync: new Date().toISOString(),
          status: 'connected',
          accounts: ['Conta Corrente', 'Conta Poupança']
        },
        {
          id: 'mock-connection-2',
          bankName: 'Itaú',
          accountType: 'CREDIT_CARD',
          lastSync: new Date().toISOString(),
          status: 'connected',
          accounts: ['Cartão de Crédito']
        }
      ];
      
      return res.json({
        success: true,
        connections: mockConnections,
        message: 'Dados mockados - Configure PLUGGY_CLIENT_ID e PLUGGY_API_KEY para dados reais'
      });
    }
    
    const pluggyService = new PluggyService();
    console.log('[pluggyRoutes] Serviço Pluggy inicializado');
    
    try {
      const items = await pluggyService.getItems();
      console.log('[pluggyRoutes] Items obtidos:', items.length);
      
      const connections = items.map(item => ({
        id: item.id,
        bankName: item.institution.name,
        accountType: item.institution.type,
        lastSync: item.updatedAt,
        status: item.status === 'UPDATED' ? 'connected' : 'error',
        accounts: item.accounts.map(account => account.name)
      }));
      
      console.log('[pluggyRoutes] Conexões processadas:', connections.length);
      
      res.json({
        success: true,
        connections: connections
      });
    } catch (error) {
      console.log('[pluggyRoutes] Erro ao buscar conexões reais, retornando dados mock');
      
      // Retorna dados mock quando há erro na API
      const mockConnections = [
        {
          id: 'mock-connection-1',
          bankName: 'Banco do Brasil',
          accountType: 'BANK',
          lastSync: new Date().toISOString(),
          status: 'connected',
          accounts: ['Conta Corrente', 'Conta Poupança']
        },
        {
          id: 'mock-connection-2',
          bankName: 'Itaú',
          accountType: 'BANK',
          lastSync: new Date().toISOString(),
          status: 'connected',
          accounts: ['Conta Corrente', 'Cartão de Crédito']
        },
        {
          id: 'mock-connection-3',
          bankName: 'Nubank',
          accountType: 'BANK',
          lastSync: new Date().toISOString(),
          status: 'connected',
          accounts: ['Conta Digital', 'Cartão de Crédito']
        }
      ];
      
      res.json({
        success: true,
        connections: mockConnections,
        message: 'Dados mockados - Configure credenciais Pluggy válidas para dados reais'
      });
    }
  } catch (error: any) {
    console.error('[pluggyRoutes] Erro ao buscar conexões Pluggy:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar conexões Pluggy',
      details: error.message
    });
  }
}));

// ✅ NOVA ROTA: Desconectar conexão Pluggy
router.delete('/connections/:itemId', asyncHandler(async (req, res) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { itemId } = req.params;
    
    const pluggyServiceFixed = new PluggyService();
    await pluggyServiceFixed.deleteItem(itemId);
    
    res.json({
      success: true,
      message: 'Conexão desconectada com sucesso'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Falha ao desconectar Pluggy',
      details: error.message
    });
  }
}));

// ✅ NOVA ROTA: Buscar transações de uma conexão
router.get('/connections/:itemId/transactions', asyncHandler(async (req, res) => {
  try {
    const userId = (req as any).user._id || (req as any).user.id;
    const { itemId } = req.params;
    const { from, to } = req.query;
    
    const pluggyServiceFixed = new PluggyService();
    const item = await pluggyServiceFixed.getItem(itemId);
    
    const allTransactions = [];
    
    for (const account of item.accounts) {
      try {
        const transactions = await pluggyServiceFixed.getTransactions(
          itemId,
          account.id,
          from as string,
          to as string
        );
        
        allTransactions.push(...transactions.map(t => ({
          ...t,
          accountName: account.name,
          institutionName: item.institution.name
        })));
      } catch (error) {
        console.error(`Erro ao buscar transações da conta ${account.id}:`, error);
      }
    }
    
    const milesData = pluggyServiceFixed.calculateMilesFromTransactions(allTransactions);
    
    res.json({
      success: true,
      transactions: allTransactions,
      milesSummary: {
        totalSpent: milesData.totalSpent,
        totalMiles: milesData.totalMiles,
        estimatedValue: milesData.estimatedValue,
        categories: milesData.categories
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Falha ao buscar transações',
      details: error.message
    });
  }
}));

export default router; 
