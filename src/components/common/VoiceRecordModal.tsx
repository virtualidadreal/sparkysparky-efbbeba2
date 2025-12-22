import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { PaperAirplaneIcon, XMarkIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRecordVoice } from '@/hooks/useRecordVoice';
import toast from 'react-hot-toast';

export interface VoiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordingComplete: (audioBlob: Blob) => void;
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export const VoiceRecordModal = ({
  isOpen,
  onClose,
  onRecordingComplete,
}: VoiceRecordModalProps) => {
  const {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
    permissionState,
  } = useRecordVoice();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastSampleAtRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0);
  const ampsRef = useRef<number[]>([]);
  const pausedAtRef = useRef<number>(0);
  const totalPausedRef = useRef<number>(0);

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const ui = useMemo(() => ({
    bg: 'hsl(var(--background))',
    fg: 'hsl(var(--foreground))',
    accent: 'hsl(var(--primary))',
    dim: 'hsl(var(--muted-foreground) / 0.35)',
  }), []);

  // Cleanup al desmontar o cerrar
  useEffect(() => {
    return () => stopVisualization(true);
  }, []);

  // Cleanup cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      stopVisualization(true);
      ampsRef.current = [];
      setElapsedMs(0);
      setIsPaused(false);
      pausedAtRef.current = 0;
      totalPausedRef.current = 0;
    }
  }, [isOpen]);

  function stopVisualization(silent = false) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    try {
      sourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      audioCtxRef.current?.close();
    } catch {}

    sourceRef.current = null;
    analyserRef.current = null;
    audioCtxRef.current = null;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  }

  async function startVisualization() {
    ampsRef.current = [];
    setElapsedMs(0);
    lastSampleAtRef.current = 0;
    pausedAtRef.current = 0;
    totalPausedRef.current = 0;
    setIsPaused(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;

      source.connect(analyser);

      startedAtRef.current = performance.now();
      loopDraw();
    } catch (err) {
      console.error('Error starting visualization:', err);
    }
  }

  function loopDraw() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    const w = Math.floor(cssW * dpr);
    const h = Math.floor(cssH * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const now = performance.now();
    const elapsed = now - startedAtRef.current - totalPausedRef.current;
    setElapsedMs(elapsed);

    // Time-domain data para RMS
    const buffer = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buffer);

    let sumSq = 0;
    for (let i = 0; i < buffer.length; i++) {
      const v = (buffer[i] - 128) / 128;
      sumSq += v * v;
    }
    const rms = Math.sqrt(sumSq / buffer.length);
    const amp = Math.min(1, Math.max(0, rms * 1.8));

    const sampleEveryMs = 60;
    if (elapsed - lastSampleAtRef.current >= sampleEveryMs) {
      lastSampleAtRef.current = elapsed;
      ampsRef.current.push(amp);
    }

    drawWaveform(ctx2d, w, h, ampsRef.current);

    rafRef.current = requestAnimationFrame(loopDraw);
  }

  function drawWaveform(
    g: CanvasRenderingContext2D,
    w: number,
    h: number,
    amps: number[]
  ) {
    // Obtener colores computados del CSS
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--background').trim();
    const fgColor = computedStyle.getPropertyValue('--foreground').trim();
    const primaryColor = computedStyle.getPropertyValue('--primary').trim();
    const mutedFgColor = computedStyle.getPropertyValue('--muted-foreground').trim();

    g.clearRect(0, 0, w, h);

    // Fondo
    g.fillStyle = `hsl(${bgColor})`;
    g.fillRect(0, 0, w, h);

    const centerY = h / 2;
    const paddingX = w * 0.06;
    const playheadX = w * 0.55;

    // Línea punteada a la derecha
    g.strokeStyle = `hsl(${mutedFgColor} / 0.35)`;
    g.lineWidth = Math.max(1, w * 0.002);
    g.setLineDash([Math.max(2, w * 0.006), Math.max(2, w * 0.006)]);
    g.beginPath();
    g.moveTo(playheadX + w * 0.02, centerY);
    g.lineTo(w - paddingX, centerY);
    g.stroke();
    g.setLineDash([]);

    // Barras de amplitud
    const barW = Math.max(2, Math.floor(w * 0.008));
    const gap = Math.max(2, Math.floor(w * 0.006));
    const step = barW + gap;

    const maxBars = Math.floor((playheadX - paddingX) / step);
    const visible = amps.slice(Math.max(0, amps.length - maxBars));
    const startX = playheadX - visible.length * step;

    g.strokeStyle = `hsl(${fgColor})`;
    g.lineWidth = barW;
    g.lineCap = 'round';

    for (let i = 0; i < visible.length; i++) {
      const a = visible[i];
      const barH = a * (h * 0.55);
      const x = startX + i * step;

      g.beginPath();
      g.moveTo(x, centerY - barH);
      g.lineTo(x, centerY + barH);
      g.stroke();
    }

    // Playhead con color primario
    g.strokeStyle = `hsl(${primaryColor})`;
    g.lineWidth = Math.max(2, w * 0.004);
    g.beginPath();
    g.moveTo(playheadX, centerY - h * 0.32);
    g.lineTo(playheadX, centerY + h * 0.32);
    g.stroke();

    // Punto arriba del playhead
    g.fillStyle = `hsl(${primaryColor})`;
    g.beginPath();
    g.arc(playheadX, centerY - h * 0.32, Math.max(4, w * 0.01), 0, Math.PI * 2);
    g.fill();
  }

  // Iniciar grabación cuando se abre el modal
  useEffect(() => {
    if (isOpen && !isRecording && permissionState !== 'denied') {
      const start = async () => {
        await startRecording();
        await startVisualization();
      };
      start();
    }
  }, [isOpen]);

  // Manejar errores
  useEffect(() => {
    if (error) {
      toast.error(error);
      onClose();
    }
  }, [error, onClose]);

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

  // Pausar/Reanudar
  const handlePauseResume = () => {
    if (isPaused) {
      // Reanudar
      const pausedDuration = performance.now() - pausedAtRef.current;
      totalPausedRef.current += pausedDuration;
      setIsPaused(false);
      loopDraw();
    } else {
      // Pausar
      pausedAtRef.current = performance.now();
      setIsPaused(true);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-md border-border/50 bg-background" hideCloseButton>
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Nueva grabación</h3>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Canvas visualizador */}
          <div className="w-full h-32 bg-muted/30 rounded-xl overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ display: 'block' }}
            />
          </div>

          {/* Timer y controles */}
          <div className="flex items-center justify-between w-full">
            <span className="text-3xl font-mono font-semibold text-foreground">
              {formatTime(elapsedMs)}
            </span>

            <div className="flex items-center gap-3">
              {/* Botón Pausar/Reanudar */}
              <Button
                variant="outline"
                size="lg"
                onClick={handlePauseResume}
                className="w-12 h-12 rounded-full p-0 border-border"
              >
                {isPaused ? (
                  <PlayIcon className="h-5 w-5" />
                ) : (
                  <PauseIcon className="h-5 w-5" />
                )}
              </Button>

              {/* Botón Enviar */}
              <Button
                size="lg"
                onClick={handleSend}
                className="w-14 h-14 rounded-full p-0 bg-primary hover:bg-primary/90"
                disabled={!isRecording || elapsedMs < 1000}
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </Button>

              {/* Botón Cancelar */}
              <Button
                variant="ghost"
                size="lg"
                onClick={handleCancel}
                className="w-10 h-10 rounded-full p-0 text-destructive hover:bg-destructive/10"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Indicador de grabación */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-sm text-muted-foreground">
              {isPaused ? 'En pausa' : 'Grabando...'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
