-- =============================================
-- DIAGNÓSTICO COMPLETO DE ACESSO À auth.users
-- =============================================
--
-- Este script identifica TODAS as referências à tabela auth.users
-- que podem estar causando erros de permissão
--
-- =============================================

-- 1. VERIFICAR VIEWS QUE REFERENCIAM auth.users
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE definition ILIKE '%auth.users%' 
   OR definition ILIKE '%users%'
   AND schemaname = 'public';

-- 2. VERIFICAR FUNÇÕES QUE REFERENCIAM auth.users  
SELECT 
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%auth.users%'
   OR pg_get_functiondef(p.oid) ILIKE '%users%'
   AND n.nspname = 'public';

-- 3. VERIFICAR POLÍTICAS RLS QUE REFERENCIAM auth.users
SELECT 
  schemaname,
  tablename,
  policyname,
  qual,
  with_check
FROM pg_policies 
WHERE qual ILIKE '%auth.users%' 
   OR with_check ILIKE '%auth.users%'
   OR qual ILIKE '%users%'
   OR with_check ILIKE '%users%';

-- 4. VERIFICAR TRIGGERS QUE PODEM ACESSAR auth.users
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE action_statement ILIKE '%auth.users%'
   OR action_statement ILIKE '%users%';

-- 5. LISTAR TODAS AS NOSSAS TABELAS CUSTOMIZADAS (que devemos usar)
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'training_programs')
ORDER BY table_name;

-- 6. VERIFICAR SE ALGUMA TABELA TEM FK PARA auth.users
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (ccu.table_name = 'users' OR ccu.table_name ILIKE '%user%')
  AND tc.table_schema = 'public';

-- 7. TESTAR ACESSO ÀS NOSSAS TABELAS (devem funcionar)
DO $$
BEGIN
  -- Testar user_profiles
  PERFORM COUNT(*) FROM user_profiles;
  RAISE NOTICE 'user_profiles: OK';
  
  -- Testar training_programs
  PERFORM COUNT(*) FROM training_programs;
  RAISE NOTICE 'training_programs: OK';
  
  -- Testar views
  PERFORM COUNT(*) FROM program_cards_view;
  RAISE NOTICE 'program_cards_view: OK';
  
  PERFORM COUNT(*) FROM trainer_dashboard_summary;
  RAISE NOTICE 'trainer_dashboard_summary: OK';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERRO ao acessar nossas tabelas: %', SQLERRM;
END $$;

-- 8. VERIFICAR FUNÇÕES ESPECÍFICAS SUSPEITAS
DO $$
BEGIN
  -- Testar get_featured_programs
  PERFORM COUNT(*) FROM get_featured_programs(3);
  RAISE NOTICE 'get_featured_programs: OK';
  
  -- Testar get_programs_for_cards  
  PERFORM COUNT(*) FROM get_programs_for_cards(NULL,NULL,NULL,NULL,NULL,NULL,'relevance',5,0);
  RAISE NOTICE 'get_programs_for_cards: OK';
  
  -- Testar get_trainers_with_stats
  PERFORM COUNT(*) FROM get_trainers_with_stats(NULL,NULL,5,0);
  RAISE NOTICE 'get_trainers_with_stats: OK';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERRO em função SQL: %', SQLERRM;
END $$;