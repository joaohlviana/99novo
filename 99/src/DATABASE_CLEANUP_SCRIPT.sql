-- ================================================================
-- 🧹 SCRIPT DE LIMPEZA DO BANCO DE DADOS - SISTEMA HÍBRIDO
-- ================================================================
-- 
-- Este script remove tabelas obsoletas após migração para sistema híbrido
-- EXECUTE APENAS APÓS BACKUP COMPLETO DO BANCO DE DADOS
--
-- Data: 2025-01-15
-- Versão: 1.0
-- 
-- ATENÇÃO: 
-- ⚠️  FAÇA BACKUP COMPLETO ANTES DE EXECUTAR
-- ⚠️  TESTE EM AMBIENTE DE DESENVOLVIMENTO PRIMEIRO
-- ⚠️  EXECUTE EM HORÁRIO DE BAIXO TRÁFEGO
-- 
-- ================================================================

-- ================================================================
-- FASE 1: BACKUP DE SEGURANÇA (OPCIONAL - DESCOMENTE SE PRECISAR)
-- ================================================================

-- Descomente as linhas abaixo se quiser fazer backup das tabelas antes de remover:

-- CREATE TABLE backup_client_profiles AS SELECT * FROM client_profiles;
-- CREATE TABLE backup_trainer_profiles AS SELECT * FROM trainer_profiles;
-- CREATE TABLE backup_programs AS SELECT * FROM programs;
-- CREATE TABLE backup_client_profile AS SELECT * FROM client_profile;
-- CREATE TABLE backup_client_fitness_goals AS SELECT * FROM client_fitness_goals;
-- CREATE TABLE backup_client_sport_interests AS SELECT * FROM client_sport_interests;
-- CREATE TABLE backup_trainer_specialties AS SELECT * FROM trainer_specialties;
-- CREATE TABLE backup_trainer_service_cities AS SELECT * FROM trainer_service_cities;
-- CREATE TABLE backup_trainer_certifications AS SELECT * FROM trainer_certifications;
-- CREATE TABLE backup_program_sports AS SELECT * FROM program_sports;
-- CREATE TABLE backup_program_modules AS SELECT * FROM program_modules;
-- CREATE TABLE backup_program_contents AS SELECT * FROM program_contents;

-- ================================================================
-- FASE 2: VERIFICAÇÃO DE SISTEMA HÍBRIDO ATIVO
-- ================================================================

-- Verificar se as tabelas híbridas existem e têm dados
DO $$
DECLARE
    hybrid_count INTEGER;
BEGIN
    -- Verificar se sistema híbrido está ativo
    SELECT COUNT(*) INTO hybrid_count 
    FROM information_schema.tables 
    WHERE table_name IN ('99_client_profile', '99_trainer_profile', '99_training_programs');
    
    IF hybrid_count < 3 THEN
        RAISE EXCEPTION 'ERRO: Sistema híbrido não está completo. Verificar antes de prosseguir.';
    END IF;
    
    RAISE NOTICE '✅ Sistema híbrido verificado - % tabelas encontradas', hybrid_count;
END $$;

-- ================================================================
-- FASE 3: REMOVER VIEWS PRIMEIRO (SEM DEPENDÊNCIAS)
-- ================================================================

RAISE NOTICE '🗑️  FASE 3: Removendo views obsoletas...';

-- Views de cache e dashboard obsoletas
DROP VIEW IF EXISTS v_trainer_card CASCADE;
DROP VIEW IF EXISTS public_training_programs CASCADE;
DROP VIEW IF EXISTS published_training_programs CASCADE;
DROP VIEW IF EXISTS trainer_programs_dashboard CASCADE;

RAISE NOTICE '✅ Views removidas com sucesso';

-- ================================================================
-- FASE 4: REMOVER TABELAS DE RELACIONAMENTO OBSOLETAS
-- ================================================================

RAISE NOTICE '🗑️  FASE 4: Removendo tabelas de relacionamento obsoletas...';

-- Tabelas que foram migradas para JSONB nos perfis híbridos
DROP TABLE IF EXISTS client_fitness_goals CASCADE;
DROP TABLE IF EXISTS client_sport_interests CASCADE;
DROP TABLE IF EXISTS trainer_specialties CASCADE;
DROP TABLE IF EXISTS trainer_service_cities CASCADE;
DROP TABLE IF EXISTS trainer_certifications CASCADE;
DROP TABLE IF EXISTS program_sports CASCADE;

RAISE NOTICE '✅ Tabelas de relacionamento removidas';

-- ================================================================
-- FASE 5: REMOVER ESTRUTURA DE PROGRAMAS ANTIGA
-- ================================================================

RAISE NOTICE '🗑️  FASE 5: Removendo estrutura de programas antiga...';

-- Estrutura de conteúdo que agora está em JSONB
DROP TABLE IF EXISTS program_contents CASCADE;
DROP TABLE IF EXISTS program_modules CASCADE;

RAISE NOTICE '✅ Estrutura de programas antiga removida';

-- ================================================================
-- FASE 6: REMOVER TABELAS DE PERFIL ANTIGAS
-- ================================================================

RAISE NOTICE '🗑️  FASE 6: Removendo tabelas de perfil antigas...';

-- Perfis antigos substituídos pelo sistema híbrido
DROP TABLE IF EXISTS client_profile CASCADE;
DROP TABLE IF EXISTS client_profiles CASCADE;
DROP TABLE IF EXISTS trainer_profiles CASCADE;
DROP TABLE IF EXISTS programs CASCADE;

RAISE NOTICE '✅ Tabelas de perfil antigas removidas';

-- ================================================================
-- FASE 7: LIMPAR KV STORES ANTIGOS
-- ================================================================

RAISE NOTICE '🗑️  FASE 7: Limpando KV stores antigos...';

-- Manter apenas o KV store atual (kv_store_e547215c)
DROP TABLE IF EXISTS kv_store CASCADE;
DROP TABLE IF EXISTS kv_store_9d95a325 CASCADE;

-- Verificar se o KV store atual existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kv_store_e547215c') THEN
        RAISE WARNING '⚠️  KV store atual (kv_store_e547215c) não encontrado!';
    ELSE
        RAISE NOTICE '✅ KV store atual preservado';
    END IF;
END $$;

-- ================================================================
-- FASE 8: VERIFICAR INTEGRIDADE PÓS-LIMPEZA
-- ================================================================

RAISE NOTICE '🔍 FASE 8: Verificando integridade pós-limpeza...';

-- Verificar se tabelas essenciais ainda existem
DO $$
DECLARE
    essential_tables TEXT[] := ARRAY[
        '99_client_profile',
        '99_trainer_profile', 
        '99_training_programs',
        'users',
        'cities',
        'states',
        'sports',
        'conversations',
        'messages',
        'notifications',
        'transactions',
        'program_enrollments',
        'media_files',
        'kv_store_e547215c'
    ];
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    tbl TEXT;
BEGIN
    -- Verificar cada tabela essencial
    FOREACH tbl IN ARRAY essential_tables
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            missing_tables := array_append(missing_tables, tbl);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE WARNING '⚠️  Tabelas essenciais não encontradas: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ Todas as tabelas essenciais preservadas';
    END IF;
END $$;

-- ================================================================
-- FASE 9: OTIMIZAÇÃO FINAL
-- ================================================================

RAISE NOTICE '⚡ FASE 9: Otimizando banco pós-limpeza...';

-- Recriar índices otimizados para tabelas híbridas
DROP INDEX IF EXISTS idx_99_client_profile_user_id;
DROP INDEX IF EXISTS idx_99_client_profile_jsonb;
DROP INDEX IF EXISTS idx_99_trainer_profile_user_id;
DROP INDEX IF EXISTS idx_99_trainer_profile_jsonb;
DROP INDEX IF EXISTS idx_99_training_programs_trainer_id;
DROP INDEX IF EXISTS idx_99_training_programs_jsonb;

-- Criar índices otimizados
CREATE INDEX IF NOT EXISTS idx_99_client_profile_user_id ON "99_client_profile"(user_id);
CREATE INDEX IF NOT EXISTS idx_99_client_profile_jsonb ON "99_client_profile" USING gin(profile_data);
CREATE INDEX IF NOT EXISTS idx_99_trainer_profile_user_id ON "99_trainer_profile"(user_id);
CREATE INDEX IF NOT EXISTS idx_99_trainer_profile_jsonb ON "99_trainer_profile" USING gin(profile_data);
CREATE INDEX IF NOT EXISTS idx_99_training_programs_trainer_id ON "99_training_programs"(trainer_id);
CREATE INDEX IF NOT EXISTS idx_99_training_programs_jsonb ON "99_training_programs" USING gin(program_data);

-- Vacuum para liberar espaço
VACUUM ANALYZE;

RAISE NOTICE '✅ Otimização concluída';

-- ================================================================
-- FASE 10: RELATÓRIO FINAL
-- ================================================================

RAISE NOTICE '📊 FASE 10: Gerando relatório final...';

-- Contar tabelas restantes
DO $$
DECLARE
    total_tables INTEGER;
    hybrid_tables INTEGER;
    essential_tables INTEGER;
BEGIN
    -- Total de tabelas
    SELECT COUNT(*) INTO total_tables 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    -- Tabelas híbridas
    SELECT COUNT(*) INTO hybrid_tables 
    FROM information_schema.tables 
    WHERE table_name LIKE '99_%';
    
    -- Tabelas essenciais (estimativa)
    SELECT COUNT(*) INTO essential_tables 
    FROM information_schema.tables 
    WHERE table_name IN (
        'users', 'cities', 'states', 'sports', 
        'conversations', 'messages', 'notifications',
        'transactions', 'program_enrollments', 'media_files'
    );
    
    RAISE NOTICE '📊 RELATÓRIO FINAL DA LIMPEZA:';
    RAISE NOTICE '   🗃️  Total de tabelas restantes: %', total_tables;
    RAISE NOTICE '   🔄 Tabelas híbridas: %', hybrid_tables;
    RAISE NOTICE '   ⚙️  Tabelas essenciais: %', essential_tables;
    RAISE NOTICE '   ✅ Limpeza concluída com sucesso!';
END $$;

-- ================================================================
-- 🎉 LIMPEZA CONCLUÍDA
-- ================================================================

RAISE NOTICE '🎉 LIMPEZA DO BANCO CONCLUÍDA COM SUCESSO!';
RAISE NOTICE '';
RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
RAISE NOTICE '   1. ✅ Verificar funcionamento da aplicação';
RAISE NOTICE '   2. ✅ Monitorar logs por 24-48h';
RAISE NOTICE '   3. ✅ Executar backup pós-limpeza';
RAISE NOTICE '   4. ✅ Documentar alterações realizadas';
RAISE NOTICE '';
RAISE NOTICE '⚠️  Se houver problemas, restaurar do backup realizado antes desta limpeza.';

-- ================================================================
-- FIM DO SCRIPT
-- ================================================================