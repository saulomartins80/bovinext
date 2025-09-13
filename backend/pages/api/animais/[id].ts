import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseService } from '../../../src/services/SupabaseService';
import { Animal } from '../../../src/types/bovinext.types';

const supabaseService = new SupabaseService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do animal é obrigatório' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getAnimal(id, res);
      case 'PUT':
        return await updateAnimal(id, req, res);
      case 'DELETE':
        return await deleteAnimal(id, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAnimal(id: string, res: NextApiResponse) {
  const animal = await supabaseService.getAnimalById(id);
  
  if (!animal) {
    return res.status(404).json({ error: 'Animal não encontrado' });
  }

  return res.status(200).json({
    success: true,
    data: animal
  });
}

async function updateAnimal(id: string, req: NextApiRequest, res: NextApiResponse) {
  const updateData: Partial<Animal> = req.body;

  const animalAtualizado = await supabaseService.updateAnimal(id, updateData);

  return res.status(200).json({
    success: true,
    data: animalAtualizado,
    message: 'Animal atualizado com sucesso'
  });
}

async function deleteAnimal(id: string, res: NextApiResponse) {
  await supabaseService.deleteAnimal(id);

  return res.status(200).json({
    success: true,
    message: 'Animal removido com sucesso'
  });
}
