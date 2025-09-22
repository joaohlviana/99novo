import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import NavbarDemo from '../../components/resizable-navbar-demo';

export default function ResizableNavbarDemoPage() {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate('/dev/components');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Resizable Navbar Demo</h1>
            <p className="text-muted-foreground">
              Navbar redimensionável com drag and drop functionality
            </p>
          </div>
          <Button variant="outline" onClick={handleNavigateBack}>
            ← Voltar
          </Button>
        </div>
        
        <NavbarDemo />
      </div>
    </div>
  );
}