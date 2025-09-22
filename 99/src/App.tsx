// Importar polyfill de ambiente ANTES de qualquer outra coisa
import './lib/env';

import React from 'react';
import AppRouter from './routes/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
    </ErrorBoundary>
  );
}