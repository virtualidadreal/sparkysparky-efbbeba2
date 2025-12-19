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
  CpuChipIcon,
  PresentationChartLineIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useIsAdmin } from '@/hooks/useAdmin';
import { useTags } from '@/hooks/useTags';

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Ideas', href: '/ideas', icon: LightBulbIcon },
  { name: 'Proyectos', href: '/projects', icon: FolderIcon },
  { name: 'Tareas', href: '/tasks', icon: CheckIcon },
  { name: 'Personas', href: '/people', icon: UsersIcon },
  { name: 'Diario', href: '/diary', icon: BookOpenIcon },
  { name: 'Memoria', href: '/memory', icon: CpuChipIcon },
  { name: 'Analytics', href: '/analytics', icon: PresentationChartLineIcon },
  { name: 'Insights', href: '/insights', icon: ChartBarIcon },
  { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon },
];

export const LeftSidebar = () => {
  const { data: isAdmin } = useIsAdmin();
  const { data: tags } = useTags();

  // Get unique tags from all ideas
  const uniqueTags = tags?.slice(0, 6) || [];

  return (
    <aside className="w-72 bg-card rounded-3xl p-6 h-fit sticky top-24 hidden lg:block">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">S</span>
        </div>
        <span className="text-xl font-bold text-foreground">Sparky</span>
      </div>

      {/* Navigation Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {navigationItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                isActive
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* See All Link */}
      <NavLink
        to="/settings"
        className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors mb-8"
      >
        <span className="w-2 h-2 rounded-full bg-foreground" />
        Ver todas las secciones
      </NavLink>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        Tu asistente IA personal para capturar ideas, gestionar proyectos y mantener relaciones importantes.
      </p>

      {/* Tags/Categories */}
      {uniqueTags.length > 0 && (
        <div className="space-y-3 mb-8">
          {uniqueTags.map((tag, index) => (
            <div
              key={tag.id}
              className={clsx(
                'rounded-xl p-4 relative overflow-hidden',
                index % 2 === 0 ? 'bg-gradient-to-r from-amber-100 to-orange-100' : 'bg-gradient-to-r from-blue-100 to-cyan-100'
              )}
            >
              <span className="text-sm font-medium text-foreground">{tag.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* More Navigation */}
      <nav className="space-y-1 border-t border-border pt-6">
        {navigationItems.slice(5).map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
        
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
          >
            <ShieldCheckIcon className="h-4 w-4" />
            Admin
          </NavLink>
        )}
      </nav>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center mb-4">
          Sparky v1.0 — Tu asistente IA
        </p>
      </div>
    </aside>
  );
};
