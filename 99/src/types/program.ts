import { ID, Timestamp, Status, ServiceMode, ExperienceLevel, FileUpload, Rating, Meta } from './common';

// Programa de treinamento
export interface Program extends Meta {
  id: ID;
  title: string;
  description: string;
  shortDescription: string;
  trainerId: ID;
  sportId: ID;
  category: ProgramCategory;
  type: ProgramType;
  level: ExperienceLevel;
  serviceMode: ServiceMode;
  duration: ProgramDuration;
  pricing: ProgramPricing;
  content: ProgramContent;
  requirements: ProgramRequirements;
  status: Status;
  isPublished: boolean;
  isFeatured: boolean;
  images: FileUpload[];
  videos?: FileUpload[];
  tags: string[];
  ratings: {
    average: number;
    count: number;
    distribution: Record<number, number>; // 1-5 stars count
  };
  enrollment: {
    current: number;
    maximum?: number;
    minimumAge?: number;
    maximumAge?: number;
  };
}

// Tipos de programa
export type ProgramType = 
  | 'individual'     // 1:1 training
  | 'group'         // small group (2-8 people)
  | 'class'         // larger class (8+ people)
  | 'course'        // structured learning path
  | 'workshop'      // one-time event
  | 'bootcamp';     // intensive short-term

// Categorias de programa
export interface ProgramCategory extends Meta {
  id: ID;
  name: string;
  description?: string;
  icon: string;
  color: string;
  parentId?: ID; // para subcategorias
  order: number;
  status: Status;
}

// Duração do programa
export interface ProgramDuration {
  type: 'session' | 'package' | 'subscription';
  sessions?: number; // número de sessões
  duration?: number; // duração em semanas/meses
  durationUnit?: 'days' | 'weeks' | 'months';
  sessionDuration: number; // duração de cada sessão em minutos
  frequency: {
    sessionsPerWeek: number;
    flexibleScheduling: boolean;
  };
}

// Preços do programa
export interface ProgramPricing {
  basePrice: number;
  currency: string;
  billingType: 'one-time' | 'weekly' | 'monthly' | 'per-session';
  packages?: ProgramPackage[];
  discounts?: ProgramDiscount[];
  trialAvailable: boolean;
  trialSessions?: number;
  refundPolicy?: string;
}

export interface ProgramPackage {
  id: ID;
  name: string;
  sessions: number;
  price: number;
  discountPercentage?: number;
  popularChoice?: boolean;
  description?: string;
}

export interface ProgramDiscount {
  id: ID;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  conditions?: {
    minimumSessions?: number;
    firstTimeClient?: boolean;
    validUntil?: Timestamp;
  };
}

// Conteúdo do programa
export interface ProgramContent {
  modules: ProgramModule[];
  materials?: FileUpload[];
  resources?: ProgramResource[];
  assessments?: ProgramAssessment[];
}

export interface ProgramModule {
  id: ID;
  title: string;
  description: string;
  order: number;
  lessons: ProgramLesson[];
  estimatedDuration: number; // em minutos
  prerequisites?: ID[]; // IDs de outros módulos
}

export interface ProgramLesson {
  id: ID;
  title: string;
  description?: string;
  type: 'video' | 'exercise' | 'reading' | 'quiz' | 'practice';
  content: string | FileUpload;
  duration: number; // em minutos
  order: number;
  isRequired: boolean;
}

export interface ProgramResource {
  id: ID;
  title: string;
  type: 'document' | 'video' | 'audio' | 'link' | 'tool';
  url: string;
  description?: string;
  downloadable: boolean;
}

export interface ProgramAssessment {
  id: ID;
  title: string;
  type: 'quiz' | 'practical' | 'submission';
  description: string;
  passingScore?: number;
  maxAttempts?: number;
  timeLimit?: number; // em minutos
}

// Requisitos do programa
export interface ProgramRequirements {
  equipment?: string[];
  experience?: ExperienceLevel;
  physicalRequirements?: string[];
  technicalRequirements?: string[];
  ageRestrictions?: {
    minimum?: number;
    maximum?: number;
  };
  healthConsiderations?: string[];
}

// Inscrição em programa
export interface ProgramEnrollment extends Meta {
  id: ID;
  programId: ID;
  clientId: ID;
  status: EnrollmentStatus;
  enrolledAt: Timestamp;
  startDate?: Timestamp;
  endDate?: Timestamp;
  progress: EnrollmentProgress;
  payment: EnrollmentPayment;
  notes?: string;
}

export type EnrollmentStatus = 
  | 'pending'     // aguardando pagamento/aprovação
  | 'active'      // em andamento
  | 'completed'   // finalizado com sucesso
  | 'cancelled'   // cancelado
  | 'paused'      // pausado temporariamente
  | 'expired';    // expirado

export interface EnrollmentProgress {
  completedSessions: number;
  totalSessions: number;
  completedModules: ID[];
  currentModule?: ID;
  completedLessons: ID[];
  assessmentScores: Record<ID, number>;
  lastActivity: Timestamp;
}

export interface EnrollmentPayment {
  status: PaymentStatus;
  amount: number;
  currency: string;
  method: string;
  transactionId?: string;
  paidAt?: Timestamp;
  refundedAt?: Timestamp;
  refundAmount?: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially-refunded';

// Filtros para programas
export interface ProgramFilters {
  trainerId?: ID;
  sportId?: ID;
  categoryId?: ID;
  type?: ProgramType;
  level?: ExperienceLevel;
  serviceMode?: ServiceMode;
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: {
    min: number; // em semanas
    max: number;
  };
  rating?: number; // mínimo
  featured?: boolean;
  hasDiscount?: boolean;
  location?: {
    city?: string;
    state?: string;
    radius?: number;
  };
  schedule?: {
    daysOfWeek?: number[];
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
  search?: string;
  sortBy?: 'popularity' | 'price' | 'rating' | 'recent' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

// Estatísticas do programa
export interface ProgramStatistics {
  programId: ID;
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  averageRating: number;
  totalRatings: number;
  revenue: number;
  conversionRate: number; // visualizações para inscrições
  views: number;
  bookmarks: number;
  shares: number;
}