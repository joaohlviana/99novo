-- ============================================
-- MIGRAÇÃO HÍBRIDA - FASE 3: Views e Functions
-- ============================================

BEGIN;

-- ============================================
-- 1. VIEWS PARA COMPATIBILIDADE COM CÓDIGO EXISTENTE
-- ============================================

-- View para trainer profiles com dados JSON "flattened"
CREATE OR REPLACE VIEW trainer_profiles_enhanced AS
SELECT 
  tp.user_id,
  tp.experience_years,
  tp.response_time_hours,
  tp.total_students,
  tp.service_mode,
  tp.created_at,
  tp.updated_at,
  
  -- Dados do service_config
  (tp.service_config->'availability'->>'booking_advance_days')::INTEGER as booking_advance_days,
  (tp.service_config->'availability'->>'booking_limit_days')::INTEGER as booking_limit_days,
  (tp.service_config->'service_modes'->'online'->>'enabled')::BOOLEAN as online_enabled,
  (tp.service_config->'service_modes'->'in_person'->>'enabled')::BOOLEAN as in_person_enabled,
  (tp.service_config->'service_modes'->'in_person'->>'travel_radius_km')::INTEGER as travel_radius_km,
  
  -- Dados do business_config
  (tp.business_config->'pricing'->'individual'->>'session_price')::DECIMAL as individual_session_price,
  (tp.business_config->'pricing'->'group'->>'price_per_person')::DECIMAL as group_price_per_person,
  (tp.business_config->'pricing'->'online'->>'session_price')::DECIMAL as online_session_price,
  (tp.business_config->'policies'->>'cancellation_hours')::INTEGER as cancellation_hours,
  
  -- Dados de preferências
  (tp.preferences->'notifications'->>'new_booking')::BOOLEAN as notify_new_booking,
  (tp.preferences->'privacy'->>'show_phone')::BOOLEAN as show_phone_public,
  
  -- JSON completos para uso avançado
  tp.service_config,
  tp.business_config,
  tp.preferences
FROM trainer_profiles tp;

-- View para user profiles com dados JSON "flattened"
CREATE OR REPLACE VIEW user_profiles_enhanced AS
SELECT 
  up.user_id,
  up.first_name,
  up.last_name,
  up.display_name,
  up.bio,
  up.avatar_url,
  up.instagram_url,
  up.city_id,
  up.created_at,
  up.updated_at,
  
  -- Dados do profile_data
  up.profile_data->'trainer'->'personal'->>'title' as trainer_title,
  up.profile_data->'trainer'->'personal'->>'instagram_url' as trainer_instagram,
  up.profile_data->'trainer'->'verification'->>'status' as verification_status,
  up.profile_data->'location'->>'address' as full_address,
  up.profile_data->'location'->>'cep' as cep,
  (up.profile_data->'location'->'coordinates'->>'lat')::DECIMAL as latitude,
  (up.profile_data->'location'->'coordinates'->>'lng')::DECIMAL as longitude,
  
  -- Client data
  up.profile_data->'client'->'fitness'->>'activity_level' as client_activity_level,
  up.profile_data->'client'->'preferences'->>'training_time' as preferred_training_time,
  
  -- JSON completo
  up.profile_data
FROM user_profiles up;

-- View para especialidades enriquecidas
CREATE OR REPLACE VIEW trainer_specialties_enhanced AS
SELECT 
  ts.trainer_id,
  ts.sport_id,
  ts.experience_level,
  ts.years_of_experience,
  ts.is_primary,
  ts.created_at,
  
  -- Dados do sport
  s.name as sport_name,
  s.category as sport_category,
  
  -- Dados do specialization_data
  ts.specialization_data->>'training_focus' as training_focus,
  ts.specialization_data->>'certification_level' as certification_level,
  (ts.specialization_data->>'years_experience')::INTEGER as detailed_years_experience,
  ts.specialization_data->'client_types' as target_client_types,
  ts.specialization_data->'equipment_expertise' as equipment_expertise,
  
  -- JSON completo
  ts.specialization_data
FROM trainer_specialties ts
JOIN sports s ON s.id = ts.sport_id;

-- View para relatórios e analytics
CREATE OR REPLACE VIEW trainer_analytics AS
SELECT 
  u.id as trainer_id,
  u.email,
  up.display_name,
  up.created_at as profile_created,
  
  -- Estatísticas básicas
  tp.total_students,
  tp.experience_years,
  
  -- Preços
  (tp.business_config->'pricing'->'individual'->>'session_price')::DECIMAL as price_individual,
  (tp.business_config->'pricing'->'group'->>'price_per_person')::DECIMAL as price_group,
  (tp.business_config->'pricing'->'online'->>'session_price')::DECIMAL as price_online,
  
  -- Modalidades de serviço
  CASE 
    WHEN (tp.service_config->'service_modes'->'online'->>'enabled')::BOOLEAN AND 
         (tp.service_config->'service_modes'->'in_person'->>'enabled')::BOOLEAN THEN 'both'
    WHEN (tp.service_config->'service_modes'->'online'->>'enabled')::BOOLEAN THEN 'online'
    WHEN (tp.service_config->'service_modes'->'in_person'->>'enabled')::BOOLEAN THEN 'in_person'
    ELSE 'none'
  END as service_modes,
  
  -- Especialidades (agregadas)
  COALESCE(spec_agg.specialties_count, 0) as specialties_count,
  spec_agg.primary_specialties,
  
  -- Cidades de atendimento
  COALESCE(cities_agg.cities_count, 0) as cities_count,
  cities_agg.city_names,
  
  -- Status de verificação
  up.profile_data->'trainer'->'verification'->>'status' as verification_status,
  
  -- Última atividade
  GREATEST(u.updated_at, up.updated_at, tp.updated_at) as last_activity
  
FROM users u
JOIN user_profiles up ON up.user_id = u.id
JOIN trainer_profiles tp ON tp.user_id = u.id
LEFT JOIN (
  SELECT 
    trainer_id,
    COUNT(*) as specialties_count,
    array_agg(s.name ORDER BY ts.is_primary DESC, s.name) as primary_specialties
  FROM trainer_specialties ts
  JOIN sports s ON s.id = ts.sport_id
  GROUP BY trainer_id
) spec_agg ON spec_agg.trainer_id = u.id
LEFT JOIN (
  SELECT 
    trainer_id,
    COUNT(*) as cities_count,
    array_agg(c.name || ', ' || st.code ORDER BY c.name) as city_names
  FROM trainer_service_cities tsc
  JOIN cities c ON c.id = tsc.city_id
  JOIN states st ON st.id = c.state_id
  GROUP BY trainer_id
) cities_agg ON cities_agg.trainer_id = u.id;

-- ============================================
-- 2. FUNCTIONS PARA OPERAÇÕES COMUNS
-- ============================================

-- Função para buscar trainers por filtros JSON
CREATE OR REPLACE FUNCTION search_trainers_enhanced(
  p_sport_ids UUID[] DEFAULT NULL,
  p_city_ids UUID[] DEFAULT NULL,
  p_min_price DECIMAL DEFAULT NULL,
  p_max_price DECIMAL DEFAULT NULL,
  p_service_mode VARCHAR DEFAULT NULL,
  p_experience_level VARCHAR DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  trainer_id UUID,
  display_name VARCHAR,
  bio TEXT,
  avatar_url VARCHAR,
  verification_status VARCHAR,
  experience_years INTEGER,
  individual_price DECIMAL,
  group_price DECIMAL,
  online_price DECIMAL,
  service_modes VARCHAR,
  specialties_json JSONB,
  cities_json JSONB,
  rating DECIMAL,
  total_reviews INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ta.trainer_id,
    ta.display_name::VARCHAR,
    up.bio,
    up.avatar_url::VARCHAR,
    ta.verification_status::VARCHAR,
    ta.experience_years,
    ta.price_individual,
    ta.price_group,
    ta.price_online,
    ta.service_modes::VARCHAR,
    
    -- Especialidades como JSON
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'sport_id', tse.sport_id,
          'sport_name', tse.sport_name,
          'experience_level', tse.experience_level,
          'training_focus', tse.training_focus,
          'is_primary', tse.is_primary
        )
      )
      FROM trainer_specialties_enhanced tse 
      WHERE tse.trainer_id = ta.trainer_id),
      '[]'::jsonb
    ) as specialties_json,
    
    -- Cidades como JSON
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'city_id', tsc.city_id,
          'city_name', c.name,
          'state_code', st.code
        )
      )
      FROM trainer_service_cities tsc
      JOIN cities c ON c.id = tsc.city_id  
      JOIN states st ON st.id = c.state_id
      WHERE tsc.trainer_id = ta.trainer_id),
      '[]'::jsonb
    ) as cities_json,
    
    -- Rating médio
    COALESCE(
      (SELECT AVG(r.rating)::DECIMAL 
       FROM reviews r 
       WHERE r.reviewed_id = ta.trainer_id AND r.status = 'published'),
      0.0
    ) as rating,
    
    -- Total de reviews
    COALESCE(
      (SELECT COUNT(*)::INTEGER 
       FROM reviews r 
       WHERE r.reviewed_id = ta.trainer_id AND r.status = 'published'),
      0
    ) as total_reviews
    
  FROM trainer_analytics ta
  JOIN user_profiles up ON up.user_id = ta.trainer_id
  WHERE 
    -- Filtro por esportes
    (p_sport_ids IS NULL OR EXISTS (
      SELECT 1 FROM trainer_specialties ts 
      WHERE ts.trainer_id = ta.trainer_id 
      AND ts.sport_id = ANY(p_sport_ids)
    ))
    
    -- Filtro por cidades
    AND (p_city_ids IS NULL OR EXISTS (
      SELECT 1 FROM trainer_service_cities tsc 
      WHERE tsc.trainer_id = ta.trainer_id 
      AND tsc.city_id = ANY(p_city_ids)
    ))
    
    -- Filtro por preço (individual)
    AND (p_min_price IS NULL OR ta.price_individual >= p_min_price)
    AND (p_max_price IS NULL OR ta.price_individual <= p_max_price)
    
    -- Filtro por modalidade de serviço
    AND (p_service_mode IS NULL OR 
         ta.service_modes = p_service_mode OR 
         ta.service_modes = 'both')
    
    -- Filtro por nível de experiência
    AND (p_experience_level IS NULL OR 
         (p_experience_level = 'beginner' AND ta.experience_years <= 2) OR
         (p_experience_level = 'intermediate' AND ta.experience_years BETWEEN 3 AND 5) OR
         (p_experience_level = 'advanced' AND ta.experience_years > 5))
  
  ORDER BY 
    ta.verification_status DESC,
    rating DESC,
    ta.total_students DESC,
    ta.last_activity DESC
  
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar dados JSON do perfil
CREATE OR REPLACE FUNCTION update_trainer_profile_json(
  p_user_id UUID,
  p_section VARCHAR,
  p_data JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_config JSONB;
  v_updated_config JSONB;
BEGIN
  CASE p_section
    WHEN 'profile_data' THEN
      SELECT profile_data INTO v_current_config 
      FROM user_profiles WHERE user_id = p_user_id;
      
      v_updated_config := v_current_config || p_data;
      
      UPDATE user_profiles 
      SET profile_data = v_updated_config,
          updated_at = NOW()
      WHERE user_id = p_user_id;
      
    WHEN 'service_config' THEN
      SELECT service_config INTO v_current_config 
      FROM trainer_profiles WHERE user_id = p_user_id;
      
      v_updated_config := v_current_config || p_data;
      
      UPDATE trainer_profiles 
      SET service_config = v_updated_config,
          updated_at = NOW()
      WHERE user_id = p_user_id;
      
    WHEN 'business_config' THEN
      SELECT business_config INTO v_current_config 
      FROM trainer_profiles WHERE user_id = p_user_id;
      
      v_updated_config := v_current_config || p_data;
      
      UPDATE trainer_profiles 
      SET business_config = v_updated_config,
          updated_at = NOW()
      WHERE user_id = p_user_id;
      
    WHEN 'preferences' THEN
      SELECT preferences INTO v_current_config 
      FROM trainer_profiles WHERE user_id = p_user_id;
      
      v_updated_config := v_current_config || p_data;
      
      UPDATE trainer_profiles 
      SET preferences = v_updated_config,
          updated_at = NOW()
      WHERE user_id = p_user_id;
      
    ELSE
      RAISE EXCEPTION 'Seção inválida: %', p_section;
  END CASE;
  
  -- Log da atualização
  INSERT INTO user_events (user_id, event_type, event_data, metadata) VALUES (
    p_user_id,
    'profile_updated',
    jsonb_build_object(
      'section', p_section,
      'updated_fields', jsonb_object_keys(p_data),
      'timestamp', NOW()
    ),
    jsonb_build_object(
      'source', 'profile_management',
      'automated', false
    )
  );
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Função para validar dados JSON do perfil
CREATE OR REPLACE FUNCTION validate_trainer_profile_json(
  p_section VARCHAR,
  p_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_errors JSONB := '[]'::jsonb;
  v_warnings JSONB := '[]'::jsonb;
BEGIN
  CASE p_section
    WHEN 'business_config' THEN
      -- Validar preços
      IF (p_data->'pricing'->'individual'->>'session_price')::DECIMAL < 0 THEN
        v_errors := v_errors || '["Preço individual não pode ser negativo"]'::jsonb;
      END IF;
      
      IF (p_data->'pricing'->'individual'->>'session_price')::DECIMAL > 1000 THEN
        v_warnings := v_warnings || '["Preço individual muito alto (>R$1000)"]'::jsonb;
      END IF;
      
      -- Validar política de cancelamento
      IF (p_data->'policies'->>'cancellation_hours')::INTEGER < 1 THEN
        v_errors := v_errors || '["Política de cancelamento deve ser de pelo menos 1 hora"]'::jsonb;
      END IF;
      
    WHEN 'service_config' THEN
      -- Validar configurações de agendamento
      IF (p_data->'availability'->>'booking_advance_days')::INTEGER < 1 THEN
        v_errors := v_errors || '["Antecedência mínima deve ser de pelo menos 1 dia"]'::jsonb;
      END IF;
      
      -- Verificar se pelo menos uma modalidade está habilitada
      IF NOT (
        (p_data->'service_modes'->'online'->>'enabled')::BOOLEAN OR 
        (p_data->'service_modes'->'in_person'->>'enabled')::BOOLEAN
      ) THEN
        v_errors := v_errors || '["Pelo menos uma modalidade de atendimento deve estar habilitada"]'::jsonb;
      END IF;
      
  END CASE;
  
  RETURN jsonb_build_object(
    'valid', jsonb_array_length(v_errors) = 0,
    'errors', v_errors,
    'warnings', v_warnings
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. TRIGGERS PARA MANTER CONSISTÊNCIA
-- ============================================

-- Função para sincronizar dados JSON com campos relacionais
CREATE OR REPLACE FUNCTION sync_json_to_relational()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar campos relacionais baseados no JSON para compatibilidade
  IF TG_TABLE_NAME = 'trainer_profiles' THEN
    IF NEW.service_config IS DISTINCT FROM OLD.service_config THEN
      -- Atualizar service_mode baseado no JSON
      NEW.service_mode := CASE 
        WHEN (NEW.service_config->'service_modes'->'online'->>'enabled')::BOOLEAN AND 
             (NEW.service_config->'service_modes'->'in_person'->>'enabled')::BOOLEAN THEN 'both'
        WHEN (NEW.service_config->'service_modes'->'online'->>'enabled')::BOOLEAN THEN 'online'
        WHEN (NEW.service_config->'service_modes'->'in_person'->>'enabled')::BOOLEAN THEN 'in_person'
        ELSE 'both'
      END;
      
      -- Atualizar response_time_hours
      NEW.response_time_hours := COALESCE(
        (NEW.service_config->'contact'->>'response_time_hours')::INTEGER,
        NEW.response_time_hours
      );
    END IF;
    
    -- Atualizar total_students baseado no business_config
    IF NEW.business_config IS DISTINCT FROM OLD.business_config THEN
      NEW.total_students := COALESCE(
        (NEW.business_config->'statistics'->>'total_students')::INTEGER,
        NEW.total_students
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER sync_trainer_profiles_json_to_relational
  BEFORE UPDATE ON trainer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_json_to_relational();

-- ============================================
-- 4. STORED PROCEDURES PARA OPERAÇÕES COMPLEXAS
-- ============================================

-- Procedure para setup completo de novo trainer
CREATE OR REPLACE FUNCTION setup_new_trainer(
  p_user_id UUID,
  p_basic_info JSONB DEFAULT NULL,
  p_service_config JSONB DEFAULT NULL,
  p_business_config JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_template JSONB;
  v_result JSONB;
BEGIN
  -- Buscar template padrão
  SELECT value INTO v_template 
  FROM platform_config 
  WHERE key = 'new_trainer_template';
  
  -- Merge com dados fornecidos
  IF p_basic_info IS NOT NULL THEN
    v_template := jsonb_set(v_template, '{profile_data}', 
      v_template->'profile_data' || p_basic_info);
  END IF;
  
  IF p_service_config IS NOT NULL THEN
    v_template := jsonb_set(v_template, '{service_config}', 
      v_template->'service_config' || p_service_config);
  END IF;
  
  IF p_business_config IS NOT NULL THEN
    v_template := jsonb_set(v_template, '{business_config}', 
      v_template->'business_config' || p_business_config);
  END IF;
  
  -- Aplicar configurações
  UPDATE user_profiles 
  SET profile_data = v_template->'profile_data'
  WHERE user_id = p_user_id;
  
  INSERT INTO trainer_profiles (
    user_id, 
    service_config, 
    business_config, 
    preferences
  ) VALUES (
    p_user_id,
    v_template->'service_config',
    v_template->'business_config',
    '{"notifications": {"new_booking": true}, "privacy": {"show_phone": false}}'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE SET
    service_config = EXCLUDED.service_config,
    business_config = EXCLUDED.business_config;
  
  -- Log do setup
  INSERT INTO user_events (user_id, event_type, event_data, metadata) VALUES (
    p_user_id,
    'trainer_setup_completed',
    jsonb_build_object(
      'template_used', 'new_trainer_template',
      'custom_data_provided', p_basic_info IS NOT NULL OR p_service_config IS NOT NULL OR p_business_config IS NOT NULL
    ),
    jsonb_build_object('source', 'setup_procedure', 'automated', true)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Trainer setup concluído com sucesso',
    'user_id', p_user_id
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'user_id', p_user_id
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. ÍNDICES PARA PERFORMANCE DAS VIEWS
-- ============================================

-- Índices para melhorar performance das views
CREATE INDEX IF NOT EXISTS idx_trainer_analytics_price_range 
ON trainer_profiles ((business_config->'pricing'->'individual'->>'session_price'));

CREATE INDEX IF NOT EXISTS idx_trainer_analytics_service_modes 
ON trainer_profiles (
  (service_config->'service_modes'->'online'->>'enabled'),
  (service_config->'service_modes'->'in_person'->>'enabled')
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_verification 
ON user_profiles ((profile_data->'trainer'->'verification'->>'status'));

COMMIT;

-- ============================================
-- 6. TESTES E VERIFICAÇÕES
-- ============================================

-- Testar função de busca
/*
SELECT * FROM search_trainers_enhanced(
  p_sport_ids := NULL,
  p_city_ids := NULL,
  p_min_price := 50,
  p_max_price := 200,
  p_service_mode := 'both',
  p_limit := 5
);
*/

-- Testar view de analytics
/*
SELECT 
  trainer_id,
  display_name,
  service_modes,
  price_individual,
  specialties_count,
  cities_count,
  verification_status
FROM trainer_analytics 
LIMIT 5;
*/

-- Log final
INSERT INTO user_events (user_id, event_type, event_data, metadata) VALUES (
  (SELECT id FROM users WHERE email LIKE '%@admin%' LIMIT 1),
  'database_migration',
  '{"migration": "03-create-views-and-functions", "phase": "3", "status": "completed"}',
  '{"timestamp": "' || NOW() || '", "version": "1.0.0", "description": "Views, functions e procedures criados para banco híbrido"}'
);

/*
PRÓXIMOS PASSOS:
1. Testar todas as views e functions criadas
2. Atualizar código da aplicação para usar as novas views
3. Executar testes de performance
4. Implementar monitoring das queries JSON
5. Documentar APIs das novas functions
*/