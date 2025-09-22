-- =====================================================
-- SISTEMA DE SLUGS - FUNÇÕES SQL SIMPLIFICADAS
-- =====================================================
-- Este arquivo contém as funções SQL necessárias para o sistema de slugs
-- CORRIGIDO: resolve_program_slug não acessa tabela users diretamente

-- =====================================================
-- 1. VIEW: programs_with_slugs
-- =====================================================
-- Cria uma view que combina programs com dados básicos do trainer
-- sem depender da tabela users diretamente

CREATE OR REPLACE VIEW programs_with_slugs AS
SELECT 
  tp.id,
  tp.title,
  tp.slug,
  tp.description,
  tp.trainer_id,
  tp.status,
  tp.created_at,
  tp.updated_at,
  tp.program_data,
  -- Dados do trainer via user_profiles
  up.name as trainer_name,
  up.slug as trainer_slug,
  up.profile_data
FROM training_programs tp
INNER JOIN user_profiles up ON tp.trainer_id = up.id
WHERE tp.status IN ('active', 'published')
  AND up.role = 'trainer'
  AND up.is_active = true;

-- =====================================================
-- 2. FUNÇÃO: resolve_trainer_slug
-- =====================================================
-- Resolve slug de trainer retornando dados básicos

CREATE OR REPLACE FUNCTION resolve_trainer_slug(input_slug TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  slug TEXT,
  bio TEXT,
  avatar_url TEXT,
  specialties JSONB,
  location JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.name,
    up.slug,
    COALESCE(up.profile_data->>'bio', '') as bio,
    COALESCE(up.profile_data->>'avatar_url', '') as avatar_url,
    COALESCE(up.profile_data->'specialties', '[]'::jsonb) as specialties,
    COALESCE(up.profile_data->'location', '{}'::jsonb) as location
  FROM user_profiles up
  WHERE up.slug = input_slug
    AND up.role = 'trainer'
    AND up.is_active = true;
END;
$$;

-- =====================================================
-- 3. FUNÇÃO: resolve_sport_slug  
-- =====================================================
-- Resolve slug de sport usando tabela de esportes

CREATE OR REPLACE FUNCTION resolve_sport_slug(input_slug TEXT)
RETURNS TABLE(
  id TEXT,
  name TEXT,
  slug TEXT,
  icon TEXT,
  description TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sport_record RECORD;
BEGIN
  -- Lista hardcoded de esportes com slugs (pode ser expandida)
  FOR sport_record IN 
    SELECT * FROM (
      VALUES
        ('musculacao', 'Musculação', 'musculacao', 'dumbbell', 'Treinamento com pesos e exercícios de força'),
        ('crossfit', 'CrossFit', 'crossfit', 'target', 'Treinamento funcional de alta intensidade'),
        ('yoga', 'Yoga', 'yoga', 'heart', 'Prática de posturas, respiração e meditação'),
        ('pilates', 'Pilates', 'pilates', 'circle', 'Exercícios de fortalecimento do core'),
        ('corrida', 'Corrida', 'corrida', 'zap', 'Treinamento de corrida e resistência'),
        ('natacao', 'Natação', 'natacao', 'waves', 'Treinamento aquático completo'),
        ('boxe', 'Boxe', 'boxe', 'shield', 'Arte marcial e condicionamento físico'),
        ('danca', 'Dança', 'danca', 'music', 'Movimento, ritmo e expressão corporal'),
        ('tenis', 'Tênis', 'tenis', 'circle', 'Esporte de raquete e coordenação'),
        ('futebol', 'Futebol', 'futebol', 'circle', 'O esporte mais popular do Brasil')
    ) AS sports(slug_val, name_val, canonical_slug, icon_val, desc_val)
  LOOP
    IF sport_record.slug_val = input_slug THEN
      id := sport_record.slug_val;
      name := sport_record.name_val;
      slug := sport_record.canonical_slug;
      icon := sport_record.icon_val;
      description := sport_record.desc_val;
      RETURN NEXT;
      RETURN;
    END IF;
  END LOOP;
  
  -- Se não encontrou, retorna vazio
  RETURN;
END;
$$;

-- =====================================================
-- 4. FUNÇÃO: resolve_program_slug_safe
-- =====================================================
-- CORRIGIDA: Resolve slug de program usando apenas programs_with_slugs
-- NÃO acessa tabela users diretamente, evitando erros de permissão

CREATE OR REPLACE FUNCTION resolve_program_slug_safe(input_slug TEXT)
RETURNS TABLE(
  id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  trainer_id UUID,
  trainer_name TEXT,
  trainer_slug TEXT,
  price NUMERIC,
  duration_weeks INTEGER,
  level TEXT,
  delivery_mode TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pws.id,
    pws.title,
    pws.slug,
    COALESCE(pws.description, '') as description,
    pws.trainer_id,
    pws.trainer_name,
    pws.trainer_slug,
    COALESCE((pws.program_data->>'price')::numeric, 0) as price,
    COALESCE((pws.program_data->>'duration_weeks')::integer, 0) as duration_weeks,
    COALESCE(pws.program_data->>'level', 'iniciante') as level,
    COALESCE(pws.program_data->>'delivery_mode', 'online') as delivery_mode
  FROM programs_with_slugs pws
  WHERE pws.slug = input_slug;
END;
$$;

-- =====================================================
-- 5. FUNÇÃO: generate_slug
-- =====================================================
-- Gera slug a partir de texto

CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  result TEXT;
BEGIN
  IF input_text IS NULL OR input_text = '' THEN
    RETURN '';
  END IF;
  
  -- Converte para lowercase e remove acentos
  result := lower(unaccent(input_text));
  
  -- Remove caracteres especiais, mantendo apenas letras, números e espaços
  result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  
  -- Substitui espaços múltiplos por um só
  result := regexp_replace(result, '\s+', ' ', 'g');
  
  -- Substitui espaços por hífens
  result := regexp_replace(result, '\s', '-', 'g');
  
  -- Remove hífens múltiplos
  result := regexp_replace(result, '-+', '-', 'g');
  
  -- Remove hífens do início e fim
  result := regexp_replace(result, '^-+|-+$', '', 'g');
  
  -- Limita a 50 caracteres
  result := substring(result, 1, 50);
  
  -- Remove hífen final se houver
  result := regexp_replace(result, '-$', '', 'g');
  
  RETURN result;
END;
$$;

-- =====================================================
-- 6. FUNÇÃO: ensure_unique_slug
-- =====================================================
-- Garante que o slug seja único na tabela especificada

CREATE OR REPLACE FUNCTION ensure_unique_slug(
  base_slug TEXT,
  table_name TEXT,
  exclude_id UUID DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  final_slug TEXT;
  counter INTEGER := 1;
  query_text TEXT;
  slug_exists BOOLEAN;
BEGIN
  final_slug := base_slug;
  
  LOOP
    -- Constrói query dinamicamente
    query_text := format(
      'SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1 AND ($2 IS NULL OR id != $2))',
      table_name
    );
    
    -- Executa query
    EXECUTE query_text INTO slug_exists USING final_slug, exclude_id;
    
    -- Se não existe, retorna o slug
    IF NOT slug_exists THEN
      RETURN final_slug;
    END IF;
    
    -- Se existe, adiciona contador
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
    
    -- Evita loop infinito
    IF counter > 1000 THEN
      final_slug := base_slug || '-' || extract(epoch from now())::integer;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- =====================================================
-- 7. TRIGGER: auto_generate_trainer_slug
-- =====================================================
-- Gera slug automaticamente para trainers

CREATE OR REPLACE FUNCTION trigger_generate_trainer_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Só gera slug para trainers
  IF NEW.role = 'trainer' AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    NEW.slug := ensure_unique_slug(
      generate_slug(NEW.name),
      'user_profiles',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remove trigger existente se houver
DROP TRIGGER IF EXISTS auto_generate_trainer_slug ON user_profiles;

-- Cria novo trigger
CREATE TRIGGER auto_generate_trainer_slug
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_trainer_slug();

-- =====================================================
-- 8. TRIGGER: auto_generate_program_slug
-- =====================================================
-- Gera slug automaticamente para programs

CREATE OR REPLACE FUNCTION trigger_generate_program_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Gera slug se não existe
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := ensure_unique_slug(
      generate_slug(NEW.title),
      'training_programs',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remove trigger existente se houver
DROP TRIGGER IF EXISTS auto_generate_program_slug ON training_programs;

-- Cria novo trigger
CREATE TRIGGER auto_generate_program_slug
  BEFORE INSERT OR UPDATE ON training_programs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_program_slug();

-- =====================================================
-- 9. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para slugs de user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_slug_role 
ON user_profiles(slug, role) 
WHERE role = 'trainer' AND is_active = true;

-- Índice para slugs de training_programs
CREATE INDEX IF NOT EXISTS idx_training_programs_slug_status 
ON training_programs(slug, status) 
WHERE status IN ('active', 'published');

-- Índice para trainer_id em training_programs
CREATE INDEX IF NOT EXISTS idx_training_programs_trainer_status 
ON training_programs(trainer_id, status) 
WHERE status IN ('active', 'published');

-- =====================================================
-- 10. GRANTS DE PERMISSÃO
-- =====================================================

-- Concede permissões para usuários autenticados
GRANT SELECT ON programs_with_slugs TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_trainer_slug(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_sport_slug(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_program_slug_safe(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_slug(TEXT) TO authenticated;

-- Concede permissões para usuários anônimos (necessário para páginas públicas)
GRANT SELECT ON programs_with_slugs TO anon;
GRANT EXECUTE ON FUNCTION resolve_trainer_slug(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION resolve_sport_slug(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION resolve_program_slug_safe(TEXT) TO anon;

-- =====================================================
-- FIM DO ARQUIVO
-- =====================================================

-- Para aplicar este arquivo:
-- 1. Execute no Supabase SQL Editor
-- 2. Verifique se não há erros de sintaxe
-- 3. Teste as funções individualmente:
--    SELECT * FROM resolve_trainer_slug('algum-slug');
--    SELECT * FROM resolve_sport_slug('musculacao');
--    SELECT * FROM resolve_program_slug_safe('algum-programa-slug');