# ARQUITETURA UNIFICADA DE PROGRAMAS - DOCUMENTAÇÃO TÉCNICA

## 🎯 VISÃO GERAL

Este documento descreve a nova arquitetura unificada para cards e dados de programas de treinamento, implementada para resolver problemas de duplicação e inconsistência no sistema.

## 🏗️ COMPONENTES DA ARQUITETURA

### 1. **TIPOS UNIFICADOS** (`/types/unified-program.ts`)

- **`UnifiedProgramData`**: Tipo principal com todos os dados do programa
- **`UnifiedProgramCardData`**: Versão compacta para cards
- **`UnifiedProgramDashboardData`**: Versão estendida para dashboards
- **`UnifiedTrainerData`**: Dados padronizados do trainer (sempre do user_profile)
- **`UnifiedProgramActions`**: Ações disponíveis nos cards
- **`ProgramCardVariant`**: Variantes visuais (compact, standard, dashboard, etc.)

### 2. **SERVIÇO UNIFICADO** (`/services/unified-programs.service.ts`)

#### Funcionalidades:
- ✅ Busca programas públicos
- ✅ Busca programas do trainer (dashboard)
- ✅ Busca por categoria
- ✅ Programas em destaque
- ✅ Programas populares
- ✅ Busca por ID
- ✅ Toggle ativo/inativo
- ✅ Avatar sempre do user_profile

#### Adaptadores:
- **`adaptLegacyToUnified()`**: Converte dados da tabela `99_training_programs` para formato unificado
- **`getTrainerData()`**: Busca dados do trainer sempre da tabela `user_profile`
- **`extractCardData()`**: Extrai dados para cards compactos
- **`extractDashboardData()`**: Extrai dados para dashboard

### 3. **COMPONENTE UNIFICADO** (`/components/unified/UnifiedProgramCard.tsx`)

#### Recursos:
- ✅ Múltiplas variantes (compact, standard, dashboard, featured, list)
- ✅ Múltiplos contextos (public, dashboard, client, admin)
- ✅ Switch ativo/inativo integrado
- ✅ Menu de ações (dashboard)
- ✅ Estados visuais (grayscale quando inativo)
- ✅ Avatar sempre do user_profile
- ✅ Responsive design

#### Componentes Especializados:
```typescript
import { 
  CompactProgramCard,
  DashboardProgramCard, 
  FeaturedProgramCard,
  ListProgramCard 
} from './components/unified/UnifiedProgramCard';
```

### 4. **HOOKS UNIFICADOS** (`/hooks/useUnifiedPrograms.ts`)

#### Hooks Disponíveis:
- **`useUnifiedPrograms()`**: Hook principal
- **`usePublicPrograms()`**: Para páginas públicas
- **`useTrainerDashboardPrograms()`**: Para dashboard
- **`useCategoryPrograms()`**: Para páginas de categoria
- **`useFeaturedPrograms()`**: Para programas em destaque
- **`usePopularPrograms()`**: Para programas populares

## 🔄 FLUXO DE DADOS

```
1. Hook chama serviço
2. Serviço busca dados da tabela 99_training_programs
3. Adaptador converte para formato unificado
4. Busca dados do trainer na user_profile
5. Retorna dados padronizados
6. Componente renderiza com dados unificados
```

## 📊 TABELAS UTILIZADAS

### `99_training_programs` (Dados principais)
- Campos relacionais: `id`, `trainer_id`, `title`, `category`, etc.
- Campos JSONB: `program_data` (dados flexíveis)

### `user_profile` (Dados do trainer)
- **SEMPRE** buscar avatar, nome e dados do trainer desta tabela
- Campos: `id`, `name`, `avatar`, `bio`, `location_data`, `sports_data`

## 🎨 VARIANTES DE CARD

### **Compact** - Para carousels
```typescript
<CompactProgramCard 
  program={program}
  actions={{ onNavigateToProgram: handleNavigate }}
/>
```

### **Dashboard** - Para dashboard do trainer
```typescript
<DashboardProgramCard 
  program={program}
  actions={{
    onEdit: handleEdit,
    onToggleActive: handleToggle,
    onDelete: handleDelete
  }}
/>
```

### **Standard** - Para grids gerais
```typescript
<UnifiedProgramCard 
  program={program}
  variant="standard"
  context="public"
/>
```

## 🔧 IMPLEMENTAÇÃO EM PÁGINAS

### **HomePage**
```typescript
import { ModernProgramCarouselUnified } from './ModernProgramCarouselUnified';

// Usar carousel unificado
<ModernProgramCarouselUnified />
```

### **Dashboard do Trainer**
```typescript
import { useTrainerDashboardPrograms } from '../hooks/useUnifiedPrograms';
import { DashboardProgramCard } from '../components/unified/UnifiedProgramCard';

const { programs, loading } = useTrainerDashboardPrograms();

return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {programs.map(program => (
      <DashboardProgramCard 
        key={program.id}
        program={program}
        actions={programActions}
      />
    ))}
  </div>
);
```

### **Página de Categoria**
```typescript
import { useCategoryPrograms } from '../hooks/useUnifiedPrograms';

const { programs } = useCategoryPrograms('Musculação');
```

## 🗃️ ARQUIVOS SUBSTITUÍDOS

### **Componentes Legados (DEPRECIADOS)**
- ❌ `DashboardProgramCard.tsx` (substituído por UnifiedProgramCard)
- ❌ `FigmaProgramCard.tsx` 
- ❌ `ModernProgramCard.tsx`
- ❌ `ProgramCard.tsx`

### **Serviços Legados (DEPRECIADOS)**
- ❌ `programs.service.ts`
- ❌ `training-programs.service.ts` 
- ❌ `training-programs-simple.service.ts`
- ❌ `public-programs.service.ts`

### **Hooks Legados (DEPRECIADOS)**
- ❌ `usePrograms.ts`
- ❌ `useTrainingPrograms.ts`
- ❌ `useTrainingProgramsSimple.ts`

## ✅ VANTAGENS DA ARQUITETURA

### **Consistência**
- ✅ Tipos unificados em todo o sistema
- ✅ Avatar sempre do user_profile
- ✅ Estados visuais padronizados
- ✅ Ações consistentes

### **Manutenibilidade**
- ✅ Componente único para todas as variantes
- ✅ Serviço único para todas as operações
- ✅ Menos duplicação de código
- ✅ Easier debugging

### **Performance**
- ✅ Queries otimizadas
- ✅ Cache consistente
- ✅ Menos rerenders
- ✅ Bundle size menor

### **Escalabilidade**
- ✅ Fácil adicionar novas variantes
- ✅ Fácil adicionar novos contextos
- ✅ Sistema extensível
- ✅ Future-proof

## 📝 EXEMPLO COMPLETO DE USO

```typescript
// 1. Import do hook unificado
import { usePublicPrograms } from '../hooks/useUnifiedPrograms';
import { CompactProgramCard } from '../components/unified/UnifiedProgramCard';

// 2. Componente da página
export function ProgramsPage() {
  const { programs, loading, error } = usePublicPrograms();
  
  const actions = {
    onNavigateToProgram: (id) => navigate(`/program/${id}`),
    onNavigateToTrainer: (id) => navigate(`/trainer/${id}`),
    onLike: (id) => console.log('Like:', id)
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {programs.map(program => (
        <CompactProgramCard
          key={program.id}
          program={program}
          actions={actions}
        />
      ))}
    </div>
  );
}
```

## 🚀 PRÓXIMOS PASSOS

1. **Migrar componentes existentes** para usar sistema unificado
2. **Deprecar arquivos legados** após migração completa
3. **Adicionar testes** para cobertura da arquitetura
4. **Documentar padrões** para novos desenvolvedores
5. **Estender para outros domínios** (ex: treinadores, workouts)

---

**📚 Esta arquitetura é o padrão soberano para todos os cards de programa no sistema. Use sempre os componentes e serviços unificados para garantir consistência.**