import { useNavigate } from 'react-router-dom';
import { SkeletonDemo } from '../../components/SkeletonDemo';

export default function SkeletonDemoPage() {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate('/dev/components');
  };

  return <SkeletonDemo onNavigateBack={handleNavigateBack} />;
}