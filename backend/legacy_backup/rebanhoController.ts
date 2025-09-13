// =====================================================
// BOVINEXT - CONTROLLER DE REBANHO
// Gestão completa de animais com Supabase
// =====================================================

import { Request, Response } from 'express';
import { bovinextSupabaseService } from '../services/BovinextSupabaseService';
import { bovinextAIService } from '../services/BovinextAIService';
import { IAnimalCreate } from '../types/bovinext-supabase.types';
import { logger } from '../utils/logger';

export class RebanhoController {

  // =====================================================
  // ANIMAIS - CRUD COMPLETO
  // =====================================================

  async createAnimal(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const animalData: IAnimalCreate = req.body;
      
      // Validações básicas
      if (!animalData.brinco || !animalData.raca || !animalData.sexo) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: brinco, raca, sexo' 
        });
      }

      const animal = await bovinextSupabaseService.createAnimal(userId, animalData);
      
      logger.info(`Animal criado: ${animal.brinco} para usuário ${userId}`);
      
      res.status(201).json({
        success: true,
        data: animal,
        message: `🐂 Animal ${animal.brinco} cadastrado com sucesso!`
      });

    } catch (error: any) {
      logger.error('Erro ao criar animal:', error);
      
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({
          error: 'Já existe um animal com este brinco'
        });
      }
      
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async getAnimais(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { status, lote, categoria, page = 1, limit = 50 } = req.query;
      
      const filters = {
        status: status as string,
        lote: lote as string,
        categoria: categoria as string
      };

      const animais = await bovinextSupabaseService.getAnimaisByUser(userId, filters);
      
      // Paginação simples
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedAnimais = animais.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedAnimais,
        pagination: {
          total: animais.length,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(animais.length / Number(limit))
        }
      });

    } catch (error: any) {
      logger.error('Erro ao buscar animais:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async getAnimalById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const animal = await bovinextSupabaseService.getAnimalById(id);
      
      if (!animal) {
        return res.status(404).json({ error: 'Animal não encontrado' });
      }

      res.json({
        success: true,
        data: animal
      });

    } catch (error: any) {
      logger.error('Erro ao buscar animal:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async updateAnimal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const animal = await bovinextSupabaseService.updateAnimal(id, updates);
      
      logger.info(`Animal atualizado: ${id}`);
      
      res.json({
        success: true,
        data: animal,
        message: `🐂 Animal ${animal.brinco} atualizado com sucesso!`
      });

    } catch (error: any) {
      logger.error('Erro ao atualizar animal:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async deleteAnimal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const success = await bovinextSupabaseService.deleteAnimal(id);
      
      if (success) {
        logger.info(`Animal deletado: ${id}`);
        res.json({
          success: true,
          message: '🗑️ Animal removido com sucesso!'
        });
      } else {
        res.status(404).json({ error: 'Animal não encontrado' });
      }

    } catch (error: any) {
      logger.error('Erro ao deletar animal:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // ANÁLISE DE IMAGENS (BOVINO VISION)
  // =====================================================

  async analyzeAnimalImage(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { imageUrl, animalId } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ error: 'URL da imagem é obrigatória' });
      }

      const analysis = await bovinextAIService.analyzeAnimalImage(userId, imageUrl, animalId);
      
      res.json({
        success: true,
        data: analysis,
        message: '🔍 Análise Bovino Vision concluída!'
      });

    } catch (error: any) {
      logger.error('Erro na análise de imagem:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // RELATÓRIOS E ESTATÍSTICAS
  // =====================================================

  async getResumoRebanho(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const resumo = await bovinextSupabaseService.getResumoRebanho(userId);
      
      res.json({
        success: true,
        data: resumo
      });

    } catch (error: any) {
      logger.error('Erro ao buscar resumo do rebanho:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async getEstatisticasDashboard(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const estatisticas = await bovinextSupabaseService.getEstatisticasDashboard(userId);
      
      res.json({
        success: true,
        data: estatisticas
      });

    } catch (error: any) {
      logger.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // BUSCA AVANÇADA E FILTROS
  // =====================================================

  async searchAnimais(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { 
        query, 
        raca, 
        sexo, 
        status, 
        lote, 
        categoria,
        pesoMin,
        pesoMax,
        idadeMin,
        idadeMax
      } = req.query;

      // Buscar todos os animais do usuário
      let animais = await bovinextSupabaseService.getAnimaisByUser(userId);

      // Aplicar filtros
      if (query) {
        const searchTerm = (query as string).toLowerCase();
        animais = animais.filter(animal => 
          animal.brinco.toLowerCase().includes(searchTerm) ||
          animal.raca.toLowerCase().includes(searchTerm) ||
          animal.observacoes?.toLowerCase().includes(searchTerm)
        );
      }

      if (raca) {
        animais = animais.filter(animal => animal.raca === raca);
      }

      if (sexo) {
        animais = animais.filter(animal => animal.sexo === sexo);
      }

      if (status) {
        animais = animais.filter(animal => animal.status === status);
      }

      if (lote) {
        animais = animais.filter(animal => animal.lote === lote);
      }

      if (categoria) {
        animais = animais.filter(animal => animal.categoria === categoria);
      }

      if (pesoMin) {
        animais = animais.filter(animal => 
          animal.peso_atual && animal.peso_atual >= Number(pesoMin)
        );
      }

      if (pesoMax) {
        animais = animais.filter(animal => 
          animal.peso_atual && animal.peso_atual <= Number(pesoMax)
        );
      }

      res.json({
        success: true,
        data: animais,
        total: animais.length
      });

    } catch (error: any) {
      logger.error('Erro na busca de animais:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // OPERAÇÕES EM LOTE
  // =====================================================

  async updateAnimaisLote(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { animalIds, updates } = req.body;
      
      if (!animalIds || !Array.isArray(animalIds) || animalIds.length === 0) {
        return res.status(400).json({ error: 'IDs dos animais são obrigatórios' });
      }

      const results = [];
      
      for (const animalId of animalIds) {
        try {
          const animal = await bovinextSupabaseService.updateAnimal(animalId, updates);
          results.push({ id: animalId, success: true, data: animal });
        } catch (error: any) {
          results.push({ id: animalId, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      logger.info(`Atualização em lote: ${successCount}/${animalIds.length} animais atualizados`);
      
      res.json({
        success: true,
        data: results,
        summary: {
          total: animalIds.length,
          success: successCount,
          failed: animalIds.length - successCount
        },
        message: `📊 ${successCount} animais atualizados com sucesso!`
      });

    } catch (error: any) {
      logger.error('Erro na atualização em lote:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // GENEALOGIA
  // =====================================================

  async getGenealogia(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const animal = await bovinextSupabaseService.getAnimalById(id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal não encontrado' });
      }

      const genealogia: any = { animal };

      // Buscar pai e mãe
      if (animal.pai_id) {
        genealogia.pai = await bovinextSupabaseService.getAnimalById(animal.pai_id);
      }

      if (animal.mae_id) {
        genealogia.mae = await bovinextSupabaseService.getAnimalById(animal.mae_id);
      }

      // Buscar filhos
      const animais = await bovinextSupabaseService.getAnimaisByUser(animal.user_id);
      genealogia.filhos = animais.filter(a => 
        a.pai_id === animal.id || a.mae_id === animal.id
      );

      res.json({
        success: true,
        data: genealogia
      });

    } catch (error: any) {
      logger.error('Erro ao buscar genealogia:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

export const rebanhoController = new RebanhoController();
