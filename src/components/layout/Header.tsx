import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { GlobalSearchModal } from '@/components/search';

/**
 * Props del componente Header
 */
interface HeaderProps {
  onMenuToggle: () => void;
}

/**
 * Componente Header
 */
export const Header = ({ onMenuToggle }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Cmd/Ctrl + K para búsqueda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  /**
   * Manejar cierre de sesión
   */
  const handleSignOut = async () => {
    const { error } = await signOut();
    
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      toast.success('Sesión cerrada');
      navigate('/auth');
    }
  };

  /**
   * Obtener iniciales del usuario
   */
  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name || user?.email;
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-card border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Abrir menú"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <Link to="/dashboard" className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">Sparky</h1>
            </Link>
          </div>

          {/* Center: Búsqueda global */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative w-full flex items-center"
            >
              <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-muted-foreground" />
              <div className="w-full pl-10 pr-4 py-2 border border-border bg-background rounded-md text-sm text-muted-foreground text-left cursor-pointer hover:border-primary/50 transition-colors">
                Buscar ideas, proyectos, personas...
              </div>
              <kbd className="absolute right-3 px-2 py-0.5 text-xs font-mono bg-muted text-muted-foreground rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Mobile search button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Buscar"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>

          {/* Right: Avatar con dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Menú de usuario"
              aria-expanded={isDropdownOpen}
            >
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {getUserInitials()}
              </div>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-1 z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    {user?.user_metadata?.full_name || 'Usuario'}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <UserCircleIcon className="h-5 w-5 text-muted-foreground" />
                    Ver perfil
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    <Cog6ToothIcon className="h-5 w-5 text-muted-foreground" />
                    Configuración
                  </Link>
                </div>

                {/* Sign out */}
                <div className="border-t border-border py-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-muted"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
