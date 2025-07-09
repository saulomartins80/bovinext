import { RpaController } from '../rpa/controllers/rpaController';
import Redis from 'ioredis';
import winston from 'winston';

interface ChatResponse {
  message: string;
  data?: any;
  processing?: boolean;
  estimatedTime?: number;
}

export class OptimizedChatbotService {
  private rpa: RpaController;
  private redis: Redis;
  private logger: winston.Logger;

  constructor() {
    this.rpa = new RpaController();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    });

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'optimized-chatbot' },
      transports: [
        new winston.transports.File({ filename: 'logs/chatbot.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  async processMessage(userMessage: string, userId: string): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // 1. Verificar cache (0.1s)
      const cacheKey = `chat:${userId}:${this.hashMessage(userMessage)}`;
      const cachedResponse = await this.redis.get(cacheKey);
      
      if (cachedResponse) {
        this.logger.info(`Cache hit for user ${userId}`);
        return JSON.parse(cachedResponse);
      }

      // 2. Análise rápida de intenção (0.5s)
      const intent = this.analyzeIntent(userMessage);
      
      // 3. Gerar resposta rápida (1s)
      const quickResponse = await this.generateQuickResponse(intent, userId);
      
      // 4. Processar em background se necessário
      if (intent.requiresBackground) {
        this.processInBackground(intent, userId);
        quickResponse.processing = true;
        quickResponse.estimatedTime = intent.estimatedTime;
      }

      // 5. Cache da resposta (0.1s)
      await this.redis.setex(cacheKey, 3600, JSON.stringify(quickResponse)); // 1 hora

      const totalTime = Date.now() - startTime;
      this.logger.info(`Chatbot response in ${totalTime}ms for user ${userId}`);

      return quickResponse;

    } catch (error) {
      this.logger.error('Erro no chatbot:', error);
      return {
        message: 'Desculpe, tive um problema técnico. Tente novamente em alguns segundos.',
        processing: false
      };
    }
  }

  private analyzeIntent(message: string) {
    const lowerMessage = message.toLowerCase();
    
    // Análise local rápida
    const intents = {
      'saldo': {
        type: 'BALANCE',
        requiresBackground: false,
        estimatedTime: 0
      },
      'gastos': {
        type: 'EXPENSES',
        requiresBackground: true,
        estimatedTime: 5
      },
      'receitas': {
        type: 'INCOME',
        requiresBackground: true,
        estimatedTime: 5
      },
      'investimentos': {
        type: 'INVESTMENTS',
        requiresBackground: true,
        estimatedTime: 8
      },
      'relatório': {
        type: 'REPORT',
        requiresBackground: true,
        estimatedTime: 10
      },
      'sincronizar': {
        type: 'SYNC_BANK',
        requiresBackground: true,
        estimatedTime: 15
      },
      'analisar': {
        type: 'ANALYZE',
        requiresBackground: true,
        estimatedTime: 12
      }
    };

    for (const [keyword, intent] of Object.entries(intents)) {
      if (lowerMessage.includes(keyword)) {
        return intent;
      }
    }

    return {
      type: 'GENERAL',
      requiresBackground: false,
      estimatedTime: 0
    };
  }

  private async generateQuickResponse(intent: any, userId: string): Promise<ChatResponse> {
    const responses = {
      'BALANCE': {
        message: 'Vou buscar seu saldo atual...',
        data: { action: 'get_balance', userId }
      },
      'EXPENSES': {
        message: 'Analisando seus gastos...',
        data: { action: 'analyze_expenses', userId }
      },
      'INCOME': {
        message: 'Calculando suas receitas...',
        data: { action: 'analyze_income', userId }
      },
      'INVESTMENTS': {
        message: 'Verificando seus investimentos...',
        data: { action: 'get_investments', userId }
      },
      'REPORT': {
        message: 'Gerando seu relatório financeiro...',
        data: { action: 'generate_report', userId }
      },
      'SYNC_BANK': {
        message: 'Iniciando sincronização bancária...',
        data: { action: 'sync_bank', userId }
      },
      'ANALYZE': {
        message: 'Analisando suas finanças...',
        data: { action: 'analyze_finances', userId }
      },
      'GENERAL': {
        message: 'Como posso te ajudar hoje? Você pode perguntar sobre saldo, gastos, receitas, investimentos ou relatórios.',
        data: { action: 'help' }
      }
    };

    return responses[intent.type] || responses['GENERAL'];
  }

  private async processInBackground(intent: any, userId: string) {
    try {
      // Processar em background sem bloquear resposta
      setImmediate(async () => {
        switch (intent.type) {
          case 'EXPENSES':
            await this.rpa.analyzeFinances({ params: { userId } } as any, {} as any);
            break;
          case 'INCOME':
            await this.rpa.analyzeFinances({ params: { userId } } as any, {} as any);
            break;
          case 'INVESTMENTS':
            // Processar investimentos
            break;
          case 'REPORT':
            await this.rpa.generateReport({ params: { userId } } as any, {} as any);
            break;
          case 'SYNC_BANK':
            // Sincronização bancária
            break;
          case 'ANALYZE':
            await this.rpa.analyzeFinances({ params: { userId } } as any, {} as any);
            break;
        }
        
        this.logger.info(`Background processing completed for user ${userId}, intent: ${intent.type}`);
      });
    } catch (error) {
      this.logger.error('Erro no processamento background:', error);
    }
  }

  private hashMessage(message: string): string {
    // Hash simples para cache
    return Buffer.from(message).toString('base64').slice(0, 20);
  }

  async getProcessingStatus(userId: string): Promise<any> {
    const status = await this.redis.get(`processing:${userId}`);
    return status ? JSON.parse(status) : null;
  }
} 