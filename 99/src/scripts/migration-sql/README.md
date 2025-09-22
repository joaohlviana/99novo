/*
 * DEPRECATED FILE - MOVED TO README
 * 
 * Este arquivo foi movido para:
 * /scripts/migration-sql/README.md
 * 
 * Use esse arquivo README em vez deste .tsx
 */

// Previne que React tente processar este arquivo como componente
export const DEPRECATED_FILE = true;

Este diretório contém os scripts para migrar sua plataforma de treinadores para um **banco de dados híbrido** que combina estruturas relacionais com campos JSON flexíveis.

## 📋 Visão Geral

A migração está dividida em fases para garantir segurança e facilitar rollbacks:

- **Fase 0**: Diagnóstico e verificação pré-migração
- **Fase 1**: Adicionar campos JSON às tabelas existentes
- **Fase 2**: Migrar dados existentes para formato híbrido  
- **Fase 3**: Criar views e functions para operações avançadas

## 🚀 Como Executar

### Pré-requisitos

1. ✅ Backup completo do banco de dados
2. ✅ Acesso ao SQL Editor do Supabase ou cliente PostgreSQL
3. ✅ Permissões de administrador no banco
4. ✅ Ambiente de staging para testes (recomendado)

### Passo 1: Diagnóstico

Execute o script de diagnóstico para verificar se o sistema está pronto:

```sql
\i scripts/migration-sql/00-pre-migration-check.sql
```

**Resultado esperado**: Status verde indicando que o sistema está pronto.

### Passo 2: Migração Fase 1

Execute a primeira fase da migração (adicionar campos JSON):

```sql
\i scripts/migration-sql/01-add-json-fields-fixed.sql
```

**O que será criado**:
- ✅ Campos JSON em `user_profiles` e `trainer_profiles`
- ✅ Novas tabelas: `programs`, `platform_config`, `user_events`, `reviews`
- ✅ Índices otimizados para queries JSON
- ✅ Configurações iniciais do sistema

### Passo 3: Migração Fase 2

Execute a segunda fase (migrar dados existentes):

```sql
\i scripts/migration-sql/02-migrate-existing-data.sql
```

**O que será migrado**:
- ✅ Dados de perfis para formato JSON
- ✅ Configurações de treinadores
- ✅ Especialidades com dados enriquecidos
- ✅ Templates para novos usuários

### Passo 4: Migração Fase 3

Execute a terceira fase (views e functions):

```sql
\i scripts/migration-sql/03-create-views-and-functions.sql
```

**O que será criado**:
- ✅ Views compatíveis com código existente
- ✅ Functions para busca avançada
- ✅ Procedures para operações complexas
- ✅ Triggers para consistência de dados

## 🔍 Verificações Pós-Migração

Após cada fase, execute estas queries para verificar:

```sql
-- Verificar estrutura criada
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('user_profiles', 'trainer_profiles', 'programs')
AND column_name LIKE '%config%' OR column_name = 'profile_data'
ORDER BY table_name, column_name;

-- Verificar dados migrados
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN profile_data != '{}' THEN 1 END) as migrated_profiles
FROM user_profiles;

-- Verificar configurações do sistema
SELECT key, description, category 
FROM platform_config 
ORDER BY category, key;
```

## 🎯 Benefícios da Migração Híbrida

### ✅ Escalabilidade
- Novos campos de perfil sem migrations
- Configurações dinâmicas por usuário
- Estruturas flexíveis para programas

### ⚡ Performance
- Índices GIN para queries JSON rápidas
- Mantém JOINs eficientes
- Views otimizadas para analytics

### 🔄 Compatibilidade
- Código existente continua funcionando
- Migração gradual e reversível
- Rollback seguro se necessário

## 🚨 Rollback (Em Caso de Problemas)

Cada script contém instruções de rollback no final. Para reverter completamente:

```sql
-- 1. Remover tabelas criadas
DROP TABLE IF EXISTS reviews, user_events, platform_config, programs CASCADE;

-- 2. Remover colunas JSON
ALTER TABLE user_profiles DROP COLUMN IF EXISTS profile_data;
ALTER TABLE trainer_profiles DROP COLUMN IF EXISTS business_config, service_config, preferences;

-- 3. Restaurar backups (se necessário)
-- Ver instruções detalhadas nos scripts
```

## 🛠️ Solução de Problemas

### Erro: "column metadata does not exist"
- **Causa**: Tentativa de criar índice antes da coluna
- **Solução**: Use o script `01-add-json-fields-fixed.sql` que verifica dependências

### Erro: "relation already exists"  
- **Causa**: Execução duplicada do script
- **Solução**: Scripts são idempotentes, erro pode ser ignorado

### Erro: "permission denied"
- **Causa**: Usuário sem permissões suficientes
- **Solução**: Execute com usuário administrador ou owner do banco

### Performance degradada após migração
- **Causa**: Índices ainda sendo construídos
- **Solução**: Aguarde conclusão da indexação (pode levar alguns minutos)

## 📊 Monitoramento

Após a migração, monitore:

```sql
-- Tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Performance das queries JSON
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
WHERE query LIKE '%jsonb%' OR query LIKE '%gin%'
ORDER BY mean_exec_time DESC;
```

## 🎨 Próximos Passos

Após a migração bem-sucedida:

1. ✅ **Atualizar código**: Adaptar componentes para usar novos campos JSON
2. ✅ **Testar funcionalidades**: Validar todas as features críticas  
3. ✅ **Performance tuning**: Otimizar queries baseado no uso real
4. ✅ **Documentar schemas**: Criar documentação dos novos formatos JSON
5. ✅ **Treinar equipe**: Capacitar desenvolvedores nos novos padrões

## 📞 Suporte

Se encontrar problemas:

1. 📋 Execute o diagnóstico: `00-pre-migration-check.sql`
2. 📝 Documente o erro exato e contexto
3. 🔄 Verifique se seguiu todos os pré-requisitos
4. 💾 Tenha backup disponível para rollback se necessário

---

**⚠️ IMPORTANTE**: Sempre teste em ambiente de staging antes de aplicar em produção!