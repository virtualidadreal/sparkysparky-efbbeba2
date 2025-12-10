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
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Ideas</h1>
            <p className="text-gray-600">
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
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
