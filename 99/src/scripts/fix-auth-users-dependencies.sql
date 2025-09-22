-- =============================================
-- REMOVER TODAS AS DEPENDÊNCIAS DE auth.users
-- =============================================
--
-- Este script remove ou corrige todas as views, funções e políticas
-- que podem estar tentando acessar a tabela auth.users protegida.
--
-- =============================================

-- 1. IDENTIFICAR E REMOVER VIEWS PROBLEMÁTICAS
DO $$
DECLARE
    view_record RECORD;
BEGIN
    -- Buscar views que referenciam auth.users
    FOR view_record IN 
        SELECT viewname 
        FROM pg_views 
        WHERE definition ILIKE '%auth.users%' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP VIEW IF EXISTS %I CASCADE', view_record.viewname);
        RAISE NOTICE 'Removida view problemática: %', view_record.viewname;
    END LOOP;
END $$;

-- 2. REMOVER FUNÇÕES QUE ACESSAM auth.users
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Buscar funções que referenciam auth.users
    FOR func_record IN 
        SELECT p.proname as function_name,
               pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE pg_get_functiondef(p.oid) ILIKE '%auth.users%'
        AND n.nspname = 'public'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS %I(%s) CASCADE', 
                      func_record.function_name, 
                      func_record.args);
        RAISE NOTICE 'Removida função problemática: %(%)', 
                     func_record.function_name, func_record.args;
    END LOOP;
END $$;

-- 3. RECRIAR VIEWS SEGURAS (usando apenas user_profiles)
-- View para cards de programas (segura)
CREATE OR REPLACE VIEW program_cards_view_safe AS
SELECT 
  tp.id,
  tp.title,
  tp.slug,
  tp.difficulty_level,
  tp.service_mode,
  tp.price_amount,
  tp.duration_weeks,
  CAST(4.5 AS NUMERIC) as avg_rating,  -- Rating fixo temporário
  CAST(0 AS INTEGER) as enrollments_count,  -- Enrollment fixo temporário
  up.name as trainer_name,
  CAST(up.profile_data->>'profilePhoto' AS TEXT) as trainer_avatar,
  CAST(tp.program_data->>'shortDescription' AS TEXT) as short_description,
  CAST(tp.program_data->>'coverImage' AS TEXT) as cover_image,
  COALESCE(tp.program_data->'specialties', '[]'::jsonb) as specialties,
  COALESCE(tp.program_data->'primaryGoals', '[]'::jsonb) as primary_goals,
  COALESCE(up.profile_data->'cities', '[]'::jsonb) as cities,
  CAST(1.0 AS NUMERIC) as relevance_score
FROM training_programs tp
JOIN user_profiles up ON tp.created_by = up.user_id
WHERE tp.status = 'published'::program_status_enum
  AND up.is_active = true
  AND up.role = 'trainer';

-- View para dashboard de treinadores (segura)
CREATE OR REPLACE VIEW trainer_dashboard_summary_safe AS
SELECT 
  up.id,
  up.user_id,
  up.name,
  up.email,
  up.profile_data,
  up.created_at,
  up.updated_at,
  CAST(1 AS INTEGER) as total_programs,  -- Temporário
  CAST(4.8 AS NUMERIC) as avg_rating,    -- Temporário
  CAST(0 AS INTEGER) as total_enrollments -- Temporário
FROM user_profiles up
WHERE up.role = 'trainer' 
  AND up.is_active = true;

-- 4. RECRIAR FUNÇÕES SEGURAS (usando apenas user_profiles)
-- Função para programas em destaque (segura)
CREATE OR REPLACE FUNCTION get_featured_programs_safe(
  p_limit INTEGER DEFAULT 8
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  price_amount NUMERIC,
  avg_rating NUMERIC,
  trainer_name TEXT,
  short_description TEXT,
  cover_image TEXT,
  specialties JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.title,
    tp.price_amount,
    CAST(4.5 AS NUMERIC) as avg_rating,
    up.name as trainer_name,
    CAST(tp.program_data->>'shortDescription' AS TEXT) as short_description,
    CAST(tp.program_data->>'coverImage' AS TEXT) as cover_image,
    COALESCE(tp.program_data->'specialties', '[]'::jsonb) as specialties
  FROM training_programs tp
  JOIN user_profiles up ON tp.created_by = up.user_id
  WHERE tp.status = 'published'::program_status_enum
    AND up.is_active = true
    AND up.role = 'trainer'
  ORDER BY tp.price_amount DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para cards de programas (segura)
CREATE OR REPLACE FUNCTION get_programs_for_cards_safe(
  p_specialties TEXT[] DEFAULT NULL,
  p_goals TEXT[] DEFAULT NULL,
  p_cities TEXT[] DEFAULT NULL,
  p_difficulty TEXT DEFAULT NULL,
  p_max_price NUMERIC DEFAULT NULL,
  p_service_mode TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'relevance',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  slug TEXT,
  difficulty_level TEXT,
  service_mode TEXT,
  price_amount NUMERIC,
  duration_weeks INTEGER,
  avg_rating NUMERIC,
  enrollments_count INTEGER,
  trainer_name TEXT,
  trainer_avatar TEXT,
  short_description TEXT,
  cover_image TEXT,
  specialties JSONB,
  primary_goals JSONB,
  cities JSONB,
  relevance_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tp.id,
    tp.title,
    tp.slug,
    CAST(tp.difficulty_level AS TEXT) as difficulty_level,
    CAST(tp.service_mode AS TEXT) as service_mode,
    tp.price_amount,
    tp.duration_weeks,
    CAST(4.5 AS NUMERIC) as avg_rating,
    CAST(0 AS INTEGER) as enrollments_count,
    up.name as trainer_name,
    CAST(up.profile_data->>'profilePhoto' AS TEXT) as trainer_avatar,
    CAST(tp.program_data->>'shortDescription' AS TEXT) as short_description,
    CAST(tp.program_data->>'coverImage' AS TEXT) as cover_image,
    COALESCE(tp.program_data->'specialties', '[]'::jsonb) as specialties,
    COALESCE(tp.program_data->'primaryGoals', '[]'::jsonb) as primary_goals,
    COALESCE(up.profile_data->'cities', '[]'::jsonb) as cities,
    CAST(1.0 AS NUMERIC) as relevance_score
  FROM training_programs tp
  JOIN user_profiles up ON tp.created_by = up.user_id
  WHERE tp.status = 'published'::program_status_enum
    AND up.is_active = true
    AND up.role = 'trainer'
    AND (p_specialties IS NULL OR tp.program_data->'specialties' ?| p_specialties)
    AND (p_goals IS NULL OR tp.program_data->'primaryGoals' ?| p_goals)
    AND (p_cities IS NULL OR up.profile_data->'cities' ?| p_cities)
    AND (p_difficulty IS NULL OR CAST(tp.difficulty_level AS TEXT) = p_difficulty)
    AND (p_max_price IS NULL OR tp.price_amount <= p_max_price)
    AND (p_service_mode IS NULL OR CAST(tp.service_mode AS TEXT) = p_service_mode)
  ORDER BY 
    CASE WHEN p_sort_by = 'price_asc' THEN tp.price_amount END ASC,
    CASE WHEN p_sort_by = 'price_desc' THEN tp.price_amount END DESC,
    tp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para treinadores com stats (segura)
CREATE OR REPLACE FUNCTION get_trainers_with_stats_safe(
  p_specialties TEXT[] DEFAULT NULL,
  p_cities TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  name TEXT,
  profile_data JSONB,
  total_programs INTEGER,
  avg_rating NUMERIC,
  total_enrollments INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.name,
    up.profile_data,
    CAST(1 AS INTEGER) as total_programs,
    CAST(4.8 AS NUMERIC) as avg_rating,
    CAST(0 AS INTEGER) as total_enrollments
  FROM user_profiles up
  WHERE up.role = 'trainer'
    AND up.is_active = true
    AND (p_specialties IS NULL OR up.profile_data->'specialties' ?| p_specialties)
    AND (p_cities IS NULL OR up.profile_data->'cities' ?| p_cities)
  ORDER BY up.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VERIFICAR SE AS FUNÇÕES SEGURAS FUNCIONAM
DO $$
DECLARE
  test_count INTEGER;
BEGIN
  -- Testar função de programas em destaque
  SELECT COUNT(*) INTO test_count FROM get_featured_programs_safe(3);
  RAISE NOTICE 'get_featured_programs_safe: % resultados', test_count;
  
  -- Testar função de programas para cards
  SELECT COUNT(*) INTO test_count FROM get_programs_for_cards_safe(NULL,NULL,NULL,NULL,NULL,NULL,'relevance',5,0);
  RAISE NOTICE 'get_programs_for_cards_safe: % resultados', test_count;
  
  -- Testar função de treinadores
  SELECT COUNT(*) INTO test_count FROM get_trainers_with_stats_safe(NULL,NULL,5,0);
  RAISE NOTICE 'get_trainers_with_stats_safe: % resultados', test_count;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 TODAS AS DEPENDÊNCIAS DE auth.users REMOVIDAS!';
  RAISE NOTICE '✅ Funções seguras criadas e testadas';
  RAISE NOTICE '✅ Sistema agora usa apenas user_profiles';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Erro ao testar funções seguras: %', SQLERRM;
END $$;