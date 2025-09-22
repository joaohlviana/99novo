import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { FigmaCard2 } from './FigmaCard2';

interface FigmaCard2ShowcaseProps {
  onNavigateBack: () => void;
}

export function FigmaCard2Showcase({ onNavigateBack }: FigmaCard2ShowcaseProps) {
  const samplePrograms = [
    {
      id: '1',
      title: 'Bootcamp Fitness Extremo',
      description: 'Programa intensivo de 8 semanas para queima de gordura e ganho de massa muscular com resultados garantidos.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
      level: 'Avançado',
      category: 'HIIT',
      duration: '8 semanas',
      students: '2.5k',
      rating: 4.9,
      reviewCount: 324,
      price: 'R$ 397',
      originalPrice: 'R$ 597',
      discount: '-33%',
      isOnline: true,
      isPresential: false,
      isFeatured: true,
      trainer: {
        name: 'Carlos Fitness',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        initials: 'CF',
        verified: true,
        badge: 'Coach Premium'
      },
      features: [
        'Treinos diários personalizados',
        'Acompanhamento nutricional',
        'Grupo VIP no WhatsApp',
        'Live semanal com o treinador'
      ]
    },
    {
      id: '2',
      title: 'Yoga Flow & Mindfulness',
      description: 'Conecte-se com seu corpo e mente através de práticas de yoga modernas e técnicas de mindfulness.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68e71?w=600&q=80',
      level: 'Iniciante',
      category: 'Yoga',
      duration: '12 semanas',
      students: '890',
      rating: 4.8,
      reviewCount: 127,
      price: 'R$ 197',
      originalPrice: 'R$ 297',
      discount: '-34%',
      isOnline: true,
      isPresential: true,
      isFeatured: false,
      trainer: {
        name: 'Ana Zen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c4e61b04?w=400&q=80',
        initials: 'AZ',
        verified: true,
        badge: 'Instrutora Certificada'
      },
      features: [
        'Aulas ao vivo 3x por semana',
        'Meditações guiadas',
        'Comunidade exclusiva'
      ]
    },
    {
      id: '3',
      title: 'Corrida de Alta Performance',
      description: 'Transforme sua corrida com técnicas avançadas de performance e periodização científica.',
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&q=80',
      level: 'Intermediário',
      category: 'Corrida',
      duration: '16 semanas',
      students: '1.2k',
      rating: 4.9,
      reviewCount: 89,
      price: 'R$ 447',
      originalPrice: 'R$ 647',
      discount: '-31%',
      isOnline: true,
      isPresential: true,
      isFeatured: true,
      trainer: {
        name: 'Pedro Runner',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        initials: 'PR',
        verified: true,
        badge: 'Ex-Atleta Olímpico'
      },
      features: [
        'Análise de pisada',
        'Planos de treino personalizados',
        'Preparação para provas'
      ]
    },
    {
      id: '4',
      title: 'Funcional Total Body',
      description: 'Treino funcional completo para desenvolvimento de força, mobilidade e resistência corporal.',
      image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&q=80',
      level: 'Intermediário',
      category: 'Funcional',
      duration: '10 semanas',
      students: '3.1k',
      rating: 4.7,
      reviewCount: 456,
      price: 'R$ 247',
      originalPrice: 'R$ 347',
      discount: '-29%',
      isOnline: true,
      isPresential: false,
      isFeatured: false,
      trainer: {
        name: 'Júlia Strong',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
        initials: 'JS',
        verified: false,
        badge: 'Personal Trainer'
      },
      features: [
        'Equipamentos básicos',
        'Progressão semanal',
        'Suporte 24/7'
      ]
    },
    {
      id: '5',
      title: 'Pilates Reformer Pro',
      description: 'Desenvolva força, flexibilidade e consciência corporal com equipamentos profissionais de pilates.',
      image: 'https://images.unsplash.com/photo-1693707963745-297f4e5dd2a6?w=600&q=80',
      level: 'Avançado',
      category: 'Pilates',
      duration: '14 semanas',
      students: '670',
      rating: 4.9,
      reviewCount: 78,
      price: 'R$ 497',
      originalPrice: 'R$ 697',
      discount: '-29%',
      isOnline: false,
      isPresential: true,
      isFeatured: true,
      trainer: {
        name: 'Marina Flex',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&q=80',
        initials: 'MF',
        verified: true,
        badge: 'Especialista Reformer'
      },
      features: [
        'Estúdio equipado',
        'Turmas pequenas (máx 6)',
        'Avaliação postural'
      ]
    },
    {
      id: '6',
      title: 'Natação Técnica Avançada',
      description: 'Aperfeiçoe sua técnica de natação com análise biomecânica e treinos específicos.',
      image: 'https://images.unsplash.com/photo-1727151590381-324be70e3295?w=600&q=80',
      level: 'Avançado',
      category: 'Natação',
      duration: '12 semanas',
      students: '420',
      rating: 4.8,
      reviewCount: 56,
      price: 'R$ 547',
      originalPrice: 'R$ 747',
      discount: '-27%',
      isOnline: false,
      isPresential: true,
      isFeatured: false,
      trainer: {
        name: 'Ricardo Aqua',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        initials: 'RA',
        verified: true,
        badge: 'Ex-Nadador Pro'
      },
      features: [
        'Piscina semi-olímpica',
        'Análise underwater',
        'Correção técnica individual'
      ]
    }
  ];

  const handleNavigateToProgram = (programId: string) => {
    console.log('Navegando para programa:', programId);
  };

  const handleNavigateToTrainer = (trainerId: string) => {
    console.log('Navegando para treinador:', trainerId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onNavigateBack}
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Figma Card 2.0
                </h1>
                <p className="text-sm text-gray-600">
                  Cards premium com design aprimorado e microinterações
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Cards de Nova Geração
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Design revolucionário com elementos sobrepostos, gradientes dinâmicos e 
            microinterações que criam uma experiência visual única e envolvente.
          </p>
        </div>

        {/* Featured Cards Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🌟 Programas em Destaque
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {samplePrograms.filter(program => program.isFeatured).map((program) => (
              <FigmaCard2
                key={program.id}
                {...program}
                onNavigateToProgram={handleNavigateToProgram}
                onNavigateToTrainer={handleNavigateToTrainer}
              />
            ))}
          </div>
        </div>

        {/* All Programs Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📚 Todos os Programas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {samplePrograms.map((program) => (
              <FigmaCard2
                key={program.id}
                {...program}
                onNavigateToProgram={handleNavigateToProgram}
                onNavigateToTrainer={handleNavigateToTrainer}
              />
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="glass-card rounded-3xl p-8 mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            ✨ Inovações do Card 2.0
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎭</span>
              </div>
              <h4 className="font-bold mb-3 text-blue-900">Elementos Sobrepostos</h4>
              <p className="text-sm text-blue-700">
                Treinador sobreposto à imagem criando profundidade visual única
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🌈</span>
              </div>
              <h4 className="font-bold mb-3 text-purple-900">Gradientes Dinâmicos</h4>
              <p className="text-sm text-purple-700">
                Overlay que muda dinamicamente no hover para melhor interação
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h4 className="font-bold mb-3 text-green-900">Microinterações</h4>
              <p className="text-sm text-green-700">
                Play button aparece suavemente e stats organizadas em grid
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h4 className="font-bold mb-3 text-orange-900">Design Premium</h4>
              <p className="text-sm text-orange-700">
                Badges de destaque, descontos circulares e gradientes em botões
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="glass-card rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🔧 Especificações Técnicas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Animações</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Hover com elevação de -12px</li>
                <li>• Zoom da imagem com scale 110%</li>
                <li>• Gradiente dinâmico no overlay</li>
                <li>• Play button com fade suave</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Layout</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Trainer chip sobreposto (-24px)</li>
                <li>• Stats em grid 3 colunas</li>
                <li>• Features em chips coloridos</li>
                <li>• CTA com gradiente rosa</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-gray-900">Estados</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Featured com ring destacado</li>
                <li>• Like com animação scale</li>
                <li>• Hover tracking completo</li>
                <li>• Badge de desconto circular</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}