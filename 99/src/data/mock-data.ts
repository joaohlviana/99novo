export const reviews = [
  {
    name: "Maria Silva",
    date: "Dezembro 2023",
    rating: 5,
    comment: "Excelente profissional! João me ajudou a alcançar meus objetivos de forma saudável e sustentável."
  },
  {
    name: "Carlos Santos",
    date: "Novembro 2023", 
    rating: 5,
    comment: "Treinos personalizados e acompanhamento nutricional excepcional. Recomendo!"
  }
];

export const stories = [
  {
    id: "1",
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

export const pricingOptions = [
  {
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