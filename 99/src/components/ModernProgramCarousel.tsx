"use client";

import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X, Clock, Users, Star, Heart, BookOpen, Trophy, Play, CheckCircle, MapPin } from "lucide-react";
import { cn } from "../lib/utils";
import { useOutsideClick } from "../hooks/use-outside-click";
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
}

type ProgramCard = {
  id: string;
  title: string;
  image: string;
  level: string;
  category: string;
  duration: string;
  students: string;
  rating: number;
  price: string;
  originalPrice?: string;
  trainer: {
    name: string;
    avatar: string;
    initials: string;
    rating: number;
    students: number;
  };
  content: React.ReactNode;
  includes: string[];
  mode: string;
  location: string;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const ModernCarousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = 384; // Fixed card width
      const gap = 24;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20 scrollbar-hide"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div className={cn("flex flex-row justify-start gap-4 sm:gap-6 pl-4 sm:pl-6", "mx-auto max-w-7xl")}>
            {items.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                    once: true,
                  },
                }}
                key={"modern-card" + index}
                className="flex-shrink-0 w-[240px] sm:w-[280px] md:w-[320px] last:pr-4 sm:last:pr-6 md:last:pr-[33%]"
                style={{ minWidth: '240px' }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mr-10 flex justify-end gap-2">
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition-colors"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <ArrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50 hover:bg-gray-200 transition-colors"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <ArrowRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const ModernProgramCard = ({
  card,
  index,
  layout = false,
}: {
  card: ProgramCard;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose, currentIndex } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  const DetailedContent = () => (
    <div className="max-w-4xl mx-auto">
      {/* Trainer Header */}
      <div className="flex items-center gap-4 mb-8 p-6 bg-gray-50 rounded-2xl">
        <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
          <AvatarImage src={card.trainer.avatar} alt={card.trainer.name} />
          <AvatarFallback className="bg-gray-900 text-white font-semibold">
            {card.trainer.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-xl">{card.trainer.name}</h3>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-yellow-500" />
              <span className="font-medium">{card.trainer.rating}</span>
            </div>
            <span className="text-gray-600">• {card.trainer.students}+ alunos</span>
          </div>
        </div>
        <Button className="bg-[#e0093e] hover:bg-[#c40835]">
          Ver Perfil
        </Button>
      </div>

      {/* Program Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Informações do Programa</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#e0093e]" />
                <div>
                  <p className="font-medium text-gray-900">Duração</p>
                  <p className="text-gray-600">{card.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#e0093e]" />
                <div>
                  <p className="font-medium text-gray-900">Modalidade</p>
                  <p className="text-gray-600">{card.mode}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#e0093e]" />
                <div>
                  <p className="font-medium text-gray-900">Local</p>
                  <p className="text-gray-600">{card.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">O que está incluso:</h4>
            <div className="space-y-3">
              {card.includes.map((item: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Program Content */}
      <div className="bg-gray-50 rounded-2xl p-8 mb-8">
        {card.content}
      </div>

      {/* Bottom CTA */}
      <div className="text-center bg-[#e0093e] rounded-2xl p-8">
        <div className="mb-4">
          <span className="text-4xl font-bold text-white">{card.price}</span>
          {card.originalPrice && (
            <span className="text-xl text-white/70 line-through ml-3">{card.originalPrice}</span>
          )}
        </div>
        <Button 
          size="lg" 
          className="bg-white text-[#e0093e] hover:bg-gray-100 px-8 py-3 font-semibold"
        >
          Começar Agora
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              ref={containerRef}
              className="relative z-[60] mx-auto my-10 h-fit max-w-6xl rounded-3xl bg-white p-8 md:p-12"
            >
              <button
                className="sticky top-4 right-0 ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors mb-6"
                onClick={handleClose}
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
              
              <motion.p className="text-lg font-medium text-[#e0093e] mb-2">
                {card.category}
              </motion.p>
              <motion.h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                {card.title}
              </motion.h2>
              
              <DetailedContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Card Design - Baseado no ModernProgramCard */}
      <Card className="group w-96 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer">
        <CardContent className="p-0" onClick={handleOpen}>
          {/* Image Section */}
          <div className="relative h-60 overflow-hidden rounded-t-3xl">
            <ImageWithFallback
              src={card.image}
              alt={card.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Gradients */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/40" />

            {/* Level Badge - Top Left */}
            <div className="absolute left-4 top-4 transition-all duration-300 group-hover:scale-105">
              <Badge className="rounded-full border border-white/40 bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-lg backdrop-blur-md hover:bg-white transition-colors">
                {card.level}
              </Badge>
            </div>

            {/* Category Badge - Top Right */}
            <div className="absolute right-14 top-4 transition-all duration-300 group-hover:scale-105">
              <Badge className="rounded-full border border-white/40 bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-lg backdrop-blur-md hover:bg-white transition-colors">
                {card.category}
              </Badge>
            </div>

            {/* Like Button - Top Right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-white/80 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95 ${
                isLiked ? 'ring-2 ring-[#e0093e]/50 bg-white' : ''
              }`}
            >
              <Heart
                className={`h-4 w-4 transition-all duration-300 ${
                  isLiked ? 'text-[#e0093e] fill-current scale-110' : 'text-gray-700 hover:text-gray-900'
                }`}
              />
            </button>

            {/* Play Button - Center */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm shadow-2xl border border-white/30 hover:bg-white/30 hover:scale-110 transition-all duration-300 cursor-pointer">
                <Play className="h-7 w-7 fill-current text-white ml-0.5" />
              </div>
            </div>

            {/* Trainer Chip - Bottom Left */}
            <div className="absolute bottom-0 left-4 translate-y-1/2 z-[9999]">
              <div className="flex cursor-pointer items-center gap-2.5 rounded-full border border-white/60 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-white active:scale-95">
                <Avatar className="h-10 w-10 ring-3 ring-white shadow-md transition-all duration-300 hover:ring-4">
                  <AvatarImage src={card.trainer.avatar} alt={card.trainer.name} />
                  <AvatarFallback className="bg-gray-900 text-white text-xs font-semibold">
                    {card.trainer.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold leading-tight text-gray-900">
                    {card.trainer.name}
                  </div>
                  <div className="text-xs leading-tight text-gray-600">
                    Instrutor
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 pt-8 pb-5">
            {/* Title */}
            <h3 className="mb-4 line-clamp-2 text-lg font-bold leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-gray-800">
              {card.title}
            </h3>

            {/* Stats Row */}
            <div className="mb-5 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5 transition-colors hover:text-gray-800">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{card.duration}</span>
              </div>
              <div className="flex items-center gap-1.5 transition-colors hover:text-gray-800">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{card.students}</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-current text-amber-400" />
                <span className="font-semibold text-gray-900">{card.rating}</span>
              </div>
            </div>

            {/* Price and CTA */}
            <div className="mb-4 flex items-end justify-between">
              <div className="flex flex-col">
                <div className="text-2xl font-black leading-none text-gray-900">
                  {card.price}
                </div>
                <div className="mt-1 text-sm text-gray-600 leading-none">por mês</div>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen();
                }}
                className="h-10 rounded-full border-0 bg-[#e0093e] px-5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#c40835] hover:shadow-xl active:translate-y-0 active:scale-95"
              >
                <BookOpen className="mr-1.5 h-4 w-4" />
                Ver detalhes
              </Button>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1.5 transition-colors hover:text-gray-800">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <span>Certificado incluso</span>
                </div>
                <span className="transition-colors hover:text-gray-800">Acesso vitalício</span>
              </div>
            </div>
          </div>

          {/* Price Banner at Bottom */}
          <div className="flex items-center gap-3 rounded-b-3xl bg-[#e0093e] px-6 py-4 transition-all duration-300 group-hover:bg-[#c40835]">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-white shadow-sm">
              <div className="h-2 w-2 rounded bg-[#e0093e]" />
            </div>
            <div className="flex-1">
              <span className="font-bold text-white">{card.price}</span>
              <span className="ml-2 text-sm text-white/90">por mês</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};