# RLS Policies Setup via Supabase Dashboard

🚨 **IMPORTANTE**: Como o SQL Editor não tem permissões de proprietário sobre `storage.objects`, você deve criar as políticas RLS através do Dashboard do Supabase.

## ⚠️ PROBLEMA ATUAL DETECTADO:
- Buckets estão públicos (deveriam ser privados)
- Políticas RLS ausentes ou mal configuradas
- Uploads bloqueados por row-level security

## 🔧 CORREÇÃO AUTOMÁTICA DISPONÍVEL:
**Antes de configurar RLS manualmente, use a correção automática:**
1. Vá para `/dev/storage-fix`
2. Clique em "CORREÇÃO AUTOMÁTICA"
3. Aguarde os buckets serem tornados privados
4. Depois siga as instruções abaixo para RLS

## Passo a passo para RLS:

1. **Acesse o Supabase Dashboard** → Storage → Policies
2. **Clique em "New Policy"** para cada uma das políticas abaixo:

### Política 1: Upload (INSERT)
- **Name**: `make_users_upload`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents') 
AND auth.uid()::text = split_part(name, '/', 1)
```

### Política 2: View (SELECT)
- **Name**: `make_users_view`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents')
AND auth.uid()::text = split_part(name, '/', 1)
```

### Política 3: Update (UPDATE)
- **Name**: `make_users_update`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents')
AND auth.uid()::text = split_part(name, '/', 1)
```

### Política 4: Delete (DELETE)
- **Name**: `make_users_delete`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents')
AND auth.uid()::text = split_part(name, '/', 1)
```

## Alternativa: Usar o SQL Editor com permissões Admin

Se você tem acesso admin, tente executar este comando primeiro:

```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Se não estiver habilitado, habilitar (requer permissões de admin)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

Depois execute as políticas uma por uma:

```sql
CREATE POLICY "make_users_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents') 
    AND auth.uid()::text = split_part(name, '/', 1)
  );
```

```sql
CREATE POLICY "make_users_view" ON storage.objects
  FOR SELECT USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents')
    AND auth.uid()::text = split_part(name, '/', 1)
  );
```

```sql
CREATE POLICY "make_users_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents')
    AND auth.uid()::text = split_part(name, '/', 1)
  );
```

```sql
CREATE POLICY "make_users_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('make-e547215c-avatars', 'make-e547215c-trainer-assets', 'make-e547215c-documents')
    AND auth.uid()::text = split_part(name, '/', 1)
  );
```

## Verificação

Para verificar se as políticas foram criadas corretamente:

```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE 'make_users_%';
```

## Teste de Funcionamento

Após criar as políticas, teste o sistema de upload em `/dev/storage-fix` para confirmar que tudo está funcionando.