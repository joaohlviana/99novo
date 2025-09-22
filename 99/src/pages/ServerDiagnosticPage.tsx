import React from 'react';
import ServerConnectivityTest from '../components/dev-tools/ServerConnectivityTest';

const ServerDiagnosticPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <ServerConnectivityTest />
      </div>
    </div>
  );
};

export default ServerDiagnosticPage;