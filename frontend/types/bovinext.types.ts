// Tipos TypeScript para o sistema BOVINEXT - Frontend
// Alinhado com a especificação completa do projeto

export interface Animal {
  id: string;
  brinco: string;
  categoria: 'BOI' | 'VACA' | 'NOVILHO' | 'NOVILHA' | 'BEZERRO' | 'BEZERRA';
  peso: number;
  idade: number; // em meses
  raca: string;
  status: 'ATIVO' | 'VENDIDO' | 'MORTO' | 'TRANSFERIDO';
  lote: string;
  pasto: string;
  dataEntrada: Date;
  valorCompra?: number;
  custoAcumulado: number;
  previsaoVenda?: Date;
  observacoes?: string;
  foto?: string;
  pai?: string;
  mae?: string;
  historicoSaude?: HistoricoSaude[];
  historicoPeso?: HistoricoPeso[];
}

export interface HistoricoSaude {
  id: string;
  data: Date;
  tipo: 'VACINACAO' | 'MEDICAMENTO' | 'EXAME' | 'TRATAMENTO';
  descricao: string;
  veterinario?: string;
  custo?: number;
}

export interface HistoricoPeso {
  id: string;
  data: Date;
  peso: number;
  gmd?: number; // Ganho Médio Diário
  observacoes?: string;
}

export interface Manejo {
  id: string;
  tipo: 'VACINACAO' | 'MEDICAMENTO' | 'PESAGEM' | 'REPRODUCAO' | 'TRANSFERENCIA' | 'EXAME';
  animais: string[]; // IDs dos animais
  data: Date;
  produto?: string;
  dosagem?: string;
  custo: number;
  responsavel: string;
  observacoes?: string;
  proximaAplicacao?: Date;
  status: 'AGENDADO' | 'REALIZADO' | 'CANCELADO';
  veterinario?: string;
  resultados?: string;
}

export interface Producao {
  id: string;
  tipo: 'ENGORDA' | 'REPRODUCAO' | 'LEITE' | 'CRIA';
  animal: string; // ID do animal
  data: Date;
  peso?: number;
  ganhoMedio?: number; // GMD
  custoProducao: number;
  receita?: number;
  margemLucro?: number;
  observacoes?: string;
  indicadores?: {
    conversaoAlimentar?: number;
    consumoRacao?: number;
    eficienciaReproductiva?: number;
  };
}

export interface Venda {
  id: string;
  animais: string[]; // IDs dos animais
  comprador: string;
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
  status: 'PENDENTE' | 'CONFIRMADA' | 'ENTREGUE' | 'CANCELADA';
  contrato?: string;
  formaPagamento?: string;
}

export interface DashboardKPIs {
  totalAnimais: number;
  receitaMensal: number;
  gmdMedio: number;
  lucroMensal: number;
  precoArroba: number;
  alertasAtivos: number;
  custoPorCabeca: number;
  margemLucro: number;
  taxaNatalidade?: number;
  taxaMortalidade?: number;
}

export interface Alerta {
  id: string;
  tipo: 'VACINACAO' | 'MEDICAMENTO' | 'PESAGEM' | 'REPRODUCAO' | 'FINANCEIRO';
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA';
  titulo: string;
  descricao: string;
  dataVencimento: Date;
  animais?: string[];
  status: 'ATIVO' | 'RESOLVIDO' | 'IGNORADO';
  acoes?: string[];
}

export interface Lote {
  id: string;
  nome: string;
  descricao?: string;
  animais: string[];
  pasto: string;
  dataFormacao: Date;
  objetivo: 'ENGORDA' | 'REPRODUCAO' | 'RECRIA';
  custoTotal: number;
  pesoMedio: number;
  gmdMedio?: number;
}

export interface Pasto {
  id: string;
  nome: string;
  area: number; // em hectares
  capacidade: number; // número de animais
  ocupacao: number; // número atual de animais
  tipoCapim: string;
  qualidade: 'EXCELENTE' | 'BOA' | 'REGULAR' | 'RUIM';
  ultimaReforma?: Date;
  proximaReforma?: Date;
  observacoes?: string;
}

export interface Despesa {
  id: string;
  categoria: 'RACAO' | 'MEDICAMENTO' | 'COMBUSTIVEL' | 'MANUTENCAO' | 'FUNCIONARIO' | 'OUTROS';
  descricao: string;
  valor: number;
  data: Date;
  fornecedor?: string;
  animais?: string[]; // Se aplicável a animais específicos
  observacoes?: string;
}

export interface Meta {
  id: string;
  tipo: 'GMD' | 'PESO' | 'RECEITA' | 'LUCRO' | 'NATALIDADE';
  titulo: string;
  valorMeta: number;
  valorAtual: number;
  unidade: string;
  prazo: Date;
  status: 'EM_ANDAMENTO' | 'CONCLUIDA' | 'ATRASADA';
  progresso: number; // percentual
}

// Tipos para integração com IA FINN Bovino
export interface ComandoVoz {
  id: string;
  comando: string;
  intencao: string;
  entidades: Record<string, any>;
  resposta: string;
  executado: boolean;
  timestamp: Date;
}

export interface AnaliseImagem {
  id: string;
  imagemUrl: string;
  animal?: string;
  resultados: {
    condicaoCorporal?: number;
    peso_estimado?: number;
    saude_aparente?: string;
    recomendacoes?: string[];
  };
  confianca: number;
  timestamp: Date;
}

// Tipos para integrações externas
export interface PrecoMercado {
  fonte: 'CEPEA' | 'B3' | 'SCOT';
  categoria: string;
  preco: number;
  data: Date;
  regiao: string;
  tendencia: 'ALTA' | 'BAIXA' | 'ESTAVEL';
}

export interface DadosClimaticos {
  temperatura: number;
  umidade: number;
  precipitacao: number;
  data: Date;
  fonte: string;
  previsao?: {
    proximosDias: Array<{
      data: Date;
      temperatura: number;
      precipitacao: number;
    }>;
  };
}

// Filtros para as páginas
export interface FiltroAnimais {
  categoria?: string;
  status?: string;
  lote?: string;
  raca?: string;
  search?: string;
  pesoMin?: number;
  pesoMax?: number;
  idadeMin?: number;
  idadeMax?: number;
}

export interface FiltroManejos {
  tipo?: string;
  status?: string;
  responsavel?: string;
  dataInicio?: Date;
  dataFim?: Date;
  search?: string;
}

export interface FiltroProducoes {
  tipo?: string;
  animal?: string;
  dataInicio?: Date;
  dataFim?: Date;
  gmdMin?: number;
  gmdMax?: number;
}

export interface FiltroVendas {
  tipoVenda?: string;
  status?: string;
  comprador?: string;
  dataInicio?: Date;
  dataFim?: Date;
  search?: string;
}

// Estados da aplicação
export interface AppState {
  user: any;
  animais: Animal[];
  manejos: Manejo[];
  producoes: Producao[];
  vendas: Venda[];
  alertas: Alerta[];
  kpis: DashboardKPIs;
  loading: {
    animais: boolean;
    manejos: boolean;
    producoes: boolean;
    vendas: boolean;
    dashboard: boolean;
  };
}

// Tipos para formulários
export interface FormularioAnimal extends Omit<Animal, 'id' | 'custoAcumulado' | 'historicoSaude' | 'historicoPeso'> {
  custoAcumulado?: number;
}

export interface FormularioManejo extends Omit<Manejo, 'id'> {}

export interface FormularioProducao extends Omit<Producao, 'id'> {}

export interface FormularioVenda extends Omit<Venda, 'id' | 'lucroLiquido'> {
  lucroLiquido?: number;
}

// Tipos para relatórios
export interface RelatorioFinanceiro {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  receitas: {
    vendas: number;
    outros: number;
    total: number;
  };
  despesas: {
    racao: number;
    medicamentos: number;
    funcionarios: number;
    outros: number;
    total: number;
  };
  lucro: number;
  margemLucro: number;
}

export interface RelatorioProducao {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  gmdMedio: number;
  pesoMedioInicial: number;
  pesoMedioFinal: number;
  ganhoTotal: number;
  custoProducao: number;
  eficiencia: number;
}

export interface RelatorioRebanho {
  totalAnimais: number;
  distribuicaoPorCategoria: Record<string, number>;
  distribuicaoPorLote: Record<string, number>;
  distribuicaoPorPasto: Record<string, number>;
  pesoMedio: number;
  idadeMedia: number;
  valorTotal: number;
}
