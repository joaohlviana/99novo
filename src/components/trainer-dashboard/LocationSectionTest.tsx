import React, { useState } from 'react';
import LocationSection from './LocationSection';
import { Button } from '../ui/button';

// Componente de teste para LocationSection
const LocationSectionTest: React.FC = () => {
  const [profileData, setProfileData] = useState({
    id: 'test-id',
    user_id: 'test-user',
    name: 'Teste Trainer',
    email: 'teste@email.com',
    phone: '',
    status: 'draft' as const,
    is_active: true,
    is_verified: false,
    profile_data: {
      bio: '',
      phone: '',
      instagram: '',
      experienceYears: '',
      responseTime: '',
      studentsCount: '',
      credential: '',
      specialties: [],
      modalities: [],
      cities: [],
      address: '',
      cep: '',
      number: '',
      complement: '',
      city: '',
      universities: [],
      courses: [],
      galleryImages: [],
      stories: [],
      profilePhoto: null,
      completionPercentage: 0,
      lastUpdated: new Date().toISOString()
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [loading, setLoading] = useState(false);

  const handleProfileDataChange = (updateFn: (prev: any) => any) => {
    setProfileData(prev => updateFn(prev));
  };

  const handleToggleLoading = () => {
    setLoading(!loading);
  };

  const handleClearData = () => {
    setProfileData(prev => ({
      ...prev,
      profile_data: {
        ...prev.profile_data,
        address: '',
        city: '',
        cep: '',
        number: '',
        complement: '',
        cities: [],
        modalities: []
      }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Teste do LocationSection</h1>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleToggleLoading}
            variant="outline"
          >
            {loading ? 'Parar Loading' : 'Ativar Loading'}
          </Button>
          <Button 
            onClick={handleClearData}
            variant="outline"
          >
            Limpar Dados
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Dados Atuais:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(profileData.profile_data, null, 2)}
          </pre>
        </div>
      </div>

      <LocationSection
        profileData={profileData}
        onProfileDataChange={handleProfileDataChange}
        loading={loading}
      />
    </div>
  );
};

export default LocationSectionTest;