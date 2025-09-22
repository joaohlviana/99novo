import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowRight, ChevronLeft, Code2, Palette, Layout, Zap, Filter, Star } from 'lucide-react';

interface ComponentDemo {
  id: string;
  name: string;
  description: string;
  category: 'Layout' | 'UI Components' | 'Interactive' | 'Data Display';
  tags: string[];
  route: string;
  status: 'stable' | 'beta' | 'experimental';
}

const componentDemos: ComponentDemo[] = [
  {
    id: 'content-switcher',
    name: 'Content Switcher Demo',
    description: 'Demonstração do componente ContentSwitcher com filtros avançados para treinadores e programas',
    category: 'Interactive',
    tags: ['switcher', 'filters', 'responsive'],
    route: '/dev/components/content-switcher',
    status: 'stable'
  },
  {
    id: 'glass-effects',
    name: 'Glass Effects Demo',
    description: 'Demonstração de efeitos de vidro (glass morphism) em cards e componentes',
    category: 'UI Components',
    tags: ['glass', 'effects', 'modern'],
    route: '/dev/components/glass-effects',
    status: 'stable'
  },
  {
    id: 'filters',
    name: 'Filters Demo',
    description: 'Sistema de filtros avançados com múltiplas opções e estados',
    category: 'Interactive',
    tags: ['filters', 'search', 'state'],
    route: '/dev/components/filters',
    status: 'stable'
  },
  {
    id: 'star-rating',
    name: 'Star Rating Demo',
    description: 'Componente de avaliação por estrelas interativo',
    category: 'UI Components',
    tags: ['rating', 'stars', 'interactive'],
    route: '/dev/components/star-rating',
    status: 'stable'
  },
  {
    id: 'skeleton',
    name: 'Skeleton Demo',
    description: 'Estados de carregamento com animações skeleton',
    category: 'UI Components',
    tags: ['loading', 'skeleton', 'animation'],
    route: '/dev/components/skeleton',
    status: 'stable'
  },
  {
    id: 'program-carousel',
    name: 'Modern Program Carousel',
    description: 'Carrossel moderno para exibição de programas',
    category: 'Layout',
    tags: ['carousel', 'programs', 'swipe'],
    route: '/dev/components/program-carousel',
    status: 'stable'
  },
  {
    id: 'apple-cards-carousel',
    name: 'Apple Cards Carousel',
    description: 'Carrossel inspirado no design da Apple com efeitos 3D',
    category: 'Layout',
    tags: ['apple', '3d', 'carousel'],
    route: '/dev/components/apple-cards-carousel',
    status: 'beta'
  },
  {
    id: 'resizable-navbar',
    name: 'Resizable Navbar Demo',
    description: 'Navbar redimensionável com drag and drop',
    category: 'Layout',
    tags: ['navbar', 'resizable', 'drag'],
    route: '/dev/components/resizable-navbar',
    status: 'experimental'
  }
];

const categoryIcons = {
  'Layout': Layout,
  'UI Components': Palette,
  'Interactive': Zap,
  'Data Display': Code2
};

const statusColors = {
  'stable': 'bg-green-100 text-green-800 border-green-200',
  'beta': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'experimental': 'bg-red-100 text-red-800 border-red-200'
};

export default function ComponentsIndexPage() {
  const navigate = useNavigate();

  const groupedComponents = componentDemos.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, ComponentDemo[]>);

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dev')}
                className="p-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-semibold">Components Library</h1>
            </div>
            <p className="text-muted-foreground">
              Explore todos os componentes de demonstração disponíveis na plataforma
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {componentDemos.length} componentes
          </Badge>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {Object.entries(groupedComponents).map(([category, components]) => {
            const IconComponent = categoryIcons[category as keyof typeof categoryIcons];
            
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-muted rounded-lg">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold">{category}</h2>
                  <Badge variant="secondary">{components.length}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {components.map((component) => (
                    <Card 
                      key={component.id} 
                      className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer group"
                      onClick={() => navigate(component.route)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg group-hover:text-brand transition-colors">
                            {component.name}
                          </CardTitle>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${statusColors[component.status]}`}
                          >
                            {component.status}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {component.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {component.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {component.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{component.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full group-hover:bg-brand group-hover:text-white transition-colors"
                        >
                          Ver Demo
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 p-6 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dev')}
            >
              ← Voltar ao Dev Hub
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/system-test')}
            >
              System Test
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard/dev/trainer')}
            >
              Trainer Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}