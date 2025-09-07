import { Request, Response } from 'express';
import { Animal } from '../models/Animal';
import { supabaseService } from '../services/SupabaseService';
import logger from '../utils/logger';

export class AnimalController {
  // Criar novo animal
  static async create(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const animalData = {
        ...req.body,
        user_id: userId,
        custo_acumulado: req.body.custo_acumulado || 0,
        status: 'ativo'
      };

      const animal = await Animal.create(animalData);
      
      logger.info(`Animal criado: ${animal.brinco}`, { userId, animalId: animal.id });
      res.status(201).json(animal);
    } catch (error) {
      logger.error('Erro ao criar animal:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar animais do usuário
  static async list(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { status, lote, raca } = req.query;
      let animais = await Animal.findByUser(userId, status as string);

      // Filtros adicionais
      if (lote) {
        animais = animais.filter(animal => animal.lote === lote);
      }
      if (raca) {
        animais = animais.filter(animal => animal.raca === raca);
      }

      res.json(animais);
    } catch (error) {
      logger.error('Erro ao listar animais:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar animal por ID
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const animal = await Animal.findById(id);

      if (!animal) {
        return res.status(404).json({ error: 'Animal não encontrado' });
      }

      res.json(animal);
    } catch (error) {
      logger.error('Erro ao buscar animal:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Atualizar animal
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const animal = await Animal.update(id, updates);
      
      logger.info(`Animal atualizado: ${animal.brinco}`, { animalId: id });
      res.json(animal);
    } catch (error) {
      logger.error('Erro ao atualizar animal:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Deletar animal
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await Animal.delete(id);
      
      logger.info(`Animal deletado`, { animalId: id });
      res.status(204).send();
    } catch (error) {
      logger.error('Erro ao deletar animal:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar por brinco
  static async getByBrinco(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { brinco } = req.params;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const animal = await Animal.findByBrinco(userId, brinco);
      
      if (!animal) {
        return res.status(404).json({ error: 'Animal não encontrado' });
      }

      res.json(animal);
    } catch (error) {
      logger.error('Erro ao buscar animal por brinco:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Animais prontos para venda
  static async getParaVenda(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const pesoMinimo = Number(req.query.peso_minimo) || 450;
      const animais = await Animal.getAnimaisParaVenda(userId, pesoMinimo);

      res.json(animais);
    } catch (error) {
      logger.error('Erro ao buscar animais para venda:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Estatísticas do rebanho
  static async getEstatisticas(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const animais = await Animal.findByUser(userId, 'ativo');
      
      const stats = {
        total: animais.length,
        machos: animais.filter(a => a.sexo === 'macho').length,
        femeas: animais.filter(a => a.sexo === 'femea').length,
        por_raca: animais.reduce((acc, animal) => {
          acc[animal.raca] = (acc[animal.raca] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        peso_medio: animais.reduce((sum, a) => sum + (a.peso_atual || 0), 0) / animais.length,
        prontos_venda: animais.filter(a => a.peso_atual && a.peso_atual >= 450 && a.sexo === 'macho').length
      };

      res.json(stats);
    } catch (error) {
      logger.error('Erro ao calcular estatísticas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
