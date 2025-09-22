import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AlertCircle, CheckCircle, Loader2, MapPin, User } from 'lucide-react';

const CityAdditionTestSimple = () => {
  const [trainerId, setTrainerId] = useState('test-trainer-city-001');
  const [cityName, setCityName] = useState('São Paulo - SP');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testCityAddition = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🔄 Testando adição de cidade:', { trainerId, cityName });
      
      // Importar as informações do Supabase
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const requestBody = {
        trainer_id: trainerId,
        updates: {
          profile_data: {
            cities: [cityName, 'Rio de Janeiro - RJ', 'Belo Horizonte - MG']
          }
        }
      };

      console.log('📡 Fazendo requisição:', {
        url: `https://${projectId}.supabase.co/functions/v1/make-server-e547215c/trainer-profile`,
        method: 'PUT',
        body: requestBody
      });

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e547215c/trainer-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Resposta:', response.status, response.statusText);

      const responseText = await response.text();
      
      if (response.ok) {
        const responseData = JSON.parse(responseText);
        setResult({
          success: true,
          status: response.status,
          data: responseData
        });
      } else {
        setResult({
          success: false,
          status: response.status,
          statusText: response.statusText,
          error: responseText
        });
      }
    } catch (error: any) {
      console.error('❌ Erro:', error);
      setResult({
        success: false,
        error: error.message,
        type: error.constructor.name
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Teste Simples - Adição de Cidade
        </h2>
        <p className="text-gray-600">
          Teste direto da função de adicionar cidade sem a interface complexa
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Trainer ID
          </label>
          <Input
            value={trainerId}
            onChange={(e) => setTrainerId(e.target.value)}
            placeholder="ID do treinador"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Nome da Cidade
          </label>
          <Input
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            placeholder="Nome da cidade"
          />
        </div>

        <Button 
          onClick={testCityAddition} 
          disabled={isLoading || !trainerId.trim() || !cityName.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Testar Adição de Cidade
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <h3 className="font-semibold">
              {result.success ? 'Sucesso!' : 'Erro!'}
            </h3>
          </div>
          
          <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>

          {!result.success && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Possíveis Soluções:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Verifique se o servidor está rodando</li>
                <li>• Teste a conectividade na página Server Diagnostic</li>
                <li>• Verifique se a tabela 99_trainer_profile existe</li>
                <li>• Verifique as credenciais do Supabase</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CityAdditionTestSimple;