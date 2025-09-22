import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './auth/LoginModal';
import { 
  User, 
  Dumbbell, 
  Shield,
  ArrowRight 
} from 'lucide-react';

interface DashboardAccessButtonsProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function DashboardAccessButtons({ 
  className = '', 
  variant = 'default' 
}: DashboardAccessButtonsProps) {
  const { 
    navigateToClientDashboard, 
    navigateToTrainerDashboard, 
    navigateToAdminDashboard 
  } = useNavigation();
  
  const { isAuthenticated } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string>('');

  const handleDashboardAccess = (dashboardPath: string, navigationFn: () => void) => {
    if (isAuthenticated) {
      navigationFn();
    } else {
      setRedirectTo(dashboardPath);
      setLoginModalOpen(true);
    }
  };

  const dashboards = [
    {
      id: 'client',
      title: 'Dashboard Cliente',
      description: 'Gerencie seus programas, treinos e evolução',
      icon: User,
      onClick: () => handleDashboardAccess('/dashboard/client', navigateToClientDashboard),
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    {
      id: 'trainer',
      title: 'Dashboard Treinador',
      description: 'Gerencie clientes, programas e financeiro',
      icon: Dumbbell,
      onClick: () => handleDashboardAccess('/dashboard/trainer', navigateToTrainerDashboard),
      color: 'bg-brand/5 hover:bg-brand/10 border-brand/20',
      iconColor: 'text-brand',
      textColor: 'text-brand'
    },
    {
      id: 'admin',
      title: 'Dashboard Admin',
      description: 'Administre a plataforma e usuários',
      icon: Shield,
      onClick: () => handleDashboardAccess('/dashboard/admin', navigateToAdminDashboard),
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-900'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        {dashboards.map((dashboard) => (
          <Button
            key={dashboard.id}
            onClick={dashboard.onClick}
            variant="outline"
            className={`
              flex-1 h-auto p-4 justify-start gap-3 transition-all duration-200
              ${dashboard.color} ${dashboard.textColor}
              hover:scale-[1.02] hover:shadow-md
            `}
          >
            <dashboard.icon className={`h-5 w-5 ${dashboard.iconColor}`} />
            <div className="text-left">
              <div className="font-medium">{dashboard.title}</div>
            </div>
            <ArrowRight className={`h-4 w-4 ${dashboard.iconColor} ml-auto`} />
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 ${className}`}>
      {dashboards.map((dashboard) => (
        <Card 
          key={dashboard.id}
          className={`
            transition-all duration-200 cursor-pointer group
            hover:scale-[1.02] hover:shadow-lg
            ${dashboard.color}
          `}
          onClick={dashboard.onClick}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`
                p-3 rounded-xl ${dashboard.color.split(' ')[0].replace('bg-', 'bg-')}
                group-hover:scale-110 transition-transform duration-200
              `}>
                <dashboard.icon className={`h-6 w-6 ${dashboard.iconColor}`} />
              </div>
              <ArrowRight className={`
                h-5 w-5 ${dashboard.iconColor} opacity-0 group-hover:opacity-100 
                transform translate-x-1 group-hover:translate-x-0 
                transition-all duration-200
              `} />
            </div>
            
            <h3 className={`mb-2 ${dashboard.textColor}`}>
              {dashboard.title}
            </h3>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              {dashboard.description}
            </p>
          </CardContent>
        </Card>
      ))}
      
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        redirectTo={redirectTo}
      />
    </div>
  );
}

// Hook personalizado para verificar permissões (opcional)
export function useDashboardAccess() {
  // Aqui você pode implementar lógica de permissões
  // Por exemplo, verificar se o usuário tem acesso a cada dashboard
  
  return {
    canAccessClient: true, // Implementar lógica real
    canAccessTrainer: true, // Implementar lógica real
    canAccessAdmin: true, // Implementar lógica real
  };
}