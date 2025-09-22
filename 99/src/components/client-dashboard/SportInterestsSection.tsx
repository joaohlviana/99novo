import React, { useState } from 'react';
import { Activity, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { SportIcon } from '../ui/sport-icon';

interface SportCategory {
  id: string;
  label: string;
  iconUrl: string;
}

const sportsCategories: SportCategory[] = [
  {
    id: "patinacao",
    label: "Patinação",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a1364d43a6ffeeee0eb4_rollerblades.svg"
  },
  {
    id: "tiro",
    label: "Tiro",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a127624d9cee88ed251a_shooting-rifle.svg"
  },
  {
    id: "sinuca",
    label: "Sinuca",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a115c9d8a64193ef250b_pool-triangle.svg"
  },
  {
    id: "karate",
    label: "Karatê",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aaae6177fee37158c064_martial-arts-karate.svg"
  },
  {
    id: "ginastica",
    label: "Ginástica",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aae0bd02a2c8a89abb8f_gymnastics-acrobatic-hanging-person.svg"
  },
  {
    id: "funcionais",
    label: "Funcionais",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a0b85596fea69cb6bc92_fitness-heart-rate.svg"
  },
  {
    id: "danca",
    label: "Dança",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a09dd0dc103f3cbc5d63_dancing-ballet.svg"
  },
  {
    id: "escalada",
    label: "Escalada",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a08820119c2ea46348cd_climbing-mountain.svg"
  },
  {
    id: "boxe",
    label: "Boxe",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099feb2299cc48ec093107_boxing-glove.svg"
  },
  {
    id: "boliche",
    label: "Boliche",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099fd93b4aaebe1c46bd52_bowling-pins.svg"
  },
  {
    id: "volei",
    label: "Vôlei",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099fb520119c2ea46214c3_volleyball-net.svg"
  },
  {
    id: "baseball",
    label: "Baseball",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab6c10a7b22e2bd03f0c_baseball-bat-ball.svg"
  },
  {
    id: "salto-vara",
    label: "Salto com Vara",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099f8fa93d761daa757503_athletics-pole-vault.svg"
  },
  {
    id: "tenis",
    label: "Tênis",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a19ffd24774fa15a51b8_tennis-racquet.svg"
  },
  {
    id: "tenis-mesa",
    label: "Tênis de Mesa",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a1cea6667fcf72dbaef3_ping-pong-paddle.svg"
  },
  {
    id: "arremesso",
    label: "Arremesso de Peso",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab3737c43eacec86aa06_athletics-discus-throwing.svg"
  },
  {
    id: "arco-flecha",
    label: "Arco e Flecha",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099f15e951a9e4a5a8f3d9_archery-person.svg"
  },
  {
    id: "futebol-americano",
    label: "Futebol Americano",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/65099f03856bf3a8e5ab0af9_american-football-ball-1.svg"
  },
  {
    id: "alongamento",
    label: "Alongamento",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aafd7401672b3b753bf3_gymnastics-ribbon-person-2.svg"
  },
  {
    id: "lutas",
    label: "Lutas",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aaae6177fee37158c064_martial-arts-karate.svg"
  },
  {
    id: "natacao",
    label: "Natação",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6509a15172d10e33e4c9eed8_swimming-diving.svg"
  },
  {
    id: "yoga",
    label: "Yoga",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aafd7401672b3b753bf3_gymnastics-ribbon-person-2.svg"
  },
  {
    id: "golfe",
    label: "Golfe",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aad2519bfb58647211a2_golf-player.svg"
  },
  {
    id: "ginastica-artistica",
    label: "Ginástica Artística",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aae0bd02a2c8a89abb8f_gymnastics-acrobatic-hanging-person.svg"
  },
  {
    id: "futebol",
    label: "Futebol",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508aaea1967b1f155ff7e85_soccer-player.svg"
  },
  {
    id: "musculacao",
    label: "Musculação",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab177b7d1b2c8bd16d49_fitness-biceps.svg"
  },
  {
    id: "crossfit",
    label: "CrossFit",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab1357e090eefc5d0a6c_fitness-grip-weights.svg"
  },
  {
    id: "corrida",
    label: "Corrida",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/610d3768e2c3de514e5c30a2_corrida.png"
  },
  {
    id: "ciclismo",
    label: "Ciclismo",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab61ce55fe7e9d562f88_biking-person.svg"
  },
  {
    id: "basquete",
    label: "Basquete",
    iconUrl: "https://cdn.prod.website-files.com/6105b575384a7015be985fb9/6508ab749a54d8f03dbe48ba_basketball-hoop.svg"
  }
];

interface SportInterestsSectionProps {
  currentSports: string[];
  pastSports: string[];
  sportsCuriosity: string[];
  onSportsChange: (field: 'currentSports' | 'pastSports' | 'sportsCuriosity', sports: string[]) => void;
}

export function SportInterestsSection({ 
  currentSports, 
  pastSports, 
  sportsCuriosity, 
  onSportsChange 
}: SportInterestsSectionProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'curiosity'>('current');

  const getTabConfig = () => {
    switch (activeTab) {
      case 'current':
        return {
          title: 'Esportes que pratico atualmente',
          description: 'Selecione os esportes que você pratica regularmente',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: Activity,
          maxCount: 8
        };
      case 'past':
        return {
          title: 'Esportes que já pratiquei',
          description: 'Marque os esportes que você praticou no passado',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: Activity,
          maxCount: 10
        };
      case 'curiosity':
        return {
          title: 'Esportes que tenho curiosidade',
          description: 'Escolha esportes que gostaria de experimentar',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: Activity,
          maxCount: 6
        };
    }
  };

  const tabConfig = getTabConfig();

  const getCurrentSportsArray = () => {
    switch (activeTab) {
      case 'current':
        return currentSports;
      case 'past':
        return pastSports;
      case 'curiosity':
        return sportsCuriosity;
    }
  };

  const removeSport = (sportToRemove: string) => {
    const currentList = getCurrentSportsArray();
    const newList = currentList.filter(sport => sport !== sportToRemove);
    
    switch (activeTab) {
      case 'current':
        onSportsChange('currentSports', newList);
        break;
      case 'past':
        onSportsChange('pastSports', newList);
        break;
      case 'curiosity':
        onSportsChange('sportsCuriosity', newList);
        break;
    }
  };

  const addSport = (sportId: string) => {
    const sport = sportsCategories.find(s => s.id === sportId);
    if (!sport) return;

    const currentList = getCurrentSportsArray();
    if (currentList.includes(sport.label) || currentList.length >= tabConfig.maxCount) return;

    const newList = [...currentList, sport.label];
    
    switch (activeTab) {
      case 'current':
        onSportsChange('currentSports', newList);
        break;
      case 'past':
        onSportsChange('pastSports', newList);
        break;
      case 'curiosity':
        onSportsChange('sportsCuriosity', newList);
        break;
    }
  };

  // Get suggested sports (not already selected)
  const getSuggestedSports = () => {
    const currentList = getCurrentSportsArray();
    return sportsCategories.filter(sport => 
      !currentList.includes(sport.label)
    ).slice(0, 8);
  };

  const SportBadge = ({ sport }: { sport: string }) => {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
        <SportIcon 
          sportName={sport}
          size="xs"
          grayscale={true}
          opacity={0.7}
        />
        <span className="text-sm font-medium text-gray-700">{sport}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeSport(sport)}
          className="h-auto p-0 w-4 h-4 text-gray-400 hover:text-red-500"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Meus Esportes de Interesse
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant={activeTab === 'current' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('current')}
            className={activeTab === 'current' ? 'bg-gray-700 hover:bg-gray-800' : ''}
          >
            Pratico Atualmente ({currentSports.length})
          </Button>
          <Button
            variant={activeTab === 'past' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('past')}
            className={activeTab === 'past' ? 'bg-gray-600 hover:bg-gray-700' : ''}
          >
            Já Pratiquei ({pastSports.length})
          </Button>
          <Button
            variant={activeTab === 'curiosity' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('curiosity')}
            className={activeTab === 'curiosity' ? 'bg-gray-500 hover:bg-gray-600' : ''}
          >
            Tenho Curiosidade ({sportsCuriosity.length})
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <tabConfig.icon className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold">{tabConfig.title}</h3>
              <span className="text-sm text-gray-500">
                ({getCurrentSportsArray().length}/{tabConfig.maxCount})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {getCurrentSportsArray().map((sport) => (
              <SportBadge key={sport} sport={sport} />
            ))}
          </div>

          {/* Empty State */}
          {getCurrentSportsArray().length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg mb-6">
              <tabConfig.icon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium">Nenhum esporte adicionado</p>
              <p className="text-xs text-gray-400">{tabConfig.description}</p>
            </div>
          )}

          {getSuggestedSports().length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Esportes sugeridos</p>
              <div className="flex flex-wrap gap-2">
                {getSuggestedSports().map((sport) => (
                  <Button
                    key={sport.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addSport(sport.id)}
                    disabled={getCurrentSportsArray().length >= tabConfig.maxCount}
                    className="text-xs flex items-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <SportIcon 
                      sportName={sport.label}
                      size="xs"
                      grayscale={true}
                      opacity={0.6}
                    />
                    {sport.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}