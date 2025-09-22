/**
 * 🏋️ PROGRAMS MANAGEMENT SIMPLE
 * 
 * Componente para gerenciar programas de treinamento
 * Segue o padrão do ProfileManagement.tsx
 */

import { useState, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  Trash2, 
  Copy, 
  FileText,
  Target,
  Clock,
  Save,
  MapPin,
  Loader2,
  Archive,
  CheckCircle,
  Settings,
  Play,
  Pause,
  DollarSign
} from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { ProgramCreationSimple } from './ProgramCreationSimple';
import { DashboardProgramCard } from '../DashboardProgramCard';
import { useTrainingProgramsSimple } from '../../hooks/useTrainingProgramsSimple';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';

// ============================================
// HELPER FUNCTIONS
// ============================================

const getImageForProgram = (category: string, title?: string) => {
  const lowerCategory = category?.toLowerCase() || '';
  const lowerTitle = title?.toLowerCase() || '';
  
  if (lowerCategory.includes('yoga') || lowerTitle.includes('yoga') || lowerTitle.includes('pilates') || lowerTitle.includes('meditação')) {
    return "https://images.unsplash.com/photo-1723406251893-88cfd80c566b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWVkaXRhdGlvbiUyMGV4ZXJjaXNlfGVufDF8fHx8MTc1NjI2NzMyOHww&ixlib=rb-4.1.0&q=80&w=1080";
  }
  
  if (lowerCategory.includes('cardio') || lowerCategory.includes('corrida') || lowerTitle.includes('running') || lowerTitle.includes('condicionamento')) {
    return "https://images.unsplash.com/photo-1737736193172-f3b87a760ad5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwY2FyZGlvJTIwZml0bmVzc3xlbnwxfHx8fDE3NTYyNjczMzF8MA&ixlib=rb-4.1.0&q=80&w=1080";
  }
  
  return "https://images.unsplash.com/photo-1573858129038-6f98c3cb2ac7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5pbmclMjB3b3Jrb3V0JTIwZ3ltfGVufDF8fHx8MTc1NjE3MTk3M3ww&ixlib=rb-4.1.0&q=80&w=1080";
};

const getStatusBadge = (status: string, published: boolean) => {
  if (published && status === 'published') {
    return <Badge className="bg-green-100 text-green-800 text-xs">Publicado</Badge>;
  }
  if (status === 'draft') {
    return <Badge variant="secondary" className="text-xs">Rascunho</Badge>;
  }
  if (status === 'archived') {
    return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Arquivado</Badge>;
  }
  return <Badge variant="outline" className="text-xs">{status}</Badge>;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function ProgramsManagementSimple() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { user } = useAuth();
  const { profile, avatarUrl, name, initials } = useUserProfile();

  // Debug do avatar
  console.log('🔍 ProgramsManagementSimple Debug:', {
    user_id: user?.id,
    profile,
    avatarUrl,
    name,
    initials
  });
  const {
    programs,
    loading,
    saving,
    error,
    loadPrograms,
    createProgram,
    publishProgram,
    unpublishProgram,
    deleteProgram,
    refresh
  } = useTrainingProgramsSimple();

  // ============================================
  // FILTROS E BUSCA
  // ============================================

  const filteredPrograms = useMemo(() => {
    return programs.filter(program => {
      const matchesSearch = program.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'published' && program.is_published) ||
        (filterStatus === 'draft' && !program.is_published) ||
        (filterStatus === 'archived' && program.status === 'archived');
      return matchesSearch && matchesStatus;
    });
  }, [programs, searchTerm, filterStatus]);

  // ============================================
  // ESTATÍSTICAS
  // ============================================

  const stats = useMemo(() => {
    return {
      total: programs.length,
      published: programs.filter(p => p.is_published).length,
      draft: programs.filter(p => !p.is_published).length,
      archived: programs.filter(p => p.status === 'archived').length
    };
  }, [programs]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleCreateProgram = useCallback(async () => {
    try {
      setCurrentView('create');
      setEditingProgramId(null);
    } catch (error) {
      console.error('Erro ao iniciar criação:', error);
    }
  }, []);

  const handleEditProgram = useCallback((programId: string) => {
    setEditingProgramId(programId);
    setCurrentView('edit');
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentView('list');
    setEditingProgramId(null);
    refresh(); // Atualizar lista ao voltar
  }, [refresh]);

  const handleSaveProgram = useCallback((programId: string) => {
    toast.success('Programa salvo com sucesso!');
    setCurrentView('list');
    setEditingProgramId(null);
    refresh();
  }, [refresh]);

  const handleViewProgram = useCallback((program: any) => {
    setSelectedProgram(program);
    setIsPreviewOpen(true);
  }, []);

  const handleTogglePublish = useCallback(async (programId: string, isPublished: boolean) => {
    try {
      if (isPublished) {
        await unpublishProgram(programId);
      } else {
        await publishProgram(programId);
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  }, [publishProgram, unpublishProgram]);

  const handleDeleteProgram = useCallback(async (programId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este programa?')) {
      try {
        await deleteProgram(programId);
      } catch (error) {
        console.error('Erro ao excluir programa:', error);
      }
    }
  }, [deleteProgram]);

  const handleDuplicateProgram = useCallback(async (programId: string) => {
    try {
      const originalProgram = programs.find(p => p.id === programId);
      if (originalProgram) {
        await createProgram({
          title: `${originalProgram.title} (Cópia)`,
          category: originalProgram.category,
          modality: originalProgram.modality,
          level: originalProgram.level,
          duration: originalProgram.duration,
          duration_type: originalProgram.duration_type,
          frequency: originalProgram.frequency,
          base_price: originalProgram.base_price,
          program_data: {
            ...originalProgram.program_data
          }
        });
        toast.success('Programa duplicado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao duplicar programa:', error);
    }
  }, [programs, createProgram]);

  // ============================================
  // RENDER VIEWS
  // ============================================

  // Mostrar criação/edição
  if (currentView === 'create' || currentView === 'edit') {
    return (
      <div className="space-y-6">
        <ProgramCreationSimple
          programId={editingProgramId || undefined}
          onBack={handleBackToList}
          onSave={handleSaveProgram}
        />
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="w-full min-h-screen">

      {/* Header apenas para esta seção */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Gerenciar Programas</h1>
              <p className="text-sm text-muted-foreground">
                Controle seus programas de treino e visualize estatísticas
              </p>
            </div>
            
            {/* Botão de criar programa */}
            <Button onClick={handleCreateProgram} className="bg-brand hover:bg-brand-hover">
              <Plus className="h-4 w-4 mr-2" />
              Novo Programa
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pb-8 space-y-8">
        <div className="w-full px-4 lg:px-6">

          {/* Progress Overview Card */}
          <div className="bg-gradient-to-r from-brand to-brand-hover rounded-xl p-4 sm:p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-semibold">Programas de Treinamento</h3>
                <p className="text-white/80 text-sm hidden sm:block">Gerencie seus programas e alcance mais clientes</p>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold">
                  {stats.published}
                </div>
                <p className="text-white/80 text-xs">Publicados</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold">{stats.total}</div>
                <div className="text-white/80 text-xs">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold">{stats.draft}</div>
                <div className="text-white/80 text-xs">Rascunhos</div>
              </div>
              <div>
                <div className="text-lg font-bold">{stats.archived}</div>
                <div className="text-white/80 text-xs">Arquivados</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar programas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="published">Publicados</SelectItem>
                  <SelectItem value="draft">Rascunhos</SelectItem>
                  <SelectItem value="archived">Arquivados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand" />
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Carregando programas</h3>
                  <p className="text-sm text-muted-foreground">Buscando seus programas...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={refresh} className="bg-brand hover:bg-brand-hover">
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}

          {/* Programs Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {filteredPrograms.map((program) => (
                <DashboardProgramCard
                  key={program.id}
                  id={program.id}
                  title={program.title || 'Programa sem título'}
                  image={getImageForProgram(program.category, program.title)}
                  level={program.level || 'Não informado'}
                  category={program.category || 'Não informado'}
                  duration={`${program.duration} ${program.duration_type || 'semanas'}`}
                  students={`0 alunos`}
                  rating={4.8}
                  price={`R$ ${program.base_price?.toFixed(2) || '0,00'}`}
                  programData={program.program_data}
                  trainer={{
                    name: name,
                    avatar: avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
                    initials: initials
                  }}
                  onNavigateToProgram={() => handleViewProgram(program)}
                  onEdit={() => handleEditProgram(program.id)}
                  onDuplicate={() => handleDuplicateProgram(program.id)}
                  onDelete={() => handleDeleteProgram(program.id)}
                  onView={() => handleViewProgram(program)}
                  status={getStatusBadge(program.status, program.is_published)}
                  isPublished={program.is_published}
                  onTogglePublish={() => handleTogglePublish(program.id, program.is_published)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredPrograms.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm || filterStatus !== 'all' ? 'Nenhum programa encontrado' : 'Nenhum programa criado ainda'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros ou busca'
                  : 'Comece criando seu primeiro programa de treinamento'
                }
              </p>
              {(!searchTerm && filterStatus === 'all') && (
                <Button onClick={handleCreateProgram} className="bg-brand hover:bg-brand-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Programa
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProgram?.title || "Programa"}</DialogTitle>
            <DialogDescription>
              {selectedProgram?.program_data?.shortDescription || "Visualização do programa"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={selectedProgram?.program_data?.coverImage || getImageForProgram(selectedProgram?.category || '', selectedProgram?.title)}
                alt={selectedProgram?.title || "Programa"}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedProgram?.duration} {selectedProgram?.duration_type || "semanas"}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedProgram?.level || "Nível não informado"}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedProgram?.modality || "Modalidade não informada"}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <div className="font-semibold text-lg">
                  R$ {selectedProgram?.base_price?.toFixed(2) || '0,00'}
                </div>
                <div className="text-sm text-muted-foreground">Valor do programa</div>
              </div>
              {getStatusBadge(selectedProgram?.status || 'draft', selectedProgram?.is_published || false)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProgramsManagementSimple;