/**
 * TIPOS PARA TRAINING PROGRAMS - VERSÃO JSONB REESTRUTURADA
 * ==========================================================
 * Tipos específicos para programas de treino na estrutura JSONB otimizada
 * Compatível com ProgramCreation.tsx existente
 */

// ===============================================
// INTERFACE PRINCIPAL (compatível com ProgramCreation)
// ===============================================

export interface ProgramData {
  // IDs
  id?: string;
  trainerId?: string;
  
  // Basic Info
  title: string;
  category: string;
  modality: string;
  level: string;
  tags: string[];
  
  // Description
  description: string;
  objectives: string[];
  requirements: string[];
  whatYouGet: string[];
  
  // Structure
  duration: number;
  durationType: 'days' | 'weeks' | 'months';
  frequency: number;
  sessionDuration: number;
  schedule: Array<{
    week: number;
    sessions: Array<{
      day: string;
      focus: string;
      exercises: number;
    }>;
  }>;
  
  // Pricing
  packages: Array<{
    name: string;
    price: number;
    description: string;
    features: string[];
    deliveryTime: number;
    revisions: number | 'unlimited';
  }>;
  addOns: Array<{
    name: string;
    price: number;
    description: string;
  }>;
  
  // Gallery
  coverImage: string;
  gallery: string[];
  videos: string[];
  
  // Meta
  isPublished: boolean;
  status?: 'draft' | 'published' | 'archived' | 'suspended';
  createdAt: string;
  updatedAt: string;
  
  // Dados brutos para analytics (opcional)
  _rawRecord?: TrainingProgramRecord;
}

// ===============================================
// ESTRUTURA JSONB DA TABELA
// ===============================================

/**
 * Estrutura completa do program_data JSONB na tabela
 */
export interface TrainingProgramJsonbData {
  basic_info: {
    title: string;
    category: string;
    modality: string;
    level: string;
    duration: number;
    duration_type: 'days' | 'weeks' | 'months';
    frequency: number;
    base_price: number;
    tags: string[];
    search_keywords: string[];
  };
  description: {
    overview: string;
    short_description: string;
    objectives: string[];
    requirements: string[];
    what_you_get: string[];
    target_audience?: string;
  };
  structure: {
    session_duration: number;
    total_sessions: number;
    schedule: Array<{
      week: number;
      sessions: Array<{
        day: string;
        focus: string;
        exercises: number;
      }>;
    }>;
    modules?: Array<{
      name: string;
      description: string;
      lessons: number;
    }>;
  };
  pricing: {
    packages: Array<{
      name: string;
      price: number;
      description: string;
      features: string[];
      delivery_time: number;
      revisions: number | 'unlimited';
      is_featured?: boolean;
    }>;
    add_ons: Array<{
      name: string;
      price: number;
      description: string;
      category?: string;
    }>;
    discounts?: Array<{
      type: 'percentage' | 'fixed';
      value: number;
      min_quantity?: number;
      valid_until?: string;
    }>;
  };
  gallery: {
    cover_image: {
      url: string;
      alt: string;
    };
    images: Array<{
      url: string;
      alt: string;
      order: number;
    }>;
    videos: Array<{
      url: string;
      alt: string;
      thumbnail?: string;
      duration?: number;
    }>;
  };
  settings: {
    auto_approve: boolean;
    max_students?: number;
    difficulty_level: string;
    allow_inquiries: boolean;
    payment_required: boolean;
  };
  metadata: {
    version: string;
    last_modified_by?: string;
    last_modified_at: string;
    migration_source?: string;
    original_id?: string;
  };
  analytics: {
    views: number;
    inquiries: number;
    conversions: number;
    average_rating: number;
    reviews_count: number;
    click_through_rate?: number;
    completion_rate?: number;
  };
}

/**
 * Estrutura da tabela na base de dados (formato híbrido otimizado)
 */
export interface TrainingProgramRecord {
  id: string;
  trainer_id: string;
  is_published: boolean;
  status: 'draft' | 'published' | 'archived' | 'suspended';
  program_data: TrainingProgramJsonbData;
  created_at: string;
  updated_at: string;
}

// ===============================================
// MAPEAMENTO PARA ESTRUTURA HÍBRIDA
// ===============================================

/**
 * Converte ProgramData (formato do componente) para formato JSONB otimizado
 */
export function programDataToJsonb(data: ProgramData): {
  // Apenas campos críticos relacionais
  is_published: boolean;
  status: 'draft' | 'published' | 'archived' | 'suspended';
  
  // Todos os dados no JSONB
  program_data: TrainingProgramJsonbData;
} {
  // Calcular preço base do primeiro pacote
  const basePrice = data.packages.length > 0 ? data.packages[0].price : 0;
  
  return {
    // Campos relacionais críticos
    is_published: data.isPublished,
    status: data.isPublished ? 'published' : 'draft',
    
    // Dados JSONB completos
    program_data: {
      basic_info: {
        title: data.title,
        category: data.category,
        modality: data.modality,
        level: data.level,
        duration: data.duration,
        duration_type: data.durationType,
        frequency: data.frequency,
        base_price: basePrice,
        tags: data.tags,
        search_keywords: data.tags // usar tags como keywords por padrão
      },
      description: {
        overview: data.description,
        short_description: data.description.substring(0, 150), // resumo automático
        objectives: data.objectives,
        requirements: data.requirements,
        what_you_get: data.whatYouGet,
        target_audience: `Ideal para pessoas que buscam ${data.level.toLowerCase()} nível em ${data.category.toLowerCase()}`
      },
      structure: {
        session_duration: data.sessionDuration,
        total_sessions: data.schedule.reduce((total, week) => total + week.sessions.length, 0),
        schedule: data.schedule,
        modules: [] // pode ser expandido no futuro
      },
      pricing: {
        packages: data.packages.map((pkg, index) => ({
          name: pkg.name,
          price: pkg.price,
          description: pkg.description,
          features: pkg.features,
          delivery_time: pkg.deliveryTime,
          revisions: pkg.revisions,
          is_featured: index === 0 // primeiro pacote é featured
        })),
        add_ons: data.addOns.map(addon => ({
          name: addon.name,
          price: addon.price,
          description: addon.description,
          category: 'extra'
        })),
        discounts: [] // pode ser expandido no futuro
      },
      gallery: {
        cover_image: {
          url: data.coverImage,
          alt: data.title
        },
        images: data.gallery.map((url, index) => ({
          url,
          alt: `Imagem ${index + 1} do programa ${data.title}`,
          order: index + 1
        })),
        videos: data.videos.map((url, index) => ({
          url,
          alt: `Vídeo ${index + 1} do programa ${data.title}`,
          thumbnail: '', // pode ser adicionado no futuro
          duration: 0 // pode ser adicionado no futuro
        }))
      },
      settings: {
        auto_approve: false,
        max_students: undefined,
        difficulty_level: data.level,
        allow_inquiries: true,
        payment_required: basePrice > 0
      },
      metadata: {
        version: '1.0',
        last_modified_by: 'system',
        last_modified_at: new Date().toISOString(),
        migration_source: 'program_creation_form',
        original_id: undefined
      },
      analytics: {
        views: 0,
        inquiries: 0,
        conversions: 0,
        average_rating: 0,
        reviews_count: 0,
        click_through_rate: 0,
        completion_rate: 0
      }
    }
  };
}

/**
 * Converte formato JSONB para ProgramData (formato do componente)
 */
export function jsonbToProgramData(record: TrainingProgramRecord): ProgramData {
  const data = record.program_data;
  
  return {
    // Basic Info (do JSONB)
    title: data.basic_info?.title || '',
    category: data.basic_info?.category || '',
    modality: data.basic_info?.modality || '',
    level: data.basic_info?.level || '',
    tags: data.basic_info?.tags || [],
    
    // Description
    description: data.description?.overview || '',
    objectives: data.description?.objectives || [],
    requirements: data.description?.requirements || [],
    whatYouGet: data.description?.what_you_get || [],
    
    // Structure
    duration: data.basic_info?.duration || 12,
    durationType: data.basic_info?.duration_type || 'weeks',
    frequency: data.basic_info?.frequency || 3,
    sessionDuration: data.structure?.session_duration || 60,
    schedule: data.structure?.schedule || [],
    
    // Pricing
    packages: (data.pricing?.packages || []).map((pkg: any) => ({
      name: pkg.name || '',
      price: pkg.price || 0,
      description: pkg.description || '',
      features: pkg.features || [],
      deliveryTime: pkg.delivery_time || 0,
      revisions: pkg.revisions || 0
    })),
    addOns: (data.pricing?.add_ons || []).map((addon: any) => ({
      name: addon.name || '',
      price: addon.price || 0,
      description: addon.description || ''
    })),
    
    // Gallery
    coverImage: data.gallery?.cover_image?.url || '',
    gallery: (data.gallery?.images || []).map((img: any) => img.url || ''),
    videos: (data.gallery?.videos || []).map((video: any) => video.url || ''),
    
    // Meta
    isPublished: record.is_published || false,
    status: record.status || 'draft',
    createdAt: record.created_at || new Date().toISOString(),
    updatedAt: record.updated_at || new Date().toISOString()
  };
}

/**
 * Função auxiliar para extrair campos específicos do JSONB
 */
export function extractJsonbField<T = any>(
  programData: TrainingProgramJsonbData, 
  path: string
): T | undefined {
  const keys = path.split('.');
  let current: any = programData;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  
  return current as T;
}

// ===============================================
// TIPOS PARA FILTROS E BUSCA
// ===============================================

export interface ProgramSearchFilters {
  category?: string;
  modality?: string;
  level?: string;
  minPrice?: number;
  maxPrice?: number;
  durationMin?: number;
  durationMax?: number;
  tags?: string[];
  search?: string;
}

export interface ProgramSortOptions {
  field: 'created_at' | 'updated_at' | 'base_price' | 'duration' | 'views';
  direction: 'asc' | 'desc';
}

// ===============================================
// TIPOS PARA ESTATÍSTICAS
// ===============================================

export interface ProgramStats {
  totalPrograms: number;
  publishedPrograms: number;
  draftPrograms: number;
  totalViews: number;
  totalInquiries: number;
  totalConversions: number;
  averageRating: number;
  conversionRate: number;
}

// ===============================================
// TIPOS PARA CARDS E LISTAGENS
// ===============================================

export interface ProgramCardData {
  id: string;
  title: string;
  category: string;
  modality: string;
  level: string;
  duration: number;
  durationType: string;
  frequency: number;
  basePrice: number;
  coverImage: string;
  shortDescription: string;
  tags: string[];
  stats: {
    views: number;
    rating: number;
    reviews: number;
  };
  trainer: {
    id: string;
    name: string;
    avatar: string;
  };
  isPublished: boolean;
  createdAt: string;
}

// ===============================================
// EXPORTS
// ===============================================

export type {
  ProgramData,
  ProgramSearchFilters,
  ProgramSortOptions,
  ProgramStats,
  ProgramCardData
};