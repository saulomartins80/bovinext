// =====================================================
// BOVINEXT - CONTROLLER DE VENDAS
// Gestão comercial e financeira com Supabase
// =====================================================

import { Request, Response } from 'express';
import { bovinextSupabaseService } from '../services/BovinextSupabaseService';
import { bovinextAIService } from '../services/BovinextAIService';
import { IVendaCreate } from '../types/bovinext-supabase.types';
import logger from '../utils/logger';

export class VendasController {

  // =====================================================
  // VENDAS - CRUD COMPLETO
  // =====================================================

  async createVenda(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { vendaData, animaisIds } = req.body;
      
      // Validações básicas
      if (!vendaData.comprador || !vendaData.valor_total || !animaisIds?.length) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: comprador, valor_total, animaisIds' 
        });
      }

      const novaVenda = await bovinextSupabaseService.createVenda(userId, vendaData, animaisIds);
      
      logger.info(`Venda criada: R$ ${novaVenda.valor_total} para usuário ${userId}`);
      
      res.status(201).json({
        success: true,
        data: novaVenda,
        message: `💰 Venda de R$ ${novaVenda.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrada com sucesso!`
      });

    } catch (error: any) {
      logger.error('Erro ao criar venda:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async getVendas(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { page = 1, limit = 20, dataInicio, dataFim, comprador } = req.query;
      
      const filtros = {
        dataInicio: dataInicio as string,
        dataFim: dataFim as string,
        comprador: comprador as string
      };

      const relatorio = await bovinextSupabaseService.getVendasByUser(userId, filtros);
      
      // Paginação
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedVendas = relatorio.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedVendas,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: relatorio.length,
          pages: Math.ceil(relatorio.length / Number(limit))
        }
      });

    } catch (error: any) {
      logger.error('Erro ao buscar vendas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  async getVendaById(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { id } = req.params;
      const venda = await bovinextSupabaseService.getVendaById(id);
      
      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      res.json({
        success: true,
        data: venda
      });

    } catch (error: any) {
      logger.error('Erro ao buscar venda:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // RELATÓRIOS FINANCEIROS
  // =====================================================

  async getRelatorioVendas(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { periodo = 'mes' } = req.query;
      
      const vendas = await bovinextSupabaseService.getVendasByUser(userId, {});
      
      // Calcular métricas
      const valorTotal = vendas.reduce((sum, v) => sum + v.valor_total, 0);
      const quantidadeAnimais = vendas.reduce((sum, v) => sum + (v.quantidade_animais || 0), 0);
      const ticketMedio = vendas.length > 0 ? valorTotal / vendas.length : 0;
      const precoMedioPorCabeca = quantidadeAnimais > 0 ? valorTotal / quantidadeAnimais : 0;

      // Vendas por mês
      const vendasPorMes = vendas.reduce((acc: any, venda) => {
        const mes = new Date(venda.data_venda).toISOString().slice(0, 7);
        if (!acc[mes]) {
          acc[mes] = { valor: 0, quantidade: 0, animais: 0 };
        }
        acc[mes].valor += venda.valor_total;
        acc[mes].quantidade += 1;
        acc[mes].animais += venda.quantidade_animais || 0;
        return acc;
      }, {});

      // Top compradores
      const compradores = vendas.reduce((acc: any, venda) => {
        const comprador = venda.comprador;
        if (!acc[comprador]) {
          acc[comprador] = { valor: 0, quantidade: 0 };
        }
        acc[comprador].valor += venda.valor_total;
        acc[comprador].quantidade += 1;
        return acc;
      }, {});

      const topCompradores = Object.entries(compradores)
        .map(([nome, dados]: [string, any]) => ({ nome, ...dados }))
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 10);

      res.json({
        success: true,
        data: {
          resumo: {
            valorTotal,
            quantidadeVendas: vendas.length,
            quantidadeAnimais,
            ticketMedio,
            precoMedioPorCabeca
          },
          vendasPorMes,
          topCompradores,
          periodo
        }
      });

    } catch (error: any) {
      logger.error('Erro ao gerar relatório de vendas:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // ANÁLISE DE PREÇOS COM IA
  // =====================================================

  async analisarPrecos(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { categoria, peso, idade, sexo } = req.query;
      
      // Buscar vendas similares
      const vendas = await bovinextSupabaseService.getVendasByUser(userId, {});
      
      // Buscar preços de mercado
      const precosMercado = await bovinextSupabaseService.getPrecosMercado();
      
      // Análise de preços com IA (mock)
      const analisePrecos = {
        tendencia: 'estavel',
        recomendacao: 'Preço dentro da média do mercado',
        comparacao_mercado: 'adequado',
        precos_mercado: precosMercado,
        vendas_similares: vendas.slice(0, 5)
      };

      res.json({
        success: true,
        data: analisePrecos
      });

    } catch (error: any) {
      logger.error('Erro ao analisar preços:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // CONTRATOS E DOCUMENTOS
  // =====================================================

  async gerarContrato(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { vendaId } = req.params;
      const venda = await bovinextSupabaseService.getVendaById(vendaId);
      
      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      // Template básico de contrato
      const contrato = {
        numero: `CONT-${venda.id.slice(-8).toUpperCase()}`,
        data: new Date().toLocaleDateString('pt-BR'),
        vendedor: {
          nome: '[NOME DO VENDEDOR]',
          cpf: '[CPF DO VENDEDOR]',
          endereco: '[ENDEREÇO DO VENDEDOR]'
        },
        comprador: {
          nome: venda.comprador,
          cpf: venda.cpf_comprador || '[CPF DO COMPRADOR]',
          endereco: '[ENDEREÇO DO COMPRADOR]'
        },
        objeto: {
          descricao: `Venda de ${venda.quantidade_animais} cabeças de gado`,
          valor: venda.valor_total,
          valorExtenso: '[VALOR POR EXTENSO]'
        },
        condicoes: [
          'O gado será entregue no prazo de 30 dias',
          'O pagamento será realizado conforme acordado',
          'O vendedor garante a sanidade dos animais',
          'Todas as documentações sanitárias serão fornecidas'
        ]
      };

      res.json({
        success: true,
        data: contrato,
        message: '📄 Contrato gerado com sucesso!'
      });

    } catch (error: any) {
      logger.error('Erro ao gerar contrato:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // =====================================================
  // FLUXO DE CAIXA
  // =====================================================

  async getFluxoCaixa(req: Request, res: Response) {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { ano = new Date().getFullYear() } = req.query;
      
      const vendas = await bovinextSupabaseService.getVendasByUser(userId, {
        dataInicio: `${ano}-01-01`,
        dataFim: `${ano}-12-31`
      });

      // Agrupar por mês
      const fluxoPorMes = Array.from({ length: 12 }, (_, i) => {
        const mes = i + 1;
        const vendasDoMes = vendas.filter(v => {
          const mesVenda = new Date(v.data_venda).getMonth() + 1;
          return mesVenda === mes;
        });

        return {
          mes,
          nomeDoMes: new Date(Number(ano), i, 1).toLocaleDateString('pt-BR', { month: 'long' }),
          receita: vendasDoMes.reduce((sum, v) => sum + v.valor_total, 0),
          quantidadeVendas: vendasDoMes.length,
          quantidadeAnimais: vendasDoMes.reduce((sum, v) => sum + (v.quantidade_animais || 0), 0)
        };
      });

      const receitaTotal = fluxoPorMes.reduce((sum, m) => sum + m.receita, 0);

      res.json({
        success: true,
        data: {
          ano: Number(ano),
          receitaTotal,
          fluxoPorMes,
          melhorMes: fluxoPorMes.reduce((max, mes) => mes.receita > max.receita ? mes : max),
          mediaMensal: receitaTotal / 12
        }
      });

    } catch (error: any) {
      logger.error('Erro ao calcular fluxo de caixa:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

export const vendasController = new VendasController();
