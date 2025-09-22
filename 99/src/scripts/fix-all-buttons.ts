/**
 * SCRIPT DE PADRONIZAÇÃO DE BOTÕES - SISTEMA COMPLETO
 * ===================================================
 * Este script corrige TODOS os botões no sistema para seguir o padrão:
 * - size="lg" 
 * - className="bg-[#e0093e] hover:bg-[#c0082e] text-white px-8"
 */

// Padrão de botão primário da marca
export const BRAND_BUTTON_PATTERN = {
  size: "lg",
  className: "bg-[#e0093e] hover:bg-[#c0082e] text-white px-8"
};

// Lista de arquivos para verificar (principais componentes com botões)
export const FILES_TO_CHECK = [
  // Páginas principais
  '/components/HomePage.tsx',
  '/components/BecomeTrainer.tsx', 
  '/components/BecomeClient.tsx',
  
  // Dashboards
  '/components/trainer-dashboard/TrainerDashboard.tsx',
  '/components/client-dashboard/ClientDashboard.tsx',
  '/components/admin-dashboard/AdminDashboard.tsx',
  
  // Cards e componentes de programa
  '/components/unified/UnifiedProgramCard.tsx',
  '/components/ModernProgramCard.tsx',
  '/components/DashboardProgramCard.tsx',
  '/components/TrainerCard.tsx',
  '/components/ModernProfileCard.tsx',
  
  // Auth e navegação
  '/components/auth/LoginModal.tsx',
  '/components/Header.tsx',
  '/components/Footer.tsx',
  
  // Formulários
  '/components/become-trainer/TrainerFormStepper.tsx',
  '/components/become-client/ClientFormStepper.tsx',
  '/components/trainer-dashboard/ProfileManagement.tsx',
  '/components/trainer-dashboard/ProgramCreation.tsx',
  '/components/trainer-dashboard/ProgramsManagement.tsx',
  
  // Páginas específicas
  '/pages/BecomeTrainerPage.tsx',
  '/pages/BecomeClientPage.tsx',
  '/pages/HomePage.tsx',
  '/pages/TrainerProfilePage.tsx',
  
  // Componentes de desenvolvimento
  '/components/DashboardAccessButtons.tsx',
  '/components/DevelopmentButtons.tsx'
];

// Padrões de botão incorretos para identificar
export const INCORRECT_PATTERNS = [
  // Botões sem size="lg"
  /<Button\s+(?!.*size=")[^>]*>/g,
  
  // Botões com cores diferentes da marca
  /<Button[^>]*className="[^"]*bg-(?!(\[#e0093e\]|\[#c0082e\]))[^"]*"[^>]*>/g,
  
  // Botões sem as classes da marca
  /<Button[^>]*(?!.*bg-\[#e0093e\])[^>]*>/g,
];

// Regex para encontrar todos os botões
export const BUTTON_REGEX = /<Button\s+[^>]*>/g;

// Função para verificar se um botão precisa ser corrigido
export function needsFixing(buttonMatch: string): boolean {
  // Se já tem o padrão correto, não precisa ser corrigido
  if (buttonMatch.includes('size="lg"') && 
      buttonMatch.includes('bg-[#e0093e]') && 
      buttonMatch.includes('hover:bg-[#c0082e]') && 
      buttonMatch.includes('text-white') &&
      buttonMatch.includes('px-8')) {
    return false;
  }
  
  // Se é um botão variant="ghost", "outline", "secondary" etc, pode não precisar
  if (buttonMatch.includes('variant="ghost"') || 
      buttonMatch.includes('variant="outline"') ||
      buttonMatch.includes('variant="secondary"') ||
      buttonMatch.includes('variant="destructive"')) {
    return false;
  }
  
  return true;
}

// Função para gerar o botão corrigido
export function fixButton(buttonMatch: string): string {
  let fixed = buttonMatch;
  
  // Adicionar size="lg" se não existir
  if (!fixed.includes('size=')) {
    fixed = fixed.replace('<Button', '<Button size="lg"');
  }
  
  // Corrigir className
  const classNameRegex = /className="([^"]*)"/;
  const match = fixed.match(classNameRegex);
  
  if (match) {
    const existingClasses = match[1];
    // Remove classes de background e hover existentes
    const cleanClasses = existingClasses
      .replace(/bg-\[[^\]]+\]/g, '')
      .replace(/hover:bg-\[[^\]]+\]/g, '')
      .replace(/bg-\w+/g, '')
      .replace(/hover:bg-\w+/g, '')
      .replace(/text-\w+/g, '')
      .replace(/px-\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const newClassName = `bg-[#e0093e] hover:bg-[#c0082e] text-white px-8 ${cleanClasses}`.trim();
    fixed = fixed.replace(classNameRegex, `className="${newClassName}"`);
  } else {
    // Se não tem className, adicionar
    fixed = fixed.replace('<Button', '<Button className="bg-[#e0093e] hover:bg-[#c0082e] text-white px-8"');
  }
  
  return fixed;
}

console.log('📝 Script de padronização de botões carregado!');
console.log('🎯 Padrão:', BRAND_BUTTON_PATTERN);
console.log('📁 Arquivos para verificar:', FILES_TO_CHECK.length);