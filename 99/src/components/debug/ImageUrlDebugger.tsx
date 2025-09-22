/**
 * 🐛 COMPONENTE: ImageUrlDebugger
 * ===============================
 * Componente para debug de URLs de imagem (apenas desenvolvimento)
 */

import React from 'react';
import { SupabaseStorageService } from '../../services/supabase-storage.service';

interface ImageUrlDebuggerProps {
  urls: (string | null | undefined)[];
  selectedUrl: string;
  label?: string;
}

export function ImageUrlDebugger({ urls, selectedUrl, label }: ImageUrlDebuggerProps) {
  // Só renderiza em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const analysis = SupabaseStorageService.debugUrls(urls);

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <div className="font-bold mb-2">🐛 Image URL Debug {label && `- ${label}`}</div>
      
      <div className="mb-2">
        <div className="text-green-400">✅ Selected URL:</div>
        <div className="break-all">{selectedUrl.substring(0, 80)}...</div>
      </div>

      <div className="space-y-1">
        <div className="text-blue-400">📋 All URLs:</div>
        {analysis.map((info, idx) => (
          <div key={idx} className="pl-2 border-l border-gray-600">
            <div className="flex items-center gap-2">
              <span className={info.isExpired ? '❌' : '✅'}></span>
              <span className={info.isSupabase ? 'text-purple-400' : 'text-gray-400'}>
                {info.isSupabase ? 'Supabase' : 'External'}
              </span>
              {info.isExpired && <span className="text-red-400">(Expired)</span>}
            </div>
            <div className="text-gray-300 break-all">
              {info.url.substring(0, 60)}...
            </div>
            {info.expirationDate && (
              <div className="text-gray-400 text-xs">
                Expires: {info.expirationDate.toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook para facilitar o uso
export function useImageUrlDebugger(
  urls: (string | null | undefined)[], 
  selectedUrl: string, 
  label?: string
) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <ImageUrlDebugger urls={urls} selectedUrl={selectedUrl} label={label} />;
}