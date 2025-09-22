/**
 * Hook para navegação SEO-friendly com slugs
 * Usado em cards, links e componentes que precisam navegar para páginas específicas
 */

import { useNavigate } from 'react-router-dom';
import { slugService } from '../services/slug.service';

export interface NavigationEntity {
  id: string;
  slug?: string;
  name?: string;
}

export function useSlugNavigation() {
  const navigate = useNavigate();

  /**
   * Navega para página de trainer usando APENAS slug válido
   * ⚠️ HIGIENE CRÍTICA: Bloqueia navegação com UUID ou slug inválido
   */
  const navigateToTrainer = (trainerSlug: string | NavigationEntity) => {
    try {
      // Normalizar entrada para slug string
      const slug = typeof trainerSlug === 'string' 
        ? trainerSlug 
        : trainerSlug.slug;

      // 🚨 TRAVAS DE SEGURANÇA
      if (!slug || typeof slug !== 'string') {
        console.error('🚨 NAVEGAÇÃO BLOQUEADA: slug não fornecido', { trainerSlug });
        console.log('🎯 Telemetria: invalid_trainer_navigation', { 
          reason: 'no_slug', 
          provided: trainerSlug 
        });
        return;
      }

      const cleanSlug = slug.trim().toLowerCase();

      // Bloquear "undefined" explícito
      if (cleanSlug.includes('undefined')) {
        console.error('🚨 NAVEGAÇÃO BLOQUEADA: slug contém "undefined"', { slug: cleanSlug });
        console.log('🎯 Telemetria: invalid_trainer_navigation', { 
          reason: 'undefined_slug', 
          slug: cleanSlug 
        });
        return;
      }

      // Bloquear slug vazio
      if (cleanSlug === '') {
        console.error('🚨 NAVEGAÇÃO BLOQUEADA: slug vazio', { originalSlug: slug });
        console.log('🎯 Telemetria: invalid_trainer_navigation', { 
          reason: 'empty_slug', 
          originalSlug: slug 
        });
        return;
      }

      // Verificar se parece com UUID (bloquear)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(cleanSlug)) {
        console.error('🚨 NAVEGAÇÃO BLOQUEADA: tentativa de navegar com UUID', { uuid: cleanSlug });
        console.log('🎯 Telemetria: invalid_trainer_navigation', { 
          reason: 'uuid_blocked', 
          uuid: cleanSlug 
        });
        return;
      }

      // ✅ NAVEGAÇÃO AUTORIZADA
      console.log('✅ Navegando para trainer:', cleanSlug);
      navigate(`/trainer/${cleanSlug}`);
      
    } catch (error) {
      console.error('🚨 ERRO na navegação de trainer:', error);
      console.log('🎯 Telemetria: invalid_trainer_navigation', { 
        reason: 'navigation_error', 
        error: error.message,
        provided: trainerSlug 
      });
    }
  };

  /**
   * Navega para página de sport usando slug
   */
  const navigateToSport = (sport: NavigationEntity) => {
    if (sport.slug) {
      navigate(`/sports/${sport.slug}`);
    } else {
      // Gerar slug do nome se disponível
      const slug = sport.name ? slugService.createSlug(sport.name) : sport.id;
      navigate(`/sports/${slug}`);
    }
  };

  /**
   * Navega para página de programa usando slug se disponível
   */
  const navigateToProgram = (program: NavigationEntity) => {
    if (program.slug) {
      navigate(`/programs/${program.slug}`);
    } else {
      // Fallback para ID - será redirecionado para slug pela página
      navigate(`/programs/${program.id}`);
    }
  };

  /**
   * Navega para catálogo com filtros opcionais
   */
  const navigateToCatalog = (filters?: {
    sport?: string;
    location?: string;
    level?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.sport) params.append('sport', filters.sport);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.level) params.append('level', filters.level);
    
    const queryString = params.toString();
    const url = queryString ? `/catalog?${queryString}` : '/catalog';
    navigate(url);
  };

  /**
   * Navega para home com scroll suave para seção específica
   */
  const navigateToHome = (section?: string) => {
    if (section) {
      navigate(`/#${section}`);
      // Scroll suave após navegação
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate('/');
    }
  };

  /**
   * Gera URL SEO-friendly para compartilhamento
   */
  const generateShareUrl = (entity: NavigationEntity, type: 'trainer' | 'sport' | 'program'): string => {
    const baseUrl = window.location.origin;
    const slug = entity.slug || entity.id;
    
    switch (type) {
      case 'trainer':
        return `${baseUrl}/trainer/${slug}`;
      case 'sport':
        return `${baseUrl}/sport/${slug}`;
      case 'program':
        return `${baseUrl}/program/${slug}`;
      default:
        return baseUrl;
    }
  };

  /**
   * Verifica se uma entidade tem slug válido
   */
  const hasValidSlug = (entity: NavigationEntity): boolean => {
    return Boolean(entity.slug && entity.slug.trim() && entity.slug !== entity.id);
  };

  /**
   * Obtém a URL recomendada para SEO
   */
  const getSeoUrl = (entity: NavigationEntity, type: 'trainer' | 'sport' | 'program'): string => {
    const slug = entity.slug || entity.id;
    
    switch (type) {
      case 'trainer':
        return `/trainer/${slug}`;
      case 'sport':
        return `/sport/${slug}`;
      case 'program':
        return `/program/${slug}`;
      default:
        return '/';
    }
  };

  return {
    navigateToTrainer,
    navigateToSport,
    navigateToProgram,
    navigateToCatalog,
    navigateToHome,
    generateShareUrl,
    hasValidSlug,
    getSeoUrl
  };
}

/**
 * Hook especializado para navegação em cards de trainers
 */
export function useTrainerCardNavigation() {
  const { navigateToTrainer, generateShareUrl, hasValidSlug } = useSlugNavigation();

  const handleTrainerClick = (trainer: NavigationEntity, event?: React.MouseEvent) => {
    // Prevenir navegação se for clique em botões internos
    if (event?.target && (event.target as HTMLElement).closest('button, a[href]')) {
      return;
    }

    // ⚠️ USAR APENAS SLUG (nunca trainer inteiro para evitar fallback por ID)
    if (trainer.slug) {
      navigateToTrainer(trainer.slug);
    } else {
      console.warn('⚠️ Card de trainer sem slug - navegação bloqueada', { trainer });
      console.log('🎯 Telemetria: invalid_trainer_navigation', { 
        reason: 'card_no_slug', 
        trainer_id: trainer.id,
        trainer_name: trainer.name 
      });
    }
  };

  const getTrainerShareUrl = (trainer: NavigationEntity): string => {
    return generateShareUrl(trainer, 'trainer');
  };

  return {
    handleTrainerClick,
    getTrainerShareUrl,
    hasValidSlug: (trainer: NavigationEntity) => hasValidSlug(trainer)
  };
}

/**
 * Hook especializado para navegação em cards de programas
 */
export function useProgramCardNavigation() {
  const { navigateToProgram, generateShareUrl, hasValidSlug } = useSlugNavigation();

  const handleProgramClick = (program: NavigationEntity, event?: React.MouseEvent) => {
    // Prevenir navegação se for clique em botões internos
    if (event?.target && (event.target as HTMLElement).closest('button, a[href]')) {
      return;
    }

    navigateToProgram(program);
  };

  const getProgramShareUrl = (program: NavigationEntity): string => {
    return generateShareUrl(program, 'program');
  };

  return {
    handleProgramClick,
    getProgramShareUrl,
    hasValidSlug: (program: NavigationEntity) => hasValidSlug(program)
  };
}