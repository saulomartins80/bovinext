import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseService } from '../../../src/services/SupabaseService';
import { Manejo } from '../../../src/types/bovinext.types';

const supabaseService = new SupabaseService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getManejos(req, res);
      case 'POST':
        return await createManejo(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getManejos(req: NextApiRequest, res: NextApiResponse) {
  const { 
    tipo, 
    status, 
    responsavel, 
    dataInicio,
    dataFim,
    search,
    limit = '50',
    offset = '0'
  } = req.query;

  const filters: any = {};
  if (tipo) filters.tipo = tipo;
  if (status) filters.status = status;
  if (responsavel) filters.responsavel = responsavel;
  if (dataInicio) filters.dataInicio = new Date(dataInicio as string);
  if (dataFim) filters.dataFim = new Date(dataFim as string);

  const manejos = await supabaseService.getManejos({
    filters,
    search: search as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });

  return res.status(200).json({
    success: true,
    data: manejos,
    count: manejos.length
  });
}

async function createManejo(req: NextApiRequest, res: NextApiResponse) {
  const manejoData: Omit<Manejo, 'id'> = req.body;

  // Validação básica
  if (!manejoData.tipo || !manejoData.animais || !manejoData.data || !manejoData.responsavel) {
    return res.status(400).json({
      error: 'Campos obrigatórios: tipo, animais, data, responsavel'
    });
  }

  const novoManejo = await supabaseService.createManejo(manejoData);

  return res.status(201).json({
    success: true,
    data: novoManejo,
    message: 'Manejo criado com sucesso'
  });
}
