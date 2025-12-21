import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Disclosure } from '@headlessui/react';
import { 
  XMarkIcon, 
  SparklesIcon, 
  LightBulbIcon, 
  FolderIcon, 
  LinkIcon, 
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
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
import { useProjects } from '@/hooks/useProjects';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface IdeaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: Idea;
}

/**
 * Modal para previsualizar idea procesada por IA - Rediseñado
 */
export const IdeaPreviewModal = ({ isOpen, onClose, idea }: IdeaPreviewModalProps) => {
  const { data: relatedIdeas } = useRelatedIdeas(idea.id, idea.tags || []);
  const { data: linkedProject } = useIdeaProject(idea.project_id);
  const { data: allProjects } = useProjects();
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userContext, setUserContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(idea.project_id);
  const queryClient = useQueryClient();

  // Generate signed URL for audio on demand
  useEffect(() => {
    const generateSignedUrl = async () => {
      if (idea.audio_url && isOpen) {
        if (idea.audio_url.startsWith('http')) {
          setSignedAudioUrl(idea.audio_url);
        } else {
          const { data, error } = await supabase.storage
            .from('audio-recordings')
            .createSignedUrl(idea.audio_url, 3600);
          
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

  // Update project when dropdown changes
  const handleProjectChange = async (projectId: string | null) => {
    setSelectedProjectId(projectId);
    
    const { error } = await supabase
      .from('ideas')
      .update({ project_id: projectId })
      .eq('id', idea.id);
    
    if (error) {
      toast.error('Error al cambiar proyecto');
      setSelectedProjectId(idea.project_id);
    } else {
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      toast.success(projectId ? 'Proyecto asignado' : 'Movida a Ideas sueltas');
    }
  };

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

  const formattedDate = formatDistanceToNow(new Date(idea.created_at), { 
    addSuffix: true, 
    locale: es 
  });

  const fullDate = new Date(idea.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card border border-border shadow-2xl transition-all">
                  {/* Header con botón volver */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <button
                      onClick={onClose}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronRightIcon className="h-4 w-4 rotate-180" />
                      Volver
                    </button>
                    <div className="flex items-center gap-2">
                      {idea.status !== 'converted' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIsConvertModalOpen(true)}
                          className="gap-1.5"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Crear tarea
                        </Button>
                      )}
                      <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        aria-label="Cerrar"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Contenido principal */}
                  <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">
                    {/* Título */}
                    <h1 className="text-2xl font-bold text-foreground mb-4">
                      {idea.title}
                    </h1>

                    {/* Summary */}
                    {idea.summary && (
                      <p className="text-foreground/90 leading-relaxed mb-6">
                        {idea.summary}
                      </p>
                    )}

                    {/* Sparky Take - Destacado */}
                    {idea.sparky_take && (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <LightBulbIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-primary mb-1">Sparky</p>
                            <p className="text-foreground/80 italic">
                              {idea.sparky_take}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Ideas relacionadas */}
                    {relatedIdeas && relatedIdeas.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          Ideas relacionadas
                        </h3>
                        <div className="space-y-2">
                          {relatedIdeas.slice(0, 3).map((related) => (
                            <div
                              key={related.id}
                              className="px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                            >
                              {related.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Transcripción colapsable */}
                    {idea.transcription && (
                      <Disclosure>
                        {({ open }) => (
                          <div className="mb-6">
                            <Disclosure.Button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 border border-border rounded-lg transition-colors">
                              <ChevronDownIcon 
                                className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
                              />
                              {open ? 'Ocultar transcripción' : 'Ver transcripción original'}
                            </Disclosure.Button>
                            <Disclosure.Panel className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="text-sm text-muted-foreground bg-muted/50 border border-border p-4 rounded-lg leading-relaxed">
                                {idea.transcription}
                              </div>
                            </Disclosure.Panel>
                          </div>
                        )}
                      </Disclosure>
                    )}

                    {/* Audio player si existe */}
                    {signedAudioUrl && (
                      <div className="mb-6">
                        <audio controls className="w-full" src={signedAudioUrl}>
                          Tu navegador no soporta audio.
                        </audio>
                      </div>
                    )}

                    {/* Generar mejoras con Sparky */}
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
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
                            placeholder="Ej: Quiero enfocar esta idea hacia el mercado B2B..."
                            className="w-full h-20 px-3 py-2 text-sm rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                                  Generar
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
                            Sparky analizará tu idea para sugerir mejoras.
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
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <LightBulbIcon className="h-4 w-4 text-warning" />
                          Variantes mejoradas
                        </h3>
                        <div className="space-y-3">
                          {idea.suggested_improvements.map((improvement) => (
                            <div
                              key={improvement.version}
                              className="bg-warning/5 border border-warning/20 p-4 rounded-lg"
                            >
                              <span className="text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded mb-2 inline-block">
                                V{improvement.version}
                              </span>
                              <p className="text-foreground text-sm">{improvement.content}</p>
                              {improvement.reasoning && (
                                <p className="text-xs text-muted-foreground mt-2 italic">
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
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3">
                          Próximos pasos
                        </h3>
                        <ul className="space-y-2">
                          {idea.next_steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm">
                              <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                                {idx + 1}
                              </span>
                              <span className="text-foreground">{step.step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Etiquetas */}
                    {idea.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {idea.tags.map((tag, idx) => (
                          <Badge key={idx} text={`#${tag}`} variant="neutral" />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer con proyecto y fecha */}
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={selectedProjectId || ''}
                        onChange={(e) => handleProjectChange(e.target.value || null)}
                        className="text-sm bg-transparent border-none text-foreground focus:outline-none focus:ring-0 cursor-pointer"
                      >
                        <option value="">Ideas sueltas</option>
                        {allProjects?.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-sm text-muted-foreground" title={fullDate}>
                      {fullDate}
                    </span>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ConvertToTaskModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        idea={idea}
      />
    </>
  );
};
