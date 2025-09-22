import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { FigmaProgramCard } from './FigmaProgramCard';

interface FigmaProgramShowcaseProps {
  onNavigateBack: () => void;
}

export function FigmaProgramShowcase({ onNavigateBack }: FigmaProgramShowcaseProps) {
  const samplePrograms = [
    {
      id: '1',
      title: 'Transformação Corporal Completa',
      description: 'Método comprovado para transformar seu corpo em 12 semanas com treinos intensivos e nutrição personalizada.',
      image: 'https://images.unsplash.com/photo-1573858129038-6f98c3cb2ac7?w=600&q=80',
      level: 'Intermediário',
      category: 'Musculação',
      duration: '12 semanas',
      students: '1.2k alunos',
      rating: 4.9,
      reviewCount: 156,
      price: 'R$ 297',
      originalPrice: 'R$ 497',
      isOnline: true,
      isPresential: false,
      trainer: {
        name: 'João Silva',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        initials: 'JS',
        verified: true
      },
      features: [
        'Treinos progressivos personalizados',
        'Acompanhamento via WhatsApp',
        'Plano nutricional detalhado',
        'Grupo exclusivo de alunos'
      ]
    },
    {
      id: '2',
      title: 'Yoga para Iniciantes',
      description: 'Comece sua jornada no yoga com práticas suaves e fundamentais para flexibilidade e bem-estar.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68e71?w=600&q=80',
      level: 'Iniciante',
      category: 'Yoga',
      duration: '8 semanas',
      students: '850 alunos',
      rating: 4.8,
      reviewCount: 92,
      price: 'R$ 197',
      originalPrice: 'R$ 297',
      isOnline: true,
      isPresential: true,
      trainer: {
        name: 'Maria Santos',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c4e61b04?w=400&q=80',
        initials: 'MS',
        verified: true
      },
      features: [
        'Aulas ao vivo semanais',
        'Práticas guiadas em vídeo',
        'Comunidade exclusiva',
        'Certificado de conclusão'
      ]
    },
    {
      id: '3',
      title: 'Corrida de Alta Performance',
      description: 'Treinamento especializado para corredores que buscam melhorar tempo e resistência em provas.',
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&q=80',
      level: 'Avançado',
      category: 'Corrida',
      duration: '16 semanas',
      students: '420 alunos',
      rating: 4.9,
      reviewCount: 73,
      price: 'R$ 397',
      originalPrice: 'R$ 597',
      isOnline: true,
      isPresential: true,
      trainer: {
        name: 'Carlos Mendes',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        initials: 'CM',
        verified: true
      },
      features: [
        'Periodização de treinos',
        'Análise de performance',
        'Suporte nutricional',
        'Preparação para provas'
      ]
    },
    {
      id: '4',
      title: 'Funcional em Casa',
      description: 'Treinos funcionais eficazes usando apenas o peso corporal e equipamentos básicos em casa.',
      image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&q=80',
      level: 'Iniciante',
      category: 'Funcional',
      duration: '10 semanas',
      students: '2.1k alunos',
      rating: 4.7,
      reviewCount: 287,
      price: 'R$ 147',
      isOnline: true,
      isPresential: false,
      trainer: {
        name: 'Ana Costa',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
        initials: 'AC',
        verified: false
      },
      features: [
        'Treinos de 30-45 min',
        'Adaptável para todos os níveis',
        'Lista de equipamentos básicos',
        'Progressão semanal'
      ]
    },
    {
      id: '5',
      title: 'Natação Técnica',
      description: 'Aprimore sua técnica de natação com exercícios específicos e correções personalizadas.',
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&q=80',
      level: 'Intermediário',
      category: 'Natação',
      duration: '14 semanas',
      students: '340 alunos',
      rating: 4.8,
      reviewCount: 45,
      price: 'R$ 347',
      originalPrice: 'R$ 497',
      isOnline: false,
      isPresential: true,
      trainer: {
        name: 'Pedro Oliveira',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        initials: 'PO',
        verified: true
      },
      features: [
        'Análise técnica individual',
        'Correção de movimentos',
        'Planos de treino específicos',
        'Preparação para competições'
      ]
    },
    {
      id: '6',
      title: 'Pilates Avançado',
      description: 'Desenvolva força, flexibilidade e controle corporal com movimentos avançados de pilates.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
      level: 'Avançado',
      category: 'Pilates',
      duration: '12 semanas',
      students: '680 alunos',
      rating: 4.9,
      reviewCount: 124,
      price: 'R$ 267',
      originalPrice: 'R$ 397',
      isOnline: true,
      isPresential: true,
      trainer: {
        name: 'Lucia Fernandes',
        avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&q=80',
        initials: 'LF',
        verified: true
      },
      features: [
        'Sequências avançadas',
        'Uso de equipamentos',
        'Correção postural',
        'Fortalecimento do core'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
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
                  Figma Program Cards
                </h1>
                <p className="text-sm text-gray-600">
                  Novos cards de programa baseados no design do Figma
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Cards de Programa - Figma Design
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cards modernos com design premium, microinterações suaves e layout otimizado 
            baseado no design do Figma fornecido.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {samplePrograms.map((program) => (
            <FigmaProgramCard
              key={program.id}
              {...program}
              onNavigateToProgram={handleNavigateToProgram}
              onNavigateToTrainer={handleNavigateToTrainer}
            />
          ))}
        </div>

        {/* Features Section */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Recursos do Novo Card
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#e0093e]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-[#e0093e] text-xl">✨</span>
              </div>
              <h4 className="font-semibold mb-2">Microinterações Suaves</h4>
              <p className="text-sm text-gray-600">
                Animações fluidas e transições elegantes para uma experiência premium
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-500 text-xl">🎨</span>
              </div>
              <h4 className="font-semibold mb-2">Design Moderno</h4>
              <p className="text-sm text-gray-600">
                Layout clean e minimalista inspirado nos melhores padrões de UI/UX
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-500 text-xl">⚡</span>
              </div>
              <h4 className="font-semibold mb-2">Performance Otimizada</h4>
              <p className="text-sm text-gray-600">
                Carregamento rápido com otimizações de imagem e animações CSS
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-500 text-xl">📱</span>
              </div>
              <h4 className="font-semibold mb-2">Mobile First</h4>
              <p className="text-sm text-gray-600">
                Design responsivo que funciona perfeitamente em todos os dispositivos
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-500 text-xl">♿</span>
              </div>
              <h4 className="font-semibold mb-2">Acessibilidade</h4>
              <p className="text-sm text-gray-600">
                Implementado com foco em acessibilidade e usabilidade
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-pink-500 text-xl">🎯</span>
              </div>
              <h4 className="font-semibold mb-2">Conversão Otimizada</h4>
              <p className="text-sm text-gray-600">
                CTAs prominentes e informações estrategicamente posicionadas
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}