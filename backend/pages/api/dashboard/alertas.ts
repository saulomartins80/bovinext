import { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseService } from '../../../src/services/SupabaseService';
import { Alerta } from '../../../src/types/bovinext.types';

const supabaseService = new SupabaseService();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const alertas = await generateAlertas();
    
    return res.status(200).json({
      success: true,
      data: alertas
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function generateAlertas(): Promise<Alerta[]> {
  const alertas: Alerta[] = [];
  const hoje = new Date();
  const proximosSete = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Alertas de vacinação próxima
  const manejos = await supabaseService.getManejos({
    filters: {
      tipo: 'VACINACAO',
      status: 'AGENDADO',
      dataInicio: hoje,
      dataFim: proximosSete
    }
  });

  manejos.forEach(manejo => {
    alertas.push({
      id: `vacina_${manejo.id}`,
      tipo: 'VACINACAO',
      prioridade: 'ALTA',
      titulo: 'Vacinação Pendente',
      descricao: `${manejo.animais.length} animais precisam de ${manejo.produto}`,
      dataVencimento: manejo.data,
      animais: manejo.animais,
      status: 'ATIVO',
      acoes: ['Aplicar vacina', 'Reagendar', 'Marcar como concluído']
    });
  });

  // Alertas de pesagem atrasada (animais sem pesagem há mais de 30 dias)
  const animais = await supabaseService.getAnimais({ filters: { status: 'ATIVO' } });
  const animaisSemPesagem = animais.filter(animal => {
    // Mock: assumir que animais sem histórico de peso recente precisam de pesagem
    return Math.random() > 0.8; // 20% dos animais
  });

  if (animaisSemPesagem.length > 0) {
    alertas.push({
      id: 'pesagem_atrasada',
      tipo: 'PESAGEM',
      prioridade: 'MEDIA',
      titulo: 'Pesagem Atrasada',
      descricao: `${animaisSemPesagem.length} animais sem pesagem há mais de 30 dias`,
      dataVencimento: hoje,
      animais: animaisSemPesagem.map(a => a.brinco),
      status: 'ATIVO',
      acoes: ['Agendar pesagem', 'Ver animais']
    });
  }

  // Alertas financeiros - animais com custo alto
  const animaisAltosCustos = animais.filter(animal => animal.custoAcumulado > 1500);
  if (animaisAltosCustos.length > 0) {
    alertas.push({
      id: 'custos_altos',
      tipo: 'FINANCEIRO',
      prioridade: 'MEDIA',
      titulo: 'Custos Elevados',
      descricao: `${animaisAltosCustos.length} animais com custos acima de R$ 1.500`,
      dataVencimento: hoje,
      animais: animaisAltosCustos.map(a => a.brinco),
      status: 'ATIVO',
      acoes: ['Avaliar venda', 'Revisar custos']
    });
  }

  // Alertas de reprodução
  const reproducoes = await supabaseService.getManejos({
    filters: {
      tipo: 'REPRODUCAO',
      status: 'AGENDADO',
      dataInicio: hoje,
      dataFim: proximosSete
    }
  });

  if (reproducoes.length > 0) {
    alertas.push({
      id: 'reproducao_pendente',
      tipo: 'REPRODUCAO',
      prioridade: 'ALTA',
      titulo: 'Manejo Reprodutivo',
      descricao: `${reproducoes.length} atividades reprodutivas agendadas`,
      dataVencimento: reproducoes[0].data,
      status: 'ATIVO',
      acoes: ['Ver agenda', 'Executar manejo']
    });
  }

  return alertas.sort((a, b) => {
    const prioridadeOrder = { 'ALTA': 3, 'MEDIA': 2, 'BAIXA': 1 };
    return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
  });
}
