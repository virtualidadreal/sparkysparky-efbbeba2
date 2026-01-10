import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, VoiceRecordButton } from '@/components/common';
import { DiaryEntryList, DiaryEntryForm, DiaryEntryDetailModal } from '@/components/diary';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useDiaryEntry, useDeleteDiaryEntry, useCreateDiaryEntry } from '@/hooks/useDiaryEntries';
import { supabase } from '@/integrations/supabase/client';
import type { DiaryEntriesFilters, DiaryEntry } from '@/types/DiaryEntry.types';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useQueryClient } from '@tanstack/react-query';
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
 * Página Diary (Diario Personal) con estilo Dashboard
 */
const Diary = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntryContent, setNewEntryContent] = useState('');
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [viewingEntry, setViewingEntry] = useState<DiaryEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const location = useLocation();
  const { data: isAdmin } = useIsAdmin();
  
  const queryClient = useQueryClient();
  const { data: editingEntry } = useDiaryEntry(editingEntryId || '');
  const deleteEntry = useDeleteDiaryEntry();
  const createEntry = useCreateDiaryEntry();

  // Construir filtros
  const filters: DiaryEntriesFilters = {
    ...(activeFilter !== 'all' && { mood: activeFilter }),
    ...(searchTerm && { search: searchTerm }),
  };

  /**
   * Manejar creación de entrada de texto
   */
  const handleSubmitTextEntry = async () => {
    if (!newEntryContent.trim()) return;

    setIsProcessingText(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-text-capture', {
        body: { text: `Diario: ${newEntryContent.trim()}` },
      });

      if (error) throw error;

      toast.success('Entrada guardada y procesada');
      setNewEntryContent('');
      setShowNewEntry(false);
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
    } catch (error: any) {
      console.error('Error creating diary entry:', error);
      toast.error(error.message || 'Error al guardar la entrada');
    } finally {
      setIsProcessingText(false);
    }
  };

  /**
   * Manejar grabación de voz completada
   */
  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessingAudio(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileName = `${user.id}/${timestamp}-${random}.webm`;

      const { error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const newEntry = await createEntry.mutateAsync({
        content: 'Transcribiendo audio...',
      });

      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const audioBase64 = btoa(binary);

      toast.success('Procesando audio...');
      
      const { data: transcriptionData } = await supabase.functions.invoke('process-voice-capture', {
        body: {
          ideaId: newEntry.id,
          audioBase64,
        },
      });

      if (transcriptionData?.transcription) {
        await supabase
          .from('diary_entries')
          .update({ content: transcriptionData.transcription })
          .eq('id', newEntry.id);
        toast.success('¡Entrada procesada!');
      }
      
    } catch (error: any) {
      console.error('Error processing audio:', error);
      toast.error(error.message || 'Error al procesar el audio');
    } finally {
      setIsProcessingAudio(false);
    }
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
        
        {/* Left Sidebar - fixed height */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-card rounded-[24px] p-4 shadow-sm flex flex-col h-full overflow-hidden">
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
        <div className="flex flex-col gap-4 h-full overflow-y-auto pt-4">
          {/* Header compacto */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <h1 className="text-2xl font-bold text-foreground">Mi Diario</h1>
            <div className="flex gap-2">
              <VoiceRecordButton
                onRecordingComplete={handleRecordingComplete}
                disabled={isProcessingAudio || isProcessingText}
              />
              <Button
                variant="primary"
                icon={<PlusIcon className="h-5 w-5" />}
                onClick={() => setShowNewEntry(true)}
                disabled={isProcessingText}
              >
                Nueva entrada
              </Button>
            </div>
          </div>

          {/* Nueva entrada (texto) */}
          {showNewEntry && (
            <div className="bg-card rounded-[24px] p-5 shadow-sm border-2 border-primary">
              <textarea
                value={newEntryContent}
                onChange={(e) => setNewEntryContent(e.target.value)}
                placeholder="¿Qué sucedió hoy? ¿Cómo te sientes?"
                rows={6}
                className="w-full px-4 py-3 bg-muted/50 border border-border rounded-2xl resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex justify-end gap-2 mt-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowNewEntry(false);
                    setNewEntryContent('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitTextEntry}
                  disabled={!newEntryContent.trim() || isProcessingText}
                  loading={isProcessingText}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-card rounded-[24px] p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2 flex-wrap">
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

              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar en entradas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Lista de entradas */}
          <div className="bg-card rounded-[24px] p-5 shadow-sm flex-1">
            <DiaryEntryList 
              filters={filters} 
              onEdit={handleEditEntry}
              onView={handleViewEntry}
            />
          </div>
        </div>

        {/* Right Sidebar - fixed height */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-card rounded-[24px] p-5 shadow-sm flex flex-col h-full overflow-hidden">
          {/* Nueva Entrada */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              ACCIONES RÁPIDAS
            </h3>
            <button 
              onClick={() => setShowNewEntry(true)}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              Nueva Entrada
            </button>
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
                  📝 Escribe sin filtros, este es tu espacio privado.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  🎙️ Usa la grabación de voz cuando escribir no sea práctico.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  😊 El análisis de ánimo te ayuda a identificar patrones.
                </p>
              </div>
            </div>
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
    </div>
  );
};

export default Diary;
