import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  SunIcon,
  BoltIcon,
  XMarkIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MorningSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayPlan: any;
  mitTasks: any[];
  onEnergySelected: (energyLevel: number) => void;
  isAdjusting?: boolean;
}

/**
 * Modal de Resumen Matutino
 * 
 * Implementa F-009: Rutina Matutina de Ajuste
 * - Muestra resumen del plan del día
 * - Pregunta nivel de energía con escala 1-5
 * - Explica cómo se ajustará el plan según energía
 * - Permite confirmar o editar antes de activar
 */
export const MorningSummaryModal = ({
  isOpen,
  onClose,
  todayPlan,
  mitTasks,
  onEnergySelected,
  isAdjusting = false,
}: MorningSummaryModalProps) => {
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const energyLevels = [
    { level: 1, emoji: '😴', label: 'Muy baja', description: 'Necesito un día ligero' },
    { level: 2, emoji: '😐', label: 'Baja', description: 'Empiezo despacio' },
    { level: 3, emoji: '😊', label: 'Normal', description: 'Día estándar' },
    { level: 4, emoji: '😄', label: 'Alta', description: '¡Con ganas!' },
    { level: 5, emoji: '🚀', label: 'Máxima', description: '¡A conquistar el mundo!' },
  ];

  const handleEnergyClick = (level: number) => {
    setSelectedEnergy(level);
    setShowExplanation(true);
  };

  const handleConfirm = () => {
    if (selectedEnergy) {
      onEnergySelected(selectedEnergy);
    }
  };

  /**
   * Renderizar explicación de ajuste según energía
   */
  const renderAdjustmentExplanation = () => {
    if (!selectedEnergy || selectedEnergy > 2) return null;

    return (
      <Card className="p-4 bg-warning/10 border-warning/20 mb-6">
        <h4 className="font-semibold text-warning mb-2 flex items-center gap-2">
          <BoltIcon className="h-5 w-5" />
          Ajustes sugeridos por baja energía:
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-warning mt-0.5">•</span>
            <span>Tareas complejas se moverán a otro día (si es posible)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-warning mt-0.5">•</span>
            <span>Priorizaremos tareas ligeras y rápidas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-warning mt-0.5">•</span>
            <span>Bloques de trabajo profundo serán más cortos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-warning mt-0.5">•</span>
            <span>Se añadirán más pausas entre actividades</span>
          </li>
        </ul>
      </Card>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-background border border-border p-8 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-warning/20 to-primary/20">
                      <SunIcon className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-2xl font-bold text-foreground"
                      >
                        🌅 Buenos días
                      </Dialog.Title>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date().toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Daily Goal */}
                {todayPlan?.notes && (
                  <Card className="p-4 mb-6 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <h4 className="font-semibold mb-1 text-sm text-muted-foreground">
                      🎯 Objetivo del día
                    </h4>
                    <p className="text-foreground">
                      {todayPlan.notes.split('\n')[0]}
                    </p>
                  </Card>
                )}

                {/* MITs Preview */}
                {mitTasks && mitTasks.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
                      ⭐ Tus MITs de hoy:
                    </h4>
                    <div className="space-y-2">
                      {mitTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                        >
                          <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium flex-1">{task.title}</span>
                          {task.urgency_score && (
                            <Badge variant="outline" className="text-xs">
                              Urgencia: {task.urgency_score}/10
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Energy Question */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-4 text-center flex items-center justify-center gap-2">
                    <BoltIcon className="h-5 w-5 text-warning" />
                    ¿Cómo está tu nivel de energía hoy?
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {energyLevels.map(({ level, emoji, label, description }) => (
                      <button
                        key={level}
                        onClick={() => handleEnergyClick(level)}
                        className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                          selectedEnergy === level
                            ? 'border-primary bg-primary/10 shadow-lg'
                            : 'border-border bg-background hover:border-primary/50'
                        }`}
                      >
                        <div className="text-4xl mb-2">{emoji}</div>
                        <div className="text-xs font-semibold mb-1">{label}</div>
                        <div className="text-xs text-muted-foreground">
                          {description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Adjustment Explanation */}
                {showExplanation && renderAdjustmentExplanation()}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1"
                  >
                    Revisar plan después
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={!selectedEnergy || isAdjusting}
                    className="flex-1 gap-2"
                  >
                    {isAdjusting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Ajustando plan...
                      </>
                    ) : (
                      <>
                        Ajustar plan y continuar
                        <ArrowRightIcon className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Morning Routine Suggestion */}
                {todayPlan?.notes?.includes('Sugerencia matutina:') && (
                  <Card className="mt-6 p-4 bg-secondary/5 border-secondary/20">
                    <h4 className="font-semibold text-sm mb-2 text-secondary-foreground">
                      ☀️ Sugerencia para empezar bien el día:
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {todayPlan.notes.split('Sugerencia matutina: ')[1]}
                    </p>
                  </Card>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};