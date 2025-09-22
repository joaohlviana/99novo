"use client";

import React from "react";
import { ModernCarousel, ModernProgramCard } from "./ModernProgramCarousel";
import { Button } from "./ui/button";

interface ModernProgramCarouselDemoProps {
  onNavigateBack?: () => void;
}

export default function ModernProgramCarouselDemo({ onNavigateBack }: ModernProgramCarouselDemoProps) {
  const cards = modernProgramsData.map((card, index) => (
    <ModernProgramCard key={card.id} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full py-20">
      <div className="max-w-7xl mx-auto px-4">
        {onNavigateBack && (
          <Button 
            variant="outline" 
            onClick={onNavigateBack}
            className="mb-8 hover:bg-gray-50"
          >
            ← Voltar
          </Button>
        )}
        <h2 className="text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans mb-4">
          Programas Premium de Treinamento
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-8 max-w-3xl">
          Descubra os melhores programas de transformação com design moderno, microinterações sofisticadas e modal expandível. Cada card combina elegância visual com funcionalidade avançada.
        </p>
      </div>
      <ModernCarousel items={cards} />
    </div>
  );
}

const ProgramDetailContent = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">{title}</h4>
        <p className="text-gray-600 leading-relaxed mb-6">{description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-[#e0093e] mb-1">12</div>
            <div className="text-sm text-gray-600">Semanas</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-[#e0093e] mb-1">3x</div>
            <div className="text-sm text-gray-600">Por semana</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-[#e0093e] mb-1">1h</div>
            <div className="text-sm text-gray-600">Por sessão</div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-[#e0093e] to-[#c40835] rounded-2xl p-6 text-white">
        <h5 className="font-semibold mb-3">🎯 Resultados Esperados</h5>
        <ul className="space-y-2 text-sm opacity-90">
          <li>• Redução de 8-15% do percentual de gordura</li>
          <li>• Ganho de 3-8kg de massa muscular magra</li>
          <li>• Melhoria de 40% na força e resistência</li>
          <li>• Desenvolvimento de hábitos saudáveis duradouros</li>
        </ul>
      </div>
    </div>
  );
};

const modernProgramsData = [
  {
    id: "1",
    title: "Transformação Corporal Completa",
    image: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwdHJhaW5pbmclMjB3b3Jrb3V0fGVufDF8fHx8MTc1NjE3MTk3M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    level: "Intermediário",
    category: "Musculação",
    duration: "12 semanas",
    students: "234",
    rating: 4.9,
    price: "R$ 297",
    originalPrice: "R$ 497",
    trainer: {
      name: "João Silva",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      initials: "JS",
      rating: 4.9,
      students: 150
    },
    content: <ProgramDetailContent 
      title="Metodologia Comprovada" 
      description="Um programa completo de transformação que combina treinos de força, condicionamento cardiovascular e orientação nutricional. Desenvolvido especificamente para pessoas que querem resultados reais em 12 semanas."
    />,
    includes: [
      "Treinos personalizados 3x/semana",
      "Plano nutricional completo",
      "Acompanhamento via WhatsApp",
      "Acesso ao app exclusivo",
      "Grupo VIP de alunos"
    ],
    mode: "Presencial + Online",
    location: "São Paulo, SP"
  },
  {
    id: "2", 
    title: "Treinamento Individual Premium",
    image: "https://images.unsplash.com/photo-1554686178-f7f3be2e8c51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb25hbCUyMHRyYWluZXJ8ZW58MXx8fHwxNzU2MTQ3NDkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    level: "Todos os níveis",
    category: "Personal Training",
    duration: "Flexível",
    students: "85",
    rating: 4.8,
    price: "R$ 120",
    trainer: {
      name: "Maria Santos",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616c9c68e05?w=400&q=80",
      initials: "MS",
      rating: 4.8,
      students: 85
    },
    content: <ProgramDetailContent 
      title="Atendimento Personalizado" 
      description="Sessões individuais focadas em seus objetivos específicos. Cada treino é único e adaptado ao seu progresso, com atenção total do instrutor durante toda a sessão."
    />,
    includes: [
      "Sessões 1:1 personalizadas",
      "Avaliação física completa",
      "Planejamento sob medida",
      "Feedback em tempo real",
      "Suporte nutricional básico"
    ],
    mode: "Presencial",
    location: "Rio de Janeiro, RJ"
  },
  {
    id: "3",
    title: "Equilíbrio Mente e Corpo",
    image: "https://images.unsplash.com/photo-1645652367526-a0ecb717650a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWVkaXRhdGlvbnxlbnwxfHx8fDE3NTYxNzE5ODB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    level: "Iniciante",
    category: "Yoga & Bem-estar",
    duration: "8 semanas",
    students: "200",
    rating: 4.9,
    price: "R$ 149",
    originalPrice: "R$ 199",
    trainer: {
      name: "Ana Costa",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      initials: "AC",
      rating: 4.9,
      students: 200
    },
    content: <ProgramDetailContent 
      title="Jornada de Autoconhecimento" 
      description="Um programa holístico que une práticas de yoga, meditação e mindfulness para desenvolver força física, flexibilidade mental e equilíbrio emocional."
    />,
    includes: [
      "Aulas ao vivo 2x/semana",
      "Biblioteca de práticas gravadas",
      "Guia de meditação",
      "Comunidade exclusiva",
      "Certificado de conclusão"
    ],
    mode: "Online",
    location: "100% Online"
  },
  {
    id: "4",
    title: "Boxe para Iniciantes",
    image: "https://images.unsplash.com/photo-1725813961320-151288b4c4db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjB0cmFpbmluZ3xlbnwxfHx8fDE3NTYxNzE5ODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    level: "Iniciante",
    category: "Luta & Defesa",
    duration: "6 semanas",
    students: "120",
    rating: 4.7,
    price: "R$ 180",
    trainer: {
      name: "Carlos Mendes",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
      initials: "CM",
      rating: 4.7,
      students: 120
    },
    content: <ProgramDetailContent 
      title="Arte Suave e Disciplina" 
      description="Aprenda os fundamentos do boxe em um ambiente seguro e acolhedor. Desenvolva técnica, condicionamento físico e autoconfiança através da arte do pugilismo."
    />,
    includes: [
      "Técnicas básicas de boxe",
      "Condicionamento físico",
      "Equipamentos inclusos",
      "Sparring supervisionado",
      "Certificado de participação"
    ],
    mode: "Presencial",
    location: "Belo Horizonte, MG"
  },
  {
    id: "5",
    title: "Preparação para Maratona",
    image: "https://images.unsplash.com/photo-1717406362477-8555b1190a87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwbWFyYXRob258ZW58MXx8fHwxNzU2MTcxOTg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    level: "Avançado",
    category: "Corrida & Atletismo",
    duration: "16 semanas",
    students: "95",
    rating: 4.8,
    price: "R$ 350",
    originalPrice: "R$ 450",
    trainer: {
      name: "Pedro Oliveira",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      initials: "PO",
      rating: 4.8,
      students: 95
    },
    content: <ProgramDetailContent 
      title="Metodologia Científica" 
      description="Programa estruturado para corredores que querem completar sua primeira maratona ou melhorar seu tempo pessoal. Baseado em ciência do esporte e experiência prática."
    />,
    includes: [
      "Plano de treinamento progressivo",
      "Acompanhamento semanal",
      "Análise de performance",
      "Orientação nutricional",
      "Grupo de corrida"
    ],
    mode: "Híbrido",
    location: "Porto Alegre, RS"
  },
  {
    id: "6",
    title: "Técnica e Performance na Água",
    image: "https://images.unsplash.com/photo-1727151590381-324be70e3295?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2x8ZW58MXx8fHwxNzU2MTcwNDM5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    level: "Intermediário",
    category: "Natação",
    duration: "10 semanas",
    students: "75",
    rating: 4.9,
    price: "R$ 280",
    originalPrice: "R$ 380",
    trainer: {
      name: "Juliana Lima",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
      initials: "JL",
      rating: 4.9,
      students: 75
    },
    content: <ProgramDetailContent 
      title="Excelência Aquática" 
      description="Aperfeiçoe sua técnica de natação e alcance novo patamar de performance. Programa focado em eficiência, velocidade e resistência na água."
    />,
    includes: [
      "Correção técnica individual",
      "Treinos de resistência",
      "Análise biomecânica",
      "Planejamento de competição",
      "Acesso à piscina olímpica"
    ],
    mode: "Presencial",
    location: "Florianópolis, SC"
  },
];