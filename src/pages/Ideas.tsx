import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IdeaList } from '@/components/ideas';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { IdeasFilters } from '@/types/Idea.types';
import { useIsAdmin } from '@/hooks/useAdmin';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { QuickCapturePopup } from '@/components/dashboard/QuickCapturePopup';
import { MobileFooter } from '@/components/layout/MobileFooter';
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

/**
 * Página Ideas
 * 
 * Vista principal del módulo de ideas con estilo Dashboard
 */
const Ideas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const { data: isAdmin } = useIsAdmin();

  // Construir filtros
  const filters: IdeasFilters = {
    ...(searchTerm && { search: searchTerm }),
  };

  return (
    <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 pb-24 lg:pb-3 overflow-hidden">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto h-[calc(100vh-24px)]">
        
        {/* Left Sidebar - fixed height */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-4 flex flex-col h-full overflow-hidden border-2 border-border/50">
            {/* Nav Items */}
            <nav className="space-y-0.5 flex-1 overflow-y-auto">
              {[
                { to: '/dashboard', icon: Home, label: 'Dashboard' },
                { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
                { to: '/projects', icon: FolderOpen, label: 'Proyectos' },
                { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
                { to: '/people', icon: Users, label: 'Personas' },
                { to: '/diary', icon: BookOpen, label: 'Diario' },
                { to: '/memory', icon: Brain, label: 'Memoria' },
                { to: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
                { to: '/settings', icon: Settings, label: 'Configuración' },
              ].map((item) => {
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

            {/* Bottom Actions */}
            <div className="mt-4 pt-4 border-t border-border space-y-3 shrink-0">
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

        {/* Main Content - scrollable */}
        <div className="flex flex-col gap-4 h-full overflow-y-auto">
          {/* Header */}
          <div className="px-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Mis Ideas
            </h1>
            <p className="text-muted-foreground mt-1">
              Todas tus ideas capturadas y organizadas
            </p>
          </div>

          {/* Buscador */}
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 border-2 border-border/50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar ideas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Lista de ideas */}
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 flex-1 border-2 border-border/50">
            <IdeaList filters={filters} />
          </div>
        </div>

        {/* Right Sidebar - fixed height */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 flex flex-col h-full overflow-hidden border-2 border-border/50">
          {/* Nueva Idea */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              ACCIONES RÁPIDAS
            </h3>
            <QuickCapturePopup
              trigger={
                <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors">
                  <PlusIcon className="h-4 w-4" />
                  Nueva Idea
                </button>
              }
            />
          </div>

          {/* Separador */}
          <div className="border-t border-border mb-6" />

          {/* Tips */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              CONSEJOS
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  💡 Usa la captura por voz para ideas rápidas mientras caminas o conduces.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  🏷️ Añade etiquetas a tus ideas para encontrarlas más fácil después.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  📁 Vincula ideas a proyectos para mantener todo organizado.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <MobileFooter />
    </div>
  );
};

export default Ideas;
