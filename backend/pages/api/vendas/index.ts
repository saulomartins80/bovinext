import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseService } from '../../../src/services/SupabaseService';

const supabaseService = new SupabaseService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getVendas(req, res);
      case 'POST':
        return await createVenda(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getVendas(req: NextApiRequest, res: NextApiResponse) {
  // Mock data for now - will be replaced with proper user authentication
  const mockVendas = [
    {
      id: '1',
      animais: ['BV001', 'BV002'],
      comprador: 'JBS Frigorífico',
      tipoVenda: 'FRIGORIFICO',
      pesoTotal: 970,
      precoArroba: 315.80,
      valorTotal: 103467,
      dataVenda: new Date('2024-09-15'),
      impostos: { funrural: 2587, icms: 5173, outros: 517 },
      lucroLiquido: 95190,
      status: 'CONFIRMADA'
    }
  ];

  return res.status(200).json({
    success: true,
    data: mockVendas,
    count: mockVendas.length
  });
}

async function createVenda(req: NextApiRequest, res: NextApiResponse) {
  // Mock implementation - will be replaced with proper Supabase integration
  const vendaData = req.body;

  const novaVenda = {
    id: Date.now().toString(),
    ...vendaData,
    status: 'PENDENTE'
  };

  return res.status(201).json({
    success: true,
    data: novaVenda,
    message: 'Venda criada com sucesso'
  });
}
