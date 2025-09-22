/**
 * SERVIÇO UNIFICADO PARA PERFIL DO CLIENTE - VERSÃO CONSOLIDADA
 * ==============================================================
 * Consolidação dos serviços client-profile duplicados em uma única implementação robusta
 * GARANTIA CRÍTICA: USA EXCLUSIVAMENTE dados do Supabase via tabelas relacionais
 * Nunca retorna mock data ou usa fallbacks offline - essencial para CLIENT-DASHBOARD
 */

import { supabase } from '../lib/supabase/client';

// ============================================
// TIPOS E INTERFACES CONSOLIDADAS
// ============================================

export interface ClientProfileData {
  // Dados de esportes
  sportsInterest?: string[];
  sportsTrained?: string[];
  sportsCurious?: string[];
  
  // Objetivos
  primaryGoals?: string[];
  secondaryGoals?: string[];
  searchTags?: string[];
  
  // Fitness
  fitnessLevel?: string;
  experience?: string;
  frequency?: string;
  budget?: string;
  
  // Localização
  city?: string;
  state?: string;
  region?: string;
  willingToTravel?: boolean;
  maxDistanceKm?: number;
  
  // Preferências
  trainingTime?: string[];
  trainingDuration?: string;
  modality?: string[];
  trainerGender?: string;
  groupOrIndividual?: string;
  
  // Saúde
  medicalConditions?: string;
  injuries?: string[];
  limitations?: string[];
  doctorClearance?: boolean;
  
  // Pessoal
  ageRange?: string;
  gender?: string;
  occupation?: string;
  lifestyle?: string;
  motivation?: string;
  
  // Disponibilidade
  daysOfWeek?: string[];
  timePeriods?: string[];
  flexibleSchedule?: boolean;
  
  // Biografia
  bio?: string;
  phone?: string;
  
  // Metas específicas
  weightGoal?: string;
  timeline?: string;
  priorityAreas?: string[];
  specificTargets?: string[];
  
  // Metadata
  completionPercentage?: number;
  lastUpdated?: string;
  onboardingCompleted?: boolean;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'draft' | 'active' | 'inactive' | 'suspended';
  is_active: boolean;
  is_verified: boolean;
  profile_data: ClientProfileData;
  created_at: string;
  updated_at: string;
}

export interface CreateClientProfileInput {
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  profile_data: ClientProfileData;
}

export interface UpdateClientProfileInput {
  name?: string;
  email?: string;
  phone?: string;
  profile_data?: Partial<ClientProfileData>;
  status?: 'draft' | 'active' | 'inactive' | 'suspended';
  is_active?: boolean;
}

// ============================================
// CLASSE DO SERVIÇO CONSOLIDADO
// ============================================

class ClientProfileUnifiedService {
  private readonly tableName = 'user_profiles';
  private readonly role = 'client';

  /**
   * CRÍTICO: Buscar perfil APENAS do Supabase - nunca retorna mock data
   */
  async getByUserId(userId: string): Promise<ClientProfile | null> {
    if (!userId?.trim()) {
      console.error('❌ ClientProfile: user_id é obrigatório');
      return null;
    }

    try {
      console.log('🔍 ClientProfileUnified: Buscando perfil do Supabase para user_id:', userId);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('role', this.role)
        .limit(1);

      if (error) {
        console.error('❌ Erro ao buscar client profile do Supabase:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log(`ℹ️ Client profile não encontrado no Supabase para user_id: ${userId}`);
        return null;
      }

      const profile = data[0] as ClientProfile;
      console.log('✅ Client profile encontrado no Supabase:', profile.name || 'Sem nome', 'ID:', profile.id);
      
      // Garantir estrutura JSONB
      return this.normalizeProfile(profile);

    } catch (error) {
      console.error(`❌ Erro crítico ao buscar client profile no Supabase para user_id: ${userId}`, error);
      return null;
    }
  }

  /**
   * CRÍTICO: Criar perfil APENAS no Supabase
   */
  async create(input: CreateClientProfileInput): Promise<ClientProfile | null> {
    if (!input.user_id?.trim()) {
      console.error('❌ ClientProfile: user_id é obrigatório para criação');
      return null;
    }

    try {
      console.log('➕ ClientProfileUnified: Criando perfil no Supabase:', input.name || 'Sem nome');

      const profileData = this.ensureDataStructure(input.profile_data || {});

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          user_id: input.user_id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          role: this.role,
          status: 'draft',
          is_active: true,
          is_verified: false,
          profile_data: profileData
        })
        .select()
        .single();

      if (error) {
        // Se foi erro de duplicata, buscar o existente do Supabase
        if (error.code === '23505') {
          console.log('⚠️ Profile já existe, buscando do Supabase...');
          return await this.getByUserId(input.user_id);
        }
        
        console.error('❌ Erro ao criar client profile no Supabase:', error);
        return null;
      }

      if (!data) {
        console.error('❌ Nenhum client profile foi criado no Supabase');
        return null;
      }

      const newProfile = data as ClientProfile;
      console.log('✅ Client profile criado no Supabase:', newProfile.id);
      return this.normalizeProfile(newProfile);

    } catch (error) {
      console.error('❌ Erro crítico ao criar client profile no Supabase:', error);
      return null;
    }
  }

  /**
   * CRÍTICO: Upsert usando APENAS dados do Supabase
   */
  async upsert(input: CreateClientProfileInput & UpdateClientProfileInput): Promise<ClientProfile | null> {
    if (!input.user_id?.trim()) {
      console.error('❌ ClientProfile: user_id é obrigatório para upsert');
      return null;
    }

    try {
      console.log('🔄 ClientProfileUnified: Executando upsert no Supabase para user_id:', input.user_id);

      const profileData = this.ensureDataStructure(input.profile_data || {});

      const fullData = {
        user_id: input.user_id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        role: this.role,
        status: input.status || 'draft',
        is_active: input.is_active !== undefined ? input.is_active : true,
        is_verified: false,
        profile_data: profileData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(fullData, {
          onConflict: ['user_id', 'role'],
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro no upsert do client profile no Supabase:', error);
        return null;
      }

      if (!data) {
        console.error('❌ Nenhum client profile foi criado/atualizado no Supabase');
        return null;
      }

      const savedProfile = data as ClientProfile;
      console.log('✅ Client profile salvo no Supabase via upsert:', savedProfile.id);
      return this.normalizeProfile(savedProfile);

    } catch (error) {
      console.error('❌ Erro crítico no upsert do client profile no Supabase:', error);
      return null;
    }
  }

  /**
   * CRÍTICO: Update usando APENAS dados do Supabase
   */
  async update(userId: string, input: UpdateClientProfileInput): Promise<ClientProfile | null> {
    if (!userId?.trim()) {
      console.error('❌ ClientProfile: user_id é obrigatório para update');
      return null;
    }

    try {
      console.log('💾 ClientProfileUnified: Atualizando perfil no Supabase...');
      
      // Usar upsert que é mais robusto e garante dados do Supabase
      const mergedInput = {
        user_id: userId,
        name: input.name || 'Cliente',
        email: input.email || '',
        ...input
      };

      return await this.upsert(mergedInput);

    } catch (error) {
      console.error('❌ Erro no update do client profile no Supabase:', error);
      return null;
    }
  }

  /**
   * Buscar clientes compatíveis APENAS do Supabase
   */
  async findCompatibleClients(
    trainerSpecialties: string[],
    trainerCity?: string,
    limit = 10
  ): Promise<Array<{
    clientId: string;
    compatibilityScore: number;
    matchingSports: string[];
    clientGoals: string[];
    clientLevel: string;
    clientCity: string;
  }>> {
    try {
      console.log('🔍 Buscando clientes compatíveis no Supabase para especialidades:', trainerSpecialties);

      const { data: profiles, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('role', this.role)
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        console.error('❌ Erro ao buscar clientes compatíveis no Supabase:', error);
        return [];
      }

      if (!profiles || profiles.length === 0) {
        console.log('ℹ️ Nenhum cliente encontrado no Supabase');
        return [];
      }

      // Processar compatibilidade usando dados reais do Supabase
      const compatibleClients = profiles
        .map(profile => {
          const sportsInterest = profile.profile_data?.sportsInterest || [];
          const matchingSports = sportsInterest.filter((sport: string) => 
            trainerSpecialties.includes(sport)
          );
          
          return {
            clientId: profile.id,
            compatibilityScore: matchingSports.length,
            matchingSports,
            clientGoals: profile.profile_data?.primaryGoals || [],
            clientLevel: profile.profile_data?.fitnessLevel || '',
            clientCity: profile.profile_data?.city || ''
          };
        })
        .filter(client => client.compatibilityScore > 0)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      console.log(`✅ Encontrados ${compatibleClients.length} clientes compatíveis no Supabase`);
      return compatibleClients;

    } catch (error) {
      console.error('❌ Erro ao buscar clientes compatíveis no Supabase:', error);
      return [];
    }
  }

  /**
   * Listar clientes ativos APENAS do Supabase
   */
  async listActiveClients(
    filters: {
      city?: string;
      fitnessLevel?: string;
      interests?: string[];
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<ClientProfile[]> {
    try {
      const { city, fitnessLevel, interests, limit = 20, offset = 0 } = filters;

      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('role', this.role)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Aplicar filtros usando JSONB do Supabase
      if (city) {
        query = query.eq('profile_data->>city', city);
      }
      if (fitnessLevel) {
        query = query.eq('profile_data->>fitnessLevel', fitnessLevel);
      }
      if (interests && interests.length > 0) {
        query = query.overlaps('profile_data->sportsInterest', interests);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao listar clientes no Supabase:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ Nenhum cliente ativo encontrado no Supabase');
        return [];
      }

      console.log(`✅ Listados ${data.length} clientes ativos do Supabase`);
      return data.map(profile => this.normalizeProfile(profile));

    } catch (error) {
      console.error('❌ Erro ao listar clientes ativos no Supabase:', error);
      return [];
    }
  }

  /**
   * Buscar perfil por ID APENAS do Supabase
   */
  async getById(id: string): Promise<ClientProfile | null> {
    if (!id?.trim()) {
      console.error('❌ ClientProfile: ID é obrigatório');
      return null;
    }

    try {
      console.log('🔍 ClientProfileUnified: Buscando por ID no Supabase:', id);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .eq('role', this.role)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`ℹ️ Client profile não encontrado no Supabase para ID: ${id}`);
          return null;
        }
        console.error('❌ Erro ao buscar client profile por ID no Supabase:', error);
        return null;
      }

      if (!data) {
        console.log(`ℹ️ Client profile não encontrado no Supabase para ID: ${id}`);
        return null;
      }

      const profile = data as ClientProfile;
      console.log('✅ Client profile encontrado por ID no Supabase:', profile.name || 'Sem nome');
      return this.normalizeProfile(profile);

    } catch (error) {
      console.error(`❌ Erro crítico ao buscar client profile por ID no Supabase: ${id}`, error);
      return null;
    }
  }

  /**
   * Obter estatísticas APENAS do Supabase
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    draft: number;
    verified: number;
  }> {
    try {
      console.log('📊 Buscando estatísticas de client profiles no Supabase');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, is_active, is_verified')
        .eq('role', this.role);

      if (error) {
        console.error('❌ Erro ao buscar estatísticas no Supabase:', error);
        return { total: 0, active: 0, draft: 0, verified: 0 };
      }

      if (!data) {
        console.log('ℹ️ Nenhum client profile encontrado para estatísticas');
        return { total: 0, active: 0, draft: 0, verified: 0 };
      }

      const stats = {
        total: data.length,
        active: data.filter(p => p.is_active && p.status === 'active').length,
        draft: data.filter(p => p.status === 'draft').length,
        verified: data.filter(p => p.is_verified).length
      };

      console.log('✅ Estatísticas obtidas do Supabase:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas no Supabase:', error);
      return { total: 0, active: 0, draft: 0, verified: 0 };
    }
  }

  /**
   * Calcular porcentagem de completude do perfil
   */
  calculateProfileCompletion(data: ClientProfileData): number {
    const requiredFields = [
      'sportsInterest',
      'primaryGoals', 
      'fitnessLevel',
      'city',
      'bio'
    ];
    
    const importantFields = [
      'trainingTime',
      'budget',
      'experience',
      'frequency'
    ];
    
    const optionalFields = [
      'sportsTrained',
      'sportsCurious',
      'secondaryGoals',
      'searchTags',
      'trainerGender',
      'medicalConditions'
    ];

    let score = 0;
    let maxScore = 0;

    // Campos obrigatórios (peso 20)
    requiredFields.forEach(field => {
      maxScore += 20;
      const value = data[field as keyof ClientProfileData];
      if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)) {
        score += 20;
      }
    });

    // Campos importantes (peso 10)
    importantFields.forEach(field => {
      maxScore += 10;
      const value = data[field as keyof ClientProfileData];
      if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)) {
        score += 10;
      }
    });

    // Campos opcionais (peso 5)
    optionalFields.forEach(field => {
      maxScore += 5;
      const value = data[field as keyof ClientProfileData];
      if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)) {
        score += 5;
      }
    });

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Normalizar perfil garantindo estrutura JSONB
   */
  private normalizeProfile(profile: any): ClientProfile {
    if (!profile) {
      throw new Error('Profile é obrigatório para normalização');
    }

    const normalized: ClientProfile = {
      id: profile.id,
      user_id: profile.user_id,
      name: profile.name || 'Cliente',
      email: profile.email || '',
      phone: profile.phone || '',
      status: profile.status || 'draft',
      is_active: profile.is_active ?? true,
      is_verified: profile.is_verified ?? false,
      profile_data: this.ensureDataStructure(profile.profile_data || {}),
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };

    // Recalcular completude
    normalized.profile_data.completionPercentage = this.calculateProfileCompletion(normalized.profile_data);
    normalized.profile_data.lastUpdated = new Date().toISOString();

    return normalized;
  }

  /**
   * Garantir estrutura básica dos dados JSONB
   */
  private ensureDataStructure(data: Partial<ClientProfileData>): ClientProfileData {
    const now = new Date().toISOString();
    
    return {
      // Arrays obrigatórios
      sportsInterest: data.sportsInterest || [],
      sportsTrained: data.sportsTrained || [],
      sportsCurious: data.sportsCurious || [],
      primaryGoals: data.primaryGoals || [],
      secondaryGoals: data.secondaryGoals || [],
      searchTags: data.searchTags || [],
      trainingTime: data.trainingTime || [],
      modality: data.modality || [],
      injuries: data.injuries || [],
      limitations: data.limitations || [],
      daysOfWeek: data.daysOfWeek || [],
      timePeriods: data.timePeriods || [],
      priorityAreas: data.priorityAreas || [],
      specificTargets: data.specificTargets || [],
      
      // Strings obrigatórias
      fitnessLevel: data.fitnessLevel || '',
      experience: data.experience || '',
      frequency: data.frequency || '',
      budget: data.budget || '',
      city: data.city || '',
      state: data.state || '',
      region: data.region || '',
      trainingDuration: data.trainingDuration || '',
      trainerGender: data.trainerGender || '',
      groupOrIndividual: data.groupOrIndividual || '',
      medicalConditions: data.medicalConditions || '',
      ageRange: data.ageRange || '',
      gender: data.gender || '',
      occupation: data.occupation || '',
      lifestyle: data.lifestyle || '',
      motivation: data.motivation || '',
      bio: data.bio || '',
      phone: data.phone || '',
      weightGoal: data.weightGoal || '',
      timeline: data.timeline || '',
      
      // Booleanos
      willingToTravel: data.willingToTravel ?? false,
      doctorClearance: data.doctorClearance ?? false,
      flexibleSchedule: data.flexibleSchedule ?? false,
      onboardingCompleted: data.onboardingCompleted ?? false,
      
      // Numéricos
      maxDistanceKm: data.maxDistanceKm || 0,
      completionPercentage: data.completionPercentage || 0,
      
      // Timestamp
      lastUpdated: now
    };
  }
}

// ============================================
// INSTÂNCIA SINGLETON CONSOLIDADA
// ============================================

export const clientProfileUnifiedService = new ClientProfileUnifiedService();
export default clientProfileUnifiedService;

// Re-exports para compatibilidade
export { clientProfileUnifiedService as clientProfileService };
export type {
  ClientProfile,
  ClientProfileData,
  CreateClientProfileInput,
  UpdateClientProfileInput
};