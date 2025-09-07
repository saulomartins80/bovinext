import { supabase } from '../config/supabase';
import { Database } from '../types/database.types';
import logger from '../utils/logger';

type Tables = Database['public']['Tables'];

export class SupabaseService {
  // USUÁRIOS
  async createUser(userData: Tables['users']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async getUserByFirebaseUid(firebaseUid: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Tables['users']['Update']) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // ANIMAIS
  async createAnimal(animalData: Tables['animais']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('animais')
        .insert(animalData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao criar animal:', error);
      throw error;
    }
  }

  async getAnimaisByUser(userId: string, status?: string) {
    try {
      let query = supabase
        .from('animais')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar animais:', error);
      throw error;
    }
  }

  async getAnimalById(animalId: string) {
    try {
      const { data, error } = await supabase
        .from('animais')
        .select('*')
        .eq('id', animalId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar animal:', error);
      throw error;
    }
  }

  async updateAnimal(animalId: string, updates: Tables['animais']['Update']) {
    try {
      const { data, error } = await supabase
        .from('animais')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', animalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao atualizar animal:', error);
      throw error;
    }
  }

  async deleteAnimal(animalId: string) {
    try {
      const { error } = await supabase
        .from('animais')
        .delete()
        .eq('id', animalId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Erro ao deletar animal:', error);
      throw error;
    }
  }

  // MANEJOS
  async createManejo(manejoData: Tables['manejos']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('manejos')
        .insert(manejoData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao criar manejo:', error);
      throw error;
    }
  }

  async getManejosByUser(userId: string, limit?: number) {
    try {
      let query = supabase
        .from('manejos')
        .select(`
          *,
          animais (
            brinco,
            raca
          )
        `)
        .eq('user_id', userId)
        .order('data_manejo', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar manejos:', error);
      throw error;
    }
  }

  async getManejosByAnimal(animalId: string) {
    try {
      const { data, error } = await supabase
        .from('manejos')
        .select('*')
        .eq('animal_id', animalId)
        .order('data_manejo', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar manejos do animal:', error);
      throw error;
    }
  }

  // Métodos para WhatsApp e Chat
  async getUserByPhone(phoneNumber: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar usuário por telefone:', error);
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  async createChatMessage(messageData: Tables['chat_messages']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao salvar mensagem de chat:', error);
      throw error;
    }
  }

  async getChatMessages(userId: string, options?: {
    channel?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.channel) {
        query = query.eq('channel', options.channel);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar mensagens de chat:', error);
      throw error;
    }
  }

  // Métodos para Manejos
  async getManejos(userId: string, filters?: {
    status?: string;
    tipo?: string;
    animal_id?: string;
    data_inicio?: string;
    data_fim?: string;
  }) {
    try {
      let query = supabase
        .from('manejos')
        .select(`
          *,
          animais (
            brinco,
            raca
          )
        `)
        .eq('user_id', userId)
        .order('data_prevista', { ascending: true });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      if (filters?.animal_id) {
        query = query.eq('animal_id', filters.animal_id);
      }
      if (filters?.data_inicio) {
        query = query.gte('data_prevista', filters.data_inicio);
      }
      if (filters?.data_fim) {
        query = query.lte('data_prevista', filters.data_fim);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar manejos:', error);
      throw error;
    }
  }

  async getManejoById(manejoId: string) {
    try {
      const { data, error } = await supabase
        .from('manejos')
        .select(`
          *,
          animais (
            brinco,
            raca,
            peso_atual
          )
        `)
        .eq('id', manejoId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar manejo:', error);
      throw error;
    }
  }

  async updateManejo(manejoId: string, updates: Tables['manejos']['Update']) {
    try {
      const { data, error } = await supabase
        .from('manejos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', manejoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao atualizar manejo:', error);
      throw error;
    }
  }

  async deleteManejo(manejoId: string) {
    try {
      const { error } = await supabase
        .from('manejos')
        .delete()
        .eq('id', manejoId);

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Erro ao deletar manejo:', error);
      throw error;
    }
  }


  // VENDAS
  async createVenda(vendaData: Tables['vendas']['Insert'], animaisIds: string[]) {
    try {
      // Inicia transação
      const { data: venda, error: vendaError } = await supabase
        .from('vendas')
        .insert(vendaData)
        .select()
        .single();

      if (vendaError) throw vendaError;

      // Adiciona animais à venda
      const vendaAnimais = animaisIds.map(animalId => ({
        venda_id: venda.id,
        animal_id: animalId
      }));

      const { error: animaisError } = await supabase
        .from('vendas_animais')
        .insert(vendaAnimais);

      if (animaisError) throw animaisError;

      // Atualiza status dos animais para vendido
      const { error: updateError } = await supabase
        .from('animais')
        .update({ status: 'vendido' })
        .in('id', animaisIds);

      if (updateError) throw updateError;

      return venda;
    } catch (error) {
      logger.error('Erro ao criar venda:', error);
      throw error;
    }
  }

  async getVendasByUser(userId: string) {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          vendas_animais (
            animais (
              brinco,
              raca,
              peso_atual
            )
          )
        `)
        .eq('user_id', userId)
        .order('data_venda', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar vendas:', error);
      throw error;
    }
  }

  // PRODUÇÃO
  async createProducao(producaoData: Tables['producao']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('producao')
        .insert(producaoData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao criar produção:', error);
      throw error;
    }
  }

  async getProducaoByUser(userId: string, tipo?: string) {
    try {
      let query = supabase
        .from('producao')
        .select(`
          *,
          animais (
            brinco,
            raca
          )
        `)
        .eq('user_id', userId)
        .order('data_producao', { ascending: false });

      if (tipo) {
        query = query.eq('tipo_producao', tipo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar produção:', error);
      throw error;
    }
  }

  // CHAT MESSAGES
  async saveChatMessage(messageData: Tables['chat_messages']['Insert']) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao salvar mensagem:', error);
      throw error;
    }
  }

  async getChatHistory(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Erro ao buscar histórico de chat:', error);
      throw error;
    }
  }

  // ESTATÍSTICAS E DASHBOARDS
  async getDashboardStats(userId: string) {
    try {
      // Total de animais ativos
      const { count: totalAnimais } = await supabase
        .from('animais')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'ativo');

      // Vendas do mês atual
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const { data: vendasMes } = await supabase
        .from('vendas')
        .select('valor_total')
        .eq('user_id', userId)
        .gte('data_venda', inicioMes.toISOString());

      const receitaMensal = vendasMes?.reduce((sum, venda) => sum + venda.valor_total, 0) || 0;

      // GMD médio (últimos 30 dias)
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

      const { data: producaoRecente } = await supabase
        .from('producao')
        .select('ganho_medio_diario')
        .eq('user_id', userId)
        .eq('tipo_producao', 'engorda')
        .gte('data_producao', trintaDiasAtras.toISOString())
        .not('ganho_medio_diario', 'is', null);

      const gmdMedio = producaoRecente?.length 
        ? producaoRecente.reduce((sum, p) => sum + (p.ganho_medio_diario || 0), 0) / producaoRecente.length
        : 0;

      return {
        totalAnimais: totalAnimais || 0,
        receitaMensal,
        gmdMedio: Number(gmdMedio.toFixed(2))
      };
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export const supabaseService = new SupabaseService();
