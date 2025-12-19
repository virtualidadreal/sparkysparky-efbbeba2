import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button, VoiceRecordButton } from '@/components/common';
import { DiaryEntryList, DiaryEntryForm, DiaryEntryDetailModal } from '@/components/diary';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useDiaryEntry, useDeleteDiaryEntry, useCreateDiaryEntry } from '@/hooks/useDiaryEntries';
import { supabase } from '@/integrations/supabase/client';
import type { DiaryEntriesFilters, DiaryEntry } from '@/types/DiaryEntry.types';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Página Diary (Diario Personal)
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
   * Manejar creación de entrada de texto - usa process-text-capture para enriquecer con IA
   */
  const handleSubmitTextEntry = async () => {
    if (!newEntryContent.trim()) return;

    setIsProcessingText(true);
    try {
      // Usamos process-text-capture que clasifica y enriquece el contenido
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

      // Subir audio a Supabase Storage
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

      // Crear entrada de diario temporal
      const newEntry = await createEntry.mutateAsync({
        content: 'Transcribiendo audio...',
      });

      // Convertir audio a base64 para transcripción
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
      } catch (error) {
        // Error ya manejado en el hook
      }
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
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mi Diario</h1>
            <p className="text-muted-foreground mt-1">
              Captura momentos importantes y reflexiona sobre tus experiencias
            </p>
          </div>
          
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
          <div className="bg-white/60 dark:bg-card/60 backdrop-blur-lg rounded-[18px] p-4 border-2 border-[hsl(217,91%,60%)]">
            <textarea
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              placeholder="¿Qué sucedió hoy? ¿Cómo te sientes?"
              rows={6}
              className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl resize-none focus:ring-2 focus:ring-[hsl(217,91%,60%)]/50 focus:border-[hsl(217,91%,60%)] text-foreground placeholder:text-muted-foreground"
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
        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-lg rounded-[18px] p-4 border border-white/50 dark:border-white/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={clsx(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  activeFilter === 'all' ? 'bg-[hsl(217,91%,60%)] text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
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
                className="w-full px-4 py-2.5 bg-muted/50 border border-border rounded-xl focus:ring-2 focus:ring-[hsl(217,91%,60%)]/50 focus:border-[hsl(217,91%,60%)] text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <DiaryEntryList 
          filters={filters} 
          onEdit={handleEditEntry}
          onView={handleViewEntry}
        />

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
      </div>
    </DashboardLayout>
  );
};

export default Diary;
