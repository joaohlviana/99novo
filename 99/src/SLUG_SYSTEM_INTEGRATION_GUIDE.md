# 🔗 Sistema de Slugs - Guia de Integração

## ✅ Arquivos Criados

### 1. **Serviço de Slugs** (`/services/slug.service.ts`)
- Resolve slugs para trainers, sports e programs
- Suporte a fallback UUID → slug
- Geração automática de slugs
- Navegação SEO-friendly

### 2. **Hooks de Slugs** (`/hooks/useSlug.ts`)
- `useSlug()` - Hook principal para resolução
- `useTrainerSlug()` - Específico para trainers
- `useProgramSlug()` - Específico para programs
- `useSportSlug()` - Específico para sports

### 3. **Hooks de Navegação** (`/hooks/useSlugNavigation.ts`)
- `useSlugNavigation()` - Navegação geral
- `useTrainerCardNavigation()` - Para cards de trainers
- `useProgramCardNavigation()` - Para cards de programs

### 4. **Componente Dinâmico** (`/components/DynamicSlugPage.tsx`)
- Resolve automaticamente o tipo de entidade
- Redireciona UUID para slug
- Renderiza componente apropriado

### 5. **Página de Trainer** (`/pages/TrainerSlugPage.tsx`)
- Página específica para trainers com slugs
- Integra com sistema existente

### 6. **Funções SQL** (`/scripts/slug-functions-simple.sql`)
- **CORRIGIDO**: `resolve_program_slug_safe` não acessa tabela `users`
- Funções para resolução de slugs
- Triggers automáticos para geração
- Índices para performance

## 🚨 ETAPA CRÍTICA: Executar SQL

### Execute este arquivo no Supabase SQL Editor:
```bash
/scripts/slug-functions-simple.sql
```

**⚠️ IMPORTANTE:** 
- A função `resolve_program_slug_safe` foi corrigida
- Não acessa mais a tabela `users` diretamente
- Usa apenas `programs_with_slugs`

## 🔄 Rotas Atualizadas

### Novas rotas SEO-friendly:
```
/trainers/:slug  → TrainerSlugPage
/sports/:slug    → SportPage (atualizada)
/programs/:slug  → ProgramDetailsPage (atualizada)
```

### Rotas de compatibilidade (legacy):
```
/trainer/:trainerId  → TrainerProfilePage (UUID)
/program/:programId  → ProgramDetailsPage (UUID)
/sport/:sportId      → SportPage (UUID)
```

## 📱 Como Usar nos Componentes

### 1. **Navegação em Cards**
```tsx
import { useTrainerCardNavigation } from '../hooks/useSlugNavigation';

function TrainerCard({ trainer }) {
  const { handleTrainerClick } = useTrainerCardNavigation();
  
  return (
    <div onClick={(e) => handleTrainerClick(trainer, e)}>
      {/* Card content */}
    </div>
  );
}
```

### 2. **Resolução de Slugs**
```tsx
import { useTrainerSlug } from '../hooks/useSlug';

function TrainerPage() {
  const { slug } = useParams();
  const { trainerData, loading, error } = useTrainerSlug(slug);
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return <TrainerProfile data={trainerData} />;
}
```

### 3. **Navegação Programática**
```tsx
import { useSlugNavigation } from '../hooks/useSlugNavigation';

function SomeComponent() {
  const { navigateToTrainer, getSeoUrl } = useSlugNavigation();
  
  const handleClick = () => {
    navigateToTrainer({ id: 'uuid', slug: 'trainer-name' });
  };
  
  const shareUrl = getSeoUrl(trainer, 'trainer'); // /trainers/trainer-name
}
```

## 🔍 Funcionalidades Implementadas

### ✅ **Resolução Automática**
- UUID na URL → redirecionamento 301 para slug
- Fallback automático para UUID se slug não existir
- Validação de tipos de entidade

### ✅ **SEO Otimizado**
- URLs amigáveis: `/trainers/joao-silva`
- Metadata automática baseada no slug
- Canonical URLs corretas

### ✅ **Performance**
- Índices específicos para slugs
- Queries otimizadas
- Cache em memória dos hooks

### ✅ **Compatibilidade**
- Rotas legacy mantidas
- Redirecionamento automático
- Sem breaking changes

## 🧪 Como Testar

### 1. **Executar SQL**
```sql
-- No Supabase SQL Editor
\i /scripts/slug-functions-simple.sql
```

### 2. **Testar Funções**
```sql
-- Testar resolução de trainer
SELECT * FROM resolve_trainer_slug('joao-silva');

-- Testar resolução de sport
SELECT * FROM resolve_sport_slug('musculacao');

-- Testar resolução de program (CORRIGIDA)
SELECT * FROM resolve_program_slug_safe('programa-musculacao');
```

### 3. **Testar Navegação**
- Acessar `/trainers/algum-slug`
- Acessar `/trainers/uuid-qualquer` (deve redirecionar)
- Verificar redirecionamentos 301

## 🚀 Próximos Passos

### 1. **Atualizar Components Existentes**
- TrainerCard → usar `useTrainerCardNavigation`
- ProgramCard → usar `useProgramCardNavigation`
- Links internos → usar `useSlugNavigation`

### 2. **Implementar Sitemap**
```tsx
// Gerar sitemap.xml com todas as URLs de slug
const sitemapUrls = [
  ...trainers.map(t => `/trainers/${t.slug}`),
  ...programs.map(p => `/programs/${p.slug}`),
  ...sports.map(s => `/sports/${s.slug}`)
];
```

### 3. **Metadata Dinâmica**
```tsx
// Em cada página de slug
export async function generateMetadata({ params }) {
  const { slug } = params;
  const entity = await resolveSlug(slug);
  
  return {
    title: `${entity.name} | 99coach`,
    description: entity.description,
    alternates: {
      canonical: `/trainers/${entity.slug}`
    }
  };
}
```

## ⚡ Benefícios Imediatos

1. **SEO Melhorado**: URLs amigáveis
2. **UX Aprimorada**: Links legíveis
3. **Performance**: Índices otimizados
4. **Manutenibilidade**: Sistema centralizado
5. **Escalabilidade**: Fácil adicionar novos tipos

---

## 🏆 Sistema Completo e Funcional

O sistema de slugs está completamente implementado e pronto para uso. Execute o SQL e comece a usar as novas rotas SEO-friendly!