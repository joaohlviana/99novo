import { useState } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Play,
  Clock,
  Target,
  BarChart3,
  Users,
  Calendar,
  Filter,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner@2.0.3';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

interface Workout {
  id: string;
  title: string;
  description: string;
  trainer: {
    id: string;
    name: string;
    avatar?: string;
  };
  program: {
    id: string;
    name: string;
  };
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // em minutos
  equipment: string[];
  exercises: Exercise[];
  completions: number;
  avgRating: number;
  totalRatings: number;
  status: 'published' | 'draft' | 'under_review' | 'archived';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

const mockWorkouts: Workout[] = [
  {
    id: '1',
    title: 'Treino de Peito e Tríceps - Iniciante',
    description: 'Treino focado no desenvolvimento do peitoral e tríceps para iniciantes na musculação',
    trainer: {
      id: '1',
      name: 'João Silva',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
    },
    program: {
      id: '1',
      name: 'Programa Hipertrofia Iniciante'
    },
    category: 'Musculação',
    difficulty: 'beginner',
    duration: 45,
    equipment: ['Halteres', 'Banco', 'Barra'],
    exercises: [
      { id: '1', name: 'Supino com Halteres', sets: 3, reps: '12-15', rest: '60s', notes: 'Controle a descida' },
      { id: '2', name: 'Fly com Halteres', sets: 3, reps: '10-12', rest: '45s' },
      { id: '3', name: 'Tríceps Testa', sets: 3, reps: '12-15', rest: '45s' },
      { id: '4', name: 'Tríceps Corda', sets: 3, reps: '15-20', rest: '30s' }
    ],
    completions: 342,
    avgRating: 4.7,
    totalRatings: 89,
    status: 'published',
    tags: ['peito', 'tríceps', 'iniciante', 'hipertrofia'],
    createdAt: '2024-10-15',
    updatedAt: '2024-11-01',
    videoUrl: '/videos/treino-peito-triceps.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80'
  },
  {
    id: '2',
    title: 'HIIT Cardio Intenso - 20min',
    description: 'Treino de alta intensidade para queima de gordura em apenas 20 minutos',
    trainer: {
      id: '2',
      name: 'Maria Santos',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80'
    },
    program: {
      id: '3',
      name: 'Queima Gordura Express'
    },
    category: 'Cardio',
    difficulty: 'intermediate',
    duration: 20,
    equipment: ['Sem equipamentos'],
    exercises: [
      { id: '1', name: 'Burpees', sets: 4, reps: '30s', rest: '30s' },
      { id: '2', name: 'Mountain Climbers', sets: 4, reps: '30s', rest: '30s' },
      { id: '3', name: 'Jump Squats', sets: 4, reps: '30s', rest: '30s' },
      { id: '4', name: 'High Knees', sets: 4, reps: '30s', rest: '30s' }
    ],
    completions: 567,
    avgRating: 4.9,
    totalRatings: 145,
    status: 'published',
    tags: ['hiit', 'cardio', 'queima-gordura', 'sem-equipamento'],
    createdAt: '2024-11-01',
    updatedAt: '2024-11-10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80'
  },
  {
    id: '3',
    title: 'Costas e Bíceps - Avançado',
    description: 'Treino intenso para desenvolvimento das costas e bíceps para alunos avançados',
    trainer: {
      id: '3',
      name: 'Carlos Oliveira'
    },
    program: {
      id: '2',
      name: 'Power Training Pro'
    },
    category: 'Musculação',
    difficulty: 'advanced',
    duration: 60,
    equipment: ['Barra', 'Polia', 'Halteres', 'Pull-up Bar'],
    exercises: [
      { id: '1', name: 'Pull-ups', sets: 4, reps: '8-12', rest: '90s' },
      { id: '2', name: 'Remada Baixa', sets: 4, reps: '8-10', rest: '90s' },
      { id: '3', name: 'Rosca Direta', sets: 4, reps: '10-12', rest: '60s' },
      { id: '4', name: 'Rosca Martelo', sets: 3, reps: '12-15', rest: '45s' }
    ],
    completions: 234,
    avgRating: 4.6,
    totalRatings: 67,
    status: 'under_review',
    tags: ['costas', 'bíceps', 'avançado', 'força'],
    createdAt: '2024-11-15',
    updatedAt: '2024-11-18',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80'
  },
  {
    id: '4',
    title: 'Yoga Flow Matinal - 30min',
    description: 'Sequência de yoga suave para começar o dia com energia e flexibilidade',
    trainer: {
      id: '4',
      name: 'Ana Costa',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80'
    },
    program: {
      id: '4',
      name: 'Yoga para Iniciantes'
    },
    category: 'Yoga',
    difficulty: 'beginner',
    duration: 30,
    equipment: ['Tapete de Yoga'],
    exercises: [
      { id: '1', name: 'Saudação ao Sol A', sets: 3, reps: '5 ciclos', rest: '30s' },
      { id: '2', name: 'Guerreiro I', sets: 2, reps: '1min/lado', rest: '15s' },
      { id: '3', name: 'Cachorro olhando para baixo', sets: 3, reps: '1min', rest: '30s' },
      { id: '4', name: 'Relaxamento final', sets: 1, reps: '5min', rest: '0s' }
    ],
    completions: 423,
    avgRating: 4.8,
    totalRatings: 112,
    status: 'published',
    tags: ['yoga', 'flexibilidade', 'matinal', 'relaxamento'],
    createdAt: '2024-10-20',
    updatedAt: '2024-10-25',
    videoUrl: '/videos/yoga-matinal.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80'
  },
  {
    id: '5',
    title: 'Funcional para Corredores',
    description: 'Treino funcional específico para melhorar a performance na corrida',
    trainer: {
      id: '5',
      name: 'Pedro Almeida'
    },
    program: {
      id: '5',
      name: 'Running Performance'
    },
    category: 'Funcional',
    difficulty: 'intermediate',
    duration: 40,
    equipment: ['Cones', 'Medicine Ball', 'Elástico'],
    exercises: [
      { id: '1', name: 'Skips Alto', sets: 3, reps: '30s', rest: '30s' },
      { id: '2', name: 'Lateral Bounds', sets: 3, reps: '20/lado', rest: '45s' },
      { id: '3', name: 'Single Leg RDL', sets: 3, reps: '12/lado', rest: '60s' },
      { id: '4', name: 'Prancha Lateral', sets: 2, reps: '45s/lado', rest: '30s' }
    ],
    completions: 156,
    avgRating: 4.5,
    totalRatings: 34,
    status: 'draft',
    tags: ['funcional', 'corrida', 'performance', 'estabilidade'],
    createdAt: '2024-11-20',
    updatedAt: '2024-11-22'
  }
];

export function WorkoutsManagement() {
  const [workouts, setWorkouts] = useState<Workout[]>(mockWorkouts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const filteredWorkouts = workouts.filter(workout => {
    const matchesSearch = workout.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workout.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || workout.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || workout.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || workout.difficulty === difficultyFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Rascunho';
      case 'under_review': return 'Em Análise';
      case 'archived': return 'Arquivado';
      default: return status;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Iniciante';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return difficulty;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return CheckCircle;
      case 'draft': return Edit;
      case 'under_review': return AlertCircle;
      case 'archived': return Trash2;
      default: return AlertCircle;
    }
  };

  const handleStatusChange = (workoutId: string, newStatus: Workout['status']) => {
    setWorkouts(prev => 
      prev.map(workout => 
        workout.id === workoutId 
          ? { ...workout, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : workout
      )
    );
    toast.success(`Status do treino alterado para ${getStatusLabel(newStatus)}`);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts(prev => prev.filter(workout => workout.id !== workoutId));
    toast.success('Treino removido com sucesso');
  };

  const handleDuplicateWorkout = (workoutId: string) => {
    const workoutToDuplicate = workouts.find(w => w.id === workoutId);
    if (workoutToDuplicate) {
      const newWorkout = {
        ...workoutToDuplicate,
        id: Date.now().toString(),
        title: `${workoutToDuplicate.title} (Cópia)`,
        status: 'draft' as const,
        completions: 0,
        totalRatings: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setWorkouts(prev => [newWorkout, ...prev]);
      toast.success('Treino duplicado com sucesso');
    }
  };

  const stats = [
    {
      title: 'Total de Treinos',
      value: workouts.length.toString(),
      icon: Dumbbell,
      color: 'text-blue-600'
    },
    {
      title: 'Treinos Publicados',
      value: workouts.filter(w => w.status === 'published').length.toString(),
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Total de Execuções',
      value: workouts.reduce((acc, workout) => acc + workout.completions, 0).toLocaleString(),
      icon: Play,
      color: 'text-purple-600'
    },
    {
      title: 'Avaliação Média',
      value: (workouts.reduce((acc, workout) => acc + workout.avgRating, 0) / workouts.length).toFixed(1),
      icon: Star,
      color: 'text-yellow-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciamento de Treinos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os treinos e exercícios da plataforma
          </p>
        </div>
        <Button className="bg-[#e0093e] hover:bg-[#c0082e]">
          <Plus className="h-4 w-4 mr-2" />
          Novo Treino
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar treinos por título, treinador ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Musculação">Musculação</SelectItem>
                <SelectItem value="Cardio">Cardio</SelectItem>
                <SelectItem value="Yoga">Yoga</SelectItem>
                <SelectItem value="Funcional">Funcional</SelectItem>
                <SelectItem value="Pilates">Pilates</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
                <SelectItem value="under_review">Em Análise</SelectItem>
                <SelectItem value="archived">Arquivados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Treinos ({filteredWorkouts.length})</CardTitle>
          <CardDescription>
            Lista completa de todos os treinos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treino</TableHead>
                  <TableHead>Treinador</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Execuções</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkouts.map((workout) => {
                  const StatusIcon = getStatusIcon(workout.status);
                  return (
                    <TableRow key={workout.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {workout.thumbnailUrl ? (
                              <img 
                                src={workout.thumbnailUrl} 
                                alt={workout.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Dumbbell className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{workout.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {workout.program.name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={workout.trainer.avatar} />
                            <AvatarFallback>
                              {workout.trainer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{workout.trainer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{workout.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(workout.difficulty)}>
                          {getDifficultyLabel(workout.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {workout.duration}min
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${workout.status === 'published' ? 'text-green-600' : workout.status === 'under_review' ? 'text-yellow-600' : 'text-gray-600'}`} />
                          <Badge className={getStatusColor(workout.status)}>
                            {getStatusLabel(workout.status)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {workout.completions.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{workout.avgRating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({workout.totalRatings})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => setSelectedWorkout(workout)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDuplicateWorkout(workout.id)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            {workout.videoUrl && (
                              <DropdownMenuItem>
                                <Play className="h-4 w-4 mr-2" />
                                Preview Vídeo
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {workout.status === 'draft' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(workout.id, 'published')}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Publicar
                              </DropdownMenuItem>
                            )}
                            {workout.status === 'under_review' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(workout.id, 'published')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aprovar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(workout.id, 'draft')}
                                  className="text-orange-600"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Solicitar Revisão
                                </DropdownMenuItem>
                              </>
                            )}
                            {workout.status === 'published' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(workout.id, 'archived')}
                                className="text-orange-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Arquivar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteWorkout(workout.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Workout Details Dialog */}
      <Dialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedWorkout && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {selectedWorkout.thumbnailUrl ? (
                      <img 
                        src={selectedWorkout.thumbnailUrl} 
                        alt={selectedWorkout.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Dumbbell className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div>{selectedWorkout.title}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selectedWorkout.program.name}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {selectedWorkout.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Workout Info */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedWorkout.trainer.avatar} />
                        <AvatarFallback>
                          {selectedWorkout.trainer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{selectedWorkout.trainer.name}</div>
                        <div className="text-sm text-muted-foreground">Treinador</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-muted-foreground">Categoria</Label>
                        <Badge variant="outline">{selectedWorkout.category}</Badge>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Dificuldade</Label>
                        <Badge className={getDifficultyColor(selectedWorkout.difficulty)}>
                          {getDifficultyLabel(selectedWorkout.difficulty)}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Duração</Label>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{selectedWorkout.duration}min</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Status</Label>
                        <Badge className={getStatusColor(selectedWorkout.status)}>
                          {getStatusLabel(selectedWorkout.status)}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Equipamentos</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedWorkout.equipment.map((eq, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {eq}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-muted-foreground">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedWorkout.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-muted-foreground">Métricas</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Execuções</span>
                        <span className="font-bold text-blue-600">
                          {selectedWorkout.completions.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Avaliação</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{selectedWorkout.avgRating}</span>
                          <span className="text-sm text-muted-foreground">
                            ({selectedWorkout.totalRatings})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercises List */}
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-lg font-medium">Exercícios ({selectedWorkout.exercises.length})</Label>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedWorkout.exercises.map((exercise, index) => (
                        <Card key={exercise.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-[#e0093e] text-white text-xs font-bold flex items-center justify-center">
                                  {index + 1}
                                </div>
                                <h4 className="font-medium">{exercise.name}</h4>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Séries:</span>
                                  <span className="ml-1 font-medium">{exercise.sets}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Reps:</span>
                                  <span className="ml-1 font-medium">{exercise.reps}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Descanso:</span>
                                  <span className="ml-1 font-medium">{exercise.rest}</span>
                                </div>
                              </div>
                              
                              {exercise.notes && (
                                <div className="mt-2 p-2 rounded bg-muted/50">
                                  <span className="text-xs text-muted-foreground">Observações:</span>
                                  <p className="text-sm">{exercise.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Treino
                </Button>
                {selectedWorkout.videoUrl && (
                  <Button variant="outline" className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Preview Vídeo
                  </Button>
                )}
                <Button 
                  className="flex-1 bg-[#e0093e] hover:bg-[#c0082e]"
                  onClick={() => handleDuplicateWorkout(selectedWorkout.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar Treino
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}