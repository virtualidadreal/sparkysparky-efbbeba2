import { Dialog } from '@headlessui/react';
import { XMarkIcon, PencilIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common';
import type { DiaryEntry } from '@/types/DiaryEntry.types';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DiaryEntryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: DiaryEntry | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

const moodLabels: Record<string, { label: string; emoji: string; className: string }> = {
  great: { label: 'Muy bien', emoji: '😄', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  good: { label: 'Bien', emoji: '🙂', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  neutral: { label: 'Neutral', emoji: '😐', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  bad: { label: 'Mal', emoji: '😔', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  terrible: { label: 'Muy mal', emoji: '😢', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

/**
 * Modal para ver todos los detalles de una entrada de diario
 */
export const DiaryEntryDetailModal = ({ 
  isOpen, 
  onClose, 
  entry,
  onEdit,
  onDelete 
}: DiaryEntryDetailModalProps) => {
  if (!entry) return null;

  const moodInfo = entry.mood ? moodLabels[entry.mood] : null;

  const handleEdit = () => {
    onClose();
    onEdit?.();
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta entrada?')) {
      onClose();
      onDelete?.();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-background rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
            <div className="flex-1 min-w-0 pr-4">
              <Dialog.Title className="text-xl font-bold text-foreground truncate">
                {entry.title || `Entrada del ${format(new Date(entry.entry_date), 'dd MMMM yyyy', { locale: es })}`}
              </Dialog.Title>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <ClockIcon className="h-4 w-4" />
                <span>
                  {format(new Date(entry.created_at), "dd 'de' MMMM 'a las' HH:mm", { locale: es })}
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span>
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: es })}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Mood */}
            {moodInfo && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Estado de ánimo</h4>
                <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${moodInfo.className}`}>
                  <span className="text-lg">{moodInfo.emoji}</span>
                  {moodInfo.label}
                </span>
              </div>
            )}

            {/* Summary */}
            {entry.summary && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Resumen</h4>
                <p className="text-foreground/80 italic bg-muted/50 p-3 rounded-lg">
                  {entry.summary}
                </p>
              </div>
            )}

            {/* Content */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Contenido completo</h4>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              </div>
            </div>

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Etiquetas</h4>
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, i) => (
                    <span 
                      key={`tag-${i}`} 
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related People */}
            {entry.related_people && entry.related_people.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Personas mencionadas</h4>
                <div className="flex flex-wrap gap-2">
                  {entry.related_people.map((person, i) => (
                    <span 
                      key={`person-${i}`} 
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      <span>👤</span>
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-muted/30">
            <div className="text-xs text-muted-foreground">
              Última actualización: {format(new Date(entry.updated_at), "d 'de' MMMM yyyy, HH:mm", { locale: es })}
            </div>
            <div className="flex gap-2">
              {onDelete && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<TrashIcon className="h-4 w-4" />}
                  onClick={handleDelete}
                  className="text-destructive hover:bg-destructive/10"
                >
                  Eliminar
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<PencilIcon className="h-4 w-4" />}
                  onClick={handleEdit}
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
