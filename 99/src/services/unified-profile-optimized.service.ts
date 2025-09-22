/**
 * 🚀 SERVIÇO UNIFICADO OTIMIZADO - PÓS AUDITORIA
 * 
 * Serviço que implementa todas as otimizações da auditoria:
 * - Tabela unificada user_profiles
 * - Queries otimizadas sem N+1
 * - Índices JSONB aproveitados
 * - Functions SQL para performance máxima
 */

import { supabase } from '../lib/supabase/client';

// ============================================
// TIPOS OTIMIZADOS
// ============================================

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

export interface TrainerWithStats extends UnifiedProfile {
  total_programs: number;
  published_programs: number;
  draft_programs: number;
  total_enrollments: number;
  avg_rating: number;
  total_revenue: number;
}

export interface ClientWithCompatibility extends UnifiedProfile {
  completion_score: number;
  compatibility_score?: number;
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

export interface TrainerSearchFilters {
  specialties?: string[];
  cities?: string[];
  modalities?: string[];
  experienceYears?: string;
  minRating?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

// ============================================
// SERVIÇO PRINCIPAL OTIMIZADO
// ============================================

class UnifiedProfileOptimizedService {
  private readonly tableName = 'user_profiles';

  /**
   * ⚡ BUSCAR PERFIL POR USER_ID E ROLE - Otimizado com índices
   */
  async getByUserIdAndRole(userId: string, role: UserRole): Promise<UnifiedProfile | null> {
    try {
      console.log(`🔍 Buscando perfil ${role} para user:`, userId);

      // Usar índice idx_user_profiles_user_id
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
   * ⚡ BUSCAR TODOS OS PERFIS DE UM USUÁRIO - 1 Query
   */
  async getAllByUserId(userId: string): Promise<UnifiedProfile[]> {
    try {
      // Usar índice idx_user_profiles_user_id
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
   * 🚀 UPSERT OTIMIZADO - Funcionalidade nativa Supabase
   */
  async upsert(input: CreateProfileInput & UpdateProfileInput): Promise<UnifiedProfile> {
    try {
      console.log(`🔄 Executando upsert otimizado ${input.role} para user:`, input.user_id);

      const now = new Date().toISOString();
      const profileData = {
        ...input.profile_data,
        lastUpdated: now,
        completionPercentage: this.calculateCompletionPercentage(input.role, input.profile_data || {})
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

      // Upsert com constraint de user_id + role
      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(fullData, {
          onConflict: 'user_id,role',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro no upsert otimizado ${input.role}:`, error);
        throw error;
      }

      console.log(`✅ Upsert otimizado ${input.role} executado:`, data.id);
      return data as UnifiedProfile;

    } catch (error) {
      console.error(`❌ Erro no upsert otimizado ${input.role}:`, error);
      throw new Error(`Erro ao salvar perfil ${input.role}: ${error.message}`);
    }
  }

  /**
   * 🔥 BUSCAR TREINADORES COM ESTATÍSTICAS - Usando SQL Function
   * Elimina N+1 queries completamente
   */
  async searchTrainersWithStats(filters: TrainerSearchFilters = {}): Promise<TrainerWithStats[]> {
    try {
      console.log('🔍 Buscando treinadores com estatísticas (otimizado):', filters);

      // Usar função SQL otimizada que aproveita índices
      const { data, error } = await supabase.rpc('get_trainers_with_stats', {
        p_specialties: filters.specialties || null,
        p_cities: filters.cities || null,
        p_limit: filters.limit || 20,
        p_offset: filters.offset || 0
      });

      if (error) {
        console.error('❌ Erro na busca otimizada de treinadores:', error);
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} treinadores (otimizado)`);
      return (data as TrainerWithStats[]) || [];

    } catch (error) {
      console.error('❌ Erro na busca otimizada de treinadores:', error);
      
      // Fallback para busca manual se RPC falhar
      console.log('🔧 Usando fallback manual...');
      return await this.searchTrainersManual(filters);
    }
  }

  /**
   * 🔍 BUSCA MANUAL DE TREINADORES (Fallback) - Ainda otimizada com índices
   */
  private async searchTrainersManual(filters: TrainerSearchFilters): Promise<TrainerWithStats[]> {
    try {
      let query = supabase
        .from('trainer_dashboard_summary') // Usar view otimizada
        .select('*');

      // Aproveitar índices JSONB específicos
      if (filters.specialties?.length) {
        // Usa idx_trainer_specialties_gin
        query = query.overlaps('profile_data->specialties', filters.specialties);
      }

      if (filters.cities?.length) {
        // Usa idx_trainer_cities_gin
        query = query.overlaps('profile_data->cities', filters.cities);
      }

      if (filters.modalities?.length) {
        // Usa idx_trainer_modalities_gin
        query = query.overlaps('profile_data->modalities', filters.modalities);
      }

      if (filters.experienceYears) {
        // Usa idx_trainer_experience
        query = query.eq('profile_data->>experienceYears', filters.experienceYears);
      }

      if (filters.minRating) {
        query = query.gte('avg_rating', filters.minRating);
      }

      // Ordenação e paginação
      query = query
        .order('avg_rating', { ascending: false })
        .order('total_enrollments', { ascending: false });

      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log(`✅ Busca manual retornou ${data?.length || 0} treinadores`);
      return (data as TrainerWithStats[]) || [];

    } catch (error) {
      console.error('❌ Erro na busca manual de treinadores:', error);
      return [];
    }
  }

  /**
   * 🎯 BUSCAR CLIENTES COMPATÍVEIS - Usando SQL Function
   */
  async findCompatibleClients(
    trainerSpecialties: string[],
    trainerCity?: string,
    limit = 10
  ): Promise<ClientWithCompatibility[]> {
    try {
      console.log('🔍 Buscando clientes compatíveis (otimizado):', {
        specialties: trainerSpecialties,
        city: trainerCity,
        limit
      });

      // Usar função SQL otimizada
      const { data, error } = await supabase.rpc('find_compatible_clients', {
        p_trainer_specialties: trainerSpecialties,
        p_trainer_city: trainerCity || null,
        p_limit: limit
      });

      if (error) {
        console.error('❌ Erro na busca de clientes compatíveis:', error);
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} clientes compatíveis`);
      return (data as ClientWithCompatibility[]) || [];

    } catch (error) {
      console.error('❌ Erro na busca de clientes compatíveis:', error);
      
      // Fallback manual se RPC falhar
      return await this.findCompatibleClientsManual(trainerSpecialties, trainerCity, limit);
    }
  }

  /**
   * 🔍 BUSCA MANUAL DE CLIENTES COMPATÍVEIS (Fallback)
   */
  private async findCompatibleClientsManual(
    trainerSpecialties: string[],
    trainerCity?: string,
    limit = 10
  ): Promise<ClientWithCompatibility[]> {
    try {
      let query = supabase
        .from('client_compatibility_view') // Usar view otimizada
        .select('*');

      // Usar índices JSONB otimizados
      if (trainerSpecialties.length > 0) {
        // Usa idx_client_sports_gin
        query = query.overlaps('profile_data->sportsInterest', trainerSpecialties);
      }

      if (trainerCity) {
        // Usa idx_client_city_text
        query = query.eq('profile_data->>city', trainerCity);
      }

      query = query
        .order('completion_score', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) throw error;

      // Calcular score de compatibilidade manual
      const clientsWithScore = (data || []).map(client => ({
        ...client,
        compatibility_score: this.calculateCompatibilityScore(
          client.profile_data,
          trainerSpecialties,
          trainerCity
        )
      }));

      console.log(`✅ Busca manual retornou ${clientsWithScore.length} clientes compatíveis`);
      return clientsWithScore;

    } catch (error) {
      console.error('❌ Erro na busca manual de clientes:', error);
      return [];
    }
  }

  /**
   * 📊 BUSCAR PERFIS POR ROLE COM PAGINAÇÃO - Otimizado
   */
  async getByRole(
    role: UserRole,
    filters: {
      status?: ProfileStatus;
      is_active?: boolean;
      is_verified?: boolean;
      search?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<UnifiedProfile[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('role', role);

      // Usar índices compostos
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified);
      }

      // Full-text search usando índice GIN
      if (filters.search) {
        query = query.textSearch(
          'fts', 
          filters.search, 
          { type: 'websearch', config: 'portuguese' }
        );
      }

      // Paginação
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
      }

      query = query.order('updated_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return (data as UnifiedProfile[]) || [];

    } catch (error) {
      console.error(`❌ Erro ao buscar perfis ${role}:`, error);
      return [];
    }
  }

  /**
   * 📈 ESTATÍSTICAS POR ROLE - Usando agregações otimizadas
   */
  async getStatsByRole(role: UserRole): Promise<{
    total: number;
    active: number;
    draft: number;
    verified: number;
    completionAvg: number;
  }> {
    try {
      // Query otimizada com agregações em uma única consulta
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          id,
          is_active,
          status,
          is_verified,
          profile_data
        `)
        .eq('role', role);

      if (error) throw error;

      // Processar estatísticas no frontend (mais rápido que múltiplas queries)
      const stats = data.reduce(
        (acc, profile) => {
          acc.total++;
          if (profile.is_active && profile.status === 'active') acc.active++;
          if (profile.status === 'draft') acc.draft++;
          if (profile.is_verified) acc.verified++;
          
          const completionPercentage = profile.profile_data?.completionPercentage || 0;
          acc.completionSum += completionPercentage;
          
          return acc;
        },
        { total: 0, active: 0, draft: 0, verified: 0, completionSum: 0 }
      );

      return {
        total: stats.total,
        active: stats.active,
        draft: stats.draft,
        verified: stats.verified,
        completionAvg: stats.total > 0 ? Math.round(stats.completionSum / stats.total) : 0
      };

    } catch (error) {
      console.error(`❌ Erro ao buscar estatísticas ${role}:`, error);
      return { total: 0, active: 0, draft: 0, verified: 0, completionAvg: 0 };
    }
  }

  /**
   * 🔄 ATUALIZAR STATUS - Operação rápida
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

      if (error) throw error;

      console.log(`✅ Status atualizado para: ${status}`);

    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }
  }

  /**
   * 🗑️ SOFT DELETE - Desativação segura
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

      if (error) throw error;

      console.log('✅ Perfil desativado (soft delete)');

    } catch (error) {
      console.error('❌ Erro ao desativar perfil:', error);
      throw new Error(`Erro ao desativar perfil: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS PRIVADOS DE APOIO
  // ============================================

  /**
   * Calcular porcentagem de completude baseada no role
   */
  private calculateCompletionPercentage(role: UserRole, data: Record<string, any>): number {
    if (role === 'client') {
      const requiredFields = ['sportsInterest', 'primaryGoals', 'fitnessLevel', 'city'];
      const optionalFields = ['bio', 'phone', 'budget', 'modality'];
      
      return this.calculateFieldCompletion(data, requiredFields, optionalFields);
    } else if (role === 'trainer') {
      const requiredFields = ['specialties', 'modalities', 'cities', 'experienceYears'];
      const optionalFields = ['bio', 'phone', 'credential', 'universities', 'profilePhoto'];
      
      return this.calculateFieldCompletion(data, requiredFields, optionalFields);
    }
    
    return 0;
  }

  /**
   * Calcular completude dos campos
   */
  private calculateFieldCompletion(
    data: Record<string, any>,
    requiredFields: string[],
    optionalFields: string[]
  ): number {
    let score = 0;
    let maxScore = 0;

    // Campos obrigatórios (peso 15)
    requiredFields.forEach(field => {
      maxScore += 15;
      if (this.isFieldComplete(data[field])) {
        score += 15;
      }
    });

    // Campos opcionais (peso 5)
    optionalFields.forEach(field => {
      maxScore += 5;
      if (this.isFieldComplete(data[field])) {
        score += 5;
      }
    });

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Verificar se campo está completo
   */
  private isFieldComplete(value: any): boolean {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
  }

  /**
   * Calcular score de compatibilidade cliente-treinador
   */
  private calculateCompatibilityScore(
    clientData: Record<string, any>,
    trainerSpecialties: string[],
    trainerCity?: string
  ): number {
    let score = 0;

    // Compatibilidade de esportes (50 pontos)
    const clientSports = clientData.sportsInterest || [];
    const matchingSports = clientSports.filter((sport: string) => 
      trainerSpecialties.includes(sport)
    );
    score += Math.min(matchingSports.length * 25, 50);

    // Compatibilidade geográfica (30 pontos)
    if (trainerCity && clientData.city === trainerCity) {
      score += 30;
    }

    // Completude do perfil do cliente (20 pontos)
    const completionPercentage = clientData.completionPercentage || 0;
    if (completionPercentage > 75) {
      score += 20;
    } else if (completionPercentage > 50) {
      score += 10;
    }

    return score;
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const unifiedProfileOptimizedService = new UnifiedProfileOptimizedService();
export default unifiedProfileOptimizedService;