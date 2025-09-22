-- ========================================
-- VERIFICAÇÃO DA ESTRUTURA JSONB
-- ========================================

-- IMPORTANTE: Execute este script no Supabase SQL Editor para verificar a estrutura

-- 1. Verificar se a tabela 99_training_programs existe
SELECT 
  table_name,
  table_schema,
  table_type
FROM information_schema.tables 
WHERE table_name = '99_training_programs';

-- 2. Verificar colunas da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = '99_training_programs'
ORDER BY ordinal_position;

-- 3. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = '99_training_programs';

-- 4. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = '99_training_programs';

-- 5. Verificar se há dados de exemplo na tabela
SELECT 
  id,
  trainer_id,
  is_published,
  status,
  created_at,
  program_data->'basic_info'->>'title' as title,
  program_data->'basic_info'->>'category' as category,
  program_data->'basic_info'->>'base_price' as base_price
FROM "99_training_programs"
LIMIT 5;

-- 6. Verificar estrutura JSONB esperada
SELECT 
  id,
  jsonb_pretty(program_data) as program_data_structure
FROM "99_training_programs"
LIMIT 1;

-- 7. Contar registros por status
SELECT 
  status,
  is_published,
  COUNT(*) as count
FROM "99_training_programs"
GROUP BY status, is_published;

-- 8. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerowsecurity
FROM pg_tables 
WHERE tablename = '99_training_programs';

-- 9. Testar consulta JSONB básica
SELECT 
  COUNT(*) as total_programs,
  COUNT(*) FILTER (WHERE is_published = true) as published_programs,
  COUNT(*) FILTER (WHERE is_published = false) as draft_programs
FROM "99_training_programs";

-- 10. Verificar se há campos antigos que deveriam ter sido removidos
-- (Após migração completa para JSONB)
/*
SELECT 
  column_name
FROM information_schema.columns 
WHERE table_name = '99_training_programs'
AND column_name IN (
  'title', 'category', 'modality', 'level', 
  'duration', 'duration_type', 'frequency', 'base_price'
);
*/

-- RESULTADO ESPERADO:
-- - Tabela deve existir e ser do tipo 'BASE TABLE'
-- - Deve ter colunas: id, trainer_id, is_published, status, program_data, created_at, updated_at
-- - program_data deve ser do tipo 'jsonb'
-- - RLS deve estar habilitado (rowsecurity = true)
-- - Deve ter políticas RLS configuradas
-- - Dados JSONB devem ter estrutura com basic_info, description, pricing, etc.