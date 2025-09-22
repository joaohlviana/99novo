-- =====================================================
-- OTIMIZAÇÃO DE SLUGS E TRIGGER DE COLISÃO
-- =====================================================
-- Script para otimizar generate_clean_slug e criar trigger de resolução de colisões
-- EXECUTAR APENAS SE NÃO EXISTIR OU PRECISAR OTIMIZAR

-- =====================================================
-- 1. VERIFICAR EXTENSÃO UNACCENT
-- =====================================================
-- Verificar se extensão unaccent está instalada
SELECT * FROM pg_extension WHERE extname = 'unaccent';

-- Se não existir, instalar (descomenta a linha abaixo se necessário):
-- CREATE EXTENSION IF NOT EXISTS unaccent;

-- =====================================================
-- 2. OTIMIZAR FUNÇÃO generate_clean_slug (IMMUTABLE)
-- =====================================================
-- Marca função como IMMUTABLE para otimização do planner

CREATE OR REPLACE FUNCTION generate_clean_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE -- ← OTIMIZAÇÃO: função não usa estado externo, permite cache
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
  
  -- Limita a 50 caracteres (aumenta chance de colisão, mas trigger resolve)
  result := substring(result, 1, 50);
  
  -- Remove hífen final se houver
  result := regexp_replace(result, '-$', '', 'g');
  
  RETURN result;
END;
$$;

-- =====================================================
-- 3. FUNÇÃO PARA RESOLVER COLISÕES DE SLUG
-- =====================================================
-- Função otimizada com guards para performance

CREATE OR REPLACE FUNCTION resolve_slug_collision()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 2;
  slug_exists BOOLEAN;
BEGIN
  -- 🎯 GUARDS: só processar quando necessário
  -- Só trainers + (INSERT ou mudanças relevantes)
  IF NEW.role != 'trainer' THEN
    RETURN NEW;
  END IF;
  
  -- Para UPDATE: só rodar se houve mudança relevante
  IF TG_OP = 'UPDATE' AND 
     NEW.slug IS NOT DISTINCT FROM OLD.slug AND 
     NEW.name IS NOT DISTINCT FROM OLD.name THEN
    RETURN NEW; -- Nada mudou, skip
  END IF;
  
  -- Se não tem slug, gera um baseado no nome
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_clean_slug(NEW.name);
  END IF;
  
  base_slug := NEW.slug;
  final_slug := base_slug;
  
  -- 🎯 VERIFICAR COLISÕES em lower(slug) para alinhar com índice único
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM user_profiles 
      WHERE lower(slug) = lower(final_slug)
      AND role = 'trainer'
      AND (NEW.id IS NULL OR id != NEW.id) -- Excluir o próprio registro
    ) INTO slug_exists;
    
    -- Se não existe, usar este slug
    IF NOT slug_exists THEN
      NEW.slug := final_slug;
      EXIT;
    END IF;
    
    -- Se existe, tentar com sufixo (-2, -3, etc.)
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
    
    -- Evitar loop infinito
    IF counter > 100 THEN
      final_slug := base_slug || '-' || extract(epoch from now())::integer;
      NEW.slug := final_slug;
      RAISE WARNING 'Slug collision limit reached, using timestamp suffix: %', final_slug;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- =====================================================
-- 4. CRIAR TRIGGER OTIMIZADO
-- =====================================================
-- Remove trigger existente se houver
DROP TRIGGER IF EXISTS resolve_slug_collision_trigger ON user_profiles;

-- Cria trigger otimizado com WHEN clause para performance
CREATE TRIGGER resolve_slug_collision_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  WHEN (NEW.role = 'trainer') -- ← WHEN clause evita execução desnecessária
  EXECUTE FUNCTION resolve_slug_collision();

-- =====================================================
-- 5. BACKFILL OPCIONAL - MATERIALIZAR SLUGS
-- =====================================================
-- Materializar slugs em user_profiles.slug (melhora integrações/relatórios)

-- Primeiro, verificar quantos trainers não têm slug
SELECT 
  COUNT(*) as total_trainers,
  COUNT(CASE WHEN slug IS NULL OR slug = '' THEN 1 END) as without_slug,
  COUNT(CASE WHEN slug IS NOT NULL AND slug != '' THEN 1 END) as with_slug
FROM user_profiles 
WHERE role = 'trainer' AND is_active = true;

-- UPDATE seguro em lotes pequenos (evita timeout)
DO $$
DECLARE
  affected_count INTEGER;
  batch_size INTEGER := 50;
  total_updated INTEGER := 0;
BEGIN
  RAISE NOTICE 'Iniciando backfill de slugs para trainers...';
  
  LOOP
    -- Atualizar lote de trainers sem slug
    WITH batch AS (
      SELECT id, name
      FROM user_profiles 
      WHERE role = 'trainer' 
        AND is_active = true 
        AND (slug IS NULL OR slug = '')
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    )
    UPDATE user_profiles 
    SET slug = generate_clean_slug(batch.name),
        updated_at = now()
    FROM batch 
    WHERE user_profiles.id = batch.id;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    total_updated := total_updated + affected_count;
    
    RAISE NOTICE 'Backfill: % trainers atualizados (total: %)', affected_count, total_updated;
    
    -- Se não atualizou nada, terminar
    IF affected_count = 0 THEN
      EXIT;
    END IF;
    
    -- Pequena pausa entre lotes (evita sobrecarregar)
    PERFORM pg_sleep(0.1);
  END LOOP;
  
  RAISE NOTICE 'Backfill concluído: % trainers atualizados no total', total_updated;
END $$;

-- Verificar resultado final
SELECT 
  COUNT(*) as total_trainers,
  COUNT(CASE WHEN slug IS NULL OR slug = '' THEN 1 END) as still_without_slug,
  COUNT(CASE WHEN slug IS NOT NULL AND slug != '' THEN 1 END) as with_slug_now
FROM user_profiles 
WHERE role = 'trainer' AND is_active = true;

-- =====================================================
-- 6. TESTES DE VALIDAÇÃO
-- =====================================================

-- Testar função generate_clean_slug
SELECT 
  'João Silva - Personal Trainer' as input,
  generate_clean_slug('João Silva - Personal Trainer') as output;

-- Testar trigger (será executado automaticamente em INSERT/UPDATE)
-- Verificar se trigger foi criado
SELECT tgname, tgenabled, tgtype 
FROM pg_trigger 
WHERE tgname = 'resolve_slug_collision_trigger' 
  AND tgrelid = 'user_profiles'::regclass;

-- Verificar função como IMMUTABLE
SELECT p.proname, p.provolatile 
FROM pg_proc p 
WHERE p.proname = 'generate_clean_slug';
-- Resultado esperado: provolatile = 'i' (immutable)

-- =====================================================
-- 7. VERIFICAÇÕES FINAIS
-- =====================================================

-- Slugs limpos sem sufixo
SELECT id, name, slug FROM user_profiles 
WHERE role = 'trainer' AND is_active = true 
ORDER BY updated_at DESC 
LIMIT 10;

-- Verificar se view trainers_with_slugs funciona com novos slugs
SELECT COUNT(*) FROM trainers_with_slugs WHERE slug IS NOT NULL;

-- Testar RPC
SELECT * FROM get_trainers_with_slugs_safe(3, 0);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

RAISE NOTICE '✅ Script de otimização de slugs executado com sucesso!';
RAISE NOTICE 'Próximo passo: atualizar os componentes frontend para usar TrainerCardDTO.';