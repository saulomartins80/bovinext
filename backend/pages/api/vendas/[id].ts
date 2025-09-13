import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseService } from '../../../src/services/SupabaseService';
import { Venda } from '../../../src/types/bovinext.types';

const supabaseService = new SupabaseService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID da venda é obrigatório' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getVenda(id, res);
      case 'PUT':
        return await updateVenda(id, req, res);
      case 'DELETE':
        return await deleteVenda(id, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getVenda(id: string, res: NextApiResponse) {
  const venda = await supabaseService.getVendaById(id);
  
  if (!venda) {
    return res.status(404).json({ error: 'Venda não encontrada' });
  }

  return res.status(200).json({
    success: true,
    data: venda
  });
}

async function updateVenda(id: string, req: NextApiRequest, res: NextApiResponse) {
  const updateData: Partial<Venda> = req.body;

  // Recalcular valores se necessário
  if (updateData.pesoTotal || updateData.precoArroba || updateData.impostos) {
    const vendaAtual = await supabaseService.getVendaById(id);
    if (vendaAtual) {
      const pesoTotal = updateData.pesoTotal || vendaAtual.pesoTotal;
      const precoArroba = updateData.precoArroba || vendaAtual.precoArroba;
      const impostos = updateData.impostos || vendaAtual.impostos;
      
      const valorBruto = (pesoTotal / 15) * precoArroba;
      const totalImpostos = impostos.funrural + impostos.icms + impostos.outros;
      const lucroLiquido = valorBruto - totalImpostos;
      
      updateData.valorTotal = valorBruto;
      updateData.lucroLiquido = lucroLiquido;
    }
  }

  const vendaAtualizada = await supabaseService.updateVenda(id, updateData);

  return res.status(200).json({
    success: true,
    data: vendaAtualizada,
    message: 'Venda atualizada com sucesso'
  });
}

async function deleteVenda(id: string, res: NextApiResponse) {
  await supabaseService.deleteVenda(id);

  return res.status(200).json({
    success: true,
    message: 'Venda removida com sucesso'
  });
}
