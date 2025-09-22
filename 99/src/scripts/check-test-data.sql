-- =============================================
-- VERIFICAR DADOS DE TESTE NO SISTEMA
-- =============================================
--
-- Script para verificar se temos dados suficientes para os testes
--
-- =============================================

-- 1. VERIFICAR USER PROFILES
SELECT 
  'USER_PROFILES' as tabela,
  COUNT(*) as total,
  COUNT(CASE WHEN role = 'trainer' THEN 1 END) as trainers,
  COUNT(CASE WHEN role = 'client' THEN 1 END) as clients,
  COUNT(CASE WHEN is_active = true THEN 1 END) as ativos
FROM user_profiles;

-- 2. VERIFICAR TRAINING PROGRAMS
SELECT 
  'TRAINING_PROGRAMS' as tabela,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'published' THEN 1 END) as publicados,
  AVG(price_amount) as preco_medio
FROM training_programs;

-- 3. VERIFICAR PROGRAM CARDS VIEW
SELECT 
  'PROGRAM_CARDS_VIEW' as view_name,
  COUNT(*) as total_registros
FROM program_cards_view;

-- 4. VERIFICAR TRAINER DASHBOARD SUMMARY
SELECT 
  'TRAINER_DASHBOARD_SUMMARY' as view_name,
  COUNT(*) as total_registros
FROM trainer_dashboard_summary;

-- 5. TESTAR FUNÇÃO get_featured_programs
SELECT 
  'GET_FEATURED_PROGRAMS' as funcao,
  COUNT(*) as resultados
FROM get_featured_programs(5);

-- 6. TESTAR FUNÇÃO get_programs_for_cards
SELECT 
  'GET_PROGRAMS_FOR_CARDS' as funcao,
  COUNT(*) as resultados
FROM get_programs_for_cards(
  NULL, NULL, NULL, NULL, NULL, NULL, 'relevance', 10, 0
);

-- 7. VERIFICAR ALGUNS DADOS DE EXEMPLO
SELECT 
  'EXEMPLO_TRAINER' as tipo,
  name,
  email,
  profile_data->>'city' as cidade,
  profile_data->>'specialties' as especialidades
FROM user_profiles 
WHERE role = 'trainer' 
LIMIT 2;

SELECT 
  'EXEMPLO_PROGRAM' as tipo,
  title,
  status,
  price_amount,
  program_data->>'description' as descricao_breve
FROM training_programs 
LIMIT 2;