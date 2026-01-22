import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@/components/common';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { 
  useIsAdmin, 
  useSystemPrompts, 
  useUpdateSystemPrompt, 
  useCreateSystemPrompt,
  
  useAdminSettings,
  useUpdateAdminSetting,
  PROMPT_CATEGORIES,
  SETTINGS_CATEGORIES,
  AI_MODELS,
  type SystemPrompt,
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
  
  PencilIcon,
  XMarkIcon,
  Cog6ToothIcon,
  BellIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import {
  LayoutDashboard,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';
import clsx from 'clsx';

type CategoryKey = keyof typeof PROMPT_CATEGORIES;
type SettingsCategoryKey = keyof typeof SETTINGS_CATEGORIES;
type TabType = 'prompts' | 'settings' | 'apis' | 'navigation';

const categoryIcons: Record<string, React.ElementType> = {
  DocumentTextIcon,
  CpuChipIcon,
  SparklesIcon,
  LinkIcon,
  LightBulbIcon,
  CheckIcon,
  UsersIcon,
  BellIcon,
  CircleStackIcon,
  Cog6ToothIcon,
};

/**
 * Panel de Administración con secciones de prompts y configuraciones globales
 */
const Admin = () => {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: prompts, isLoading: loadingPrompts } = useSystemPrompts();
  const { data: settings, isLoading: loadingSettings } = useAdminSettings();
  const updatePrompt = useUpdateSystemPrompt();
  const createPrompt = useCreateSystemPrompt();
  
  const updateSetting = useUpdateAdminSetting();
  
  const [activeTab, setActiveTab] = useState<TabType>('prompts');
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('capture');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [editedModel, setEditedModel] = useState('google/gemini-2.5-flash');
  const [editedTemperature, setEditedTemperature] = useState(0.7);
  const [editedMaxTokens, setEditedMaxTokens] = useState(2048);
  const [creatingKey, setCreatingKey] = useState<string | null>(null);
  const [newPromptContent, setNewPromptContent] = useState('');
  const [newModel, setNewModel] = useState('google/gemini-2.5-flash');
  const [newTemperature, setNewTemperature] = useState(0.7);
  const [newMaxTokens, setNewMaxTokens] = useState(2048);

  // Redirigir si no es admin
  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      navigate('/dashboard');
    }
  }, [checkingAdmin, isAdmin, navigate]);

  // Agrupar prompts existentes por key
  const promptsByKey = useMemo(() => {
    const map: Record<string, SystemPrompt> = {};
    prompts?.forEach(p => {
      map[p.key] = p;
    });
    return map;
  }, [prompts]);

  // Agrupar settings por categoría
  const settingsByCategory = useMemo(() => {
    const map: Record<string, typeof settings> = {};
    settings?.forEach(s => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category]!.push(s);
    });
    return map;
  }, [settings]);

  // Obtener sidebar visibility setting
  const sidebarVisibilitySetting = useMemo(() => {
    return settings?.find(s => s.key === 'sidebar_visibility');
  }, [settings]);

  const sidebarVisibility = useMemo(() => {
    return sidebarVisibilitySetting?.value || {
      dashboard: true,
      ideas: true,
      projects: true,
      tasks: true,
      people: true,
      diary: true,
      memory: true,
      analytics: true,
      insights: true,
      settings: true,
    };
  }, [sidebarVisibilitySetting]);

  // Obtener prompts para la categoría activa
  const categoryConfig = PROMPT_CATEGORIES[activeCategory];
  const categoryPrompts = categoryConfig.prompts;

  if (checkingAdmin || loadingPrompts || loadingSettings) {
    return (
      <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto h-[calc(100vh-24px)]">
          <div className="hidden lg:block">
            <div className="bg-transparent backdrop-blur-sm rounded-[24px] border border-border/50 h-full" />
          </div>
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] border border-border/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
          <div className="hidden lg:block">
            <div className="bg-transparent backdrop-blur-sm rounded-[24px] border border-border/50 h-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const handleEdit = (promptData: SystemPrompt) => {
    setEditingId(promptData.id);
    setEditedPrompt(promptData.prompt);
    setEditedModel(promptData.model || 'google/gemini-2.5-flash');
    setEditedTemperature(promptData.temperature ?? 0.7);
    setEditedMaxTokens(promptData.max_tokens ?? 2048);
  };

  const handleSave = async () => {
    if (!editingId) return;
    await updatePrompt.mutateAsync({ 
      id: editingId, 
      prompt: editedPrompt,
      model: editedModel,
      temperature: editedTemperature,
      max_tokens: editedMaxTokens,
    });
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
    setNewModel('google/gemini-2.5-flash');
    setNewTemperature(0.7);
    setNewMaxTokens(2048);
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
      model: newModel,
      temperature: newTemperature,
      max_tokens: newMaxTokens,
    });
    setCreatingKey(null);
    setNewPromptContent('');
  };


  const handleUpdateSetting = async (id: string, key: string, newValue: any) => {
    await updateSetting.mutateAsync({ id, value: { [key]: newValue } });
  };

  // Handler para actualizar visibilidad del sidebar
  const handleToggleSidebarSection = async (sectionKey: string) => {
    if (!sidebarVisibilitySetting) return;
    
    const newVisibility = {
      ...sidebarVisibility,
      [sectionKey]: !sidebarVisibility[sectionKey],
    };
    
    await updateSetting.mutateAsync({ 
      id: sidebarVisibilitySetting.id, 
      value: newVisibility 
    });
  };

  const CategoryIcon = categoryIcons[categoryConfig.icon] || DocumentTextIcon;

  // Estadísticas para sidebar
  const totalPrompts = Object.values(PROMPT_CATEGORIES).reduce((acc, cat) => acc + cat.prompts.length, 0);
  const configuredPrompts = prompts?.length || 0;
  const totalSettings = settings?.length || 0;

  return (
    <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 overflow-hidden">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto h-[calc(100vh-24px)]">
        
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Content - Scrollable */}
        <div className="flex flex-col gap-3 h-full overflow-y-auto pt-4">
          {/* Header */}
          <div className="flex items-center gap-3 px-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShieldCheckIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
              <p className="text-muted-foreground">Configura los prompts y ajustes globales de Sparky</p>
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-6 border border-border/50 flex-1">
            <div className="space-y-6">

              {/* PROMPTS TAB */}
              {activeTab === 'prompts' && (
                <>
                  {/* Category Navigation */}
                  <div className="bg-white/60 dark:bg-card/60 backdrop-blur-lg border border-white/50 dark:border-white/10 rounded-[18px] p-2 overflow-x-auto">
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
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                      Configurado
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {AI_MODELS.find(m => m.value === existingPrompt.model)?.label || existingPrompt.model}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* AI Config Section for editing */}
                              {(isEditing || isCreating) && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
                                  <div>
                                    <label className="text-sm font-medium text-foreground mb-1 block">Modelo de IA</label>
                                    <select
                                      value={isEditing ? editedModel : newModel}
                                      onChange={(e) => isEditing ? setEditedModel(e.target.value) : setNewModel(e.target.value)}
                                      className="w-full p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                                    >
                                      {AI_MODELS.map(model => (
                                        <option key={model.value} value={model.value}>
                                          {model.label}
                                        </option>
                                      ))}
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {AI_MODELS.find(m => m.value === (isEditing ? editedModel : newModel))?.description}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-foreground mb-1 block">
                                      Temperatura: {isEditing ? editedTemperature : newTemperature}
                                    </label>
                                    <input
                                      type="range"
                                      min="0"
                                      max="1"
                                      step="0.1"
                                      value={isEditing ? editedTemperature : newTemperature}
                                      onChange={(e) => isEditing 
                                        ? setEditedTemperature(parseFloat(e.target.value))
                                        : setNewTemperature(parseFloat(e.target.value))
                                      }
                                      className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      0 = preciso, 1 = creativo
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-foreground mb-1 block">Max Tokens</label>
                                    <input
                                      type="number"
                                      min="256"
                                      max="8192"
                                      step="256"
                                      value={isEditing ? editedMaxTokens : newMaxTokens}
                                      onChange={(e) => isEditing 
                                        ? setEditedMaxTokens(parseInt(e.target.value))
                                        : setNewMaxTokens(parseInt(e.target.value))
                                      }
                                      className="w-full p-2 rounded-lg border border-border bg-background text-foreground text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Longitud máxima de respuesta
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Editing existing prompt */}
                              {isEditing && existingPrompt && (
                                <div className="space-y-4">
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
                                <div className="space-y-4">
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
                                  {/* Model info badges */}
                                  <div className="flex gap-2 flex-wrap">
                                    <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                                      Temp: {existingPrompt.temperature ?? 0.7}
                                    </span>
                                    <span className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                                      Max: {existingPrompt.max_tokens ?? 2048} tokens
                                    </span>
                                  </div>
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
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleEdit(existingPrompt)}
                                    >
                                      <PencilIcon className="h-4 w-4 mr-1" />
                                      Editar prompt
                                    </Button>
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
                </>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {Object.entries(SETTINGS_CATEGORIES).map(([categoryKey, categoryInfo]) => {
                    const categorySettings = settingsByCategory[categoryKey] || [];
                    const Icon = categoryIcons[categoryInfo.icon] || Cog6ToothIcon;
                    
                    if (categorySettings.length === 0) return null;
                    
                    return (
                      <Card key={categoryKey} className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground">{categoryInfo.name}</h3>
                        </div>
                        
                        <div className="space-y-4">
                          {categorySettings.map(setting => {
                            const value = setting.value;
                            
                            return (
                              <div key={setting.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div>
                                  <h4 className="font-medium text-foreground">{setting.name}</h4>
                                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  {/* Render different inputs based on value type */}
                                  {value.hours !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min="1"
                                        max="168"
                                        value={value.hours}
                                        onChange={(e) => handleUpdateSetting(setting.id, 'hours', parseInt(e.target.value))}
                                        className="w-20 p-2 rounded border border-border bg-background text-foreground text-sm"
                                      />
                                      <span className="text-sm text-muted-foreground">horas</span>
                                    </div>
                                  )}
                                  {value.days !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={value.days}
                                        onChange={(e) => handleUpdateSetting(setting.id, 'days', parseInt(e.target.value))}
                                        className="w-20 p-2 rounded border border-border bg-background text-foreground text-sm"
                                      />
                                      <span className="text-sm text-muted-foreground">días</span>
                                    </div>
                                  )}
                                  {value.count !== undefined && (
                                    <input
                                      type="number"
                                      min="10"
                                      max="1000"
                                      value={value.count}
                                      onChange={(e) => handleUpdateSetting(setting.id, 'count', parseInt(e.target.value))}
                                      className="w-24 p-2 rounded border border-border bg-background text-foreground text-sm"
                                    />
                                  )}
                                  {value.hour !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={value.hour}
                                        onChange={(e) => handleUpdateSetting(setting.id, 'hour', parseInt(e.target.value))}
                                        className="w-20 p-2 rounded border border-border bg-background text-foreground text-sm"
                                      />
                                      <span className="text-sm text-muted-foreground">:00h</span>
                                    </div>
                                  )}
                                  {value.type !== undefined && (
                                    <select
                                      value={value.type}
                                      onChange={(e) => handleUpdateSetting(setting.id, 'type', e.target.value)}
                                      className="p-2 rounded border border-border bg-background text-foreground text-sm"
                                    >
                                      <option value="daily">Diario</option>
                                      <option value="weekly">Semanal</option>
                                      <option value="monthly">Mensual</option>
                                    </select>
                                  )}
                                  {value.enabled !== undefined && (
                                    <button
                                      onClick={() => handleUpdateSetting(setting.id, 'enabled', !value.enabled)}
                                      className={clsx(
                                        'relative w-12 h-6 rounded-full transition-colors',
                                        value.enabled ? 'bg-primary' : 'bg-muted'
                                      )}
                                    >
                                      <span 
                                        className={clsx(
                                          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                                          value.enabled ? 'left-7' : 'left-1'
                                        )}
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* APIS TAB */}
              {activeTab === 'apis' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Key className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Claves de API</h2>
                      <p className="text-sm text-muted-foreground">Configura las claves de acceso a servicios de IA</p>
                    </div>
                  </div>

                  {/* OpenAI API Key */}
                  <Card className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">OpenAI API Key</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Clave para acceder a los modelos GPT-4, GPT-5 y otros de OpenAI
                        </p>
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-foreground">Estado: </span>
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Configurada
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              La clave se gestiona como secreto seguro
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Lovable AI Key */}
                  <Card className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Lovable AI Gateway</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Acceso a modelos Gemini y GPT a través de Lovable Cloud
                        </p>
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-foreground">Estado: </span>
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Activo
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Auto-gestionado por Lovable
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-foreground mb-2">Modelos disponibles:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="text-xs p-2 bg-background rounded border border-border">
                              <span className="font-medium">Gemini 2.5 Flash</span>
                              <span className="text-muted-foreground ml-1">(default)</span>
                            </div>
                            <div className="text-xs p-2 bg-background rounded border border-border">
                              <span className="font-medium">Gemini 2.5 Pro</span>
                            </div>
                            <div className="text-xs p-2 bg-background rounded border border-border">
                              <span className="font-medium">GPT-5</span>
                            </div>
                            <div className="text-xs p-2 bg-background rounded border border-border">
                              <span className="font-medium">GPT-5 Mini</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Usage Info */}
                  <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <CpuChipIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">Uso de IA</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          El modelo por defecto es <strong>Gemini 2.5 Flash</strong> a través de Lovable AI. 
                          Puedes configurar modelos específicos para cada prompt en la sección de "Prompts de IA".
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* NAVIGATION TAB */}
              {activeTab === 'navigation' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-1">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <LayoutDashboard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Visibilidad del Menú</h2>
                      <p className="text-sm text-muted-foreground">Controla qué secciones ven los usuarios en el sidebar</p>
                    </div>
                  </div>

                  {/* Navigation Sections */}
                  <Card className="p-5">
                    <h3 className="font-medium text-foreground mb-4">Secciones del menú lateral</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'dashboard', label: 'Dashboard', description: 'Página principal con resumen' },
                        { key: 'ideas', label: 'Ideas', description: 'Captura y gestión de ideas' },
                        { key: 'projects', label: 'Proyectos', description: 'Organización de proyectos' },
                        { key: 'tasks', label: 'Tareas', description: 'Gestión de tareas' },
                        { key: 'people', label: 'Personas', description: 'Directorio de contactos' },
                        { key: 'diary', label: 'Diario', description: 'Entradas de diario personal' },
                        { key: 'memory', label: 'Memoria', description: 'Memoria a largo plazo de Sparky' },
                        { key: 'analytics', label: 'Analytics', description: 'Métricas y análisis' },
                        { key: 'insights', label: 'Insights', description: 'Sugerencias e insights' },
                        { key: 'settings', label: 'Configuración', description: 'Ajustes de usuario' },
                      ].map((section) => (
                        <div 
                          key={section.key} 
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {sidebarVisibility[section.key] ? (
                              <Eye className="h-5 w-5 text-primary" />
                            ) : (
                              <EyeOff className="h-5 w-5 text-muted-foreground" />
                            )}
                            <div>
                              <h4 className="font-medium text-foreground">{section.label}</h4>
                              <p className="text-xs text-muted-foreground">{section.description}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleSidebarSection(section.key)}
                            disabled={updateSetting.isPending}
                            className={clsx(
                              'relative w-12 h-6 rounded-full transition-colors',
                              sidebarVisibility[section.key] ? 'bg-primary' : 'bg-muted',
                              updateSetting.isPending && 'opacity-50 cursor-not-allowed'
                            )}
                          >
                            <span 
                              className={clsx(
                                'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                                sidebarVisibility[section.key] ? 'left-7' : 'left-1'
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Warning Card */}
                  <Card className="p-4 bg-warning/10 border-warning/30">
                    <div className="flex items-start gap-3">
                      <EyeOff className="h-5 w-5 text-warning mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">Nota importante</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Los cambios afectan a todos los usuarios de la aplicación. Las secciones ocultas seguirán siendo accesibles por URL directa.
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Info Card */}
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <SparklesIcon className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">Información</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {activeTab === 'prompts' 
                        ? 'Los prompts y configuraciones de IA se cargan dinámicamente por las edge functions. Cada prompt puede usar un modelo diferente según tus necesidades.'
                        : activeTab === 'apis'
                          ? 'Las claves de API se almacenan de forma segura como secretos en Lovable Cloud y nunca se exponen en el código.'
                          : activeTab === 'navigation'
                            ? 'Ocultar una sección la eliminará del menú lateral para todos los usuarios. Los administradores siempre pueden acceder desde el panel de admin.'
                            : 'Las configuraciones globales afectan el comportamiento de Sparky para todos los usuarios. Los cambios se aplican inmediatamente.'
                      }
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Admin Sections */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 border border-border/50 h-full flex flex-col overflow-hidden">
            {/* Secciones Admin */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
                SECCIONES ADMIN
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('prompts')}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                    activeTab === 'prompts'
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <SparklesIcon className="h-5 w-5" />
                  Prompts de IA
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                    activeTab === 'settings'
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  Config. Globales
                </button>
                <button
                  onClick={() => setActiveTab('apis')}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                    activeTab === 'apis'
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <Key className="h-5 w-5" />
                  APIs de IA
                </button>
                <button
                  onClick={() => setActiveTab('navigation')}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left',
                    activeTab === 'navigation'
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Navegación
                </button>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-border mb-6" />

            {/* Estadísticas */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
                ESTADÍSTICAS
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Prompts configurados</span>
                  <span className="text-sm font-medium text-primary">{configuredPrompts}/{totalPrompts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Configuraciones</span>
                  <span className="text-sm font-medium text-primary">{totalSettings}</span>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-border mb-6" />

            {/* Info */}
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
                INFORMACIÓN
              </h3>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  {activeTab === 'prompts' 
                    ? 'Los prompts definen cómo Sparky procesa y responde a la información. Cada categoría tiene prompts específicos para diferentes funciones.'
                    : 'Las configuraciones globales controlan los tiempos, límites y comportamientos del sistema.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
