import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Transacoes } from '../models/Transacoes';
import Investimento from '../models/Investimento';
import { Goal } from '../models/Goal';
import AIService from '../services/aiService';
import { v4 as uuidv4 } from 'uuid';

const aiService = new AIService();

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

interface AnalysisPayload {
  analysisType: string;
}

interface ReportPayload {
  reportType: string;
}

interface DetectedAction {
  type: 'CREATE_TRANSACTION' | 'CREATE_INVESTMENT' | 'CREATE_GOAL' | 'ANALYZE_DATA' | 'GENERATE_REPORT' | 'UNKNOWN';
  payload: TransactionPayload | InvestmentPayload | GoalPayload | AnalysisPayload | ReportPayload | {};
  confidence: number;
  requiresConfirmation: boolean;
  successMessage: string;
  errorMessage: string;
  response: string;
  followUpQuestions?: string[];
}

// Prompt para detecção de ações automatizadas - VERSÃO NATURAL E HUMANIZADA
const ACTION_DETECTION_PROMPT = `Você é o Finn, assistente financeiro inteligente e natural. Analise a mensagem do usuário e responda de forma conversacional e humanizada.

REGRAS PRINCIPAIS:
1. SEMPRE ser natural e conversacional como um amigo experiente
2. NUNCA ser robótico ou repetitivo
3. SEMPRE perguntar detalhes quando faltar informação
4. NUNCA criar automaticamente com valores padrão
5. SEMPRE confirmar antes de executar ações
6. Usar linguagem brasileira natural ("beleza", "valeu", "tranquilo")
7. Adaptar tom baseado no contexto e humor do usuário

DETECÇÃO INTELIGENTE:

CRIAR META:
- "Quero juntar R$ X para Y" → CREATE_GOAL (extrair valor_total, meta)
- "Meta de R$ X para Y" → CREATE_GOAL (extrair valor_total, meta)
- "Quero economizar R$ X" → CREATE_GOAL (extrair valor_total)
- "Preciso guardar R$ X" → CREATE_GOAL (extrair valor_total)
- "estou querendo add uma nova meta" → CREATE_GOAL (perguntar naturalmente)
- "quero criar uma meta" → CREATE_GOAL (perguntar naturalmente)
- "viagem para gramado" + valor → CREATE_GOAL (extrair meta, valor_total)

CRIAR TRANSAÇÃO:
- "Gastei R$ X no Y" → CREATE_TRANSACTION (extrair valor, descricao, tipo=despesa)
- "Recebi salário de R$ X" → CREATE_TRANSACTION (extrair valor, descricao, tipo=receita)
- "Paguei conta de Y R$ X" → CREATE_TRANSACTION (extrair valor, descricao, tipo=despesa)
- "Comprei X por R$ Y" → CREATE_TRANSACTION (extrair valor, descricao, tipo=despesa)
- "estou querendo add uma nova transação" → CREATE_TRANSACTION (perguntar naturalmente)
- "quero registrar uma transação" → CREATE_TRANSACTION (perguntar naturalmente)
- "quero registrar um despesa" → CREATE_TRANSACTION (perguntar naturalmente)

CRIAR INVESTIMENTO:
- "Comprei ações da X por R$ Y" → CREATE_INVESTMENT (extrair nome, valor, tipo)
- "Investi R$ X em Y" → CREATE_INVESTMENT (extrair valor, nome, tipo)
- "Apliquei R$ X em Y" → CREATE_INVESTMENT (extrair valor, nome, tipo)
- "estou querendo add um novo investimento" → CREATE_INVESTMENT (perguntar naturalmente)
- "quero criar um investimento" → CREATE_INVESTMENT (perguntar naturalmente)

CONTINUAÇÃO DE CONVERSAS:
- Se o usuário mencionar "valor é X reais" e na conversa anterior foi mencionada uma transação → CREATE_TRANSACTION
- Se o usuário disser "é uma despesa" e na conversa anterior foi mencionada uma transação → CREATE_TRANSACTION
- Se o usuário disser "outras informações já passei" → usar contexto da conversa anterior
- Se o usuário disser "não foi criada" ou "não estou vendo" → verificar se já existe e criar novamente

CONFIRMAÇÕES E CORREÇÕES:
- "vamos nessa" → UNKNOWN (confirmação)
- "ok" → UNKNOWN (confirmação)
- "sim" → UNKNOWN (confirmação)
- "claro" → UNKNOWN (confirmação)
- "corrigir" → UNKNOWN (correção)
- "mudar" → UNKNOWN (correção)
- "não" → UNKNOWN (negação)

PERGUNTAS E DÚVIDAS:
- "como funciona" → UNKNOWN (dúvida)
- "o que posso fazer" → UNKNOWN (dúvida)
- "tudo bem" → UNKNOWN (cumprimento)
- "tudo joia" → UNKNOWN (cumprimento)
- "beleza" → UNKNOWN (cumprimento)
- "tudo certo" → UNKNOWN (cumprimento)
- "oi" → UNKNOWN (cumprimento)
- "boa noite" → UNKNOWN (cumprimento)
- "bom dia" → UNKNOWN (cumprimento)

PERGUNTAS NATURAIS (quando faltar informação):
- Para metas: "Que legal! Qual valor você quer juntar e para qual objetivo?"
- Para transações: "Perfeito! Qual valor e o que foi essa transação?"
- Para investimentos: "Ótimo! Qual valor, tipo e nome do investimento?"

EXTRAGA as seguintes informações:
- intent: tipo de ação (CREATE_TRANSACTION, CREATE_INVESTMENT, CREATE_GOAL, ANALYZE_DATA, GENERATE_REPORT, UNKNOWN)
- entities: dados extraídos em formato JSON
- confidence: confiança da detecção (0.0 a 1.0)
- response: resposta natural e conversacional
- requiresConfirmation: true apenas se tiver dados suficientes para criar

Para metas, extraia:
- valor_total: valor total da meta (só se mencionado)
- meta: descrição da meta (só se mencionado)
- data_conclusao: prazo (só se mencionado)
- categoria: tipo da meta (só se mencionado)

Para transações, extraia:
- valor: valor da transação (só se mencionado)
- descricao: descrição (só se mencionado)
- tipo: receita/despesa (só se mencionado)
- categoria: categoria (só se mencionado)

Para investimentos, extraia:
- nome: nome do investimento (só se mencionado)
- valor: valor investido (só se mencionado)
- tipo: tipo do investimento (só se mencionado)

RESPONDA APENAS COM JSON válido.`

// Cache para intents detectados
const intentCache = new Map<string, DetectedAction>();

// Função para detectar intenção do usuário (OTIMIZADA)
export async function detectUserIntent(message: string, userContext: any, conversationHistory?: any[]): Promise<DetectedAction | null> {
  try {
    console.log('[DETECT_USER_INTENT] ⚡ Analisando mensagem ultra-rápida:', message);
    
    // 1. ⚡ Verificar cache primeiro (0.1s)
    const cacheKey = `${message}_${userContext.name}_${userContext.subscriptionPlan}`;
    const cachedIntent = intentCache.get(cacheKey);
    
    if (cachedIntent) {
      console.log(`⚡ Cache hit para intent: ${cachedIntent.type}`);
      return cachedIntent;
    }

    // 2. ⚡ Detecção rápida por palavras-chave (0.2s)
    const quickIntent = detectQuickIntent(message);
    if (quickIntent && quickIntent.confidence > 0.8) {
      console.log(`⚡ Intent detectado rapidamente: ${quickIntent.type}`);
      intentCache.set(cacheKey, quickIntent);
      return quickIntent;
    }

    // 3. ⚡ Análise de contexto da conversa (0.3s)
    const contextIntent = analyzeConversationContext(message, conversationHistory);
    if (contextIntent && contextIntent.confidence > 0.7) {
      console.log(`⚡ Intent detectado por contexto: ${contextIntent.type}`);
      intentCache.set(cacheKey, contextIntent);
      return contextIntent;
    }

    // 4. ⚡ Análise completa com IA (0.5s)
    const fullIntent = await detectFullIntent(message, userContext, conversationHistory);
    if (fullIntent) {
      intentCache.set(cacheKey, fullIntent);
      return fullIntent;
    }

    // 5. ⚡ Resposta padrão
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
    console.error('[DETECT_USER_INTENT] ❌ Erro na detecção:', error);
    return null;
  }
}

// ⚡ DETECÇÃO RÁPIDA POR PALAVRAS-CHAVE
function detectQuickIntent(message: string): DetectedAction | null {
  const lowerMessage = message.toLowerCase();
  
  // ✅ MELHORIA: Detecção mais precisa de transações
  const transactionKeywords = [
    'criar transação', 'criar transacao', 'nova transação', 'nova transacao',
    'adicionar transação', 'adicionar transacao', 'registrar transação', 'registrar transacao',
    'gastei', 'recebi', 'paguei', 'transferi', 'compra de', 'compra no',
    'despesa', 'receita', 'nova transação', 'quero registrar', 'quero adicionar'
  ];
  
  if (transactionKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // Regex para valor monetário
    const valorRegex = /(?:r\$|rs|reais|real|\$)?\s*([\d\.\,]+)(?:\s*(mil|milhao|milhões|milhares))?/i;
    const valorMatch = lowerMessage.match(valorRegex);
    let valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    if (valorMatch && valorMatch[2]) {
      if (valorMatch[2].startsWith('mil')) valor *= 1000;
      if (valorMatch[2].startsWith('milhao') || valorMatch[2].startsWith('milh')) valor *= 1000000;
    }
    
    // Descrição
    let descricao = '';
    const descMatch = lowerMessage.match(/no ([\w\s]+)/) || lowerMessage.match(/de ([\w\s]+)/);
    if (descMatch) descricao = descMatch[1].trim();
    
    // Tipo
    let tipo = 'despesa';
    if (lowerMessage.includes('recebi') || lowerMessage.includes('receita')) tipo = 'receita';
    
    // Se tem valor e descrição, automatiza
    if (valor && descricao) {
      return {
        type: 'CREATE_TRANSACTION',
        payload: {
          valor,
          descricao,
          tipo,
          categoria: 'Geral',
          conta: 'Principal',
          data: new Date().toISOString().split('T')[0]
        },
        confidence: 0.95,
        requiresConfirmation: false,
        successMessage: 'Transação registrada!',
        errorMessage: 'Erro ao criar transação',
        response: `💰 Transação de R$ ${valor.toFixed(2)} registrada: ${descricao}`
      };
    }
    
    // Tem valor mas não descrição
    if (valor && !descricao) {
      return {
        type: 'CREATE_TRANSACTION',
        payload: {
          valor,
          descricao: '',
          tipo,
          categoria: 'Geral',
          conta: 'Principal',
          data: new Date().toISOString().split('T')[0]
        },
        confidence: 0.8,
        requiresConfirmation: true,
        successMessage: '',
        errorMessage: '',
        response: `💰 Qual foi a descrição dessa transação de R$ ${valor.toFixed(2)}?`
      };
    }
    
    // Não tem valor
    return {
      type: 'CREATE_TRANSACTION',
      payload: {
        valor: 0,
        descricao: '',
        tipo,
        categoria: 'Geral',
        conta: 'Principal',
        data: new Date().toISOString().split('T')[0]
      },
      confidence: 0.7,
      requiresConfirmation: true,
      successMessage: '',
      errorMessage: '',
      response: '💰 Para registrar uma transação, preciso do valor e da descrição. Pode informar?'
    };
  }

  // ✅ MELHORIA: Detecção mais precisa de metas
  const goalKeywords = [
    'criar meta', 'nova meta', 'adicionar meta', 'quero juntar', 'quero economizar',
    'quero guardar', 'preciso juntar', 'preciso economizar', 'preciso guardar',
    'objetivo', 'meta de', 'meta para', 'juntar dinheiro', 'economizar dinheiro'
  ];
  
  if (goalKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // Regex para valor monetário
    const valorRegex = /(?:r\$|rs|reais|real|\$)?\s*([\d\.\,]+)(?:\s*(mil|milhao|milhões|milhares))?/i;
    const valorMatch = lowerMessage.match(valorRegex);
    let valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    if (valorMatch && valorMatch[2]) {
      if (valorMatch[2].startsWith('mil')) valor *= 1000;
      if (valorMatch[2].startsWith('milhao') || valorMatch[2].startsWith('milh')) valor *= 1000000;
    }
    
    // Tentar extrair nome/meta
    let metaNome = '';
    const nomeMatch = lowerMessage.match(/para ([\w\s]+)/);
    if (nomeMatch) metaNome = nomeMatch[1].trim();
    if (!metaNome) {
      const nome2 = lowerMessage.match(/meta (?:de|para)?\s*([\w\s]+)/);
      if (nome2) metaNome = nome2[1].trim();
    }
    
    // Se tem valor e nome, pode automatizar
    if (valor && metaNome) {
      return {
        type: 'CREATE_GOAL',
        payload: {
          meta: metaNome,
          valor_total: valor,
          data_conclusao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          categoria: 'Geral'
        },
        confidence: 0.95,
        requiresConfirmation: false,
        successMessage: 'Meta criada com sucesso!',
        errorMessage: 'Erro ao criar meta',
        response: `🎯 Meta "${metaNome}" criada com valor de R$ ${valor.toFixed(2)}!`
      };
    }
    
    // Se só tem valor OU nome, pedir o que falta
    if (valor && !metaNome) {
      return {
        type: 'CREATE_GOAL',
        payload: {
          meta: '',
          valor_total: valor,
          data_conclusao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          categoria: 'Geral'
        },
        confidence: 0.8,
        requiresConfirmation: true,
        successMessage: '',
        errorMessage: '',
        response: `🎯 Qual o objetivo dessa meta de R$ ${valor.toFixed(2)}?`
      };
    }
    
    if (!valor && metaNome) {
      return {
        type: 'CREATE_GOAL',
        payload: {
          meta: metaNome,
          valor_total: 0,
          data_conclusao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          categoria: 'Geral'
        },
        confidence: 0.7,
        requiresConfirmation: true,
        successMessage: '',
        errorMessage: '',
        response: `🎯 Qual valor você quer juntar para "${metaNome}"?`
      };
    }
    
    // Se não tem nada, pedir os dois
    return {
      type: 'CREATE_GOAL',
      payload: {
        meta: '',
        valor_total: 0,
        data_conclusao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        categoria: 'Geral'
      },
      confidence: 0.5,
      requiresConfirmation: true,
      successMessage: '',
      errorMessage: '',
      response: '🎯 Para criar uma meta, preciso saber o objetivo e o valor. Pode me dizer?'
    };
  }

  // ✅ MELHORIA: Detecção mais precisa de investimentos
  const investmentKeywords = [
    'criar investimento', 'novo investimento', 'adicionar investimento', 'investir',
    'aplicar', 'comprar ações', 'comprar acoes', 'tesouro direto', 'cdb', 'fii',
    'fundos', 'criptomoedas', 'criptomoeda', 'bitcoin', 'etf'
  ];
  
  if (investmentKeywords.some(keyword => lowerMessage.includes(keyword))) {
    // Regex para valor monetário
    const valorRegex = /(?:r\$|rs|reais|real|\$)?\s*([\d\.\,]+)(?:\s*(mil|milhao|milhões|milhares))?/i;
    const valorMatch = lowerMessage.match(valorRegex);
    let valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null;
    
    if (valorMatch && valorMatch[2]) {
      if (valorMatch[2].startsWith('mil')) valor *= 1000;
      if (valorMatch[2].startsWith('milhao') || valorMatch[2].startsWith('milh')) valor *= 1000000;
    }
    
    // Nome do investimento
    let nome = '';
    const nomeMatch = lowerMessage.match(/em ([\w\s]+)/);
    if (nomeMatch) nome = nomeMatch[1].trim();
    
    let tipo = 'Outro';
    if (nome.includes('tesouro')) tipo = 'Tesouro Direto';
    if (nome.includes('ação') || nome.includes('ações')) tipo = 'Ações';
    if (nome.includes('fundo')) tipo = 'Fundo';
    if (nome.includes('cripto') || nome.includes('bitcoin')) tipo = 'Criptomoedas';
    
    // Se tem valor e nome, automatiza
    if (valor && nome) {
      return {
        type: 'CREATE_INVESTMENT',
        payload: {
          nome,
          valor,
          tipo,
          data: new Date().toISOString().split('T')[0],
          instituicao: ''
        },
        confidence: 0.95,
        requiresConfirmation: false,
        successMessage: 'Investimento registrado!',
        errorMessage: 'Erro ao criar investimento',
        response: `📈 Investimento de R$ ${valor.toFixed(2)} em "${nome}" registrado!`
      };
    }
    
    // Tem valor mas não nome
    if (valor && !nome) {
      return {
        type: 'CREATE_INVESTMENT',
        payload: {
          nome: '',
          valor,
          tipo,
          data: new Date().toISOString().split('T')[0],
          instituicao: ''
        },
        confidence: 0.8,
        requiresConfirmation: true,
        successMessage: '',
        errorMessage: '',
        response: `📈 Qual o nome/tipo do investimento de R$ ${valor.toFixed(2)}?`
      };
    }
    
    // Tem nome mas não valor
    if (!valor && nome) {
      return {
        type: 'CREATE_INVESTMENT',
        payload: {
          nome,
          valor: 0,
          tipo,
          data: new Date().toISOString().split('T')[0],
          instituicao: ''
        },
        confidence: 0.7,
        requiresConfirmation: true,
        successMessage: '',
        errorMessage: '',
        response: `📈 Qual o valor que você investiu em "${nome}"?`
      };
    }
    
    // Não tem nada
    return {
      type: 'CREATE_INVESTMENT',
      payload: {
        nome: '',
        valor: 0,
        tipo,
        data: new Date().toISOString().split('T')[0],
        instituicao: ''
      },
      confidence: 0.5,
      requiresConfirmation: true,
      successMessage: '',
      errorMessage: '',
      response: '📈 Para registrar um investimento, preciso do valor e do nome/tipo. Pode informar?'
    };
  }

  // ----------- ANÁLISE -----------
  if (lowerMessage.includes('fazer análise') || lowerMessage.includes('analisar minhas finanças') || lowerMessage.includes('análise completa')) {
    return {
      type: 'ANALYZE_DATA',
      payload: { analysisType: 'comprehensive' },
      confidence: 0.7,
      requiresConfirmation: true,
      successMessage: 'Análise concluída!',
      errorMessage: 'Erro na análise',
      response: '📊 Vou fazer uma análise completa das suas finanças. Isso pode levar alguns segundos...'
    };
  }

  // ----------- CUMPRIMENTOS E DÚVIDAS -----------
  if (lowerMessage.match(/\b(oi|olá|tudo bem|como funciona|boa noite|bom dia|beleza|tudo certo|tudo joia)\b/)) {
    return {
      type: 'UNKNOWN',
      payload: {},
      confidence: 0.9,
      requiresConfirmation: false,
      successMessage: '',
      errorMessage: '',
      response: 'Olá! Sou o Finn, seu assistente financeiro. Posso ajudar com metas, transações, investimentos e muito mais! Como posso te ajudar hoje?'
    };
  }
  
  if (lowerMessage.match(/(o que você pode fazer|como você funciona|quais são suas funções|me ajude)/)) {
    return {
      type: 'UNKNOWN',
      payload: {},
      confidence: 0.9,
      requiresConfirmation: false,
      successMessage: '',
      errorMessage: '',
      response: 'Posso te ajudar com várias coisas! 🎯 Criar metas financeiras, 📈 acompanhar investimentos, 📊 fazer análises financeiras e muito mais. O que você gostaria de fazer?'
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
    const transactionContext = recentMessages.find(msg => 
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
          `💰 Perfeito! Transação de R$ ${valor.toFixed(2)} registrada. O que foi essa transação?` :
          '💰 Qual o valor da transação?'
      };
    }
  }

  return null;
}

// ⚡ ANÁLISE COMPLETA COM IA
async function detectFullIntent(message: string, userContext: any, conversationHistory?: any[]): Promise<DetectedAction | null> {
  try {
    // Analisar contexto da conversa para entender melhor
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-3);
      conversationContext = `\n\nContexto da conversa recente:\n${recentMessages.map((msg, index) => 
        `${index + 1}. ${msg.sender === 'user' ? 'Usuário' : 'Bot'}: ${msg.content}`
      ).join('\n')}`;
    }
    
    const prompt = `${ACTION_DETECTION_PROMPT}

Contexto do usuário:
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

    const aiResponse = await aiService.detectAutomatedAction(prompt);
    console.log('[DETECT_USER_INTENT] IA response:', aiResponse);
    
    if (!aiResponse || aiResponse.intent === 'UNKNOWN') {
      return {
        type: 'UNKNOWN',
        payload: {},
        confidence: aiResponse?.confidence || 0.0,
        requiresConfirmation: false,
        successMessage: '',
        errorMessage: '',
        response: aiResponse?.response || 'Como posso te ajudar hoje?'
      };
    }

    return {
      type: aiResponse.intent as any,
      payload: aiResponse.entities || {},
      confidence: aiResponse.confidence || 0.0,
      requiresConfirmation: aiResponse.requiresConfirmation || false,
      successMessage: '',
      errorMessage: '',
      response: aiResponse.response || 'Entendi sua solicitação. Como posso ajudar?'
    };

  } catch (error) {
    console.error('[DETECT_FULL_INTENT] ❌ Erro na análise completa:', error);
    return null;
  }
}

// Funções de mapeamento de dados
function mapTransactionData(entities: any): TransactionPayload {
  console.log('[mapTransactionData] Mapping entities:', entities);
  
  // Determinar o tipo baseado na descrição ou contexto
  let tipo = entities.tipo || 'despesa';
  
  // Se não foi especificado, inferir baseado na descrição
  if (!entities.tipo) {
    const descricao = entities.descricao?.toLowerCase() || '';
    if (descricao.includes('salário') || descricao.includes('receita') || descricao.includes('pagamento')) {
    tipo = 'receita';
    } else if (descricao.includes('transferência') || descricao.includes('transferencia')) {
      tipo = 'transferencia';
    } else {
      tipo = 'despesa'; // Padrão
    }
  }
  
  // Determinar categoria baseada na descrição
  let categoria = entities.categoria || 'Outros';
  if (!entities.categoria) {
    const descricao = entities.descricao?.toLowerCase() || '';
    if (descricao.includes('mercado') || descricao.includes('supermercado') || descricao.includes('alimentação') || descricao.includes('gas') || descricao.includes('gás')) {
      categoria = 'Alimentação';
    } else if (descricao.includes('combustível') || descricao.includes('gasolina') || descricao.includes('etanol')) {
      categoria = 'Transporte';
    } else if (descricao.includes('salário') || descricao.includes('receita')) {
      categoria = 'Trabalho';
    } else if (descricao.includes('manutenção') || descricao.includes('manutencao')) {
      categoria = 'Manutenção';
    }
  }
  
  const payload: TransactionPayload = {
    valor: parseFloat(entities.valor) || 0,
    descricao: entities.descricao || 'Transação',
    tipo: tipo,
    categoria: categoria,
    conta: entities.conta || 'Conta Corrente',
    data: entities.data || new Date().toISOString().split('T')[0]
  };
  
  console.log('[mapTransactionData] Mapped payload:', payload);
  return payload;
}

function mapInvestmentData(entities: any): InvestmentPayload {
  // Se não há dados suficientes, retornar payload vazio
  if (!entities.valor || !entities.tipo || !entities.nome) {
    return {
      nome: '',
      valor: 0,
      tipo: '',
      data: new Date().toISOString().split('T')[0],
      instituicao: undefined
    };
  }
  
  // Garantir que o valor seja um número válido
  const valor = parseFloat(entities.valor) || 0;
  
  return {
    nome: entities.nome || '',
    valor: valor,
    tipo: entities.tipo || '',
    data: entities.data || new Date().toISOString().split('T')[0],
    instituicao: entities.conta || entities.instituicao || undefined
  };
}

function mapGoalData(entities: any): GoalPayload {
  // Função para converter datas naturais para formato válido
  const parseNaturalDate = (dateString: string): string => {
    if (!dateString) {
      // Data padrão: 1 ano a partir de hoje
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      return futureDate.toISOString().split('T')[0];
    }

    const lowerDate = dateString.toLowerCase();
    
    // Mapear datas naturais para datas específicas
    if (lowerDate.includes('final de dezembro') || lowerDate.includes('dezembro')) {
      const year = new Date().getFullYear();
      return `${year}-12-31`;
    }
    
    if (lowerDate.includes('final do ano') || lowerDate.includes('fim do ano')) {
      const year = new Date().getFullYear();
      return `${year}-12-31`;
    }
    
    if (lowerDate.includes('próximo ano') || lowerDate.includes('ano que vem')) {
      const year = new Date().getFullYear() + 1;
      return `${year}-12-31`;
    }
    
    if (lowerDate.includes('6 meses') || lowerDate.includes('seis meses')) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
      return futureDate.toISOString().split('T')[0];
    }
    
    if (lowerDate.includes('3 meses') || lowerDate.includes('três meses')) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
      return futureDate.toISOString().split('T')[0];
    }
    
    // Se não conseguir mapear, usar data padrão
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    return futureDate.toISOString().split('T')[0];
  };

  // Se não há dados suficientes, retornar payload vazio
  if (!entities.valor_total || !entities.meta) {
    return {
      meta: '',
      valor_total: 0,
      data_conclusao: parseNaturalDate(entities.data_conclusao),
      categoria: ''
    };
  }

  // Garantir que o valor seja um número válido
  const valor_total = parseFloat(entities.valor_total) || 0;

  return {
    meta: entities.meta || '',
    valor_total: valor_total,
    data_conclusao: parseNaturalDate(entities.data_conclusao),
    categoria: entities.categoria || 'Outros'
  };
}

// Gerar perguntas de acompanhamento
function generateFollowUpQuestions(intent: string, entities: any): string[] {
  const questions = {
    'CREATE_TRANSACTION': [
      'Quer que eu analise seus gastos do mês?',
      'Posso sugerir formas de economizar?',
      'Quer ver um relatório de suas despesas?'
    ],
    'CREATE_INVESTMENT': [
      'Quer que eu analise seu portfólio?',
      'Posso sugerir outros investimentos?',
      'Quer ver a performance dos seus investimentos?'
    ],
    'CREATE_GOAL': [
      'Quer que eu crie um plano de economia?',
      'Posso analisar se a meta é realista?',
      'Quer ver outras metas relacionadas?'
    ],
    'ANALYZE_DATA': [
      'Quer que eu gere um relatório detalhado?',
      'Posso sugerir melhorias?',
      'Quer comparar com períodos anteriores?'
    ]
  };

  return questions[intent as keyof typeof questions] || [];
}

// Função auxiliar para verificar se os dados necessários para a ação foram completos
function hasCompleteData(action: any): boolean {
  switch (action.type) {
    case 'CREATE_TRANSACTION':
      return !!(action.payload.valor && action.payload.descricao && action.payload.tipo);
    case 'CREATE_INVESTMENT':
      return !!(action.payload.valor && action.payload.nome && action.payload.tipo);
    case 'CREATE_GOAL':
      return !!(action.payload.valor_total && action.payload.meta);
    case 'ANALYZE_DATA':
    case 'GENERATE_REPORT':
      return true;
    default:
      return false;
  }
}

// Controller principal para ações automatizadas
export const handleAutomatedActions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      totalMetas: metas.length,
      // Dados reais das coleções
      transacoes: transacoes,
      investimentos: investimentos,
      metas: metas,
      // Resumos dos dados
      resumoTransacoes: transacoes.length > 0 ? {
        total: transacoes.length,
        categorias: transacoes.reduce((acc: any, t: any) => {
          const cat = t.categoria || 'Sem categoria';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {}),
        ultimas: transacoes.slice(-5).map(t => ({
          descricao: t.descricao,
          valor: t.valor,
          categoria: t.categoria,
          tipo: t.tipo,
          data: t.data
        }))
      } : null,
      resumoInvestimentos: investimentos.length > 0 ? {
        total: investimentos.length,
        tipos: investimentos.reduce((acc: any, i: any) => {
          const tipo = i.tipo || 'Sem tipo';
          acc[tipo] = (acc[tipo] || 0) + 1;
          return acc;
        }, {}),
        ultimos: investimentos.slice(-5).map(i => ({
          nome: i.nome,
          valor: i.valor,
          tipo: i.tipo,
          data: i.data
        }))
      } : null,
      resumoMetas: metas.length > 0 ? {
        total: metas.length,
        status: metas.reduce((acc: any, m: any) => {
          const status = m.prioridade || 'media';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {}),
        ativas: metas.filter((m: any) => m.valor_atual < m.valor_total).slice(-5).map(m => ({
          titulo: m.meta,
          valor: m.valor_total,
          valorAtual: m.valor_atual,
          prazo: m.data_conclusao,
          prioridade: m.prioridade
        }))
      } : null
    };

    console.log('[AUTOMATED_ACTIONS] Contexto do usuário construído:', {
      name: userContext.name,
      subscriptionPlan: userContext.subscriptionPlan,
      subscriptionStatus: userContext.subscriptionStatus,
      totalTransacoes: userContext.totalTransacoes,
      totalInvestimentos: userContext.totalInvestimentos,
      totalMetas: userContext.totalMetas,
      hasTransactions: userContext.hasTransactions,
      hasInvestments: userContext.hasInvestments,
      hasGoals: userContext.hasGoals
    });

    // Detectar ação automatizada
    const detectedAction = await detectUserIntent(message, userContext);
    
    console.log('[AUTOMATED_ACTIONS] Detected action:', JSON.stringify(detectedAction, null, 2));
    console.log('[AUTOMATED_ACTIONS] Confidence threshold check:', detectedAction?.confidence && detectedAction.confidence > 0.85);

    if (detectedAction && detectedAction.confidence && detectedAction.confidence > 0.85) {
      console.log('[AUTOMATED_ACTIONS] High confidence action detected, executing automatically');
      
      // ✅ NOVA LÓGICA: Executar automaticamente se confiança é alta
      try {
        let result;
        switch (detectedAction.type) {
          case 'CREATE_TRANSACTION':
            result = await createTransaction(user._id.toString(), detectedAction.payload);
            break;
          case 'CREATE_INVESTMENT':
            result = await createInvestment(user._id.toString(), detectedAction.payload);
            break;
          case 'CREATE_GOAL':
            result = await createGoal(user._id.toString(), detectedAction.payload);
            break;
          case 'ANALYZE_DATA':
            result = await analyzeData(user._id.toString(), detectedAction.payload);
            break;
          case 'GENERATE_REPORT':
            result = await generateReport(user._id.toString(), detectedAction.payload);
            break;
          default:
            throw new Error('Ação não suportada');
        }

        // Retornar sucesso com confirmação natural
        res.status(200).json({
          success: true,
          type: 'ACTION_DETECTED',
          text: detectedAction.successMessage,
          automatedAction: {
            ...detectedAction,
            executed: true,
            result: result
          }
        });
        return;
      } catch (actionError) {
        console.error('[AUTOMATED_ACTIONS] Error executing action:', actionError);
        // Se falhar, retornar para confirmação manual
        res.status(200).json({
          success: true,
          type: 'ACTION_DETECTED',
          text: 'Detectei uma ação que posso executar. Quer que eu tente novamente?',
          automatedAction: {
            ...detectedAction,
            executed: false,
            error: String(actionError)
          }
        });
        return;
      }
    } else if (detectedAction && detectedAction.confidence && detectedAction.confidence > 0.7) {
      console.log('[AUTOMATED_ACTIONS] Medium confidence action, returning for confirmation');
      // Confiança média - retornar para confirmação
      res.status(200).json({
        success: true,
        type: 'ACTION_DETECTED',
        text: detectedAction.successMessage,
        automatedAction: detectedAction
      });
      return;
    } else {
      console.log('[AUTOMATED_ACTIONS] Processing as normal chat message');
      // Processar como mensagem normal do chatbot
      try {
        const response = await aiService.generateContextualResponse(
          '', // systemPrompt vazio ativa o FinnEngine
          message,
          [],
          userContext // Passar contexto completo do usuário
        );

        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: response.text || 'Olá! Como posso te ajudar hoje?',
          messageId: uuidv4()
        });
        return;
      } catch (aiError) {
        console.error('Erro ao gerar resposta da IA:', aiError);
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
    console.error('Erro no processamento automático:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar solicitação' 
    });
    return;
  }
};

// Executar ação confirmada
export const executeAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.uid;
    const { action, payload, chatId } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return;
    }

    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      return;
    }

    // Se a ação for UNKNOWN, retornar resposta conversacional
    if (action === 'UNKNOWN') {
      res.status(200).json({
        success: true,
        message: 'Olá! Como posso te ajudar hoje? Posso ajudar com metas, transações, investimentos e muito mais!',
        type: 'CONVERSATION'
      });
      return;
    }

    // NOVO: Checar se todos os dados obrigatórios estão presentes
    const actionObj = { type: action, payload };
    if (!hasCompleteData(actionObj)) {
      // Descobrir quais campos estão faltando
      let missingFields: string[] = [];
      switch (action) {
        case 'CREATE_GOAL':
          if (!payload.meta) missingFields.push('meta');
          if (!payload.valor_total) missingFields.push('valor_total');
          if (!payload.data_conclusao) missingFields.push('data_conclusao');
          break;
        case 'CREATE_TRANSACTION':
          if (!payload.valor) missingFields.push('valor');
          if (!payload.descricao) missingFields.push('descricao');
          if (!payload.tipo) missingFields.push('tipo');
          break;
        case 'CREATE_INVESTMENT':
          if (!payload.valor) missingFields.push('valor');
          if (!payload.nome) missingFields.push('nome');
          if (!payload.tipo) missingFields.push('tipo');
          break;
      }
      res.status(200).json({
        success: false,
        message: `Para executar essa ação, preciso de mais informações: ${missingFields.join(', ')}. Por favor, preencha os campos faltantes.`,
        missingFields,
        requiresConfirmation: true
      });
      return;
    }

    let result;

    switch (action) {
      case 'CREATE_TRANSACTION':
        result = await createTransaction(user._id.toString(), payload);
        break;
      case 'CREATE_INVESTMENT':
        result = await createInvestment(user._id.toString(), payload);
        break;
      case 'CREATE_GOAL':
        result = await createGoal(user._id.toString(), payload);
        break;
      case 'ANALYZE_DATA':
        result = await analyzeData(user._id.toString(), payload);
        break;
      case 'GENERATE_REPORT':
        result = await generateReport(user._id.toString(), payload);
        break;
      default:
        res.status(400).json({ success: false, message: 'Ação não suportada' });
        return;
    }

    res.status(200).json({
      success: true,
      message: 'Ação executada com sucesso!',
      data: result
    });

  } catch (error) {
    console.error('Erro ao executar ação:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao executar ação' 
    });
  }
};

// Funções auxiliares para executar ações
export async function createTransaction(userId: string, payload: any) {
  const transacao = new Transacoes({
    userId,
    ...payload,
    createdAt: new Date()
  });
  
  await transacao.save();
  return transacao;
}

export async function createInvestment(userId: string, payload: any) {
  // Validar e mapear o tipo de investimento
  const tipoMapping: { [key: string]: string } = {
    'criptomoeda': 'Criptomoedas',
    'criptomoedas': 'Criptomoedas',
    'crypto': 'Criptomoedas',
    'bitcoin': 'Criptomoedas',
    'btc': 'Criptomoedas',
    'tesouro': 'Tesouro Direto',
    'tesouro direto': 'Tesouro Direto',
    'acoes': 'Ações',
    'ações': 'Ações',
    'fii': 'Fundos Imobiliários',
    'fundos imobiliarios': 'Fundos Imobiliários',
    'fundos imobiliário': 'Fundos Imobiliários',
    'fundos imobiliários': 'Fundos Imobiliários',
    'fundos imobiliario': 'Fundos Imobiliários', // Adicionado sem acento
    'previdencia': 'Previdência Privada',
    'previdência': 'Previdência Privada',
    'etf': 'ETF',
    'internacional': 'Internacional',
    'renda variavel': 'Renda Variável',
    'renda variável': 'Renda Variável',
    'renda fixa': 'Renda Fixa',
    'cdb': 'CDB',
    'lci': 'LCI',
    'lca': 'LCA',
    'cdi': 'CDI'
  };

  // Mapear o tipo se necessário
  let tipo = payload.tipo;
  if (tipoMapping[tipo.toLowerCase()]) {
    tipo = tipoMapping[tipo.toLowerCase()];
  }

  // Validar valor mínimo
  const valor = parseFloat(payload.valor) || 0;
  if (valor < 0.01) {
    throw new Error('O valor do investimento deve ser maior que R$ 0,01');
  }

  // Validar se o tipo é válido
  const tiposValidos = [
    'Renda Fixa', 'Tesouro Direto', 'Ações', 'Fundos Imobiliários',
    'Criptomoedas', 'Previdência Privada', 'ETF', 'Internacional', 'Renda Variável',
    'CDB', 'LCI', 'LCA', 'CDI', 'Poupança', 'Fundos de Investimento',
    'Debêntures', 'CRI', 'CRA', 'Letras de Câmbio', 'Certificados de Operações Estruturadas',
    'Fundos Multimercado', 'Fundos de Ações', 'Fundos Cambiais', 'Fundos de Renda Fixa',
    'Fundos de Previdência', 'Fundos de Investimento Imobiliário'
  ];
  
  if (!tiposValidos.includes(tipo)) {
    throw new Error(`Tipo de investimento inválido. Tipos válidos: ${tiposValidos.join(', ')}`);
  }

  const investimento = new Investimento({
    userId,
    nome: payload.nome || 'Investimento',
    tipo,
    valor,
    data: payload.data ? new Date(payload.data) : new Date(),
    instituicao: payload.instituicao,
    createdAt: new Date()
  });
  
  await investimento.save();
  return investimento;
}

export async function createGoal(userId: string, payload: any) {
  const goal = new Goal({
    userId,
    ...payload,
    valor_atual: 0,
    prioridade: 'media',
    createdAt: new Date()
  });
  
  await goal.save();
  return goal;
}

export async function analyzeData(userId: string, payload: any) {
  // Implementar análise de dados
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
      valorTotalInvestido: investimentos.reduce((sum, inv) => sum + inv.valor, 0),
      valorTotalMetas: metas.reduce((sum, meta) => sum + meta.valor_total, 0)
    }
  };
}

export async function generateReport(userId: string, payload: any) {
  // Implementar geração de relatório
  const analysis = await analyzeData(userId, payload);
  
  return {
    reportId: uuidv4(),
    generatedAt: new Date(),
    type: payload.reportType || 'general',
    data: analysis
  };
} 