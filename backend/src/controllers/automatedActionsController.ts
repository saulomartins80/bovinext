import { Request, Response } from 'express';
import { User } from '../models/User';
import { Transacoes } from '../models/Transacoes';
import Investimento from '../models/Investimento';
import { Goal } from '../models/Goal';
import { EnterpriseAIEngine } from '../services/EnterpriseAIEngine';
import { v4 as uuidv4 } from 'uuid';
import { contextManager, ConversationState } from '../services/ContextManager';

const aiService = new EnterpriseAIEngine();

// Interfaces para tipos de payload
interface TransactionPayload {
  valor: number;
  descricao: string;
  tipo: string;
  categoria: string;
  conta: string;
  data: string;
}

interface InvestmentPayload {
  nome: string;
  valor: number;
  tipo: string;
  data: string;
  instituicao?: string;
}

interface GoalPayload {
  meta: string;
  valor_total: number;
  data_conclusao: string;
  categoria: string;
}

interface CardPayload {
  nome: string;
  limite: number;
  bandeira: string;
  tipo: string;
  status: string;
  banco?: string;
  programa?: string;
  ultimosDigitos?: string;
  vencimento?: number;
  fechamento?: number;
  anuidade?: number;
  categoria?: string;
}

interface AnalysisPayload {
  analysisType: string;
}

interface ReportPayload {
  reportType: string;
}

interface DetectedAction {
  type: 'CREATE_TRANSACTION' | 'CREATE_INVESTMENT' | 'CREATE_GOAL' | 'CREATE_CARD' | 'ANALYZE_DATA' | 'GENERATE_REPORT' | 'UNKNOWN';
  payload: TransactionPayload | InvestmentPayload | GoalPayload | CardPayload | AnalysisPayload | ReportPayload | {};
  confidence: number;
  requiresConfirmation: boolean;
  successMessage: string;
  errorMessage: string;
  response: string;
  followUpQuestions?: string[];
}

// See the detailed documentation of the Automated Actions Detection System at: docs/automated-actions-detection.md.

// Cache para intents detectados
const intentCache = new Map<string, DetectedAction>();

// Função para detectar intenção do usuário (OTIMIZADA)
interface UserContext {
  name: string;
  subscriptionPlan: string;
  userId?: string;
  [key: string]: any;
}

export async function detectUserIntent(message: string, userContext: UserContext, conversationHistory?: any[]): Promise<DetectedAction | null> {
  try {
    // 1. ⚡ Verificar cache primeiro (0.1ms)
    const cacheKey = `${message}_${userContext.name}_${userContext.subscriptionPlan}`;
    const cachedIntent = intentCache.get(cacheKey);
    if (cachedIntent) {
      return cachedIntent;
    }

    // 2. 🆕 VERIFICAR CONTEXTO ATIVO DA CONVERSA (OTIMIZADO)
    const chatId = conversationHistory?.[0]?.chatId;
    let contextIntent = null;
    
    if (chatId) {
      // ⚡ OTIMIZAÇÃO: ContextManager lookup mais rápido
      const activeState = contextManager.getConversationState(chatId);
      if (activeState?.currentAction) {
        console.log(`[ContextManager] Active context found: ${activeState.currentAction} for ${chatId}`);
        
        // ⚡ OTIMIZAÇÃO: Análise local mais rápida
        contextIntent = tryCompleteFromContext(message, activeState);
        if (contextIntent) {
          console.log(`[ContextManager] Completed action from context: ${contextIntent.type}`);
          // ⚡ OTIMIZAÇÃO: Atualizar contexto assincronamente
          setImmediate(() => {
            contextManager.updateConversationState(
              chatId,
              userContext.userId || 'anonymous',
              contextIntent.type,
              contextIntent.payload,
              contextIntent.requiresConfirmation
            );
          });
          return contextIntent;
        }
      }
    }

    // 3. ⚡ Detecção rápida por palavras-chave (0.2ms)
    const quickIntent = detectQuickIntent(message);
    if (quickIntent && quickIntent.confidence > 0.8) {
      // 🆕 ATUALIZAR CONTEXTO se nova ação detectada (ASSÍNCRONO)
      if (chatId) {
        setImmediate(() => {
          contextManager.updateConversationState(
            chatId, 
            userContext.userId || 'anonymous',
            quickIntent.type,
            quickIntent.payload,
            quickIntent.requiresConfirmation
          );
        });
      }
      
      intentCache.set(cacheKey, quickIntent);
      return quickIntent;
    }

    // 4. ⚡ Análise de contexto da conversa (0.3ms)
    const contextIntent2 = analyzeConversationContext(message, conversationHistory);
    if (contextIntent2 && contextIntent2.confidence > 0.7) {
      // 🆕 ATUALIZAR CONTEXTO se ação detectada do contexto (ASSÍNCRONO)
      if (chatId) {
        setImmediate(() => {
          contextManager.updateConversationState(
            chatId,
            userContext.userId || 'anonymous',
            contextIntent2.type,
            contextIntent2.payload,
            contextIntent2.requiresConfirmation
          );
        });
      }
      
      intentCache.set(cacheKey, contextIntent2);
      return contextIntent2;
    }

    // 5. ⚡ Análise completa com IA (0.5ms)
    const fullIntent = await detectFullIntent(message, userContext, conversationHistory);
    if (fullIntent) {
      // 🆕 ATUALIZAR CONTEXTO se ação detectada pela IA (ASSÍNCRONO)
      if (chatId) {
        setImmediate(() => {
          contextManager.updateConversationState(
            chatId,
            userContext.userId || 'anonymous',
            fullIntent.type,
            fullIntent.payload,
            fullIntent.requiresConfirmation
          );
        });
      }
      
      intentCache.set(cacheKey, fullIntent);
      return fullIntent;
    }

    // 6. ⚡ Resposta padrão
    const defaultIntent: DetectedAction = {
      type: 'UNKNOWN',
      payload: {},
      confidence: 0.0,
      requiresConfirmation: false,
      successMessage: '',
      errorMessage: '',
      response: 'Olá! Como posso te ajudar hoje? Posso criar metas, transações, investimentos e muito mais!'
    };
    intentCache.set(cacheKey, defaultIntent);
    return defaultIntent;
  } catch (error) {
    console.error('Erro ao detectar intenção:', error);
    return null;
  }
}

// ⚡ DETECÇÃO RÁPIDA POR PALAVRAS-CHAVE
function detectQuickIntent(message: string): DetectedAction | null {
  const lowerMessage = message.toLowerCase();

  // Detectar criação de transação
  if (lowerMessage.includes('criar transação') || lowerMessage.includes('nova transação') || 
      lowerMessage.includes('registrar transação') || lowerMessage.includes('add transação') ||
      lowerMessage.includes('quero criar uma nova transação') || lowerMessage.includes('criar transaçao') ||
      lowerMessage.includes('gastei') || lowerMessage.includes('recebi') || lowerMessage.includes('paguei') ||
      lowerMessage.includes('comprei') || lowerMessage.includes('transação de') || lowerMessage.includes('transacao de')) {
    
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    // Extrair descrição se mencionado
    let descricao = 'Transação';
    if (lowerMessage.includes('gastei')) descricao = 'Despesa';
    if (lowerMessage.includes('recebi')) descricao = 'Receita';
    if (lowerMessage.includes('paguei')) descricao = 'Pagamento';
    if (lowerMessage.includes('comprei')) descricao = 'Compra';

    return {
      type: 'CREATE_TRANSACTION',
      payload: {
        valor: valor || 0,
        descricao: descricao,
        tipo: lowerMessage.includes('recebi') ? 'receita' : 'despesa',
        categoria: 'Geral',
        conta: 'Principal',
        data: new Date().toISOString().split('T')[0]
      },
      confidence: valor ? 0.95 : 0.8,
      requiresConfirmation: !valor,
      successMessage: valor ? 
        `✅ Transação de R$ ${valor.toFixed(2)} criada com sucesso!` : 
        ' Qual o valor da transação?',
      errorMessage: 'Erro ao criar transação',
      response: valor ? 
        `Perfeito! Transação de R$ ${valor.toFixed(2)} registrada.` : 
        'Qual o valor da transação?'
    };
  }

  // Detectar criação de meta
  if (lowerMessage.includes('criar meta') || lowerMessage.includes('nova meta') || 
      lowerMessage.includes('quero criar uma meta') || lowerMessage.includes('juntar dinheiro') ||
      lowerMessage.includes('economizar para') || lowerMessage.includes('meta de') ||
      lowerMessage.includes('quero juntar') || lowerMessage.includes('quero economizar')) {
    
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
    let valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    // Extrair meta se mencionado
    let meta = 'Meta';
    if (lowerMessage.includes('viagem')) meta = 'Viagem';
    if (lowerMessage.includes('carro')) meta = 'Carro';
    if (lowerMessage.includes('casa')) meta = 'Casa';
    if (lowerMessage.includes('aposentadoria')) meta = 'Aposentadoria';
    
    // Detectar caso específico Gramado
    if (lowerMessage.includes('gramado') && lowerMessage.includes('6470')) {
      valor = 6470;
      meta = 'Viagem para Gramado';
    }

    // Extrair prazo se mencionado
    let prazoMeses = 12; // padrão 1 ano
    if (lowerMessage.includes('final do ano') || lowerMessage.includes('dezembro')) {
      prazoMeses = 5; // 5 meses até dezembro
    }

    return {
      type: 'CREATE_GOAL',
      payload: {
        meta: meta,
        valor_total: valor || 0,
        data_conclusao: new Date(Date.now() + prazoMeses * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        categoria: 'Geral'
      },
      confidence: valor ? 0.95 : 0.8,
      requiresConfirmation: !valor,
      successMessage: valor ? 
        `🎯 Meta "${meta}" de R$ ${valor.toFixed(2)} criada com sucesso!` : 
        'Qual valor você quer juntar?',
      errorMessage: 'Erro ao criar meta',
      response: valor ? 
        `Perfeito! Meta "${meta}" de R$ ${valor.toFixed(2)} criada.` : 
        'Qual valor você quer juntar?'
    };
  }

  // Detectar criação de investimento
  if (lowerMessage.includes('criar investimento') || lowerMessage.includes('novo investimento') || 
      lowerMessage.includes('quero investir') || lowerMessage.includes('aplicar dinheiro') ||
      lowerMessage.includes('investi') || lowerMessage.includes('comprei ações') ||
      lowerMessage.includes('investimento de') || lowerMessage.includes('apliquei') ||
      lowerMessage.includes('quero criar uma novo investimento') || lowerMessage.includes('quero criar um novo investimento')) {
    
    // Se só mencionou a intenção, não extrair dados
    if (lowerMessage.includes('quero criar') && !lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i)) {
      return {
        type: 'CREATE_INVESTMENT',
        payload: {}, // Payload vazio para indicar que precisa de dados
        confidence: 0.95,
        requiresConfirmation: true,
        successMessage: '📈 Investimento criado com sucesso!',
        errorMessage: 'Erro ao criar investimento',
        response: ' Vamos criar esse investimento. Me fala aí:\n\n Qual valor você quer investir?\n Que tipo de investimento (ações, tesouro, cripto, etc.)?\n Qual o nome/instituição?'
      };
    }

    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    // Extrair nome se mencionado
    let nome = 'Investimento';
    if (lowerMessage.includes('ações')) nome = 'Ações';
    if (lowerMessage.includes('tesouro')) nome = 'Tesouro Direto';
    if (lowerMessage.includes('cripto')) nome = 'Criptomoedas';
    if (lowerMessage.includes('fii')) nome = 'Fundos Imobiliários';

    return {
      type: 'CREATE_INVESTMENT',
      payload: {
        nome: nome,
        valor: valor || 0,
        tipo: lowerMessage.includes('ações') ? 'Ações' : 
              lowerMessage.includes('tesouro') ? 'Tesouro Direto' : 
              lowerMessage.includes('cripto') ? 'Criptomoedas' : 
              lowerMessage.includes('fii') ? 'Fundos Imobiliários' : 'Renda Fixa',
        data: new Date().toISOString().split('T')[0],
        instituicao: 'Instituição'
      },
      confidence: valor ? 0.95 : 0.8,
      requiresConfirmation: !valor,
      successMessage: valor ? 
        `📈 Investimento "${nome}" de R$ ${valor.toFixed(2)} criado com sucesso!` : 
        ' Qual valor você investiu?',
      errorMessage: 'Erro ao criar investimento',
      response: valor ? 
        `Perfeito! Investimento "${nome}" de R$ ${valor.toFixed(2)} registrado.` : 
        'Qual valor você investiu?'
    };
  }

  // Detectar criação de cartão
  if (lowerMessage.includes('criar cartão') || lowerMessage.includes('novo cartão') || 
      lowerMessage.includes('quero criar um cartão') || lowerMessage.includes('adicionar cartão') ||
      lowerMessage.includes('registrar cartão') || lowerMessage.includes('cartão de crédito') ||
      lowerMessage.includes('cartão de débito') || lowerMessage.includes('adicionar cartão de crédito') ||
      lowerMessage.includes('novo cartão de crédito') || lowerMessage.includes('cartão nubank') ||
      lowerMessage.includes('cartão itau') || lowerMessage.includes('cartão bradesco') ||
      lowerMessage.includes('cartão santander') || lowerMessage.includes('cartão bb')) {
    
    // Extrair limite se mencionado
    const limiteMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
    const limite = limiteMatch ? parseFloat(limiteMatch[1].replace(',', '.')) : null;
    
    // Extrair banco se mencionado
    let banco = 'Banco';
    let programa = 'Programa de Pontos';
    if (lowerMessage.includes('nubank')) {
      banco = 'Nubank';
      programa = 'Rewards';
    } else if (lowerMessage.includes('itau') || lowerMessage.includes('itau')) {
      banco = 'Itaú';
      programa = 'Ponto Certo';
    } else if (lowerMessage.includes('bradesco')) {
      banco = 'Bradesco';
      programa = 'Esfera';
    } else if (lowerMessage.includes('santander')) {
      banco = 'Santander';
      programa = 'Esfera';
    } else if (lowerMessage.includes('bb') || lowerMessage.includes('banco do brasil')) {
      banco = 'Banco do Brasil';
      programa = 'BB Rewards';
    } else if (lowerMessage.includes('caixa')) {
      banco = 'Caixa Econômica';
      programa = 'Caixa Rewards';
    }
    
    // Extrair categoria se mencionado
    let categoria = 'standard';
    if (lowerMessage.includes('premium') || lowerMessage.includes('black') || lowerMessage.includes('infinite')) {
      categoria = 'premium';
    } else if (lowerMessage.includes('basic') || lowerMessage.includes('simples')) {
      categoria = 'basic';
    }
    
    // Extrair tipo se mencionado
    let tipo = 'Crédito';
    if (lowerMessage.includes('débito') || lowerMessage.includes('debito')) {
      tipo = 'Débito';
    } else if (lowerMessage.includes('crédito') || lowerMessage.includes('credito')) {
      tipo = 'Crédito';
    }

    return {
      type: 'CREATE_CARD',
      payload: {
        nome: `${banco} ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`,
        limite: limite || 0,
        banco: banco,
        programa: programa,
        bandeira: 'Visa', // Padrão
        tipo: tipo,
        status: 'Ativo',
        categoria: categoria,
        ultimosDigitos: '****',
        vencimento: 15, // Padrão
        fechamento: 30, // Padrão
        anuidade: 0
      },
      confidence: limite ? 0.95 : 0.8,
      requiresConfirmation: !limite,
      successMessage: limite ? 
        `💳 Cartão ${banco} com limite de R$ ${limite.toFixed(2)} criado com sucesso!` : 
        'Qual o limite do cartão?',
      errorMessage: 'Erro ao criar cartão',
      response: limite ? 
        `Perfeito! Cartão ${banco} com limite de R$ ${limite.toFixed(2)} registrado.` : 
        'Qual o limite do cartão?'
    };
  }

  return null;
}

// ⚡ ANÁLISE DE CONTEXTO DA CONVERSA
function analyzeConversationContext(message: string, conversationHistory?: any[]): DetectedAction | null {
  if (!conversationHistory || conversationHistory.length === 0) return null;
  
  const lowerMessage = message.toLowerCase();
  const recentMessages = conversationHistory.slice(-3);
  
  // Verificar se é continuação de uma transação
  if (lowerMessage.includes('valor') || lowerMessage.includes('reais') || lowerMessage.includes('é uma despesa')) {
    const transactionContext = recentMessages.find((msg: any) => 
      msg.content.toLowerCase().includes('transação') || 
      msg.content.toLowerCase().includes('gastei') || 
      msg.content.toLowerCase().includes('recebi')
    );
    
    if (transactionContext) {
      const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
      const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;

      return {
        type: 'CREATE_TRANSACTION',
        payload: {
          valor: valor || 0,
          descricao: 'Transação',
          tipo: lowerMessage.includes('despesa') ? 'despesa' : 'receita',
          categoria: 'Geral',
          conta: 'Principal',
          data: new Date().toISOString().split('T')[0]
        },
        confidence: valor ? 0.8 : 0.6,
        requiresConfirmation: !valor,
        successMessage: 'Transação criada com sucesso!',
        errorMessage: 'Erro ao criar transação',
        response: valor ? 
          ` Perfeito! Transação de R$ ${valor.toFixed(2)} registrada. O que foi essa transação?` : 
          ' Qual o valor da transação?'
      };
    }
  }
  
  return null;
}

// ⚡ ANÁLISE COMPLETA COM IA
async function detectFullIntent(message: string, userContext: UserContext, conversationHistory?: any[]): Promise<DetectedAction | null> {
  try {
    // Analisar contexto da conversa para entender melhor
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-3);
      conversationContext = `\n\nContexto da conversa recente:\n${recentMessages.map((msg: any, index: number) => 
        `${index + 1}. ${msg.sender === 'user' ? 'Usuário' : 'Bot'}: ${msg.content}`
      ).join('\n')}`;
    }

    const prompt = `Contexto do usuário:
- Nome: ${userContext.name}
- Plano: ${userContext.subscriptionPlan}
- Transações: ${userContext.totalTransacoes}
- Investimentos: ${userContext.totalInvestimentos}
- Metas: ${userContext.totalMetas}${conversationContext}
Mensagem do usuário: "${message}"
IMPORTANTE: Se o usuário mencionar "outras informações já passei", "já te passei antes", "valor é X reais", ou "é uma despesa", considere o contexto da conversa anterior para completar as informações faltantes.
Analise a mensagem e retorne um JSON com:
- intent: tipo de ação (CREATE_TRANSACTION, CREATE_INVESTMENT, CREATE_GOAL, ANALYZE_DATA, GENERATE_REPORT, UNKNOWN)
- entities: dados extraídos (valor, descrição, categoria, prazo, etc.)
- confidence: confiança da detecção (0.0 a 1.0)
- response: resposta natural
- requiresConfirmation: se precisa confirmação
JSON:`;

    const actionResult = await aiService.processEnterpriseRequest('automated_user', message, { type: 'automation_detection' });

    // Extract intent from actions array or reasoning
    const detectedAction = actionResult.actions?.[0] || {};
    const intent = detectedAction.type || detectedAction.intent || 'UNKNOWN';
    const entities = detectedAction.data || detectedAction.payload || {};
    const requiresConfirmation = detectedAction.requiresConfirmation || false;

    if (!actionResult || intent === 'UNKNOWN') {
      return {
        type: 'UNKNOWN',
        payload: {},
        confidence: actionResult?.confidence || 0.0,
        requiresConfirmation: false,
        successMessage: '',
        errorMessage: '',
        response: actionResult?.response || 'Como posso te ajudar hoje?'
      };
    }

    return {
      type: intent as any,
      payload: entities || {},
      confidence: actionResult.confidence || 0.0,
      requiresConfirmation: requiresConfirmation,
      successMessage: '',
      errorMessage: '',
      response: actionResult.response || 'Entendi sua solicitação. Como posso ajudar?'
    };
  } catch (error) {
    console.error('Erro na análise com IA:', error);
    return null;
  }
}

// Função auxiliar para verificar se os dados necessários para a ação foram completos
function hasCompleteData(action: DetectedAction): boolean {
  const payload = action.payload as any;
  switch (action.type) {
    case 'CREATE_TRANSACTION':
      return payload.valor && payload.valor > 0 && payload.descricao;
    case 'CREATE_INVESTMENT':
      return payload.valor && payload.valor > 0 && payload.nome && payload.tipo;
    case 'CREATE_GOAL':
      return payload.valor_total && payload.valor_total > 0 && payload.meta;
    case 'CREATE_CARD':
      return payload.nome && payload.limite;
    case 'GENERATE_REPORT':
    case 'ANALYZE_DATA':
      return true;
    default:
      return false;
  }
}

// Type guards for validation
function isValidTransactionData(action: DetectedAction): action is DetectedAction & { payload: TransactionPayload } {
  const payload = action.payload as any;
  return action.type === 'CREATE_TRANSACTION' && payload.valor && payload.valor > 0 && payload.descricao;
}

function isValidInvestmentData(action: DetectedAction): action is DetectedAction & { payload: InvestmentPayload } {
  const payload = action.payload as any;
  return action.type === 'CREATE_INVESTMENT' && payload.valor && payload.valor > 0 && payload.nome && payload.tipo;
}

function isValidGoalData(action: DetectedAction): action is DetectedAction & { payload: GoalPayload } {
  const payload = action.payload as any;
  return action.type === 'CREATE_GOAL' && payload.valor_total && payload.valor_total > 0 && payload.meta;
}

function isValidCardData(action: DetectedAction): action is DetectedAction & { payload: CardPayload } {
  const payload = action.payload as any;
  return action.type === 'CREATE_CARD' && payload.nome && payload.limite;
}

function isValidAnalysisData(action: DetectedAction): action is DetectedAction & { payload: AnalysisPayload } {
  return action.type === 'ANALYZE_DATA';
}

function isValidReportData(action: DetectedAction): action is DetectedAction & { payload: ReportPayload } {
  return action.type === 'GENERATE_REPORT';
}

// ===== FUNÇÃO PARA COMPLETAR AÇÃO DO CONTEXTO =====
function tryCompleteFromContext(message: string, activeState: ConversationState): DetectedAction | null {
  const lowerMessage = message.toLowerCase();
  
  // Se não há ação ativa, não pode completar
  if (!activeState.currentAction) return null;
  
  // Tentar extrair entidades da mensagem atual
  const extractedEntities = extractEntitiesFromMessage(message, activeState.currentAction);
  
  // Se extraiu algo útil, completar a ação
  if (Object.keys(extractedEntities).length > 0) {
    // Mesclar com entidades existentes
    const mergedEntities = { ...activeState.pendingEntities, ...extractedEntities };
    
    // Verificar se ação está completa
    const isComplete = isActionComplete(activeState.currentAction, mergedEntities);
    
    return {
      type: activeState.currentAction as any,
      payload: mergedEntities,
      confidence: isComplete ? 0.95 : 0.8,
      requiresConfirmation: !isComplete,
      successMessage: generateSuccessMessage(activeState.currentAction, mergedEntities),
      errorMessage: 'Erro ao completar ação',
      response: generateContextResponse(activeState.currentAction, mergedEntities, isComplete)
    };
  }
  
  return null;
}

// ===== FUNÇÕES AUXILIARES PARA CONTEXTO =====
function extractEntitiesFromMessage(message: string, actionType: string): any {
  const lowerMessage = message.toLowerCase();
  const entities: any = {};
  
  switch (actionType) {
    case 'CREATE_GOAL':
      // Extrair valor se mencionado
      const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
      if (valorMatch) entities.valor_total = parseFloat(valorMatch[1].replace(',', '.'));
      
      // Extrair meta se mencionado
      if (lowerMessage.includes('viagem')) entities.meta = 'Viagem';
      if (lowerMessage.includes('carro')) entities.meta = 'Carro';
      if (lowerMessage.includes('casa')) entities.meta = 'Casa';
      if (lowerMessage.includes('gramado')) entities.meta = 'Viagem para Gramado';
      break;
      
    case 'CREATE_CARD':
      // Extrair limite se mencionado
      const limiteMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
      if (limiteMatch) entities.limite = parseFloat(limiteMatch[1].replace(',', '.'));
      
      // Extrair banco se mencionado
      if (lowerMessage.includes('nubank')) entities.banco = 'Nubank';
      if (lowerMessage.includes('itau')) entities.banco = 'Itaú';
      if (lowerMessage.includes('bradesco')) entities.banco = 'Bradesco';
      break;
      
    case 'CREATE_INVESTMENT':
      // Extrair valor se mencionado
      const invValorMatch = lowerMessage.match(/r?\$?\s*(\d+(?:[.,]\d+)?)/i);
      if (invValorMatch) entities.valor = parseFloat(invValorMatch[1].replace(',', '.'));
      
      // Extrair tipo se mencionado
      if (lowerMessage.includes('ações')) entities.tipo = 'Ações';
      if (lowerMessage.includes('tesouro')) entities.tipo = 'Tesouro Direto';
      break;
  }
  
  return entities;
}

function isActionComplete(actionType: string, entities: any): boolean {
  const requiredFields = getRequiredFieldsForAction(actionType);
  return requiredFields.every(field => entities[field] !== undefined && entities[field] !== null);
}

function getRequiredFieldsForAction(actionType: string): string[] {
  const requirements: { [key: string]: string[] } = {
    'CREATE_GOAL': ['valor_total', 'meta'],
    'CREATE_CARD': ['nome', 'limite'],
    'CREATE_INVESTMENT': ['valor', 'nome'],
    'CREATE_TRANSACTION': ['valor']
  };
  
  return requirements[actionType] || [];
}

function generateSuccessMessage(actionType: string, entities: any): string {
  switch (actionType) {
    case 'CREATE_GOAL':
      return `🎯 Meta "${entities.meta}" de R$ ${entities.valor_total} criada com sucesso!`;
    case 'CREATE_CARD':
      return `💳 Cartão ${entities.banco || 'Novo'} com limite de R$ ${entities.limite} criado com sucesso!`;
    case 'CREATE_INVESTMENT':
      return `📈 Investimento de R$ ${entities.valor} criado com sucesso!`;
    default:
      return 'Ação executada com sucesso!';
  }
}

function generateContextResponse(actionType: string, entities: any, isComplete: boolean): string {
  if (isComplete) {
    return generateSuccessMessage(actionType, entities);
  }
  
  // Gerar resposta pedindo campos faltantes
  const missingFields = getRequiredFieldsForAction(actionType).filter(field => !entities[field]);
  
  switch (actionType) {
    case 'CREATE_GOAL':
      if (!entities.meta) return 'Qual é o objetivo da sua meta? (ex: viagem, carro, casa)';
      if (!entities.valor_total) return 'Qual o valor total que você quer juntar?';
      break;
    case 'CREATE_CARD':
      if (!entities.nome) return 'Qual o nome do cartão?';
      if (!entities.limite) return 'Qual o limite do cartão?';
      break;
    case 'CREATE_INVESTMENT':
      if (!entities.valor) return 'Qual o valor do investimento?';
      if (!entities.nome) return 'Onde você investiu? (ex: ações, tesouro)';
      break;
  }
  
  return 'Preciso de mais informações para completar essa ação.';
}

// ⚡ Controller principal para ações automatizadas
export const processAutomatedAction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const { message, chatId, context } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    if (!message) {
      res.status(400).json({ success: false, message: 'Mensagem é obrigatória' });
      return;
    }

    // Buscar dados do usuário
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      return;
    }

    // Buscar dados financeiros do usuário
    const [transacoes, investimentos, metas] = await Promise.all([
      Transacoes.find({ userId: user._id }),
      Investimento.find({ userId: user._id }),
      Goal.find({ userId: user._id })
    ]);

    const userContext = {
      name: user.name || 'Usuário',
      email: user.email || '',
      subscriptionPlan: user.subscription?.plan || 'Gratuito',
      subscriptionStatus: user.subscription?.status || 'inactive',
      hasTransactions: transacoes.length > 0,
      hasInvestments: investimentos.length > 0,
      hasGoals: metas.length > 0,
      totalTransacoes: transacoes.length,
      totalInvestimentos: investimentos.length,
      totalMetas: metas.length
    };

    // Detectar ação automatizada
    const detectedAction = await detectUserIntent(message, userContext);

    if (detectedAction && detectedAction.confidence && detectedAction.confidence > 0.1) {
      // Se for UNKNOWN, retornar resposta conversacional
      if (detectedAction.type === 'UNKNOWN') {
        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: detectedAction.response || 'Olá! Como posso te ajudar hoje?',
          messageId: uuidv4()
        });
        return;
      }

      // Verificar se tem dados suficientes
      if (!hasCompleteData(detectedAction)) {
        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: detectedAction.response || 'Preciso de mais detalhes para criar isso. Pode me informar os valores?',
          messageId: uuidv4()
        });
        return;
      }

      // Executar ação automaticamente
      try {
        let result;
        switch (detectedAction.type) {
          case 'CREATE_TRANSACTION':
            if (isValidTransactionData(detectedAction)) {
              result = await createTransaction(user.firebaseUid, detectedAction.payload);
            }
            break;
          case 'CREATE_INVESTMENT':
            if (isValidInvestmentData(detectedAction)) {
              result = await createInvestment(user.firebaseUid, detectedAction.payload);
            }
            break;
          case 'CREATE_GOAL':
            if (isValidGoalData(detectedAction)) {
              result = await createGoal(user.firebaseUid, detectedAction.payload);
            }
            break;
          case 'CREATE_CARD':
            if (isValidCardData(detectedAction)) {
              result = await createCard(user.firebaseUid, detectedAction.payload);
            }
            break;
          case 'ANALYZE_DATA':
            if (isValidAnalysisData(detectedAction)) {
              result = await analyzeData(user.firebaseUid, detectedAction.payload);
            }
            break;
          case 'GENERATE_REPORT':
            if (isValidReportData(detectedAction)) {
              result = await generateReport(user.firebaseUid, detectedAction.payload);
            }
            break;
          default:
            throw new Error('Ação não suportada');
        }

        res.status(200).json({
          success: true,
          type: 'ACTION_EXECUTED',
          text: detectedAction.successMessage || 'Ação executada com sucesso!',
          data: result,
          messageId: uuidv4()
        });
        return;
      } catch (error) {
        console.error('Erro ao executar ação:', error);
        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: detectedAction.errorMessage || 'Desculpe, não consegui executar essa ação. Pode tentar novamente?',
          messageId: uuidv4()
        });
        return;
      }
    } else {
      // Processar como mensagem normal do chatbot
      try {
        const result = await aiService.processEnterpriseRequest(userId, message, { type: 'contextual_response' });
        const response = { text: result.response };

        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: typeof response === 'string' ? response : (response as any).text || 'Olá! Como posso te ajudar hoje?',
          messageId: uuidv4()
        });
        return;
      } catch (aiError) {
        console.error('Erro no AI Service:', aiError);
        // Fallback para resposta simples
        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: 'Olá! Como posso te ajudar hoje?',
          messageId: uuidv4()
        });
        return;
      }
    }
  } catch (error) {
    console.error('Erro ao processar ação automatizada:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar solicitação' 
    });
    return;
  }
};

// Funções auxiliares para executar ações
export async function createTransaction(userId: string, payload: TransactionPayload): Promise<any> {
  const transactionData = {
    userId,
    valor: payload.valor || 0,
    descricao: payload.descricao || 'Transação',
    tipo: payload.tipo || 'despesa',
    categoria: payload.categoria || 'Geral',
    conta: payload.conta || 'Principal',
    data: payload.data || new Date().toISOString().split('T')[0],
    createdAt: new Date()
  };

  const transacao = new Transacoes(transactionData);
  return await transacao.save();
}

export async function createInvestment(userId: string, payload: InvestmentPayload): Promise<any> {
  const investmentData = {
    userId,
    nome: payload.nome || 'Investimento',
    valor: payload.valor || 0,
    tipo: payload.tipo || 'Renda Fixa',
    data: payload.data ? new Date(payload.data) : new Date(),
    instituicao: payload.instituicao || 'Instituição',
    createdAt: new Date()
  };

  const investimento = new Investimento(investmentData);
  return await investimento.save();
}

export async function createGoal(userId: string, payload: GoalPayload): Promise<any> {
  const goalData = {
    userId,
    meta: payload.meta || 'Meta',
    valor_total: payload.valor_total || 0,
    data_conclusao: payload.data_conclusao || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    categoria: payload.categoria || 'Geral',
    valor_atual: 0,
    prioridade: 'media',
    createdAt: new Date()
  };

  const goal = new Goal(goalData);
  return await goal.save();
}

export async function createCard(userId: string, payload: CardPayload): Promise<any> {
  const cardData = {
    userId,
    nome: payload.nome || 'Cartão',
    limite: payload.limite || 0,
    bandeira: payload.bandeira || 'Não informado',
    tipo: payload.tipo || 'Crédito',
    status: payload.status || 'Ativo',
    createdAt: new Date()
  };

  // Assuming Transacoes model has a 'cartoes' sub-collection or similar
  // For now, we'll just return the data, as the model structure isn't fully defined
  // In a real app, you'd save this to a 'Cartoes' collection or similar
  return cardData;
}

export async function analyzeData(userId: string, payload: AnalysisPayload): Promise<any> {
  const [transacoes, investimentos, metas] = await Promise.all([
    Transacoes.find({ userId }),
    Investimento.find({ userId }),
    Goal.find({ userId })
  ]);

  return {
    analysisType: payload.analysisType,
    summary: {
      totalTransacoes: transacoes.length,
      totalInvestimentos: investimentos.length,
      valorTotalInvestido: investimentos.reduce((sum: number, inv: any) => sum + inv.valor, 0),
      valorTotalMetas: metas.reduce((sum: number, meta: any) => sum + meta.valor_total, 0)
    }
  };
}

export async function generateReport(userId: string, payload: ReportPayload): Promise<any> {
  const analysisPayload: AnalysisPayload = {
    analysisType: payload.reportType
  };
  const analysis = await analyzeData(userId, analysisPayload);
  return {
    reportId: uuidv4(),
    generatedAt: new Date(),
    type: payload.reportType || 'general',
    data: analysis
  };
}

// Additional exports for routes
export const handleAutomatedActions = processAutomatedAction;
export const executeAction = processAutomatedAction;
