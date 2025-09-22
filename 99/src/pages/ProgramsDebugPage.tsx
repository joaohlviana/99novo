/**
 * PÁGINA DE DEBUG DOS PROGRAMAS
 * ============================
 * Página dedicada ao diagnóstico de problemas com programas
 */

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PageShell } from '../components/layout/PageShell';
import ProgramsDebugger from '../components/debug/ProgramsDebugger';

function ProgramsDebugPage() {
  return (
    <PageShell>
      <Header />
      <div className="pt-16 min-h-screen bg-gray-50">
        <ProgramsDebugger />
      </div>
      <Footer />
    </PageShell>
  );
}

export default ProgramsDebugPage;