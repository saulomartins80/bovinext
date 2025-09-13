// =====================================================
// BOVINEXT - CONTROLLER DE PRODUÇÃO
// Gestão produtiva e zootécnica com Supabase
// =====================================================

import { Request, Response } from 'express';
import { bovinextSupabaseService } from '../services/BovinextSupabaseService';
import { bovinextAIService } from '../services/BovinextAIService';
import { IProducaoCreate } from '../types/bovinext-supabase.types';
import logger from '../utils/logger';

export class ProducaoController {

  // =====================================================
  // PRODUÇÃO - CRUD COMPLETO
  // =====================================================

  async createProducao(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const producaoData: IProducaoCreate = req.body;
      
      // Validações básicas
      if (!producaoData.animal_id || !producaoData.tipo) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: animal_id, tipo' 
        });
      }

      const producao = await bovinextSupabaseService.createProducao(userId, producaoData);
      
      logger.info(`Produção registrada: ${producao.tipo} para usuário ${userId}`);
      
      res.status(201).json({
        success: true,
        data: producao,
        message: `📊 Produção de ${producao.tipo} registrada com sucesso!`
      });

    } catch (error: any) {
      logger.error('Erro ao criar produção:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async getProducao(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { animalId, tipo, dataInicio, dataFim } = req.query;
      
      const filters = {
        animalId: animalId as string,
        tipo: tipo as string,
        dataInicio: dataInicio as string,
        dataFim: dataFim as string
      };

      const producoes = await bovinextSupabaseService.getProducaoByUser(userId, filters);
      
      res.json({
        success: true,
        data: producoes,
        total: producoes.length
      });

    } catch (error: any) {
      logger.error('Erro ao buscar produção:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // CONTROLE LEITEIRO
  // =====================================================

  async getControleLeiteiro(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { periodo = '30' } = req.query;
      const diasAtras = Number(periodo);
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - diasAtras);

      const proximasAplicacoes = await bovinextSupabaseService.getManejosByUser(userId, { dataInicio: dataInicio.toISOString() });

      const producoes = await bovinextSupabaseService.getProducaoByUser(userId, {
        tipo: 'leite',
        dataInicio: dataInicio.toISOString()
      });

      // Calcular métricas
      const totalLitros = producoes.reduce((sum, p) => sum + (p.valor || 0), 0);
      const mediaLitrosDia = producoes.length > 0 ? totalLitros / diasAtras : 0;
      const melhorDia = producoes.reduce((max, p) => 
        (p.valor || 0) > (max.valor || 0) ? p : max, producoes[0] || {});

      // Produção por animal
      const producaoPorAnimal = producoes.reduce((acc: any, p) => {
        const animalId = p.animal_id;
        if (!acc[animalId]) {
          acc[animalId] = { total: 0, registros: 0, media: 0 };
        }
        acc[animalId].total += p.quantidade || 0;
        acc[animalId].registros += 1;
        acc[animalId].media = acc[animalId].total / acc[animalId].registros;
        return acc;
      }, {});

      // Tendência (últimos 7 dias vs 7 dias anteriores)
      const ultimos7Dias = producoes.filter(p => {
        const data = new Date(p.data_registro);
        const agora = new Date();
        const diff = agora.getTime() - data.getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      });

      const anteriores7Dias = producoes.filter(p => {
        const data = new Date(p.data_registro);
        const agora = new Date();
        const diff = agora.getTime() - data.getTime();
        return diff > 7 * 24 * 60 * 60 * 1000 && diff <= 14 * 24 * 60 * 60 * 1000;
      });

      const mediaUltimos = ultimos7Dias.reduce((sum, p) => sum + (p.valor || 0), 0) / 7;
      const mediaAnteriores = anteriores7Dias.reduce((sum, p) => sum + (p.valor || 0), 0) / 7;
      const tendencia = mediaUltimos - mediaAnteriores;

      res.json({
        success: true,
        data: {
          resumo: {
            totalLitros,
            mediaLitrosDia,
            melhorDia: melhorDia.valor || 0,
            dataMelhorDia: melhorDia.created_at,
            tendencia: {
              valor: tendencia,
              percentual: mediaAnteriores > 0 ? (tendencia / mediaAnteriores) * 100 : 0,
              status: tendencia > 0 ? 'crescimento' : tendencia < 0 ? 'queda' : 'estável'
            }
          },
          producaoPorAnimal,
          historico: producoes.slice(-30) // Últimos 30 registros
        }
      });

    } catch (error: any) {
      logger.error('Erro ao buscar controle leiteiro:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // CONTROLE DE PESO
  // =====================================================

  async getControlePeso(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { animalId } = req.query;
      
      const filters: any = { tipo: 'peso' };
      if (animalId) filters.animalId = animalId as string;

      const pesagens = await bovinextSupabaseService.getProducaoByUser(userId, filters);

      // Agrupar por animal
      const pesosPorAnimal = pesagens.reduce((acc: any, p) => {
        const id = p.animal_id;
        if (!acc[id]) {
          acc[id] = [];
        }
        acc[id].push({
          data: p.created_at,
          peso: p.valor,
          observacoes: p.observacoes
        });
        return acc;
      }, {});

      // Calcular ganho de peso para cada animal
      Object.keys(pesosPorAnimal).forEach(animalId => {
        const pesos = pesosPorAnimal[animalId].sort((a: any, b: any) => 
          new Date(a.data).getTime() - new Date(b.data).getTime()
        );

        if (pesos.length >= 2) {
          const primeiro = pesos[0];
          const ultimo = pesos[pesos.length - 1];
          const diasEntre = Math.ceil(
            (new Date(ultimo.data).getTime() - new Date(primeiro.data).getTime()) / (1000 * 60 * 60 * 24)
          );
          
          pesosPorAnimal[animalId] = {
            pesagens: pesos,
            ganhoPeso: ultimo.peso - primeiro.peso,
            ganhoDiario: diasEntre > 0 ? (ultimo.peso - primeiro.peso) / diasEntre : 0,
            pesoAtual: ultimo.peso,
            pesoInicial: primeiro.peso
          };
        }
      });

      res.json({
        success: true,
        data: pesosPorAnimal
      });

    } catch (error: any) {
      logger.error('Erro ao buscar controle de peso:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // ANÁLISE ZOOTÉCNICA COM IA
  // =====================================================

  async getAnaliseZootecnica(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { animalId } = req.query;
      
      // Buscar dados de produção
      const producoes = await bovinextSupabaseService.getProducaoByUser(userId, {
        animalId: animalId as string
      });

      // Buscar dados do animal
      const animal = animalId ? await bovinextSupabaseService.getAnimalById(animalId as string) : null;

      if (!animal) {
        return res.status(404).json({ error: 'Animal não encontrado' });
      }

      // Gerar análise com IA (mock por enquanto)
      const analise = {
        animal: animal?.brinco || 'N/A',
        desempenho: 'Bom',
        recomendacoes: ['Manter manejo atual', 'Monitorar peso'],
        tendencia: 'Crescimento'
      };

      res.json({
        success: true,
        data: analise
      });

    } catch (error: any) {
      logger.error('Erro ao gerar análise zootécnica:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // RELATÓRIOS DE PRODUTIVIDADE
  // =====================================================

  async getRelatorioProducao(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { tipoProducao, periodo = '30' } = req.query;
      const diasAtras = Number(periodo);
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - diasAtras);

      const filters: any = { dataInicio: dataInicio.toISOString() };
      if (tipoProducao) filters.tipo = tipoProducao as string;

      const producoes = await bovinextSupabaseService.getProducaoByUser(userId, filters);

      // Métricas gerais
      const totalProducao = producoes.reduce((sum, p) => sum + (p.valor || 0), 0);
      const mediaProducao = producoes.length > 0 ? totalProducao / producoes.length : 0;

      // Produção por tipo
      const producaoPorTipo = producoes.reduce((acc: any, p) => {
        const tipo = p.tipo;
        if (!acc[tipo]) {
          acc[tipo] = { total: 0, registros: 0, media: 0 };
        }
        acc[tipo].total += p.valor || 0;
        acc[tipo].registros += 1;
        acc[tipo].media = acc[tipo].total / acc[tipo].registros;
        return acc;
      }, {});

      // Evolução diária
      const evolucaoDiaria = producoes.reduce((acc: any, p) => {
        const data = new Date(p.created_at).toISOString().split('T')[0];
        if (!acc[data]) {
          acc[data] = { total: 0, registros: 0 };
        }
        acc[data].total += p.valor || 0;
        acc[data].registros += 1;
        return acc;
      }, {});

      // Ranking de animais
      const rankingAnimais = producoes.reduce((acc: any, p) => {
        const animalId = p.animal_id;
        if (!acc[animalId]) {
          acc[animalId] = { total: 0, registros: 0, media: 0 };
        }
        acc[animalId].total += p.quantidade || 0;
        acc[animalId].registros += 1;
        acc[animalId].media = acc[animalId].total / acc[animalId].registros;
        return acc;
      }, {});

      const topAnimais = Object.entries(rankingAnimais)
        .map(([id, dados]: [string, any]) => ({ animalId: id, ...dados }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          resumo: {
            totalProducao,
            mediaProducao,
            totalRegistros: producoes.length,
            periodo: diasAtras
          },
          producaoPorTipo,
          evolucaoDiaria,
          topAnimais,
          detalhes: producoes.slice(-50) // Últimos 50 registros
        }
      });

    } catch (error: any) {
      logger.error('Erro ao gerar relatório de produção:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // METAS DE PRODUÇÃO
  // =====================================================

  async getMetasProducao(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const metas = await bovinextSupabaseService.getMetasByUser(userId);
      const metasProducao = metas.filter(m => m.tipo_meta === 'producao');

      // Para cada meta, calcular progresso
      const metasComProgresso = await Promise.all(
        metasProducao.map(async (meta) => {
          const producoes = await bovinextSupabaseService.getProducaoByUser(userId, {
            tipo: meta.categoria,
            dataInicio: meta.data_inicio,
            dataFim: meta.data_fim
          });

          const valorAtual = producoes.reduce((sum, p) => sum + (p.valor || 0), 0);
          const progresso = meta.valor_meta > 0 ? (valorAtual / meta.valor_meta) * 100 : 0;

          return {
            ...meta,
            valorAtual,
            progresso: Math.min(progresso, 100),
            status: progresso >= 100 ? 'atingida' : progresso >= 80 ? 'próxima' : 'em_andamento'
          };
        })
      );

      res.json({
        success: true,
        data: metasComProgresso
      });

    } catch (error: any) {
      logger.error('Erro ao buscar metas de produção:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

export const producaoController = new ProducaoController();
