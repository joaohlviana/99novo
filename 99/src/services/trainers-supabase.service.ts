/**
 * 🧑‍🏫 TRAINERS SUPABASE SERVICE
 * 
 * Service real que se conecta ao Supabase para buscar dados de treinadores.
 * Substitui o service mock com dados reais do banco.
 */

import { supabase } from '../lib/supabase/client';
import { 
  Trainer, 
  ServiceResponse,
  PaginationParams
} from '../types';

export class TrainersSupabaseService {
  private static instance: TrainersSupabaseService;
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  static getInstance(): TrainersSupabaseService {
    if (!TrainersSupabaseService.instance) {
      TrainersSupabaseService.instance = new TrainersSupabaseService();
    }
    return TrainersSupabaseService.instance;
  }

  /**
   * Busca treinador por ID no banco real
   */
  async getTrainerById(trainerId: string): Promise<ServiceResponse<Trainer | null>> {
    try {
      console.log('🔍 [TRAINERS SUPABASE] Buscando trainer por ID:', trainerId);

      // Verificar cache primeiro
      const cacheKey = `trainer_${trainerId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('✅ [TRAINERS SUPABASE] Trainer encontrado no cache');
        return { success: true, data: cached };
      }

      // Buscar na view trainers_with_slugs primeiro
      const { data: trainerProfile, error: profileError } = await supabase
        .from('trainers_with_slugs')
        .select(`
          id,
          user_id,
          name,
          email,
          phone,
          role,
          is_active,
          is_verified,
          profile_data,
          slug,
          created_at,
          updated_at
        `)
        .eq('user_id', trainerId)
        .single();

      if (profileError) {
        console.warn('⚠️ [TRAINERS SUPABASE] Erro ao buscar trainer_profile:', profileError.message);
        
        // Fallback: retornar erro ao invés de tentar auth.users
        console.error('❌ [TRAINERS SUPABASE] Trainer não encontrado nas views disponíveis');
        return { 
          success: false, 
          error: { 
            message: 'Trainer não encontrado',
            code: 'TRAINER_NOT_FOUND'
          } 
        };

      }

      // Processar dados da view trainers_with_slugs
      const profileData = trainerProfile.profile_data || {};
      
      const trainer: Trainer = {
        id: trainerProfile.user_id,
        name: trainerProfile.name || profileData.name || profileData.full_name || 'Treinador',
        email: trainerProfile.email || profileData.email || '',
        avatar: profileData.avatar || profileData.avatar_url || profileData.picture || '',
        bio: profileData.bio || profileData.description || 'Treinador especializado',
        isVerified: profileData.isVerified || false,
        isActive: profileData.isActive !== false,
        createdAt: trainerProfile.created_at,
        updatedAt: trainerProfile.updated_at,
        roles: profileData.roles || [{ 
          type: 'trainer', 
          isActive: true, 
          activatedAt: trainerProfile.created_at, 
          permissions: ['create_programs', 'manage_students'] 
        }],
        preferences: profileData.preferences || {
          language: 'pt-BR',
          theme: 'light',
          notifications: {
            email: true, push: true, sms: false, marketing: true, updates: true, reminders: true
          },
          privacy: {
            profileVisibility: 'public', showLocation: true, showProgress: false,
            allowMessaging: true, allowDiscovery: true
          },
          communication: {
            preferredMethod: 'whatsapp', languages: ['pt-BR'], timezone: 'America/Sao_Paulo'
          }
        },
        location: profileData.location || {
          country: 'Brasil',
          state: 'São Paulo',
          city: 'São Paulo',
          address: '',
          zipCode: '',
          coordinates: { latitude: -23.5505, longitude: -46.6333 },
          timezone: 'America/Sao_Paulo'
        },
        socialLinks: profileData.socialLinks || {},
        onboardingCompleted: profileData.onboardingCompleted !== false,
        lastLoginAt: profileData.lastLoginAt || trainerProfile.updated_at,
        metadata: profileData.metadata || { 
          registrationSource: 'platform', 
          tags: [], 
          customFields: {} 
        },
        profile: {
          title: profileData.title || 'Treinador',
          experience: profileData.experience || 1,
          rating: profileData.rating || 4.5,
          reviewCount: profileData.reviewCount || 0,
          studentCount: profileData.studentCount || 0,
          description: profileData.description || profileData.bio || 'Treinador especializado',
          mission: profileData.mission || 'Ajudar pessoas a alcançarem seus objetivos',
          approach: profileData.approach || 'Metodologia personalizada',
          achievements: profileData.achievements || [],
          languages: profileData.languages || ['pt-BR'],
          serviceMode: profileData.serviceMode || ['online'],
          maxStudents: profileData.maxStudents || 10,
          ...profileData.profile
        },
        qualifications: profileData.qualifications || [],
        specialties: profileData.specialties || [],
        services: profileData.services || [],
        availability: profileData.availability || {
          timezone: 'America/Sao_Paulo',
          schedule: {
            monday: { available: true, slots: [] },
            tuesday: { available: true, slots: [] },
            wednesday: { available: true, slots: [] },
            thursday: { available: true, slots: [] },
            friday: { available: true, slots: [] },
            saturday: { available: false, slots: [] },
            sunday: { available: false, slots: [] }
          },
          exceptions: [],
          bufferTime: 15,
          advance: { min: 1, max: 30 }
        },
        pricing: profileData.pricing || {
          currency: 'BRL',
          hourlyRate: 100,
          packages: [],
          discounts: [],
          paymentMethods: [{ type: 'pix', enabled: true }]
        },
        stats: profileData.stats || {
          totalStudents: 0,
          activeStudents: 0,
          completedPrograms: 0,
          totalHours: 0,
          responseTime: 24,
          completionRate: 0,
          satisfactionRate: 0,
          earningsThisMonth: 0,
          earningsTotal: 0
        },
        reviews: profileData.reviews || [],
        programs: profileData.programs || [],
        gallery: profileData.gallery || [],
        stories: profileData.stories || [],
        settings: profileData.settings || {
          autoAcceptBookings: false,
          maxStudentsPerProgram: 10,
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

      console.log('✅ [TRAINERS SUPABASE] Trainer completo encontrado:', trainer.name);
      this.setCache(cacheKey, trainer);
      return { success: true, data: trainer };

    } catch (error) {
      console.error('❌ [TRAINERS SUPABASE] Erro inesperado:', error);
      return { 
        success: false, 
        error: { 
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        } 
      };
    }
  }

  /**
   * Cache helpers
   */
  private getFromCache(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  private setCache(key: string, value: any): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }
}

// Export singleton instance
export const trainersSupabaseService = TrainersSupabaseService.getInstance();