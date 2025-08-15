import { Request, Response } from 'express';
import { Card, Invoice, MileageProgram } from '../models/Card';
import { AuthRequest } from '../core/types/AuthRequest';

export const cardController = {
  // CARTÕES
  async getCards(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      
      const cards = await Card.find({ userId, status: { $ne: 'inactive' } })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        cards
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao buscar cartões:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao buscar cartões',
        details: error.message
      });
    }
  },

  async createCard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const cardData = req.body;

      // ✅ VALIDAÇÃO: Verificar campos obrigatórios
      if (!cardData.name?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Nome do cartão é obrigatório'
        });
      }
      if (!cardData.bank?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Banco/Instituição é obrigatório'
        });
      }
      if (!cardData.program?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Programa de milhas é obrigatório'
        });
      }
      if (!cardData.number?.trim() || cardData.number.length !== 4) {
        return res.status(400).json({
          success: false,
          error: 'Últimos 4 dígitos são obrigatórios'
        });
      }
      if (!cardData.limit || isNaN(Number(cardData.limit)) || Number(cardData.limit) <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Limite deve ser um valor válido maior que zero'
        });
      }

      // Validar se já existe cartão com mesmo número
      const existingCard = await Card.findOne({ 
        userId, 
        number: cardData.number.trim(),
        status: { $ne: 'inactive' }
      });

      if (existingCard) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um cartão com este número'
        });
      }

      const newCard = new Card({
        ...cardData,
        userId,
        name: cardData.name.trim(),
        bank: cardData.bank.trim(),
        program: cardData.program.trim(),
        number: cardData.number.trim(),
        used: cardData.used || 0,
        cashback: cardData.cashback || 0
      });

      await newCard.save();

      res.status(201).json({
        success: true,
        card: newCard
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao criar cartão:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao criar cartão',
        details: error.message
      });
    }
  },

  async updateCard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const updateData = req.body;

      const card = await Card.findOneAndUpdate(
        { _id: id, userId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Cartão não encontrado'
        });
      }

      res.json({
        success: true,
        card
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao atualizar cartão:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao atualizar cartão',
        details: error.message
      });
    }
  },

  async deleteCard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      // Soft delete - apenas marca como inativo
      const card = await Card.findOneAndUpdate(
        { _id: id, userId },
        { $set: { status: 'inactive' } },
        { new: true }
      );

      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Cartão não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Cartão removido com sucesso'
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao remover cartão:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao remover cartão',
        details: error.message
      });
    }
  },

  // FATURAS
  async getInvoices(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { cardId, status } = req.query;

      const filter: any = { userId };
      if (cardId) filter.cardId = cardId;
      if (status) filter.status = status;

      const invoices = await Invoice.find(filter)
        .populate('cardId', 'name bank number')
        .sort({ dueDate: -1 });

      res.json({
        success: true,
        invoices
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao buscar faturas:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao buscar faturas',
        details: error.message
      });
    }
  },

  async createInvoice(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const invoiceData = req.body;

      // Verificar se o cartão pertence ao usuário
      const card = await Card.findOne({ _id: invoiceData.cardId, userId });
      if (!card) {
        return res.status(404).json({
          success: false,
          error: 'Cartão não encontrado'
        });
      }

      const newInvoice = new Invoice({
        ...invoiceData,
        userId
      });

      await newInvoice.save();

      // Atualizar o valor usado no cartão
      if (invoiceData.amount) {
        await Card.findByIdAndUpdate(
          invoiceData.cardId,
          { $inc: { used: invoiceData.amount } }
        );
      }

      const populatedInvoice = await Invoice.findById(newInvoice._id)
        .populate('cardId', 'name bank number');

      res.status(201).json({
        success: true,
        invoice: populatedInvoice
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao criar fatura:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao criar fatura',
        details: error.message
      });
    }
  },

  async updateInvoice(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const updateData = req.body;

      const invoice = await Invoice.findOneAndUpdate(
        { _id: id, userId },
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('cardId', 'name bank number');

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Fatura não encontrada'
        });
      }

      res.json({
        success: true,
        invoice
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao atualizar fatura:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao atualizar fatura',
        details: error.message
      });
    }
  },

  async payInvoice(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const { paymentMethod, amount } = req.body;

      const invoice = await Invoice.findOne({ _id: id, userId });
      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Fatura não encontrada'
        });
      }

      // Atualizar status da fatura
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      invoice.paymentMethod = paymentMethod;
      await invoice.save();

      // Atualizar valor usado no cartão (diminuir)
      await Card.findByIdAndUpdate(
        invoice.cardId,
        { $inc: { used: -amount } }
      );

      const populatedInvoice = await Invoice.findById(invoice._id)
        .populate('cardId', 'name bank number');

      res.json({
        success: true,
        message: 'Fatura paga com sucesso',
        invoice: populatedInvoice
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao pagar fatura:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao pagar fatura',
        details: error.message
      });
    }
  },

  // PROGRAMAS DE MILHAS
  async getMileagePrograms(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      
      const programs = await MileageProgram.find({ userId, status: 'active' })
        .sort({ pointsBalance: -1 });

      res.json({
        success: true,
        programs
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao buscar programas:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao buscar programas de milhas',
        details: error.message
      });
    }
  },

  async createMileageProgram(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const programData = req.body;

      // ✅ VALIDAÇÃO: Verificar campos obrigatórios
      if (!programData.name?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Nome do programa é obrigatório'
        });
      }
      if (!programData.airline?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Companhia aérea é obrigatória'
        });
      }
      if (programData.pointsBalance == null || isNaN(Number(programData.pointsBalance)) || Number(programData.pointsBalance) < 0) {
        return res.status(400).json({
          success: false,
          error: 'Saldo de pontos deve ser um valor válido maior ou igual a zero'
        });
      }
      if (programData.estimatedValue == null || isNaN(Number(programData.estimatedValue)) || Number(programData.estimatedValue) < 0) {
        return res.status(400).json({
          success: false,
          error: 'Valor estimado deve ser um valor válido maior ou igual a zero'
        });
      }

      // Verificar se já existe programa com mesmo nome
      const existingProgram = await MileageProgram.findOne({ 
        userId, 
        name: programData.name.trim(),
        status: 'active'
      });

      if (existingProgram) {
        return res.status(400).json({
          success: false,
          error: 'Já existe um programa com este nome'
        });
      }

      const newProgram = new MileageProgram({
        ...programData,
        userId,
        name: programData.name.trim(),
        airline: programData.airline.trim(),
        pointsBalance: Number(programData.pointsBalance),
        estimatedValue: Number(programData.estimatedValue),
        conversionRate: Number(programData.conversionRate) || 1.0
      });

      await newProgram.save();

      res.status(201).json({
        success: true,
        program: newProgram
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao criar programa:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao criar programa de milhas',
        details: error.message
      });
    }
  },

  async updateMileageProgram(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { id } = req.params;
      const updateData = req.body;

      const program = await MileageProgram.findOneAndUpdate(
        { _id: id, userId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!program) {
        return res.status(404).json({
          success: false,
          error: 'Programa não encontrado'
        });
      }

      res.json({
        success: true,
        program
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao atualizar programa:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao atualizar programa',
        details: error.message
      });
    }
  },

  async deleteMileageProgram(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      const program = await MileageProgram.findOneAndUpdate(
        { _id: id, userId },
        { $set: { status: 'inactive' } },
        { new: true }
      );

      if (!program) {
        return res.status(404).json({
          success: false,
          error: 'Programa não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Programa removido com sucesso'
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao remover programa:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao remover programa',
        details: error.message
      });
    }
  },

  // ANALYTICS
  async getAnalytics(req: AuthRequest, res: Response) {
    try {
      const userId = req.user._id;

      // Buscar dados dos cartões
      const cards = await Card.find({ userId, status: 'active' });
      const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);
      const totalUsed = cards.reduce((sum, card) => sum + card.used, 0);
      const totalCashback = cards.reduce((sum, card) => sum + (card.cashback || 0), 0);

      // Buscar programas de milhas
      const programs = await MileageProgram.find({ userId, status: 'active' });
      const totalPoints = programs.reduce((sum, program) => sum + program.pointsBalance, 0);
      const totalValue = programs.reduce((sum, program) => sum + program.estimatedValue, 0);

      // Buscar faturas pendentes
      const pendingInvoices = await Invoice.find({ 
        userId, 
        status: 'pending',
        dueDate: { $gte: new Date() }
      });
      const totalPendingAmount = pendingInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

      res.json({
        success: true,
        analytics: {
          cards: {
            total: cards.length,
            totalLimit,
            totalUsed,
            utilizationPercentage: totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0,
            totalCashback
          },
          programs: {
            total: programs.length,
            totalPoints,
            totalValue
          },
          invoices: {
            pending: pendingInvoices.length,
            totalPendingAmount
          }
        }
      });
    } catch (error: any) {
      console.error('[cardController] Erro ao buscar analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Falha ao buscar analytics',
        details: error.message
      });
    }
  }
};
