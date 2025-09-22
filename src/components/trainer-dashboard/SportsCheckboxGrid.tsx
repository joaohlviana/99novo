import { useId, useState, useCallback, useMemo } from "react";
import { Search, Dumbbell, Loader2, Award } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useAllSports } from "../../hooks/useSports";

// Simulação do módulo de ícones dos esportes (fallback)
const sportsIcons = [
  { name: 'Musculação', icon: '/icons/musculacao.svg' },
  { name: 'Crossfit', icon: '/icons/crossfit.svg' },
  { name: 'Pilates', icon: '/icons/pilates.svg' },
  { name: 'Yoga', icon: '/icons/yoga.svg' },
  { name: 'Corrida', icon: '/icons/corrida.svg' },
  { name: 'Natação', icon: '/icons/natacao.svg' },
  { name: 'Funcional', icon: '/icons/funcional.svg' },
  { name: 'Dança', icon: '/icons/danca.svg' },
  { name: 'Boxe', icon: '/icons/boxe.svg' },
  { name: 'Tênis', icon: '/icons/tenis.svg' },
  { name: 'Futebol', icon: '/icons/futebol.svg' },
  { name: 'Basquete', icon: '/icons/basquete.svg' },
  { name: 'Vôlei', icon: '/icons/volei.svg' },
  { name: 'Karatê', icon: '/icons/karate.svg' },
  { name: 'Jiu-Jitsu', icon: '/icons/jiu-jitsu.svg' },
  { name: 'Escalada', icon: '/icons/escalada.svg' },
  { name: 'Ciclismo', icon: '/icons/ciclismo.svg' },
  { name: 'Golfe', icon: '/icons/golfe.svg' },
  { name: 'Surfe', icon: '/icons/surfe.svg' },
  { name: 'Alongamento', icon: '/icons/alongamento.svg' }
];

// Função para obter ícone do esporte
const getSportIcon = (sportName: string): string | null => {
  if (typeof sportName === 'string') {
    const sport = sportsIcons.find(s => s.name.toLowerCase() === sportName.toLowerCase());
    return sport?.icon || null;
  }
  return null;
};

// Sport icon component for consistency
const SportIcon = ({ sport }: { sport: any }) => {
  const sportIcon = getSportIcon(sport.name);
  
  if (sport.icon_url) {
    return (
      <img 
        src={sport.icon_url} 
        alt={sport.name}
        className="w-8 h-8 object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'block';
          }
        }}
      />
    );
  }
  
  if (sportIcon) {
    return (
      <img 
        src={sportIcon} 
        alt={sport.name}
        className="w-8 h-8 object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'block';
          }
        }}
      />
    );
  }
  
  return <Dumbbell className="w-8 h-8" />;
};

// Sport card component
const SportCard = ({ 
  sport, 
  isSelected, 
  isDisabled, 
  onToggle,
  id 
}: {
  sport: any;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: (sportName: string, checked: boolean) => void;
  id: string;
}) => {
  const handleCardClick = useCallback(() => {
    if (!isDisabled) {
      onToggle(sport.name, !isSelected);
    }
  }, [sport.name, isSelected, isDisabled, onToggle]);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    onToggle(sport.name, checked);
  }, [sport.name, onToggle]);

  return (
    <div
      className={`
        relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border p-5 min-h-[100px]
        transition-all duration-200 outline-none
        ${isSelected
          ? 'border-brand/50 bg-brand/5 shadow-sm ring-1 ring-brand/20'
          : 'border-input hover:border-brand/30 hover:bg-brand/5'
        } 
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={handleCardClick}
    >
      <Checkbox
        id={id}
        checked={isSelected}
        disabled={isDisabled}
        onCheckedChange={handleCheckboxChange}
        className="absolute top-2 right-2 z-10"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="opacity-60 pointer-events-none">
        <SportIcon sport={sport} />
      </div>
      <Label 
        htmlFor={id} 
        className="text-xs font-medium text-center pointer-events-none cursor-pointer"
      >
        {sport.name}
      </Label>
    </div>
  );
};

interface SportsCheckboxGridProps {
  profileData: {
    specialties: string[];
  };
  onProfileDataChange: (data: any) => void;
}

export default function SportsCheckboxGrid({ profileData, onProfileDataChange }: SportsCheckboxGridProps) {
  const componentId = useId();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hook para buscar esportes do banco de dados
  const { sports: databaseSports, loading: sportsLoading, error: sportsError } = useAllSports();
  
  const specialties = useMemo(() => profileData.specialties || [], [profileData.specialties]);

  // Filtrar esportes pela busca
  const filteredSports = useMemo(() => 
    databaseSports.filter(sport => 
      sport.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [databaseSports, searchTerm]);

  // Separar esportes selecionados dos não selecionados
  const { selectedSports, unselectedSports } = useMemo(() => {
    const selected = filteredSports.filter(sport => 
      specialties.includes(sport.name)
    );
    const unselected = filteredSports.filter(sport => 
      !specialties.includes(sport.name)
    );
    
    return { selectedSports: selected, unselectedSports: unselected };
  }, [filteredSports, specialties]);

  // Optimized sport change handler
  const handleSportChange = useCallback((sportName: string, checked: boolean) => {
    console.log('🔄 Sport change:', sportName, 'Checked:', checked);
    
    const safeSpecialties = Array.isArray(specialties) ? specialties : [];
    
    if (checked) {
      // Adicionar esporte (máximo 8)
      if (safeSpecialties.length < 8) {
        const newSpecialties = [...safeSpecialties, sportName];
        console.log('➕ Adding sport. New list:', newSpecialties);
        onProfileDataChange({ specialties: newSpecialties });
      } else {
        console.log('⚠️ Maximum 8 specialties reached');
      }
    } else {
      // Remover esporte
      const newSpecialties = safeSpecialties.filter(s => s !== sportName);
      console.log('➖ Removing sport. New list:', newSpecialties);
      onProfileDataChange({ specialties: newSpecialties });
    }
  }, [specialties, onProfileDataChange]);

  // Loading state
  if (sportsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-sm font-medium text-gray-500">Carregando esportes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (sportsError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Award className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-500">Erro ao carregar esportes</p>
          <p className="text-xs text-gray-400">Tente novamente mais tarde</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Suas Especialidades</h3>
          <p className="text-sm text-gray-600">
            {specialties.length === 0 
              ? "Selecione até 8 esportes que você domina" 
              : `${specialties.length}/8 especialidades selecionadas`
            }
          </p>
        </div>
        {specialties.length > 0 && (
          <div className="bg-brand text-white text-sm px-3 py-1 rounded-full font-medium">
            {specialties.length}/8
          </div>
        )}
      </div>

      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar esportes..."
          className="pl-10 bg-white border-gray-200 focus:border-brand focus:ring-brand"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Especialidades selecionadas */}
      {selectedSports.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-brand flex items-center gap-2">
            <Award className="w-4 h-4" />
            Especialidades Selecionadas ({selectedSports.length})
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {selectedSports.map((sport) => (
              <SportCard 
                key={`selected-${sport.id}`}
                sport={sport}
                isSelected={true}
                isDisabled={false}
                onToggle={handleSportChange}
                id={`${componentId}-selected-${sport.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Esportes disponíveis */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">
          Esportes Disponíveis ({unselectedSports.length})
        </h4>
        {unselectedSports.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
            {unselectedSports.map((sport) => (
              <SportCard 
                key={`available-${sport.id}`}
                sport={sport}
                isSelected={false}
                isDisabled={specialties.length >= 8}
                onToggle={handleSportChange}
                id={`${componentId}-available-${sport.id}`}
              />
            ))}
          </div>
        ) : searchTerm ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">Nenhum esporte encontrado</p>
            <p className="text-xs text-gray-400">Tente buscar por outro termo</p>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">Todos os esportes foram selecionados!</p>
          </div>
        )}
      </div>

      {/* Aviso de limite */}
      {specialties.length >= 8 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Limite atingido:</strong> Você selecionou o máximo de 8 especialidades. 
            Remova alguma para adicionar outras.
          </p>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="text-center pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {databaseSports.length} esportes disponíveis
          {searchTerm && ` • ${filteredSports.length} resultados`}
          {specialties.length > 0 && ` • ${specialties.length}/8 selecionados`}
        </p>
      </div>
    </div>
  );
}