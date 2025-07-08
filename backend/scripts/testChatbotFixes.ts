import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Transacoes } from '../src/models/Transacoes';
import { Goal } from '../src/models/Goal';
import Investimento from '../src/models/Investimento';

async function testChatbotFixes() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finnextho');
    console.log('✅ Conectado ao MongoDB');

    // Testar com o usuário dos logs
    const firebaseUid = 'jJOp4uvDcnMXNWeJxaQvLTRHhcC2';
    
    // 1. Buscar usuário
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', {
      firebaseUid: user.firebaseUid,
      mongoId: user._id,
      name: user.name
    });

    // 2. Testar busca de transações com _id do MongoDB
    const transacoes = await Transacoes.find({ userId: user._id.toString() });
    console.log('✅ Transações encontradas:', transacoes.length);
    transacoes.forEach(t => {
      console.log(`  - ${t.descricao}: R$ ${t.valor} (${t.data})`);
    });

    // 3. Testar busca de metas com _id do MongoDB
    const metas = await Goal.find({ userId: user._id.toString() });
    console.log('✅ Metas encontradas:', metas.length);
    metas.forEach(m => {
      console.log(`  - ${m.meta}: R$ ${m.valor_total} (${m.data_conclusao})`);
    });

    // 4. Testar busca de investimentos com _id do MongoDB
    const investimentos = await Investimento.find({ userId: user._id.toString() });
    console.log('✅ Investimentos encontrados:', investimentos.length);
    investimentos.forEach(i => {
      console.log(`  - ${i.nome}: R$ ${i.valor} (${i.tipo})`);
    });

    // 5. Testar busca com firebaseUid (deve retornar vazio)
    const transacoesFirebase = await Transacoes.find({ userId: firebaseUid });
    console.log('❌ Transações com firebaseUid:', transacoesFirebase.length);

    const metasFirebase = await Goal.find({ userId: firebaseUid });
    console.log('❌ Metas com firebaseUid:', metasFirebase.length);

    console.log('\n🎯 RESULTADO DOS TESTES:');
    console.log(`- Transações com _id: ${transacoes.length}`);
    console.log(`- Transações com firebaseUid: ${transacoesFirebase.length}`);
    console.log(`- Metas com _id: ${metas.length}`);
    console.log(`- Metas com firebaseUid: ${metasFirebase.length}`);

    if (transacoes.length > 0 && metas.length > 0) {
      console.log('✅ CORREÇÕES FUNCIONANDO! Os dados agora aparecem corretamente.');
    } else {
      console.log('❌ Ainda há problemas. Verificar logs.');
    }

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar testes
testChatbotFixes(); 