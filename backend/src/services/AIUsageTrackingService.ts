import mongoose, { Schema, Document } from 'mongoose';
import { EventEmitter } from 'events';

// Interfaces para tracking de uso de IA
interface IAIUsageRecord extends Document {
  userId: string;
  sessionId: string;
  modelName: string;
  provider: 'deepseek' | 'openai' | 'anthropic' | 'local';
  requestType: 'chat' | 'completion' | 'embedding' | 'image' | 'analysis';
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  latency: number;
  success: boolean;
  errorType?: string;
  metadata: {
    userPlan: string;
    feature: string;
    endpoint: string;
    userAgent?: string;
    ipAddress?: string;
  };
  timestamp: Date;
}

interface IAIUsageStats extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  dailyStats: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
    successRate: number;
    byModel: Map<string, {
      requests: number;
      tokens: number;
      cost: number;
      latency: number;
    }>;
    byFeature: Map<string, {
      requests: number;
      tokens: number;
      cost: number;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface IAIModelConfig extends Document {
  modelId: string;
  provider: string;
  name: string;
  description: string;
  costPerInputToken: number;
  costPerOutputToken: number;
  maxTokens: number;
  isActive: boolean;
  features: string[];
  performance: {
    averageLatency: number;
    successRate: number;
    qualityScore: number;
  };
  limits: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tokensPerRequest: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schemas MongoDB
const AIUsageRecordSchema = new Schema<IAIUsageRecord>({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  modelName: { type: String, required: true, index: true },
  provider: { type: String, enum: ['deepseek', 'openai', 'anthropic', 'local'], required: true },
  requestType: { type: String, enum: ['chat', 'completion', 'embedding', 'image', 'analysis'], required: true },
  inputTokens: { type: Number, required: true },
  outputTokens: { type: Number, required: true },
  totalTokens: { type: Number, required: true },
  cost: { type: Number, required: true },
  latency: { type: Number, required: true },
  success: { type: Boolean, required: true },
  errorType: { type: String },
  metadata: {
    userPlan: { type: String, required: true },
    feature: { type: String, required: true },
    endpoint: { type: String, required: true },
    userAgent: { type: String },
    ipAddress: { type: String }
  },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true,
  collection: 'ai_usage_records'
});

const AIUsageStatsSchema = new Schema<IAIUsageStats>({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true },
  dailyStats: {
    totalRequests: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    averageLatency: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    byModel: { type: Map, of: Schema.Types.Mixed },
    byFeature: { type: Map, of: Schema.Types.Mixed }
  }
}, {
  timestamps: true,
  collection: 'ai_usage_stats'
});

const AIModelConfigSchema = new Schema<IAIModelConfig>({
  modelId: { type: String, required: true, unique: true },
  provider: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  costPerInputToken: { type: Number, required: true },
  costPerOutputToken: { type: Number, required: true },
  maxTokens: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  features: [{ type: String }],
  performance: {
    averageLatency: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    qualityScore: { type: Number, default: 0 }
  },
  limits: {
    requestsPerMinute: { type: Number, default: 60 },
    requestsPerDay: { type: Number, default: 1000 },
    tokensPerRequest: { type: Number, default: 4000 }
  }
}, {
  timestamps: true,
  collection: 'ai_model_configs'
});

// Índices para performance
AIUsageRecordSchema.index({ userId: 1, timestamp: -1 });
AIUsageRecordSchema.index({ userId: 1, model: 1, timestamp: -1 });
AIUsageRecordSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // 90 dias TTL
AIUsageStatsSchema.index({ userId: 1, date: -1 });

// Models
export const AIUsageRecord = mongoose.model<IAIUsageRecord>('AIUsageRecord', AIUsageRecordSchema);
export const AIUsageStats = mongoose.model<IAIUsageStats>('AIUsageStats', AIUsageStatsSchema);
export const AIModelConfig = mongoose.model<IAIModelConfig>('AIModelConfig', AIModelConfigSchema);

// Service principal
export class AIUsageTrackingService extends EventEmitter {
  private static instance: AIUsageTrackingService;
  private realtimeStats = new Map<string, any>();
  private alertThresholds = new Map<string, any>();

  constructor() {
    super();
    this.initializeDefaultModels();
    this.startRealtimeMonitoring();
  }

  static getInstance(): AIUsageTrackingService {
    if (!AIUsageTrackingService.instance) {
      AIUsageTrackingService.instance = new AIUsageTrackingService();
    }
    return AIUsageTrackingService.instance;
  }

  // Registrar uso de IA
  async trackUsage(params: {
    userId: string;
    sessionId: string;
    model: string;
    provider: 'deepseek' | 'openai' | 'anthropic' | 'local';
    requestType: 'chat' | 'completion' | 'embedding' | 'image' | 'analysis';
    inputTokens: number;
    outputTokens: number;
    latency: number;
    success: boolean;
    errorType?: string;
    metadata: {
      userPlan: string;
      feature: string;
      endpoint: string;
      userAgent?: string;
      ipAddress?: string;
    };
  }): Promise<void> {
    try {
      const modelConfig = await AIModelConfig.findOne({ modelId: params.model });
      if (!modelConfig) {
        throw new Error(`Configuração do modelo ${params.model} não encontrada`);
      }

      const totalTokens = params.inputTokens + params.outputTokens;
      const cost = (params.inputTokens * modelConfig.costPerInputToken) + 
                   (params.outputTokens * modelConfig.costPerOutputToken);

      // Salvar registro detalhado
      const record = new AIUsageRecord({
        ...params,
        totalTokens,
        cost,
        timestamp: new Date()
      });

      await record.save();

      // Atualizar estatísticas diárias
      await this.updateDailyStats(params.userId, {
        model: params.model,
        tokens: totalTokens,
        cost,
        latency: params.latency,
        success: params.success,
        feature: params.metadata.feature
      });

      // Atualizar stats em tempo real
      this.updateRealtimeStats(params.userId, {
        tokens: totalTokens,
        cost,
        latency: params.latency,
        success: params.success
      });

      // Verificar alertas
      await this.checkAlerts(params.userId, cost, totalTokens);

      // Emitir evento para WebSocket
      this.emit('usage-tracked', {
        userId: params.userId,
        model: params.model,
        cost,
        tokens: totalTokens,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Erro ao registrar uso de IA:', error);
      throw error;
    }
  }

  // Obter estatísticas do usuário
  async getUserStats(userId: string, timeframe: '24h' | '7d' | '30d' | '90d' = '7d'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
    }

    // Buscar registros do período
    const records = await AIUsageRecord.find({
      userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });

    // Calcular métricas
    const totalRequests = records.length;
    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
    const averageLatency = records.length > 0 ? 
      records.reduce((sum, r) => sum + r.latency, 0) / records.length : 0;
    const successRate = records.length > 0 ? 
      (records.filter(r => r.success).length / records.length) * 100 : 0;

    // Agrupar por modelo
    const byModel = records.reduce((acc, record) => {
      if (!acc[record.modelName]) {
        acc[record.modelName] = { requests: 0, tokens: 0, cost: 0, latency: 0 };
      }
      acc[record.modelName].requests++;
      acc[record.modelName].tokens += record.totalTokens;
      acc[record.modelName].cost += record.cost;
      acc[record.modelName].latency += record.latency;
      return acc;
    }, {} as any);

    // Calcular latência média por modelo
    Object.keys(byModel).forEach(model => {
      byModel[model].latency = byModel[model].latency / byModel[model].requests;
    });

    // Agrupar por feature
    const byFeature = records.reduce((acc, record) => {
      const feature = record.metadata.feature;
      if (!acc[feature]) {
        acc[feature] = { requests: 0, tokens: 0, cost: 0 };
      }
      acc[feature].requests++;
      acc[feature].tokens += record.totalTokens;
      acc[feature].cost += record.cost;
      return acc;
    }, {} as any);

    // Dados para gráficos (últimos 30 pontos)
    const timeSeriesData = this.generateTimeSeriesData(records, timeframe);

    return {
      summary: {
        totalRequests,
        totalTokens,
        totalCost,
        averageLatency,
        successRate
      },
      byModel,
      byFeature,
      timeSeries: timeSeriesData,
      realtimeStats: this.realtimeStats.get(userId) || {},
      alerts: await this.getActiveAlerts(userId)
    };
  }

  // Obter estatísticas globais (admin)
  async getGlobalStats(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<any> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const pipeline = [
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          totalTokens: { $sum: '$totalTokens' },
          totalCost: { $sum: '$cost' },
          averageLatency: { $avg: '$latency' },
          successCount: { $sum: { $cond: ['$success', 1, 0] } },
          uniqueUsers: { $addToSet: '$userId' }
        }
      }
    ];

    const [globalStats] = await AIUsageRecord.aggregate(pipeline);
    
    if (!globalStats) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        averageLatency: 0,
        successRate: 0,
        uniqueUsers: 0
      };
    }

    return {
      totalRequests: globalStats.totalRequests,
      totalTokens: globalStats.totalTokens,
      totalCost: globalStats.totalCost,
      averageLatency: globalStats.averageLatency,
      successRate: (globalStats.successCount / globalStats.totalRequests) * 100,
      uniqueUsers: globalStats.uniqueUsers.length
    };
  }

  // Gerenciar modelos de IA
  async addModel(config: Partial<IAIModelConfig>): Promise<IAIModelConfig> {
    const model = new AIModelConfig(config);
    return await model.save();
  }

  async updateModel(modelId: string, updates: Partial<IAIModelConfig>): Promise<IAIModelConfig | null> {
    return await AIModelConfig.findOneAndUpdate(
      { modelId },
      updates,
      { new: true }
    );
  }

  async getModels(): Promise<IAIModelConfig[]> {
    return await AIModelConfig.find({ isActive: true });
  }

  // Sistema de alertas
  async setAlert(userId: string, type: 'cost' | 'tokens' | 'requests', threshold: number): Promise<void> {
    if (!this.alertThresholds.has(userId)) {
      this.alertThresholds.set(userId, {});
    }
    this.alertThresholds.get(userId)[type] = threshold;
  }

  private async checkAlerts(userId: string, cost: number, tokens: number): Promise<void> {
    const userAlerts = this.alertThresholds.get(userId);
    if (!userAlerts) return;

    const todayStats = await this.getTodayStats(userId);

    // Verificar alertas de custo
    if (userAlerts.cost && todayStats.totalCost >= userAlerts.cost) {
      this.emit('alert', {
        userId,
        type: 'cost',
        message: `Limite de custo diário atingido: R$ ${todayStats.totalCost.toFixed(2)}`,
        threshold: userAlerts.cost,
        current: todayStats.totalCost
      });
    }

    // Verificar alertas de tokens
    if (userAlerts.tokens && todayStats.totalTokens >= userAlerts.tokens) {
      this.emit('alert', {
        userId,
        type: 'tokens',
        message: `Limite de tokens diário atingido: ${todayStats.totalTokens}`,
        threshold: userAlerts.tokens,
        current: todayStats.totalTokens
      });
    }
  }

  private async getTodayStats(userId: string): Promise<any> {
    const today = new Date().toISOString().split('T')[0];
    const stats = await AIUsageStats.findOne({ userId, date: today });
    return stats?.dailyStats || { totalCost: 0, totalTokens: 0, totalRequests: 0 };
  }

  private async updateDailyStats(userId: string, data: any): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    await AIUsageStats.findOneAndUpdate(
      { userId, date: today },
      {
        $inc: {
          'dailyStats.totalRequests': 1,
          'dailyStats.totalTokens': data.tokens,
          'dailyStats.totalCost': data.cost
        },
        $set: {
          [`dailyStats.byModel.${data.model}.requests`]: 1,
          [`dailyStats.byModel.${data.model}.tokens`]: data.tokens,
          [`dailyStats.byModel.${data.model}.cost`]: data.cost,
          [`dailyStats.byFeature.${data.feature}.requests`]: 1,
          [`dailyStats.byFeature.${data.feature}.tokens`]: data.tokens,
          [`dailyStats.byFeature.${data.feature}.cost`]: data.cost
        }
      },
      { upsert: true }
    );
  }

  private updateRealtimeStats(userId: string, data: any): void {
    if (!this.realtimeStats.has(userId)) {
      this.realtimeStats.set(userId, {
        requests: 0,
        tokens: 0,
        cost: 0,
        latency: [],
        lastUpdate: new Date()
      });
    }

    const stats = this.realtimeStats.get(userId);
    stats.requests++;
    stats.tokens += data.tokens;
    stats.cost += data.cost;
    stats.latency.push(data.latency);
    if (stats.latency.length > 100) stats.latency.shift(); // Manter apenas últimas 100
    stats.lastUpdate = new Date();
  }

  private generateTimeSeriesData(records: any[], timeframe: string): any[] {
    // Implementar geração de dados para gráficos baseado no timeframe
    const groupedData = new Map();
    
    records.forEach(record => {
      const key = this.getTimeKey(record.timestamp, timeframe);
      if (!groupedData.has(key)) {
        groupedData.set(key, { requests: 0, tokens: 0, cost: 0, timestamp: key });
      }
      const data = groupedData.get(key);
      data.requests++;
      data.tokens += record.totalTokens;
      data.cost += record.cost;
    });

    return Array.from(groupedData.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  private getTimeKey(timestamp: Date, timeframe: string): string {
    switch (timeframe) {
      case '24h':
        return timestamp.toISOString().substring(0, 13) + ':00:00.000Z'; // Por hora
      case '7d':
        return timestamp.toISOString().substring(0, 10) + 'T00:00:00.000Z'; // Por dia
      case '30d':
      case '90d':
        return timestamp.toISOString().substring(0, 10) + 'T00:00:00.000Z'; // Por dia
      default:
        return timestamp.toISOString();
    }
  }

  private async getActiveAlerts(userId: string): Promise<any[]> {
    // Implementar busca de alertas ativos
    return [];
  }

  private async initializeDefaultModels(): Promise<void> {
    const defaultModels = [
      {
        modelId: 'deepseek-chat',
        provider: 'deepseek',
        name: 'DeepSeek Chat',
        description: 'Modelo principal para conversas e análises',
        costPerInputToken: 0.00000014, // $0.14 per 1M tokens
        costPerOutputToken: 0.00000028, // $0.28 per 1M tokens
        maxTokens: 4096,
        features: ['chat', 'analysis', 'coding'],
        limits: {
          requestsPerMinute: 60,
          requestsPerDay: 10000,
          tokensPerRequest: 4096
        }
      },
      {
        modelId: 'gpt-4-turbo',
        provider: 'openai',
        name: 'GPT-4 Turbo',
        description: 'Modelo avançado para tarefas complexas',
        costPerInputToken: 0.00001, // $10 per 1M tokens
        costPerOutputToken: 0.00003, // $30 per 1M tokens
        maxTokens: 8192,
        features: ['chat', 'analysis', 'creative'],
        limits: {
          requestsPerMinute: 10,
          requestsPerDay: 1000,
          tokensPerRequest: 8192
        }
      }
    ];

    for (const modelConfig of defaultModels) {
      await AIModelConfig.findOneAndUpdate(
        { modelId: modelConfig.modelId },
        modelConfig,
        { upsert: true }
      );
    }
  }

  private startRealtimeMonitoring(): void {
    // Limpar stats antigas a cada hora
    setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      for (const [userId, stats] of this.realtimeStats.entries()) {
        if (stats.lastUpdate < oneHourAgo) {
          this.realtimeStats.delete(userId);
        }
      }
    }, 60 * 60 * 1000);
  }

  // Métodos adicionais para AIUsageController
  async getCostAnalysis(userId: string, period: string = '30d'): Promise<any> {
    const startDate = this.getStartDate(period);
    const records = await AIUsageRecord.find({
      userId,
      timestamp: { $gte: startDate }
    });

    const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
    const byModel = records.reduce((acc, record) => {
      if (!acc[record.modelName]) {
        acc[record.modelName] = { cost: 0, requests: 0, tokens: 0 };
      }
      acc[record.modelName].cost += record.cost;
      acc[record.modelName].requests += 1;
      acc[record.modelName].tokens += record.totalTokens;
      return acc;
    }, {} as any);

    return {
      totalCost,
      period,
      byModel,
      averageCostPerRequest: records.length > 0 ? totalCost / records.length : 0
    };
  }

  async getModelComparison(userId: string, period: string = '30d'): Promise<any> {
    const startDate = this.getStartDate(period);
    const records = await AIUsageRecord.find({
      userId,
      timestamp: { $gte: startDate }
    });

    const modelStats = records.reduce((acc, record) => {
      if (!acc[record.modelName]) {
        acc[record.modelName] = {
          requests: 0,
          totalTokens: 0,
          totalCost: 0,
          averageLatency: 0,
          successRate: 0,
          latencies: []
        };
      }
      
      const stats = acc[record.modelName];
      stats.requests += 1;
      stats.totalTokens += record.totalTokens;
      stats.totalCost += record.cost;
      stats.latencies.push(record.latency);
      
      return acc;
    }, {} as any);

    // Calcular médias
    Object.keys(modelStats).forEach(model => {
      const stats = modelStats[model];
      stats.averageLatency = stats.latencies.reduce((a: number, b: number) => a + b, 0) / stats.latencies.length;
      stats.successRate = records.filter(r => r.modelName === model && r.success).length / stats.requests * 100;
      delete stats.latencies;
    });

    return modelStats;
  }

  async generateReport(userId: string, format: string = 'json'): Promise<any> {
    const records = await AIUsageRecord.find({ userId }).sort({ timestamp: -1 }).limit(1000);
    
    const report = {
      userId,
      generatedAt: new Date(),
      totalRecords: records.length,
      summary: {
        totalRequests: records.length,
        totalTokens: records.reduce((sum, r) => sum + r.totalTokens, 0),
        totalCost: records.reduce((sum, r) => sum + r.cost, 0),
        averageLatency: records.reduce((sum, r) => sum + r.latency, 0) / records.length,
        successRate: records.filter(r => r.success).length / records.length * 100
      },
      byModel: this.groupByModel(records),
      byFeature: this.groupByFeature(records),
      timeline: this.generateTimeline(records)
    };

    return report;
  }

  convertToCSV(data: any): string {
    if (!data || !Array.isArray(data)) {
      return '';
    }

    const headers = Object.keys(data[0] || {});
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];

    return csvRows.join('\n');
  }

  async getOptimizationSuggestions(userId: string): Promise<any> {
    const records = await AIUsageRecord.find({ userId }).sort({ timestamp: -1 }).limit(500);
    
    const suggestions = [];
    const modelUsage = this.groupByModel(records);
    
    // Analisar uso por modelo
    Object.entries(modelUsage).forEach(([model, stats]: [string, any]) => {
      if (stats.averageLatency > 5000) {
        suggestions.push({
          type: 'performance',
          priority: 'high',
          message: `Modelo ${model} tem latência alta (${stats.averageLatency}ms). Considere usar um modelo mais rápido.`
        });
      }
      
      if (stats.successRate < 90) {
        suggestions.push({
          type: 'reliability',
          priority: 'medium',
          message: `Modelo ${model} tem taxa de sucesso baixa (${stats.successRate}%). Verifique configurações.`
        });
      }
    });

    // Analisar custos
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
    if (totalCost > 100) {
      suggestions.push({
        type: 'cost',
        priority: 'medium',
        message: `Custos altos detectados (R$${totalCost.toFixed(2)}). Considere otimizar prompts ou usar modelos mais econômicos.`
      });
    }

    return suggestions;
  }

  private getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case '1d': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private groupByModel(records: any[]): any {
    return records.reduce((acc, record) => {
      if (!acc[record.modelName]) {
        acc[record.modelName] = {
          requests: 0,
          totalTokens: 0,
          totalCost: 0,
          averageLatency: 0,
          successRate: 0
        };
      }
      
      const stats = acc[record.modelName];
      stats.requests += 1;
      stats.totalTokens += record.totalTokens;
      stats.totalCost += record.cost;
      
      return acc;
    }, {});
  }

  private groupByFeature(records: any[]): any {
    return records.reduce((acc, record) => {
      const feature = record.metadata?.feature || 'unknown';
      if (!acc[feature]) {
        acc[feature] = {
          requests: 0,
          totalTokens: 0,
          totalCost: 0
        };
      }
      
      acc[feature].requests += 1;
      acc[feature].totalTokens += record.totalTokens;
      acc[feature].totalCost += record.cost;
      
      return acc;
    }, {});
  }

  private generateTimeline(records: any[]): any {
    const timeline = records.reduce((acc, record) => {
      const date = record.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          requests: 0,
          tokens: 0,
          cost: 0
        };
      }
      
      acc[date].requests += 1;
      acc[date].tokens += record.totalTokens;
      acc[date].cost += record.cost;
      
      return acc;
    }, {});

    return Object.entries(timeline).map(([date, stats]) => ({
      date,
      ...(stats as any)
    }));
  }
}

export default AIUsageTrackingService;
