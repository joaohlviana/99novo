-- ============================================
-- MIGRAÇÃO: Criar Tabela Híbrida 99_trainer_profile (VERSÃO FINAL CORRIGIDA)
-- ============================================

-- Verificação de ambiente
DO $$
BEGIN
    RAISE NOTICE '🚀 Criando tabela híbrida 99_trainer_profile (VERSÃO FINAL CORRIGIDA)';
    RAISE NOTICE '📅 Data/Hora: %', NOW();
END$$;

BEGIN;

-- ============================================
-- 1. CRIAR TABELA HÍBRIDA 99_trainer_profile
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '99_trainer_profile' AND table_schema = 'public') THEN
        
        CREATE TABLE public."99_trainer_profile" (
            -- Chave primária e referência ao auth.users
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
            
            -- Dados básicos estruturados (para queries frequentes)
            name VARCHAR(255),
            email VARCHAR(255),
            phone VARCHAR(50),
            status VARCHAR(50) DEFAULT 'draft',
            is_active BOOLEAN DEFAULT true,
            is_verified BOOLEAN DEFAULT false,
            
            -- Dados híbridos em JSON (máxima flexibilidade)
            profile_data JSONB NOT NULL DEFAULT '{}',
            
            -- Metadados do sistema
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login_at TIMESTAMP WITH TIME ZONE,
            
            -- Constraints
            CONSTRAINT chk_status CHECK (status IN ('draft', 'active', 'inactive', 'suspended', 'pending_verification'))
        );
        
        RAISE NOTICE '✅ Tabela 99_trainer_profile criada';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela 99_trainer_profile já existe';
    END IF;
END$$;

-- ============================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice GIN para busca em JSON
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = '99_trainer_profile' 
        AND indexname = 'idx_99_trainer_profile_data_gin'
    ) THEN
        CREATE INDEX idx_99_trainer_profile_data_gin 
        ON public."99_trainer_profile" USING GIN (profile_data);
        RAISE NOTICE '✅ Índice GIN criado para profile_data';
    END IF;
END$$;

-- Índices para campos estruturados
DO $$
BEGIN
    -- Índice para user_id (único)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = '99_trainer_profile' 
        AND indexname = 'idx_99_trainer_profile_user_id'
    ) THEN
        CREATE INDEX idx_99_trainer_profile_user_id 
        ON public."99_trainer_profile"(user_id);
        RAISE NOTICE '✅ Índice user_id criado';
    END IF;

    -- Índice para status e is_active
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = '99_trainer_profile' 
        AND indexname = 'idx_99_trainer_profile_status_active'
    ) THEN
        CREATE INDEX idx_99_trainer_profile_status_active 
        ON public."99_trainer_profile"(status, is_active);
        RAISE NOTICE '✅ Índice status_active criado';
    END IF;

    -- Índice para email (para busca)
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = '99_trainer_profile' 
        AND indexname = 'idx_99_trainer_profile_email'
    ) THEN
        CREATE INDEX idx_99_trainer_profile_email 
        ON public."99_trainer_profile"(email);
        RAISE NOTICE '✅ Índice email criado';
    END IF;
END$$;

-- ============================================
-- 3. FUNÇÃO PARA AUTO-UPDATE timestamp
-- ============================================

-- Criar/atualizar função de timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_99_trainer_profile_updated_at'
    ) THEN
        CREATE TRIGGER update_99_trainer_profile_updated_at 
        BEFORE UPDATE ON public."99_trainer_profile"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '✅ Trigger updated_at criado';
    END IF;
END$$;

-- ============================================
-- 4. FUNÇÕES AUXILIARES PARA JSON
-- ============================================

-- Função para buscar trainers por especialidade
CREATE OR REPLACE FUNCTION get_trainers_by_specialty(specialty_name TEXT)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    name VARCHAR,
    email VARCHAR,
    profile_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tp.id,
        tp.user_id,
        tp.name,
        tp.email,
        tp.profile_data
    FROM public."99_trainer_profile" tp
    WHERE tp.is_active = true 
    AND tp.status = 'active'
    AND tp.profile_data->'specialties' ? specialty_name;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar trainers por cidade
CREATE OR REPLACE FUNCTION get_trainers_by_city(city_name TEXT)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    name VARCHAR,
    email VARCHAR,
    profile_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tp.id,
        tp.user_id,
        tp.name,
        tp.email,
        tp.profile_data
    FROM public."99_trainer_profile" tp
    WHERE tp.is_active = true 
    AND tp.status = 'active'
    AND tp.profile_data->'cities' ? city_name;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar trainers por modalidade
CREATE OR REPLACE FUNCTION get_trainers_by_modality(modality_name TEXT)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    name VARCHAR,
    email VARCHAR,
    profile_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tp.id,
        tp.user_id,
        tp.name,
        tp.email,
        tp.profile_data
    FROM public."99_trainer_profile" tp
    WHERE tp.is_active = true 
    AND tp.status = 'active'
    AND tp.profile_data->'modalities' ? modality_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. INSERIR DADOS DE EXEMPLO (CORRIGIDO)
-- ============================================

DO $$
DECLARE
    test_user_id UUID;
    sample_json JSONB;
BEGIN
    -- Verificar se existe algum usuário para criar exemplo
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Criar JSON de exemplo de forma segura
        sample_json := jsonb_build_object(
            'bio', 'Personal trainer especializado em musculação e fitness',
            'phone', '(11) 99999-9999',
            'instagram', 'https://instagram.com/trainer',
            'experienceYears', '3-5',
            'responseTime', '3-horas',  
            'studentsCount', 'moderado',
            'credential', 'CREF 123456-G/SP',
            'specialties', jsonb_build_array('musculacao', 'fitness', 'funcional'),
            'modalities', jsonb_build_array('presencial', 'online'),
            'cities', jsonb_build_array('São Paulo - SP', 'Santos - SP'),
            'address', 'Rua Example, 123',
            'cep', '01234-567',
            'number', '123',
            'complement', 'Apto 45',
            'city', 'São Paulo, SP',
            'universities', jsonb_build_array(),
            'courses', jsonb_build_array(),
            'galleryImages', jsonb_build_array(),
            'stories', jsonb_build_array(),
            'profilePhoto', NULL,
            'completionPercentage', 85,
            'lastUpdated', NOW()::text
        );
        
        -- Inserir perfil de exemplo
        INSERT INTO public."99_trainer_profile" (
            user_id,
            name,
            email,
            status,
            profile_data
        ) VALUES (
            test_user_id,
            'Trainer de Exemplo',
            'trainer@exemplo.com',
            'active',
            sample_json
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE '✅ Dados de exemplo inseridos (se não existiam)';
    ELSE
        RAISE NOTICE 'ℹ️ Nenhum usuário encontrado para criar exemplo';
    END IF;
END$$;

-- ============================================
-- 6. VERIFICAÇÕES FINAIS
-- ============================================

DO $$
DECLARE
    table_exists BOOLEAN;
    profile_count INTEGER;
BEGIN
    -- Verificar se tabela foi criada
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = '99_trainer_profile' AND table_schema = 'public'
    ) INTO table_exists;

    IF table_exists THEN
        -- Contar registros
        SELECT COUNT(*) INTO profile_count FROM public."99_trainer_profile";
        
        RAISE NOTICE '==========================================';
        RAISE NOTICE '📋 RELATÓRIO FINAL - TABELA HÍBRIDA';
        RAISE NOTICE '==========================================';
        RAISE NOTICE '✅ Tabela 99_trainer_profile: CRIADA';
        RAISE NOTICE '✅ Índices GIN: CRIADOS';
        RAISE NOTICE '✅ Triggers: CRIADOS';
        RAISE NOTICE '✅ Funções auxiliares: CRIADAS';
        RAISE NOTICE '📊 Total de perfis: %', profile_count;
        RAISE NOTICE '==========================================';
        RAISE NOTICE '🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!';
    ELSE
        RAISE EXCEPTION 'ERRO: Tabela 99_trainer_profile não foi criada';
    END IF;
END$$;

COMMIT;

-- ============================================
-- 7. INSTRUÇÕES DE USO (CORRIGIDAS)
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 COMO USAR A NOVA TABELA:';
    RAISE NOTICE '';
    RAISE NOTICE '1. ✅ Inserir novo perfil:';
    RAISE NOTICE '   INSERT INTO "99_trainer_profile" (user_id, name, email, profile_data)';
    RAISE NOTICE '   VALUES (''uuid'', ''Nome'', ''email@test.com'', ''{"bio": "exemplo"}'');';
    RAISE NOTICE '';
    RAISE NOTICE '2. ✅ Buscar por especialidade:';
    RAISE NOTICE '   SELECT * FROM get_trainers_by_specialty(''musculacao'');';
    RAISE NOTICE '';
    RAISE NOTICE '3. ✅ Buscar por cidade:';
    RAISE NOTICE '   SELECT * FROM get_trainers_by_city(''São Paulo - SP'');';
    RAISE NOTICE '';
    RAISE NOTICE '4. ✅ Atualizar dados JSON:';
    RAISE NOTICE '   UPDATE "99_trainer_profile" SET profile_data = profile_data || ''{"bio": "nova bio"}''';
    RAISE NOTICE '   WHERE user_id = ''uuid'';';
    RAISE NOTICE '';
    RAISE NOTICE '5. ✅ Buscar trainers ativos:';
    RAISE NOTICE '   SELECT * FROM "99_trainer_profile" WHERE is_active = true AND status = ''active'';';
    RAISE NOTICE '';
END$$;

-- ============================================
-- 8. TESTE RÁPIDO DA ESTRUTURA
-- ============================================

DO $$
DECLARE
    test_count INTEGER;
    json_test JSONB;
BEGIN
    RAISE NOTICE '🧪 EXECUTANDO TESTES DE ESTRUTURA:';
    
    -- Testar se tabela está funcionando
    SELECT COUNT(*) INTO test_count FROM public."99_trainer_profile";
    RAISE NOTICE '✅ Tabela acessível, registros: %', test_count;
    
    -- Testar operações JSON
    json_test := '{"bio": "teste", "specialties": ["teste"], "cities": ["São Paulo"]}'::jsonb;
    RAISE NOTICE '✅ JSON válido criado';
    
    -- Testar índice GIN
    PERFORM * FROM public."99_trainer_profile" WHERE profile_data ? 'bio';
    RAISE NOTICE '✅ Índice GIN funcionando';
    
    RAISE NOTICE '🎉 TODOS OS TESTES PASSARAM!';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ ERRO NO TESTE: %', SQLERRM;
END$$;

/*
==========================================
🎯 EXEMPLO DE ESTRUTURA JSON COMPLETA
==========================================

{
  "bio": "Personal trainer especializado em...",
  "phone": "(11) 99999-9999",
  "instagram": "https://instagram.com/trainer",
  "experienceYears": "3-5",
  "responseTime": "3-horas", 
  "studentsCount": "moderado",
  "credential": "CREF 123456-G/SP",
  "specialties": ["musculacao", "fitness", "funcional"],
  "modalities": ["presencial", "online"],
  "cities": ["São Paulo - SP", "Santos - SP"],
  "address": "Rua Example, 123",
  "cep": "01234-567",
  "number": "123",
  "complement": "Apto 45",
  "city": "São Paulo, SP",
  "universities": [
    {
      "name": "Universidade Example",
      "course": "Educação Física", 
      "year": "2020"
    }
  ],
  "courses": [
    {
      "name": "Personal Trainer",
      "institution": "Instituto Example",
      "year": "2021"
    }
  ],
  "galleryImages": [
    {
      "url": "https://example.com/image1.jpg",
      "description": "Academia",
      "order": 1
    }
  ],
  "stories": [
    {
      "url": "https://example.com/video1.mp4",
      "type": "video",
      "description": "Treino funcional"
    }
  ],
  "profilePhoto": "https://example.com/profile.jpg",
  "completionPercentage": 85,
  "lastUpdated": "2025-01-15T10:30:00Z"
}

==========================================
*/