import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button } from '@/components/common';
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
  Home,
  Users,
  Settings,
  Plus,
  Lightbulb,
  FolderOpen,
  CheckSquare,
  Brain,
  BarChart3,
  ShieldCheck,
  Mic,
  BookOpen,
} from 'lucide-react';
import clsx from 'clsx';
import { SparkyChat } from '@/components/chat/SparkyChat';
import { QuickCapturePopup } from '@/components/dashboard/QuickCapturePopup';

type CategoryKey = keyof typeof PROMPT_CATEGORIES;
type SettingsCategoryKey = keyof typeof SETTINGS_CATEGORIES;
type TabType = 'prompts' | 'settings';

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

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/ideas', icon: Lightbulb, label: 'Ideas' },
  { to: '/projects', icon: FolderOpen, label: 'Proyectos' },
  { to: '/tasks', icon: CheckSquare, label: 'Tareas' },
  { to: '/people', icon: Users, label: 'Personas' },
  { to: '/diary', icon: BookOpen, label: 'Diario' },
  { to: '/memory', icon: Brain, label: 'Memoria' },
  { to: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
];

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

  const location = useLocation();

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

  // Obtener prompts para la categoría activa
  const categoryConfig = PROMPT_CATEGORIES[activeCategory];
  const categoryPrompts = categoryConfig.prompts;

  if (checkingAdmin || loadingPrompts || loadingSettings) {
    return (
      <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 overflow-hidden">
        <div className="flex gap-3 h-[calc(100vh-24px)]">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="bg-card rounded-[24px] h-full" />
          </div>
          {/* Main content skeleton */}
          <div className="flex-1 bg-card rounded-[24px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
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

  const CategoryIcon = categoryIcons[categoryConfig.icon] || DocumentTextIcon;

  return (
    <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 overflow-hidden">
      <div className="flex gap-3 h-[calc(100vh-24px)]">
        
        {/* Left Sidebar - Fixed Navigation */}
        <div className="hidden lg:block w-[280px] flex-shrink-0 h-full">
          <div className="bg-card rounded-[24px] p-4 shadow-sm h-full flex flex-col overflow-hidden">
            <nav className="space-y-0.5 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              {/* Admin link - active */}
              <div className="border-t border-border my-3" />
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-medium"
              >
                <ShieldCheck className="h-5 w-5" />
                Admin
              </Link>
            </nav>

            {/* Bottom Actions */}
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <QuickCapturePopup
                trigger={
                  <button className="w-full flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-xl text-muted-foreground text-sm hover:bg-muted transition-colors">
                    <Plus className="h-4 w-4" />
                    Captura rápida
                  </button>
                }
              />
              <SparkyChat
                trigger={
                  <button className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors">
                    <Mic className="h-4 w-4" />
                    Hablar con Sparky
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 h-full overflow-y-auto">
          <div className="space-y-3">
            {/* Header */}
            <div className="bg-card rounded-[24px] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldCheckIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
                  <p className="text-muted-foreground">Configura los prompts y ajustes globales de Sparky</p>
                </div>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="bg-card rounded-[24px] p-4 shadow-sm">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('prompts')}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors',
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
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors',
                    activeTab === 'settings'
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <Cog6ToothIcon className="h-5 w-5" />
                  Config. Globales
                </button>
              </div>
            </div>

            {/* Content Card */}
            <div className="bg-card rounded-[24px] p-6 shadow-sm">
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

                {/* Info Card */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-3">
                    <SparklesIcon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Información</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activeTab === 'prompts' 
                          ? 'Los prompts y configuraciones de IA se cargan dinámicamente por las edge functions. Cada prompt puede usar un modelo diferente según tus necesidades.'
                          : 'Las configuraciones globales afectan el comportamiento de Sparky para todos los usuarios. Los cambios se aplican inmediatamente.'
                        }
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
