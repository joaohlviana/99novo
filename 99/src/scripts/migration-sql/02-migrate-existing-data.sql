-- ============================================
-- MIGRAÇÃO HÍBRIDA - FASE 2: Migrar Dados Existentes
-- ============================================

BEGIN;

-- ============================================
-- 1. MIGRAR DADOS USER_PROFILES PARA JSON
-- ============================================

-- Migrar dados existentes para profile_data JSON
UPDATE user_profiles SET profile_data = jsonb_build_object(
  'version', '1.0.0',
  'migrated_at', NOW(),
  'trainer', jsonb_build_object(
    'personal', jsonb_build_object(
      'instagram_url', COALESCE(instagram_url, ''),
      'title', 'Personal Trainer',
      'display_name', COALESCE(display_name, first_name || ' ' || last_name, ''),
      'full_name', COALESCE(first_name || ' ' || last_name, display_name, '')
    ),
    'verification', jsonb_build_object(
      'status', 'pending',
      'documents', '[]'::jsonb,
      'verified_at', null
    )
  ),
  'client', jsonb_build_object(
    'fitness', jsonb_build_object(
      'goals', '[]'::jsonb,
      'activity_level', 'not_specified',
      'restrictions', '[]'::jsonb
    ),
    'preferences', jsonb_build_object(
      'training_time', 'flexible',
      'intensity', 'moderate'
    )
  ),
  'location', jsonb_build_object(
    'address', '',
    'complement', '',
    'cep', '',
    'coordinates', jsonb_build_object(
      'lat', null,
      'lng', null
    )
  )
) WHERE profile_data = '{}'::jsonb;

-- ============================================
-- 2. MIGRAR DADOS TRAINER_PROFILES PARA JSON
-- ============================================

-- Migrar service_config
UPDATE trainer_profiles SET service_config = jsonb_build_object(
  'version', '1.0.0',
  'migrated_at', NOW(),
  'availability', jsonb_build_object(
    'schedule', jsonb_build_object(
      'monday', '[]'::jsonb,
      'tuesday', '[]'::jsonb,
      'wednesday', '[]'::jsonb,
      'thursday', '[]'::jsonb,
      'friday', '[]'::jsonb,
      'saturday', '[]'::jsonb,
      'sunday', '[]'::jsonb
    ),
    'time_zone', 'America/Sao_Paulo',
    'booking_advance_days', 7,
    'booking_limit_days', 30,
    'auto_accept_bookings', false
  ),
  'service_modes', jsonb_build_object(
    'online', jsonb_build_object(
      'enabled', CASE WHEN service_mode IN ('online', 'both') THEN true ELSE false END,
      'platforms', '["zoom", "meet"]'::jsonb,
      'equipment_required', '["webcam", "stable_internet"]'::jsonb
    ),
    'in_person', jsonb_build_object(
      'enabled', CASE WHEN service_mode IN ('in_person', 'both') THEN true ELSE false END,
      'travel_radius_km', 20,
      'travel_fee_per_km', 0,
      'locations', '["client_home", "gym", "park"]'::jsonb
    )
  ),
  'specializations', jsonb_build_object(
    'primary', '[]'::jsonb,
    'secondary', '[]'::jsonb,
    'certifications_mapping', '{}'::jsonb
  ),
  'contact', jsonb_build_object(
    'response_time_hours', COALESCE(response_time_hours, 24),
    'preferred_contact', 'whatsapp',
    'emergency_contact', false
  )
) WHERE service_config = '{}'::jsonb;

-- Migrar business_config
UPDATE trainer_profiles SET business_config = jsonb_build_object(
  'version', '1.0.0',
  'migrated_at', NOW(),
  'pricing', jsonb_build_object(
    'individual', jsonb_build_object(
      'session_price', 150,
      'session_duration_minutes', 60,
      'package_discounts', jsonb_build_object(
        '4_sessions', 5,
        '8_sessions', 10,
        '12_sessions', 15
      )
    ),
    'group', jsonb_build_object(
      'max_participants', 6,
      'price_per_person', 50,
      'session_duration_minutes', 60
    ),
    'online', jsonb_build_object(
      'session_price', 100,
      'platform_fee_percentage', 10,
      'session_duration_minutes', 60
    )
  ),
  'policies', jsonb_build_object(
    'cancellation_hours', 24,
    'rescheduling_hours', 12,
    'late_fee_percentage', 50,
    'no_show_policy', 'charge_full',
    'refund_policy', 'case_by_case'
  ),
  'payment', jsonb_build_object(
    'methods', '["pix", "card", "bank_transfer"]'::jsonb,
    'payment_terms', 'advance',
    'invoice_auto_generate', true,
    'payment_deadline_days', 7,
    'late_payment_fee', 10
  ),
  'statistics', jsonb_build_object(
    'total_students', COALESCE(total_students, 0),
    'experience_years', COALESCE(experience_years, 0),
    'completion_rate', 95.0,
    'punctuality_rate', 98.0
  )
) WHERE business_config = '{}'::jsonb;

-- Migrar preferences
UPDATE trainer_profiles SET preferences = jsonb_build_object(
  'version', '1.0.0',
  'migrated_at', NOW(),
  'notifications', jsonb_build_object(
    'new_booking', true,
    'booking_reminder', true,
    'payment_received', true,
    'review_received', true,
    'system_updates', false
  ),
  'privacy', jsonb_build_object(
    'show_phone', false,
    'show_email', false,
    'show_address', false,
    'allow_direct_contact', true
  ),
  'marketing', jsonb_build_object(
    'featured_listing', false,
    'promotional_emails', true,
    'partner_offers', false
  ),
  'calendar', jsonb_build_object(
    'sync_external', false,
    'external_calendar_url', '',
    'buffer_time_minutes', 15
  )
) WHERE preferences = '{}'::jsonb;

-- ============================================
-- 3. MIGRAR SPECIALTIES PARA FORMATO AVANÇADO
-- ============================================

-- Atualizar trainer_specialties com dados mais ricos
-- (Adicionar colunas se não existirem)
ALTER TABLE trainer_specialties 
ADD COLUMN IF NOT EXISTS specialization_data JSONB DEFAULT '{}';

-- Migrar dados de especialidades existentes
UPDATE trainer_specialties SET specialization_data = jsonb_build_object(
  'version', '1.0.0',
  'migrated_at', NOW(),
  'certification_level', CASE 
    WHEN experience_level = 'expert' THEN 'advanced'
    WHEN experience_level = 'advanced' THEN 'intermediate' 
    ELSE 'basic'
  END,
  'training_focus', CASE
    WHEN (SELECT name FROM sports WHERE id = sport_id) ILIKE '%muscula%' THEN 'strength'
    WHEN (SELECT name FROM sports WHERE id = sport_id) ILIKE '%cardio%' THEN 'cardio'
    WHEN (SELECT name FROM sports WHERE id = sport_id) ILIKE '%yoga%' THEN 'flexibility'
    WHEN (SELECT name FROM sports WHERE id = sport_id) ILIKE '%funcional%' THEN 'functional'
    ELSE 'general'
  END,
  'client_types', '["beginners", "intermediates"]'::jsonb,
  'special_populations', '[]'::jsonb,
  'equipment_expertise', '["basic", "free_weights"]'::jsonb,
  'years_experience', COALESCE(years_of_experience, 1),
  'success_stories', 0,
  'continuing_education', '[]'::jsonb
) WHERE specialization_data = '{}'::jsonb;

-- ============================================
-- 4. CRIAR DADOS INICIAIS PARA NOVOS USUÁRIOS
-- ============================================

-- Template para novos trainers
INSERT INTO platform_config (key, value, description, category) VALUES
('new_trainer_template', '{
  "version": "1.0.0",
  "profile_data": {
    "trainer": {
      "personal": {
        "title": "Personal Trainer",
        "instagram_url": "",
        "youtube_url": ""
      },
      "verification": {
        "status": "pending",
        "documents": []
      }
    },
    "location": {
      "address": "",
      "complement": "",
      "cep": ""
    }
  },
  "service_config": {
    "availability": {
      "booking_advance_days": 7,
      "booking_limit_days": 30
    },
    "service_modes": {
      "online": {"enabled": true},
      "in_person": {"enabled": true}
    }
  },
  "business_config": {
    "pricing": {
      "individual": {"session_price": 120},
      "group": {"price_per_person": 60},
      "online": {"session_price": 90}
    },
    "policies": {
      "cancellation_hours": 24
    }
  }
}', 'Template de dados iniciais para novos treinadores', 'templates')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Template para novos clients
INSERT INTO platform_config (key, value, description, category) VALUES
('new_client_template', '{
  "version": "1.0.0",
  "profile_data": {
    "client": {
      "fitness": {
        "goals": [],
        "activity_level": "not_specified",
        "restrictions": []
      },
      "preferences": {
        "training_time": "flexible",
        "intensity": "moderate",
        "budget_range": {
          "min": 80,
          "max": 200
        }
      }
    }
  }
}', 'Template de dados iniciais para novos clientes', 'templates')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- ============================================
-- 5. CRIAR EVENTOS DE MIGRAÇÃO
-- ============================================

-- Registrar evento de migração para cada usuário atualizado
INSERT INTO user_events (user_id, event_type, event_data, metadata)
SELECT 
  up.user_id,
  'profile_migrated',
  jsonb_build_object(
    'migration_phase', '2',
    'data_migrated', jsonb_build_object(
      'profile_data', true,
      'trainer_configs', CASE WHEN tp.user_id IS NOT NULL THEN true ELSE false END,
      'specialties', CASE WHEN ts.trainer_id IS NOT NULL THEN true ELSE false END
    ),
    'migration_timestamp', NOW()
  ),
  jsonb_build_object(
    'source', 'database_migration',
    'automated', true,
    'version', '1.0.0'
  )
FROM user_profiles up
LEFT JOIN trainer_profiles tp ON tp.user_id = up.user_id
LEFT JOIN trainer_specialties ts ON ts.trainer_id = up.user_id
WHERE up.profile_data->>'migrated_at' IS NOT NULL;

-- ============================================
-- 6. ANÁLISE E RELATÓRIOS PÓS-MIGRAÇÃO
-- ============================================

-- Relatório de migração
DO $$
DECLARE
  total_profiles INTEGER;
  migrated_profiles INTEGER;
  trainer_profiles INTEGER;
  specialties_migrated INTEGER;
BEGIN
  -- Contar perfis
  SELECT COUNT(*) INTO total_profiles FROM user_profiles;
  SELECT COUNT(*) INTO migrated_profiles FROM user_profiles WHERE profile_data != '{}';
  SELECT COUNT(*) INTO trainer_profiles FROM trainer_profiles WHERE service_config != '{}';
  SELECT COUNT(*) INTO specialties_migrated FROM trainer_specialties WHERE specialization_data != '{}';
  
  -- Log do relatório
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'RELATÓRIO DE MIGRAÇÃO - FASE 2';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Total de perfis: %', total_profiles;
  RAISE NOTICE 'Perfis migrados: %', migrated_profiles;
  RAISE NOTICE 'Trainer profiles com config: %', trainer_profiles;
  RAISE NOTICE 'Especialidades migradas: %', specialties_migrated;
  RAISE NOTICE '==========================================';
  
  -- Verificar integridade
  IF migrated_profiles = 0 THEN
    RAISE EXCEPTION 'ERRO: Nenhum perfil foi migrado!';
  END IF;
  
  RAISE NOTICE 'SUCESSO: Migração de dados concluída!';
END$$;

-- ============================================
-- 7. ÍNDICES ESPECÍFICOS PARA DADOS MIGRADOS
-- ============================================

-- Índices para campos JSON migrados
CREATE INDEX IF NOT EXISTS idx_profile_data_trainer_personal 
ON user_profiles USING GIN ((profile_data->'trainer'->'personal'));

CREATE INDEX IF NOT EXISTS idx_service_config_availability 
ON trainer_profiles USING GIN ((service_config->'availability'));

CREATE INDEX IF NOT EXISTS idx_business_config_pricing 
ON trainer_profiles USING GIN ((business_config->'pricing'));

-- Índices para queries comuns pós-migração
CREATE INDEX IF NOT EXISTS idx_trainers_with_online_service 
ON trainer_profiles ((service_config->'service_modes'->'online'->>'enabled')) 
WHERE service_config->'service_modes'->'online'->>'enabled' = 'true';

CREATE INDEX IF NOT EXISTS idx_specialties_by_focus 
ON trainer_specialties ((specialization_data->>'training_focus'));

COMMIT;

-- ============================================
-- 8. VERIFICAÇÕES FINAIS
-- ============================================

-- Query para verificar dados migrados
/*
-- Verificar perfis migrados
SELECT 
  user_id,
  profile_data->'version' as version,
  profile_data->'trainer'->'personal'->>'title' as title,
  profile_data->'migrated_at' as migrated_at
FROM user_profiles 
WHERE profile_data != '{}' 
LIMIT 5;

-- Verificar configs de trainer
SELECT 
  user_id,
  service_config->'version' as version,
  service_config->'service_modes'->'online'->>'enabled' as online_enabled,
  business_config->'pricing'->'individual'->>'session_price' as price
FROM trainer_profiles 
WHERE service_config != '{}' 
LIMIT 5;

-- Verificar especialidades
SELECT 
  trainer_id,
  sport_id,
  specialization_data->>'training_focus' as focus,
  specialization_data->>'certification_level' as level
FROM trainer_specialties 
WHERE specialization_data != '{}' 
LIMIT 5;
*/

-- Log final
INSERT INTO user_events (user_id, event_type, event_data, metadata) VALUES (
  (SELECT id FROM users WHERE email LIKE '%@admin%' LIMIT 1),
  'database_migration',
  '{"migration": "02-migrate-existing-data", "phase": "2", "status": "completed"}',
  '{"timestamp": "' || NOW() || '", "version": "1.0.0", "description": "Dados existentes migrados para formato JSON híbrido"}'
);

/*
PRÓXIMOS PASSOS:
1. Executar queries de verificação acima
2. Executar fase 3: \i scripts/migration-sql/03-create-views-and-functions.sql
3. Atualizar código da aplicação para usar novos campos
4. Testar funcionalidades críticas
*/