import { useState, useEffect } from 'react';
import { MicrophoneIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRecordVoice } from '@/hooks/useRecordVoice';
import { VoiceRecordModal } from './VoiceRecordModal';
import toast from 'react-hot-toast';
import clsx from 'clsx';

/**
 * Props del componente VoiceRecordButton
 */
export interface VoiceRecordButtonProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  showPermissionStatus?: boolean;
}

/**
 * Componente VoiceRecordButton
 * 
 * Botón para grabar audio que abre un modal con visualizador
 */
export const VoiceRecordButton = ({ 
  onRecordingComplete, 
  onError,
  disabled = false,
  showPermissionStatus = false,
}: VoiceRecordButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    error,
    permissionState,
    hasPermission,
    requestPermission,
  } = useRecordVoice();

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
      onError?.(error);
    }
  }, [error, onError]);

  // Handler para click del botón
  const handleClick = async () => {
    if (permissionState === 'denied') {
      toast.error('El acceso al micrófono está bloqueado. Haz clic en el icono de candado en la barra de direcciones para permitirlo.');
      return;
    }
    
    // Abrir modal de grabación
    setIsModalOpen(true);
  };

  // Solicitar permiso al primer uso
  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('¡Permiso concedido! Ya puedes grabar audio.');
    } else {
      toast.error('Permiso denegado. Puedes cambiarlo en la configuración del navegador.');
    }
  };

  // Handler cuando se completa la grabación
  const handleRecordingComplete = (audioBlob: Blob) => {
    onRecordingComplete(audioBlob);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Botón de permiso si está en estado 'prompt' y showPermissionStatus */}
        {showPermissionStatus && permissionState === 'prompt' && (
          <button
            type="button"
            onClick={handleRequestPermission}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors dark:bg-amber-900/30 dark:text-amber-400"
          >
            <ExclamationTriangleIcon className="h-4 w-4" />
            Permitir micrófono
          </button>
        )}

        {/* Indicador de permiso concedido */}
        {showPermissionStatus && hasPermission && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <CheckCircleIcon className="h-4 w-4" />
            <span>Micrófono listo</span>
          </div>
        )}

        {/* Botón principal */}
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || permissionState === 'checking'}
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
          
          {/* Indicador de estado del micrófono */}
          {hasPermission && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
          )}
        </button>

        {/* Mensaje de error si el permiso está denegado */}
        {permissionState === 'denied' && (
          <div className="text-xs text-red-500 dark:text-red-400 max-w-[200px]">
            Micrófono bloqueado. Haz clic en el candado 🔒 de la barra de direcciones.
          </div>
        )}
      </div>

      {/* Modal de grabación */}
      <VoiceRecordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRecordingComplete={handleRecordingComplete}
      />
    </>
  );
};
