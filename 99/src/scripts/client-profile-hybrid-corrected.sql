-- =============================================
-- TABELA CLIENT PROFILE HÍBRIDA - CORRIGIDA
-- =============================================
-- Arquitetura híbrida perfeita alinhada com o código atual
-- Baseada no padrão da "99_trainer_profile"

-- 1. Criar tabela principal
CREATE TABLE IF NOT EXISTS public."99_client_profile" (
    -- Campos estruturados (PostgreSQL tradicional) - MESMOS DADOS DA PESSOA
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,           -- MESMO nome do trainer
    email VARCHAR(255) NOT NULL,          -- MESMO email do trainer  
    phone VARCHAR(20),                    -- MESMO phone do trainer
    
    -- Status e flags específicos do client
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'suspended')),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- Dados flexíveis em JSONB - ESPECÍFICOS DO CLIENT
    profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: Um usuário pode ter apenas um perfil de client
    CONSTRAINT unique_client_per_user UNIQUE (user_id)
);

-- 2. Comentários da tabela
COMMENT ON TABLE public."99_client_profile" IS 'Perfis de clientes com arquitetura híbrida - mesmo user_id pode ser trainer e client';
COMMENT ON COLUMN public."99_client_profile".name IS 'Nome da pessoa - deve ser o mesmo em trainer_profile';
COMMENT ON COLUMN public."99_client_profile".email IS 'Email da pessoa - deve ser o mesmo em trainer_profile';
COMMENT ON COLUMN public."99_client_profile".phone IS 'Telefone da pessoa - deve ser o mesmo em trainer_profile';
COMMENT ON COLUMN public."99_client_profile".profile_data IS 'Dados específicos do client: esportes, objetivos, preferências (formato plano)';

-- 3. Índices para performance otimizada
CREATE INDEX IF NOT EXISTS idx_client_profile_user_id ON public."99_client_profile"(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profile_status ON public."99_client_profile"(status);
CREATE INDEX IF NOT EXISTS idx_client_profile_active ON public."99_client_profile"(is_active);
CREATE INDEX IF NOT EXISTS idx_client_profile_email ON public."99_client_profile"(email);
CREATE INDEX IF NOT EXISTS idx_client_profile_created_at ON public."99_client_profile"(created_at);
CREATE INDEX IF NOT EXISTS idx_client_profile_updated_at ON public."99_client_profile"(updated_at);

-- 4. Índices JSONB específicos para busca eficiente (formato plano)
CREATE INDEX IF NOT EXISTS idx_client_profile_sports_interest 
ON public."99_client_profile" USING GIN ((profile_data->'sportsInterest'));

CREATE INDEX IF NOT EXISTS idx_client_profile_sports_trained 
ON public."99_client_profile" USING GIN ((profile_data->'sportsTrained'));

CREATE INDEX IF NOT EXISTS idx_client_profile_sports_curious 
ON public."99_client_profile" USING GIN ((profile_data->'sportsCurious'));

CREATE INDEX IF NOT EXISTS idx_client_profile_primary_goals 
ON public."99_client_profile" USING GIN ((profile_data->'primaryGoals'));

CREATE INDEX IF NOT EXISTS idx_client_profile_fitness_level 
ON public."99_client_profile" USING GIN ((profile_data->>'fitnessLevel'));

CREATE INDEX IF NOT EXISTS idx_client_profile_city 
ON public."99_client_profile" USING GIN ((profile_data->>'city'));

CREATE INDEX IF NOT EXISTS idx_client_profile_budget 
ON public."99_client_profile" USING GIN ((profile_data->>'budget'));

-- 5. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_client_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- Atualizar também o timestamp no JSONB
    NEW.profile_data = jsonb_set(
        NEW.profile_data, 
        '{lastUpdated}', 
        to_jsonb(NOW()::text)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para updated_at
DROP TRIGGER IF EXISTS trg_client_profile_updated_at ON public."99_client_profile";
CREATE TRIGGER trg_client_profile_updated_at
    BEFORE UPDATE ON public."99_client_profile"
    FOR EACH ROW
    EXECUTE FUNCTION update_client_profile_updated_at();

-- 7. RLS Policies para segurança
ALTER TABLE public."99_client_profile" ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seus próprios perfis
DROP POLICY IF EXISTS "client_profile_select_own" ON public."99_client_profile";
CREATE POLICY "client_profile_select_own" ON public."99_client_profile"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir apenas seus próprios perfis
DROP POLICY IF EXISTS "client_profile_insert_own" ON public."99_client_profile";
CREATE POLICY "client_profile_insert_own" ON public."99_client_profile"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar apenas seus próprios perfis
DROP POLICY IF EXISTS "client_profile_update_own" ON public."99_client_profile";
CREATE POLICY "client_profile_update_own" ON public."99_client_profile"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar apenas seus próprios perfis
DROP POLICY IF EXISTS "client_profile_delete_own" ON public."99_client_profile";
CREATE POLICY "client_profile_delete_own" ON public."99_client_profile"
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Treinadores podem ver perfis de clientes ativos (para matchmaking)
DROP POLICY IF EXISTS "client_profile_trainers_view" ON public."99_client_profile";
CREATE POLICY "client_profile_trainers_view" ON public."99_client_profile"
    FOR SELECT
    TO authenticated
    USING (
        is_active = true 
        AND status = 'active'
        AND EXISTS (
            SELECT 1 FROM public."99_trainer_profile" tp 
            WHERE tp.user_id = auth.uid() 
            AND tp.is_active = true
        )
    );

-- Policy: Service role pode tudo (para funções server-side)
DROP POLICY IF EXISTS "client_profile_service_role" ON public."99_client_profile";
CREATE POLICY "client_profile_service_role" ON public."99_client_profile"
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 8. Função para sincronizar dados básicos entre trainer e client profiles
CREATE OR REPLACE FUNCTION sync_user_basic_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o usuário também tem perfil de trainer, sincronizar dados básicos
    IF EXISTS (SELECT 1 FROM public."99_trainer_profile" WHERE user_id = NEW.user_id) THEN
        UPDATE public."99_trainer_profile" 
        SET 
            name = NEW.name,
            email = NEW.email,
            phone = NEW.phone,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para sincronização de dados básicos
DROP TRIGGER IF EXISTS trg_sync_client_to_trainer ON public."99_client_profile";
CREATE TRIGGER trg_sync_client_to_trainer
    AFTER INSERT OR UPDATE OF name, email, phone ON public."99_client_profile"
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_basic_data();

-- 10. Função para encontrar clientes compatíveis com um treinador
CREATE OR REPLACE FUNCTION find_compatible_clients_v2(
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
        -- Score baseado em esportes em comum
        COALESCE(array_length(ARRAY(
            SELECT sport 
            FROM jsonb_array_elements_text(cp.profile_data->'sportsInterest') sport
            WHERE sport = ANY(trainer_specialties)
        ), 1), 0) * 20.0 as compatibility_score,
        
        -- Esportes em comum
        ARRAY(
            SELECT sport 
            FROM jsonb_array_elements_text(cp.profile_data->'sportsInterest') sport
            WHERE sport = ANY(trainer_specialties)
        ) as matching_sports,
        
        -- Objetivos do cliente
        COALESCE(ARRAY(
            SELECT goal 
            FROM jsonb_array_elements_text(cp.profile_data->'primaryGoals') goal
        ), ARRAY[]::TEXT[]) as client_goals,
        
        COALESCE(cp.profile_data->>'fitnessLevel', '') as client_level,
        COALESCE(cp.profile_data->>'city', '') as client_city
        
    FROM public."99_client_profile" cp
    WHERE 
        cp.is_active = true 
        AND cp.status = 'active'
        AND (trainer_city IS NULL OR cp.profile_data->>'city' = trainer_city)
        AND EXISTS (
            SELECT 1 
            FROM jsonb_array_elements_text(cp.profile_data->'sportsInterest') sport
            WHERE sport = ANY(trainer_specialties)
        )
    ORDER BY compatibility_score DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 11. Função para estatísticas de clientes
CREATE OR REPLACE FUNCTION get_client_profile_stats()
RETURNS TABLE (
    total_clients BIGINT,
    active_clients BIGINT,
    verified_clients BIGINT,
    draft_clients BIGINT,
    avg_completion NUMERIC,
    top_sports TEXT[],
    top_goals TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_clients,
        COUNT(*) FILTER (WHERE is_active = true AND status = 'active') as active_clients,
        COUNT(*) FILTER (WHERE is_verified = true) as verified_clients,
        COUNT(*) FILTER (WHERE status = 'draft') as draft_clients,
        ROUND(AVG((profile_data->>'completionPercentage')::numeric), 2) as avg_completion,
        
        -- Top 5 esportes de interesse
        ARRAY(
            SELECT sport
            FROM (
                SELECT sport, COUNT(*) as cnt
                FROM public."99_client_profile" cp,
                     jsonb_array_elements_text(cp.profile_data->'sportsInterest') sport
                WHERE cp.is_active = true
                GROUP BY sport
                ORDER BY cnt DESC
                LIMIT 5
            ) t
        ) as top_sports,
        
        -- Top 5 objetivos primários
        ARRAY(
            SELECT goal
            FROM (
                SELECT goal, COUNT(*) as cnt
                FROM public."99_client_profile" cp,
                     jsonb_array_elements_text(cp.profile_data->'primaryGoals') goal
                WHERE cp.is_active = true
                GROUP BY goal
                ORDER BY cnt DESC
                LIMIT 5
            ) t
        ) as top_goals
        
    FROM public."99_client_profile";
END;
$$ LANGUAGE plpgsql;

-- 12. View para relatórios (somente campos necessários)
CREATE OR REPLACE VIEW client_profile_analytics AS
SELECT 
    cp.id,
    cp.user_id,
    cp.name,
    cp.email,
    cp.status,
    cp.is_active,
    cp.is_verified,
    cp.created_at,
    cp.updated_at,
    
    -- Extrair dados importantes do JSONB
    jsonb_array_length(COALESCE(cp.profile_data->'sportsInterest', '[]'::jsonb)) as sports_interest_count,
    jsonb_array_length(COALESCE(cp.profile_data->'primaryGoals', '[]'::jsonb)) as primary_goals_count,
    cp.profile_data->>'fitnessLevel' as fitness_level,
    cp.profile_data->>'budget' as budget_range,
    cp.profile_data->>'city' as city,
    cp.profile_data->>'state' as state,
    (cp.profile_data->>'completionPercentage')::numeric as completion_percentage,
    (cp.profile_data->>'onboardingCompleted')::boolean as onboarding_completed
    
FROM public."99_client_profile" cp
WHERE cp.is_active = true;

-- 13. Grants de permissão
GRANT SELECT, INSERT, UPDATE ON public."99_client_profile" TO authenticated;
GRANT SELECT ON client_profile_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION find_compatible_clients_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_profile_stats TO authenticated;
GRANT EXECUTE ON FUNCTION sync_user_basic_data TO authenticated;

-- 14. Inserir exemplo de teste (usando UUID fake - substituir por real)
INSERT INTO public."99_client_profile" (
    user_id, 
    name, 
    email, 
    phone, 
    status,
    profile_data
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid, -- Substituir por UUID real
    'Maria Cliente Silva',
    'maria.cliente@example.com',
    '(11) 99999-8888',
    'active',
    jsonb_build_object(
        -- Esportes (formato plano)
        'sportsInterest', '["Musculação", "Yoga", "Corrida"]'::jsonb,
        'sportsTrained', '["Natação", "Pilates"]'::jsonb,
        'sportsCurious', '["Crossfit", "Muay Thai"]'::jsonb,
        
        -- Objetivos (formato plano)
        'primaryGoals', '["Emagrecimento", "Ganhar massa muscular"]'::jsonb,
        'secondaryGoals', '["Melhorar flexibilidade", "Reduzir estresse"]'::jsonb,
        'searchTags', '["emagrecimento", "definição", "saúde"]'::jsonb,
        
        -- Fitness
        'fitnessLevel', 'intermediario',
        'experience', '2-3 anos',
        'frequency', '4x por semana',
        'budget', '400-600',
        
        -- Localização
        'city', 'São Paulo',
        'state', 'SP',
        'region', 'Zona Sul',
        'willingToTravel', true,
        'maxDistanceKm', 20,
        
        -- Preferências
        'trainingTime', '["Manhã", "Tarde"]'::jsonb,
        'trainingDuration', '60 minutos',
        'modality', '["Presencial", "Online"]'::jsonb,
        'trainerGender', 'Sem preferência',
        'groupOrIndividual', 'Individual',
        
        -- Saúde
        'medicalConditions', 'Nenhuma restrição',
        'injuries', '[]'::jsonb,
        'limitations', '[]'::jsonb,
        'doctorClearance', true,
        
        -- Pessoal
        'ageRange', '25-30',
        'gender', 'feminino',
        'occupation', 'Desenvolvedora',
        'lifestyle', 'Ativo',
        
        -- Biografia
        'bio', 'Busco um treinador experiente para me ajudar com emagrecimento e ganho de massa muscular.',
        'phone', '(11) 99999-8888',
        
        -- Metadata
        'completionPercentage', 78,
        'lastUpdated', NOW()::text,
        'onboardingCompleted', true
    )
) ON CONFLICT (user_id) DO NOTHING;

-- 15. Log de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ CLIENT PROFILE HYBRID TABLE - CRIADA COM SUCESSO!';
    RAISE NOTICE '📋 Tabela: "99_client_profile"';
    RAISE NOTICE '🔗 Relacionamento: Mesmo user_id pode ter "99_trainer_profile" E "99_client_profile"';
    RAISE NOTICE '📊 Estrutura: Campos estruturados (name, email) + JSONB flexível';
    RAISE NOTICE '🔒 Segurança: RLS policies + sincronização automática';
    RAISE NOTICE '🔍 Busca: Índices otimizados + função de compatibilidade';
    RAISE NOTICE '📈 Analytics: Views e funções de estatísticas';
END $$;