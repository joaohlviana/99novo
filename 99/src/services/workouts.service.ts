import { WorkoutProgram, WorkoutSession, Exercise, WorkoutTemplate, ExerciseLog, MuscleGroup } from '../types/entities';

export interface CreateWorkoutRequest {
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em minutos
  exercises: {
    exerciseId: string;
    sets: number;
    reps?: number;
    duration?: number; // para exercícios baseados em tempo
    weight?: number;
    restTime: number; // segundos
    instructions?: string;
  }[];
  equipmentNeeded: string[];
  targetMuscleGroups: MuscleGroup[];
}

export interface WorkoutFilters {
  category?: string[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  duration?: { min: number; max: number };
  equipment?: string[];
  muscleGroups?: MuscleGroup[];
  search?: string;
  trainerId?: string;
  clientId?: string;
}

export interface ExerciseFilters {
  muscleGroup?: MuscleGroup[];
  equipment?: string[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  type?: ('strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric')[];
  search?: string;
}

// Mock data para exercícios
const mockExercises: Exercise[] = [
  {
    id: 'ex_1',
    name: 'Agachamento Livre',
    description: 'Exercício fundamental para fortalecimento de membros inferiores',
    instructions: [
      'Fique em pé com os pés na largura dos ombros',
      'Desça flexionando quadris e joelhos',
      'Mantenha o peito aberto e olhar para frente',
      'Suba de volta à posição inicial'
    ],
    muscleGroups: ['quadriceps', 'gluteus', 'core'],
    equipment: [],
    difficulty: 'beginner',
    type: 'strength',
    videoUrl: 'https://example.com/agachamento.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    tips: [
      'Mantenha os joelhos alinhados com os pés',
      'Não deixe o joelho passar da ponta do pé',
      'Mantenha a coluna neutra'
    ],
    variations: [
      'Agachamento com peso',
      'Agachamento búlgaro',
      'Agachamento sumô'
    ],
    tags: ['funcional', 'iniciante', 'casa']
  },
  {
    id: 'ex_2',
    name: 'Flexão de Braço',
    description: 'Exercício clássico para desenvolvimento do tronco superior',
    instructions: [
      'Posição de prancha com mãos no chão',
      'Desça o corpo mantendo alinhamento',
      'Empurre de volta à posição inicial',
      'Mantenha core contraído'
    ],
    muscleGroups: ['chest', 'triceps', 'core'],
    equipment: [],
    difficulty: 'intermediate',
    type: 'strength',
    videoUrl: 'https://example.com/flexao.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    tips: [
      'Mantenha o corpo reto como uma prancha',
      'Desça até o peito quase tocar o chão',
      'Respire no movimento'
    ],
    variations: [
      'Flexão no joelho',
      'Flexão inclinada',
      'Flexão diamante'
    ],
    tags: ['calistenia', 'funcional', 'casa']
  },
  {
    id: 'ex_3',
    name: 'Burpee',
    description: 'Exercício de corpo inteiro, alta intensidade',
    instructions: [
      'Comece em pé',
      'Desça em agachamento e coloque as mãos no chão',
      'Pule os pés para trás em prancha',
      'Faça uma flexão (opcional)',
      'Pule os pés de volta',
      'Salte para cima com braços estendidos'
    ],
    muscleGroups: ['full_body', 'core', 'legs'],
    equipment: [],
    difficulty: 'advanced',
    type: 'plyometric',
    videoUrl: 'https://example.com/burpee.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    tips: [
      'Mantenha ritmo constante',
      'Foque na técnica, não na velocidade',
      'Respire de forma controlada'
    ],
    variations: [
      'Burpee sem flexão',
      'Burpee com salto lateral',
      'Half burpee'
    ],
    tags: ['hiit', 'cardio', 'funcional']
  },
  {
    id: 'ex_4',
    name: 'Prancha',
    description: 'Exercício isométrico para fortalecimento do core',
    instructions: [
      'Posição de flexão apoiado nos antebraços',
      'Mantenha o corpo em linha reta',
      'Contraia abdômen e glúteos',
      'Respire normalmente'
    ],
    muscleGroups: ['core', 'shoulders'],
    equipment: [],
    difficulty: 'beginner',
    type: 'strength',
    videoUrl: 'https://example.com/prancha.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    tips: [
      'Não deixe o quadril cair',
      'Mantenha pescoço neutro',
      'Comece com 30 segundos'
    ],
    variations: [
      'Prancha lateral',
      'Prancha com elevação de perna',
      'Prancha RKC'
    ],
    tags: ['core', 'isometrico', 'casa']
  },
  {
    id: 'ex_5',
    name: 'Corrida Estacionária',
    description: 'Exercício cardiovascular de baixo impacto',
    instructions: [
      'Corra no lugar elevando os joelhos',
      'Mantenha postura ereta',
      'Movimente os braços naturalmente',
      'Mantenha ritmo constante'
    ],
    muscleGroups: ['legs', 'cardio'],
    equipment: [],
    difficulty: 'beginner',
    type: 'cardio',
    videoUrl: 'https://example.com/corrida-estacionaria.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    tips: [
      'Comece devagar e acelere gradualmente',
      'Use tênis apropriado',
      'Hidrate-se bem'
    ],
    variations: [
      'High knees',
      'Butt kickers',
      'Corrida lateral'
    ],
    tags: ['cardio', 'aquecimento', 'casa']
  }
];

// Mock data para templates de treino
const mockWorkoutTemplates: WorkoutTemplate[] = [
  {
    id: 'template_1',
    name: 'Treino Funcional Básico',
    description: 'Treino completo usando peso corporal, ideal para iniciantes',
    category: 'functional',
    difficulty: 'beginner',
    estimatedDuration: 30,
    exercises: [
      {
        exerciseId: 'ex_1',
        sets: 3,
        reps: 12,
        restTime: 60,
        instructions: 'Foque na técnica, velocidade controlada'
      },
      {
        exerciseId: 'ex_2',
        sets: 3,
        reps: 8,
        restTime: 60,
        instructions: 'Se difícil, faça no joelho'
      },
      {
        exerciseId: 'ex_4',
        sets: 3,
        duration: 30,
        restTime: 60,
        instructions: 'Mantenha posição perfeita'
      },
      {
        exerciseId: 'ex_5',
        sets: 1,
        duration: 300, // 5 minutos
        restTime: 0,
        instructions: 'Finalize com cardio leve'
      }
    ],
    equipmentNeeded: [],
    targetMuscleGroups: ['full_body', 'core'],
    tags: ['casa', 'iniciante', 'funcional'],
    createdBy: 'trainer_1',
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: 'template_2',
    name: 'HIIT Intenso',
    description: 'Treino de alta intensidade para queima de gordura',
    category: 'hiit',
    difficulty: 'advanced',
    estimatedDuration: 20,
    exercises: [
      {
        exerciseId: 'ex_3',
        sets: 4,
        reps: 10,
        restTime: 30,
        instructions: 'Máxima intensidade'
      },
      {
        exerciseId: 'ex_2',
        sets: 4,
        reps: 15,
        restTime: 30,
        instructions: 'Ritmo acelerado'
      },
      {
        exerciseId: 'ex_5',
        sets: 4,
        duration: 60,
        restTime: 30,
        instructions: 'High knees - máxima velocidade'
      }
    ],
    equipmentNeeded: [],
    targetMuscleGroups: ['full_body', 'cardio'],
    tags: ['hiit', 'queima', 'intenso'],
    createdBy: 'trainer_2',
    isPublic: true,
    createdAt: new Date(Date.now() - 86400000 * 14),
    updatedAt: new Date(Date.now() - 86400000 * 5)
  }
];

// Mock data para programas de treino
const mockWorkoutPrograms: WorkoutProgram[] = [
  {
    id: 'program_workout_1',
    name: 'Programa Iniciante - 4 Semanas',
    description: 'Programa completo para iniciantes no mundo fitness',
    trainerId: 'trainer_1',
    clientId: 'client_1',
    startDate: new Date(Date.now() - 86400000 * 7),
    endDate: new Date(Date.now() + 86400000 * 21),
    status: 'active',
    schedule: {
      monday: 'template_1',
      wednesday: 'template_1', 
      friday: 'template_1'
    },
    goals: ['Condicionamento físico geral', 'Perda de peso', 'Ganho de força'],
    notes: 'Programa personalizado focado em adaptação gradual aos exercícios',
    progress: {
      completedSessions: 8,
      totalSessions: 12,
      currentWeek: 3,
      totalWeeks: 4
    }
  },
  {
    id: 'program_workout_2',
    name: 'Programa Avançado HIIT',
    description: 'Programa intensivo para atletas experientes',
    trainerId: 'trainer_2',
    clientId: 'client_2',
    startDate: new Date(Date.now() - 86400000 * 14),
    endDate: new Date(Date.now() + 86400000 * 14),
    status: 'active',
    schedule: {
      tuesday: 'template_2',
      thursday: 'template_2',
      saturday: 'template_2'
    },
    goals: ['Queima de gordura', 'Condicionamento cardiovascular', 'Explosão'],
    notes: 'Foco em intervalos de alta intensidade com recuperação ativa',
    progress: {
      completedSessions: 15,
      totalSessions: 24,
      currentWeek: 6,
      totalWeeks: 8
    }
  }
];

class WorkoutsService {
  private static instance: WorkoutsService;
  private exercises: Exercise[] = [...mockExercises];
  private workoutTemplates: WorkoutTemplate[] = [...mockWorkoutTemplates];
  private workoutPrograms: WorkoutProgram[] = [...mockWorkoutPrograms];
  private workoutSessions: WorkoutSession[] = [];

  private constructor() {
    this.generateMockSessions();
  }

  public static getInstance(): WorkoutsService {
    if (!WorkoutsService.instance) {
      WorkoutsService.instance = new WorkoutsService();
    }
    return WorkoutsService.instance;
  }

  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockSessions(): void {
    // Gerar algumas sessões de exemplo
    const sessions: WorkoutSession[] = [
      {
        id: 'session_1',
        workoutId: 'template_1',
        userId: 'client_1',
        trainerId: 'trainer_1',
        programId: 'program_workout_1',
        scheduledDate: new Date(Date.now() - 86400000 * 2),
        completedDate: new Date(Date.now() - 86400000 * 2 + 3600000),
        status: 'completed',
        duration: 32, // minutos
        exercises: [
          {
            exerciseId: 'ex_1',
            plannedSets: 3,
            plannedReps: 12,
            completedSets: 3,
            logs: [
              { set: 1, reps: 12, weight: 0, duration: 0, notes: 'Boa execução' },
              { set: 2, reps: 12, weight: 0, duration: 0 },
              { set: 3, reps: 10, weight: 0, duration: 0, notes: 'Fadiga no final' }
            ]
          }
        ],
        notes: 'Primeira sessão completa, boa adaptação',
        rating: 4,
        caloriesBurned: 280
      }
    ];
    
    this.workoutSessions = sessions;
  }

  // Exercícios
  async getExercises(filters?: ExerciseFilters): Promise<Exercise[]> {
    await this.delay(300);

    let filtered = [...this.exercises];

    if (filters?.muscleGroup && filters.muscleGroup.length > 0) {
      filtered = filtered.filter(ex => 
        ex.muscleGroups.some(mg => filters.muscleGroup!.includes(mg))
      );
    }

    if (filters?.equipment && filters.equipment.length > 0) {
      filtered = filtered.filter(ex => 
        filters.equipment!.some(eq => ex.equipment.includes(eq)) ||
        (filters.equipment!.includes('bodyweight') && ex.equipment.length === 0)
      );
    }

    if (filters?.difficulty && filters.difficulty.length > 0) {
      filtered = filtered.filter(ex => filters.difficulty!.includes(ex.difficulty));
    }

    if (filters?.type && filters.type.length > 0) {
      filtered = filtered.filter(ex => filters.type!.includes(ex.type));
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchLower) ||
        ex.description.toLowerCase().includes(searchLower) ||
        ex.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getExercise(exerciseId: string): Promise<Exercise | null> {
    await this.delay(200);
    return this.exercises.find(ex => ex.id === exerciseId) || null;
  }

  async createExercise(exercise: Omit<Exercise, 'id'>): Promise<Exercise> {
    await this.delay(400);

    const newExercise: Exercise = {
      id: `ex_${Date.now()}`,
      ...exercise
    };

    this.exercises.push(newExercise);
    return newExercise;
  }

  // Templates de Treino
  async getWorkoutTemplates(filters?: WorkoutFilters): Promise<WorkoutTemplate[]> {
    await this.delay(300);

    let filtered = [...this.workoutTemplates];

    if (filters?.category && filters.category.length > 0) {
      filtered = filtered.filter(template => 
        filters.category!.includes(template.category)
      );
    }

    if (filters?.difficulty && filters.difficulty.length > 0) {
      filtered = filtered.filter(template => 
        filters.difficulty!.includes(template.difficulty)
      );
    }

    if (filters?.duration) {
      filtered = filtered.filter(template => 
        template.estimatedDuration >= filters.duration!.min &&
        template.estimatedDuration <= filters.duration!.max
      );
    }

    if (filters?.muscleGroups && filters.muscleGroups.length > 0) {
      filtered = filtered.filter(template =>
        template.targetMuscleGroups.some(mg => filters.muscleGroups!.includes(mg))
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters?.trainerId) {
      filtered = filtered.filter(template => template.createdBy === filters.trainerId);
    }

    return filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  async getWorkoutTemplate(templateId: string): Promise<WorkoutTemplate | null> {
    await this.delay(200);
    return this.workoutTemplates.find(template => template.id === templateId) || null;
  }

  async createWorkoutTemplate(request: CreateWorkoutRequest): Promise<WorkoutTemplate> {
    await this.delay(600);

    const newTemplate: WorkoutTemplate = {
      id: `template_${Date.now()}`,
      name: request.name,
      description: request.description,
      category: request.category,
      difficulty: request.difficulty,
      estimatedDuration: request.duration,
      exercises: request.exercises,
      equipmentNeeded: request.equipmentNeeded,
      targetMuscleGroups: request.targetMuscleGroups,
      tags: [],
      createdBy: 'current_user',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.workoutTemplates.unshift(newTemplate);
    return newTemplate;
  }

  async updateWorkoutTemplate(templateId: string, updates: Partial<WorkoutTemplate>): Promise<WorkoutTemplate | null> {
    await this.delay(400);

    const index = this.workoutTemplates.findIndex(t => t.id === templateId);
    if (index === -1) return null;

    this.workoutTemplates[index] = {
      ...this.workoutTemplates[index],
      ...updates,
      updatedAt: new Date()
    };

    return this.workoutTemplates[index];
  }

  async deleteWorkoutTemplate(templateId: string): Promise<void> {
    await this.delay(300);

    const index = this.workoutTemplates.findIndex(t => t.id === templateId);
    if (index !== -1) {
      this.workoutTemplates.splice(index, 1);
    }
  }

  // Programas de Treino
  async getWorkoutPrograms(filters?: { trainerId?: string; clientId?: string; status?: string }): Promise<WorkoutProgram[]> {
    await this.delay(300);

    let filtered = [...this.workoutPrograms];

    if (filters?.trainerId) {
      filtered = filtered.filter(program => program.trainerId === filters.trainerId);
    }

    if (filters?.clientId) {
      filtered = filtered.filter(program => program.clientId === filters.clientId);
    }

    if (filters?.status) {
      filtered = filtered.filter(program => program.status === filters.status);
    }

    return filtered.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  async createWorkoutProgram(program: Omit<WorkoutProgram, 'id'>): Promise<WorkoutProgram> {
    await this.delay(400);

    const newProgram: WorkoutProgram = {
      id: `program_workout_${Date.now()}`,
      ...program
    };

    this.workoutPrograms.unshift(newProgram);
    return newProgram;
  }

  // Sessões de Treino
  async getWorkoutSessions(filters?: { 
    userId?: string; 
    trainerId?: string; 
    programId?: string; 
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<WorkoutSession[]> {
    await this.delay(300);

    let filtered = [...this.workoutSessions];

    if (filters?.userId) {
      filtered = filtered.filter(session => session.userId === filters.userId);
    }

    if (filters?.trainerId) {
      filtered = filtered.filter(session => session.trainerId === filters.trainerId);
    }

    if (filters?.programId) {
      filtered = filtered.filter(session => session.programId === filters.programId);
    }

    if (filters?.status) {
      filtered = filtered.filter(session => session.status === filters.status);
    }

    if (filters?.fromDate) {
      filtered = filtered.filter(session => session.scheduledDate >= filters.fromDate!);
    }

    if (filters?.toDate) {
      filtered = filtered.filter(session => session.scheduledDate <= filters.toDate!);
    }

    return filtered.sort((a, b) => b.scheduledDate.getTime() - a.scheduledDate.getTime());
  }

  async completeWorkoutSession(sessionId: string, logs: ExerciseLog[], notes?: string, rating?: number): Promise<WorkoutSession | null> {
    await this.delay(400);

    const index = this.workoutSessions.findIndex(s => s.id === sessionId);
    if (index === -1) return null;

    const session = this.workoutSessions[index];
    session.status = 'completed';
    session.completedDate = new Date();
    session.exercises = session.exercises.map(ex => ({
      ...ex,
      completedSets: logs.filter(log => log.exerciseId === ex.exerciseId).length,
      logs: logs.filter(log => log.exerciseId === ex.exerciseId)
    }));
    session.notes = notes;
    session.rating = rating;
    
    // Calcular duração (mock)
    session.duration = Math.floor(Math.random() * 30) + 20; // 20-50 min
    session.caloriesBurned = Math.floor(session.duration * 8); // ~8 cal/min

    return session;
  }

  // Analytics
  async getWorkoutAnalytics(userId: string, period: '7d' | '30d' | '90d' = '30d'): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    averageDuration: number;
    caloriesBurned: number;
    favoriteExercises: { exerciseId: string; count: number; name: string }[];
    workoutFrequency: { date: string; count: number }[];
    progressTrend: { week: number; completedWorkouts: number }[];
  }> {
    await this.delay(400);

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const fromDate = new Date(Date.now() - days * 86400000);
    
    const sessions = this.workoutSessions.filter(s => 
      s.userId === userId && 
      s.status === 'completed' &&
      s.completedDate && s.completedDate >= fromDate
    );

    const totalWorkouts = sessions.length;
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const caloriesBurned = sessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0);

    // Mock analytics data
    return {
      totalWorkouts,
      totalDuration,
      averageDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
      caloriesBurned,
      favoriteExercises: [
        { exerciseId: 'ex_1', count: 8, name: 'Agachamento Livre' },
        { exerciseId: 'ex_2', count: 6, name: 'Flexão de Braço' },
        { exerciseId: 'ex_4', count: 5, name: 'Prancha' }
      ],
      workoutFrequency: Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 86400000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 3)
      })),
      progressTrend: Array.from({ length: Math.ceil(days / 7) }, (_, i) => ({
        week: i + 1,
        completedWorkouts: Math.floor(Math.random() * 5) + 2
      }))
    };
  }
}

export const workoutsService = WorkoutsService.getInstance();