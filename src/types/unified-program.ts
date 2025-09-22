/**
 * TIPOS UNIFICADOS PARA PROGRAMAS - ARQUITETURA PADRONIZADA
 * ========================================================
 * Sistema consolidado para todos os cards e componentes de programa
 * Sempre usar estes tipos em qualquer lugar que exibir programas
 */

// ===============================================
// TIPOS BASE PADRONIZADOS
// ===============================================

export interface UnifiedTrainerData {
  id: string;
  name: string;
  avatar: string | null;
  initials: string;
  slug?: string;
  bio?: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
  location?: {
    city: string;
    state: string;
  };
}

export interface UnifiedProgramMedia {
  coverImage: string | null;
  galleryImages: string[];
  videos?: string[];
}

export interface UnifiedProgramStats {
  views: number;
  enrollments: number;
  rating: number;
  reviewCount: number;
  likes: number;
  popularity?: number;
}

export interface UnifiedProgramPricing {
  basePrice: number;
  currency: string;
  packages?: Array<{
    name: string;
    price: number;
    features: string[];
    description: string;
    deliveryTime: number;
    revisions: number;
  }>;
}

export interface UnifiedProgramContent {
  title: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  requirements: string[];
  objectives: string[];
  whatYouGet: string[];
  tags: string[];
}

export interface UnifiedProgramDetails {
  category: string;
  modality: 'online' | 'presencial' | 'hibrido';
  level: 'iniciante' | 'intermediario' | 'avancado';
  duration: number;
  durationType: 'weeks' | 'months' | 'days';
  frequency?: number; // vezes por semana
  intensity?: number; // 1-10
  difficulty?: number; // 1-10
  hoursPerWeek?: number;
  // Esporte principal do programa
  primarySport?: {
    id: string;
    name: string;
    slug: string;
    icon_url?: string;
  };
}

export interface UnifiedProgramFlags {
  isPublished: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  status: 'draft' | 'published' | 'archived' | 'suspended';
}

// ===============================================
// TIPO PRINCIPAL UNIFICADO
// ===============================================

export interface UnifiedProgramData {
  // Identificação
  id: string;
  trainerId: string;
  
  // Dados do Trainer (sempre buscar do user_profile)
  trainer: UnifiedTrainerData;
  
  // Conteúdo
  content: UnifiedProgramContent;
  
  // Detalhes técnicos
  details: UnifiedProgramDetails;
  
  // Mídia
  media: UnifiedProgramMedia;
  
  // Preços
  pricing: UnifiedProgramPricing;
  
  // Estatísticas
  stats: UnifiedProgramStats;
  
  // Flags de controle
  flags: UnifiedProgramFlags;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ===============================================
// TIPOS PARA DIFERENTES CONTEXTOS
// ===============================================

// Para cards compactos (home, catálogo)
export interface UnifiedProgramCardData {
  id: string;
  trainer: Pick<UnifiedTrainerData, 'id' | 'name' | 'avatar' | 'initials' | 'slug'>;
  content: Pick<UnifiedProgramContent, 'title' | 'shortDescription'>;
  details: Pick<UnifiedProgramDetails, 'category' | 'level' | 'duration' | 'durationType' | 'modality' | 'primarySport'>;
  media: Pick<UnifiedProgramMedia, 'coverImage'>;
  pricing: Pick<UnifiedProgramPricing, 'basePrice' | 'currency'>;
  stats: Pick<UnifiedProgramStats, 'rating' | 'reviewCount' | 'enrollments'>;
  flags: Pick<UnifiedProgramFlags, 'isPublished' | 'isActive' | 'isFeatured'>;
}

// Para cards de dashboard (mais completos)
export interface UnifiedProgramDashboardData extends UnifiedProgramCardData {
  content: Pick<UnifiedProgramContent, 'title' | 'shortDescription' | 'tags'>;
  stats: UnifiedProgramStats;
  flags: UnifiedProgramFlags;
}

// Para detalhes completos
export interface UnifiedProgramDetailData extends UnifiedProgramData {
  // Dados completos
}

// ===============================================
// TIPOS PARA OPERAÇÕES
// ===============================================

export interface UnifiedProgramFilters {
  trainer_id?: string;
  category?: string;
  modality?: UnifiedProgramDetails['modality'];
  level?: UnifiedProgramDetails['level'];
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  tags?: string[];
  search?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  // Filtro por esporte
  sport?: string;
  primarySport?: string;
}

export interface UnifiedProgramCreateData {
  trainerId: string;
  content: Omit<UnifiedProgramContent, 'tags'> & { tags?: string[] };
  details: UnifiedProgramDetails;
  media: Partial<UnifiedProgramMedia>;
  pricing: UnifiedProgramPricing;
  flags: Partial<UnifiedProgramFlags>;
}

export interface UnifiedProgramUpdateData {
  content?: Partial<UnifiedProgramContent>;
  details?: Partial<UnifiedProgramDetails>;
  media?: Partial<UnifiedProgramMedia>;
  pricing?: Partial<UnifiedProgramPricing>;
  flags?: Partial<UnifiedProgramFlags>;
}

// ===============================================
// ADAPTADORES PARA DADOS LEGADOS
// ===============================================

export interface LegacyProgramRecord {
  id: string;
  trainer_id: string;
  title: string;
  category: string;
  modality: string;
  level: string;
  duration: number;
  duration_type: string;
  frequency: number;
  base_price: string;
  is_published: boolean;
  status: string;
  program_data: any;
  created_at: string;
  updated_at: string;
}

// ===============================================
// TIPOS PARA VARIANTES DE CARD
// ===============================================

export type ProgramCardVariant = 
  | 'compact'        // Card pequeno para carousels
  | 'standard'       // Card padrão para grids
  | 'detailed'       // Card com mais informações
  | 'dashboard'      // Card para dashboard com controles
  | 'featured'       // Card destacado/hero
  | 'list';          // Card formato lista

export type ProgramCardContext = 
  | 'public'         // Páginas públicas
  | 'dashboard'      // Dashboard do trainer
  | 'client'         // Dashboard do cliente
  | 'admin'          // Dashboard do admin
  | 'catalog';       // Catálogo/busca

// ===============================================
// TIPOS PARA AÇÕES
// ===============================================

export interface UnifiedProgramActions {
  onView?: (programId: string) => void;
  onEdit?: (programId: string) => void;
  onDuplicate?: (programId: string) => void;
  onDelete?: (programId: string) => void;
  onToggleActive?: (programId: string, isActive: boolean) => void;
  onToggleFeatured?: (programId: string, isFeatured: boolean) => void;
  onNavigateToProgram?: (programId: string) => void;
  onNavigateToTrainer?: (trainerId: string) => void;
  onEnroll?: (programId: string) => void;
  onLike?: (programId: string) => void;
  onShare?: (programId: string) => void;
}

// ===============================================
// TIPOS PARA AVATAR MANAGEMENT
// ===============================================

export interface UnifiedAvatarData {
  userId: string;
  avatar: string | null;
  name: string;
  initials: string;
}

// ===============================================
// EXPORTS
// ===============================================

export type {
  UnifiedProgramData,
  UnifiedProgramCardData,
  UnifiedProgramDashboardData,
  UnifiedProgramDetailData,
  UnifiedTrainerData,
  UnifiedProgramActions,
  UnifiedProgramFilters,
  UnifiedProgramCreateData,
  UnifiedProgramUpdateData,
  LegacyProgramRecord,
  ProgramCardVariant,
  ProgramCardContext
};