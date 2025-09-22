"use client";

import React from "react";
import { Carousel as AppleCarousel } from "./ui/apple-cards-carousel";

export default function AppleCardsCarouselDemo() {
  const cards = data.map((card, index) => (
    <div key={card.src} className="w-80">
      <div className="relative h-80 w-80 flex flex-col items-start justify-end overflow-hidden rounded-3xl bg-gray-100 dark:bg-neutral-900 cursor-pointer hover:scale-105 transition-transform duration-300">
        {/* Background Image */}
        <img
          src={card.src}
          alt={card.title}
          className="absolute inset-0 z-10 object-cover h-full w-full"
        />
        
        {/* Gradient Overlay - From black to transparent bottom to top */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-full bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Content - Aligned to bottom */}
        <div className="relative z-40 p-8">
          <p className="text-left font-sans text-sm font-medium text-white md:text-base">
            {card.category}
          </p>
          <p className="mt-2 max-w-xs text-left font-sans text-xl font-semibold text-white md:text-3xl">
            {card.title}
          </p>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="w-full h-full py-20">
      {/* Título usando container padrão */}
      <div className="container">
        <h2 className="text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-[Inter] mb-8 text-[36px]">
          Descubra Novos Programas de Treino
        </h2>
      </div>
      
      {/* Carousel usando full-bleed para estourar o container */}
      <section className="full-bleed bg-background">
        <div className="pl-6 lg:pl-8">
          <AppleCarousel items={cards} />
        </div>
      </section>
    </div>
  );
}

const data = [
  {
    category: "Funcional",
    title: "Treino Funcional Completo",
    src: "https://images.unsplash.com/photo-1734188341701-5a0b7575efbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdW5jdGlvbmFsJTIwdHJhaW5pbmclMjB3b3Jrb3V0fGVufDF8fHx8MTc1NjEzMTY1MHww&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    category: "Musculação",
    title: "Hipertrofia Avançada",
    src: "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWlnaHRsaWZ0aW5nJTIwZ3ltJTIwdHJhaW5pbmd8ZW58MXx8fHwxNzU2MTMxNjUxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    category: "Corrida",
    title: "Maratona para Iniciantes",
    src: "https://images.unsplash.com/photo-1737736193172-f3b87a760ad5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwY2FyZGlvJTIwdHJhaW5pbmd8ZW58MXx8fHwxNTY2MTMxNjUxfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    category: "Yoga",
    title: "Yoga Flow Essencial",
    src: "https://images.unsplash.com/photo-1641971215217-fc55b492d11f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwc3R1ZGlvJTIwY2xhc3N8ZW58MXx8fHwxNzU2Njg5MTMzfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    category: "Natação",
    title: "Técnica Avançada de Natação",
    src: "https://images.unsplash.com/photo-1727151590381-324be70e3295?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzd2ltbWluZyUyMHBvb2wlMjB0cmFpbmluZ3xlbnwxfHx8fDE3NTY2ODkxMzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    category: "Boxe",
    title: "Fundamentos do Boxe",
    src: "https://images.unsplash.com/photo-1570456717698-41ac2f7157bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3hpbmclMjB0cmFpbmluZyUyMGd5bXxlbnwxfHx8fDE3NTY1OTAxMzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];