import { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  MapPin,
  Calendar,
  Trophy,
  Ban,
  CheckCircle,
  Activity,
  UserRoundCog
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { useImpersonation } from '../../hooks/useImpersonation';

interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  interests: string[];
  location: string;
  status: 'active' | 'inactive' | 'suspended' | 'banned';
  joinDate: string;
  contractsCount: number;
  totalSpent: number;
  lastActive: string;
  activityLevel: 'baixo' | 'medio' | 'alto';
  goal: string;
}

interface ClientsManagementProps {
  onImpersonateClient?: () => void;
}

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Ana Beatriz',
    email: 'ana.beatriz@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80',
    interests: ['Musculação', 'Yoga'],
    location: 'São Paulo, SP',
    status: 'active',
    joinDate: '2023-03-10',
    contractsCount: 3,
    totalSpent: 2340,
    lastActive: '1 min atrás',
    activityLevel: 'alto',
    goal: 'Perda de peso'
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@email.com',
    interests: ['Crossfit', 'Corrida'],
    location: 'Rio de Janeiro, RJ',
    status: 'active',
    joinDate: '2023-01-22',
    contractsCount: 5,
    totalSpent: 4560,
    lastActive: '2h atrás',
    activityLevel: 'alto',
    goal: 'Ganho de massa'
  },
  {
    id: '3',
    name: 'Fernanda Lima',
    email: 'fernanda.lima@email.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
    interests: ['Pilates', 'Dança'],
    location: 'Belo Horizonte, MG',
    status: 'inactive',
    joinDate: '2022-11-15',
    contractsCount: 1,
    totalSpent: 297,
    lastActive: '2 semanas atrás',
    activityLevel: 'baixo',
    goal: 'Condicionamento físico'
  },
  {
    id: '4',
    name: 'Roberto Silva',
    email: 'roberto.silva@email.com',
    interests: ['Natação', 'Triathlon'],
    location: 'Salvador, BA',
    status: 'active',
    joinDate: '2023-06-08',
    contractsCount: 2,
    totalSpent: 1890,
    lastActive: '1 dia atrás',
    activityLevel: 'medio',
    goal: 'Preparação para competição'
  },
  {
    id: '5',
    name: 'Juliana Costa',
    email: 'juliana.costa@email.com',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&q=80',
    interests: ['Yoga', 'Meditação'],
    location: 'Brasília, DF',
    status: 'suspended',
    joinDate: '2023-02-14',
    contractsCount: 4,
    totalSpent: 3210,
    lastActive: '1 semana atrás',
    activityLevel: 'medio',
    goal: 'Bem-estar'
  }
];

export function ClientsManagement({ onImpersonateClient }: ClientsManagementProps) {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { startImpersonation } = useImpersonation();

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'banned': return 'bg-black text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'suspended': return 'Suspenso';
      case 'banned': return 'Banido';
      default: return status;
    }
  };

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'alto': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'baixo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityLevelLabel = (level: string) => {
    switch (level) {
      case 'alto': return 'Alto';
      case 'medio': return 'Médio';
      case 'baixo': return 'Baixo';
      default: return level;
    }
  };

  const handleStatusChange = (clientId: string, newStatus: Client['status']) => {
    setClients(prev => 
      prev.map(client => 
        client.id === clientId 
          ? { ...client, status: newStatus }
          : client
      )
    );
    
    toast.success(`Status do cliente alterado para ${getStatusLabel(newStatus)}`);
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(client => client.id !== clientId));
    toast.success('Cliente removido com sucesso');
  };

  const handleImpersonateClient = (client: Client) => {
    startImpersonation({
      id: client.id,
      name: client.name,
      email: client.email,
      type: 'client',
      avatar: client.avatar
    });
    
    toast.success(`Personificando como ${client.name}`);
    onImpersonateClient?.();
  };

  const stats = [
    {
      title: 'Total de Clientes',
      value: clients.length.toString(),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Clientes Ativos',
      value: clients.filter(c => c.status === 'active').length.toString(),
      icon: UserCheck,
      color: 'text-green-600'
    },
    {
      title: 'Inativos (30+ dias)',
      value: clients.filter(c => c.status === 'inactive').length.toString(),
      icon: UserX,
      color: 'text-yellow-600'
    },
    {
      title: 'Receita Total',
      value: `R$ ${clients.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}`,
      icon: Trophy,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciamento de Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie todos os clientes da plataforma
          </p>
        </div>
        <Button className="bg-[#e0093e] hover:bg-[#c0082e]">
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
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
                placeholder="Buscar clientes por nome, email ou interesse..."
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
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="suspended">Suspensos</SelectItem>
                <SelectItem value="banned">Banidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes ({filteredClients.length})</CardTitle>
          <CardDescription>
            Lista completa de todos os clientes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Interesses</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Contratos</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={client.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-sm text-muted-foreground">{client.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.interests.slice(0, 2).map((interest, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {client.interests.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{client.interests.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {client.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(client.status)}>
                        {getStatusLabel(client.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActivityLevelColor(client.activityLevel)}>
                        {getActivityLevelLabel(client.activityLevel)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {client.contractsCount}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      R$ {client.totalSpent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.lastActive}
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
                            onClick={() => setSelectedClient(client)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleImpersonateClient(client)}
                            className="text-blue-600"
                          >
                            <UserRoundCog className="h-4 w-4 mr-2" />
                            Personificar Cliente
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {client.status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(client.id, 'suspended')}
                              className="text-orange-600"
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                          )}
                          {client.status === 'suspended' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(client.id, 'active')}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reativar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClient(client.id)}
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

      {/* Client Details Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-2xl">
          {selectedClient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedClient.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {selectedClient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{selectedClient.name}</div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {selectedClient.email}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                    <Badge className={getStatusColor(selectedClient.status)}>
                      {getStatusLabel(selectedClient.status)}
                    </Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Localização</h4>
                    <p className="text-sm">{selectedClient.location}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Data de Cadastro</h4>
                    <p className="text-sm">{new Date(selectedClient.joinDate).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Objetivo</h4>
                    <p className="text-sm">{selectedClient.goal}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Interesses</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedClient.interests.map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Nível de Atividade</h4>
                    <Badge className={getActivityLevelColor(selectedClient.activityLevel)}>
                      {getActivityLevelLabel(selectedClient.activityLevel)}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Contratos Ativos</h4>
                    <p className="text-sm font-medium">{selectedClient.contractsCount}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Total Investido</h4>
                    <p className="text-sm font-medium text-green-600">
                      R$ {selectedClient.totalSpent.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Última Atividade</h4>
                    <p className="text-sm">{selectedClient.lastActive}</p>
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