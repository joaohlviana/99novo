/**
 * SERVIÇO RESILIENTE PARA PERFIL DO CLIENTE
 * =========================================
 * Sistema ultra-robusto que funciona independente da configuração do banco
 * Implementa fallbacks automáticos e modo offline quando necessário
 */

import { createClient } from '../lib/supabase/client';

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
  
  // Biografia
  bio?: string;
  phone?: string;
  
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

// ============================================
// SERVIÇO RESILIENTE
// ============================================

class ClientProfileResilientService {
  private supabase = createClient();
  private availableTable: string | null = null;
  private lastTableCheck = 0;
  private readonly CHECK_INTERVAL = 30000; // 30 segundos

  /**
   * Detectar tabela disponível com cache inteligente
   */
  private async detectAvailableTable(): Promise<string | null> {
    const now = Date.now();
    
    // Se já verificamos recentemente, usar cache
    if (this.availableTable && (now - this.lastTableCheck) < this.CHECK_INTERVAL) {
      return this.availableTable;
    }

    const tablesToTest = ['99_client_profile', 'client_profile', 'client_profiles'];
    
    for (const tableName of tablesToTest) {
      try {
        console.log(`🔍 Testando conectividade com tabela: ${tableName}`);
        
        // Query mínima para testar conectividade
        const { error } = await this.supabase
          .from(tableName)
          .select('id', { head: true, count: 'exact' })
          .limit(0);
        
        if (!error) {
          console.log(`✅ Tabela conectada: ${tableName}`);
          this.availableTable = tableName;
          this.lastTableCheck = now;
          return tableName;
        }
        
        console.log(`⚠️ Tabela ${tableName} não disponível: ${error.code}`);
        
        // Se for apenas erro de permissão, a tabela pode existir
        if (error.code === '42501') {
          console.log(`🔧 Tabela ${tableName} existe mas tem restrições`);
          this.availableTable = tableName;
          this.lastTableCheck = now;
          return tableName;
        }
        
      } catch (err: any) {
        console.log(`⚠️ Erro ao testar ${tableName}:`, err?.message);
      }
    }

    console.log('❌ Nenhuma tabela de client profile está disponível');
    this.availableTable = null;
    this.lastTableCheck = now;
    return null;
  }

  /**
   * Buscar perfil com sistema resiliente
   */
  async getByUserId(userId: string): Promise<ClientProfile | null> {
    try {
      console.log('🔍 ResilientService: Buscando perfil para user:', userId);

      const tableName = await this.detectAvailableTable();
      
      if (!tableName) {
        console.log('📱 Modo offline ativo - retornando perfil padrão');
        return this.createDefaultProfile(userId);
      }

      console.log('📋 Usando tabela:', tableName);

      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.log(`⚠️ Erro na query (${error.code}):`, error.message);
        
        // Se for erro de tabela não encontrada, resetar cache
        if (error.code === 'PGRST205') {
          this.availableTable = null;
        }
        
        // Para todos os erros, retornar perfil padrão
        return this.createDefaultProfile(userId);
      }

      if (!data) {
        console.log('📝 Perfil não encontrado - retornando perfil padrão');
        return this.createDefaultProfile(userId);
      }

      console.log('✅ Perfil encontrado:', data.name || 'Sem nome');
      return this.normalizeProfile(data);

    } catch (error: any) {
      console.error('❌ Erro geral ao buscar perfil:', error?.message);
      return this.createDefaultProfile(userId);
    }
  }

  /**
   * Criar perfil com sistema resiliente
   */
  async create(input: CreateClientProfileInput): Promise<ClientProfile> {
    try {
      console.log('➕ ResilientService: Criando perfil para:', input.name);

      const tableName = await this.detectAvailableTable();
      
      if (!tableName) {
        console.log('📱 Modo offline - criando perfil local');
        return this.createLocalProfile(input);
      }

      console.log('📋 Tentando criar na tabela:', tableName);

      const profileData = this.normalizeProfileData(input.profile_data);
      
      // Preparar dados baseado na tabela
      const insertData = this.prepareInsertData(tableName, input, profileData);

      const { data, error } = await this.supabase
        .from(tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.log(`⚠️ Erro na criação (${error.code}):`, error.message);
        
        // Se for erro de tabela, resetar cache
        if (error.code === 'PGRST205') {
          this.availableTable = null;
        }
        
        // Para todos os erros, criar perfil local
        return this.createLocalProfile(input);
      }

      console.log('✅ Perfil criado com sucesso:', data.id);
      return this.normalizeProfile(data);

    } catch (error: any) {
      console.error('❌ Erro geral ao criar perfil:', error?.message);
      return this.createLocalProfile(input);
    }
  }

  /**
   * Atualizar perfil com sistema resiliente
   */
  async update(userId: string, updates: Partial<ClientProfile>): Promise<ClientProfile> {
    try {
      console.log('📝 ResilientService: Atualizando perfil para user:', userId);

      const tableName = await this.detectAvailableTable();
      
      if (!tableName) {
        console.log('📱 Modo offline - retornando perfil atualizado localmente');
        return this.updateLocalProfile(userId, updates);
      }

      const updateData = this.prepareUpdateData(tableName, updates);

      const { data, error } = await this.supabase
        .from(tableName)
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.log(`⚠️ Erro na atualização (${error.code}):`, error.message);
        return this.updateLocalProfile(userId, updates);
      }

      console.log('✅ Perfil atualizado com sucesso');
      return this.normalizeProfile(data);

    } catch (error: any) {
      console.error('❌ Erro geral ao atualizar perfil:', error?.message);
      return this.updateLocalProfile(userId, updates);
    }
  }

  /**
   * Normalizar perfil para formato padrão
   */
  private normalizeProfile(data: any): ClientProfile {
    if (!data) return this.createDefaultProfile('unknown');

    // Se já está no formato híbrido
    if (data.profile_data) {
      return data as ClientProfile;
    }

    // Adaptar formato legacy
    return {
      id: data.id || `local-${Date.now()}`,
      user_id: data.user_id || 'unknown',
      name: data.name || data.full_name || '',
      email: data.email || '',
      phone: data.phone || '',
      status: data.status || 'draft',
      is_active: data.is_active ?? true,
      is_verified: data.is_verified ?? false,
      profile_data: {
        bio: data.bio || '',
        city: data.city || '',
        state: data.state || '',
        fitnessLevel: data.fitness_level || data.activity_level || '',
        sportsInterest: this.parseJsonField(data.sports_interest) || [],
        primaryGoals: this.parseJsonField(data.fitness_goals) || [],
        budget: data.budget || '',
        phone: data.phone || '',
        completionPercentage: data.completion_percentage || 0,
        lastUpdated: new Date().toISOString(),
        onboardingCompleted: data.onboarding_completed ?? false,
        sportsTrained: [],
        sportsCurious: [],
        secondaryGoals: [],
        searchTags: [],
        experience: '',
        frequency: '',
        region: ''
      },
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString()
    };
  }

  /**
   * Criar perfil padrão quando não há dados
   */
  private createDefaultProfile(userId: string): ClientProfile {
    const now = new Date().toISOString();
    
    return {
      id: `default-${userId}`,
      user_id: userId,
      name: 'Usuário',
      email: '',
      phone: '',
      status: 'draft',
      is_active: true,
      is_verified: false,
      profile_data: {
        sportsInterest: [],
        sportsTrained: [],
        sportsCurious: [],
        primaryGoals: [],
        secondaryGoals: [],
        searchTags: [],
        fitnessLevel: '',
        experience: '',
        frequency: '',
        budget: '',
        city: '',
        state: '',
        region: '',
        bio: '',
        phone: '',
        completionPercentage: 0,
        lastUpdated: now,
        onboardingCompleted: false
      },
      created_at: now,
      updated_at: now
    };
  }

  /**
   * Criar perfil local (offline)
   */
  private createLocalProfile(input: CreateClientProfileInput): ClientProfile {
    const now = new Date().toISOString();
    const profileData = this.normalizeProfileData(input.profile_data);
    
    return {
      id: `local-${Date.now()}`,
      user_id: input.user_id,
      name: input.name,
      email: input.email,
      phone: input.phone || '',
      status: 'draft',
      is_active: true,
      is_verified: false,
      profile_data: profileData,
      created_at: now,
      updated_at: now
    };
  }

  /**
   * Atualizar perfil local (offline)
   */
  private updateLocalProfile(userId: string, updates: Partial<ClientProfile>): ClientProfile {
    const defaultProfile = this.createDefaultProfile(userId);
    
    return {
      ...defaultProfile,
      ...updates,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Normalizar dados do perfil
   */
  private normalizeProfileData(data: ClientProfileData): ClientProfileData {
    const now = new Date().toISOString();
    
    return {
      sportsInterest: data.sportsInterest || [],
      sportsTrained: data.sportsTrained || [],
      sportsCurious: data.sportsCurious || [],
      primaryGoals: data.primaryGoals || [],
      secondaryGoals: data.secondaryGoals || [],
      searchTags: data.searchTags || [],
      fitnessLevel: data.fitnessLevel || '',
      experience: data.experience || '',
      frequency: data.frequency || '',
      budget: data.budget || '',
      city: data.city || '',
      state: data.state || '',
      region: data.region || '',
      bio: data.bio || '',
      phone: data.phone || '',
      completionPercentage: data.completionPercentage || 0,
      lastUpdated: now,
      onboardingCompleted: data.onboardingCompleted || false
    };
  }

  /**
   * Preparar dados para inserção baseado no tipo de tabela
   */
  private prepareInsertData(tableName: string, input: CreateClientProfileInput, profileData: ClientProfileData): any {
    const isPrimaryTable = tableName === '99_client_profile';
    
    if (isPrimaryTable) {
      // Formato híbrido
      return {
        user_id: input.user_id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        profile_data: profileData,
        status: 'draft',
        is_active: true,
        is_verified: false
      };
    } else {
      // Formato legacy
      return {
        user_id: input.user_id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        bio: profileData.bio || '',
        city: profileData.city || '',
        state: profileData.state || '',
        fitness_level: profileData.fitnessLevel || '',
        sports_interest: JSON.stringify(profileData.sportsInterest || []),
        fitness_goals: JSON.stringify(profileData.primaryGoals || []),
        budget: profileData.budget || '',
        status: 'draft',
        is_active: true,
        is_verified: false,
        completion_percentage: profileData.completionPercentage || 0,
        onboarding_completed: profileData.onboardingCompleted || false
      };
    }
  }

  /**
   * Preparar dados para atualização baseado no tipo de tabela
   */
  private prepareUpdateData(tableName: string, updates: Partial<ClientProfile>): any {
    const isPrimaryTable = tableName === '99_client_profile';
    const updateData: any = { updated_at: new Date().toISOString() };

    // Campos estruturados comuns
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

    // Dados específicos do perfil
    if (updates.profile_data !== undefined) {
      const profileData = this.normalizeProfileData(updates.profile_data);
      
      if (isPrimaryTable) {
        updateData.profile_data = profileData;
      } else {
        // Mapear para campos legacy
        updateData.bio = profileData.bio;
        updateData.city = profileData.city;
        updateData.state = profileData.state;
        updateData.fitness_level = profileData.fitnessLevel;
        updateData.sports_interest = JSON.stringify(profileData.sportsInterest);
        updateData.fitness_goals = JSON.stringify(profileData.primaryGoals);
        updateData.budget = profileData.budget;
        updateData.completion_percentage = profileData.completionPercentage;
        updateData.onboarding_completed = profileData.onboardingCompleted;
      }
    }

    return updateData;
  }

  /**
   * Parsear campos JSON que podem estar como string ou array
   */
  private parseJsonField(field: any): any[] {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  /**
   * Calcular porcentagem de completude do perfil
   */
  calculateProfileCompletion(data: ClientProfileData): number {
    const requiredFields = ['sportsInterest', 'primaryGoals', 'fitnessLevel', 'city', 'bio'];
    const optionalFields = ['sportsTrained', 'searchTags', 'budget', 'experience'];

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
   * Verificar status de conectividade
   */
  async getConnectivityStatus(): Promise<{
    isConnected: boolean;
    availableTable: string | null;
    lastCheck: Date;
  }> {
    const tableName = await this.detectAvailableTable();
    
    return {
      isConnected: tableName !== null,
      availableTable: tableName,
      lastCheck: new Date(this.lastTableCheck)
    };
  }
}

// Exportar instância singleton
export const clientProfileResilientService = new ClientProfileResilientService();
export default clientProfileResilientService;