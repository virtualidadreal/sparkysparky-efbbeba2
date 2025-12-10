import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/common';
import { useConvertIdeaToTask } from '@/hooks/useConvertIdeaToTask';
import type { Idea } from '@/types/Idea.types';

interface ConvertToTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: Idea;
}

/**
 * Modal para convertir una idea en tarea con opciones de prioridad y fecha
 */
export const ConvertToTaskModal = ({ isOpen, onClose, idea }: ConvertToTaskModalProps) => {
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const convertToTask = useConvertIdeaToTask();

  const handleConvert = async () => {
    await convertToTask.mutateAsync({
      idea,
      priority,
      dueDate: dueDate || undefined,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-card border border-border shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircleIcon className="h-5 w-5 text-primary" />
                    </div>
                    <Dialog.Title className="text-lg font-semibold text-foreground">
                      Convertir a tarea
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Preview */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-1">
                      {idea.title || 'Idea sin título'}
                    </h4>
                    {idea.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {idea.summary}
                      </p>
                    )}
                    {idea.next_steps && idea.next_steps.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {idea.next_steps.length} próximos pasos se incluirán
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Prioridad
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'low', label: 'Baja', color: 'bg-muted' },
                        { value: 'medium', label: 'Media', color: 'bg-warning/20' },
                        { value: 'high', label: 'Alta', color: 'bg-destructive/20' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setPriority(opt.value)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            priority === opt.value
                              ? `${opt.color} ring-2 ring-primary`
                              : 'bg-muted/50 hover:bg-muted'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Fecha límite (opcional)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-border">
                  <Button
                    type="button"
                    onClick={onClose}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConvert}
                    variant="primary"
                    loading={convertToTask.isPending}
                    className="flex-1 gap-2"
                  >
                    Crear tarea
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
