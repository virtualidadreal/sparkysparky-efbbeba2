import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LeftSidebar } from '@/components/dashboard/LeftSidebar';
import { RightSidebar } from '@/components/dashboard/RightSidebar';
import { CentralContent } from '@/components/dashboard/CentralContent';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <Header onMenuToggle={() => setIsMobileSidebarOpen(true)} />
        <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      </div>

      {/* Main 3-column layout */}
      <div className="flex gap-6 p-6 max-w-[1600px] mx-auto">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Central Content */}
        <CentralContent />

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
};

export default Dashboard;
