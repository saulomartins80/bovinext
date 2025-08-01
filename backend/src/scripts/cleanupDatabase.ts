import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function cleanupDatabase(): Promise<void> {
  try {
    console.log('Conectando ao MongoDB...');
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI não configurada');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Não foi possível acessar o banco de dados');
    }
    
    // Listar todos os índices da coleção users
    console.log('📋 Listando índices atuais...');
    const indexes = await db.collection('users').indexes();
    console.log('Índices encontrados:', indexes.map(idx => idx.name));

    // Remover o índice uid_1 se existir
    try {
      await db.collection('users').dropIndex('uid_1');
      console.log('✅ Índice uid_1 removido com sucesso');
    } catch (error: any) {
      if (error.code === 27) {
        console.log('ℹ️ Índice uid_1 não existe, pulando...');
      } else {
        console.error('❌ Erro ao remover índice uid_1:', error.message);
      }
    }

    // Verificar se há documentos com campo uid
    console.log('🔍 Verificando documentos com campo uid...');
    const usersWithUid = await db.collection('users').find({ uid: { $exists: true } }).toArray();
    
    if (usersWithUid.length > 0) {
      console.log(`⚠️ Encontrados ${usersWithUid.length} documentos com campo uid`);
      console.log('Removendo campo uid dos documentos...');
      
      await db.collection('users').updateMany(
        { uid: { $exists: true } },
        { $unset: { uid: "" } }
      );
      console.log('✅ Campo uid removido dos documentos');
    } else {
      console.log('✅ Nenhum documento com campo uid encontrado');
    }

    // Listar índices após limpeza
    console.log('📋 Índices após limpeza:');
    const indexesAfter = await db.collection('users').indexes();
    console.log(indexesAfter.map(idx => idx.name));

    console.log('✅ Limpeza concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  cleanupDatabase();
}

export { cleanupDatabase }; 