import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseService } from '../../../src/services/SupabaseService';
import { Manejo } from '../../../src/types/bovinext.types';

const supabaseService = new SupabaseService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do manejo é obrigatório' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getManejo(id, res);
      case 'PUT':
        return await updateManejo(id, req, res);
      case 'DELETE':
        return await deleteManejo(id, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getManejo(id: string, res: NextApiResponse) {
  const manejo = await supabaseService.getManejoById(id);
  
  if (!manejo) {
    return res.status(404).json({ error: 'Manejo não encontrado' });
  }

  return res.status(200).json({
    success: true,
    data: manejo
  });
}

async function updateManejo(id: string, req: NextApiRequest, res: NextApiResponse) {
  const updateData: Partial<Manejo> = req.body;

  const manejoAtualizado = await supabaseService.updateManejo(id, updateData);

  return res.status(200).json({
    success: true,
    data: manejoAtualizado,
    message: 'Manejo atualizado com sucesso'
  });
}

async function deleteManejo(id: string, res: NextApiResponse) {
  await supabaseService.deleteManejo(id);

  return res.status(200).json({
    success: true,
    message: 'Manejo removido com sucesso'
  });
}
