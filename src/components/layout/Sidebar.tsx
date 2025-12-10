import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  LightBulbIcon,
  FolderIcon,
  CheckIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BookOpenIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useIsAdmin } from '@/hooks/useAdmin';

/**
 * Props del componente Sidebar
 */
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Items de navegación del sidebar
 */
const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Ideas', href: '/ideas', icon: LightBulbIcon },
  { name: 'Proyectos', href: '/projects', icon: FolderIcon },
  { name: 'Tareas', href: '/tasks', icon: CheckIcon },
  { name: 'Personas', href: '/people', icon: UsersIcon },
  { name: 'Diario', href: '/diary', icon: BookOpenIcon },
  { name: 'Insights', href: '/insights', icon: ChartBarIcon },
  { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon },
];

/**
 * Componente Sidebar
 */
export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { data: isAdmin } = useIsAdmin();

  return (
    <>
      {/* Overlay en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full bg-card border-r border-border',
          'w-64 transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header del sidebar (solo móvil) */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Menú</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Cerrar menú"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={clsx(
                      'h-5 w-5',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}

          {/* Admin link - solo visible para admins */}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mt-4 border-t border-border pt-4',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <ShieldCheckIcon
                    className={clsx(
                      'h-5 w-5',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                  <span>Admin</span>
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* Footer del sidebar */}
        <div className="px-4 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Sparky v1.0
          </p>
        </div>
      </aside>
    </>
  );
};
