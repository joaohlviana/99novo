/**
 * 🎯 TRAINER PROFILE RESOLVE PAGE
 * 
 * Página dinâmica que recebe :identifier e resolve se é UUID ou slug
 * - Se for UUID e existir slug correspondente, redireciona
 * - Se for slug e existir, carrega normalmente
 * - Se não existir, mostra 404 limpo
 * - Implementa telemetria completa
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { identifierResolverService, type ResolverResult } from '../services/identifier-resolver.service';
import TrainerProfilePage from '../pages/TrainerProfilePage';
import { LoadingSpinner } from '../components/ui/loading-spinner';
import { Button } from '../components/ui/button';
import { AlertCircle, ArrowLeft, Home, Search } from 'lucide-react';

// ============================================
// COMPONENTES DE ESTADO
// ============================================

const LoadingState: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner className="w-8 h-8 mx-auto mb-4" />
      <h2 className="text-lg font-medium text-gray-900 mb-2">
        Carregando perfil...
      </h2>
      <p className="text-gray-600">
        Resolvendo identificador e validando dados
      </p>
    </div>
  </div>
);

const NotFoundState: React.FC<{ identifier: string; onRetry: () => void }> = ({ 
  identifier, 
  onRetry 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Treinador não encontrado
        </h1>
        
        <p className="text-gray-600 mb-2">
          Não conseguimos encontrar um treinador com o identificador:
        </p>
        
        <code className="inline-block px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-800 mb-6">
          {identifier}
        </code>
        
        <div className="space-y-3">
          <Button 
            onClick={onRetry}
            variant="outline"
            className="w-full"
          >
            Tentar novamente
          </Button>
          
          <Button 
            onClick={() => navigate('/catalog')}
            className="w-full bg-[#e0093e] text-white hover:bg-[#c40835]"
          >
            <Search className="w-4 h-4 mr-2" />
            Ver todos os treinadores
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            variant="ghost"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
};

const ErrorState: React.FC<{ 
  error: string; 
  identifier: string; 
  onRetry: () => void 
}> = ({ error, identifier, onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-yellow-500" />
        </div>
        
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Erro ao carregar perfil
        </h1>
        
        <p className="text-gray-600 mb-2">
          Ocorreu um erro ao tentar carregar o perfil do treinador:
        </p>
        
        <div className="bg-gray-100 rounded-md p-3 mb-6 text-left">
          <p className="text-sm text-gray-600 mb-1">
            <strong>Identificador:</strong> {identifier}
          </p>
          <p className="text-sm text-red-600">
            <strong>Erro:</strong> {error}
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={onRetry}
            className="w-full bg-[#e0093e] text-white hover:bg-[#c40835]"
          >
            Tentar novamente
          </Button>
          
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function TrainerProfileResolvePage() {
  const { identifier } = useParams<{ identifier: string }>();
  const navigate = useNavigate();
  
  const [resolveResult, setResolveResult] = useState<ResolverResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para resolver identificador
  const resolveIdentifier = async (id: string) => {
    try {
      console.log('🔍 TrainerProfileResolvePage: Resolvendo identificador:', id);
      
      setIsLoading(true);
      setError(null);
      
      const result = await identifierResolverService.resolveTrainer(id);
      
      console.log('📊 Resultado da resolução:', result);
      
      setResolveResult(result);
      
      // Se precisa redirecionar (UUID → slug)
      if (result.success && result.needsRedirect && result.redirectSlug) {
        console.log('🔄 Redirecionando para slug:', result.redirectSlug);
        navigate(`/trainer/${result.redirectSlug}`, { replace: true });
        return;
      }
      
      // Se não foi sucesso, definir erro
      if (!result.success) {
        setError(result.error || 'Erro desconhecido');
      }
      
    } catch (err: any) {
      console.error('❌ Erro na resolução:', err);
      setError(`Erro interno: ${err.message}`);
      setResolveResult({
        success: false,
        error: `Erro interno: ${err.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Effect principal
  useEffect(() => {
    if (!identifier) {
      console.error('❌ Nenhum identificador fornecido na rota');
      setError('Identificador não fornecido');
      setIsLoading(false);
      return;
    }

    // Validação inicial
    if (identifier.includes('undefined')) {
      console.error('❌ Identificador contém "undefined":', identifier);
      setError('Identificador inválido: contém "undefined"');
      setIsLoading(false);
      return;
    }

    if (identifier.trim() === '') {
      console.error('❌ Identificador vazio');
      setError('Identificador vazio');
      setIsLoading(false);
      return;
    }

    resolveIdentifier(identifier);
  }, [identifier, navigate]);

  // Função de retry
  const handleRetry = () => {
    if (identifier) {
      resolveIdentifier(identifier);
    }
  };

  // Renderização condicional
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        identifier={identifier || 'não informado'} 
        onRetry={handleRetry}
      />
    );
  }

  if (!resolveResult || !resolveResult.success || !resolveResult.trainer) {
    return (
      <NotFoundState 
        identifier={identifier || 'não informado'} 
        onRetry={handleRetry}
      />
    );
  }

  // Se chegou até aqui, carregar o perfil normalmente
  return (
    <TrainerProfilePage 
      initialTrainerData={resolveResult.trainer}
      resolveMethod={resolveResult.resolveMethod}
    />
  );
}

// ============================================
// EXPORTAÇÃO DEFAULT E NOMEADA
// ============================================

export default TrainerProfileResolvePage;
export { TrainerProfileResolvePage };