import { useNavigate } from 'react-router-dom';
import { GlassEffectsDemo } from '../../components/GlassEffectsDemo';

export default function GlassEffectsDemoPage() {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate('/dev/components');
  };

  return <GlassEffectsDemo onNavigateBack={handleNavigateBack} />;
}