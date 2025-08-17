import { Request, Response } from 'express';
import { AIUsageTrackingService } from '../services/AIUsageTrackingService';
import { User } from '../models/User';
// WebSocketService não disponível

const aiUsageService = AIUsageTrackingService.getInstance();

// Middleware para tracking automático de uso de IA
export const trackAIUsageMiddleware = (feature: string, endpoint: string) => {
  return async (req: Request, res: Response, next: any) => {
    const startTime = Date.now();
    const originalSend = res.send;
    
    res.send = function(data: any) {
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      // Extrair informações da resposta para calcular tokens
      const responseData = typeof data === 'string' ? data : JSON.stringify(data);
      const estimatedTokens = Math.ceil(responseData.length / 4); // Estimativa aproximada
      
      // Registrar uso de IA de forma assíncrona
      setImmediate(async () => {
        try {
          if (req.user?.uid) {
            await aiUsageService.trackUsage({
              userId: req.user.uid,
              sessionId: (req as any).session?.id || 'anonymous',
              model: 'deepseek-chat', // Modelo padrão
              provider: 'deepseek',
              requestType: 'chat',
              inputTokens: Math.ceil((req.body?.message || '').length / 4),
              outputTokens: estimatedTokens,
              latency,
              success: res.statusCode < 400,
              errorType: res.statusCode >= 400 ? `HTTP_${res.statusCode}` : undefined,
              metadata: {
                userPlan: req.user.subscriptionPlan || 'free',
                feature,
                endpoint,
                userAgent: req.get('User-Agent'),
                ipAddress: req.ip
              }
            });
          }
        } catch (error) {
          console.error('Erro ao registrar uso de IA:', error);
        }
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Obter estatísticas do usuário
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timeframe = '7d' } = req.query;
    const userId = req.user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const stats = await aiUsageService.getUserStats(
      userId, 
      timeframe as '24h' | '7d' | '30d' | '90d'
    );

    res.json({
      success: true,
      data: stats,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

// Obter estatísticas globais (admin)
export const getGlobalStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timeframe = '7d' } = req.query;
    
    // Verificar se usuário é admin
    const user = await User.findOne({ firebaseUid: req.user?.uid });
    if (!user || (user as any).role !== 'admin') {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    const stats = await aiUsageService.getGlobalStats(
      timeframe as '24h' | '7d' | '30d'
    );

    res.json({
      success: true,
      data: stats,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas globais:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

// Gerenciar modelos de IA
export const getModels = async (req: Request, res: Response): Promise<void> => {
  try {
    const models = await aiUsageService.getModels();
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Erro ao buscar modelos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

export const addModel = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verificar se usuário é admin
    const user = await User.findOne({ firebaseUid: req.user?.uid });
    if (!user || (user as any).role !== 'admin') {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    const model = await aiUsageService.addModel(req.body);
    res.json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error('Erro ao adicionar modelo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

export const updateModel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { modelId } = req.params;
    
    // Verificar se usuário é admin
    const user = await User.findOne({ firebaseUid: req.user?.uid });
    if (!user || (user as any).role !== 'admin') {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    const model = await aiUsageService.updateModel(modelId, req.body);
    if (!model) {
      res.status(404).json({ error: 'Modelo não encontrado' });
      return;
    }

    res.json({
      success: true,
      data: model
    });
  } catch (error) {
    console.error('Erro ao atualizar modelo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

// Configurar alertas
export const setAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, threshold } = req.body;
    const userId = req.user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    if (!['cost', 'tokens', 'requests'].includes(type)) {
      res.status(400).json({ error: 'Tipo de alerta inválido' });
      return;
    }

    await aiUsageService.setAlert(userId, type, threshold);
    
    res.json({
      success: true,
      message: 'Alerta configurado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao configurar alerta:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

// Endpoint para streaming de dados em tempo real
export const getRealtimeStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    // Configurar SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Enviar dados iniciais
    const initialStats = await aiUsageService.getUserStats(userId, '24h');
    res.write(`data: ${JSON.stringify(initialStats)}\n\n`);

    // Listener para atualizações em tempo real
    const onUsageTracked = (data: any) => {
      if (data.userId === userId) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    const onAlert = (alert: any) => {
      if (alert.userId === userId) {
        res.write(`event: alert\ndata: ${JSON.stringify(alert)}\n\n`);
      }
    };

    aiUsageService.on('usage-tracked', onUsageTracked);
    aiUsageService.on('alert', onAlert);

    // Heartbeat a cada 30 segundos
    const heartbeat = setInterval(() => {
      res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date() })}\n\n`);
    }, 30000);

    // Cleanup quando conexão for fechada
    req.on('close', () => {
      clearInterval(heartbeat);
      aiUsageService.removeListener('usage-tracked', onUsageTracked);
      aiUsageService.removeListener('alert', onAlert);
    });

  } catch (error) {
    console.error('Erro no streaming de dados:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

// Análise de custos por período
export const getCostAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const userId = req.user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Implementar análise de custos detalhada
    const analysis = await aiUsageService.getCostAnalysis(userId, '30d');

    res.json({
      success: true,
      data: analysis,
      period: { start, end, groupBy }
    });
  } catch (error) {
    console.error('Erro na análise de custos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

// Comparação de performance entre modelos
export const getModelComparison = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timeframe = '7d' } = req.query;
    const userId = req.user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const comparison = await aiUsageService.getModelComparison(
      userId, 
      timeframe as string
    );

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Erro na comparação de modelos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

// Exportar dados para relatório
export const exportUsageReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { format = 'json', startDate, endDate } = req.query;
    const userId = req.user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const reportData = await aiUsageService.generateReport(userId);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=ai-usage-report.csv');
      res.send(aiUsageService.convertToCSV(reportData));
    } else {
      res.json({
        success: true,
        data: reportData,
        period: { start, end }
      });
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};

// Otimizações e recomendações
export const getOptimizationSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    const suggestions = await aiUsageService.getOptimizationSuggestions(userId);

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Erro ao gerar sugestões:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
};
