import { 
  Dumbbell, 
  Activity, 
  Footprints, 
  Apple,
  Trophy,
  Target,
  Zap,
  Heart,
  Waves,
  Flame,
  Music,
  Sparkles,
  Shield,
  Palette,
  Mountain,
  Timer
} from 'lucide-react';

export const SPECIALTY_ICONS: Record<string, React.ComponentType<any>> = {
  'Musculação': Dumbbell,
  'Funcional': Activity,
  'Corrida': Footprints,
  'Nutrição': Apple,
  'Crossfit': Zap,
  'CrossFit': Zap,
  'Natação': Waves,
  'Yoga': Heart,
  'Pilates': Target,
  'Boxe': Trophy,
  'MMA': Shield,
  'Dança': Music,
  'Patinação': Sparkles,
  'Tênis': Trophy,
  'Ginástica': Palette,
  'Karatê': Shield,
  'Ginástica Artística': Palette,
  'Boliche': Target,
  'Vôlei': Activity,
  'Basketball': Trophy,
  'Futebol': Activity,
  'Basquete': Trophy,
  'Tênis com vara': Mountain,
  'Tênis de Mesa': Timer,
  'Arremesso de peso': Dumbbell,
  'Arco e flecha': Target,
  'Ciclismo': Activity,
  'Golfe': Target,
  'Condicionamento': Flame,
  'Defesa': Shield,
  'Meditação': Heart,
  'Flexibilidade': Target,
};

export const SPECIALTY_COLORS: Record<string, string> = {
  'Musculação': '#1f2937',
  'Funcional': '#4b5563',
  'Corrida': '#6b7280',
  'Nutrição': '#374151',
  'Crossfit': '#111827',
  'CrossFit': '#111827',
  'Natação': '#9ca3af',
  'Yoga': '#ef4444',
  'Pilates': '#3b82f6',
  'Boxe': '#111827',
  'MMA': '#dc2626',
  'Dança': '#ec4899',
  'Patinação': '#06b6d4',
  'Tênis': '#059669',
  'Ginástica': '#8b5cf6',
  'Karatê': '#dc2626',
  'Ginástica Artística': '#8b5cf6',
  'Boliche': '#f59e0b',
  'Vôlei': '#3b82f6',
  'Basketball': '#f97316',
  'Futebol': '#059669',
  'Basquete': '#f97316',
  'Tênis com vara': '#0ea5e9',
  'Tênis de Mesa': '#10b981',
  'Arremesso de peso': '#1f2937',
  'Arco e flecha': '#84cc16',
  'Ciclismo': '#0ea5e9',
  'Golfe': '#059669',
  'Condicionamento': '#dc2626',
  'Defesa': '#111827',
  'Meditação': '#8b5cf6',
  'Flexibilidade': '#ec4899',
};

export const DEFAULT_COLOR = '#6b7280';

export function getSpecialtyIcon(specialty: string) {
  const IconComponent = SPECIALTY_ICONS[specialty] || Target;
  return <IconComponent className="h-4 w-4" />;
}

export function getSpecialtyColor(specialty: string): string {
  return SPECIALTY_COLORS[specialty] || DEFAULT_COLOR;
}