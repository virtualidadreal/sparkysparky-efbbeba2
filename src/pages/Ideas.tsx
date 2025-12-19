import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/common';
import { IdeaList } from '@/components/ideas';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { IdeasFilters } from '@/types/Idea.types';

/**
 * Página Ideas
 * 
 * Vista principal del módulo de ideas con:
 * - Header con botón de nueva idea
 * - Filtros por status (tabs)
 * - Buscador
 * - Lista de ideas
 */
const Ideas = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Construir filtros según el tab activo
  const filters: IdeasFilters = {
    ...(activeTab !== 'all' && { status: activeTab }),
    ...(searchTerm && { search: searchTerm }),
  };

  const tabs = [
    { id: 'all' as const, label: 'Todas' },
    { id: 'active' as const, label: 'Activas' },
    { id: 'archived' as const, label: 'Archivadas' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mis Ideas</h1>
            <p className="text-muted-foreground">
              Todas tus ideas capturadas y organizadas
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<PlusIcon className="h-5 w-5" />}
            disabled
          >
            Nueva Idea
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-lg rounded-[18px] p-4 border border-white/50 dark:border-white/10">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[hsl(217,91%,60%)] text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%)]/50 focus:border-[hsl(217,91%,60%)] transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Lista de ideas */}
        <IdeaList filters={filters} />
      </div>
    </DashboardLayout>
  );
};

export default Ideas;
