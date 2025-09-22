/*
 * DEPRECATED FILE - MOVED TO SQL
 * 
 * Este arquivo foi movido para:
 * /scripts/migration-sql/01-add-json-fields-fixed.sql
 * 
 * Use esse arquivo SQL em vez deste .tsx
 */

// Previne que React tente processar este arquivo como componente
export const DEPRECATED_FILE = true;

-- Verificação de ambiente e prerequisitos
DO $$
BEGIN
    RAISE NOTICE '🚀 Iniciando migração híbrida - Fase 1';
    RAISE NOTICE '📅 Data/Hora: %', NOW();
    RAISE NOTICE '🏗️ Versão: 1.0.1 (Fixed)';
END$$;

BEGIN;

-- ============================================
-- 1. VERIFICAR TABELAS EXISTENTES ANTES DE FAZER BACKUP
-- ============================================

-- Verificar se tabelas principais existem
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Verificar user_profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') THEN
        missing_tables := array_append(missing_tables, 'user_profiles');
    END IF;

    -- Verificar trainer_profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trainer_profiles' AND table_schema = 'public') THEN
        missing_tables := array_append(missing_tables, 'trainer_profiles');
    END IF;

    -- Verificar users
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        missing_tables := array_append(missing_tables, 'users');
    END IF;

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'ERRO: Tabelas obrigatórias não encontradas: %', array_to_string(missing_tables, ', ');
    END IF;

    RAISE NOTICE '✅ Todas as tabelas obrigatórias existem';
END$$;

-- ============================================
-- 2. BACKUP DAS TABELAS EXISTENTES
-- ============================================

-- Backup user_profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles_backup_20250115') THEN
        CREATE TABLE user_profiles_backup_20250115 AS SELECT * FROM user_profiles;
        RAISE NOTICE '✅ Backup user_profiles criado';
    ELSE
        RAISE NOTICE 'ℹ️ Backup user_profiles já existe';
    END IF;
END$$;

-- Backup trainer_profiles  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trainer_profiles_backup_20250115') THEN
        CREATE TABLE trainer_profiles_backup_20250115 AS SELECT * FROM trainer_profiles;
        RAISE NOTICE '✅ Backup trainer_profiles criado';
    ELSE
        RAISE NOTICE 'ℹ️ Backup trainer_profiles já existe';
    END IF;
END$$;

-- Backup media_files (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_files' AND table_schema = 'public') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_files_backup_20250115') THEN
            CREATE TABLE media_files_backup_20250115 AS SELECT * FROM media_files;
            RAISE NOTICE '✅ Backup media_files criado';
        ELSE
            RAISE NOTICE 'ℹ️ Backup media_files já existe';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela media_files não existe - backup não necessário';
    END IF;
END$$;

-- ============================================
-- 3. ADICIONAR CAMPOS JSON ÀS TABELAS EXISTENTES
-- ============================================

-- Expandir user_profiles com dados flexíveis
DO $$
BEGIN
    -- Verificar se coluna já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'profile_data'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN profile_data JSONB DEFAULT '{}';
        RAISE NOTICE '✅ Coluna profile_data adicionada à user_profiles';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna profile_data já existe em user_profiles';
    END IF;
END$$;

-- Expandir trainer_profiles com configurações dinâmicas  
DO $$
BEGIN
    -- business_config
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trainer_profiles' 
        AND column_name = 'business_config'
    ) THEN
        ALTER TABLE public.trainer_profiles ADD COLUMN business_config JSONB DEFAULT '{}';
        RAISE NOTICE '✅ Coluna business_config adicionada à trainer_profiles';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna business_config já existe em trainer_profiles';
    END IF;

    -- service_config
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trainer_profiles' 
        AND column_name = 'service_config'
    ) THEN
        ALTER TABLE public.trainer_profiles ADD COLUMN service_config JSONB DEFAULT '{}';
        RAISE NOTICE '✅ Coluna service_config adicionada à trainer_profiles';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna service_config já existe em trainer_profiles';
    END IF;

    -- preferences
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'trainer_profiles' 
        AND column_name = 'preferences'
    ) THEN
        ALTER TABLE public.trainer_profiles ADD COLUMN preferences JSONB DEFAULT '{}';
        RAISE NOTICE '✅ Coluna preferences adicionada à trainer_profiles';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna preferences já existe em trainer_profiles';
    END IF;
END$$;

-- Expandir media_files com metadados JSON (se tabela existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_files' AND table_schema = 'public') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'media_files' 
            AND column_name = 'metadata'
        ) THEN
            ALTER TABLE public.media_files ADD COLUMN metadata JSONB DEFAULT '{}';
            RAISE NOTICE '✅ Coluna metadata adicionada à media_files';
        ELSE
            RAISE NOTICE 'ℹ️ Coluna metadata já existe em media_files';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela media_files não existe - coluna metadata não adicionada';
    END IF;
END$$;

-- ============================================
-- 4. CRIAR NOVAS TABELAS HÍBRIDAS
-- ============================================

-- Tabela para programas com estrutura flexível
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs' AND table_schema = 'public') THEN
        CREATE TABLE programs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          status VARCHAR(50) DEFAULT 'draft',
          content JSONB NOT NULL DEFAULT '{}',
          pricing JSONB DEFAULT '{}',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          CONSTRAINT chk_programs_status CHECK (status IN ('draft', 'published', 'archived', 'suspended'))
        );
        RAISE NOTICE '✅ Tabela programs criada';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela programs já existe';
    END IF;
END$$;

-- Sistema de configurações globais
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_config' AND table_schema = 'public') THEN
        CREATE TABLE platform_config (
          key VARCHAR(100) PRIMARY KEY,
          value JSONB NOT NULL,
          version VARCHAR(20) DEFAULT '1.0.0',
          description TEXT,
          category VARCHAR(50) DEFAULT 'general',
          is_public BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ Tabela platform_config criada';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela platform_config já existe';
    END IF;
END$$;

-- Sistema de eventos/histórico flexível
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_events' AND table_schema = 'public') THEN
        CREATE TABLE user_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          event_type VARCHAR(100) NOT NULL,
          event_data JSONB NOT NULL DEFAULT '{}',
          metadata JSONB DEFAULT '{}',
          session_id UUID,
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          CONSTRAINT chk_event_type_format CHECK (event_type ~ '^[a-z_]+$')
        );
        RAISE NOTICE '✅ Tabela user_events criada';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela user_events já existe';
    END IF;
END$$;

-- Tabela para reviews/avaliações flexíveis
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
        CREATE TABLE reviews (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          reviewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          review_type VARCHAR(50) NOT NULL DEFAULT 'trainer_review',
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          content TEXT,
          review_data JSONB DEFAULT '{}',
          status VARCHAR(20) DEFAULT 'published',
          is_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          CONSTRAINT chk_no_self_review CHECK (reviewer_id != reviewed_id),
          UNIQUE(reviewer_id, reviewed_id, review_type)
        );
        RAISE NOTICE '✅ Tabela reviews criada';
    ELSE
        RAISE NOTICE 'ℹ️ Tabela reviews já existe';
    END IF;
END$$;

-- ============================================
-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Função auxiliar para criar índices de forma segura
CREATE OR REPLACE FUNCTION create_index_if_not_exists(index_name TEXT, table_name TEXT, index_definition TEXT)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = table_name 
        AND indexname = index_name
    ) THEN
        EXECUTE 'CREATE INDEX ' || index_name || ' ON public.' || table_name || ' ' || index_definition;
        RAISE NOTICE '✅ Índice % criado', index_name;
    ELSE
        RAISE NOTICE 'ℹ️ Índice % já existe', index_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Índices GIN para busca em JSON
DO $$
BEGIN
    -- user_profiles.profile_data
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'profile_data'
    ) THEN
        PERFORM create_index_if_not_exists('idx_user_profiles_profile_data_gin', 'user_profiles', 'USING GIN (profile_data)');
    END IF;

    -- trainer_profiles índices
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'trainer_profiles' AND column_name = 'business_config'
    ) THEN
        PERFORM create_index_if_not_exists('idx_trainer_profiles_business_config_gin', 'trainer_profiles', 'USING GIN (business_config)');
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'trainer_profiles' AND column_name = 'service_config'
    ) THEN
        PERFORM create_index_if_not_exists('idx_trainer_profiles_service_config_gin', 'trainer_profiles', 'USING GIN (service_config)');
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'trainer_profiles' AND column_name = 'preferences'
    ) THEN
        PERFORM create_index_if_not_exists('idx_trainer_profiles_preferences_gin', 'trainer_profiles', 'USING GIN (preferences)');
    END IF;

    -- programs índices
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'programs' AND table_schema = 'public') THEN
        PERFORM create_index_if_not_exists('idx_programs_content_gin', 'programs', 'USING GIN (content)');
        PERFORM create_index_if_not_exists('idx_programs_metadata_gin', 'programs', 'USING GIN (metadata)');
        PERFORM create_index_if_not_exists('idx_programs_trainer_status', 'programs', '(trainer_id, status)');
        PERFORM create_index_if_not_exists('idx_programs_category_status', 'programs', '(category, status) WHERE status = ''published''');
    END IF;

    -- user_events índices
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_events' AND table_schema = 'public') THEN
        PERFORM create_index_if_not_exists('idx_user_events_event_data_gin', 'user_events', 'USING GIN (event_data)');
        PERFORM create_index_if_not_exists('idx_user_events_metadata_gin', 'user_events', 'USING GIN (metadata)');
        PERFORM create_index_if_not_exists('idx_user_events_user_type_created', 'user_events', '(user_id, event_type, created_at DESC)');
    END IF;

    -- reviews índices
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews' AND table_schema = 'public') THEN
        PERFORM create_index_if_not_exists('idx_reviews_review_data_gin', 'reviews', 'USING GIN (review_data)');
        PERFORM create_index_if_not_exists('idx_reviews_reviewed_status_rating', 'reviews', '(reviewed_id, status, rating DESC) WHERE status = ''published''');
    END IF;

    -- media_files índice (se existir)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'media_files' AND column_name = 'metadata'
    ) THEN
        PERFORM create_index_if_not_exists('idx_media_files_metadata_gin', 'media_files', 'USING GIN (metadata)');
    END IF;
END$$;

-- Limpar função auxiliar
DROP FUNCTION IF EXISTS create_index_if_not_exists(TEXT, TEXT, TEXT);

-- ============================================
-- 6. CONFIGURAÇÕES INICIAIS DE SISTEMA
-- ============================================

-- Configurações de esportes/modalidades
DO $$
BEGIN
    INSERT INTO platform_config (key, value, description, category, is_public) VALUES 
    ('sports_categories', '{
      "version": "1.0.0",
      "categories": [
        {
          "id": "fitness",
          "name": "Fitness & Musculação",
          "description": "Treinamento de força e condicionamento físico",
          "sports": ["musculacao", "crossfit", "funcional", "hiit", "powerlifting"],
          "icon": "dumbbell",
          "color": "#e0093e",
          "order": 1
        },
        {
          "id": "martial_arts", 
          "name": "Artes Marciais",
          "description": "Modalidades de combate e defesa pessoal",
          "sports": ["jiu_jitsu", "muay_thai", "boxe", "karate", "taekwondo"],
          "icon": "fist",
          "color": "#8B0000",
          "order": 2
        },
        {
          "id": "cardio",
          "name": "Atividades Cardiovasculares", 
          "description": "Exercícios aeróbicos e resistência",
          "sports": ["corrida", "ciclismo", "natacao", "remo", "spinning"],
          "icon": "heart",
          "color": "#FF6B35",
          "order": 3
        },
        {
          "id": "wellness",
          "name": "Bem-estar & Flexibilidade",
          "description": "Atividades focadas em relaxamento e flexibilidade",
          "sports": ["yoga", "pilates", "tai_chi", "meditacao", "alongamento"],
          "icon": "leaf",
          "color": "#4CAF50",
          "order": 4
        }
      ]
    }', 'Categorias e modalidades esportivas disponíveis na plataforma', 'sports', true)
    ON CONFLICT (key) DO UPDATE SET 
      value = EXCLUDED.value,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Configuração sports_categories inserida/atualizada';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ Erro ao inserir sports_categories (possivelmente já existe): %', SQLERRM;
END$$;

-- Templates de preços dinâmicos
DO $$
BEGIN
    INSERT INTO platform_config (key, value, description, category) VALUES
    ('pricing_templates', '{
      "version": "1.0.0",
      "templates": [
        {
          "id": "standard",
          "name": "Padrão Personal",
          "description": "Valores de mercado para personal trainer iniciante/intermediário",
          "pricing": {
            "individual": {"min": 80, "max": 200, "recommended": 120},
            "group": {"min": 40, "max": 100, "recommended": 60},
            "online": {"min": 60, "max": 150, "recommended": 90}
          },
          "location": "brasil"
        },
        {
          "id": "premium",
          "name": "Premium/Especializado",
          "description": "Valores para trainers especializados e experientes",
          "pricing": {
            "individual": {"min": 150, "max": 400, "recommended": 250},
            "group": {"min": 80, "max": 200, "recommended": 120},
            "online": {"min": 100, "max": 250, "recommended": 150}
          },
          "location": "brasil"
        }
      ]
    }', 'Templates de preços para diferentes categorias de treinadores', 'pricing')
    ON CONFLICT (key) DO UPDATE SET 
      value = EXCLUDED.value,
      updated_at = NOW();
    
    RAISE NOTICE '✅ Configuração pricing_templates inserida/atualizada';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ Erro ao inserir pricing_templates (possivelmente já existe): %', SQLERRM;
END$$;

-- ============================================
-- 7. TRIGGERS PARA AUTO-UPDATE
-- ============================================

-- Função para auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at (criar apenas se não existirem)
DO $$
BEGIN
    -- Trigger para programs
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_programs_updated_at'
    ) THEN
        CREATE TRIGGER update_programs_updated_at 
        BEFORE UPDATE ON programs 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '✅ Trigger update_programs_updated_at criado';
    ELSE
        RAISE NOTICE 'ℹ️ Trigger update_programs_updated_at já existe';
    END IF;

    -- Trigger para platform_config
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_platform_config_updated_at'
    ) THEN
        CREATE TRIGGER update_platform_config_updated_at 
        BEFORE UPDATE ON platform_config 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '✅ Trigger update_platform_config_updated_at criado';
    ELSE
        RAISE NOTICE 'ℹ️ Trigger update_platform_config_updated_at já existe';
    END IF;

    -- Trigger para reviews
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_reviews_updated_at'
    ) THEN
        CREATE TRIGGER update_reviews_updated_at 
        BEFORE UPDATE ON reviews 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE '✅ Trigger update_reviews_updated_at criado';
    ELSE
        RAISE NOTICE 'ℹ️ Trigger update_reviews_updated_at já existe';
    END IF;
END$$;

-- ============================================
-- 8. VERIFICAÇÕES FINAIS DE INTEGRIDADE
-- ============================================

DO $$
DECLARE
    user_profiles_has_profile_data BOOLEAN;
    trainer_profiles_has_configs BOOLEAN;
    programs_exists BOOLEAN;
    platform_config_has_sports BOOLEAN;
BEGIN
    -- Verificar colunas JSON
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'profile_data'
    ) INTO user_profiles_has_profile_data;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trainer_profiles' AND column_name = 'business_config'
    ) INTO trainer_profiles_has_configs;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'programs'
    ) INTO programs_exists;

    SELECT EXISTS (
        SELECT 1 FROM platform_config WHERE key = 'sports_categories'
    ) INTO platform_config_has_sports;

    -- Relatório final
    RAISE NOTICE '==========================================';
    RAISE NOTICE '📋 RELATÓRIO FINAL DA MIGRAÇÃO - FASE 1';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '✅ user_profiles.profile_data: %', CASE WHEN user_profiles_has_profile_data THEN 'OK' ELSE 'FALHOU' END;
    RAISE NOTICE '✅ trainer_profiles configs: %', CASE WHEN trainer_profiles_has_configs THEN 'OK' ELSE 'FALHOU' END;
    RAISE NOTICE '✅ Tabela programs: %', CASE WHEN programs_exists THEN 'OK' ELSE 'FALHOU' END;
    RAISE NOTICE '✅ Configurações iniciais: %', CASE WHEN platform_config_has_sports THEN 'OK' ELSE 'FALHOU' END;
    RAISE NOTICE '==========================================';

    IF NOT (user_profiles_has_profile_data AND trainer_profiles_has_configs AND programs_exists) THEN
        RAISE EXCEPTION 'ERRO: Migração não foi completada com sucesso!';
    END IF;

    RAISE NOTICE '🎉 SUCESSO: Migração Fase 1 concluída com êxito!';
END$$;

-- ============================================
-- 9. LOG DA MIGRAÇÃO
-- ============================================

-- Inserir log da migração
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Tentar encontrar um usuário admin ou usar NULL
    SELECT id INTO admin_user_id 
    FROM users 
    WHERE email LIKE '%admin%' OR email LIKE '%@test%' 
    LIMIT 1;

    -- Se não encontrar admin, usar o primeiro usuário
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM users LIMIT 1;
    END IF;

    -- Inserir evento de migração
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO user_events (user_id, event_type, event_data, metadata) VALUES (
          admin_user_id,
          'database_migration',
          '{"migration": "01-add-json-fields-fixed", "phase": "1", "status": "completed", "version": "1.0.1"}',
          '{"timestamp": "' || NOW() || '", "description": "Adicionado campos JSON para estrutura híbrida (versão corrigida)"}'
        );
        RAISE NOTICE '✅ Log de migração registrado para usuário %', admin_user_id;
    ELSE
        RAISE NOTICE 'ℹ️ Nenhum usuário encontrado para registrar log de migração';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ℹ️ Erro ao registrar log (não crítico): %', SQLERRM;
END$$;

COMMIT;

-- ============================================
-- 10. INSTRUÇÕES PÓS-MIGRAÇÃO
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '🎯 PRÓXIMOS PASSOS';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '1. ✅ Verificar dados migrados:';
    RAISE NOTICE '   SELECT profile_data FROM user_profiles WHERE profile_data != ''{}'' LIMIT 5;';
    RAISE NOTICE '';
    RAISE NOTICE '2. ✅ Verificar configurações:';
    RAISE NOTICE '   SELECT key, description FROM platform_config;';
    RAISE NOTICE '';
    RAISE NOTICE '3. ✅ Executar próxima fase:';
    RAISE NOTICE '   \i scripts/migration-sql/02-migrate-existing-data.sql';
    RAISE NOTICE '';
    RAISE NOTICE '4. ✅ Em caso de problemas, rollback disponível:';
    RAISE NOTICE '   -- Ver instruções no final do arquivo';
    RAISE NOTICE '==========================================';
END$$;

/*
==========================================
🚨 ROLLBACK INSTRUCTIONS (SE NECESSÁRIO)
==========================================

Para fazer rollback desta migração:

-- 1. Remover tabelas criadas
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS user_events CASCADE;
DROP TABLE IF EXISTS platform_config CASCADE;
DROP TABLE IF EXISTS programs CASCADE;

-- 2. Remover colunas JSON adicionadas
ALTER TABLE user_profiles DROP COLUMN IF EXISTS profile_data;
ALTER TABLE trainer_profiles DROP COLUMN IF EXISTS business_config;
ALTER TABLE trainer_profiles DROP COLUMN IF EXISTS service_config;
ALTER TABLE trainer_profiles DROP COLUMN IF EXISTS preferences;
ALTER TABLE media_files DROP COLUMN IF EXISTS metadata;

-- 3. Restaurar backups
DROP TABLE IF EXISTS user_profiles;
ALTER TABLE user_profiles_backup_20250115 RENAME TO user_profiles;

DROP TABLE IF EXISTS trainer_profiles;
ALTER TABLE trainer_profiles_backup_20250115 RENAME TO trainer_profiles;

-- E assim por diante para outras tabelas...

==========================================
*/