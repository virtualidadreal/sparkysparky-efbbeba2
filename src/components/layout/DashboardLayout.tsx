import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Lightbulb,
  FolderOpen,
  CheckSquare,
  Users,
  BookOpen,
  Brain,
  BarChart3,
  TrendingUp,
  Settings,
  ShieldCheck,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useAdmin';

/**
 * Props del componente DashboardLayout
 */
interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Componente DashboardLayout
 * 
 * Layout principal del dashboard con diseño glassmorphism
 */
export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const { data: isAdmin } = useIsAdmin();

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

  return (
    <div className="min-h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-3 max-w-[1600px] mx-auto min-h-[calc(100vh-24px)]">
        
        {/* Left Sidebar */}
        <aside className="hidden lg:flex flex-col">
          <div className="bg-white/80 dark:bg-card/80 backdrop-blur-xl rounded-[24px] p-4 shadow-sm border border-white/50 dark:border-white/10 flex flex-col flex-1">
            {/* Logo */}
            <div className="px-4 py-3 mb-2">
              <Link to="/dashboard" className="text-xl font-bold text-foreground">
                Sparky ✨
              </Link>
            </div>

            {/* Nav Items */}
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
                        ? 'bg-[hsl(217,91%,60%)]/10 text-[hsl(217,91%,60%)] font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin link */}
              {isAdmin && (
                <>
                  <div className="border-t border-border my-3" />
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      location.pathname === '/admin'
                        ? 'bg-[hsl(217,91%,60%)]/10 text-[hsl(217,91%,60%)] font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    Admin
                  </Link>
                </>
              )}
            </nav>

            {/* Quick Actions */}
            <div className="mt-4 space-y-3">
              <Link
                to="/ideas"
                className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-xl text-muted-foreground text-sm hover:bg-muted transition-colors"
              >
                <Plus className="h-4 w-4" />
                ¿Qué tienes en mente?
              </Link>
              <Link
                to="/chat"
                className="flex items-center justify-center gap-2 bg-[hsl(217,91%,60%)] text-white px-4 py-3 rounded-xl font-medium text-sm hover:bg-[hsl(217,91%,55%)] transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Hablar con Sparky
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex flex-col gap-3">
          <div className="bg-white/80 dark:bg-card/80 backdrop-blur-xl rounded-[24px] p-6 lg:p-8 shadow-sm border border-white/50 dark:border-white/10 flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
