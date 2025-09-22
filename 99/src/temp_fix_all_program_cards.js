// Script para encontrar e corrigir todos os cards de programa
const fs = require('fs');
const path = require('path');

// Arquivos que podem usar UnifiedProgramCard
const filesToCheck = [
  '/components/HomePage.tsx',
  '/components/SportPage.tsx',
  '/components/client-dashboard/MyProgramsSection.tsx',
  '/components/trainer-dashboard/ProgramsManagement.tsx',
  '/pages/ProgramDetailsPage.tsx',
  '/pages/CatalogPage.tsx'
];

console.log('🔍 Buscando usos do UnifiedProgramCard...');

// Função para atualizar um arquivo
function fixProgramCardUsage(filePath, content) {
  // Encontrar onde CompactProgramCard é usado
  const compactCardRegex = /<CompactProgramCard\s+([^>]*)>/g;
  const unifiedCardRegex = /<UnifiedProgramCard\s+([^>]*)>/g;
  
  let updated = content;
  
  // Corrigir CompactProgramCard
  updated = updated.replace(compactCardRegex, (match, props) => {
    if (!props.includes('onClick')) {
      // Adicionar onClick se não existir
      const propsWithOnClick = props.includes('program=') 
        ? props + ' onClick={() => navigation.navigateToProgram(program.id)}'
        : props;
      return `<CompactProgramCard ${propsWithOnClick}>`;
    }
    return match;
  });
  
  // Corrigir UnifiedProgramCard
  updated = updated.replace(unifiedCardRegex, (match, props) => {
    if (!props.includes('onClick')) {
      // Adicionar onClick se não existir
      const propsWithOnClick = props.includes('program=') 
        ? props + ' onClick={() => navigation.navigateToProgram(program.id)}'
        : props;
      return `<UnifiedProgramCard ${propsWithOnClick}>`;
    }
    return match;
  });
  
  return updated;
}

console.log('✅ Script preparado para correção dos cards de programa');