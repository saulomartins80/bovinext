-- =====================================================
-- BOVINEXT - SCHEMA COMPLETO SUPABASE
-- Plataforma de Gestão Pecuária com IA Especializada
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. USUÁRIOS E FAZENDAS
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    fazenda_nome VARCHAR(255) NOT NULL,
    fazenda_area DECIMAL(10,2), -- hectares
    fazenda_localizacao TEXT,
    tipo_criacao VARCHAR(50), -- 'corte', 'leite', 'misto'
    experiencia_anos INTEGER,
    subscription_plan VARCHAR(50) DEFAULT 'fazendeiro',
    subscription_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ANIMAIS (REBANHO)
-- =====================================================

CREATE TABLE animais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    brinco VARCHAR(50) NOT NULL,
    raca VARCHAR(100) NOT NULL,
    sexo VARCHAR(10) CHECK (sexo IN ('macho', 'femea')),
    data_nascimento DATE,
    peso_nascimento DECIMAL(8,2),
    peso_atual DECIMAL(8,2),
    mae_id UUID REFERENCES animais(id),
    pai_id UUID REFERENCES animais(id),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'vendido', 'morto', 'transferido')),
    lote VARCHAR(100),
    pasto VARCHAR(100),
    categoria VARCHAR(50), -- 'bezerro', 'novilho', 'boi', 'bezerra', 'novilha', 'vaca'
    valor_compra DECIMAL(12,2),
    custo_acumulado DECIMAL(12,2) DEFAULT 0,
    observacoes TEXT,
    foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, brinco)
);

-- =====================================================
-- 3. MANEJOS
-- =====================================================

CREATE TABLE manejos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    tipo_manejo VARCHAR(50) NOT NULL, -- 'vacinacao', 'vermifugacao', 'pesagem', 'reproducao', 'tratamento'
    data_manejo DATE NOT NULL,
    observacoes TEXT,
    custo DECIMAL(10,2),
    veterinario VARCHAR(255),
    produto_usado VARCHAR(255),
    dosagem VARCHAR(100),
    proxima_aplicacao DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. VENDAS
-- =====================================================

CREATE TABLE vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comprador VARCHAR(255) NOT NULL,
    tipo_venda VARCHAR(20) CHECK (tipo_venda IN ('frigorifico', 'leilao', 'direto')),
    peso_total DECIMAL(10,2) NOT NULL,
    preco_arroba DECIMAL(8,2) NOT NULL,
    valor_total DECIMAL(12,2) NOT NULL,
    data_venda DATE NOT NULL,
    data_entrega DATE,
    funrural DECIMAL(10,2),
    icms DECIMAL(10,2),
    outros_impostos DECIMAL(10,2),
    lucro_liquido DECIMAL(12,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento vendas-animais
CREATE TABLE vendas_animais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(venda_id, animal_id)
);

-- =====================================================
-- 5. PRODUÇÃO
-- =====================================================

CREATE TABLE producao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    animal_id UUID REFERENCES animais(id) ON DELETE CASCADE,
    tipo_producao VARCHAR(50) CHECK (tipo_producao IN ('nascimento', 'desmame', 'engorda', 'reproducao')),
    data_producao DATE NOT NULL,
    peso DECIMAL(8,2),
    ganho_medio_diario DECIMAL(6,3), -- GMD em kg/dia
    custo_producao DECIMAL(10,2) NOT NULL,
    receita DECIMAL(10,2),
    margem_lucro DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. METAS
-- =====================================================

CREATE TABLE metas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nome_da_meta VARCHAR(255) NOT NULL,
    descricao TEXT,
    valor_total DECIMAL(12,2) NOT NULL,
    valor_atual DECIMAL(12,2) DEFAULT 0,
    data_conclusao DATE NOT NULL,
    categoria VARCHAR(50) CHECK (categoria IN ('vendas', 'producao', 'reproducao', 'ganho_peso', 'expansao', 'melhoramento')),
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta')),
    unidade VARCHAR(20) DEFAULT 'reais' CHECK (unidade IN ('reais', 'kg', 'cabecas', 'percentual')),
    tipo_animal VARCHAR(50) DEFAULT 'bovino',
    lote_alvo VARCHAR(100),
    concluida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. CHAT MESSAGES (IA CONVERSACIONAL)
-- =====================================================

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    channel VARCHAR(50) DEFAULT 'whatsapp', -- 'whatsapp', 'web', 'mobile'
    phone_number VARCHAR(20),
    media_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context JSONB, -- Contexto da conversa para IA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. PREÇOS DE MERCADO
-- =====================================================

CREATE TABLE precos_mercado (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    data_preco DATE NOT NULL,
    preco_arroba DECIMAL(8,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- 'boi_gordo', 'vaca_gorda', 'novilho'
    regiao VARCHAR(100) NOT NULL,
    fonte VARCHAR(100) NOT NULL, -- 'cepea', 'b3', 'scot'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(data_preco, categoria, regiao, fonte)
);

-- =====================================================
-- 9. ALERTAS E NOTIFICAÇÕES
-- =====================================================

CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tipo_alerta VARCHAR(50) NOT NULL, -- 'vacinacao', 'pesagem', 'mercado', 'reproducao'
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    data_alerta TIMESTAMP WITH TIME ZONE NOT NULL,
    lido BOOLEAN DEFAULT FALSE,
    enviado_whatsapp BOOLEAN DEFAULT FALSE,
    animal_id UUID REFERENCES animais(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Usuários
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);

-- Animais
CREATE INDEX idx_animais_user_id ON animais(user_id);
CREATE INDEX idx_animais_brinco ON animais(user_id, brinco);
CREATE INDEX idx_animais_status ON animais(status);
CREATE INDEX idx_animais_lote ON animais(lote);

-- Manejos
CREATE INDEX idx_manejos_user_id ON manejos(user_id);
CREATE INDEX idx_manejos_animal_id ON manejos(animal_id);
CREATE INDEX idx_manejos_data ON manejos(data_manejo);
CREATE INDEX idx_manejos_tipo ON manejos(tipo_manejo);

-- Vendas
CREATE INDEX idx_vendas_user_id ON vendas(user_id);
CREATE INDEX idx_vendas_data ON vendas(data_venda);

-- Produção
CREATE INDEX idx_producao_user_id ON producao(user_id);
CREATE INDEX idx_producao_animal_id ON producao(animal_id);
CREATE INDEX idx_producao_data ON producao(data_producao);

-- Chat
CREATE INDEX idx_chat_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_timestamp ON chat_messages(timestamp);

-- Alertas
CREATE INDEX idx_alertas_user_id ON alertas(user_id);
CREATE INDEX idx_alertas_data ON alertas(data_alerta);
CREATE INDEX idx_alertas_lido ON alertas(lido);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_animais_updated_at BEFORE UPDATE ON animais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_manejos_updated_at BEFORE UPDATE ON manejos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendas_updated_at BEFORE UPDATE ON vendas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_producao_updated_at BEFORE UPDATE ON producao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON metas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS PARA RELATÓRIOS
-- =====================================================

-- View: Resumo do Rebanho por Usuário
CREATE VIEW vw_resumo_rebanho AS
SELECT 
    u.id as user_id,
    u.fazenda_nome,
    COUNT(a.id) as total_animais,
    COUNT(CASE WHEN a.sexo = 'macho' THEN 1 END) as machos,
    COUNT(CASE WHEN a.sexo = 'femea' THEN 1 END) as femeas,
    COUNT(CASE WHEN a.status = 'ativo' THEN 1 END) as ativos,
    COUNT(CASE WHEN a.status = 'vendido' THEN 1 END) as vendidos,
    AVG(a.peso_atual) as peso_medio,
    SUM(a.custo_acumulado) as custo_total
FROM users u
LEFT JOIN animais a ON u.id = a.user_id
GROUP BY u.id, u.fazenda_nome;

-- View: Performance de Vendas
CREATE VIEW vw_performance_vendas AS
SELECT 
    u.id as user_id,
    u.fazenda_nome,
    DATE_TRUNC('month', v.data_venda) as mes_venda,
    COUNT(v.id) as total_vendas,
    SUM(v.peso_total) as peso_vendido,
    SUM(v.valor_total) as receita_total,
    SUM(v.lucro_liquido) as lucro_total,
    AVG(v.preco_arroba) as preco_medio_arroba
FROM users u
LEFT JOIN vendas v ON u.id = v.user_id
GROUP BY u.id, u.fazenda_nome, DATE_TRUNC('month', v.data_venda);

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE manejos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas_animais ENABLE ROW LEVEL SECURITY;
ALTER TABLE producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários (cada usuário só vê seus dados)
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (firebase_uid = auth.jwt() ->> 'sub');
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (firebase_uid = auth.jwt() ->> 'sub');

-- Políticas para animais
CREATE POLICY "Users can view own animals" ON animais FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can insert own animals" ON animais FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can update own animals" ON animais FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can delete own animals" ON animais FOR DELETE USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

-- Aplicar políticas similares para outras tabelas
CREATE POLICY "Users can manage own manejos" ON manejos FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can manage own vendas" ON vendas FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can manage own producao" ON producao FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can manage own metas" ON metas FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can manage own chat" ON chat_messages FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));
CREATE POLICY "Users can manage own alertas" ON alertas FOR ALL USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.jwt() ->> 'sub'));

-- =====================================================
-- DADOS INICIAIS (SEEDS)
-- =====================================================

-- Inserir preços de mercado iniciais
INSERT INTO precos_mercado (data_preco, preco_arroba, categoria, regiao, fonte) VALUES
('2024-01-15', 280.50, 'boi_gordo', 'SP', 'cepea'),
('2024-01-15', 275.00, 'boi_gordo', 'MS', 'cepea'),
('2024-01-15', 260.00, 'vaca_gorda', 'SP', 'cepea'),
('2024-01-15', 255.00, 'vaca_gorda', 'MS', 'cepea');

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular GMD (Ganho Médio Diário)
CREATE OR REPLACE FUNCTION calcular_gmd(animal_uuid UUID, data_inicial DATE, data_final DATE)
RETURNS DECIMAL AS $$
DECLARE
    peso_inicial DECIMAL;
    peso_final DECIMAL;
    dias INTEGER;
    gmd DECIMAL;
BEGIN
    -- Buscar peso inicial
    SELECT peso INTO peso_inicial 
    FROM producao 
    WHERE animal_id = animal_uuid 
    AND data_producao <= data_inicial 
    ORDER BY data_producao DESC 
    LIMIT 1;
    
    -- Buscar peso final
    SELECT peso INTO peso_final 
    FROM producao 
    WHERE animal_id = animal_uuid 
    AND data_producao <= data_final 
    ORDER BY data_producao DESC 
    LIMIT 1;
    
    -- Calcular dias
    dias := data_final - data_inicial;
    
    -- Calcular GMD
    IF peso_inicial IS NOT NULL AND peso_final IS NOT NULL AND dias > 0 THEN
        gmd := (peso_final - peso_inicial) / dias;
        RETURN gmd;
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON DATABASE postgres IS 'BOVINEXT - Plataforma de Gestão Pecuária com IA Especializada';
COMMENT ON TABLE users IS 'Usuários e informações das fazendas';
COMMENT ON TABLE animais IS 'Rebanho completo com genealogia e histórico';
COMMENT ON TABLE manejos IS 'Atividades de manejo sanitário e produtivo';
COMMENT ON TABLE vendas IS 'Registro de vendas de animais';
COMMENT ON TABLE producao IS 'Dados de produção e performance';
COMMENT ON TABLE metas IS 'Metas e objetivos da fazenda';
COMMENT ON TABLE chat_messages IS 'Histórico de conversas com IA';
COMMENT ON TABLE precos_mercado IS 'Preços de mercado em tempo real';
COMMENT ON TABLE alertas IS 'Sistema de alertas e notificações';
