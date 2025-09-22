/**
 * Sports Database - Funções utilitárias para trabalhar com esportes do banco
 * Use os hooks /hooks/useSports.ts para componentes React
 */

import { supabase } from './supabase/client';

export interface DatabaseSport {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  icon_name?: string;
  cover_image_url?: string;
  icon_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Busca todos os esportes ativos do banco de dados
 * Para componentes React, use o hook useAllSports()
 */
export async function getAllSports(): Promise<DatabaseSport[]> {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar esportes:', error);
    return [];
  }
}

/**
 * Busca um esporte por ID
 */
export async function getSportById(sportId: string): Promise<DatabaseSport | null> {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('*')
      .eq('id', sportId)
      .eq('is_active', true)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar esporte por ID:', error);
    return null;
  }
}

/**
 * Busca um esporte por slug
 */
export async function getSportBySlug(slug: string): Promise<DatabaseSport | null> {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar esporte por slug:', error);
    return null;
  }
}

/**
 * Busca esportes por categoria
 */
export async function getSportsByCategory(category: string): Promise<DatabaseSport[]> {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar esportes por categoria:', error);
    return [];
  }
}

/**
 * Busca esportes por nome (busca parcial)
 */
export async function searchSportsByName(query: string): Promise<DatabaseSport[]> {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar esportes por nome:', error);
    return [];
  }
}

/**
 * Obtém todas as categorias disponíveis
 */
export async function getAvailableCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('category')
      .eq('is_active', true)
      .order('category');

    if (error) {
      throw error;
    }

    // Remove duplicatas
    const categories = [...new Set(data?.map(item => item.category) || [])];
    return categories;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}