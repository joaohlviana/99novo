import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  workoutsService,
  Exercise,
  WorkoutTemplate,
  WorkoutProgram,
  WorkoutSession,
  CreateWorkoutRequest,
  WorkoutFilters,
  ExerciseFilters,
  ExerciseLog
} from '../services/workouts.service';

interface WorkoutsState {
  // Data
  exercises: Exercise[];
  workoutTemplates: WorkoutTemplate[];
  workoutPrograms: WorkoutProgram[];
  workoutSessions: WorkoutSession[];
  
  // Current selections
  selectedExercise: Exercise | null;
  selectedTemplate: WorkoutTemplate | null;
  selectedProgram: WorkoutProgram | null;
  activeSession: WorkoutSession | null;
  
  // UI State
  loading: {
    exercises: boolean;
    templates: boolean;
    programs: boolean;
    sessions: boolean;
    creating: boolean;
    saving: boolean;
  };
  errors: {
    exercises?: string;
    templates?: string;
    programs?: string;
    sessions?: string;
    creating?: string;
    saving?: string;
  };
  
  // Filters & Search
  exerciseFilters: ExerciseFilters;
  workoutFilters: WorkoutFilters;
  searchQuery: string;
  
  // Analytics
  analytics: {
    totalWorkouts: number;
    totalDuration: number;
    averageDuration: number;
    caloriesBurned: number;
    favoriteExercises: { exerciseId: string; count: number; name: string }[];
    workoutFrequency: { date: string; count: number }[];
    progressTrend: { week: number; completedWorkouts: number }[];
  } | null;
}

interface WorkoutsActions {
  // Exercises
  loadExercises: (filters?: ExerciseFilters) => Promise<void>;
  getExercise: (exerciseId: string) => Promise<Exercise | null>;
  createExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise | null>;
  setSelectedExercise: (exercise: Exercise | null) => void;
  
  // Workout Templates
  loadWorkoutTemplates: (filters?: WorkoutFilters) => Promise<void>;
  getWorkoutTemplate: (templateId: string) => Promise<WorkoutTemplate | null>;
  createWorkoutTemplate: (request: CreateWorkoutRequest) => Promise<WorkoutTemplate | null>;
  updateWorkoutTemplate: (templateId: string, updates: Partial<WorkoutTemplate>) => Promise<void>;
  deleteWorkoutTemplate: (templateId: string) => Promise<void>;
  setSelectedTemplate: (template: WorkoutTemplate | null) => void;
  
  // Workout Programs
  loadWorkoutPrograms: (filters?: { trainerId?: string; clientId?: string; status?: string }) => Promise<void>;
  createWorkoutProgram: (program: Omit<WorkoutProgram, 'id'>) => Promise<WorkoutProgram | null>;
  setSelectedProgram: (program: WorkoutProgram | null) => void;
  
  // Workout Sessions
  loadWorkoutSessions: (filters?: {
    userId?: string;
    trainerId?: string;
    programId?: string;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }) => Promise<void>;
  startWorkoutSession: (templateId: string, programId?: string) => WorkoutSession;
  completeWorkoutSession: (sessionId: string, logs: ExerciseLog[], notes?: string, rating?: number) => Promise<void>;
  setActiveSession: (session: WorkoutSession | null) => void;
  
  // Analytics
  loadAnalytics: (userId: string, period?: '7d' | '30d' | '90d') => Promise<void>;
  
  // Search & Filters
  setExerciseFilters: (filters: Partial<ExerciseFilters>) => void;
  setWorkoutFilters: (filters: Partial<WorkoutFilters>) => void;
  setSearchQuery: (query: string) => void;
  
  // Utilities
  clearErrors: () => void;
  resetState: () => void;
}

const initialState: WorkoutsState = {
  exercises: [],
  workoutTemplates: [],
  workoutPrograms: [],
  workoutSessions: [],
  selectedExercise: null,
  selectedTemplate: null,
  selectedProgram: null,
  activeSession: null,
  loading: {
    exercises: false,
    templates: false,
    programs: false,
    sessions: false,
    creating: false,
    saving: false,
  },
  errors: {},
  exerciseFilters: {},
  workoutFilters: {},
  searchQuery: '',
  analytics: null,
};

export const useWorkoutsStore = create<WorkoutsState & WorkoutsActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Exercises
    loadExercises: async (filters?: ExerciseFilters) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, exercises: true },
        errors: { ...state.errors, exercises: undefined }
      }));

      try {
        const exercises = await workoutsService.getExercises(filters);
        set(state => ({ 
          ...state, 
          exercises,
          loading: { ...state.loading, exercises: false }
        }));
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, exercises: false },
          errors: { ...state.errors, exercises: error instanceof Error ? error.message : 'Erro ao carregar exercícios' }
        }));
      }
    },

    getExercise: async (exerciseId: string) => {
      try {
        // Check if exercise is already in state
        const existing = get().exercises.find(ex => ex.id === exerciseId);
        if (existing) return existing;
        
        // Load from service
        const exercise = await workoutsService.getExercise(exerciseId);
        if (exercise && !get().exercises.find(ex => ex.id === exercise.id)) {
          set(state => ({
            ...state,
            exercises: [...state.exercises, exercise]
          }));
        }
        
        return exercise;
      } catch (error) {
        console.error('Error getting exercise:', error);
        return null;
      }
    },

    createExercise: async (exercise: Omit<Exercise, 'id'>) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, creating: true },
        errors: { ...state.errors, creating: undefined }
      }));

      try {
        const newExercise = await workoutsService.createExercise(exercise);
        
        set(state => ({ 
          ...state, 
          exercises: [newExercise, ...state.exercises],
          loading: { ...state.loading, creating: false }
        }));
        
        return newExercise;
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, creating: false },
          errors: { ...state.errors, creating: error instanceof Error ? error.message : 'Erro ao criar exercício' }
        }));
        return null;
      }
    },

    setSelectedExercise: (exercise: Exercise | null) => {
      set({ selectedExercise: exercise });
    },

    // Workout Templates
    loadWorkoutTemplates: async (filters?: WorkoutFilters) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, templates: true },
        errors: { ...state.errors, templates: undefined }
      }));

      try {
        const templates = await workoutsService.getWorkoutTemplates(filters);
        set(state => ({ 
          ...state, 
          workoutTemplates: templates,
          loading: { ...state.loading, templates: false }
        }));
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, templates: false },
          errors: { ...state.errors, templates: error instanceof Error ? error.message : 'Erro ao carregar templates' }
        }));
      }
    },

    getWorkoutTemplate: async (templateId: string) => {
      try {
        const existing = get().workoutTemplates.find(t => t.id === templateId);
        if (existing) return existing;
        
        const template = await workoutsService.getWorkoutTemplate(templateId);
        if (template && !get().workoutTemplates.find(t => t.id === template.id)) {
          set(state => ({
            ...state,
            workoutTemplates: [...state.workoutTemplates, template]
          }));
        }
        
        return template;
      } catch (error) {
        console.error('Error getting workout template:', error);
        return null;
      }
    },

    createWorkoutTemplate: async (request: CreateWorkoutRequest) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, creating: true },
        errors: { ...state.errors, creating: undefined }
      }));

      try {
        const template = await workoutsService.createWorkoutTemplate(request);
        
        set(state => ({ 
          ...state, 
          workoutTemplates: [template, ...state.workoutTemplates],
          loading: { ...state.loading, creating: false }
        }));
        
        return template;
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, creating: false },
          errors: { ...state.errors, creating: error instanceof Error ? error.message : 'Erro ao criar template' }
        }));
        return null;
      }
    },

    updateWorkoutTemplate: async (templateId: string, updates: Partial<WorkoutTemplate>) => {
      try {
        const updated = await workoutsService.updateWorkoutTemplate(templateId, updates);
        
        if (updated) {
          set(state => ({
            ...state,
            workoutTemplates: state.workoutTemplates.map(t =>
              t.id === templateId ? updated : t
            ),
            selectedTemplate: state.selectedTemplate?.id === templateId ? updated : state.selectedTemplate
          }));
        }
      } catch (error) {
        console.error('Error updating workout template:', error);
      }
    },

    deleteWorkoutTemplate: async (templateId: string) => {
      try {
        await workoutsService.deleteWorkoutTemplate(templateId);
        
        set(state => ({
          ...state,
          workoutTemplates: state.workoutTemplates.filter(t => t.id !== templateId),
          selectedTemplate: state.selectedTemplate?.id === templateId ? null : state.selectedTemplate
        }));
      } catch (error) {
        console.error('Error deleting workout template:', error);
      }
    },

    setSelectedTemplate: (template: WorkoutTemplate | null) => {
      set({ selectedTemplate: template });
    },

    // Workout Programs
    loadWorkoutPrograms: async (filters?: { trainerId?: string; clientId?: string; status?: string }) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, programs: true },
        errors: { ...state.errors, programs: undefined }
      }));

      try {
        const programs = await workoutsService.getWorkoutPrograms(filters);
        set(state => ({ 
          ...state, 
          workoutPrograms: programs,
          loading: { ...state.loading, programs: false }
        }));
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, programs: false },
          errors: { ...state.errors, programs: error instanceof Error ? error.message : 'Erro ao carregar programas' }
        }));
      }
    },

    createWorkoutProgram: async (program: Omit<WorkoutProgram, 'id'>) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, creating: true },
        errors: { ...state.errors, creating: undefined }
      }));

      try {
        const newProgram = await workoutsService.createWorkoutProgram(program);
        
        set(state => ({ 
          ...state, 
          workoutPrograms: [newProgram, ...state.workoutPrograms],
          loading: { ...state.loading, creating: false }
        }));
        
        return newProgram;
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, creating: false },
          errors: { ...state.errors, creating: error instanceof Error ? error.message : 'Erro ao criar programa' }
        }));
        return null;
      }
    },

    setSelectedProgram: (program: WorkoutProgram | null) => {
      set({ selectedProgram: program });
    },

    // Workout Sessions
    loadWorkoutSessions: async (filters?) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, sessions: true },
        errors: { ...state.errors, sessions: undefined }
      }));

      try {
        const sessions = await workoutsService.getWorkoutSessions(filters);
        set(state => ({ 
          ...state, 
          workoutSessions: sessions,
          loading: { ...state.loading, sessions: false }
        }));
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, sessions: false },
          errors: { ...state.errors, sessions: error instanceof Error ? error.message : 'Erro ao carregar sessões' }
        }));
      }
    },

    startWorkoutSession: (templateId: string, programId?: string) => {
      const template = get().workoutTemplates.find(t => t.id === templateId);
      
      if (!template) {
        throw new Error('Template não encontrado');
      }

      const newSession: WorkoutSession = {
        id: `session_${Date.now()}`,
        workoutId: templateId,
        userId: 'current_user',
        trainerId: template.createdBy,
        programId,
        scheduledDate: new Date(),
        status: 'in_progress',
        exercises: template.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          plannedSets: ex.sets,
          plannedReps: ex.reps,
          plannedDuration: ex.duration,
          completedSets: 0,
          logs: []
        }))
      };

      set(state => ({
        ...state,
        workoutSessions: [newSession, ...state.workoutSessions],
        activeSession: newSession
      }));

      return newSession;
    },

    completeWorkoutSession: async (sessionId: string, logs: ExerciseLog[], notes?: string, rating?: number) => {
      set(state => ({ 
        ...state, 
        loading: { ...state.loading, saving: true },
        errors: { ...state.errors, saving: undefined }
      }));

      try {
        const completed = await workoutsService.completeWorkoutSession(sessionId, logs, notes, rating);
        
        if (completed) {
          set(state => ({
            ...state,
            workoutSessions: state.workoutSessions.map(s =>
              s.id === sessionId ? completed : s
            ),
            activeSession: state.activeSession?.id === sessionId ? completed : state.activeSession,
            loading: { ...state.loading, saving: false }
          }));
        }
      } catch (error) {
        set(state => ({ 
          ...state, 
          loading: { ...state.loading, saving: false },
          errors: { ...state.errors, saving: error instanceof Error ? error.message : 'Erro ao completar sessão' }
        }));
      }
    },

    setActiveSession: (session: WorkoutSession | null) => {
      set({ activeSession: session });
    },

    // Analytics
    loadAnalytics: async (userId: string, period: '7d' | '30d' | '90d' = '30d') => {
      try {
        const analytics = await workoutsService.getWorkoutAnalytics(userId, period);
        set({ analytics });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    },

    // Search & Filters
    setExerciseFilters: (filters: Partial<ExerciseFilters>) => {
      set(state => ({
        ...state,
        exerciseFilters: { ...state.exerciseFilters, ...filters }
      }));
    },

    setWorkoutFilters: (filters: Partial<WorkoutFilters>) => {
      set(state => ({
        ...state,
        workoutFilters: { ...state.workoutFilters, ...filters }
      }));
    },

    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
    },

    // Utilities
    clearErrors: () => {
      set(state => ({ ...state, errors: {} }));
    },

    resetState: () => {
      set(initialState);
    },
  }))
);

// Selectors for performance optimization
export const useExercises = () => useWorkoutsStore(state => state.exercises);
export const useWorkoutTemplates = () => useWorkoutsStore(state => state.workoutTemplates);
export const useWorkoutPrograms = () => useWorkoutsStore(state => state.workoutPrograms);
export const useWorkoutSessions = () => useWorkoutsStore(state => state.workoutSessions);
export const useSelectedExercise = () => useWorkoutsStore(state => state.selectedExercise);
export const useSelectedTemplate = () => useWorkoutsStore(state => state.selectedTemplate);
export const useActiveSession = () => useWorkoutsStore(state => state.activeSession);
export const useWorkoutsLoading = () => useWorkoutsStore(state => state.loading);
export const useWorkoutsErrors = () => useWorkoutsStore(state => state.errors);
export const useWorkoutAnalytics = () => useWorkoutsStore(state => state.analytics);