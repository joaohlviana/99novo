import React, { ReactNode } from 'react';
import { AppHeader } from './AppHeader';
import { Footer } from '../Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useAppState } from '../../contexts/AppStateContext';
import { Toaster } from '../ui/sonner';
import { UserModeSwitch } from '../common/UserModeSwitch';
import { DevelopmentButton } from '../DevelopmentButton';

interface AppLayoutProps {
  children: ReactNode;
  showSearch?: boolean;
  showModeSwitch?: boolean;
  showFooter?: boolean;
  headerTransparent?: boolean;
  containerized?: boolean;
  className?: string;
}

export function AppLayout({
  children,
  showSearch = true,
  showModeSwitch = false,
  showFooter = true,
  headerTransparent = false,
  containerized = true,
  className = ''
}: AppLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const { state } = useAppState();

  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <AppHeader showSearch={showSearch} transparent={headerTransparent} />
      
      {/* Mode Switch Bar (if needed) */}
      {showModeSwitch && isAuthenticated && user && (
        <div className="border-b bg-muted/30">
          <div className="container py-2">
            <UserModeSwitch compact showCurrentMode={false} />
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1">
        {containerized ? (
          <div className="container py-6">
            {children}
          </div>
        ) : (
          children
        )}
      </main>
      
      {/* Footer */}
      {showFooter && <Footer />}
      
      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

// Layout específico para páginas públicas
export function PublicLayout({ children, ...props }: Omit<AppLayoutProps, 'showModeSwitch'>) {
  return (
    <AppLayout {...props} showModeSwitch={false}>
      {children}
    </AppLayout>
  );
}

// Layout específico para dashboards
export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout
      showSearch={false}
      showModeSwitch={true}
      showFooter={false}
      containerized={false}
      className="bg-muted/30"
    >
      {children}
    </AppLayout>
  );
}

// Layout específico para páginas de autenticação
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayout
      showSearch={false}
      showFooter={false}
      headerTransparent={true}
      className="bg-gradient-to-br from-background via-background to-muted/20"
    >
      {children}
    </AppLayout>
  );
}