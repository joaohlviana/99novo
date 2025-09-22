-- =====================================================
-- 🧪 VERIFICAÇÃO DO SETUP DE AVATARS
-- =====================================================
-- Execute APÓS configurar via Supabase Dashboard
-- Este script apenas VERIFICA, não modifica nada

-- 1️⃣ Verificar se bucket avatars existe e está público
SELECT 
  '🔍 BUCKET AVATARS' as verificacao,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') 
    THEN '✅ Bucket existe'
    ELSE '❌ Bucket não encontrado' 
  END as status_bucket,
  CASE 
    WHEN (SELECT public FROM storage.buckets WHERE id = 'avatars') = true 
    THEN '✅ Bucket é público'
    ELSE '❌ Bucket não é público' 
  END as status_publico;

-- 2️⃣ Detalhes da configuração do bucket
SELECT 
  '📋 CONFIGURAÇÃO DO BUCKET' as secao,
  id as bucket_id,
  name as bucket_name,
  public as eh_publico,
  file_size_limit as limite_tamanho_bytes,
  file_size_limit / (1024 * 1024) as limite_tamanho_mb,
  allowed_mime_types as tipos_permitidos
FROM storage.buckets 
WHERE id = 'avatars';

-- 3️⃣ Verificar políticas RLS existentes
SELECT 
  '🛡️ POLÍTICAS RLS' as secao,
  policyname as nome_politica,
  cmd as operacao,
  CASE cmd
    WHEN 'SELECT' THEN '👁️ Visualização'
    WHEN 'INSERT' THEN '📤 Upload'
    WHEN 'UPDATE' THEN '✏️ Atualização'
    WHEN 'DELETE' THEN '🗑️ Exclusão'
    ELSE cmd
  END as tipo_operacao,
  CASE 
    WHEN qual IS NOT NULL THEN '✅ Tem condições'
    ELSE '❌ Sem condições'
  END as tem_restricoes
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%avatar%'
ORDER BY cmd, policyname;

-- 4️⃣ Contar políticas por operação
SELECT 
  '📊 RESUMO DAS POLÍTICAS' as secao,
  cmd as operacao,
  COUNT(*) as quantidade_politicas,
  CASE 
    WHEN cmd = 'SELECT' AND COUNT(*) >= 1 THEN '✅ OK'
    WHEN cmd = 'INSERT' AND COUNT(*) >= 1 THEN '✅ OK'
    WHEN cmd = 'UPDATE' AND COUNT(*) >= 1 THEN '✅ OK'
    WHEN cmd = 'DELETE' AND COUNT(*) >= 1 THEN '✅ OK'
    ELSE '⚠️ Faltando'
  END as status
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%avatar%'
GROUP BY cmd
ORDER BY cmd;

-- 5️⃣ Verificar se RLS está habilitado
SELECT 
  '🔒 ROW LEVEL SECURITY' as secao,
  schemaname as schema,
  tablename as tabela,
  rowsecurity as rls_habilitado,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS ativo'
    ELSE '❌ RLS desabilitado'
  END as status
FROM pg_tables 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- 6️⃣ Diagnóstico geral
SELECT 
  '🎯 DIAGNÓSTICO FINAL' as secao,
  CASE 
    WHEN bucket_exists AND bucket_public AND policies_count >= 4 AND rls_enabled 
    THEN '🎉 CONFIGURAÇÃO COMPLETA - Pronto para usar!'
    WHEN bucket_exists AND NOT bucket_public 
    THEN '⚠️ Bucket existe mas não é público'
    WHEN bucket_exists AND policies_count < 4 
    THEN '⚠️ Faltam políticas RLS'
    WHEN NOT bucket_exists 
    THEN '❌ Bucket avatars não existe'
    ELSE '⚠️ Verificar configuração'
  END as resultado_final
FROM (
  SELECT 
    EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') as bucket_exists,
    COALESCE((SELECT public FROM storage.buckets WHERE id = 'avatars'), false) as bucket_public,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%avatar%') as policies_count,
    COALESCE((SELECT rowsecurity FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects'), false) as rls_enabled
) as checks;

-- 7️⃣ URLs de teste (se bucket existir)
SELECT 
  '🔗 URLS DE TESTE' as secao,
  'https://' || (SELECT split_part(split_part(auth.jwt() ->> 'iss', '://', 2), '/auth', 1)) || '.supabase.co/storage/v1/object/public/avatars/USER_ID/avatar/avatar.jpg' as url_exemplo,
  'Substitua USER_ID pelo ID real do usuário' as instrucao
WHERE EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars');

-- =====================================================
-- 📋 CHECKLIST DE CONFIGURAÇÃO
-- =====================================================

/*
CHECKLIST - O QUE DEVE APARECER:

✅ Bucket 'avatars' existe
✅ Bucket é público (public = true)  
✅ Limite de tamanho: 50MB (52428800 bytes)
✅ MIME types: image/jpeg,image/jpg,image/png,image/webp,image/gif
✅ 4 políticas RLS ativas:
   - SELECT (visualização pública)
   - INSERT (upload autenticado)
   - UPDATE (atualização do dono)
   - DELETE (exclusão do dono)
✅ RLS habilitado na tabela storage.objects

RESULTADO ESPERADO:
🎉 CONFIGURAÇÃO COMPLETA - Pronto para usar!

SE ALGO ESTIVER FALTANDO:
1. Acesse Supabase Dashboard
2. Storage > Settings (configurar bucket)
3. Storage > Policies (criar políticas)
4. Execute este script novamente
*/