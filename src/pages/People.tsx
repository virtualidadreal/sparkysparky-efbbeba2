import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/common';
import { PersonList, PersonForm } from '@/components/people';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePeople } from '@/hooks/usePeople';
import type { PeopleFilters } from '@/types/Person.types';

/**
 * Página People - CRM Personal (placeholder hasta que se cree la tabla)
 */
const People = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'family' | 'friend' | 'colleague' | 'mentor' | 'client'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPersonId, setEditingPersonId] = useState<string | null>(null);

  const { data: allPeople } = usePeople();
  
  const filters: PeopleFilters = {
    ...(activeTab !== 'all' && { category: activeTab }),
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

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPersonId(null);
  };

  const editingPerson = editingPersonId 
    ? allPeople?.find(p => p.id === editingPersonId)
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">CRM Personal</h1>
            <p className="text-muted-foreground">Gestiona tus relaciones importantes</p>
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

        {/* Filtros */}
        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-lg rounded-[18px] p-4 border border-white/50 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
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

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, apodo o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(217,91%,60%)]/50 focus:border-[hsl(217,91%,60%)] transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <PersonList filters={filters} onEdit={handleEdit} />

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
