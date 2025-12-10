import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/common';
import { PersonList, PersonForm } from '@/components/people';
import { PlusIcon, MagnifyingGlassIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { usePeople, useUpdatePerson } from '@/hooks/usePeople';
import type { PeopleFilters } from '@/types/Person.types';

/**
 * Página People
 * 
 * Vista principal del CRM personal con:
 * - Header con botón de añadir contacto
 * - Sección destacada de personas que necesitan atención
 * - Filtros por categoría (tabs)
 * - Toggle para solo personas que necesitan atención
 * - Buscador
 * - Grid de contactos
 */
const People = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'family' | 'friend' | 'colleague' | 'mentor' | 'client'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyNeedsAttention, setShowOnlyNeedsAttention] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

  const { data: allPeople } = usePeople();
  const { data: peopleNeedingAttention } = usePeople({ needs_attention: true });
  const updatePerson = useUpdatePerson();
  
  // Construir filtros según el tab activo y filtros adicionales
  const filters: PeopleFilters = {
    ...(activeTab !== 'all' && { category: activeTab }),
    ...(showOnlyNeedsAttention && { needs_attention: true }),
    ...(searchTerm && { search: searchTerm }),
  };

  const tabs = [
    { id: 'all' as const, label: 'Todos' },
    { id: 'family' as const, label: 'Familia' },
    { id: 'friend' as const, label: 'Amigos' },
    { id: 'colleague' as const, label: 'Colegas' },
    { id: 'mentor' as const, label: 'Mentores' },
    { id: 'client' as const, label: 'Clientes' },
  ];

  const handleEdit = (personId: string) => {
    setEditingPersonId(personId);
    setIsFormOpen(true);
  };

  const handleLogInteraction = async (personId: string) => {
    const today = new Date().toISOString().split('T')[0];
    await updatePerson.mutateAsync({
      id: personId,
      updates: {
        last_contact_date: today,
        needs_attention: false,
      },
    });
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPersonId(null);
  };

  // Obtener persona para edición
  const editingPerson = editingPersonId 
    ? allPeople?.find(p => p.id === editingPersonId)
    : null;

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM Personal</h1>
            <p className="text-gray-600">
              Gestiona tus relaciones importantes
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={() => setIsFormOpen(true)}
          >
            Añadir Contacto
          </Button>
        </div>

        {/* Sección destacada: Personas que necesitan atención */}
        {peopleNeedingAttention && peopleNeedingAttention.length > 0 && !showOnlyNeedsAttention && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  {peopleNeedingAttention.length} {peopleNeedingAttention.length === 1 ? 'persona necesita' : 'personas necesitan'} tu atención
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  Hace tiempo que no tienes contacto con estas personas importantes
                </p>
                <div className="flex flex-wrap gap-2">
                  {peopleNeedingAttention.slice(0, 5).map((person) => (
                    <button
                      key={person.id}
                      onClick={() => handleLogInteraction(person.id)}
                      className="px-3 py-1.5 bg-white border border-red-300 rounded-md text-sm text-red-900 hover:bg-red-50 transition-colors"
                    >
                      {person.full_name}
                    </button>
                  ))}
                  {peopleNeedingAttention.length > 5 && (
                    <button
                      onClick={() => setShowOnlyNeedsAttention(true)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                    >
                      Ver todas ({peopleNeedingAttention.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {/* Tabs por categoría */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
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

          {/* Buscador y toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, apodo o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Toggle necesitan atención */}
            <button
              onClick={() => setShowOnlyNeedsAttention(!showOnlyNeedsAttention)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                showOnlyNeedsAttention
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ExclamationTriangleIcon className="h-4 w-4" />
              {showOnlyNeedsAttention ? 'Mostrando solo necesitan atención' : 'Solo necesitan atención'}
            </button>
          </div>
        </div>

        {/* Lista de personas */}
        <PersonList 
          filters={filters} 
          onEdit={handleEdit}
          onLogInteraction={handleLogInteraction}
        />

        {/* Modal de formulario */}
        <PersonForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          person={editingPerson}
        />
      </div>
    </DashboardLayout>
  );
};

export default People;
