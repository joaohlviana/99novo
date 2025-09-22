/**
 * 🏆 SPORTS ICONS - CENTRALIZADO
 * 
 * Ícones dos esportes com fallback para retrocompatibilidade.
 * Migrado de /data/sports-icons.ts para /lib/
 */

import { sportsCategories as centralizedSports } from './sports-constants';

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

// Export padrão para retrocompatibilidade
export const sportsIconsMap = new Map(
  adjustedSportsIcons.map(sport => [sport.name.toLowerCase(), sport.icon])
);

// Função helper para buscar ícone por nome
export const getSportIcon = (sportName: string): string | undefined => {
  return sportsIconsMap.get(sportName.toLowerCase());
};

// Export padrão
export default adjustedSportsIcons;