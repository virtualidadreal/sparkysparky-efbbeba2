import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button, VoiceRecordButton } from '@/components/common';
import { DiaryEntryList, DiaryEntryForm } from '@/components/diary';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useCreateDiaryEntry, useDiaryEntry } from '@/hooks/useDiaryEntries';
import { supabase } from '@/integrations/supabase/client';
import type { DiaryEntriesFilters } from '@/types/DiaryEntry.types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

/**
 * Página Diary (Diario Personal)
 */
const Diary = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [newEntryContent, setNewEntryContent] = useState('');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  
  const createEntry = useCreateDiaryEntry();
  const { data: editingEntry } = useDiaryEntry(editingEntryId || '');

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

    try {
      await createEntry.mutateAsync({
        content: newEntryContent.trim(),
      });
      setNewEntryContent('');
      setShowNewEntry(false);
    } catch (error) {
      console.error('Error creating diary entry:', error);
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

  const handleEditEntry = (entryId: string) => {
    setEditingEntryId(entryId);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEntryId(null);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Diario</h1>
            <p className="text-gray-600 mt-1">
              Captura momentos importantes y reflexiona sobre tus experiencias
            </p>
          </div>
          
          <div className="flex gap-2">
            <VoiceRecordButton
              onRecordingComplete={handleRecordingComplete}
              disabled={isProcessingAudio || createEntry.isPending}
            />
            <Button
              variant="primary"
              icon={<PlusIcon className="h-5 w-5" />}
              onClick={() => setShowNewEntry(true)}
              disabled={createEntry.isPending}
            >
              Nueva entrada
            </Button>
          </div>
        </div>

        {/* Nueva entrada (texto) */}
        {showNewEntry && (
          <div className="bg-white rounded-lg border-2 border-primary p-4 mb-6">
            <textarea
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              placeholder="¿Qué sucedió hoy? ¿Cómo te sientes?"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                disabled={!newEntryContent.trim() || createEntry.isPending}
                loading={createEntry.isPending}
              >
                Guardar
              </Button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={clsx(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveFilter('positive')}
              className={clsx(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeFilter === 'positive' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Positivas
            </button>
            <button
              onClick={() => setActiveFilter('neutral')}
              className={clsx(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeFilter === 'neutral' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              Neutrales
            </button>
            <button
              onClick={() => setActiveFilter('negative')}
              className={clsx(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeFilter === 'negative' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <DiaryEntryList filters={filters} onEdit={handleEditEntry} />

      <DiaryEntryForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        entry={editingEntry}
      />
    </DashboardLayout>
  );
};

export default Diary;
