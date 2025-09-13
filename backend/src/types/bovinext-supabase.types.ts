// =====================================================
// BOVINEXT - TIPOS COMPLETOS PARA SUPABASE
// Plataforma de Gestão Pecuária com IA Especializada
// =====================================================

import { Database } from './database.types';

// Tipos base do Supabase
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// =====================================================
// 1. USUÁRIOS E FAZENDAS
// =====================================================

export interface IUser {
  id: string;
  firebase_uid: string;
  email: string;
  display_name?: string;
  fazenda_nome: string;
  fazenda_area?: number;
  fazenda_localizacao?: string;
  tipo_criacao?: 'corte' | 'leite' | 'misto';
  experiencia_anos?: number;
  subscription_plan: 'fazendeiro' | 'pecuarista' | 'agropecuaria';
  subscription_status: 'active' | 'inactive' | 'trial';
  created_at: string;
  updated_at: string;
}

// =====================================================
// 2. ANIMAIS (REBANHO)
// =====================================================

export interface IAnimal {
  id: string;
  user_id: string;
  brinco: string;
  raca: string;
  sexo: 'macho' | 'femea';
  data_nascimento: string;
  peso_nascimento?: number;
  peso_atual?: number;
  mae_id?: string;
  pai_id?: string;
  status: 'ativo' | 'vendido' | 'morto' | 'transferido';
  lote?: string;
  pasto?: string;
  categoria?: 'bezerro' | 'novilho' | 'boi' | 'bezerra' | 'novilha' | 'vaca';
  valor_compra?: number;
  custo_acumulado: number;
  observacoes?: string;
  foto_url?: string;
  created_at: string;
  updated_at: string;
}

export interface IAnimalCreate {
  brinco: string;
  raca: string;
  sexo: 'macho' | 'femea';
  data_nascimento: string;
  peso_nascimento?: number;
  mae_id?: string;
  pai_id?: string;
  lote?: string;
  pasto?: string;
  categoria?: string;
  valor_compra?: number;
  observacoes?: string;
}

// =====================================================
// 3. MANEJOS
// =====================================================

export interface IManejo {
  id: string;
  user_id: string;
  animal_id: string;
  tipo_manejo: 'vacinacao' | 'vermifugacao' | 'pesagem' | 'reproducao' | 'tratamento';
  data_manejo: string;
  observacoes?: string;
  custo?: number;
  veterinario?: string;
  produto_usado?: string;
  dosagem?: string;
  proxima_aplicacao?: string;
  created_at: string;
  updated_at: string;
}

export interface IManejoCreate {
  animal_id: string;
  tipo_manejo: 'vacinacao' | 'vermifugacao' | 'pesagem' | 'reproducao' | 'tratamento';
  data_manejo: string;
  observacoes?: string;
  custo?: number;
  veterinario?: string;
  produto_usado?: string;
  dosagem?: string;
  proxima_aplicacao?: string;
}

// =====================================================
// 4. VENDAS
// =====================================================

export interface IVenda {
  id: string;
  user_id: string;
  comprador: string;
  cpf_comprador?: string;
  tipo_venda: 'frigorifico' | 'leilao' | 'direto';
  peso_total: number;
  preco_arroba: number;
  valor_total: number;
  quantidade_animais?: number;
  data_venda: string;
  data_entrega?: string;
  funrural?: number;
  icms?: number;
  outros_impostos?: number;
  lucro_liquido: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface IVendaCreate {
  comprador: string;
  cpf_comprador?: string;
  tipo_venda: 'frigorifico' | 'leilao' | 'direto';
  peso_total: number;
  preco_arroba: number;
  valor_total: number;
  quantidade_animais?: number;
  data_venda: string;
  data_entrega?: string;
  funrural?: number;
  icms?: number;
  outros_impostos?: number;
  lucro_liquido: number;
  observacoes?: string;
}

export interface IVendaAnimal {
  id: string;
  venda_id: string;
  animal_id: string;
  created_at: string;
}

// =====================================================
// 5. PRODUÇÃO
// =====================================================

export interface IProducao {
  id: string;
  user_id: string;
  animal_id: string;
  tipo: 'leite' | 'peso' | 'nascimento' | 'desmame' | 'engorda' | 'reproducao';
  data_producao: string;
  valor?: number; // Quantidade produzida (litros, kg, etc)
  peso?: number;
  ganho_medio_diario?: number; // GMD em kg/dia
  custo_producao: number;
  receita?: number;
  margem_lucro?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface IProducaoCreate {
  animal_id: string;
  tipo: 'leite' | 'peso' | 'nascimento' | 'desmame' | 'engorda' | 'reproducao';
  data_producao: string;
  valor?: number;
  peso?: number;
  ganho_medio_diario?: number;
  custo_producao: number;
  receita?: number;
  margem_lucro?: number;
  observacoes?: string;
}

// =====================================================
// 6. METAS
// =====================================================

export interface IMeta {
  id: string;
  user_id: string;
  nome_da_meta: string;
  descricao?: string;
  valor_total: number;
  valor_atual: number;
  data_conclusao: string;
  categoria: 'vendas' | 'producao' | 'reproducao' | 'ganho_peso' | 'expansao' | 'melhoramento';
  prioridade: 'baixa' | 'media' | 'alta';
  unidade: 'reais' | 'kg' | 'cabecas' | 'percentual';
  tipo_animal: string;
  lote_alvo?: string;
  concluida: boolean;
  created_at: string;
  updated_at: string;
}

export interface IMetaCreate {
  nome_da_meta: string;
  descricao?: string;
  valor_total: number;
  data_conclusao: string;
  categoria: 'vendas' | 'producao' | 'reproducao' | 'ganho_peso' | 'expansao' | 'melhoramento';
  prioridade?: 'baixa' | 'media' | 'alta';
  unidade?: 'reais' | 'kg' | 'cabecas' | 'percentual';
  tipo_animal?: string;
  lote_alvo?: string;
}

// =====================================================
// 7. CHAT MESSAGES (IA CONVERSACIONAL)
// =====================================================

export interface IChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  channel: 'whatsapp' | 'web' | 'mobile';
  phone_number?: string;
  media_url?: string;
  timestamp: string;
  context?: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface IChatMessageCreate {
  message: string;
  response: string;
  channel?: 'whatsapp' | 'web' | 'mobile';
  phone_number?: string;
  media_url?: string;
  context?: any;
}

// =====================================================
// 8. PREÇOS DE MERCADO
// =====================================================

export interface IPrecoMercado {
  id: string;
  data_preco: string;
  preco_arroba: number;
  categoria: 'boi_gordo' | 'vaca_gorda' | 'novilho';
  regiao: string;
  fonte: 'cepea' | 'b3' | 'scot';
  created_at: string;
}

// =====================================================
// 9. ALERTAS E NOTIFICAÇÕES
// =====================================================

export interface IAlerta {
  id: string;
  user_id: string;
  tipo_alerta: 'vacinacao' | 'pesagem' | 'mercado' | 'reproducao';
  titulo: string;
  mensagem: string;
  data_alerta: string;
  lido: boolean;
  enviado_whatsapp: boolean;
  animal_id?: string;
  created_at: string;
}

export interface IAlertaCreate {
  tipo_alerta: 'vacinacao' | 'pesagem' | 'mercado' | 'reproducao';
  titulo: string;
  mensagem: string;
  data_alerta: string;
  animal_id?: string;
}

// =====================================================
// TIPOS PARA RELATÓRIOS E DASHBOARDS
// =====================================================

export interface IResumoRebanho {
  user_id: string;
  fazenda_nome: string;
  total_animais: number;
  machos: number;
  femeas: number;
  ativos: number;
  vendidos: number;
  peso_medio: number;
  custo_total: number;
}

export interface IPerformanceVendas {
  user_id: string;
  fazenda_nome: string;
  mes_venda: string;
  total_vendas: number;
  peso_vendido: number;
  receita_total: number;
  lucro_total: number;
  preco_medio_arroba: number;
}

export interface IEstatisticasDashboard {
  totalAnimais: number;
  receitaMensal: number;
  gmdMedio: number;
  alertasPendentes: number;
  proximasVacinacoes: number;
  metasConcluidas: number;
}

// =====================================================
// TIPOS PARA IA ESPECIALIZADA
// =====================================================

export interface IContextoIA {
  usuario: IUser;
  rebanho_resumo: IResumoRebanho;
  ultimas_vendas: IVenda[];
  alertas_pendentes: IAlerta[];
  precos_atuais: IPrecoMercado[];
}

export interface IComandoVoz {
  comando: string;
  categoria: 'consulta' | 'acao' | 'relatorio';
  parametros?: any;
  resposta_esperada: 'texto' | 'dados' | 'acao';
}

// =====================================================
// TIPOS PARA INTEGRAÇÃO WHATSAPP
// =====================================================

export interface IWhatsAppMessage {
  from: string;
  body: string;
  mediaUrl?: string;
  timestamp: string;
}

export interface IWhatsAppResponse {
  to: string;
  body: string;
  mediaUrl?: string;
}

// =====================================================
// TIPOS PARA ANÁLISE ZOOTÉCNICA
// =====================================================

export interface IAnaliseZootecnica {
  animal_id: string;
  gmd_atual: number;
  gmd_esperado: number;
  eficiencia: number;
  recomendacoes: string[];
  proxima_pesagem: string;
}

export interface IRelatorioProducao {
  periodo: {
    inicio: string;
    fim: string;
  };
  animais_analisados: number;
  gmd_medio: number;
  custo_por_kg: number;
  receita_total: number;
  margem_lucro: number;
  melhor_lote: string;
  pior_lote: string;
}

// =====================================================
// ENUMS E CONSTANTES
// =====================================================

export enum TipoManejo {
  VACINACAO = 'vacinacao',
  VERMIFUGACAO = 'vermifugacao',
  PESAGEM = 'pesagem',
  REPRODUCAO = 'reproducao',
  TRATAMENTO = 'tratamento'
}

export enum StatusAnimal {
  ATIVO = 'ativo',
  VENDIDO = 'vendido',
  MORTO = 'morto',
  TRANSFERIDO = 'transferido'
}

export enum TipoVenda {
  FRIGORIFICO = 'frigorifico',
  LEILAO = 'leilao',
  DIRETO = 'direto'
}

export enum CategoriaAnimal {
  BEZERRO = 'bezerro',
  NOVILHO = 'novilho',
  BOI = 'boi',
  BEZERRA = 'bezerra',
  NOVILHA = 'novilha',
  VACA = 'vaca'
}

export enum PlanoSubscricao {
  FAZENDEIRO = 'fazendeiro',
  PECUARISTA = 'pecuarista',
  AGROPECUARIA = 'agropecuaria'
}

// =====================================================
// CONHECIMENTO ESPECIALIZADO IA BOVINEXT
// =====================================================

export const BOVINEXT_AI_KNOWLEDGE = {
  zootecnia: {
    racas: ['Nelore', 'Angus', 'Brahman', 'Canchim', 'Senepol', 'Tabapuã', 'Gir', 'Guzerá'],
    categorias: ['Bezerro', 'Novilho', 'Boi', 'Bezerra', 'Novilha', 'Vaca'],
    manejo: ['Vacinação', 'Vermifugação', 'Castração', 'Descorna', 'Pesagem'],
    reproducao: ['Inseminação', 'Monta Natural', 'IATF', 'Diagnóstico Gestação'],
    nutricao: ['Pasto', 'Ração', 'Sal Mineral', 'Suplementação', 'Silagem']
  },
  mercado: {
    precos_arroba: 'Preços atualizados CEPEA/B3',
    frigorificos: ['JBS', 'Marfrig', 'Minerva', 'BRF'],
    indices: ['Boi Gordo CEPEA', 'Bezerro CEPEA', 'Reposição CEPEA'],
    sazonalidade: 'Análise sazonal de preços e demanda'
  },
  fiscal: {
    impostos: ['FUNRURAL', 'ICMS', 'PIS/COFINS'],
    documentos: ['GTA', 'Nota Fiscal', 'SISBOV'],
    obrigacoes: ['ITR', 'INCRA', 'IBAMA']
  }
};

export const WHATSAPP_COMMANDS = {
  consultas: [
    'Bovino, quantos animais tenho?',
    'Bovino, preço do boi hoje',
    'Bovino, meu rebanho',
    'Bovino, vendas do mês'
  ],
  acoes: [
    'Bovino, cadastrar animal',
    'Bovino, agendar vacinação',
    'Bovino, registrar pesagem',
    'Bovino, criar venda'
  ],
  relatorios: [
    'Bovino, relatório mensal',
    'Bovino, GMD do lote',
    'Bovino, análise financeira',
    'Bovino, alertas pendentes'
  ]
};
