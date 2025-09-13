import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseService } from '../../../src/services/SupabaseService';
import { Producao } from '../../../src/types/bovinext.types';

const supabaseService = new SupabaseService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getProducoes(req, res);
      case 'POST':
        return await createProducao(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProducoes(req: NextApiRequest, res: NextApiResponse) {
  const { 
    tipo, 
    animal, 
    dataInicio,
    dataFim,
    gmdMin,
    gmdMax,
    limit = '50',
    offset = '0'
  } = req.query;

  const filters: any = {};
  if (tipo) filters.tipo = tipo;
  if (animal) filters.animal = animal;
  if (dataInicio) filters.dataInicio = new Date(dataInicio as string);
  if (dataFim) filters.dataFim = new Date(dataFim as string);
  if (gmdMin) filters.gmdMin = parseFloat(gmdMin as string);
  if (gmdMax) filters.gmdMax = parseFloat(gmdMax as string);

  const producoes = await supabaseService.getProducoes({
    filters,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });

  return res.status(200).json({
    success: true,
    data: producoes,
    count: producoes.length
  });
}

async function createProducao(req: NextApiRequest, res: NextApiResponse) {
  const producaoData: Omit<Producao, 'id'> = req.body;

  // Validação básica
  if (!producaoData.tipo || !producaoData.animal || !producaoData.data) {
    return res.status(400).json({
      error: 'Campos obrigatórios: tipo, animal, data'
    });
  }

  const novaProducao = await supabaseService.createProducao(producaoData);

  return res.status(201).json({
    success: true,
    data: novaProducao,
    message: 'Produção criada com sucesso'
  });
}
