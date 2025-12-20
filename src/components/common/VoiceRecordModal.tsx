import { useState, useRef, useEffect, useCallback } from 'react';
import { MicrophoneIcon, PauseIcon, PlayIcon, PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRecordVoice } from '@/hooks/useRecordVoice';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export interface VoiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (audioBlob: Blob) => void;
}

export const VoiceRecordModal = ({
  isOpen,
  onClose,
  onRecordingComplete,
}: VoiceRecordModalProps) => {
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
    permissionState,
  } = useRecordVoice();

  const [isPaused, setIsPaused] = useState(false);
  const [audioData, setAudioData] = useState<number[]>(new Array(50).fill(0));
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
        
        // Tomar solo 50 barras y normalizar
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

  // Iniciar grabación cuando se abre el modal
  useEffect(() => {
    if (isOpen && !isRecording && permissionState !== 'denied') {
      const start = async () => {
        await startRecording();
        await startVisualization();
      };
      start();
    }
    
    return () => {
      if (!isOpen) {
        stopVisualization();
      }
    };
  }, [isOpen]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
      onClose();
    }
  }, [error, onClose]);

  // Manejar pausa (simular con stop visual)
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
    // Nota: MediaRecorder no soporta pausa en todos los navegadores
    // Por ahora solo pausamos la visualización
  };

  // Enviar grabación
  const handleSend = async () => {
    stopVisualization();
    const audioBlob = await stopRecording();
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
    onClose();
  };

  // Cancelar y cerrar
  const handleCancel = () => {
    stopVisualization();
    cancelRecording();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold text-foreground">Grabando audio</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Visualizador de ondas */}
          <div className="w-full h-32 bg-muted/50 rounded-xl flex items-center justify-center px-4 overflow-hidden">
            <div className="flex items-center justify-center gap-[2px] h-full w-full">
              {audioData.map((value, index) => (
                <div
                  key={index}
                  className={clsx(
                    'w-1 rounded-full transition-all duration-75',
                    isPaused ? 'bg-muted-foreground/50' : 'bg-primary'
                  )}
                  style={{
                    height: `${Math.max(4, value * 100)}%`,
                    opacity: isPaused ? 0.5 : 0.8 + value * 0.2,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-3">
            <div className={clsx(
              'w-3 h-3 rounded-full',
              isPaused ? 'bg-amber-500' : 'bg-red-500 animate-pulse'
            )} />
            <span className="text-2xl font-mono font-semibold text-foreground">
              {formatTime(recordingTime)}
            </span>
            <span className="text-sm text-muted-foreground">/ 05:00</span>
          </div>

          {/* Controles */}
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
              onClick={handleSend}
              className="w-16 h-16 rounded-full p-0 bg-primary hover:bg-primary/90"
              disabled={!isRecording || recordingTime === 0}
            >
              <PaperAirplaneIcon className="h-7 w-7" />
            </Button>
          </div>

          {/* Texto de ayuda */}
          <p className="text-sm text-muted-foreground text-center">
            {isPaused ? 'En pausa' : 'Hablando...'}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
