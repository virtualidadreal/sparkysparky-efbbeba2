import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { MicrophoneIcon, PauseIcon, PlayIcon, PaperAirplaneIcon, LightBulbIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { LightBulbIcon as LightBulbOutline } from '@heroicons/react/24/outline';
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
import { useRecordVoice } from '@/hooks/useRecordVoice';
import { useIsMobile } from '@/hooks/use-mobile';
import { VoiceRecordButton } from '@/components/common';
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
 * En móvil, la grabación de audio se muestra inline en lugar de un nuevo modal.
 */
export const QuickCapturePopup = ({ trigger }: QuickCapturePopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [projectSuggestion, setProjectSuggestion] = useState<ProjectSuggestion | null>(null);
  
  // Estado para grabación inline en móvil
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioData, setAudioData] = useState<number[]>(new Array(50).fill(0));
  
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  // Hook de grabación
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    error: recordingError,
    permissionState,
  } = useRecordVoice();
  
  // Refs para visualización de audio
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Iniciar visualización de audio
  const startVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!analyserRef.current || isPaused) {
          animationRef.current = requestAnimationFrame(draw);
          return;
        }

        analyserRef.current.getByteFrequencyData(dataArray);
        
        const bars = 50;
        const step = Math.floor(bufferLength / bars);
        const newData = [];
        for (let i = 0; i < bars; i++) {
          const value = dataArray[i * step] / 255;
          newData.push(value);
        }
        setAudioData(newData);

        animationRef.current = requestAnimationFrame(draw);
      };

      draw();
    } catch (err) {
      console.error('Error accessing microphone for visualization:', err);
    }
  }, [isPaused]);

  // Detener visualización
  const stopVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    analyserRef.current = null;
    setAudioData(new Array(50).fill(0));
  }, []);

  // Manejar errores de grabación
  useEffect(() => {
    if (recordingError) {
      toast.error(recordingError);
      setIsRecordingMode(false);
      stopVisualization();
    }
  }, [recordingError, stopVisualization]);

  // Limpiar al cerrar el popup
  useEffect(() => {
    if (!isOpen) {
      setIsRecordingMode(false);
      stopVisualization();
      if (isRecording) {
        cancelRecording();
      }
    }
  }, [isOpen, isRecording, cancelRecording, stopVisualization]);

  /**
   * Iniciar modo grabación (solo móvil)
   */
  const handleStartRecordingMode = async () => {
    if (permissionState === 'denied') {
      toast.error('El acceso al micrófono está bloqueado. Haz clic en el icono de candado en la barra de direcciones para permitirlo.');
      return;
    }
    
    setIsRecordingMode(true);
    await startRecording();
    await startVisualization();
  };

  /**
   * Cancelar grabación y volver al modo texto
   */
  const handleCancelRecording = () => {
    stopVisualization();
    cancelRecording();
    setIsRecordingMode(false);
    setIsPaused(false);
  };

  /**
   * Enviar grabación
   */
  const handleSendRecording = async () => {
    stopVisualization();
    const audioBlob = await stopRecording();
    setIsRecordingMode(false);
    setIsPaused(false);
    
    if (audioBlob) {
      await handleRecordingComplete(audioBlob);
    }
  };

  /**
   * Manejar pausa
   */
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

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
      <LightBulbOutline className="h-5 w-5" />
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
                {isRecordingMode && isMobile ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelRecording}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <LightBulbIcon className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div>
                  <h2 className="font-medium text-sm">
                    {isRecordingMode && isMobile ? 'Grabando audio' : '¿Qué tienes en mente?'}
                  </h2>
                  <p className="text-[10px] text-muted-foreground">
                    {isRecordingMode && isMobile 
                      ? 'Habla para capturar tu idea' 
                      : 'Sparky clasificará automáticamente'
                    }
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isRecordingMode) {
                    handleCancelRecording();
                  }
                  setIsOpen(false);
                }}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Content - Modo grabación inline (solo móvil) */}
            {isRecordingMode && isMobile ? (
              <div className="p-5 flex flex-col items-center gap-6">
                {/* Visualizador de ondas profesional estilo Apple */}
                <div className="w-full h-40 bg-background/80 dark:bg-black/60 rounded-2xl flex flex-col items-center justify-center px-4 py-6 overflow-hidden relative">
                  {/* Waveform container */}
                  <div className="flex items-center justify-center h-24 w-full relative">
                    {/* Barras de audio grabadas (izquierda del playhead) */}
                    <div className="flex items-center gap-[3px] h-full">
                      {audioData.slice(0, 25).map((value, index) => (
                        <div
                          key={`left-${index}`}
                          className="w-[3px] rounded-full bg-foreground/90 dark:bg-white/90 transition-all duration-100"
                          style={{
                            height: `${Math.max(8, value * 85)}%`,
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Playhead central con indicador */}
                    <div className="flex flex-col items-center mx-1 h-full relative">
                      {/* Punto indicador */}
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                      {/* Línea vertical */}
                      <div className="w-0.5 flex-1 bg-primary rounded-b-full" />
                    </div>
                    
                    {/* Línea punteada (derecha del playhead - tiempo restante) */}
                    <div className="flex items-center gap-[3px] h-full">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <div
                          key={`right-${index}`}
                          className="w-[3px] h-[3px] rounded-full bg-muted-foreground/40 dark:bg-white/20"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timer y controles */}
                <div className="flex items-center justify-between w-full px-2">
                  {/* Timer */}
                  <span className="text-3xl font-mono font-bold tracking-tight text-foreground">
                    {formatTime(recordingTime)}
                  </span>

                  {/* Botón Stop/Enviar */}
                  <Button
                    size="lg"
                    onClick={handleSendRecording}
                    className="w-14 h-14 rounded-xl p-0 bg-primary hover:bg-primary/90 border-2 border-primary"
                    disabled={!isRecording || recordingTime === 0}
                  >
                    <div className="w-5 h-5 rounded-sm bg-primary-foreground" />
                  </Button>
                </div>

                {/* Texto de estado */}
                <p className="text-xs text-muted-foreground text-center">
                  {isPaused ? 'En pausa' : 'Grabando...'}
                </p>
              </div>
            ) : (
              /* Content - Modo texto normal */
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
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px]">↵</kbd> para guardar
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* En móvil: botón que activa modo grabación inline */}
                    {isMobile ? (
                      <button
                        type="button"
                        onClick={handleStartRecordingMode}
                        disabled={isLoading || permissionState === 'denied'}
                        className={clsx(
                          'relative flex items-center justify-center',
                          'w-12 h-12 rounded-full',
                          'transition-all duration-200',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          permissionState === 'denied'
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-primary hover:bg-primary/90 shadow-md'
                        )}
                        title={
                          permissionState === 'denied' 
                            ? 'Micrófono bloqueado' 
                            : 'Grabar audio'
                        }
                        aria-label="Iniciar grabación de audio"
                      >
                        <MicrophoneIcon className={clsx(
                          'h-6 w-6',
                          permissionState === 'denied' ? 'text-muted-foreground' : 'text-white'
                        )} />
                      </button>
                    ) : (
                      /* En desktop: usa el componente VoiceRecordButton con modal */
                      <VoiceRecordButton
                        onRecordingComplete={handleRecordingComplete}
                        disabled={isLoading}
                      />
                    )}

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
            )}
          </DialogContent>
        </Dialog>

        <ProjectSuggestionModal
          suggestion={projectSuggestion}
          onClose={() => setProjectSuggestion(null)}
        />
    </>
  );
};
