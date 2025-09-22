import { useNavigate } from 'react-router-dom';
import ModernProgramCarouselDemo from '../../components/ModernProgramCarouselDemo';

export default function ProgramCarouselDemoPage() {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate('/dev/components');
  };

  return <ModernProgramCarouselDemo onNavigateBack={handleNavigateBack} />;
}