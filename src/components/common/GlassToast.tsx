import { useNavigate } from 'react-router-dom';
import { XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export interface GlassToastProps {
  message: string;
  type?: 'idea' | 'diary' | 'task' | 'person' | 'audio' | 'default';
  entityId?: string;
  onView?: () => void;
  toastId?: string;
}

/**
 * Toast con estilo glassmorphism elegante tipo cápsula
 */
export const GlassToast = ({
  message,
  type = 'default',
  entityId,
  onView,
  toastId,
}: GlassToastProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) {
      onView();
    } else if (entityId) {
      switch (type) {
        case 'idea':
          navigate(`/ideas?highlight=${entityId}`);
          break;
        case 'diary':
          navigate(`/diary?highlight=${entityId}`);
          break;
        case 'task':
          navigate(`/tasks?highlight=${entityId}`);
          break;
        case 'person':
          navigate(`/people?highlight=${entityId}`);
          break;
        default:
          break;
      }
    }
    if (toastId) {
      toast.dismiss(toastId);
    }
  };

  const handleDismiss = () => {
    if (toastId) {
      toast.dismiss(toastId);
    }
  };

  const showViewButton = type !== 'default' && type !== 'audio' && entityId;

  const getViewLabel = () => {
    switch (type) {
      case 'idea':
        return 'Ver idea';
      case 'diary':
        return 'Ver diario';
      case 'task':
        return 'Ver tarea';
      case 'person':
        return 'Ver contacto';
      default:
        return 'Ver';
    }
  };

  return (
    <div className="flex items-center gap-4 px-6 py-3 rounded-full border border-white/40 dark:border-white/15 bg-white/70 dark:bg-card/70 backdrop-blur-xl shadow-lg shadow-black/5">
      <span className="text-sm font-medium text-foreground whitespace-nowrap">{message}</span>
      
      <div className="flex items-center gap-2">
        {showViewButton && (
          <button
            onClick={handleView}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-primary hover:text-primary/80 rounded-full bg-primary/10 hover:bg-primary/15 transition-colors"
          >
            <EyeIcon className="h-3.5 w-3.5" />
            {getViewLabel()}
          </button>
        )}
        
        <button
          onClick={handleDismiss}
          className="p-1 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/**
 * Función helper para mostrar toast glassmorphism
 */
export const showGlassToast = (props: Omit<GlassToastProps, 'toastId'>) => {
  return toast.custom(
    (t) => <GlassToast {...props} toastId={t.id} />,
    { 
      duration: 4000,
      position: 'top-center',
    }
  );
};

/**
 * Funciones específicas para cada tipo
 */
export const glassToast = {
  idea: (message: string, entityId?: string) => 
    showGlassToast({ message, type: 'idea', entityId }),
  
  diary: (message: string, entityId?: string) => 
    showGlassToast({ message, type: 'diary', entityId }),
  
  task: (message: string, entityId?: string) => 
    showGlassToast({ message, type: 'task', entityId }),
  
  person: (message: string, entityId?: string) => 
    showGlassToast({ message, type: 'person', entityId }),
  
  audio: (message: string) => 
    showGlassToast({ message, type: 'audio' }),
  
  success: (message: string) => 
    showGlassToast({ message, type: 'default' }),
};
