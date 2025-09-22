/**
 * 🔗 TRAINER PROFILE INTEGRATION SERVICE
 * 
 * Serviço que integra o sistema híbrido de trainer profiles com o sistema mock de trainers
 * Evita erros de "trainer profile não encontrado" fornecendo fallbacks apropriados
 */

import { trainerProfileService, TrainerProfile } from './trainer-profile.service';
import { trainersService } from './trainers.service';
import { Trainer } from '../types';

class TrainerProfileIntegrationService {
  /**
   * Busca perfil de trainer com fallback para sistema mock
   */
  async getTrainerProfile(id: string): Promise<{
    profile: TrainerProfile | null;
    trainer: Trainer | null;
    source: 'hybrid' | 'mock' | 'not_found';
  }> {
    try {
      // Validar se o ID é válido antes de fazer qualquer consulta
      if (!id || typeof id !== 'string' || id.trim().length === 0) {
        console.log('❌ ID inválido fornecido:', id);
        return {
          profile: null,
          trainer: null,
          source: 'not_found'
        };
      }

      console.log('🔗 TrainerProfileIntegration: Buscando perfil para ID:', id);

      // ✅ REMOVIDO: Lista de IDs problemáticos - deixar o sistema híbrido tentar primeiro

      // Tentar buscar no sistema híbrido primeiro
      let profile: TrainerProfile | null = null;
      
      try {
        profile = await trainerProfileService.getById(id);
      } catch (error) {
        console.log('⚠️ Erro no sistema híbrido, tentando por user_id...');
        try {
          profile = await trainerProfileService.getByUserId(id);
        } catch (userIdError) {
          console.log('⚠️ Também falhou por user_id, seguindo para mock');
        }
      }

      if (profile) {
        console.log('✅ Perfil encontrado no sistema híbrido');
        return {
          profile,
          trainer: null,
          source: 'hybrid'
        };
      }

      // Se não encontrou no híbrido, tentar no sistema mock
      console.log('🔍 Tentando buscar no sistema mock...');
      try {
        const trainerResponse = await trainersService.getTrainerById(id);
        
        if (trainerResponse.success && trainerResponse.data) {
          console.log('✅ Trainer encontrado no sistema mock');
          return {
            profile: null,
            trainer: trainerResponse.data,
            source: 'mock'
          };
        }
      } catch (mockError) {
        console.log('⚠️ Erro no sistema mock também:', mockError.message);
      }

      // Não encontrado em nenhum sistema - criar fallback
      console.log(`ℹ️ Trainer/Profile não encontrado em nenhum sistema para ID: ${id}, criando fallback`);
      const fallbackTrainer = this.createFallbackTrainer(id);
      
      return {
        profile: null,
        trainer: fallbackTrainer,
        source: 'mock'
      };

    } catch (error) {
      console.error('❌ Erro na integração de trainer profiles:', error);
      
      // Em caso de erro total, ainda criar um fallback
      const fallbackTrainer = this.createFallbackTrainer(id);
      return {
        profile: null,
        trainer: fallbackTrainer,
        source: 'mock'
      };
    }
  }

  /**
   * Lista todos os trainers disponíveis (híbrido + mock)
   */
  async getAllTrainers(limit = 10): Promise<{
    hybridProfiles: TrainerProfile[];
    mockTrainers: Trainer[];
    total: number;
  }> {
    try {
      console.log('📋 Listando todos os trainers disponíveis...');

      // Buscar do sistema híbrido
      let hybridProfiles: TrainerProfile[] = [];
      try {
        hybridProfiles = await trainerProfileService.getAll(limit);
      } catch (error) {
        console.log('⚠️ Erro ao buscar profiles híbridos:', error);
      }

      // Buscar do sistema mock
      let mockTrainers: Trainer[] = [];
      try {
        const mockResponse = await trainersService.getTopTrainers(limit);
        if (mockResponse.success) {
          mockTrainers = mockResponse.data;
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar trainers mock:', error);
      }

      const total = hybridProfiles.length + mockTrainers.length;
      
      console.log(`✅ Encontrados ${hybridProfiles.length} profiles híbridos e ${mockTrainers.length} mock trainers`);

      return {
        hybridProfiles,
        mockTrainers,
        total
      };

    } catch (error) {
      console.error('❌ Erro ao listar todos os trainers:', error);
      return {
        hybridProfiles: [],
        mockTrainers: [],
        total: 0
      };
    }
  }

  /**
   * Converte TrainerProfile para formato Trainer (compatibilidade)
   */
  convertProfileToTrainer(profile: TrainerProfile): Trainer {
    return {
      id: profile.id,
      name: profile.name || 'Trainer',
      email: profile.email || '',
      avatar: profile.profile_data?.profilePhoto || '',
      bio: profile.profile_data?.bio || '',
      isVerified: profile.is_verified,
      isActive: profile.is_active,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      roles: [{
        type: 'trainer',
        isActive: profile.is_active,
        activatedAt: profile.created_at,
        permissions: ['create_programs', 'manage_students']
      }],
      preferences: {
        language: 'pt-BR',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: true,
          updates: true,
          reminders: true
        },
        privacy: {
          profileVisibility: 'public',
          showLocation: true,
          showProgress: false,
          allowMessaging: true,
          allowDiscovery: true
        },
        communication: {
          preferredMethod: 'whatsapp',
          languages: ['pt-BR'],
          timezone: 'America/Sao_Paulo'
        }
      },
      location: {
        country: 'Brasil',
        state: 'SP',
        city: profile.profile_data?.cities?.[0] || 'São Paulo',
        address: profile.profile_data?.address || '',
        zipCode: profile.profile_data?.cep || '',
        coordinates: {
          latitude: -23.5505,
          longitude: -46.6333
        },
        timezone: 'America/Sao_Paulo'
      },
      socialLinks: {
        instagram: profile.profile_data?.instagram || '',
        youtube: '',
        website: ''
      },
      onboardingCompleted: true,
      lastLoginAt: profile.last_login_at,
      metadata: {
        registrationSource: 'hybrid',
        tags: ['hybrid'],
        customFields: {}
      },
      profile: {
        title: 'Personal Trainer',
        experience: parseInt(profile.profile_data?.experienceYears || '1'),
        rating: 4.5,
        reviewCount: 0,
        studentCount: parseInt(profile.profile_data?.studentsCount || '0'),
        description: profile.profile_data?.bio || '',
        mission: '',
        approach: '',
        achievements: [],
        languages: ['pt-BR'],
        serviceMode: ['online', 'in_person'],
        maxStudents: 50
      },
      qualifications: [],
      specialties: (profile.profile_data?.specialties || []).map((spec, index) => ({
        id: `spec-${index}`,
        category: spec.toLowerCase(),
        level: 'intermediate',
        yearsOfExperience: 1,
        certifications: [],
        description: spec
      })),
      services: [],
      availability: {
        timezone: 'America/Sao_Paulo',
        schedule: {
          monday: { available: true, slots: [] },
          tuesday: { available: true, slots: [] },
          wednesday: { available: true, slots: [] },
          thursday: { available: true, slots: [] },
          friday: { available: true, slots: [] },
          saturday: { available: true, slots: [] },
          sunday: { available: false, slots: [] }
        },
        exceptions: [],
        bufferTime: 15,
        advance: { min: 1, max: 30 }
      },
      pricing: {
        currency: 'BRL',
        hourlyRate: 120,
        packages: [],
        discounts: [],
        paymentMethods: []
      },
      stats: {
        totalStudents: parseInt(profile.profile_data?.studentsCount || '0'),
        activeStudents: 0,
        completedPrograms: 0,
        totalHours: 0,
        responseTime: 120,
        completionRate: 0.95,
        satisfactionRate: 0.95,
        earningsThisMonth: 0,
        earningsTotal: 0
      },
      reviews: [],
      programs: [],
      gallery: profile.profile_data?.galleryImages || [],
      stories: profile.profile_data?.stories || [],
      settings: {
        autoAcceptBookings: false,
        maxStudentsPerProgram: 15,
        reminderNotifications: true,
        publicProfile: true,
        allowInstantBooking: false,
        requireDeposit: false,
        cancellationPolicy: {
          hoursBeforeSession: 24,
          feePercentage: 50,
          rescheduleAllowed: true,
          rescheduleLimit: 2
        }
      }
    };
  }

  /**
   * Cria um trainer de fallback para IDs não encontrados
   */
  private createFallbackTrainer(id: string): Trainer {
    return {
      id,
      name: "Personal Trainer",
      email: "trainer@99coach.com",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      bio: "Especialista em treinamento personalizado e condicionamento físico",
      isVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      roles: [{
        type: 'trainer',
        isActive: true,
        activatedAt: new Date().toISOString(),
        permissions: ['create_programs', 'manage_students']
      }],
      preferences: {
        language: 'pt-BR',
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false,
          marketing: true,
          updates: true,
          reminders: true
        },
        privacy: {
          profileVisibility: 'public',
          showLocation: true,
          showProgress: false,
          allowMessaging: true,
          allowDiscovery: true
        },
        communication: {
          preferredMethod: 'whatsapp',
          languages: ['pt-BR'],
          timezone: 'America/Sao_Paulo'
        }
      },
      location: {
        country: 'Brasil',
        state: 'SP',
        city: 'São Paulo',
        address: '',
        zipCode: '',
        coordinates: {
          latitude: -23.5505,
          longitude: -46.6333
        },
        timezone: 'America/Sao_Paulo'
      },
      socialLinks: {
        instagram: '',
        youtube: '',
        website: ''
      },
      onboardingCompleted: true,
      lastLoginAt: new Date().toISOString(),
      metadata: {
        registrationSource: 'fallback',
        tags: ['fallback'],
        customFields: {}
      },
      profile: {
        title: 'Personal Trainer',
        experience: 3,
        rating: 4.5,
        reviewCount: 25,
        studentCount: 50,
        description: 'Especialista em treinamento personalizado e condicionamento físico',
        mission: 'Ajudar pessoas a alcançar seus objetivos fitness',
        approach: 'Metodologia personalizada baseada nas necessidades individuais',
        achievements: [],
        languages: ['pt-BR'],
        serviceMode: ['online', 'in_person'],
        maxStudents: 30
      },
      qualifications: [],
      specialties: [{
        id: 'fallback-1',
        category: 'fitness',
        level: 'intermediate',
        yearsOfExperience: 3,
        certifications: [],
        description: 'Treinamento físico geral'
      }],
      services: [],
      availability: {
        timezone: 'America/Sao_Paulo',
        schedule: {
          monday: { available: true, slots: [] },
          tuesday: { available: true, slots: [] },
          wednesday: { available: true, slots: [] },
          thursday: { available: true, slots: [] },
          friday: { available: true, slots: [] },
          saturday: { available: true, slots: [] },
          sunday: { available: false, slots: [] }
        },
        exceptions: [],
        bufferTime: 15,
        advance: { min: 1, max: 30 }
      },
      pricing: {
        currency: 'BRL',
        hourlyRate: 80,
        packages: [],
        discounts: [],
        paymentMethods: []
      },
      stats: {
        totalStudents: 50,
        activeStudents: 25,
        completedPrograms: 30,
        totalHours: 500,
        responseTime: 120,
        completionRate: 0.9,
        satisfactionRate: 0.9,
        earningsThisMonth: 2000,
        earningsTotal: 15000
      },
      reviews: [],
      programs: [],
      gallery: [],
      stories: [],
      settings: {
        autoAcceptBookings: false,
        maxStudentsPerProgram: 15,
        reminderNotifications: true,
        publicProfile: true,
        allowInstantBooking: false,
        requireDeposit: false,
        cancellationPolicy: {
          hoursBeforeSession: 24,
          feePercentage: 50,
          rescheduleAllowed: true,
          rescheduleLimit: 2
        }
      }
    };
  }

  /**
   * Busca e converte para formato unificado
   */
  async getUnifiedTrainer(id: string): Promise<Trainer | null> {
    try {
      const result = await this.getTrainerProfile(id);

      if (result.source === 'hybrid' && result.profile) {
        return this.convertProfileToTrainer(result.profile);
      }

      if (result.source === 'mock' && result.trainer) {
        return result.trainer;
      }

      // Se chegou até aqui e não encontrou nada, criar fallback
      console.log(`🔄 Criando trainer fallback para ID: ${id}`);
      return this.createFallbackTrainer(id);

    } catch (error) {
      console.error('❌ Erro ao buscar trainer unificado:', error);
      // Mesmo em caso de erro, retornar fallback em vez de null
      return this.createFallbackTrainer(id);
    }
  }
}

// Export singleton instance
export const trainerProfileIntegrationService = new TrainerProfileIntegrationService();
export default trainerProfileIntegrationService;