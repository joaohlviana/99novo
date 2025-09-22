/**
 * 🧪 PÁGINA DE TESTE PARA FILTROS JSONB
 * ====================================
 * Página dedicada para testar a correção do erro "invalid input syntax for type json"
 */

import React from 'react';
import { JsonbFiltersTest } from '../components/debug/JsonbFiltersTest';
import { PageShell } from '../components/layout/PageShell';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function JsonbFiltersTestPage() {
  return (
    <PageShell>
      <Header />
      <div className="pt-16">
        <JsonbFiltersTest />
      </div>
      <Footer />
    </PageShell>
  );
}