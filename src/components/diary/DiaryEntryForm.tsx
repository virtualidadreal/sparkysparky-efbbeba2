import { useState, FormEvent, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common';
import { useUpdateDiaryEntry } from '@/hooks/useDiaryEntries';
import type { DiaryEntry } from '@/types/DiaryEntry.types';

interface DiaryEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  entry: DiaryEntry | null | undefined;
}

/**
 * Componente DiaryEntryForm
 * 
 * Modal para editar entradas de diario
 */
export const DiaryEntryForm = ({ isOpen, onClose, entry }: DiaryEntryFormProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const updateEntry = useUpdateDiaryEntry();
  const isLoading = updateEntry.isPending;

  // Sincronizar estados cuando cambie la entrada
  useEffect(() => {
    if (entry) {
      setTitle(entry.title || '');
      setContent(entry.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [entry]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!entry || !content.trim()) return;

    try {
      await updateEntry.mutateAsync({
        id: entry.id,
        updates: {
          title: title.trim() || undefined,
          content: content.trim(),
        },
      });
      handleClose();
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle('');
      setContent('');
      onClose();
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Editar entrada
            </Dialog.Title>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Título (opcional) */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título (opcional)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dale un título a tu entrada..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Contenido */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenido <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="¿Qué sucedió? ¿Cómo te sientes?"
                rows={10}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!content.trim() || isLoading}
                loading={isLoading}
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
