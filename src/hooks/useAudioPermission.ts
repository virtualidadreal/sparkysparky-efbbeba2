import { useState, useEffect, useCallback, useRef } from 'react';

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'checking';

interface UseAudioPermission {
  permissionState: PermissionState;
  hasPermission: boolean;
  isPersistent: boolean;
  requestPermission: () => Promise<boolean>;
  revokePermission: () => void;
  getStream: () => Promise<MediaStream | null>;
}

/**
 * Hook para gestionar permisos de audio de forma persistente
 * 
 * - Verifica el estado del permiso usando la Permissions API
 * - Mantiene el stream activo para evitar solicitudes repetidas
 * - Permite revocar el permiso manualmente
 */
export const useAudioPermission = (): UseAudioPermission => {
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [isPersistent, setIsPersistent] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const permissionStatusRef = useRef<PermissionStatus | null>(null);

  // Verificar estado del permiso al montar
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Usar Permissions API si está disponible
        if ('permissions' in navigator) {
          const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          permissionStatusRef.current = status;
          setPermissionState(status.state as PermissionState);
          setIsPersistent(status.state === 'granted');

          // Escuchar cambios en el permiso
          status.onchange = () => {
            setPermissionState(status.state as PermissionState);
            setIsPersistent(status.state === 'granted');
            
            // Si el permiso fue revocado, limpiar el stream
            if (status.state === 'denied' && streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
          };
        } else {
          // Fallback: intentar acceder al micrófono para verificar
          setPermissionState('prompt');
        }
      } catch (error) {
        console.log('Permissions API not fully supported, using fallback');
        setPermissionState('prompt');
      }
    };

    checkPermission();

    // Cleanup al desmontar
    return () => {
      if (permissionStatusRef.current) {
        permissionStatusRef.current.onchange = null;
      }
    };
  }, []);

  /**
   * Solicitar permiso de micrófono
   * Si ya está concedido, reutiliza el stream existente
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Si ya tenemos un stream activo, verificar que sigue funcionando
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        const hasActiveTracks = tracks.some(track => track.readyState === 'live');
        
        if (hasActiveTracks) {
          setPermissionState('granted');
          setIsPersistent(true);
          return true;
        }
      }

      // Solicitar acceso al micrófono
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;
      setPermissionState('granted');
      setIsPersistent(true);

      // Guardar en localStorage que el usuario ha concedido permiso
      localStorage.setItem('sparky_mic_permission', 'granted');

      return true;
    } catch (error: any) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        localStorage.setItem('sparky_mic_permission', 'denied');
      } else {
        setPermissionState('prompt');
      }
      return false;
    }
  }, []);

  /**
   * Revocar permiso (detener stream)
   */
  const revokePermission = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsPersistent(false);
    localStorage.removeItem('sparky_mic_permission');
  }, []);

  /**
   * Obtener el stream de audio
   * Reutiliza el existente o crea uno nuevo
   */
  const getStream = useCallback(async (): Promise<MediaStream | null> => {
    // Verificar si el stream actual sigue activo
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      const hasActiveTracks = tracks.some(track => track.readyState === 'live');
      
      if (hasActiveTracks) {
        return streamRef.current;
      }
    }

    // Crear nuevo stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;
      setPermissionState('granted');
      setIsPersistent(true);

      return stream;
    } catch (error) {
      console.error('Error getting audio stream:', error);
      return null;
    }
  }, []);

  return {
    permissionState,
    hasPermission: permissionState === 'granted',
    isPersistent,
    requestPermission,
    revokePermission,
    getStream,
  };
};
