import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BreadcrumbItem, NavigationItem } from '../types';

/**
 * 📍 NAVIGATION STORE - SIMPLIFICADO
 * 
 * Mantém apenas estados de UI de navegação que não são gerenciados pelo React Router:
 * - Breadcrumbs
 * - Menu lateral/mobile
 * - Metadados da página
 */

interface NavigationStore {
  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (item: BreadcrumbItem) => void;
  clearBreadcrumbs: () => void;
  
  // Menu de navegação
  activeMenuId: string | null;
  collapsedMenus: string[];
  setActiveMenu: (id: string | null) => void;
  toggleMenuCollapse: (id: string) => void;
  
  // Mobile navigation
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Page metadata
  pageTitle: string;
  pageDescription: string;
  setPageMeta: (title: string, description?: string) => void;
  
  // Compatibilidade com código legado
  updateLocation: (path: string, params?: Record<string, string>, query?: Record<string, string>) => void;
  addToHistory: (path: string) => void;
}

export const useNavigationStore = create<NavigationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      breadcrumbs: [],
      activeMenuId: null,
      collapsedMenus: [],
      isMobileMenuOpen: false,
      pageTitle: '',
      pageDescription: '',

      // Breadcrumbs
      setBreadcrumbs: (breadcrumbs) =>
        set({ breadcrumbs }, false, 'setBreadcrumbs'),

      addBreadcrumb: (item) =>
        set(
          (state) => ({
            breadcrumbs: [...state.breadcrumbs, item]
          }),
          false,
          'addBreadcrumb'
        ),

      clearBreadcrumbs: () =>
        set({ breadcrumbs: [] }, false, 'clearBreadcrumbs'),

      // Menu state
      setActiveMenu: (id) =>
        set({ activeMenuId: id }, false, 'setActiveMenu'),

      toggleMenuCollapse: (id) =>
        set(
          (state) => ({
            collapsedMenus: state.collapsedMenus.includes(id)
              ? state.collapsedMenus.filter(menuId => menuId !== id)
              : [...state.collapsedMenus, id]
          }),
          false,
          'toggleMenuCollapse'
        ),

      // Mobile navigation
      setMobileMenuOpen: (open) =>
        set({ isMobileMenuOpen: open }, false, 'setMobileMenuOpen'),

      // Page metadata
      setPageMeta: (title, description = '') =>
        set({ pageTitle: title, pageDescription: description }, false, 'setPageMeta'),

      // Compatibilidade com código legado (funções vazias)
      updateLocation: () => {
        // Função obsoleta - mantida apenas para compatibilidade
      },
      addToHistory: () => {
        // Função obsoleta - mantida apenas para compatibilidade
      },
    }),
    { name: 'NavigationStore' }
  )
);

// Hook para breadcrumbs
export const useBreadcrumbs = () => {
  const {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs,
  } = useNavigationStore();

  return {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs,
  };
};

// Hook para menu de navegação
export const useNavigationMenu = () => {
  const {
    activeMenuId,
    collapsedMenus,
    setActiveMenu,
    toggleMenuCollapse,
    isMobileMenuOpen,
    setMobileMenuOpen,
  } = useNavigationStore();

  return {
    activeMenuId,
    collapsedMenus,
    setActiveMenu,
    toggleMenuCollapse,
    isMobileMenuOpen,
    setMobileMenuOpen,
    isMenuCollapsed: (id: string) => collapsedMenus.includes(id),
  };
};

// Hook para metadados da página
export const usePageMeta = () => {
  const {
    pageTitle,
    pageDescription,
    setPageMeta,
  } = useNavigationStore();

  return {
    title: pageTitle,
    description: pageDescription,
    setPageMeta,
  };
};