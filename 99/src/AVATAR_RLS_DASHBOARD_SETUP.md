# 🔧 AVATAR RLS - CONFIGURAÇÃO VIA DASHBOARD

## ❌ **PROBLEMA IDENTIFICADO**

```
ERROR: 42501: must be owner of table objects
```

**Causa:** A tabela `storage.objects` só pode ser modificada via **Supabase Dashboard**, não via SQL direto.

## ✅ **SOLUÇÃO: CONFIGURAR VIA DASHBOARD**

### **1. Configurar Bucket (Storage > Settings)**

1. Acesse **Storage** no Dashboard
2. Clique em **Settings** 
3. Encontre o bucket `avatars` (ou crie)
4. Configure:
   ```
   ✅ Public bucket: ON
   ✅ File size limit: 50MB (52428800 bytes)
   ✅ Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp,image/gif
   ```

### **2. Configurar RLS Policies (Storage > Policies)**

1. Acesse **Storage > Policies**
2. Clique em **New Policy**
3. Selecione **For objects in bucket "avatars"**

#### **Policy 1: Public Read** ✅
```
Operation: SELECT
Policy name: Public avatars read access
SQL: bucket_id = 'avatars'
```

#### **Policy 2: Authenticated Upload** ✅
```
Operation: INSERT  
Policy name: Authenticated users can upload avatars
SQL: bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### **Policy 3: Owner Update** ✅
```
Operation: UPDATE
Policy name: Users can update their own avatars  
SQL: bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

#### **Policy 4: Owner Delete** ✅
```
Operation: DELETE
Policy name: Users can delete their own avatars
SQL: bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```

### **3. Testar Configuração**

Execute este teste no **SQL Editor**:

```sql
-- Verificar bucket configuração
SELECT 
  id,
  name,
  public as "é_público",
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'avatars';

-- Verificar policies ativas  
SELECT 
  policyname,
  cmd as "operação",
  qual as "condição"
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%avatar%'
ORDER BY policyname;
```

**Resultado esperado:**
```
✅ Bucket público: true
✅ 4 políticas ativas (SELECT, INSERT, UPDATE, DELETE)
```

## 🚀 **CÓDIGO ATUALIZADO**

O código já está preparado para funcionar com essas configurações! Não precisa de alterações.

### **Teste de Upload:**
```javascript
// Vai funcionar automaticamente
const result = await saveTrainerAvatar(userId, file);
console.log('✅ Avatar salvo:', result.avatar_url);
```

### **Teste de URL Pública:**
```javascript
// URL direta (sem auth)
const url = getPublicAvatarUrl(userId);
// https://[projeto].supabase.co/storage/v1/object/public/avatars/[userId]/avatar/avatar.jpg
```

## ⚡ **CONFIGURAÇÃO EXPRESSA (5 MINUTOS)**

Se preferir, posso te guiar passo-a-passo via chat:

1. **Bucket Setup:** `"avatars"` público com 50MB limit
2. **4 Policies:** SELECT (public), INSERT/UPDATE/DELETE (auth + ownership)
3. **Teste:** Upload via app

## 🎯 **RESULTADO FINAL**

- ✅ **Avatars públicos** para visualização
- ✅ **Upload seguro** apenas para usuários autenticados  
- ✅ **Modificação restrita** apenas para donos
- ✅ **Performance otimizada** (sem auth check no read)

**Status:** Pronto para produção! 🚀