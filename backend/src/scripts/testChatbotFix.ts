// Script para testar a correção do chatbot
import { ConversationStateService } from '../services/conversationStateService';

async function testChatbotFix() {
  console.log('🧪 Testando correção do chatbot...\n');
  
  const conversationService = ConversationStateService.getInstance();
  
  // Teste 1: Extração de nome da meta
  console.log('📝 Teste 1: Extração de nome da meta');
  const testMessages = [
    'nome da meta seria viagem para gramado',
    'quero criar uma meta chamada comprar um carro',
    'meta seria juntar dinheiro para casa',
    'objetivo é viajar para Europa',
    'sonho é comprar uma casa'
  ];
  
  for (const message of testMessages) {
    const extracted = conversationService.extractFieldValue('meta', message);
    console.log(`Mensagem: "${message}"`);
    console.log(`Extraído: "${extracted}"`);
    console.log('---');
  }
  
  // Teste 2: Extração de valor
  console.log('\n💰 Teste 2: Extração de valor');
  const valueMessages = [
    'quero juntar 5000 reais',
    'valor seria 10000',
    'preciso de R$ 2500',
    'meta de 15000 até dezembro'
  ];
  
  for (const message of valueMessages) {
    const extracted = conversationService.extractFieldValue('valor_total', message);
    console.log(`Mensagem: "${message}"`);
    console.log(`Extraído: ${extracted}`);
    console.log('---');
  }
  
  // Teste 3: Extração de data
  console.log('\n📅 Teste 3: Extração de data');
  const dateMessages = [
    'até setembro de 2025',
    'para 31/12/2025',
    'quando completar 2025-12-31',
    'até o final do ano'
  ];
  
  for (const message of dateMessages) {
    const extracted = conversationService.extractFieldValue('data_conclusao', message);
    console.log(`Mensagem: "${message}"`);
    console.log(`Extraído: ${extracted}`);
    console.log('---');
  }
  
  // Teste 4: Extração múltipla
  console.log('\n🎯 Teste 4: Extração múltipla');
  const complexMessages = [
    'vamos criar uma então juntar 5000 até setembro de 2025 eu tenho 1000 desse valor',
    'meta viagem para gramado valor 3000 até dezembro',
    'quero juntar 10000 para comprar carro até 2025-06-30'
  ];
  
  for (const message of complexMessages) {
    const extracted = conversationService.extractMultipleFields(message, 'CREATE_GOAL');
    console.log(`Mensagem: "${message}"`);
    console.log(`Extraído:`, extracted);
    console.log('---');
  }
  
  // Teste 5: Mensagens que não devem extrair nada
  console.log('\n❌ Teste 5: Mensagens que não devem extrair nada');
  const invalidMessages = [
    'oi',
    'que otimo',
    'voce consegue ver todo o projeto',
    'tenho que confirmar?',
    'o que esta acontecendo?'
  ];
  
  for (const message of invalidMessages) {
    const extracted = conversationService.extractMultipleFields(message, 'CREATE_GOAL');
    console.log(`Mensagem: "${message}"`);
    console.log(`Extraído:`, extracted);
    console.log('---');
  }
  
  console.log('✅ Teste concluído!');
}

// Executar teste
if (require.main === module) {
  testChatbotFix().catch(console.error);
} 