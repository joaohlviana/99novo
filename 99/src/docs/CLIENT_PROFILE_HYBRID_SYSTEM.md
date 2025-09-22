# SISTEMA DE PERFIL DO CLIENTE - ARQUITETURA HÍBRIDA

## 📋 Visão Geral

Sistema completo para gerenciamento de perfis de clientes baseado na arquitetura híbrida (campos estruturados + JSONB), seguindo o padrão estabelecido pelo sistema de perfil de treinadores. O sistema permite que usuários preencham informações detalhadas sobre interesses esportivos, objetivos e preferências para facilitar o matchmaking com treinadores.

## 🎯 Objetivos do Sistema

- **Matchmaking Eficiente**: Dados estruturados para facilitar busca e compatibilidade entre clientes e treinadores
- **Flexibilidade**: Campos JSONB permitem adicionar novas informações sem migração de schema
- **Experiência do Usuário**: Interface intuitiva para seleção de esportes, objetivos e preferências
- **Integração**: Sistema totalmente integrado com a tabela de esportes existente

## 🏗️ Arquitetura

### 1. **Tabela Híbrida** - `client_profile`

```sql
-- Campos estruturados (PostgreSQL tradicional)
id UUID PRIMARY KEY
user_id UUID (FK para auth.users)
name VARCHAR(255)
email VARCHAR(255)
phone VARCHAR(20)
status VARCHAR(20) -- 'draft', 'active', 'inactive', 'suspended'
is_active BOOLEAN
is_verified BOOLEAN

-- Dados flexíveis (JSONB)
profile_data JSONB -- Estrutura detalhada abaixo
```

### 2. **Estrutura do JSONB** - `profile_data`

```typescript
interface ClientProfileData {
  // === ESPORTES ===
  sportsInterest: string[];     // Esportes que gostaria de praticar
  sportsTrained: string[];      // Esportes já praticados
  sportsCurious: string[];      // Esportes de curiosidade
  
  // === OBJETIVOS ===
  primaryGoals: string[];       // Objetivos principais (max 3)
  secondaryGoals: string[];     // Objetivos secundários
  searchTags: string[];         // Tags para matchmaking
  
  // === FITNESS ===
  fitnessLevel: string;         // iniciante, intermediario, avancado
  experience: string;           // Tempo de experiência
  frequency: string;            // Frequência de treino
  budget: string;               // Faixa de orçamento
  
  // === LOCALIZAÇÃO ===
  city: string;
  state: string;
  region: string;
  willingToTravel: boolean;
  maxDistanceKm: number;
  
  // === PREFERÊNCIAS ===
  trainingTime: string[];       // Horários preferidos
  trainingDuration: string;     // Duração das sessões
  modality: string[];           // Presencial, Online, Híbrido
  trainerGender: string;        // Preferência de gênero do trainer
  groupOrIndividual: string;    // Tipo de treino
  
  // === SAÚDE ===
  medicalConditions: string;
  injuries: string[];
  limitations: string[];
  doctorClearance: boolean;
  
  // === DISPONIBILIDADE ===
  daysOfWeek: string[];
  timePeriods: string[];
  flexibleSchedule: boolean;
  
  // === METAS ESPECÍFICAS ===
  weightGoal: string;
  timeline: string;
  priorityAreas: string[];
  specificTargets: string[];
}
```

## 🛠️ Componentes Implementados

### 1. **ClientProfileManagement.tsx**
- Formulário principal de perfil do cliente
- Integração com sistema de esportes
- Seções para objetivos e tags
- Baseado no padrão do TrainerProfileManagement

### 2. **ClientSportsSelector.tsx**
- Seletor de esportes integrado com tabela `sports`
- Três tipos: interesse, já praticado, curiosidade
- Interface visual com ícones e busca
- Limites configuráveis por tipo

### 3. **ClientGoalsSelector.tsx**
- Seletor de objetivos categorizados
- 6 categorias: Composição Corporal, Performance, Saúde, Funcional, Estético, Esporte Específico
- Interface com filtros por categoria
- Suporte a objetivos primários e secundários

### 4. **ClientTagsSelector.tsx**
- Seletor de tags para matchmaking
- 8 categorias de tags predefinidas
- Criação de tags customizadas
- Sistema de busca e filtros

## 🔧 Serviços e Hooks

### 1. **client-profile.service.ts**
```typescript
class ClientProfileService {
  getByUserId(userId: string): Promise<ClientProfile>
  create(input: CreateClientProfileInput): Promise<ClientProfile>
  update(userId: string, input: UpdateClientProfileInput): Promise<ClientProfile>
  findCompatibleClients(specialties: string[]): Promise<CompatibilityResult[]>
  listActiveClients(filters: FilterOptions): Promise<ClientProfile[]>
  calculateProfileCompletion(data: ClientProfileData): number
}
```

### 2. **useClientProfileHybrid.ts**
```typescript
function useClientProfileHybrid() {
  return {
    profileData: ClientProfile | null,
    loading: boolean,
    saving: boolean,
    error: string | null,
    isDirty: boolean,
    saveProfile: (data?: Partial<ClientProfileData>) => Promise<void>,
    updateProfileData: (data: Partial<ClientProfileData>) => void,
    completionPercentage: number,
    // ... mais funcionalidades
  }
}
```

## 🔍 Funcionalidades de Matchmaking

### 1. **Função SQL para Compatibilidade**
```sql
CREATE FUNCTION find_compatible_clients(
    trainer_specialties TEXT[],
    trainer_city TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 10
) RETURNS TABLE (
    client_id UUID,
    compatibility_score NUMERIC,
    matching_sports TEXT[],
    client_goals TEXT[],
    client_level TEXT,
    client_city TEXT
)
```

### 2. **Score de Compatibilidade**
- Baseado em esportes em comum entre trainer e cliente
- Considera localização (cidade)
- Algoritmo escalável para futuras melhorias

### 3. **Busca Avançada**
- Filtros por cidade, nível fitness, interesses
- Queries JSONB otimizadas com índices GIN
- Paginação e ordenação

## 📊 Índices de Performance

```sql
-- Índices JSONB específicos
CREATE INDEX idx_client_profile_sports_interest 
ON client_profile USING GIN ((profile_data->'sports'->>'interest'));

CREATE INDEX idx_client_profile_goals 
ON client_profile USING GIN ((profile_data->'goals'));

CREATE INDEX idx_client_profile_fitness_level 
ON client_profile USING GIN ((profile_data->'fitness'->>'level'));

CREATE INDEX idx_client_profile_location 
ON client_profile USING GIN ((profile_data->'location'));
```

## 🔐 Segurança (RLS Policies)

### 1. **Políticas Implementadas**
- `client_profile_select_own`: Usuários veem apenas seus perfis
- `client_profile_insert_own`: Usuários criam apenas seus perfis
- `client_profile_update_own`: Usuários editam apenas seus perfis
- `client_profile_trainers_view`: Treinadores podem ver perfis ativos para matchmaking

### 2. **Validação de Dados**
- Função `validate_client_profile_data()` garante estrutura JSONB
- Constraint `client_profile_data_structure` valida campos obrigatórios
- Trigger automático para inicialização de dados

## 📈 Sistema de Completude

### 1. **Cálculo de Porcentagem**
```typescript
calculateProfileCompletion(data: ClientProfileData): number {
  // Campos obrigatórios: peso 15 cada
  const required = ['sportsInterest', 'primaryGoals', 'fitnessLevel', 'city', 'trainingTime', 'bio'];
  
  // Campos opcionais: peso 5 cada  
  const optional = ['sportsTrained', 'sportsCurious', 'secondaryGoals', 'searchTags', 'budget'];
  
  // Cálculo: (pontos obtidos / pontos máximos) * 100
}
```

### 2. **Incentivo ao Preenchimento**
- Barra de progresso visual
- Badges de status por seção
- Tooltips explicativos

## 🎨 Design System

### 1. **Padrão Visual**
- Ícones temáticos por tipo de esporte/objetivo
- Cores diferenciadas por categoria
- Layout responsivo mobile-first
- Esquema de cores rosa (#e0093e) da marca

### 2. **Componentes Reutilizáveis**
- Seletores modulares
- Cards de informação
- Sistema de badges
- Loading states consistentes

## 🔄 Fluxo de Dados

```
1. Usuário acessa formulário
2. Hook carrega dados existentes ou cria estrutura inicial
3. Componentes de seleção mostram opções da base de dados
4. Mudanças são salvas localmente (isDirty tracking)
5. Save manual ou automático para Supabase
6. Dados são validados e indexados para busca
7. Treinadores podem encontrar cliente via matchmaking
```

## 🚀 Funcionalidades Futuras

### 1. **Matchmaking Avançado**
- Score de compatibilidade por múltiplos fatores
- Machine learning para sugestões
- Histórico de interações trainer-cliente

### 2. **Analytics**
- View `client_profile_analytics` para insights
- Dashboards para admins
- Métricas de engajamento

### 3. **Notificações**
- Alertas de novos clientes compatíveis
- Lembretes de atualização de perfil
- Sistema de mensagens integrado

## 📝 Como Usar

### 1. **Para Desenvolvedores**
```typescript
// Importar o hook
import { useClientProfileHybrid } from '../hooks/useClientProfileHybrid';

// Usar no componente
const { profileData, updateProfileData, saveProfile } = useClientProfileHybrid();

// Atualizar dados
updateProfileData({ sportsInterest: ['Musculação', 'Yoga'] });

// Salvar
await saveProfile();
```

### 2. **Para Treinadores**
```typescript
// Buscar clientes compatíveis
import { useClientSearch } from '../hooks/useClientProfileHybrid';

const { findCompatibleClients } = useClientSearch();
const compatibleClients = await findCompatibleClients(['Musculação', 'Yoga'], 'São Paulo');
```

## ✅ Status de Implementação

- ✅ Tabela híbrida criada
- ✅ Serviço de perfil implementado
- ✅ Hook de gerenciamento criado
- ✅ Componentes de seleção implementados
- ✅ Sistema de matchmaking básico
- ✅ RLS policies configuradas
- ✅ Índices de performance criados
- ✅ Validação de dados implementada
- ✅ Sistema de completude funcionando

## 🎯 Próximos Passos

1. **Integração no Dashboard**: Adicionar rota e navegação
2. **Testes**: Implementar testes unitários e E2E
3. **Documentação**: Guias para usuários finais
4. **Otimização**: Performance tuning baseado em uso real
5. **Feedback**: Coleta de feedback de usuários beta

---

**🏆 Resultado**: Sistema completo e robusto para perfis de clientes que facilita o matchmaking com treinadores, mantendo flexibilidade para crescimento futuro.