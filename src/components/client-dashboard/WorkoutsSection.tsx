import { useState } from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  Calendar,
  Timer,
  Dumbbell,
  Target,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Award,
  Flame,
  Activity
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  duration?: string;
  completed: boolean;
}

interface Workout {
  id: string;
  title: string;
  program: string;
  type: 'cardio' | 'musculacao' | 'funcional' | 'yoga';
  duration: number;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  exercises: Exercise[];
  completedAt?: Date;
  status: 'pending' | 'in-progress' | 'completed';
  calories?: number;
  notes?: string;
}

const mockWorkouts: Workout[] = [
  {
    id: '1',
    title: 'Treino de Pernas',
    program: 'Transformação Corporal',
    type: 'musculacao',
    duration: 45,
    difficulty: 'intermediario',
    status: 'pending',
    calories: 300,
    exercises: [
      { id: '1', name: 'Agachamento Livre', sets: 4, reps: '12-15', weight: '60kg', completed: false },
      { id: '2', name: 'Leg Press', sets: 3, reps: '15-20', weight: '120kg', completed: false },
      { id: '3', name: 'Cadeira Extensora', sets: 3, reps: '12-15', weight: '40kg', completed: false },
      { id: '4', name: 'Mesa Flexora', sets: 3, reps: '12-15', weight: '35kg', completed: false },
      { id: '5', name: 'Panturrilha no Smith', sets: 4, reps: '15-20', weight: '80kg', completed: false }
    ]
  },
  {
    id: '2',
    title: 'HIIT Cardio',
    program: 'Transformação Corporal',
    type: 'cardio',
    duration: 30,
    difficulty: 'intermediario',
    status: 'completed',
    calories: 250,
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    exercises: [
      { id: '1', name: 'Burpees', sets: 4, reps: '30s', completed: true },
      { id: '2', name: 'Mountain Climbers', sets: 4, reps: '30s', completed: true },
      { id: '3', name: 'Jump Squats', sets: 4, reps: '30s', completed: true },
      { id: '4', name: 'High Knees', sets: 4, reps: '30s', completed: true },
      { id: '5', name: 'Plank', sets: 3, reps: '45s', completed: true }
    ]
  },
  {
    id: '3',
    title: 'Peito e Tríceps',
    program: 'Transformação Corporal',
    type: 'musculacao',
    duration: 50,
    difficulty: 'intermediario',
    status: 'completed',
    calories: 280,
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    exercises: [
      { id: '1', name: 'Supino Reto', sets: 4, reps: '8-12', weight: '70kg', completed: true },
      { id: '2', name: 'Inclinado com Halteres', sets: 3, reps: '10-12', weight: '30kg', completed: true },
      { id: '3', name: 'Crucifixo', sets: 3, reps: '12-15', weight: '20kg', completed: true },
      { id: '4', name: 'Tríceps Testa', sets: 3, reps: '12-15', weight: '25kg', completed: true },
      { id: '5', name: 'Paralelas', sets: 3, reps: 'Máximo', completed: true }
    ]
  }
];

export function WorkoutsSection() {
  const [selectedTab, setSelectedTab] = useState<'today' | 'week' | 'completed'>('today');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const getTodayWorkouts = () => mockWorkouts.filter(w => w.status === 'pending' || w.status === 'in-progress');
  const getWeekWorkouts = () => mockWorkouts;
  const getCompletedWorkouts = () => mockWorkouts.filter(w => w.status === 'completed');

  const getCurrentWorkouts = () => {
    switch (selectedTab) {
      case 'today': return getTodayWorkouts();
      case 'week': return getWeekWorkouts();
      case 'completed': return getCompletedWorkouts();
      default: return [];
    }
  };

  const getTypeIcon = (type: Workout['type']) => {
    switch (type) {
      case 'musculacao': return <Dumbbell className="h-4 w-4" />;
      case 'cardio': return <Activity className="h-4 w-4" />;
      case 'funcional': return <Target className="h-4 w-4" />;
      case 'yoga': return <Target className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Workout['type']) => {
    switch (type) {
      case 'musculacao': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cardio': return 'bg-red-50 text-red-700 border-red-200';
      case 'funcional': return 'bg-green-50 text-green-700 border-green-200';
      case 'yoga': return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const getDifficultyColor = (difficulty: Workout['difficulty']) => {
    switch (difficulty) {
      case 'iniciante': return 'bg-green-100 text-green-800';
      case 'intermediario': return 'bg-yellow-100 text-yellow-800';
      case 'avancado': return 'bg-red-100 text-red-800';
    }
  };

  const startWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
  };

  if (selectedWorkout) {
    return (
      <WorkoutExecution 
        workout={selectedWorkout} 
        onBack={() => setSelectedWorkout(null)}
        onComplete={() => {
          // Handle workout completion
          setSelectedWorkout(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treinos</h1>
          <p className="text-gray-600">Execute e acompanhe seus treinos diários</p>
        </div>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Agendar Treino
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Esta Semana</p>
              <p className="text-xl font-bold text-gray-900">4/5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Calorias</p>
              <p className="text-xl font-bold text-gray-900">830</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Timer className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tempo Total</p>
              <p className="text-xl font-bold text-gray-900">3h 20m</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sequência</p>
              <p className="text-xl font-bold text-gray-900">7 dias</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'today', label: 'Hoje', count: getTodayWorkouts().length },
          { id: 'week', label: 'Esta Semana', count: getWeekWorkouts().length },
          { id: 'completed', label: 'Concluídos', count: getCompletedWorkouts().length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Workouts List */}
      <div className="space-y-4">
        {getCurrentWorkouts().map((workout) => (
          <div key={workout.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{workout.title}</h3>
                    <Badge className={getTypeColor(workout.type)}>
                      {getTypeIcon(workout.type)}
                      <span className="ml-1 capitalize">{workout.type}</span>
                    </Badge>
                    <Badge variant="outline" className={getDifficultyColor(workout.difficulty)}>
                      {workout.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{workout.program}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {workout.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Dumbbell className="h-4 w-4" />
                      {workout.exercises.length} exercícios
                    </div>
                    {workout.calories && (
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        ~{workout.calories} cal
                      </div>
                    )}
                    {workout.completedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {workout.completedAt.toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {workout.status === 'pending' && (
                    <Button 
                      onClick={() => startWorkout(workout)}
                      className="bg-[var(--brand)] hover:bg-[var(--brand-hover)]"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar
                    </Button>
                  )}
                  {workout.status === 'completed' && (
                    <Button variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Refazer
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Exercises Preview */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Exercícios:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {workout.exercises.slice(0, 6).map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className={`h-3 w-3 ${exercise.completed ? 'text-green-500' : 'text-gray-300'}`} />
                      <span className="truncate">
                        {exercise.name} - {exercise.sets}x{exercise.reps}
                      </span>
                    </div>
                  ))}
                  {workout.exercises.length > 6 && (
                    <div className="text-sm text-gray-500">
                      +{workout.exercises.length - 6} mais...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {getCurrentWorkouts().length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Dumbbell className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treino encontrado</h3>
          <p className="text-gray-600 mb-6">
            {selectedTab === 'today' 
              ? 'Você não tem treinos agendados para hoje.'
              : selectedTab === 'completed'
              ? 'Você ainda não completou nenhum treino.'
              : 'Não há treinos programados para esta semana.'
            }
          </p>
          <Button className="bg-[var(--brand)] hover:bg-[var(--brand-hover)]">
            Explorar Programas
          </Button>
        </div>
      )}
    </div>
  );
}

// Componente de execução de treino
function WorkoutExecution({ 
  workout, 
  onBack, 
  onComplete 
}: { 
  workout: Workout; 
  onBack: () => void; 
  onComplete: () => void; 
}) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [startTime] = useState(new Date());
  const [timer, setTimer] = useState(0);

  // Timer logic would go here (useEffect for updating timer)

  const currentExercise = workout.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / workout.exercises.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            ← Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workout.title}</h1>
            <p className="text-gray-600">{workout.program}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[var(--brand)]">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
          </div>
          <p className="text-sm text-gray-600">Tempo decorrido</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progresso do Treino</span>
          <span className="text-sm text-gray-600">
            {currentExerciseIndex + 1} de {workout.exercises.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[var(--brand)] h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Current Exercise */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{currentExercise.name}</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{currentExercise.sets}</div>
            <div className="text-sm text-gray-600">Séries</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{currentExercise.reps}</div>
            <div className="text-sm text-gray-600">Repetições</div>
          </div>
          {currentExercise.weight && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{currentExercise.weight}</div>
              <div className="text-sm text-gray-600">Peso</div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1">
            Série Anterior
          </Button>
          <Button 
            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-hover)]"
            onClick={() => {
              if (currentExerciseIndex < workout.exercises.length - 1) {
                setCurrentExerciseIndex(currentExerciseIndex + 1);
              } else {
                onComplete();
              }
            }}
          >
            {currentExerciseIndex < workout.exercises.length - 1 ? 'Próximo Exercício' : 'Finalizar Treino'}
          </Button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Lista de Exercícios</h4>
        <div className="space-y-3">
          {workout.exercises.map((exercise, index) => (
            <div 
              key={exercise.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                index === currentExerciseIndex ? 'bg-[var(--brand)]/5 border border-[var(--brand)]/20' : 'bg-gray-50'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                index < currentExerciseIndex ? 'bg-green-500 text-white' :
                index === currentExerciseIndex ? 'bg-[var(--brand)] text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {index < currentExerciseIndex ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{exercise.name}</p>
                <p className="text-sm text-gray-600">
                  {exercise.sets}x{exercise.reps} {exercise.weight && `• ${exercise.weight}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}