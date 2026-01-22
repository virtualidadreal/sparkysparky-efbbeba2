import { useState } from 'react';
import { PersonList, PersonForm } from '@/components/people';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePeople } from '@/hooks/usePeople';
import type { PeopleFilters } from '@/types/Person.types';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { MobileFooter } from '@/components/layout/MobileFooter';
import { FloatingCaptureButton } from '@/components/layout/FloatingCaptureButton';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Mic } from 'lucide-react';

/**
 * Página People - CRM Personal con estilo Dashboard
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
    <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 pb-24 lg:pb-3 overflow-hidden">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto h-[calc(100vh-24px)]">
        
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Content - scrollable */}
        <div className="flex flex-col gap-4 h-full overflow-y-auto pt-4">
          {/* Header compacto con título y buscador */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-1">
            <h1 className="text-2xl font-bold text-foreground whitespace-nowrap">
              CRM Personal
            </h1>
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre, apodo o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Filtros por categoría */}
          <div className="flex flex-wrap items-center gap-2 px-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lista de personas */}
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 border border-border/50 flex-1">
            <PersonList filters={filters} onEdit={handleEdit} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 flex flex-col h-full overflow-hidden border border-border/50">
          {/* Nuevo Contacto */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              ACCIONES RÁPIDAS
            </h3>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Añadir Contacto
            </button>
          </div>

          {/* Separador */}
          <div className="border-t border-border mb-6" />

          {/* Estadísticas */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              ESTADÍSTICAS
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total contactos</span>
                <span className="text-lg font-semibold text-foreground">{allPeople?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              CONSEJOS
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  👥 Categoriza tus contactos para encontrarlos más rápido.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  📝 Añade notas sobre cómo conociste a cada persona.
                </p>
              </div>
            </div>
          </div>

          {/* Botón Hablar con Sparky */}
          <div className="mt-auto pt-4">
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
      </div>

      <PersonForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        person={editingPerson}
      />

      {/* Mobile Footer */}
      <MobileFooter />

      {/* Floating Capture Button - Desktop */}
      <FloatingCaptureButton />
    </div>
  );
};

export default People;
