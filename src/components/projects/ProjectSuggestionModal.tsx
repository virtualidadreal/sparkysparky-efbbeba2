import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { FolderPlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ProjectSuggestion {
  id: string;
  topic: string;
  ideaCount: number;
  suggestionCount: number;
  canDismissForever: boolean;
}

interface ProjectSuggestionModalProps {
  suggestion: ProjectSuggestion | null;
  onClose: () => void;
}

export const ProjectSuggestionModal = ({ suggestion, onClose }: ProjectSuggestionModalProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const queryClient = useQueryClient();

  if (!suggestion) return null;

  const handleCreateProject = async () => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // Create the project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: `Proyecto: ${suggestion.topic.charAt(0).toUpperCase() + suggestion.topic.slice(1)}`,
          description: `Proyecto creado automáticamente a partir de ${suggestion.ideaCount} ideas relacionadas con "${suggestion.topic}"`,
          status: 'active',
          tags: [suggestion.topic],
          keywords: [suggestion.topic],
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Get the suggestion to find idea IDs
      const { data: suggestionData } = await supabase
        .from('project_suggestions')
        .select('idea_ids')
        .eq('id', suggestion.id)
        .single();

      if (suggestionData?.idea_ids && suggestionData.idea_ids.length > 0) {
        // Update all related ideas to link to this project
        await supabase
          .from('ideas')
          .update({ project_id: project.id })
          .in('id', suggestionData.idea_ids);
      }

      // Mark suggestion as accepted
      await supabase
        .from('project_suggestions')
        .update({ status: 'accepted' })
        .eq('id', suggestion.id);

      toast.success(`¡Proyecto "${project.title}" creado con ${suggestion.ideaCount} ideas!`);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['ideas'] });
      onClose();
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Error al crear el proyecto');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDecline = async (forever: boolean) => {
    setIsDeclining(true);
    try {
      await supabase
        .from('project_suggestions')
        .update({ status: forever ? 'dismissed_forever' : 'declined' })
        .eq('id', suggestion.id);

      if (forever) {
        toast.success(`No volveremos a sugerir un proyecto sobre "${suggestion.topic}"`);
      }
      onClose();
    } catch (error: any) {
      console.error('Error declining suggestion:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <Dialog open={!!suggestion} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 rounded-2xl border-0 shadow-2xl overflow-hidden bg-background">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FolderPlusIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                ¿Crear un proyecto?
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Sparky detectó ideas relacionadas
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDecline(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-foreground">
            Tienes <span className="font-semibold text-primary">{suggestion.ideaCount} ideas</span> sobre{' '}
            <span className="font-semibold">"{suggestion.topic}"</span>. 
            ¿Te gustaría agruparlas en un proyecto?
          </p>

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleCreateProject}
              disabled={isCreating || isDeclining}
              className="w-full gap-2"
            >
              {isCreating ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <FolderPlusIcon className="h-4 w-4" />
              )}
              Crear proyecto
            </Button>

            <Button
              variant="outline"
              onClick={() => handleDecline(false)}
              disabled={isCreating || isDeclining}
              className="w-full"
            >
              Ahora no
            </Button>

            {suggestion.canDismissForever && (
              <Button
                variant="ghost"
                onClick={() => handleDecline(true)}
                disabled={isCreating || isDeclining}
                className="w-full text-xs text-muted-foreground hover:text-destructive"
              >
                No volver a sugerir para este tema
              </Button>
            )}
          </div>

          {suggestion.suggestionCount > 1 && !suggestion.canDismissForever && (
            <p className="text-[10px] text-muted-foreground text-center">
              Sugerencia #{suggestion.suggestionCount} de 3. Después podrás desactivar esta sugerencia.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
