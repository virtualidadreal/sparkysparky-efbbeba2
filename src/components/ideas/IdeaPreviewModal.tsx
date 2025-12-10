import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/common/Badge';
import type { Idea } from '@/types/Idea.types';

interface IdeaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: Idea;
}

/**
 * Modal para previsualizar idea procesada por IA
 */
export const IdeaPreviewModal = ({ isOpen, onClose, idea }: IdeaPreviewModalProps) => {
  const sentimentColors = {
    positive: 'success',
    neutral: 'neutral',
    negative: 'error',
  } as const;

  const priorityColors = {
    low: 'neutral',
    medium: 'warning',
    high: 'error',
  } as const;

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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                <div className="relative p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <SparklesIcon className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold text-gray-900">
                          {idea.title || 'Idea capturada'}
                        </h2>
                      </div>
                      {idea.category && (
                        <Badge text={idea.category} variant="primary" />
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Cerrar"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Contenido */}
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Transcripción original */}
                    {idea.transcription && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Transcripción original
                        </h3>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                          {idea.transcription}
                        </p>
                      </div>
                    )}

                    {/* Resumen */}
                    {idea.summary && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Resumen
                        </h3>
                        <p className="text-gray-800">{idea.summary}</p>
                      </div>
                    )}

                    {/* Sentimiento y emociones */}
                    {(idea.sentiment || idea.detected_emotions.length > 0) && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Análisis emocional
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {idea.sentiment && (
                            <Badge 
                              text={
                                idea.sentiment === 'positive' ? '😊 Positivo' :
                                idea.sentiment === 'neutral' ? '😐 Neutral' :
                                '😔 Negativo'
                              }
                              variant={sentimentColors[idea.sentiment]}
                            />
                          )}
                          {idea.detected_emotions.map((emotion, idx) => (
                            <Badge key={idx} text={emotion} variant="neutral" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Etiquetas */}
                    {idea.tags.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Etiquetas
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {idea.tags.map((tag, idx) => (
                            <Badge key={idx} text={tag} variant="neutral" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Variantes mejoradas */}
                    {idea.suggested_improvements.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <LightBulbIcon className="h-5 w-5 text-warning" />
                          Variantes mejoradas
                        </h3>
                        <div className="space-y-3">
                          {idea.suggested_improvements.map((improvement) => (
                            <div
                              key={improvement.version}
                              className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded">
                                  V{improvement.version}
                                </span>
                              </div>
                              <p className="text-gray-800 mb-2">{improvement.content}</p>
                              {improvement.reasoning && (
                                <p className="text-sm text-gray-600 italic">
                                  → {improvement.reasoning}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Próximos pasos */}
                    {idea.next_steps.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Próximos pasos sugeridos
                        </h3>
                        <ul className="space-y-2">
                          {idea.next_steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                                {idx + 1}
                              </span>
                              <div className="flex-1">
                                <p className="text-gray-800">{step.step}</p>
                                {step.priority && (
                                  <Badge
                                    text={
                                      step.priority === 'low' ? 'Baja prioridad' :
                                      step.priority === 'medium' ? 'Prioridad media' :
                                      'Alta prioridad'
                                    }
                                    variant={priorityColors[step.priority]}
                                    className="mt-1"
                                  />
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Personas relacionadas */}
                    {idea.related_people.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Personas mencionadas
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {idea.related_people.map((person, idx) => (
                            <Badge key={idx} text={`👤 ${person}`} variant="primary" />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audio */}
                    {idea.audio_url && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Audio original
                        </h3>
                        <audio
                          controls
                          src={idea.audio_url}
                          className="w-full"
                        >
                          Tu navegador no soporta el elemento de audio.
                        </audio>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
