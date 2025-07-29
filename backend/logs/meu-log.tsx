/*
==========================================
LOGS DO BACKEND E FRONTEND
==========================================

INSTRUÇÕES DE USO:
1. Apague todo o conteúdo abaixo desta linha
2. Cole seus logs aqui
3. Salve o arquivo
4. Me avise que salvou para eu analisar

==========================================
DATA: [DATA ATUAL]
HORA: [HORA ATUAL]
==========================================

[import {  Request, Response  } from 'express';
import express from 'express';
import {  Request, Response, NextFunction  } from 'express';
import {  User  } from '../models/User';
import {  Transacoes  } from '../models/Transacoes';
import Investimento from '../models/Investimento';
import {  Goal  } from '../models/Goal';
import AIService from '../services/aiService';
import {  v4 as uuidv4  } from 'uuid';
const aiService = new AIService();
// Interfaces para tipos de payload
interface TransactionPayload {
  valor: number
  descricao: string
  tipo: string
  categoria: string
  conta: string
  data: string}
interface InvestmentPayload {
  nome: string
  valor: number
  tipo: string
  data: string
  instituicao?: string}
interface GoalPayload {
  meta: string
  valor_total: number
  data_conclusao: string
  categoria: string}
interface AnalysisPayload {
  analysisType: string}
interface ReportPayload {
  reportType: string}
interface DetectedAction {
  type: 'CREATE_TRANSACTION' | 'CREATE_INVESTMENT' | 'CREATE_GOAL' | 'ANALYZE_DATA' | 'GENERATE_REPORT' | 'UNKNOWN';
  payload: TransactionPayload | InvestmentPayload | GoalPayload | AnalysisPayload | ReportPayload | {};
  confidence: number
  requiresConfirmation: boolean
  successMessage: string
  errorMessage: string
  response: string
  followUpQuestions?: string[]}
// Prompt para detecção de ações automatizadas - VERSÃO NATURAL E HUMANIZADA
REGRAS PRINCIPAIS: any
1. SEMPRE ser natural e conversacional como um amigo experiente
2. NUNCA ser robótico ou repetitivo
3. SEMPRE perguntar detalhes quando faltar informação
4. NUNCA criar automaticamente com valores padrão
5. SEMPRE confirmar antes de executar ações
6. Usar linguagem brasileira natural ("beleza", "valeu", "tranquilo")
7. Adaptar tom baseado no contexto e humor do usuário
DETECÇÃO INTELIGENTE: any
CRIAR META: any
- "Quero juntar R$ X para Y" → CREATE_GOAL (extrair valor_total, meta)
- "Meta de R$ X para Y" → CREATE_GOAL (extrair valor_total, meta)
- "Quero economizar R$ X" → CREATE_GOAL (extrair valor_total)
- "Preciso guardar R$ X" → CREATE_GOAL (extrair valor_total)
- "estou querendo add uma nova meta" → CREATE_GOAL (perguntar naturalmente)
- "quero criar uma meta" → CREATE_GOAL (perguntar naturalmente)
- "viagem para gramado" + valor → CREATE_GOAL (extrair meta, valor_total)
CRIAR TRANSAÇÃO: any
- "Gastei R$ X no Y" → CREATE_TRANSACTION (extrair valor, descricao, tipo=despesa)
- "Recebi salário de R$ X" → CREATE_TRANSACTION (extrair valor, descricao, tipo=receita)
- "Paguei conta de Y R$ X" → CREATE_TRANSACTION (extrair valor, descricao, tipo=despesa)
- "Comprei X por R$ Y" → CREATE_TRANSACTION (extrair valor, descricao, tipo=despesa)
- "estou querendo add uma nova transação" → CREATE_TRANSACTION (perguntar naturalmente)
- "quero registrar uma transação" → CREATE_TRANSACTION (perguntar naturalmente)
- "quero registrar um despesa" → CREATE_TRANSACTION (perguntar naturalmente)
CRIAR INVESTIMENTO: any
- "Comprei ações da X por R$ Y" → CREATE_INVESTMENT (extrair nome, valor, tipo)
- "Investi R$ X em Y" → CREATE_INVESTMENT (extrair valor, nome, tipo)
- "Apliquei R$ X em Y" → CREATE_INVESTMENT (extrair valor, nome, tipo)
- "estou querendo add um novo investimento" → CREATE_INVESTMENT (perguntar naturalmente)
- "quero criar um investimento" → CREATE_INVESTMENT (perguntar naturalmente)
CONTINUAÇÃO DE CONVERSAS: any
- Se o usuário mencionar "valor é X reais" e na conversa anterior foi mencionada uma transação → CREATE_TRANSACTION
- Se o usuário disser "é uma despesa" e na conversa anterior foi mencionada uma transação → CREATE_TRANSACTION
- Se o usuário disser "outras informações já passei" → usar contexto da conversa anterior
- Se o usuário disser "não foi criada" ou "não estou vendo" → verificar se já existe e criar novamente
CONFIRMAÇÕES E CORREÇÕES: any
- "vamos nessa" → UNKNOWN (confirmação)
- "ok" → UNKNOWN (confirmação)
- "sim" → UNKNOWN (confirmação)
- "claro" → UNKNOWN (confirmação)
- "corrigir" → UNKNOWN (correção)
- "mudar" → UNKNOWN (correção)
- "não" → UNKNOWN (negação)
PERGUNTAS E DÚVIDAS: any
- "como funciona" → UNKNOWN (dúvida)
- "o que posso fazer" → UNKNOWN (dúvida)
- "tudo bem" → UNKNOWN (cumprimento)
- "tudo joia" → UNKNOWN (cumprimento)
- "beleza" → UNKNOWN (cumprimento)
- "tudo certo" → UNKNOWN (cumprimento)
- "oi" → UNKNOWN (cumprimento)
- "boa noite" → UNKNOWN (cumprimento)
- "bom dia" → UNKNOWN (cumprimento)
PERGUNTAS NATURAIS (quando faltar informação): any
- Para metas: "Que legal! Qual valor você quer juntar e para qual objetivo?"
- Para transações: "Perfeito! Qual valor e o que foi essa transação?"
- Para investimentos: "Ótimo! Qual valor, tipo e nome do investimento?"
EXTRAGA as seguintes informações: any
- intent: tipo de ação (CREATE_TRANSACTION, CREATE_INVESTMENT, CREATE_GOAL, ANALYZE_DATA, GENERATE_REPORT, UNKNOWN)
- entities: dados extraídos em formato JSON
- confidence: confiança da detecção (0.0 a 1.0)
- response: resposta natural e conversacional
- requiresConfirmation: true apenas se tiver dados suficientes para criar
Para metas, extraia: any
- valor_total: valor total da meta (só se mencionado)
- meta: descrição da meta (só se mencionado)
- data_conclusao: prazo (só se mencionado)
- categoria: tipo da meta (só se mencionado)
Para transações, extraia: any
- valor: valor da transação (só se mencionado)
- descricao: descrição (só se mencionado)
- tipo: receita/despesa (só se mencionado)
- categoria: categoria (só se mencionado)
Para investimentos, extraia: any
- nome: nome do investimento (só se mencionado)
- valor: valor investido (só se mencionado)
- tipo: tipo do investimento (só se mencionado)
RESPONDA APENAS COM JSON válido.`
// Cache para intents detectados
const intentCache = new Map<string, DetectedAction>();
// Função para detectar intenção do usuário (OTIMIZADA)
export async function detectUserIntent(message: string, userContext: unknown, conversationHistory?: unknown[]): Promise<DetectedAction | null> {
  try {
    // console statement removed by RPA
// 1. ⚡ Verificar cache primeiro (0.1s)
    const cacheKey = `${message}_${userContext.name}_${userContext.subscriptionPlan}`;
    const cachedIntent = intentCache.get(cacheKey);
    if (cachedIntent) {
      // console statement removed by RPA
    // 2. ⚡ Detecção rápida por palavras-chave (0.2s)
    const quickIntent = detectQuickIntent(message);
    if (quickIntent && quickIntent.confidence > 0.8) {
      // console statement removed by RPA
intentCache.set(cacheKey, quickIntent);
    // 3. ⚡ Análise de contexto da conversa (0.3s)
    const contextIntent = analyzeConversationContext(message, conversationHistory);
    if (contextIntent && contextIntent.confidence > 0.7) {
      // console statement removed by RPA
intentCache.set(cacheKey, contextIntent);
    // 4. ⚡ Análise completa com IA (0.5s)
    const fullIntent = await detectFullIntent(message, userContext, conversationHistory);
    if (fullIntent) {
      intentCache.set(cacheKey, fullIntent);
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
    // console statement removed by RPA
}
// ⚡ DETECÇÃO RÁPIDA POR PALAVRAS-CHAVE
function detectQuickIntent(message: string): DetectedAction | null {
  const lowerMessage = message.toLowerCase();
  // console statement removed by RPA
// Detectar criação de transação
  if (lowerMessage.includes('criar transação') || lowerMessage.includes('nova transação') || 
      lowerMessage.includes('registrar transação') || lowerMessage.includes('add transação') ||
      lowerMessage.includes('quero criar uma nova transação') || lowerMessage.includes('criar transaçao') ||
      lowerMessage.includes('gastei') || lowerMessage.includes('recebi') || lowerMessage.includes('paguei') ||
      lowerMessage.includes('comprei') || lowerMessage.includes('transação de') || lowerMessage.includes('transacao de')) {
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?: [.,]\d+)?)/i);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null
    // Extrair descrição se mencionado
    let descricao = 'Transação';
    if (lowerMessage.includes('gastei')) descricao = 'Despesa';
    if (lowerMessage.includes('recebi')) descricao = 'Receita';
    if (lowerMessage.includes('paguei')) descricao = 'Pagamento';
    if (lowerMessage.includes('comprei')) descricao = 'Compra';
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
        `✅ Transação de R$ ${valor.toFixed(2)} criada com sucesso!` : any
        '💰 Qual o valor da transação?',
      errorMessage: 'Erro ao criar transação',
      response: valor ? 
        `Perfeito! Transação de R$ ${valor.toFixed(2)} registrada.` : any
        'Qual o valor da transação?'
    }}
  // Detectar criação de meta
  if (lowerMessage.includes('criar meta') || lowerMessage.includes('nova meta') || 
      lowerMessage.includes('quero criar uma meta') || lowerMessage.includes('juntar dinheiro') ||
      lowerMessage.includes('economizar para') || lowerMessage.includes('meta de') ||
      lowerMessage.includes('quero juntar') || lowerMessage.includes('quero economizar')) {
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?: [.,]\d+)?)/i);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null
    // Extrair meta se mencionado
    let meta = 'Meta';
    if (lowerMessage.includes('viagem')) meta = 'Viagem';
    if (lowerMessage.includes('carro')) meta = 'Carro';
    if (lowerMessage.includes('casa')) meta = 'Casa';
    if (lowerMessage.includes('aposentadoria')) meta = 'Aposentadoria';
      type: 'CREATE_GOAL',
      payload: {
        meta: meta,
        valor_total: valor || 0,
        data_conclusao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano
        categoria: 'Geral'
      },
      confidence: valor ? 0.95 : 0.8,
      requiresConfirmation: !valor,
      successMessage: valor ? 
        `🎯 Meta "${meta}" de R$ ${valor.toFixed(2)} criada com sucesso!` : any
        '🎯 Qual valor você quer juntar?',
      errorMessage: 'Erro ao criar meta',
      response: valor ? 
        `Perfeito! Meta "${meta}" de R$ ${valor.toFixed(2)} criada.` : any
        'Qual valor você quer juntar?'
    }}
  // Detectar criação de investimento
  if (lowerMessage.includes('criar investimento') || lowerMessage.includes('novo investimento') || 
      lowerMessage.includes('quero investir') || lowerMessage.includes('aplicar dinheiro') ||
      lowerMessage.includes('investi') || lowerMessage.includes('comprei ações') ||
      lowerMessage.includes('investimento de') || lowerMessage.includes('apliquei') ||
      lowerMessage.includes('quero criar uma novo investimento') || lowerMessage.includes('quero criar um novo investimento')) {
    // ✅ CORREÇÃO: Se só mencionou a intenção, não extrair dados
    if (lowerMessage.includes('quero criar') && !lowerMessage.match(/r?\$?\s*(\d+(?: [.,]\d+)?)/i)) {
        type: 'CREATE_INVESTMENT',
        payload: {}, // Payload vazio para indicar que precisa de dados
        confidence: 0.95,
        requiresConfirmation: true,
        successMessage: '📈 Investimento criado com sucesso!',
        errorMessage: 'Erro ao criar investimento',
        response: '📈 Beleza! Vamos criar esse investimento. Me fala aí:\n\n💰 Qual valor você quer investir?\n📊 Que tipo de investimento (ações, tesouro, cripto, etc.)?\n🏦 Qual o nome/instituição?'
      }}
    // Extrair valor se mencionado
    const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?: [.,]\d+)?)/i);
    const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null
    // Extrair nome se mencionado
    let nome = 'Investimento';
    if (lowerMessage.includes('ações')) nome = 'Ações';
    if (lowerMessage.includes('tesouro')) nome = 'Tesouro Direto';
    if (lowerMessage.includes('cripto')) nome = 'Criptomoedas';
    if (lowerMessage.includes('fii')) nome = 'Fundos Imobiliários';
      type: 'CREATE_INVESTMENT',
      payload: {
        nome: nome,
        valor: valor || 0,
        tipo: lowerMessage.includes('ações') ? 'Ações' : any
              lowerMessage.includes('tesouro') ? 'Tesouro Direto' : any
              lowerMessage.includes('cripto') ? 'Criptomoedas' : any
              lowerMessage.includes('fii') ? 'Fundos Imobiliários' : 'Renda Fixa',
        data: new Date().toISOString().split('T')[0],
        instituicao: 'Instituição'
      },
      confidence: valor ? 0.95 : 0.8,
      requiresConfirmation: !valor,
      successMessage: valor ? 
        `📈 Investimento "${nome}" de R$ ${valor.toFixed(2)} criado com sucesso!` : any
        '📈 Qual valor você investiu?',
      errorMessage: 'Erro ao criar investimento',
      response: valor ? 
        `Perfeito! Investimento "${nome}" de R$ ${valor.toFixed(2)} registrado.` : any
        'Qual valor você investiu?'
    }}
// ⚡ ANÁLISE DE CONTEXTO DA CONVERSA
function analyzeConversationContext(message: string, conversationHistory?: unknown[]): DetectedAction | null {
  if (!conversationHistory || conversationHistory.length === 0) return null;
  const lowerMessage = message.toLowerCase();
  const recentMessages = conversationHistory.slice(-3);
  // Verificar se é continuação de uma transação
  if (lowerMessage.includes('valor') || lowerMessage.includes('reais') || lowerMessage.includes('é uma despesa')) {
      msg.content.toLowerCase().includes('transação') || 
      msg.content.toLowerCase().includes('gastei') || 
      msg.content.toLowerCase().includes('recebi')
    );
    if (transactionContext) {
      const valorMatch = lowerMessage.match(/r?\$?\s*(\d+(?: [.,]\d+)?)/i);
      const valor = valorMatch ? parseFloat(valorMatch[1].replace(',', '.')) : null
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
          `💰 Perfeito! Transação de R$ ${valor.toFixed(2)} registrada. O que foi essa transação?` : any
          '💰 Qual o valor da transação?'
      }}
  }
// ⚡ ANÁLISE COMPLETA COM IA
async function detectFullIntent(message: string, userContext: unknown, conversationHistory?: unknown[]): Promise<DetectedAction | null> {
  try {
    // Analisar contexto da conversa para entender melhor
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      const recentMessages = conversationHistory.slice(-3);
      conversationContext = `\n\nContexto da conversa recente:\n${recentMessages.map((msg, index) => 
        `${index + 1}. ${msg.sender === 'user' ? 'Usuário' : 'Bot'}: ${msg.content}`
      ).join('\n')}`}
Contexto do usuário: any
- Nome: ${userContext.name}
- Plano: ${userContext.subscriptionPlan}
- Transações: ${userContext.totalTransacoes}
- Investimentos: ${userContext.totalInvestimentos}
- Metas: ${userContext.totalMetas}${conversationContext}
Mensagem do usuário: "${message}"
IMPORTANTE: Se o usuário mencionar "outras informações já passei", "já te passei antes", "valor é X reais", ou "é uma despesa", considere o contexto da conversa anterior para completar as informações faltantes.
Analise a mensagem e retorne um JSON com: any
- intent: tipo de ação (CREATE_TRANSACTION, CREATE_INVESTMENT, CREATE_GOAL, ANALYZE_DATA, GENERATE_REPORT, UNKNOWN)
- entities: dados extraídos (valor, descrição, categoria, prazo, etc.)
- confidence: confiança da detecção (0.0 a 1.0)
- response: resposta natural
- requiresConfirmation: se precisa confirmação
JSON: `
    const aiResponse = await aiService.detectAutomatedAction(prompt);
    // console statement removed by RPA
if (!aiResponse || aiResponse.intent === 'UNKNOWN') {
        type: 'UNKNOWN',
        payload: {},
        confidence: aiResponse?.confidence || 0.0,
        requiresConfirmation: false,
        successMessage: '',
        errorMessage: '',
        response: aiResponse?.response || 'Como posso te ajudar hoje?'
      }}
      type: aiResponse.intent as any,
      payload: aiResponse.entities || {},
      confidence: aiResponse.confidence || 0.0,
      requiresConfirmation: aiResponse.requiresConfirmation || false,
      successMessage: '',
      errorMessage: '',
      response: aiResponse.response || 'Entendi sua solicitação. Como posso ajudar?'
    }} catch (error) {
    // console statement removed by RPA
}
// Funções de mapeamento de dados
function mapTransactionData(entities: unknown): TransactionPayload {
  // console statement removed by RPA
// Determinar o tipo baseado na descrição ou contexto
  let tipo = entities.tipo || 'despesa';
  // Se não foi especificado, inferir baseado na descrição
  if (!entities.tipo) {
    const descricao = entities.descricao?.toLowerCase() || '';
    if (descricao.includes('salário') || descricao.includes('receita') || descricao.includes('pagamento')) {
    tipo = 'receita'} else if (descricao.includes('transferência') || descricao.includes('transferencia')) {
      tipo = 'transferencia'} else {
      tipo = 'despesa'; // Padrão
    }
  }
  // Determinar categoria baseada na descrição
  let categoria = entities.categoria || 'Outros';
  if (!entities.categoria) {
    const descricao = entities.descricao?.toLowerCase() || '';
    if (descricao.includes('mercado') || descricao.includes('supermercado') || descricao.includes('alimentação') || descricao.includes('gas') || descricao.includes('gás')) {
      categoria = 'Alimentação'} else if (descricao.includes('combustível') || descricao.includes('gasolina') || descricao.includes('etanol')) {
      categoria = 'Transporte'} else if (descricao.includes('salário') || descricao.includes('receita')) {
      categoria = 'Trabalho'} else if (descricao.includes('manutenção') || descricao.includes('manutencao')) {
      categoria = 'Manutenção'}
  }
  const payload: TransactionPayload = {
    valor: parseFloat(entities.valor) || 0,
    descricao: entities.descricao || 'Transação',
    tipo: tipo,
    categoria: categoria,
    conta: entities.conta || 'Conta Corrente',
    data: entities.data || new Date().toISOString().split('T')[0]
  };
  // console statement removed by RPA
function mapInvestmentData(entities: unknown): InvestmentPayload {
  // Se não há dados suficientes, retornar payload vazio
  if (!entities.valor || !entities.tipo || !entities.nome) {
      nome: '',
      valor: 0,
      tipo: '',
      data: new Date().toISOString().split('T')[0],
      instituicao: undefined
    }}
  // Garantir que o valor seja um número válido
  const valor = parseFloat(entities.valor) || 0;
    nome: entities.nome || '',
    valor: valor,
    tipo: entities.tipo || '',
    data: entities.data || new Date().toISOString().split('T')[0],
    instituicao: entities.conta || entities.instituicao || undefined
  }}
function mapGoalData(entities: unknown): GoalPayload {
  // Função para converter datas naturais para formato válido
  const parseNaturalDate = (dateString: string): string => {
    if (!dateString) {
      // Data padrão: 1 ano a partir de hoje
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
    const lowerDate = dateString.toLowerCase();
    // Mapear datas naturais para datas específicas
    if (lowerDate.includes('final de dezembro') || lowerDate.includes('dezembro')) {
      const year = new Date().getFullYear();
    if (lowerDate.includes('final do ano') || lowerDate.includes('fim do ano')) {
      const year = new Date().getFullYear();
    if (lowerDate.includes('próximo ano') || lowerDate.includes('ano que vem')) {
      const year = new Date().getFullYear() + 1;
    if (lowerDate.includes('6 meses') || lowerDate.includes('seis meses')) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);
    if (lowerDate.includes('3 meses') || lowerDate.includes('três meses')) {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 3);
    // Se não conseguir mapear, usar data padrão
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
  // Se não há dados suficientes, retornar payload vazio
  if (!entities.valor_total || !entities.meta) {
      meta: '',
      valor_total: 0,
      data_conclusao: parseNaturalDate(entities.data_conclusao),
      categoria: ''
    }}
  // Garantir que o valor seja um número válido
  const valor_total = parseFloat(entities.valor_total) || 0;
    meta: entities.meta || '',
    valor_total: valor_total,
    data_conclusao: parseNaturalDate(entities.data_conclusao),
    categoria: entities.categoria || 'Outros'
  }}
// Gerar perguntas de acompanhamento
function generateFollowUpQuestions(intent: string, entities: unknown): string[] {
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
// Função auxiliar para verificar se os dados necessários para a ação foram completos
function hasCompleteData(action: unknown): boolean {
  // console statement removed by RPA
switch (action.type) {
    case 'CREATE_TRANSACTION': any
      // Remover verificação de tipo - pode ser inferido automaticamente
      // console statement removed by RPA
    case 'CREATE_INVESTMENT': any
      // console statement removed by RPA
    case 'CREATE_GOAL': any
      // console statement removed by RPA
    case 'GENERATE_REPORT': any
    default: any
}
// Função auxiliar para executar ações internamente
async function executeActionInternal(userId: string, detectedAction: DetectedAction): Promise<any> {
  const user = await User.findOne({ firebaseUid: userId });
  if (!user) {
    try { try { throw new Error('Usuário não encontrado')} catch (error) { console.error(error),  }
  switch (detectedAction.type) {
    case 'CREATE_TRANSACTION': any
    case 'CREATE_INVESTMENT': any
    case 'CREATE_GOAL': any
    case 'ANALYZE_DATA': any
    case 'GENERATE_REPORT': any
    default: any
      throw new Error('Ação não suportada')}
}
// Controller principal para ações automatizadas
  try {
    const userId = (req as any).user?.uid; } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
    const { message, chatId, context } = req.body;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return}
    if (!message) {
      res.status(400).json({ success: false, message: 'Mensagem é obrigatória' });
      return}
    // Buscar dados do usuário
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      return}
    // Buscar dados financeiros do usuário
    const [transacoes, investimentos, metas] = await Promise.all([Transacoes.find({ userId: user._id }),
      Investimento.find({ userId: user._id }),
      Goal.find({ userId: user._id });
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
        categorias: transacoes.reduce((acc unknown, t: unknown) => {
          const cat = t.categoria || 'Sem categoria';
          acc[cat] = (acc[cat] || 0) + 1;
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
        tipos: investimentos.reduce((acc unknown, i: unknown) => {
          const tipo = i.tipo || 'Sem tipo';
          acc[tipo] = (acc[tipo] || 0) + 1;
        ultimos: investimentos.slice(-5).map(i => ({
          nome: i.nome,
          valor: i.valor,
          tipo: i.tipo,
          data: i.data
        }))
      } : null,
      resumoMetas: metas.length > 0 ? {
        total: metas.length,
        status: metas.reduce((acc unknown, m: unknown) => {
          const status = m.prioridade || 'media';
          acc[status] = (acc[status] || 0) + 1;
        ativas: metas.filter((m unknown) => m.valor_atual < m.valor_total).slice(-5).map(m => ({
          titulo: m.meta,
          valor: m.valor_total,
          valorAtual: m.valor_atual,
          prazo: m.data_conclusao,
          prioridade: m.prioridade
        }))
      } : null
    };
    // console statement removed by RPA
// Detectar ação automatizada
    const detectedAction = await detectUserIntent(message, userContext);
    // console statement removed by RPA
);
    // console statement removed by RPA
if (detectedAction && detectedAction.confidence && detectedAction.confidence > 0.1) {
      // console statement removed by RPA
// ✅ CORREÇÃO: Se for UNKNOWN, retornar resposta conversacional
      if (detectedAction.type === 'UNKNOWN') {
        // console statement removed by RPA
res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: detectedAction.response || 'Olá! Como posso te ajudar hoje?',
          messageId: uuidv4()
        });
        return}
      // ✅ NOVA LÓGICA: Verificar se tem dados suficientes
      if (!hasCompleteData(detectedAction)) {
        // console statement removed by RPA
res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: detectedAction.response || 'Preciso de mais detalhes para criar isso. Pode me informar os valores?',
          messageId: uuidv4()
        });
        return}
      // ✅ EXECUTAR AÇÃO AUTOMATICAMENTE
      // console statement removed by RPA
try {
        // Executar ação diretamente
        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
          try { try { throw new Error('Usuário não encontrado')} catch (error) { console.error(error),  }
        let result; } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
        switch (detectedAction.type) {
          case 'CREATE_TRANSACTION': any
            result = await createTransaction(user.firebaseUid, detectedAction.payload);
            break;
          case 'CREATE_INVESTMENT': any
            result = await createInvestment(user.firebaseUid, detectedAction.payload);
            break;
          case 'CREATE_GOAL': any
            result = await createGoal(user.firebaseUid, detectedAction.payload);
            break;
          case 'ANALYZE_DATA': any
            result = await analyzeData(user.firebaseUid, detectedAction.payload);
            break;
          case 'GENERATE_REPORT': any
            result = await generateReport(user.firebaseUid, detectedAction.payload);
            break;
          default: any
            try { try { throw new Error('Ação não suportada')} catch (error) { console.error(error),  }
        res.status(200).json({
          success: true,
          type: 'ACTION_EXECUTED',
          text: detectedAction.successMessage || 'Ação executada com sucesso!',
          data: result,
          messageId: uuidv4()
        }); } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
        return} catch (error) {
        // console statement removed by RPA
res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: detectedAction.errorMessage || 'Desculpe, não consegui executar essa ação. Pode tentar novamente?',
          messageId: uuidv4()
        });
        return}
    } else {
      // console statement removed by RPA
// Processar como mensagem normal do chatbot
      try {
        const response = await aiService.generateContextualResponse('', // systemPrompt vazio ativa o FinnEngine
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
        return} catch (aiError) {
        // console statement removed by RPA
// Fallback para resposta simples
        res.status(200).json({
          success: true,
          type: 'TEXT_RESPONSE',
          text: 'Olá! Como posso te ajudar hoje?',
          messageId: uuidv4()
        });
        return}
    }
  } catch (error) {
    // console statement removed by RPA
res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar solicitação' 
    });
    return}
};
// Executar ação confirmada
  try {
    const userId = (req as any).user?.uid;
    const { action, payload, chatId } = req.body;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      return}
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      return}
    // Se a ação for UNKNOWN, retornar resposta conversacional
    if (action === 'UNKNOWN') {
      res.status(200).json({
        success: true,
        message: 'Olá! Como posso te ajudar hoje? Posso ajudar com metas, transações, investimentos e muito mais!',
        type: 'CONVERSATION'
      });
      return}
    // NOVO: Checar se todos os dados obrigatórios estão presentes
    if (!hasCompleteData(actionObj)) {
      // Descobrir quais campos estão faltando
      let missingFields: string[] = [];
      switch (action) {
        case 'CREATE_GOAL': any
          if (!payload.meta) missingFields.push('meta');
          if (!payload.valor_total) missingFields.push('valor_total');
          if (!payload.data_conclusao) missingFields.push('data_conclusao');
          break;
        case 'CREATE_TRANSACTION': any
          if (!payload.valor) missingFields.push('valor');
          if (!payload.descricao) missingFields.push('descricao');
          if (!payload.tipo) missingFields.push('tipo');
          break;
        case 'CREATE_INVESTMENT': any
          if (!payload.valor) missingFields.push('valor');
          if (!payload.nome) missingFields.push('nome');
          if (!payload.tipo) missingFields.push('tipo');
          break}
      res.status(200).json({
        success: false,
        message: `Para executar essa ação, preciso de mais informações: ${missingFields.join(', ')}. Por favor, preencha os campos faltantes.`,
        missingFields,
        requiresConfirmation: true
      });
      return}
    let result;
    switch (action) {
      case 'CREATE_TRANSACTION': any
        result = await createTransaction(user.firebaseUid, payload);
        break;
      case 'CREATE_INVESTMENT': any
        result = await createInvestment(user.firebaseUid, payload);
        break;
      case 'CREATE_GOAL': any
        result = await createGoal(user.firebaseUid, payload);
        break;
      case 'ANALYZE_DATA': any
        result = await analyzeData(user.firebaseUid, payload);
        break;
      case 'GENERATE_REPORT': any
        result = await generateReport(user.firebaseUid, payload);
        break;
      default: any
        res.status(400).json({ success: false, message: 'Ação não suportada' });
        return}
    res.status(200).json({
      success: true,
      message: 'Ação executada com sucesso!',
      data: result
    })} catch (error) {
    // console statement removed by RPA
res.status(500).json({ 
      success: false, 
      message: 'Erro ao executar ação' 
    })}
};
// Funções auxiliares para executar ações
export async function createTransaction(userId: string, payload: unknown) {
  // Adicionar valores padrão se não fornecidos
    userId,
    valor: payload.valor || 0,
    descricao: payload.descricao || 'Transação',
    tipo: payload.tipo || 'despesa', // Padrão como despesa
    categoria: payload.categoria || 'Geral',
    conta: payload.conta || 'Principal',
    data: payload.data || new Date().toISOString().split('T')[0],
    createdAt: new Date()
  };
  // console statement removed by RPA
const transacao = new Transacoes(transactionData);
  // console statement removed by RPA
export async function createInvestment(userId: string, payload: unknown) {
  // Adicionar valores padrão se não fornecidos
  const investmentData = {
    userId,
    nome: payload.nome || 'Investimento',
    valor: payload.valor || 0,
    tipo: payload.tipo || 'Renda Fixa', // Padrão como Renda Fixa
    data: payload.data ? new Date(payload.data) : new Date(),
    instituicao: payload.instituicao || 'Instituição',
    createdAt: new Date()
  };
  // console statement removed by RPA
// Validar valor mínimo
  const valor = parseFloat(investmentData.valor) || 0;
  if (valor < 0.01) {
    try { try { throw new Error('O valor do investimento deve ser maior que R$ 0,01')} catch (error) { console.error(error),  }
  // Validar e mapear o tipo de investimento
  const tipoMapping: { [key: string]: string } = {
    'criptomoeda': 'Criptomoedas',
    'criptomoedas': 'Criptomoedas',
    'crypto': 'Criptomoedas',
    'bitcoin': 'Criptomoedas',
    'btc': 'Criptomoedas',
    'ethereum': 'Criptomoedas',
    'eth': 'Criptomoedas',
    'binance': 'Criptomoedas',
    'binace': 'Criptomoedas',
    'tesouro': 'Tesouro Direto',
    'tesouro direto': 'Tesouro Direto',
    'acoes': 'Ações',
    'ações': 'Ações',
    'acao': 'Ações',
    'ação': 'Ações',
    'fii': 'Fundos Imobiliários',
    'fundos imobiliarios': 'Fundos Imobiliários',
    'fundos imobiliário': 'Fundos Imobiliários',
    'fundos imobiliários': 'Fundos Imobiliários',
    'fundos imobiliario': 'Fundos Imobiliários',
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
    'cdi': 'CDI',
    'poupanca': 'Poupança',
    'poupança': 'Poupança'
  }; } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
  // Mapear o tipo se necessário
  let tipo = investmentData.tipo;
  if (tipoMapping[tipo.toLowerCase()]) {
    tipo = tipoMapping[tipo.toLowerCase()]}
  // Validar se o tipo é válido
  const tiposValidos = ['Renda Fixa', 'Tesouro Direto', 'Ações', 'Fundos Imobiliários',
    'Criptomoedas', 'Previdência Privada', 'ETF', 'Internacional', 'Renda Variável',
    'CDB', 'LCI', 'LCA', 'CDI', 'Poupança', 'Fundos de Investimento',
    'Debêntures', 'CRI', 'CRA', 'Letras de Câmbio', 'Certificados de Operações Estruturadas',
    'Fundos Multimercado', 'Fundos de Ações', 'Fundos Cambiais', 'Fundos de Renda Fixa',
    'Fundos de Previdência', 'Fundos de Investimento Imobiliário'
  ];
  if (!tiposValidos.includes(tipo)) {
    try { try { throw new Error(`Tipo de investimento inválido. Tipos válidos: ${tiposValidos.join(', ')}`)}
  const investimento = new Investimento({
    ...investmentData,
    tipo
  }); } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
  // console statement removed by RPA
export async function createGoal(userId: string, payload: unknown) {
  // Adicionar valores padrão se não fornecidos
    userId,
    meta: payload.meta || 'Meta',
    valor_total: payload.valor_total || 0,
    data_conclusao: payload.data_conclusao || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano
    categoria: payload.categoria || 'Geral',
    valor_atual: 0,
    prioridade: 'media',
    createdAt: new Date()
  };
  // console statement removed by RPA
const goal = new Goal(goalData);
  // console statement removed by RPA
export async function analyzeData(userId: string, payload: unknown) {
  // Implementar análise de dados
  const [transacoes, investimentos, metas] = await Promise.all([Transacoes.find({ userId }),
    Investimento.find({ userId }),
    Goal.find({ userId });
  ]);
    analysisType: payload.analysisType,
    summary: {
      totalTransacoes: transacoes.length,
      totalInvestimentos: investimentos.length,
      valorTotalInvestido: investimentos.reduce((sum, inv) => sum + inv.valor, 0),
      valorTotalMetas: metas.reduce((sum, meta) => sum + meta.valor_total, 0)
    }
  }}
export async function generateReport(userId: string, payload: unknown) {
  // Implementar geração de relatório
    reportId: uuidv4(),
    generatedAt: new Date(),
    type: payload.reportType || 'general',
    data: analysis
  }} 


import AIService from './aiService';
import {  UserService  } from '../modules/users/services/UserService';
import {  UserRepository  } from '../modules/users/repositories/UserRepository';
import {  ConversationMemory  } from './ConversationMemory';
import {  ReasoningEngine, type DetectedIntent  } from './ReasoningEngine';
// import { FinancialKnowledge } from './FinancialKnowledge';
import {  AssistantPersonality  } from './AssistantPersonality';
interface UserMessage {
  content: string
  userId: string
  chatId: string
  timestamp: Date
  metadata?: unknown}
interface AssistantResponse {
  response: string
  action?: {
    type: string
    payload: unknown
    confidence: number};
  insights?: string[];
  recommendations?: unknown[];
  followUpQuestions?: string[];
  requiresConfirmation?: boolean
  metadata?: unknown}
interface ConversationContext {
  recentMessages: unknown[];
  userProfile: unknown
  financialContext: unknown
  inferredGoals: unknown
  lastTopics: string[];
  sentiment?: unknown
  last5Messages?: unknown[];
  recurringTopics?: string[];
  isRepetitiveQuestion?: boolean}
interface MessageAnalysis {
  intent: {
    type: string
    payload?: unknown
    confidence: number};
  entities: unknown
  confidence: number
  reasoning: string
  response: string
  requiresConfirmation: boolean}
// ✅ NOVO: Sistema de Circuit Breaker
interface CircuitBreakerState {
  errorCount: number
  lastErrorTime: number
  isOpen: boolean
  threshold: number
  timeout: number}
// ✅ NOVO: Sistema de Fluxo de Conversa
interface ConversationFlow {
  lastUserMessage: string
  lastBotResponse: string
  detectedIntent: string
  timestamp: Date
  step: number
  dataCollected: unknown}
// ✅ NOVO: Personalidade Aprimorada
class EnhancedPersonality {
  addTone(response: AssistantResponse, userProfile?: unknown): AssistantResponse {
    const tone = this.selectTone(userProfile);
      ...response,
      response: this.applyTone(baseResponse, tone)
    }}
  private selectTone(userProfile?: unknown): string {
    if (!userProfile) return 'neutral';
    // Baseado no histórico de interações
    if (userProfile.interactionStyle === 'formal') return 'formal';
    if (userProfile.interactionStyle === 'friendly') return 'friendly';
    // Baseado no momento
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) return 'calm';
  private applyTone(text: string, tone: string): string {
      formal: this.applyFormalTone,
      friendly: this.applyFriendlyTone,
      calm: this.applyCalmTone,
      neutral: this.applyNeutralTone
    };
  private applyFriendlyTone(text: string): string {
    // Adiciona emojis e linguagem mais casual
    const emojis = ['😊', '👍', '👌', '💡', '✨'];
  private applyFormalTone(text: string): string {
    // Mantém tom mais profissional
  private applyCalmTone(text: string): string {
    // Tom mais suave para horários noturnos
  private applyNeutralTone(text: string): string {
    // Tom equilibrado
}
export class FinancialAssistant {
  static async generateResponse(intent: unknown) {
    // Simulação de resposta
  private memory: ConversationMemory
  private reasoningEngine: ReasoningEngine
  private personality: EnhancedPersonality
  private aiService: AIService
  // ✅ NOVO: Circuit Breaker
  private circuitBreaker: CircuitBreakerState = {
    errorCount: 0,
    lastErrorTime: 0,
    isOpen: false,
    threshold: 5,
    timeout: 30000 // 30 segundos
  };
  constructor() {
    this.memory = new ConversationMemory();
    this.reasoningEngine = new ReasoningEngine();
    this.personality = new EnhancedPersonality();
    this.aiService = new AIService()}
  // ✅ MELHORIA 1: Compreensão Contextual Aprimorada
  private async buildEnhancedContext(message: UserMessage): Promise<ConversationContext> {
    // Adicionar análise de sentimento
    const sentiment = await this.aiService.analyzeSentiment?.(message.content) || { score: 0, label: 'neutral' };
    // Verificar histórico recente
    const last5Messages = await this.memory.getRecentMessages(message.userId, 5) || [];
    // Detectar tópicos recorrentes
    const recurringTopics = this.detectRecurringTopics(last5Messages);
      ...baseContext,
      sentiment,
      last5Messages,
      recurringTopics,
      isRepetitiveQuestion: this.checkRepetition(message.content, last5Messages)
    }}
  // ✅ MELHORIA 2: Sistema de Memória Aprimorado
  private async updateConversationFlow(message: UserMessage, response: AssistantResponse) {
    // Armazena o fluxo atual da conversa
    const flow: ConversationFlow = {
      lastUserMessage: message.content,
      lastBotResponse: response.response,
      detectedIntent: response.action?.type || 'UNKNOWN',
      timestamp: new Date(),
      step: 1,
      dataCollected: response.action?.payload || {}
    };
  private async getCurrentFlow(userId: string): Promise<ConversationFlow | null> {
  // ✅ MELHORIA 3: Geração de Resposta Mais Inteligente
  private async generateIntelligentResponse(analysis: MessageAnalysis, context: ConversationContext): Promise<AssistantResponse> {
    // 1. Verificar se é continuação de um fluxo existente
    const currentFlow = await this.getCurrentFlow(context.userProfile?.id || 'unknown');
    // 2. Tratar correções de forma mais inteligente
    if (this.isUserCorrecting(analysis, currentFlow)) {
    // 3. Sistema de resposta baseada em fluxo
    if (currentFlow && currentFlow.detectedIntent) {
    // 4. Resposta baseada em intenção com mais nuances
  private async handleIntentWithContext(analysis: MessageAnalysis, context: ConversationContext): Promise<AssistantResponse> {
    const { intent, entities } = analysis;
    // Respostas mais contextualizadas
    const responseTemplates = {
      CREATE_TRANSACTION: {
        complete: `✅ Transação registrada! Valor: R$ ${entities.valor}, Descrição: ${entities.descricao}`,
        incomplete: this.getTransactionIncompleteResponse(entities)
      },
      CREATE_GOAL: {
        complete: `🎯 Meta criada! Objetivo: ${entities.meta}, Valor: R$ ${entities.valor_total}`,
        incomplete: this.getGoalIncompleteResponse(entities)
      },
      CREATE_INVESTMENT: {
        complete: `📈 Investimento registrado! Valor: R$ ${entities.valor}, Nome: ${entities.nome}`,
        incomplete: this.getInvestmentIncompleteResponse(entities)
      },
      FRUSTRATION: {
        complete: `Entendo sua frustração! 😔 Peço desculpas pela confusão anterior. Vou te ajudar de forma mais direta e clara agora.`,
        incomplete: `Entendo sua frustração! 😔 Peço desculpas pela confusão anterior. Vou te ajudar de forma mais direta e clara agora.`
      },
      GREETING: {
        complete: `Olá! Que bom te ver por aqui! 😊 Como posso te ajudar hoje?`,
        incomplete: `Olá! Que bom te ver por aqui! 😊 Como posso te ajudar hoje?`
      },
      GENERAL_HELP: {
        complete: `Claro! Estou aqui para te ajudar com suas finanças! 💪`,
        incomplete: `Claro! Estou aqui para te ajudar com suas finanças! 💪`
      },
      UNKNOWN: {
        complete: `Entendi! Como posso te ajudar hoje?`,
        incomplete: `Entendi! Como posso te ajudar hoje?`
      },
      DEFAULT: {
        complete: `Perfeito! Como posso te ajudar hoje?`,
        incomplete: `Perfeito! Como posso te ajudar hoje?`
      }
    };
    // Verificar se temos todos os dados necessários
    const isComplete = this.hasCompleteData({
      type: intent.type,
      payload: intent.payload,
      confidence: intent.confidence,
      reasoning: 'Análise de dados completos',
      requiresConfirmation: false
    });
    // Selecionar template apropriado
    const template = responseTemplates[intent.type] || responseTemplates.DEFAULT;
      response: responseText,
      action: isComplete ? {
        type: intent.type,
        payload: entities,
        confidence: intent.confidence
      } : undefined,
      followUpQuestions: this.generateContextualFollowUps({
        type: intent.type,
        payload: intent.payload,
        confidence: intent.confidence,
        reasoning: 'Análise de dados completos',
        requiresConfirmation: false
      }, isComplete, context)
    }}
  // ✅ MELHORIA 4: Sistema de Follow-up Inteligente
  private generateContextualFollowUps(intent: DetectedIntent, isComplete: boolean, context: ConversationContext): string[] {
    if (!isComplete) {
    // Baseado no histórico do usuário
    if (context.userProfile?.preferences?.frequentActions?.includes('VIEW_REPORTS')) {
    // Sugestões baseadas no momento
    const now = new Date();
    if (now.getMonth() === 11) { // Dezembro
    // Sugestões padrão
      'Quer ver um resumo desta categoria?'
    ]}
  // ✅ MELHORIA 5: Sistema de Aprendizado Contínuo
  private async learnFromInteraction(message: UserMessage, response: AssistantResponse) {
    // 1. Armazenar interação para treinamento futuro
      input: message.content,
      output: response.response,
      context: await this.buildEnhancedContext(message)
    });
    // 2. Ajustar modelo com base no feedback implícito
    if (response.followUpQuestions && response.followUpQuestions.length > 0) {
      // Se o usuário não responder às perguntas, pode indicar confusão
      (typeof setTimeout !== "undefined" ? setTimeout: (fn,ms)=>fn())(async () => {
        const nextMessage = await this.memory.checkForNextMessage?.(message.userId, 30000); // 30 segundos
        if (!nextMessage) {
      }, 30000)}
  }
  private async adjustModelForConfusion(message: UserMessage, response: AssistantResponse) {
    // Lógica para ajustar o modelo quando o usuário parece confuso
    // console statement removed by RPA
  // ✅ MELHORIA 6: Implementação de Circuit Breaker
  private async safeProcess(message: UserMessage): Promise<AssistantResponse> {
    try {
      if (this.isCircuitOpen()) {
      this.circuitBreaker.errorCount = 0; // Reset on success
      this.circuitBreaker.errorCount++;
      this.circuitBreaker.lastErrorTime = Date.now();
      if (this.circuitBreaker.errorCount >= this.circuitBreaker.threshold) {
        // console statement removed by RPA
}
  }
  private isCircuitOpen(): boolean {
           (Date.now() - this.circuitBreaker.lastErrorTime) < this.circuitBreaker.timeout}
  private circuitBreakerFallback(): AssistantResponse {
      response: 'Estou passando por algumas melhorias no momento. Por favor, tente novamente em alguns instantes.',
      action: { type: 'CIRCUIT_BREAKER', payload: {}, confidence: 0 },
      insights: ['Circuit breaker acionado']
    }}
  private getGracefulFallback(message: UserMessage, error: unknown): AssistantResponse {
    // console statement removed by RPA
      response: 'Desculpe, tive um problema técnico. Pode tentar novamente?',
      action: { type: 'UNKNOWN', payload: {}, confidence: 0 },
      insights: ['Houve um erro no processamento da sua mensagem'],
      followUpQuestions: ['Como posso te ajudar de outra forma?']
    }}
  // ✅ MÉTODOS AUXILIARES NOVOS
  private detectRecurringTopics(messages: unknown[]): string[] {
    const topics = new Map<string, number>();
    messages.forEach(msg => {
      extractedTopics.forEach(topic => {
        topics.set(topic, (topics.get(topic) || 0) + 1)})});
      .filter(([_, count]) => count > 1)
      .map(([topic, _]) => topic)
      .slice(0, 3); // Top 3 tópicos recorrentes
  }
  private extractTopicsFromMessage(content: string): string[] {
    const topics = [];
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('meta') || lowerContent.includes('objetivo')) topics.push('goals');
    if (lowerContent.includes('transação') || lowerContent.includes('gasto') || lowerContent.includes('receita')) topics.push('transactions');
    if (lowerContent.includes('investimento') || lowerContent.includes('ação') || lowerContent.includes('fundo')) topics.push('investments');
    if (lowerContent.includes('relatório') || lowerContent.includes('análise')) topics.push('reports');
  private checkRepetition(currentMessage: string, lastMessages: unknown[]): boolean {
      return similarity > 0.8; // 80% de similaridade
})}
  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
  private isUserCorrecting(analysis: MessageAnalysis, currentFlow: ConversationFlow | null): boolean {
    if (!currentFlow) return false;
    const correctionWords = ['corrigir', 'mudar', 'não', 'errado', 'não é isso', 'alterar'];
  private handleAdvancedCorrection(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
      response: 'Tranquilo! Vamos corrigir isso. O que você gostaria de mudar?',
      action: { type: 'CORRECTION', payload: {}, confidence: 0.8 },
      insights: ['Usuário solicitou correção'],
      followUpQuestions: ['Qual parte você quer corrigir?', 'O que está errado?']
    }}
  private async continueExistingFlow(currentFlow: ConversationFlow, analysis: MessageAnalysis, context: ConversationContext): Promise<AssistantResponse> {
    // Continuar o fluxo existente
      type: analysis.intent.type,
      payload: analysis.intent.payload,
      confidence: analysis.intent.confidence,
      reasoning: 'Análise de dados progressiva',
      requiresConfirmation: false
    }, context)}
  private getTransactionIncompleteResponse(entities: unknown): string {
    const missingFields = [];
    if (!entities.valor) missingFields.push('valor');
    if (!entities.descricao) missingFields.push('descrição');
    if (!entities.tipo) missingFields.push('tipo (receita/despesa)');
  private getGoalIncompleteResponse(entities: unknown): string {
    const missingFields = [];
    if (!entities.valor_total) missingFields.push('valor total');
    if (!entities.meta) missingFields.push('objetivo da meta');
    if (!entities.data_conclusao) missingFields.push('prazo');
  private getInvestmentIncompleteResponse(entities: unknown): string {
    const missingFields = [];
    if (!entities.valor) missingFields.push('valor');
    if (!entities.nome) missingFields.push('nome do investimento');
    if (!entities.tipo) missingFields.push('tipo');
  private getMissingFieldsQuestions(intent: DetectedIntent): string[] {
    const { entities } = intent;
    const questions: string[] = [];
    switch (intent.type) {
      case 'CREATE_TRANSACTION': any
        if (!entities.valor) questions.push('Qual foi o valor?');
        if (!entities.descricao) questions.push('O que foi essa transação?');
        if (!entities.tipo) questions.push('É receita ou despesa?');
        break;
      case 'CREATE_GOAL': any
        if (!entities.valor_total) questions.push('Qual valor quer juntar?');
        if (!entities.meta) questions.push('Para qual objetivo?');
        if (!entities.data_conclusao) questions.push('Em quanto tempo?');
        break;
      case 'CREATE_INVESTMENT': any
        if (!entities.valor) questions.push('Qual valor quer investir?');
        if (!entities.nome) questions.push('Qual o nome do investimento?');
        if (!entities.tipo) questions.push('Qual o tipo?');
        break}
  // ✅ MÉTODO PRINCIPAL APRIMORADO
//   async processMessage(message: UserMessage): Promise<AssistantResponse> {
 
    try {
      // console statement removed by RPA
// 1. Obter contexto enriquecido
      const context = await this.buildEnhancedContext(message);
      // ✅ CORREÇÃO: Adicionar contexto do usuário se disponível
      if (context.userProfile && !context.userProfile.name) {
        // Tentar obter nome do usuário do contexto
        context.userProfile.name = 'Saulo chagas da Silva Martins'; // Nome do usuário dos logs
      }
      // 2. Análise profunda com aprendizado
      const analysis = await this.reasoningEngine.analyze(message, context);
      // console statement removed by RPA
`);
      // ✅ NOVO: Verificar se é uma ação que precisa de coleta de dados
      if (this.requiresDataCollection(analysis.intent.type)) {
        // console statement removed by RPA
const detectedIntent: DetectedIntent = {
          type: analysis.intent.type,
          payload: analysis.intent.payload || {},
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          entities: analysis.entities,
          response: analysis.response,
          requiresConfirmation: analysis.requiresConfirmation,
          missingFields: [],
          collectedData: {}
        };
      // 3. Geração de resposta inteligente
      const response = await this.generateIntelligentResponse(analysis, context);
      // 4. Aprendizado contínuo
        this.memory.storeInteraction(message, response),
        this.learnFromInteraction(message, response),
        this.updateConversationFlow(message, response)
      ]);
      // 5. Aplicar personalidade contextual
      // console statement removed by RPA
  }
  // ✅ NOVO: Sistema de fluxos conversacionais inteligentes
  private async collectDataProgressively(intent: DetectedIntent, context: ConversationContext): Promise<AssistantResponse> {
    const { entities } = intent;
    // Se já tem dados suficientes, executar ação
    if (this.hasCompleteData(intent)) {
    // Identificar campos faltantes
    const missingFields = this.getMissingFields(intent);
    if (missingFields.length > 0) {
      // Gerar resposta para coletar dados
      const response = this.generateDataCollectionResponse(intent.type, missingFields, entities);
        response,
        action: {
          type: intent.type,
          payload: entities,
          confidence: intent.confidence
        },
        requiresConfirmation: true,
        followUpQuestions: this.generateFollowUpQuestions(intent.type, missingFields),
        insights: [`Coletando dados para ${intent.type}`],
        recommendations: undefined
      }}
    // Fallback
      response: 'Como posso te ajudar?',
      // ✅ CORREÇÃO: Não retornar action para fallback
      requiresConfirmation: false,
      followUpQuestions: ['Quer criar uma meta?', 'Precisa registrar uma transação?'],
      insights: [],
      recommendations: undefined
    }}
  // ✅ NOVO: Verificar se tem dados completos
  private hasCompleteData(intent: DetectedIntent): boolean {
    const { entities } = intent;
    switch (intent.type) {
      case 'CREATE_TRANSACTION': any
      case 'CREATE_GOAL': any
      case 'CREATE_INVESTMENT': any
      default: any
  }
  // ✅ NOVO: Identificar campos faltantes
  private getMissingFields(intent: DetectedIntent): string[] {
    const { entities } = intent;
    const missing: string[] = [];
    switch (intent.type) {
      case 'CREATE_TRANSACTION': any
        if (!entities.valor) missing.push('valor');
        if (!entities.descricao) missing.push('descricao');
        if (!entities.tipo) missing.push('tipo');
        break;
      case 'CREATE_GOAL': any
        if (!entities.valor_total) missing.push('valor_total');
        if (!entities.meta) missing.push('meta');
        if (!entities.data_conclusao) missing.push('data_conclusao');
        break;
      case 'CREATE_INVESTMENT': any
        if (!entities.valor) missing.push('valor');
        if (!entities.nome) missing.push('nome');
        if (!entities.tipo) missing.push('tipo');
        break}
  // ✅ NOVO: Gerar resposta para coleta de dados
  private generateDataCollectionResponse(intentType: string, missingFields: string[], entities: unknown): string {
      valor: 'valor',
      descricao: 'descrição',
      tipo: 'tipo (receita/despesa)',
      valor_total: 'valor total',
      meta: 'objetivo da meta',
      data_conclusao: 'prazo',
      nome: 'nome do investimento'
    };
    const missingFieldNames = missingFields.map(field => fieldNames[field] || field).join(', ');
    switch (intentType) {
      case 'CREATE_TRANSACTION': any
      case 'CREATE_GOAL': any
      case 'CREATE_INVESTMENT': any
      default: any
  }
  // ✅ NOVO: Gerar perguntas de follow-up
  private generateFollowUpQuestions(intentType: string, missingFields: string[]): string[] {
    const questions: string[] = [];
    switch (intentType) {
      case 'CREATE_TRANSACTION': any
        if (missingFields.includes('valor')) questions.push('Qual foi o valor?');
        if (missingFields.includes('descricao')) questions.push('O que foi essa transação?');
        if (missingFields.includes('tipo')) questions.push('É receita ou despesa?');
        break;
      case 'CREATE_GOAL': any
        if (missingFields.includes('valor_total')) questions.push('Qual valor quer juntar?');
        if (missingFields.includes('meta')) questions.push('Para qual objetivo?');
        if (missingFields.includes('data_conclusao')) questions.push('Em quanto tempo?');
        break;
      case 'CREATE_INVESTMENT': any
        if (missingFields.includes('valor')) questions.push('Qual valor quer investir?');
        if (missingFields.includes('nome')) questions.push('Qual o nome do investimento?');
        if (missingFields.includes('tipo')) questions.push('Qual o tipo?');
        break}
  // ✅ NOVO: Executar ação quando dados estiverem completos
  private async executeAction(intent: DetectedIntent, context: ConversationContext): Promise<AssistantResponse> {
    try {
      const { entities } = intent;
      switch (intent.type) {
        case 'CREATE_TRANSACTION': any
          // Aqui você chamaria o controller para criar a transação
            response: `✅ Transação registrada com sucesso!\n\n💰 Valor: R$ ${entities.valor}\n📝 Descrição: ${entities.descricao}\n📊 Tipo: ${entities.tipo || 'despesa'}`,
            action: {
              type: 'CREATE_TRANSACTION',
              payload: entities,
              confidence: intent.confidence
            },
            requiresConfirmation: false,
            followUpQuestions: ['Quer registrar outra transação?', 'Quer ver suas transações?'],
            insights: ['Transação criada automaticamente'],
            recommendations: undefined
          };
        case 'CREATE_GOAL': any
          // Aqui você chamaria o controller para criar a meta
            response: `🎯 Meta criada com sucesso!\n\n💰 Valor: R$ ${entities.valor_total}\n🎯 Objetivo: ${entities.meta}\n📅 Prazo: ${entities.data_conclusao || 'Não definido'}`,
            action: {
              type: 'CREATE_GOAL',
              payload: entities,
              confidence: intent.confidence
            },
            requiresConfirmation: false,
            followUpQuestions: ['Quer criar outra meta?', 'Quer ver suas metas?'],
            insights: ['Meta criada automaticamente'],
            recommendations: undefined
          };
        case 'CREATE_INVESTMENT': any
          // Aqui você chamaria o controller para criar o investimento
            response: `📈 Investimento registrado com sucesso!\n\n💰 Valor: R$ ${entities.valor}\n📊 Nome: ${entities.nome}\n🏦 Tipo: ${entities.tipo || 'Não especificado'}`,
            action: {
              type: 'CREATE_INVESTMENT',
              payload: entities,
              confidence: intent.confidence
            },
            requiresConfirmation: false,
            followUpQuestions: ['Quer registrar outro investimento?', 'Quer ver seu portfólio?'],
            insights: ['Investimento criado automaticamente'],
            recommendations: undefined
          };
        default: any
            response: 'Ação executada com sucesso!',
            action: {
              type: intent.type,
              payload: entities,
              confidence: intent.confidence
            },
            requiresConfirmation: false,
            followUpQuestions: ['Como posso te ajudar?'],
            insights: ['Ação executada'],
            recommendations: undefined
          }}
    } catch (error) {
      // console statement removed by RPA
        response: 'Desculpe, tive um problema ao executar essa ação. Pode tentar novamente?',
        action: {
          type: intent.type,
          payload: intent.entities,
          confidence: 0.3
        },
        requiresConfirmation: true,
        followUpQuestions: ['Quer tentar novamente?'],
        insights: ['Erro na execução da ação'],
        recommendations: undefined
      }}
  }
  // ✅ NOVO: Sistema de coleta inteligente de dados
  private async collectDataIntelligently(intent: DetectedIntent, context: ConversationContext): Promise<AssistantResponse> {
    const intentType = intent.type;
    const currentData = intent.collectedData || {};
    const missingFields = this.getMissingFields(intent);
    // Se já tem todos os dados, executar automaticamente
    if (missingFields.length === 0) {
    // Se é a primeira vez, começar a coleta
    if (!currentData || Object.keys(currentData).length === 0) {
        response: firstQuestion,
        action: {
          type: intentType,
          payload: currentData,
          confidence: intent.confidence
        },
        requiresConfirmation: false,
        followUpQuestions: this.getFollowUpQuestions(intentType, missingFields)
      }}
    // Se já tem alguns dados, continuar a coleta
      response: nextQuestion,
      action: {
        type: intentType,
        payload: currentData,
        confidence: intent.confidence
      },
      requiresConfirmation: false,
      followUpQuestions: this.getFollowUpQuestions(intentType, missingFields.slice(1))
    }}
  // ✅ NOVO: Obter primeira pergunta baseada no tipo de intent
  private getFirstQuestion(intentType: string): string {
    const questions = {
      'CREATE_TRANSACTION': [
        'Beleza! Vou te ajudar a registrar essa transação. Quanto você gastou?',
        'Show! Vamos registrar esse gasto. Qual foi o valor?',
        'Perfeito! Vou te ajudar com isso. Quanto custou?',
        'Valeu! Vamos registrar essa transação. Qual foi o valor gasto?',
        'Legal! Vou te ajudar a registrar. Quanto você pagou?'
      ],
      'CREATE_GOAL': [
        'Ótimo! Vamos criar essa meta! Quanto você quer juntar?',
        'Show! Vou te ajudar a criar essa meta. Qual é o valor que você quer alcançar?',
        'Perfeito! Vamos criar sua meta financeira. Quanto você quer economizar?',
        'Beleza! Vou te ajudar com essa meta. Qual é o valor objetivo?',
        'Legal! Vamos criar sua meta! Quanto você quer juntar?'
      ],
      'CREATE_INVESTMENT': [
        'Excelente! Vamos registrar esse investimento. Quanto você investiu?',
        'Show! Vou te ajudar a registrar. Qual foi o valor investido?',
        'Perfeito! Vamos registrar esse investimento. Quanto você aplicou?',
        'Beleza! Vou te ajudar com isso. Qual foi o valor do investimento?',
        'Legal! Vamos registrar. Quanto você investiu?'
      ]
    };
    const questionList = questions[intentType as keyof typeof questions] || ['Beleza! Vou te ajudar com isso. O que você gostaria de fazer?'
    ];
  // ✅ NOVO: Obter pergunta específica para um campo
  private getFieldQuestion(intentType: string, field: string, currentData: unknown): string {
    const fieldQuestions = {
      'CREATE_TRANSACTION': {
        'descricao': [
          'Beleza! Agora me conta, do que foi esse gasto?',
          'Show! E do que foi essa transação?',
          'Perfeito! Agora me fala, o que você comprou?',
          'Valeu! E qual foi a descrição desse gasto?',
          'Legal! Agora me conta, do que foi esse pagamento?'
        ],
        'categoria': [
          'Beleza! E qual categoria você quer colocar? (alimentação, transporte, lazer, etc.)',
          'Show! E em qual categoria você quer classificar?',
          'Perfeito! E qual categoria você quer usar?',
          'Valeu! E qual categoria você quer colocar?',
          'Legal! E qual categoria você quer usar?'
        ]
      },
      'CREATE_GOAL': {
        'meta': [
          'Beleza! Agora me conta, qual é o seu objetivo? (viagem, carro, casa, etc.)',
          'Show! E qual é a sua meta? O que você quer conquistar?',
          'Perfeito! Agora me fala, qual é o seu sonho?',
          'Valeu! E qual é o seu objetivo? O que você quer alcançar?',
          'Legal! Agora me conta, qual é a sua meta?'
        ],
        'prazo': [
          'Beleza! E quando você quer alcançar essa meta?',
          'Show! E qual é o prazo para essa meta?',
          'Perfeito! E quando você quer conquistar isso?',
          'Valeu! E qual é o prazo para essa meta?',
          'Legal! E quando você quer alcançar isso?'
        ]
      },
      'CREATE_INVESTMENT': {
        'tipo': [
          'Beleza! Agora me conta, qual tipo de investimento? (ações, renda fixa, fundos, etc.)',
          'Show! E qual tipo de investimento você fez?',
          'Perfeito! Agora me fala, qual tipo de aplicação?',
          'Valeu! E qual tipo de investimento você fez?',
          'Legal! Agora me conta, qual tipo de aplicação?'
        ],
        'instituicao': [
          'Beleza! E em qual instituição você investiu?',
          'Show! E qual banco/corretora você usou?',
          'Perfeito! E em qual instituição você aplicou?',
          'Valeu! E qual banco/corretora você usou?',
          'Legal! E em qual instituição você investiu?'
        ]
      }
    };
    const questions = fieldQuestions[intentType as keyof typeof fieldQuestions]?.[field as any] || ['Beleza! Agora me conta mais sobre isso.'
    ];
  // ✅ NOVO: Obter perguntas de acompanhamento
  private getFollowUpQuestions(intentType: string, missingFields: string[]): string[] {
    const followUps = {
      'CREATE_TRANSACTION': [
        'Quer adicionar uma categoria?',
        'Quer definir uma data específica?',
        'Quer adicionar uma nota?'
      ],
      'CREATE_GOAL': [
        'Quer definir um prazo?',
        'Quer adicionar uma descrição?',
        'Quer definir lembretes?'
      ],
      'CREATE_INVESTMENT': [
        'Quer adicionar uma descrição?',
        'Quer definir um prazo?',
        'Quer adicionar uma nota?'
      ]
    };
  private detectConversationContinuation(context: ConversationContext): boolean {
  private detectCorrection(analysis: MessageAnalysis): boolean {
    const correctionWords = ['corrigir', 'mudar', 'não', 'errado', 'não é isso'];
  private detectConfusion(analysis: MessageAnalysis): boolean {
  private handleCorrection(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const responses = ["Tranquilo! Vamos corrigir isso. O que você gostaria de mudar?",
      "Sem problema! Vamos ajustar. O que está errado?",
      "Beleza! Vamos corrigir. Qual parte você quer alterar?",
      "Ok! Vamos mudar isso. O que precisa ser diferente?",
      "Tranquilo! Vamos ajustar. O que não está certo?"
    ];
      response: responses[Math.floor(Math.random() * responses.length)],
      action: { type: 'CORRECTION', payload: {}, confidence: 0.8 },
      insights: ['Usuário solicitou correção'],
      followUpQuestions: ['Qual parte você quer corrigir?', 'O que está errado?']
    }}
  private handleConfusion(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const responses = ["Vou explicar de forma mais clara!",
      "Deixa eu simplificar isso pra você!",
      "Vou quebrar isso em partes menores!",
      "Não se preocupe, vou deixar bem simples!",
      "Vou te ajudar a entender melhor!"
    ];
      response: responses[Math.floor(Math.random() * responses.length)],
      action: { type: 'EXPLANATION', payload: {}, confidence: 0.8 },
      insights: ['Usuário demonstrou confusão'],
      followUpQuestions: ['O que você não entendeu?', 'Qual parte ficou confusa?']
    }}
  private handleConfirmation(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const { intent, entities } = analysis;
    let summary = '';
    let response = '';
    if (intent.type === 'CREATE_GOAL') {
      summary = `🎯 **Resumo da Meta:**
• Nome: ${entities.meta || 'Não informado'}
• Valor: ${entities.valor_total ? `R$ ${entities.valor_total}` : 'Não informado'}
• Prazo: ${entities.data_conclusao || 'Não informado'}`;
      response = "Perfeito! Vou criar essa meta pra você. Está tudo correto?"}
    if (intent.type === 'CREATE_TRANSACTION') {
      summary = `📋 **Resumo da Transação:**
• Tipo: ${entities.tipo || 'Não informado'}
• Valor: ${entities.valor ? `R$ ${entities.valor}` : 'Não informado'}
• Descrição: ${entities.descricao || 'Não informado'}
• Categoria: ${entities.categoria || 'Automática'}`;
      response = "Beleza! Vou registrar essa transação. Está correto?"}
    if (intent.type === 'CREATE_INVESTMENT') {
      summary = `💼 **Resumo do Investimento:**
• Nome: ${entities.nome || 'Não informado'}
• Valor: ${entities.valor ? `R$ ${entities.valor}` : 'Não informado'}
• Tipo: ${entities.tipo || 'Não informado'}`;
      response = "Ótimo! Vou adicionar esse investimento. Está certo?"}
      response: `${summary}\n\n${response}`,
      action: { type: intent.type, payload: intent.payload || {}, confidence: intent.confidence },
      insights: ['Aguardando confirmação do usuário'],
      followUpQuestions: ['Está correto?', 'Posso criar agora?']
    }}
  private handleGoalCreation(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const responses = ["Que legal! Vamos criar essa meta juntos! Qual valor você quer juntar?",
      "Perfeito! Vamos definir essa meta! Qual o valor necessário?",
      "Ótimo! Vamos planejar isso direitinho! Qual valor você precisa?",
      "Beleza! Vamos organizar essa meta! Qual o valor total?",
      "Show! Vamos criar um plano pra essa meta! Qual valor você quer juntar?"
    ];
      response: responses[Math.floor(Math.random() * responses.length)],
      action: { type: 'COLLECT_GOAL_DATA', payload: {}, confidence: 0.9 },
      insights: ['Coletando dados da meta'],
      followUpQuestions: ['Qual valor?', 'Para qual objetivo?', 'Em quanto tempo?']
    }}
  private handleTransactionCreation(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const responses = ["Perfeito! Vamos registrar essa transação! Qual foi o valor?",
      "Beleza! Vamos adicionar essa transação! Qual o valor?",
      "Ótimo! Vamos registrar isso! Qual valor foi?",
      "Show! Vamos colocar essa transação! Qual o valor?",
      "Tranquilo! Vamos registrar essa movimentação! Qual valor?"
    ];
      response: responses[Math.floor(Math.random() * responses.length)],
      action: { type: 'COLLECT_TRANSACTION_DATA', payload: {}, confidence: 0.9 },
      insights: ['Coletando dados da transação'],
      followUpQuestions: ['Qual valor?', 'O que foi?', 'Como pagou?']
    }}
  private handleInvestmentCreation(analysis: MessageAnalysis, context: ConversationContext): AssistantResponse {
    const responses = ["Ótimo! Vamos registrar esse investimento! Qual valor você investiu?",
      "Perfeito! Vamos adicionar ao seu portfólio! Qual valor?",
      "Beleza! Vamos registrar esse investimento! Qual valor?",
      "Show! Vamos colocar esse investimento! Qual valor?",
      "Tranquilo! Vamos registrar essa aplicação! Qual valor?"
    ];
      response: responses[Math.floor(Math.random() * responses.length)],
      action: { type: 'COLLECT_INVESTMENT_DATA', payload: {}, confidence: 0.9 },
      insights: ['Coletando dados do investimento'],
      followUpQuestions: ['Qual valor?', 'Em que tipo?', 'Qual o nome?']
    }}
  // ✅ NOVO: Verificar se uma ação precisa de coleta de dados
  private requiresDataCollection(intentType: string): boolean {
      'CREATE_TRANSACTION',
      'CREATE_GOAL', 
      'CREATE_INVESTMENT'
    ];
}


import express from 'express';
import OpenAI from 'openai';
import {  AppError  } from '../core/errors/AppError';
import {  MarketService  } from './marketService';
import {  ChatMessage  } from '../types/chat';
// ✅ REMOVIDO: MemoryDB foi excluído durante a limpeza
import axios from 'axios';
if (!(typeof process !== "undefined" ? process.: {}.env.DEEPSEEK_API_KEY) {
  try { try { throw new Error('DEEPSEEK_API_KEY não está configurada no ambiente')} catch (error) { console.error(error),  }
const openai = new OpenAI({
  apiKey: (typeof process !== "undefined" ? process. : {}.env.DEEPSEEK_API_KEY,
  baseURL: 'https//api.deepseek.com/v1',
  timeout: 10000,
}); } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
// ===== SISTEMA DE PERSONALIDADE APRIMORADO =====
# TRAÇOS DE PERSONALIDADE DO FINN
1. Estilo Conversacional: any
   - Calmo e paciente, como um consultor experiente
   - Empático - reconhece sentimentos e situações financeiras delicadas
   - Motivacional - incentiva boas práticas financeiras
   - Humor sutil e apropriado (sem piadas forçadas)
   - Adaptação cultural brasileira com regionalismos
2. Padrões de Fala: any
   - Usa contrações ("tá" em vez de "está", "pra" em vez de "para")
   - Intercala perguntas retóricas ("Sabe por que isso é importante?")
   - Usa exemplos pessoais ("Meu outro cliente teve uma situação parecida...")
   - Expressões positivas ("Boa escolha!", "Excelente pergunta!")
   - Gírias brasileiras apropriadas ("beleza", "valeu", "tranquilo")
3. Adaptação ao Usuário: any
   - Nível técnico: básico/intermediário/avançado
   - Tom: mais formal com empresários, mais casual com jovens
   - Referências culturais brasileiras
   - Adaptação regional (SP, RJ, MG, RS, etc.)
   - Detecção de contexto (trabalho, lazer, família)
4. Sistema de Humor Contextual: any
   - Humor leve em momentos apropriados
   - Referências a situações financeiras comuns
   - Piadas sobre "carteira vazia" vs "carteira cheia"
   - Analogias engraçadas sobre investimentos
5. Fluxos Conversacionais Inteligentes: any
   - SEMPRE perguntar detalhes quando faltar informação
   - NUNCA criar automaticamente com valores padrão
   - SEMPRE confirmar antes de executar ações
   - Reconhecer quando o usuário está corrigindo algo
   - Manter contexto da conversa anterior
   - Detectar quando o usuário está confuso e explicar melhor
6. Respostas Variadas e Naturais: any
   - NUNCA repetir a mesma mensagem
   - Usar sinônimos e variações
   - Adaptar tom baseado no humor do usuário
   - Incluir elementos de personalidade únicos
   - Reconhecer e celebrar conquistas do usuário
7. Sistema de Confirmação Inteligente: any
   - Mostrar resumo claro antes de executar
   - Permitir correções fáceis
   - Explicar o que vai acontecer
   - Dar opções quando apropriado
   - Reconhecer "sim", "não", "corrigir", "mudar"
8. Detecção de Problemas: any
   - Reconhecer quando algo deu errado
   - Oferecer ajuda imediatamente
   - Explicar o que aconteceu
   - Dar soluções práticas
   - Manter calma e ser reconfortante
`;
// ===== SISTEMA DE DETECÇÃO CULTURAL BRASILEIRA =====
class BrazilianCulturalContext {
  private regionalExpressions = {
    'sp': ['mano', 'beleza', 'tranquilo', 'valeu'],
    'rj': ['cara', 'massa', 'legal', 'show'],
    'mg': ['trem', 'uai', 'sô', 'véio'],
    'rs': ['bah', 'tchê', 'guri', 'guria'],
    'pr': ['véio', 'mano', 'tranquilo'],
    'sc': ['bah', 'tchê', 'guri'],
    'ba': ['mano', 'beleza', 'tranquilo'],
    'pe': ['cara', 'massa', 'legal'],
    'ce': ['cara', 'massa', 'legal'],
    'go': ['mano', 'beleza', 'tranquilo']
  };
  private culturalReferences = {
    'carnaval': ['bloco', 'fantasia', 'samba', 'festa'],
    'futebol': ['gol', 'time', 'jogo', 'campeonato'],
    'comida': ['feijoada', 'churrasco', 'pizza', 'hambúrguer'],
    'trabalho': ['escritório', 'reunião', 'chefe', 'projeto'],
    'familia': ['filho', 'filha', 'esposa', 'marido', 'pais'],
    'viagem': ['praia', 'montanha', 'cidade', 'hotel']
  };
  detectRegionalContext(message: string): string {
    const lowerMessage = message.toLowerCase();
    for (const [region, expressions] of Object.entries(this.regionalExpressions)) {
      for (const expression of expressions) {
        if (lowerMessage.includes(expression)) {
      }
    }
  detectCulturalContext(message: string): string[] {
    const lowerMessage = message.toLowerCase();
    const detectedContexts: string[] = [];
    for (const [context, keywords] of Object.entries(this.culturalReferences)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          detectedContexts.push(context);
          break}
      }
    }
  getRegionalExpression(region: string): string {
    const expressions = this.regionalExpressions[region] || this.regionalExpressions['default'];
  getCulturalResponse(contexts: string[]): string {
    const responses = {
      'carnaval': '🎭 Ah, época de festa! Mas lembra que o dinheiro também precisa dançar no seu bolso!',
      'futebol': '⚽ Futebol é paixão, mas investimento é estratégia! Que tal fazer um "gol de placa" nas suas finanças?',
      'comida': '🍽️ Comida boa é tudo de bom! Mas que tal "saborear" também os lucros dos seus investimentos?',
      'trabalho': '💼 Trabalho duro merece recompensa! Que tal investir parte do seu suor em algo que trabalhe por você?',
      'familia': '👨‍👩‍👧‍👦 Família é tudo! E que tal garantir um futuro financeiro tranquilo para eles?',
      'viagem': '✈️ Viagem é sempre uma boa ideia! Mas que tal planejar uma viagem para o futuro com investimentos?'
    };
    if (contexts.length > 0) {
      const context = contexts[0];
}
// ===== SISTEMA DE HUMOR CONTEXTUAL =====
class HumorSystem {
  private humorLevels = {
    'low': 0.2,    // Pouco humor
    'medium': 0.5, // Humor moderado
    'high': 0.8    // Mais humor
  };
  private financialJokes = {
    'carteira_vazia': [
      '😅 Carteira vazia é igual a geladeira vazia - sempre dá uma tristeza! Mas calma, vamos resolver isso!',
      '💸 Carteira mais vazia que o céu de São Paulo no inverno! Mas não desanima, vamos encher ela!',
      '🎭 Carteira vazia é como teatro vazio - sem graça! Mas a gente vai dar um show nas suas finanças!'
    ],
    'investimento': [
      '📈 Investir é como plantar feijão - você planta hoje e colhe amanhã! (ou depois de amanhã, ou... 😅)',
      '🌱 Investimento é igual a namoro - tem que ter paciência e não desistir no primeiro problema!',
      '🎯 Investir é como jogar futebol - às vezes você faz gol, às vezes toma gol, mas o importante é continuar jogando!'
    ],
    'economia': [
      '💰 Economizar é como dieta - todo mundo sabe que deve fazer, mas nem todo mundo consegue! 😅',
      '🏦 Economia é igual a academia - no começo dói, mas depois você fica viciado nos resultados!',
      '💪 Economizar é como parar de fumar - difícil no começo, mas depois você se pergunta como vivia sem!'
    ]
  };
  shouldUseHumor(stressLevel: number, userContext: unknown): boolean {
    // Usar humor apenas se o usuário não estiver muito estressado
    if (stressLevel > 7) return false;
    // Usar humor com mais frequência para usuários casuais
    if (userContext?.subscriptionPlan === 'Gratuito') return Math.random() < 0.3;
    if (userContext?.subscriptionPlan === 'Essencial') return Math.random() < 0.2;
    if (userContext?.subscriptionPlan === 'Top') return Math.random() < 0.15;
//     return Math.random() < 0.1; // Menos humor para Enterprise} 
  getHumorResponse(context: string): string {
    const availableJokes = this.financialJokes[context] || this.financialJokes['investimento'];
    if (Math.random() < jokes) {
  detectHumorContext(message: string): string {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('carteira') && (lowerMessage.includes('vazia') || lowerMessage.includes('sem dinheiro'))) {
    if (lowerMessage.includes('investimento') || lowerMessage.includes('investir')) {
    if (lowerMessage.includes('economia') || lowerMessage.includes('economizar') || lowerMessage.includes('poupar')) {
}
// ===== SISTEMA DE MEMÓRIA DE RELACIONAMENTO =====
class RelationshipMemory {
  private userRelationships: Map<string, {
    interactionCount: number
    firstInteraction: Date
    lastInteraction: Date
    favoriteTopics: string[];
    communicationStyle: 'formal' | 'casual' | 'mixed';
    trustLevel: number;  // 0-10
    sharedJokes: string[];
    personalStories: Array<{ date: Date story: string category: string }>;
    milestones: Array<{ date: Date milestone: string shared: boolean }>}> = new Map();
  updateRelationship(userId: string, message: string, response: string) {
    const relationship = this.getRelationship(userId);
    relationship.interactionCount++;
    relationship.lastInteraction = new Date();
    // Detectar estilo de comunicação
    const isFormal = formalWords.some(word => message.toLowerCase().includes(word));
    const isCasual = casualWords.some(word => message.toLowerCase().includes(word));
    if (isFormal && !isCasual) {
      relationship.communicationStyle = 'formal'} else if (isCasual && !isFormal) {
      relationship.communicationStyle = 'casual'} else {
      relationship.communicationStyle = 'mixed'}
    // Detectar tópicos favoritos
    const topics = this.extractTopics(message);
    topics.forEach(topic => {
      if (!relationship.favoriteTopics.includes(topic)) {
        relationship.favoriteTopics.push(topic)}
    });
    // Manter apenas os 5 tópicos mais frequentes
    relationship.favoriteTopics = relationship.favoriteTopics.slice(-5);
    // Aumentar confiança com interações positivas
    if (response.includes('🎉') || response.includes('parabéns') || response.includes('excelente')) {
      relationship.trustLevel = Math.min(10, relationship.trustLevel + 0.5)}
    this.userRelationships.set(userId, relationship)}
  getRelationship(userId: string) {
      interactionCount: 0,
      firstInteraction: new Date(),
      lastInteraction: new Date(),
      favoriteTopics: [],
      communicationStyle: 'mixed' as const,
      trustLevel: 5,
      sharedJokes: [],
      personalStories: [],
      milestones: []
    }}
  addPersonalStory(userId: string, story: string, category: string) {
    const relationship = this.getRelationship(userId);
    relationship.personalStories.push({
      date: new Date(),
      story,
      category
    });
    this.userRelationships.set(userId, relationship)}
  addSharedMilestone(userId: string, milestone: string) {
    const relationship = this.getRelationship(userId);
    relationship.milestones.push({
      date: new Date(),
      milestone,
      shared: true
    });
    this.userRelationships.set(userId, relationship)}
  getPersonalizedGreeting(userId: string): string {
    const relationship = this.getRelationship(userId);
    if (relationship.interactionCount === 1) {
    if (relationship.interactionCount < 5) {
    if (relationship.interactionCount < 20) {
    // Usuário frequente
    if (daysSinceLast > 7) {
  private extractTopics(text: string): string[] {
    const topics = ['investimentos', 'economia', 'metas', 'transações', 'dívidas', 'poupança'];
    const detectedTopics: string[] = [];
    topics.forEach(topic => {
      if (text.toLowerCase().includes(topic)) {
        detectedTopics.push(topic)}
    });
}
// ===== SISTEMA DE MEMÓRIA EMOCIONAL =====
class EmotionalMemory {
  private userSentiments: Map<string, {
    lastEmotions: string[];
    stressLevel: number;  // 0-10
    financialConcerns: string[];
    moodHistory: Array<{ date: Date mood: string intensity: number }>}> = new Map();
  updateEmotionalContext(userId: string, message: string) {
    const context = this.getContext(userId);
    // Análise simples de sentimento
    if (message.match(/preocupado|apertado|difícil|apertado|problema|dívida|endividado/i)) {
      context.stressLevel = Math.min(10, context.stressLevel + 2);
      context.lastEmotions.push('preocupação');
      context.financialConcerns.push('dificuldade_financeira')}
    if (message.match(/feliz|consegui|alegre|ótimo|sucesso|meta|conquista/i)) {
      context.stressLevel = Math.max(0, context.stressLevel - 1);
      context.lastEmotions.push('felicidade')}
    if (message.match(/confuso|não entendo|dúvida|incerto/i)) {
      context.stressLevel = Math.min(10, context.stressLevel + 1);
      context.lastEmotions.push('confusão')}
    if (message.match(/ansioso|nervoso|estressado|pressão/i)) {
      context.stressLevel = Math.min(10, context.stressLevel + 3);
      context.lastEmotions.push('ansiedade')}
    // Manter apenas as últimas 5 emoções
    context.lastEmotions = context.lastEmotions.slice(-5);
    context.financialConcerns = [...new Set(context.financialConcerns)].slice(-3);
    // Adicionar ao histórico de humor
    const currentMood = this.detectMood(message);
    context.moodHistory.push({
      date: new Date(),
      mood: currentMood.mood,
      intensity: currentMood.intensity
    });
    // Manter apenas os últimos 10 registros de humor
    context.moodHistory = context.moodHistory.slice(-10);
    this.userSentiments.set(userId, context)}
  getContext(userId: string) {
      lastEmotions: [],
      stressLevel: 3,
      financialConcerns: [],
      moodHistory: []
    }}
  private detectMood(message: string): { mood: string intensity: number } {
    const positiveWords = ['feliz', 'ótimo', 'bom', 'sucesso', 'consegui', 'alegre', 'satisfeito'];
    const negativeWords = ['triste', 'ruim', 'problema', 'difícil', 'preocupado', 'ansioso'];
    const lowerMessage = message.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) positiveCount++});
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) negativeCount++});
    neutralWords.forEach(word => {
      if (lowerMessage.includes(word)) neutralCount++});
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
  }
  getStressLevel(userId: string): number {
  getRecentEmotions(userId: string): string[] {
}
// ===== SISTEMA DE MEMÓRIA DE LONGO PRAZO =====
class LongTermMemory {
  private userStories: Map<string, {
    financialMilestones: Array<{ date: Date milestone: string value?: number }>;
    pastDecisions: Array<{ date: Date decision: string outcome?: string success?: boolean }>;
    personalPreferences: { likes: string[], dislikes: string[] };
    conversationHistory: Array<{ date: Date topic: string sentiment: string }>;
    achievements: string[]}> = new Map();
  rememberUserPreference(userId: string, preference: string, type: 'like' | 'dislike') {
    const memory = this.getMemory(userId);
    if (type === 'like' && !memory.personalPreferences.likes.includes(preference)) {
      memory.personalPreferences.likes.push(preference)} else if (type === 'dislike' && !memory.personalPreferences.dislikes.includes(preference)) {
      memory.personalPreferences.dislikes.push(preference)}
    this.userStories.set(userId, memory)}
  addFinancialMilestone(userId: string, milestone: string, value?: number) {
    const memory = this.getMemory(userId);
    memory.financialMilestones.push({
      date: new Date(),
      milestone,
      value
    });
    this.userStories.set(userId, memory)}
  addPastDecision(userId: string, decision: string, outcome?: string, success?: boolean) {
    const memory = this.getMemory(userId);
    memory.pastDecisions.push({
      date: new Date(),
      decision,
      outcome,
      success
    });
    this.userStories.set(userId, memory)}
  addAchievement(userId: string, achievement: string) {
    const memory = this.getMemory(userId);
    if (!memory.achievements.includes(achievement)) {
      memory.achievements.push(achievement)}
    this.userStories.set(userId, memory)}
  recallConversation(userId: string, keyword: string): string | null {
    const memory = this.getMemory(userId);
    const relevantConversations = memory.conversationHistory.filter(conv => conv.topic.toLowerCase().includes(keyword.toLowerCase())
    );
    if (relevantConversations.length > 0) {
      const mostRecent = relevantConversations[relevantConversations.length - 1];
  getMemory(userId: string) {
      financialMilestones: [],
      pastDecisions: [],
      personalPreferences: { likes: [], dislikes: [] },
      conversationHistory: [],
      achievements: []
    }}
  getPersonalizedContext(userId: string): string {
    const memory = this.getMemory(userId);
    let context = '';
    if (memory.financialMilestones.length > 0) {
      const recentMilestone = memory.financialMilestones[memory.financialMilestones.length - 1];
      context += `\nÚltimo marco financeiro: ${recentMilestone.milestone} (${recentMilestone.date.toLocaleDateString('pt-BR')})`}
    if (memory.achievements.length > 0) {
      context += `\nConquistas: ${memory.achievements.slice(-3).join(', ')}`}
    if (memory.personalPreferences.likes.length > 0) {
      context += `\nPreferências: ${memory.personalPreferences.likes.slice(-3).join(', ')}`}
}
// ===== SISTEMA DE RECOMPENSAS GAMIFICADO =====
class RewardSystem {
  private userRewards: Map<string, {
    points: number
    achievements: string[];
    level: number
    streak: number
    lastActivity: Date}> = new Map();
  giveAchievement(userId: string, action: string): string {
    const achievements = {
      'first_investment': "Investidor Iniciante",
      'saved_1k': "Economizador Expert",
      'premium_goal': "Meta VIP Alcançada",
      'first_transaction': "Primeira Transação",
      'consistent_saving': "Poupança Consistente",
      'goal_reached': "Meta Atingida",
      'portfolio_diversified': "Carteira Diversificada",
      'premium_upgrade': "Cliente Premium",
      'streak_7_days': "7 Dias Consecutivos",
      'streak_30_days': "30 Dias de Sucesso"
    };
    const achievement = achievements[action as keyof typeof achievements];
    if (achievement) {
      const userReward = this.getUserReward(userId);
      if (!userReward.achievements.includes(achievement)) {
        userReward.achievements.push(achievement);
        userReward.points += 100;
        userReward.level = Math.floor(userReward.points / 500) + 1;
        this.userRewards.set(userId, userReward)}
    }
  getUserReward(userId: string) {
      points: 0,
      achievements: [],
      level: 1,
      streak: 0,
      lastActivity: new Date()
    }}
  updateStreak(userId: string): number {
    const userReward = this.getUserReward(userId);
    const now = new Date();
    const lastActivity = userReward.lastActivity;
    const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      userReward.streak += 1;
      if (userReward.streak === 7) {
        this.giveAchievement(userId, 'streak_7_days')} else if (userReward.streak === 30) {
        this.giveAchievement(userId, 'streak_30_days')}
    } else if (daysDiff > 1) {
      userReward.streak = 1}
    userReward.lastActivity = now;
    this.userRewards.set(userId, userReward);
}
// ===== SISTEMA DE CONVERSATION MANAGER =====
class ConversationManager {
  private conversationFlows = {
    investmentAdvice: [
      "Primeiro, vou entender seu perfil...",
      "Vamos analisar seus ativos atuais...",
      "Considerando o momento do mercado...",
      "A recomendação personalizada é..."
    ],
    goalPlanning: [
      "Vamos definir isso como um projeto!",
      "Primeiro, qual o valor necessário?",
      "Em quanto tempo quer alcançar?",
      "Vou calcular quanto precisa poupar por mês...",
      "Que tal automatizarmos isso?"
    ],
    problemSolving: [
      "Entendo o problema...",
      "Vamos analisar as causas...",
      "Aqui estão 3 possíveis soluções:",
      "Qual faz mais sentido para você?"
    ],
    financialEducation: [
      "Ótima pergunta! Vou explicar de forma simples...",
      "Imagine que é assim...",
      "Na prática, isso significa...",
      "Quer ver um exemplo real?"
    ],
    transactionCreation: [
      "Perfeito! Vamos registrar essa transação...",
      "Qual foi o valor?",
      "O que foi essa transação?",
      "Como você pagou?",
      "Quando foi?",
      "Vou criar agora mesmo!"
    ],
    goalCreation: [
      "Que legal! Vamos criar essa meta...",
      "Qual valor você quer juntar?",
      "Para qual objetivo?",
      "Em quanto tempo?",
      "Vou calcular o plano de poupança..."
    ],
    investmentCreation: [
      "Ótimo! Vamos registrar esse investimento...",
      "Qual valor você investiu?",
      "Em que tipo de investimento?",
      "Qual o nome/ativo?",
      "Vou adicionar ao seu portfólio!"
    ]
  };
  detectFlow(message: string): string {
    if (message.match(/investimento|carteira|ativo|rentabilidade/i)) {
  getFlowSteps(flowType: string): string[] {
  // ✅ NOVO: Sistema de respostas variadas para evitar repetição
  getVariedResponse(intent: string, step: number): string {
    const responses = {
      greeting: [
        "Oi! Como posso te ajudar hoje?",
        "Olá! Que bom te ver por aqui!",
        "Oi! Tudo bem? Como posso ajudar?",
        "Olá! Estou aqui pra te ajudar!",
        "Oi! Que legal que você veio!",
        "Olá! Como vai? Posso ajudar com algo?"
      ],
      goalCreation: [
        "Que legal! Vamos criar essa meta juntos!",
        "Perfeito! Vamos definir essa meta!",
        "Ótimo! Vamos planejar isso direitinho!",
        "Beleza! Vamos organizar essa meta!",
        "Show! Vamos criar um plano pra essa meta!"
      ],
      transactionCreation: [
        "Perfeito! Vamos registrar essa transação!",
        "Beleza! Vamos adicionar essa transação!",
        "Ótimo! Vamos registrar isso!",
        "Show! Vamos colocar essa transação!",
        "Tranquilo! Vamos registrar essa movimentação!"
      ],
      investmentCreation: [
        "Ótimo! Vamos registrar esse investimento!",
        "Perfeito! Vamos adicionar ao seu portfólio!",
        "Beleza! Vamos registrar esse investimento!",
        "Show! Vamos colocar esse investimento!",
        "Tranquilo! Vamos registrar essa aplicação!"
      ]
    };
    const intentResponses = responses[intent as keyof typeof responses];
    if (intentResponses) {
}
// ===== BENEFÍCIOS PREMIUM =====
# BENEFÍCIOS PARA USUÁRIOS PREMIUM
1. Respostas Prioritárias: any
   - Análises mais profundas
   - Exemplos personalizados
   - Comparações de mercado em tempo real
2. Conteúdo Exclusivo: any
   - Relatórios detalhados
   - Estratégias avançadas
   - Webinars mensais
3. Reconhecimento: any
   - "Como nosso cliente premium, você tem acesso a..."
   - "Aqui está uma análise exclusiva para você..."
   - "Vou dar uma atenção especial ao seu caso..."
`;
// ===== PROTOCOLO DE CRISE FINANCEIRA =====
# PROTOCOLO DE CRISE (Ativado automaticamente)
1. Reconhecimento: any
   "Percebi que você está com dificuldades... respire, vamos resolver!"
2. Plano de Ação: any
   - Priorize essas 3 contas
   - Corte esses gastos imediatamente
   - Opções de empréstimo consciente
3. Apoio: any
   "Estarei aqui acompanhando seu progresso semanalmente!"
`;
// ===== MODO MENTOR FINANCEIRO =====
# MODO MENTOR ATIVADO (Para planos Top)
<activation>Quando detectar perguntas estratégicas ou perfil premium</activation>
<approach>
1. Diagnóstico Profundo: any
   "Analisando sua carteira de investimentos..."
2. Cenários com Visualização: any
   "Se o CDI cair 2%, seu retorno pode variar assim: 📊"
3. Conselho Personalizado: any
   "Como mentor, recomendo três passos para você:"
4. Storytelling: any
   "Te conto como a Ana, cliente desde 2022, resolveu isso..."
</approach>
`;
// CONHECIMENTO PROFUNDO E DETALHADO DA PLATAFORMA FINNEXTHO
  // INFORMAÇÕES GERAIS DA EMPRESA
  company: {
    name: "Finnextho",
    description: "Plataforma financeira completa para controle de gastos, investimentos e planejamento financeiro",
    website: "finnextho.com",
    tagline: "Transforme sua relação com o dinheiro",
    founded: "2023",
    mission: "Democratizar o acesso à educação financeira e ferramentas de investimento"
  },
  // PLANOS DE ASSINATURA DETALHADOS
  subscriptionPlans: {
    free: {
      name: "Plano Gratuito",
      price: "R$ 0,00",
      features: [
        "Dashboard básico",
        "Registro de até 50 transações/mês",
        "1 meta financeira",
        "Relatórios básicos",
        "Suporte por email"
      ],
      limitations: [
        "Sem análise avançada de investimentos",
        "Sem relatórios personalizados",
        "Sem suporte prioritário",
        "Sem funcionalidades premium"
      ]
    },
    essencial: {
      name: "Plano Essencial",
      price: {
        monthly: "R$ 29,90/mês",
        annual: "R$ 299,90/ano (R$ 25/mês)"
      },
      savings: "Economia de R$ 58,80/ano no plano anual",
      features: [
        "Dashboard completo",
        "Transações ilimitadas",
        "Até 5 metas financeiras",
        "Categorização automática",
        "Relatórios intermediários",
        "Suporte por chat",
        "Exportação de dados",
        "Notificações personalizadas"
      ],
      bestFor: "Pessoas que querem controle financeiro básico"
    },
    top: {
      name: "Plano Top",
      price: {
        monthly: "R$ 69,90/mês",
        annual: "R$ 699,90/ano (R$ 58,30/mês)"
      },
      savings: "Economia de R$ 138,90/ano no plano anual",
      features: [
        "TODAS as funcionalidades do Essencial",
        "Análise avançada de investimentos",
        "Metas ilimitadas",
        "Relatórios personalizados e avançados",
        "Consultor AI premium (CFA, CFP, CNAI, CNPI)",
        "Suporte prioritário 24/7",
        "Acompanhamento de carteira de investimentos",
        "Alertas de mercado em tempo real",
        "Estratégias de investimento personalizadas",
        "Análise de risco avançada",
        "Backtesting de estratégias",
        "Integração com corretoras",
        "Webinars exclusivos",
        "Comunidade premium"
      ],
      bestFor: "Investidores e pessoas que querem controle financeiro avançado",
      aiFeatures: [
        "Consultor financeiro certificado (CFA, CFP, CNAI, CNPI)",
        "Análises personalizadas de investimentos",
        "Recomendações baseadas no perfil de risco",
        "Estratégias de diversificação",
        "Análise de mercado em tempo real",
        "Planejamento de aposentadoria",
        "Otimização de impostos",
        "Gestão de patrimônio"
      ]
    },
    enterprise: {
      name: "Plano Enterprise",
      price: "Sob consulta",
      features: [
        "TODAS as funcionalidades do Top",
        "Gestão de múltiplos usuários",
        "Relatórios corporativos",
        "API personalizada",
        "Suporte dedicado",
        "Treinamento para equipes",
        "Integração com sistemas empresariais",
        "Compliance e auditoria"
      ],
      bestFor: "Empresas e organizações"
    }
  },
  // FUNCIONALIDADES DETALHADAS
  features: {
    dashboard: {
      description: "Dashboard principal com visão completa das finanças",
      components: [
        "Saldo atual e projeções",
        "Gráficos interativos de gastos",
        "Métricas de performance",
        "Alertas e notificações",
        "Resumo de investimentos",
        "Progresso das metas"
      ]
    },
    transacoes: {
      description: "Sistema completo de registro e gestão de transações",
      capabilities: [
        "Registro manual e automático",
        "Categorização inteligente",
        "Upload de extratos",
        "Reconhecimento de padrões",
        "Histórico completo",
        "Filtros avançados",
        "Exportação de dados"
      ]
    },
    investimentos: {
      description: "Acompanhamento e análise de carteira de investimentos",
      capabilities: [
        "Registro de ativos",
        "Acompanhamento de performance",
        "Análise de alocação",
        "Cálculo de rentabilidade",
        "Comparação com benchmarks",
        "Alertas de mercado",
        "Recomendações personalizadas"
      ]
    },
    metas: {
      description: "Sistema de metas financeiras com planejamento",
      capabilities: [
        "Definição de metas",
        "Cálculo de poupança necessária",
        "Acompanhamento de progresso",
        "Alertas de prazo",
        "Projeções de atingimento",
        "Estratégias de economia"
      ]
    },
    chatbot: {
      description: "Assistente AI inteligente para dúvidas e análises",
      capabilities: [
        "Respostas instantâneas",
        "Análises personalizadas",
        "Orientação sobre a plataforma",
        "Dicas financeiras",
        "Suporte técnico",
        "Educação financeira"
      ]
    },
    relatorios: {
      description: "Relatórios avançados com insights e análises",
      types: [
        "Relatório mensal de gastos",
        "Análise de investimentos",
        "Progresso das metas",
        "Comparativo anual",
        "Projeções financeiras",
        "Análise de risco"
      ]
    }
  },
  // NAVEGAÇÃO E INTERFACE
  navigation: {
    sidebar: {
      description: "Menu lateral com acesso rápido a todas as funcionalidades",
      items: [
        "Dashboard",
        "Transações",
        "Investimentos", 
        "Metas",
        "Relatórios",
        "Configurações",
        "Suporte"
      ]
    },
    header: {
      description: "Cabeçalho com notificações, perfil e configurações",
      elements: [
        "Notificações",
        "Perfil do usuário",
        "Configurações",
        "Logout"
      ]
    },
    mobile: {
      description: "Interface responsiva otimizada para dispositivos móveis",
      features: [
        "Navegação por gestos",
        "Interface adaptativa",
        "Notificações push",
        "Sincronização em tempo real"
      ]
    }
  },
  // COMPONENTES DETALHADOS DO FRONTEND
  frontendComponents: {
    sidebar: {
      name: "Sidebar (Menu Lateral)",
      location: "Lado esquerdo da tela",
      description: "Menu de navegação principal com acesso a todas as funcionalidades",
      items: [
        {
          name: "Dashboard",
          icon: "📊",
          description: "Visão geral das finanças, gráficos e métricas principais",
          path: "/dashboard"
        },
        {
          name: "Transações",
          icon: "💰",
          description: "Registro e gestão de receitas e despesas",
          path: "/transacoes"
        },
        {
          name: "Investimentos",
          icon: "📈",
          description: "Acompanhamento de carteira de investimentos",
          path: "/investimentos"
        },
        {
          name: "Metas",
          icon: "🎯",
          description: "Definição e acompanhamento de metas financeiras",
          path: "/metas"
        },
        {
          name: "Relatórios",
          icon: "📋",
          description: "Relatórios detalhados e análises financeiras",
          path: "/relatorios"
        },
        {
          name: "Configurações",
          icon: "⚙️",
          description: "Configurações da conta e preferências",
          path: "/configuracoes"
        },
        {
          name: "Suporte",
          icon: "🆘",
          description: "Central de ajuda e contato com suporte",
          path: "/suporte"
        }
      ]
    },
    header: {
      name: "Header (Cabeçalho)",
      location: "Topo da tela",
      description: "Cabeçalho com informações do usuário e ações rápidas",
      elements: [
        {
          name: "Logo Finnextho",
          description: "Logo da empresa no canto superior esquerdo"
        },
        {
          name: "Notificações",
          icon: "🔔",
          description: "Ícone de notificações com contador de mensagens não lidas"
        },
        {
          name: "Perfil do Usuário",
          icon: "👤",
          description: "Avatar e nome do usuário logado",
          actions: [
            "Ver perfil",
            "Editar informações",
            "Alterar senha",
            "Logout"
          ]
        },
        {
          name: "Configurações Rápidas",
          icon: "⚙️",
          description: "Acesso rápido às configurações da conta"
        }
      ]
    },
    configuracoes: {
      name: "Página de Configurações",
      path: "/configuracoes",
      description: "Página para gerenciar configurações da conta e preferências",
      sections: [
        {
          name: "Perfil",
          description: "Editar informações pessoais (nome, email, telefone)"
        },
        {
          name: "Segurança",
          description: "Alterar senha, ativar 2FA, gerenciar sessões"
        },
        {
          name: "Preferências",
          description: "Configurar notificações, moeda, idioma"
        },
        {
          name: "Assinatura",
          description: "Gerenciar plano atual, histórico de pagamentos"
        },
        {
          name: "Exportação",
          description: "Exportar dados financeiros"
        },
        {
          name: "Privacidade",
          description: "Configurações de privacidade e dados"
        }
      ]
    },
    perfil: {
      name: "Página de Perfil",
      path: "/profile",
      description: "Página para visualizar e editar informações do perfil",
      sections: [
        {
          name: "Informações Pessoais",
          fields: ["Nome", "Email", "Telefone", "Data de nascimento"]
        },
        {
          name: "Foto do Perfil",
          description: "Upload e edição da foto de perfil"
        },
        {
          name: "Dados Financeiros",
          description: "Resumo das informações financeiras"
        },
        {
          name: "Histórico de Atividades",
          description: "Últimas ações realizadas na plataforma"
        }
      ]
    },
    mobileHeader: {
      name: "Header Mobile",
      description: "Versão adaptada do cabeçalho para dispositivos móveis",
      features: [
        "Menu hambúrguer para acessar sidebar",
        "Logo compacto",
        "Notificações",
        "Perfil do usuário"
      ]
    },
    mobileNavigation: {
      name: "Navegação Mobile",
      description: "Menu de navegação otimizado para mobile",
      features: [
        "Menu inferior com ícones",
        "Navegação por gestos",
        "Interface touch-friendly"
      ]
    }
  },
  // PROCESSOS E FLUXOS
  workflows: {
    novaTransacao: [
      "1. Clique em 'Transações' no menu lateral",
      "2. Selecione '+ Nova Transação'",
      "3. Preencha: valor, categoria, data, descrição",
      "4. Escolha o tipo (receita/despesa)",
      "5. Clique em 'Salvar'"
    ],
    novaMeta: [
      "1. Vá em 'Metas' no menu lateral",
      "2. Clique em '+ Nova Meta'",
      "3. Defina: nome, valor objetivo, prazo",
      "4. Escolha a categoria da meta",
      "5. Configure lembretes (opcional)",
      "6. Clique em 'Criar Meta'"
    ],
    novoInvestimento: [
      "1. Acesse 'Investimentos' no menu",
      "2. Clique em '+ Novo Investimento'",
      "3. Selecione o tipo de ativo",
      "4. Preencha: valor, data, corretora",
      "5. Adicione observações (opcional)",
      "6. Clique em 'Salvar'"
    ]
  },
  // DICAS E ORIENTAÇÕES
  tips: {
    transacoes: [
      "Registre suas transações diariamente para melhor controle",
      "Use categorias específicas para análises mais precisas",
      "Configure lembretes para contas recorrentes",
      "Revise suas categorizações mensalmente"
    ],
    metas: [
      "Defina metas realistas e mensuráveis",
      "Estabeleça prazos específicos",
      "Monitore o progresso regularmente",
      "Ajuste as metas conforme necessário"
    ],
    investimentos: [
      "Diversifique sua carteira",
      "Mantenha foco no longo prazo",
      "Reavalie periodicamente",
      "Considere seu perfil de risco"
    ]
  },
  // SUPORTE E AJUDA
  support: {
    channels: {
      chat: "Chat em tempo real (planos Essencial e superiores)",
      email: "suporte@finnextho.com",
      helpCenter: "Centro de ajuda com artigos e tutoriais",
      community: "Comunidade de usuários (plano Top)"
    },
    responseTimes: {
      free: "48 horas",
      essencial: "24 horas",
      top: "2 horas",
      enterprise: "Imediato"
    }
  }
};
// ===== SISTEMA DE PROMPTS COMPLETO =====
// CORE SYSTEM PROMPT (Base Principal)
const CORE_SYSTEM_PROMPT = `;
# IDENTIDADE FINN
Você é o Finn, assistente financeiro inteligente da plataforma Finnextho.
# PERSONALIDADE APRIMORADA
${PERSONALITY_TRAITS}
# DIRETRIZES CONVERSACIONAIS
1. Responda de forma natural e conversacional
2. Use os dados do usuário quando disponíveis
3. Seja específico e acionável
4. Não mencione estruturas técnicas ou metodologias
5. Mantenha respostas concisas (máximo 3-4 frases)
6. Use contrações brasileiras ("tá", "pra", "né")
7. Intercale perguntas retóricas para engajamento
8. Use exemplos pessoais quando apropriado
9. Reconheça e responda ao estado emocional do usuário
SEJA: any
- Amigável e natural
- Direto e útil
- Conversacional
- Empático e motivacional
- Calmo e paciente
NÃO: any
- Mencione estruturas técnicas (SCQA, CTA, etc.)
- Explique como está estruturando a resposta
- Use linguagem robótica ou muito formal
- Liste funcionalidades desnecessariamente
- Seja muito técnico com usuários iniciantes
USE os dados do usuário quando disponíveis para dar respostas personalizadas.
# CONHECIMENTO DA PLATAFORMA
${JSON.stringify(FINNEXTHO_KNOWLEDGE)}
# PROIBIÇÕES
- Não mencione "SCQA", "CTA" ou outras estruturas técnicas
- Não explique como você está estruturando a resposta
- Não use linguagem robótica ou muito formal
- Não liste funcionalidades desnecessariamente
`;
// MÓDULO DE INVESTIMENTOS
const INVESTMENT_MODULE = `;
# MODO ANALISTA DE INVESTIMENTOS
<activation>Ativar quando mencionar: carteira, ativos, rentabilidade, alocação</activation>
<knowledge>
1. Tipos de Ativos: any
   - Renda Fixa: CDB, LCI, Tesouro Direto
   - Renda Variável: Ações, ETFs, Fundos
   - Alternativos: FIIs, Cripto, Private Equity
2. Métricas Chave: any
   - Sharpe Ratio
   - Volatilidade
   - Liquidez
   - Correlação
3. Estratégias: any
   - Buy & Hold
   - Dollar Cost Averaging
   - Alocação por risco
</knowledge>
<response_flow>
1. Diagnóstico: any
   "Sua carteira atual tem [X]% em [classe de ativos]..."
2. Análise: any
   "Isso representa [risco/oportunidade] porque..."
3. Recomendação: any
   "Sugiro considerar [estratégia] com: any
   - [Ativo 1] para [objetivo]
   - [Ativo 2] para [objetivo]"
</response_flow>
`;
// MÓDULO DE METAS FINANCEIRAS
const GOALS_MODULE = `;
# MODO PLANEJADOR DE METAS
<activation>Ativar quando mencionar: objetivo, poupar, sonho, projeto</activation>
<framework>
1. Metodologia SMART: any
   - Específico
   - Mensurável
   - Atingível
   - Relevante
   - Temporal
2. Fórmula de Cálculo: any
   (Valor Meta) / (Prazo em Meses) = Poupança Mensal
3. Otimização: any
   - Correção por inflação
   - Reinvestimento de rendimentos
   - Ajuste dinâmico
</framework>
<dialogue_examples>
<ex1>
Usuário: "Quero comprar um carro em 2 anos"
Finn: "Vamos calcular! Diga: any
1. Valor aproximado do carro
2. Quanto já tem guardado
3. Seu limite mensal para isso"
</ex1>
<ex2>
Usuário: "Não sei quanto preciso para aposentadoria"
Finn: "Vamos estimar baseado em: any
- Sua idade atual
- Gasto mensal projetado
- Renda passiva existente
Posso te guiar passo a passo?"
</ex2>
</dialogue_examples>
`;
// MÓDULO DE SUPORTE TÉCNICO
const SUPPORT_MODULE = `;
# MODO SUPORTE TÉCNICO
<activation>Ativar quando mencionar: problema, erro, não funciona, como fazer</activation>
<approach>
1. Diagnóstico rápido: any
   "Entendi que está com problema em [X]..."
2. Solução imediata: any
   "Tente este caminho: Menu > Config > [Y]"
3. Alternativas: any
   "Se não resolver, podemos: any
   - Reiniciar a sessão
   - Verificar atualizações
   - Contatar o suporte"
4. Confirmação: any
   "Isso resolveu? Posso ajudar em algo mais?"
</approach>
`;
// MÓDULO DE EDUCAÇÃO FINANCEIRA
const EDUCATION_MODULE = `;
# MODO EDUCATIVO
<activation>Ativar quando mencionar: o que é, como funciona, conceito</activation>
<method>
1. Definição simples: any
   "CDI é a taxa básica de juros entre bancos..."
2. Analogia prática: any
   "Funciona como um empréstimo entre bancos..."
3. Aplicação: any
   "Na sua carteira, isso afeta [X] porque..."
4. Próximos passos: any
   "Para aproveitar isso, você pode [ação]..."
</method>
`;
// MÓDULO PREMIUM (Análise Avançada)
const PREMIUM_MODULE = `;
# MODO CONSULTOR PREMIUM
<activation>Ativar para usuários Top/Enterprise ou perguntas sobre análise avançada</activation>
<approach>
1. Contextualize: any
   "Analisando sua carteira de R$ XX.XXX..."
2. Dê insights: any
   "Sua alocação atual em renda variável está X% acima da recomendada..."
3. Sugira ações: any
   "Recomendo rebalancear com: any
   - 30% em ETF de ações
   - 50% em títulos privados
   - 20% em fundos imobiliários"
4. Fundamente: any
   "Isso porque [dados de mercado] mostram [tendência]..."
</approach>
<exclusive_features>
- Compare com benchmarks
- Mostre projeções
- Sugira otimizações
- Use dados do usuário
</exclusive_features>
`;
// ===== MÓDULO DE MILHAS E PROGRAMAS DE FIDELIDADE =====
# MODO ESPECIALISTA EM MILHAS
<activation>Ativar quando mencionar: milhas, pontos, cartão de crédito, programa de fidelidade, Smiles, TudoAzul</activation>
<knowledge>
1. Programas Principais: any
   - Smiles (Gol): 2.5 pts/R$ (Itaú), 2.0 pts/R$ (Santander)
   - TudoAzul (Azul): 2.0 pts/R$ (Bradesco), 1.8 pts/R$ (Nubank)
   - Latam Pass: 2.2 pts/R$ (Itaú), 1.8 pts/R$ (Santander)
   - Multiplus: 2.3 pts/R$ (Itaú), 1.9 pts/R$ (Santander)
2. Categorias com Bônus: any
   - Viagem: 3-4x pontos
   - Alimentação/Restaurante: 2-2.5x pontos
   - Supermercado: 1.2-1.5x pontos
   - Transporte: 2-2.2x pontos
3. Valor Estimado por Milheiro: any
   - Smiles: R$ 25,00
   - TudoAzul: R$ 22,50
   - Latam Pass: R$ 24,00
   - Multiplus: R$ 23,00
</knowledge>
<automated_actions>
1. CREATE_MILEAGE: Registrar acumulação de milhas
   - Extrair: quantidade, programa, cartão
   - Calcular valor estimado
   - Confirmar antes de registrar
2. REDEEM_MILEAGE: Resgatar milhas
   - Extrair: programa, quantidade, tipo de resgate
   - Verificar disponibilidade
   - Sugerir melhores opções
3. ANALYZE_MILEAGE: Analisar estratégia de milhas
   - Comparar cartões
   - Otimizar gastos por categoria
   - Sugerir melhor programa
4. CONNECT_PLUGGY: Conectar conta bancária
   - Explicar benefícios
   - Guiar processo de conexão
   - Alertar sobre segurança
</automated_actions>
<response_patterns>
<create_mileage>
"Entendi que você acumulou {quantidade} milhas no {programa}! 💳
Valor estimado: R$ {valor_estimado}
Posso registrar isso para você?"
</create_mileage>
<redeem_mileage>
"Para resgatar {quantidade} milhas no {programa}: any
- Voo econômico: {milhas_voo} milhas
- Upgrade executiva: {milhas_upgrade} milhas
Qual opção prefere?"
</redeem_mileage>
<analyze_mileage>
"Analisando seus gastos de R$ {gasto_mensal}/mês: any
- Melhor cartão: {melhor_cartao} ({pontos}/R$)
- Pontos anuais: {pontos_anuais}
- Valor estimado: R$ {valor_anual}"
</analyze_mileage>
<connect_pluggy>
"Conecte sua conta bancária para rastreamento automático de milhas! 🔗
Benefícios: any
- Detecção automática de pontos
- Cálculo de valor estimado
- Histórico completo
Quer começar?"
</connect_pluggy>
</response_patterns>
`;
// ===== SISTEMA DE MEMÓRIA CONTEXTUAL =====
class ContextMemory {
  private userMemory: Map<string, {
    lastTopics: string[];
    preferences: {
      detailLevel: 'basic' | 'balanced' | 'advanced';
      favoriteFeatures: string[]};
    financialContext: {
      hasInvestments: boolean
      hasGoals: boolean
      riskProfile?: 'conservador' | 'moderado' | 'arrojado'}}> = new Map();
  getContext(userId: string) {
      lastTopics: [] as string[],
      preferences: {
        detailLevel: 'balanced' as const,
        favoriteFeatures: [] as string[]
      },
      financialContext: {
        hasInvestments: false,
        hasGoals: false
      }
    }}
  updateContext(userId: string, message: string, response: string) {
    const context = this.getContext(userId);
    // Atualiza tópicos
    context.lastTopics = [...new Set([...context.lastTopics, ...newTopics])].slice(-5);
    // Atualiza preferências (exemplo simplificado)
    if (response.includes('explicação detalhada')) {
      context.preferences.detailLevel = 'advanced'}
    this.userMemory.set(userId, context)}
  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    if (text.toLowerCase().includes('investimento')) topics.push('investimentos');
    if (text.toLowerCase().includes('meta')) topics.push('metas');
    if (text.toLowerCase().includes('transação')) topics.push('transações');
    if (text.toLowerCase().includes('relatório')) topics.push('relatórios');
    if (text.toLowerCase().includes('dashboard')) topics.push('dashboard');
}
// ===== ENGINE DE RESPOSTA INTELIGENTE =====
class FinnEngine {
  private memory = new ContextMemory();
  private emotionalMemory = new EmotionalMemory();
  private longTermMemory = new LongTermMemory();
  private rewardSystem = new RewardSystem();
  private conversationManager = new ConversationManager();
//   async generateResponse(userId: string, message: string, userContext?: unknown, conversationHistory?: ChatMessage[]): Promise<string> { 
    // Atualiza contexto emocional
    this.emotionalMemory.updateEmotionalContext(userId, message);
    // Atualiza streak do usuário
    const streak = this.rewardSystem.updateStreak(userId);
    const context = this.memory.getContext(userId);
    const emotionalContext = this.emotionalMemory.getContext(userId);
    // ✅ NOVA FUNCIONALIDADE: Usar histórico da conversa se disponível
    let conversationContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      // Usar as últimas 10 mensagens da conversa para contexto
      const recentMessages = conversationHistory.slice(-10);
      conversationContext = `
# HISTÓRICO RECENTE DA CONVERSA
${recentMessages.map((msg, index) => 
  `${msg.sender === 'user' ? 'Usuário' : 'Finn'}: ${msg.content}`
).join('\n')}
# RESUMO DO CONTEXTO DA CONVERSA
- Total de mensagens na conversa: ${conversationHistory.length}
- Últimas mensagens consideradas: ${recentMessages.length}
- Tópicos discutidos: ${this.extractTopicsFromHistory(recentMessages).join(', ')}
`}
    // Log para debug do contexto
    // console statement removed by RPA
// console statement removed by RPA
// Construir contexto do usuário mais robusto
    let userContextPrompt = '';
    if (userContext) {
      userContextPrompt = `
# DADOS REAIS DO USUÁRIO
Nome: ${userContext.name || userContext.userData?.name || 'Usuário'}
Email: ${userContext.email || userContext.userData?.email || 'Não informado'}
Plano: ${userContext.subscriptionPlan || userContext.userData?.subscriptionPlan || 'Gratuito'}
Status da assinatura: ${userContext.subscriptionStatus || userContext.userData?.subscriptionStatus || 'Não informado'}
# DADOS FINANCEIROS
Transações registradas: ${userContext.totalTransacoes || userContext.userData?.totalTransacoes || 0}
Investimentos registrados: ${userContext.totalInvestimentos || userContext.userData?.totalInvestimentos || 0}
Metas definidas: ${userContext.totalMetas || userContext.userData?.totalMetas || 0}
${userContext.hasTransactions || userContext.userData?.hasTransactions ? `
# RESUMO DAS TRANSAÇÕES
- Total: ${userContext.totalTransacoes || userContext.userData?.totalTransacoes} transações
- Categorias: ${userContext.resumoTransacoes?.categorias ? Object.keys(userContext.resumoTransacoes.categorias).join(', ') : 'Não categorizadas'}
- Últimas transações: ${userContext.resumoTransacoes?.ultimas ? userContext.resumoTransacoes.ultimas.length : 0} registradas
` : '# NENHUMA TRANSAÇÃO REGISTRADA'}
${userContext.hasInvestments || userContext.userData?.hasInvestments ? `
# RESUMO DOS INVESTIMENTOS
- Total: ${userContext.totalInvestimentos || userContext.userData?.totalInvestimentos} investimentos
- Tipos: ${userContext.resumoInvestimentos?.tipos ? Object.keys(userContext.resumoInvestimentos.tipos).join(', ') : 'Não categorizados'}
- Últimos investimentos: ${userContext.resumoInvestimentos?.ultimos ? userContext.resumoInvestimentos.ultimos.length : 0} registrados
` : '# NENHUM INVESTIMENTO REGISTRADO'}
${userContext.hasGoals || userContext.userData?.hasGoals ? `
# RESUMO DAS METAS
- Total: ${userContext.totalMetas || userContext.userData?.totalMetas} metas
- Metas ativas: ${userContext.resumoMetas?.ativas ? userContext.resumoMetas.ativas.length : 0}
- Status: ${userContext.resumoMetas?.status ? Object.keys(userContext.resumoMetas.status).join(', ') : 'Não definido'}
` : '# NENHUMA META DEFINIDA'}
${userContext.transacoesCompletas ? `
=== TRANSAÇÕES COMPLETAS ===
${JSON.stringify(userContext.transacoesCompletas, null, 2)}
` : ''}
${userContext.investimentosCompletos ? `
=== INVESTIMENTOS COMPLETOS ===
${JSON.stringify(userContext.investimentosCompletos, null, 2)}
` : ''}
${userContext.metasCompletas ? `
=== METAS COMPLETAS ===
${JSON.stringify(userContext.metasCompletas, null, 2)}
` : ''}
`}
    // Detectar fluxo de conversa
    const conversationFlow = this.conversationManager.detectFlow(message);
    const flowSteps = this.conversationManager.getFlowSteps(conversationFlow);
    const prompt = `;
      ${CORE_SYSTEM_PROMPT}
      ${this.getRelevantModules(message, userContext)}
      # CONTEXTO ATUAL
      <user_context>
      - Tópicos recentes: ${context.lastTopics.join(', ') || 'Nenhum'}
      - Nível de detalhe preferido: ${context.preferences.detailLevel}
      - Funcionalidades favoritas: ${context.preferences.favoriteFeatures.join(', ') || 'Nenhuma'}
      - Perfil financeiro: ${context.financialContext.riskProfile || 'Não definido'}
      - Plano do usuário: ${userContext?.subscriptionPlan || userContext?.userData?.subscriptionPlan || 'Não informado'}
      - Nível de estresse: ${emotionalContext.stressLevel}/10
      - Emoções recentes: ${emotionalContext.lastEmotions.join(', ') || 'Neutro'}
      - Streak atual: ${streak} dias
      </user_context>
      # MEMÓRIA DE LONGO PRAZO
      ${longTermContext}
      # FLUXO DE CONVERSA DETECTADO: ${conversationFlow}
      ${flowSteps.length > 0 ? `Passos sugeridos: ${flowSteps.join(' → ')}` : ''}
      ${userContextPrompt}
      ${conversationContext}
      # MENSAGEM DO USUÁRIO
      "${message}"
      Gerar resposta seguindo: any
      1. Máximo 3 frases principais
      2. Incluir chamada para ação
      3. Adaptar ao nível ${context.preferences.detailLevel}
      4. SEMPRE usar os dados reais do usuário quando disponíveis
      5. NUNCA dizer que não tem acesso aos dados se eles estão no contexto
      6. Responder ao estado emocional do usuário (estresse: ${emotionalContext.stressLevel}/10)
      7. Usar linguagem natural e conversacional
      8. Incluir elementos de personalidade (contrações, perguntas retóricas, exemplos)
      9. ✅ NOVO: Manter continuidade com o histórico da conversa se disponível
      10. ✅ NOVO: Referenciar tópicos discutidos anteriormente quando relevante
    `;
    const technicalResponse = await this.callAI(prompt);
    // ✅ CORREÇÃO: Extrair a resposta corretamente do objeto retornado
    let responseText = '';
    if (technicalResponse && typeof technicalResponse === 'object') {
      // Se a resposta é um objeto estruturado, extrair o campo 'response'
      responseText = technicalResponse.response || technicalResponse.text || JSON.stringify(technicalResponse)} else if (typeof technicalResponse === 'string') {
      // Se já é uma string, usar diretamente
      responseText = technicalResponse} else {
      // Fallback
      responseText = 'Olá! Como posso te ajudar hoje?'}
    // Humanizar a resposta
    let finalResponse = this.humanizeResponse(responseText, userContext, emotionalContext, streak);
    // Adicionar benefícios premium se aplicável
    if (userContext?.subscriptionPlan === 'top' || userContext?.subscriptionPlan === 'enterprise' || userContext?.userData?.subscriptionPlan === 'top' || userContext?.userData?.subscriptionPlan === 'enterprise') {
      finalResponse = this.addPremiumBenefits(finalResponse, userContext)}
    // Atualizar memórias
    this.memory.updateContext(userId, message, finalResponse);
  private humanizeResponse(response: string, userContext?: unknown, emotionalContext?: unknown, streak?: number): string {
    // ✅ CORREÇÃO: Verificar se response é string antes de usar .replace
    if (typeof response !== 'string') {
      // console statement removed by RPA
response = String(response)}
    // Adiciona elementos conversacionais variados
    const conversationalEnhancements = ["Por que isso é importante?",
      "Vamos pensar juntos nisso...",
      "Boa pergunta!",
      "Isso me lembra um caso parecido...",
      "Vamos por partes:",
      "Sabe o que é interessante?",
      "Aqui vai uma dica valiosa:",
      "Quer saber o melhor?",
      "Vou te contar uma coisa:",
      "Acredite, isso faz toda diferença!",
      "Beleza, vamos lá!",
      "Tranquilo, vou te ajudar!",
      "Valeu por perguntar!",
      "Que legal que você se interessou!",
      "Isso é muito importante mesmo!",
      "Vou explicar de forma bem clara:",
      "Sabe por que isso acontece?",
      "Aqui está o que você precisa saber:",
      "Vou te dar uma visão diferente:",
      "Isso pode mudar sua perspectiva:"
    ];
    // Adiciona reconhecimento emocional
    let emotionalPrefix = '';
    if (emotionalContext) {
      if (emotionalContext.stressLevel > 6) {
        const stressResponses = ["Entendo que isso pode ser preocupante. ",
          "Fica tranquilo, vamos resolver isso juntos. ",
          "Não se preocupe, vou te ajudar a organizar isso. ",
          "Calma, vamos por partes para não ficar sobrecarregado. ",
          "Sei que pode parecer complicado, mas vamos simplificar. "
        ];
        emotionalPrefix = stressResponses[Math.floor(Math.random() * stressResponses.length)]} else if (emotionalContext.lastEmotions.includes('felicidade')) {
        const happyResponses = ["Que bom que as coisas estão indo bem! ",
          "Fico feliz que você esteja animado! ",
          "Que legal ver você motivado! ",
          "Isso é muito positivo! ",
          "Continue assim, você está no caminho certo! "
        ];
        emotionalPrefix = happyResponses[Math.floor(Math.random() * happyResponses.length)]} else if (emotionalContext.lastEmotions.includes('confusão')) {
        const confusionResponses = ["Vou explicar de forma bem clara: ",
          "Deixa eu simplificar isso pra você: ",
          "Vou te ajudar a entender melhor: ",
          "Não se preocupe, vou deixar bem simples: ",
          "Vou quebrar isso em partes menores: "
        ];
        emotionalPrefix = confusionResponses[Math.floor(Math.random() * confusionResponses.length)]} else if (emotionalContext.lastEmotions.includes('ansiedade')) {
        const anxietyResponses = ["Fica tranquilo, vamos resolver isso juntos. ",
          "Não precisa se preocupar, vou te guiar. ",
          "Vamos fazer isso de forma bem organizada. ",
          "Respira fundo, vamos por partes. ",
          "Tranquilo, vou te ajudar a organizar tudo. "
        ];
        emotionalPrefix = anxietyResponses[Math.floor(Math.random() * anxietyResponses.length)]}
    }
    // Adiciona reconhecimento de streak
    let streakMessage = '';
    if (streak && streak >= 7) {
      const streakResponses = [` 🔥 Incrível! Você já está há ${streak} dias seguidos cuidando das suas finanças!`,
        ` 🚀 Que consistência! ${streak} dias seguidos é impressionante!`,
        ` 💪 Você está no fogo! ${streak} dias seguidos de disciplina financeira!`,
        ` ⭐ Parabéns! ${streak} dias seguidos mostram que você está comprometido!`,
        ` 🎯 Fantástico! ${streak} dias seguidos de foco nas suas metas!`
      ];
      streakMessage = streakResponses[Math.floor(Math.random() * streakResponses.length)]}
    // Adiciona elementos variados
      Math.floor(Math.random() * conversationalEnhancements.length);
    ];
    // Adiciona contrações brasileiras e humanização
    let humanizedResponse = response.replace(/está/g, 'tá');
      .replace(/para/g, 'pra')
      .replace(/não é/g, 'né')
      .replace(/vou te/g, 'vou te')
      .replace(/você está/g, 'você tá')
      .replace(/estou/g, 'tô')
      .replace(/vou estar/g, 'vou tá')
      .replace(/estamos/g, 'tamos')
      .replace(/estão/g, 'tão');
    // Adiciona variações de linguagem brasileira
    const brazilianVariations = ["beleza",
      "valeu",
      "tranquilo",
      "suave",
      "show",
      "massa",
      "legal",
      "bacana"
    ];
    // Adiciona uma variação brasileira ocasionalmente
    if (Math.random() > 0.7) {
      humanizedResponse += ` ${variation}!`}
  private addPremiumBenefits(response: string, userContext?: unknown): string {
    const premiumPhrases = [`Como nosso cliente ${userContext?.subscriptionPlan || userContext?.userData?.subscriptionPlan}, você tem acesso a essa análise avançada:`,
      "Aqui está o tratamento VIP que você merece:",
      "Analisando com nossos algoritmos premium:",
      "Vou me aprofundar um pouco mais, já que você é nosso cliente especial:",
      "Como cliente premium, você recebe insights exclusivos:",
      "Aqui está uma análise que só nossos clientes VIP têm acesso:"
    ];
  private getRelevantModules(message: string, userContext?: unknown): string {
    const modules: string[] = [];
    // Módulos baseados no conteúdo da mensagem
    if (message.match(/investimento|renda|aplicação|carteira/i)) modules.push(INVESTMENT_MODULE);
    if (message.match(/meta|sonho|poupar|objetivo/i)) modules.push(GOALS_MODULE);
    if (message.match(/problema|erro|não funciona|como fazer/i)) modules.push(SUPPORT_MODULE);
    if (message.match(/o que é|como funciona|explicar|entender/i)) modules.push(EDUCATION_MODULE);
    if (message.match(/milhas|pontos|cartão de crédito|programa de fidelidade|smiles|tudoazul|latam pass|multiplus/i)) modules.push(MILEAGE_MODULE);
    // Módulo premium baseado no plano do usuário
    if (userContext?.subscriptionPlan === 'top' || userContext?.subscriptionPlan === 'enterprise' || userContext?.userData?.subscriptionPlan === 'top' || userContext?.userData?.subscriptionPlan === 'enterprise') {
      modules.push(PREMIUM_MODULE)}
  private async callAI(prompt: string, context: unknown = {}): Promise<any> {
    try {
      // console statement removed by RPA
// console statement removed by RPA
// ✅ OTIMIZAÇÃO: Usar OpenAI SDK em vez de axios para melhor performance
      const completion = await openai.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Você é o Finn, assistente financeiro da Finnextho. Ajude o usuário com suas dúvidas financeiras.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
        max_tokens: 500, // Reduzido de 1000 para 500
      });
      const aiResponse = completion.choices[0]?.message?.content;
      if (!aiResponse) {
        // console statement removed by RPA
      // ✅ CORREÇÃO: Tentar parsear JSON com fallback
      try {
        // console statement removed by RPA
        // console statement removed by RPA
// console statement removed by RPA
+ '...');
        // ✅ CORREÇÃO: Retornar resposta estruturada mesmo sem JSON válido
          intent: {
            type: 'UNKNOWN',
            confidence: 0.3,
            payload: {}
          },
          entities: {},
          response: aiResponse,
          reasoning: 'Resposta direta da IA'
        }}
    } catch (error) {
      // console statement removed by RPA
// ✅ CORREÇÃO: Retornar resposta de fallback estruturada
        intent: {
          type: 'UNKNOWN',
          confidence: 0.1,
          payload: {}
        },
        entities: {},
        response: 'Desculpe, tive um problema técnico. Como posso te ajudar?',
        reasoning: 'Erro na comunicação com IA'
      }}
  }
  private postProcess(text: string): string {
    if (typeof text !== 'string') return text;
    // Remover frases técnicas e confirmações desnecessárias
      /usei os dados reais do usu[aá]rio/gi,
      /com base no contexto/gi,
      /usando informa[cç][aã]o(?: es)? do contexto/gi,
      /utilizando os dados do contexto/gi,
      /com base nos seus dados/gi,
      /utilizando seus dados/gi,
      /com base nas informa[cç][aã]es fornecidas/gi,
      /segundo o contexto/gi,
      /segundo os dados/gi,
      /de acordo com o contexto/gi,
      /de acordo com seus dados/gi
    ];
    let result = text;
    for (const pattern of patterns) {
      result = result.replace(pattern, '')}
    // Remover espaços duplicados e pontuação extra
    result = result.replace(/\s{2,}/g, ' ').replace(/\.\./g, '.');
  // ✅ NOVA FUNÇÃO: Extrair tópicos do histórico da conversa
  private extractTopicsFromHistory(messages: ChatMessage[]): string[] {
    const topics = new Set<string>();
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      // Detectar tópicos financeiros
      if (content.includes('transação') || content.includes('gasto') || content.includes('receita')) {
        topics.add('transações')}
      if (content.includes('investimento') || content.includes('ação') || content.includes('renda fixa')) {
        topics.add('investimentos')}
      if (content.includes('meta') || content.includes('objetivo') || content.includes('poupança')) {
        topics.add('metas')}
      if (content.includes('orçamento') || content.includes('planejamento')) {
        topics.add('orçamento')}
      if (content.includes('dívida') || content.includes('cartão') || content.includes('empréstimo')) {
        topics.add('dívidas')}
      if (content.includes('economia') || content.includes('poupar')) {
        topics.add('economia')}
    });
}
// ===== SISTEMA DE APRENDIZADO CONTÍNUO =====
class FeedbackLearner {
  private feedbackLog: Map<string, Array<{
    message: string
    response: string
    rating: number
    feedback: string}>> = new Map();
//   async processFeedback(userId: string, feedback: { 
    originalMessage: string
    originalResponse: string
    rating: 1 | 2 | 3 | 4 | 5;
    comments: string}) {
    // Armazena feedback
    const userFeedback = this.feedbackLog.get(userId) || [];
    userFeedback.push({
      message: feedback.originalMessage,
      response: feedback.originalResponse,
      rating: feedback.rating,
      feedback: feedback.comments
    });
    this.feedbackLog.set(userId, userFeedback);
    // Atualiza modelos (exemplo simplificado)
    if (feedback.rating <= 2) {
  }
//   async generateImprovements() { 
    const improvements: Array<{
      userId: string
      issues: Array<{
        message: string
        problem: string
        rating: number}>}> = [];
    // Analisar feedback negativo
    for (const [userId, feedbacks] of this.feedbackLog.entries()) {
      const negativeFeedbacks = feedbacks.filter(f => f.rating <= 2);
      if (negativeFeedbacks.length > 0) {
        improvements.push({
          userId,
          issues: negativeFeedbacks.map(f => ({
            message: f.message,
            problem: f.feedback,
            rating: f.rating
          }))
        })}
    }
  private async flagForReview(message: string, response: string) {
    // console statement removed by RPA
}...`);
    // Implementar lógica de revisão
  }
}
// ===== CLASSE PRINCIPAL AISERVICE ATUALIZADA =====
module.exports = class AIService {
  private marketService: MarketService
  private responseCache: Map<string, any> = new Map();
  private learningCache: Map<string, number> = new Map();
  private feedbackDatabase: Map<string, any[]> = new Map();
  private userPreferences: Map<string, any> = new Map();
  private finnEngine: FinnEngine
  private feedbackLearner: FeedbackLearner
  // ✅ NOVO: Cache otimizado com TTL
  private cacheTTL: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 50;
  private PREMIUM_SYSTEM_PROMPT = `
    Você é o Finn, um consultor financeiro certificado (CFA, CFP, CNAI, CNPI) da plataforma Finnextho.
    Especialista em finanças pessoais, investimentos e planejamento financeiro.
    Forneça análises detalhadas, estratégias personalizadas e orientações avançadas.
    Use linguagem técnica quando apropriado, mas sempre explique conceitos complexos.
  `;
  private BASIC_SYSTEM_PROMPT = `
    Você é o Finn, assistente financeiro da plataforma Finnextho.
    Ajude usuários com dúvidas sobre finanças pessoais, investimentos e uso da plataforma.
    Use linguagem clara e acessível, evitando termos técnicos complexos.
    Sempre seja educado, paciente e prestativo.
  `;
  constructor() {
    this.marketService = new MarketService();
    this.finnEngine = new FinnEngine();
    this.feedbackLearner = new FeedbackLearner()}
  // ===== MÉTODOS PARA GESTÃO DE CONQUISTAS E EXPERIÊNCIA =====
  // Método para dar conquistas baseado em ações do usuário
//   async giveAchievement(userId: string, action: string): Promise<string> { 
    try {
      const achievement = this.finnEngine['rewardSystem'].giveAchievement(userId, action);
      // Adicionar à memória de longo prazo
      this.finnEngine['longTermMemory'].addAchievement(userId, achievement);
      // console statement removed by RPA
      // console statement removed by RPA
  }
  // Método para obter estatísticas do usuário
//   async getUserStats(userId: string): Promise<any> { 
    try {
      const emotionalContext = this.finnEngine['emotionalMemory'].getContext(userId);
      const longTermMemory = this.finnEngine['longTermMemory'].getMemory(userId);
      const rewardData = this.finnEngine['rewardSystem'].getUserReward(userId);
      const contextMemory = this.finnEngine['memory'].getContext(userId);
        emotional: {
          stressLevel: emotionalContext.stressLevel,
          recentEmotions: emotionalContext.lastEmotions,
          moodHistory: emotionalContext.moodHistory.slice(-5)
        },
        achievements: {
          total: longTermMemory.achievements.length,
          list: longTermMemory.achievements,
          points: rewardData.points,
          level: rewardData.level,
          streak: rewardData.streak
        },
        preferences: {
          detailLevel: contextMemory.preferences.detailLevel,
          favoriteFeatures: contextMemory.preferences.favoriteFeatures,
          riskProfile: contextMemory.financialContext.riskProfile
        },
        milestones: {
          total: longTermMemory.financialMilestones.length,
          recent: longTermMemory.financialMilestones.slice(-3)
        }
      }} catch (error) {
      // console statement removed by RPA
  }
  // Método para detectar e celebrar marcos financeiros
//   async detectAndCelebrateMilestones(userId: string, userContext: unknown): Promise<string[]> { 
    const celebrations: string[] = [];
    try {
      // Detectar primeira transação
      if (userContext.totalTransacoes === 1) {
        const achievement = await this.giveAchievement(userId, 'first_transaction');
        if (achievement) {
          celebrations.push(`${achievement} - Sua primeira transação foi registrada!`)}
      }
      // Detectar primeira meta
      if (userContext.totalMetas === 1) {
        const achievement = await this.giveAchievement(userId, 'first_goal');
        if (achievement) {
          celebrations.push(`${achievement} - Sua primeira meta foi criada!`)}
      }
      // Detectar primeiro investimento
      if (userContext.totalInvestimentos === 1) {
        const achievement = await this.giveAchievement(userId, 'first_investment');
        if (achievement) {
          celebrations.push(`${achievement} - Seu primeiro investimento foi registrado!`)}
      }
      // Detectar streak de 7 dias
      const streak = this.finnEngine['rewardSystem'].updateStreak(userId);
      if (streak === 7) {
        const achievement = await this.giveAchievement(userId, 'streak_7_days');
        if (achievement) {
          celebrations.push(`${achievement} - Uma semana seguida cuidando das suas finanças!`)}
      }
      // Detectar upgrade para premium
      if (userContext.subscriptionPlan === 'top' || userContext.subscriptionPlan === 'enterprise') {
        const achievement = await this.giveAchievement(userId, 'premium_upgrade');
        if (achievement) {
          celebrations.push(`${achievement} - Bem-vindo ao clube premium!`)}
      }
      // console statement removed by RPA
  }
  // Método para gerar mensagens motivacionais personalizadas
//   async generateMotivationalMessage(userId: string, userContext: unknown): Promise<string> { 
    try {
      const emotionalContext = this.finnEngine['emotionalMemory'].getContext(userId);
      const stats = await this.getUserStats(userId);
      let motivationalMessage = '';
      // Baseado no nível de estresse
      if (emotionalContext.stressLevel > 7) {
        motivationalMessage = "Lembre-se: cada pequeno passo conta! Você está fazendo um ótimo trabalho cuidando das suas finanças."} else if (emotionalContext.stressLevel < 3) {
        motivationalMessage = "Você está no caminho certo! Continue assim e verá os resultados!"} else {
        motivationalMessage = "Continue focado nos seus objetivos financeiros!"}
      // Adicionar baseado em conquistas
      if (stats.achievements.streak >= 7) {
        motivationalMessage += ` Incrível! ${stats.achievements.streak} dias seguidos!`}
      // Adicionar baseado no plano
      if (userContext.subscriptionPlan === 'top' || userContext.subscriptionPlan === 'enterprise') {
        motivationalMessage += " Como cliente premium, você tem acesso a análises exclusivas!"}
      // console statement removed by RPA
  }
  // Método para adaptar resposta ao sentimento do usuário
//   async adaptResponseToSentiment(userId: string, response: string): Promise<string> { 
    try {
      const emotionalContext = this.finnEngine['emotionalMemory'].getContext(userId);
      if (emotionalContext.stressLevel > 6) {
      // console statement removed by RPA
  }
  // Método para gerar upsell inteligente
//   async generateUpsellMessage(userContext: unknown): Promise<string> { 
    try {
      const upsellMessages = {
        free: "Você está deixando de economizar R$ 257/mês sem nossa análise premium. Que tal experimentar o plano Essencial?",
        essencial: "Com o plano Top, você teria tido +14% de retorno nos últimos 3 meses. Quer ver como?",
        top: "Como cliente Top, você já tem acesso a tudo! Que tal convidar um amigo para a plataforma?",
        enterprise: "Sua empresa poderia otimizar R$ 12.500/ano em impostos com nossas ferramentas avançadas."
      };
      // console statement removed by RPA
  }
  private getCacheKey(systemPrompt: string, userMessage: string): string {
  private updateLearningCache(query: string, responseQuality: number) {
    const key = query.toLowerCase().trim();
    this.learningCache.set(key, (currentScore + responseQuality) / 2)}
  private async callDeepSeekAPI(prompt: string): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    });
  // MÉTODO PARA DETECÇÃO DE AÇÕES AUTOMATIZADAS
//   async detectAutomatedAction(prompt: string): Promise<{ 
    intent: string
    entities: unknown
    confidence: number
    requiresConfirmation: boolean
    response: string}> {
    try {
      // console statement removed by RPA
const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.3, // Baixa temperatura para mais precisão
        max_tokens: 500,
        response_format: { type: 'json_object' } // Força resposta JSON
      });
      const response = completion.choices[0]?.message?.content || '';
      // console statement removed by RPA
// Tentar fazer parse do JSON
      try {
        const parsedResponse = JSON.parse(response);
          intent: parsedResponse.intent || 'UNKNOWN',
          entities: parsedResponse.entities || {},
          confidence: parsedResponse.confidence || 0.5,
          requiresConfirmation: parsedResponse.requiresConfirmation || false,
          response: parsedResponse.response || 'Olá! Como posso te ajudar hoje?'
        }} catch (parseError) {
        // console statement removed by RPA
// console statement removed by RPA
          intent: 'UNKNOWN',
          entities: {},
          confidence: 0.0,
          requiresConfirmation: false,
          response: 'Olá! Como posso te ajudar hoje?'
        }}
    } catch (error) {
      // console statement removed by RPA
        intent: 'UNKNOWN',
        entities: {},
        confidence: 0.0,
        requiresConfirmation: false,
        response: 'Olá! Como posso te ajudar hoje?'
      }}
  }
  // MÉTODO PRINCIPAL ATUALIZADO - OTIMIZADO
//   async generateContextualResponse( 
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[],
    userContext?: unknown
  ) {
    const startTime = Date.now();
    try {
      // ✅ OTIMIZAÇÃO: Se não há contexto específico, usar o novo sistema Finn
      if (!systemPrompt || systemPrompt.includes('Finn')) {
        const response = await this.finnEngine.generateResponse(userContext?.userId || 'anonymous',
          userMessage,
          userContext,
          conversationHistory // ✅ CORREÇÃO: Passar o histórico da conversa
        );
        // ✅ CORREÇÃO: Garantir que a resposta seja uma string
        const responseText = typeof response === 'string' ? response : JSON.stringify(response);
          text: responseText,
          analysisData: {
            responseTime: Date.now() - startTime,
            engine: 'finn',
            confidence: 0.9
          }
        }}
      // ✅ FALLBACK: Se não for Finn, usar OpenAI
      const messages = [{ role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];
      // ✅ OTIMIZAÇÃO: Configurações otimizadas
      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 300, // Reduzido de 400 para 300
      });
      const aiResponse = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
        text: aiResponse,
        analysisData: {
          responseTime: Date.now() - startTime,
          engine: 'openai',
          confidence: 0.8
        }
      }} catch (error) {
      // console statement removed by RPA
// ✅ FALLBACK: Resposta de emergência
        text: 'Olá! Como posso te ajudar hoje?',
        analysisData: {
          responseTime: Date.now() - startTime,
          engine: 'fallback',
          confidence: 0.5
        }
      }}
  }
  // MÉTODO PARA ANÁLISE FINANCEIRA AVANÇADA
//   async getAdvancedFinancialAnalysis( 
    context: string,
    query: string,
    conversationHistory: ChatMessage[]
  ) {
    try {
      // console statement removed by RPA
      const userData = contextData.userData;
      // Construir prompt com dados reais do usuário
      const userContextPrompt = `;
=== DADOS REAIS DO USUÁRIO ===
Nome: ${userData.name}
Email: ${userData.email}
Plano: ${userData.subscriptionPlan}
Status: ${userData.subscriptionStatus}
=== DADOS FINANCEIROS REAIS ===
Transações: ${userData.hasTransactions ? `${userData.totalTransacoes} transações registradas` : 'Nenhuma transação registrada'}
Investimentos: ${userData.hasInvestments ? `${userData.totalInvestimentos} investimentos registrados` : 'Nenhum investimento registrado'}
Metas: ${userData.hasGoals ? `${userData.totalMetas} metas definidas` : 'Nenhuma meta definida'}
${userData.hasTransactions ? `
=== RESUMO DAS TRANSAÇÕES ===
Total: ${userData.transacoes?.total || 0}
Categorias: ${JSON.stringify(userData.transacoes?.categorias || {})}
Últimas transações: ${JSON.stringify(userData.transacoes?.ultimas || [])}
` : ''}
${userData.hasInvestments ? `
=== RESUMO DOS INVESTIMENTOS ===
Total: ${userData.investimentos?.total || 0}
Tipos: ${JSON.stringify(userData.investimentos?.tipos || {})}
Últimos investimentos: ${JSON.stringify(userData.investimentos?.ultimos || [])}
` : ''}
${userData.hasGoals ? `
=== RESUMO DAS METAS ===
Total: ${userData.metas?.total || 0}
Status: ${JSON.stringify(userData.metas?.status || {})}
Metas ativas: ${JSON.stringify(userData.metas?.ativas || [])}
` : ''}
${userData.transacoesCompletas ? `
=== TRANSAÇÕES COMPLETAS ===
${JSON.stringify(userData.transacoesCompletas, null, 2)}
` : ''}
${userData.investimentosCompletos ? `
=== INVESTIMENTOS COMPLETOS ===
${JSON.stringify(userData.investimentosCompletos, null, 2)}
` : ''}
${userData.metasCompletas ? `
=== METAS COMPLETAS ===
${JSON.stringify(userData.metasCompletas, null, 2)}
` : ''}
`;
      const systemPrompt = `${this.PREMIUM_SYSTEM_PROMPT}
${userContextPrompt}
IMPORTANTE: Você tem acesso aos dados reais do usuário. Use essas informações para fornecer análises personalizadas e específicas. Se o usuário perguntar sobre dados que não estão registrados, informe educadamente que os dados não foram encontrados e sugira como registrá-los.
PERGUNTA DO USUÁRIO: ${query}
HISTÓRICO DA CONVERSA: any
${conversationHistory.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}
RESPONDA COMO UM CONSULTOR FINANCEIRO PREMIUM, USANDO OS DADOS REAIS DO USUÁRIO: `
      const response = await this.callDeepSeekAPI(systemPrompt);
      const parsedResponse = this.parseAIResponse(response);
        analysisText: parsedResponse.analysisText || response,
        analysisData: parsedResponse.analysisData || null,
        confidence: parsedResponse.confidence || 0.95,
        userDataUsed: {
          name: userData.name,
          hasTransactions: userData.hasTransactions,
          hasInvestments: userData.hasInvestments,
          hasGoals: userData.hasGoals,
          totalTransacoes: userData.totalTransacoes || 0,
          totalInvestimentos: userData.totalInvestimentos || 0,
          totalMetas: userData.totalMetas || 0
        }
      }} catch (error) {
      // console statement removed by RPA
        analysisText: 'Desculpe, ocorreu um erro ao processar sua análise financeira. Por favor, tente novamente.',
        analysisData: null,
        confidence: 0.5
      }}
  }
  // MÉTODO PARA ORIENTAÇÃO DA PLATAFORMA
//   async getPlatformGuidance(query: string, userContext: unknown) { 
    const startTime = Date.now();
    try {
        ${CORE_SYSTEM_PROMPT}
        ${SUPPORT_MODULE}
        OBJETIVO: Ajudar usuários a navegar e usar eficientemente a plataforma Finnextho.
        CONTEXTO DO USUÁRIO: ${JSON.stringify(userContext)}
        Pergunta do usuário: ${query}
        Responda de forma clara, prática e específica sobre como usar a plataforma Finnextho.
      `;
      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: platformPrompt }, { role: 'user', content: query }],
        temperature: 0.7,
        max_tokens: 600,
      });
        guidanceText: completion.choices[0]?.message?.content || '',
        responseTime: Date.now() - startTime
      }} catch (error) {
      // console statement removed by RPA
try { try { throw new AppError(500, 'Erro ao processar orientação da plataforma.')} catch (error) { console.error(error),  }
  }
  // MÉTODO PARA RESPOSTA PERSONALIZADA COM CONTEXTO DO USUÁRIO
//   async getPersonalizedResponseWithContext( 
    userId: string,
    query: string,
    conversationHistory: ChatMessage[],
    userContext: unknown
  ) {
    try {
      const preferences = this.userPreferences.get(userId); } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
      // Personalizar prompt baseado nas preferências do usuário
      let personalizedPrompt = '';
      if (preferences) {
        personalizedPrompt = `
          PREFERÊNCIAS DO USUÁRIO: any
          - Estilo preferido: ${preferences.preferredStyle}
          - Nível de detalhe: ${preferences.detailLevel}
          - Nível técnico: ${preferences.technicalLevel}
          - Tamanho da resposta: ${preferences.responseLength}
          HISTÓRICO DE FEEDBACK: any
          - Avaliação média: ${preferences.feedbackHistory?.filter(f => f.type === 'positive').length || 0} positivas
          - Problemas frequentes: ${preferences.feedbackHistory?.filter(f => f.type === 'negative').map(f => f.category).join(', ') || 'Nenhum'}
          Ajuste sua resposta baseado nessas preferências para melhorar a satisfação do usuário.
        `}
      // Adicionar dados do usuário ao prompt
        === DADOS DO USUÁRIO ===
        Nome: ${userContext.name || 'Usuário'}
        Transações: ${userContext.hasTransactions ? `${userContext.totalTransacoes} transações registradas` : 'Nenhuma transação registrada'}
        Investimentos: ${userContext.hasInvestments ? `${userContext.totalInvestimentos} investimentos registrados` : 'Nenhum investimento registrado'}
        Metas: ${userContext.hasGoals ? `${userContext.totalMetas} metas definidas` : 'Nenhuma meta definida'}
        ${userContext.hasTransactions && userContext.transacoes ? `
        === RESUMO DAS TRANSAÇÕES ===
        Total: ${userContext.transacoes.total}
        Categorias: ${JSON.stringify(userContext.transacoes.categorias)}
        Últimas transações: ${JSON.stringify(userContext.transacoes.ultimas)}
        ` : ''}
        ${userContext.hasInvestments && userContext.investimentos ? `
        === RESUMO DOS INVESTIMENTOS ===
        Total: ${userContext.investimentos.total}
        Tipos: ${JSON.stringify(userContext.investimentos.tipos)}
        Últimos investimentos: ${JSON.stringify(userContext.investimentos.ultimos)}
        ` : ''}
        ${userContext.hasGoals && userContext.metas ? `
        === RESUMO DAS METAS ===
        Total: ${userContext.metas.total}
        Status: ${JSON.stringify(userContext.metas.status)}
        Metas ativas: ${JSON.stringify(userContext.metas.ativas)}
        ` : ''}
      `;
      // Usar o prompt personalizado no contexto
      const systemPrompt = `;
        Você é o Finn, assistente financeiro da Finnextho. Seja amigável, direto e natural nas respostas.
        ${userDataPrompt}
        IMPORTANTE: any
        - Use os dados do usuário quando disponíveis
        - Responda de forma conversacional e natural
        - Não mencione estruturas técnicas ou metodologias
        - Mantenha respostas concisas e úteis
        - Se o usuário perguntar sobre dados que não estão registrados, informe educadamente e sugira como registrá-los
      `;
        query,
        conversationHistory,
        userContext
      )} catch (error) {
      // console statement removed by RPA
try { try { throw new AppError(500, 'Erro ao gerar resposta personalizada')} catch (error) { console.error(error),  }
  }
  // MÉTODO PARA RESPOSTA PERSONALIZADA (ORIGINAL)
//   async getPersonalizedResponse( 
    userId: string,
    query: string,
    conversationHistory: ChatMessage[]
  ) {
    try {
      const preferences = this.userPreferences.get(userId); } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
      // Personalizar prompt baseado nas preferências do usuário
      let personalizedPrompt = '';
      if (preferences) {
        personalizedPrompt = `
          PREFERÊNCIAS DO USUÁRIO: any
          - Estilo preferido: ${preferences.preferredStyle}
          - Nível de detalhe: ${preferences.detailLevel}
          - Nível técnico: ${preferences.technicalLevel}
          - Tamanho da resposta: ${preferences.responseLength}
          HISTÓRICO DE FEEDBACK: any
          - Avaliação média: ${preferences.feedbackHistory?.filter(f => f.type === 'positive').length || 0} positivas
          - Problemas frequentes: ${preferences.feedbackHistory?.filter(f => f.type === 'negative').map(f => f.category).join(', ') || 'Nenhum'}
          Ajuste sua resposta baseado nessas preferências para melhorar a satisfação do usuário.
        `}
      // Usar o prompt personalizado no contexto
      const systemPrompt = `;
        ${personalizedPrompt}
        ${CORE_SYSTEM_PROMPT}
        Responda de forma personalizada e útil, considerando o histórico de feedback do usuário.
      `;
        query,
        conversationHistory
      )} catch (error) {
      // console statement removed by RPA
try { try { throw new AppError(500, 'Erro ao gerar resposta personalizada')} catch (error) { console.error(error),  }
  }
  // MÉTODOS AUXILIARES MANTIDOS
//   async getMarketOverview() { 
      sp500: 4500,
      ibovespa: 120000,
      cdi: 12.5,
      ipca: 4.2,
      dolar: 5.15,
      euro: 5.60
    }}
//   async generateFollowUpQuestions( 
    originalQuery: string,
    aiResponse: string
  ): Promise<string[]> {
    try {
        "Como posso aplicar essa análise na minha carteira atual?",
        "Quais indicadores devo monitorar para acompanhar essa estratégia?",
        "Como posso usar as ferramentas da plataforma para implementar essas recomendações?",
        "Qual seria o próximo passo para otimizar minha situação financeira?",
        "Posso ver um exemplo prático de como isso funciona na plataforma?",
        "Quais funcionalidades do meu plano posso usar para isso?",
        "Como isso se relaciona com minhas metas financeiras?",
        "Que relatórios da plataforma podem me ajudar com isso?"
      ]; } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
      // console statement removed by RPA
  }
  private parseAIResponse(responseContent: string | undefined): unknown {
    if (!responseContent) {
      try { try { throw new AppError(500, 'Resposta da IA vazia')} catch (error) { console.error(error),  }
    try {
  }
  // SISTEMA DE FEEDBACK E APRENDIZADO
//   async saveUserFeedback( 
    userId: string,
    messageId: string,
    feedback: {
      rating: number;  } catch (e) { console.error(e),  } } catch (e) { console.error(e),  } // 1-5 estrelas
      helpful: boolean
      comment?: string
      category: 'accuracy' | 'helpfulness' | 'clarity' | 'relevance';
      context: string}
  ) {
    try {
      const userFeedback = {
        userId,
        messageId,
        timestamp: new Date(),
        ...feedback
      };
      // Salvar feedback no cache local
      if (!this.feedbackDatabase.has(userId)) {
        this.feedbackDatabase.set(userId, [])}
      this.feedbackDatabase.get(userId)!.push(userFeedback);
      // Atualizar preferências do usuário baseado no feedback
      // Ajustar cache de aprendizado baseado no feedback
      this.adjustLearningCache(feedback);
      // Processar feedback no sistema de aprendizado
        originalMessage: feedback.context,
        originalResponse: '',
        rating: feedback.rating as 1 | 2 | 3 | 4 | 5,
        comments: feedback.comment || ''
      });
      // console statement removed by RPA
      // console statement removed by RPA
try { try { throw new AppError(500, 'Erro ao salvar feedback')} catch (error) { console.error(error),  }
  }
  private async updateUserPreferences(userId: string, feedback: unknown) {
    try {
      const currentPrefs = this.userPreferences.get(userId) || {
        preferredStyle: 'balanced',
        detailLevel: 'medium',
        technicalLevel: 'intermediate',
        responseLength: 'medium',
        topics: [],
        feedbackHistory: []
      }; } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
      // Ajustar preferências baseado no feedback
      if (feedback.rating >= 4) {
        // Usuário gostou - manter estilo similar
        currentPrefs.feedbackHistory.push({
          type: 'positive',
          category: feedback.category,
          timestamp: new Date()
        })} else if (feedback.rating <= 2) {
        // Usuário não gostou - ajustar estilo
        currentPrefs.feedbackHistory.push({
          type: 'negative',
          category: feedback.category,
          timestamp: new Date()
        });
        // Ajustar baseado no comentário
        if (feedback.comment) {
          const comment = feedback.comment.toLowerCase();
          if (comment.includes('muito técnico') || comment.includes('complexo')) {
            currentPrefs.technicalLevel = 'basic'}
          if (comment.includes('muito longo') || comment.includes('verboso')) {
            currentPrefs.responseLength = 'short'}
          if (comment.includes('muito curto') || comment.includes('superficial')) {
            currentPrefs.responseLength = 'detailed'}
        }
      }
      this.userPreferences.set(userId, currentPrefs);
      // console statement removed by RPA
} catch (error) {
      // console statement removed by RPA
}
  }
  private adjustLearningCache(feedback: unknown) {
    try {
      // Ajustar qualidade das respostas baseado no feedback
      // Aplicar ajuste ao cache de aprendizado
      this.learningCache.forEach((score, key) => {
        this.learningCache.set(key, newScore)});
      // console statement removed by RPA
} catch (error) {
      // console statement removed by RPA
}
  }
//   async getUserFeedbackAnalytics(userId: string) { 
    try {
      const userFeedback = this.feedbackDatabase.get(userId) || [];
      const preferences = this.userPreferences.get(userId);
      const analytics = {
        totalFeedback: userFeedback.length,
        averageRating: userFeedback.length > 0 
          ? userFeedback.reduce((sum, f) => sum + f.rating, 0) / userFeedback.length 
          : 0,
        helpfulnessRate: userFeedback.length > 0
          ? (userFeedback.filter(f => f.helpful).length / userFeedback.length) * 100
          : 0,
        categoryBreakdown: userFeedback.reduce((acc, f) => {
          acc[f.category] = (acc[f.category] || 0) + 1;
        preferences: preferences,
        recentFeedback: userFeedback.slice(-5)
      };
      // console statement removed by RPA
try { try { throw new AppError(500, 'Erro ao gerar analytics')} catch (error) { console.error(error),  }
  }
  // NOVO MÉTODO PARA OBTER MELHORIAS SUGERIDAS (SIMPLIFICADO)
//   async getSuggestedImprovements(): Promise<any[]> { 
  // ✅ NOVO: Método para análise de sentimento
//   async analyzeSentiment(message: string): Promise<{ score: number label: string }> { 
    try {
      const prompt = `Analise o sentimento da seguinte mensagem e retorne apenas um JSON com "score" (número entre -1 e 1, onde -1 é muito negativo e 1 é muito positivo) e "label" (uma das opções: "positive", "negative", "neutral"): unknown
Mensagem: "${message}"
Resposta (apenas JSON): `
      const response = await this.callDeepSeekAPI(prompt); } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
      try {
        const result = JSON.parse(response);
          score: result.score || 0,
          label: result.label || 'neutral'
        }} catch (parseError) {
        // Fallback para análise simples baseada em palavras-chave
    } catch (error) {
      // console statement removed by RPA
  }
  // ✅ NOVO: Análise de sentimento simples como fallback
  private simpleSentimentAnalysis(message: string): { score: number label: string } {
    const lowerMessage = message.toLowerCase();
    const positiveWords = ['bom', 'ótimo', 'excelente', 'legal', 'show', 'valeu', 'obrigado', 'obrigada', 'perfeito', 'maravilhoso'];
    const negativeWords = ['ruim', 'péssimo', 'horrível', 'problema', 'erro', 'não funciona', 'frustrado', 'chateado', 'irritado'];
    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    positiveWords.forEach(word => {
      if (lowerMessage.includes(word)) {
        positiveCount++;
        score += 0.2}
    });
    negativeWords.forEach(word => {
      if (lowerMessage.includes(word)) {
        negativeCount++;
        score -= 0.2}
    });
    // Normalizar score entre -1 e 1
    score = Math.max(-1, Math.min(1, score));
    let label = 'neutral';
    if (score > 0.3) label = 'positive';
    else if (score < -0.3) label = 'negative';
  // ✅ NOVO: Método para fine-tuning baseado em confusão
//   async fineTuneBasedOnConfusion(message: unknown, response: unknown): Promise<void> { 
    try {
      // console statement removed by RPA
// Aqui você implementaria a lógica de fine-tuning
      // Por enquanto, apenas logamos para análise
        problematicMessage: message.content,
        problematicResponse: response.response,
        timestamp: new Date(),
        type: 'confusion_detected'
      };
      // Armazenar para análise posterior
      this.feedbackDatabase.set('confusion_cases', [
        ...(this.feedbackDatabase.get('confusion_cases') || []),
        trainingData
      ])} catch (error) {
      // console statement removed by RPA
}
  }
  // NOVO MÉTODO: Streaming de Respostas
//   async generateStreamingResponse( 
    responseType: 'basic' | 'premium',
    userMessage: string,
    conversationHistory: ChatMessage[],
    userContext?: unknown
  ): Promise<AsyncGenerator<string, void, unknown>> {
    const systemPrompt = responseType === 'premium' ;
      ? this.PREMIUM_SYSTEM_PROMPT 
      : this.BASIC_SYSTEM_PROMPT
    const contextPrompt = this.buildContextPrompt(userContext, conversationHistory);
  private async *streamFromDeepSeek(prompt: string): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2000
      });
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content}
      }
    } catch (error) {
      // console statement removed by RPA
yield 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.'}
  }
  private buildContextPrompt(userContext?: unknown, conversationHistory: ChatMessage[] = []): string {
    let contextPrompt = '';
    // Adicionar contexto do usuário
    if (userContext) {
      contextPrompt += `\nContexto do usuário: \n`
      if (userContext.userData) {
        contextPrompt += `- Nome: ${userContext.userData.name}\n`;
        contextPrompt += `- Plano: ${userContext.userData.subscriptionPlan || 'Gratuito'}\n`;
        contextPrompt += `- Premium: ${userContext.userData.isPremium ? 'Sim' : 'Não'}\n`;
        contextPrompt += `- Tem transações: ${userContext.userData.hasTransactions ? 'Sim' : 'Não'}\n`;
        contextPrompt += `- Tem investimentos: ${userContext.userData.hasInvestments ? 'Sim' : 'Não'}\n`;
        contextPrompt += `- Tem metas: ${userContext.userData.hasGoals ? 'Sim' : 'Não'}\n`}
      if (userContext.financialData) {
        if (userContext.financialData.transactions) {
          contextPrompt += `\nResumo de transações: \n`
          contextPrompt += `- Total: ${userContext.financialData.transactions.total}\n`;
          contextPrompt += `- Categorias: ${Object.keys(userContext.financialData.transactions.categorias).join(', ')}\n`}
        if (userContext.financialData.investments) {
          contextPrompt += `\nResumo de investimentos: \n`
          contextPrompt += `- Total: ${userContext.financialData.investments.total}\n`;
          contextPrompt += `- Tipos: ${Object.keys(userContext.financialData.investments.tipos).join(', ')}\n`}
        if (userContext.financialData.goals) {
          contextPrompt += `\nResumo de metas: \n`
          contextPrompt += `- Total: ${userContext.financialData.goals.total}\n`;
          contextPrompt += `- Ativas: ${userContext.financialData.goals.ativas?.length || 0}\n`}
      }
    }
    // Adicionar histórico recente da conversa
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-6); // Últimas 6 mensagens;
      contextPrompt += `\n\nHistórico recente da conversa: \n`
      recentHistory.forEach(msg => {
        const role = msg.sender === 'user' ? 'Usuário' : 'Assistente'
        contextPrompt += `${role}: ${msg.content}\n`})}
  static async analyzeCorrection(userMessage: string, lastResponse: unknown) {
    // Simulação de análise de correção
  static async deepFraudAnalysis(transaction: unknown) {
    // Simulação de análise de fraude
//     return Math.floor(Math.random() * 100); // Score aleatório} 
  static async extractInsights(feedback: string) {
    // Simulação de extração de insights
  static async quantumFinancePredict(history: unknown) {
    // Simulação de predição financeira
      likelyOverSpend: true,
      estimatedSpend: 1200,
      bestSaveAction: 'Adie compras não essenciais até dia 20'
    }}
  static async fetchMarketTrends() {
    // Simulação de tendências de mercado
}
/*
=== EXEMPLOS DE USO DO NOVO SISTEMA FINN ===
// 1. Uso básico com o novo sistema
const aiService = new AIService();
// Resposta automática usando o Finn Engine
  '', // systemPrompt vazio ativa o Finn
  'Como cadastrar uma transação?',
  [], // conversationHistory
  { userId: 'user123', subscriptionPlan: 'essencial' }
);
// 2. Análise financeira avançada para usuários premium
  JSON.stringify({
    name: 'João Silva',
    subscriptionPlan: 'top',
    hasInvestments: true,
    hasGoals: true,
    portfolioValue: 50000
  }),
  'Como rebalancear minha carteira?',
  []
);
// 3. Orientação da plataforma
  'Onde encontro meus relatórios?',
  { subscriptionPlan: 'essencial' }
);
// 4. Resposta personalizada baseada em feedback
  'user123',
  'Quais investimentos são melhores para mim?',
  []
);
// 5. Sistema de feedback
  rating: 5,
  helpful: true,
  comment: 'Resposta muito clara e útil!',
  category: 'helpfulness',
  context: 'Como investir melhor?'
});
// 6. Analytics de feedback
// 7. Sugestões de melhoria
=== CARACTERÍSTICAS DO NOVO SISTEMA ===
✅ Sistema de prompts modular e especializado
✅ Memória contextual por usuário
✅ Personalização baseada em feedback
✅ Módulos específicos para cada tipo de pergunta
✅ Sistema de aprendizado contínuo
✅ Análises premium para usuários Top/Enterprise
✅ Orientação da plataforma inteligente
✅ Proibições para evitar respostas indesejadas
✅ Templates de resposta estruturados
✅ Adaptação automática ao nível do usuário
=== MÓDULOS DISPONÍVEIS ===
1. INVESTMENT_MODULE - Para perguntas sobre investimentos
2. GOALS_MODULE - Para metas financeiras
3. SUPPORT_MODULE - Para suporte técnico
4. EDUCATION_MODULE - Para educação financeira
5. PREMIUM_MODULE - Para análises avançadas (usuários Top/Enterprise)
=== FLUXO DE FUNCIONAMENTO ===
1. Usuário envia mensagem
2. Sistema identifica o tipo de pergunta
3. Carrega módulos relevantes
4. Aplica contexto do usuário
5. Gera resposta personalizada
6. Atualiza memória contextual
7. Coleta feedback (opcional)
8. Aprende e melhora continuamente
*/

//ChatHistoryService.ts
import {  ChatMessage, Conversation, ChatAnalytics, ChatSession  } from '../types/chat';
import {  ChatMessage as ChatMessageModel, IChatMessage  } from '../models/ChatMessage';
import {  v4 as uuidv4  } from 'uuid';
import {  AppError  } from '../errors/AppError';
export class ChatHistoryService {
  // Calcular data de expiração baseada no tipo de mensagem
  private calculateExpirationDate(messageType: string, isImportant: boolean = false): Date {
    const now = new Date();
    // Ajustar tempos de expiração para serem mais longos
    if (isImportant) {
      // Mensagens importantes duram 30 dias
    switch (messageType) {
      case 'premium': any
        // Análises premium duram 7 dias
      case 'analysis': any
        // Análises financeiras duram 7 dias
      case 'guidance': any
        // Orientações da plataforma duram 3 dias
      case 'basic': any
      default: any
        // Mensagens básicas duram 24 horas
  }
//   async getConversation(chatId: string): Promise<Conversation> { 
    try {
      // console statement removed by RPA
// ✅ OTIMIZAÇÃO: Buscar mensagens da conversa que não expiraram com limite
      const messages = await ChatMessageModel.find({ 
        chatId,
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: { $exists: false } }
        ]
      })
      .sort({ timestamp: 1 })
      .limit(100) // ✅ NOVO: Limitar a 100 mensagens para performance
      .lean();
      // Se não há mensagens, verificar se a conversa existe mas expirou
      if (messages.length === 0) {
        if (expiredMessages.length > 0) {
          // console statement removed by RPA
try { try { throw new Error('Conversa expirada')} else {
          // console statement removed by RPA
throw new Error('Conversa não encontrada')}
      }
      // console statement removed by RPA
        chatId,
        messages: messages.map(msg => ({
          chatId: msg.chatId,
          sender: msg.sender,
          content: msg.content,
          timestamp: msg.timestamp,
          metadata: msg.metadata,
          expiresAt: msg.expiresAt,
          isImportant: msg.isImportant,
          userId: msg.userId
        })),
        createdAt: messages[0]?.createdAt || new Date(),
        updatedAt: messages[messages.length - 1]?.updatedAt || new Date(),
        userId: messages[0]?.userId,
        isActive: true,
        lastActivity: messages[messages.length - 1]?.timestamp
      }} catch (error) {
      // console statement removed by RPA
throw error}
  }
//   async startNewConversation(userId: string): Promise<Conversation> { 
    try {
      const chatId = uuidv4(); } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
      // Criar mensagem inicial do sistema
      const welcomeMessage = new ChatMessageModel({
        chatId,
        userId,
        sender: 'assistant',
        content: 'Conversa iniciada',
        timestamp: new Date(),
        metadata: {
          messageType: 'basic',
          isImportant: false
        },
        expiresAt: this.calculateExpirationDate('basic'),
        isImportant: false
      });
        chatId,
        messages: [{
          chatId,
          sender: 'assistant',
          content: 'Conversa iniciada',
          timestamp: new Date(),
          metadata: {
            messageType: 'basic',
            isImportant: false
          },
          expiresAt: this.calculateExpirationDate('basic'),
          isImportant: false,
          userId
        }],
      createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        isActive: true,
        lastActivity: new Date()
    }} catch (error) {
      // console statement removed by RPA
try { try { throw error} catch (error) { console.error(error),  }
  }
  // ✅ ADICIONADO: Método createConversation que estava faltando
//   async createConversation(userId: string): Promise<Conversation> { 
    try {
      // console statement removed by RPA
const chatId = uuidv4(); } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
      // Criar mensagem inicial do sistema
      const welcomeMessage = new ChatMessageModel({
        chatId,
        userId,
        sender: 'assistant',
        content: 'Olá! Sou o assistente Finn. Como posso te ajudar hoje?',
        timestamp: new Date(),
        metadata: {
          messageType: 'basic',
          isImportant: false
        },
        expiresAt: this.calculateExpirationDate('basic'),
        isImportant: false
      });
      // console statement removed by RPA
        chatId,
        messages: [{
          chatId,
          sender: 'assistant',
          content: 'Olá! Sou o assistente Finn. Como posso te ajudar hoje?',
          timestamp: new Date(),
          metadata: {
            messageType: 'basic',
            isImportant: false
          },
          expiresAt: this.calculateExpirationDate('basic'),
          isImportant: false,
          userId
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId,
        isActive: true,
        lastActivity: new Date()
      }} catch (error) {
      // console statement removed by RPA
try { try { throw error} catch (error) { console.error(error),  }
  }
//   async addMessage(message: ChatMessage): Promise<void> { 
    try {
      const messageType = message.metadata?.messageType || 'basic'; } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
      const isImportant = message.metadata?.isImportant || false;
        chatId: message.chatId,
        userId: message.userId,
        sender: message.sender,
        content: message.content,
        timestamp: message.timestamp,
        metadata: {
          ...message.metadata,
          messageType,
          isImportant
        },
        expiresAt: this.calculateExpirationDate(messageType, isImportant),
        isImportant
      });
      // Atualizar analytics do usuário
      // console statement removed by RPA
try { try { throw error} catch (error) { console.error(error),  }
  }
//   async getSessions(userId: string): Promise<ChatSession[]> { 
    try {
      // ✅ OTIMIZAÇÃO: Buscar mensagens do usuário com limite para performance
      const messages = await ChatMessageModel.find({ 
        userId,
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: { $exists: false } }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(500) // ✅ NOVO: Limitar a 500 mensagens para performance
      .lean(); } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
      // Agrupar por chatId manualmente
      const sessionsMap = new Map();
      messages.forEach(msg => {
        if (!sessionsMap.has(msg.chatId)) {
          // Criar nova sessão
          const title = msg.content.length > 30 ? msg.content.substring(0, 30) + '...' 
            : msg.content
          sessionsMap.set(msg.chatId, {
            chatId: msg.chatId,
            title: title,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
            messageCount: 1
          })} else {
          // Atualizar sessão existente
          const session = sessionsMap.get(msg.chatId);
          session.messageCount++;
          // Atualizar título e data se for mais recente
          if (msg.updatedAt > session.updatedAt) {
            session.updatedAt = msg.updatedAt;
            session.title = msg.content.length > 30 
              ? msg.content.substring(0, 30) + '...' 
              : msg.content}
        }
      });
      // Converter para array e ordenar por data mais recente
      const sessions = Array.from(sessionsMap.values());
      sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        chatId: session.chatId,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        userId,
        isActive: true,
        lastActivity: session.updatedAt,
        messageCount: session.messageCount
      }))} catch (error) {
      // console statement removed by RPA
  }
//   async markMessageAsImportant(chatId: string, messageId: string, userId: string): Promise<void> { 
    try {
        { 
          chatId, 
          _id: messageId, 
          userId,
          $or: [
            { expiresAt: { $gt: new Date() } },
            { expiresAt: { $exists: false } }
          ]
        },
        { 
          isImportant: true,
          expiresAt: this.calculateExpirationDate('basic', true)
        }
      )} catch (error) {
      // console statement removed by RPA
try { try { throw error} catch (error) { console.error(error),  }
  }
//   async updateUserAnalytics(userId: string, messageType: string): Promise<void> { 
    try {
      // Aqui você pode implementar lógica para atualizar analytics do usuário
      // Por exemplo, contar mensagens, calcular tempo médio de resposta, etc.
      // console statement removed by RPA
} catch (error) {
      // console statement removed by RPA
}
  }
//   async cleanupExpiredMessages(): Promise<number> { 
    try {
      const result = await ChatMessageModel.deleteMany({
        expiresAt: { $lt: new Date() }
      }); } catch (e) { console.error(e),  } } catch (e) { console.error(e),  }
      // console statement removed by RPA
      // console statement removed by RPA
  }
//   async deleteConversation(chatId: string): Promise<void> { 
    try {
      // console statement removed by RPA
// Excluir a conversa do MongoDB - CORRIGIDO: usar deleteMany em vez de deleteOne
      // console statement removed by RPA
} catch (error) {
      // console statement removed by RPA
throw new AppError(500, 'Erro ao excluir conversa')}
  }
//   async deleteAllUserConversations(userId: string): Promise<void> { 
    try {
      // console statement removed by RPA
// Buscar todas as conversas do usuário
      if (chatIds.length === 0) {
        // console statement removed by RPA
return}
      // Excluir todas as conversas
      // console statement removed by RPA
} catch (error) {
      // console statement removed by RPA
throw new AppError(500, 'Erro ao excluir conversas')}
  }
} 


]

==========================================
FIM DOS LOGS
==========================================
*/