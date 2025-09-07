import { Request, Response } from 'express';
import { supabaseService } from '../services/SupabaseService';
import logger from '../utils/logger';

export class ManejoController {
  // Criar novo manejo
  static async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const manejoData = {
        ...req.body,
        user_id: userId,
        data_execucao: req.body.data_execucao || new Date().toISOString(),
        status: req.body.status || 'planejado'
      };

      const manejo = await supabaseService.createManejo(manejoData);
      
      logger.info(`Manejo criado: ${manejo.tipo}`, { userId, manejoId: manejo.id });
      res.status(201).json(manejo);
    } catch (error) {
      logger.error('Erro ao criar manejo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar manejos do usuário
  static async list(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { status, tipo, animal_id } = req.query;
      const manejos = await supabaseService.getManejos(userId, {
        status: status as string,
        tipo: tipo as string,
        animal_id: animal_id as string
      });

      res.json(manejos);
    } catch (error) {
      logger.error('Erro ao listar manejos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar manejo por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const manejo = await supabaseService.getManejoById(id);

      if (!manejo) {
        return res.status(404).json({ error: 'Manejo não encontrado' });
      }

      res.json(manejo);
    } catch (error) {
      logger.error('Erro ao buscar manejo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar manejo
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const manejo = await supabaseService.updateManejo(id, updates);
      
      logger.info(`Manejo atualizado: ${manejo.tipo}`, { manejoId: id });
      res.json(manejo);
    } catch (error) {
      logger.error('Erro ao atualizar manejo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Marcar manejo como executado
  static async marcarExecutado(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { observacoes, custo } = req.body;

      const manejo = await supabaseService.updateManejo(id, {
        status: 'executado',
        data_execucao: new Date().toISOString(),
        observacoes,
        custo
      });

      logger.info(`Manejo executado: ${manejo.tipo}`, { manejoId: id });
      res.json(manejo);
    } catch (error) {
      logger.error('Erro ao marcar manejo como executado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Agenda de manejos (próximos 30 dias)
  static async getAgenda(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(hoje.getDate() + 30);

      const manejos = await supabaseService.getManejos(userId, {
        status: 'planejado',
        data_inicio: hoje.toISOString(),
        data_fim: em30Dias.toISOString()
      });

      // Agrupar por data
      const agenda = manejos.reduce((acc, manejo) => {
        const data = manejo.data_prevista?.split('T')[0] || 'sem_data';
        if (!acc[data]) acc[data] = [];
        acc[data].push(manejo);
        return acc;
      }, {} as Record<string, any[]>);

      res.json(agenda);
    } catch (error) {
      logger.error('Erro ao buscar agenda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Estatísticas de manejos
  static async getEstatisticas(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const manejos = await supabaseService.getManejos(userId);
      
      const stats = {
        total: manejos.length,
        planejados: manejos.filter(m => m.status === 'planejado').length,
        executados: manejos.filter(m => m.status === 'executado').length,
        atrasados: manejos.filter(m => {
          if (m.status !== 'planejado' || !m.data_prevista) return false;
          return new Date(m.data_prevista) < new Date();
        }).length,
        por_tipo: manejos.reduce((acc, manejo) => {
          acc[manejo.tipo] = (acc[manejo.tipo] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        custo_total: manejos
          .filter(m => m.status === 'executado' && m.custo)
          .reduce((sum, m) => sum + (m.custo || 0), 0)
      };

      res.json(stats);
    } catch (error) {
      logger.error('Erro ao calcular estatísticas de manejos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar manejo
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await supabaseService.deleteManejo(id);
      
      logger.info(`Manejo deletado`, { manejoId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar manejo:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
