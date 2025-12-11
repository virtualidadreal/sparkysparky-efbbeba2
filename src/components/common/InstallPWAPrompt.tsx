import { useState, useEffect } from 'react';
import { XMarkIcon, DevicePhoneMobileIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPWAPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if dismissed recently
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return; // Don't show for 7 days after dismissal
    }

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only show on mobile
      if (window.innerWidth <= 768) {
        setTimeout(() => setShowPrompt(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show custom prompt after delay
    if (iOS && !standalone && window.innerWidth <= 768) {
      setTimeout(() => setShowPrompt(true), 2000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
        onClick={handleDismiss}
      />
      
      {/* Prompt Card */}
      <div className={clsx(
        'relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl',
        'pointer-events-auto animate-in slide-in-from-bottom-8 duration-300',
        'mb-safe pb-safe'
      )}>
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
        >
          <XMarkIcon className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="p-6 text-center">
          {/* Icon */}
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <SparklesIcon className="h-8 w-8 text-primary-foreground" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2">
            Instala Sparky
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-6">
            Añade Sparky a tu pantalla de inicio para acceder más rápido y usar la app sin conexión
          </p>

          {isIOS ? (
            // iOS Instructions
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl text-left">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DevicePhoneMobileIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">1. Toca el botón Compartir</p>
                  <p className="text-muted-foreground text-xs">El icono de cuadrado con flecha arriba</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl text-left">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ArrowDownTrayIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">2. Añadir a pantalla de inicio</p>
                  <p className="text-muted-foreground text-xs">Desplázate y selecciona esta opción</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                Entendido
              </button>
            </div>
          ) : (
            // Android/Chrome Install Button
            <div className="space-y-3">
              <button
                onClick={handleInstall}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Instalar App
              </button>
              <button
                onClick={handleDismiss}
                className="w-full py-2 px-4 text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                Ahora no
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
