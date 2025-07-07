import axios from 'axios';

const testCors = async () => {
  const backendUrl = 'https://finnextho-backend.onrender.com';
  const frontendUrl = 'https://finnextho-frontend.onrender.com';
  
  console.log('🧪 Testando configuração CORS...');
  console.log(`Backend: ${backendUrl}`);
  console.log(`Frontend: ${frontendUrl}`);
  
  try {
    // Teste 1: Health check
    console.log('\n1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${backendUrl}/health`);
    console.log('✅ Health check OK:', healthResponse.status);
    
    // Teste 2: CORS preflight
    console.log('\n2️⃣ Testando CORS preflight...');
    const corsResponse = await axios.options(`${backendUrl}/api/auth/session`, {
      headers: {
        'Origin': frontendUrl,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization, Content-Type'
      }
    });
    console.log('✅ CORS preflight OK:', corsResponse.status);
    console.log('Headers CORS:', {
      'Access-Control-Allow-Origin': corsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': corsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': corsResponse.headers['access-control-allow-headers'],
      'Access-Control-Allow-Credentials': corsResponse.headers['access-control-allow-credentials']
    });
    
    // Teste 3: Requisição real
    console.log('\n3️⃣ Testando requisição real...');
    const sessionResponse = await axios.get(`${backendUrl}/api/auth/session`, {
      headers: {
        'Origin': frontendUrl,
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Requisição real OK:', sessionResponse.status);
    
  } catch (error: any) {
    console.error('❌ Erro no teste CORS:', {
      message: error.message,
      status: error.response?.status,
      headers: error.response?.headers,
      data: error.response?.data
    });
  }
};

testCors(); 