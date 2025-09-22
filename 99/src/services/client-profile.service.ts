/**
 * SERVIÇO PARA PERFIL DO CLIENTE - ARQUITETURA HÍBRIDA
 * =====================================================
 * Serviço para gerenciar perfis de clientes usando tabela híbrida
 * Baseado no padrão do trainer-profile.service.ts
 */

import { supabase } from '../lib/supabase/client';

// ============================================
// TIPOS E INTERFACES
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
  profile_data?: ClientProfileData;
  status?: 'draft' | 'active' | 'inactive' | 'suspended';
  is_active?: boolean;
}

// ============================================
// CLASSE DO SERVIÇO
// ============================================

class ClientProfileService {
  private readonly tableName = 'user_profiles';

  /**
   * Buscar perfil por user_id (SEM usar .single() que causa PGRST116)
   */
  async getByUserId(userId: string): Promise<ClientProfile | null> {
    try {
      console.log('🔍 ClientProfileService: Buscando perfil para user_id:', userId);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'client')
        .limit(1);

      if (error) {
        console.error('❌ Erro na busca:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log(`ℹ️ Nenhum client profile encontrado para user_id: ${userId}`);
        return null;
      }

      const profile = data[0] as ClientProfile;
      console.log('✅ Perfil encontrado:', profile.name || 'Sem nome', 'ID:', profile.id);
      return profile;

    } catch (error) {
      console.error(`❌ Erro ao buscar perfil para user_id: ${userId}`, error);
      return null;
    }
  }



  /**
   * Criar novo perfil
   */
  async create(input: CreateClientProfileInput): Promise<ClientProfile> {
    try {
      console.log('➕ ClientProfileService: Criando novo perfil:', input.name || 'Sem nome');

      const profileData: ClientProfileData = {
        ...input.profile_data,
        completionPercentage: this.calculateProfileCompletion(input.profile_data || {}),
        lastUpdated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          user_id: input.user_id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          role: 'client',
          status: 'draft',
          is_active: true,
          is_verified: false,
          profile_data: profileData
        })
        .select();

      if (error) {
        // Se foi erro de duplicata, buscar o existente
        if (error.code === '23505') {
          console.log('⚠️ Perfil duplicado, buscando existente...');
          const existingProfile = await this.getByUserId(input.user_id);
          if (existingProfile) {
            return existingProfile;
          }
        }
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum perfil foi criado');
      }

      const newProfile = data[0] as ClientProfile;
      console.log('✅ Perfil criado:', newProfile.id);
      return newProfile;

    } catch (error) {
      console.error('❌ Erro ao criar perfil:', error);
      throw new Error(`Erro ao criar perfil: ${error.message}`);
    }
  }

  /**
   * UPSERT NATIVO - usa funcionalidade nativa do Supabase
   */
  async upsert(input: CreateClientProfileInput & UpdateClientProfileInput): Promise<ClientProfile> {
    try {
      console.log('🔄 ClientProfileService: Executando UPSERT NATIVO para user_id:', input.user_id);

      // Preparar dados completos
      const profileData: ClientProfileData = {
        ...input.profile_data,
        completionPercentage: this.calculateProfileCompletion(input.profile_data || {}),
        lastUpdated: new Date().toISOString()
      };

      const fullData = {
        user_id: input.user_id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        status: input.status || 'draft',
        is_active: input.is_active !== undefined ? input.is_active : true,
        is_verified: false,
        profile_data: profileData,
        updated_at: new Date().toISOString()
      };

      console.log('📊 Dados para upsert:', {
        user_id: fullData.user_id,
        name: fullData.name,
        hasProfileData: !!fullData.profile_data
      });

      // Adicionar role de client
      const dataWithRole = {
        ...fullData,
        role: 'client'
      };

      // Usar upsert nativo do Supabase com constraint correta
      const { data, error } = await supabase
        .from(this.tableName)
        .upsert(dataWithRole, {
          onConflict: ['user_id', 'role'],
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error('❌ Erro no upsert nativo:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum perfil foi criado/atualizado');
      }

      const savedProfile = data[0] as ClientProfile;
      console.log('✅ Upsert nativo executado com sucesso:', savedProfile.id);
      return savedProfile;

    } catch (error) {
      console.error('❌ Erro no upsert nativo:', error);
      throw new Error(`Erro ao salvar perfil: ${error.message}`);
    }
  }

  /**
   * Atualizar perfil existente (não usado mais, mas mantido para compatibilidade)
   */
  async update(userId: string, input: UpdateClientProfileInput): Promise<ClientProfile> {
    try {
      console.log('💾 ClientProfileService: Redirecionando update para upsert...');
      
      // Redirecionar para upsert que é mais robusto
      return await this.upsert({ user_id: userId, ...input });

    } catch (error) {
      console.error('❌ Erro no update (redirecionado):', error);
      throw error;
    }
  }

  /**
   * Buscar clientes compatíveis com um treinador
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
      console.log('🔍 Buscando clientes compatíveis para especialidades:', trainerSpecialties);

      const { data: profiles, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('role', 'client')
        .eq('is_active', true)
        .limit(limit);

      if (error) {
        console.error('❌ Erro na busca:', error);
        return [];
      }

      // Processar resultados manualmente
      const compatibleClients = (profiles || [])
        .map(profile => {
          const sportsInterest = profile.profile_data?.sportsInterest || [];
          const matchingSports = sportsInterest.filter(sport => 
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
        .filter(client => client && client.compatibilityScore > 0)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      console.log(`✅ Encontrados ${compatibleClients.length} clientes compatíveis`);
      return compatibleClients;

    } catch (error) {
      console.error('❌ Erro ao buscar clientes compatíveis:', error);
      return [];
    }
  }

  /**
   * Listar clientes ativos para dashboard de trainer
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
        .eq('role', 'client')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Aplicar filtros usando JSONB
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
        console.error('❌ Erro ao listar clientes:', error);
        return [];
      }

      console.log(`✅ Listados ${data?.length || 0} clientes ativos`);
      return data as ClientProfile[] || [];

    } catch (error) {
      console.error('❌ Erro ao listar clientes ativos:', error);
      return [];
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
      'trainingTime',
      'bio'
    ];
    
    const optionalFields = [
      'sportsTrained',
      'sportsCurious',
      'secondaryGoals',
      'searchTags',
      'budget',
      'trainerGender',
      'medicalConditions'
    ];

    let score = 0;
    let maxScore = 0;

    // Campos obrigatórios (peso 15)
    requiredFields.forEach(field => {
      maxScore += 15;
      const value = data[field as keyof ClientProfileData];
      if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)) {
        score += 15;
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
   * Garantir estrutura básica dos dados JSONB
   */
  private ensureDataStructure(data: ClientProfileData): ClientProfileData {
    const now = new Date().toISOString();
    
    return {
      // Valores padrão para arrays
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
      
      // Valores existentes ou strings vazias
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
      
      // Valores booleanos
      willingToTravel: data.willingToTravel || false,
      doctorClearance: data.doctorClearance || false,
      flexibleSchedule: data.flexibleSchedule || false,
      onboardingCompleted: data.onboardingCompleted || false,
      
      // Valores numéricos
      maxDistanceKm: data.maxDistanceKm || 0,
      completionPercentage: data.completionPercentage || 0,
      
      // Timestamp
      lastUpdated: now,
      
      // Manter outros campos existentes
      ...data
    };
  }

  /**
   * Buscar perfil por ID
   */
  async getById(id: string): Promise<ClientProfile | null> {
    try {
      console.log('🔍 ClientProfileService: Buscando perfil para ID:', id);

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .limit(1);

      if (error) {
        console.error('❌ Erro na busca por ID:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log(`ℹ️ Nenhum perfil encontrado para ID: ${id}`);
        return null;
      }

      const profile = data[0] as ClientProfile;
      console.log('✅ Perfil encontrado por ID:', profile.name || 'Sem nome');
      return profile;

    } catch (error) {
      console.error(`❌ Erro ao buscar perfil por ID: ${id}`, error);
      return null;
    }
  }

  /**
   * Buscar todos os perfis (para testes)
   */
  async getAll(limit: number = 10): Promise<ClientProfile[]> {
    try {
      console.log('📋 ClientProfileService: Buscando todos os perfis (limite:', limit, ')');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} perfis`);
      return data as ClientProfile[] || [];

    } catch (error) {
      console.error('❌ Erro ao buscar todos os perfis:', error);
      throw new Error(`Erro ao buscar perfis: ${error.message}`);
    }
  }

  /**
   * Atualizar status do cliente
   */
  async updateStatus(userId: string, status: ClientProfile['status']): Promise<void> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum registro foi atualizado');
      }

      console.log(`✅ Status atualizado para: ${status}`);

    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      throw new Error(`Erro ao atualizar status: ${error.message}`);
    }
  }

  /**
   * Estatísticas gerais
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    draft: number;
    verified: number;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, is_active, is_verified')
        .eq('role', 'client');

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
      console.error('❌ Erro ao buscar estatísticas:', error);
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }
  }

  /**
   * Deletar perfil (soft delete)
   */
  async delete(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ 
          is_active: false, 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ Nenhum registro foi atualizado no soft delete');
        return; // Não é erro se já não existe
      }

      console.log('✅ Perfil desativado (soft delete)');

    } catch (error) {
      console.error('❌ Erro ao deletar perfil:', error);
      throw new Error(`Erro ao deletar perfil: ${error.message}`);
    }
  }
}

// ============================================
// INSTÂNCIA SINGLETON
// ============================================

export const clientProfileService = new ClientProfileService();
export default clientProfileService;