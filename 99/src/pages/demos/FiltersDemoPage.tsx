import { useNavigate } from 'react-router-dom';
import { FiltersDemo } from '../../components/FiltersDemo';

export default function FiltersDemoPage() {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate('/dev/components');
  };

  return <FiltersDemo onNavigateBack={handleNavigateBack} />;
}