import { Button } from './ui/button';
import { Code, Layout, Palette, Settings, Dashboard, FileText, Users } from 'lucide-react';

interface DevelopmentButtonsProps {
  onNavigateToHeaderDemo: () => void;
  onNavigateToNavbarDemo: () => void;
  onNavigateToCarouselDemo: () => void;
  onNavigateToProfileShowcase: () => void;
  onNavigateToProfileCoverShowcase: () => void;
  onNavigateToProgramShowcase: () => void;
  onNavigateToTrainerDashboard: () => void;
  onNavigateToDashboardAccessDemo: () => void;
}

export function DevelopmentButtons({
  onNavigateToHeaderDemo,
  onNavigateToNavbarDemo,
  onNavigateToCarouselDemo,
  onNavigateToProfileShowcase,
  onNavigateToProfileCoverShowcase,
  onNavigateToProgramShowcase,
  onNavigateToTrainerDashboard,
  onNavigateToDashboardAccessDemo,
}: DevelopmentButtonsProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {/* Components Showcase Group */}
      <div className="space-y-2">
        <Button 
          onClick={onNavigateToHeaderDemo}
          variant="secondary"
          size="sm"
          className="shadow-lg w-full justify-start"
        >
          <Code className="h-4 w-4 mr-2" />
          Header Demo
        </Button>
        
        <Button 
          onClick={onNavigateToNavbarDemo}
          variant="secondary"
          size="sm"
          className="shadow-lg w-full justify-start"
        >
          <Layout className="h-4 w-4 mr-2" />
          Navbar Demo
        </Button>
        
        <Button 
          onClick={onNavigateToCarouselDemo}
          variant="secondary"
          size="sm"
          className="shadow-lg w-full justify-start"
        >
          <Palette className="h-4 w-4 mr-2" />
          Apple Carousel
        </Button>
      </div>

      {/* Cards Showcase Group */}
      <div className="space-y-2 pt-2 border-t border-border/40">
        <Button 
          onClick={onNavigateToProfileShowcase}
          variant="secondary"
          size="sm"
          className="shadow-lg w-full justify-start"
        >
          <FileText className="h-4 w-4 mr-2" />
          Cards Perfil
        </Button>
        
        <Button 
          onClick={onNavigateToProfileCoverShowcase}
          variant="secondary"
          size="sm"
          className="shadow-lg w-full justify-start"
        >
          <Layout className="h-4 w-4 mr-2" />
          Card Capa
        </Button>
        
        <Button 
          onClick={onNavigateToProgramShowcase}
          variant="secondary"
          size="sm"
          className="shadow-lg w-full justify-start"
        >
          <Settings className="h-4 w-4 mr-2" />
          Cards Programa
        </Button>
      </div>

      {/* Dashboard Access */}
      <div className="pt-2 border-t border-border/40 space-y-2">
        <Button 
          onClick={onNavigateToDashboardAccessDemo}
          size="lg"
          className="bg-[#e0093e] hover:bg-[#c0082e] text-white px-8 shadow-lg w-full justify-start"
        >
          <Users className="h-4 w-4 mr-2" />
          Dashboard Access
        </Button>
        
        <Button 
          onClick={onNavigateToTrainerDashboard}
          variant="secondary"
          size="sm"
          className="shadow-lg w-full justify-start"
        >
          <Dashboard className="h-4 w-4 mr-2" />
          Dashboard Treinador
        </Button>
      </div>
    </div>
  );
}