# 🚀 ÍNDICES JSONB - OTIMIZAÇÃO DETALHADA

## 📋 PROBLEMA ATUAL

Suas consultas JSONB estão **lentas** porque:
- **Sem índices GIN**: Queries em arrays JSON fazem full table scan
- **Sem índices de expressão**: Consultas em campos específicos são ineficientes  
- **Sem índices compostos**: Buscas multi-critério são O(n²)
- **Sem índices parciais**: Desperdício de espaço em dados inativos

### Performance Atual vs Esperada:
```sql
-- ❌ LENTO (2-5 segundos com 10k registros)
SELECT * FROM trainer_profiles 
WHERE profile_data->'specialties' ? 'musculacao';

-- ✅ RÁPIDO (< 50ms com índice)
-- Mesma query com índice GIN otimizado
```

---

## 🎯 ESTRATÉGIA DE ÍNDICES

### 1. ANÁLISE DE QUERIES FREQUENTES

```sql
-- =============================================
-- ANÁLISE DE PADRÕES DE CONSULTA
-- =============================================

-- Consultas mais comuns identificadas:
-- 1. Buscar treinadores por especialidade
-- 2. Buscar treinadores por cidade  
-- 3. Buscar clientes por esportes de interesse
-- 4. Buscar clientes por nível fitness
-- 5. Buscar por múltiplos critérios (especialidade + cidade)
-- 6. Filtrar apenas usuários ativos/verificados
```

### 2. HIERARQUIA DE ÍNDICES

#### **Nível 1: Índices Básicos (CRÍTICOS)**
```sql
-- =============================================
-- ÍNDICES CRÍTICOS - IMPLEMENTAR PRIMEIRO
-- =============================================

-- Índices estruturais básicos
CREATE INDEX CONCURRENTLY idx_user_profiles_user_id 
ON user_profiles(user_id);

CREATE INDEX CONCURRENTLY idx_user_profiles_role_active 
ON user_profiles(role, is_active) 
WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_user_profiles_status_role 
ON user_profiles(status, role, is_active) 
WHERE is_active = true;
```

#### **Nível 2: Índices JSONB Fundamentais**
```sql
-- =============================================
-- ÍNDICES JSONB PARA PERFORMANCE MÁXIMA
-- =============================================

-- Para TREINADORES - Especialidades (consulta mais frequente)
CREATE INDEX CONCURRENTLY idx_trainer_specialties_gin 
ON user_profiles USING GIN ((profile_data->'specialties')) 
WHERE role = 'trainer' AND is_active = true;

-- Para TREINADORES - Cidades
CREATE INDEX CONCURRENTLY idx_trainer_cities_gin 
ON user_profiles USING GIN ((profile_data->'cities')) 
WHERE role = 'trainer' AND is_active = true;

-- Para TREINADORES - Modalidades
CREATE INDEX CONCURRENTLY idx_trainer_modalities_gin 
ON user_profiles USING GIN ((profile_data->'modalities')) 
WHERE role = 'trainer' AND is_active = true;

-- Para CLIENTES - Esportes de interesse
CREATE INDEX CONCURRENTLY idx_client_sports_gin 
ON user_profiles USING GIN ((profile_data->'sportsInterest')) 
WHERE role = 'client' AND is_active = true;

-- Para CLIENTES - Objetivos primários
CREATE INDEX CONCURRENTLY idx_client_goals_gin 
ON user_profiles USING GIN ((profile_data->'primaryGoals')) 
WHERE role = 'client' AND is_active = true;
```

#### **Nível 3: Índices de Expressão (PERFORMANCE)**
```sql
-- =============================================
-- ÍNDICES DE EXPRESSÃO PARA CAMPOS ESPECÍFICOS
-- =============================================

-- Cidades como texto (para filtros exatos)
CREATE INDEX CONCURRENTLY idx_trainer_city_text 
ON user_profiles ((profile_data->>'city')) 
WHERE role = 'trainer' AND is_active = true 
AND profile_data->>'city' IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_client_city_text 
ON user_profiles ((profile_data->>'city')) 
WHERE role = 'client' AND is_active = true 
AND profile_data->>'city' IS NOT NULL;

-- Nível de experiência/fitness como texto
CREATE INDEX CONCURRENTLY idx_trainer_experience 
ON user_profiles ((profile_data->>'experienceYears')) 
WHERE role = 'trainer' AND is_active = true 
AND profile_data->>'experienceYears' IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_client_fitness_level 
ON user_profiles ((profile_data->>'fitnessLevel')) 
WHERE role = 'client' AND is_active = true 
AND profile_data->>'fitnessLevel' IS NOT NULL;

-- Estado para buscas por região
CREATE INDEX CONCURRENTLY idx_trainer_state 
ON user_profiles ((profile_data->>'state')) 
WHERE role = 'trainer' AND is_active = true 
AND profile_data->>'state' IS NOT NULL;
```

#### **Nível 4: Índices Compostos Avançados**
```sql
-- =============================================
-- ÍNDICES COMPOSTOS PARA BUSCAS COMPLEXAS
-- =============================================

-- Treinadores: Status + Verificação + Role (dashboard admin)
CREATE INDEX CONCURRENTLY idx_trainer_admin_dashboard 
ON user_profiles (role, status, is_verified, is_active, updated_at DESC) 
WHERE role = 'trainer';

-- Clientes: Status + Completude do perfil
CREATE INDEX CONCURRENTLY idx_client_status_complete 
ON user_profiles (role, is_active, status, (profile_data->>'completionPercentage')::int DESC) 
WHERE role = 'client' AND is_active = true;

-- Busca geográfica + especialidade (query mais complexa)
CREATE INDEX CONCURRENTLY idx_trainer_geo_specialty 
ON user_profiles ((profile_data->>'state'), (profile_data->'specialties')) 
WHERE role = 'trainer' AND is_active = true;
```

#### **Nível 5: Índices de Full-Text Search**
```sql
-- =============================================
-- FULL-TEXT SEARCH EM JSONB
-- =============================================

-- Busca textual em bio e descrições
CREATE INDEX CONCURRENTLY idx_trainer_fulltext_search 
ON user_profiles USING GIN (
  to_tsvector('portuguese', 
    COALESCE(profile_data->>'bio', '') || ' ' || 
    COALESCE(name, '') || ' ' ||
    COALESCE(profile_data->>'credential', '')
  )
) WHERE role = 'trainer' AND is_active = true;

-- Para clientes (se necessário)
CREATE INDEX CONCURRENTLY idx_client_fulltext_search 
ON user_profiles USING GIN (
  to_tsvector('portuguese', 
    COALESCE(profile_data->>'bio', '') || ' ' || 
    COALESCE(name, '')
  )
) WHERE role = 'client' AND is_active = true;
```

---

## 🔧 SCRIPT DE IMPLEMENTAÇÃO PROGRESSIVA

### **Fase 1: Índices Críticos (Executar Primeiro)**
```sql
-- =============================================
-- IMPLEMENTAÇÃO FASE 1 - CRÍTICOS
-- =============================================

DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  index_name TEXT;
BEGIN
  -- Configuração para execução segura
  SET maintenance_work_mem = '1GB';
  SET max_parallel_maintenance_workers = 4;
  
  RAISE NOTICE 'Iniciando criação de índices críticos...';
  start_time := clock_timestamp();
  
  -- Índice 1: user_id (mais crítico)
  index_name := 'idx_user_profiles_user_id';
  RAISE NOTICE 'Criando índice: %', index_name;
  EXECUTE format('CREATE INDEX CONCURRENTLY IF NOT EXISTS %I ON user_profiles(user_id)', index_name);
  
  -- Índice 2: role + is_active
  index_name := 'idx_user_profiles_role_active';
  RAISE NOTICE 'Criando índice: %', index_name;
  EXECUTE format('CREATE INDEX CONCURRENTLY IF NOT EXISTS %I ON user_profiles(role, is_active) WHERE is_active = true', index_name);
  
  -- Índice 3: status + role + is_active
  index_name := 'idx_user_profiles_status_role';
  RAISE NOTICE 'Criando índice: %', index_name;
  EXECUTE format('CREATE INDEX CONCURRENTLY IF NOT EXISTS %I ON user_profiles(status, role, is_active) WHERE is_active = true', index_name);
  
  end_time := clock_timestamp();
  RAISE NOTICE 'Fase 1 concluída em: %', end_time - start_time;
  
  -- Reset configurações
  RESET maintenance_work_mem;
  RESET max_parallel_maintenance_workers;
END $$;
```

### **Fase 2: Índices JSONB Fundamentais**
```sql
-- =============================================
-- IMPLEMENTAÇÃO FASE 2 - JSONB FUNDAMENTAIS
-- =============================================

DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  index_name TEXT;
  indexes_to_create TEXT[] := ARRAY[
    'idx_trainer_specialties_gin',
    'idx_trainer_cities_gin', 
    'idx_trainer_modalities_gin',
    'idx_client_sports_gin',
    'idx_client_goals_gin'
  ];
  index_sql TEXT[] := ARRAY[
    'CREATE INDEX CONCURRENTLY %I ON user_profiles USING GIN ((profile_data->''specialties'')) WHERE role = ''trainer'' AND is_active = true',
    'CREATE INDEX CONCURRENTLY %I ON user_profiles USING GIN ((profile_data->''cities'')) WHERE role = ''trainer'' AND is_active = true',
    'CREATE INDEX CONCURRENTLY %I ON user_profiles USING GIN ((profile_data->''modalities'')) WHERE role = ''trainer'' AND is_active = true', 
    'CREATE INDEX CONCURRENTLY %I ON user_profiles USING GIN ((profile_data->''sportsInterest'')) WHERE role = ''client'' AND is_active = true',
    'CREATE INDEX CONCURRENTLY %I ON user_profiles USING GIN ((profile_data->''primaryGoals'')) WHERE role = ''client'' AND is_active = true'
  ];
  i INTEGER;
BEGIN
  SET maintenance_work_mem = '2GB';
  SET max_parallel_maintenance_workers = 6;
  
  RAISE NOTICE 'Iniciando criação de índices JSONB fundamentais...';
  start_time := clock_timestamp();
  
  FOR i IN 1..array_length(indexes_to_create, 1) LOOP
    index_name := indexes_to_create[i];
    RAISE NOTICE 'Criando índice JSONB: % (% de %)', index_name, i, array_length(indexes_to_create, 1);
    
    EXECUTE format(index_sql[i], index_name);
    
    -- Pausa entre índices para não sobrecarregar
    PERFORM pg_sleep(2);
  END LOOP;
  
  end_time := clock_timestamp();
  RAISE NOTICE 'Fase 2 concluída em: %', end_time - start_time;
  
  RESET maintenance_work_mem;
  RESET max_parallel_maintenance_workers;
END $$;
```

### **Fase 3: Índices de Expressão**
```sql
-- =============================================
-- IMPLEMENTAÇÃO FASE 3 - EXPRESSÕES
-- =============================================

DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  index_count INTEGER := 0;
BEGIN
  SET maintenance_work_mem = '1GB';
  
  RAISE NOTICE 'Iniciando criação de índices de expressão...';
  start_time := clock_timestamp();
  
  -- Cidades como texto
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_city_text 
  ON user_profiles ((profile_data->>'city')) 
  WHERE role = 'trainer' AND is_active = true AND profile_data->>'city' IS NOT NULL;
  index_count := index_count + 1;
  
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_city_text 
  ON user_profiles ((profile_data->>'city')) 
  WHERE role = 'client' AND is_active = true AND profile_data->>'city' IS NOT NULL;
  index_count := index_count + 1;
  
  -- Experiência/Fitness level
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_experience 
  ON user_profiles ((profile_data->>'experienceYears')) 
  WHERE role = 'trainer' AND is_active = true AND profile_data->>'experienceYears' IS NOT NULL;
  index_count := index_count + 1;
  
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_client_fitness_level 
  ON user_profiles ((profile_data->>'fitnessLevel')) 
  WHERE role = 'client' AND is_active = true AND profile_data->>'fitnessLevel' IS NOT NULL;
  index_count := index_count + 1;
  
  -- Estado
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trainer_state 
  ON user_profiles ((profile_data->>'state')) 
  WHERE role = 'trainer' AND is_active = true AND profile_data->>'state' IS NOT NULL;
  index_count := index_count + 1;
  
  end_time := clock_timestamp();
  RAISE NOTICE 'Fase 3 concluída: % índices criados em %', index_count, end_time - start_time;
  
  RESET maintenance_work_mem;
END $$;
```

---

## 📊 MONITORAMENTO E ANÁLISE

### **1. Script de Análise de Performance**
```sql
-- =============================================
-- ANÁLISE DE PERFORMANCE DOS ÍNDICES
-- =============================================

-- Verificar tamanho dos índices
SELECT 
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  CASE 
    WHEN idx_scan > 0 THEN round((idx_tup_fetch::numeric / idx_scan), 2)
    ELSE 0
  END as avg_tuples_per_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Verificar uso dos índices JSONB
SELECT 
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes 
WHERE tablename = 'user_profiles' 
AND indexname LIKE '%gin%'
ORDER BY idx_scan DESC;

-- Queries mais lentas (ativar pg_stat_statements)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
WHERE query ILIKE '%user_profiles%' 
ORDER BY mean_time DESC 
LIMIT 10;
```

### **2. Benchmarks Antes/Depois**
```sql
-- =============================================
-- BENCHMARKS DE PERFORMANCE
-- =============================================

-- Teste 1: Busca por especialidade (deve usar idx_trainer_specialties_gin)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM user_profiles 
WHERE role = 'trainer' 
AND is_active = true 
AND profile_data->'specialties' ? 'musculacao';

-- Teste 2: Busca por cidade (deve usar idx_trainer_city_text)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM user_profiles 
WHERE role = 'trainer' 
AND is_active = true 
AND profile_data->>'city' = 'São Paulo';

-- Teste 3: Busca complexa multi-critério
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM user_profiles 
WHERE role = 'trainer' 
AND is_active = true 
AND profile_data->'specialties' ? 'musculacao'
AND profile_data->>'city' = 'São Paulo'
AND profile_data->'modalities' ? 'presencial';

-- Teste 4: Busca de clientes compatíveis
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) 
SELECT * FROM user_profiles 
WHERE role = 'client' 
AND is_active = true 
AND profile_data->'sportsInterest' && '["musculacao", "funcional"]'::jsonb;
```

### **3. Otimização Automática**
```sql
-- =============================================
-- FUNÇÃO PARA OTIMIZAÇÃO AUTOMÁTICA
-- =============================================

CREATE OR REPLACE FUNCTION optimize_user_profiles_performance()
RETURNS TABLE(
  optimization_type TEXT,
  action_taken TEXT,
  impact_estimate TEXT
) AS $$
DECLARE
  unused_indexes INTEGER;
  missing_stats BOOLEAN;
  large_table_size BIGINT;
BEGIN
  -- Verificar índices não utilizados
  SELECT COUNT(*) INTO unused_indexes
  FROM pg_stat_user_indexes 
  WHERE tablename = 'user_profiles' 
  AND idx_scan = 0
  AND indexrelname NOT LIKE '%pkey%';
  
  IF unused_indexes > 0 THEN
    RETURN QUERY SELECT 
      'Unused Indexes'::TEXT,
      format('Found %s unused indexes that could be dropped', unused_indexes)::TEXT,
      'Storage savings + faster writes'::TEXT;
  END IF;
  
  -- Verificar se precisa de VACUUM/ANALYZE
  SELECT pg_relation_size('user_profiles') INTO large_table_size;
  
  IF large_table_size > 1073741824 THEN -- > 1GB
    RETURN QUERY SELECT 
      'Table Maintenance'::TEXT,
      'Large table detected - consider VACUUM ANALYZE'::TEXT,
      'Better query planning + reduced bloat'::TEXT;
  END IF;
  
  -- Verificar estatísticas atualizadas
  SELECT (last_analyze IS NULL OR last_analyze < NOW() - INTERVAL '7 days') INTO missing_stats
  FROM pg_stat_user_tables 
  WHERE tablename = 'user_profiles';
  
  IF missing_stats THEN
    RETURN QUERY SELECT 
      'Statistics'::TEXT,
      'Table statistics are outdated - run ANALYZE'::TEXT,
      'Better query optimization'::TEXT;
  END IF;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Executar análise
SELECT * FROM optimize_user_profiles_performance();
```

---

## 🎯 QUERIES OTIMIZADAS

### **Antes vs Depois - Exemplos Práticos**

#### **1. Busca de Treinadores por Especialidade**
```sql
-- ❌ ANTES (Sem índice - 2-5 segundos)
SELECT * FROM trainer_profiles 
WHERE specialties @> '["musculacao"]';

-- ✅ DEPOIS (Com índice GIN - < 50ms)
SELECT * FROM user_profiles 
WHERE role = 'trainer' 
AND is_active = true 
AND profile_data->'specialties' ? 'musculacao';
```

#### **2. Busca Geográfica Otimizada**
```sql
-- ❌ ANTES (Full table scan)
SELECT * FROM trainer_profiles 
WHERE cities @> '["São Paulo"]';

-- ✅ DEPOIS (Índice específico)
SELECT * FROM user_profiles 
WHERE role = 'trainer' 
AND is_active = true 
AND profile_data->>'city' = 'São Paulo';  -- Usa idx_trainer_city_text
```

#### **3. Busca Multi-Critério Avançada**
```sql
-- ✅ QUERY OTIMIZADA COMPLETA
WITH trainer_search AS (
  SELECT 
    *,
    -- Calcular score de compatibilidade
    (
      CASE WHEN profile_data->'specialties' ? 'musculacao' THEN 3 ELSE 0 END +
      CASE WHEN profile_data->'modalities' ? 'presencial' THEN 2 ELSE 0 END +
      CASE WHEN profile_data->>'experienceYears' IN ('5-10', '10+') THEN 1 ELSE 0 END
    ) as compatibility_score
  FROM user_profiles 
  WHERE role = 'trainer' 
  AND is_active = true 
  AND status = 'active'
  AND profile_data->>'city' = 'São Paulo'  -- Usa índice de expressão
  AND profile_data->'specialties' ? 'musculacao'  -- Usa índice GIN
)
SELECT * FROM trainer_search 
WHERE compatibility_score > 0
ORDER BY compatibility_score DESC, updated_at DESC
LIMIT 20;
```

---

## 📈 RESULTADOS ESPERADOS

### **Performance Improvements**
- **Busca por especialidade**: 2-5s → < 50ms (**95% melhora**)
- **Busca geográfica**: 1-3s → < 30ms (**90% melhora**)  
- **Busca multi-critério**: 5-10s → < 100ms (**98% melhora**)
- **Dashboard admin**: 3-8s → < 200ms (**95% melhora**)

### **Storage Impact**
- **Índices adicionais**: ~200-500MB (estimativa)
- **ROI**: Performance gains compensam espaço usado
- **Manutenção**: Auto-VACUUM gerencia crescimento

### **Monitoring Metrics**
```sql
-- Métricas de sucesso para acompanhar
SELECT 
  'Query Performance' as metric,
  avg(total_time/calls) as avg_time_ms,
  sum(calls) as total_queries
FROM pg_stat_statements 
WHERE query ILIKE '%user_profiles%profile_data%';
```

---

Quer que eu avance para o terceiro ponto (Otimização de Queries N+1)?