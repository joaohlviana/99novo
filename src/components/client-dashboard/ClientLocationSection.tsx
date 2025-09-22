import React, { useState, useMemo, useCallback } from 'react';
import { Loader2, MapPin, Edit, X, AlertCircle } from 'lucide-react';
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

interface ClientLocationSectionProps {
  profileData: {
    city?: string;
    state?: string;
    address?: string;
    cep?: string;
    number?: string;
    complement?: string;
  };
  onProfileDataChange: (data: any) => void;
  loading?: boolean;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ClientLocationSection: React.FC<ClientLocationSectionProps> = ({ 
  profileData, 
  onProfileDataChange, 
  loading = false 
}) => {
  const [editingMode, setEditingMode] = useState(false);
  const [previousAddress, setPreviousAddress] = useState<string>('');

  // ============================================
  // FUNÇÕES AUXILIARES
  // ============================================

  const handleAddressChange = useCallback((data: any) => {
    if (data) {
      onProfileDataChange({
        address: data.logradouro,
        city: data.localidade,
        state: data.uf,
        cep: data.cep,
      });
    } else {
      // Limpar campos quando há erro no CEP
      onProfileDataChange({
        address: '',
        city: '',
        state: '',
        cep: '',
      });
    }
  }, [onProfileDataChange]);

  // Construir endereço completo atual - memoizado para evitar recálculos
  const fullCurrentAddress = useMemo(() => {
    if (!profileData.address || !profileData.city) return '';
    
    return `${profileData.address}${profileData.number ? ', ' + profileData.number : ''}${profileData.complement ? ', ' + profileData.complement : ''} - ${profileData.city}${profileData.state ? ', ' + profileData.state : ''}`;
  }, [profileData.address, profileData.city, profileData.number, profileData.complement, profileData.state]);

  // ============================================
  // RENDER LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="space-y-4">
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
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <div className="space-y-6">
      {/* Informação sobre cadastro de endereço */}
      {!fullCurrentAddress && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 mb-1">
                Cadastro de Endereço
              </p>
              <p className="text-sm text-amber-700">
                Informe seu endereço completo para ser encontrado por treinadores da sua região
              </p>
            </div>
          </div>
        </div>
      )}

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
      
      {/* Campos de endereço */}
      {(!fullCurrentAddress || editingMode) ? (
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
          {profileData.address && profileData.city && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-800">Endereço encontrado:</p>
                  <p className="text-xs text-green-700 mt-1">
                    {profileData.address}
                    {profileData.number ? `, ${profileData.number}` : ''}
                    {profileData.complement ? `, ${profileData.complement}` : ''} 
                    - {profileData.city}{profileData.state ? `, ${profileData.state}` : ''}
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
                value={profileData.number || ''}
                onChange={(e) => onProfileDataChange({ number: e.target.value })}
                placeholder="123"
                disabled={loading || !profileData.address}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input 
                id="complement"
                value={profileData.complement || ''}
                onChange={(e) => onProfileDataChange({ complement: e.target.value })}
                placeholder="Apto 45, Bloco B"
                disabled={loading || !profileData.address}
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
                  // Resetar para o endereço anterior se possível
                  if (previousAddress) {
                    const addressParts = previousAddress.split(' - ');
                    const cityStatePart = addressParts[addressParts.length - 1];
                    const addressPart = addressParts.slice(0, -1).join(' - ');
                    
                    // Extrair cidade e estado
                    const cityStateParts = cityStatePart.split(', ');
                    const city = cityStateParts[0];
                    const state = cityStateParts[1] || '';
                    
                    // Tentar extrair número e complemento do endereço anterior
                    const addressMatch = addressPart.match(/^(.+?)(?:, (\d+))?(?:, (.+))?$/);
                    const street = addressMatch?.[1] || addressPart;
                    const number = addressMatch?.[2] || '';
                    const complement = addressMatch?.[3] || '';

                    onProfileDataChange({
                      address: street,
                      city: city,
                      state: state,
                      number: number,
                      complement: complement
                    });
                  }
                  
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
                disabled={loading || !profileData.address}
                className="flex-1"
              >
                Salvar Novo Endereço
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Mostrar endereço completo quando já existe */
        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-brand mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Endereço completo:</p>
                <p className="text-sm text-muted-foreground mt-1">{fullCurrentAddress}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreviousAddress(fullCurrentAddress);
                  setEditingMode(true);
                }}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State quando não há endereço */}
      {!fullCurrentAddress && !loading && (
        <div className="border-dashed border-2 border-gray-200 rounded-lg p-6">
          <div className="text-center py-6 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h4 className="text-base font-medium text-foreground mb-2">
              Nenhum endereço cadastrado
            </h4>
            <p className="text-sm text-muted-foreground">
              Digite seu CEP acima para preencher automaticamente seu endereço
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientLocationSection;