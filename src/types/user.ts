import { ID, Timestamp, Status, Gender, Location, FileUpload, Meta } from './common';

// Tipos de usuário
export type UserType = 'client' | 'trainer' | 'admin';

// Interface base do usuário
export interface BaseUser extends Meta {
  id: ID;
  email: string;
  name: string;
  avatar?: FileUpload;
  phone?: string;
  dateOfBirth?: string;
  gender?: Gender;
  status: Status;
  type: UserType;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: Timestamp;
}

// Usuário Cliente
export interface Client extends BaseUser {
  type: 'client';
  profile: ClientProfile;
}

export interface ClientProfile {
  bio?: string;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  fitnessGoals: FitnessGoal[];
  sportsInterests: ID[]; // IDs dos esportes
  location?: Location;
  preferences: ClientPreferences;
}

export interface FitnessGoal {
  id: ID;
  name: string;
  description?: string;
  targetDate?: string;
  isAchieved: boolean;
}

export interface ClientPreferences {
  preferredServiceMode: 'online' | 'in-person' | 'both';
  maxDistance?: number; // km para atendimento presencial
  preferredSchedule: TimeSlot[];
  budgetRange: {
    min: number;
    max: number;
  };
  languagePreferences: string[];
  specialNeeds?: string[];
}

export interface TimeSlot {
  dayOfWeek: number; // 0-6 (domingo-sábado)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

// Usuário Treinador
export interface Trainer extends BaseUser {
  type: 'trainer';
  profile: TrainerProfile;
  statistics: TrainerStatistics;
}

export interface TrainerProfile {
  bio: string;
  specialties: ID[]; // IDs dos esportes
  serviceMode: 'online' | 'in-person' | 'both';
  experience: {
    yearsOfExperience: number;
    certifications: Certification[];
    education: Education[];
  };
  location?: Location;
  availability: TimeSlot[];
  pricing: TrainerPricing;
  gallery: FileUpload[];
  languages: string[];
  isVerified: boolean;
  verificationLevel: 'basic' | 'premium' | 'elite';
}

export interface Certification {
  id: ID;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  certificate?: FileUpload;
}

export interface Education {
  id: ID;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrentlyEnrolled: boolean;
  description?: string;
}

export interface TrainerPricing {
  basePrice: number; // por sessão
  packagePrices: {
    sessions: number;
    price: number;
    discount?: number;
  }[];
  customPricing: boolean;
}

export interface TrainerStatistics {
  totalClients: number;
  totalSessions: number;
  averageRating: number;
  totalRatings: number;
  completionRate: number;
  responseRate: number;
  joinedAt: Timestamp;
}

// Usuário Admin
export interface Admin extends BaseUser {
  type: 'admin';
  permissions: AdminPermission[];
  role: AdminRole;
}

export type AdminRole = 'super-admin' | 'moderator' | 'support' | 'content-manager';

export interface AdminPermission {
  resource: string;
  actions: string[]; // ['read', 'write', 'delete', 'moderate']
}

// Tipos para autenticação
export interface AuthUser {
  id: ID;
  email: string;
  name: string;
  avatar?: FileUpload;
  type: UserType;
  status: Status;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  type: UserType;
  phone?: string;
}

// Filtros para usuários
export interface UserFilters {
  type?: UserType;
  status?: Status;
  location?: {
    city?: string;
    state?: string;
    radius?: number;
  };
  verified?: boolean;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'lastLoginAt' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// Tipos para impersonação (admin)
export interface ImpersonationSession {
  adminId: ID;
  targetUserId: ID;
  startedAt: Timestamp;
  reason?: string;
}