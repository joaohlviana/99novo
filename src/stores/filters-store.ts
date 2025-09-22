import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  ProgramFilters, 
  UserFilters, 
  SportFilters, 
  ID, 
  ServiceMode, 
  ExperienceLevel 
} from '../types';

interface FiltersStore {
  // Program filters
  programFilters: ProgramFilters;
  setProgramFilters: (filters: Partial<ProgramFilters>) => void;
  resetProgramFilters: () => void;
  
  // User/Trainer filters
  userFilters: UserFilters;
  setUserFilters: (filters: Partial<UserFilters>) => void;
  resetUserFilters: () => void;
  
  // Sport filters
  sportFilters: SportFilters;
  setSportFilters: (filters: Partial<SportFilters>) => void;
  resetSportFilters: () => void;
  
  // Global filter state
  activeFiltersCount: () => number;
  hasActiveFilters: () => boolean;
  resetAllFilters: () => void;
  
  // Quick filters (commonly used combinations)
  applyQuickFilter: (type: QuickFilterType, value?: any) => void;
  
  // Filter history (for back navigation)
  filterHistory: FilterSnapshot[];
  saveFilterSnapshot: (name: string) => void;
  restoreFilterSnapshot: (name: string) => void;
  clearFilterHistory: () => void;
}

interface FilterSnapshot {
  name: string;
  timestamp: string;
  programFilters: ProgramFilters;
  userFilters: UserFilters;
  sportFilters: SportFilters;
}

type QuickFilterType = 
  | 'online-only'
  | 'in-person-only'
  | 'beginner-friendly'
  | 'featured-programs'
  | 'free-programs'
  | 'premium-trainers'
  | 'high-rated'
  | 'recently-added';

const initialProgramFilters: ProgramFilters = {
  sortBy: 'popularity',
  sortOrder: 'desc',
};

const initialUserFilters: UserFilters = {
  sortBy: 'rating',
  sortOrder: 'desc',
};

const initialSportFilters: SportFilters = {};

export const useFiltersStore = create<FiltersStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      programFilters: initialProgramFilters,
      userFilters: initialUserFilters,
      sportFilters: initialSportFilters,
      filterHistory: [],

      // Program filters
      setProgramFilters: (filters) =>
        set(
          (state) => ({
            programFilters: { ...state.programFilters, ...filters }
          }),
          false,
          'setProgramFilters'
        ),

      resetProgramFilters: () =>
        set({ programFilters: initialProgramFilters }, false, 'resetProgramFilters'),

      // User filters
      setUserFilters: (filters) =>
        set(
          (state) => ({
            userFilters: { ...state.userFilters, ...filters }
          }),
          false,
          'setUserFilters'
        ),

      resetUserFilters: () =>
        set({ userFilters: initialUserFilters }, false, 'resetUserFilters'),

      // Sport filters
      setSportFilters: (filters) =>
        set(
          (state) => ({
            sportFilters: { ...state.sportFilters, ...filters }
          }),
          false,
          'setSportFilters'
        ),

      resetSportFilters: () =>
        set({ sportFilters: initialSportFilters }, false, 'resetSportFilters'),

      // Global filter operations
      activeFiltersCount: () => {
        const { programFilters, userFilters, sportFilters } = get();
        
        let count = 0;
        
        // Count non-default program filters
        Object.entries(programFilters).forEach(([key, value]) => {
          if (key === 'sortBy' || key === 'sortOrder') return;
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value) && value.length > 0) count++;
            else if (typeof value === 'object' && Object.keys(value).length > 0) count++;
            else if (!Array.isArray(value) && typeof value !== 'object') count++;
          }
        });
        
        // Count non-default user filters
        Object.entries(userFilters).forEach(([key, value]) => {
          if (key === 'sortBy' || key === 'sortOrder') return;
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value) && value.length > 0) count++;
            else if (typeof value === 'object' && Object.keys(value).length > 0) count++;
            else if (!Array.isArray(value) && typeof value !== 'object') count++;
          }
        });
        
        // Count sport filters
        Object.entries(sportFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value) && value.length > 0) count++;
            else if (typeof value === 'object' && Object.keys(value).length > 0) count++;
            else if (!Array.isArray(value) && typeof value !== 'object') count++;
          }
        });
        
        return count;
      },

      hasActiveFilters: () => get().activeFiltersCount() > 0,

      resetAllFilters: () =>
        set(
          {
            programFilters: initialProgramFilters,
            userFilters: initialUserFilters,
            sportFilters: initialSportFilters,
          },
          false,
          'resetAllFilters'
        ),

      // Quick filters
      applyQuickFilter: (type, value) => {
        const { setProgramFilters, setUserFilters } = get();
        
        switch (type) {
          case 'online-only':
            setProgramFilters({ serviceMode: 'online' });
            setUserFilters({ verified: true });
            break;
            
          case 'in-person-only':
            setProgramFilters({ serviceMode: 'in-person' });
            break;
            
          case 'beginner-friendly':
            setProgramFilters({ level: 'beginner' });
            break;
            
          case 'featured-programs':
            setProgramFilters({ featured: true });
            break;
            
          case 'free-programs':
            setProgramFilters({ 
              priceRange: { min: 0, max: 0 } 
            });
            break;
            
          case 'premium-trainers':
            setUserFilters({ verified: true });
            break;
            
          case 'high-rated':
            setProgramFilters({ rating: 4.5 });
            setUserFilters({ sortBy: 'rating', sortOrder: 'desc' });
            break;
            
          case 'recently-added':
            setProgramFilters({ sortBy: 'recent', sortOrder: 'desc' });
            break;
        }
      },

      // Filter history
      saveFilterSnapshot: (name) => {
        const { programFilters, userFilters, sportFilters, filterHistory } = get();
        
        const snapshot: FilterSnapshot = {
          name,
          timestamp: new Date().toISOString(),
          programFilters: { ...programFilters },
          userFilters: { ...userFilters },
          sportFilters: { ...sportFilters },
        };
        
        const newHistory = [
          snapshot,
          ...filterHistory.filter(s => s.name !== name)
        ].slice(0, 10); // Manter apenas 10 snapshots
        
        set({ filterHistory: newHistory }, false, 'saveFilterSnapshot');
      },

      restoreFilterSnapshot: (name) => {
        const { filterHistory } = get();
        const snapshot = filterHistory.find(s => s.name === name);
        
        if (snapshot) {
          set(
            {
              programFilters: snapshot.programFilters,
              userFilters: snapshot.userFilters,
              sportFilters: snapshot.sportFilters,
            },
            false,
            'restoreFilterSnapshot'
          );
        }
      },

      clearFilterHistory: () =>
        set({ filterHistory: [] }, false, 'clearFilterHistory'),
    }),
    { name: 'FiltersStore' }
  )
);

// Hooks especializados para cada tipo de filtro
export const useProgramFilters = () => {
  const { programFilters, setProgramFilters, resetProgramFilters } = useFiltersStore();
  
  return {
    filters: programFilters,
    setFilters: setProgramFilters,
    resetFilters: resetProgramFilters,
    // Helpers específicos
    setSport: (sportId: ID) => setProgramFilters({ sportId }),
    setLevel: (level: ExperienceLevel) => setProgramFilters({ level }),
    setServiceMode: (mode: ServiceMode) => setProgramFilters({ serviceMode }),
    setPriceRange: (min: number, max: number) => 
      setProgramFilters({ priceRange: { min, max } }),
    setRating: (rating: number) => setProgramFilters({ rating }),
    setSearch: (search: string) => setProgramFilters({ search }),
  };
};

export const useTrainerFilters = () => {
  const { userFilters, setUserFilters, resetUserFilters } = useFiltersStore();
  
  return {
    filters: userFilters,
    setFilters: setUserFilters,
    resetFilters: resetUserFilters,
    // Helpers específicos
    setLocation: (city: string, state: string, radius?: number) =>
      setUserFilters({ location: { city, state, radius } }),
    setVerified: (verified: boolean) => setUserFilters({ verified }),
    setSearch: (search: string) => setUserFilters({ search }),
  };
};

export const useQuickFilters = () => {
  const { applyQuickFilter, activeFiltersCount, resetAllFilters } = useFiltersStore();
  
  return {
    applyQuickFilter,
    activeCount: activeFiltersCount(),
    resetAll: resetAllFilters,
    
    // Predefined quick filters
    quickFilters: [
      { type: 'online-only' as QuickFilterType, label: 'Online apenas' },
      { type: 'in-person-only' as QuickFilterType, label: 'Presencial apenas' },
      { type: 'beginner-friendly' as QuickFilterType, label: 'Para iniciantes' },
      { type: 'featured-programs' as QuickFilterType, label: 'Programas em destaque' },
      { type: 'high-rated' as QuickFilterType, label: 'Bem avaliados' },
      { type: 'recently-added' as QuickFilterType, label: 'Adicionados recentemente' },
    ],
  };
};