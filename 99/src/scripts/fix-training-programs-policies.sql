-- ===============================================
-- CORREÇÃO DAS POLÍTICAS RLS - TRAINING PROGRAMS
-- ===============================================
-- Este script corrige as políticas da tabela 99_training_programs
-- removendo referências problemáticas à tabela users

-- ===============================================
-- 1. REMOVER POLÍTICAS EXISTENTES
-- ===============================================

DROP POLICY IF EXISTS "trainer_own_programs" ON "99_training_programs";
DROP POLICY IF EXISTS "public_published_programs" ON "99_training_programs";
DROP POLICY IF EXISTS "admin_all_programs" ON "99_training_programs";

-- ===============================================
-- 2. CRIAR POLÍTICAS SIMPLIFICADAS E SEGURAS
-- ===============================================

-- Policy: Trainers podem ver e editar apenas seus próprios programas
CREATE POLICY "trainer_own_programs" ON "99_training_programs"
  FOR ALL 
  USING (trainer_id = auth.uid());

-- Policy: Programas publicados são visíveis para todos (apenas SELECT)
CREATE POLICY "public_published_programs" ON "99_training_programs"
  FOR SELECT 
  USING (is_published = true AND status = 'published');

-- Policy: Service role pode acessar tudo (para operações do sistema)
CREATE POLICY "service_role_all_access" ON "99_training_programs"
  FOR ALL
  TO service_role
  USING (true);

-- ===============================================
-- 3. VERIFICAÇÃO DAS POLÍTICAS
-- ===============================================

-- Listar todas as políticas da tabela
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = '99_training_programs';

-- ===============================================
-- 4. TESTE DE CONECTIVIDADE
-- ===============================================

-- Verificar se a tabela é acessível
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "99_training_programs" LIMIT 1) THEN
        RAISE NOTICE 'Tabela 99_training_programs acessível!';
    ELSE
        RAISE NOTICE 'Tabela 99_training_programs vazia mas acessível.';
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE EXCEPTION 'Erro de permissão na tabela 99_training_programs';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro desconhecido: %', SQLERRM;
END $$;

-- ===============================================
-- 5. CONCEDER PERMISSÕES BÁSICAS
-- ===============================================

-- Garantir que usuários autenticados possam acessar a tabela
GRANT SELECT, INSERT, UPDATE, DELETE ON "99_training_programs" TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ===============================================
-- 6. LOGS DE VERIFICAÇÃO
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE 'Políticas RLS corrigidas para tabela 99_training_programs';
    RAISE NOTICE 'Verifique se as operações agora funcionam corretamente';
END $$;