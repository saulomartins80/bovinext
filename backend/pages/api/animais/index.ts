import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseService } from '../../../src/services/SupabaseService';
import { Animal } from '../../../src/types/bovinext.types';

const supabaseService = new SupabaseService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getAnimais(req, res);
      case 'POST':
        return await createAnimal(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAnimais(req: NextApiRequest, res: NextApiResponse) {
  const { 
    categoria, 
    status, 
    lote, 
    raca, 
    search,
    limit = '50',
    offset = '0'
  } = req.query;

  const filters: any = {};
  if (categoria) filters.categoria = categoria;
  if (status) filters.status = status;
  if (lote) filters.lote = lote;
  if (raca) filters.raca = raca;

  const animais = await supabaseService.getAnimais({
    filters,
    search: search as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string)
  });

  return res.status(200).json({
    success: true,
    data: animais,
    count: animais.length
  });
}

async function createAnimal(req: NextApiRequest, res: NextApiResponse) {
  const animalData: Omit<Animal, 'id'> = req.body;

  // Validação básica
  if (!animalData.brinco || !animalData.categoria || !animalData.peso) {
    return res.status(400).json({
      error: 'Campos obrigatórios: brinco, categoria, peso'
    });
  }

  const novoAnimal = await supabaseService.createAnimal(animalData);

  return res.status(201).json({
    success: true,
    data: novoAnimal,
    message: 'Animal criado com sucesso'
  });
}
