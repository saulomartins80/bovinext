import OpenAI from 'openai';
import { AppError } from '../core/errors/AppError';
import { ChatMessage } from '../types/chat';
import { EventEmitter } from 'events';
import ExternalAPIService from './ExternalAPIService';
import { createTransaction, createGoal, createInvestment } from '../controllers/automatedActionsController';
import { User } from '../models/User';
import { ITransacao } from '../models/Transacoes';
import { Goal } from '../models/Goal';
import { Investimento } from '../models/Investimento';

// ===== CONFIGURAÇÃO OTIMIZADA =====
const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
  timeout: 30000, // Aumentado para 30 segundos
});

// ===== SISTEMA DE CACHE INTELIGENTE =====
class IntelligentCache {
  private cache = new Map<string, any>();
  private accessCount = new Map<string, number>();
  private lastAccess = new Map<string, number>();
  private readonly MAX_SIZE = 100;
  private readonly TTL = 30 * 60 * 1000; // 30 minutos

  set(key: string, value: any): void {
    // Limpar cache se necessário
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictLeastUsed();
    }

    this.cache.set(key, value);
    this.accessCount.set(key, 1);
    this.lastAccess.set(key, Date.now());
  }

  get(key: string): any {
    const value = this.cache.get(key);
    if (!value) return null;

    // Verificar TTL
    const lastAccess = this.lastAccess.get(key) || 0;
    if (Date.now() - lastAccess > this.TTL) {
      this.delete(key);
      return null;
    }

    // Atualizar estatísticas
    this.accessCount.set(key, (this.accessCount.get(key) || 0) + 1);
    this.lastAccess.set(key, Date.now());
    
    return value;
  }

  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastCount = Infinity;

    for (const [key, count] of this.accessCount) {
      if (count < leastCount) {
        leastCount = count;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.delete(leastUsedKey);
    }
  }

  private delete(key: string): void {
    this.cache.delete(key);
    this.accessCount.delete(key);
    this.lastAccess.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessCount.clear();
    this.lastAccess.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      hitRate: this.calculateHitRate(),
      mostAccessed: this.getMostAccessed()
    };
  }

  private calculateHitRate(): number {
    const total = Array.from(this.accessCount.values()).reduce((a, b) => a + b, 0);
    return total > 0 ? (this.cache.size / total) * 100 : 0;
  }

  private getMostAccessed(): Array<{key: string, count: number}> {
    return Array.from(this.accessCount.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([key, count]) => ({ key: key.substring(0, 50), count }));
  }
}

// ===== SISTEMA DE DETECÇÃO DE INTENÇÕES RÁPIDO =====
class FastIntentDetector {
  private patterns = {
    create_goal: [
      /meta|objetivo|juntar|poupar|economizar/i,
      /quero.*juntar|preciso.*juntar|vamos.*juntar/i,
      /plano.*financeiro|planejamento/i,
      /natal|aniversário|viagem|casa|carro/i,
      /até.*\d+\/\d+|prazo.*\d+/i
    ],
    create_investment: [
      /invest[ir]|aplicar|render|cdb|tesouro|ações|selic/i,
      /bolsa|b3|corretora|rico|xp|btg/i,
      /rentabilidade|juros|dividendos/i,
      /registrar.*investimento|novo.*investimento/i,
      /tesouro.*selic|tesouro.*direto/i
    ],
    create_transaction: [
      /gast[ei]|comprei|paguei|despesa|receita|transação/i,
      /registr[ao].*transação|adicionar.*transação/i,
      /conta.*luz|conta.*água|conta.*gás/i,
      /supermercado|mercado|farmácia/i,
      /uber|99|taxi|gasolina|combustível/i
    ],
    create_card: [
      /cartão|cartao|card/i,
      /registrar.*cartão|adicionar.*cartão|novo.*cartão/i,
      /limite|anuidade|vencimento|fechamento/i,
      /visa|mastercard|elo|american.*express/i,
      /banco.*brasil|bradesco|itau|santander|nubank|inter/i
    ],
    analyze_data: [
      /analis[ae]|relatório|gráfico|dashboard/i,
      /como.*gast[oa]|onde.*gast[oa]/i,
      /resumo|balanço|situação.*financeira/i
    ],
    mileage: [
      /milhas|pontos|smiles|tudoazul|latam/i,
      /cartão.*crédito|programa.*fidelidade/i,
      /resgat[ae]|acumular.*pontos/i
    ],
    help: [
      /ajuda|help|como.*usar|não.*sei/i,
      /tutorial|explicar|ensinar/i,
      /o que.*posso|funcionalidades/i
    ],
    greeting: [
      /oi|olá|hey|bom.*dia|boa.*tarde|boa.*noite/i,
      /tudo.*bem|como.*vai|beleza/i
    ]
  };

  detect(message: string): { intent: string; confidence: number; entities: any } {
    const lowerMessage = message.toLowerCase();
    let bestMatch = { intent: 'UNKNOWN', confidence: 0.0, entities: {} };

    console.log(`[FastIntentDetector] 🔍 Analisando mensagem: "${message}"`);

    for (const [intent, patterns] of Object.entries(this.patterns)) {
      let matches = 0;
      const entities: any = {};

      console.log(`[FastIntentDetector] 🎯 Testando intent: ${intent}`);

      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          matches++;
          console.log(`[FastIntentDetector] ✅ Pattern match: ${pattern} para intent: ${intent}`);
        }
      }

      // Extrair entidades específicas para TRANSAÇÃO
      if (intent === 'create_transaction') {
        // Extrair valor
        const valueMatch = message.match(/(\d+(?:[.,]\d+)?)/);
        if (valueMatch) {
          entities.valor = parseFloat(valueMatch[1].replace(',', '.'));
          matches += 2;
        }
        
        // Extrair descrição
        let descricao = '';
        const pattern1 = message.match(/(?:comprei|gastei|paguei)\s+(?:um|uma|o|a)?\s*([^0-9,]+?)(?:\s+(?:de|por|no valor|hoje|ontem|na|no)\s*|$)/i);
        if (pattern1) {
          descricao = pattern1[1].trim();
        }
        
        const pattern2 = message.match(/([a-záêçõ]+)\s+(?:de|por)\s+(?:R\$)?\s*\d+/i);
        if (pattern2 && !descricao) {
          descricao = pattern2[1].trim();
        }
        
        const localMatch = message.match(/(?:na|no)\s+([^0-9,]+?)(?:\s|$)/i);
        if (localMatch) {
          entities.local = localMatch[1].trim();
        }
        
        entities.descricao = descricao || 'Despesa';
        
        // Detectar tipo baseado na mensagem
        if (lowerMessage.includes('recebi') || lowerMessage.includes('salário') || lowerMessage.includes('renda')) {
          entities.tipo = 'receita';
        } else if (lowerMessage.includes('transferi') || lowerMessage.includes('transferência')) {
          entities.tipo = 'transferencia';
        } else {
          entities.tipo = 'despesa';
        }
        
        entities.data = new Date().toISOString().split('T')[0];
        
        // Extrair categoria baseada nos formulários
        if (lowerMessage.includes('café') || lowerMessage.includes('padaria') || lowerMessage.includes('restaurante') || lowerMessage.includes('lanche') || lowerMessage.includes('açaí')) {
          entities.categoria = 'Alimentação';
        } else if (lowerMessage.includes('uber') || lowerMessage.includes('taxi') || lowerMessage.includes('gasolina') || lowerMessage.includes('combustível')) {
          entities.categoria = 'Transporte';
        } else if (lowerMessage.includes('supermercado') || lowerMessage.includes('mercado')) {
          entities.categoria = 'Alimentação';
        } else if (lowerMessage.includes('farmácia') || lowerMessage.includes('remédio') || lowerMessage.includes('medicamento')) {
          entities.categoria = 'Saúde';
        } else if (lowerMessage.includes('luz') || lowerMessage.includes('água') || lowerMessage.includes('energia') || lowerMessage.includes('conta')) {
          entities.categoria = 'Contas';
        } else if (lowerMessage.includes('shopping') || lowerMessage.includes('roupa') || lowerMessage.includes('compras')) {
          entities.categoria = 'Compras';
        } else {
          entities.categoria = 'Geral';
        }
        
        // Definir conta padrão
        entities.conta = 'Principal';
        
        // Detectar método de pagamento e parcelas
        if (lowerMessage.includes('crediário') || lowerMessage.includes('parcelado') || lowerMessage.includes('parcelas')) {
          // Extrair número de parcelas se mencionado
          const parcelasMatch = message.match(/(\d+)\s*(?:x|parcelas?|vezes?)/i);
          if (parcelasMatch) {
            entities.parcelas = parseInt(parcelasMatch[1]);
          } else {
            entities.parcelas = 1; // Padrão se não especificado
          }
          entities.metodo_pagamento = 'Cartão de Crédito';
        } else if (lowerMessage.includes('cartão') || lowerMessage.includes('cartao')) {
          entities.metodo_pagamento = 'Cartão de Crédito';
          entities.parcelas = 1;
        } else if (lowerMessage.includes('pix')) {
          entities.metodo_pagamento = 'PIX';
        } else if (lowerMessage.includes('dinheiro') || lowerMessage.includes('espécie')) {
          entities.metodo_pagamento = 'Dinheiro';
        } else {
          entities.metodo_pagamento = 'Outros';
        }
        
        // Extrair descrição mais específica baseada na categoria e contexto
        if (lowerMessage.includes('farmácia') || lowerMessage.includes('remédio') || lowerMessage.includes('medicamento')) {
          entities.descricao = 'Medicamento';
        } else if (lowerMessage.includes('açaí')) {
          entities.descricao = 'Açaí';
        } else if (lowerMessage.includes('café')) {
          entities.descricao = 'Café';
        } else if (lowerMessage.includes('uber')) {
          entities.descricao = 'Uber';
        } else if (lowerMessage.includes('gasolina') || lowerMessage.includes('combustível')) {
          entities.descricao = 'Combustível';
        } else {
          // Fallback: procurar por palavras relevantes
          const palavrasChave = lowerMessage.split(' ');
          const excludeWords = ['gastei', 'paguei', 'comprei', 'reais', 'valor', 'quero', 'registrar', 'despesa', 'uma', 'de', 'na', 'no', 'com', 'hoje'];
          
          for (const palavra of palavrasChave) {
            if (palavra.length > 3 && !excludeWords.includes(palavra) && !palavra.match(/\d/) && !palavra.includes('r$')) {
              entities.descricao = palavra.charAt(0).toUpperCase() + palavra.slice(1);
              break;
            }
          }
        }
        
        // Se não encontrou uma boa descrição, usar uma padrão baseada na categoria
        if (!entities.descricao || entities.descricao === 'Quero') {
          entities.descricao = entities.categoria || 'Despesa';
        }
      }

      // 🔧 CORREÇÃO: Extrair entidades para META baseado no schema exato
      if (intent === 'create_goal') {
        // Schema Meta: meta, descricao, valor_total, valor_atual, data_conclusao, userId, categoria?, prioridade?
        
        const valuePatterns = [
          /meta.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /objetivo.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /juntar.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /poupar.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /(\d+(?:[.,]\d{1,2})?)\s*reais?/i
        ];
        
        for (const pattern of valuePatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.valor_total = parseFloat(match[1].replace(',', '.'));
            break;
          }
        }
        
        // Extrair nome da meta (campo obrigatório) - corresponde ao campo "Nome da Meta" do formulário
        const metaPatterns = [
          /meta.*?(?:de|para)\s+([^0-9r$]+?)(?:\s+(?:de|no valor)|$)/i,
          /juntar.*?para\s+([^0-9r$]+?)(?:\s+(?:de|no valor)|$)/i,
          /poupar.*?para\s+([^0-9r$]+?)(?:\s+(?:de|no valor)|$)/i,
          /objetivo.*?(?:de|para)\s+([^0-9r$]+?)(?:\s+(?:de|no valor)|$)/i,
          /(natal|viagem|casa|carro|emergência|reserva)/i
        ];
        
        for (const pattern of metaPatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.meta = match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1);
            break;
          }
        }
        
        // Extrair descrição (campo obrigatório)
        entities.descricao = entities.meta || 'Meta financeira';
        
        // Extrair prazo para data_conclusao (campo obrigatório)
        const prazoPatterns = [
          /(\d+)\s*meses?/i,
          /(\d+)\s*anos?/i,
          /até.*?(\d{1,2})\/(\d{1,2})/i,
          /dezembro|natal/i
        ];
        
        for (const pattern of prazoPatterns) {
          const match = message.match(pattern);
          if (match) {
            if (pattern.source.includes('meses')) {
              const months = parseInt(match[1]);
              const targetDate = new Date();
              targetDate.setMonth(targetDate.getMonth() + months);
              entities.data_conclusao = targetDate.toISOString().split('T')[0];
            } else if (pattern.source.includes('anos')) {
              const years = parseInt(match[1]);
              const targetDate = new Date();
              targetDate.setFullYear(targetDate.getFullYear() + years);
              entities.data_conclusao = targetDate.toISOString().split('T')[0];
            } else if (pattern.source.includes('dezembro|natal')) {
              const currentYear = new Date().getFullYear();
              entities.data_conclusao = `${currentYear}-12-25`;
            }
            break;
          }
        }
        
        // Campos obrigatórios com valores padrão (baseado no formulário)
        if (!entities.meta) entities.meta = 'Meta financeira'; // Nome da Meta*
        if (!entities.descricao) entities.descricao = entities.meta; // Descrição*
        if (!entities.valor_total) entities.valor_total = 0; // Valor Total (R$)*
        if (!entities.data_conclusao) {
          const targetDate = new Date();
          targetDate.setFullYear(targetDate.getFullYear() + 1);
          entities.data_conclusao = targetDate.toISOString().split('T')[0]; // Data Limite*
        }
        
        // Campos obrigatórios fixos
        entities.valor_atual = 0; // Valor Atual (R$)*
        
        // Campos opcionais do formulário
        entities.prioridade = 'media'; // Prioridade* (Alta/Média/Baixa)
        entities.categoria = 'Economia'; // Categoria (opcional)
      }

      // 🔧 CORREÇÃO: Extrair entidades para INVESTIMENTO baseado no schema exato
      if (intent === 'create_investment') {
        // Schema Investimento: nome, tipo, valor, data, meta?, instituicao?, rentabilidade?, vencimento?, liquidez?, risco?, categoria?
        const valuePatterns = [
          /invest.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /aplicar.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /(\d+(?:[.,]\d{1,2})?)\s*reais?/i
        ];
        
        for (const pattern of valuePatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.valor = parseFloat(match[1].replace(',', '.'));
            break;
          }
        }
        
        // Detectar tipo de investimento (campo obrigatório)
        if (lowerMessage.includes('cdb') || lowerMessage.includes('banco')) {
          entities.tipo = 'CDB';
        } else if (lowerMessage.includes('tesouro') || lowerMessage.includes('selic') || lowerMessage.includes('ipca')) {
          entities.tipo = 'Tesouro Direto';
        } else if (lowerMessage.includes('ações') || lowerMessage.includes('acoes') || lowerMessage.includes('bolsa')) {
          entities.tipo = 'Ações';
        } else if (lowerMessage.includes('fii') || lowerMessage.includes('fundos imobiliários')) {
          entities.tipo = 'Fundos Imobiliários';
        } else if (lowerMessage.includes('lci')) {
          entities.tipo = 'LCI';
        } else if (lowerMessage.includes('lca')) {
          entities.tipo = 'LCA';
        } else if (lowerMessage.includes('poupança')) {
          entities.tipo = 'Poupança';
        } else {
          entities.tipo = 'Renda Fixa';
        }
        
        // Extrair nome do investimento (campo obrigatório)
        if (entities.tipo === 'Tesouro Direto') {
          if (lowerMessage.includes('selic')) {
            entities.nome = 'Tesouro Selic';
          } else if (lowerMessage.includes('ipca')) {
            entities.nome = 'Tesouro IPCA+';
          } else {
            entities.nome = 'Tesouro Direto';
          }
        } else {
          entities.nome = entities.tipo;
        }
        
        // Extrair instituição (campo opcional)
        const instituicaoPatterns = [
          /(?:na|no|pela|pelo)\s+(nubank|inter|itau|bradesco|santander|bb|caixa|xp|rico|clear|easynvest|modal)/i,
          /corretora\s+([a-z]+)/i
        ];
        
        for (const pattern of instituicaoPatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.instituicao = match[1].charAt(0).toUpperCase() + match[1].slice(1);
            break;
          }
        }
        
        // Campos obrigatórios
        entities.data = new Date().toISOString().split('T')[0];
        
        // Campos opcionais com valores padrão
        entities.categoria = 'Investimentos';
        entities.risco = entities.tipo === 'Tesouro Direto' ? 'Baixo' : 'Médio';
        entities.liquidez = entities.tipo === 'Tesouro Direto' ? 'D+1' : 'D+0';
      }

      // 🔧 CORREÇÃO: Extrair entidades para CARTÃO baseado no schema exato
      if (intent === 'create_card') {
        // Schema Card: name, bank, program, number, limit, used, dueDate, closingDate, pointsPerReal, annualFee, benefits[], status, color, category
        
        // Extrair nome do cartão (campo obrigatório)
        const nomePatterns = [
          /cartão\s+([a-zA-Z\s]+?)(?:\s+do|da|$)/i,
          /card\s+([a-zA-Z\s]+?)(?:\s+do|da|$)/i,
          /(platinum|gold|black|infinite|standard|básico)/i
        ];
        
        for (const pattern of nomePatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.name = match[1].trim().charAt(0).toUpperCase() + match[1].trim().slice(1);
            break;
          }
        }
        
        // Extrair banco (campo obrigatório)
        const bancoPatterns = [
          /(nubank|inter|bradesco|itau|santander|banco.*brasil|bb|caixa|xp|c6)/i,
          /do\s+(nubank|inter|bradesco|itau|santander|bb|caixa)/i
        ];
        
        for (const pattern of bancoPatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.bank = match[1].charAt(0).toUpperCase() + match[1].slice(1);
            break;
          }
        }
        
        // Extrair limite se mencionado
        const limitePatterns = [
          /limite.*?r\$\s*(\d+(?:[.,]\d{1,2})?)/i,
          /r\$\s*(\d+(?:[.,]\d{1,2})?)\s*de.*limite/i
        ];
        
        for (const pattern of limitePatterns) {
          const match = message.match(pattern);
          if (match) {
            entities.limit = parseFloat(match[1].replace(',', '.'));
            break;
          }
        }
        
        // Extrair últimos 4 dígitos se mencionados
        const numeroPattern = /(\d{4})$/;
        const numeroMatch = message.match(numeroPattern);
        if (numeroMatch) {
          entities.number = numeroMatch[1];
        }
        
        // Campos obrigatórios com valores padrão (baseado no formulário)
        if (!entities.name) entities.name = 'Cartão de Crédito'; // Nome do Cartão*
        if (!entities.bank) entities.bank = 'Banco'; // Banco/Instituição*
        if (!entities.limit) entities.limit = 1000; // Limite (R$)*
        if (!entities.number) entities.number = '0000'; // Últimos 4 dígitos*
        
        // Campos obrigatórios fixos do formulário
        entities.program = entities.bank + ' Rewards'; // Programa*
        entities.used = 0; // Usado (sempre 0 inicialmente)
        entities.dueDate = 10; // Vencimento (dia)*
        entities.closingDate = 5; // Fechamento (dia)*
        entities.pointsPerReal = 1; // Pontos por real
        entities.annualFee = 0; // Anuidade (R$)*
        entities.benefits = []; // Benefícios
        entities.status = 'active'; // Status
        entities.color = '#3B82F6'; // Cor
        entities.category = 'standard'; // Categoria
      }

      // Calcular confiança de forma mais inteligente
      let confidence = 0;
      
      if (intent === 'create_goal') {
        // Prioridade ALTA para metas - detectar primeiro
        confidence = matches >= 1 ? 0.9 : 0;
        if (entities.valor_total && entities.valor_total > 0) {
          confidence = Math.min(confidence + 0.1, 1.0);
        }
        // Boost adicional para palavras-chave específicas
        if (lowerMessage.includes('meta') || lowerMessage.includes('juntar') || lowerMessage.includes('natal')) {
          confidence = Math.min(confidence + 0.1, 1.0);
        }
      } else if (intent === 'create_transaction') {
        confidence = matches >= 1 ? 0.6 : 0;
        // Boost se encontrou valor E palavra de transação específica
        if (entities.valor && entities.valor > 0 && (lowerMessage.includes('gastei') || lowerMessage.includes('paguei') || lowerMessage.includes('comprei'))) {
          confidence = Math.min(confidence + 0.2, 1.0);
        }
      } else if (intent === 'create_investment') {
        confidence = matches >= 1 ? 0.7 : 0;
        if (entities.valor && entities.valor > 0) {
          confidence = Math.min(confidence + 0.2, 1.0);
        }
      } else if (intent === 'create_card') {
        confidence = matches >= 1 ? 0.8 : 0;
        if (entities.banco || entities.nome) {
          confidence = Math.min(confidence + 0.1, 1.0);
        }
      } else {
        // Para outros intents, usar cálculo original
        confidence = matches / patterns.length;
      }
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent, confidence, entities };
      }
    }

    return bestMatch;
  }

  private inferCategory(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('café') || lowerMessage.includes('padaria') || lowerMessage.includes('restaurante') || lowerMessage.includes('lanche')) {
      return 'Alimentação';
    } else if (lowerMessage.includes('uber') || lowerMessage.includes('taxi') || lowerMessage.includes('gasolina')) {
      return 'Transporte';
    } else if (lowerMessage.includes('farmácia') || lowerMessage.includes('remédio')) {
      return 'Saúde';
    } else if (lowerMessage.includes('supermercado') || lowerMessage.includes('mercado')) {
      return 'Alimentação';
    }
    
    return 'Geral';
  }
}

// ===== SISTEMA DE STREAMING INTELIGENTE =====
class StreamingResponse extends EventEmitter {
  private buffer = '';
  private isComplete = false;

  async streamResponse(prompt: string, onChunk: (chunk: string) => void): Promise<string> {
    try {
      const stream = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          onChunk(content);
          this.emit('chunk', content);
        }
      }

      this.isComplete = true;
      this.emit('complete', fullResponse);
      return fullResponse;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }
}

// ===== SISTEMA DE CONTEXTO OTIMIZADO =====
class OptimizedContext {
  // Cache de contexto por usuário
  private userContexts = new Map<string, any>();
  private externalAPI = new ExternalAPIService();

  // Buscar dados do usuário no banco de dados
  async getUserFinancialData(userId: string): Promise<any> {
    try {
      const { Goal } = await import('../models/Goal');
      const { Transacoes } = await import('../models/Transacoes');
      const { Investimento } = await import('../models/Investimento');

      // Buscar dados em paralelo
      const [goals, transactions, investments] = await Promise.all([
        Goal.find({ userId }).sort({ createdAt: -1 }).limit(5),
        Transacoes.find({ userId }).sort({ data: -1 }).limit(10),
        Investimento.find({ userId }).sort({ data: -1 }).limit(5)
      ]);

      // Calcular estatísticas básicas
      const totalTransactions = transactions.length;
      const totalGoals = goals.length;
      const totalInvestments = investments.reduce((sum, inv) => sum + inv.valor, 0);
      const monthlyExpenses = transactions
        .filter(t => t.tipo === 'despesa' && new Date(t.data).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.valor, 0);

      return {
        goals,
        transactions,
        investments,
        stats: {
          totalTransactions,
          totalGoals,
          totalInvestments,
          monthlyExpenses,
          hasData: totalTransactions > 0 || totalGoals > 0 || investments.length > 0
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados financeiros do usuário:', error);
      return {
        goals: [],
        transactions: [],
        investments: [],
        stats: { totalTransactions: 0, totalGoals: 0, totalInvestments: 0, monthlyExpenses: 0, hasData: false }
      };
    }
  }

  // Enriquecer resposta com dados financeiros em tempo real
  private async enrichResponseWithMarketData(message: string, response: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    let enrichedResponse = response;

    try {
      // Detectar menções a ações específicas
      const stockSymbols = ['petr4', 'vale3', 'itub4', 'bbdc4', 'abev3', 'wege3'];
      const mentionedStocks = stockSymbols.filter(symbol => 
        lowerMessage.includes(symbol) || lowerMessage.includes(symbol.replace(/\d/, ''))
      );

      if (mentionedStocks.length > 0) {
        const quotes = await Promise.all(
          mentionedStocks.map(symbol => this.externalAPI.getStockQuote(symbol))
        );
        
        const validQuotes = quotes.filter(q => q !== null);
        if (validQuotes.length > 0) {
          enrichedResponse += '\n\n📊 **Cotações atuais:**\n';
          validQuotes.forEach(quote => {
            const changeIcon = quote!.change >= 0 ? '📈' : '📉';
            enrichedResponse += `${changeIcon} ${quote!.symbol}: R$ ${quote!.price.toFixed(2)} (${quote!.changePercent.toFixed(2)}%)\n`;
          });
        }
      }

      // Detectar menções a moedas
      if (lowerMessage.includes('dólar') || lowerMessage.includes('usd')) {
        const usdRate = await this.externalAPI.getCurrencyRate('USD', 'BRL');
        if (usdRate) {
          enrichedResponse += `\n\n💱 **Dólar hoje:** R$ ${usdRate.rate.toFixed(2)}`;
        }
      }

      if (lowerMessage.includes('euro') || lowerMessage.includes('eur')) {
        const eurRate = await this.externalAPI.getCurrencyRate('EUR', 'BRL');
        if (eurRate) {
          enrichedResponse += `\n\n💱 **Euro hoje:** R$ ${eurRate.rate.toFixed(2)}`;
        }
      }

      // Detectar menções a criptomoedas
      if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
        const btcPrice = await this.externalAPI.getCryptoPrice('bitcoin');
        if (btcPrice) {
          const changeIcon = btcPrice.change24h >= 0 ? '📈' : '📉';
          enrichedResponse += `\n\n₿ **Bitcoin:** R$ ${btcPrice.price.toLocaleString('pt-BR')} ${changeIcon} ${btcPrice.change24h.toFixed(2)}%`;
        }
      }

      // Detectar menções a programas de milhas
      if (lowerMessage.includes('milhas') || lowerMessage.includes('pontos')) {
        const programs = await this.externalAPI.getMileagePrograms();
        if (programs.length > 0) {
          enrichedResponse += '\n\n✈️ **Programas de Milhas:**\n';
          programs.slice(0, 2).forEach(program => {
            const bestRedemption = program.bestRedemptions[0];
            enrichedResponse += `• ${program.program}: ${bestRedemption.points.toLocaleString()} pts = R$ ${bestRedemption.value}\n`;
          });
        }
      }

      // Detectar menções ao Tesouro Direto
      if (lowerMessage.includes('tesouro') || lowerMessage.includes('selic')) {
        const treasuryRates = await this.externalAPI.getTreasuryRates();
        if (treasuryRates.length > 0) {
          enrichedResponse += '\n\n🏛️ **Tesouro Direto:**\n';
          treasuryRates.slice(0, 2).forEach(rate => {
            enrichedResponse += `• ${rate.titulo}: ${rate.taxa}% a.a.\n`;
          });
        }
      }

    } catch (error) {
      console.error('Erro ao enriquecer resposta com dados de mercado:', error);
      // Continua sem os dados externos se houver erro
    }

    return enrichedResponse;
  }

  updateContext(userId: string, message: string, response: string): void {
    const existing = this.userContexts.get(userId) || {
      recentTopics: [],
      preferences: { style: 'balanced' },
      lastInteraction: Date.now(),
      messageCount: 0
    };

    existing.recentTopics.unshift(this.extractTopic(message));
    existing.recentTopics = existing.recentTopics.slice(0, 5); // Manter apenas 5 tópicos recentes
    existing.lastInteraction = Date.now();
    existing.messageCount++;

    this.userContexts.set(userId, existing);
  }

  getContext(userId: string): any {
    return this.userContexts.get(userId) || {
      recentTopics: [],
      preferences: { style: 'balanced' },
      lastInteraction: Date.now(),
      messageCount: 0
    };
  }

  private extractTopic(message: string): string {
    const topics = {
      'investimento': /invest|aplicar|render|cdb|tesouro/i,
      'gastos': /gast|compra|despesa|pagar/i,
      'metas': /meta|objetivo|poupar|juntar/i,
      'milhas': /milhas|pontos|cartão/i,
      'análise': /analis|relatório|gráfico/i
    };

    for (const [topic, pattern] of Object.entries(topics)) {
      if (pattern.test(message)) {
        return topic;
      }
    }

    return 'geral';
  }
}

// ===== CLASSE PRINCIPAL OTIMIZADA =====
export class OptimizedAIService {
  private cache = new IntelligentCache();
  private intentDetector = new FastIntentDetector();
  private contextManager = new OptimizedContext();
  private responseCount = 0;
  private externalAPI = new ExternalAPIService();

  // Sistema de prompts (inicializado no construtor)
  private SYSTEM_PROMPTS = {
    FINN_CORE: `Você é Finn, o assistente financeiro pessoal da Finnextho. Seja natural, amigável e direto.

Suas principais funções:
- Registrar transações, metas e investimentos
- Analisar gastos e dar insights financeiros
- Responder dúvidas sobre finanças pessoais
- Ajudar com planejamento financeiro

Sempre seja:
✅ Conciso e objetivo
✅ Amigável mas profissional
✅ Focado em soluções práticas
✅ Proativo em sugerir ações

❌ Não seja verboso ou repetitivo
❌ Não mencione limitações técnicas
❌ Não peça desculpas desnecessárias
❌ Não mencione datas a menos que o usuário pergunte especificamente`
  }

  constructor() {
    this.SYSTEM_PROMPTS = {
      FINN_CORE: this.getSystemPrompt() // Usa o novo prompt
    };
  }

  // Prompts otimizados e mais diretos
  private getSystemPrompt(): string {
    const now = new Date();
    const currentMonth = now.toLocaleDateString('pt-BR', { month: 'long' });
    const currentYear = now.getFullYear();
    const currentDate = now.toLocaleDateString('pt-BR');

    return `Você é Finn, o assistente financeiro da Finnextho. Hoje é ${currentDate}.

    CAPACIDADES PRINCIPAIS:
    - Análise de gastos e receitas
    - Planejamento financeiro e orçamento
    - Consultoria em investimentos
    - Gestão de cartões de crédito
    - Acompanhamento de metas financeiras
- Otimização de programas de milhas
    - Educação financeira

    PERSONALIDADE:
    - Profissional mas amigável
    - Didático e paciente
    - Proativo em sugestões
    - Focado em resultados práticos

DIRETRIZES:
- Mantenha MEMÓRIA COMPLETA da conversa desde o início
    - Use linguagem clara e acessível
- Seja proativo em identificar oportunidades
    - Confirme ações importantes (transações > R$1000)
    
Responda sempre em português brasileiro de forma clara e objetiva.`;
  }

  private prompts = {
    AUTOMATION: `Analise a mensagem e determine se é uma solicitação de automação. Responda em JSON:
{
  "intent": "CREATE_TRANSACTION|CREATE_GOAL|CREATE_INVESTMENT|ANALYZE_DATA|HELP|GREETING|UNKNOWN",
  "confidence": 0.0-1.0,
  "requiresConfirmation": boolean,
  "entities": {},
  "response": "resposta amigável"
}`
  };

  async generateResponse(
    userId: string,
    message: string,
    conversationHistory: ChatMessage[] = [],
    userContext?: any
  ): Promise<{
    text: string;
    intent?: string;
    confidence?: number;
    requiresConfirmation?: boolean;
    entities?: any;
    responseTime: number;
    cached?: boolean;
    actionData?: any;
  }> {
    const startTime = Date.now();
    
    try {
      // 1. Verificar cache primeiro (inclui "impressão" do histórico recente para evitar respostas fora de contexto)
      const historyKey = (conversationHistory || [])
        .slice(-3)
        .map(m => (typeof m.content === 'string' ? m.content : ''))
        .join('|')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .substring(0, 120);
      const cacheKey = this.getCacheKey(userId, message, historyKey);
      const cached = this.cache.get(cacheKey);
      // Temporariamente desabilitar cache para debug de intent detection
      if (false && cached) {
        console.log(`[AI] Cache hit for key: ${cacheKey.substring(0, 50)}...`);
        return { ...cached, cached: true };
      }

      // 2. Deixar a IA processar tudo diretamente - SEM detecção de intenção
      console.log(`🤖 Processando mensagem com IA: "${message}"`);
      
      // 3. Atualizar contexto
      this.contextManager.updateContext(userId, message, '');

      // 4. Gerar resposta diretamente com IA - SEM automação complexa
      const context = await this.buildContextPrompt(conversationHistory, userContext);
      const prompt = `${this.SYSTEM_PROMPTS.FINN_CORE}

IMPORTANTE: Se o usuário está pedindo para criar/registrar algo (transação, meta, investimento), você deve:
1. Responder de forma amigável
2. Se tiver todos os dados necessários, perguntar "Posso confirmar e registrar isso para você?"
3. Se faltar dados, perguntar pelos dados faltantes de forma natural

Contexto: ${context}
Usuário: ${message}
Finn:`;

      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500, // Aumentado para memória completa
      });

      const response = completion.choices[0]?.message?.content || 'Como posso te ajudar?';

      // 🔧 CORREÇÃO: Detectar intenção PRIMEIRO, depois verificar se precisa confirmação
      const intentResult = this.intentDetector.detect(message);
      console.log(`[AI] Intent detectado: ${intentResult.intent}, confiança: ${intentResult.confidence}`);
      
      // Só requer confirmação se:
      // 1. Tem intent válido com confiança alta
      // 2. É uma ação que modifica dados (não conversas normais)
      // 3. Tem dados suficientes para executar
      const validActionIntents = ['create_investment', 'create_goal', 'create_transaction', 'create_card'];
      const requiresConfirmation = validActionIntents.includes(intentResult.intent) && 
                                   intentResult.confidence > 0.6 &&
                                   intentResult.entities && 
                                   Object.keys(intentResult.entities).length > 0;
      
      console.log(`[AI] Requer confirmação: ${requiresConfirmation}`);
      
      let actionData = null;
      if (requiresConfirmation) {
        if (intentResult.intent === 'create_goal') {
          actionData = {
            type: 'create_goal',
            entities: intentResult.entities,
            userId,
            confirmationButtons: [
              { text: 'Confirmar', action: 'confirm', style: 'primary' },
              { text: 'Cancelar', action: 'cancel', style: 'secondary' }
            ]
          };
        } else if (intentResult.intent === 'create_transaction') {
          actionData = {
            type: 'create_transaction',
            entities: intentResult.entities,
            userId,
            confirmationButtons: [
              { text: 'Confirmar', action: 'confirm', style: 'primary' },
              { text: 'Cancelar', action: 'cancel', style: 'secondary' }
            ]
          };
        } else if (intentResult.intent === 'create_investment') {
          actionData = {
            type: 'create_investment',
            entities: intentResult.entities,
            userId,
            confirmationButtons: [
              { text: 'Confirmar', action: 'confirm', style: 'primary' },
              { text: 'Cancelar', action: 'cancel', style: 'secondary' }
            ]
          };
        } else if (intentResult.intent === 'create_card') {
          actionData = {
            type: 'create_card',
            entities: intentResult.entities,
            userId,
            confirmationButtons: [
              { text: 'Confirmar', action: 'confirm', style: 'primary' },
              { text: 'Cancelar', action: 'cancel', style: 'secondary' }
            ]
          };
        }
      }

      // 5. Pós-processamento
      const finalResponse = this.postProcessResponse(response, userContext);

      // Log final do processamento
      console.log(`[AI] Processamento concluído:`, {
        requiresConfirmation: requiresConfirmation,
        actionData: actionData,
        message: message.substring(0, 100) + '...'
      });

      // 6. Salvar no cache
      const result = {
        text: finalResponse,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        entities: intentResult.entities,
        requiresConfirmation,
        actionData,
        responseTime: Date.now() - startTime
      };

      this.cache.set(cacheKey, result);
      this.responseCount++;

      return result;

    } catch (error) {
      console.error('[OptimizedAI] Error generating response:', error);
      return {
        text: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
        responseTime: Date.now() - startTime,
        confidence: 0.0,
        actionData: null
      };
    }
  }

  async streamResponse(
    userId: string,
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const streamer = new StreamingResponse();
    const prompt = this.buildStreamPrompt(message, userId);
    
    return streamer.streamResponse(prompt, onChunk);
  }

  private async generateAutomatedResponse(
    intentResult: any,
    message: string,
    userContext?: any
  ): Promise<{ response: string; requiresConfirmation?: boolean; actionData?: any }> {
    // Verificar se requer confirmação
    const requiresConfirmation = this.shouldRequireConfirmation(intentResult);
    
    // Remover execução automática - sempre pedir confirmação para melhor UX
    console.log('🔍 Intent detectado:', intentResult.intent, 'Confiança:', intentResult.confidence, 'Requer confirmação:', requiresConfirmation);

    // Verificar se deve pedir confirmação
    if (requiresConfirmation && intentResult.confidence > 0.3 && userContext?.userId) {
      const actionData = {
        type: intentResult.intent,
        entities: intentResult.entities,
        userId: userContext.userId
      };

      let confirmationMessage = '';
      
      switch (intentResult.intent) {
        case 'create_transaction':
          if (intentResult.entities.valor && intentResult.entities.valor > 0) {
            confirmationMessage = `💰 Detectei uma transação de R$ ${intentResult.entities.valor.toFixed(2)} em ${intentResult.entities.categoria || 'Geral'}. Confirmar?`;
          } else {
            // MESMO SEM VALOR, AINDA DEVE PEDIR CONFIRMAÇÃO PARA COLETA DE DADOS
            confirmationMessage = `💰 Vou te ajudar a registrar uma transação. Qual foi o valor?`;
          }
          break;
        case 'create_goal':
          if (intentResult.entities.valor_total || intentResult.entities.valor) {
            confirmationMessage = `🎯 Vou criar uma meta de R$ ${(intentResult.entities.valor_total || intentResult.entities.valor).toFixed(2)}. Confirmar?`;
          } else {
            confirmationMessage = `🎯 Para criar a meta, preciso do valor total. Qual é o valor da meta?`;
          }
          break;
        case 'create_investment':
          if (intentResult.entities.valor && intentResult.entities.valor > 0) {
            confirmationMessage = `📈 Registrar investimento de R$ ${intentResult.entities.valor.toFixed(2)}. Confirmar?`;
          } else {
            confirmationMessage = `📈 Para registrar o investimento, preciso do valor. Qual foi o valor investido?`;
          }
          break;
        case 'create_card':
          if (intentResult.entities.limite && intentResult.entities.limite > 0) {
            confirmationMessage = `💳 Criar cartão ${intentResult.entities.banco || 'Novo'} com limite de R$ ${intentResult.entities.limite}. Confirmar?`;
          } else {
            confirmationMessage = `💳 Para criar o cartão, preciso do limite. Qual é o limite do cartão?`;
          }
          break;
        default:
          confirmationMessage = `Encontrei uma ${intentResult.intent.toLowerCase().replace('create_', '')}. Posso criar para você?`;
      }

      return {
        response: confirmationMessage,
        requiresConfirmation: true,
        actionData
      };
    }

    // Gerar resposta de fallback baseada na confiança
    const fallbackResponse = await this.generateFallbackResponse(message, intentResult);
    return { response: fallbackResponse };
  }

  private async executeAction(intent: string, entities: any, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { createTransaction, createGoal, createInvestment } = require('../controllers/automatedActionsController');
      
      switch (intent) {
        case 'CREATE_TRANSACTION':
          if (!entities.valor || entities.valor <= 0) {
            return { success: false, message: 'Valor inválido para transação' };
          }
          
          const transactionData = {
            valor: entities.valor,
            descricao: entities.descricao || 'Transação',
            categoria: entities.categoria || 'Geral',
            tipo: entities.tipo || 'despesa',
            conta: entities.conta || 'Principal',
            data: entities.data || new Date().toISOString().split('T')[0]
          };
          
          console.log('📝 Criando transação:', transactionData);
          const transactionResult = await createTransaction(userId, transactionData);
          
          if (transactionResult) {
            return {
              success: true,
              message: `✅ Transação registrada! R$ ${entities.valor.toFixed(2)} em ${entities.categoria}`
            };
          }
          return { success: false, message: 'Erro ao registrar transação' };
        
        case 'CREATE_GOAL':
          const goalData = {
            meta: entities.meta || 'Meta',
            valor_total: entities.valor_total || entities.valor,
            data_conclusao: entities.data_conclusao || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            categoria: entities.categoria || 'Pessoal'
          };
          
          const goalResult = await createGoal(userId, goalData);
          return {
            success: !!goalResult,
            message: goalResult ? '🎯 Meta criada com sucesso!' : 'Erro ao criar meta'
          };
          
        case 'CREATE_INVESTMENT':
          const investmentData = {
            nome: entities.nome || 'Investimento',
            tipo: entities.tipo || 'Renda Fixa',
            valor: entities.valor,
            data: entities.data || new Date().toISOString().split('T')[0],
            instituicao: entities.instituicao || 'Não informado'
          };
          
          const investmentResult = await createInvestment(userId, investmentData);
          return {
            success: !!investmentResult,
            message: investmentResult ? '📈 Investimento registrado!' : 'Erro ao registrar investimento'
          };
          
        default:
          return { success: false, message: 'Ação não reconhecida' };
      }
    } catch (error) {
      console.error('❌ Erro na executeAction:', error);
      return { success: false, message: 'Erro interno ao executar ação' };
    }
  }

  private async generateFallbackResponse(message: string, intentResult: any): Promise<string> {
    if (intentResult.confidence > 0.3) {
      return `Entendi que você quer ${intentResult.intent.toLowerCase().replace('create_', 'criar ')}, mas preciso de mais informações. Pode me dar mais detalhes?`;
    }
    
    return 'Como posso te ajudar com suas finanças hoje?';
  }

  // Consultar registros existentes para dar contexto à IA
  private async getExistingRecords(userId: string): Promise<{ transactions: any[], goals: any[], investments: any[] }> {
    try {
      const user = await require('../models/User').default.findOne({ firebaseUid: userId });
      if (!user) {
        console.warn('[OptimizedAI] User not found for context:', userId);
        return { transactions: [], goals: [], investments: [] };
      }

      const [transactions, goals, investments] = await Promise.all([
        require('../models/Transacoes').default.find({ userId: user._id }).limit(10).sort({ createdAt: -1 }),
        Goal.find({ userId: user._id }).limit(5).sort({ createdAt: -1 }),
        Investimento.find({ userId: user._id }).limit(5).sort({ createdAt: -1 })
      ]);

      return {
        transactions: transactions || [],
        goals: goals || [],
        investments: investments || []
      };
    } catch (error) {
      console.error('❌ Erro ao buscar registros existentes:', error);
      return { transactions: [], goals: [], investments: [] };
    }
  }


  private async generateConversationalResponse(
    message: string,
    conversationHistory: ChatMessage[],
    userContext?: any
  ): Promise<string> {
    const context = await this.buildContextPrompt(conversationHistory, userContext);
    const prompt = `${this.SYSTEM_PROMPTS.FINN_CORE}\n\nContexto: ${context}\n\nUsuário: ${message}\n\nFinn:`;

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });

    return completion.choices[0]?.message?.content || 'Como posso te ajudar?';
  }

  private shouldRequireConfirmation(intentResult: any): boolean {
    // Sempre pedir confirmação para criar registros - facilita UX
    if (intentResult.intent === 'create_transaction') {
      return true;
    }
    
    if (intentResult.intent === 'create_goal') {
      return true;
    }
    
    if (intentResult.intent === 'create_investment' && intentResult.entities.valor > 0) {
      return true;
    }
    
    if (intentResult.intent === 'create_card') {
      return true;
    }

    return false;
  }

  private getPersonalizedGreeting(userContext?: any): string {
    const greetings = [
      'Oi! Como posso te ajudar hoje?',
      'Olá! Pronto para cuidar das suas finanças?',
      'Hey! O que vamos fazer hoje?',
      'Oi! Como estão suas finanças?'
    ];

    if (userContext?.messageCount > 10) {
      greetings.push('E aí! Bom te ver de novo!');
    }

    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private async buildContextPrompt(conversationHistory: ChatMessage[], userContext?: any): Promise<string> {
    let context = '';
    
    if (userContext?.userId) {
      context += `[CONTEXTO INTERNO]\n`;
      context += `Usuário: ${userContext.nome || 'Usuário'}\n`;
      
      try {
        const records = await this.getExistingRecords(userContext.userId);
        context += `Transações: ${records.transactions.length}\n`;
        context += `Metas: ${records.goals.length}\n`;
        context += `Investimentos: ${records.investments.length}\n`;
      } catch (error) {
        console.error('Erro ao buscar contexto:', error);
      }
      
      context += `[FIM CONTEXTO]\n\n`;
    }
    
    if (conversationHistory.length > 0) {
      context += 'HISTÓRICO COMPLETO DA CONVERSA:\n';
      // TODAS as mensagens com timestamp
      conversationHistory.forEach((msg) => {
        const role = msg.sender === 'user' ? 'Usuário' : 'Finn';
        context += `${role}: ${msg.content}\n`;
      });
    }
    
    return context;
  }

  private buildStreamPrompt(message: string, userId: string): string {
    const context = this.contextManager.getContext(userId);
    return `${this.SYSTEM_PROMPTS.FINN_CORE}\n\nTópicos recentes: ${context.recentTopics.join(', ')}\n\nUsuário: ${message}\n\nFinn:`;
  }

  private postProcessResponse(response: string, userContext?: any): string {
    // Remover formatação excessiva e limitar tamanho
    let cleanResponse = response
      .replace(/\*\*/g, '') // Remove ** 
      .replace(/\n\n+/g, '\n') // Remove quebras duplas
      .replace(/\s+/g, ' ') // Remove espaços extras
      .trim();

    // Limitar tamanho da resposta (máximo 600 caracteres)
    if (cleanResponse.length > 600) {
      // Tentar cortar em uma frase completa
      const sentences = cleanResponse.split(/[.!?]/);
      let truncated = '';
      for (const sentence of sentences) {
        if ((truncated + sentence + '.').length <= 597) {
          truncated += sentence + '.';
        } else {
          break;
        }
      }
      cleanResponse = truncated || cleanResponse.substring(0, 597) + '...';
    }

    return cleanResponse;
  }

  private getCacheKey(userId: string, message: string, historyKey: string = ''): string {
    const base = `${userId}_${message.substring(0, 50).toLowerCase().replace(/\s+/g, '_')}`;
    if (!historyKey) return base;
    const hist = historyKey.substring(0, 80).replace(/\s+/g, '_');
    return `${base}__h:${hist}`;
  }

  // Métodos de utilidade
  // Métodos auxiliares para extração de entidades
  private extractValue(message: string): number | null {
    const valorMatch = message.match(/r\$\s*(\d+(?:[,.]\d{2})?)|\$(\d+(?:[,.]\d{2})?)|reais?\s*(\d+)|\b(\d+)\s*reais?/i);
    if (valorMatch) {
      return parseFloat((valorMatch[1] || valorMatch[2] || valorMatch[3] || valorMatch[4]).replace(',', '.'));
    }
    return null;
  }

  private extractCategory(message: string): string | null {
    if (/supermercado|mercado|alimentação|comida/i.test(message)) return 'Alimentação';
    if (/transporte|uber|taxi|ônibus|metro/i.test(message)) return 'Transporte';
    if (/farmácia|remédio|saúde/i.test(message)) return 'Saúde';
    return null;
  }

  private extractType(message: string): string {
    if (/gast[ei]|comprei|paguei|despesa/i.test(message)) return 'despesa';
    if (/recebi|ganho|receita|salário/i.test(message)) return 'receita';
    return 'despesa';
  }

  getCacheStats() {
    return {
      ...this.cache.getStats(),
      totalResponses: this.responseCount
    };
  }

  clearCache() {
    this.cache.clear();
  }

  // Método para compatibilidade com o sistema existente
  async generateContextualResponse(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[],
    userContext?: any
  ) {
    const userId = userContext?.userId || 'anonymous';
    const result = await this.generateResponse(userId, userMessage, conversationHistory, userContext);
    
    return {
      text: result.text,
      analysisData: {
        responseTime: result.responseTime,
        engine: 'optimized',
        confidence: result.confidence || 0.8,
        cached: result.cached || false
      }
    };
  }
}

export default OptimizedAIService;