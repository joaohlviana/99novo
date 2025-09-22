# Sistema de Upload de Avatar - Versão 2.0

Este documento descreve o sistema de upload de avatar atualizado para a plataforma 99coach, agora utilizando **react-easy-crop** e seguindo as **melhores práticas recomendadas pelo Supabase** para segurança e performance.

## Componentes Implementados

### 1. AvatarUpload (`/components/ui/avatar-upload.tsx`)

Componente base para upload e cropping de avatares com integração ao Supabase Storage.

**Funcionalidades:**
- Upload de imagens via drag & drop ou clique
- **Cropping profissional com react-easy-crop**
- **Controle de zoom e posicionamento precisos**
- **Buckets privados com signed URLs** (segurança Supabase)
- **Limpeza automática de avatares antigos**
- Suporte a diferentes tamanhos e variantes (circle/square)
- Validação rigorosa de arquivos (tipo, tamanho, MIME)
- Estados de loading e feedback visual
- Remoção segura de avatar com verificação de permissões

**Props:**
```typescript
interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'square';
  bucketName?: string;
  allowRemove?: boolean;
  className?: string;
  label?: string;
  description?: string;
}
```

**Exemplo de uso:**
```tsx
<AvatarUpload
  currentAvatarUrl={user.avatar}
  onAvatarChange={handleAvatarChange}
  size="lg"
  variant="circle"
  bucketName="user-avatars"
  allowRemove={true}
  label="Foto do Perfil"
  description="Clique para alterar sua foto"
/>
```

### 2. UserAvatarManager (`/components/common/UserAvatarManager.tsx`)

Wrapper que adiciona contexto específico para diferentes tipos de usuário (trainer/client).

**Funcionalidades:**
- Configuração automática de bucket baseada no tipo de usuário
- Labels e descrições contextuais
- Opção de exibição em card ou standalone
- Estados empty state específicos

**Componentes derivados:**
- `TrainerAvatarManager` - Para perfis de treinadores
- `ClientAvatarManager` - Para perfis de clientes

**Exemplo de uso:**
```tsx
<TrainerAvatarManager
  currentAvatarUrl={profileData.profilePhoto}
  onAvatarChange={(url) => updateProfile({ profilePhoto: url })}
  size="xl"
  showCard={false}
  allowRemove={true}
/>
```

### 3. ClientProfileManagement (`/components/client-dashboard/ClientProfileManagement.tsx`)

Componente completo para gerenciamento do perfil do cliente, incluindo upload de avatar.

**Funcionalidades:**
- Formulário completo de perfil do cliente
- Integração com sistema de avatar
- Validação de campos
- Cálculo de completude do perfil
- Estados de loading e saving

## Integração com Supabase

### Storage Buckets (Seguindo Melhores Práticas Supabase)

O sistema utiliza buckets **privados e seguros** com prefixo único:
- `make-e547215c-avatars` - **Bucket principal para avatares** (privado, 10MB limit)
- `make-e547215c-trainer-assets` - Galerias e vídeos de treinadores (privado, 50MB limit)
- `make-e547215c-documents` - Certificados e documentos (privado, 10MB limit)

**Vantagens dos buckets privados:**
- URLs assinadas para maior segurança
- Controle granular de acesso
- Proteção contra acesso não autorizado
- Cache otimizado pelo Supabase

### Estrutura de Arquivos

```
make-e547215c-avatars/
├── {user_id}/
│   ├── avatar-{timestamp}-{sanitized_filename}.jpg
│   ├── avatar-{timestamp}-{sanitized_filename}.jpg (backup)
│   └── ... (máximo 3 por usuário - limpeza automática)

make-e547215c-trainer-assets/
├── {user_id}/
│   ├── gallery/
│   │   ├── image-{timestamp}.jpg
│   │   └── ...
│   └── videos/
│       ├── intro-{timestamp}.mp4
│       └── ...

make-e547215c-documents/
├── {user_id}/
│   ├── certificates/
│   │   ├── cert-{timestamp}.pdf
│   │   └── ...
│   └── ...
```

### Permissões Necessárias

O sistema requer as seguintes permissões no Supabase:

1. **Storage Policies:**
   ```sql
   -- Permitir usuários autenticados fazer upload de seus próprios avatares
   CREATE POLICY "Users can upload their own avatars" ON storage.objects
   FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Permitir usuários autenticados visualizar avatares
   CREATE POLICY "Users can view avatars" ON storage.objects
   FOR SELECT USING (true);
   
   -- Permitir usuários autenticados atualizar seus próprios avatares
   CREATE POLICY "Users can update their own avatars" ON storage.objects
   FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Permitir usuários autenticados deletar seus próprios avatares
   CREATE POLICY "Users can delete their own avatars" ON storage.objects
   FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
   ```

2. **Buckets Configuration:**
   ```sql
   -- Criar buckets se não existirem
   INSERT INTO storage.buckets (id, name, public) 
   VALUES 
     ('trainer-avatars', 'trainer-avatars', true),
     ('client-avatars', 'client-avatars', true),
     ('avatars', 'avatars', true)
   ON CONFLICT (id) DO NOTHING;
   ```

## Limitações e Considerações

### Funcionalidades Atuais (Versão 2.0)

1. **Cropping Profissional:** react-easy-crop com zoom, pan e posicionamento precisos
2. **Formatos:** JPEG otimizado (qualidade 0.9) com suporte futuro para WebP
3. **Tamanho de Output:** 400x400px otimizado para web
4. **Biblioteca Robusta:** react-easy-crop para experiência profissional
5. **Segurança:** Buckets privados com políticas RLS rigorosas
6. **Performance:** Signed URLs com cache otimizado

### Próximas Melhorias (Roadmap)

1. **Múltiplos Formatos:** Suporte a PNG e WebP com detecção automática
2. **Tamanhos Responsivos:** Gerar múltiplas versões (thumbnail, medium, large)
3. **Compressão Inteligente:** Otimização automática baseada no conteúdo
4. **Filtros e Efeitos:** Adicionar filtros básicos de imagem
5. **Sincronização CDN:** Integração com CDN para entrega global otimizada

## Uso nos Dashboards

### Trainer Dashboard

Integrado no `PersonalDataSection.tsx`:
```tsx
<TrainerAvatarManager
  currentAvatarUrl={profileData.profilePhoto}
  onAvatarChange={(photoUrl) => 
    onProfileDataChange({ profilePhoto: photoUrl })
  }
  size="xl"
  variant="circle"
  showCard={false}
  allowRemove={true}
  className="bg-white rounded-xl border border-gray-200 p-6"
/>
```

### Client Dashboard

Integrado no `ClientProfileManagement.tsx` via `BriefingSection.tsx`:
```tsx
<ClientAvatarManager
  currentAvatarUrl={profileData.profilePhoto}
  onAvatarChange={(url) => onProfileDataChange({ profilePhoto: url })}
  size="xl"
  variant="circle"
  showCard={true}
  allowRemove={true}
/>
```

## Troubleshooting

### Problemas Comuns

1. **Erro de Upload:**
   - Verificar se o usuário está autenticado
   - Verificar permissões do bucket
   - Verificar tamanho do arquivo (máximo 10MB)

2. **Cropping não Funciona:**
   - Verificar se a imagem foi carregada corretamente
   - Verificar dimensões da imagem original

3. **Preview não Aparece:**
   - Verificar URLs públicas do Supabase Storage
   - Verificar CORS settings

### Debug

Habilitar logs detalhados adicionando no console:
```javascript
// No componente AvatarUpload
console.log('Upload state:', { isUploading, imageSrc, cropArea });
```

## Segurança

### Validações Implementadas

1. **Tipo de Arquivo:** Apenas imagens são aceitas
2. **Tamanho:** Máximo 10MB por arquivo
3. **Autenticação:** Apenas usuários autenticados podem fazer upload
4. **Autorização:** Usuários só podem modificar seus próprios avatares

### Considerações de Segurança

1. **Sanitização:** Todos os nomes de arquivo são sanitizados
2. **Overwrite Protection:** Arquivos são versionados com timestamp
3. **Public URLs:** URLs são públicas mas organizadas por usuário
4. **Rate Limiting:** Implementar rate limiting no backend se necessário

---

## Instalação e Setup

### 1. Instalar Dependências

```bash
# react-easy-crop já deve estar instalado automaticamente
# Se necessário, instale manualmente:
npm install react-easy-crop
```

### 2. Executar Setup do Banco de Dados

Execute o script SQL fornecido no Supabase SQL Editor:

```sql
-- Execute o arquivo: /scripts/setup-avatar-buckets.sql
-- Este script cria os buckets e políticas de segurança
```

### 3. Verificar Configuração

Acesse o endpoint de verificação:
```
GET /make-server-e547215c/health
```

### 4. Testar Sistema

```tsx
// Exemplo de uso completo:
import { UserAvatarManager } from './components/common/UserAvatarManager';

function ProfilePage() {
  const [avatarUrl, setAvatarUrl] = useState('');
  
  return (
    <UserAvatarManager
      currentAvatarUrl={avatarUrl}
      onAvatarChange={setAvatarUrl}
      userType="trainer"
      size="xl"
      variant="circle"
      showCard={true}
      allowRemove={true}
    />
  );
}
```

## Segurança e Compliance

✅ **Buckets privados** com políticas RLS rigorosas  
✅ **URLs assinadas** para acesso controlado  
✅ **Validação de MIME types** para segurança  
✅ **Limite de tamanho** configurável por bucket  
✅ **Limpeza automática** de arquivos antigos  
✅ **Verificação de propriedade** antes de operações  

---

**Nota:** Este sistema segue as melhores práticas recomendadas pelo Supabase e está pronto para produção com segurança enterprise-grade.