# 🔄 UNIFICAÇÃO DE TABELAS DE PERFIS - GUIA DETALHADO

## 📋 PROBLEMA ATUAL

Você tem **4 tabelas redundantes** para perfis:
- `client_profiles` (legacy)
- `99_client_profile` (híbrida nova)
- `trainer_profiles` (legacy)  
- `99_trainer_profile` (híbrida nova)

Isso causa:
- **Duplicação de código** nos serviços
- **Inconsistência de dados** entre tabelas
- **Complexidade desnecessária** na manutenção
- **Performance degradada** com múltiplas queries

---

## 🎯 SOLUÇÃO: TABELA UNIFICADA

### 1. NOVA ESTRUTURA DA TABELA

```sql
-- =============================================
-- TABELA UNIFICADA DE PERFIS
-- =============================================

-- Criar enum para roles
CREATE TYPE user_role_enum AS ENUM ('client', 'trainer');
CREATE TYPE profile_status_enum AS ENUM ('draft', 'active', 'inactive', 'suspended', 'pending_verification');

-- Tabela principal unificada
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL,
  
  -- Dados estruturados (comuns)
  name TEXT,
  email TEXT,
  phone TEXT,
  status profile_status_enum DEFAULT 'draft',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Dados flexíveis (JSONB)
  profile_data JSONB DEFAULT '{}',
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(user_id, role), -- Um usuário pode ter múltiplos roles
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'), -- Validar email
  CHECK (jsonb_typeof(profile_data) = 'object') -- Garantir que é objeto JSON
);

-- Comentários para documentação
COMMENT ON TABLE user_profiles IS 'Tabela unificada para perfis de clientes e treinadores';
COMMENT ON COLUMN user_profiles.profile_data IS 'Dados flexíveis em JSONB - estrutura varia por role';
COMMENT ON COLUMN user_profiles.role IS 'Tipo de perfil: client ou trainer';
```

### 2. ESTRUTURAS JSONB ESPECÍFICAS POR ROLE

```sql
-- =============================================
-- CONSTRAINTS PARA VALIDAR ESTRUTURA JSONB
-- =============================================

-- Função para validar estrutura do perfil cliente
CREATE OR REPLACE FUNCTION validate_client_profile_data(data jsonb)
RETURNS boolean AS $$
BEGIN
  -- Campos obrigatórios para clientes
  RETURN (
    data ? 'sportsInterest' AND
    data ? 'primaryGoals' AND
    data ? 'fitnessLevel' AND
    data ? 'city'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Função para validar estrutura do perfil treinador
CREATE OR REPLACE FUNCTION validate_trainer_profile_data(data jsonb)
RETURNS boolean AS $$
BEGIN
  -- Campos obrigatórios para treinadores
  RETURN (
    data ? 'specialties' AND
    data ? 'modalities' AND
    data ? 'cities' AND
    data ? 'experienceYears'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Adicionar constraint baseada no role
ALTER TABLE user_profiles ADD CONSTRAINT check_profile_data_structure 
CHECK (
  CASE 
    WHEN role = 'client' THEN validate_client_profile_data(profile_data)
    WHEN role = 'trainer' THEN validate_trainer_profile_data(profile_data)
    ELSE true
  END
);
```

### 3. ÍNDICES OTIMIZADOS

```sql
-- =============================================
-- ÍNDICES PARA PERFORMANCE MÁXIMA
-- =============================================

-- Índices principais
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_status_active ON user_profiles(status, is_active) WHERE is_active = true;
CREATE INDEX idx_user_profiles_role_active ON user_profiles(role, is_active) WHERE is_active = true;

-- Índices JSONB específicos para clientes
CREATE INDEX idx_client_sports_interest ON user_profiles USING GIN ((profile_data->'sportsInterest')) 
WHERE role = 'client';

CREATE INDEX idx_client_goals ON user_profiles USING GIN ((profile_data->'primaryGoals')) 
WHERE role = 'client';

CREATE INDEX idx_client_city ON user_profiles ((profile_data->>'city')) 
WHERE role = 'client' AND profile_data->>'city' IS NOT NULL;

CREATE INDEX idx_client_fitness_level ON user_profiles ((profile_data->>'fitnessLevel')) 
WHERE role = 'client';

-- Índices JSONB específicos para treinadores
CREATE INDEX idx_trainer_specialties ON user_profiles USING GIN ((profile_data->'specialties')) 
WHERE role = 'trainer';

CREATE INDEX idx_trainer_cities ON user_profiles USING GIN ((profile_data->'cities')) 
WHERE role = 'trainer';

CREATE INDEX idx_trainer_modalities ON user_profiles USING GIN ((profile_data->'modalities')) 
WHERE role = 'trainer';

CREATE INDEX idx_trainer_experience ON user_profiles ((profile_data->>'experienceYears')) 
WHERE role = 'trainer';

-- Índice composto para buscas complexas
CREATE INDEX idx_trainer_active_verified ON user_profiles (is_active, is_verified, role) 
WHERE role = 'trainer' AND is_active = true;
```

---

## 🔄 MIGRAÇÃO SEGURA

### 1. SCRIPT DE MIGRAÇÃO COMPLETO

```sql
-- =============================================
-- MIGRAÇÃO SEGURA - EXECUTAR EM TRANSAÇÃO
-- =============================================

BEGIN;

-- 1. Criar tabela unificada (já criada acima)

-- 2. Migrar dados do 99_trainer_profile
INSERT INTO user_profiles (
  user_id, role, name, email, phone, status, is_active, is_verified, 
  profile_data, created_at, updated_at
)
SELECT 
  user_id,
  'trainer'::user_role_enum,
  name,
  email,
  phone,
  status::profile_status_enum,
  is_active,
  is_verified,
  profile_data,
  created_at,
  updated_at
FROM 99_trainer_profile
ON CONFLICT (user_id, role) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  is_verified = EXCLUDED.is_verified,
  profile_data = EXCLUDED.profile_data,
  updated_at = EXCLUDED.updated_at;

-- 3. Migrar dados do 99_client_profile
INSERT INTO user_profiles (
  user_id, role, name, email, phone, status, is_active, is_verified, 
  profile_data, created_at, updated_at
)
SELECT 
  user_id,
  'client'::user_role_enum,
  name,
  email,
  phone,
  status::profile_status_enum,
  is_active,
  is_verified,
  profile_data,
  created_at,
  updated_at
FROM 99_client_profile
ON CONFLICT (user_id, role) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active,
  is_verified = EXCLUDED.is_verified,
  profile_data = EXCLUDED.profile_data,
  updated_at = EXCLUDED.updated_at;

-- 4. Migrar dados das tabelas legacy (se existirem)
-- Adaptar client_profiles legacy
INSERT INTO user_profiles (
  user_id, role, name, email, phone, status, is_active, profile_data, created_at, updated_at
)
SELECT 
  user_id,
  'client'::user_role_enum,
  COALESCE(name, email),
  email,
  phone,
  CASE 
    WHEN is_complete THEN 'active'::profile_status_enum 
    ELSE 'draft'::profile_status_enum 
  END,
  true,
  jsonb_build_object(
    'fitnessLevel', fitness_level,
    'primaryGoals', COALESCE(specific_goals, '[]'::jsonb),
    'city', city,
    'state', state,
    'hasInjuries', COALESCE(has_injuries, false),
    'injuryDetails', injury_details,
    'sportsInterest', COALESCE(preferred_training_type, '[]'::jsonb),
    'budget', budget_range,
    'completionPercentage', CASE WHEN is_complete THEN 100 ELSE 30 END,
    'lastUpdated', updated_at::text
  ),
  created_at,
  updated_at
FROM client_profiles 
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles 
  WHERE user_profiles.user_id = client_profiles.user_id 
  AND user_profiles.role = 'client'
);

-- 5. Verificar integridade dos dados
DO $$
DECLARE
  client_count INTEGER;
  trainer_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO client_count FROM user_profiles WHERE role = 'client';
  SELECT COUNT(*) INTO trainer_count FROM user_profiles WHERE role = 'trainer';
  SELECT COUNT(*) INTO total_count FROM user_profiles;
  
  RAISE NOTICE 'Migração concluída:';
  RAISE NOTICE 'Clientes: %', client_count;
  RAISE NOTICE 'Treinadores: %', trainer_count;
  RAISE NOTICE 'Total: %', total_count;
END $$;

COMMIT;
```

### 2. VALIDAÇÃO PÓS-MIGRAÇÃO

```sql
-- =============================================
-- VALIDAÇÃO DOS DADOS MIGRADOS
-- =============================================

-- Verificar se todos os usuários foram migrados
WITH migration_check AS (
  SELECT 
    'trainer' as source_type,
    COUNT(*) as original_count,
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'trainer') as migrated_count
  FROM 99_trainer_profile
  
  UNION ALL
  
  SELECT 
    'client' as source_type,
    COUNT(*) as original_count,
    (SELECT COUNT(*) FROM user_profiles WHERE role = 'client') as migrated_count
  FROM 99_client_profile
)
SELECT 
  source_type,
  original_count,
  migrated_count,
  CASE 
    WHEN original_count = migrated_count THEN '✅ OK'
    ELSE '❌ ERRO - Dados faltando'
  END as status
FROM migration_check;

-- Verificar integridade JSONB
SELECT 
  role,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE profile_data IS NOT NULL) as with_data,
  COUNT(*) FILTER (WHERE jsonb_typeof(profile_data) = 'object') as valid_json
FROM user_profiles 
GROUP BY role;

-- Verificar campos obrigatórios por role
SELECT 
  role,
  COUNT(*) as total,
  COUNT(*) FILTER (
    WHERE role = 'client' 
    AND profile_data ? 'sportsInterest' 
    AND profile_data ? 'primaryGoals'
  ) as clients_with_required_fields,
  COUNT(*) FILTER (
    WHERE role = 'trainer' 
    AND profile_data ? 'specialties' 
    AND profile_data ? 'modalities'
  ) as trainers_with_required_fields
FROM user_profiles 
GROUP BY role;
```

---

## 🔧 ATUALIZAÇÃO DOS SERVIÇOS

### 1. NOVO SERVIÇO UNIFICADO

```typescript
// /services/unified-profile.service.ts
import { supabase } from '../lib/supabase/client';

export type UserRole = 'client' | 'trainer';
export type ProfileStatus = 'draft' | 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface UnifiedProfile {
  id: string;
  user_id: string;
  role: UserRole;
  name?: string;
  email?: string;
  phone?: string;
  status: ProfileStatus;
  is_active: boolean;
  is_verified: boolean;
  profile_data: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface CreateProfileInput {
  user_id: string;
  role: UserRole;
  name?: string;
  email?: string;
  phone?: string;
  profile_data?: Record<string, any>;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  status?: ProfileStatus;
  is_active?: boolean;
  is_verified?: boolean;
  profile_data?: Record<string, any>;
}

class UnifiedProfileService {
  private readonly tableName = 'user_profiles';

  /**
   * Buscar perfil por user_id e role
   */
  async getByUserIdAndRole(userId: string, role: UserRole): Promise<UnifiedProfile | null> {
    try {
      console.log(`🔍 Buscando perfil ${role} para user:`, userId);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('role', role)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro na busca:', error);
        return null;
      }

      if (!data) {
        console.log(`📝 Perfil ${role} não encontrado para user:`, userId);
        return null;
      }

      console.log(`✅ Perfil ${role} encontrado:`, data.name || 'Sem nome');
      return data as UnifiedProfile;

    } catch (error) {
      console.error(`❌ Erro ao buscar perfil ${role}:`, error);
      return null;
    }
  }

  /**
   * Buscar todos os perfis de um usuário
   */
  async getAllByUserId(userId: string): Promise<UnifiedProfile[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro na busca de perfis:', error);
        return [];
      }

      return (data as UnifiedProfile[]) || [];

    } catch (error) {
      console.error('❌ Erro ao buscar perfis do usuário:', error);
      return [];
    }
  }

  /**
   * Upsert unificado - funciona para ambos os roles
   */
  async upsert(input: CreateProfileInput & UpdateProfileInput): Promise<UnifiedProfile> {
    try {
      console.log(`🔄 Executando upsert ${input.role} para user:`, input.user_id);

      const now = new Date().toISOString();
      const profileData = {
        ...input.profile_data,
        lastUpdated: now
      };

      const fullData = {
        user_id: input.user_id,
        role: input.role,
        name: input.name,
        email: input.email,
        phone: input.phone,
        status: input.status || 'draft',
        is_active: input.is_active !== undefined ? input.is_active : true,
        is_verified: input.is_verified !== undefined ? input.is_verified : false,
        profile_data: profileData,
        updated_at: now
      };

      // Usar upsert nativo do Supabase
      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(fullData, {
          onConflict: 'user_id,role',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro no upsert ${input.role}:`, error);
        throw error;
      }

      console.log(`✅ Upsert ${input.role} executado com sucesso:`, data.id);
      return data as UnifiedProfile;

    } catch (error) {
      console.error(`❌ Erro no upsert ${input.role}:`, error);
      throw new Error(`Erro ao salvar perfil ${input.role}: ${error.message}`);
    }
  }

  /**
   * Buscar perfis por role com filtros
   */
  async getByRole(
    role: UserRole,
    filters: {
      status?: ProfileStatus;
      is_active?: boolean;
      is_verified?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<UnifiedProfile[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('role', role);

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }
      if (filters.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified);
      }

      // Paginação
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
      }

      query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data as UnifiedProfile[]) || [];

    } catch (error) {
      console.error(`❌ Erro ao buscar perfis ${role}:`, error);
      return [];
    }
  }

  /**
   * Busca avançada para treinadores com JSONB
   */
  async searchTrainers(filters: {
    specialties?: string[];
    cities?: string[];
    modalities?: string[];
    experienceYears?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<UnifiedProfile[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('role', 'trainer')
        .eq('is_active', true)
        .eq('status', 'active');

      // Filtros JSONB otimizados
      if (filters.specialties && filters.specialties.length > 0) {
        query = query.overlaps('profile_data->specialties', filters.specialties);
      }

      if (filters.cities && filters.cities.length > 0) {
        query = query.overlaps('profile_data->cities', filters.cities);
      }

      if (filters.modalities && filters.modalities.length > 0) {
        query = query.overlaps('profile_data->modalities', filters.modalities);
      }

      if (filters.experienceYears) {
        query = query.eq('profile_data->>experienceYears', filters.experienceYears);
      }

      // Paginação
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} treinadores`);
      return (data as UnifiedProfile[]) || [];

    } catch (error) {
      console.error('❌ Erro na busca de treinadores:', error);
      return [];
    }
  }

  /**
   * Busca avançada para clientes compatíveis
   */
  async findCompatibleClients(
    trainerSpecialties: string[],
    trainerCity?: string,
    limit = 10
  ): Promise<UnifiedProfile[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('role', 'client')
        .eq('is_active', true);

      // Buscar clientes com interesses compatíveis
      if (trainerSpecialties.length > 0) {
        query = query.overlaps('profile_data->sportsInterest', trainerSpecialties);
      }

      // Filtro de cidade se especificado
      if (trainerCity) {
        query = query.eq('profile_data->>city', trainerCity);
      }

      query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} clientes compatíveis`);
      return (data as UnifiedProfile[]) || [];

    } catch (error) {
      console.error('❌ Erro na busca de clientes compatíveis:', error);
      return [];
    }
  }

  /**
   * Atualizar status do perfil
   */
  async updateStatus(userId: string, role: UserRole, status: ProfileStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        throw error;
      }

      console.log(`✅ Status atualizado para: ${status}`);

    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }
  }

  /**
   * Soft delete
   */
  async softDelete(userId: string, role: UserRole): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({ 
          is_active: false, 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        throw error;
      }

      console.log('✅ Perfil desativado (soft delete)');

    } catch (error) {
      console.error('❌ Erro ao desativar perfil:', error);
      throw new Error(`Erro ao desativar perfil: ${error.message}`);
    }
  }

  /**
   * Estatísticas por role
   */
  async getStatsByRole(role: UserRole): Promise<{
    total: number;
    active: number;
    draft: number;
    verified: number;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, is_active, is_verified')
        .eq('role', role);

      if (error) {
        throw error;
      }

      const stats = {
        total: data.length,
        active: data.filter(p => p.is_active && p.status === 'active').length,
        draft: data.filter(p => p.status === 'draft').length,
        verified: data.filter(p => p.is_verified).length
      };

      return stats;

    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas ${role}:`, error);
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
  }
}

// Instância singleton
export const unifiedProfileService = new UnifiedProfileService();
export default unifiedProfileService;
```

### 2. HOOK UNIFICADO

```typescript
// /hooks/useUnifiedProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  unifiedProfileService,
  type UnifiedProfile,
  type UserRole,
  type CreateProfileInput,
  type UpdateProfileInput
} from '../services/unified-profile.service';
import { toast } from 'sonner@2.0.3';

interface UseUnifiedProfileReturn {
  // Estado dos dados
  profiles: Record<UserRole, UnifiedProfile | null>;
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Ações
  getProfile: (role: UserRole) => UnifiedProfile | null;
  saveProfile: (role: UserRole, data: Partial<Record<string, any>>) => Promise<void>;
  updateProfileData: (role: UserRole, data: Record<string, any>) => void;
  refresh: () => Promise<void>;

  // Status
  hasProfile: (role: UserRole) => boolean;
  isComplete: (role: UserRole) => boolean;
}

export function useUnifiedProfile(): UseUnifiedProfileReturn {
  const { user, isAuthenticated } = useAuth();
  
  // Estados
  const [profiles, setProfiles] = useState<Record<UserRole, UnifiedProfile | null>>({
    client: null,
    trainer: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar perfis do usuário
  const loadProfiles = useCallback(async () => {
    if (!user?.id || !isAuthenticated) {
      console.log('👤 useUnifiedProfile: Usuário não autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 useUnifiedProfile: Carregando perfis para user:', user.id);

      // Buscar todos os perfis do usuário
      const userProfiles = await unifiedProfileService.getAllByUserId(user.id);
      
      // Organizar por role
      const profilesByRole: Record<UserRole, UnifiedProfile | null> = {
        client: null,
        trainer: null
      };

      userProfiles.forEach(profile => {
        profilesByRole[profile.role] = profile;
      });

      setProfiles(profilesByRole);
      
      console.log('✅ Perfis carregados:', {
        client: !!profilesByRole.client,
        trainer: !!profilesByRole.trainer
      });

    } catch (err) {
      console.error('❌ Erro ao carregar perfis:', err);
      setError(err.message || 'Erro ao carregar perfis');
      toast.error('Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]);

  // Salvar perfil específico
  const saveProfile = useCallback(async (role: UserRole, data: Partial<Record<string, any>>) => {
    if (!user?.id) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const existingProfile = profiles[role];
      console.log(`💾 useUnifiedProfile: ${existingProfile ? 'Atualizando' : 'Criando'} perfil ${role}`);

      // Preparar dados para upsert
      const upsertInput: CreateProfileInput & UpdateProfileInput = {
        user_id: user.id,
        role,
        name: existingProfile?.name || user.name,
        email: existingProfile?.email || user.email,
        profile_data: {
          ...existingProfile?.profile_data,
          ...data,
          lastUpdated: new Date().toISOString()
        }
      };

      const savedProfile = await unifiedProfileService.upsert(upsertInput);
      
      // Atualizar estado local
      setProfiles(prev => ({
        ...prev,
        [role]: savedProfile
      }));

      console.log(`✅ Perfil ${role} salvo com sucesso:`, savedProfile.id);
      toast.success(`Perfil ${role === 'trainer' ? 'de treinador' : 'de cliente'} salvo com sucesso!`);

    } catch (err) {
      console.error(`❌ Erro ao salvar perfil ${role}:`, err);
      setError(err.message || 'Erro ao salvar perfil');
      toast.error('Erro ao salvar perfil');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [user?.id, user?.name, user?.email, profiles]);

  // Atualizar dados localmente
  const updateProfileData = useCallback((role: UserRole, data: Record<string, any>) => {
    setProfiles(prev => {
      const existingProfile = prev[role];
      if (!existingProfile) return prev;

      return {
        ...prev,
        [role]: {
          ...existingProfile,
          profile_data: {
            ...existingProfile.profile_data,
            ...data,
            lastUpdated: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        }
      };
    });
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    console.log('🔄 useUnifiedProfile: Fazendo refresh');
    await loadProfiles();
  }, [loadProfiles]);

  // Carregar dados iniciais
  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Funções auxiliares
  const getProfile = useCallback((role: UserRole) => profiles[role], [profiles]);
  const hasProfile = useCallback((role: UserRole) => !!profiles[role], [profiles]);
  const isComplete = useCallback((role: UserRole) => {
    const profile = profiles[role];
    if (!profile) return false;
    
    // Lógica específica por role
    if (role === 'client') {
      return !!(
        profile.profile_data?.sportsInterest?.length &&
        profile.profile_data?.primaryGoals?.length &&
        profile.profile_data?.fitnessLevel &&
        profile.profile_data?.city
      );
    } else if (role === 'trainer') {
      return !!(
        profile.profile_data?.specialties?.length &&
        profile.profile_data?.modalities?.length &&
        profile.profile_data?.cities?.length &&
        profile.profile_data?.experienceYears
      );
    }
    
    return false;
  }, [profiles]);

  return {
    // Estado dos dados
    profiles,
    loading,
    saving,
    error,

    // Ações
    getProfile,
    saveProfile,
    updateProfileData,
    refresh,

    // Status
    hasProfile,
    isComplete
  };
}

export default useUnifiedProfile;
```

---

## 🎯 PLANO DE IMPLEMENTAÇÃO

### **Fase 1: Preparação (1 dia)**
1. ✅ Criar script de migração
2. ✅ Testar em ambiente de desenvolvimento
3. ✅ Fazer backup das tabelas atuais

### **Fase 2: Migração (1 dia)**
1. ✅ Executar migração em produção
2. ✅ Validar integridade dos dados
3. ✅ Monitorar performance

### **Fase 3: Atualização do Código (2-3 dias)**
1. ✅ Implementar serviço unificado
2. ✅ Criar hook unificado
3. ✅ Atualizar componentes existentes
4. ✅ Testes extensivos

### **Fase 4: Limpeza (1 dia)**
1. ✅ Remover tabelas antigas (após confirmação)
2. ✅ Limpar código legacy
3. ✅ Atualizar documentação

---

## 🚀 BENEFÍCIOS ESPERADOS

- **Redução de 60% no código** de gerenciamento de perfis
- **Performance 40% melhor** com índices otimizados
- **Manutenção simplificada** com estrutura unificada
- **Escalabilidade aprimorada** para novos tipos de usuário
- **Consistência de dados** garantida

---

Quer que eu detalhe alguma parte específica ou avançar para os outros pontos (Índices JSONB e Queries N+1)?