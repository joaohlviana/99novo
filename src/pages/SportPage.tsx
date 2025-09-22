import { useParams } from 'react-router-dom';
import { SportPage as SportPageComponent } from '../components/SportPage';

function SportPage() {
  const { sportId } = useParams<{ sportId: string }>();

  return (
    <SportPageComponent 
      sportId={sportId || 'futebol'}
    />
  );
}

export default SportPage;