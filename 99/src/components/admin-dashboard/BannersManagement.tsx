import { useState } from 'react';
import { 
  Image, 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Upload,
  Calendar,
  Target,
  BarChart3,
  ExternalLink,
  Copy,
  Power,
  PowerOff
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { toast } from 'sonner@2.0.3';

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  position: 'hero' | 'sidebar' | 'footer' | 'modal';
  status: 'active' | 'inactive' | 'scheduled';
  startDate: string;
  endDate?: string;
  clickCount: number;
  impressions: number;
  ctr: number;
  priority: number;
  targetAudience: string;
  createdAt: string;
  updatedAt: string;
}

const mockBanners: Banner[] = [
  {
    id: '1',
    title: 'Promoção Black Friday',
    description: 'Desconto especial de até 50% em todos os programas',
    imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&q=80',
    targetUrl: '/promocoes/black-friday',
    position: 'hero',
    status: 'active',
    startDate: '2024-11-20',
    endDate: '2024-11-30',
    clickCount: 1247,
    impressions: 15680,
    ctr: 7.95,
    priority: 1,
    targetAudience: 'todos',
    createdAt: '2024-11-15',
    updatedAt: '2024-11-20'
  },
  {
    id: '2',
    title: 'Novo Programa de Yoga',
    description: 'Descubra nossa nova metodologia de Yoga Terapêutico',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    targetUrl: '/programas/yoga-terapeutico',
    position: 'sidebar',
    status: 'active',
    startDate: '2024-11-01',
    clickCount: 856,
    impressions: 12340,
    ctr: 6.94,
    priority: 2,
    targetAudience: 'interessados-yoga',
    createdAt: '2024-10-28',
    updatedAt: '2024-11-01'
  },
  {
    id: '3',
    title: 'Seja um Treinador Parceiro',
    description: 'Junte-se à maior plataforma de treinamento online',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    targetUrl: '/become-trainer',
    position: 'modal',
    status: 'scheduled',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    clickCount: 0,
    impressions: 0,
    ctr: 0,
    priority: 3,
    targetAudience: 'profissionais-educacao-fisica',
    createdAt: '2024-11-18',
    updatedAt: '2024-11-18'
  },
  {
    id: '4',
    title: 'App Mobile Disponível',
    description: 'Baixe nosso app e tenha acesso aos treinos em qualquer lugar',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
    targetUrl: '/download-app',
    position: 'footer',
    status: 'active',
    startDate: '2024-10-15',
    clickCount: 634,
    impressions: 18920,
    ctr: 3.35,
    priority: 4,
    targetAudience: 'usuarios-mobile',
    createdAt: '2024-10-10',
    updatedAt: '2024-10-15'
  },
  {
    id: '5',
    title: 'Transformação em 12 Semanas',
    description: 'O programa mais completo de transformação corporal',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    targetUrl: '/programas/transformacao-12-semanas',
    position: 'hero',
    status: 'inactive',
    startDate: '2024-09-01',
    endDate: '2024-10-31',
    clickCount: 2156,
    impressions: 28450,
    ctr: 7.58,
    priority: 1,
    targetAudience: 'interessados-musculacao',
    createdAt: '2024-08-25',
    updatedAt: '2024-11-01'
  }
];

export function BannersManagement() {
  const [banners, setBanners] = useState<Banner[]>(mockBanners);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         banner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || banner.status === statusFilter;
    const matchesPosition = positionFilter === 'all' || banner.position === positionFilter;
    
    return matchesSearch && matchesStatus && matchesPosition;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'scheduled': return 'Agendado';
      default: return status;
    }
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'hero': return 'Banner Principal';
      case 'sidebar': return 'Barra Lateral';
      case 'footer': return 'Rodapé';
      case 'modal': return 'Modal/Popup';
      default: return position;
    }
  };

  const handleStatusToggle = (bannerId: string) => {
    setBanners(prev => 
      prev.map(banner => 
        banner.id === bannerId 
          ? { ...banner, status: banner.status === 'active' ? 'inactive' : 'active' }
          : banner
      )
    );
    toast.success('Status do banner alterado com sucesso');
  };

  const handleDeleteBanner = (bannerId: string) => {
    setBanners(prev => prev.filter(banner => banner.id !== bannerId));
    toast.success('Banner removido com sucesso');
  };

  const handleDuplicateBanner = (bannerId: string) => {
    const bannerToDuplicate = banners.find(b => b.id === bannerId);
    if (bannerToDuplicate) {
      const newBanner = {
        ...bannerToDuplicate,
        id: Date.now().toString(),
        title: `${bannerToDuplicate.title} (Cópia)`,
        status: 'inactive' as const,
        clickCount: 0,
        impressions: 0,
        ctr: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setBanners(prev => [newBanner, ...prev]);
      toast.success('Banner duplicado com sucesso');
    }
  };

  const stats = [
    {
      title: 'Total de Banners',
      value: banners.length.toString(),
      icon: Image,
      color: 'text-blue-600'
    },
    {
      title: 'Banners Ativos',
      value: banners.filter(b => b.status === 'active').length.toString(),
      icon: Power,
      color: 'text-green-600'
    },
    {
      title: 'Total de Cliques',
      value: banners.reduce((acc, banner) => acc + banner.clickCount, 0).toLocaleString(),
      icon: Target,
      color: 'text-purple-600'
    },
    {
      title: 'CTR Médio',
      value: `${(banners.reduce((acc, banner) => acc + banner.ctr, 0) / banners.length).toFixed(2)}%`,
      icon: BarChart3,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gerenciamento de Banners</h1>
          <p className="text-muted-foreground">
            Gerencie banners promocionais e publicitários da plataforma
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-[#e0093e] hover:bg-[#c0082e]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Banner
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
                placeholder="Buscar banners por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
                <SelectItem value="scheduled">Agendados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Posição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Posições</SelectItem>
                <SelectItem value="hero">Banner Principal</SelectItem>
                <SelectItem value="sidebar">Barra Lateral</SelectItem>
                <SelectItem value="footer">Rodapé</SelectItem>
                <SelectItem value="modal">Modal/Popup</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Banners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Banners ({filteredBanners.length})</CardTitle>
          <CardDescription>
            Lista completa de todos os banners da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead>Posição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBanners.map((banner) => (
                  <TableRow key={banner.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted">
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{banner.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {banner.description.slice(0, 60)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getPositionLabel(banner.position)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(banner.status)}>
                        {getStatusLabel(banner.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{new Date(banner.startDate).toLocaleDateString('pt-BR')}</div>
                      {banner.endDate && (
                        <div className="text-muted-foreground">
                          até {new Date(banner.endDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium text-blue-600">
                          {banner.clickCount.toLocaleString()} cliques
                        </div>
                        <div className="text-muted-foreground">
                          {banner.impressions.toLocaleString()} views
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${banner.ctr > 5 ? 'text-green-600' : banner.ctr > 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {banner.ctr.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{banner.priority}</Badge>
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
                            onClick={() => setSelectedBanner(banner)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDuplicateBanner(banner.id)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleStatusToggle(banner.id)}
                            className={banner.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                          >
                            {banner.status === 'active' ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteBanner(banner.id)}
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

      {/* Banner Details Dialog */}
      <Dialog open={!!selectedBanner} onOpenChange={() => setSelectedBanner(null)}>
        <DialogContent className="max-w-3xl">
          {selectedBanner && (
            <>
              <DialogHeader>
                <DialogTitle>Detalhes do Banner</DialogTitle>
                <DialogDescription>
                  Informações completas e métricas de performance
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Banner Preview */}
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={selectedBanner.imageUrl} 
                      alt={selectedBanner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{selectedBanner.title}</h3>
                    <p className="text-muted-foreground mt-1">{selectedBanner.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-blue-600">{selectedBanner.targetUrl}</span>
                  </div>
                </div>

                {/* Banner Info & Metrics */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge className={getStatusColor(selectedBanner.status)}>
                        {getStatusLabel(selectedBanner.status)}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Posição</Label>
                      <p className="font-medium">{getPositionLabel(selectedBanner.position)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Prioridade</Label>
                      <p className="font-medium">{selectedBanner.priority}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Público-alvo</Label>
                      <p className="font-medium">{selectedBanner.targetAudience}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Período de Exibição</Label>
                    <div className="mt-1">
                      <div className="font-medium">
                        {new Date(selectedBanner.startDate).toLocaleDateString('pt-BR')}
                        {selectedBanner.endDate && 
                          ` - ${new Date(selectedBanner.endDate).toLocaleDateString('pt-BR')}`
                        }
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-muted-foreground">Métricas de Performance</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-blue-50">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedBanner.impressions.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-600">Impressões</div>
                      </div>
                      <div className="p-3 rounded-lg bg-green-50">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedBanner.clickCount.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">Cliques</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedBanner.ctr.toFixed(2)}%
                      </div>
                      <div className="text-sm text-purple-600">Taxa de Cliques (CTR)</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Banner
                    </Button>
                    <Button 
                      variant={selectedBanner.status === 'active' ? 'destructive' : 'default'}
                      className="flex-1"
                      onClick={() => handleStatusToggle(selectedBanner.id)}
                    >
                      {selectedBanner.status === 'active' ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Banner Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Banner</DialogTitle>
            <DialogDescription>
              Adicione um novo banner promocional à plataforma
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Banner</Label>
              <Input id="title" placeholder="Digite o título..." />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" placeholder="Descrição do banner..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Posição</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a posição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Banner Principal</SelectItem>
                    <SelectItem value="sidebar">Barra Lateral</SelectItem>
                    <SelectItem value="footer">Rodapé</SelectItem>
                    <SelectItem value="modal">Modal/Popup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Prioridade</Label>
                <Input id="priority" type="number" placeholder="1" />
              </div>
            </div>
            <div>
              <Label htmlFor="targetUrl">URL de Destino</Label>
              <Input id="targetUrl" placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="image">Imagem do Banner</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Clique para fazer upload ou arraste a imagem aqui
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-[#e0093e] hover:bg-[#c0082e]"
                onClick={() => {
                  toast.success('Banner criado com sucesso!');
                  setIsCreateDialogOpen(false);
                }}
              >
                Criar Banner
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}