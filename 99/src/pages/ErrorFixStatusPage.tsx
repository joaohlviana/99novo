/**
 * 🔧 ERROR FIX STATUS PAGE
 * 
 * Página para visualizar o status das correções de erro implementadas
 */

import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ErrorFixStatus } from '../components/ErrorFixStatus';

function ErrorFixStatusPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        <div className="container py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Status das Correções de Erro
              </h1>
              <p className="text-gray-600">
                Visualize o status das correções implementadas para resolver os erros de "Trainer profile não encontrado".
              </p>
            </div>
            
            <ErrorFixStatus />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default ErrorFixStatusPage;