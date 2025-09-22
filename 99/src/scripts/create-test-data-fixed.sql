-- =============================================
-- CRIAR DADOS DE TESTE - SISTEMA UNIFICADO (CORRIGIDO)
-- =============================================
-- 
-- Script corrigido para criar dados básicos de teste
--
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '🧪 CRIANDO DADOS DE TESTE...';
END $$;

-- =============================================
-- 1. INSERIR PERFIS DE TREINADORES DE TESTE
-- =============================================

-- Treinador 1: João (Musculação + São Paulo)
INSERT INTO user_profiles (
  id,
  user_id,
  name,
  email,
  role,
  is_active,
  profile_data
) VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  'João Silva - Personal Trainer',
  'joao.silva@teste.com',
  'trainer',
  true,
  jsonb_build_object(
    'profilePhoto', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=face',
    'bio', 'Personal trainer especializado em musculação e condicionamento físico há mais de 8 anos.',
    'specialties', ARRAY['musculacao', 'funcional', 'hiit'],
    'cities', ARRAY['São Paulo', 'Santos'],
    'experienceYears', '8',
    'credential', 'CREF 123456-G/SP',
    'city', 'São Paulo',
    'state', 'SP',
    'serviceMode', 'hybrid',
    'priceRange', 'R$ 80-120/hora'
  )
) ON CONFLICT (email) DO NOTHING;

-- Treinador 2: Maria (Yoga + Rio de Janeiro)
INSERT INTO user_profiles (
  id,
  user_id,
  name,
  email,
  role,
  is_active,
  profile_data
) VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  'Maria Santos - Yoga & Pilates',
  'maria.santos@teste.com',
  'trainer',
  true,
  jsonb_build_object(
    'profilePhoto', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face',
    'bio', 'Instrutora de yoga e pilates certificada, focada em bem-estar e flexibilidade.',
    'specialties', ARRAY['yoga', 'pilates', 'meditacao'],
    'cities', ARRAY['Rio de Janeiro', 'Niterói'],
    'experienceYears', '5',
    'credential', 'Certificação Yoga Alliance RYT-200',
    'city', 'Rio de Janeiro',
    'state', 'RJ',
    'serviceMode', 'online',
    'priceRange', 'R$ 60-90/hora'
  )
) ON CONFLICT (email) DO NOTHING;

-- Treinador 3: Carlos (Crossfit + Belo Horizonte)
INSERT INTO user_profiles (
  id,
  user_id,
  name,
  email,
  role,
  is_active,
  profile_data
) VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  'Carlos Oliveira - CrossFit Coach',
  'carlos.oliveira@teste.com',
  'trainer',
  true,
  jsonb_build_object(
    'profilePhoto', 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=300&h=300&fit=crop&crop=face',
    'bio', 'Coach de CrossFit Level 2, especialista em alta performance e competições.',
    'specialties', ARRAY['crossfit', 'funcional', 'olimpicos'],
    'cities', ARRAY['Belo Horizonte', 'Contagem'],
    'experienceYears', '6',
    'credential', 'CrossFit Level 2 Trainer',
    'city', 'Belo Horizonte',
    'state', 'MG',
    'serviceMode', 'presential',
    'priceRange', 'R$ 100-150/hora'
  )
) ON CONFLICT (email) DO NOTHING;

-- =============================================
-- 2. INSERIR PROGRAMAS DE TESTE
-- =============================================

-- Programa 1: Musculação para Iniciantes (João)
INSERT INTO training_programs (
  id,
  title,
  slug,
  status,
  difficulty_level,
  service_mode,
  price_amount,
  duration_weeks,
  duration_hours,
  created_by,
  program_data
) 
SELECT 
  gen_random_uuid(),
  'Musculação para Iniciantes - Método Progressivo',
  'musculacao-iniciantes-progressivo',
  'published'::program_status_enum,
  'beginner',
  'hybrid',
  299.99,
  12,
  48,
  up.user_id,
  jsonb_build_object(
    'description', 'Programa completo de musculação para quem está começando. Método progressivo com acompanhamento personalizado.',
    'shortDescription', 'Musculação progressiva para iniciantes com 12 semanas de treino estruturado.',
    'specialties', ARRAY['musculacao', 'hipertrofia', 'condicionamento'],
    'primaryGoals', ARRAY['ganho_massa', 'fortalecimento', 'condicionamento'],
    'content', jsonb_build_object(
      'modules', ARRAY[
        jsonb_build_object('name', 'Fundamentos da Musculação', 'lessons', 8),
        jsonb_build_object('name', 'Treinos Semana 1-4', 'lessons', 12),
        jsonb_build_object('name', 'Progressão Intermediária', 'lessons', 10),
        jsonb_build_object('name', 'Nutrição e Recuperação', 'lessons', 6)
      ],
      'totalLessons', 36,
      'totalVideos', 24
    ),
    'media', jsonb_build_object(
      'coverImage', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'gallery', ARRAY[
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop'
      ],
      'videos', ARRAY['intro-video', 'demo-exercicios']
    ),
    'delivery', jsonb_build_object(
      'format', 'hybrid',
      'platform', 'app + presencial',
      'duration', '12 semanas'
    ),
    'benefits', ARRAY[
      'Ganho de massa muscular',
      'Fortalecimento completo',
      'Melhora do condicionamento',
      'Acompanhamento personalizado'
    ],
    'tags', ARRAY['iniciante', 'musculacao', 'hipertrofia', 'progressivo']
  )
FROM user_profiles up 
WHERE up.email = 'joao.silva@teste.com'
LIMIT 1;

-- Programa 2: Yoga Matinal (Maria)
INSERT INTO training_programs (
  id,
  title,
  slug,
  status,
  difficulty_level,
  service_mode,
  price_amount,
  duration_weeks,
  duration_hours,
  created_by,
  program_data
) 
SELECT 
  gen_random_uuid(),
  'Yoga Matinal - Energia para o Dia',
  'yoga-matinal-energia',
  'published'::program_status_enum,
  'beginner',
  'online',
  149.99,
  8,
  16,
  up.user_id,
  jsonb_build_object(
    'description', 'Sequências de yoga energizantes para começar o dia com disposição e foco mental.',
    'shortDescription', 'Yoga matinal em 8 semanas para mais energia e bem-estar diário.',
    'specialties', ARRAY['yoga', 'mindfulness', 'flexibilidade'],
    'primaryGoals', ARRAY['flexibilidade', 'bem_estar', 'equilibrio'],
    'content', jsonb_build_object(
      'modules', ARRAY[
        jsonb_build_object('name', 'Fundamentos do Yoga', 'lessons', 5),
        jsonb_build_object('name', 'Sequências Matinais', 'lessons', 8),
        jsonb_build_object('name', 'Respiração e Meditação', 'lessons', 4),
        jsonb_build_object('name', 'Rotina Completa', 'lessons', 3)
      ],
      'totalLessons', 20,
      'totalVideos', 16
    ),
    'media', jsonb_build_object(
      'coverImage', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
      'gallery', ARRAY[
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=400&fit=crop'
      ],
      'videos', ARRAY['sequencia-saudacao-sol', 'meditacao-matinal']
    ),
    'delivery', jsonb_build_object(
      'format', 'online',
      'platform', 'video-aulas + lives',
      'duration', '8 semanas'
    ),
    'benefits', ARRAY[
      'Mais energia matinal',
      'Redução do stress',
      'Melhora da flexibilidade',
      'Equilíbrio mental'
    ],
    'tags', ARRAY['yoga', 'matinal', 'energia', 'mindfulness']
  )
FROM user_profiles up 
WHERE up.email = 'maria.santos@teste.com'
LIMIT 1;

-- Programa 3: CrossFit Functional (Carlos)
INSERT INTO training_programs (
  id,
  title,
  slug,
  status,
  difficulty_level,
  service_mode,
  price_amount,
  duration_weeks,
  duration_hours,
  created_by,
  program_data
) 
SELECT 
  gen_random_uuid(),
  'CrossFit Functional - Performance Total',
  'crossfit-functional-performance',
  'published'::program_status_enum,
  'intermediate',
  'presential',
  449.99,
  16,
  64,
  up.user_id,
  jsonb_build_object(
    'description', 'Programa intensivo de CrossFit com foco em performance funcional e condicionamento atlético.',
    'shortDescription', 'CrossFit intensivo em 16 semanas para máxima performance atlética.',
    'specialties', ARRAY['crossfit', 'funcional', 'condicionamento'],
    'primaryGoals', ARRAY['performance', 'condicionamento', 'fortalecimento'],
    'content', jsonb_build_object(
      'modules', ARRAY[
        jsonb_build_object('name', 'Fundamentos CrossFit', 'lessons', 6),
        jsonb_build_object('name', 'Movimentos Olímpicos', 'lessons', 8),
        jsonb_build_object('name', 'WODs Progressivos', 'lessons', 12),
        jsonb_build_object('name', 'Competição e Testes', 'lessons', 4)
      ],
      'totalLessons', 30,
      'totalVideos', 20
    ),
    'media', jsonb_build_object(
      'coverImage', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
      'gallery', ARRAY[
        'https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&h=400&fit=crop'
      ],
      'videos', ARRAY['tecnica-levantamentos', 'wod-benchmark']
    ),
    'delivery', jsonb_build_object(
      'format', 'presential',
      'platform', 'academia + outdoor',
      'duration', '16 semanas'
    ),
    'benefits', ARRAY[
      'Performance atlética',
      'Condicionamento extremo',
      'Força funcional',
      'Competitividade'
    ],
    'tags', ARRAY['crossfit', 'performance', 'atlético', 'funcional']
  )
FROM user_profiles up 
WHERE up.email = 'carlos.oliveira@teste.com'
LIMIT 1;

-- =============================================
-- 3. INSERIR CLIENTE DE TESTE
-- =============================================

INSERT INTO user_profiles (
  id,
  user_id,
  name,
  email,
  role,
  is_active,
  profile_data
) VALUES (
  gen_random_uuid(),
  gen_random_uuid(),
  'Ana Costa - Cliente Teste',
  'ana.costa@teste.com',
  'client',
  true,
  jsonb_build_object(
    'profilePhoto', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
    'bio', 'Busco melhorar meu condicionamento físico e qualidade de vida.',
    'goals', ARRAY['emagrecimento', 'condicionamento', 'bem_estar'],
    'interests', ARRAY['musculacao', 'yoga', 'corrida'],
    'city', 'São Paulo',
    'state', 'SP',
    'age_range', '25-35',
    'activity_level', 'iniciante',
    'preferences', jsonb_build_object(
      'preferred_time', 'manha',
      'max_budget', 200,
      'service_mode', 'hybrid'
    )
  )
) ON CONFLICT (email) DO NOTHING;

-- =============================================
-- 4. VERIFICAR DADOS CRIADOS
-- =============================================

DO $$
DECLARE
  trainers_count INTEGER;
  programs_count INTEGER;
  clients_count INTEGER;
BEGIN
  -- Contar registros criados
  SELECT COUNT(*) INTO trainers_count FROM user_profiles WHERE role = 'trainer';
  SELECT COUNT(*) INTO programs_count FROM training_programs;
  SELECT COUNT(*) INTO clients_count FROM user_profiles WHERE role = 'client';
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 DADOS DE TESTE CRIADOS COM SUCESSO!';
  RAISE NOTICE '✅ Treinadores: %', trainers_count;
  RAISE NOTICE '✅ Programas: %', programs_count;
  RAISE NOTICE '✅ Clientes: %', clients_count;
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Agora você pode testar:';
  RAISE NOTICE '• /dev/system-validation';
  RAISE NOTICE '• /dev/unified-services-test';
  RAISE NOTICE '• Program Cards e Trainer Cards';
  RAISE NOTICE '';
END $$;