import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 🎯 SCROLL TO TOP AUTOMÁTICO
 * 
 * Componente que garante que todas as páginas sempre iniciem no topo
 * quando acessadas, independente da posição do scroll anterior.
 * 
 * ✅ Funciona automaticamente em todas as rotas
 * ✅ Não precisa adicionar código em cada página
 * ✅ Scroll instantâneo e suave
 * ✅ Funciona com navegação programática e direta
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll instantâneo para o topo sempre que a rota mudar
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Instantâneo, sem animação
    });

    // Fallback para browsers que não suportam 'instant'
    // Garante compatibilidade total
    setTimeout(() => {
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    }, 0);

    // Debug para desenvolvimento (remover em produção se necessário)
    console.log('📍 ScrollToTop: Navegou para', pathname, '- Posição resetada para topo');
    
  }, [pathname]);

  // Componente não renderiza nada - apenas executa o efeito
  return null;
}

/**
 * 🎯 HOOK ALTERNATIVO (opcional)
 * 
 * Hook que pode ser usado diretamente em páginas específicas
 * se precisar de comportamento customizado
 */
export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);
}