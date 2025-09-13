// =====================================================
// BOVINEXT SUPABASE SERVICE - VERSÃO CORRIGIDA
// Gestão Pecuária com IA Especializada
// =====================================================

import { supabaseWrapper } from './SupabaseWrapper';
import { Database } from '../types/database.types';
import { 
  IUser, IAnimal, IManejo, IVenda, IProducao, IMeta, 
  IChatMessage, IAlerta, IEstatisticasDashboard,
  IAnimalCreate, IManejoCreate, IVendaCreate, IProducaoCreate, IMetaCreate
} from '../types/bovinext-supabase.types';
import logger from '../utils/logger';

export class BovinextSupabaseService {
  
  // =====================================================
  // USUÁRIOS E FAZENDAS
  // =====================================================
  
  async createUser(userData: Database['public']['Tables']['users']['Insert']): Promise<IUser> {
    try {
      const data = await supabaseWrapper.insertUser(userData);
      return data as IUser;
    } catch (error) {
      logger.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<IUser | null> {
    try {
      const data = await supabaseWrapper.selectUserByFirebaseUid(firebaseUid);
      return data as IUser | null;
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Database['public']['Tables']['users']['Update']): Promise<IUser> {
    try {
      const data = await supabaseWrapper.updateUser(userId, userData);
      return data as IUser;
    } catch (error) {
      logger.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // =====================================================
  // ANIMAIS (REBANHO)
  // =====================================================
  
  async createAnimal(userId: string, animalData: IAnimalCreate): Promise<IAnimal> {
    try {
      const data = await supabaseWrapper.insertAnimal({ ...animalData, user_id: userId });
      return data as IAnimal;
    } catch (error) {
      logger.error('Erro ao criar animal:', error);
      throw error;
    }
  }

  async getAnimaisByUser(userId: string, filters?: {
    status?: string;
    lote?: string;
    categoria?: string;
  }): Promise<IAnimal[]> {
    try {
      const data = await supabaseWrapper.selectAnimaisByUser(userId);
      
      // Aplicar filtros localmente
      let filteredData = data;
      
      if (filters?.status) {
        filteredData = filteredData.filter(animal => animal.status === filters.status);
      }
      
      if (filters?.lote) {
        filteredData = filteredData.filter(animal => animal.lote === filters.lote);
      }
      
      return filteredData as IAnimal[];
    } catch (error) {
      logger.error('Erro ao buscar animais:', error);
      throw error;
    }
  }

  async getAnimalById(animalId: string): Promise<IAnimal | null> {
    try {
      const data = await supabaseWrapper.selectAnimalById(animalId);
      return data as IAnimal | null;
    } catch (error) {
      logger.error('Erro ao buscar animal:', error);
      throw error;
    }
  }

  async updateAnimal(animalId: string, animalData: Partial<IAnimal>): Promise<IAnimal> {
    try {
      const data = await supabaseWrapper.updateAnimal(animalId, animalData);
      return data as IAnimal;
    } catch (error) {
      logger.error('Erro ao atualizar animal:', error);
      throw error;
    }
  }

  async deleteAnimal(animalId: string): Promise<boolean> {
    try {
      return await supabaseWrapper.deleteAnimal(animalId);
    } catch (error) {
      logger.error('Erro ao deletar animal:', error);
      throw error;
    }
  }

  // =====================================================
  // MANEJOS
  // =====================================================
  
  async createManejo(userId: string, manejoCreate: IManejoCreate): Promise<IManejo> {
    try {
      const data = await supabaseWrapper.insertManejo({ ...manejoCreate, user_id: userId });
      return data as IManejo;
    } catch (error) {
      logger.error('Erro ao criar manejo:', error);
      throw error;
    }
  }

  async getManejosByUser(userId: string, filters?: {
    animalId?: string;
    tipoManejo?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<IManejo[]> {
    try {
      const data = await supabaseWrapper.selectManejosByUser(userId);
      
      // Aplicar filtros localmente
      let filteredData = data;
      
      if (filters?.animalId) {
        filteredData = filteredData.filter(manejo => manejo.animal_id === filters.animalId);
      }
      
      if (filters?.tipoManejo) {
        filteredData = filteredData.filter(manejo => manejo.tipo_manejo === filters.tipoManejo);
      }
      
      return filteredData as IManejo[];
    } catch (error) {
      logger.error('Erro ao buscar manejos:', error);
      throw error;
    }
  }

  // =====================================================
  // VENDAS
  // =====================================================
  
  async createVenda(userId: string, vendaCreate: IVendaCreate, animaisIds?: string[]): Promise<IVenda> {
    try {
      const vendaData = { ...vendaCreate, user_id: userId };
      
      // Criar venda
      const vendaCreated = await supabaseWrapper.insertVenda(vendaData);
      
      // Atualizar status dos animais para vendido
      if (animaisIds && animaisIds.length > 0) {
        for (const animalId of animaisIds) {
          await supabaseWrapper.updateAnimal(animalId, { status: 'vendido' });
        }
      }
      
      return vendaCreated as IVenda;
    } catch (error) {
      logger.error('Erro ao criar venda:', error);
      throw error;
    }
  }

  async getVendasByUser(userId: string, filters?: {
    dataInicio?: string;
    dataFim?: string;
    tipoVenda?: string;
  }): Promise<IVenda[]> {
    try {
      const data = await supabaseWrapper.selectVendasByUser(userId);
      
      // Aplicar filtros localmente
      let filteredData = data;
      
      if (filters?.tipoVenda) {
        filteredData = filteredData.filter(venda => venda.tipo_venda === filters.tipoVenda);
      }
      
      return filteredData as IVenda[];
    } catch (error) {
      logger.error('Erro ao buscar vendas:', error);
      throw error;
    }
  }

  async getVendaById(vendaId: string): Promise<IVenda | null> {
    try {
      const data = await supabaseWrapper.selectVendaById(vendaId);
      return data as IVenda | null;
    } catch (error) {
      logger.error('Erro ao buscar venda por ID:', error);
      return null;
    }
  }

  // =====================================================
  // PRODUÇÃO
  // =====================================================
  
  async createProducao(userId: string, producaoCreate: IProducaoCreate): Promise<IProducao> {
    try {
      const data = await supabaseWrapper.insertProducao({ ...producaoCreate, user_id: userId });
      return data as IProducao;
    } catch (error) {
      logger.error('Erro ao criar produção:', error);
      throw error;
    }
  }

  async getProducaoByUser(userId: string, filters?: {
    animalId?: string;
    tipoProducao?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<IProducao[]> {
    try {
      const data = await supabaseWrapper.selectProducaoByUser(userId);
      
      // Aplicar filtros localmente
      let filteredData = data;
      
      if (filters?.animalId) {
        filteredData = filteredData.filter(producao => producao.animal_id === filters.animalId);
      }
      
      if (filters?.tipoProducao) {
        filteredData = filteredData.filter(producao => producao.tipo === filters.tipoProducao);
      }
      
      return filteredData as IProducao[];
    } catch (error) {
      logger.error('Erro ao buscar produção:', error);
      throw error;
    }
  }

  // =====================================================
  // METAS
  // =====================================================
  
  async createMeta(userId: string, metaCreate: IMetaCreate): Promise<IMeta> {
    try {
      const data = await supabaseWrapper.insertMeta({ ...metaCreate, user_id: userId });
      return data as IMeta;
    } catch (error) {
      logger.error('Erro ao criar meta:', error);
      throw error;
    }
  }

  async getMetasByUser(userId: string, filters?: {
    categoria?: string;
    concluida?: boolean;
  }): Promise<IMeta[]> {
    try {
      const data = await supabaseWrapper.selectMetasByUser(userId);
      
      // Aplicar filtros localmente
      let filteredData = data;
      
      if (filters?.categoria) {
        filteredData = filteredData.filter(meta => meta.categoria === filters.categoria);
      }
      
      if (filters?.concluida !== undefined) {
        filteredData = filteredData.filter(meta => meta.concluida === filters.concluida);
      }
      
      return filteredData as IMeta[];
    } catch (error) {
      logger.error('Erro ao buscar metas:', error);
      throw error;
    }
  }

  // =====================================================
  // CHAT MESSAGES
  // =====================================================
  
  async createChatMessage(userId: string, messageData: {
    message: string;
    response: string;
    channel?: string;
    phone_number?: string;
    context?: any;
  }): Promise<IChatMessage> {
    try {
      const data = await supabaseWrapper.insertChatMessage({ ...messageData, user_id: userId });
      return data as IChatMessage;
    } catch (error) {
      logger.error('Erro ao criar mensagem de chat:', error);
      throw error;
    }
  }

  async getChatMessagesByUser(userId: string): Promise<IChatMessage[]> {
    try {
      const data = await supabaseWrapper.selectChatMessagesByUser(userId);
      return data as IChatMessage[];
    } catch (error) {
      logger.error('Erro ao buscar mensagens de chat:', error);
      throw error;
    }
  }

  // =====================================================
  // ALERTAS
  // =====================================================
  
  async createAlerta(userId: string, alertaData: {
    tipo_alerta: string;
    titulo: string;
    mensagem: string;
    data_alerta: string;
    animal_id?: string;
  }): Promise<IAlerta> {
    try {
      const data = await supabaseWrapper.insertAlerta({ ...alertaData, user_id: userId });
      return data as IAlerta;
    } catch (error) {
      logger.error('Erro ao criar alerta:', error);
      throw error;
    }
  }

  async getAlertasByUser(userId: string): Promise<IAlerta[]> {
    try {
      const data = await supabaseWrapper.selectAlertasByUser(userId);
      return data as IAlerta[];
    } catch (error) {
      logger.error('Erro ao buscar alertas:', error);
      throw error;
    }
  }

  async updateAlerta(alertaId: string, alertaData: any): Promise<IAlerta> {
    try {
      const data = await supabaseWrapper.updateAlerta(alertaId, alertaData);
      return data as IAlerta;
    } catch (error) {
      logger.error('Erro ao atualizar alerta:', error);
      throw error;
    }
  }

  // =====================================================
  // PREÇOS DE MERCADO
  // =====================================================
  
  async getPrecosMercado(): Promise<any[]> {
    try {
      const data = await supabaseWrapper.selectPrecosMercado();
      return data;
    } catch (error) {
      logger.error('Erro ao buscar preços de mercado:', error);
      throw error;
    }
  }

  // =====================================================
  // ESTATÍSTICAS E DASHBOARD
  // =====================================================
  
  async getEstatisticasDashboard(userId: string): Promise<IEstatisticasDashboard> {
    try {
      const stats = await supabaseWrapper.getEstatisticasDashboard(userId);
      return stats as IEstatisticasDashboard;
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
}

export const bovinextSupabaseService = new BovinextSupabaseService();
