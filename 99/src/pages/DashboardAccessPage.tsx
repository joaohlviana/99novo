import DashboardAccessDemo from '../components/DashboardAccessDemo';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageShell } from '../components/layout/PageShell';

function DashboardAccessPage() {
  return (
    <PageShell>
      <Header />
      <div className="pt-16">
        <DashboardAccessDemo />
      </div>
      <Footer />
    </PageShell>
  );
}

export default DashboardAccessPage;