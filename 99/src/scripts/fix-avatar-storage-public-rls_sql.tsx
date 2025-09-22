-- =====================================================
-- 🔓 AVATAR STORAGE - RLS PÚBLICO SIMPLIFICADO
-- =====================================================
-- Este script torna o bucket 'avatars' completamente público
-- Todos podem visualizar avatars, apenas donos podem fazer CRUD

-- 1️⃣ Remover todas as políticas existentes do bucket avatars
DROP POLICY IF EXISTS "Avatars owner can CRUD" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;

-- 2️⃣ Garantir que RLS está habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3️⃣ POLÍTICA PÚBLICA - Qualquer pessoa pode VER avatars (READ)
CREATE POLICY "Public avatars read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- 4️⃣ POLÍTICA AUTENTICADA - Apenas usuários autenticados podem fazer UPLOAD
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5️⃣ POLÍTICA PROPRIETÁRIO - Apenas dono pode ATUALIZAR
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6️⃣ POLÍTICA PROPRIETÁRIO - Apenas dono pode DELETAR
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7️⃣ Verificar se o bucket existe e é público
DO $$
BEGIN
  -- Verificar se bucket avatars existe
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    -- Criar bucket se não existir
    INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types, owner)
    VALUES (
      'avatars',
      'avatars', 
      true,  -- ✅ PÚBLICO
      false,
      52428800, -- 50MB limit
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      NULL
    );
    
    RAISE NOTICE '✅ Bucket avatars criado como PÚBLICO';
  ELSE
    -- Atualizar bucket para ser público
    UPDATE storage.buckets 
    SET 
      public = true,  -- ✅ PÚBLICO
      avif_autodetection = false,
      file_size_limit = 52428800,
      allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    WHERE id = 'avatars';
    
    RAISE NOTICE '✅ Bucket avatars atualizado para PÚBLICO';
  END IF;
END $$;

-- 8️⃣ Verificação final das políticas
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE '%avatar%';
    
  RAISE NOTICE '📊 Total de políticas de avatar configuradas: %', policy_count;
  
  -- Listar todas as políticas
  FOR policy_count IN (
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname LIKE '%avatar%'
    ORDER BY policyname
  ) LOOP
    RAISE NOTICE '  ✅ Política: %', policy_count;
  END LOOP;
END $$;

-- =====================================================
-- 🧪 TESTE DE VALIDAÇÃO
-- =====================================================

-- Teste 1: Verificar configuração do bucket
SELECT 
  id,
  name,
  public as "é_público",
  file_size_limit as "limite_tamanho",
  allowed_mime_types as "tipos_permitidos"
FROM storage.buckets 
WHERE id = 'avatars';

-- Teste 2: Listar políticas ativas
SELECT 
  policyname as "nome_política",
  cmd as "operação",
  qual as "condição"
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- =====================================================
-- 📋 RESUMO DA CONFIGURAÇÃO
-- =====================================================

/*
✅ CONFIGURAÇÃO FINAL - AVATAR STORAGE PÚBLICO:

1. 🔓 VISUALIZAÇÃO: Completamente pública
   - Qualquer pessoa pode ver avatars
   - Sem necessidade de autenticação para READ

2. 🔐 UPLOAD/CRUD: Apenas usuários autenticados
   - INSERT: Apenas usuários autenticados
   - UPDATE: Apenas o dono do arquivo
   - DELETE: Apenas o dono do arquivo

3. 📁 ESTRUTURA DE PASTAS: 
   - Padrão: avatars/{user_id}/avatar/avatar.jpg
   - Validação: Primeiro segmento = user_id do dono

4. 🚀 BENEFÍCIOS:
   - ✅ Avatars visíveis publicamente (sem auth)
   - ✅ Segurança mantida para modificações
   - ✅ Performance melhorada (sem verificação auth no READ)
   - ✅ URLs diretas funcionam sem tokens

5. 🛡️ SEGURANÇA:
   - ❌ Apenas donos podem modificar
   - ✅ Qualquer um pode visualizar
   - ✅ Estrutura de pastas validada
*/