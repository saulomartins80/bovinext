// Arquivo de tipos específicos para BOVINEXT conforme documento de especificação
// BOVINEXT_PROJETO_COMPLETO.md - Interfaces oficiais

// ===== ESTRUTURA DE DADOS BÁSICA =====

// 1. REBANHO (substitui Transações)
export interface Animal {
  id: string;
  brinco: string;           // Identificação única
  categoria: 'BEZERRO' | 'NOVILHO' | 'BOI' | 'BEZERRA' | 'NOVILHA' | 'VACA';
  peso: number;
  idade: number;            // meses
  raca: string;
  pai?: string;             // ID do reprodutor
  mae?: string;             // ID da matriz
  status: 'ATIVO' | 'VENDIDO' | 'MORTO' | 'TRANSFERIDO';
  lote: string;
  pasto: string;
  dataEntrada: Date;
  valorCompra?: number;
  custoAcumulado: number;   // Ração, vacinas, etc
  previsaoVenda?: Date;
  observacoes?: string;
}

// 2. MANEJO (substitui Metas)
export interface Manejo {
  id: string;
  tipo: 'VACINACAO' | 'VERMIFUGACAO' | 'PESAGEM' | 'REPRODUCAO' | 'TRATAMENTO';
  animais: string[];        // IDs dos animais
  data: Date;
  produto?: string;         // Vacina, remédio usado
  dosagem?: string;
  custo: number;
  responsavel: string;
  observacoes?: string;
  proximaAplicacao?: Date;  // Para vacinas/vermífugos
}

// 3. PRODUÇÃO (substitui Investimentos)
export interface Producao {
  id: string;
  tipo: 'NASCIMENTO' | 'DESMAME' | 'ENGORDA' | 'REPRODUCAO';
  animal: string;
  data: Date;
  peso?: number;
  ganhoMedio?: number;      // kg/dia
  custoProducao: number;
  receita?: number;
  margemLucro?: number;
  observacoes?: string;
}

// 4. VENDAS (novo)
export interface Venda {
  id: string;
  animais: string[];
  comprador: string;        // Frigorífico, outro produtor
  tipoVenda: 'FRIGORIFICO' | 'LEILAO' | 'DIRETO';
  pesoTotal: number;
  precoArroba: number;
  valorTotal: number;
  dataVenda: Date;
  dataEntrega?: Date;
  impostos: {
    funrural: number;
    icms: number;
    outros: number;
  };
  lucroLiquido: number;
  observacoes?: string;
}

// ===== IA ESPECIALIZADA - FINN BOVINO =====

// Conhecimento específico da IA
export interface BovinoAIKnowledge {
  zootecnia: {
    racas: string[];
    categorias: string[];
    manejo: string[];
    reproducao: string[];
    nutricao: string[];
  };
  mercado: {
    precos_arroba: string;
    frigorificos: string[];
    indices: string[];
    sazonalidade: string;
  };
  fiscal: {
    impostos: string[];
    documentos: string[];
    obrigacoes: string[];
  };
}

// Comandos por voz/WhatsApp
export interface WhatsAppCommand {
  input: string;
  response: string;
  action: string;
  disclaimer?: string;
}

// ===== FUNCIONALIDADES INOVADORAS =====

// Bovino Vision
export interface VisionAnalysis {
  animalId: string;
  estimatedWeight: number;
  confidence: number;
  healthStatus?: string;
  recommendations?: string[];
  disclaimer: string; // Sempre incluir disclaimer
}

// Smart Alerts
export interface SmartAlert {
  type: 'health' | 'reproduction' | 'market' | 'management' | 'weather';
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired?: string;
  timestamp: Date;
}

// Predictive Analytics
export interface PredictiveAnalysis {
  type: 'weight_gain' | 'market_timing' | 'reproduction_success' | 'feed_optimization' | 'disease_prevention';
  prediction: string;
  confidence: number;
  timeframe: string;
  recommendations: string[];
}

// ===== INTEGRAÇÕES =====

// Frigoríficos
export interface FrigorificoIntegration {
  jbs: any;
  marfrig: any;
  minerva: any;

  getCotacao(categoria: string): Promise<number>;
  agendarVenda(animais: string[], data: Date): Promise<string>;
  consultarCapacidade(frigorifico: string): Promise<number>;
}

// Mercado (CEPEA/B3)
export interface MarketDataService {
  getPrecoArroba(): Promise<number>;
  getIndiceBoi(): Promise<any>;
  getPredictions(): Promise<any[]>;
  getRegionalPrices(): Promise<any[]>;
}

// Órgãos Oficiais
export interface OfficialIntegration {
  sisbov: any;
  incra: any;
  receita: any;

  emitirGTA(animais: string[]): Promise<string>;
  consultarVacinas(animal: string): Promise<any[]>;
  calcularImpostos(venda: Venda): Promise<any>;
}

// ===== DASHBOARD E INTERFACE =====

// KPI Cards do Dashboard
export interface KPICard {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color: string;
}

// Alertas Inteligentes
export interface IntelligentAlert {
  type: 'urgent' | 'opportunity' | 'health';
  message: string;
  action: string;
  icon: string;
}

// Tema Visual
export interface BOVINEXTTheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  description: string;
}

// ===== CONFIGURAÇÕES =====

// Configurações do Sistema
export interface SystemConfig {
  fazenda: {
    nome: string;
    area: number;
    localizacao: string;
    tipoCriacao: string;
  };
  ia: {
    estiloComunicacao: string;
    nivelDetalhamento: string;
    frequenciaSugestoes: string;
    confiancaMinima: number;
  };
  whatsapp: {
    numero: string;
    comandosVoz: boolean;
    relatoriosAutomaticos: boolean;
  };
  iot: {
    sensores: any[];
    status: string;
  };
}

// ===== ESTATÍSTICAS E RELATÓRIOS =====

// Estatísticas do Dashboard
export interface DashboardStats {
  totalAnimais: number;
  receitaMensal: number;
  gmdMedio: number;
  lucroLiquido: number;
  alertasAtivos: number;
}

// Relatório de Produção
export interface ProductionReport {
  periodo: string;
  gmdMedio: number;
  conversaoAlimentar: number;
  custoPorArroba: number;
  margemLucro: number;
  recomendacoes: string[];
}

// ===== WHATSAPP BUSINESS =====

// Status da Conexão WhatsApp
export interface WhatsAppStatus {
  connected: boolean;
  number: string;
  quality: 'high' | 'medium' | 'low';
  lastSync: Date;
}

// Comando WhatsApp Processado
export interface ProcessedCommand {
  command: string;
  intent: string;
  entities: Record<string, any>;
  response: string;
  action?: string;
  confidence: number;
}

// ===== SEGURANÇA E CONFORMIDADE =====

// Configurações de Segurança
export interface SecurityConfig {
  twoFactor: boolean;
  biometricLogin: boolean;
  sessionTimeout: number;
  dataEncryption: boolean;
}

// Logs de Auditoria
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// ===== EXPORT =====

// Export all interfaces - removed duplicate exports to fix conflicts
