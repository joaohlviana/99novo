import { useState } from 'react';
import { 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Filter, 
  Search, 
  Plus,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Users,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Program {
  id: string;
  title: string;
  trainer: {
    id: string;
    name: string;
    avatar: string;
  };
  category: string;
  price: number;
  status: 'published' | 'pending' | 'rejected' | 'draft';
  enrollments: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  lastUpdated: string;
  reports?: number;
}

export function ProgramsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Mock data - em uma implementação real viria da API
  const programs: Program[] = [
    {
      id: '1',
      title: 'Transformação Corporal Completa',
      trainer: {
        id: 't1',
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
      },
      category: 'Musculação',
      price: 297,
      status: 'published',
      enrollments: 234,
      rating: 4.8,
      reviewCount: 89,
      createdAt: '2024-01-15',
      lastUpdated: '2024-01-20'
    },
    {
      id: '2',
      title: 'Yoga para Iniciantes',
      trainer: {
        id: 't2',
        name: 'Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&q=80'
      },
      category: 'Yoga',
      price: 149,
      status: 'pending',
      enrollments: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: '2024-01-22',
      lastUpdated: '2024-01-22'
    },
    {
      id: '3',
      title: 'CrossFit Hardcore',
      trainer: {
        id: 't3',
        name: 'Carlos Lima',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80'
      },
      category: 'CrossFit',
      price: 450,
      status: 'published',
      enrollments: 156,
      rating: 4.9,
      reviewCount: 67,
      createdAt: '2024-01-10',
      lastUpdated: '2024-01-18',
      reports: 2
    },
    {
      id: '4',
      title: 'Pilates Terapêutico',
      trainer: {
        id: 't4',
        name: 'Ana Costa',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'
      },
      category: 'Pilates',
      price: 199,
      status: 'rejected',
      enrollments: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: '2024-01-20',
      lastUpdated: '2024-01-21'
    },
    {
      id: '5',
      title: 'Treino Funcional para Casa',
      trainer: {
        id: 't5',
        name: 'Pedro Oliveira',
        avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&q=80'
      },
      category: 'Funcional',
      price: 89,
      status: 'draft',
      enrollments: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: '2024-01-23',
      lastUpdated: '2024-01-23'
    }
  ];

  const getStatusBadge = (status: Program['status']) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Publicado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejeitado</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Rascunho</Badge>;
      default:
        return null;
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.trainer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || program.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingPrograms = programs.filter(p => p.status === 'pending');
  const reportedPrograms = programs.filter(p => p.reports && p.reports > 0);

  const stats = [
    {
      title: "Total de Programas",
      value: programs.length.toString(),
      icon: FileText,
      description: `${programs.filter(p => p.status === 'published').length} publicados`
    },
    {
      title: "Pendentes de Aprovação",
      value: pendingPrograms.length.toString(),
      icon: Clock,
      description: "Aguardando revisão"
    },
    {
      title: "Programas Reportados",
      value: reportedPrograms.length.toString(),
      icon: AlertTriangle,
      description: "Requerem atenção"
    },
    {
      title: "Receita Total",
      value: "R$ 45.6k",
      icon: DollarSign,
      description: "Este mês"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Gerenciar Programas</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todos os programas da plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todos os Programas</TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes ({pendingPrograms.length})
          </TabsTrigger>
          <TabsTrigger value="reported">
            Reportados ({reportedPrograms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros e Busca</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar programas ou treinadores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="rejected">Rejeitados</SelectItem>
                    <SelectItem value="draft">Rascunhos</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Categorias</SelectItem>
                    <SelectItem value="Musculação">Musculação</SelectItem>
                    <SelectItem value="Yoga">Yoga</SelectItem>
                    <SelectItem value="CrossFit">CrossFit</SelectItem>
                    <SelectItem value="Pilates">Pilates</SelectItem>
                    <SelectItem value="Funcional">Funcional</SelectItem>
                  </SelectContent>
                </Select>

                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Programa
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Programs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Programas ({filteredPrograms.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programa</TableHead>
                    <TableHead>Treinador</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inscrições</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{program.title}</div>
                          {program.reports && program.reports > 0 && (
                            <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              {program.reports} denúncia(s)
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={program.trainer.avatar} />
                            <AvatarFallback>{program.trainer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{program.trainer.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{program.category}</Badge>
                      </TableCell>
                      <TableCell>R$ {program.price}</TableCell>
                      <TableCell>{getStatusBadge(program.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {program.enrollments}
                        </div>
                      </TableCell>
                      <TableCell>
                        {program.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span>{program.rating}</span>
                            <span className="text-xs text-muted-foreground">({program.reviewCount})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem avaliações</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(program.createdAt).toLocaleDateString('pt-BR')}</div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {program.status === 'pending' && (
                              <>
                                <DropdownMenuItem className="text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aprovar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Rejeitar
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programas Pendentes de Aprovação</CardTitle>
              <CardDescription>
                Programas aguardando revisão e aprovação para publicação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPrograms.map((program) => (
                  <div key={program.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={program.trainer.avatar} />
                        <AvatarFallback>{program.trainer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{program.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Por {program.trainer.name} • {program.category} • R$ {program.price}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(program.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Revisar
                      </Button>
                      <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprovar
                      </Button>
                      <Button variant="destructive" size="sm">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                ))}
                
                {pendingPrograms.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Tudo em dia!</h3>
                    <p className="text-muted-foreground">Não há programas pendentes de aprovação.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reported" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programas Reportados</CardTitle>
              <CardDescription>
                Programas que receberam denúncias e precisam de moderação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportedPrograms.map((program) => (
                  <div key={program.id} className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/30">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{program.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Por {program.trainer.name} • {program.category} • R$ {program.price}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-red-600 font-medium">
                            {program.reports} denúncia(s)
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {program.enrollments} inscrições ativas
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Investigar
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Suspender
                      </Button>
                    </div>
                  </div>
                ))}
                
                {reportedPrograms.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Tudo tranquilo!</h3>
                    <p className="text-muted-foreground">Não há programas reportados no momento.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}