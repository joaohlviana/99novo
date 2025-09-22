# 🎯 GUIA PASSO-A-PASSO: CONFIGURAR AVATARS VIA DASHBOARD

## 🚨 **PROBLEMA RESOLVIDO**

O erro `must be owner of table objects` foi contornado! Agora você vai configurar via **Supabase Dashboard** (interface visual) em vez de SQL.

## ⏱️ **TEMPO TOTAL: 5 MINUTOS**

### **PASSO 1: CONFIGURAR BUCKET** (2 min)

1. **Acesse:** [Supabase Dashboard](https://supabase.com/dashboard) > Seu Projeto
2. **Navegue:** Menu lateral > **Storage**
3. **Encontre o bucket `avatars`** ou **crie novo**:
   - Se não existir: clique **"New bucket"**
   - Nome: `avatars`
   - ✅ **Public bucket:** LIGADO
   - Clique **"Save"**

4. **Configure o bucket** (clique no ⚙️ ao lado de `avatars`):
   ```
   ✅ Public bucket: ON
   ✅ File size limit: 50 MB
   ✅ Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp,image/gif
   ```

### **PASSO 2: CONFIGURAR POLÍTICAS RLS** (3 min)

1. **Navegue:** Menu lateral > **Storage** > **Policies**
2. **Clique:** "New Policy"
3. **Selecione:** "For objects in bucket **avatars**"

#### **Política 1: Visualização Pública** 👁️
```
Operation: SELECT ✅
Policy name: Public avatars read access
SQL condition: bucket_id = 'avatars'
```
**Clique "Review" > "Save policy"**

#### **Política 2: Upload Autenticado** 📤
```
Operation: INSERT ✅
Policy name: Authenticated users can upload avatars
SQL condition: bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```
**Clique "Review" > "Save policy"**

#### **Política 3: Atualização do Dono** ✏️
```
Operation: UPDATE ✅
Policy name: Users can update their own avatars
SQL condition: bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```
**Clique "Review" > "Save policy"**

#### **Política 4: Exclusão do Dono** 🗑️
```
Operation: DELETE ✅
Policy name: Users can delete their own avatars
SQL condition: bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text
```
**Clique "Review" > "Save policy"**

### **PASSO 3: VERIFICAR CONFIGURAÇÃO** (1 min)

1. **Navegue:** Menu lateral > **SQL Editor**
2. **Cole e execute** o script: `/scripts/verify-avatar-setup.sql`
3. **Resultado esperado:**
   ```
   🎉 CONFIGURAÇÃO COMPLETA - Pronto para usar!
   ```

### **PASSO 4: TESTAR NO APP** (1 min)

1. **Faça login** na aplicação
2. **Acesse:** Dashboard > Gerenciar Perfil
3. **Clique na foto** para fazer upload
4. **Resultado esperado:**
   - ✅ Upload sem erros
   - ✅ Foto aparece imediatamente
   - ✅ Console sem erros RLS

## 🎯 **CHECKLIST FINAL**

### **No Supabase Dashboard:**
- ✅ Bucket `avatars` existe
- ✅ Bucket `avatars` é público
- ✅ 4 políticas RLS configuradas (SELECT, INSERT, UPDATE, DELETE)
- ✅ Script de verificação retorna "CONFIGURAÇÃO COMPLETA"

### **Na Aplicação:**
- ✅ Upload de avatar funciona
- ✅ Foto exibida imediatamente
- ✅ URL pública acessível sem login
- ✅ Console sem erros RLS

## 🚀 **URLs DE TESTE**

Após configurar, teste estas URLs direto no navegador:

```
# Estrutura da URL pública:
https://[SEU-PROJETO].supabase.co/storage/v1/object/public/avatars/[USER-ID]/avatar/avatar.jpg

# Exemplo:
https://abcdefgh.supabase.co/storage/v1/object/public/avatars/123e4567-e89b-12d3-a456-426614174000/avatar/avatar.jpg
```

## ❓ **TROUBLESHOOTING**

### **"Bucket não é público"**
- Volte em Storage > Settings
- Clique no ⚙️ do bucket `avatars`
- Marque "Public bucket: ON"

### **"Upload falha com RLS error"**
- Verifique se as 4 políticas foram criadas
- Teste o script de verificação
- Confirme se está logado na aplicação

### **"URL não funciona"**
- Confirme se bucket é público
- Verifique se o arquivo foi realmente enviado
- Teste URL com user ID válido

## 🎉 **PRONTO!**

Sistema de avatars **100% configurado** e **pronto para produção**! 

As configurações via Dashboard são **permanentes** e não precisam de SQL manual.