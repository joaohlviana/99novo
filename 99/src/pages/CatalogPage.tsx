import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SportsMenu } from '../components/SportsMenu';
import { TrainersCatalog } from '../components/TrainersCatalog';
import { PageShell } from '../components/layout/PageShell';

function CatalogPage() {
  const [selectedSport, setSelectedSport] = useState<string>('futebol');

  return (
    <PageShell>
      <Header />
      <div className="pt-16">
        <SportsMenu 
          selectedSport={selectedSport}
        />
        <TrainersCatalog />
      </div>
      <Footer />
    </PageShell>
  );
}

export default CatalogPage;