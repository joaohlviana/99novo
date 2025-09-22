/**
 * SELETOR DE ESPORTES PARA CLIENTES
 * ==================================
 * Componente para selecionar esportes de interesse, praticados e curiosidade
 * Integrado com a tabela sports do banco de dados
 */

import { useState, useMemo, useCallback } from 'react';
import { Search, Dumbbell, X, Plus, Heart, Trophy, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAllSports } from '../../hooks/useSports';

interface ClientSportsSelectorProps {
  selectedSports: string[];
  onSportsChange: (sports: string[]) => void;
  type: 'interest' | 'trained' | 'curious';
  maxSelection: number;
}

// Ícones e cores por tipo
const getTypeConfig = (type: 'interest' | 'trained' | 'curious') => {
  switch (type) {
    case 'interest':
      return {
        icon: Heart,
        color: 'text-red-500',
        bgColor: 'bg-red-50 border-red-200',
        label: 'Interesse',
        emptyMessage: 'Selecione esportes que você gostaria de praticar'
      };
    case 'trained':
      return {
        icon: Trophy,
        color: 'text-green-500',
        bgColor: 'bg-green-50 border-green-200',
        label: 'Já pratiquei',
        emptyMessage: 'Selecione esportes que você já praticou'
      };
    case 'curious':
      return {
        icon: Eye,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50 border-blue-200',
        label: 'Curiosidade',
        emptyMessage: 'Selecione esportes que despertam sua curiosidade'
      };
  }
};

export function ClientSportsSelector({
  selectedSports = [],
  onSportsChange,
  type,
  maxSelection
}: ClientSportsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  
  // Hook para buscar esportes do banco
  const { sports: allSports, loading, error } = useAllSports();
  
  const typeConfig = getTypeConfig(type);
  const TypeIcon = typeConfig.icon;

  // Filtrar esportes disponíveis
  const availableSports = useMemo(() => {
    if (loading || error) return [];
    
    return allSports.filter(sport =>
      sport.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSports, searchTerm, loading, error]);

  // Separar esportes selecionados dos disponíveis
  const { selectedSportsList, unselectedSports } = useMemo(() => {
    const selected = availableSports.filter(sport =>
      selectedSports.includes(sport.name)
    );
    const unselected = availableSports.filter(sport =>
      !selectedSports.includes(sport.name)
    );
    
    return {
      selectedSportsList: selected,
      unselectedSports: showAll ? unselected : unselected.slice(0, 12)
    };
  }, [availableSports, selectedSports, showAll]);

  // Adicionar esporte
  const handleAddSport = useCallback((sportName: string) => {
    if (selectedSports.length >= maxSelection) return;
    
    const newSelection = [...selectedSports, sportName];
    onSportsChange(newSelection);
  }, [selectedSports, maxSelection, onSportsChange]);

  // Remover esporte
  const handleRemoveSport = useCallback((sportName: string) => {
    const newSelection = selectedSports.filter(s => s !== sportName);
    onSportsChange(newSelection);
  }, [selectedSports, onSportsChange]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-brand border-t-transparent rounded-full mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Carregando esportes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p className="text-sm">Erro ao carregar esportes</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
          <span className="text-sm font-medium text-gray-700">{typeConfig.label}</span>
        </div>
        <div className="text-xs text-gray-500">
          {selectedSports.length}/{maxSelection}
        </div>
      </div>

      {/* Esportes selecionados */}
      {selectedSports.length > 0 && (
        <div className={`p-3 rounded-lg border ${typeConfig.bgColor}`}>
          <div className="flex flex-wrap gap-2">
            {selectedSportsList.map((sport) => (
              <Badge 
                key={`selected-${sport.id}`}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {sport.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleRemoveSport(sport.name)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar esportes..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid de esportes disponíveis */}
      {unselectedSports.length > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {unselectedSports.map((sport) => (
              <Button
                key={`available-${sport.id}`}
                variant="outline"
                size="sm"
                className="h-auto p-2 flex items-center gap-2 text-left justify-start"
                disabled={selectedSports.length >= maxSelection}
                onClick={() => handleAddSport(sport.name)}
              >
                <Plus className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs truncate">{sport.name}</span>
              </Button>
            ))}
          </div>

          {/* Botão para mostrar mais */}
          {!showAll && availableSports.length > 12 && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(true)}
                className="text-brand hover:text-brand-hover"
              >
                Ver mais esportes ({availableSports.length - 12})
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          {searchTerm ? (
            <>
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhum esporte encontrado para "{searchTerm}"</p>
            </>
          ) : selectedSports.length >= maxSelection ? (
            <>
              <TypeIcon className={`w-8 h-8 mx-auto mb-2 ${typeConfig.color}`} />
              <p className="text-sm">Limite máximo atingido ({maxSelection} esportes)</p>
            </>
          ) : (
            <>
              <Dumbbell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">{typeConfig.emptyMessage}</p>
            </>
          )}
        </div>
      )}

      {/* Aviso de limite */}
      {selectedSports.length >= maxSelection && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">
            <strong>Limite atingido:</strong> Você selecionou o máximo de {maxSelection} esportes.
          </p>
        </div>
      )}
    </div>
  );
}