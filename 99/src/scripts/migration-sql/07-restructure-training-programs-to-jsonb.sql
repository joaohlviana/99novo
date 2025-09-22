-- ========================================
-- REESTRUTURAÇÃO DA TABELA 99_training_programs PARA JSONB
-- ========================================

-- IMPORTANTE: Execute este script no Supabase SQL Editor
-- Este script migra campos estruturados para JSONB mantendo compatibilidade

-- 1. Backup dos dados existentes
CREATE TABLE IF NOT EXISTS backup_training_programs_pre_jsonb AS 
SELECT * FROM "99_training_programs";

-- 2. Migrar dados existentes para a nova estrutura JSONB
UPDATE "99_training_programs" 
SET program_data = jsonb_build_object(
  -- Informações básicas (movidas de campos estruturados)
  'basic_info', jsonb_build_object(
    'title', title,
    'category', category,
    'modality', modality,
    'level', level,
    'duration', duration,
    'duration_type', duration_type,
    'frequency', frequency,
    'base_price', base_price,
    'tags', COALESCE(program_data->'basic_info'->'tags', '[]'::jsonb),
    'search_keywords', COALESCE(program_data->'basic_info'->'search_keywords', '[]'::jsonb)
  ),
  
  -- Preservar dados existentes do JSONB
  'description', COALESCE(program_data->'description', '{}'::jsonb),
  'structure', COALESCE(program_data->'structure', '{}'::jsonb),
  'pricing', COALESCE(program_data->'pricing', '{}'::jsonb),
  'gallery', COALESCE(program_data->'gallery', '{}'::jsonb),
  'settings', COALESCE(program_data->'settings', '{}'::jsonb),
  'metadata', COALESCE(program_data->'metadata', '{}'::jsonb)
)
WHERE program_data IS NOT NULL OR program_data = '{}'::jsonb;

-- 3. Remover campos estruturados antigos (após confirmar migração)
-- CUIDADO: Execute apenas após verificar que os dados foram migrados corretamente
/*
ALTER TABLE "99_training_programs" 
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS modality,
DROP COLUMN IF EXISTS level,
DROP COLUMN IF EXISTS duration,
DROP COLUMN IF EXISTS duration_type,
DROP COLUMN IF EXISTS frequency,
DROP COLUMN IF EXISTS base_price;
*/

-- 4. Atualizar índices para trabalhar com a nova estrutura JSONB
DROP INDEX IF EXISTS idx_training_programs_category;
DROP INDEX IF EXISTS idx_training_programs_modality;
DROP INDEX IF EXISTS idx_training_programs_level;
DROP INDEX IF EXISTS idx_training_programs_price;
DROP INDEX IF EXISTS idx_training_programs_duration;
DROP INDEX IF EXISTS idx_training_programs_frequency;

-- Novos índices JSONB
CREATE INDEX IF NOT EXISTS idx_training_programs_basic_info_category 
ON "99_training_programs" USING btree (((program_data->'basic_info'->>'category')::text));

CREATE INDEX IF NOT EXISTS idx_training_programs_basic_info_modality 
ON "99_training_programs" USING btree (((program_data->'basic_info'->>'modality')::text));

CREATE INDEX IF NOT EXISTS idx_training_programs_basic_info_level 
ON "99_training_programs" USING btree (((program_data->'basic_info'->>'level')::text));

CREATE INDEX IF NOT EXISTS idx_training_programs_basic_info_price 
ON "99_training_programs" USING btree (((program_data->'basic_info'->>'base_price')::numeric));

CREATE INDEX IF NOT EXISTS idx_training_programs_basic_info_duration 
ON "99_training_programs" USING btree (((program_data->'basic_info'->>'duration')::integer));

CREATE INDEX IF NOT EXISTS idx_training_programs_basic_info_frequency 
ON "99_training_programs" USING btree (((program_data->'basic_info'->>'frequency')::integer));

-- Índice composto para busca eficiente
CREATE INDEX IF NOT EXISTS idx_training_programs_search_composite 
ON "99_training_programs" USING btree (
  is_published, 
  status, 
  ((program_data->'basic_info'->>'category')::text),
  ((program_data->'basic_info'->>'modality')::text),
  created_at DESC
) WHERE is_published = true;

-- 5. Criar funções auxiliares para compatibilidade

-- Função para extrair preço base (compatibilidade)
CREATE OR REPLACE FUNCTION get_program_base_price(program_data jsonb)
RETURNS numeric AS $$
BEGIN
  RETURN COALESCE((program_data->'basic_info'->>'base_price')::numeric, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para extrair título
CREATE OR REPLACE FUNCTION get_program_title(program_data jsonb)
RETURNS text AS $$
BEGIN
  RETURN COALESCE(program_data->'basic_info'->>'title', '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para extrair categoria
CREATE OR REPLACE FUNCTION get_program_category(program_data jsonb)
RETURNS text AS $$
BEGIN
  RETURN COALESCE(program_data->'basic_info'->>'category', '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 6. Atualizar trigger para calcular preço base
CREATE OR REPLACE FUNCTION update_training_programs_base_price()
RETURNS trigger AS $$
BEGIN
  -- Não precisamos mais do trigger pois o preço está no JSONB
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Verificar migração
-- Execute esta query para verificar se os dados foram migrados corretamente:
/*
SELECT 
  id,
  trainer_id,
  is_published,
  status,
  program_data->'basic_info'->>'title' as title,
  program_data->'basic_info'->>'category' as category,
  program_data->'basic_info'->>'modality' as modality,
  program_data->'basic_info'->>'level' as level,
  (program_data->'basic_info'->>'duration')::integer as duration,
  program_data->'basic_info'->>'duration_type' as duration_type,
  (program_data->'basic_info'->>'frequency')::integer as frequency,
  (program_data->'basic_info'->>'base_price')::numeric as base_price,
  created_at,
  updated_at
FROM "99_training_programs"
LIMIT 5;
*/

-- NOVA ESTRUTURA FINAL DA TABELA (após remoção dos campos antigos):
/*
CREATE TABLE public."99_training_programs" (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  trainer_id uuid NOT NULL,
  is_published boolean NULL DEFAULT false,
  status character varying(20) NULL DEFAULT 'draft'::character varying,
  program_data jsonb NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT 99_training_programs_pkey PRIMARY KEY (id),
  CONSTRAINT 99_training_programs_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES auth.users(id)
);

-- Estrutura esperada do program_data JSONB:
{
  "basic_info": {
    "title": "string",
    "category": "string", 
    "modality": "string",
    "level": "string",
    "duration": number,
    "duration_type": "string",
    "frequency": number,
    "base_price": number,
    "tags": ["string"],
    "search_keywords": ["string"]
  },
  "description": {
    "overview": "string",
    "objectives": ["string"],
    "target_audience": "string",
    "requirements": ["string"]
  },
  "structure": {
    "modules": [],
    "sessions": [],
    "exercises": []
  },
  "pricing": {
    "packages": [],
    "discounts": {},
    "payment_options": []
  },
  "gallery": {
    "images": ["string"],
    "videos": ["string"]
  },
  "settings": {
    "auto_approve": boolean,
    "max_students": number,
    "difficulty_level": string
  },
  "metadata": {
    "version": "string",
    "last_modified_by": "string",
    "last_modified_at": "timestamp"
  }
}
*/