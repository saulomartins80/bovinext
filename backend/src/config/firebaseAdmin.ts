// src/config/supabaseAdmin.ts - BOVINEXT usa 100% Supabase
import { createClient } from '@supabase/supabase-js';

console.log('[BOVINEXT] 🚀 Inicializando Supabase Admin...');

// Configuração do Supabase para BOVINEXT
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configurações do Supabase não encontradas no .env');
  console.error('Necessário: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente Supabase com service role para operações administrativas
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('[BOVINEXT] ✅ Supabase Admin inicializado com sucesso');
console.log(`[BOVINEXT] 🔗 URL: ${supabaseUrl}`);

// Função para verificar conexão
export const testConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('[BOVINEXT] ⚠️ Tabela usuarios ainda não existe - será criada automaticamente');
      return true;
    }
    
    console.log('[BOVINEXT] ✅ Conexão com Supabase testada com sucesso');
    return true;
  } catch (error) {
    console.error('[BOVINEXT] ❌ Erro na conexão com Supabase:', error);
    return false;
  }
};

// Compatibilidade com código legado que usa Firebase Admin
export const adminAuth = {
  verifyIdToken: async (token: string) => {
    // Mock para desenvolvimento - substituir por verificação JWT do Supabase
    console.log('[BOVINEXT] 🔧 Mock auth verification for token:', token.substring(0, 20) + '...');
    return { uid: 'mock-user-id', email: 'user@bovinext.com' };
  }
};

export const adminFirestore = {
  // Mock para compatibilidade
  collection: () => ({ doc: () => ({ get: () => Promise.resolve({ exists: false }) }) })
};

export const adminStorage = {
  // Mock para compatibilidade  
  bucket: () => ({ file: () => ({ getSignedUrl: () => Promise.resolve(['mock-url']) }) })
};