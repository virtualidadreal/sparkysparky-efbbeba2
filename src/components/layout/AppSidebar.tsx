import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Settings,
  Lightbulb,
  FolderOpen,
  CheckSquare,
  Brain,
  BarChart3,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useSidebarVisibility, SidebarVisibility } from '@/hooks/useSidebarVisibility';

/**
 * Navigation items with visibility keys
 */
const navigationItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard', key: 'dashboard' as keyof SidebarVisibility },
  { to: '/ideas', icon: Lightbulb, label: 'Ideas', key: 'ideas' as keyof SidebarVisibility },
  { to: '/projects', icon: FolderOpen, label: 'Proyectos', key: 'projects' as keyof SidebarVisibility },
  { to: '/tasks', icon: CheckSquare, label: 'Tareas', key: 'tasks' as keyof SidebarVisibility },
  { to: '/people', icon: Users, label: 'Personas', key: 'people' as keyof SidebarVisibility },
  { to: '/diary', icon: BookOpen, label: 'Diario', key: 'diary' as keyof SidebarVisibility },
  { to: '/memory', icon: Brain, label: 'Memoria', key: 'memory' as keyof SidebarVisibility },
  { to: '/estadisticas', icon: BarChart3, label: 'Estadísticas', key: 'analytics' as keyof SidebarVisibility },
  { to: '/settings', icon: Settings, label: 'Configuración', key: 'settings' as keyof SidebarVisibility },
];

/**
 * Shared App Sidebar component
 * Used across all main pages for consistent navigation
 */
export const AppSidebar = () => {
  const location = useLocation();
  const { data: isAdmin } = useIsAdmin();
  const { data: visibility } = useSidebarVisibility();

  // Filter navigation items based on visibility settings
  const visibleItems = navigationItems.filter(item => {
    if (!visibility) return true;
    return visibility[item.key] !== false;
  });

  return (
    <div className="hidden lg:flex flex-col h-full">
      <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-4 flex flex-col h-full overflow-hidden border-2 border-border/50">
        {/* Logo */}
        <div className="px-4 mb-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Sparky</h1>
        </div>
        
        {/* Nav Items */}
        <nav className="space-y-0.5 flex-1 overflow-y-auto">
          {visibleItems.map((item) => {
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

          {/* Admin link */}
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
      </div>
    </div>
  );
};