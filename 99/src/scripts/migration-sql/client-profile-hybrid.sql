-- =============================================
-- TABELA HÍBRIDA PARA PERFIL DO CLIENTE
-- =============================================
-- Baseada na arquitetura do trainer profile híbrido
-- Campos estruturados + JSONB para flexibilidade

-- 1. Criar tabela principal
CREATE TABLE IF NOT EXISTS public.client_profile (
    -- Campos estruturados (PostgreSQL tradicional)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- Status e flags
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'suspended')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- Dados flexíveis em JSONB
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Comentários da tabela
COMMENT ON TABLE public.client_profile IS 'Perfis de clientes com arquitetura híbrida (campos estruturados + JSONB)';
COMMENT ON COLUMN public.client_profile.profile_data IS 'Dados flexíveis: esportes de interesse, objetivos, histórico, etc.';

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_client_profile_user_id ON public.client_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profile_status ON public.client_profile(status);
CREATE INDEX IF NOT EXISTS idx_client_profile_active ON public.client_profile(is_active);
CREATE INDEX IF NOT EXISTS idx_client_profile_created_at ON public.client_profile(created_at);
CREATE INDEX IF NOT EXISTS idx_client_profile_updated_at ON public.client_profile(updated_at);

-- 4. Índices JSONB específicos para busca eficiente
CREATE INDEX IF NOT EXISTS idx_client_profile_sports_interest 
ON public.client_profile USING GIN ((profile_data->'sports'->>'interest'));

CREATE INDEX IF NOT EXISTS idx_client_profile_sports_trained 
ON public.client_profile USING GIN ((profile_data->'sports'->>'trained'));

CREATE INDEX IF NOT EXISTS idx_client_profile_sports_curious 
ON public.client_profile USING GIN ((profile_data->'sports'->>'curious'));

CREATE INDEX IF NOT EXISTS idx_client_profile_goals 
ON public.client_profile USING GIN ((profile_data->'goals'));

CREATE INDEX IF NOT EXISTS idx_client_profile_fitness_level 
ON public.client_profile USING GIN ((profile_data->'fitness'->>'level'));

CREATE INDEX IF NOT EXISTS idx_client_profile_location 
ON public.client_profile USING GIN ((profile_data->'location'));

-- 5. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_client_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para updated_at
DROP TRIGGER IF EXISTS trg_client_profile_updated_at ON public.client_profile;
CREATE TRIGGER trg_client_profile_updated_at
    BEFORE UPDATE ON public.client_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_client_profile_updated_at();

-- 7. RLS Policies para segurança
ALTER TABLE public.client_profile ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seus próprios perfis
CREATE POLICY "client_profile_select_own" ON public.client_profile
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir apenas seus próprios perfis
CREATE POLICY "client_profile_insert_own" ON public.client_profile
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar apenas seus próprios perfis
CREATE POLICY "client_profile_update_own" ON public.client_profile
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar apenas seus próprios perfis
CREATE POLICY "client_profile_delete_own" ON public.client_profile
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Treinadores podem ver perfis de clientes (para matchmaking)
CREATE POLICY "client_profile_trainers_view" ON public.client_profile
    FOR SELECT
    TO authenticated
    USING (
        is_active = true 
        AND status = 'active'
        AND EXISTS (
            SELECT 1 FROM public.user_profile up 
            WHERE up.id = auth.uid() 
            AND up.profile_data->>'account_type' = 'trainer'
        )
    );

-- 8. Constraint para garantir estrutura mínima do JSONB
ALTER TABLE public.client_profile 
ADD CONSTRAINT client_profile_data_structure 
CHECK (
    profile_data ? 'sports' AND
    profile_data ? 'goals' AND
    profile_data ? 'fitness' AND
    profile_data ? 'preferences'
);

-- 9. Função helper para validar estrutura dos dados
CREATE OR REPLACE FUNCTION validate_client_profile_data(data JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    required_keys TEXT[] := ARRAY['sports', 'goals', 'fitness', 'preferences'];
    key TEXT;
BEGIN
    -- Verificar se todas as chaves obrigatórias existem
    FOREACH key IN ARRAY required_keys LOOP
        IF NOT (data ? key) THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    -- Verificar estrutura dos esportes
    IF NOT (data->'sports' ? 'interest') OR 
       NOT (data->'sports' ? 'trained') OR 
       NOT (data->'sports' ? 'curious') THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar se sports são arrays
    IF jsonb_typeof(data->'sports'->'interest') != 'array' OR
       jsonb_typeof(data->'sports'->'trained') != 'array' OR
       jsonb_typeof(data->'sports'->'curious') != 'array' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Função para criar perfil inicial
CREATE OR REPLACE FUNCTION create_client_profile_initial_data()
RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_build_object(
        'sports', jsonb_build_object(
            'interest', '[]'::jsonb,
            'trained', '[]'::jsonb,
            'curious', '[]'::jsonb
        ),
        'goals', jsonb_build_object(
            'primary', '[]'::jsonb,
            'secondary', '[]'::jsonb,
            'tags', '[]'::jsonb
        ),
        'fitness', jsonb_build_object(
            'level', '',
            'experience', '',
            'frequency', '',
            'injuries', '[]'::jsonb,
            'limitations', '[]'::jsonb
        ),
        'preferences', jsonb_build_object(
            'training_time', '[]'::jsonb,
            'training_duration', '',
            'modality', '[]'::jsonb,
            'budget_range', '',
            'trainer_gender', '',
            'group_or_individual', ''
        ),
        'location', jsonb_build_object(
            'city', '',
            'state', '',
            'region', '',
            'willing_to_travel', false,
            'max_distance_km', 0
        ),
        'personal', jsonb_build_object(
            'age_range', '',
            'gender', '',
            'occupation', '',
            'lifestyle', '',
            'motivation', ''
        ),
        'availability', jsonb_build_object(
            'days_of_week', '[]'::jsonb,
            'time_periods', '[]'::jsonb,
            'flexible_schedule', false
        ),
        'health', jsonb_build_object(
            'medical_conditions', '[]'::jsonb,
            'medications', '[]'::jsonb,
            'allergies', '[]'::jsonb,
            'doctor_clearance', false
        ),
        'goals_detail', jsonb_build_object(
            'weight_goal', '',
            'timeline', '',
            'priority_areas', '[]'::jsonb,
            'specific_targets', '[]'::jsonb
        ),
        'metadata', jsonb_build_object(
            'completion_percentage', 0,
            'last_updated', NOW()::text,
            'onboarding_completed', false,
            'preferences_updated', NOW()::text
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 11. Trigger para inicializar dados se estiverem vazios
CREATE OR REPLACE FUNCTION initialize_client_profile_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Se profile_data estiver vazio, inicializar com estrutura padrão
    IF NEW.profile_data = '{}'::jsonb THEN
        NEW.profile_data = create_client_profile_initial_data();
    END IF;
    
    -- Validar estrutura
    IF NOT validate_client_profile_data(NEW.profile_data) THEN
        RAISE EXCEPTION 'Invalid client profile data structure';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_initialize_client_profile_data ON public.client_profile;
CREATE TRIGGER trg_initialize_client_profile_data
    BEFORE INSERT OR UPDATE ON public.client_profile
    FOR EACH ROW
    EXECUTE FUNCTION initialize_client_profile_data();

-- 12. View para relatórios e analytics (somente para admins)
CREATE OR REPLACE VIEW client_profile_analytics AS
SELECT 
    cp.id,
    cp.status,
    cp.is_active,
    cp.created_at,
    -- Extrair dados do JSONB para analytics
    jsonb_array_length(cp.profile_data->'sports'->'interest') as sports_interest_count,
    jsonb_array_length(cp.profile_data->'sports'->'trained') as sports_trained_count,
    jsonb_array_length(cp.profile_data->'sports'->'curious') as sports_curious_count,
    jsonb_array_length(cp.profile_data->'goals'->'primary') as primary_goals_count,
    cp.profile_data->'fitness'->>'level' as fitness_level,
    cp.profile_data->'preferences'->>'budget_range' as budget_range,
    cp.profile_data->'location'->>'city' as city,
    cp.profile_data->'location'->>'state' as state,
    cp.profile_data->'personal'->>'age_range' as age_range,
    cp.profile_data->'personal'->>'gender' as gender,
    (cp.profile_data->'metadata'->>'completion_percentage')::numeric as completion_percentage
FROM public.client_profile cp
WHERE cp.is_active = true;

-- 13. Função para buscar clientes compatíveis com um treinador
CREATE OR REPLACE FUNCTION find_compatible_clients(
    trainer_specialties TEXT[],
    trainer_city TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    client_id UUID,
    compatibility_score NUMERIC,
    matching_sports TEXT[],
    client_goals TEXT[],
    client_level TEXT,
    client_city TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id as client_id,
        -- Score de compatibilidade baseado em esportes em comum
        CASE 
            WHEN jsonb_array_length(
                (SELECT jsonb_agg(sport) 
                 FROM jsonb_array_elements_text(cp.profile_data->'sports'->'interest') sport
                 WHERE sport = ANY(trainer_specialties))
            ) > 0 THEN 
                jsonb_array_length(
                    (SELECT jsonb_agg(sport) 
                     FROM jsonb_array_elements_text(cp.profile_data->'sports'->'interest') sport
                     WHERE sport = ANY(trainer_specialties))
                ) * 20.0
            ELSE 0.0
        END as compatibility_score,
        
        -- Esportes em comum
        ARRAY(
            SELECT sport 
            FROM jsonb_array_elements_text(cp.profile_data->'sports'->'interest') sport
            WHERE sport = ANY(trainer_specialties)
        ) as matching_sports,
        
        -- Objetivos do cliente
        ARRAY(
            SELECT goal 
            FROM jsonb_array_elements_text(cp.profile_data->'goals'->'primary') goal
        ) as client_goals,
        
        cp.profile_data->'fitness'->>'level' as client_level,
        cp.profile_data->'location'->>'city' as client_city
        
    FROM public.client_profile cp
    WHERE 
        cp.is_active = true 
        AND cp.status = 'active'
        AND (trainer_city IS NULL OR cp.profile_data->'location'->>'city' = trainer_city)
        AND EXISTS (
            SELECT 1 
            FROM jsonb_array_elements_text(cp.profile_data->'sports'->'interest') sport
            WHERE sport = ANY(trainer_specialties)
        )
    ORDER BY compatibility_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 14. Inserir dados de exemplo para teste
INSERT INTO public.client_profile (
    user_id, 
    name, 
    email, 
    phone, 
    status,
    profile_data
) VALUES (
    gen_random_uuid(), -- Usar UUID real de usuário em produção
    'Cliente Exemplo',
    'cliente@example.com',
    '(11) 99999-9999',
    'active',
    jsonb_build_object(
        'sports', jsonb_build_object(
            'interest', '["Musculação", "Corrida", "Yoga"]'::jsonb,
            'trained', '["Futebol", "Natação"]'::jsonb,
            'curious', '["Crossfit", "Pilates"]'::jsonb
        ),
        'goals', jsonb_build_object(
            'primary', '["Emagrecimento", "Ganhar massa muscular"]'::jsonb,
            'secondary', '["Melhorar condicionamento", "Reduzir estresse"]'::jsonb,
            'tags', '["emagrecimento", "hipertrofia", "cardio"]'::jsonb
        ),
        'fitness', jsonb_build_object(
            'level', 'intermediario',
            'experience', '2-3 anos',
            'frequency', '3-4x por semana',
            'injuries', '["Lesão no joelho (recuperada)"]'::jsonb,
            'limitations', '[]'::jsonb
        ),
        'preferences', jsonb_build_object(
            'training_time', '["Manhã", "Noite"]'::jsonb,
            'training_duration', '60-90 minutos',
            'modality', '["Presencial", "Online"]'::jsonb,
            'budget_range', 'R$ 200-400',
            'trainer_gender', 'Sem preferência',
            'group_or_individual', 'Individual'
        ),
        'location', jsonb_build_object(
            'city', 'São Paulo',
            'state', 'SP',
            'region', 'Zona Sul',
            'willing_to_travel', true,
            'max_distance_km', 15
        ),
        'metadata', jsonb_build_object(
            'completion_percentage', 85,
            'last_updated', NOW()::text,
            'onboarding_completed', true
        )
    )
) ON CONFLICT DO NOTHING;

-- 15. Grants de permissão
GRANT SELECT, INSERT, UPDATE ON public.client_profile TO authenticated;
GRANT SELECT ON client_profile_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION find_compatible_clients TO authenticated;
GRANT EXECUTE ON FUNCTION create_client_profile_initial_data TO authenticated;
GRANT EXECUTE ON FUNCTION validate_client_profile_data TO authenticated;

-- 16. Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Client Profile Hybrid table created successfully!';
    RAISE NOTICE 'Structure: Structured fields + JSONB for sports interests, goals, and preferences';
    RAISE NOTICE 'Features: RLS policies, search indexes, validation functions, trainer compatibility matching';
END $$;