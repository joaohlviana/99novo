-- ============================================
-- MIGRAÇÃO HÍBRIDA - FASE 1: Adicionar Campos JSON
-- ============================================

-- Criar diretório de backup se não existir
-- Execute: mkdir -p /backup/$(date +%Y%m%d)

BEGIN;

-- ============================================
-- 1. BACKUP DAS TABELAS EXISTENTES
-- ============================================

-- Backup user_profiles
CREATE TABLE IF NOT EXISTS user_profiles_backup_20250115 AS 
SELECT * FROM user_profiles;

-- Backup trainer_profiles  
CREATE TABLE IF NOT EXISTS trainer_profiles_backup_20250115 AS 
SELECT * FROM trainer_profiles;

-- Backup media_files
CREATE TABLE IF NOT EXISTS media_files_backup_20250115 AS 
SELECT * FROM media_files;

-- ============================================
-- 2. ADICIONAR CAMPOS JSON ÀS TABELAS EXISTENTES
-- ============================================

-- Expandir user_profiles com dados flexíveis
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}';

-- Expandir trainer_profiles com configurações dinâmicas  
ALTER TABLE trainer_profiles 
ADD COLUMN IF NOT EXISTS business_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Expandir media_files com metadados JSON (verificar se tabela existe primeiro)
DO $
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_files' AND table_schema = 'public') THEN
        ALTER TABLE media_files ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
    END IF;
END$;

-- ============================================
-- 3. CRIAR NOVAS TABELAS HÍBRIDAS
-- ============================================

-- Tabela para programas com estrutura flexível
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}', -- Estrutura flexível do programa
  pricing JSONB DEFAULT '{}', -- Modelos de preço dinâmicos
  metadata JSONB DEFAULT '{}', -- Tags, dificuldade, duração
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices inline
  CONSTRAINT chk_programs_status CHECK (status IN ('draft', 'published', 'archived', 'suspended'))
);

-- Sistema de configurações globais
CREATE TABLE IF NOT EXISTS platform_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',
  description TEXT,
  category VARCHAR(50) DEFAULT 'general',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sistema de eventos/histórico flexível
CREATE TABLE IF NOT EXISTS user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  session_id UUID, -- Para rastrear sessões
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Particionamento por data (futuro)
  CONSTRAINT chk_event_type_format CHECK (event_type ~ '^[a-z_]+$')
);

-- Tabela para reviews/avaliações flexíveis
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_type VARCHAR(50) NOT NULL DEFAULT 'trainer_review',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  review_data JSONB DEFAULT '{}', -- Dados específicos por tipo de review
  status VARCHAR(20) DEFAULT 'published',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar auto-review
  CONSTRAINT chk_no_self_review CHECK (reviewer_id != reviewed_id),
  -- Um review por par de usuários
  UNIQUE(reviewer_id, reviewed_id, review_type)
);

-- ============================================
-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices GIN para busca em JSON
CREATE INDEX IF NOT EXISTS idx_user_profiles_profile_data_gin 
ON user_profiles USING GIN (profile_data);

CREATE INDEX IF NOT EXISTS idx_trainer_profiles_business_config_gin 
ON trainer_profiles USING GIN (business_config);

CREATE INDEX IF NOT EXISTS idx_trainer_profiles_service_config_gin 
ON trainer_profiles USING GIN (service_config);

CREATE INDEX IF NOT EXISTS idx_trainer_profiles_preferences_gin 
ON trainer_profiles USING GIN (preferences);

CREATE INDEX IF NOT EXISTS idx_programs_content_gin 
ON programs USING GIN (content);

CREATE INDEX IF NOT EXISTS idx_programs_metadata_gin 
ON programs USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_user_events_event_data_gin 
ON user_events USING GIN (event_data);

CREATE INDEX IF NOT EXISTS idx_user_events_metadata_gin 
ON user_events USING GIN (metadata);

-- Índice para media_files.metadata (só se tabela e coluna existirem)
DO $
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'media_files' 
        AND column_name = 'metadata'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_media_files_metadata_gin 
        ON public.media_files USING GIN (metadata);
    END IF;
END$;

CREATE INDEX IF NOT EXISTS idx_reviews_review_data_gin 
ON reviews USING GIN (review_data);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_programs_trainer_status 
ON programs(trainer_id, status);

CREATE INDEX IF NOT EXISTS idx_programs_category_status 
ON programs(category, status) WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_user_events_user_type_created 
ON user_events(user_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_status_rating 
ON reviews(reviewed_id, status, rating DESC) WHERE status = 'published';

-- ============================================
-- 5. CONFIGURAÇÕES INICIAIS DE SISTEMA
-- ============================================

-- Configurações de esportes/modalidades
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

-- Templates de preços dinâmicos
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
    },
    {
      "id": "elite",
      "name": "Elite/Celebrity",
      "description": "Valores para trainers renomados e celebridades",
      "pricing": {
        "individual": {"min": 300, "max": 1000, "recommended": 500},
        "group": {"min": 150, "max": 400, "recommended": 250},
        "online": {"min": 200, "max": 500, "recommended": 300}
      },
      "location": "brasil"
    }
  ]
}', 'Templates de preços para diferentes categorias de treinadores', 'pricing')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Configurações de sistema
INSERT INTO platform_config (key, value, description, category) VALUES
('system_settings', '{
  "version": "1.0.0",
  "features": {
    "chat_system": true,
    "video_calls": true,
    "payment_integration": true,
    "review_system": true,
    "certification_verification": true
  },
  "limits": {
    "max_gallery_images": 20,
    "max_program_duration_weeks": 52,
    "max_cities_per_trainer": 10,
    "max_specialties_per_trainer": 5
  },
  "defaults": {
    "session_duration_minutes": 60,
    "cancellation_policy_hours": 24,
    "booking_advance_days": 7,
    "review_moderation": true
  }
}', 'Configurações gerais do sistema e limites', 'system')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================
-- 6. TRIGGERS PARA AUTO-UPDATE
-- ============================================

-- Função para auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_programs_updated_at 
BEFORE UPDATE ON programs 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_config_updated_at 
BEFORE UPDATE ON platform_config 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
BEFORE UPDATE ON reviews 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. VERIFICAÇÕES DE INTEGRIDADE
-- ============================================

-- Verificar se as colunas foram criadas corretamente
DO $$
BEGIN
  -- Verificar user_profiles.profile_data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'profile_data'
  ) THEN
    RAISE EXCEPTION 'ERRO: Coluna profile_data não foi criada em user_profiles';
  END IF;

  -- Verificar trainer_profiles campos JSON
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trainer_profiles' AND column_name = 'business_config'
  ) THEN
    RAISE EXCEPTION 'ERRO: Coluna business_config não foi criada em trainer_profiles';
  END IF;

  -- Verificar se tabela programs foi criada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'programs'
  ) THEN
    RAISE EXCEPTION 'ERRO: Tabela programs não foi criada';
  END IF;

  -- Verificar se configurações foram inseridas
  IF NOT EXISTS (
    SELECT 1 FROM platform_config WHERE key = 'sports_categories'
  ) THEN
    RAISE EXCEPTION 'ERRO: Configurações iniciais não foram inseridas';
  END IF;

  RAISE NOTICE 'SUCESSO: Todas as verificações de integridade passaram!';
END$$;

-- ============================================
-- 8. LOG DA MIGRAÇÃO
-- ============================================

-- Inserir log da migração
INSERT INTO user_events (user_id, event_type, event_data, metadata) VALUES (
  (SELECT id FROM users WHERE email LIKE '%@admin%' LIMIT 1), -- Admin user
  'database_migration',
  '{"migration": "01-add-json-fields", "phase": "1", "status": "completed"}',
  '{"timestamp": "' || NOW() || '", "version": "1.0.0", "description": "Adicionado campos JSON para estrutura híbrida"}'
);

COMMIT;

-- ============================================
-- 9. INSTRUÇÕES PÓS-MIGRAÇÃO
-- ============================================

/*
SUCESSO! A migração foi concluída.

PRÓXIMOS PASSOS:
1. Verificar se todas as tabelas e colunas foram criadas:
   SELECT * FROM information_schema.columns WHERE table_name IN ('user_profiles', 'trainer_profiles', 'programs');

2. Verificar configurações inseridas:
   SELECT key, description FROM platform_config;

3. Executar próxima fase:
   \i scripts/migration-sql/02-migrate-existing-data.sql

4. Testar queries JSON:
   SELECT profile_data FROM user_profiles WHERE profile_data != '{}';

ROLLBACK (se necessário):
   DROP TABLE IF EXISTS programs, platform_config, user_events, reviews CASCADE;
   ALTER TABLE user_profiles DROP COLUMN IF EXISTS profile_data;
   ALTER TABLE trainer_profiles DROP COLUMN IF EXISTS business_config, service_config, preferences;
   ALTER TABLE media_files DROP COLUMN IF EXISTS metadata;
*/