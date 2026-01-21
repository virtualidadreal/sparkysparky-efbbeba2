import { useState, FormEvent } from 'react';
import { VoiceRecordButton } from '@/components/common';
import { PaperAirplaneIcon, BookOpenIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useCreateDiaryEntry } from '@/hooks/useDiaryEntries';

interface DiaryEntryPopupProps {
  trigger?: React.ReactNode;
}

/**
 * Componente DiaryEntryPopup
 * 
 * Popup para crear entradas de diario rápidamente.
 */
export const DiaryEntryPopup = ({ trigger }: DiaryEntryPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isProcessingText, setIsProcessingText] = useState(false);
  const queryClient = useQueryClient();
  const createEntry = useCreateDiaryEntry();

  /**
   * Manejar envío del formulario (texto)
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsProcessingText(true);
    
    try {
      // Usamos process-text-capture que clasifica y enriquece el contenido
      const { data, error } = await supabase.functions.invoke('process-text-capture', {
        body: { text: `Diario: ${content.trim()}` },
      });

      if (error) throw error;

      toast.success('📔 ¡Entrada de diario guardada!');
      
      setContent('');
      setIsOpen(false);
      
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
    } catch (error: any) {
      console.error('Error en handleSubmit:', error);
      toast.error(error.message || 'Error al guardar la entrada');
    } finally {
      setIsProcessingText(false);
    }
  };

  /**
   * Manejar grabación completada
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
      
      supabase.functions
        .invoke('process-voice-capture', {
          body: {
            ideaId: newEntry.id,
            audioBase64,
          },
        })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error processing audio:', error);
            toast.error('Error al procesar el audio');
          } else {
            if (data?.transcription) {
              supabase
                .from('diary_entries')
                .update({ content: data.transcription })
                .eq('id', newEntry.id)
                .then(() => {
                  toast.success('📔 ¡Entrada procesada!');
                  queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
                  queryClient.invalidateQueries({ queryKey: ['diary'] });
                  queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
                });
            }
          }
        });

      setIsOpen(false);
      
    } catch (error: any) {
      console.error('Error al procesar audio:', error);
      toast.error(error.message || 'Error al guardar el audio');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  const isDisabled = !content.trim() || isProcessingText || isProcessingAudio;
  const isLoading = isProcessingText || isProcessingAudio;

  const defaultTrigger = (
    <Button
      className="w-full gap-2"
      variant="outline"
    >
      <BookOpenIcon className="h-5 w-5" />
      Nueva entrada de diario
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent 
        className="max-w-none w-[95vw] md:w-[500px] p-0 gap-0 rounded-2xl border-0 shadow-2xl overflow-hidden bg-background/95 backdrop-blur-xl"
        hideCloseButton
      >
        <DialogTitle className="sr-only">Nueva entrada de diario</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpenIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-medium text-sm">Nueva entrada de diario</h2>
              <p className="text-[10px] text-muted-foreground">
                Captura tus pensamientos y experiencias
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="¿Qué sucedió hoy? ¿Cómo te sientes? ¿Qué aprendiste?"
            rows={6}
            disabled={isLoading}
            autoFocus
            className={clsx(
              'w-full px-4 py-3 border border-border rounded-xl resize-none bg-muted/30',
              'text-foreground placeholder-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />

          {/* Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {isProcessingAudio ? (
                <span className="text-xs text-primary font-medium animate-pulse">
                  Procesando audio...
                </span>
              ) : isProcessingText ? (
                <span className="text-xs text-primary font-medium animate-pulse">
                  Guardando...
                </span>
              ) : content.length > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {content.length} caracteres
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">↵</kbd> para guardar
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <VoiceRecordButton
                onRecordingComplete={handleRecordingComplete}
                disabled={isLoading}
              />

              <Button
                type="submit"
                disabled={isDisabled}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
