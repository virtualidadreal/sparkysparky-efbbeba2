import { useEffect } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useRecordVoice } from '@/hooks/useRecordVoice';
import toast from 'react-hot-toast';

/**
 * Props del componente VoiceRecordButton
 */
export interface VoiceRecordButtonProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

/**
 * Componente VoiceRecordButton
 * 
 * Botón para grabar audio con estados visuales:
 * - Idle: Botón con icono de micrófono
 * - Grabando: Botón rojo pulsante + timer
 * - Procesando: Loading spinner (manejado por padre)
 */
export const VoiceRecordButton = ({ 
  onRecordingComplete, 
  onError,
  disabled = false
}: VoiceRecordButtonProps) => {
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    error,
  } = useRecordVoice();

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
      onError?.(error);
    }
  }, [error, onError]);

  // Formatear tiempo de grabación (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handler para click del botón
  const handleClick = async () => {
    if (isRecording) {
      // Detener grabación
      const audioBlob = await stopRecording();
      if (audioBlob) {
        onRecordingComplete(audioBlob);
      }
    } else {
      // Iniciar grabación
      await startRecording();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative flex items-center justify-center
          w-12 h-12 rounded-full
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50' 
            : 'bg-primary hover:bg-primary/90 shadow-md'
          }
        `}
        title={isRecording ? 'Detener grabación' : 'Grabar audio'}
        aria-label={isRecording ? 'Detener grabación de audio' : 'Iniciar grabación de audio'}
      >
        {isRecording ? (
          <StopIcon className="h-6 w-6 text-white" />
        ) : (
          <MicrophoneIcon className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Timer */}
      {isRecording && (
        <div className="flex items-center gap-2 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-mono text-gray-700 font-medium">
            {formatTime(recordingTime)}
          </span>
          <span className="text-xs text-gray-500">
            (máx 5:00)
          </span>
        </div>
      )}
    </div>
  );
};
