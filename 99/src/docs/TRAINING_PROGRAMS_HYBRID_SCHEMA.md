# 🏗️ Training Programs - Esquema Híbrido

## 📋 Visão Geral
Este documento descreve o esquema híbrido para programas de treino, combinando campos relacionais (PostgreSQL) para dados críticos com campos JSON (JSONB) para dados flexíveis.

## 🗃️ Estrutura da Tabela: `99_training_programs`

### 🔑 Campos Relacionais (PostgreSQL)
Dados críticos para queries, busca, filtros e performance:

```sql
CREATE TABLE "99_training_programs" (
  -- Identificação
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id           UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Dados essenciais para busca
  title                TEXT NOT NULL,
  category             VARCHAR(100) NOT NULL,  -- 'musculacao', 'crossfit', 'funcional', etc.
  modality             VARCHAR(50) NOT NULL,   -- 'presencial', 'online', 'hibrido'
  level                VARCHAR(50) NOT NULL,   -- 'iniciante', 'intermediario', 'avancado', 'todos_niveis'
  
  -- Estrutura básica
  duration             INTEGER NOT NULL,       -- número de períodos
  duration_type        VARCHAR(20) NOT NULL DEFAULT 'weeks', -- 'days', 'weeks', 'months'
  frequency            INTEGER NOT NULL,       -- sessões por semana
  
  -- Preço e status
  base_price           DECIMAL(10,2) NOT NULL, -- menor preço dos pacotes (para filtros)
  is_published         BOOLEAN DEFAULT FALSE,
  status               VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'paused', 'archived'
  
  -- Campos híbridos (JSONB)
  program_data         JSONB DEFAULT '{}',     -- dados flexíveis do programa
  
  -- Timestamps
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🔧 Campos Flexíveis (JSONB - program_data)

#### 1. **Basic Info**
```json
{
  "basic_info": {
    "tags": ["emagrecimento", "hipertrofia", "definição"],
    "search_keywords": ["musculacao", "academia", "treino"],
    "subtitle": "Transforme seu corpo em 12 semanas",
    "difficulty_level": "intermediario"
  }
}
```

#### 2. **Description**
```json
{
  "description": {
    "full_description": "Descrição completa e detalhada do programa...",
    "short_description": "Descrição resumida para cards e previews...",
    "objectives": [
      "Ganhar massa muscular",
      "Melhorar condicionamento",
      "Definir músculos"
    ],
    "requirements": [
      "Experiência básica em musculação",
      "Acesso à academia completa",
      "Disponibilidade de 1h por dia"
    ],
    "what_you_get": [
      "PDF com exercícios detalhados",
      "Acompanhamento semanal via WhatsApp",
      "Planilha de evolução personalizada",
      "Vídeos demonstrativos dos exercícios"
    ],
    "target_audience": "Pessoas com experiência intermediária em treino"
  }
}
```

#### 3. **Structure**
```json
{
  "structure": {
    "session_duration": 60,
    "total_sessions": 36,
    "schedule": [
      {
        "week": 1,
        "sessions": [
          {
            "day": "Segunda",
            "focus": "Peito e Tríceps",
            "exercises": 8,
            "estimated_duration": 60
          },
          {
            "day": "Quarta", 
            "focus": "Costas e Bíceps",
            "exercises": 8,
            "estimated_duration": 60
          }
        ]
      }
    ],
    "equipment_needed": [
      "halteres",
      "barras",
      "bancos",
      "esteira"
    ],
    "difficulty_progression": {
      "type": "weekly",
      "description": "Intensidade aumenta gradualmente a cada semana"
    },
    "rest_periods": {
      "between_sets": "60-90s",
      "between_exercises": "2-3min"
    }
  }
}
```

#### 4. **Pricing**
```json
{
  "pricing": {
    "packages": [
      {
        "id": 1,
        "name": "Básico",
        "price": 197,
        "description": "Programa completo com suporte básico",
        "features": [
          "Acesso completo ao programa",
          "PDF com exercícios detalhados",
          "Suporte via WhatsApp (horário comercial)"
        ],
        "delivery_time": 1,
        "revisions": 1,
        "is_popular": false,
        "badge": null
      },
      {
        "id": 2,
        "name": "Padrão",
        "price": 397,
        "description": "Programa + acompanhamento personalizado",
        "features": [
          "Tudo do pacote Básico",
          "Acompanhamento semanal",
          "Ajustes no programa conforme evolução",
          "Suporte prioritário via WhatsApp",
          "Planilha de evolução personalizada"
        ],
        "delivery_time": 1,
        "revisions": 2,
        "is_popular": true,
        "badge": "Mais Popular"
      }
    ],
    "add_ons": [
      {
        "id": 1,
        "name": "Plano Nutricional Personalizado",
        "price": 150,
        "description": "Cardápio completo baseado nos seus objetivos e restrições alimentares"
      },
      {
        "id": 2,
        "name": "Videochamada Extra (30min)",
        "price": 80,
        "description": "Sessão individual para tirar dúvidas e ajustar técnicas"
      }
    ],
    "pricing_strategy": "fixed",
    "discount_available": false,
    "promotional_price": null
  }
}
```

#### 5. **Media**
```json
{
  "media": {
    "cover_image": {
      "url": "https://storage.supabase.co/.../cover.jpg",
      "alt": "Programa de Transformação Corporal",
      "width": 1920,
      "height": 1080
    },
    "gallery": [
      {
        "url": "https://storage.supabase.co/.../img1.jpg",
        "alt": "Exercício de peito",
        "type": "exercise_demo"
      },
      {
        "url": "https://storage.supabase.co/.../img2.jpg", 
        "alt": "Resultado antes/depois",
        "type": "results"
      }
    ],
    "videos": [
      {
        "url": "https://storage.supabase.co/.../demo1.mp4",
        "thumbnail": "https://storage.supabase.co/.../thumb1.jpg",
        "duration": 45,
        "title": "Demonstração dos exercícios principais",
        "type": "demo"
      }
    ],
    "media_settings": {
      "auto_play_videos": false,
      "show_thumbnails": true,
      "lazy_loading": true
    }
  }
}
```

#### 6. **Analytics & Settings**
```json
{
  "analytics": {
    "views": 0,
    "inquiries": 0,
    "conversions": 0,
    "conversion_rate": 0,
    "average_rating": 0,
    "reviews_count": 0,
    "clicks": 0,
    "favorites": 0
  },
  "seo": {
    "meta_title": "Programa de Transformação Corporal - 12 Semanas",
    "meta_description": "Transforme seu corpo em 12 semanas com nosso programa comprovado de treino e nutrição.",
    "slug": "transformacao-corporal-12-semanas",
    "keywords": ["transformação corporal", "programa treino", "12 semanas"]
  },
  "settings": {
    "visibility": {
      "public": true,
      "searchable": true,
      "featured": false
    },
    "interactions": {
      "allow_inquiries": true,
      "auto_accept_bookings": false,
      "require_approval": true
    },
    "notifications": {
      "new_inquiry": true,
      "booking_confirmed": true,
      "program_viewed": false,
      "review_received": true
    },
    "advanced": {
      "allow_customization": true,
      "enable_chat": true,
      "show_trainer_contact": true
    }
  }
}
```

## 🔍 Índices Recomendados

```sql
-- Índices para performance de busca
CREATE INDEX idx_training_programs_trainer_id ON "99_training_programs"(trainer_id);
CREATE INDEX idx_training_programs_category ON "99_training_programs"(category);
CREATE INDEX idx_training_programs_modality ON "99_training_programs"(modality);
CREATE INDEX idx_training_programs_level ON "99_training_programs"(level);
CREATE INDEX idx_training_programs_published ON "99_training_programs"(is_published) WHERE is_published = true;
CREATE INDEX idx_training_programs_status ON "99_training_programs"(status);
CREATE INDEX idx_training_programs_price ON "99_training_programs"(base_price);

-- Índices JSONB para busca em tags
CREATE INDEX idx_training_programs_tags ON "99_training_programs" USING GIN ((program_data->'basic_info'->>'tags'));
CREATE INDEX idx_training_programs_keywords ON "99_training_programs" USING GIN ((program_data->'basic_info'->>'search_keywords'));

-- Índice composto para listagens
CREATE INDEX idx_training_programs_list ON "99_training_programs"(is_published, status, created_at DESC) WHERE is_published = true;
```

## 🔧 Triggers para Manutenção

```sql
-- Trigger para atualizar updated_at
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

-- Trigger para atualizar base_price automaticamente
CREATE OR REPLACE FUNCTION update_base_price()
RETURNS TRIGGER AS $$
DECLARE
  min_price DECIMAL(10,2);
BEGIN
  -- Extrair o menor preço dos pacotes
  SELECT MIN(CAST(package->>'price' AS DECIMAL(10,2)))
  INTO min_price
  FROM jsonb_array_elements(NEW.program_data->'pricing'->'packages') AS package;
  
  NEW.base_price = COALESCE(min_price, 0);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER training_programs_base_price
  BEFORE INSERT OR UPDATE ON "99_training_programs"
  FOR EACH ROW
  EXECUTE FUNCTION update_base_price();
```

## 📊 Views Úteis

```sql
-- View para listagem pública de programas
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
  program_data->'description'->>'short_description' as short_description,
  program_data->'media'->'cover_image'->>'url' as cover_image,
  program_data->'basic_info'->'tags' as tags,
  program_data->'analytics'->>'average_rating' as rating,
  program_data->'analytics'->>'reviews_count' as reviews_count,
  created_at,
  updated_at
FROM "99_training_programs"
WHERE is_published = true AND status = 'published';
```

## 🚀 Vantagens desta Estrutura

### ✅ **Performance**
- Campos críticos indexáveis (trainer_id, category, price)
- Busca rápida por filtros essenciais
- Paginação eficiente

### ✅ **Flexibilidade**  
- Estrutura JSON adaptável para novos recursos
- Suporte a diferentes tipos de programas
- Evolução sem quebrar código existente

### ✅ **Escalabilidade**
- Campos relacionais para queries otimizadas
- JSONB para dados complexos e variáveis
- Índices específicos onde necessário

### ✅ **Manutenibilidade**
- Triggers automáticos para consistency
- Views para queries comuns
- Estrutura clara e documentada

## 📋 Checklist de Implementação

- [ ] Criar tabela `99_training_programs`
- [ ] Implementar índices recomendados
- [ ] Configurar triggers automáticos
- [ ] Criar views auxiliares
- [ ] Configurar RLS policies
- [ ] Implementar hook React para CRUD
- [ ] Criar service layer para abstração
- [ ] Testes de performance e validação