import { useState, FormEvent } from 'react';
import { Button, VoiceRecordButton } from '@/components/common';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import toast from 'react-hot-toast';

/**
 * Componente QuickCapture
 * 
 * Widget para captura rápida de ideas por texto y voz.
 */
export const QuickCapture = () => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isProcessingText, setIsProcessingText] = useState(false);
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

      // Procesar con edge function - Sparky clasifica automáticamente
      // userId is derived from JWT on the server
      const { data, error } = await supabase.functions.invoke('process-text-capture', {
        body: {
          text: content.trim(),
        },
      });

      if (error) {
        throw error;
      }

      // Mostrar mensaje según el tipo de contenido clasificado
      const typeMessages: Record<string, string> = {
        idea: '💡 ¡Idea guardada!',
        task: '✅ ¡Tarea creada!',
        diary: '📔 ¡Entrada de diario guardada!',
        person: '👤 ¡Contacto añadido!',
      };
      
      const message = typeMessages[data?.type] || '¡Guardado!';
      toast.success(message);
      
      setContent('');
      setIsFocused(false);
      
      // Refrescar todas las listas relevantes
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

      // Crear nombre de archivo único
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const fileName = `${user.id}/${timestamp}-${random}.webm`;

      // Subir audio a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Store the file path (not public URL) - audio is now private
      // Signed URLs will be generated on-demand when viewing

      // Create idea with file path instead of public URL
      const { data: newIdea, error: createError } = await supabase
        .from('ideas')
        .insert([
          {
            user_id: user.id,
            title: 'Transcribiendo...',
            original_content: 'Procesando audio...',
            audio_url: fileName, // Store file path, not public URL
            status: 'draft',
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      toast.success('Procesando audio...');

      // Convertir audio a base64 para enviar a la edge function
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const audioBase64 = btoa(binary);

      // Procesar con edge function en background
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
            toast.success('¡Idea transcrita y procesada!');
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
          }
        });
      
    } catch (error: any) {
      console.error('Error al procesar audio:', error);
      toast.error(error.message || 'Error al guardar el audio');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  /**
   * Detectar Cmd/Ctrl + Enter para enviar
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  const isDisabled = !content.trim() || isProcessingText || isProcessingAudio;
  const isLoading = isProcessingText || isProcessingAudio;

  return (
    <div
      className={clsx(
        'bg-card rounded-lg border-2 transition-all duration-200',
        isFocused ? 'border-primary shadow-md' : 'border-border'
      )}
    >
      <form onSubmit={handleSubmit} className="p-4">
        {/* Textarea */}
        <div className="mb-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => !content && setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="¿Qué tienes en mente?"
            rows={isFocused ? 4 : 2}
            disabled={isLoading}
            className={clsx(
              'w-full px-3 py-2 border-0 rounded-md resize-none bg-transparent',
              'text-foreground placeholder-muted-foreground',
              'focus:outline-none focus:ring-0',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between gap-2">
          {/* Contador de caracteres o estado */}
          <div className="flex items-center gap-2">
            {isProcessingAudio ? (
              <span className="text-xs text-primary font-medium animate-pulse">
                Procesando audio...
              </span>
            ) : isProcessingText ? (
              <span className="text-xs text-primary font-medium animate-pulse">
                Analizando contenido...
              </span>
            ) : content.length > 0 ? (
              <span className="text-xs text-muted-foreground">
                {content.length} caracteres
              </span>
            ) : null}
          </div>

          {/* Botones */}
          <div className="flex items-center gap-2">
            {/* Botón de voz */}
            <VoiceRecordButton
              onRecordingComplete={handleRecordingComplete}
              disabled={isLoading}
            />

            {/* Botón enviar */}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isDisabled}
              loading={isLoading}
              icon={<PaperAirplaneIcon className="h-4 w-4" />}
              iconPosition="right"
            >
              {isLoading ? 'Analizando...' : 'Guardar'}
            </Button>
          </div>
        </div>

        {/* Hint */}
        {isFocused && !isLoading && (
          <div className="mt-2 text-xs text-muted-foreground">
            Presiona <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border">Enter</kbd> para guardar
          </div>
        )}
      </form>
    </div>
  );
};
