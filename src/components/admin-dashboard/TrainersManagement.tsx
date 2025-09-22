import { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Star,
  MapPin,
  Calendar,
  Trophy,
  Ban,
  CheckCircle,
  UserCog
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { useImpersonation } from '../../hooks/useImpersonation';

interface Trainer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  location: string;
  status: 'active' | 'pending' | 'suspended' | 'banned';
  joinDate: string;
  programsCount: number;
  studentsCount: number;
  revenue: number;
  lastActive: string;
}

const mockTrainers: Trainer[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    specialties: ['Musculação', 'Hipertrofia'],
    rating: 4.9,
    reviewCount: 127,
    location: 'São Paulo, SP',
    status: 'active',
    joinDate: '2023-01-15',
    programsCount: 8,
    studentsCount: 145,
    revenue: 12450,
    lastActive: '2 min atrás'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    specialties: ['Yoga', 'Pilates'],
    rating: 4.8,
    reviewCount: 89,
    location: 'Rio de Janeiro, RJ',
    status: 'active',
    joinDate: '2023-02-20',
    programsCount: 12,
    studentsCount: 98,
    revenue: 8930,
    lastActive: '1h atrás'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
    specialties: ['Crossfit', 'Funcional'],
    rating: 4.7,
    reviewCount: 156,
    location: 'Belo Horizonte, MG',
    status: 'pending',
    joinDate: '2024-01-10',
    programsCount: 5,
    studentsCount: 67,
    revenue: 4560,
    lastActive: '3h atrás'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    specialties: ['Dança', 'Zumba'],
    rating: 4.6,
    reviewCount: 234,
    location: 'Brasília, DF',
    status: 'suspended',
    joinDate: '2022-11-05',
    programsCount: 15,
    studentsCount: 203,
    revenue: 15670,
    lastActive: '2 dias atrás'
  },
  {
    id: '5',
    name: 'Pedro Almeida',
    email: 'pedro.almeida@email.com',
    specialties: ['Natação', 'Triathlon'],
    rating: 4.9,
    reviewCount: 78,
    location: 'Salvador, BA',
    status: 'active',
    joinDate: '2023-07-12',
    programsCount: 6,
    studentsCount: 45,
    revenue: 6780,
    lastActive: '5h atrás'
  }
];

interface TrainersManagementProps {
  onImpersonateTrainer?: () => void;
}

export function TrainersManagement({ onImpersonateTrainer }: TrainersManagementProps) {
  const [trainers, setTrainers] = useState<Trainer[]>(mockTrainers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const { startImpersonation } = useImpersonation();

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trainer.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || trainer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'banned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'suspended': return 'Suspenso';
      case 'banned': return 'Banido';
      default: return status;
    }
  };

  const handleStatusChange = (trainerId: string, newStatus: Trainer['status']) => {
    setTrainers(prev => 
      prev.map(trainer => 
        trainer.id === trainerId 
          ? { ...trainer, status: newStatus }
          : trainer
      )
    );
    
    toast.success(`Status do treinador alterado para ${getStatusLabel(newStatus)}`);
  };

  const handleDeleteTrainer = (trainerId: string) => {
    setTrainers(prev => prev.filter(trainer => trainer.id !== trainerId));
    toast.success('Treinador removido com sucesso');
  };

  const handleImpersonateTrainer = (trainer: Trainer) => {
    startImpersonation({
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
      type: 'trainer',
      avatar: trainer.avatar
    });
    
    toast.success(`Agora você está personificando ${trainer.name}`);
    onImpersonateTrainer?.();
  };

  const stats = [
    {
      title: 'Total de Treinadores',
      value: trainers.length.toString(),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Treinadores Ativos',
      value: trainers.filter(t => t.status === 'active').length.toString(),
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Pendentes de Aprovação',
      value: trainers.filter(t => t.status === 'pending').length.toString(),
      icon: Calendar,
      color: 'text-yellow-600'
    },
    {
      title: 'Suspensos/Banidos',
      value: trainers.filter(t => ['suspended', 'banned'].includes(t.status)).length.toString(),
      icon: UserX,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciamento de Treinadores</h1>
          <p className="text-muted-foreground">
            Gerencie todos os treinadores da plataforma
          </p>
        </div>
        <Button className="bg-[#e0093e] hover:bg-[#c0082e]">
          <Plus className="h-4 w-4 mr-2" />
          Novo Treinador
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
                placeholder="Buscar treinadores por nome, email ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="suspended">Suspensos</SelectItem>
                <SelectItem value="banned">Banidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trainers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Treinadores ({filteredTrainers.length})</CardTitle>
          <CardDescription>
            Lista completa de todos os treinadores cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Treinador</TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Programas</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainers.map((trainer) => (
                  <TableRow key={trainer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={trainer.avatar} />
                          <AvatarFallback>
                            {trainer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{trainer.name}</div>
                          <div className="text-sm text-muted-foreground">{trainer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {trainer.specialties.slice(0, 2).map((spec, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {trainer.specialties.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{trainer.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{trainer.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({trainer.reviewCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {trainer.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(trainer.status)}>
                        {getStatusLabel(trainer.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {trainer.programsCount}
                    </TableCell>
                    <TableCell className="font-medium">
                      {trainer.studentsCount}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      R$ {trainer.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {trainer.lastActive}
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
                            onClick={() => setSelectedTrainer(trainer)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleImpersonateTrainer(trainer)}
                            className="text-blue-600"
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Personificar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {trainer.status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(trainer.id, 'suspended')}
                              className="text-orange-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                          )}
                          {trainer.status === 'pending' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(trainer.id, 'active')}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aprovar
                            </DropdownMenuItem>
                          )}
                          {trainer.status === 'suspended' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(trainer.id, 'active')}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reativar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTrainer(trainer.id)}
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

      {/* Trainer Details Dialog */}
      <Dialog open={!!selectedTrainer} onOpenChange={() => setSelectedTrainer(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTrainer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedTrainer.avatar} />
                    <AvatarFallback>
                      {selectedTrainer.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{selectedTrainer.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selectedTrainer.email}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                    <Badge className={getStatusColor(selectedTrainer.status)}>
                      {getStatusLabel(selectedTrainer.status)}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Localização</h4>
                    <p className="text-sm">{selectedTrainer.location}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Data de Cadastro</h4>
                    <p className="text-sm">{new Date(selectedTrainer.joinDate).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Especialidades</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTrainer.specialties.map((spec, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Avaliação</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{selectedTrainer.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({selectedTrainer.reviewCount} avaliações)
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Programas Publicados</h4>
                    <p className="text-sm font-medium">{selectedTrainer.programsCount}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Alunos Ativos</h4>
                    <p className="text-sm font-medium">{selectedTrainer.studentsCount}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Receita Total</h4>
                    <p className="text-sm font-medium text-green-600">
                      R$ {selectedTrainer.revenue.toLocaleString()}
                    </p>
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