import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { HomePage as HomePageComponent } from '../components/HomePage';
import { PageShell } from '../components/layout/PageShell';

function HomePage() {
  console.log('🏠 HomePage sendo renderizada');
  console.log('📍 Current location:', window.location.href);
  console.log('🔑 Auth state no localStorage:', localStorage.getItem('supabase.auth.token'));
  
  return (
    <PageShell>
      <Header />
      <div className="pt-16">
        <HomePageComponent />
      </div>
      <Footer />
    </PageShell>
  );
}

export default HomePage;