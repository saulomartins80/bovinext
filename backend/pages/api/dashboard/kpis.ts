import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseService } from '../../../src/services/SupabaseService';

const supabaseService = new SupabaseService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kpis = await calculateDashboardKPIs();
    
    return res.status(200).json({
      success: true,
      data: kpis
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function calculateDashboardKPIs() {
  // Buscar dados necessários
  const animais = await supabaseService.getAnimais({ filters: { status: 'ATIVO' } });
  const vendas = await supabaseService.getVendas({ 
    filters: { 
      dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dataFim: new Date()
    } 
  });
  const producoes = await supabaseService.getProducoes({
    filters: {
      dataInicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      dataFim: new Date()
    }
  });
  const manejos = await supabaseService.getManejos({
    filters: {
      status: 'AGENDADO',
      dataInicio: new Date(),
      dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // próximos 7 dias
    }
  });

  // Calcular KPIs
  const totalAnimais = animais.length;
  const receitaMensal = vendas.reduce((acc, venda) => acc + venda.valorTotal, 0);
  const lucroMensal = vendas.reduce((acc, venda) => acc + venda.lucroLiquido, 0);
  const gmdMedio = producoes.length > 0 
    ? producoes.reduce((acc, prod) => acc + (prod.ganhoMedio || 0), 0) / producoes.length 
    : 1.12;
  const alertasAtivos = manejos.length;
  const custoPorCabeca = animais.length > 0 
    ? animais.reduce((acc, animal) => acc + animal.custoAcumulado, 0) / animais.length 
    : 0;
  const margemLucro = receitaMensal > 0 ? (lucroMensal / receitaMensal) * 100 : 0;

  // Preço da arroba (mock - será integrado com CEPEA)
  const precoArroba = 315.80;

  return {
    totalAnimais,
    receitaMensal,
    gmdMedio: Number(gmdMedio.toFixed(2)),
    lucroMensal,
    precoArroba,
    alertasAtivos,
    custoPorCabeca: Number(custoPorCabeca.toFixed(2)),
    margemLucro: Number(margemLucro.toFixed(2)),
    tendencias: {
      animais: calculateTrend('animais'),
      receita: calculateTrend('receita'),
      gmd: calculateTrend('gmd'),
      lucro: calculateTrend('lucro')
    }
  };
}

function calculateTrend(tipo: string): 'ALTA' | 'BAIXA' | 'ESTAVEL' {
  // Mock implementation - será implementado com dados históricos
  const trends = ['ALTA', 'BAIXA', 'ESTAVEL'];
  return trends[Math.floor(Math.random() * trends.length)] as 'ALTA' | 'BAIXA' | 'ESTAVEL';
}
