-- =============================================
-- FIX PERMISSION ERRORS - SCRIPT FINAL
-- =============================================
-- Corrige erros de permissão na tabela users e outras tabelas relacionadas

-- 1. Verificar se a tabela client profile existe e criar se necessário
DO $$
BEGIN
    -- Verificar se a tabela "99_client_profile" existe
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_client_profile'
    ) THEN
        RAISE NOTICE '⚠️ Tabela "99_client_profile" não existe. Execute o script de criação primeiro.';
        RAISE NOTICE '📋 Execute: /scripts/99-client-profile-hybrid-FINAL.sql';
    ELSE
        RAISE NOTICE '✅ Tabela "99_client_profile" encontrada.';
    END IF;
END $$;

-- 2. Corrigir políticas RLS para evitar acesso à tabela users
-- Remover políticas que fazem JOIN com auth.users desnecessariamente

-- Policy para trainer_profile que pode estar causando problema
DO $$
BEGIN
    -- Verificar se a tabela trainer_profile existe
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_trainer_profile'
    ) THEN
        -- Atualizar policy problemática se existir
        DROP POLICY IF EXISTS "trainer_profile_trainers_view" ON public."99_trainer_profile";
        
        -- Criar policy segura que não acessa auth.users
        CREATE POLICY "trainer_profile_select_own" ON public."99_trainer_profile"
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
            
        RAISE NOTICE '✅ Políticas RLS do trainer_profile atualizadas.';
    END IF;
END $$;

-- 3. Corrigir políticas da tabela client_profile se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_client_profile'
    ) THEN
        -- Remover policy problemática que acessa trainer_profile
        DROP POLICY IF EXISTS "client_profile_trainers_view" ON public."99_client_profile";
        
        -- Criar policy simples e segura
        CREATE POLICY "client_profile_trainers_view_safe" ON public."99_client_profile"
            FOR SELECT
            TO authenticated
            USING (
                is_active = true 
                AND status = 'active'
            );
            
        RAISE NOTICE '✅ Políticas RLS do client_profile atualizadas.';
    END IF;
END $$;

-- 4. Garantir que service_role tenha acesso total às tabelas principais
DO $$
BEGIN
    -- Grants para 99_trainer_profile
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_trainer_profile'
    ) THEN
        GRANT ALL ON public."99_trainer_profile" TO service_role;
        RAISE NOTICE '✅ Grants para service_role em trainer_profile concedidos.';
    END IF;
    
    -- Grants para 99_client_profile
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_client_profile'
    ) THEN
        GRANT ALL ON public."99_client_profile" TO service_role;
        RAISE NOTICE '✅ Grants para service_role em client_profile concedidos.';
    END IF;
    
    -- Grants para 99_training_programs
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_training_programs'
    ) THEN
        GRANT ALL ON public."99_training_programs" TO service_role;
        RAISE NOTICE '✅ Grants para service_role em training_programs concedidos.';
    END IF;
END $$;

-- 5. Verificar e corrigir RLS nas tabelas principais
DO $$
BEGIN
    -- Garantir que RLS está habilitado nas tabelas principais
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_trainer_profile'
    ) THEN
        ALTER TABLE public."99_trainer_profile" ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_client_profile'
    ) THEN
        ALTER TABLE public."99_client_profile" ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_training_programs'
    ) THEN
        ALTER TABLE public."99_training_programs" ENABLE ROW LEVEL SECURITY;
    END IF;
    
    RAISE NOTICE '✅ RLS habilitado em todas as tabelas principais.';
END $$;

-- 6. Criar políticas de fallback seguras para authenticated users
DO $$
BEGIN
    -- Policy básica para training_programs se não existir
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_training_programs'
    ) THEN
        -- Remover policies problemáticas existentes
        DROP POLICY IF EXISTS "training_programs_select_own" ON public."99_training_programs";
        DROP POLICY IF EXISTS "training_programs_public_view" ON public."99_training_programs";
        
        -- Criar policies seguras
        CREATE POLICY "training_programs_select_own" ON public."99_training_programs"
            FOR SELECT
            TO authenticated
            USING (auth.uid() = trainer_id);
            
        CREATE POLICY "training_programs_public_view" ON public."99_training_programs"
            FOR SELECT
            TO authenticated
            USING (is_published = true);
            
        CREATE POLICY "training_programs_insert_own" ON public."99_training_programs"
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = trainer_id);
            
        CREATE POLICY "training_programs_update_own" ON public."99_training_programs"
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = trainer_id);
            
        RAISE NOTICE '✅ Políticas seguras para training_programs criadas.';
    END IF;
END $$;

-- 7. Criar função alternativa para estatísticas que não acesse auth.users
CREATE OR REPLACE FUNCTION get_safe_trainer_stats(trainer_user_id UUID)
RETURNS TABLE (
    total_programs BIGINT,
    published_programs BIGINT,
    draft_programs BIGINT,
    total_views BIGINT,
    total_inquiries BIGINT,
    total_conversions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_programs,
        COUNT(*) FILTER (WHERE is_published = true) as published_programs,
        COUNT(*) FILTER (WHERE is_published = false OR is_published IS NULL) as draft_programs,
        COALESCE(SUM((program_data->'analytics'->>'views')::integer), 0) as total_views,
        COALESCE(SUM((program_data->'analytics'->>'inquiries')::integer), 0) as total_inquiries,
        COALESCE(SUM((program_data->'analytics'->>'conversions')::integer), 0) as total_conversions
    FROM public."99_training_programs"
    WHERE trainer_id = trainer_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant para authenticated
GRANT EXECUTE ON FUNCTION get_safe_trainer_stats TO authenticated;

-- 8. Criar função segura para busca de clientes compatíveis
CREATE OR REPLACE FUNCTION find_compatible_clients_safe(
    trainer_specialties TEXT[],
    trainer_city TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    client_id UUID,
    compatibility_score NUMERIC,
    matching_sports TEXT[],
    client_goals TEXT[],
    client_level TEXT,
    client_city TEXT
) AS $$
BEGIN
    -- Verificar se a tabela existe
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '99_client_profile'
    ) THEN
        -- Retornar resultado vazio se tabela não existir
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        cp.id as client_id,
        -- Score baseado em esportes em comum
        COALESCE(array_length(ARRAY(
            SELECT sport 
            FROM jsonb_array_elements_text(cp.profile_data->'sportsInterest') sport
            WHERE sport = ANY(trainer_specialties)
        ), 1), 0) * 20.0 as compatibility_score,
        
        -- Esportes em comum
        ARRAY(
            SELECT sport 
            FROM jsonb_array_elements_text(cp.profile_data->'sportsInterest') sport
            WHERE sport = ANY(trainer_specialties)
        ) as matching_sports,
        
        -- Objetivos do cliente
        COALESCE(ARRAY(
            SELECT goal 
            FROM jsonb_array_elements_text(cp.profile_data->'primaryGoals') goal
        ), ARRAY[]::TEXT[]) as client_goals,
        
        COALESCE(cp.profile_data->>'fitnessLevel', '') as client_level,
        COALESCE(cp.profile_data->>'city', '') as client_city
        
    FROM public."99_client_profile" cp
    WHERE 
        cp.is_active = true 
        AND cp.status = 'active'
        AND (trainer_city IS NULL OR cp.profile_data->>'city' = trainer_city)
        AND EXISTS (
            SELECT 1 
            FROM jsonb_array_elements_text(cp.profile_data->'sportsInterest') sport
            WHERE sport = ANY(trainer_specialties)
        )
    ORDER BY compatibility_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant para authenticated
GRANT EXECUTE ON FUNCTION find_compatible_clients_safe TO authenticated;

-- 9. Log de sucesso
DO $$
BEGIN
    RAISE NOTICE '🔧 ===============================================';
    RAISE NOTICE '✅ CORREÇÃO DE PERMISSÕES CONCLUÍDA!';
    RAISE NOTICE '🔧 ===============================================';
    RAISE NOTICE '📋 Políticas RLS atualizadas para evitar acesso à tabela users';
    RAISE NOTICE '🛡️ Funções seguras criadas para estatísticas e compatibilidade';
    RAISE NOTICE '🔑 Grants para service_role configurados';
    RAISE NOTICE '⚡ Sistema pronto para uso sem erros de permissão';
    RAISE NOTICE '🔧 ===============================================';
END $$;