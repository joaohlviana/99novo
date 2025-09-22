import { useState } from 'react';
import { 
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Download,
  FileText,
  MessageCircle,
  Star,
  Calendar,
  Users,
  Award,
  BookOpen,
  Monitor,
  ExternalLink,
  Settings,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  MoreVertical,
  User,
  Share2,
  Flag,
  SkipBack,
  SkipForward,
  Maximize2,
  PictureInPicture
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { PageShell } from '../layout/PageShell';
import { ContentGrid } from '../layout/ContentGrid';
import { Main } from '../layout/Main';
import { Aside } from '../layout/Aside';
import { Section } from '../layout/Section';
import { CardShell } from '../layout/CardShell';

import { useAppNavigation } from '../../hooks/useAppNavigation';

interface CourseVideoPageProps {
  programId: string;
}

// Mock data expandido para o programa específico
const getCourseDetails = (id: string) => {
  return {
    id: '1',
    title: 'Hipertrofia Completa',
    description: 'Programa focado em ganho de massa muscular com treinos estruturados e progressivos para resultados duradouros',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    type: 'course',
    trainer: {
      id: '1',
      name: 'João Silva',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      initials: 'JS',
      specialty: 'Personal Trainer',
      rating: 4.9,
      responseTime: '2h',
      certifications: ['CREF 123456', 'Personal Trainer'],
      students: 234
    },
    status: 'active',
    progress: 45,
    duration: '12 semanas',
    remainingTime: '7 semanas',
    startDate: '2024-01-15',
    endDate: '2024-04-08',
    price: 'R$ 297',
    category: 'Musculação',
    level: 'Intermediário',
    rating: 4.9,
    students: '234 alunos',
    videosCompleted: 18,
    totalVideos: 40,
    nextVideo: 'Treino de Peito e Tríceps',
    userRating: null,
    unreadMessages: 3,
    lastAccess: '2024-01-30T08:00:00Z',
    features: [
      '40 vídeos de treino',
      'Acompanhamento personalizado',
      'Plano nutricional',
      'Grupo VIP no WhatsApp'
    ],
    courseContent: {
      modules: [
        {
          id: '1',
          title: 'Fundamentos da Hipertrofia',
          description: 'Base teórica e conceitos essenciais',
          duration: '2h 48min',
          lessons: [
            { id: '1.1', title: 'Introdução à Hipertrofia', duration: '12:30', completed: true, type: 'video' },
            { id: '1.2', title: 'Princípios do Treinamento', duration: '15:45', completed: true, type: 'video' },
            { id: '1.3', title: 'Anatomia Básica', duration: '18:20', completed: true, type: 'video' },
            { id: '1.4', title: 'Avaliação Inicial', duration: '22:10', completed: false, type: 'video' }
          ]
        },
        {
          id: '2',
          title: 'Treino de Peito e Tríceps',
          description: 'Exercícios e técnicas para membros superiores',
          duration: '3h 12min',
          lessons: [
            { id: '2.1', title: 'Aquecimento Específico', duration: '8:15', completed: true, type: 'video' },
            { id: '2.2', title: 'Supino Reto - Técnica', duration: '16:30', completed: true, type: 'video' },
            { id: '2.3', title: 'Exercícios para Tríceps', duration: '14:45', completed: false, type: 'video' },
            { id: '2.4', title: 'Finalização e Alongamento', duration: '10:20', completed: false, type: 'video' }
          ]
        },
        {
          id: '3',
          title: 'Treino de Costas e Bíceps',
          description: 'Desenvolvimento da musculatura posterior',
          duration: '2h 56min',
          lessons: [
            { id: '3.1', title: 'Ativação Muscular', duration: '9:40', completed: false, type: 'video' },
            { id: '3.2', title: 'Puxada Frontal', duration: '13:25', completed: false, type: 'video' },
            { id: '3.3', title: 'Exercícios para Bíceps', duration: '12:15', completed: false, type: 'video' },
            { id: '3.4', title: 'Cool Down', duration: '8:30', completed: false, type: 'video' }
          ]
        }
      ]
    }
  };
};

export function CourseVideoPage({ programId }: CourseVideoPageProps) {
  const navigation = useAppNavigation();
  const [activeModule, setActiveModule] = useState<string>('1');
  const [currentLesson, setCurrentLesson] = useState<string>('2.2'); // Começar na aula atual
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [currentTime, setCurrentTime] = useState(156); // 2:36
  const [duration, setDuration] = useState(990); // 16:30

  const course = getCourseDetails(programId);

  const getCurrentLesson = () => {
    for (const module of course.courseContent.modules) {
      const lesson = module.lessons.find(l => l.id === currentLesson);
      if (lesson) return { lesson, module };
    }
    return null;
  };

  const currentLessonData = getCurrentLesson();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getNextLesson = () => {
    const allLessons = course.courseContent.modules.flatMap(module => 
      module.lessons.map(lesson => ({ ...lesson, moduleId: module.id }))
    );
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson);
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  };

  const getPreviousLesson = () => {
    const allLessons = course.courseContent.modules.flatMap(module => 
      module.lessons.map(lesson => ({ ...lesson, moduleId: module.id }))
    );
    const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson);
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  };

  const nextLesson = getNextLesson();
  const prevLesson = getPreviousLesson();

  const progressPercentage = (currentTime / duration) * 100;

  return (
    <PageShell>
      {/* Header com breadcrumb */}
      <div className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="container py-3">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={navigation.navigateToClientDashboard}
              className="gap-2 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Separator orientation="vertical" className="h-6 bg-gray-600" />
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                <Monitor className="h-3 w-3 mr-1" />
                Curso Online
              </Badge>
              <h1 className="font-semibold text-white truncate">{course.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <ContentGrid hasAside className="bg-black min-h-screen">
        <Main className="bg-black">
          {/* Video Player */}
          <div className="relative bg-black aspect-video">
            <img 
              src={course.image}
              alt={currentLessonData?.lesson.title || course.title}
              className="w-full h-full object-cover"
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="lg"
                className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
              </Button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4 group cursor-pointer">
                <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                  <div className="absolute top-0 h-full w-3 bg-red-500 rounded-full shadow-lg transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                       style={{ left: `${progressPercentage}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    disabled={!prevLesson}
                    onClick={() => prevLesson && setCurrentLesson(prevLesson.id)}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                    disabled={!nextLesson}
                    onClick={() => nextLesson && setCurrentLesson(nextLesson.id)}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <span className="text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10"
                      >
                        {playbackSpeed}x
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                        <DropdownMenuItem 
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                        >
                          {speed}x
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    <PictureInPicture className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Info and Tabs */}
          <div className="bg-white">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {currentLessonData?.lesson.title || 'Carregando...'}
                  </h2>
                  <p className="text-muted-foreground mb-3">
                    {currentLessonData?.module.title} • Aula {currentLesson}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Vídeo
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      Material de Apoio
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 mr-2" />
                      Reportar Problema
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <Button variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Concluída
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowTranscript(!showTranscript)}>
                  <FileText className="h-4 w-4 mr-2" />
                  {showTranscript ? 'Ocultar' : 'Ver'} Transcrição
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowNotes(!showNotes)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  {showNotes ? 'Ocultar' : 'Ver'} Anotações
                </Button>
              </div>

              {/* Tabs para conteúdo adicional */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="transcript">Transcrição</TabsTrigger>
                  <TabsTrigger value="notes">Anotações</TabsTrigger>
                  <TabsTrigger value="resources">Recursos</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Progresso do Curso</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-muted-foreground">{course.videosCompleted}/{course.totalVideos} aulas</span>
                          <span className="text-sm font-medium">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="mb-2" />
                        <p className="text-sm text-muted-foreground">Você está indo muito bem!</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Próximas Aulas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {nextLesson && (
                            <div 
                              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => setCurrentLesson(nextLesson.id)}
                            >
                              <Play className="h-4 w-4 text-[var(--brand)]" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{nextLesson.title}</p>
                                <p className="text-xs text-muted-foreground">{nextLesson.duration}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="transcript" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Transcrição da Aula</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-4 text-sm leading-relaxed">
                          <p><strong>[00:00]</strong> Olá pessoal, sejam bem-vindos a mais uma aula do nosso programa de hipertrofia.</p>
                          <p><strong>[00:15]</strong> Hoje vamos trabalhar especificamente os músculos do peito e tríceps, focando na técnica correta e na execução perfeita dos movimentos.</p>
                          <p><strong>[00:30]</strong> Antes de começarmos, é importante que vocês já tenham feito o aquecimento que ensinei na aula anterior.</p>
                          <p><strong>[00:45]</strong> Vamos começar com o supino reto, que é um dos exercícios mais importantes para o desenvolvimento do peitoral.</p>
                          <p><strong>[01:00]</strong> A pegada deve ser um pouco mais larga que a largura dos ombros, e o movimento deve ser controlado tanto na descida quanto na subida.</p>
                          <p><strong>[01:20]</strong> Lembrem-se sempre de manter a escápula retraída e o core ativado durante todo o movimento.</p>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notes" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Minhas Anotações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">2:30</span>
                          </div>
                          <p className="text-sm text-yellow-700">Lembrar de manter a escápula retraída durante o supino</p>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">5:45</span>
                          </div>
                          <p className="text-sm text-blue-700">Importante: respiração correta no movimento</p>
                        </div>

                        <Button variant="outline" size="sm" className="w-full">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Adicionar Nova Anotação
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="resources" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-3">
                          <FileText className="h-8 w-8 text-blue-500" />
                          <div>
                            <h4 className="font-medium">Planilha de Treino</h4>
                            <p className="text-sm text-muted-foreground">PDF • 2.5MB</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-3">
                          <FileText className="h-8 w-8 text-green-500" />
                          <div>
                            <h4 className="font-medium">Guia Nutricional</h4>
                            <p className="text-sm text-muted-foreground">PDF • 1.8MB</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Main>

        <Aside className="bg-white">
          {/* Course Modules */}
          <CardShell>
            <h3 className="font-medium mb-4">Conteúdo do Curso</h3>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {course.courseContent.modules.map((module) => (
                  <div key={module.id} className="space-y-2">
                    <Button
                      variant={activeModule === module.id ? "default" : "ghost"}
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => setActiveModule(module.id)}
                    >
                      <div>
                        <div className="font-medium">{module.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {module.lessons.filter(l => l.completed).length}/{module.lessons.length} aulas • {module.duration}
                        </div>
                      </div>
                    </Button>

                    {activeModule === module.id && (
                      <div className="ml-3 space-y-1">
                        {module.lessons.map((lesson) => (
                          <Button
                            key={lesson.id}
                            variant={currentLesson === lesson.id ? "secondary" : "ghost"}
                            className="w-full justify-start text-left h-auto p-2 text-sm"
                            onClick={() => setCurrentLesson(lesson.id)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              {lesson.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              ) : currentLesson === lesson.id ? (
                                <Play className="h-4 w-4 text-[var(--brand)] flex-shrink-0" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                              )}
                              <div className="flex-1 truncate">
                                <div className="truncate">{lesson.title}</div>
                                <div className="text-xs text-muted-foreground">{lesson.duration}</div>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardShell>
        </Aside>
      </ContentGrid>
    </PageShell>
  );
}