import { useState } from 'react';
import { 
  Trophy, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';

interface Sport {
  id: string;
  name: string;
  category: string;
  icon: string;
  trainersCount: number;
  programsCount: number;
  studentsCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  description: string;
  tags: string[];
}

const mockSports: Sport[] = [
  {
    id: '1',
    name: 'Musculação',
    category: 'Academia',
    icon: '💪',
    trainersCount: 245,
    programsCount: 156,
    studentsCount: 1890,
    status: 'active',
    createdAt: '2023-01-01',
    description: 'Treinamento com pesos e equipamentos para desenvolvimento muscular',
    tags: ['força', 'hipertrofia', 'resistência']
  },
  {
    id: '2',
    name: 'Yoga',
    category: 'Bem-estar',
    icon: '🧘‍♀️',
    trainersCount: 89,
    programsCount: 67,
    studentsCount: 456,
    status: 'active',
    createdAt: '2023-01-15',
    description: 'Prática milenar que combina posturas, respiração e meditação',
    tags: ['flexibilidade', 'relaxamento', 'meditação']
  },
  {
    id: '3',
    name: 'Pilates',
    category: 'Bem-estar',
    icon: '🤸‍♀️',
    trainersCount: 67,
    programsCount: 45,
    studentsCount: 324,
    status: 'active',
    createdAt: '2023-02-01',
    description: 'Sistema de exercícios focado em fortalecimento do core e flexibilidade',
    tags: ['core', 'postura', 'flexibilidade']
  },
  {
    id: '4',
    name: 'Crossfit',
    category: 'Funcional',
    icon: '🏋️‍♂️',
    trainersCount: 134,
    programsCount: 89,
    studentsCount: 789,
    status: 'active',
    createdAt: '2023-01-20',
    description: 'Programa de condicionamento físico de alta intensidade',
    tags: ['funcional', 'cardio', 'força']
  },
  {
    id: '5',
    name: 'Natação',
    category: 'Aquático',
    icon: '🏊‍♂️',
    trainersCount: 45,
    programsCount: 34,
    studentsCount: 267,
    status: 'active',
    createdAt: '2023-03-01',
    description: 'Esporte aquático completo para condicionamento cardiovascular',
    tags: ['cardio', 'resistência', 'técnica']
  },
  {
    id: '6',
    name: 'Dança',
    category: 'Expressão',
    icon: '💃',
    trainersCount: 78,
    programsCount: 56,
    studentsCount: 445,
    status: 'inactive',
    createdAt: '2023-02-15',
    description: 'Expressão artística através do movimento corporal',
    tags: ['ritmo', 'coordenação', 'expressão']
  }
];

export function SportsManagement() {
  const [sports, setSports] = useState<Sport[]>(mockSports);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);

  const filteredSports = sports.filter(sport =>
    sport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sport.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sport.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteSport = (sportId: string) => {
    setSports(prev => prev.filter(sport => sport.id !== sportId));
    toast.success('Modalidade removida com sucesso');
  };

  const handleToggleStatus = (sportId: string) => {
    setSports(prev => 
      prev.map(sport => 
        sport.id === sportId 
          ? { ...sport, status: sport.status === 'active' ? 'inactive' : 'active' }
          : sport
      )
    );
    toast.success('Status da modalidade alterado');
  };

  const stats = [
    {
      title: 'Total de Modalidades',
      value: sports.length.toString(),
      icon: Trophy,
      color: 'text-blue-600'
    },
    {
      title: 'Modalidades Ativas',
      value: sports.filter(s => s.status === 'active').length.toString(),
      icon: Activity,
      color: 'text-green-600'
    },
    {
      title: 'Total de Treinadores',
      value: sports.reduce((acc, sport) => acc + sport.trainersCount, 0).toString(),
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Programas Cadastrados',
      value: sports.reduce((acc, sport) => acc + sport.programsCount, 0).toString(),
      icon: FileText,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciamento de Modalidades</h1>
          <p className="text-muted-foreground">
            Gerencie todas as modalidades esportivas da plataforma
          </p>
        </div>
        <Button className="bg-[#e0093e] hover:bg-[#c0082e]">
          <Plus className="h-4 w-4 mr-2" />
          Nova Modalidade
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar modalidades por nome, categoria ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Modalidades ({filteredSports.length})</CardTitle>
          <CardDescription>
            Lista completa de todas as modalidades esportivas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modalidade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Treinadores</TableHead>
                  <TableHead>Programas</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSports.map((sport) => (
                  <TableRow key={sport.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{sport.icon}</div>
                        <div>
                          <div className="font-medium">{sport.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {sport.description.slice(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sport.category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-blue-600">
                      {sport.trainersCount}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {sport.programsCount}
                    </TableCell>
                    <TableCell className="font-medium text-purple-600">
                      {sport.studentsCount}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={sport.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {sport.status === 'active' ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {sport.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {sport.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{sport.tags.length - 2}
                          </Badge>
                        )}
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
                            onClick={() => setSelectedSport(sport)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(sport.id)}
                            className={sport.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                          >
                            <Activity className="h-4 w-4 mr-2" />
                            {sport.status === 'active' ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteSport(sport.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Sport Details Dialog */}
      <Dialog open={!!selectedSport} onOpenChange={() => setSelectedSport(null)}>
        <DialogContent className="max-w-2xl">
          {selectedSport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="text-3xl">{selectedSport.icon}</div>
                  <div>
                    <div>{selectedSport.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selectedSport.category}
                    </div>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {selectedSport.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                    <Badge 
                      className={selectedSport.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {selectedSport.status === 'active' ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Categoria</h4>
                    <p className="text-sm">{selectedSport.category}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Data de Criação</h4>
                    <p className="text-sm">{new Date(selectedSport.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Tags</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedSport.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Treinadores</h4>
                    <p className="text-sm font-medium text-blue-600">{selectedSport.trainersCount}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Programas</h4>
                    <p className="text-sm font-medium text-green-600">{selectedSport.programsCount}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Alunos Ativos</h4>
                    <p className="text-sm font-medium text-purple-600">{selectedSport.studentsCount}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}