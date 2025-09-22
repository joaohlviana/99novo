-- =============================================
-- FIX PARA PERMISSÕES DO CLIENT PROFILE
-- =============================================
-- Corrigir função SQL que está tentando acessar auth.users

-- 1. Remover função problemática se existir
DROP FUNCTION IF EXISTS find_compatible_clients(TEXT[], TEXT, INTEGER);

-- 2. Recriar função sem acessar tabela users
CREATE OR REPLACE FUNCTION find_compatible_clients(
    trainer_specialties TEXT[],
    trainer_city TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
) RETURNS TABLE (
    client_id UUID,
    compatibility_score NUMERIC,
    matching_sports TEXT[],
    client_goals TEXT[],
    client_level TEXT,
    client_city TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id AS client_id,
        (
            SELECT COUNT(*) 
            FROM jsonb_array_elements_text(cp.profile_data->'sportsInterest') s
            WHERE s = ANY (trainer_specialties)
        )::NUMERIC AS compatibility_score,
        ARRAY(
            SELECT s
            FROM jsonb_array_elements_text(cp.profile_data->'sportsInterest') s
            WHERE s = ANY (trainer_specialties)
        ) AS matching_sports,
        ARRAY(
            SELECT g
            FROM jsonb_array_elements_text(cp.profile_data->'primaryGoals') g
        ) AS client_goals,
        COALESCE(cp.profile_data->>'fitnessLevel', '') AS client_level,
        COALESCE(cp.profile_data->>'city', '') AS client_city
    FROM client_profile cp
    WHERE cp.is_active = true
    AND cp.status = 'active'
    AND (trainer_city IS NULL OR cp.profile_data->>'city' = trainer_city)
    AND jsonb_array_length(cp.profile_data->'sportsInterest') > 0
    ORDER BY compatibility_score DESC
    LIMIT limit_count;
END;
$$;

-- 3. Dar permissão para authenticated users
GRANT EXECUTE ON FUNCTION find_compatible_clients(TEXT[], TEXT, INTEGER) TO authenticated;

-- 4. Verificar se RLS está configurado corretamente na tabela client_profile
ALTER TABLE public.client_profile ENABLE ROW LEVEL SECURITY;

-- 5. Recriar políticas RLS mais permissivas para debug
DROP POLICY IF EXISTS client_profile_select_own ON public.client_profile;
DROP POLICY IF EXISTS client_profile_insert_own ON public.client_profile;
DROP POLICY IF EXISTS client_profile_update_own ON public.client_profile;
DROP POLICY IF EXISTS client_profile_trainers_view ON public.client_profile;

-- Política para ver próprio perfil
CREATE POLICY client_profile_select_own ON public.client_profile
FOR SELECT USING (auth.uid() = user_id);

-- Política para inserir próprio perfil
CREATE POLICY client_profile_insert_own ON public.client_profile
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para atualizar próprio perfil
CREATE POLICY client_profile_update_own ON public.client_profile
FOR UPDATE USING (auth.uid() = user_id);

-- Política para treinadores verem perfis ativos (sem verificar tabela users)
CREATE POLICY client_profile_public_view ON public.client_profile
FOR SELECT USING (
  is_active = true 
  AND status = 'active'
);

-- 6. Verificar se a tabela existe e tem dados de teste
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM client_profile WHERE user_id = auth.uid() LIMIT 1) THEN
        RAISE NOTICE 'Nenhum perfil encontrado para o usuário atual';
    END IF;
END $$;

-- 7. Função de teste para verificar permissões
CREATE OR REPLACE FUNCTION test_client_profile_access()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'current_user', auth.uid(),
        'can_select', (
            SELECT EXISTS(
                SELECT 1 FROM client_profile 
                WHERE user_id = auth.uid() 
                LIMIT 1
            )
        ),
        'table_exists', (
            SELECT EXISTS(
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = 'client_profile'
            )
        ),
        'rls_enabled', (
            SELECT relrowsecurity 
            FROM pg_class 
            WHERE relname = 'client_profile'
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Dar permissão para função de teste
GRANT EXECUTE ON FUNCTION test_client_profile_access() TO authenticated;