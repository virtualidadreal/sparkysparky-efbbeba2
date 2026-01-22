import { useState } from 'react';
import { DiaryEntryList, DiaryEntryForm, DiaryEntryDetailModal } from '@/components/diary';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDiaryEntry, useDeleteDiaryEntry } from '@/hooks/useDiaryEntries';
import type { DiaryEntriesFilters, DiaryEntry } from '@/types/DiaryEntry.types';
import clsx from 'clsx';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { MobileFooter } from '@/components/layout/MobileFooter';
import { FloatingCaptureButton } from '@/components/layout/FloatingCaptureButton';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Mic } from 'lucide-react';

/**
 * Página Diary (Diario Personal) con estilo Dashboard
 */
const Diary = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const { data: editingEntry } = useDiaryEntry(editingEntryId || '');
  const deleteEntry = useDeleteDiaryEntry();

  // Construir filtros
  const filters: DiaryEntriesFilters = {
    ...(activeFilter !== 'all' && { mood: activeFilter }),
    ...(searchTerm && { search: searchTerm }),
  };

  const handleViewEntry = (entry: DiaryEntry) => {
    setViewingEntry(entry);
    setIsDetailOpen(true);
  };

  const handleEditEntry = (entryId: string) => {
    setEditingEntryId(entryId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEntryId(null);
  };

  const handleDeleteFromDetail = async () => {
    if (viewingEntry) {
      try {
        await deleteEntry.mutateAsync(viewingEntry.id);
        setIsDetailOpen(false);
        setViewingEntry(null);
      } catch (error) {}
    }
  };

  const handleEditFromDetail = () => {
    if (viewingEntry) {
      setIsDetailOpen(false);
      setEditingEntryId(viewingEntry.id);
      setIsFormOpen(true);
    }
  };

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
              Mi Diario
            </h1>
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar en el diario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap px-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                activeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveFilter('positive')}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                activeFilter === 'positive' ? 'bg-green-500 text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Positivas
            </button>
            <button
              onClick={() => setActiveFilter('neutral')}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                activeFilter === 'neutral' ? 'bg-gray-500 text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Neutrales
            </button>
            <button
              onClick={() => setActiveFilter('negative')}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                activeFilter === 'negative' ? 'bg-red-500 text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Negativas
            </button>
          </div>

          {/* Lista de entradas */}
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 flex-1 border border-border/50">
            <DiaryEntryList 
              filters={filters} 
              onEdit={handleEditEntry}
              onView={handleViewEntry}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 flex flex-col h-full overflow-hidden border border-border/50">
          {/* Tips */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              CONSEJOS
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  📝 Escribe sin filtros, este es tu espacio privado.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  🎙️ Usa el botón + y escribe "diario:" para crear una entrada.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  😊 El análisis de ánimo te ayuda a identificar patrones.
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

      <DiaryEntryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        entry={editingEntry}
      />

      <DiaryEntryDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingEntry(null);
        }}
        entry={viewingEntry}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      {/* Mobile Footer */}
      <MobileFooter />

      {/* Floating Capture Button - Desktop */}
      <FloatingCaptureButton />
    </div>
  );
};

export default Diary;