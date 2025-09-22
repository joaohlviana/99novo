export interface ProgramCatalog {
  id: string;
  title: string;
  trainer: {
    id: string;
    name: string;
    image: string;
    rating: number;
    reviewCount: number;
  };
  image: string;
  description: string;
  price: string;
  originalPrice?: string;
  duration: string;
  period: 'programa-fechado' | 'mensal';
  location: 'online' | 'presencial' | 'hibrido';
  city: string;
  category: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  maxStudents?: number;
  currentStudents?: number;
  tags: string[];
  isPopular?: boolean;
}

export const programsCatalog: ProgramCatalog[] = [
  {
    id: 'prog-1',
    title: 'Programa Completo de Musculação',
    trainer: {
      id: 'trainer-1',
      name: 'João Silva',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 127
    },
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop',
    description: 'Programa completo de 12 semanas focado em hipertrofia e força. Inclui periodização, planilhas personalizadas e acompanhamento nutricional.',
    price: 'R$ 197',
    originalPrice: 'R$ 297',
    duration: '12 semanas',
    period: 'programa-fechado',
    location: 'online',
    city: 'São Paulo',
    category: 'Musculação',
    level: 'intermediario',
    maxStudents: 50,
    currentStudents: 32,
    tags: ['Hipertrofia', 'Força', 'Periodização'],
    isPopular: true
  },
  {
    id: 'prog-2',
    title: 'Mentoria Mensal de Crossfit',
    trainer: {
      id: 'trainer-2',
      name: 'Maria Santos',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 89
    },
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
    description: 'Mentoria mensal com treinos de crossfit, acompanhamento técnico e correção de movimentos. Renovação automática.',
    price: 'R$ 89',
    duration: 'Mensal',
    period: 'mensal',
    location: 'presencial',
    city: 'Rio de Janeiro',
    category: 'Crossfit',
    level: 'intermediario',
    tags: ['Condicionamento', 'Técnica', 'Grupo']
  },
  {
    id: 'prog-3',
    title: 'Yoga para Iniciantes - Online',
    trainer: {
      id: 'trainer-3',
      name: 'Ana Costa',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      rating: 4.7,
      reviewCount: 156
    },
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop',
    description: 'Curso completo de yoga para iniciantes com 8 semanas de duração. Inclui meditação, respiração e posturas básicas.',
    price: 'R$ 147',
    duration: '8 semanas',
    period: 'programa-fechado',
    location: 'online',
    city: 'Belo Horizonte',
    category: 'Yoga',
    level: 'iniciante',
    maxStudents: 30,
    currentStudents: 18,
    tags: ['Meditação', 'Flexibilidade', 'Bem-estar']
  },
  {
    id: 'prog-4',
    title: 'Personal Training Mensal',
    trainer: {
      id: 'trainer-4',
      name: 'Carlos Oliveira',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      rating: 4.9,
      reviewCount: 203
    },
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=250&fit=crop',
    description: 'Acompanhamento personalizado mensal com treinos individualizados e ajustes semanais baseados na evolução.',
    price: 'R$ 320',
    duration: 'Mensal',
    period: 'mensal',
    location: 'presencial',
    city: 'São Paulo',
    category: 'Personal Training',
    level: 'avancado',
    tags: ['Personalizado', '1:1', 'Resultados']
  },
  {
    id: 'prog-5',
    title: 'Programa de Corrida 5K',
    trainer: {
      id: 'trainer-5',
      name: 'Pedro Martins',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      rating: 4.6,
      reviewCount: 94
    },
    image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=250&fit=crop',
    description: 'Programa de 10 semanas para quem quer completar seus primeiros 5K. Do zero ao pódio com segurança.',
    price: 'R$ 127',
    originalPrice: 'R$ 177',
    duration: '10 semanas',
    period: 'programa-fechado',
    location: 'hibrido',
    city: 'Brasília',
    category: 'Corrida',
    level: 'iniciante',
    maxStudents: 25,
    currentStudents: 15,
    tags: ['Cardio', 'Resistência', 'Progressão']
  },
  {
    id: 'prog-6',
    title: 'Pilates Terapêutico Mensal',
    trainer: {
      id: 'trainer-6',
      name: 'Laura Ferreira',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 167
    },
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=250&fit=crop',
    description: 'Pilates focado em reabilitação e correção postural. Aulas em grupo pequeno com atenção individualizada.',
    price: 'R$ 180',
    duration: 'Mensal',
    period: 'mensal',
    location: 'presencial',
    city: 'Porto Alegre',
    category: 'Pilates',
    level: 'iniciante',
    tags: ['Terapêutico', 'Postura', 'Reabilitação']
  }
];