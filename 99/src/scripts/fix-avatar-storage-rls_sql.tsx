-- =================================================================
-- FIX AVATAR STORAGE RLS POLICIES 
-- =================================================================
-- Correção das políticas RLS para uploads de avatar no bucket 'avatars'

-- 1. Verificar se o bucket 'avatars' existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Limpar políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- 3. Política para UPLOAD/INSERT - usuários podem fazer upload de seus próprios avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Política para SELECT - qualquer usuário autenticado pode ver avatars
CREATE POLICY "Users can view any avatar"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 5. Política para UPDATE - usuários podem atualizar seus próprios avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Política para DELETE - usuários podem deletar seus próprios avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 7. Verificação final - Mostrar todas as políticas ativas
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
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
ORDER BY policyname;