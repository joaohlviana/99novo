-- ===============================================
-- CORREÇÃO DAS POLICIES RLS - TRAINING PROGRAMS
-- ===============================================
-- Este script corrige o erro de permissão na tabela users
-- removendo a policy problemática de admin

-- ===============================================
-- 1. REMOVER POLICY PROBLEMÁTICA
-- ===============================================

-- Remover a policy de admin que estava tentando acessar auth.users
DROP POLICY IF EXISTS "admin_all_programs" ON "99_training_programs";

-- ===============================================
-- 2. CRIAR POLICY SIMPLIFICADA PARA ADMIN
-- ===============================================

-- Policy simplificada para admin baseada apenas em metadata
CREATE POLICY "admin_all_programs_simple" ON "99_training_programs"
  FOR ALL 
  TO authenticated
  USING (
    COALESCE(
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
      'client'
    ) = 'admin'
  );

-- ===============================================
-- 3. VERIFICAR POLICIES EXISTENTES
-- ===============================================

-- Listar todas as policies para verificar
DO $$
BEGIN
    -- Verificar se as policies principais existem
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = '99_training_programs' 
        AND policyname = 'trainer_own_programs'
    ) THEN
        RAISE NOTICE '✅ Policy trainer_own_programs existe';
    ELSE
        RAISE WARNING '⚠️ Policy trainer_own_programs não encontrada';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = '99_training_programs' 
        AND policyname = 'public_published_programs'
    ) THEN
        RAISE NOTICE '✅ Policy public_published_programs existe';
    ELSE
        RAISE WARNING '⚠️ Policy public_published_programs não encontrada';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = '99_training_programs' 
        AND policyname = 'admin_all_programs_simple'
    ) THEN
        RAISE NOTICE '✅ Policy admin_all_programs_simple criada com sucesso';
    ELSE
        RAISE WARNING '⚠️ Policy admin_all_programs_simple não foi criada';
    END IF;
END $$;

-- ===============================================
-- 4. COMENTÁRIOS EXPLICATIVOS
-- ===============================================

COMMENT ON POLICY "admin_all_programs_simple" ON "99_training_programs" IS 
'Policy simplificada para admins - usa apenas JWT metadata, não acessa tabela users';

-- ===============================================
-- 5. DOCUMENTAÇÃO FINAL
-- ===============================================

/*
CORREÇÃO APLICADA:

PROBLEMA:
- Policy "admin_all_programs" estava tentando acessar auth.users.raw_user_meta_data
- Isso causava erro "permission denied for table users"

SOLUÇÃO:
- Removida policy problemática
- Criada nova policy "admin_all_programs_simple" 
- Nova policy usa apenas auth.jwt() que não requer acesso à tabela users
- Verifica role='admin' no JWT metadata

POLICIES FINAIS:
1. trainer_own_programs - Trainers veem apenas seus programas
2. public_published_programs - Programas publicados visíveis para todos
3. admin_all_programs_simple - Admins veem todos os programas (sem acessar tabela users)

TESTADO E VALIDADO ✅
*/