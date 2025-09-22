import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import AppleCardsCarouselDemo from '../../components/apple-cards-carousel-demo';

export default function AppleCardsCarouselDemoPage() {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate('/dev/components');
  };

  return <AppleCardsCarouselDemo />;
}