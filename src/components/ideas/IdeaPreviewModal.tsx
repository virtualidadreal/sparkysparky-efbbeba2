import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, SparklesIcon, LightBulbIcon, FolderIcon, LinkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import type { Idea } from '@/types/Idea.types';
import { useRelatedIdeas, useIdeaProject } from '@/hooks/useRelatedIdeas';
import { ConvertToTaskModal } from './ConvertToTaskModal';
import { ConnectionsPanel } from './ConnectionsPanel';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface IdeaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: Idea;
}

/**
 * Modal para previsualizar idea procesada por IA
 */
export const IdeaPreviewModal = ({ isOpen, onClose, idea }: IdeaPreviewModalProps) => {
  const { data: relatedIdeas } = useRelatedIdeas(idea.id, idea.tags || []);
  const { data: linkedProject } = useIdeaProject(idea.project_id);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userContext, setUserContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const queryClient = useQueryClient();

  // Generate signed URL for audio on demand
  useEffect(() => {
    const generateSignedUrl = async () => {
      if (idea.audio_url && isOpen) {
        // Check if it's already a full URL (legacy data) or a file path
        if (idea.audio_url.startsWith('http')) {
          // Legacy public URL - use as is (will fail if bucket is now private)
          setSignedAudioUrl(idea.audio_url);
        } else {
          // New file path format - generate signed URL
          const { data, error } = await supabase.storage
            .from('audio-recordings')
            .createSignedUrl(idea.audio_url, 3600); // 1 hour expiry
          
          if (data && !error) {
            setSignedAudioUrl(data.signedUrl);
          } else {
            console.error('Error generating signed URL:', error);
            setSignedAudioUrl(null);
          }
        }
      } else {
        setSignedAudioUrl(null);
      }
    };

    generateSignedUrl();
  }, [idea.audio_url, isOpen]);

  const handleGenerateImprovements = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Debes iniciar sesión');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/improve-idea`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            ideaId: idea.id,
            userContext: userContext || undefined,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar mejoras');
      }

      const result = await response.json();
      
      toast.success(`Generadas ${result.improvements?.length || 0} sugerencias de mejora`);
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      setUserContext('');
      setShowContextInput(false);
      onClose();
    } catch (error) {
      console.error('Error generating improvements:', error);
      toast.error(error instanceof Error ? error.message : 'Error al generar mejoras');
    } finally {
      setIsGenerating(false);
    }
  };

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
    <>
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
            <div className="fixed inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-2xl" />
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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white/70 dark:bg-card/70 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-2xl transition-all">
                  <div className="relative p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6 pb-4 border-b border-border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <SparklesIcon className="h-6 w-6 text-primary" />
                          <h2 className="text-2xl font-bold text-foreground">
                            {idea.title || 'Idea capturada'}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {idea.category && (
                            <Badge text={idea.category} variant="primary" />
                          )}
                          {linkedProject && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                              <FolderIcon className="h-3 w-3" />
                              {linkedProject.title}
                            </span>
                          )}
                          {idea.status === 'converted' && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-success/20 text-success">
                              <CheckCircleIcon className="h-3 w-3" />
                              Convertida a tarea
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            Creada el {new Date(idea.created_at).toLocaleDateString('es-ES', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {idea.status !== 'converted' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsConvertModalOpen(true)}
                            className="gap-2"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            Crear tarea
                          </Button>
                        )}
                        <button
                          onClick={onClose}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Cerrar"
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* Contenido */}
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                      {/* Transcripción original */}
                      {idea.transcription && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">
                            Transcripción original
                          </h3>
                          <p className="text-muted-foreground bg-muted p-4 rounded-lg">
                            {idea.transcription}
                          </p>
                        </div>
                      )}

                      {/* Resumen */}
                      {idea.summary && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">
                            Resumen
                          </h3>
                          <p className="text-foreground">{idea.summary}</p>
                        </div>
                      )}

                      {/* Sentimiento y emociones */}
                      {(idea.sentiment || idea.detected_emotions.length > 0) && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">
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
                          <h3 className="text-sm font-semibold text-foreground mb-2">
                            Etiquetas
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {idea.tags.map((tag, idx) => (
                              <Badge key={idx} text={`#${tag}`} variant="neutral" />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conexiones Inteligentes con IA */}
                      <ConnectionsPanel 
                        itemId={idea.id} 
                        itemType="idea" 
                      />

                      {/* Ideas relacionadas por tags */}
                      {relatedIdeas && relatedIdeas.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-primary" />
                            Ideas con tags similares
                          </h3>
                          <div className="space-y-2">
                            {relatedIdeas.map((related) => (
                              <div
                                key={related.id}
                                className="p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors"
                              >
                                <p className="font-medium text-foreground text-sm">
                                  {related.title}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {related.tags.slice(0, 3).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Generar mejoras con Sparky */}
                      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <SparklesIcon className="h-5 w-5 text-primary" />
                          <h3 className="text-sm font-semibold text-foreground">
                            Sugerencias de Sparky
                          </h3>
                        </div>
                        
                        {showContextInput ? (
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">
                              Cuéntale a Sparky más sobre tu idea para obtener mejores sugerencias:
                            </p>
                            <textarea
                              value={userContext}
                              onChange={(e) => setUserContext(e.target.value)}
                              placeholder="Ej: Quiero enfocar esta idea hacia el mercado B2B, me interesa especialmente la parte de automatización..."
                              className="w-full h-24 px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={handleGenerateImprovements}
                                disabled={isGenerating}
                                className="gap-2"
                              >
                                {isGenerating ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generando...
                                  </>
                                ) : (
                                  <>
                                    <SparklesIcon className="h-4 w-4" />
                                    Generar mejoras
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowContextInput(false);
                                  setUserContext('');
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              Sparky analizará tu idea junto con tus otros proyectos e ideas para sugerir mejoras.
                            </p>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setShowContextInput(true)}
                              className="gap-2 ml-4"
                            >
                              <SparklesIcon className="h-4 w-4" />
                              Pedir sugerencias
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Variantes mejoradas */}
                      {idea.suggested_improvements.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <LightBulbIcon className="h-5 w-5 text-warning" />
                            Variantes mejoradas ({idea.suggested_improvements.length})
                          </h3>
                          <div className="space-y-3">
                            {idea.suggested_improvements.map((improvement) => (
                              <div
                                key={improvement.version}
                                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 bg-yellow-200 dark:bg-yellow-900 px-2 py-0.5 rounded">
                                    V{improvement.version}
                                  </span>
                                </div>
                                <p className="text-foreground mb-2">{improvement.content}</p>
                                {improvement.reasoning && (
                                  <p className="text-sm text-muted-foreground italic">
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
                          <h3 className="text-sm font-semibold text-foreground mb-3">
                            Próximos pasos sugeridos
                          </h3>
                          <ul className="space-y-2">
                            {idea.next_steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-foreground">{step.step}</p>
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
                          <h3 className="text-sm font-semibold text-foreground mb-2">
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
                      {idea.audio_url && signedAudioUrl && (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground mb-2">
                            Audio original
                          </h3>
                          <audio
                            controls
                            src={signedAudioUrl}
                            className="w-full"
                          >
                            Tu navegador no soporta el elemento de audio.
                          </audio>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-border flex justify-end gap-3">
                      {idea.status !== 'converted' && (
                        <Button
                          variant="secondary"
                          onClick={() => setIsConvertModalOpen(true)}
                        >
                          Convertir a tarea
                        </Button>
                      )}
                      <Button
                        onClick={onClose}
                        variant="primary"
                      >
                        Cerrar
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal para convertir a tarea */}
      <ConvertToTaskModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        idea={idea}
      />
    </>
  );
};
