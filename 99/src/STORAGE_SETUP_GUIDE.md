# 🔧 Guia de Configuração do Storage - Solução Definitiva

## ❌ Problema Atual

Erros de RLS (Row Level Security) estão impedindo a criação de buckets e upload de arquivos:

```
❌ Erro ao criar bucket: StorageApiError: new row violates row-level security policy
❌ Erro ao inicializar bucket: Error: Erro ao criar bucket: new row violates row-level security policy
❌ Erro no upload de arquivo: Error: Erro ao criar bucket: new row violates row-level security policy
❌ Erro no upload da capa: Error: Erro ao criar bucket: new row violates row-level security policy
```

## ✅ Solução Completa

### 1. Execute o Script SQL no Supabase

1. **Acesse seu Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute o script:** `/scripts/complete-storage-setup.sql`

Este script irá:
- Configurar RLS corretamente para todos os buckets
- Limpar políticas conflitantes
- Criar políticas que funcionam com Service Role e usuários autenticados
- Verificar a configuração

### 2. Buckets Necessários

O sistema precisa destes buckets (já criados conforme a imagem):

- ✅ `make-e547215c-avatars` - Para avatars de usuários
- ✅ `make-e547215c-trainer-assets` - Para galerias de treinadores  
- ✅ `make-e547215c-documents` - Para documentos/certificados
- ✅ `make-e547215c-program-media` - Para mídia de programas de treinamento
- ✅ `make-e547215c-gallery` - Para galeria geral

### 3. Mudanças Implementadas

#### A. Serviço de Upload Modificado
- Upload agora vai via servidor (bypassa RLS do client)
- Validação de arquivos mantida
- URLs assinadas para segurança

#### B. Endpoint de Upload no Servidor
- Novo endpoint: `/make-server-e547215c/program-media/upload`
- Usa SERVICE_ROLE_KEY (bypassa RLS)
- Autentica usuário via token
- Gera caminhos seguros: `{userId}/{folder}/{timestamp}-{filename}`

#### C. Políticas RLS Corrigidas
- Permite Service Role (`auth.uid() IS NULL`)
- Permite usuários autenticados em suas próprias pastas
- Suporte a todos os buckets necessários

### 4. Como Testar

Após executar o SQL:

1. **Teste básico de upload:**
   - Tente fazer upload de uma imagem de programa
   - Deve funcionar sem erros de RLS

2. **Verificar policies:**
   ```sql
   SELECT policyname, cmd 
   FROM pg_policies 
   WHERE tablename = 'objects' AND schemaname = 'storage'
   AND policyname LIKE 'make_users_%';
   ```

3. **Verificar buckets:**
   ```sql
   SELECT name, public, file_size_limit
   FROM storage.buckets
   WHERE name LIKE 'make-e547215c-%';
   ```

### 5. Estrutura de Arquivos

Os arquivos serão organizados assim:
```
make-e547215c-program-media/
├── {userId}/
│   ├── covers/
│   │   └── {timestamp}-cover.jpg
│   ├── gallery/
│   │   └── {timestamp}-image.jpg
│   └── {timestamp}-media.jpg
```

### 6. URLs de Exemplo

Depois da configuração, as URLs serão:
- Upload: `https://{project}.supabase.co/functions/v1/make-server-e547215c/program-media/upload`
- Signed URL: `https://{project}.supabase.co/storage/v1/object/sign/make-e547215c-program-media/{path}?token={token}`

## 🎯 Resultado Esperado

Após executar o script SQL:
- ✅ Upload de arquivos funcionando
- ✅ RLS policies corretas
- ✅ Buckets privados e seguros
- ✅ URLs assinadas para acesso
- ✅ Sistema de pastas por usuário

## 🔍 Troubleshooting

Se ainda houver problemas:

1. **Verifique se o SERVICE_ROLE_KEY está correto** nas environment variables
2. **Confirme que o script SQL executou sem erros**
3. **Teste com o endpoint direto** antes de usar via frontend
4. **Verifique logs do servidor** para mensagens de debug

## 📝 Notas Importantes

- Service Role bypassa RLS (isso é esperado e necessário)
- Usuários só podem acessar seus próprios arquivos
- URLs são assinadas (expirando em 1 ano)
- Buckets são privados por segurança
- Upload via servidor evita problemas de CORS e RLS