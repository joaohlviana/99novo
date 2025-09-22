import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Monitor,
  FileText,
  MessageCircle,
  Settings,
  Users,
  Eye,
  EyeOff,
  Clock,
  X,
  Save,
  BarChart3,
  Info,
  Package,
  Target,
  DollarSign,
  Star,
  CheckCircle,
  Edit,
  MoreVertical,
  Copy,
  Play,
  Heart,
  Dumbbell,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner@2.0.3";

interface CustomService {
  id: string;
  name: string;
  shortDescription: string;
  modality:
    | "presencial"
    | "online"
    | "planilha"
    | "consultoria"
    | "personalizado";
  duration: string;
  location: string;
  includedItems: string[];
  idealFor: string;
  priceOptions: {
    label: string;
    value: string;
    isDefault?: boolean;
  }[];
  isDefault?: boolean;
  status: "active" | "inactive";
  createdAt: string;
  studentsCount?: number;
}

const initialServices: CustomService[] = [
  {
    id: "1",
    name: "Treino Presencial Individual",
    shortDescription:
      "Treino individual personalizado com acompanhamento presencial completo",
    modality: "presencial",
    duration: "1 hora por sessão",
    location: "Academia ou domicílio (São Paulo)",
    includedItems: [
      "Avaliação física completa",
      "Treino personalizado",
      "Acompanhamento em tempo real",
      "Ajustes de execução",
      "Plano nutricional básico",
    ],
    idealFor:
      "Pessoas que buscam resultados rápidos com acompanhamento próximo e correção técnica.",
    priceOptions: [
      { label: "Por hora", value: "R$ 65/h", isDefault: true },
      { label: "Pacote mensal", value: "R$ 350/mês" },
    ],
    isDefault: true,
    status: "active",
    createdAt: "2024-01-15",
    studentsCount: 12,
  },
  {
    id: "2",
    name: "Planilha de Treino Personalizada",
    shortDescription:
      "3 treinos por semana com planilha personalizada e acompanhamento semanal",
    modality: "planilha",
    duration: "Flexível",
    location: "Online - qualquer lugar",
    includedItems: [
      "Planilha personalizada completa",
      "Acompanhamento semanal",
      "Ajustes mensais",
      "Suporte via WhatsApp",
      "Vídeos explicativos",
    ],
    idealFor:
      "Pessoas que preferem treinar sozinhas mas querem orientação profissional.",
    priceOptions: [
      { label: "Por hora de consultoria", value: "R$ 45/h" },
      {
        label: "Plano mensal",
        value: "R$ 180/mês",
        isDefault: true,
      },
    ],
    isDefault: true,
    status: "active",
    createdAt: "2024-01-10",
    studentsCount: 28,
  },
  {
    id: "3",
    name: "Consultoria Online Mensal",
    shortDescription:
      "Acompanhamento mensal com análise de evolução, ajustes e orientações",
    modality: "consultoria",
    duration: "2 horas por mês",
    location: "Videochamada",
    includedItems: [
      "Análise de evolução mensal",
      "Ajustes no plano de treino",
      "Orientação nutricional",
      "Planejamento de metas",
      "Suporte via chat",
    ],
    idealFor:
      "Pessoas experientes que precisam apenas de orientação e acompanhamento periódico.",
    priceOptions: [
      { label: "Mensal", value: "R$ 150/mês", isDefault: true },
    ],
    isDefault: true,
    status: "active",
    createdAt: "2024-01-05",
    studentsCount: 15,
  },
];

const modalityConfig = {
  presencial: {
    label: "Presencial",
    icon: MapPin,
    color: "bg-green-100 text-green-700 border-green-200",
    dotColor: "bg-green-500",
    image: "https://images.unsplash.com/photo-1745329532593-53a9ec306787?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjB3b3Jrb3V0JTIwZ3ltfGVufDF8fHx8MTc1NjQ0MDA5OXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  online: {
    label: "Online",
    icon: Monitor,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
    image: "https://images.unsplash.com/photo-1576491742123-735882d4ca7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBmaXRuZXNzJTIwd29ya291dCUyMGNvbXB1dGVyfGVufDF8fHx8MTc1NjQ0MDEwNXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  planilha: {
    label: "Planilha",
    icon: FileText,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
    image: "https://images.unsplash.com/photo-1692158961713-73690ef06e6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrb3V0JTIwcGxhbiUyMHNwcmVhZHNoZWV0JTIwbm90ZWJvb2t8ZW58MXx8fHwxNzU2NDQwMTA4fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  consultoria: {
    label: "Consultoria",
    icon: MessageCircle,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    dotColor: "bg-orange-500",
    image: "https://images.unsplash.com/photo-1738523686878-e63f7d95dabf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwY29uc3VsdGF0aW9uJTIwY29hY2hpbmd8ZW58MXx8fHwxNzU2NDQwMTExfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  personalizado: {
    label: "Personalizado",
    icon: Settings,
    color: "bg-gray-100 text-gray-700 border-gray-200",
    dotColor: "bg-gray-500",
    image: "https://images.unsplash.com/photo-1648659125396-5bf148702e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjBmaXRuZXNzJTIwdHJhaW5pbmclMjBwZXJzb25hbGl6ZWR8ZW58MXx8fHwxNzU2NDQwMTE1fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
};

export function CustomTrainingManagement() {
  const [activeTab, setActiveTab] = useState("servicos");
  const [services, setServices] =
    useState<CustomService[]>(initialServices);
  const [currentView, setCurrentView] = useState<
    "list" | "create" | "edit"
  >("list");
  const [editingService, setEditingService] =
    useState<CustomService | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] =
    useState(false);
  const [selectedServiceForPreview, setSelectedServiceForPreview] =
    useState<CustomService | null>(null);
  
  // States for new card interactions
  const [likedServices, setLikedServices] = useState<Set<string>>(new Set());
  const [enrolledServices, setEnrolledServices] = useState<Set<string>>(new Set());

  const handleCreateService = () => {
    setEditingService(null);
    setIsEditing(false);
    setCurrentView("create");
  };

  const handleEditService = (service: CustomService) => {
    setEditingService(service);
    setIsEditing(true);
    setCurrentView("edit");
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              status:
                service.status === "active"
                  ? "inactive"
                  : "active",
            }
          : service,
      ),
    );
  };

  const getDefaultPrice = (service: CustomService) => {
    const defaultOption = service.priceOptions.find(
      (option) => option.isDefault,
    );
    return (
      defaultOption?.value ||
      service.priceOptions[0]?.value ||
      ""
    );
  };

  const handleToggleLike = (serviceId: string) => {
    setLikedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const handleDuplicateService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      toast.success(`Serviço "${service.name}" duplicado com sucesso!`);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      toast.success(`Serviço "${service.name}" excluído com sucesso!`);
    }
  };

  // Return main view - CLEAN FULL-WIDTH
  return (
    <div className="w-full min-h-screen space-y-8">
      {/* Header Section */}
      <div className="space-y-2 px-4 lg:px-6">
        <h1 className="text-2xl font-semibold mt-[20px] mr-[0px] mb-[7px] ml-[0px]">Gerenciar Serviços</h1>
        <p className="text-muted-foreground">
          Controle seus serviços personalizados, visualize estatísticas e gerencie configurações.
        </p>
      </div>

      {/* Serviços Section - Com padding mínimo controlado */}
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="w-full space-y-6">
          {/* Ação Principal */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
            
            <Button
              onClick={handleCreateService}
              className="bg-[#e0093e] hover:bg-[#c0082e] w-full sm:w-auto"
              data-create-service
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Serviço
            </Button>
          </div>

          {/* Services Grid - Máximo aproveitamento do espaço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {services.map((service) => {
              const isActive = service.status === "active";
              const config = modalityConfig[service.modality];
              const isLiked = likedServices.has(service.id);
              const isEnrolled = enrolledServices.has(service.id);
              
              return (
                <Card 
                  key={service.id} 
                  className="w-full group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                >
                  <CardContent className="p-0">
                    {/* Program Images Grid */}
                    <div className="relative h-40 sm:h-48 bg-gray-100">
                      <div className="h-full">
                        <div className="relative rounded-xl overflow-hidden bg-gray-200 h-full">
                          <ImageWithFallback
                            src={config.image || "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400"}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Gradient overlay for text visibility */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                        </div>
                      </div>
                      
                      {/* Quick Actions - Always visible for dashboard */}
                      <div className="absolute top-3 right-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full bg-white/90 backdrop-blur-sm border border-white/20 hover:bg-white transition-all duration-200"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-700" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => {
                              setSelectedServiceForPreview(service);
                              setIsPreviewDialogOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditService(service)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateService(service.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteService(service.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Online badge in top left */}
                      <div className="absolute top-3 left-3">
                        <div className="px-2 py-1 bg-black/80 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <span className="text-white text-xs font-medium">{config.label.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Section */}
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-10 relative">
                      {/* Avatar and Name Row */}
                      <div className="flex items-start gap-2 mb-4">
                        <div className="relative">
                          <Avatar className="w-14 h-14 sm:w-16 sm:h-16 ring-4 ring-white shadow-lg">
                            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" alt="João Silva" />
                            <AvatarFallback className="bg-gray-900 text-white text-lg sm:text-xl font-semibold">
                              JS
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        {/* Trainer Name */}
                        <div className="flex-1 pt-1">
                          <div className="text-base sm:text-lg font-semibold text-white mt-2">
                            João Silva
                          </div>
                          <div className="text-sm text-gray-600">
                            Personal
                          </div>
                        </div>
                      </div>

                      {/* Information Stack */}
                      <div className="text-left space-y-2">
                        {/* Program Title */}
                        <div className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                          {service.name}
                        </div>

                        {/* Program Description */}
                        <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {service.shortDescription}
                        </div>

                        {/* Program Type */}
                        <div className="text-sm text-gray-600 m-0 p-0">
                          <div className="flex items-center">
                            <Dumbbell className="w-4 h-4 mr-1 text-red-600" />
                            <span>{config.label} • {service.location}</span>
                          </div>
                        </div>

                        {/* Duration, Students, Rating in responsive layout */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 py-3">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{service.duration}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">{service.studentsCount || 0} alunos</span>
                            <span className="sm:hidden">{service.studentsCount || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-gray-400 fill-current" />
                            <span className="font-medium text-gray-900">5.0</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 pt-1">
                          {getDefaultPrice(service)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4 sm:mt-6">
                        {/* Main CTA Button */}
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedServiceForPreview(service);
                            setIsPreviewDialogOpen(true);
                          }}
                          className={`flex-1 h-10 sm:h-12 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 ${
                            isEnrolled
                              ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
                              : 'bg-red-600 text-white hover:bg-red-700 border-0 shadow-md'
                          }`}
                        >
                          {!isEnrolled && <Play className="w-4 h-4 mr-2" />}
                          {isEnrolled ? 'Ativo' : 'Ver Serviço'}
                        </Button>
                        
                        {/* Like Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLike(service.id);
                          }}
                          className={`h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-full border transition-all duration-200 ${
                            isLiked 
                              ? 'border-gray-300 bg-gray-100 hover:bg-gray-200' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                            isLiked ? 'text-red-500 fill-current' : 'text-gray-400'
                          }`} />
                        </Button>
                      </div>

                      {/* Secondary Button */}
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditService(service);
                        }}
                        className="w-full h-10 sm:h-12 rounded-full text-sm sm:text-base font-medium border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200 mt-3"
                      >
                        <Edit className="w-4 h-4 mr-2 text-gray-500" />
                        Editar serviço
                      </Button>

                      {/* Status Toggle - Now at bottom */}
                      <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100 mt-4">
                        <Switch
                          id={`service-${service.id}`}
                          checked={service.status === "active"}
                          onCheckedChange={(checked) => {
                            toggleServiceStatus(service.id);
                            toast.success(
                              `Serviço ${checked ? 'ativado' : 'desativado'}!`,
                              {
                                description: `"${service.name}" foi ${checked ? 'ativado e está visível' : 'desativado e não está mais visível'} para os clientes.`,
                                duration: 3000
                              }
                            );
                          }}
                          className="scale-90"
                        />
                        <span className="text-xs text-gray-500">
                          {service.status === "active" ? 'Serviço ativo' : 'Serviço inativo'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dialog para Preview Ampliado do Serviço */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedServiceForPreview?.name || "Serviço"}</DialogTitle>
            <DialogDescription>{selectedServiceForPreview?.shortDescription || "Descrição do serviço aparecerá aqui..."}</DialogDescription>
          </DialogHeader>
          
          {/* Service Image */}
          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
            {selectedServiceForPreview && (
              <>
                <ImageWithFallback
                  src={modalityConfig[selectedServiceForPreview.modality].image}
                  alt={`${modalityConfig[selectedServiceForPreview.modality].label} - ${selectedServiceForPreview.name}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
              </>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{selectedServiceForPreview?.duration || "Duração não informada"}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm">{selectedServiceForPreview?.location || "Local não informado"}</span>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">O que está incluído:</h4>
              <div className="space-y-2">
                {selectedServiceForPreview?.includedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Ideal para:</strong> {selectedServiceForPreview?.idealFor || "Descrição do público-alvo"}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <div className="font-semibold text-lg">
                  {selectedServiceForPreview ? getDefaultPrice(selectedServiceForPreview) : "R$ 0,00"}
                </div>
                <div className="text-sm text-muted-foreground">Valor base</div>
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