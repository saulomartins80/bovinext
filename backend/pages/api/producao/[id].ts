import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseService } from '../../../src/services/SupabaseService';
import { Producao } from '../../../src/types/bovinext.types';

const supabaseService = new SupabaseService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID da produção é obrigatório' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getProducao(id, res);
      case 'PUT':
        return await updateProducao(id, req, res);
      case 'DELETE':
        return await deleteProducao(id, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProducao(id: string, res: NextApiResponse) {
  const producao = await supabaseService.getProducaoByUser(id);
  
  if (!producao) {
    return res.status(404).json({ error: 'Produção não encontrada' });
  }

  return res.status(200).json({
    success: true,
    data: producao
  });
}

async function updateProducao(id: string, req: NextApiRequest, res: NextApiResponse) {
  return res.status(501).json({
    error: 'Update producao not implemented yet'
  });
}

async function deleteProducao(id: string, res: NextApiResponse) {
  return res.status(501).json({
    error: 'Delete producao not implemented yet'
  });
}
