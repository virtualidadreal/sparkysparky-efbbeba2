import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { MobileFooter } from './MobileFooter';
import { FloatingCaptureButton } from './FloatingCaptureButton';

/**
 * Unified page layout with consistent styling across all pages.
 * 
 * Styling specs (from design system):
 * - Background: hsl(220,14%,96%) light / hsl(222,84%,5%) dark
 * - Panels: bg-transparent backdrop-blur-sm border border-border/50 rounded-[24px]
 * - 3-column grid: 280px left sidebar, flexible center, 300px right sidebar
 */

interface PageLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
  /** Whether to show the floating capture button (default: true) */
  showFloatingCapture?: boolean;
}

export const PageLayout = ({ 
  children, 
  rightSidebar,
  showFloatingCapture = true 
}: PageLayoutProps) => {
  return (
    <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 pb-24 lg:pb-3 overflow-hidden">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto h-[calc(100vh-24px)]">
        
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        {children}

        {/* Right Sidebar */}
        {rightSidebar && (
          <div className="hidden lg:flex flex-col h-full">
            {rightSidebar}
          </div>
        )}
      </div>

      {/* Mobile Footer */}
      <MobileFooter />

      {/* Floating Capture Button - Desktop */}
      {showFloatingCapture && <FloatingCaptureButton />}
    </div>
  );
};

/**
 * Main content panel with consistent styling
 */
interface ContentPanelProps {
  children: ReactNode;
  className?: string;
  /** Add padding to the panel (default: true) */
  padded?: boolean;
}

export const ContentPanel = ({ children, className = '', padded = true }: ContentPanelProps) => {
  return (
    <div className={`bg-transparent backdrop-blur-sm rounded-[24px] border border-border/50 ${padded ? 'p-5' : ''} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Right sidebar panel with consistent styling
 */
interface SidebarPanelProps {
  children: ReactNode;
  className?: string;
}

export const SidebarPanel = ({ children, className = '' }: SidebarPanelProps) => {
  return (
    <div className={`bg-transparent backdrop-blur-sm rounded-[24px] p-5 flex flex-col h-full overflow-hidden border border-border/50 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Scrollable main content area
 */
interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export const MainContent = ({ children, className = '' }: MainContentProps) => {
  return (
    <div className={`flex flex-col gap-4 h-full overflow-y-auto pt-4 ${className}`}>
      {children}
    </div>
  );
};

export default PageLayout;
