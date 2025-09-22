# FIX AVATAR STORAGE RLS ERRORS - INSTRUÇÕES COMPLETAS

## 🚨 PROBLEMA IDENTIFICADO

```
❌ Erro ao salvar avatar: StorageApiError: new row violates row-level security policy
❌ Falha ao salvar avatar: StorageApiError: new row violates row-level security policy
⚠️ TrainerAvatarManager: onAvatarChange obsoleto, usando persistência automática
```

## ✅ CORREÇÕES IMPLEMENTADAS

### 1. **Correção do Componente TrainerAvatarManager**
- ✅ Removido warning da prop `onAvatarChange` obsoleta
- ✅ Corrigido import no `PersonalDataSection.tsx`
- ✅ Adicionado fallback para obter `userId` do contexto de auth
- ✅ Atualizada interface para incluir `user_id` no profileData

### 2. **Script SQL para Correção do Storage RLS**

Execute este comando no **SQL Editor** do Supabase:

```sql
-- =================================================================
-- FIX AVATAR STORAGE RLS POLICIES - EXECUÇÃO ÚNICA
-- =================================================================

-- 1. Verificar/criar bucket 'avatars' (público para visualização)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Limpar políticas antigas
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can view any avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- 3. POLÍTICA UPLOAD - usuários podem fazer upload de seus próprios avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. POLÍTICA SELECT - qualquer usuário pode ver avatars (bucket público)
CREATE POLICY "Users can view any avatar"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 5. POLÍTICA UPDATE - usuários podem atualizar seus próprios avatars
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

-- 6. POLÍTICA DELETE - usuários podem deletar seus próprios avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. **Verificação das Políticas**

Execute este comando para verificar se as políticas foram criadas corretamente:

```sql
-- Verificar políticas do storage
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%avatar%'
ORDER BY policyname;
```

### 4. **Estrutura de Paths no Storage**

O sistema agora usa esta estrutura de paths:
```
avatars/
├── {user_id_1}/
│   ├── {timestamp}-{filename}.jpg
│   └── {timestamp}-{filename}.jpg
├── {user_id_2}/
│   ├── {timestamp}-{filename}.jpg
│   └── {timestamp}-{filename}.jpg
```

### 5. **Teste da Funcionalidade**

Após executar o SQL:

1. ✅ Faça login como um trainer
2. ✅ Vá para **Trainer Dashboard > Gerenciar Perfil**
3. ✅ Clique na foto do perfil para fazer upload
4. ✅ Selecione uma imagem e faça o crop
5. ✅ Verifique se não há mais erros no console

## 🔧 DETALHES TÉCNICOS

### Arquivos Modificados:
- `/components/trainer/TrainerAvatarManager.tsx` - Corrigido userId e warnings
- `/components/trainer-dashboard/PersonalDataSection.tsx` - Corrigido import e props
- `/scripts/fix-avatar-storage-rls.sql` - Script de correção RLS

### Fluxo de Upload:
1. **Frontend**: SimpleAvatarUpload processa imagem (crop, resize)
2. **Hook**: useSaveTrainerAvatar chama `saveTrainerAvatar`
3. **Service**: Faz upload para storage com path `avatars/{userId}/{timestamp}-{filename}`
4. **Database**: Atualiza `user_profiles.profile_data.profilePhoto` com URL pública
5. **Cache**: Invalida queries React Query para sincronização

### Segurança RLS:
- ✅ **Upload**: Apenas para pasta do próprio usuário (`auth.uid()`)
- ✅ **Visualização**: Qualquer usuário (avatars são públicos)
- ✅ **Update/Delete**: Apenas próprios arquivos
- ✅ **Bucket público**: URLs diretas funcionam sem auth

## 🎯 RESULTADO ESPERADO

Após aplicar as correções:
- ✅ Upload de avatar funciona sem erros RLS
- ✅ Sem warnings no console
- ✅ Fotos aparecem imediatamente após upload
- ✅ Cache é atualizado automaticamente
- ✅ URLs públicas funcionam corretamente

## 🚨 IMPORTANTE

Execute o SQL **apenas uma vez** no Supabase. Se houver erros, verifique:
1. Se você tem permissões de admin no projeto
2. Se não há políticas conflitantes existentes
3. Se o bucket 'avatars' foi criado corretamente