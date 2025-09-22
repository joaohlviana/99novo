// ==============================
// SPORTS ICONS - CENTRALIZADO
// ==============================
// Agora importa dos dados centralizados para manter consistência

import { sportsCategories as centralizedSports } from './constants';

export interface SportIcon {
  name: string;
  icon: string;
}

// Converte os dados centralizados para o formato SportIcon (retrocompatibilidade)
export const sportsIcons: SportIcon[] = centralizedSports.map(sport => ({
  name: sport.label,
  icon: sport.iconUrl
}));

// Adiciona alguns ajustes manuais para labels que diferem
const labelAdjustments: { [key: string]: string } = {
  'Yoga': 'Ioga', // Mantém Ioga para retrocompatibilidade
  'Salto com Vara': 'Salto com vara',
  'Arremesso de Peso': 'Arremesso de peso', 
  'Arco e Flecha': 'Arco e flecha',
  'CrossFit': 'Crossfit'
};

// Aplica os ajustes de labels
export const adjustedSportsIcons: SportIcon[] = sportsIcons.map(sport => ({
  ...sport,
  name: labelAdjustments[sport.name] || sport.name
}));

// Export final com ajustes
export const finalSportsIcons = adjustedSportsIcons;

// Helper function to get sport icon by name
export const getSportIcon = (sportName: string): string | null => {
  const sport = finalSportsIcons.find(sport => 
    sport.name.toLowerCase() === sportName.toLowerCase()
  );
  return sport ? sport.icon : null;
};

// Helper function to get all sport names
export const getAllSportNames = (): string[] => {
  return finalSportsIcons.map(sport => sport.name);
};

// Categories for easier organization
export const sportCategories = {
  'Lutas e Artes Marciais': ['Karatê', 'Boxe', 'Lutas'],
  'Fitness e Musculação': ['Musculação', 'Crossfit', 'Funcionais'],
  'Esportes com Bola': ['Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Tênis de Mesa', 'Baseball', 'Futebol Americano'],
  'Atividades Aquáticas': ['Natação'],
  'Atletismo': ['Corrida', 'Salto com vara', 'Arremesso de peso'],
  'Bem-estar e Flexibilidade': ['Ioga', 'Alongamento', 'Ginástica', 'Ginástica Artística'],
  'Esportes Radicais': ['Escalada', 'Patinação'],
  'Esportes de Precisão': ['Tiro', 'Arco e flecha', 'Golfe'],
  'Atividades Recreativas': ['Dança', 'Boliche', 'Sinuca'],
  'Ciclismo': ['Ciclismo']
};