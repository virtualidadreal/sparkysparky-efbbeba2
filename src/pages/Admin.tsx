import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout';
import { Card, Button } from '@/components/common';
import { 
  useIsAdmin, 
  useSystemPrompts, 
  useUpdateSystemPrompt, 
  useCreateSystemPrompt,
  useDeleteSystemPrompt,
  PROMPT_CATEGORIES 
} from '@/hooks/useAdmin';
import { 
  ShieldCheckIcon, 
  SparklesIcon, 
  DocumentTextIcon,
  CpuChipIcon,
  LinkIcon,
  LightBulbIcon,
  CheckIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

type CategoryKey = keyof typeof PROMPT_CATEGORIES;

const categoryIcons: Record<string, React.ElementType> = {
  DocumentTextIcon,
  CpuChipIcon,
  SparklesIcon,
  LinkIcon,
  LightBulbIcon,
  CheckIcon,
  UsersIcon,
};

/**
 * Panel de Administración con secciones de prompts
 */
const Admin = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: prompts, isLoading: loadingPrompts } = useSystemPrompts();
  const updatePrompt = useUpdateSystemPrompt();
  const createPrompt = useCreateSystemPrompt();
  const deletePrompt = useDeleteSystemPrompt();
  
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('capture');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [creatingKey, setCreatingKey] = useState<string | null>(null);
  const [newPromptContent, setNewPromptContent] = useState('');

  // Redirigir si no es admin
  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      navigate('/dashboard');
    }
  }, [checkingAdmin, isAdmin, navigate]);

  // Agrupar prompts existentes por key
  const promptsByKey = useMemo(() => {
    const map: Record<string, typeof prompts extends (infer T)[] ? T : never> = {};
    prompts?.forEach(p => {
      map[p.key] = p;
    });
    return map;
  }, [prompts]);

  // Obtener prompts para la categoría activa
  const categoryConfig = PROMPT_CATEGORIES[activeCategory];
  const categoryPrompts = categoryConfig.prompts;

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

  const handleEdit = (promptData: any) => {
    setEditingId(promptData.id);
    setEditedPrompt(promptData.prompt);
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
    setCreatingKey(null);
    setNewPromptContent('');
  };

  const handleCreate = (key: string) => {
    setCreatingKey(key);
    setNewPromptContent(`# ${PROMPT_CATEGORIES[activeCategory].prompts.find(p => p.key === key)?.name}\n\nEscribe aquí el prompt...`);
  };

  const handleSaveNew = async () => {
    if (!creatingKey) return;
    const promptConfig = categoryPrompts.find(p => p.key === creatingKey);
    if (!promptConfig) return;

    await createPrompt.mutateAsync({
      key: creatingKey,
      name: promptConfig.name,
      description: promptConfig.description,
      prompt: newPromptContent,
      category: activeCategory,
    });
    setCreatingKey(null);
    setNewPromptContent('');
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este prompt?')) {
      await deletePrompt.mutateAsync(id);
    }
  };

  const CategoryIcon = categoryIcons[categoryConfig.icon] || DocumentTextIcon;

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
            <p className="text-muted-foreground">Configura los prompts de IA de Sparky</p>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="bg-card border border-border rounded-xl p-2 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {(Object.entries(PROMPT_CATEGORIES) as [CategoryKey, typeof PROMPT_CATEGORIES[CategoryKey]][]).map(([key, category]) => {
              const Icon = categoryIcons[category.icon] || DocumentTextIcon;
              const isActive = activeCategory === key;
              const configuredCount = category.prompts.filter(p => promptsByKey[p.key]).length;
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                  <span className={clsx(
                    'px-1.5 py-0.5 rounded-full text-xs',
                    isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {configuredCount}/{category.prompts.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Header */}
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CategoryIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{categoryConfig.name}</h2>
            <p className="text-sm text-muted-foreground">{categoryConfig.description}</p>
          </div>
        </div>

        {/* Prompts List */}
        <div className="grid gap-4">
          {categoryPrompts.map((promptConfig) => {
            const existingPrompt = promptsByKey[promptConfig.key];
            const isEditing = editingId === existingPrompt?.id;
            const isCreating = creatingKey === promptConfig.key;

            return (
              <Card key={promptConfig.key} className="p-5">
                <div className="flex items-start gap-4">
                  <div className={clsx(
                    'p-2 rounded-lg',
                    existingPrompt ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  )}>
                    {existingPrompt ? (
                      <CheckIcon className="h-5 w-5" />
                    ) : (
                      <PlusIcon className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{promptConfig.name}</h3>
                        <p className="text-sm text-muted-foreground">{promptConfig.description}</p>
                        <code className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {promptConfig.key}
                        </code>
                      </div>
                      
                      {existingPrompt && !isEditing && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Configurado
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Editing existing prompt */}
                    {isEditing && existingPrompt && (
                      <div className="space-y-4 mt-4">
                        <textarea
                          value={editedPrompt}
                          onChange={(e) => setEditedPrompt(e.target.value)}
                          className={clsx(
                            'w-full h-80 p-4 rounded-lg border font-mono text-sm',
                            'bg-muted/50 border-border text-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50'
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={handleCancel}>
                            <XMarkIcon className="h-4 w-4 mr-1" />
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
                    )}

                    {/* Creating new prompt */}
                    {isCreating && (
                      <div className="space-y-4 mt-4">
                        <textarea
                          value={newPromptContent}
                          onChange={(e) => setNewPromptContent(e.target.value)}
                          placeholder="Escribe el prompt aquí..."
                          className={clsx(
                            'w-full h-80 p-4 rounded-lg border font-mono text-sm',
                            'bg-muted/50 border-border text-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-primary/50'
                          )}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={handleCancel}>
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Cancelar
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={handleSaveNew}
                            loading={createPrompt.isPending}
                          >
                            <PlusIcon className="h-4 w-4 mr-1" />
                            Crear prompt
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Show existing prompt content */}
                    {existingPrompt && !isEditing && (
                      <div className="space-y-3 mt-4">
                        <pre className={clsx(
                          'p-4 rounded-lg overflow-auto max-h-48',
                          'bg-muted/50 border border-border',
                          'text-sm font-mono text-foreground/80 whitespace-pre-wrap'
                        )}>
                          {existingPrompt.prompt}
                        </pre>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Actualizado: {new Date(existingPrompt.updated_at).toLocaleString('es-ES')}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDelete(existingPrompt.id)}
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(existingPrompt)}
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Create button for non-existing prompts */}
                    {!existingPrompt && !isCreating && (
                      <div className="mt-4">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCreate(promptConfig.key)}
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Crear prompt
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <SparklesIcon className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Información</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Los prompts se cargan dinámicamente por las edge functions usando la clave (key). 
                Configura cada prompt según tus necesidades para personalizar el comportamiento de Sparky.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
