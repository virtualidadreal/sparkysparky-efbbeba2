import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Card, Button } from '@/components/common';
import { useIsAdmin, useSystemPrompts, useUpdateSystemPrompt } from '@/hooks/useAdmin';
import { ShieldCheckIcon, SparklesIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

/**
 * Panel de Administración
 * Solo accesible para usuarios con email en la tabla admin_emails
 */
const Admin = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: prompts, isLoading: loadingPrompts } = useSystemPrompts();
  const updatePrompt = useUpdateSystemPrompt();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');

  // Redirigir si no es admin
  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      navigate('/dashboard');
    }
  }, [checkingAdmin, isAdmin, navigate]);

  if (checkingAdmin || loadingPrompts) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleEdit = (prompt: any) => {
    setEditingId(prompt.id);
    setEditedPrompt(prompt.prompt);
  };

  const handleSave = async () => {
    if (!editingId) return;
    
    await updatePrompt.mutateAsync({ id: editingId, prompt: editedPrompt });
    setEditingId(null);
    setEditedPrompt('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedPrompt('');
  };

  const getPromptIcon = (key: string) => {
    switch (key) {
      case 'text_classification':
        return <DocumentTextIcon className="h-6 w-6" />;
      case 'voice_processing':
        return <SparklesIcon className="h-6 w-6" />;
      default:
        return <DocumentTextIcon className="h-6 w-6" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ShieldCheckIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
            <p className="text-muted-foreground">Configura los prompts de Sparky</p>
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid gap-6">
          {prompts?.map((prompt) => (
            <Card key={prompt.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {getPromptIcon(prompt.key)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{prompt.name}</h3>
                      <p className="text-sm text-muted-foreground">{prompt.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={clsx(
                        'px-2 py-1 text-xs rounded-full',
                        prompt.is_active 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        {prompt.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  {editingId === prompt.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editedPrompt}
                        onChange={(e) => setEditedPrompt(e.target.value)}
                        className={clsx(
                          'w-full h-96 p-4 rounded-lg border font-mono text-sm',
                          'bg-muted/50 border-border text-foreground',
                          'focus:outline-none focus:ring-2 focus:ring-primary/50'
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancel}
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSave}
                          loading={updatePrompt.isPending}
                        >
                          Guardar cambios
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <pre className={clsx(
                        'p-4 rounded-lg overflow-auto max-h-64',
                        'bg-muted/50 border border-border',
                        'text-sm font-mono text-foreground/80 whitespace-pre-wrap'
                      )}>
                        {prompt.prompt}
                      </pre>
                      <div className="flex justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEdit(prompt)}
                        >
                          Editar prompt
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Última actualización: {new Date(prompt.updated_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <SparklesIcon className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Información</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Los cambios en los prompts se aplicarán inmediatamente a todas las nuevas 
                capturas de texto y voz. Las edge functions cargan el prompt más reciente 
                de la base de datos.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
