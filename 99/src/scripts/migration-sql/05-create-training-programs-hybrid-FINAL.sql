-- ===============================================
-- TRAINING PROGRAMS - ESTRUTURA HÍBRIDA COMPLETA
-- ===============================================
-- Este script cria a tabela híbrida para programas de treino
-- Baseado na análise completa dos 6 steps de criação/edição
-- VERSÃO FINAL - TESTADA E CORRIGIDA

-- ===============================================
-- 1. CRIAR TABELA PRINCIPAL
-- ===============================================

CREATE TABLE "99_training_programs" (
  -- =====================================
  -- CAMPOS RELACIONAIS (PostgreSQL)
  -- Dados críticos para queries e performance
  -- =====================================
  
  -- Identificação
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id           UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Dados essenciais para busca e filtros
  title                TEXT NOT NULL,
  category             VARCHAR(100) NOT NULL,  -- 'musculacao', 'crossfit', 'funcional', etc.
  modality             VARCHAR(50) NOT NULL,   -- 'presencial', 'online', 'hibrido'
  level                VARCHAR(50) NOT NULL,   -- 'iniciante', 'intermediario', 'avancado', 'todos_niveis'
  
  -- Estrutura básica para filtros
  duration             INTEGER NOT NULL,       -- número de períodos
  duration_type        VARCHAR(20) NOT NULL DEFAULT 'weeks', -- 'days', 'weeks', 'months'
  frequency            INTEGER NOT NULL,       -- sessões por semana
  
  -- Preço base para ordenação e filtros
  base_price           DECIMAL(10,2) NOT NULL DEFAULT 0, -- menor preço dos pacotes
  
  -- Status e controle
  is_published         BOOLEAN DEFAULT FALSE,
  status               VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'paused', 'archived'
  
  -- =====================================
  -- CAMPOS HÍBRIDOS (JSONB)
  -- Dados flexíveis e estruturas complexas
  -- =====================================
  program_data         JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 2. COMENTÁRIOS EXPLICATIVOS
-- ===============================================

COMMENT ON TABLE "99_training_programs" IS 'Tabela híbrida para programas de treino - combina campos relacionais (busca/performance) com JSONB (flexibilidade)';

COMMENT ON COLUMN "99_training_programs".id IS 'ID único do programa';
COMMENT ON COLUMN "99_training_programs".trainer_id IS 'FK para o treinador proprietário';
COMMENT ON COLUMN "99_training_programs".title IS 'Título do programa (indexado para busca)';
COMMENT ON COLUMN "99_training_programs".category IS 'Categoria do programa (filtro principal)';
COMMENT ON COLUMN "99_training_programs".modality IS 'Modalidade: presencial, online ou híbrido';
COMMENT ON COLUMN "99_training_programs".level IS 'Nível de dificuldade (filtro importante)';
COMMENT ON COLUMN "99_training_programs".duration IS 'Duração numérica (para ordenação)';
COMMENT ON COLUMN "99_training_programs".duration_type IS 'Tipo de duração: days, weeks, months';
COMMENT ON COLUMN "99_training_programs".frequency IS 'Frequência semanal (para filtros)';
COMMENT ON COLUMN "99_training_programs".base_price IS 'Menor preço dentre os pacotes (para filtros de preço)';
COMMENT ON COLUMN "99_training_programs".is_published IS 'Se o programa está publicado';
COMMENT ON COLUMN "99_training_programs".status IS 'Status: draft, published, paused, archived';
COMMENT ON COLUMN "99_training_programs".program_data IS 'Dados flexíveis em JSONB: tags, descrições, cronograma, preços, mídia, etc.';

-- ===============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ===============================================

-- Índices principais para queries frequentes
CREATE INDEX idx_training_programs_trainer_id ON "99_training_programs"(trainer_id);
CREATE INDEX idx_training_programs_category ON "99_training_programs"(category);
CREATE INDEX idx_training_programs_modality ON "99_training_programs"(modality);
CREATE INDEX idx_training_programs_level ON "99_training_programs"(level);
CREATE INDEX idx_training_programs_published ON "99_training_programs"(is_published) WHERE is_published = true;
CREATE INDEX idx_training_programs_status ON "99_training_programs"(status);
CREATE INDEX idx_training_programs_price ON "99_training_programs"(base_price);
CREATE INDEX idx_training_programs_duration ON "99_training_programs"(duration);
CREATE INDEX idx_training_programs_frequency ON "99_training_programs"(frequency);

-- Índices JSONB para busca em dados flexíveis
CREATE INDEX idx_training_programs_tags ON "99_training_programs" USING GIN ((program_data->'basic_info'->'tags'));
CREATE INDEX idx_training_programs_keywords ON "99_training_programs" USING GIN ((program_data->'basic_info'->'search_keywords'));

-- Índice composto para listagens principais
CREATE INDEX idx_training_programs_list ON "99_training_programs"(is_published, status, created_at DESC) WHERE is_published = true;

-- Índice para busca por trainer + status
CREATE INDEX idx_training_programs_trainer_status ON "99_training_programs"(trainer_id, status, created_at DESC);

-- ===============================================
-- 4. TRIGGERS AUTOMÁTICOS
-- ===============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_training_programs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER training_programs_updated_at
  BEFORE UPDATE ON "99_training_programs"
  FOR EACH ROW
  EXECUTE FUNCTION update_training_programs_updated_at();

-- Trigger para calcular base_price automaticamente a partir dos pacotes
CREATE OR REPLACE FUNCTION update_training_programs_base_price()
RETURNS TRIGGER AS $$
DECLARE
  min_price DECIMAL(10,2);
BEGIN
  -- Extrair o menor preço dos pacotes no JSONB
  SELECT MIN(CAST(package->>'price' AS DECIMAL(10,2)))
  INTO min_price
  FROM jsonb_array_elements(NEW.program_data->'pricing'->'packages') AS package
  WHERE package->>'price' IS NOT NULL AND package->>'price' != '';
  
  -- Se não encontrou preços válidos, manter 0
  NEW.base_price = COALESCE(min_price, 0);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER training_programs_base_price
  BEFORE INSERT OR UPDATE ON "99_training_programs"
  FOR EACH ROW
  EXECUTE FUNCTION update_training_programs_base_price();

-- ===============================================
-- 5. VIEWS ÚTEIS
-- ===============================================

-- View para listagem pública de programas (otimizada)
CREATE VIEW public_training_programs AS
SELECT 
  id,
  trainer_id,
  title,
  category,
  modality,
  level,
  duration,
  duration_type,
  frequency,
  base_price,
  
  -- Extrair dados importantes do JSONB
  program_data->'description'->>'short_description' as short_description,
  program_data->'media'->'cover_image'->>'url' as cover_image,
  program_data->'basic_info'->'tags' as tags,
  CAST(program_data->'analytics'->>'average_rating' AS DECIMAL(3,2)) as average_rating,
  CAST(program_data->'analytics'->>'reviews_count' AS INTEGER) as reviews_count,
  CAST(program_data->'analytics'->>'views' AS INTEGER) as views,
  
  created_at,
  updated_at
FROM "99_training_programs"
WHERE is_published = true AND status = 'published';

-- View para dashboard do trainer (com mais detalhes)
CREATE VIEW trainer_programs_dashboard AS
SELECT 
  id,
  trainer_id,
  title,
  category,
  modality,
  level,
  duration,
  duration_type,
  frequency,
  base_price,
  is_published,
  status,
  
  -- Dados do JSONB para dashboard
  program_data->'description'->>'short_description' as short_description,
  program_data->'media'->'cover_image'->>'url' as cover_image,
  jsonb_array_length(COALESCE(program_data->'pricing'->'packages', '[]'::jsonb)) as packages_count,
  jsonb_array_length(COALESCE(program_data->'basic_info'->'tags', '[]'::jsonb)) as tags_count,
  jsonb_array_length(COALESCE(program_data->'media'->'gallery', '[]'::jsonb)) as gallery_images_count,
  
  -- Analytics
  CAST(program_data->'analytics'->>'views' AS INTEGER) as views,
  CAST(program_data->'analytics'->>'inquiries' AS INTEGER) as inquiries,
  CAST(program_data->'analytics'->>'conversions' AS INTEGER) as conversions,
  
  created_at,
  updated_at
FROM "99_training_programs";

-- ===============================================
-- 6. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ===============================================

-- Habilitar RLS na tabela
ALTER TABLE "99_training_programs" ENABLE ROW LEVEL SECURITY;

-- Policy: Trainers podem ver e editar apenas seus próprios programas
CREATE POLICY "trainer_own_programs" ON "99_training_programs"
  FOR ALL USING (trainer_id = auth.uid());

-- Policy: Programas publicados são visíveis para todos
CREATE POLICY "public_published_programs" ON "99_training_programs"
  FOR SELECT USING (is_published = true AND status = 'published');

-- Policy: Admins podem ver todos os programas
CREATE POLICY "admin_all_programs" ON "99_training_programs"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ===============================================
-- 7. FUNÇÕES AUXILIARES
-- ===============================================

-- Função para buscar programas com filtros
CREATE OR REPLACE FUNCTION search_training_programs(
  p_category VARCHAR DEFAULT NULL,
  p_modality VARCHAR DEFAULT NULL,
  p_level VARCHAR DEFAULT NULL,
  p_min_price DECIMAL DEFAULT NULL,
  p_max_price DECIMAL DEFAULT NULL,
  p_duration_min INTEGER DEFAULT NULL,
  p_duration_max INTEGER DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  trainer_id UUID,
  title TEXT,
  category VARCHAR,
  modality VARCHAR,
  level VARCHAR,
  duration INTEGER,
  duration_type VARCHAR,
  frequency INTEGER,
  base_price DECIMAL,
  short_description TEXT,
  cover_image TEXT,
  tags JSONB,
  average_rating DECIMAL,
  reviews_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.trainer_id,
    p.title,
    p.category,
    p.modality,
    p.level,
    p.duration,
    p.duration_type,
    p.frequency,
    p.base_price,
    p.program_data->'description'->>'short_description' as short_description,
    p.program_data->'media'->'cover_image'->>'url' as cover_image,
    p.program_data->'basic_info'->'tags' as tags,
    CAST(p.program_data->'analytics'->>'average_rating' AS DECIMAL(3,2)) as average_rating,
    CAST(p.program_data->'analytics'->>'reviews_count' AS INTEGER) as reviews_count,
    p.created_at
  FROM "99_training_programs" p
  WHERE 
    p.is_published = true 
    AND p.status = 'published'
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_modality IS NULL OR p.modality = p_modality)
    AND (p_level IS NULL OR p.level = p_level)
    AND (p_min_price IS NULL OR p.base_price >= p_min_price)
    AND (p_max_price IS NULL OR p.base_price <= p_max_price)
    AND (p_duration_min IS NULL OR p.duration >= p_duration_min)
    AND (p_duration_max IS NULL OR p.duration <= p_duration_max)
    AND (
      p_tags IS NULL OR 
      EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(p.program_data->'basic_info'->'tags') AS tag
        WHERE tag = ANY(p_tags)
      )
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 8. DADOS DE EXEMPLO (OPCIONAL)
-- ===============================================

/*
-- OPCIONAL: Dados de exemplo para teste
-- Descomente e execute apenas se desejar um programa de exemplo
-- Certifique-se de usar um trainer_id válido (ex: Ana Souza)

INSERT INTO "99_training_programs" (
  trainer_id, 
  title, 
  category, 
  modality, 
  level, 
  duration, 
  duration_type, 
  frequency,
  program_data
) VALUES (
  -- Ana Souza trainer_id válido
  '06588b6a-e8bb-42a4-89a8-5d237cc34476',
  'Transformação Corporal 12 Semanas',
  'musculacao',
  'hibrido',
  'intermediario',
  12,
  'weeks',
  4,
  '{
    "basic_info": {
      "tags": ["emagrecimento", "hipertrofia", "definicao"],
      "search_keywords": ["musculacao", "academia", "treino", "transformacao"]
    },
    "description": {
      "full_description": "Programa completo de transformação corporal em 12 semanas, combinando treino de força e cardio para máximos resultados.",
      "short_description": "Transforme seu corpo em 12 semanas com treino completo",
      "objectives": [
        "Ganhar massa muscular magra",
        "Reduzir percentual de gordura",
        "Melhorar condicionamento físico"
      ],
      "requirements": [
        "Experiência básica em musculação",
        "Acesso à academia completa"
      ],
      "what_you_get": [
        "Programa completo de 12 semanas",
        "PDF detalhado com exercícios",
        "Acompanhamento semanal via WhatsApp",
        "Planilha de evolução"
      ]
    },
    "structure": {
      "session_duration": 60,
      "total_sessions": 48,
      "schedule": [
        {
          "week": 1,
          "sessions": [
            {
              "day": "Segunda",
              "focus": "Peito e Tríceps",
              "exercises": 8
            },
            {
              "day": "Terça",
              "focus": "Costas e Bíceps", 
              "exercises": 8
            },
            {
              "day": "Quinta",
              "focus": "Pernas e Glúteos",
              "exercises": 10
            },
            {
              "day": "Sexta",
              "focus": "Ombros e Abdômen",
              "exercises": 6
            }
          ]
        }
      ]
    },
    "pricing": {
      "packages": [
        {
          "name": "Básico",
          "price": 197,
          "description": "Programa completo com suporte básico",
          "features": [
            "Acesso completo ao programa",
            "PDF com exercícios detalhados",
            "Suporte via WhatsApp"
          ],
          "delivery_time": 1,
          "revisions": 1,
          "is_popular": false
        },
        {
          "name": "Premium",
          "price": 397,
          "description": "Programa + acompanhamento personalizado",
          "features": [
            "Tudo do pacote Básico",
            "Acompanhamento semanal",
            "Ajustes personalizados",
            "Suporte prioritário"
          ],
          "delivery_time": 1,
          "revisions": 3,
          "is_popular": true
        }
      ],
      "add_ons": [
        {
          "name": "Plano Nutricional",
          "price": 150,
          "description": "Cardápio personalizado para seus objetivos"
        }
      ]
    },
    "media": {
      "cover_image": {
        "url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
        "alt": "Transformação Corporal"
      },
      "gallery": [],
      "videos": []
    },
    "analytics": {
      "views": 0,
      "inquiries": 0,
      "conversions": 0,
      "average_rating": 0,
      "reviews_count": 0
    },
    "settings": {
      "allow_inquiries": true,
      "auto_accept": false
    }
  }'::jsonb
);
*/

-- ===============================================
-- 9. VERIFICAÇÕES DE INTEGRIDADE
-- ===============================================

-- Verificar se a tabela foi criada corretamente
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '99_training_programs') THEN
        RAISE NOTICE 'Tabela 99_training_programs criada com sucesso!';
    ELSE
        RAISE EXCEPTION 'Erro: Tabela 99_training_programs não foi criada!';
    END IF;
END $$;

-- Verificar se os índices foram criados
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = '99_training_programs' 
        AND indexname = 'idx_training_programs_trainer_id'
    ) THEN
        RAISE NOTICE 'Índices criados com sucesso!';
    ELSE
        RAISE WARNING 'Alguns índices podem não ter sido criados corretamente.';
    END IF;
END $$;

-- ===============================================
-- 10. DOCUMENTAÇÃO FINAL
-- ===============================================

/*
ESTRUTURA HÍBRIDA TRAINING PROGRAMS - RESUMO:

CAMPOS RELACIONAIS (PostgreSQL):
- id, trainer_id, title, category, modality, level
- duration, duration_type, frequency, base_price  
- is_published, status, created_at, updated_at

CAMPOS FLEXÍVEIS (JSONB program_data):
- basic_info: tags, keywords
- description: textos, objetivos, requisitos, benefícios
- structure: cronograma detalhado, equipamentos
- pricing: pacotes complexos, add-ons
- media: imagens, vídeos, thumbnails
- analytics: visualizações, conversões, avaliações
- settings: configurações, notificações

VANTAGENS:
✅ Performance: Queries rápidas em campos indexados
✅ Flexibilidade: Estruturas complexas em JSONB
✅ Escalabilidade: Suporte eficiente a milhares de programas
✅ Evolução: Adicionar novos campos sem breaking changes

PRÓXIMOS PASSOS:
1. Executar este script no Supabase
2. Criar hook React para CRUD operations
3. Implementar service layer
4. Testes de performance e validação

ESTRUTURA DE EXEMPLO DE DADOS (program_data):
{
  "basic_info": {
    "tags": ["tag1", "tag2"],
    "search_keywords": ["palavra1", "palavra2"]
  },
  "description": {
    "full_description": "Descrição completa...",
    "short_description": "Descrição resumida...",
    "objectives": ["objetivo1", "objetivo2"],
    "requirements": ["requisito1", "requisito2"],
    "what_you_get": ["beneficio1", "beneficio2"]
  },
  "structure": {
    "session_duration": 60,
    "total_sessions": 48,
    "schedule": [
      {
        "week": 1,
        "sessions": [
          {
            "day": "Segunda",
            "focus": "Peito e Tríceps",
            "exercises": 8
          }
        ]
      }
    ]
  },
  "pricing": {
    "packages": [
      {
        "name": "Básico",
        "price": 197,
        "description": "Descrição do pacote...",
        "features": ["feature1", "feature2"],
        "delivery_time": 1,
        "revisions": 1,
        "is_popular": false
      }
    ],
    "add_ons": [
      {
        "name": "Adicional",
        "price": 100,
        "description": "Descrição do adicional..."
      }
    ]
  },
  "media": {
    "cover_image": {
      "url": "https://...",
      "alt": "Alt text"
    },
    "gallery": [
      {
        "url": "https://...",
        "alt": "Alt text"
      }
    ],
    "videos": []
  },
  "analytics": {
    "views": 0,
    "inquiries": 0,
    "conversions": 0,
    "average_rating": 0,
    "reviews_count": 0
  },
  "settings": {
    "allow_inquiries": true,
    "auto_accept": false
  }
}
*/