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
  // Inicializar con el valor guardado en localStorage si existe
  const getInitialState = (): PermissionState => {
    const saved = localStorage.getItem('sparky_mic_permission');
    if (saved === 'granted') return 'granted';
    if (saved === 'denied') return 'denied';
    return 'prompt';
  };

  const [permissionState, setPermissionState] = useState<PermissionState>(getInitialState);
  const [isPersistent, setIsPersistent] = useState(getInitialState() === 'granted');
  const streamRef = useRef<MediaStream | null>(null);
  const permissionStatusRef = useRef<PermissionStatus | null>(null);

  // Verificar estado del permiso al montar usando Permissions API (sin solicitar)
  useEffect(() => {
    let isMounted = true;
    let localStatus: PermissionStatus | null = null;
    
    const checkPermission = async () => {
      try {
        // Usar Permissions API si está disponible (esto NO solicita permiso, solo consulta)
        if ('permissions' in navigator) {
          const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          if (!isMounted) return;
          
          localStatus = status;
          permissionStatusRef.current = status;
          
          // Actualizar estado basado en la API del navegador
          const browserState = status.state as PermissionState;
          setPermissionState(browserState);
          setIsPersistent(browserState === 'granted');
          
          // Sincronizar localStorage con el estado real del navegador
          if (browserState === 'granted') {
            localStorage.setItem('sparky_mic_permission', 'granted');
          } else if (browserState === 'denied') {
            localStorage.setItem('sparky_mic_permission', 'denied');
          }

          // Handler para cambios en el permiso
          const handleChange = () => {
            if (!isMounted) return;
            
            const newState = status.state as PermissionState;
            setPermissionState(newState);
            setIsPersistent(newState === 'granted');
            
            // Sincronizar localStorage
            if (newState === 'granted') {
              localStorage.setItem('sparky_mic_permission', 'granted');
            } else if (newState === 'denied') {
              localStorage.setItem('sparky_mic_permission', 'denied');
            } else {
              localStorage.removeItem('sparky_mic_permission');
            }
            
            // Si el permiso fue revocado, limpiar el stream
            if (newState === 'denied' && streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
          };
          
          status.addEventListener('change', handleChange);
          
          // Guardar referencia para cleanup
          (status as any)._handleChange = handleChange;
        }
        // Si Permissions API no está disponible, mantenemos el estado de localStorage
      } catch (error) {
        console.log('Permissions API not fully supported, using localStorage fallback');
        // Mantener el estado inicial de localStorage
      }
    };

    checkPermission();

    // Cleanup al desmontar
    return () => {
      isMounted = false;
      if (localStatus) {
        const handler = (localStatus as any)._handleChange;
        if (handler) {
          localStatus.removeEventListener('change', handler);
        }
      }
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
      const hasActiveTracks = tracks.some(track => track.readyState === 'live' && track.enabled);
      
      if (hasActiveTracks) {
        return streamRef.current;
      } else {
        // Limpiar stream muerto
        tracks.forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    // Verificar soporte del navegador
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia not supported');
      setPermissionState('denied');
      return null;
    }

    // Crear nuevo stream con retry
    const maxRetries = 2;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
          }
        });

        // Verificar que el stream tiene tracks activos
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
          stream.getTracks().forEach(t => t.stop());
          throw new Error('No audio tracks available');
        }

        streamRef.current = stream;
        setPermissionState('granted');
        setIsPersistent(true);
        localStorage.setItem('sparky_mic_permission', 'granted');

        return stream;
      } catch (error: any) {
        console.error(`Audio stream attempt ${attempt + 1} failed:`, error);
        lastError = error;
        
        // No reintentar si es un error de permisos
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionState('denied');
          localStorage.setItem('sparky_mic_permission', 'denied');
          return null;
        }
        
        // Esperar antes de reintentar
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    console.error('All audio stream attempts failed:', lastError);
    return null;
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
