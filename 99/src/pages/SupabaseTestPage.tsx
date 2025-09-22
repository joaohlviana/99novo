/**
 * 🧪 SUPABASE TEST PAGE
 * 
 * Página dedicada para testar e validar a integração com Supabase
 */

import React from 'react';
import { SupabaseConnectionTest } from '../components/dev-tools/SupabaseConnectionTest';

export default function SupabaseTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Supabase Integration Test</h1>
          <p className="text-muted-foreground mt-2">
            Test and validate the connection to Supabase backend
          </p>
        </div>

        <SupabaseConnectionTest />
      </div>
    </div>
  );
}