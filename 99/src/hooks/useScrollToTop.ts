import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 🎯 HOOK SCROLL TO TOP
 * 
 * Hook personalizado para scroll ao topo com opções avançadas.
 * Use este hook em páginas específicas que precisam de comportamento customizado.
 * 
 * @param options - Opções de configuração
 */
interface UseScrollToTopOptions {
  /** Comportamento do scroll: 'instant' | 'smooth' | 'auto' */
  behavior?: ScrollBehavior;
  /** Delay em milissegundos antes do scroll */
  delay?: number;
  /** Se deve fazer scroll em toda mudança de rota ou apenas na primeira carga */
  onRouteChange?: boolean;
  /** Callback executado após o scroll */
  onScrollComplete?: () => void;
}

export function useScrollToTop(options: UseScrollToTopOptions = {}) {
  const {
    behavior = 'instant',
    delay = 0,
    onRouteChange = true,
    onScrollComplete
  } = options;
  
  const { pathname } = useLocation();

  useEffect(() => {
    if (!onRouteChange) return;

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior
      });

      // Fallback para garantir compatibilidade
      if (behavior === 'instant') {
        setTimeout(() => {
          if (window.scrollY > 0) {
            window.scrollTo(0, 0);
          }
          onScrollComplete?.();
        }, 0);
      } else {
        // Para smooth, aguardar um pouco mais
        setTimeout(() => {
          onScrollComplete?.();
        }, 500);
      }
    };

    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timeoutId);
    } else {
      scrollToTop();
    }
  }, [pathname, behavior, delay, onRouteChange, onScrollComplete]);
}

/**
 * 🎯 SCROLL TO TOP MANUAL
 * 
 * Função utilitária para fazer scroll manual ao topo
 */
export function scrollToTop(behavior: ScrollBehavior = 'instant') {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });

  // Fallback para garantia
  if (behavior === 'instant') {
    setTimeout(() => {
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    }, 0);
  }
}

/**
 * 🎯 SCROLL TO ELEMENT
 * 
 * Função utilitária para fazer scroll para um elemento específico
 */
export function scrollToElement(
  elementId: string, 
  behavior: ScrollBehavior = 'smooth',
  offset: number = 0
) {
  const element = document.getElementById(elementId);
  if (element) {
    const top = element.offsetTop - offset;
    window.scrollTo({
      top,
      left: 0,
      behavior
    });
  }
}