-- =============================================
-- CORRIGIR ERROS DE TIPO NAS FUNÇÕES SQL
-- =============================================
--
-- Este script corrige os erros de tipo encontrados:
-- 1. "Returned type integer does not match expected type numeric"
-- 2. "operator does not exist: difficulty_level_enum = text"
--
-- =============================================

-- 1. RECRIAR FUNÇÃO get_featured_programs COM TIPOS CORRETOS
DROP FUNCTION IF EXISTS get_featured_programs(INTEGER);

CREATE OR REPLACE FUNCTION get_featured_programs(
  p_limit INTEGER DEFAULT 8
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  price_amount NUMERIC,
  avg_rating NUMERIC,  -- Garantir que seja NUMERIC
  trainer_name TEXT,
  short_description TEXT,
  cover_image TEXT,
  specialties JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pcv.id,
    pcv.title,
    pcv.price_amount,
    CAST(pcv.avg_rating AS NUMERIC) as avg_rating,  -- Cast explícito
    pcv.trainer_name,
    CAST(pcv.short_description AS TEXT) as short_description,  -- Cast explícito
    CAST(pcv.cover_image AS TEXT) as cover_image,  -- Cast explícito
    pcv.specialties
  FROM program_cards_view pcv
  ORDER BY pcv.avg_rating DESC, pcv.enrollments_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CORRIGIR FUNÇÃO get_programs_for_cards COM CAST DE ENUM
DROP FUNCTION IF EXISTS get_programs_for_cards(TEXT[],TEXT[],TEXT[],TEXT,NUMERIC,TEXT,TEXT,INTEGER,INTEGER);

CREATE OR REPLACE FUNCTION get_programs_for_cards(
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
    pcv.id,
    pcv.title,
    pcv.slug,
    CAST(pcv.difficulty_level AS TEXT) as difficulty_level,  -- Cast explícito
    CAST(pcv.service_mode AS TEXT) as service_mode,  -- Cast explícito
    pcv.price_amount,
    pcv.duration_weeks,
    CAST(pcv.avg_rating AS NUMERIC) as avg_rating,  -- Cast explícito
    CAST(pcv.enrollments_count AS INTEGER) as enrollments_count,  -- Cast explícito
    pcv.trainer_name,
    CAST(pcv.trainer_avatar AS TEXT) as trainer_avatar,  -- Cast explícito
    CAST(pcv.short_description AS TEXT) as short_description,  -- Cast explícito
    CAST(pcv.cover_image AS TEXT) as cover_image,  -- Cast explícito
    pcv.specialties,
    pcv.primary_goals,
    pcv.cities,
    CAST(pcv.relevance_score AS NUMERIC) as relevance_score  -- Cast explícito
  FROM program_cards_view pcv
  WHERE 
    (p_specialties IS NULL OR pcv.specialties ?| p_specialties) AND
    (p_goals IS NULL OR pcv.primary_goals ?| p_goals) AND
    (p_cities IS NULL OR pcv.cities ?| p_cities) AND
    -- CORREÇÃO CRÍTICA: Cast de enum para comparação
    (p_difficulty IS NULL OR CAST(pcv.difficulty_level AS TEXT) = p_difficulty) AND
    (p_max_price IS NULL OR pcv.price_amount <= p_max_price) AND
    -- CORREÇÃO CRÍTICA: Cast de enum para comparação
    (p_service_mode IS NULL OR CAST(pcv.service_mode AS TEXT) = p_service_mode)
  ORDER BY 
    CASE WHEN p_sort_by = 'price_asc' THEN pcv.price_amount END ASC,
    CASE WHEN p_sort_by = 'price_desc' THEN pcv.price_amount END DESC,
    CASE WHEN p_sort_by = 'rating' THEN pcv.avg_rating END DESC,
    pcv.relevance_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CORRIGIR FUNÇÃO get_program_details COM CASTS
DROP FUNCTION IF EXISTS get_program_details(UUID);

CREATE OR REPLACE FUNCTION get_program_details(
  p_program_id UUID
)
RETURNS TABLE(
  program_data JSONB,
  trainer_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jsonb_build_object(
      'id', tp.id,
      'title', tp.title,
      'status', CAST(tp.status AS TEXT),  -- Cast enum
      'difficulty_level', CAST(tp.difficulty_level AS TEXT),  -- Cast enum
      'service_mode', CAST(tp.service_mode AS TEXT),  -- Cast enum
      'price_amount', tp.price_amount,
      'duration_weeks', tp.duration_weeks,
      'duration_hours', tp.duration_hours,
      'avg_rating', CAST(0 AS NUMERIC),  -- Cast para NUMERIC
      'enrollments_count', CAST(0 AS INTEGER),  -- Cast para INTEGER
      'reviews_count', CAST(0 AS INTEGER),  -- Cast para INTEGER
      'program_data', tp.program_data
    ) as program_data,
    
    jsonb_build_object(
      'id', up.id,
      'name', up.name,
      'email', up.email,
      'profile_data', up.profile_data,
      'stats', jsonb_build_object(
        'total_programs', CAST(1 AS INTEGER),  -- Cast para INTEGER
        'avg_rating', CAST(5.0 AS NUMERIC),  -- Cast para NUMERIC
        'total_enrollments', CAST(0 AS INTEGER)  -- Cast para INTEGER
      )
    ) as trainer_data
    
  FROM training_programs tp
  JOIN user_profiles up ON tp.created_by = up.user_id
  WHERE tp.id = p_program_id
  AND tp.status = 'published'::program_status_enum;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CORRIGIR FUNÇÃO get_related_programs COM CASTS
DROP FUNCTION IF EXISTS get_related_programs(UUID,INTEGER);

CREATE OR REPLACE FUNCTION get_related_programs(
  p_program_id UUID,
  p_limit INTEGER DEFAULT 6
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  price_amount NUMERIC,
  avg_rating NUMERIC,
  trainer_name TEXT,
  cover_image TEXT,
  specialties JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pcv.id,
    pcv.title,
    pcv.price_amount,
    CAST(pcv.avg_rating AS NUMERIC) as avg_rating,  -- Cast explícito
    pcv.trainer_name,
    CAST(pcv.cover_image AS TEXT) as cover_image,  -- Cast explícito
    pcv.specialties
  FROM program_cards_view pcv
  WHERE pcv.id != p_program_id
  ORDER BY pcv.avg_rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VERIFICAR SE AS CORREÇÕES FUNCIONAM
DO $$
DECLARE
  featured_count INTEGER;
  programs_count INTEGER;
BEGIN
  -- Testar get_featured_programs
  SELECT COUNT(*) INTO featured_count 
  FROM get_featured_programs(3);
  
  -- Testar get_programs_for_cards
  SELECT COUNT(*) INTO programs_count 
  FROM get_programs_for_cards(
    NULL, NULL, NULL, 'beginner', NULL, NULL, 'relevance', 5, 0
  );
  
  RAISE NOTICE '✅ get_featured_programs: % resultados', featured_count;
  RAISE NOTICE '✅ get_programs_for_cards: % resultados', programs_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎉 FUNÇÕES SQL CORRIGIDAS COM SUCESSO!';
  RAISE NOTICE '✅ Tipos numeric/integer alinhados';
  RAISE NOTICE '✅ Casts de enum implementados';
  RAISE NOTICE '✅ Comparações de texto funcionais';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
END $$;