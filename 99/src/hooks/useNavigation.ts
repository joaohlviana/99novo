import { useNavigate, useLocation } from 'react-router-dom';
import { identifierResolverService } from '../services/identifier-resolver.service';

/**
 * 🎯 FUNÇÃO PARA NORMALIZAR E VALIDAR SLUGS
 * Garante que slugs estejam no formato correto e remove caracteres problemáticos
 */
function normalizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    console.warn('⚠️ Slug inválido recebido:', slug);
    return '';
  }

  // Remover espaços, converter para lowercase
  let normalized = slug.trim().toLowerCase();

  // Se contém caracteres problemáticos, limpar
  if (normalized.includes('undefined') || normalized === '') {
    console.warn('⚠️ Slug contém "undefined" ou está vazio:', slug);
    return '';
  }

  // Validar formato básico de slug (só letras, números, hífens)
  if (!/^[a-z0-9-]+$/.test(normalized)) {
    console.warn('⚠️ Slug com formato inválido:', slug, '-> Normalizando...');
    
    // Tentar normalizar removendo caracteres especiais
    normalized = normalized
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Espaços para hífens
      .replace(/-+/g, '-') // Múltiplos hífens para um
      .replace(/^-+|-+$/g, ''); // Remove hífens das bordas
  }

  return normalized;
}

/**
 * 🔍 FUNÇÃO PARA VALIDAR SE UM SLUG É SEGURO PARA NAVEGAÇÃO
 */
function isValidForNavigation(identifier: string): boolean {
  if (!identifier || typeof identifier !== 'string') {
    console.error('❌ Identificador inválido para navegação:', identifier);
    identifierResolverService.getTelemetryEvents(); // Track error
    return false;
  }

  if (identifier.includes('undefined')) {
    console.error('❌ Identificador contém "undefined":', identifier);
    return false;
  }

  if (identifier.trim() === '') {
    console.error('❌ Identificador está vazio');
    return false;
  }

  return true;
}

/**
 * Hook de navegação com validação robusta de slugs
 * Usa React Router diretamente para navegação e implementa telemetria
 */
export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    // Navegação principal
    navigateToHome: () => navigate('/'),
    navigateToCatalog: () => navigate('/catalog'),
    
    /**
     * 🎯 NAVEGAÇÃO PARA TREINADOR - APENAS SLUGS VÁLIDOS
     * NUNCA aceita UUID, valida slug rigorosamente
     */
    navigateToTrainer: (slug: string) => {
      console.log('🎯 [useNavigation] Navegando para trainer slug:', slug);
      
      // ✅ PRIMEIRA VALIDAÇÃO: Verificar se é string válida
      if (!slug || typeof slug !== 'string') {
        console.error('❌ Navegação bloqueada - slug inválido:', slug);
        return;
      }

      // ✅ VALIDAÇÃO ANTI-UUID: Rejeitar qualquer formato UUID
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidPattern.test(slug.trim())) {
        console.error('❌ NAVEGAÇÃO BLOQUEADA: UUID detectado, só slugs são aceitos:', slug);
        return;
      }

      // ✅ NORMALIZAR E VALIDAR SLUG
      const normalized = normalizeSlug(slug);
      if (!normalized) {
        console.error('❌ Falha na normalização do slug:', slug);
        return;
      }

      // ✅ VALIDAÇÃO FINAL: Garantir formato de slug válido
      if (!isValidForNavigation(normalized)) {
        console.error('❌ Navegação bloqueada - slug normalizado inválido:', normalized);
        return;
      }

      // ✅ NAVEGAÇÃO APENAS COM SLUG LIMPO
      console.log('✅ Navegando para trainer slug:', normalized);
      navigate(`/trainer/${normalized}`);
    },

    navigateToProgram: (programId: string) => {
      if (!isValidForNavigation(programId)) {
        console.error('❌ Program ID inválido:', programId);
        return;
      }
      navigate(`/program/${programId}`);
    },

    navigateToSport: (sportId: string) => {
      if (!isValidForNavigation(sportId)) {
        console.error('❌ Sport ID inválido:', sportId);
        return;
      }
      navigate(`/sport/${sportId}`);
    },
    
    // Auth
    navigateToLogin: () => navigate('/login'),
    
    // Onboarding
    navigateToBecomeTrainer: () => navigate('/become-trainer'),
    navigateToBecomeClient: () => navigate('/become-client'),
    
    // Dashboards
    navigateToTrainerDashboard: () => navigate('/app/trainer'),
    navigateToClientDashboard: () => navigate('/app/client'),
    navigateToAdminDashboard: () => navigate('/app/admin'),
    
    // Programas específicos do cliente
    navigateToClientProgram: (programId: string) => {
      if (!isValidForNavigation(programId)) {
        console.error('❌ Client Program ID inválido:', programId);
        return;
      }
      navigate(`/app/client/program/${programId}`);
    },
    
    // Utilidades
    goBack: () => navigate(-1),
    navigateTo: (path: string) => navigate(path),
    navigateToCustom: (path: string) => navigate(path),
    
    // Informações da rota atual
    currentPath: location.pathname,
    currentSearch: location.search,
    currentHash: location.hash,

    // 🔍 UTILITÁRIOS DE TELEMETRIA E DEBUG
    getTelemetryMetrics: () => identifierResolverService.getTelemetryMetrics(),
    getTelemetryEvents: () => identifierResolverService.getTelemetryEvents(),
    clearTelemetry: () => identifierResolverService.clearTelemetry(),
  };
}

// Hook para compatibilidade com código existente
export const useAppNavigation = useNavigation;