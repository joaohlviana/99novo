import { useState } from 'react';
import { 
  ArrowLeft,
  Download,
  FileText,
  Star,
  MessageCircle,
  User,
  ExternalLink,
  BookOpen,
  Eye,
  Share2,
  Bookmark,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  File,
  FileImage,
  Monitor,
  Smartphone,
  Tablet,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Settings,
  Heart,
  ThumbsUp
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { PageShell } from '../layout/PageShell';
import { ContentGrid } from '../layout/ContentGrid';
import { Main } from '../layout/Main';
import { Aside } from '../layout/Aside';
import { Section } from '../layout/Section';
import { CardShell } from '../layout/CardShell';

import { useAppNavigation } from '../../hooks/useAppNavigation';

interface EbookDownloadPageProps {
  programId: string;
}

const getEbookDetails = (id: string) => {
  return {
    id: '2',
    title: 'Guia Completo de Nutrição Esportiva',
    subtitle: 'Tudo que você precisa saber sobre alimentação para performance',
    description: 'Um guia abrangente com estratégias nutricionais baseadas em ciência para maximizar seus resultados no esporte e na academia.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    type: 'ebook',
    trainer: {
      id: '2',
      name: 'Dr. Maria Nutrição',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
      initials: 'MN',
      specialty: 'Nutricionista Esportiva',
      rating: 4.8,
      responseTime: '1h',
      credentials: ['CRN 12345', 'Especialista em Nutrição Esportiva'],
      students: 1240
    },
    status: 'active',
    purchaseDate: '2024-01-20',
    downloadCount: 3,
    maxDownloads: 5,
    price: 'R$ 97',
    category: 'Nutrição',
    level: 'Todos os níveis',
    rating: 4.8,
    reviews: 247,
    pages: 285,
    fileSize: '15.2 MB',
    language: 'Português',
    lastUpdated: '2024-01-15',
    formats: ['PDF', 'EPUB'],
    features: [
      '285 páginas de conteúdo',
      'Mais de 100 receitas',
      '50 planos alimentares',
      'Tabelas nutricionais completas',
      'Atualizações gratuitas',
      'Suporte via WhatsApp'
    ],
    chapters: [
      {
        id: '1',
        title: 'Fundamentos da Nutrição Esportiva',
        pages: '1-35',
        description: 'Bases científicas e princípios fundamentais'
      },
      {
        id: '2',
        title: 'Macronutrientes e Performance',
        pages: '36-78',
        description: 'Carboidratos, proteínas e gorduras no esporte'
      },
      {
        id: '3',
        title: 'Micronutrientes Essenciais',
        pages: '79-120',
        description: 'Vitaminas e minerais para atletas'
      },
      {
        id: '4',
        title: 'Hidratação e Eletrólitos',
        pages: '121-155',
        description: 'Estratégias de hidratação antes, durante e após'
      },
      {
        id: '5',
        title: 'Suplementação Inteligente',
        pages: '156-195',
        description: 'Guia baseado em evidências sobre suplementos'
      },
      {
        id: '6',
        title: 'Planos Alimentares Práticos',
        pages: '196-250',
        description: '50 planos para diferentes objetivos'
      },
      {
        id: '7',
        title: 'Receitas e Preparações',
        pages: '251-285',
        description: 'Mais de 100 receitas testadas'
      }
    ],
    testimonials: [
      {
        id: '1',
        user: 'Carlos Silva',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        rating: 5,
        comment: 'Material incrível! Mudou completamente minha abordagem nutricional.',
        date: '2024-01-25'
      },
      {
        id: '2',
        user: 'Ana Costa',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
        rating: 5,
        comment: 'As receitas são práticas e deliciosas. Recomendo muito!',
        date: '2024-01-22'
      }
    ]
  };
};

export function EbookDownloadPage({ programId }: EbookDownloadPageProps) {
  const navigation = useAppNavigation();
  const [activeTab, setActiveTab] = useState('overview');
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  const ebook = getEbookDetails(programId);

  const handleDownload = (format: string) => {
    // Simular download
    console.log(`Downloading ${ebook.title} in ${format} format`);
    // Aqui seria implementada a lógica real de download
  };

  const handlePreview = () => {
    setPreviewMode(true);
  };

  return (
    <PageShell>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={navigation.navigateToClientDashboard}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Meus Programas
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                <FileText className="h-3 w-3 mr-1" />
                eBook
              </Badge>
              <h1 className="font-semibold text-gray-900 truncate">{ebook.title}</h1>
            </div>
          </div>
        </div>
      </div>

      {!previewMode ? (
        <ContentGrid hasAside>
          <Main>
            {/* Hero Section */}
            <CardShell className="text-center">
              <div className="relative inline-block mb-6">
                <img 
                  src={ebook.coverImage}
                  alt={ebook.title}
                  className="w-48 h-64 object-cover rounded-lg shadow-lg mx-auto"
                />
                <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white p-2 rounded-full">
                  <FileText className="h-4 w-4" />
                </div>
              </div>

              <h1 className="text-3xl font-semibold mb-2">{ebook.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{ebook.subtitle}</p>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{ebook.description}</p>

              {/* Main Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" onClick={() => handleDownload('PDF')} className="gap-2">
                  <Download className="h-5 w-5" />
                  Baixar PDF
                </Button>
                <Button variant="outline" size="lg" onClick={handlePreview} className="gap-2">
                  <Eye className="h-5 w-5" />
                  Prévia Online
                </Button>
                <Button variant="outline" size="lg" onClick={() => handleDownload('EPUB')} className="gap-2">
                  <Download className="h-5 w-5" />
                  Baixar EPUB
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-purple-500">{ebook.pages}</div>
                  <div className="text-sm text-muted-foreground">Páginas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-purple-500">{ebook.fileSize}</div>
                  <div className="text-sm text-muted-foreground">Tamanho</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    <span className="text-2xl font-semibold text-purple-500">{ebook.rating}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{ebook.reviews} avaliações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-purple-500">{ebook.downloadCount}/{ebook.maxDownloads}</div>
                  <div className="text-sm text-muted-foreground">Downloads</div>
                </div>
              </div>

              {/* Download Alert */}
              <Alert className="max-w-md mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você pode baixar este eBook mais {ebook.maxDownloads - ebook.downloadCount} vezes.
                </AlertDescription>
              </Alert>
            </CardShell>

            {/* Tabs Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="chapters">Capítulos</TabsTrigger>
                <TabsTrigger value="testimonials">Avaliações</TabsTrigger>
                <TabsTrigger value="devices">Dispositivos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <CardShell>
                  <h3 className="text-lg font-semibold mb-4">O que você vai aprender</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ebook.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardShell>
              </TabsContent>
              
              <TabsContent value="chapters" className="mt-6">
                <CardShell>
                  <h3 className="text-lg font-semibold mb-4">Índice do Livro</h3>
                  <div className="space-y-4">
                    {ebook.chapters.map((chapter, index) => (
                      <div key={chapter.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{chapter.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{chapter.description}</p>
                            <Badge variant="outline" className="text-xs">
                              Páginas {chapter.pages}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardShell>
              </TabsContent>
              
              <TabsContent value="testimonials" className="mt-6">
                <CardShell>
                  <h3 className="text-lg font-semibold mb-4">O que os leitores estão dizendo</h3>
                  <div className="space-y-6">
                    {ebook.testimonials.map((testimonial) => (
                      <div key={testimonial.id} className="border-l-4 border-purple-200 pl-4">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={testimonial.avatar} />
                            <AvatarFallback>{testimonial.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{testimonial.user}</h4>
                            <div className="flex items-center gap-1">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current text-yellow-500" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                        <p className="text-xs text-muted-foreground mt-2">{testimonial.date}</p>
                      </div>
                    ))}
                  </div>
                </CardShell>
              </TabsContent>
              
              <TabsContent value="devices" className="mt-6">
                <CardShell>
                  <h3 className="text-lg font-semibold mb-4">Leia em qualquer dispositivo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 rounded-lg bg-muted/30">
                      <Monitor className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                      <h4 className="font-medium mb-2">Computador</h4>
                      <p className="text-sm text-muted-foreground">PDF e EPUB compatível com todos os leitores</p>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-muted/30">
                      <Tablet className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                      <h4 className="font-medium mb-2">Tablet</h4>
                      <p className="text-sm text-muted-foreground">Otimizado para iPad e tablets Android</p>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-muted/30">
                      <Smartphone className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                      <h4 className="font-medium mb-2">Smartphone</h4>
                      <p className="text-sm text-muted-foreground">Leia onde estiver com aplicativos de eBook</p>
                    </div>
                  </div>
                </CardShell>
              </TabsContent>
            </Tabs>
          </Main>

          <Aside>
            {/* Trainer Info */}
            <CardShell>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={ebook.trainer.avatar} />
                  <AvatarFallback>{ebook.trainer.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{ebook.trainer.name}</h3>
                  <p className="text-sm text-muted-foreground">{ebook.trainer.specialty}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span>{ebook.trainer.rating} • {ebook.trainer.students} alunos</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Falar com {ebook.trainer.name.split(' ')[0]}
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Ver Perfil
                </Button>
              </div>
            </CardShell>

            {/* Book Info */}
            <CardShell>
              <h3 className="font-medium mb-4">Informações</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Categoria</span>
                  <span className="font-medium">{ebook.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nível</span>
                  <span className="font-medium">{ebook.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Idioma</span>
                  <span className="font-medium">{ebook.language}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Atualizado</span>
                  <span className="font-medium">{ebook.lastUpdated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Comprado</span>
                  <span className="font-medium">{ebook.purchaseDate}</span>
                </div>
              </div>
            </CardShell>

            {/* Quick Actions */}
            <CardShell>
              <h3 className="font-medium mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Adicionar aos Favoritos
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Star className="h-4 w-4 mr-2" />
                  Avaliar eBook
                </Button>
              </div>
            </CardShell>
          </Aside>
        </ContentGrid>
      ) : (
        /* Preview Mode */
        <div className="h-screen bg-gray-100">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setPreviewMode(false)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h2 className="font-medium">{ebook.title} - Prévia</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm min-w-[4rem] text-center">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button size="sm" onClick={() => handleDownload('PDF')}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
            </div>
          </div>
          
          <div className="h-[calc(100vh-73px)] flex">
            <div className="flex-1 flex items-center justify-center p-8">
              <div 
                className="bg-white shadow-2xl rounded-lg overflow-hidden"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <img 
                  src={ebook.image}
                  alt={`Página ${currentPage}`}
                  className="w-[600px] h-[800px] object-cover"
                />
              </div>
            </div>
            
            <div className="w-80 bg-white border-l border-gray-200 p-4">
              <h3 className="font-medium mb-4">Navegação</h3>
              <div className="space-y-2 text-sm">
                <p>Página {currentPage} de {ebook.pages}</p>
                <Progress value={(currentPage / ebook.pages) * 100} className="mb-4" />
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Esta é apenas uma prévia. Para acessar o conteúdo completo, faça o download.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}