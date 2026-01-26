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
      // Pequeño delay para asegurar que el stream de grabación ya está activo
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      }, 60);

    } catch (err) {
      console.error('Error accessing microphone for visualization:', err);
      // Si falla la visualización, simulamos ondas aleatorias
      waveformIntervalRef.current = setInterval(() => {
        if (isPaused) return;
        const fakeLevel = 0.2 + Math.random() * 0.5;
        setCurrentLevel(fakeLevel);
        setWaveformHistory(prev => {
          const newHistory = [...prev, fakeLevel];
          if (newHistory.length > MAX_WAVEFORM_BARS) {
            return newHistory.slice(-MAX_WAVEFORM_BARS);
          }
          return newHistory;
        });
      }, 60);
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
            // Mensaje más específico según el tipo de error
            let errorMessage = 'Error al procesar el audio';
            if (error.message?.includes('quota') || error.message?.includes('límite')) {
              errorMessage = 'Has alcanzado el límite mensual. Actualiza a Pro para continuar.';
            } else if (error.message?.includes('timeout') || error.message?.includes('tiempo')) {
              errorMessage = 'El procesamiento tardó demasiado. Intenta con un audio más corto.';
            } else if (error.message?.includes('Whisper') || error.message?.includes('transcription')) {
              errorMessage = 'Error al transcribir el audio. Verifica que hay voz clara en la grabación.';
            } else if (error.message?.includes('size') || error.message?.includes('large')) {
              errorMessage = 'El audio es demasiado largo. Máximo 5 minutos.';
            } else if (error.message?.includes('speech') || error.message?.includes('detected')) {
              errorMessage = 'No se detectó voz en el audio. Intenta hablar más cerca del micrófono.';
            }
            toast.error(errorMessage);
            
            // Limpiar la idea placeholder si hubo error
            supabase.from('ideas').delete().eq('id', newIdea.id).then(() => {
              queryClient.invalidateQueries({ queryKey: ['ideas'] });
            });
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
        })
        .catch((err) => {
          console.error('Voice capture failed:', err);
          toast.error('Error de conexión. Verifica tu internet e intenta de nuevo.');
          // Limpiar la idea placeholder
          supabase.from('ideas').delete().eq('id', newIdea.id).then(() => {
            queryClient.invalidateQueries({ queryKey: ['ideas'] });
          });
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
              <div className="p-6 flex flex-col items-center gap-6 relative">
                {/* Visualizador de ondas - Glassmorphism */}
                <div className="w-full h-32 relative rounded-2xl overflow-hidden">
                  {/* Fondo glassmorphism */}
                  <div className="absolute inset-0 bg-white/40 dark:bg-white/10 backdrop-blur-xl border border-white/50 dark:border-white/20 rounded-2xl" />
                  
                  {/* Gradiente decorativo sutil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 rounded-2xl" />
                  
                  {/* Contenido del visualizador */}
                  <div className="relative h-full flex items-center justify-center px-6">
                    {/* Línea central elegante */}
                    <div className="absolute inset-y-0 left-6 right-6 flex items-center pointer-events-none">
                      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    </div>
                    
                    {/* Indicador de nivel actual (pulso brillante con color vibrante) */}
                    <div 
                      className="absolute right-6 w-1.5 rounded-full transition-all duration-100"
                      style={{
                        height: `${Math.max(16, currentLevel * 80)}px`,
                        opacity: isPaused ? 0.4 : 1,
                        background: 'linear-gradient(180deg, hsl(48, 96%, 54%) 0%, hsl(48, 96%, 48%) 50%, hsl(48, 96%, 42%) 100%)',
                        boxShadow: isPaused ? 'none' : '0 0 12px hsl(48, 96%, 54%), 0 0 20px hsl(48, 96%, 50%)',
                      }}
                    />
                    
                    {/* Historial de ondas - barras simétricas con colores vibrantes */}
                    <div className="flex items-center gap-[3px] h-full py-4">
                      {waveformHistory.length === 0 ? (
                        // Placeholder elegante cuando no hay datos
                        <div className="flex items-center gap-[3px]">
                          {Array.from({ length: 40 }).map((_, i) => {
                            const height = 4 + Math.sin(i * 0.3) * 3;
                            // Color primario uniforme
                            const primaryColor = 'hsl(48, 96%, 54%)';
                            return (
                              <div key={i} className="flex flex-col items-center gap-[2px]">
                                <div 
                                  className="w-[2.5px] rounded-full" 
                                  style={{ 
                                    height: `${height}px`,
                                    background: primaryColor,
                                    opacity: 0.3,
                                  }}
                                />
                                <div 
                                  className="w-[2.5px] rounded-full" 
                                  style={{ 
                                    height: `${height}px`,
                                    background: primaryColor,
                                    opacity: 0.3,
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        waveformHistory.slice(-50).map((value, index, arr) => {
                          const isRecent = index >= arr.length - 8;
                          const opacity = isPaused ? 0.4 : 0.6 + (index / arr.length) * 0.4;
                          const barHeight = Math.max(4, value * 40);
                          
                          // Usar solo el color primario #FACD1A
                          const baseLightness = 50 + (value * 10);
                          const barColor = `hsl(48, 96%, ${baseLightness}%)`;
                          const glowColor = 'hsl(48, 96%, 54%)';
                          
                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center gap-[2px]"
                            >
                              {/* Barra superior */}
                              <div
                                className="w-[2.5px] rounded-full transition-all duration-75"
                                style={{
                                  height: `${barHeight}px`,
                                  opacity,
                                  background: isRecent && !isPaused
                                    ? `linear-gradient(180deg, ${barColor} 0%, hsl(48, 96%, 60%) 50%, ${barColor} 100%)`
                                    : barColor,
                                  boxShadow: isRecent && !isPaused 
                                    ? `0 0 8px ${glowColor}, 0 0 12px ${glowColor}` 
                                    : `0 0 3px ${glowColor}40`,
                                }}
                              />
                              {/* Barra inferior (espejo) */}
                              <div
                                className="w-[2.5px] rounded-full transition-all duration-75"
                                style={{
                                  height: `${barHeight}px`,
                                  opacity,
                                  background: isRecent && !isPaused
                                    ? `linear-gradient(0deg, ${barColor} 0%, hsl(48, 96%, 60%) 50%, ${barColor} 100%)`
                                    : barColor,
                                  boxShadow: isRecent && !isPaused 
                                    ? `0 0 8px ${glowColor}, 0 0 12px ${glowColor}` 
                                    : `0 0 3px ${glowColor}40`,
                                }}
                              />
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  
                  {/* Brillo superior sutil */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-2xl" />
                </div>

                {/* Timer - más elegante */}
                <div className="flex items-center gap-4 px-5 py-2.5 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/40 dark:border-white/20">
                  <div className={clsx(
                    'w-2.5 h-2.5 rounded-full shadow-lg',
                    isPaused 
                      ? 'bg-warning shadow-warning/30' 
                      : 'bg-destructive animate-pulse shadow-destructive/30'
                  )} />
                  <span className="text-xl font-mono font-semibold text-foreground tracking-wider">
                    {formatTime(recordingTime)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">/ 05:00</span>
                </div>

                {/* Controles principales - Glassmorphism */}
                <div className="flex items-center gap-5">
                  {/* Botón Pausa/Reanudar */}
                  <button
                    onClick={handlePauseResume}
                    disabled={!isRecording}
                    className={clsx(
                      'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200',
                      'bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/20',
                      'hover:bg-white/80 dark:hover:bg-white/20 hover:scale-105 active:scale-95',
                      'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
                      'shadow-lg shadow-black/5'
                    )}
                  >
                    {isPaused ? (
                      <PlayIcon className="h-6 w-6 text-foreground" />
                    ) : (
                      <PauseIcon className="h-6 w-6 text-foreground" />
                    )}
                  </button>

                  {/* Botón Enviar - Principal */}
                  <button
                    onClick={handleSendRecording}
                    disabled={!isRecording || recordingTime === 0}
                    className={clsx(
                      'w-18 h-18 rounded-full flex items-center justify-center transition-all duration-200',
                      'bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25',
                      'hover:scale-105 active:scale-95',
                      'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
                    )}
                    style={{ width: '72px', height: '72px' }}
                  >
                    <PaperAirplaneIcon className="h-8 w-8 text-primary-foreground" />
                  </button>
                </div>

                {/* Estado */}
                <p className="text-sm text-muted-foreground text-center font-medium">
                  {isPaused ? 'En pausa' : isRecording ? 'Escuchando...' : 'Iniciando...'}
                </p>

                {/* Botón "Escribir" - Glassmorphism */}
                <button
                  onClick={switchToTextMode}
                  className={clsx(
                    'absolute bottom-6 left-6 flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200',
                    'bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/20',
                    'text-muted-foreground hover:text-foreground hover:bg-white/80 dark:hover:bg-white/20',
                    'text-sm font-medium shadow-lg shadow-black/5'
                  )}
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
