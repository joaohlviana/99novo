import { useNavigate } from 'react-router-dom';
import { ContentSwitcherDemo } from '../../components/ContentSwitcherDemo';

export default function ContentSwitcherDemoPage() {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate('/dev/components');
  };

  return <ContentSwitcherDemo onNavigateBack={handleNavigateBack} />;
}