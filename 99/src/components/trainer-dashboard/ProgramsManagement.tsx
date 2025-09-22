import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Eye, 
  Trash2, 
  Copy, 
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Play,
  Pause,
  FileText,
  Target,
  Clock,
  ArrowLeft,
  Edit2,
  EyeOff,
  CheckCircle,
  Settings,
  BarChart3,
  Save,
  MapPin
} from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { ProgramCreation, ProgramData } from './ProgramCreation';
import { DashboardProgramCard } from '../DashboardProgramCard';

// Helper function to get appropriate image for program type
const getImageForProgram = (title: string) => {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('yoga') || lowerTitle.includes('pilates') || lowerTitle.includes('meditação')) {
    return "https://images.unsplash.com/photo-1723406251893-88cfd80c566b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWVkaXRhdGlvbiUyMGV4ZXJjaXNlfGVufDF8fHx8MTc1NjI2NzMyOHww&ixlib=rb-4.1.0&q=80&w=1080";
  }
  
  if (lowerTitle.includes('cardio') || lowerTitle.includes('corrida') || lowerTitle.includes('running') || lowerTitle.includes('condicionamento')) {
    return "https://images.unsplash.com/photo-1737736193172-f3b87a760ad5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwY2FyZGlvJTIwZml0bmVzc3xlbnwxfHx8fDE3NTYyNjczMzF8MA&ixlib=rb-4.1.0&q=80&w=1080";
  }
  
  // Default fitness/gym image for weight training, muscle building, etc.
  return "https://images.unsplash.com/photo-1573858129038-6f98c3cb2ac7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5pbmclMjB3b3Jrb3V0JTIwZ3ltfGVufDF8fHx8MTc1NjE3MTk3M3ww&ixlib=rb-4.1.0&q=80&w=1080";
};

interface Program {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  category: string;
  status: 'Publicado' | 'Rascunho' | 'Pausado';
  students: number;
  views: number;
  revenue: number;
  createdAt: string;
  thumbnail: string;
}

export function ProgramsManagement() {
  const [activeTab, setActiveTab] = useState('programas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProgram, setEditingProgram] = useState<ProgramData | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedProgramForPreview, setSelectedProgramForPreview] = useState<Program | null>(null);
  
  // Original data for comparison
  const originalData = {
    searchTerm: '',
    filterStatus: 'all'
  };

  // Programs state - now managed as state
  const [programs, setPrograms] = useState<Program[]>([
    {
      id: '1',
      title: 'Transformação Corporal Completa',
      description: 'Programa completo de 12 semanas para transformação corporal total',
      price: 297,
      duration: '12 semanas',
      level: 'Intermediário',
      category: 'Musculação',
      status: 'Publicado',
      students: 28,
      views: 1234,
      revenue: 8316,
      createdAt: '2024-01-15',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80'
    },
    {
      id: '2',
      title: 'Hipertrofia Avançada',
      description: 'Programa intensivo para ganho de massa muscular',
      price: 397,
      duration: '16 semanas',
      level: 'Avançado',
      category: 'Musculação',
      status: 'Publicado',
      students: 15,
      views: 892,
      revenue: 5955,
      createdAt: '2024-02-01',
      thumbnail: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80'
    },
    {
      id: '3',
      title: 'Condicionamento Físico',
      description: 'Melhore seu condicionamento físico em 8 semanas',
      price: 197,
      duration: '8 semanas',
      level: 'Iniciante',
      category: 'Funcional',
      status: 'Pausado',
      students: 12,
      views: 654,
      revenue: 2364,
      createdAt: '2024-01-20',
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80'
    },
    {
      id: '4',
      title: 'Emagrecimento Acelerado',
      description: 'Programa para perda de peso rápida e saudável',
      price: 247,
      duration: '10 semanas',
      level: 'Iniciante',
      category: 'Emagrecimento',
      status: 'Rascunho',
      students: 0,
      views: 0,
      revenue: 0,
      createdAt: '2024-02-10',
      thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80'
    }
  ]);

  // Custom scroll function that considers the sticky menu offset
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - 70; // 70px offset for sticky menu

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Helper functions to check for changes
  const hasFiltersChanges = () => {
    return searchTerm !== originalData.searchTerm ||
           filterStatus !== originalData.filterStatus;
  };

  // Section save handlers
  const handleSaveFilters = () => {
    // Here you would save the filter data to your backend
    console.log('Saving filters:', {
      searchTerm,
      filterStatus
    });
    // Show success toast
    toast.success("Filtros salvos com sucesso!");
  };

  // Intersection Observer to update active section based on scroll position
  useEffect(() => {
    const sections = ['programas', 'estatisticas', 'configuracoes'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '-20% 0px -70% 0px'
      }
    );

    sections.forEach((sectionId) => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || program.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalStats = {
    totalPrograms: programs.length,
    publishedPrograms: programs.filter(p => p.status === 'Publicado').length,
    totalStudents: programs.reduce((sum, p) => sum + p.students, 0),
    totalRevenue: programs.reduce((sum, p) => sum + p.revenue, 0)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Publicado':
        return <Badge className="bg-green-100 text-green-800 text-xs">Publicado</Badge>;
      case 'Rascunho':
        return <Badge variant="secondary" className="text-xs">Rascunho</Badge>;
      case 'Pausado':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pausado</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const handleCreateProgram = () => {
    setCurrentView('create');
    setEditingProgram(null);
  };

  const handleEditProgram = (programId: string) => {
    // Find the program by ID
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    // Convert Program to ProgramData format for editing
    const programData: ProgramData = {
      title: program.title,
      category: program.category,
      modality: 'Online', // Default, can be extended
      level: program.level,
      tags: [program.category.toLowerCase()], // Generate basic tags
      description: program.description,
      objectives: [
        'Melhorar condicionamento físico',
        'Atingir objetivos específicos',
        'Desenvolver técnica apropriada'
      ], // Default objectives
      requirements: [
        'Dedicação e disciplina',
        'Seguir as orientações do programa'
      ], // Default requirements
      whatYouGet: [
        `${program.duration} de treinamento`,
        'Suporte profissional',
        'Acompanhamento personalizado'
      ], // Default benefits
      duration: parseInt(program.duration.split(' ')[0]) || 12, // Extract number from duration
      durationType: program.duration.includes('semana') ? 'weeks' : 'months',
      frequency: 3, // Default frequency
      sessionDuration: 60, // Default session duration
      schedule: [], // Empty schedule for editing
      packages: [
        {
          name: 'Programa Completo',
          price: program.price,
          description: program.description,
          features: [
            'Acesso completo ao programa',
            'Suporte via WhatsApp',
            'Material complementar'
          ],
          deliveryTime: 1,
          revisions: 2
        }
      ],
      addOns: [], // Empty add-ons for editing
      coverImage: program.thumbnail,
      gallery: [], // Empty gallery for editing
      videos: [], // Empty videos for editing
      isPublished: program.status === 'Publicado',
      createdAt: program.createdAt + 'T00:00:00Z',
      updatedAt: new Date().toISOString()
    };
    
    setEditingProgram(programData);
    setCurrentView('edit');
  };

  const handleSaveProgram = (program: ProgramData) => {
    // In a real app, you would save to the backend
    console.log('Saving program:', program);
    
    // Show success toast
    toast.success(
      editingProgram ? "Programa atualizado com sucesso!" : "Programa criado com sucesso!",
      {
        description: `"${program.title}" foi ${editingProgram ? 'atualizado' : 'criado'} e está pronto para uso.`,
        duration: 4000,
        icon: <CheckCircle className="h-4 w-4" />
      }
    );
    
    setCurrentView('list');
    setEditingProgram(null);
  };

  const handleCancelCreation = () => {
    setCurrentView('list');
    setEditingProgram(null);
  };

  // Function to toggle program status
  const toggleProgramStatus = (programId: string) => {
    setPrograms(currentPrograms => 
      currentPrograms.map(program => {
        if (program.id === programId) {
          const newStatus = program.status === 'Publicado' ? 'Pausado' : 'Publicado';
          return {
            ...program,
            status: newStatus as 'Publicado' | 'Rascunho' | 'Pausado'
          };
        }
        return program;
      })
    );
  };

  // Show creation/edit view
  if (currentView === 'create' || currentView === 'edit') {
    return (
      <div className="space-y-6">
        <ProgramCreation
          editingProgram={editingProgram || undefined}
          onSave={handleSaveProgram}
          onCancel={handleCancelCreation}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen space-y-8">
      {/* Header Section */}
      <div className="space-y-2 px-4 lg:px-6 m-[0px]">
        <h1 className="text-2xl font-semibold p-[0px] mt-[20px] mr-[0px] mb-[7px] ml-[0px]">Gerenciar Programas</h1>
        <p className="text-muted-foreground">
          Controle seus programas de treino, visualize estatísticas e gerencie configurações.
        </p>
      </div>

      {/* Layout Responsivo Full-Width */}
      <div className="w-full px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Mobile: Horizontal scroll, Desktop: Vertical fixo */}
          

          {/* Área de Conteúdo Principal - Agora ocupa toda largura disponível */}
          <div className="w-full lg:flex-1 space-y-6 lg:space-y-8">
          {/* Programas */}
          <section className="space-y-4 lg:space-y-6" id="programas">
            <div className="flex items-center justify-between">
              {hasFiltersChanges() && (
                <Button onClick={handleSaveFilters} className="bg-[#e0093e] hover:bg-[#c0082e]">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              )}
            </div>

            {/* Ação Principal */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
              
              <Button 
                onClick={handleCreateProgram}
                className="bg-[#e0093e] hover:bg-[#c0082e] w-full sm:w-auto"
                data-create-program
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Programa
              </Button>
            </div>

            {/* Programs Grid - Responsivo Otimizado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {filteredPrograms.map((program) => (
                  <DashboardProgramCard
                    key={program.id}
                    id={program.id}
                    title={program.title}
                    image={getImageForProgram(program.title)}
                    level={program.level}
                    category={program.category}
                    duration={program.duration}
                    students={`${program.students} alunos`}
                    rating={4.8} // Default rating for dashboard
                    price={`R$ ${program.price}`}
                    trainer={{
                      name: "João Silva", // Current trainer name
                      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
                      initials: "JS"
                    }}
                    onNavigateToProgram={(id) => {
                      setSelectedProgramForPreview(program);
                      setIsPreviewDialogOpen(true);
                    }}
                    onEdit={(id) => handleEditProgram(id)}
                    onDuplicate={(id) => {
                      toast.success(`Programa "${program.title}" duplicado com sucesso!`);
                    }}
                    onDelete={(id) => {
                      toast.success(`Programa "${program.title}" excluído com sucesso!`);
                    }}
                    onView={(id) => {
                      setSelectedProgramForPreview(program);
                      setIsPreviewDialogOpen(true);
                    }}
                  />
                ))}
            </div>
          </section>

          {/* Estatísticas */}
          
          </div>
        </div>
      </div>

      {/* Dialog para Preview Ampliado */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProgramForPreview?.title || "Programa"}</DialogTitle>
            <DialogDescription>{selectedProgramForPreview?.description || "Descrição do programa aparecerá aqui..."}</DialogDescription>
          </DialogHeader>
          
          {/* Imagem do Programa */}
          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
            <ImageWithFallback
              src={selectedProgramForPreview ? getImageForProgram(selectedProgramForPreview.title) : "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80"}
              alt={selectedProgramForPreview?.title || "Programa de treinamento"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{selectedProgramForPreview?.duration || "Duração não informada"}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">100% Online</span>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">O que está incluído:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Acesso completo ao programa</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Suporte via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Material complementar</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Acompanhamento personalizado</span>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Ideal para:</strong> Pessoas que buscam uma transformação corporal completa com acompanhamento profissional
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <div className="font-semibold text-lg">
                  R$ {selectedProgramForPreview?.price || 0}
                </div>
                <div className="text-sm text-muted-foreground">Valor único</div>
              </div>
              <Button className="bg-[#e0093e] hover:bg-[#c0082e] text-white">
                Falar por WhatsApp
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}