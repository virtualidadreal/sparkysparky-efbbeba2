import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import sparkyLogo from '@/assets/sparky-logo.png';
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
  Search,
} from 'lucide-react';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useSidebarVisibility, SidebarVisibility } from '@/hooks/useSidebarVisibility';
import { GlobalSearchModal } from '@/components/search';

/**
 * Navigation items with visibility keys
 */
const navigationItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard', key: 'dashboard' as keyof SidebarVisibility },
  { to: '/ideas', icon: Lightbulb, label: 'Ideas', key: 'ideas' as keyof SidebarVisibility },
  { to: '/diary', icon: BookOpen, label: 'Diario', key: 'diary' as keyof SidebarVisibility },
  { to: '/projects', icon: FolderOpen, label: 'Proyectos', key: 'projects' as keyof SidebarVisibility },
  { to: '/tasks', icon: CheckSquare, label: 'Tareas', key: 'tasks' as keyof SidebarVisibility },
  { to: '/people', icon: Users, label: 'Personas', key: 'people' as keyof SidebarVisibility },
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
  const { data: visibility, isLoading: isLoadingVisibility } = useSidebarVisibility();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Filter navigation items based on visibility settings
  const visibleItems = navigationItems.filter(item => {
    if (!visibility) return false; // Ocultar todo mientras carga
    return visibility[item.key] !== false;
  });

  return (
    <>
      <div className="hidden lg:flex flex-col h-full">
        <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-4 flex flex-col h-full overflow-hidden border border-border/50">
          {/* Logo */}
          <div className="px-4 mb-4">
            <Link to="/dashboard">
              <img src={sparkyLogo} alt="Sparky" className="h-8 w-auto" />
            </Link>
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
                      ? 'border border-primary bg-transparent text-muted-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
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
                      ? 'border border-primary bg-transparent text-muted-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'
                  }`}
                >
                  <ShieldCheck className={`h-5 w-5 ${location.pathname === '/admin' ? 'text-primary' : ''}`} />
                  Admin
                </Link>
              </>
            )}
          </nav>

          {/* Search Button - Bottom */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-3 px-4 py-2.5 mt-3 rounded-xl bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors border border-border/50"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Buscar...</span>
            <kbd className="ml-auto text-xs px-1.5 py-0.5 rounded bg-muted/50 font-mono">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
