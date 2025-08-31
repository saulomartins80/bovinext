import { ObjectId } from 'mongodb';
import { User } from '../models/User';
import { Transacoes } from '../models/Transacoes';
import { Goal } from '../models/Goal';
import { Investimento } from '../models/Investimento';
import { Card } from '../models/Card';

export interface UserFinancialData {
  user: {
    _id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
  transactions: Array<{
    _id: string;
    descricao: string;
    valor: number;
    categoria: string;
    tipo: string;
    data: Date;
    conta: string;
  }>;
  goals: Array<{
    _id: string;
    nome_da_meta: string;
    descricao: string;
    valor_total: number;
    valor_atual: number;
    data_conclusao: Date;
    categoria: string;
    prioridade: string;
  }>;
  investments: Array<{
    _id: string;
    nome: string;
    tipo: string;
    valor: number;
    instituicao: string;
    data: Date;
  }>;
  cards: Array<{
    _id: string;
    name: string;
    banco: string;
    limite: number;
    programa: string;
    cashback: number;
  }>;
}

export class UserDataService {
  /**
   * Busca todos os dados financeiros do usuário
   */
  static async getUserFinancialData(firebaseUid: string): Promise<UserFinancialData | null> {
    try {
      console.log(`[UserDataService] Buscando dados para usuário: ${firebaseUid}`);

      // 1. Buscar usuário no MongoDB
      const user = await User.findOne({ firebaseUid });
      if (!user) {
        console.log(`[UserDataService] Usuário não encontrado: ${firebaseUid}`);
        return null;
      }

      const mongoUserId = user._id;
      console.log(`[UserDataService] MongoDB ID: ${mongoUserId}`);
      console.log(`[UserDataService] Tipo do mongoUserId:`, typeof mongoUserId, mongoUserId.toString());

      // 2. Buscar todas as transações - CORRIGIR BUSCA
      // Tentar com string e ObjectId
      let transactions = await Transacoes.find({ userId: mongoUserId.toString() })
        .sort({ data: -1 })
        .limit(50)
        .lean();
      
      if (transactions.length === 0) {
        // Tentar com ObjectId
        transactions = await Transacoes.find({ userId: mongoUserId })
          .sort({ data: -1 })
          .limit(50)
          .lean();
      }
      
      console.log(`[UserDataService] Transações encontradas: ${transactions.length}`);
      if (transactions.length > 0) {
        console.log(`[UserDataService] Primeira transação userId:`, transactions[0].userId, typeof transactions[0].userId);
      }

      // 3. Buscar todas as metas
      const goals = await Goal.find({ userId: mongoUserId })
        .sort({ createdAt: -1 })
        .lean();

      // 4. Buscar todos os investimentos
      const investments = await Investimento.find({ userId: mongoUserId })
        .sort({ data: -1 })
        .lean();

      // 5. Buscar todos os cartões
      const cards = await Card.find({ userId: mongoUserId })
        .sort({ createdAt: -1 })
        .lean();

      const userData: UserFinancialData = {
        user: {
          _id: user._id.toString(),
          name: user.name || 'Usuário',
          email: user.email || '',
          createdAt: user.createdAt || new Date()
        },
        transactions: transactions.map(t => ({
          _id: t._id.toString(),
          descricao: t.descricao || '',
          valor: t.valor || 0,
          categoria: t.categoria || 'Geral',
          tipo: t.tipo || 'despesa',
          data: t.data || new Date(),
          conta: t.conta || 'Principal'
        })),
        goals: goals.map(g => ({
          _id: g._id.toString(),
          nome_da_meta: g.nome_da_meta || '',
          descricao: g.descricao || '',
          valor_total: g.valor_total || 0,
          valor_atual: g.valor_atual || 0,
          data_conclusao: g.data_conclusao || new Date(),
          categoria: g.categoria || 'Economia',
          prioridade: g.prioridade || 'media'
        })),
        investments: investments.map(i => ({
          _id: i._id.toString(),
          nome: i.nome || '',
          tipo: i.tipo || '',
          valor: i.valor || 0,
          instituicao: i.instituicao || '',
          data: i.data || new Date()
        })),
        cards: cards.map(c => ({
          _id: c._id.toString(),
          name: c.name || '',
          banco: c.bank || '', // CORRIGIDO: bank no schema
          limite: c.limit || 0, // CORRIGIDO: limit no schema
          programa: c.program || '', // CORRIGIDO: program no schema
          cashback: c.cashback || 0
        }))
      };

      console.log(`[UserDataService] Dados encontrados:`, {
        transactions: userData.transactions.length,
        goals: userData.goals.length,
        investments: userData.investments.length,
        cards: userData.cards.length
      });

      return userData;

    } catch (error) {
      console.error('[UserDataService] Erro ao buscar dados do usuário:', error);
      return null;
    }
  }

  /**
   * Busca apenas as metas do usuário
   */
  static async getUserGoals(firebaseUid: string) {
    try {
      const user = await User.findOne({ firebaseUid });
      if (!user) return [];

      const goals = await Goal.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .lean();

      return goals.map(g => ({
        _id: g._id.toString(),
        nome_da_meta: g.nome_da_meta || '',
        descricao: g.descricao || '',
        valor_total: g.valor_total || 0,
        valor_atual: g.valor_atual || 0,
        data_conclusao: g.data_conclusao || new Date(),
        categoria: g.categoria || 'Economia',
        prioridade: g.prioridade || 'media',
        progresso: Math.round(((g.valor_atual || 0) / (g.valor_total || 1)) * 100)
      }));
    } catch (error) {
      console.error('[UserDataService] Erro ao buscar metas:', error);
      return [];
    }
  }

  /**
   * Busca apenas as transações recentes do usuário
   */
  static async getUserTransactions(firebaseUid: string, limit: number = 20) {
    try {
      const user = await User.findOne({ firebaseUid });
      if (!user) return [];

      const transactions = await Transacoes.find({ userId: user._id })
        .sort({ data: -1 })
        .limit(limit)
        .lean();

      return transactions.map(t => ({
        _id: t._id.toString(),
        descricao: t.descricao || '',
        valor: t.valor || 0,
        categoria: t.categoria || 'Geral',
        tipo: t.tipo || 'despesa',
        data: t.data || new Date(),
        conta: t.conta || 'Principal'
      }));
    } catch (error) {
      console.error('[UserDataService] Erro ao buscar transações:', error);
      return [];
    }
  }

  /**
   * Busca resumo financeiro do usuário
   */
  static async getUserSummary(firebaseUid: string) {
    try {
      const data = await this.getUserFinancialData(firebaseUid);
      if (!data) return null;

      // Calcular totais
      const totalReceitas = data.transactions
        .filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + t.valor, 0);

      const totalDespesas = data.transactions
        .filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + t.valor, 0);

      const totalInvestimentos = data.investments
        .reduce((sum, i) => sum + i.valor, 0);

      const metasAtivas = data.goals.filter(g => 
        new Date(g.data_conclusao) > new Date() && g.valor_atual < g.valor_total
      );

      const saldoAtual = totalReceitas - totalDespesas;

      return {
        saldoAtual,
        totalReceitas,
        totalDespesas,
        totalInvestimentos,
        metasAtivas: metasAtivas.length,
        cartoes: data.cards.length,
        ultimasTransacoes: data.transactions.slice(0, 5)
      };
    } catch (error) {
      console.error('[UserDataService] Erro ao calcular resumo:', error);
      return null;
    }
  }
}
