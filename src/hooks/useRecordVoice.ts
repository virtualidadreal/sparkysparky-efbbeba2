import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioPermission } from './useAudioPermission';

/**
 * Interfaz del hook useRecordVoice
 */
export interface UseRecordVoice {
  isRecording: boolean;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  error: string | null;
  // Nuevas propiedades para gestión de permisos
  permissionState: 'prompt' | 'granted' | 'denied' | 'checking';
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

/**
 * Hook useRecordVoice
 * 
 * Maneja la grabación de audio usando Web Audio API:
 * - Duración máxima: 5 minutos (300 segundos)
 * - Formato: audio/webm
 * - Gestión persistente de permisos de micrófono
 * - Reutilización del stream para evitar solicitudes repetidas
 */
export const useRecordVoice = (): UseRecordVoice => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { 
    permissionState, 
    hasPermission, 
    requestPermission, 
    getStream 
  } = useAudioPermission();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  const MAX_DURATION = 300; // 5 minutos en segundos

  // Limpiar timer al desmontar (pero NO el stream global)
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Solo detenemos el MediaRecorder, no el stream global
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  /**
   * Iniciar grabación de audio
   */
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      setRecordingTime(0);

      // Obtener stream (reutiliza el existente si está disponible)
      const stream = await getStream();
      
      if (!stream) {
        setError('No se pudo acceder al micrófono. Por favor permite el acceso.');
        return;
      }

      activeStreamRef.current = stream;

      // Crear MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Guardar chunks de audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Iniciar grabación
      mediaRecorder.start(1000); // Guardar chunks cada segundo
      setIsRecording(true);

      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          
          // Detener automáticamente al alcanzar duración máxima
          if (newTime >= MAX_DURATION) {
            stopRecording();
          }
          
          return newTime;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Error al iniciar grabación:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permiso denegado para acceder al micrófono. Por favor permite el acceso en la configuración de tu navegador.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No se encontró ningún micrófono. Por favor conecta un micrófono.');
      } else {
        setError('Error al iniciar la grabación. Por favor intenta de nuevo.');
      }
    }
  }, [getStream]);

  /**
   * Detener grabación y retornar Blob de audio
   * NOTA: No detenemos el stream para poder reutilizarlo
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        
        // Limpiar timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // NO detenemos el stream aquí para poder reutilizarlo
        // El stream se mantiene activo para evitar nuevas solicitudes de permiso

        setIsRecording(false);
        audioChunksRef.current = [];
        
        resolve(audioBlob);
      };

      mediaRecorder.stop();
    });
  }, []);

  /**
   * Cancelar grabación sin guardar
   */
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // NO detenemos el stream aquí tampoco

    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  }, []);

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
    permissionState,
    hasPermission,
    requestPermission,
  };
};
