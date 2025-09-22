import { ID, Timestamp, Status, FileUpload, Meta } from './common';

// Esporte
export interface Sport extends Meta {
  id: ID;
  name: string;
  description?: string;
  icon: string; // nome do ícone
  category: SportCategory;
  status: Status;
  isPopular: boolean;
  equipment?: string[];
  skillLevels: SkillLevel[];
  calories: {
    low: number;    // calorias/hora para intensidade baixa
    medium: number; // calorias/hora para intensidade média
    high: number;   // calorias/hora para intensidade alta
  };
  benefits: string[];
  images?: FileUpload[];
}

// Categorias de esporte
export interface SportCategory extends Meta {
  id: ID;
  name: string;
  description?: string;
  icon: string;
  color: string; // cor hexadecimal
  order: number; // ordem de exibição
  status: Status;
}

// Níveis de habilidade
export interface SkillLevel {
  id: ID;
  name: string;
  description: string;
  order: number;
}

// Especialidades do treinador (relacionamento com esportes)
export interface TrainerSpecialty extends Meta {
  id: ID;
  trainerId: ID;
  sportId: ID;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number;
  certifications?: ID[]; // IDs das certificações relacionadas
  achievements?: string[];
  isMainSpecialty: boolean;
}

// Filtros para esportes
export interface SportFilters {
  categoryId?: ID;
  popular?: boolean;
  status?: Status;
  search?: string;
  hasTrainers?: boolean; // se tem treinadores disponíveis
  equipment?: string[];
  skillLevel?: string;
  calorieRange?: {
    min: number;
    max: number;
  };
}

// Estatísticas de esporte
export interface SportStatistics {
  sportId: ID;
  totalTrainers: number;
  totalPrograms: number;
  totalClients: number;
  averageRating: number;
  popularityScore: number; // baseado em buscas e contratações
  trendingScore: number; // crescimento recente
}