/**
 * 🏆 SPORTS SELECTION STEP
 * 
 * Componente para seleção de esportes principal e secundários no programa
 */

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Label } from '../../ui/label';
import { Check, Trophy, Star, Plus, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useSports } from '../../../hooks/useSports';

// ===============================================
// INTERFACES
// ===============================================

interface SportItem {
  id: string;
  name: string;
  slug: string;
  icon_url?: string;
  description?: string;
}

interface SportsData {
  primary: SportItem | null;
  secondary: SportItem[];
}

interface SportsSelectionStepProps {
  data: {
    sports?: SportsData;
    [key: string]: any;
  };
  onUpdate: (data: any) => void;
  loading?: boolean;
}

// ===============================================
// COMPONENTE PRINCIPAL
// ===============================================

export function SportsSelectionStep({ 
  data, 
  onUpdate, 
  loading = false 
}: SportsSelectionStepProps) {
  
  // Estados locais
  const [primarySport, setPrimarySport] = useState<SportItem | null>(data.sports?.primary || null);
  const [secondarySports, setSecondarySports] = useState<SportItem[]>(data.sports?.secondary || []);
  
  // Hook para buscar esportes
  const { 
    sports, 
    loading: sportsLoading, 
    error: sportsError 
  } = useSports();

  // ===============================================
  // EFFECTS
  // ===============================================

  // Atualizar quando os dados externos mudarem
  useEffect(() => {
    if (data.sports) {
      setPrimarySport(data.sports.primary || null);
      setSecondarySports(data.sports.secondary || []);
    }
  }, [data.sports]);

  // Sincronizar mudanças com o parent
  useEffect(() => {
    const sportsData: SportsData = {
      primary: primarySport,
      secondary: secondarySports
    };

    onUpdate({ sports: sportsData });
  }, [primarySport, secondarySports, onUpdate]);

  // ===============================================
  // HANDLERS
  // ===============================================

  const handlePrimarySelect = (sport: SportItem) => {
    if (primarySport?.id === sport.id) {
      // Deselecionar se já está selecionado
      setPrimarySport(null);
      return;
    }

    setPrimarySport(sport);

    // Remover dos secundários se estava lá
    setSecondarySports(prev => prev.filter(s => s.id !== sport.id));

    toast.success(`${sport.name} definido como esporte principal`);
  };

  const handleSecondaryToggle = (sport: SportItem) => {
    // Não permitir adicionar como secundário se já é o principal
    if (primarySport?.id === sport.id) {
      toast.error('Este esporte já é o principal. Escolha outro esporte principal primeiro.');
      return;
    }

    const isSelected = secondarySports.some(s => s.id === sport.id);
    
    if (isSelected) {
      // Remover dos secundários
      setSecondarySports(prev => prev.filter(s => s.id !== sport.id));
      toast.success(`${sport.name} removido dos esportes secundários`);
    } else {
      // Adicionar aos secundários (máximo 3)
      if (secondarySports.length >= 3) {
        toast.error('Máximo de 3 esportes secundários permitidos');
        return;
      }
      
      setSecondarySports(prev => [...prev, sport]);
      toast.success(`${sport.name} adicionado aos esportes secundários`);
    }
  };

  const clearSecondary = (sportId: string) => {
    setSecondarySports(prev => prev.filter(s => s.id !== sportId));
  };

  // ===============================================
  // COMPUTED VALUES
  // ===============================================

  const availableSports = useMemo(() => {
    return sports?.filter(sport => sport.is_active) || [];
  }, [sports]);

  const isSecondarySelected = (sportId: string) => {
    return secondarySports.some(s => s.id === sportId);
  };

  // ===============================================
  // LOADING STATE
  // ===============================================

  if (sportsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando esportes...</p>
        </div>
      </div>
    );
  }

  // ===============================================
  // ERROR STATE
  // ===============================================

  if (sportsError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-red-500">
          <p>Erro ao carregar esportes: {sportsError}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // ===============================================
  // RENDER
  // ===============================================

  return (
    <div className="space-y-6">
      
      {/* Descrição */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Selecione os Esportes do Programa</h3>
        <p className="text-muted-foreground">
          Escolha um esporte principal e até 3 esportes secundários. O programa aparecerá em todos os esportes selecionados.
        </p>
      </div>

      {/* Esporte Principal Selecionado */}
      {primarySport && (
        <Card className="border-brand/20 bg-brand/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
                  {primarySport.icon_url ? (
                    <img 
                      src={primarySport.icon_url} 
                      alt={primarySport.name}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <Trophy className="w-5 h-5 text-brand" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-brand fill-current" />
                    <span className="font-medium text-brand">Esporte Principal</span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{primarySport.name}</h4>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPrimarySport(null)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Esportes Secundários Selecionados */}
      {secondarySports.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Esportes Secundários ({secondarySports.length}/3)
          </Label>
          <div className="flex flex-wrap gap-2">
            {secondarySports.map((sport) => (
              <Badge
                key={sport.id}
                variant="secondary"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                onClick={() => clearSecondary(sport.id)}
              >
                <span className="mr-2">{sport.name}</span>
                <X className="w-3 h-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Seleção de Esporte Principal */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          {primarySport ? 'Alterar Esporte Principal' : 'Escolher Esporte Principal'}
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableSports.map((sport) => {
            const isPrimary = primarySport?.id === sport.id;
            const isSecondary = isSecondarySelected(sport.id);
            
            return (
              <Card
                key={sport.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isPrimary 
                    ? 'border-brand bg-brand/5 shadow-md' 
                    : isSecondary
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 hover:border-brand/50'
                }`}
                onClick={() => handlePrimarySelect(sport)}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                    {sport.icon_url ? (
                      <img 
                        src={sport.icon_url} 
                        alt={sport.name}
                        className="w-6 h-6 object-contain"
                      />
                    ) : (
                      <Trophy className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <h4 className="font-medium text-sm mb-1">{sport.name}</h4>
                  {isPrimary && (
                    <div className="flex items-center justify-center gap-1 text-xs text-brand">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Principal</span>
                    </div>
                  )}
                  {isSecondary && (
                    <div className="text-xs text-gray-500">Secundário</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Seleção de Esportes Secundários */}
      {primarySport && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Esportes Secundários (Opcional - Máximo 3)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableSports
              .filter(sport => sport.id !== primarySport.id)
              .map((sport) => {
                const isSelected = isSecondarySelected(sport.id);
                
                return (
                  <Card
                    key={sport.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? 'border-gray-400 bg-gray-100 shadow-md' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                    onClick={() => handleSecondaryToggle(sport)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-gray-200' : 'bg-gray-100'
                      }`}>
                        {sport.icon_url ? (
                          <img 
                            src={sport.icon_url} 
                            alt={sport.name}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <Trophy className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <h4 className="font-medium text-sm mb-1">{sport.name}</h4>
                      <div className="flex items-center justify-center">
                        {isSelected ? (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Check className="w-3 h-3" />
                            <span>Selecionado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Plus className="w-3 h-3" />
                            <span>Adicionar</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Resumo */}
      {(primarySport || secondarySports.length > 0) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">Resumo da Seleção</h4>
            <div className="text-sm text-blue-800">
              {primarySport && (
                <p className="mb-1">
                  <strong>Esporte Principal:</strong> {primarySport.name}
                </p>
              )}
              {secondarySports.length > 0 && (
                <p>
                  <strong>Esportes Secundários:</strong> {secondarySports.map(s => s.name).join(', ')}
                </p>
              )}
              <p className="mt-2 text-xs">
                O programa aparecerá em {(primarySport ? 1 : 0) + secondarySports.length} categoria{(primarySport ? 1 : 0) + secondarySports.length > 1 ? 's' : ''} de esporte.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

export default SportsSelectionStep;