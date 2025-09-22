import { useNavigate } from 'react-router-dom';
import { StarRatingDemo } from '../../components/StarRatingDemo';

export default function StarRatingDemoPage() {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate('/dev/components');
  };

  return <StarRatingDemo onNavigateBack={handleNavigateBack} />;
}