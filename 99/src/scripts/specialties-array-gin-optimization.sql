-- =====================================================
-- 🚀 SOLUÇÃO PERFORMÁTICA: ARRAY + ÍNDICE GIN
-- =====================================================
-- Implementa busca otimizada por especialidades usando:
-- - Materialized View com especialidades como text[]
-- - Índice GIN para consultas rápidas
-- - Normalização de dados para performance máxima
-- =====================================================

-- 1) Materialized view com specialties como text[]
CREATE MATERIALIZED VIEW IF NOT EXISTS public.trainers_denormalized_mv AS
SELECT
  t.id,
  t.slug,
  t.name,
  COALESCE(
    t.profile_data->>'profilePhoto',
    t.profile_data->>'avatar',
    t.profile_data->>'profile_photo'
  ) AS avatar,
  -- mantém JSON bruto, útil para inspeção
  COALESCE(t.profile_data->'specialties', '[]'::jsonb) AS specialties_json,
  -- array de strings normalizadas (minúsculas) para filtros e índice
  COALESCE(
    ARRAY(
      SELECT lower(elem)
      FROM jsonb_array_elements_text(t.profile_data->'specialties') AS elem
    ),
    ARRAY[]::text[]
  ) AS specialties_text
FROM public.trainers_with_slugs t
WITH NO DATA; -- cria vazia; vamos popular com refresh

-- 2) Índice GIN para buscas rápidas por especialidades
CREATE INDEX IF NOT EXISTS idx_tr_dn_mv_specialties_text
  ON public.trainers_denormalized_mv
  USING GIN (specialties_text);

-- 3) Primeiro refresh para popular a MV sem bloquear leitores
REFRESH MATERIALIZED VIEW CONCURRENTLY public.trainers_denormalized_mv;

-- =====================================================
-- 📊 VERIFICAÇÃO DA IMPLEMENTAÇÃO
-- =====================================================

-- Verificar estrutura da MV
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'trainers_denormalized_mv' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar índices criados
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'trainers_denormalized_mv' 
  AND schemaname = 'public';

-- Verificar dados populados
SELECT 
  COUNT(*) as total_trainers,
  COUNT(CASE WHEN array_length(specialties_text, 1) > 0 THEN 1 END) as with_specialties,
  AVG(array_length(specialties_text, 1)) as avg_specialties_per_trainer
FROM public.trainers_denormalized_mv;

-- =====================================================
-- 🔍 EXEMPLOS DE CONSULTAS OTIMIZADAS
-- =====================================================

-- contém "crossfit" (interseção com um termo)
SELECT id, name, avatar, specialties_text
FROM public.trainers_denormalized_mv
WHERE specialties_text && ARRAY['crossfit']
LIMIT 5;

-- contém QUALQUER entre os termos (OR implícito por &&)
SELECT id, name, specialties_text
FROM public.trainers_denormalized_mv
WHERE specialties_text && ARRAY['crossfit','musculacao']
LIMIT 5;

-- contém TODOS os termos (AND via @>)
SELECT id, name, specialties_text
FROM public.trainers_denormalized_mv
WHERE specialties_text @> ARRAY['crossfit','funcional']
LIMIT 5;

-- =====================================================
-- 📈 ANÁLISE DE PERFORMANCE
-- =====================================================

-- Explicar plano de execução para verificar uso do índice GIN
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, name 
FROM public.trainers_denormalized_mv 
WHERE specialties_text && ARRAY['crossfit'];

-- Estatísticas do índice
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  most_common_vals,
  most_common_freqs
FROM pg_stats 
WHERE tablename = 'trainers_denormalized_mv' 
  AND attname = 'specialties_text';

-- =====================================================
-- 🔄 REFRESH AUTOMÁTICO (OPCIONAL)
-- =====================================================

-- Função helper para refresh da MV
CREATE OR REPLACE FUNCTION refresh_trainers_denormalized_mv()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Tentar refresh concorrente primeiro
  BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.trainers_denormalized_mv;
    RAISE NOTICE 'Materialized view refreshed successfully (CONCURRENTLY)';
  EXCEPTION
    WHEN OTHERS THEN
      -- Se falhar, fazer refresh normal
      REFRESH MATERIALIZED VIEW public.trainers_denormalized_mv;
      RAISE NOTICE 'Materialized view refreshed successfully (NORMAL)';
  END;
END;
$$;

-- =====================================================
-- 🔧 FUNÇÃO SQL PARA ESTATÍSTICAS
-- =====================================================

-- Função para obter estatísticas das especialidades
CREATE OR REPLACE FUNCTION get_specialties_stats()
RETURNS TABLE(specialty text, count bigint)
LANGUAGE sql
STABLE
AS $
  SELECT 
    unnest(specialties_text) as specialty,
    COUNT(*) as count
  FROM public.trainers_denormalized_mv
  WHERE array_length(specialties_text, 1) > 0
  GROUP BY unnest(specialties_text)
  ORDER BY count DESC, specialty ASC;
$;

-- =====================================================
-- ✅ VALIDAÇÃO FINAL
-- =====================================================

-- Teste final: buscar treinadores com especialidades específicas
WITH search_test AS (
  SELECT 
    'crossfit' as search_term,
    COUNT(*) as results_count
  FROM public.trainers_denormalized_mv 
  WHERE specialties_text && ARRAY['crossfit']
  
  UNION ALL
  
  SELECT 
    'musculacao' as search_term,
    COUNT(*) as results_count
  FROM public.trainers_denormalized_mv 
  WHERE specialties_text && ARRAY['musculacao']
  
  UNION ALL
  
  SELECT 
    'multiple_and' as search_term,
    COUNT(*) as results_count
  FROM public.trainers_denormalized_mv 
  WHERE specialties_text @> ARRAY['crossfit','musculacao']
)
SELECT * FROM search_test;

-- Status final
SELECT 
  'IMPLEMENTATION_STATUS' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'trainers_denormalized_mv' 
        AND table_schema = 'public'
    ) THEN '✅ MV Created'
    ELSE '❌ MV Missing'
  END as mv_status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE indexname = 'idx_tr_dn_mv_specialties_text'
    ) THEN '✅ GIN Index Active'
    ELSE '❌ GIN Index Missing'
  END as index_status,
  (SELECT COUNT(*) FROM public.trainers_denormalized_mv) as records_count;