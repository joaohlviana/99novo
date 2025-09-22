-- =============================================
-- FIX TRAINING PROGRAMS PERMISSIONS - CORRECTED
-- =============================================
-- 
-- Script corrigido sem blocos DO aninhados
--
-- =============================================

-- 1. REMOVER POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "training_programs_select_policy" ON training_programs;
DROP POLICY IF EXISTS "training_programs_insert_policy" ON training_programs;
DROP POLICY IF EXISTS "training_programs_update_policy" ON training_programs;
DROP POLICY IF EXISTS "training_programs_delete_policy" ON training_programs;
DROP POLICY IF EXISTS "public_view_published_programs" ON training_programs;
DROP POLICY IF EXISTS "trainers_manage_own_programs" ON training_programs;

-- 2. CRIAR POLÍTICAS SIMPLES
CREATE POLICY "public_view_published_programs" ON training_programs
  FOR SELECT 
  USING (status = 'published');

CREATE POLICY "trainers_manage_own_programs" ON training_programs
  FOR ALL 
  USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT user_id FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'trainer'
    )
  );

-- 3. RECRIAR VIEW SEM REFERÊNCIAS PROBLEMÁTICAS
CREATE OR REPLACE VIEW program_cards_view AS
SELECT 
  tp.id,
  tp.title,
  tp.slug,
  tp.status,
  tp.difficulty_level,
  tp.service_mode,
  tp.price_amount,
  tp.duration_weeks,
  tp.duration_hours,
  
  -- Dados do programa (JSONB)
  tp.program_data->'description' as description,
  tp.program_data->'shortDescription' as short_description,
  tp.program_data->'specialties' as specialties,
  tp.program_data->'primaryGoals' as primary_goals,
  tp.program_data->'media'->>'coverImage' as cover_image,
  
  -- Estatísticas
  0 as avg_rating,
  0 as enrollments_count,
  0 as reviews_count,
  
  -- Dados do treinador
  up.name as trainer_name,
  up.profile_data->>'profilePhoto' as trainer_avatar,
  up.profile_data->'cities' as cities,
  
  -- Metadados
  tp.created_at,
  tp.updated_at,
  1.0 as relevance_score
  
FROM training_programs tp
JOIN user_profiles up ON tp.created_by = up.user_id
WHERE tp.status = 'published'
AND up.role = 'trainer'
AND up.is_active = true;

-- 4. FUNÇÃO PARA BUSCAR PROGRAMAS
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
    pcv.difficulty_level,
    pcv.service_mode,
    pcv.price_amount,
    pcv.duration_weeks,
    pcv.avg_rating,
    pcv.enrollments_count,
    pcv.trainer_name,
    pcv.trainer_avatar,
    pcv.short_description,
    pcv.cover_image,
    pcv.specialties,
    pcv.primary_goals,
    pcv.cities,
    pcv.relevance_score
  FROM program_cards_view pcv
  WHERE 
    (p_specialties IS NULL OR pcv.specialties ?| p_specialties) AND
    (p_goals IS NULL OR pcv.primary_goals ?| p_goals) AND
    (p_cities IS NULL OR pcv.cities ?| p_cities) AND
    (p_difficulty IS NULL OR pcv.difficulty_level = p_difficulty) AND
    (p_max_price IS NULL OR pcv.price_amount <= p_max_price) AND
    (p_service_mode IS NULL OR pcv.service_mode = p_service_mode)
  ORDER BY 
    CASE WHEN p_sort_by = 'price_asc' THEN pcv.price_amount END ASC,
    CASE WHEN p_sort_by = 'price_desc' THEN pcv.price_amount END DESC,
    CASE WHEN p_sort_by = 'rating' THEN pcv.avg_rating END DESC,
    pcv.relevance_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNÇÃO PARA PROGRAMAS EM DESTAQUE
CREATE OR REPLACE FUNCTION get_featured_programs(
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
    pcv.id,
    pcv.title,
    pcv.price_amount,
    pcv.avg_rating,
    pcv.trainer_name,
    pcv.short_description,
    pcv.cover_image,
    pcv.specialties
  FROM program_cards_view pcv
  ORDER BY pcv.avg_rating DESC, pcv.enrollments_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA DETALHES DO PROGRAMA
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
      'status', tp.status,
      'difficulty_level', tp.difficulty_level,
      'service_mode', tp.service_mode,
      'price_amount', tp.price_amount,
      'duration_weeks', tp.duration_weeks,
      'duration_hours', tp.duration_hours,
      'avg_rating', 0,
      'enrollments_count', 0,
      'reviews_count', 0,
      'program_data', tp.program_data
    ) as program_data,
    
    jsonb_build_object(
      'id', up.id,
      'name', up.name,
      'email', up.email,
      'profile_data', up.profile_data,
      'stats', jsonb_build_object(
        'total_programs', 1,
        'avg_rating', 5.0,
        'total_enrollments', 0
      )
    ) as trainer_data
    
  FROM training_programs tp
  JOIN user_profiles up ON tp.created_by = up.user_id
  WHERE tp.id = p_program_id
  AND tp.status = 'published';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. FUNÇÃO PARA PROGRAMAS RELACIONADOS
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
    pcv.avg_rating,
    pcv.trainer_name,
    pcv.cover_image,
    pcv.specialties
  FROM program_cards_view pcv
  WHERE pcv.id != p_program_id
  ORDER BY pcv.avg_rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ATUALIZAR COMENTÁRIOS
COMMENT ON TABLE training_programs IS 'Tabela híbrida para programas de treinamento - dados estruturados + JSONB flexível';
COMMENT ON COLUMN training_programs.program_data IS 'Dados flexíveis do programa em JSONB';