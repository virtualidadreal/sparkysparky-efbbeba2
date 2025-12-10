import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/**
 * Props del componente DashboardLayout
 */
interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Componente DashboardLayout
 * 
 * Layout principal del dashboard que incluye:
 * - Header fijo superior
 * - Sidebar de navegación (responsive)
 * - Área de contenido principal
 */
export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header onMenuToggle={toggleSidebar} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main content area */}
        <main className="flex-1 lg:ml-0">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
