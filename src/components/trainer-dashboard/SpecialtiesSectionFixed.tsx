import React, { useState, useCallback } from 'react';
import { Award, Plus, X, Dumbbell, Search, Loader2, CheckCircle } from 'lucide-react';
import { useAllSports } from '../../hooks/useSports';

// Componentes UI
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  variant = "default", 
  size = "default", 
  className = "", 
  onClick = () => {}, 
  disabled = false
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-700",
    outline: "border border-gray-300 hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
    success: "bg-green-600 text-white hover:bg-green-700",
    suggest: "bg-blue-600 text-white hover:bg-blue-700"
  };
  
  const sizes = {
    default: "h-9 px-4 text-sm",
    sm: "h-8 px-3 text-sm",
    xs: "h-7 px-2 text-xs"
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

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
const getSportIcon = (sportName) => {
  if (typeof sportName === 'object' && sportName.icon_url) {
    return sportName.icon_url;
  }
  if (typeof sportName === 'string') {
    const sport = sportsIcons.find(s => s.name.toLowerCase() === sportName.toLowerCase());
    return sport?.icon || null;
  }
  return null;
};

interface SpecialtiesSectionProps {
  profileData: {
    specialties: string[];
  };
  onProfileDataChange: (data: any) => void;
}

const SpecialtiesSection: React.FC<SpecialtiesSectionProps> = ({ 
  profileData, 
  onProfileDataChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hook para buscar esportes do banco de dados
  const { sports: databaseSports, loading: sportsLoading, error: sportsError } = useAllSports();
  
  const specialties = profileData.specialties || [];

  // Debug: Log dos dados
  console.log('🔍 SpecialtiesSection Debug:', {
    specialties,
    databaseSports: databaseSports.slice(0, 3),
    sportsLoading
  });

  return (
    <Card>
      <div className="p-6">
        {/* Header com contador de selecionados */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="h-8 w-8 text-gray-400" />
            {specialties.length > 0 && (
              <div className="bg-[#e0093e] text-white text-xs px-2 py-1 rounded-full font-medium">
                {specialties.length}/8
              </div>
            )}
          </div>
          <p className="text-sm font-medium text-gray-700">Escolha suas especialidades</p>
          <p className="text-xs text-gray-500">
            {specialties.length === 0 
              ? "Selecione até 8 esportes que você domina" 
              : `${specialties.length} selecionada${specialties.length > 1 ? 's' : ''} • ${8 - specialties.length} restante${8 - specialties.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Especialidades selecionadas */}
        {specialties.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty, index) => (
                <div
                  key={`selected-${specialty}-${index}`}
                  className="flex items-center gap-1 bg-[#e0093e]/10 border border-[#e0093e]/20 text-[#e0093e] px-3 py-1 rounded-full text-xs font-medium"
                >
                  <span>{specialty}</span>
                  <button
                    onClick={() => {
                      const newSpecialties = specialties.filter(s => s !== specialty);
                      onProfileDataChange(prev => ({
                        ...prev,
                        specialties: newSpecialties
                      }));
                    }}
                    className="ml-1 hover:bg-[#e0093e]/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Campo de busca */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar esportes..."
            className="pl-10 bg-white border-gray-200 focus:border-[#e0093e] focus:ring-[#e0093e]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Loading State */}
        {sportsLoading && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-sm font-medium text-gray-500">Carregando esportes...</p>
          </div>
        )}

        {/* Error State */}
        {sportsError && (
          <div className="text-center py-8">
            <Award className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-500">Erro ao carregar esportes</p>
            <p className="text-xs text-gray-400">Tente novamente mais tarde</p>
          </div>
        )}

        {/* Grid de esportes filtrados */}
        {!sportsLoading && !sportsError && databaseSports.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-80 overflow-y-auto">
            {databaseSports
              .filter(sport => sport.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((sport) => {
                const isSelected = specialties.includes(sport.name);
                const sportIcon = getSportIcon(sport.name);
                
                const handleToggle = () => {
                  console.log('🔄 Toggle sport:', sport.name, 'Currently selected:', isSelected);
                  
                  if (isSelected) {
                    // Remove da lista
                    const newSpecialties = specialties.filter(s => s !== sport.name);
                    console.log('➖ Removing sport. New list:', newSpecialties);
                    onProfileDataChange(prev => ({
                      ...prev,
                      specialties: newSpecialties
                    }));
                  } else {
                    // Adiciona à lista (máximo 8)
                    if (specialties.length < 8) {
                      const newSpecialties = [...specialties, sport.name];
                      console.log('➕ Adding sport. New list:', newSpecialties);
                      onProfileDataChange(prev => ({
                        ...prev,
                        specialties: newSpecialties
                      }));
                    } else {
                      console.log('⚠️ Maximum 8 specialties reached');
                    }
                  }
                };

                return (
                  <button
                    key={sport.id}
                    onClick={handleToggle}
                    disabled={!isSelected && specialties.length >= 8}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200 group cursor-pointer ${
                      isSelected
                        ? 'border-[#e0093e] bg-[#e0093e]/10 shadow-sm ring-1 ring-[#e0093e]/20'
                        : specialties.length >= 8
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-[#e0093e] hover:bg-[#e0093e]/5'
                    }`}
                  >
                    {/* Checkbox visual no canto superior direito */}
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-sm ${
                      isSelected
                        ? 'bg-[#e0093e] border-[#e0093e] scale-100'
                        : 'bg-white border-gray-300 scale-0 group-hover:scale-100'
                    }`}>
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <Plus className="w-3 h-3 text-gray-400" />
                      )}
                    </div>

                    <div className="w-8 h-8 flex items-center justify-center">
                      {sport.icon_url ? (
                        <img 
                          src={sport.icon_url} 
                          alt={sport.name}
                          className={`w-full h-full object-contain transition-all duration-200 ${
                            isSelected 
                              ? 'scale-110 brightness-110' 
                              : 'group-hover:scale-110'
                          }`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : sportIcon ? (
                        <img 
                          src={sportIcon} 
                          alt={sport.name}
                          className={`w-full h-full object-contain transition-all duration-200 ${
                            isSelected 
                              ? 'scale-110 brightness-110' 
                              : 'group-hover:scale-110'
                          }`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <Dumbbell 
                        className={`w-5 h-5 transition-colors duration-200 ${
                          isSelected
                            ? 'text-[#e0093e]'
                            : specialties.length >= 8
                            ? 'text-gray-300'
                            : 'text-gray-400 group-hover:text-[#e0093e]'
                        }`}
                        style={{ display: (sport.icon_url || sportIcon) ? 'none' : 'flex' }}
                      />
                    </div>
                    
                    <span className={`text-xs font-medium text-center transition-colors duration-200 leading-tight ${
                      isSelected
                        ? 'text-[#e0093e] font-semibold'
                        : specialties.length >= 8
                        ? 'text-gray-400'
                        : 'text-gray-700 group-hover:text-[#e0093e]'
                    }`}>
                      {sport.name}
                    </span>
                    
                    {/* Badge de selecionado */}
                    {isSelected && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="bg-[#e0093e] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          ✓
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        )}
        
        {/* Mensagem quando não há resultados na busca */}
        {!sportsLoading && searchTerm && databaseSports.filter(sport => 
          sport.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium">Nenhum esporte encontrado</p>
            <p className="text-xs text-gray-400">Tente buscar por outro termo</p>
          </div>
        )}
        
        {/* Informação sobre quantidade de esportes e resultados */}
        {!sportsLoading && databaseSports.length > 0 && (
          <div className="text-center mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {databaseSports.length} esportes disponíveis
              {searchTerm && ` • ${databaseSports.filter(sport => 
                sport.name.toLowerCase().includes(searchTerm.toLowerCase())
              ).length} resultados`}
              {specialties.length > 0 && ` • ${specialties.length}/8 selecionados`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SpecialtiesSection;