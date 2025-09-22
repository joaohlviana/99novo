/**
 * SERVIÇO OFFLINE PARA PERFIL DO CLIENTE
 * =====================================
 * Versão que funciona completamente sem acessar o banco de dados
 * Para usar quando há problemas de permissão
 */

import { toast } from 'sonner@2.0.3';

// Tipos simplificados
export interface OfflineClientProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  profile_data: {
    sportsInterest?: string[];
    sportsTrained?: string[];
    sportsCurious?: string[];
    primaryGoals?: string[];
    secondaryGoals?: string[];
    searchTags?: string[];
    fitnessLevel?: string;
    city?: string;
    state?: string;
    bio?: string;
    budget?: string;
    trainingTime?: string[];
    modality?: string[];
    medicalConditions?: string;
    ageRange?: string;
    gender?: string;
    [key: string]: any;
  };
  status: 'draft' | 'active' | 'inactive';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class ClientProfileOfflineService {
  private storageKey = 'client-profile-offline';

  /**
   * Buscar perfil do localStorage
   */
  async getByUserId(userId: string): Promise<OfflineClientProfile | null> {
    try {
      console.log('🔍 ClientProfileOfflineService: Buscando perfil local para user:', userId);

      const stored = localStorage.getItem(`${this.storageKey}-${userId}`);
      if (!stored) {
        console.log('📝 Nenhum perfil local encontrado');
        return null;
      }

      const profile = JSON.parse(stored) as OfflineClientProfile;
      console.log('✅ Perfil local encontrado:', profile.name);
      return profile;

    } catch (error) {
      console.error('❌ Erro ao buscar perfil local:', error);
      return null;
    }
  }

  /**
   * Criar novo perfil local
   */
  async create(input: {
    user_id: string;
    name: string;
    email: string;
    phone?: string;
    profile_data: any;
  }): Promise<OfflineClientProfile> {
    try {
      console.log('➕ ClientProfileOfflineService: Criando perfil local para:', input.name);

      const profile: OfflineClientProfile = {
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: input.user_id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        profile_data: this.ensureDataStructure(input.profile_data),
        status: 'draft',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Salvar no localStorage
      localStorage.setItem(`${this.storageKey}-${input.user_id}`, JSON.stringify(profile));
      
      console.log('✅ Perfil local criado com sucesso:', profile.id);
      return profile;

    } catch (error) {
      console.error('❌ Erro ao criar perfil local:', error);
      throw new Error(`Erro ao criar perfil local: ${error.message}`);
    }
  }

  /**
   * Atualizar perfil local
   */
  async update(userId: string, input: {
    name?: string;
    email?: string;
    phone?: string;
    profile_data?: any;
    status?: 'draft' | 'active' | 'inactive';
  }): Promise<OfflineClientProfile> {
    try {
      console.log('📝 ClientProfileOfflineService: Atualizando perfil local para:', userId);

      // Buscar perfil existente
      const existing = await this.getByUserId(userId);
      if (!existing) {
        throw new Error('Perfil local não encontrado para atualização');
      }

      // Criar perfil atualizado
      const updated: OfflineClientProfile = {
        ...existing,
        name: input.name ?? existing.name,
        email: input.email ?? existing.email,
        phone: input.phone ?? existing.phone,
        status: input.status ?? existing.status,
        profile_data: input.profile_data ? 
          this.ensureDataStructure({ ...existing.profile_data, ...input.profile_data }) :
          existing.profile_data,
        updated_at: new Date().toISOString()
      };

      // Salvar no localStorage
      localStorage.setItem(`${this.storageKey}-${userId}`, JSON.stringify(updated));
      
      console.log('✅ Perfil local atualizado com sucesso');
      return updated;

    } catch (error) {
      console.error('❌ Erro ao atualizar perfil local:', error);
      throw new Error(`Erro ao atualizar perfil local: ${error.message}`);
    }
  }

  /**
   * Calcular completude do perfil
   */
  calculateProfileCompletion(data: any): number {
    const requiredFields = [
      'sportsInterest',
      'primaryGoals', 
      'fitnessLevel',
      'city',
      'bio'
    ];
    
    const optionalFields = [
      'sportsTrained',
      'sportsCurious',
      'secondaryGoals',
      'searchTags',
      'budget',
      'trainingTime'
    ];

    let score = 0;
    let maxScore = 0;

    // Campos obrigatórios (peso 15)
    requiredFields.forEach(field => {
      maxScore += 15;
      const value = data[field];
      if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)) {
        score += 15;
      }
    });

    // Campos opcionais (peso 5)
    optionalFields.forEach(field => {
      maxScore += 5;
      const value = data[field];
      if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)) {
        score += 5;
      }
    });

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Garantir estrutura básica dos dados
   */
  private ensureDataStructure(data: any): any {
    return {
      // Arrays
      sportsInterest: data.sportsInterest || [],
      sportsTrained: data.sportsTrained || [],
      sportsCurious: data.sportsCurious || [],
      primaryGoals: data.primaryGoals || [],
      secondaryGoals: data.secondaryGoals || [],
      searchTags: data.searchTags || [],
      trainingTime: data.trainingTime || [],
      modality: data.modality || [],
      
      // Strings
      fitnessLevel: data.fitnessLevel || '',
      city: data.city || '',
      state: data.state || '',
      bio: data.bio || '',
      budget: data.budget || '',
      medicalConditions: data.medicalConditions || '',
      ageRange: data.ageRange || '',
      gender: data.gender || '',
      
      // Timestamp
      lastUpdated: new Date().toISOString(),
      
      // Manter outros campos
      ...data
    };
  }

  /**
   * Buscar clientes compatíveis (simulado)
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
    // Simular busca com dados mock
    console.log('🔍 Simulando busca de clientes compatíveis (modo offline)');
    
    const mockClients = [
      {
        clientId: 'mock-client-1',
        compatibilityScore: 3,
        matchingSports: trainerSpecialties.slice(0, 2),
        clientGoals: ['Emagrecimento', 'Condicionamento'],
        clientLevel: 'intermediario',
        clientCity: trainerCity || 'São Paulo'
      },
      {
        clientId: 'mock-client-2', 
        compatibilityScore: 2,
        matchingSports: trainerSpecialties.slice(0, 1),
        clientGoals: ['Hipertrofia', 'Força'],
        clientLevel: 'avancado',
        clientCity: trainerCity || 'Rio de Janeiro'
      }
    ];

    return mockClients.filter(client => client.compatibilityScore > 0);
  }

  /**
   * Listar clientes ativos (simulado)
   */
  async listActiveClients(filters: any = {}): Promise<OfflineClientProfile[]> {
    console.log('📋 Simulando listagem de clientes (modo offline)');
    return []; // Retornar array vazio no modo offline
  }

  /**
   * Verificar se há dados pendentes de sincronização
   */
  hasPendingSync(userId: string): boolean {
    const stored = localStorage.getItem(`${this.storageKey}-${userId}`);
    return !!stored;
  }

  /**
   * Exportar dados para sincronização futura
   */
  exportForSync(userId: string): OfflineClientProfile | null {
    const stored = localStorage.getItem(`${this.storageKey}-${userId}`);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Limpar dados locais após sincronização
   */
  clearAfterSync(userId: string): void {
    localStorage.removeItem(`${this.storageKey}-${userId}`);
    console.log('🧹 Dados locais limpos após sincronização');
  }
}

// Singleton
export const clientProfileOfflineService = new ClientProfileOfflineService();
export default clientProfileOfflineService;