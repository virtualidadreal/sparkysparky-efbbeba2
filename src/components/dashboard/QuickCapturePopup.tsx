import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { MicrophoneIcon, PauseIcon, PlayIcon, PaperAirplaneIcon, LightBulbIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/solid';
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
import { glassToast } from '@/components/common/GlassToast';
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
  startInTextMode?: boolean;
}

/**
 * QuickCapturePopup - Voice-First Capture
 * 
 * Al abrirse inicia grabación automáticamente.
 * Botón "Escribir" cancela audio y muestra input de texto.
 */
export const QuickCapturePopup = ({ trigger, startInTextMode = false }: QuickCapturePopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [projectSuggestion, setProjectSuggestion] = useState<ProjectSuggestion | null>(null);
  
  // Voice-first: por defecto NO estamos en modo texto
  const [isTextMode, setIsTextMode] = useState(startInTextMode);
  const [isPaused, setIsPaused] = useState(false);
  const [waveformHistory, setWaveformHistory] = useState<number[]>([]);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  
  const queryClient = useQueryClient();
  
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
  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Formatear tiempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const MAX_WAVEFORM_BARS = 80;

  // Iniciar visualización de audio
  const startVisualization = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.3;
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        let count = 0;
        for (let i = 2; i < Math.min(bufferLength, 40); i++) {
          sum += dataArray[i];
          count++;
        }
        const avgLevel = count > 0 ? (sum / count) / 255 : 0;
        setCurrentLevel(avgLevel);

        animationRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();

      waveformIntervalRef.current = setInterval(() => {
        if (!analyserRef.current || isPaused) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        let count = 0;
        for (let i = 2; i < Math.min(bufferLength, 40); i++) {
          sum += dataArray[i];
          count++;
        }
        const avgLevel = count > 0 ? (sum / count) / 255 : 0;
        
        setWaveformHistory(prev => {
          const newHistory = [...prev, avgLevel];
          if (newHistory.length > MAX_WAVEFORM_BARS) {
            return newHistory.slice(-MAX_WAVEFORM_BARS);
          }
          return newHistory;
        });
      }, 50);

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
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current);
      waveformIntervalRef.current = null;
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
    setWaveformHistory([]);
    setCurrentLevel(0);
  }, []);

  // Auto-iniciar grabación cuando se abre (voice-first)
  useEffect(() => {
    const autoStartRecording = async () => {
      if (isOpen && !isTextMode && !hasAutoStarted && permissionState !== 'denied') {
        setHasAutoStarted(true);
        await startRecording();
        await startVisualization();
      }
    };
    
    autoStartRecording();
  }, [isOpen, isTextMode, hasAutoStarted, permissionState, startRecording, startVisualization]);

  // Manejar errores de grabación
  useEffect(() => {
    if (recordingError) {
      toast.error(recordingError);
      setIsTextMode(true); // Fallback a modo texto si hay error
      stopVisualization();
    }
  }, [recordingError, stopVisualization]);

  // Limpiar al cerrar el popup
  useEffect(() => {
    if (!isOpen) {
      setIsTextMode(startInTextMode);
      setHasAutoStarted(false);
      stopVisualization();
      if (isRecording) {
        cancelRecording();
      }
      setContent('');
      setIsPaused(false);
    }
  }, [isOpen, isRecording, cancelRecording, stopVisualization, startInTextMode]);

  /**
   * Cambiar a modo texto (cancela grabación)
   */
  const switchToTextMode = () => {
    stopVisualization();
    if (isRecording) {
      cancelRecording();
    }
    setIsTextMode(true);
    setIsPaused(false);
  };

  /**
   * Enviar grabación
   */
  const handleSendRecording = async () => {
    stopVisualization();
    const audioBlob = await stopRecording();
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

      glassToast.audio('🎯 Procesando...');

      const { data, error } = await supabase.functions.invoke('process-text-capture', {
        body: {
          text: content.trim(),
        },
      });

      if (error) {
        throw error;
      }

      const contentType = data?.type || 'idea';
      const entityId = data?.id;
      
      switch (contentType) {
        case 'idea':
          glassToast.idea('💡 ¡Idea guardada!', entityId);
          break;
        case 'diary':
          glassToast.diary('📔 ¡Entrada de diario guardada!', entityId);
          break;
        case 'task':
          glassToast.task('✅ ¡Tarea creada!', entityId);
          break;
        case 'person':
          glassToast.person('👤 ¡Contacto añadido!', entityId);
          break;
        default:
          glassToast.success('¡Guardado!');
      }
      
      setContent('');
      setIsOpen(false);
      
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

      glassToast.audio('🎧 Procesando audio...');

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
            const contentType = data?.type || 'idea';
            const entityId = data?.id || newIdea.id;
            
            switch (contentType) {
              case 'idea':
                glassToast.idea('💡 ¡Idea transcrita y guardada!', entityId);
                break;
              case 'diary':
                glassToast.diary('📔 ¡Entrada de diario guardada!', entityId);
                break;
              case 'task':
                glassToast.task('✅ ¡Tarea creada!', entityId);
                break;
              case 'person':
                glassToast.person('👤 ¡Contacto añadido!', entityId);
                break;
              default:
                glassToast.success('¡Guardado!');
            }
            
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
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {isTextMode ? (
                    <PencilIcon className="h-4 w-4 text-primary" />
                  ) : (
                    <MicrophoneIcon className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="font-medium text-sm">
                    {isTextMode ? '¿Qué tienes en mente?' : 'Grabando...'}
                  </h2>
                  <p className="text-[10px] text-muted-foreground">
                    {isTextMode 
                      ? 'Sparky clasificará automáticamente' 
                      : 'Habla para capturar tu idea'
                    }
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

            {/* Content - Modo grabación (voice-first) */}
            {!isTextMode ? (
              <div className="p-5 flex flex-col items-center gap-6 relative">
                {/* Visualizador de ondas */}
                <div className="w-full h-28 bg-gradient-to-b from-muted/30 to-muted/60 rounded-2xl flex items-center justify-end px-2 overflow-hidden relative">
                  {/* Línea central */}
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                    <div className="w-full h-[1px] bg-primary/20" />
                  </div>
                  
                  {/* Indicador de nivel actual */}
                  <div 
                    className="absolute right-3 w-1 bg-primary rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(8, currentLevel * 80)}%`,
                      opacity: isPaused ? 0.3 : 0.9,
                    }}
                  />
                  
                  {/* Historial de ondas */}
                  <div className="flex items-center gap-[3px] h-full pr-6 overflow-hidden">
                    {waveformHistory.map((value, index) => {
                      const isRecent = index >= waveformHistory.length - 5;
                      const opacity = isPaused 
                        ? 0.3 
                        : 0.4 + (index / waveformHistory.length) * 0.5;
                      
                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-center gap-[2px]"
                        >
                          <div
                            className={clsx(
                              'w-[3px] rounded-full transition-all',
                              isRecent ? 'bg-primary' : 'bg-primary/70',
                              isPaused && 'bg-muted-foreground/40'
                            )}
                            style={{
                              height: `${Math.max(2, value * 45)}%`,
                              opacity,
                              transition: isRecent ? 'height 50ms ease-out' : 'none',
                            }}
                          />
                          <div
                            className={clsx(
                              'w-[3px] rounded-full transition-all',
                              isRecent ? 'bg-primary' : 'bg-primary/70',
                              isPaused && 'bg-muted-foreground/40'
                            )}
                            style={{
                              height: `${Math.max(2, value * 45)}%`,
                              opacity,
                              transition: isRecent ? 'height 50ms ease-out' : 'none',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-3 h-3 rounded-full',
                    isPaused ? 'bg-warning' : 'bg-destructive animate-pulse'
                  )} />
                  <span className="text-2xl font-mono font-semibold text-foreground">
                    {formatTime(recordingTime)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 05:00</span>
                </div>

                {/* Controles principales */}
                <div className="flex items-center gap-4">
                  {/* Botón Pausa/Reanudar */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handlePauseResume}
                    className="w-14 h-14 rounded-full p-0"
                    disabled={!isRecording}
                  >
                    {isPaused ? (
                      <PlayIcon className="h-6 w-6" />
                    ) : (
                      <PauseIcon className="h-6 w-6" />
                    )}
                  </Button>

                  {/* Botón Enviar */}
                  <Button
                    size="lg"
                    onClick={handleSendRecording}
                    className="w-16 h-16 rounded-full p-0 bg-primary hover:bg-primary/90"
                    disabled={!isRecording || recordingTime === 0}
                  >
                    <PaperAirplaneIcon className="h-7 w-7" />
                  </Button>
                </div>

                {/* Estado */}
                <p className="text-sm text-muted-foreground text-center">
                  {isPaused ? 'En pausa' : isRecording ? 'Hablando...' : 'Iniciando...'}
                </p>

                {/* Botón "Escribir" en la esquina inferior */}
                <button
                  onClick={switchToTextMode}
                  className="absolute bottom-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-sm font-medium"
                >
                  <PencilIcon className="h-4 w-4" />
                  Escribir
                </button>
              </div>
            ) : (
              /* Content - Modo texto */
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
