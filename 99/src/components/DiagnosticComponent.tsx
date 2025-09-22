/*
 * DEPRECATED DIAGNOSTIC COMPONENT
 * 
 * Este componente foi movido para:
 * /components/DiagnosticComponent.tsx
 * 
 * Use esse arquivo em vez deste.
 */

import React from 'react';

// Simple diagnostic component to test if React is working
export const DiagnosticComponent: React.FC = () => {
  console.log('🔍 DiagnosticComponent: Loaded successfully');
  
  const [status, setStatus] = React.useState('checking');
  
  React.useEffect(() => {
    console.log('🔍 DiagnosticComponent: useEffect running');
    
    try {
      // Test basic functionality
      const tests = [
        { name: 'React', result: !!React },
        { name: 'useState', result: !!React.useState },
        { name: 'useEffect', result: !!React.useEffect },
        { name: 'Window', result: typeof window !== 'undefined' },
        { name: 'Document', result: typeof document !== 'undefined' },
        { name: 'Fetch', result: typeof fetch !== 'undefined' },
      ];
      
      const failedTests = tests.filter(test => !test.result);
      
      if (failedTests.length === 0) {
        setStatus('success');
        console.log('✅ All diagnostic tests passed');
      } else {
        setStatus('error');
        console.error('❌ Failed tests:', failedTests);
      }
      
    } catch (error) {
      console.error('❌ Diagnostic error:', error);
      setStatus('error');
    }
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">System Diagnostic</h1>
        
        {status === 'checking' && (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Running diagnostics...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <p className="text-green-600 font-semibold">All systems operational!</p>
            <p className="text-gray-600 mt-2">App should be working normally.</p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <p className="text-red-600 font-semibold">System issues detected</p>
            <p className="text-gray-600 mt-2">Check console for details.</p>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-gray-200 text-left text-sm text-gray-500">
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
          <p><strong>Location:</strong> {window.location.href}</p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticComponent;