/**
 * ModernProgramCarousel - VERSÃO UNIFICADA
 * =======================================
 * Carousel moderno usando sistema unificado de programas
 */

"use client";

import React from "react";
import { ModernCarousel } from './ModernProgramCarousel';
import { CompactProgramCard } from './unified/UnifiedProgramCard';
import { usePopularPrograms } from '../hooks/useUnifiedPrograms';

/**
 * Carousel de Programas com dados unificados
 */
export const ModernProgramCarouselUnified = () => {
  const { programs, loading, error } = usePopularPrograms();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !programs || programs.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Nenhum programa encontrado.</p>
      </div>
    );
  }

  const carouselItems = programs.map((program, index) => (
    <CompactProgramCard
      key={program.id}
      program={program}
      actions={{
        onNavigateToProgram: (id) => console.log('Navigate to program:', id),
        onNavigateToTrainer: (id) => console.log('Navigate to trainer:', id),
        onLike: (id) => console.log('Like program:', id)
      }}
    />
  ));

  return <ModernCarousel items={carouselItems} />;
};

export default ModernProgramCarouselUnified;