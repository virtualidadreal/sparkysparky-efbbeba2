import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  Plus,
  Lightbulb,
  FolderOpen,
  CheckSquare,
  Brain,
  BarChart3,
  ShieldCheck,
  Mic,
  BookOpen,
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useAdmin';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { QuickCapturePopup } from '@/components/dashboard/QuickCapturePopup';

interface ThreeColumnLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
}

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
  { to: '/projects', icon: FolderOpen, label: 'Proyectos' },
  { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
  { to: '/people', icon: Users, label: 'Personas' },
  { to: '/diary', icon: BookOpen, label: 'Diario' },
  { to: '/memory', icon: Brain, label: 'Memoria' },
  { to: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
];

export const ThreeColumnLayout = ({ children, rightSidebar }: ThreeColumnLayoutProps) => {
  const location = useLocation();
  const { data: isAdmin } = useIsAdmin();

  return (
    <div className="min-h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3">
      <div className={`grid grid-cols-1 ${rightSidebar ? 'lg:grid-cols-[280px_1fr_300px]' : 'lg:grid-cols-[280px_1fr]'} gap-3 max-w-[1800px] mx-auto min-h-[calc(100vh-24px)]`}>
        
        {/* Left Sidebar - Navigation */}
        <div className="hidden lg:flex flex-col">
          <div className="bg-card rounded-[24px] p-4 shadow-sm flex flex-col flex-1">
            <nav className="space-y-0.5 flex-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to || 
                  (item.to === '/dashboard' && location.pathname === '/');
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="border-t border-border my-3" />
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      location.pathname === '/admin'
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Admin
                  </Link>
                </>
              )}
            </nav>

            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <QuickCapturePopup
                trigger={
                  <button className="w-full flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-xl text-muted-foreground text-sm hover:bg-muted transition-colors">
                    <Plus className="h-4 w-4" />
                    Captura rápida
                  </button>
                }
              />

              <SparkyChat
                trigger={
                  <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors">
                    <Mic className="h-4 w-4" />
                    Hablar con Sparky
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col gap-3">
          {children}
        </div>

        {/* Right Sidebar (optional) */}
        {rightSidebar && (
          <div className="bg-card rounded-[24px] p-5 shadow-sm flex flex-col">
            {rightSidebar}
          </div>
        )}
      </div>
    </div>
  );
};
