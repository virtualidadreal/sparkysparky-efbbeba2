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

      // Verificar soporte de MediaRecorder
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        setError('Tu navegador no soporta grabación de audio. Usa Chrome, Firefox o Safari actualizados.');
        return;
      }

      // Obtener stream (reutiliza el existente si está disponible)
      let stream: MediaStream | null = null;
      
      try {
        stream = await getStream();
      } catch (streamError: any) {
        console.error('Error getting stream:', streamError);
        if (streamError.name === 'NotAllowedError' || streamError.name === 'PermissionDeniedError') {
          setError('Permiso denegado para acceder al micrófono. Haz clic en el icono de candado 🔒 en la barra de direcciones.');
          return;
        }
        throw streamError;
      }
      
      if (!stream) {
        setError('No se pudo acceder al micrófono. Por favor permite el acceso.');
        return;
      }

      // Verificar que el stream tiene tracks activos
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        setError('No se detectó ningún micrófono activo.');
        return;
      }

      // Verificar que los tracks están vivos
      const hasLiveTracks = audioTracks.some(track => track.readyState === 'live');
      if (!hasLiveTracks) {
        // Intentar obtener un nuevo stream
        console.log('Stream tracks not live, requesting new stream...');
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100,
            }
          });
        } catch (retryError: any) {
          console.error('Retry stream error:', retryError);
          setError('Error al acceder al micrófono. Recarga la página e intenta de nuevo.');
          return;
        }
      }

      activeStreamRef.current = stream;

      // Determinar el mejor formato soportado
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          // Usar el formato por defecto del navegador
          mimeType = '';
        }
      }
      
      // Crear MediaRecorder con manejo de errores
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = mimeType 
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);
      } catch (recorderError: any) {
        console.error('MediaRecorder creation error:', recorderError);
        setError('Error al iniciar la grabación. Tu navegador puede no ser compatible.');
        return;
      }
      
      mediaRecorderRef.current = mediaRecorder;

      // Manejar errores del MediaRecorder
      mediaRecorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event.error);
        setError('Error durante la grabación. Por favor intenta de nuevo.');
        setIsRecording(false);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Guardar chunks de audio con límite de memoria
      const MAX_CHUNKS = 600; // ~10 minutos a 1 chunk/segundo - límite de seguridad
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          // Verificar límite de chunks para evitar memory issues
          if (audioChunksRef.current.length < MAX_CHUNKS) {
            audioChunksRef.current.push(event.data);
          } else {
            console.warn('Max audio chunks reached, stopping recording');
            stopRecording();
          }
        }
      };

      // Iniciar grabación
      try {
        mediaRecorder.start(1000); // Guardar chunks cada segundo
      } catch (startError: any) {
        console.error('MediaRecorder start error:', startError);
        setError('No se pudo iniciar la grabación. Verifica los permisos del micrófono.');
        return;
      }
      
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
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('El micrófono está siendo usado por otra aplicación. Ciérrala e intenta de nuevo.');
      } else if (err.name === 'OverconstrainedError') {
        setError('La configuración del micrófono no es compatible. Intenta con otro micrófono.');
      } else {
        setError('Error al iniciar la grabación. Por favor recarga la página e intenta de nuevo.');
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
