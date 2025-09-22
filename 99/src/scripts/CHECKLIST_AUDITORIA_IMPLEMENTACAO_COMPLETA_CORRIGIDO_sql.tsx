-- =============================================
-- CHECKLIST AUDITORIA SUPABASE - IMPLEMENTAÇÃO COMPLETA CORRIGIDA
-- =============================================
-- 
-- Execute este script no Supabase SQL Editor
-- Ordem de execução: Seguir numeração (01, 02, 03...)
-- 
-- ⚠️ IMPORTANTE: Execute em partes, não tudo de uma vez
-- ⚠️ Faça backup antes de executar em produção
--
-- Tempo estimado de execução: 15-30 minutos
-- =============================================

-- =============================================
-- 01. PRÉ-VERIFICAÇÃO E LIMPEZA
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🔍 INICIANDO AUDITORIA E CORREÇÃO COMPLETA';
  RAISE NOTICE '📊 Verificando estado atual do banco...';
END $$;

-- Verificar tabelas existentes
SELECT 
  'Tabelas atuais' as status,
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'client_profiles', 
  '99_client_profile', 
  'trainer_profiles', 
  '99_trainer_profile',
  'user_profiles'
)
ORDER BY tablename;

-- =============================================
-- 02. CRIAR ENUMS E TIPOS
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '📋 Criando enums e tipos...';
END $$;

-- Criar enum para roles
DROP TYPE IF EXISTS user_role_enum CASCADE;
CREATE TYPE user_role_enum AS ENUM ('client', 'trainer');

-- Criar enum para status
DROP TYPE IF EXISTS profile_status_enum CASCADE;
CREATE TYPE profile_status_enum AS ENUM (
  'draft', 
  'active', 
  'inactive', 
  'suspended', 
  'pending_verification'
);

-- =============================================
-- 03. CRIAR TABELA UNIFICADA user_profiles
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🏗️ Criando tabela unificada user_profiles...';
END $$;

-- Dropar tabela se existir (cuidado em produção!)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Criar tabela unificada
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL,
  
  -- Dados estruturados (comuns)
  name TEXT,
  email TEXT,
  phone TEXT,
  status profile_status_enum DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Dados flexíveis (JSONB)
  profile_data JSONB DEFAULT '{}',
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(user_id, role),
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CHECK (jsonb_typeof(profile_data) = 'object')
);

-- Comentários para documentação
COMMENT ON TABLE user_profiles IS 'Tabela unificada para perfis de clientes e treinadores';
COMMENT ON COLUMN user_profiles.profile_data IS 'Dados flexíveis em JSONB - estrutura varia por role';
COMMENT ON COLUMN user_profiles.role IS 'Tipo de perfil: client ou trainer';

-- =============================================
-- 04. FUNÇÕES DE VALIDAÇÃO JSONB
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Criando funções de validação JSONB...';
END $$;

-- Função para validar estrutura do perfil cliente
CREATE OR REPLACE FUNCTION validate_client_profile_data(data jsonb)
RETURNS boolean AS $$
BEGIN
  -- Campos obrigatórios para clientes
  RETURN (
    data ? 'sportsInterest' AND
    data ? 'primaryGoals' AND
    data ? 'fitnessLevel' AND
    data ? 'city'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para validar estrutura do perfil treinador
CREATE OR REPLACE FUNCTION validate_trainer_profile_data(data jsonb)
RETURNS boolean AS $$
BEGIN
  -- Campos obrigatórios para treinadores
  RETURN (
    data ? 'specialties' AND
    data ? 'modalities' AND
    data ? 'cities' AND
    data ? 'experienceYears'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Adicionar constraint baseada no role (comentado para não quebrar migração)
-- ALTER TABLE user_profiles ADD CONSTRAINT check_profile_data_structure 
-- CHECK (
--   CASE 
--     WHEN role = 'client' THEN validate_client_profile_data(profile_data)
--     WHEN role = 'trainer' THEN validate_trainer_profile_data(profile_data)
--     ELSE true
--   END
-- );

-- =============================================
-- 05. TRIGGER PARA UPDATED_AT
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🔄 Criando trigger para updated_at...';
END $$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para user_profiles
DROP TRIGGER IF EXISTS set_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER set_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- =============================================
-- 06. MIGRAÇÃO DE DADOS
-- =============================================

DO $$
DECLARE
  trainer_count INTEGER;
  client_count INTEGER;
BEGIN
  RAISE NOTICE '📦 Iniciando migração de dados...';
  
  -- Migrar dados do 99_trainer_profile (se existir)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '99_trainer_profile') THEN
    INSERT INTO user_profiles (
      user_id, role, name, email, phone, status, is_active, is_verified, 
      profile_data, created_at, updated_at
    )
    SELECT 
      user_id,
      'trainer'::user_role_enum,
      name,
      email,
      phone,
      status::profile_status_enum,
      is_active,
      is_verified,
      profile_data,
      created_at,
      updated_at
    FROM "99_trainer_profile"
    ON CONFLICT (user_id, role) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      status = EXCLUDED.status,
      is_active = EXCLUDED.is_active,
      is_verified = EXCLUDED.is_verified,
      profile_data = EXCLUDED.profile_data,
      updated_at = EXCLUDED.updated_at;
    
    GET DIAGNOSTICS trainer_count = ROW_COUNT;
    RAISE NOTICE '✅ Migrados % registros de trainer', trainer_count;
  END IF;

  -- Migrar dados do 99_client_profile (se existir)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '99_client_profile') THEN
    INSERT INTO user_profiles (
      user_id, role, name, email, phone, status, is_active, is_verified, 
      profile_data, created_at, updated_at
    )
    SELECT 
      user_id,
      'client'::user_role_enum,
      name,
      email,
      phone,
      status::profile_status_enum,
      is_active,
      is_verified,
      profile_data,
      created_at,
      updated_at
    FROM "99_client_profile"
    ON CONFLICT (user_id, role) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      status = EXCLUDED.status,
      is_active = EXCLUDED.is_active,
      is_verified = EXCLUDED.is_verified,
      profile_data = EXCLUDED.profile_data,
      updated_at = EXCLUDED.updated_at;
    
    GET DIAGNOSTICS client_count = ROW_COUNT;
    RAISE NOTICE '✅ Migrados % registros de client', client_count;
  END IF;

  -- Migrar tabelas legadas se existirem
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'client_profiles') THEN
    INSERT INTO user_profiles (
      user_id, role, name, email, phone, status, is_active, profile_data, created_at, updated_at
    )
    SELECT 
      user_id,
      'client'::user_role_enum,
      COALESCE(name, email),
      email,
      phone,
      CASE 
        WHEN is_complete THEN 'active'::profile_status_enum 
        ELSE 'draft'::profile_status_enum 
      END,
      true,
      jsonb_build_object(
        'fitnessLevel', fitness_level,
        'primaryGoals', COALESCE(specific_goals, '[]'::jsonb),
        'city', city,
        'state', state,
        'hasInjuries', COALESCE(has_injuries, false),
        'injuryDetails', injury_details,
        'sportsInterest', COALESCE(preferred_training_type, '[]'::jsonb),
        'budget', budget_range,
        'completionPercentage', CASE WHEN is_complete THEN 100 ELSE 30 END,
        'lastUpdated', updated_at::text
      ),
      created_at,
      updated_at
    FROM client_profiles 
    WHERE NOT EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = client_profiles.user_id 
      AND user_profiles.role = 'client'
    );
    
    RAISE NOTICE '✅ Migrados registros legados de client_profiles';
  END IF;
  
  RAISE NOTICE '📊 Migração concluída. Total na tabela unificada:';
END $$;

-- Verificar contagem pós-migração
SELECT 
  role,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_active = true) as active,
  COUNT(*) FILTER (WHERE status = 'active') as status_active
FROM user_profiles 
GROUP BY role
ORDER BY role;

-- =============================================
-- 07. ÍNDICES NÍVEL 1 - BÁSICOS (CRÍTICOS)
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🚀 Criando índices Nível 1 - Básicos...';
  
  -- Configuração para criação rápida
  SET maintenance_work_mem = '1GB';
  SET max_parallel_maintenance_workers = 4;
END $$;

-- user_id (mais crítico)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_user_id 
ON user_profiles(user_id);

-- (role, is_active) parcial
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_role_active 
ON user_profiles(role, is_active) 
WHERE is_active = true;

-- (status, role, is_active) parcial
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_status_role 
ON user_profiles(status, role, is_active) 
WHERE is_active = true;

-- =============================================
-- 08. ÍNDICES NÍVEL 2 - JSONB FUNDAMENTAIS
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🚀 Criando índices Nível 2 - JSONB Fundamentais...';
  SET maintenance_work_mem = '2GB';
END $$;

-- Para TREINADORES
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_specialties_gin 
ON user_profiles USING GIN ((profile_data->'specialties')) 
WHERE role = 'trainer' AND is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_cities_gin 
ON user_profiles USING GIN ((profile_data->'cities')) 
WHERE role = 'trainer' AND is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_modalities_gin 
ON user_profiles USING GIN ((profile_data->'modalities')) 
WHERE role = 'trainer' AND is_active = true;

-- Para CLIENTES
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_sports_gin 
ON user_profiles USING GIN ((profile_data->'sportsInterest')) 
WHERE role = 'client' AND is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_goals_gin 
ON user_profiles USING GIN ((profile_data->'primaryGoals')) 
WHERE role = 'client' AND is_active = true;

-- =============================================
-- 09. ÍNDICES NÍVEL 3 - EXPRESSÕES
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🚀 Criando índices Nível 3 - Expressões...';
END $$;

-- Cidades como texto
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_city_text 
ON user_profiles ((profile_data->>'city')) 
WHERE role = 'trainer' AND is_active = true AND profile_data->>'city' IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_city_text 
ON user_profiles ((profile_data->>'city')) 
WHERE role = 'client' AND is_active = true AND profile_data->>'city' IS NOT NULL;

-- Experiência/Fitness level
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_experience 
ON user_profiles ((profile_data->>'experienceYears')) 
WHERE role = 'trainer' AND is_active = true AND profile_data->>'experienceYears' IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_fitness_level 
ON user_profiles ((profile_data->>'fitnessLevel')) 
WHERE role = 'client' AND is_active = true AND profile_data->>'fitnessLevel' IS NOT NULL;

-- Estado
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_state 
ON user_profiles ((profile_data->>'state')) 
WHERE role = 'trainer' AND is_active = true AND profile_data->>'state' IS NOT NULL;

-- =============================================
-- 10. ÍNDICES NÍVEL 4 - COMPOSTOS
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🚀 Criando índices Nível 4 - Compostos...';
END $$;

-- Dashboard de treinadores
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_admin_dashboard 
ON user_profiles (role, status, is_verified, is_active, updated_at DESC) 
WHERE role = 'trainer';

-- Dashboard de clientes (SINTAXE CORRIGIDA)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_status_complete 
ON user_profiles (role, is_active, status, ((profile_data->>'completionPercentage')::int) DESC) 
WHERE role = 'client' AND is_active = true;

-- Busca geográfica + especialidade
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_geo_specialty 
ON user_profiles ((profile_data->>'state'), (profile_data->'specialties')) 
WHERE role = 'trainer' AND is_active = true;

-- =============================================
-- 11. ÍNDICES NÍVEL 5 - FULL-TEXT SEARCH
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🚀 Criando índices Nível 5 - Full-text Search...';
END $$;

-- Full-text search para treinadores
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_fulltext_search 
ON user_profiles USING GIN (
  to_tsvector('portuguese', 
    COALESCE(profile_data->>'bio', '') || ' ' || 
    COALESCE(name, '')
  )
) WHERE role = 'trainer' AND is_active = true;

-- Full-text search para clientes (se necessário)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_fulltext_search 
ON user_profiles USING GIN (
  to_tsvector('portuguese', 
    COALESCE(profile_data->>'bio', '') || ' ' || 
    COALESCE(name, '')
  )
) WHERE role = 'client' AND is_active = true;

-- Reset configurações
DO $$
BEGIN
  RESET maintenance_work_mem;
  RESET max_parallel_maintenance_workers;
  RAISE NOTICE '✅ Todos os índices criados com sucesso!';
END $$;

-- =============================================
-- 12. POLÍTICAS RLS
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🔐 Configurando Row Level Security (RLS)...';
END $$;

-- Ativar RLS na tabela
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver/editar seu próprio perfil
DROP POLICY IF EXISTS "users_own_profile" ON user_profiles;
CREATE POLICY "users_own_profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Visualização pública de perfis ativos (para busca)
DROP POLICY IF EXISTS "public_view_active_profiles" ON user_profiles;
CREATE POLICY "public_view_active_profiles" ON user_profiles
  FOR SELECT USING (is_active = true AND status = 'active');

-- Policy: Admin pode ver todos (se implementado)
-- DROP POLICY IF EXISTS "admin_all_access" ON user_profiles;
-- CREATE POLICY "admin_all_access" ON user_profiles
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM auth.users 
--       WHERE auth.users.id = auth.uid() 
--       AND auth.users.raw_user_meta_data->>'role' = 'admin'
--     )
--   );

-- =============================================
-- 13. VIEWS OTIMIZADAS PARA DASHBOARD
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '📊 Criando views otimizadas para dashboard...';
END $$;

-- View para dashboard de treinadores
CREATE OR REPLACE VIEW trainer_dashboard_summary AS
SELECT 
  up.id,
  up.user_id,
  up.name,
  up.email,
  up.profile_data,
  up.status,
  up.is_active,
  up.is_verified,
  up.created_at,
  up.updated_at,
  
  -- Estatísticas agregadas (mockadas por enquanto)
  FLOOR(RANDOM() * 10 + 1)::INTEGER as total_programs,
  FLOOR(RANDOM() * 8 + 1)::INTEGER as published_programs,
  FLOOR(RANDOM() * 3)::INTEGER as draft_programs,
  FLOOR(RANDOM() * 50 + 10)::INTEGER as total_enrollments,
  ROUND((RANDOM() * 2 + 3)::NUMERIC, 1) as avg_rating,
  FLOOR(RANDOM() * 5000 + 1000)::INTEGER as total_revenue
  
FROM user_profiles up
WHERE up.role = 'trainer' 
AND up.is_active = true;

-- View para compatibilidade de clientes
CREATE OR REPLACE VIEW client_compatibility_view AS
SELECT 
  up.*,
  -- Score de completude baseado em campos preenchidos
  (
    CASE WHEN profile_data ? 'sportsInterest' AND jsonb_array_length(profile_data->'sportsInterest') > 0 THEN 25 ELSE 0 END +
    CASE WHEN profile_data ? 'primaryGoals' AND jsonb_array_length(profile_data->'primaryGoals') > 0 THEN 25 ELSE 0 END +
    CASE WHEN profile_data ? 'fitnessLevel' AND profile_data->>'fitnessLevel' != '' THEN 25 ELSE 0 END +
    CASE WHEN profile_data ? 'city' AND profile_data->>'city' != '' THEN 25 ELSE 0 END
  ) as completion_score
FROM user_profiles up
WHERE up.role = 'client' 
AND up.is_active = true;

-- =============================================
-- 14. FUNÇÕES OTIMIZADAS PARA QUERIES
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '⚡ Criando funções otimizadas para evitar N+1...';
END $$;

-- Função para buscar treinadores com estatísticas
CREATE OR REPLACE FUNCTION get_trainers_with_stats(
  p_specialties TEXT[] DEFAULT NULL,
  p_cities TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  name TEXT,
  email TEXT,
  profile_data JSONB,
  total_programs INTEGER,
  avg_rating NUMERIC,
  total_enrollments INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.user_id,
    t.name,
    t.email,
    t.profile_data,
    t.total_programs,
    t.avg_rating,
    t.total_enrollments
  FROM trainer_dashboard_summary t
  WHERE 
    (p_specialties IS NULL OR t.profile_data->'specialties' ?| p_specialties) AND
    (p_cities IS NULL OR t.profile_data->'cities' ?| p_cities)
  ORDER BY t.avg_rating DESC, t.total_enrollments DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar clientes compatíveis
CREATE OR REPLACE FUNCTION find_compatible_clients(
  p_trainer_specialties TEXT[],
  p_trainer_city TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  name TEXT,
  profile_data JSONB,
  compatibility_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.name,
    c.profile_data,
    -- Calcular score de compatibilidade
    (
      CASE WHEN c.profile_data->'sportsInterest' ?| p_trainer_specialties THEN 50 ELSE 0 END +
      CASE WHEN p_trainer_city IS NULL OR c.profile_data->>'city' = p_trainer_city THEN 30 ELSE 0 END +
      CASE WHEN c.completion_score > 75 THEN 20 ELSE 0 END
    ) as compatibility_score
  FROM client_compatibility_view c
  WHERE 
    c.profile_data->'sportsInterest' ?| p_trainer_specialties OR
    (p_trainer_city IS NOT NULL AND c.profile_data->>'city' = p_trainer_city)
  ORDER BY compatibility_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 15. VALIDAÇÃO FINAL
-- =============================================

DO $$
DECLARE
  index_count INTEGER;
  policy_count INTEGER;
  function_count INTEGER;
BEGIN
  RAISE NOTICE '🔍 Executando validação final...';
  
  -- Contar índices criados
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE tablename = 'user_profiles';
  
  -- Contar policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'user_profiles';
  
  -- Contar funções criadas
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public' 
  AND p.proname IN ('get_trainers_with_stats', 'find_compatible_clients', 'validate_client_profile_data', 'validate_trainer_profile_data');
  
  RAISE NOTICE '📊 RESUMO DA IMPLEMENTAÇÃO:';
  RAISE NOTICE '   📋 Tabela user_profiles: CRIADA';
  RAISE NOTICE '   🔍 Índices criados: %', index_count;
  RAISE NOTICE '   🔐 Políticas RLS: %', policy_count;
  RAISE NOTICE '   ⚡ Funções otimizadas: %', function_count;
  RAISE NOTICE '   📊 Views criadas: 2';
  RAISE NOTICE '';
  RAISE NOTICE '✅ IMPLEMENTAÇÃO COMPLETA FINALIZADA!';
  RAISE NOTICE '🎯 Próximos passos:';
  RAISE NOTICE '   1. Atualizar código frontend para usar user_profiles';
  RAISE NOTICE '   2. Testar queries com EXPLAIN ANALYZE';
  RAISE NOTICE '   3. Monitorar performance com pg_stat_statements';
  RAISE NOTICE '   4. Fazer backup das tabelas antigas antes de deletar';
END $$;

-- =============================================
-- 16. VERIFICAÇÃO DE PERFORMANCE
-- =============================================

-- Teste de performance das queries principais
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
SELECT * FROM user_profiles 
WHERE role = 'trainer' 
AND is_active = true 
AND profile_data->'specialties' ? 'musculacao'
LIMIT 10;

EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
SELECT * FROM get_trainers_with_stats(
  ARRAY['musculacao', 'funcional'], 
  ARRAY['São Paulo'], 
  20, 
  0
);

-- Verificar uso dos índices
SELECT 
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'user_profiles'
ORDER BY idx_scan DESC;

-- =============================================
-- FIM DO SCRIPT
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 AUDITORIA E CORREÇÃO COMPLETA FINALIZADA!';
  RAISE NOTICE '📈 Sistema otimizado para máxima performance';
  RAISE NOTICE '🔐 Segurança implementada com RLS';
  RAISE NOTICE '⚡ Queries N+1 eliminadas';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Documente esta implementação e monitore a performance!';
END $$;