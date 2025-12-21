import { Plus } from 'lucide-react';
import { QuickCapturePopup } from '@/components/dashboard/QuickCapturePopup';

/**
 * Botón flotante de captura rápida para escritorio
 * Se muestra centrado en la parte inferior de la pantalla
 */
export const FloatingCaptureButton = () => {
  return (
    <div className="hidden lg:block fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <QuickCapturePopup
        trigger={
          <button className="flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 hover:shadow-xl">
            <Plus className="h-7 w-7" />
          </button>
        }
      />
    </div>
  );
};
