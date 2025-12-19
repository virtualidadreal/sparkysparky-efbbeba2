import { useState, FormEvent } from 'react';
import { VoiceRecordButton } from '@/components/common';
import { PaperAirplaneIcon, LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectSuggestionModal } from '@/components/projects/ProjectSuggestionModal';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface ProjectSuggestion {
  id: string;
  topic: string;
  ideaCount: number;
  suggestionCount: number;
  canDismissForever: boolean;
}

interface QuickCapturePopupProps {
  trigger?: React.ReactNode;
}

/**
 * Componente QuickCapturePopup
 * 
 * Popup para captura rápida de ideas por texto y voz.
 */
export const QuickCapturePopup = ({ trigger }: QuickCapturePopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [projectSuggestion, setProjectSuggestion] = useState<ProjectSuggestion | null>(null);
  const queryClient = useQueryClient();

  /**
   * Manejar envío del formulario (texto)
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsProcessingText(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      toast.success('Procesando...');

      const { data, error } = await supabase.functions.invoke('process-text-capture', {
        body: {
          text: content.trim(),
        },
      });

      if (error) {
        throw error;
      }

      const typeMessages: Record<string, string> = {
        idea: '💡 ¡Idea guardada!',
        task: '✅ ¡Tarea creada!',
        diary: '📔 ¡Entrada de diario guardada!',
        person: '👤 ¡Contacto añadido!',
      };
      
      const message = typeMessages[data?.type] || '¡Guardado!';
      toast.success(message);
      
      setContent('');
      setIsOpen(false);
      
      // Check for project suggestion
      if (data?.projectSuggestion) {
        setProjectSuggestion(data.projectSuggestion);
      }
      
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['diary'] });
      queryClient.invalidateQueries({ queryKey: ['people'] });
    } catch (error: any) {
      console.error('Error en handleSubmit:', error);
      toast.error(error.message || 'Error al procesar el contenido');
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

      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileName = `${user.id}/${timestamp}-${random}.webm`;

      const { error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: newIdea, error: createError } = await supabase
        .from('ideas')
        .insert([
          {
            user_id: user.id,
            title: 'Transcribiendo...',
            original_content: 'Procesando audio...',
            audio_url: fileName,
            status: 'draft',
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Procesando audio...');

      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const audioBase64 = btoa(binary);

      supabase.functions
        .invoke('process-voice-capture', {
          body: {
            ideaId: newIdea.id,
            audioBase64,
          },
        })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error processing audio:', error);
            toast.error('Error al procesar el audio');
          } else {
            const typeMessages: Record<string, string> = {
              idea: '💡 ¡Idea transcrita y guardada!',
              diary: '📔 ¡Entrada de diario guardada!',
              task: '✅ ¡Tarea creada!',
              person: '👤 ¡Contacto añadido!',
            };
            const contentType = data?.type || 'idea';
            const message = typeMessages[contentType] || '¡Guardado!';
            toast.success(message);
            
            if (contentType === 'diary') {
              queryClient.invalidateQueries({ queryKey: ['diary'] });
              queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
            } else {
              queryClient.invalidateQueries({ queryKey: ['ideas'] });
            }
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['people'] });
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
      <LightBulbIcon className="h-5 w-5" />
      ¿Qué tienes en mente?
    </Button>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
        <DialogContent 
          className="max-w-none w-[95vw] md:w-[500px] p-0 gap-0 rounded-3xl border border-white/30 dark:border-white/10 shadow-2xl overflow-hidden bg-white/70 dark:bg-card/70 backdrop-blur-2xl"
          hideCloseButton
        >
          <DialogTitle className="sr-only">Captura rápida</DialogTitle>
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <LightBulbIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-medium text-sm">¿Qué tienes en mente?</h2>
                  <p className="text-[10px] text-muted-foreground">
                    Sparky clasificará automáticamente
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
                placeholder="Escribe una idea, tarea, nota de diario..."
                rows={5}
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
                      Analizando...
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
                    className="gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Procesando...
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

        <ProjectSuggestionModal
          suggestion={projectSuggestion}
          onClose={() => setProjectSuggestion(null)}
        />
    </>
  );
};
