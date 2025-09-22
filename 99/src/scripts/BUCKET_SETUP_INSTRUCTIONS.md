# Configuração de Buckets - Guia de Resolução

## Problema Encontrado
```
ERROR: 42501: must be owner of table objects
```

Este erro ocorre quando você não tem permissões de proprietário (owner) para modificar políticas RLS na tabela `storage.objects`.

## Soluções Disponíveis

### Opção 1: Usar Script Simplificado (RECOMENDADO)

Execute apenas a criação dos buckets:

```sql
-- Execute: /scripts/setup-avatar-buckets-simplified.sql
```

Este script cria apenas os buckets sem as políticas de segurança.

### Opção 2: Configurar Manualmente no Dashboard

1. **Execute o script simplificado** primeiro
2. **Vá para o Supabase Dashboard** → Storage → Policies
3. **Adicione as políticas manualmente** usando a interface:

#### Para bucket `make-e547215c-avatars`:

**Policy 1: Upload próprios avatares**
- Target: `objects` 
- Policy name: `Users can upload own avatars`
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'make-e547215c-avatars' 
AND auth.uid()::text = (storage.foldername(name))[1]
```

**Policy 2: Visualizar avatares**
- Target: `objects`
- Policy name: `Users can view avatars` 
- Allowed operation: `SELECT`
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'make-e547215c-avatars'
```

**Policy 3: Atualizar próprios avatares**
- Target: `objects`
- Policy name: `Users can update own avatars`
- Allowed operation: `UPDATE` 
- Target roles: `authenticated`
- Policy definition:
```sql
bucket_id = 'make-e547215c-avatars' 
AND auth.uid()::text = (storage.foldername(name))[1]
```

**Policy 4: Deletar próprios avatares**
- Target: `objects`
- Policy name: `Users can delete own avatars`
- Allowed operation: `DELETE`
- Target roles: `authenticated` 
- Policy definition:
```sql
bucket_id = 'make-e547215c-avatars' 
AND auth.uid()::text = (storage.foldername(name))[1]
```

### Opção 3: Usar Service Role

Se você tem acesso ao Service Role Key:

1. **Conecte com Service Role** no SQL Editor
2. **Execute o script completo** original
3. As políticas serão criadas automaticamente

### Opção 4: Configuração via Código (Backend)

Use nosso endpoint para configurar programaticamente:

```typescript
// No seu frontend, chame:
const response = await fetch('/make-server-e547215c/setup-storage', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  }
});
```

## Status de Verificação

Execute para verificar se os buckets foram criados:

```sql
SELECT 
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name LIKE 'make-e547215c-%'
ORDER BY name;
```

Resultado esperado:
```
make-e547215c-avatars       | false | 10485760  | {image/jpeg, image/png, image/webp}
make-e547215c-trainer-assets| false | 52428800  | {image/jpeg, image/png, image/webp, video/mp4}
make-e547215c-documents     | false | 10485760  | {application/pdf, image/jpeg, image/png}
```

## Teste do Sistema

Após configuração, teste com:

```tsx
import { UserAvatarManager } from './components/common/UserAvatarManager';

<UserAvatarManager
  currentAvatarUrl=""
  onAvatarChange={(url) => console.log('New avatar:', url)}
  size="lg"
  variant="circle"
  userType="trainer"
/>
```

## Debugging

Se ainda houver problemas:

1. **Verifique permissões**: Você é owner/admin do projeto Supabase?
2. **Teste conectividade**: Os buckets aparecem no Dashboard?
3. **Teste upload**: O componente consegue fazer upload?
4. **Verifique logs**: Console do navegador e logs do Supabase

## Próximos Passos

1. ✅ Execute o script simplificado
2. ✅ Configure políticas no Dashboard (se necessário)
3. ✅ Teste o componente de avatar
4. ✅ Verifique URLs assinadas funcionando

---

**Nota**: O sistema funcionará mesmo sem as políticas RLS se os buckets forem criados como públicos temporariamente, mas é recomendado configurar as políticas para segurança em produção.