import React, { useState, useMemo, useCallback } from 'react';
import { Loader2, MapPin, Edit, X } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';

// ============================================
// COMPONENTE CEP INPUT COM VALIDAÇÃO
// ============================================

interface CepInputProps {
  onAddressChange: (data: any) => void;
  className?: string;
  disabled?: boolean;
}

const CepInput: React.FC<CepInputProps> = ({ onAddressChange, className = "", disabled = false }) => {
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAddress = async (cepValue: string) => {
    if (cepValue.length !== 8) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setError('CEP não encontrado. Verifique o número digitado.');
        onAddressChange(null);
        return;
      }
      
      const addressData = {
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf
      };
      
      onAddressChange(addressData);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setError('Erro ao buscar CEP. Tente novamente.');
      onAddressChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setError('');
    
    if (value.length <= 8) {
      setCep(value);
    }
    
    if (value.length === 8) {
      fetchAddress(value);
    }
  };

  const formatCepDisplay = (value: string): string => {
    if (value.length <= 5) return value;
    return value.replace(/(\d{5})(\d{0,3})/, '$1-$2');
  };

  return (
    <div className="relative space-y-1">
      <Input
        value={formatCepDisplay(cep)}
        onChange={handleCepChange}
        placeholder="Digite o CEP"
        maxLength={9}
        disabled={disabled || isLoading}
        className={`${className} ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

// ============================================
// TIPOS E INTERFACES
// ============================================

interface LocationSectionProps {
  profileData: {
    profile_data?: {
      address?: string;
      city?: string;
      cep?: string;
      number?: string;
      complement?: string;
      cities?: string[];
      modalities?: string[];
    };
  };
  onProfileDataChange: (updateFn: (prev: any) => any) => void;
  loading?: boolean;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const LocationSection: React.FC<LocationSectionProps> = ({ 
  profileData, 
  onProfileDataChange, 
  loading = false 
}) => {
  const [editingMode, setEditingMode] = useState(false);
  const [previousAddress, setPreviousAddress] = useState<string>('');
  
  // Acessar dados da estrutura híbrida - memoizado para evitar re-renders
  const currentProfileData = useMemo(() => profileData?.profile_data || {}, [profileData?.profile_data]);
  
  const addResidenceCityAndSuggestNearby = useCallback((cityName: string, uf: string) => {
    onProfileDataChange(prev => {
      const profileData = prev.profile_data || {};
      const currentCities = profileData.cities || [];
      const formattedCityName = `${cityName} - ${uf}`;
      
      // Adicionar cidade de residência se não existir
      const citiesWithResidence = currentCities.some((city: string) => 
        city.startsWith(cityName)
      ) ? currentCities : [formattedCityName, ...currentCities];
      
      // Garantir que presencial esteja selecionado
      const currentModalities = profileData.modalities || [];
      const modalitiesWithPresencial = currentModalities.includes('presencial') 
        ? currentModalities
        : [...currentModalities, 'presencial'];
      
      return {
        ...prev,
        profile_data: {
          ...profileData,
          cities: citiesWithResidence,
          modalities: modalitiesWithPresencial
        }
      };
    });
  }, [onProfileDataChange]);

  const handleAddressChange = useCallback((data: any) => {
    if (data) {
      // Fazer uma única atualização consolidada
      onProfileDataChange(prev => {
        const profileData = prev.profile_data || {};
        const currentCities = profileData.cities || [];
        const formattedCityName = `${data.localidade} - ${data.uf}`;
        
        // Adicionar cidade de residência se não existir
        const citiesWithResidence = currentCities.some((city: string) => 
          city.startsWith(data.localidade)
        ) ? currentCities : [formattedCityName, ...currentCities];
        
        // Garantir que presencial esteja selecionado
        const currentModalities = profileData.modalities || [];
        const modalitiesWithPresencial = currentModalities.includes('presencial') 
          ? currentModalities
          : [...currentModalities, 'presencial'];
        
        return {
          ...prev,
          profile_data: {
            ...profileData,
            address: data.logradouro,
            city: `${data.localidade}, ${data.uf}`,
            cep: data.cep,
            cities: citiesWithResidence,
            modalities: modalitiesWithPresencial
          }
        };
      });
    } else {
      // Limpar campos quando há erro no CEP
      onProfileDataChange(prev => ({
        ...prev,
        profile_data: {
          ...prev.profile_data,
          address: '',
          city: '',
          cep: '',
        }
      }));
    }
  }, [onProfileDataChange]);

  // Construir endereço completo - memoizado para evitar recálculos
  const fullAddress = useMemo(() => {
    if (!currentProfileData.address || !currentProfileData.city) return '';
    
    return `${currentProfileData.address}${currentProfileData.number ? ', ' + currentProfileData.number : ''}${currentProfileData.complement ? ', ' + currentProfileData.complement : ''} - ${currentProfileData.city}`;
  }, [currentProfileData.address, currentProfileData.city, currentProfileData.number, currentProfileData.complement]);

  // Render loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            
            {fullAddress && !editingMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreviousAddress(fullAddress);
                  setEditingMode(true);
                }}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
          
          {/* Mostrar endereço anterior se estiver editando */}
          {editingMode && previousAddress && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-800">Último endereço salvo:</p>
                  <p className="text-xs text-amber-700 mt-1">{previousAddress}</p>
                </div>
              </div>
            </div>
          )}
          
          {(!fullAddress || editingMode) ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <CepInput 
                  onAddressChange={handleAddressChange}
                  className="w-full"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  Digite seu CEP para preenchimento automático do endereço
                </p>
              </div>

              {/* Mostrar endereço intermediário quando CEP é validado */}
              {currentProfileData.address && currentProfileData.city && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-800">Endereço encontrado:</p>
                      <p className="text-xs text-green-700 mt-1">
                        {currentProfileData.address}
                        {currentProfileData.number ? `, ${currentProfileData.number}` : ''}
                        {currentProfileData.complement ? `, ${currentProfileData.complement}` : ''} 
                        - {currentProfileData.city}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input 
                    id="number"
                    value={currentProfileData.number || ''}
                    onChange={(e) => onProfileDataChange(prev => ({
                      ...prev,
                      profile_data: {
                        ...prev.profile_data,
                        number: e.target.value
                      }
                    }))}
                    placeholder="123"
                    disabled={loading || !currentProfileData.address}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input 
                    id="complement"
                    value={currentProfileData.complement || ''}
                    onChange={(e) => onProfileDataChange(prev => ({
                      ...prev,
                      profile_data: {
                        ...prev.profile_data,
                        complement: e.target.value
                      }
                    }))}
                    placeholder="Apto 45, Bloco B"
                    disabled={loading || !currentProfileData.address}
                  />
                </div>
              </div>

              {/* Botões de ação quando editando */}
              {editingMode && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Resetar para o endereço anterior
                      const addressParts = previousAddress.split(' - ');
                      const cityPart = addressParts[addressParts.length - 1];
                      const addressPart = addressParts.slice(0, -1).join(' - ');
                      
                      // Tentar extrair número e complemento do endereço anterior
                      const addressMatch = addressPart.match(/^(.+?)(?:, (\d+))?(?:, (.+))?$/);
                      const street = addressMatch?.[1] || addressPart;
                      const number = addressMatch?.[2] || '';
                      const complement = addressMatch?.[3] || '';

                      onProfileDataChange(prev => ({
                        ...prev,
                        profile_data: {
                          ...prev.profile_data,
                          address: street,
                          city: cityPart,
                          number: number,
                          complement: complement
                        }
                      }));
                      
                      setEditingMode(false);
                      setPreviousAddress('');
                    }}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingMode(false);
                      setPreviousAddress('');
                    }}
                    disabled={loading || !currentProfileData.address}
                    className="flex-1"
                  >
                    Salvar Novo Endereço
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Endereço completo:</p>
                  <p className="text-sm text-muted-foreground mt-1">{fullAddress}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State quando não há endereço */}
      {!fullAddress && !loading && (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <div className="text-center py-6 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h4 className="text-base font-medium text-foreground mb-2">
                Nenhum endereço cadastrado
              </h4>
              <p className="text-sm text-muted-foreground">
                Digite seu CEP acima para preencher automaticamente seu endereço
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationSection;