import { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Calendar,
  Weight,
  Ruler,
  Activity,
  Award,
  Camera,
  ChevronDown,
  Plus,
  BarChart3,
  Zap,
  Timer,
  Heart
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ProgressData {
  date: string;
  weight: number;
  bodyFat?: number;
  muscle?: number;
  waist?: number;
  chest?: number;
  arms?: number;
}

interface WorkoutStats {
  date: string;
  duration: number;
  calories: number;
  exercises: number;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  category: 'weight' | 'body' | 'performance' | 'habit';
  status: 'on-track' | 'behind' | 'ahead' | 'completed';
}

const mockProgressData: ProgressData[] = [
  { date: '2024-01-01', weight: 82.5, bodyFat: 22, muscle: 35, waist: 90, chest: 102, arms: 35 },
  { date: '2024-01-15', weight: 81.8, bodyFat: 21.2, muscle: 35.5, waist: 89, chest: 103, arms: 35.5 },
  { date: '2024-02-01', weight: 80.9, bodyFat: 20.5, muscle: 36, waist: 87, chest: 104, arms: 36 },
  { date: '2024-02-15', weight: 80.1, bodyFat: 19.8, muscle: 36.8, waist: 86, chest: 105, arms: 36.5 },
  { date: '2024-03-01', weight: 79.3, bodyFat: 19.2, muscle: 37.2, waist: 85, chest: 106, arms: 37 },
  { date: '2024-03-15', weight: 78.3, bodyFat: 18.5, muscle: 37.8, waist: 84, chest: 107, arms: 37.5 }
];

const mockWorkoutStats: WorkoutStats[] = [
  { date: 'Seg', duration: 45, calories: 320, exercises: 8 },
  { date: 'Ter', duration: 60, calories: 420, exercises: 10 },
  { date: 'Qua', duration: 30, calories: 250, exercises: 6 },
  { date: 'Qui', duration: 50, calories: 380, exercises: 9 },
  { date: 'Sex', duration: 45, calories: 310, exercises: 7 },
  { date: 'Sáb', duration: 70, calories: 480, exercises: 12 },
  { date: 'Dom', duration: 0, calories: 0, exercises: 0 }
];

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Perder 8kg',
    target: 8,
    current: 4.2,
    unit: 'kg',
    deadline: new Date('2024-06-01'),
    category: 'weight',
    status: 'on-track'
  },
  {
    id: '2',
    title: 'Reduzir BF para 15%',
    target: 15,
    current: 18.5,
    unit: '%',
    deadline: new Date('2024-05-01'),
    category: 'body',
    status: 'on-track'
  },
  {
    id: '3',
    title: 'Treinar 5x por semana',
    target: 5,
    current: 4,
    unit: 'dias',
    deadline: new Date('2024-12-31'),
    category: 'habit',
    status: 'behind'
  },
  {
    id: '4',
    title: 'Ganhar 3kg de massa muscular',
    target: 3,
    current: 2.8,
    unit: 'kg',
    deadline: new Date('2024-07-01'),
    category: 'body',
    status: 'ahead'
  }
];

const bodyCompositionData = [
  { name: 'Massa Magra', value: 62, color: '#10b981' },
  { name: 'Gordura', value: 18.5, color: '#f59e0b' },
  { name: 'Água', value: 19.5, color: '#3b82f6' }
];

export function ProgressSection() {
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'bodyFat' | 'measurements'>('weight');
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m' | '1y'>('3m');

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'ahead': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'on-track': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'behind': return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const getStatusText = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'Concluído';
      case 'ahead': return 'Adiantado';
      case 'on-track': return 'No prazo';
      case 'behind': return 'Atrasado';
    }
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'weight': return <Weight className="h-4 w-4" />;
      case 'body': return <Activity className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'habit': return <Target className="h-4 w-4" />;
    }
  };

  const calculateProgress = (goal: Goal) => {
    if (goal.category === 'weight' && goal.title.includes('Perder')) {
      return (goal.current / goal.target) * 100;
    }
    if (goal.category === 'body' && goal.title.includes('BF')) {
      const initial = 22; // Initial body fat
      const progressMade = initial - goal.current;
      const totalNeeded = initial - goal.target;
      return (progressMade / totalNeeded) * 100;
    }
    return (goal.current / goal.target) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progresso</h1>
          <p className="text-gray-600">Acompanhe sua evolução e conquistas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Camera className="h-4 w-4 mr-2" />
            Foto de Progresso
          </Button>
          <Button className="bg-[var(--brand)] hover:bg-[var(--brand-hover)]">
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Weight className="h-6 w-6 text-blue-600" />
            </div>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              -4.2kg
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">78.3kg</p>
            <p className="text-sm text-gray-600">Peso atual</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-orange-600" />
            </div>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              -3.5%
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">18.5%</p>
            <p className="text-sm text-gray-600">Gordura corporal</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
              +2.8kg
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">37.8kg</p>
            <p className="text-sm text-gray-600">Massa muscular</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Ruler className="h-6 w-6 text-purple-600" />
            </div>
            <Badge className="bg-green-50 text-green-700 border-green-200">
              -6cm
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">84cm</p>
            <p className="text-sm text-gray-600">Cintura</p>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Metas</h3>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockGoals.map((goal) => {
            const progress = calculateProgress(goal);
            const daysRemaining = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={goal.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(goal.category)}
                    <h4 className="font-medium text-gray-900">{goal.title}</h4>
                  </div>
                  <Badge className={getStatusColor(goal.status)}>
                    {getStatusText(goal.status)}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-medium">
                      {goal.current}{goal.unit} / {goal.target}{goal.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[var(--brand)] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>{Math.round(progress)}% concluído</span>
                    <span>{daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Prazo vencido'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight/Body Fat Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Evolução Corporal</h3>
            <div className="flex gap-2">
              <select 
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1"
              >
                <option value="weight">Peso</option>
                <option value="bodyFat">Gordura Corporal</option>
                <option value="measurements">Medidas</option>
              </select>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value: any, name: string) => [
                    `${value}${selectedMetric === 'weight' ? 'kg' : selectedMetric === 'bodyFat' ? '%' : 'cm'}`,
                    name === 'weight' ? 'Peso' : name === 'bodyFat' ? 'Gordura' : name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="var(--brand)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--brand)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Composition */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Composição Corporal</h3>
          
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bodyCompositionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bodyCompositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {bodyCompositionData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Workout Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Atividade Semanal</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockWorkoutStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'calories' ? `${value} cal` : 
                  name === 'duration' ? `${value} min` : value,
                  name === 'calories' ? 'Calorias' : 
                  name === 'duration' ? 'Duração' : 'Exercícios'
                ]}
              />
              <Bar dataKey="duration" fill="var(--brand)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Conquistas Recentes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: '7 Dias Seguidos', description: 'Treinou por 7 dias consecutivos', icon: Award, color: 'yellow' },
            { title: 'Meta de Peso', description: 'Perdeu 4kg - 50% da meta', icon: Target, color: 'blue' },
            { title: 'Força Aumentada', description: 'Aumentou 15kg no supino', icon: TrendingUp, color: 'green' }
          ].map((achievement, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg text-center">
              <div className={`w-12 h-12 mx-auto mb-3 bg-${achievement.color}-50 rounded-full flex items-center justify-center`}>
                <achievement.icon className={`h-6 w-6 text-${achievement.color}-600`} />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{achievement.title}</h4>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}