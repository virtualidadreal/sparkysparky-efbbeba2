import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Plus, 
  Sparkles, 
  Home, 
  Lightbulb, 
  FolderOpen, 
  CheckSquare, 
  Users, 
  BookOpen, 
  Brain, 
  BarChart3, 
  Settings,
  X,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { QuickCapturePopup } from '@/components/dashboard/QuickCapturePopup';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useBetaTester } from '@/hooks/useBetaTester';
import { useSidebarVisibility, SidebarVisibility } from '@/hooks/useSidebarVisibility';
import { BetaFeedbackModal } from '@/components/feedback/BetaFeedbackModal';

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
 * Footer móvil con navegación y acciones rápidas
 */
export const MobileFooter = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const location = useLocation();
  const { data: isAdmin } = useIsAdmin();
  const { isBetaTester } = useBetaTester();
  const { data: visibility } = useSidebarVisibility();

  // Filter navigation items based on visibility settings
  // Show all items while loading (visibility undefined), then filter once loaded
  const visibleItems = navigationItems.filter(item => {
    if (!visibility) return true; // Show all while loading
    return visibility[item.key] !== false;
  });

  return (
    <>
      {/* Overlay del menú */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menú lateral deslizante */}
      <div 
        className={`fixed inset-y-0 left-0 w-72 bg-card border-r border-border shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header del menú */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-lg font-bold text-primary">Sparky</span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Navegación */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {visibleItems.map((item) => {
              const isActive = location.pathname === item.to || 
                (item.to === '/dashboard' && location.pathname === '/');
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
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
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
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

            {/* Beta Feedback - solo para beta testers */}
            {isBetaTester && (
              <>
                <div className="border-t border-border my-3" />
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsFeedbackOpen(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors w-full"
                >
                  <MessageSquare className="h-5 w-5" />
                  Feedback Beta
                </button>
              </>
            )}
          </nav>

          {/* Versión */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">Sparky v1.0</p>
          </div>
        </div>
      </div>

      {/* Footer fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-30 lg:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around px-4 py-2 pb-safe">
          {/* Botón Menú */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="h-6 w-6" />
            <span className="text-xs">Menú</span>
          </button>

          {/* Botón Capturar - Grande y redondo */}
          <QuickCapturePopup
            trigger={
              <button className="flex items-center justify-center w-16 h-16 -mt-6 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                <Plus className="h-8 w-8" />
              </button>
            }
          />

          {/* Botón Sparky */}
          <SparkyChat
            trigger={
              <button className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Sparkles className="h-6 w-6" />
                <span className="text-xs">Sparky</span>
              </button>
            }
          />
        </div>
      </div>

      {/* Beta Feedback Modal */}
      <BetaFeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
};
