# 🏗️ Plano de Migração: Banco Híbrido (Relacional + JSON)

## 📊 Análise da Estrutura Atual

### Estrutura Relacional Existente
```sql
-- Núcleo relacional (manter)
users (id, email, phone, created_at, updated_at)
user_profiles (user_id, first_name, last_name, display_name, bio, avatar_url)
trainer_profiles (user_id, experience_years, response_time_hours, total_students)
cities (id, name, state_id, ibge_code)
states (id, name, code)
sports (id, name, category)
trainer_specialties (trainer_id, sport_id, experience_level)
trainer_service_cities (trainer_id, city_id)
```

## 🎯 Estratégia Híbrida

### Fase 1: Adicionar Campos JSON às Tabelas Existentes

```sql
-- 1. Expandir user_profiles com dados flexíveis
ALTER TABLE user_profiles ADD COLUMN 
  profile_data JSONB DEFAULT '{}';

-- 2. Expandir trainer_profiles com configurações dinâmicas  
ALTER TABLE trainer_profiles ADD COLUMN 
  business_config JSONB DEFAULT '{}',
  service_config JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}';

-- 3. Nova tabela para programas com estrutura flexível
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'draft',
  content JSONB NOT NULL DEFAULT '{}', -- Estrutura flexível do programa
  pricing JSONB DEFAULT '{}', -- Modelos de preço dinâmicos
  metadata JSONB DEFAULT '{}', -- Tags, dificuldade, duração
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Sistema de configurações globais
CREATE TABLE platform_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Sistema de eventos/histórico flexível
CREATE TABLE user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Mídia/arquivos com metadados JSON
ALTER TABLE media_files ADD COLUMN 
  metadata JSONB DEFAULT '{}';
```

### Fase 2: Estruturas JSON Específicas

#### A. Profile Data (user_profiles.profile_data)
```json
{
  "trainer": {
    "personal": {
      "title": "Personal Trainer Especializado",
      "instagram_url": "@trainer123",
      "youtube_url": "youtube.com/trainer123",
      "whatsapp": "+5511999999999"
    },
    "location": {
      "address": "Rua das Flores, 123",
      "complement": "Apt 45",
      "cep": "01234-567",
      "coordinates": {
        "lat": -23.5505,
        "lng": -46.6333
      }
    },
    "verification": {
      "documents": ["rg", "cpf", "cref"],
      "status": "verified",
      "verified_at": "2025-01-15T10:00:00Z"
    }
  },
  "client": {
    "fitness": {
      "goals": ["weight_loss", "muscle_gain"],
      "activity_level": "moderate",
      "restrictions": ["knee_injury"],
      "measurements": {
        "height": 175,
        "weight": 75,
        "body_fat": 15.5
      }
    },
    "preferences": {
      "training_time": "morning",
      "intensity": "high",
      "budget_range": {
        "min": 100,
        "max": 300
      }
    }
  }
}
```

#### B. Business Config (trainer_profiles.business_config)
```json
{
  "pricing": {
    "individual": {
      "session_price": 150,
      "package_discounts": {
        "4_sessions": 10,
        "8_sessions": 15,
        "12_sessions": 20
      }
    },
    "group": {
      "max_participants": 6,
      "price_per_person": 50
    },
    "online": {
      "session_price": 100,
      "platform_fee": 10
    }
  },
  "policies": {
    "cancellation": "24h",
    "rescheduling": "12h",
    "late_fee": 50,
    "no_show_policy": "charge_full"
  },
  "payment": {
    "methods": ["pix", "card", "bank_transfer"],
    "payment_terms": "advance",
    "invoice_settings": {
      "auto_generate": true,
      "payment_deadline_days": 7
    }
  }
}
```

#### C. Service Config (trainer_profiles.service_config)
```json
{
  "availability": {
    "schedule": {
      "monday": [
        {"start": "06:00", "end": "12:00"},
        {"start": "14:00", "end": "20:00"}
      ],
      "tuesday": [
        {"start": "06:00", "end": "12:00"}
      ]
    },
    "time_zone": "America/Sao_Paulo",
    "booking_advance_days": 7,
    "booking_limit_days": 30
  },
  "service_modes": {
    "online": {
      "enabled": true,
      "platforms": ["zoom", "meet", "teams"],
      "equipment_required": ["webcam", "stable_internet"]
    },
    "in_person": {
      "enabled": true,
      "travel_radius_km": 20,
      "travel_fee_per_km": 2.50,
      "locations": ["home", "gym", "park", "studio"]
    }
  },
  "specializations": {
    "primary": ["weight_training", "crossfit"],
    "secondary": ["nutrition", "rehabilitation"],
    "certifications_mapping": {
      "CREF": "123456-G/SP",
      "CrossFit_L1": "CF-L1-20230915"
    }
  }
}
```

#### D. Program Content Structure
```json
{
  "structure": {
    "type": "progressive", // "single", "multi_phase", "adaptive"
    "duration_weeks": 12,
    "phases": [
      {
        "name": "Adaptação",
        "duration_weeks": 4,
        "description": "Fase inicial de condicionamento",
        "workouts": [
          {
            "week": 1,
            "day": 1,
            "name": "Treino A - Superiores",
            "exercises": [
              {
                "name": "Supino reto",
                "sets": 3,
                "reps": "12-15",
                "rest": "60s",
                "notes": "Controle na descida"
              }
            ]
          }
        ]
      }
    ]
  },
  "resources": {
    "videos": [
      {
        "title": "Demonstração Supino",
        "url": "video_123.mp4",
        "duration": 45,
        "exercise": "supino_reto"
      }
    ],
    "documents": [
      {
        "title": "Guia Nutricional",
        "url": "guide_nutrition.pdf",
        "type": "nutrition"
      }
    ],
    "assessments": [
      {
        "name": "Avaliação Inicial",
        "questions": [
          {
            "question": "Qual seu nível de experiência?",
            "type": "multiple_choice",
            "options": ["Iniciante", "Intermediário", "Avançado"]
          }
        ]
      }
    ]
  },
  "requirements": {
    "equipment": ["dumbbells", "barbell", "bench"],
    "space": "gym",
    "fitness_level": "beginner",
    "time_per_session": 60
  }
}
```

### Fase 3: Configurações Globais Flexíveis

```sql
-- Configurações de esportes/modalidades
INSERT INTO platform_config (key, value) VALUES 
('sports_categories', '{
  "categories": [
    {
      "id": "fitness",
      "name": "Fitness",
      "sports": ["musculacao", "crossfit", "funcional"],
      "icon": "dumbbell",
      "color": "#e0093e"
    },
    {
      "id": "martial_arts", 
      "name": "Artes Marciais",
      "sports": ["jiu_jitsu", "muay_thai", "boxe"],
      "icon": "fist",
      "color": "#8B0000"
    }
  ]
}');

-- Configurações de preços dinâmicos
INSERT INTO platform_config (key, value) VALUES
('pricing_templates', '{
  "templates": [
    {
      "name": "Padrão Personal",
      "individual": {"min": 80, "max": 200},
      "group": {"min": 40, "max": 100},
      "online": {"min": 60, "max": 150}
    },
    {
      "name": "Premium",
      "individual": {"min": 150, "max": 400},
      "group": {"min": 80, "max": 200},
      "online": {"min": 100, "max": 250}
    }
  ]
}');
```

### Fase 4: Índices e Performance

```sql
-- Índices para consultas JSON
CREATE INDEX idx_user_profiles_profile_data_gin ON user_profiles USING GIN (profile_data);
CREATE INDEX idx_trainer_profiles_business_config_gin ON trainer_profiles USING GIN (business_config);
CREATE INDEX idx_trainer_profiles_service_config_gin ON trainer_profiles USING GIN (service_config);
CREATE INDEX idx_programs_content_gin ON programs USING GIN (content);
CREATE INDEX idx_programs_metadata_gin ON programs USING GIN (metadata);
CREATE INDEX idx_user_events_event_data_gin ON user_events USING GIN (event_data);

-- Índices compostos para filtros comuns
CREATE INDEX idx_programs_trainer_status ON programs(trainer_id, status);
CREATE INDEX idx_user_events_user_type ON user_events(user_id, event_type);
```

## 🔄 Migration Scripts

### Script 1: Adicionar Campos JSON
```sql
-- Execute em ambiente de staging primeiro
BEGIN;

-- Backup das tabelas afetadas
CREATE TABLE user_profiles_backup AS SELECT * FROM user_profiles;
CREATE TABLE trainer_profiles_backup AS SELECT * FROM trainer_profiles;

-- Adicionar campos JSON
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}';
ALTER TABLE trainer_profiles ADD COLUMN IF NOT EXISTS business_config JSONB DEFAULT '{}';
ALTER TABLE trainer_profiles ADD COLUMN IF NOT EXISTS service_config JSONB DEFAULT '{}';
ALTER TABLE trainer_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Verificar se as colunas foram criadas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'profile_data'
  ) THEN
    RAISE EXCEPTION 'Falha ao criar coluna profile_data';
  END IF;
END$$;

COMMIT;
```

### Script 2: Migrar Dados Existentes
```sql
-- Migrar dados existentes para formato JSON
UPDATE user_profiles SET profile_data = jsonb_build_object(
  'trainer', jsonb_build_object(
    'personal', jsonb_build_object(
      'instagram_url', COALESCE(instagram_url, ''),
      'title', 'Personal Trainer'
    )
  )
) WHERE profile_data = '{}';

-- Migrar configurações do trainer
UPDATE trainer_profiles SET 
  service_config = jsonb_build_object(
    'availability', jsonb_build_object(
      'booking_advance_days', 7,
      'booking_limit_days', 30
    ),
    'service_modes', jsonb_build_object(
      'online', jsonb_build_object('enabled', true),
      'in_person', jsonb_build_object('enabled', true)
    )
  ),
  business_config = jsonb_build_object(
    'pricing', jsonb_build_object(
      'individual', jsonb_build_object('session_price', 150)
    ),
    'policies', jsonb_build_object(
      'cancellation', '24h'
    )
  )
WHERE service_config = '{}';
```

## 🎯 Vantagens da Migração Híbrida

### ✅ Benefícios Imediatos
1. **Escalabilidade**: Novos campos sem migrations
2. **Flexibilidade**: Schemas diferentes por tipo de usuário
3. **Performance**: Mantém JOINs eficientes nas consultas principais
4. **Compatibilidade**: Código atual continua funcionando
5. **Evolução Gradual**: Migração por fases, sem downtime

### 🚀 Funcionalidades Habilitadas
1. **Perfis Dinâmicos**: Cada tipo de usuário pode ter campos específicos
2. **Configurações Flexíveis**: Preços, políticas e preferências customizáveis
3. **Programas Complexos**: Estruturas de treino totalmente flexíveis
4. **Analytics Avançados**: Eventos estruturados para BI
5. **Multi-tenant**: Configurações diferentes por região/filial

### 📊 Comparação: Antes vs Depois

| Aspecto | Antes (Só Relacional) | Depois (Híbrido) |
|---------|----------------------|-------------------|
| Novos campos | Requires migration | Add to JSON |
| Tipos de usuário | Limited schemas | Flexible schemas |
| Configurações | Hard-coded | Dynamic |
| Queries complexas | Multiple JOINs | JSON + Relations |
| Versionamento | Database migrations | JSON versioning |

## 🔧 Implementação Prática

### Passo 1: Backup e Preparação
```bash
# Backup do banco atual
pg_dump $DATABASE_URL > backup_pre_migration.sql

# Criar ambiente de teste
# Executar scripts em staging primeiro
```

### Passo 2: Execução Gradual
1. ✅ Adicionar campos JSON (sem impacto)
2. ✅ Migrar dados existentes (background)
3. ✅ Atualizar aplicação para usar híbrido
4. ✅ Deprecar campos antigos (gradualmente)

### Passo 3: Validação
```sql
-- Verificar integridade dos dados migrados
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN profile_data != '{}' THEN 1 END) as migrated_profiles,
  COUNT(CASE WHEN profile_data->>'trainer' IS NOT NULL THEN 1 END) as trainer_profiles
FROM user_profiles;
```

## 🎨 Próximos Passos

1. **Revisar e ajustar** estruturas JSON baseadas nas necessidades específicas
2. **Executar migration em staging** para validar
3. **Atualizar código TypeScript** para usar novos campos
4. **Implementar versionamento** de schemas JSON
5. **Configurar monitoring** para performance das queries JSON

---

Este plano permite **evolução gradual** mantendo **estabilidade** do sistema atual! 🚀