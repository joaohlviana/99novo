/**
 * 🔧 SUPABASE - PADRÃO OFICIAL SIMPLIFICADO
 * 
 * https://supabase.com/docs/guides/getting-started/quickstarts/reactjs
 */

import { supabase } from './supabase/client';

// ============================================================================
// EXPORTS - PADRÃO OFICIAL
// ============================================================================

export { supabase };

// ============================================================================
// TYPES
// ============================================================================

export interface Trainer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  location: string;
  city: string;
  state: string;
  serviceMode: 'online' | 'presencial' | 'both';
  price: number;
  experience: number;
}

export interface Program {
  id: string;
  trainerId: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
}

export interface ClientProgram {
  id: string;
  clientId: string;
  programId: string;
  trainerId: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  startDate: string;
  program?: Program;
  trainer?: Trainer;
}

// ============================================================================
// DATA FUNCTIONS - VIA SERVER API (NÃO KV STORE)
// ============================================================================

/**
 * BUSCAR PROGRAMAS DO CLIENTE
 */
export async function getClientPrograms(clientId: string): Promise<ClientProgram[]> {
  try {
    const { projectId, publicAnonKey } = await import('../utils/supabase/info');
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;
    
    const response = await fetch(`${baseUrl}/client-data/programs/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || [];
    
  } catch (error) {
    console.error('Erro ao buscar programas do cliente:', error);
    return [];
  }
}

/**
 * BUSCAR TREINADORES FAVORITOS
 */
export async function getFavoriteTrainers(clientId: string): Promise<Trainer[]> {
  try {
    const { projectId, publicAnonKey } = await import('../utils/supabase/info');
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;
    
    const response = await fetch(`${baseUrl}/client-data/favorite-trainers/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || [];
    
  } catch (error) {
    console.error('Erro ao buscar treinadores favoritos:', error);
    return [];
  }
}

/**
 * BUSCAR ESTATÍSTICAS DO CLIENTE
 */
export async function getClientStats(clientId: string) {
  try {
    const { projectId, publicAnonKey } = await import('../utils/supabase/info');
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;
    
    const response = await fetch(`${baseUrl}/client-data/stats/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || {
      activePrograms: 0,
      completedPrograms: 0,
      favoriteTrainers: 0,
      unreadMessages: 0,
      profileViews: 0,
      totalWorkouts: 0,
      weeklyGoal: 0,
      currentStreak: 0
    };
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas do cliente:', error);
    return {
      activePrograms: 0,
      completedPrograms: 0,
      favoriteTrainers: 0,
      unreadMessages: 0,
      profileViews: 0,
      totalWorkouts: 0,
      weeklyGoal: 0,
      currentStreak: 0
    };
  }
}

/**
 * BUSCAR MENSAGENS DO CLIENTE
 */
export async function getClientMessages(clientId: string) {
  try {
    const { projectId, publicAnonKey } = await import('../utils/supabase/info');
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;
    
    const response = await fetch(`${baseUrl}/client-data/messages/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || [];
    
  } catch (error) {
    console.error('Erro ao buscar mensagens do cliente:', error);
    return [];
  }
}

/**
 * BUSCAR NOVIDADES (FEED)
 */
export async function getClientNews(clientId: string) {
  try {
    const { projectId, publicAnonKey } = await import('../utils/supabase/info');
    const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e547215c`;
    
    const response = await fetch(`${baseUrl}/client-data/news/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data || [];
    
  } catch (error) {
    console.error('Erro ao buscar novidades:', error);
    return [];
  }
}