/**
 * 🧑‍🏫 TRAINERS SERVICE
 * 
 * Gerencia todos os dados relacionados a treinadores.
 * Centraliza operações CRUD, busca, filtros e estatísticas.
 */

import { 
  Trainer, 
  TrainerSummary, 
  SearchFilters, 
  SearchResult,
  ServiceResponse,
  PaginatedResponse,
  PaginationParams,
  FilterParams
} from '../types';

// ===============================
// CONSOLIDATED MOCK DATA
// ===============================

// Reviews data consolidado de /data/mock-data.ts
const mockReviews = [
  {
    id: "review-1",
    trainerId: "550e8400-e29b-41d4-a716-446655440001",
    name: "Maria Silva",
    date: "Dezembro 2023",
    rating: 5,
    comment: "Excelente profissional! João me ajudou a alcançar meus objetivos de forma saudável e sustentável."
  },
  {
    id: "review-2", 
    trainerId: "550e8400-e29b-41d4-a716-446655440001",
    name: "Carlos Santos",
    date: "Novembro 2023",
    rating: 5,
    comment: "Treinos personalizados e acompanhamento nutricional excepcional. Recomendo!"
  }
];

// Stories data consolidado de /data/mock-data.ts
const mockStories = [
  {
    id: "1",
    trainerId: "550e8400-e29b-41d4-a716-446655440001",
    title: "Treino hoje",
    image: "https://images.unsplash.com/photo-1669989179336-b2234d2878df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxf",
    content: {
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1669989179336-b2234d2878df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwd29ya291dCUyMGd5bSUyMG1vdGl2YXRpb258ZW58MXx8fHwxNzU2MDk3MDE4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: 5000
    },
    timestamp: "2h",
    viewed: false
  },
  {
    id: "2",
    trainerId: "550e8400-e29b-41d4-a716-446655440001", 
    title: "Dicas",
    image: "https://images.unsplash.com/photo-1734873477108-6837b02f2b9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxf",
    content: {
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1734873477108-6837b02f2b9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXIlMjBleGVyY2lzZSUyMGluc3RydWN0aW9ufGVufDF8fHx8MTc1NjEzMjY2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: 6000
    },
    timestamp: "5h",
    viewed: false
  },
  {
    id: "3",
    trainerId: "550e8400-e29b-41d4-a716-446655440001",
    title: "Nutrição",
    image: "https://images.unsplash.com/photo-1494113311000-c3bb3bae119b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxf",
    content: {
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1494113311000-c3bb3bae119b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxudXRyaXRpb24lMjBoZWFsdGh5JTIwbWVhbCUyMHByZXB8ZW58MXx8fHwxNzU2MTMyNjY3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: 4000
    },
    timestamp: "1d",
    viewed: true
  },
  {
    id: "4",
    trainerId: "550e8400-e29b-41d4-a716-446655440001",
    title: "Resultados",
    image: "https://images.unsplash.com/photo-1669504243706-1df1f8d5dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxf",
    content: {
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1669504243706-1df1f8d5dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhbnNmb3JtYXRpb24lMjBiZWZvcmUlMjBhZnRlcnxlbnwxfHx8fDE3NTYwNDY2ODl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: 5000
    },
    timestamp: "2d",
    viewed: true
  },
  {
    id: "5",
    trainerId: "550e8400-e29b-41d4-a716-446655440001",
    title: "Equipamentos",
    image: "https://images.unsplash.com/photo-1584827386916-b5351d3ba34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxf",
    content: {
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1584827386916-b5351d3ba34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBlcXVpcG1lbnQlMjB3b3Jrb3V0JTIwcm91dGluZXxlbnwxfHx8fDE3NTYxMzI2NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      duration: 4500
    },
    timestamp: "3d",
    viewed: true
  }
];

// Pricing options consolidado de /data/mock-data.ts
const mockPricingOptions = [
  {
    id: "pricing-1",
    trainerId: "550e8400-e29b-41d4-a716-446655440001",
    type: "Presencial",
    description: "Treino individual",
    price: "R$ 65/h",
    period: "ou R$ 350/mês",
    details: {
      duration: "1 hora por sessão",
      location: "Academia ou domicílio (São Paulo)",
      includes: [
        "Avaliação física completa",
        "Treino personalizado",
        "Acompanhamento em tempo real",
        "Ajustes de execução",
        "Plano nutricional básico"
      ],
      ideal_for: "Pessoas que buscam resultados rápidos com acompanhamento próximo e correção técnica."
    }
  },
  {
    id: "pricing-2",
    trainerId: "550e8400-e29b-41d4-a716-446655440001",
    type: "Planilha de treino",
    description: "3 treinos/semana",
    price: "R$ 35",
    details: {
      duration: "Programa de 4 semanas",
      location: "Execução livre (qualquer local)",
      includes: [
        "Planilha personalizada em PDF",
        "Vídeos demonstrativos",
        "Progressão automática",
        "Suporte via WhatsApp",
        "Revisão mensal"
      ],
      ideal_for: "Pessoas autodisciplinadas que preferem treinar sozinhas com orientação profissional."
    }
  },
  {
    id: "pricing-3",
    trainerId: "550e8400-e29b-41d4-a716-446655440001",
    type: "Consultoria Online",
    description: "Acompanhamento mensal",
    price: "R$ 150/mês",
    details: {
      duration: "Acompanhamento contínuo",
      location: "100% online (videochamadas)",
      includes: [
        "Consultoria nutricional",
        "Plano de treinos adaptável",
        "2 videochamadas/mês",
        "Chat direto no WhatsApp",
        "Ajustes semanais no programa"
      ],
      ideal_for: "Pessoas que querem orientação profissional regular mas com flexibilidade de horários."
    }
  }
];

const mockTrainers: Trainer[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "João Silva",
    email: "joao@exemplo.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    bio: "Personal trainer especializado em treinamento funcional e reabilitação esportiva",
    isVerified: true,
    isActive: true,
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    roles: [{
      type: "trainer",
      isActive: true,
      activatedAt: "2023-01-15T10:00:00Z",
      permissions: ["create_programs", "manage_students", "view_analytics"]
    }],
    preferences: {
      language: "pt-BR",
      theme: "light",
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: true,
        updates: true,
        reminders: true
      },
      privacy: {
        profileVisibility: "public",
        showLocation: true,
        showProgress: false,
        allowMessaging: true,
        allowDiscovery: true
      },
      communication: {
        preferredMethod: "whatsapp",
        languages: ["pt-BR", "en"],
        timezone: "America/Sao_Paulo"
      }
    },
    location: {
      country: "Brasil",
      state: "São Paulo",
      city: "São Paulo",
      address: "Rua das Flores, 123",
      zipCode: "01234-567",
      coordinates: {
        latitude: -23.5505,
        longitude: -46.6333
      },
      timezone: "America/Sao_Paulo"
    },
    socialLinks: {
      instagram: "@joaosilva_trainer",
      youtube: "JoaoSilvaFitness",
      website: "https://joaosilva.fitness"
    },
    onboardingCompleted: true,
    lastLoginAt: "2024-01-15T09:30:00Z",
    metadata: {
      registrationSource: "website",
      tags: ["premium", "verified", "popular"],
      customFields: {}
    },
    profile: {
      title: "Personal Trainer & Fisioterapeuta",
      experience: 8,
      rating: 4.9,
      reviewCount: 127,
      studentCount: 245,
      description: "Especialista em treinamento funcional com foco em reabilitação e prevenção de lesões. Mais de 8 anos transformando vidas através do movimento.",
      mission: "Ajudar pessoas a descobrirem o prazer de se movimentar e viver com qualidade",
      approach: "Metodologia baseada em evidências científicas com foco na individualidade de cada aluno",
      achievements: [
        {
          id: "cert-1",
          title: "Certificação NSCA-CPT",
          description: "Personal Trainer Certificado",
          icon: "award",
          type: "certification",
          date: "2020-05-15",
          verifiable: true,
          url: "https://nsca.com/verify/joao-silva"
        }
      ],
      languages: ["pt-BR", "en"],
      serviceMode: ["online", "in_person", "hybrid"],
      maxStudents: 50
    },
    qualifications: [
      {
        id: "qual-1",
        title: "Educação Física - Bacharelado",
        institution: "USP",
        type: "degree",
        date: "2016-12-15",
        verified: true
      },
      {
        id: "qual-2", 
        title: "Fisioterapia - Bacharelado",
        institution: "UNIFESP",
        type: "degree",
        date: "2020-06-20",
        verified: true
      }
    ],
    specialties: [
      {
        id: "spec-1",
        category: "Funcional",
        level: "expert",
        yearsOfExperience: 8,
        certifications: ["NSCA-CPT", "FMS"],
        description: "Especialista em movimentos funcionais e correção postural"
      },
      {
        id: "spec-2",
        category: "Musculação", 
        level: "advanced",
        yearsOfExperience: 6,
        certifications: ["CREF", "Personal Trainer"],
        description: "Especialista em hipertrofia e ganho de massa muscular"
      },
      {
        id: "spec-3",
        category: "Yoga", 
        level: "intermediate",
        yearsOfExperience: 3,
        certifications: ["YAC200", "Hatha Yoga"],
        description: "Instrutor de Hatha Yoga e meditação"
      }
    ],
    services: [
      {
        id: "service-1",
        name: "Personal Training",
        description: "Treinamento personalizado 1x1",
        type: "personal",
        duration: "60min",
        price: 120,
        currency: "BRL",
        serviceMode: ["in_person", "online"],
        maxParticipants: 1,
        isActive: true
      }
    ],
    availability: {
      timezone: "America/Sao_Paulo",
      schedule: {
        monday: {
          available: true,
          slots: [
            { start: "06:00", end: "12:00", type: "available" },
            { start: "14:00", end: "20:00", type: "available" }
          ]
        },
        tuesday: {
          available: true,
          slots: [
            { start: "06:00", end: "12:00", type: "available" },
            { start: "14:00", end: "20:00", type: "available" }
          ]
        },
        wednesday: {
          available: true,
          slots: [
            { start: "06:00", end: "12:00", type: "available" },
            { start: "14:00", end: "20:00", type: "available" }
          ]
        },
        thursday: {
          available: true,
          slots: [
            { start: "06:00", end: "12:00", type: "available" },
            { start: "14:00", end: "20:00", type: "available" }
          ]
        },
        friday: {
          available: true,
          slots: [
            { start: "06:00", end: "12:00", type: "available" },
            { start: "14:00", end: "18:00", type: "available" }
          ]
        },
        saturday: {
          available: true,
          slots: [
            { start: "08:00", end: "14:00", type: "available" }
          ]
        },
        sunday: {
          available: false,
          slots: []
        }
      },
      exceptions: [],
      bufferTime: 15,
      advance: {
        min: 1,
        max: 30
      }
    },
    pricing: {
      currency: "BRL",
      hourlyRate: 120,
      packages: [
        {
          id: "pkg-1",
          name: "Pacote Mensal",
          sessions: 8,
          price: 800,
          validityDays: 30,
          description: "2 treinos por semana",
          popular: true
        }
      ],
      discounts: [
        {
          type: "percentage",
          value: 10,
          condition: "first_session"
        }
      ],
      paymentMethods: [
        { type: "pix", enabled: true },
        { type: "credit_card", enabled: true, processingFee: 3.99 },
        { type: "bank_transfer", enabled: true }
      ]
    },
    stats: {
      totalStudents: 245,
      activeStudents: 89,
      completedPrograms: 156,
      totalHours: 2840,
      responseTime: 12,
      completionRate: 0.94,
      satisfactionRate: 0.97,
      earningsThisMonth: 8500,
      earningsTotal: 98500
    },
    reviews: [],
    programs: [],
    gallery: [],
    stories: [],
    settings: {
      autoAcceptBookings: false,
      maxStudentsPerProgram: 15,
      reminderNotifications: true,
      publicProfile: true,
      allowInstantBooking: true,
      requireDeposit: false,
      cancellationPolicy: {
        hoursBeforeSession: 24,
        feePercentage: 50,
        rescheduleAllowed: true,
        rescheduleLimit: 2
      }
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Maria Santos",
    email: "maria@exemplo.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c647?w=400&q=80",
    bio: "Instrutora de Yoga e Pilates com foco em bem-estar integral",
    isVerified: true,
    isActive: true,
    createdAt: "2023-02-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    roles: [{
      type: "trainer",
      isActive: true,
      activatedAt: "2023-02-20T10:00:00Z",
      permissions: ["create_programs", "manage_students", "view_analytics"]
    }],
    preferences: {
      language: "pt-BR",
      theme: "light",
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: true,
        updates: true,
        reminders: true
      },
      privacy: {
        profileVisibility: "public",
        showLocation: true,
        showProgress: false,
        allowMessaging: true,
        allowDiscovery: true
      },
      communication: {
        preferredMethod: "whatsapp",
        languages: ["pt-BR"],
        timezone: "America/Sao_Paulo"
      }
    },
    location: {
      country: "Brasil",
      state: "Rio de Janeiro",
      city: "Rio de Janeiro",
      address: "Av. Copacabana, 456",
      zipCode: "22070-001",
      coordinates: {
        latitude: -22.9068,
        longitude: -43.1729
      },
      timezone: "America/Sao_Paulo"
    },
    socialLinks: {
      instagram: "@mariasantos_yoga",
      youtube: "MariaSantosYoga"
    },
    onboardingCompleted: true,
    lastLoginAt: "2024-01-20T08:15:00Z",
    metadata: {
      registrationSource: "instagram",
      tags: ["verified", "yoga_specialist"],
      customFields: {}
    },
    profile: {
      title: "Instrutora de Yoga & Pilates",
      experience: 5,
      rating: 4.8,
      reviewCount: 89,
      studentCount: 156,
      description: "Especializada em Hatha Yoga e Pilates, promovo o equilíbrio entre corpo e mente através de práticas conscientes.",
      mission: "Levar paz e bem-estar através do movimento consciente",
      approach: "Prática suave e acessível para todos os níveis",
      achievements: [
        {
          id: "cert-2",
          title: "Certificação Yoga Alliance 200h",
          description: "Instrutora Certificada de Yoga",
          icon: "award",
          type: "certification",
          date: "2021-03-10",
          verifiable: true,
          url: "https://yogaalliance.org/verify/maria-santos"
        }
      ],
      languages: ["pt-BR"],
      serviceMode: ["online", "in_person"],
      maxStudents: 30
    },
    qualifications: [
      {
        id: "qual-3",
        title: "Formação em Yoga - 200h",
        institution: "Yoga Alliance",
        type: "certification",
        date: "2021-03-10",
        verified: true
      }
    ],
    specialties: [
      {
        id: "spec-4",
        category: "Yoga",
        level: "expert",
        yearsOfExperience: 5,
        certifications: ["Yoga Alliance 200h", "Hatha Yoga"],
        description: "Especialista em Hatha Yoga e meditação"
      },
      {
        id: "spec-5",
        category: "Pilates",
        level: "advanced",
        yearsOfExperience: 3,
        certifications: ["Mat Pilates", "Studio Pilates"],
        description: "Instrutora de Pilates com foco em reabilitação"
      }
    ],
    services: [
      {
        id: "service-2",
        name: "Aulas de Yoga",
        description: "Aulas individuais ou em grupo",
        type: "group",
        duration: "60min",
        price: 80,
        currency: "BRL",
        serviceMode: ["in_person", "online"],
        maxParticipants: 12,
        isActive: true
      }
    ],
    availability: {
      timezone: "America/Sao_Paulo",
      schedule: {
        monday: { available: true, slots: [{ start: "07:00", end: "11:00", type: "available" }, { start: "15:00", end: "19:00", type: "available" }] },
        tuesday: { available: true, slots: [{ start: "07:00", end: "11:00", type: "available" }, { start: "15:00", end: "19:00", type: "available" }] },
        wednesday: { available: true, slots: [{ start: "07:00", end: "11:00", type: "available" }, { start: "15:00", end: "19:00", type: "available" }] },
        thursday: { available: true, slots: [{ start: "07:00", end: "11:00", type: "available" }, { start: "15:00", end: "19:00", type: "available" }] },
        friday: { available: true, slots: [{ start: "07:00", end: "11:00", type: "available" }] },
        saturday: { available: true, slots: [{ start: "08:00", end: "12:00", type: "available" }] },
        sunday: { available: false, slots: [] }
      },
      exceptions: [],
      bufferTime: 10,
      advance: { min: 1, max: 15 }
    },
    pricing: {
      currency: "BRL",
      hourlyRate: 80,
      packages: [
        {
          id: "pkg-2",
          name: "Pacote Yoga Mensal",
          sessions: 8,
          price: 560,
          validityDays: 30,
          description: "2 aulas por semana",
          popular: true
        }
      ],
      discounts: [],
      paymentMethods: [
        { type: "pix", enabled: true },
        { type: "credit_card", enabled: true, processingFee: 2.99 }
      ]
    },
    stats: {
      totalStudents: 156,
      activeStudents: 67,
      completedPrograms: 89,
      totalHours: 1890,
      responseTime: 8,
      completionRate: 0.92,
      satisfactionRate: 0.96,
      earningsThisMonth: 4200,
      earningsTotal: 52000
    },
    reviews: [],
    programs: [],
    gallery: [],
    stories: [],
    settings: {
      autoAcceptBookings: true,
      maxStudentsPerProgram: 12,
      reminderNotifications: true,
      publicProfile: true,
      allowInstantBooking: true,
      requireDeposit: false,
      cancellationPolicy: {
        hoursBeforeSession: 12,
        feePercentage: 30,
        rescheduleAllowed: true,
        rescheduleLimit: 3
      }
    }
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "Carlos Lima",
    email: "carlos@exemplo.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    bio: "Coach de Corrida especializado em maratonas e performance esportiva",
    isVerified: true,
    isActive: true,
    createdAt: "2023-03-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
    roles: [{
      type: "trainer",
      isActive: true,
      activatedAt: "2023-03-10T10:00:00Z",
      permissions: ["create_programs", "manage_students", "view_analytics"]
    }],
    preferences: {
      language: "pt-BR",
      theme: "dark",
      notifications: {
        email: true,
        push: true,
        sms: true,
        marketing: false,
        updates: true,
        reminders: true
      },
      privacy: {
        profileVisibility: "public",
        showLocation: true,
        showProgress: true,
        allowMessaging: true,
        allowDiscovery: true
      },
      communication: {
        preferredMethod: "app",
        languages: ["pt-BR", "en"],
        timezone: "America/Sao_Paulo"
      }
    },
    location: {
      country: "Brasil",
      state: "Minas Gerais",
      city: "Belo Horizonte",
      address: "Rua da Liberdade, 789",
      zipCode: "30112-000",
      coordinates: {
        latitude: -19.9167,
        longitude: -43.9345
      },
      timezone: "America/Sao_Paulo"
    },
    socialLinks: {
      instagram: "@carloslima_run",
      website: "https://carloslimarun.com.br",
      strava: "carlos-lima-runner"
    },
    onboardingCompleted: true,
    lastLoginAt: "2024-01-10T06:45:00Z",
    metadata: {
      registrationSource: "referral",
      tags: ["verified", "running_coach", "performance"],
      customFields: {}
    },
    profile: {
      title: "Coach de Corrida & Performance",
      experience: 12,
      rating: 4.9,
      reviewCount: 156,
      studentCount: 203,
      description: "Coach especializado em corrida de rua e maratonas. Já preparei mais de 200 atletas para grandes eventos.",
      mission: "Transformar corredores em atletas completos",
      approach: "Treinamento periodizado baseado em ciência do esporte",
      achievements: [
        {
          id: "cert-3",
          title: "Certificação IAAF Level II",
          description: "Coach de Atletismo Nível 2",
          icon: "award",
          type: "certification",
          date: "2019-08-15",
          verifiable: true,
          url: "https://worldathletics.org/verify/carlos-lima"
        }
      ],
      languages: ["pt-BR", "en"],
      serviceMode: ["in_person", "online"],
      maxStudents: 25
    },
    qualifications: [
      {
        id: "qual-4",
        title: "Educação Física - Licenciatura",
        institution: "UFMG",
        type: "degree",
        date: "2012-12-15",
        verified: true
      }
    ],
    specialties: [
      {
        id: "spec-6",
        category: "Corrida",
        level: "expert",
        yearsOfExperience: 12,
        certifications: ["IAAF Level II", "CBAt"],
        description: "Especialista em corrida de rua e maratonas"
      },
      {
        id: "spec-7",
        category: "Atletismo",
        level: "expert",
        yearsOfExperience: 10,
        certifications: ["CBAt", "World Athletics"],
        description: "Coach de atletismo e performance esportiva"
      }
    ],
    services: [
      {
        id: "service-3",
        name: "Assessoria de Corrida",
        description: "Treinamento personalizado para corredores",
        type: "personal",
        duration: "programa",
        price: 200,
        currency: "BRL",
        serviceMode: ["in_person", "online"],
        maxParticipants: 1,
        isActive: true
      }
    ],
    availability: {
      timezone: "America/Sao_Paulo",
      schedule: {
        monday: { available: true, slots: [{ start: "05:30", end: "08:00", type: "available" }, { start: "17:00", end: "20:00", type: "available" }] },
        tuesday: { available: true, slots: [{ start: "05:30", end: "08:00", type: "available" }, { start: "17:00", end: "20:00", type: "available" }] },
        wednesday: { available: true, slots: [{ start: "05:30", end: "08:00", type: "available" }, { start: "17:00", end: "20:00", type: "available" }] },
        thursday: { available: true, slots: [{ start: "05:30", end: "08:00", type: "available" }, { start: "17:00", end: "20:00", type: "available" }] },
        friday: { available: true, slots: [{ start: "05:30", end: "08:00", type: "available" }, { start: "17:00", end: "19:00", type: "available" }] },
        saturday: { available: true, slots: [{ start: "06:00", end: "10:00", type: "available" }] },
        sunday: { available: true, slots: [{ start: "06:00", end: "09:00", type: "available" }] }
      },
      exceptions: [],
      bufferTime: 30,
      advance: { min: 2, max: 60 }
    },
    pricing: {
      currency: "BRL",
      hourlyRate: 200,
      packages: [
        {
          id: "pkg-3",
          name: "Preparação para Maratona",
          sessions: 20,
          price: 3000,
          validityDays: 120,
          description: "Programa completo de 16 semanas",
          popular: true
        }
      ],
      discounts: [],
      paymentMethods: [
        { type: "pix", enabled: true },
        { type: "credit_card", enabled: true, processingFee: 4.99 },
        { type: "bank_transfer", enabled: true }
      ]
    },
    stats: {
      totalStudents: 203,
      activeStudents: 45,
      completedPrograms: 167,
      totalHours: 4500,
      responseTime: 6,
      completionRate: 0.96,
      satisfactionRate: 0.98,
      earningsThisMonth: 12000,
      earningsTotal: 180000
    },
    reviews: [],
    programs: [],
    gallery: [],
    stories: [],
    settings: {
      autoAcceptBookings: false,
      maxStudentsPerProgram: 8,
      reminderNotifications: true,
      publicProfile: true,
      allowInstantBooking: false,
      requireDeposit: true,
      cancellationPolicy: {
        hoursBeforeSession: 48,
        feePercentage: 100,
        rescheduleAllowed: true,
        rescheduleLimit: 1
      }
    }
  }
];

// ===============================
// SERVICE IMPLEMENTATION
// ===============================

export class TrainersService {
  private static instance: TrainersService;
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();

  static getInstance(): TrainersService {
    if (!TrainersService.instance) {
      TrainersService.instance = new TrainersService();
    }
    return TrainersService.instance;
  }

  /**
   * Busca treinadores com filtros
   */
  async searchTrainers(
    filters: SearchFilters = {},
    pagination: PaginationParams = { page: 1, limit: 12 }
  ): Promise<ServiceResponse<PaginatedResponse<Trainer>>> {
    try {
      await this.simulateDelay();

      let filteredTrainers = [...mockTrainers];

      // Aplicar filtros
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredTrainers = filteredTrainers.filter(trainer =>
          trainer.name.toLowerCase().includes(query) ||
          trainer.profile.title.toLowerCase().includes(query) ||
          trainer.profile.description.toLowerCase().includes(query)
        );
      }

      if (filters.categories?.length) {
        filteredTrainers = filteredTrainers.filter(trainer =>
          trainer.specialties.some(spec => 
            filters.categories!.includes(spec.category)
          )
        );
      }

      if (filters.location) {
        filteredTrainers = filteredTrainers.filter(trainer =>
          trainer.location.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
          trainer.location.state.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters.priceRange) {
        filteredTrainers = filteredTrainers.filter(trainer =>
          trainer.pricing.hourlyRate >= filters.priceRange!.min &&
          trainer.pricing.hourlyRate <= filters.priceRange!.max
        );
      }

      if (filters.rating) {
        filteredTrainers = filteredTrainers.filter(trainer =>
          trainer.profile.rating >= filters.rating!
        );
      }

      if (filters.serviceMode?.length) {
        filteredTrainers = filteredTrainers.filter(trainer =>
          trainer.profile.serviceMode.some(mode => 
            filters.serviceMode!.includes(mode)
          )
        );
      }

      // Aplicar paginação
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedTrainers = filteredTrainers.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          items: paginatedTrainers,
          total: filteredTrainers.length,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(filteredTrainers.length / pagination.limit)
        }
      };
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Erro ao buscar treinadores'
        }
      };
    }
  }

  /**
   * Busca treinadores por esporte
   */
  async getTrainersBySport(sportName: string): Promise<ServiceResponse<any[]>> {
    try {
      await this.simulateDelay();

      // Simulação: filtrar treinadores que têm o esporte nas especialidades
      const trainersForSport = mockTrainers.filter(trainer =>
        trainer.specialties.some(spec => 
          spec.category.toLowerCase().includes(sportName.toLowerCase())
        )
      ).map(trainer => ({
        id: trainer.id,
        name: trainer.name,
        avatar_url: trainer.avatar,
        profile_data: {
          city: trainer.location.city,
          specialties: trainer.specialties.map(s => s.category),
          bio: trainer.bio,
          service_mode: trainer.profile.serviceMode,
          hourly_rate: trainer.pricing.hourlyRate
        },
        rating: trainer.profile.rating,
        total_students: trainer.stats.totalStudents,
        is_verified: trainer.isVerified
      }));

      return {
        success: true,
        data: trainersForSport
      };
    } catch (error) {
      console.error('❌ Erro ao buscar treinadores por esporte:', error);
      return {
        success: false,
        error: {
          code: 'SPORT_TRAINERS_ERROR', 
          message: 'Erro ao buscar treinadores do esporte'
        }
      };
    }
  }

  /**
   * Busca um treinador específico
   */
  async getTrainerById(id: string): Promise<ServiceResponse<Trainer>> {
    try {
      await this.simulateDelay();

      const trainer = mockTrainers.find(t => t.id === id);
      
      if (!trainer) {
        return {
          success: false,
          error: {
            code: 'TRAINER_NOT_FOUND',
            message: 'Treinador não encontrado'
          }
        };
      }

      return {
        success: true,
        data: trainer
      };
    } catch (error) {
      console.error('❌ Erro ao buscar treinador:', error);
      return {
        success: false,
        error: {
          code: 'TRAINER_FETCH_ERROR',
          message: 'Erro ao buscar dados do treinador'
        }
      };
    }
  }

  /**
   * Busca treinadores em destaque
   */
  async getFeaturedTrainers(limit: number = 6): Promise<ServiceResponse<Trainer[]>> {
    try {
      await this.simulateDelay();

      // Ordenar por rating e pegar os primeiros
      const featured = [...mockTrainers]
        .sort((a, b) => b.profile.rating - a.profile.rating)
        .slice(0, limit);

      return {
        success: true,
        data: featured
      };
    } catch (error) {
      console.error('❌ Erro ao buscar treinadores em destaque:', error);
      return {
        success: false,
        error: {
          code: 'FEATURED_TRAINERS_ERROR',
          message: 'Erro ao buscar treinadores em destaque'
        }
      };
    }
  }

  /**
   * Busca estatísticas dos treinadores
   */
  async getTrainersStats(): Promise<ServiceResponse<any>> {
    try {
      await this.simulateDelay();

      const stats = {
        total: mockTrainers.length,
        verified: mockTrainers.filter(t => t.isVerified).length,
        online: mockTrainers.filter(t => t.profile.serviceMode.includes('online')).length,
        averageRating: mockTrainers.reduce((acc, t) => acc + t.profile.rating, 0) / mockTrainers.length
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Erro ao buscar estatísticas'
        }
      };
    }
  }

  /**
   * Simula delay de rede
   */
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * 500 + 200; // 200-700ms
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Exportar instância singleton
export const trainersService = TrainersService.getInstance();