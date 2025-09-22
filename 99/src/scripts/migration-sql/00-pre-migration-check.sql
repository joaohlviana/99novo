/*
 * DEPRECATED FILE - MOVED TO SQL
 * 
 * Este arquivo foi movido para:
 * /scripts/migration-sql/00-pre-migration-check.sql
 * 
 * Use esse arquivo SQL em vez deste .tsx
 */

// Previne que React tente processar este arquivo como componente
export const DEPRECATED_FILE = true;

DO $$
BEGIN
    RAISE NOTICE '🔍 DIAGNÓSTICO PRÉ-MIGRAÇÃO - BANCO HÍBRIDO';
    RAISE NOTICE '📅 Data/Hora: %', NOW();
    RAISE NOTICE '==========================================';
END$$;

-- ============================================
-- 1. VERIFICAR ESTRUTURA ATUAL DO BANCO
-- ============================================

-- Listar todas as tabelas no schema public
DO $$
DECLARE
    table_rec RECORD;
    table_count INTEGER := 0;
BEGIN
    RAISE NOTICE '📋 TABELAS EXISTENTES NO SCHEMA PUBLIC:';
    RAISE NOTICE '----------------------------------------';
    
    FOR table_rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
    LOOP
        table_count := table_count + 1;
        RAISE NOTICE '  %: %', table_count, table_rec.table_name;
    END LOOP;
    
    RAISE NOTICE 'Total de tabelas: %', table_count;
    RAISE NOTICE '';
END$$;

-- ============================================
-- 2. VERIFICAR TABELAS OBRIGATÓRIAS
-- ============================================

DO $$
DECLARE
    required_tables TEXT[] := ARRAY['users', 'user_profiles', 'trainer_profiles', 'cities', 'states', 'sports'];
    table_name TEXT;
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    existing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO TABELAS OBRIGATÓRIAS:';
    RAISE NOTICE '------------------------------------';
    
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            existing_tables := array_append(existing_tables, table_name);
            RAISE NOTICE '  ✅ %', table_name;
        ELSE
            missing_tables := array_append(missing_tables, table_name);
            RAISE NOTICE '  ❌ %', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '🚨 TABELAS OBRIGATÓRIAS AUSENTES:';
        RAISE NOTICE '  %', array_to_string(missing_tables, ', ');
        RAISE NOTICE '  ⚠️  Migração pode falhar! Criar tabelas antes de continuar.';
    ELSE
        RAISE NOTICE '✅ Todas as tabelas obrigatórias estão presentes';
    END IF;
    
    RAISE NOTICE '';
END$$;

-- ============================================
-- 3. VERIFICAR COLUNAS JSON EXISTENTES
-- ============================================

DO $$
DECLARE
    col_check RECORD;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO COLUNAS JSON EXISTENTES:';
    RAISE NOTICE '-------------------------------------';
    
    -- user_profiles.profile_data
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'profile_data'
    ) THEN
        RAISE NOTICE '  ✅ user_profiles.profile_data já existe';
    ELSE
        RAISE NOTICE '  ➕ user_profiles.profile_data será criada';
    END IF;
    
    -- trainer_profiles columns
    FOR col_check IN 
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trainer_profiles' 
        AND column_name IN ('business_config', 'service_config', 'preferences')
    LOOP
        RAISE NOTICE '  ✅ trainer_profiles.% já existe', col_check.column_name;
    END LOOP;
    
    -- Check missing trainer_profiles columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'trainer_profiles' AND column_name = 'business_config'
    ) THEN
        RAISE NOTICE '  ➕ trainer_profiles.business_config será criada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'trainer_profiles' AND column_name = 'service_config'
    ) THEN
        RAISE NOTICE '  ➕ trainer_profiles.service_config será criada';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'trainer_profiles' AND column_name = 'preferences'
    ) THEN
        RAISE NOTICE '  ➕ trainer_profiles.preferences será criada';
    END IF;
    
    -- media_files.metadata
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'media_files') THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'media_files' AND column_name = 'metadata'
        ) THEN
            RAISE NOTICE '  ✅ media_files.metadata já existe';
        ELSE
            RAISE NOTICE '  ➕ media_files.metadata será criada';
        END IF;
    ELSE
        RAISE NOTICE '  ℹ️  Tabela media_files não existe - metadata não será criada';
    END IF;
    
    RAISE NOTICE '';
END$$;

-- ============================================
-- 4. VERIFICAR NOVAS TABELAS HÍBRIDAS
-- ============================================

DO $$
DECLARE
    new_tables TEXT[] := ARRAY['programs', 'platform_config', 'user_events', 'reviews'];
    table_name TEXT;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO NOVAS TABELAS HÍBRIDAS:';
    RAISE NOTICE '------------------------------------';
    
    FOREACH table_name IN ARRAY new_tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            RAISE NOTICE '  ⚠️  % já existe (será ignorada)', table_name;
        ELSE
            RAISE NOTICE '  ➕ % será criada', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
END$$;

-- ============================================
-- 5. VERIFICAR PERMISSÕES E USUÁRIO
-- ============================================

DO $$
DECLARE
    current_user_name TEXT;
    is_superuser BOOLEAN;
    can_create_tables BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO PERMISSÕES:';
    RAISE NOTICE '-------------------------';
    
    -- Usuario atual
    SELECT current_user INTO current_user_name;
    RAISE NOTICE '  👤 Usuário atual: %', current_user_name;
    
    -- Verificar se é superuser
    SELECT usesuper INTO is_superuser 
    FROM pg_user 
    WHERE usename = current_user_name;
    
    RAISE NOTICE '  🔑 Superuser: %', CASE WHEN is_superuser THEN 'SIM' ELSE 'NÃO' END;
    
    -- Verificar permissão de criação
    SELECT has_schema_privilege(current_user_name, 'public', 'CREATE') INTO can_create_tables;
    RAISE NOTICE '  🏗️  Pode criar tabelas: %', CASE WHEN can_create_tables THEN 'SIM' ELSE 'NÃO' END;
    
    IF NOT can_create_tables THEN
        RAISE NOTICE '  ⚠️  AVISO: Usuário pode não ter permissões suficientes para migração';
    END IF;
    
    RAISE NOTICE '';
END$$;

-- ============================================
-- 6. VERIFICAR DADOS EXISTENTES
-- ============================================

DO $$
DECLARE
    user_count INTEGER;
    trainer_count INTEGER;
    profile_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO DADOS EXISTENTES:';
    RAISE NOTICE '-------------------------------';
    
    -- Contar usuários
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        SELECT COUNT(*) INTO user_count FROM users;
        RAISE NOTICE '  👥 Total de usuários: %', user_count;
    ELSE
        RAISE NOTICE '  ❌ Tabela users não existe';
        user_count := 0;
    END IF;
    
    -- Contar perfis de usuário
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
        SELECT COUNT(*) INTO profile_count FROM user_profiles;
        RAISE NOTICE '  📋 Total de perfis de usuário: %', profile_count;
    ELSE
        RAISE NOTICE '  ❌ Tabela user_profiles não existe';
        profile_count := 0;
    END IF;
    
    -- Contar perfis de treinador
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trainer_profiles' AND table_schema = 'public') THEN
        SELECT COUNT(*) INTO trainer_count FROM trainer_profiles;
        RAISE NOTICE '  🏋️  Total de perfis de treinador: %', trainer_count;
    ELSE
        RAISE NOTICE '  ❌ Tabela trainer_profiles não existe';
        trainer_count := 0;
    END IF;
    
    -- Avisos baseados nos dados
    IF user_count = 0 THEN
        RAISE NOTICE '  ⚠️  AVISO: Nenhum usuário encontrado';
    END IF;
    
    IF trainer_count = 0 THEN
        RAISE NOTICE '  ℹ️  INFO: Nenhum treinador encontrado (normal para novo sistema)';
    END IF;
    
    RAISE NOTICE '';
END$$;

-- ============================================
-- 7. VERIFICAR ESPAÇO EM DISCO E PERFORMANCE
-- ============================================

DO $$
DECLARE
    db_size TEXT;
    largest_table RECORD;
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO RECURSOS DO SISTEMA:';
    RAISE NOTICE '----------------------------------';
    
    -- Tamanho do banco
    SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;
    RAISE NOTICE '  💾 Tamanho do banco: %', db_size;
    
    -- Maior tabela
    SELECT 
        schemaname || '.' || tablename as table_name,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
    INTO largest_table
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
    LIMIT 1;
    
    IF largest_table.table_name IS NOT NULL THEN
        RAISE NOTICE '  📊 Maior tabela: % (%)', largest_table.table_name, largest_table.size;
    END IF;
    
    RAISE NOTICE '';
END$$;

-- ============================================
-- 8. RESUMO E RECOMENDAÇÕES
-- ============================================

DO $$
DECLARE
    has_required_tables BOOLEAN;
    has_existing_json BOOLEAN;
    ready_for_migration BOOLEAN := TRUE;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '📋 RESUMO DO DIAGNÓSTICO';
    RAISE NOTICE '==========================================';
    
    -- Verificar se tem tabelas obrigatórias
    SELECT 
        COUNT(*) = 6 
    INTO has_required_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('users', 'user_profiles', 'trainer_profiles', 'cities', 'states', 'sports');
    
    -- Verificar se já tem colunas JSON
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'profile_data'
    ) INTO has_existing_json;
    
    -- Status geral
    RAISE NOTICE 'Status das verificações:';
    RAISE NOTICE '  ✅ Tabelas obrigatórias: %', CASE WHEN has_required_tables THEN 'OK' ELSE 'FALTANDO' END;
    RAISE NOTICE '  📊 Colunas JSON existentes: %', CASE WHEN has_existing_json THEN 'SIM' ELSE 'NÃO' END;
    
    -- Recomendações
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RECOMENDAÇÕES:';
    
    IF NOT has_required_tables THEN
        RAISE NOTICE '  ⚠️  Criar tabelas obrigatórias antes da migração';
        ready_for_migration := FALSE;
    END IF;
    
    IF has_existing_json THEN
        RAISE NOTICE '  ℹ️  Algumas colunas JSON já existem - migração será idempotente';
    END IF;
    
    RAISE NOTICE '  📝 Fazer backup do banco antes da migração';
    RAISE NOTICE '  🧪 Testar em ambiente de staging primeiro';
    RAISE NOTICE '  ⏰ Executar em horário de baixo uso';
    
    RAISE NOTICE '';
    
    IF ready_for_migration THEN
        RAISE NOTICE '🟢 SISTEMA PRONTO PARA MIGRAÇÃO!';
        RAISE NOTICE '   Execute: \i scripts/migration-sql/01-add-json-fields-fixed.sql';
    ELSE
        RAISE NOTICE '🔴 SISTEMA NÃO ESTÁ PRONTO PARA MIGRAÇÃO!';
        RAISE NOTICE '   Corrija os problemas identificados acima primeiro.';
    END IF;
    
    RAISE NOTICE '==========================================';
END$$;

-- ============================================
-- 9. SALVAR ESTADO ATUAL (OPCIONAL)
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '💾 Para salvar este diagnóstico em uma tabela:';
    RAISE NOTICE '   CREATE TABLE migration_diagnostics AS SELECT now() as checked_at, ''pre-migration'' as phase;';
    RAISE NOTICE '';
END$$;