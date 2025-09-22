# 🏋️ Guia da Estrutura Híbrida - Trainer Profile

## 📋 Visão Geral

A estrutura híbrida do **Trainer Profile** combina o melhor dos dois mundos: campos estruturados do PostgreSQL para queries eficientes e dados JSON para máxima flexibilidade. Esta abordagem elimina a necessidade de relacionamentos complexos e permite evolução rápida sem migrations.

## 🏗️ Arquitetura

### Tabela Principal: `99_trainer_profile`

```sql
CREATE TABLE public."99_trainer_profile" (
    -- Campos estruturados (PostgreSQL tradicional)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'draft',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    
    -- Campo híbrido (JSON flexível)
    profile_data JSONB NOT NULL DEFAULT '{}',
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);
```

### Estrutura JSON Flexível

```json
{
  "bio": "Personal trainer especializado em...",
  "phone": "(11) 99999-9999",
  "instagram": "https://instagram.com/trainer",
  "experienceYears": "3-5",
  "responseTime": "3-horas",
  "studentsCount": "moderado",
  "credential": "CREF 123456-G/SP",
  "specialties": ["musculacao", "fitness", "funcional"],
  "modalities": ["presencial", "online"],
  "cities": ["São Paulo - SP", "Santos - SP"],
  "address": "Rua Example, 123",
  "cep": "01234-567",
  "universities": [...],
  "courses": [...],
  "galleryImages": [...],
  "stories": [...],
  "completionPercentage": 85
}
```

## 🚀 Como Usar

### 1. Executar Migration

```bash
# Execute o script SQL no seu banco Supabase
psql -d your_database -f scripts/migration-sql/04-create-trainer-profile-hybrid-corrected.sql
```

### 2. Usar o Serviço

```typescript
import { trainerProfileService } from './services/trainer-profile.service';

// Buscar perfil por user_id
const profile = await trainerProfileService.getByUserId(userId);

// Criar novo perfil
const newProfile = await trainerProfileService.create({
  user_id: userId,
  name: 'Nome do Trainer',
  email: 'email@example.com',
  profile_data: {
    bio: 'Biografia...',
    modalities: ['online', 'presencial']
  }
});

// Atualizar dados
await trainerProfileService.update(userId, {
  profile_data: {
    bio: 'Nova biografia',
    specialties: ['musculacao', 'crossfit']
  }
});
```

### 3. Usar o Hook React

```typescript
import { useTrainerProfileHybrid } from './hooks/useTrainerProfileHybrid';

function ProfileComponent() {
  const {
    profileData,
    loading,
    saving,
    saveProfile,
    updateProfileData,
    completionPercentage
  } = useTrainerProfileHybrid();

  const handleUpdateBio = () => {
    updateProfileData({
      bio: 'Nova biografia',
      specialties: ['musculacao', 'yoga']
    });
  };

  return (
    <div>
      <p>Completude: {completionPercentage}%</p>
      <button onClick={handleUpdateBio}>Atualizar Bio</button>
      <button onClick={() => saveProfile()}>Salvar</button>
    </div>
  );
}
```

## 🔍 Queries Úteis

### Buscar por Especialidade
```sql
SELECT * FROM get_trainers_by_specialty('musculacao');
```

### Buscar por Cidade
```sql
SELECT * FROM get_trainers_by_city('São Paulo - SP');
```

### Buscar por Modalidade
```sql
SELECT * FROM get_trainers_by_modality('online');
```

### Atualizar JSON específico
```sql
UPDATE "99_trainer_profile" 
SET profile_data = profile_data || '{"bio": "nova bio"}'
WHERE user_id = 'uuid';
```

### Buscar campo dentro do JSON
```sql
SELECT name, profile_data->>'bio' as bio
FROM "99_trainer_profile"
WHERE profile_data ? 'bio';
```

## ⚡ Vantagens

### ✅ **Simplicidade**
- Uma única tabela para todos os dados
- Sem JOINs complexos
- Relacionamento simples com `auth.users`

### ✅ **Flexibilidade**
- Adicionar novos campos sem migrations
- Estrutura de dados dinâmica
- Suporte a arrays e objetos aninhados

### ✅ **Performance**
- Índices GIN para queries JSON rápidas
- Campos estruturados para queries frequentes
- Triggers automáticos para timestamps

### ✅ **Escalabilidade**
- Evolução sem downtime
- Compatível com versioning
- Suporte a dados históricos

## 🧪 Como Testar

1. **Acesse a página de teste simples (recomendado):**
   ```
   http://localhost:3000/dev/trainer-profile-hybrid-test-simple
   ```

2. **Ou acesse a página de teste completa (com autenticação):**
   ```
   http://localhost:3000/dev/trainer-profile-hybrid-test
   ```

2. **Execute os testes:**
   - Clique em "Atualizar Dados de Teste"
   - Clique em "Salvar"
   - Observe os dados JSON sendo atualizados
   - Verifique o percentual de completude

3. **Monitore no banco:**
   ```sql
   SELECT * FROM "99_trainer_profile" ORDER BY updated_at DESC LIMIT 1;
   ```

## 📁 Arquivos Importantes

```
/scripts/migration-sql/04-create-trainer-profile-hybrid-corrected.sql  # Migration
/services/trainer-profile.service.ts                                    # Serviço
/hooks/useTrainerProfileHybrid.ts                                      # Hook React
/components/TrainerProfileHybridTest.tsx                               # Teste
/pages/TrainerProfileHybridTestPage.tsx                               # Página teste
```

## 🛠️ Estrutura dos Arquivos

### Serviço (`trainer-profile.service.ts`)
- ✅ Operações CRUD completas
- ✅ Validação de dados
- ✅ Cálculo de completude
- ✅ Funções de busca

### Hook (`useTrainerProfileHybrid.ts`)
- ✅ Integração com auth
- ✅ Estados de loading/saving
- ✅ Gerenciamento de dirty state
- ✅ Funções de update locais

### Componente de Teste
- ✅ Interface visual
- ✅ Testes interativos
- ✅ Debug de dados
- ✅ Monitoramento de estados

## 🚦 Status

- ✅ **Migração**: Criada e testada
- ✅ **Serviço**: Implementado e funcional
- ✅ **Hook**: Integrado com auth
- ✅ **Componente**: Interface de teste
- ✅ **Rotas**: Configuradas
- ✅ **Documentação**: Completa

## 🎯 Próximos Passos

1. **Teste em produção** com dados reais
2. **Migrar componentes existentes** para usar a nova estrutura
3. **Implementar busca avançada** usando funções JSON
4. **Adicionar validações** de schema JSON
5. **Criar dashboards** com métricas de uso

---

**🎉 A estrutura híbrida está pronta para uso!** 

Use `/dev/trainer-profile-hybrid-test` para testar todas as funcionalidades.