import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileFooter } from '@/components/layout/MobileFooter';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useAuth } from '@/hooks/useAuth';
import { 
  useProfile, 
  useUpdateProfile, 
  useUpdatePassword, 
  useUploadAvatar,
  type UserPreferences 
} from '@/hooks/useProfile';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import {
  UserCircleIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import {
  User,
  Lock,
  Palette,
  Bell,
  CreditCard,
  Sparkles,
  Crown,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'security' | 'appearance' | 'notifications' | 'subscription';

const settingsTabs = [
  { id: 'profile' as SettingsTab, icon: User, label: 'Perfil' },
  { id: 'subscription' as SettingsTab, icon: CreditCard, label: 'Suscripción' },
  { id: 'security' as SettingsTab, icon: Lock, label: 'Seguridad' },
  { id: 'appearance' as SettingsTab, icon: Palette, label: 'Apariencia' },
  { id: 'notifications' as SettingsTab, icon: Bell, label: 'Notificaciones' },
];

const SettingsSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white/60 dark:bg-card/60 backdrop-blur-lg rounded-[18px] border border-white/50 dark:border-white/10 p-6 shadow-sm">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
    {children}
  </div>
);

const defaultPreferences: UserPreferences = {
  notifications: {
    task_reminders: true,
    weekly_summary: true,
    product_updates: false,
  },
  theme: 'light',
};

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const uploadAvatar = useUploadAvatar();
  const { 
    subscription, 
    loading: stripeLoading, 
    checkingStatus,
    isPro,
    createCheckout, 
    openCustomerPortal,
    checkSubscription 
  } = useStripeSubscription();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [displayName, setDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
    if (profile?.preferences) {
      setPreferences(profile.preferences);
    }
  }, [profile]);

  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }
    await updateProfile.mutateAsync({ display_name: displayName.trim() });
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    await updatePassword.mutateAsync(newPassword);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Save to database
    const newPreferences = {
      ...preferences,
      theme: newDarkMode ? 'dark' as const : 'light' as const,
    };
    setPreferences(newPreferences);
    await updateProfile.mutateAsync({ preferences: newPreferences });
  };

  const handleNotificationChange = async (key: keyof typeof preferences.notifications, value: boolean) => {
    const newPreferences = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: value,
      },
    };
    setPreferences(newPreferences);
    await updateProfile.mutateAsync({ preferences: newPreferences });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB');
      return;
    }

    await uploadAvatar.mutateAsync(file);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (profileLoading) {
    return (
      <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 pb-24 lg:pb-3 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto h-[calc(100vh-24px)]">
          <div className="hidden lg:block">
            <div className="bg-card rounded-[24px] h-full" />
          </div>
          <div className="bg-card rounded-[24px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
          <div className="hidden lg:block">
            <div className="bg-card rounded-[24px] h-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 pb-24 lg:pb-3 overflow-hidden">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto h-[calc(100vh-24px)]">
        
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Content - Scrollable */}
        <div className="flex flex-col gap-3 h-full overflow-y-auto pt-4">
          {/* Header */}
          <div className="px-1">
            <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tu perfil y preferencias de la aplicación
            </p>
          </div>

          {/* Content */}
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-6 border border-border/50 flex-1">
            <div className="space-y-6 max-w-3xl">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <>
                  <SettingsSection
                    title="Información del perfil"
                    description="Actualiza tu información personal"
                  >
                    <div className="space-y-4">
                      {/* Avatar */}
                      <div className="flex items-center gap-4">
                        <div className="relative group">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt="Avatar"
                              className="h-20 w-20 rounded-full object-cover border-2 border-border"
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                              <UserCircleIcon className="h-12 w-12 text-primary" />
                            </div>
                          )}
                          <button
                            onClick={handleAvatarClick}
                            disabled={uploadAvatar.isPending}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CameraIcon className="h-6 w-6 text-white" />
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {profile?.display_name || user?.email?.split('@')[0]}
                          </p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                          <button
                            onClick={handleAvatarClick}
                            disabled={uploadAvatar.isPending}
                            className="text-sm text-primary hover:underline mt-1"
                          >
                            {uploadAvatar.isPending ? 'Subiendo...' : 'Cambiar foto'}
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Nombre para mostrar</Label>
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Tu nombre"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Correo electrónico</Label>
                          <Input
                            id="email"
                            value={user?.email || ''}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            El correo electrónico no se puede cambiar
                          </p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                      </div>
                    </div>
                  </SettingsSection>

                  <SettingsSection
                    title="Cuenta"
                    description="Gestiona tu sesión"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Cerrar sesión</p>
                        <p className="text-sm text-muted-foreground">
                          Cierra tu sesión en este dispositivo
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleSignOut}
                        className="flex items-center gap-2"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
                        Cerrar sesión
                      </Button>
                    </div>
                  </SettingsSection>
                </>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <>
                  <SettingsSection
                    title="Tu Plan"
                    description="Gestiona tu suscripción a Sparky"
                  >
                    <div className="space-y-6">
                      {/* Current Plan */}
                      <div className={`rounded-xl p-6 border-2 ${
                        isPro 
                          ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30' 
                          : 'bg-muted/30 border-border'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {isPro ? (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                <Crown className="h-6 w-6 text-white" />
                              </div>
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <h4 className="text-xl font-bold text-foreground">
                                {isPro ? 'Sparky Pro' : 'Plan Gratuito'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {isPro ? 'Acceso completo a todas las funciones' : '10 ideas/mes incluidas'}
                              </p>
                            </div>
                          </div>
                          {checkingStatus && (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          )}
                        </div>

                        {isPro && subscription?.subscription_end && (
                          <p className="text-sm text-muted-foreground">
                            Renovación: {new Date(subscription.subscription_end).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        {isPro ? (
                          <Button
                            onClick={openCustomerPortal}
                            disabled={stripeLoading}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            {stripeLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ExternalLink className="h-4 w-4" />
                            )}
                            Gestionar suscripción
                          </Button>
                        ) : (
                          <Button
                            onClick={createCheckout}
                            disabled={stripeLoading}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white flex items-center gap-2"
                          >
                            {stripeLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Crown className="h-4 w-4" />
                            )}
                            Actualizar a Pro - €3.99/mes
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => checkSubscription()}
                          disabled={checkingStatus}
                          size="sm"
                        >
                          {checkingStatus ? 'Verificando...' : 'Actualizar estado'}
                        </Button>
                      </div>
                    </div>
                  </SettingsSection>

                  {/* Pro Features */}
                  <SettingsSection
                    title={isPro ? "Tus beneficios Pro" : "Beneficios de Sparky Pro"}
                    description={isPro ? "Tienes acceso a todas estas funciones" : "Desbloquea todo el potencial de Sparky"}
                  >
                    <ul className="space-y-3">
                      {[
                        'Ideas ilimitadas',
                        'Conexiones avanzadas entre ideas',
                        'Sugerencias diarias personalizadas',
                        'Compañero proactivo',
                        'Soporte prioritario',
                      ].map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center ${
                            isPro ? 'bg-green-500/20 text-green-600' : 'bg-muted text-muted-foreground'
                          }`}>
                            ✓
                          </div>
                          <span className={isPro ? 'text-foreground' : 'text-muted-foreground'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </SettingsSection>
                </>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <>
                  <SettingsSection
                    title="Cambiar contraseña"
                    description="Actualiza tu contraseña de acceso"
                  >
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nueva contraseña</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          onClick={handleUpdatePassword}
                          disabled={updatePassword.isPending || !newPassword || !confirmPassword}
                        >
                          <KeyIcon className="h-4 w-4 mr-2" />
                          {updatePassword.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
                        </Button>
                      </div>
                    </div>
                  </SettingsSection>

                  <SettingsSection
                    title="Sesiones activas"
                    description="Gestiona tus sesiones en otros dispositivos"
                  >
                    <div className="text-sm text-muted-foreground">
                      <p>Sesión actual: {user?.email}</p>
                      <p className="mt-1">
                        Último acceso: {new Date(user?.last_sign_in_at || '').toLocaleString('es-ES')}
                      </p>
                    </div>
                  </SettingsSection>
                </>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <>
                  <SettingsSection
                    title="Tema"
                    description="Personaliza la apariencia de la aplicación"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Modo oscuro</p>
                        <p className="text-sm text-muted-foreground">
                          Activa el tema oscuro para reducir la fatiga visual
                        </p>
                      </div>
                      <Switch
                        checked={isDarkMode}
                        onCheckedChange={handleToggleDarkMode}
                      />
                    </div>
                  </SettingsSection>

                  <SettingsSection
                    title="Tour de bienvenida"
                    description="Vuelve a ver el tour introductorio"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Reiniciar tour</p>
                        <p className="text-sm text-muted-foreground">
                          Vuelve a ver el tour de introducción a Sparky
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          localStorage.removeItem('sparky_onboarding_completed');
                          toast.success('Tour reiniciado. Lo verás al entrar al Dashboard.');
                        }}
                      >
                        Ver tour
                      </Button>
                    </div>
                  </SettingsSection>
                </>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <SettingsSection
                  title="Preferencias de notificaciones"
                  description="Configura cómo quieres recibir notificaciones"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Recordatorios de tareas</p>
                        <p className="text-sm text-muted-foreground">
                          Recibe recordatorios de tareas pendientes
                        </p>
                      </div>
                      <Switch 
                        checked={preferences.notifications.task_reminders}
                        onCheckedChange={(checked) => handleNotificationChange('task_reminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Resumen semanal</p>
                        <p className="text-sm text-muted-foreground">
                          Recibe un resumen de tu actividad semanal
                        </p>
                      </div>
                      <Switch 
                        checked={preferences.notifications.weekly_summary}
                        onCheckedChange={(checked) => handleNotificationChange('weekly_summary', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Actualizaciones del producto</p>
                        <p className="text-sm text-muted-foreground">
                          Recibe noticias sobre nuevas funcionalidades
                        </p>
                      </div>
                      <Switch 
                        checked={preferences.notifications.product_updates}
                        onCheckedChange={(checked) => handleNotificationChange('product_updates', checked)}
                      />
                    </div>
                  </div>
                </SettingsSection>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Settings Sections */}
        <div className="hidden lg:flex flex-col h-full">
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 border-2 border-border/50 h-full flex flex-col overflow-hidden">
            {/* Settings Tabs */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
                SECCIONES
              </h3>
              <div className="space-y-2">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Separador */}
            <div className="border-t border-border mb-6" />

            {/* Quick Info */}
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
                TU CUENTA
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile?.display_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    {activeTab === 'profile' && 'Actualiza tu nombre y foto de perfil para personalizar tu cuenta.'}
                    {activeTab === 'subscription' && 'Gestiona tu plan y accede a funciones premium de Sparky.'}
                    {activeTab === 'security' && 'Mantén tu cuenta segura actualizando tu contraseña regularmente.'}
                    {activeTab === 'appearance' && 'Personaliza cómo se ve la aplicación según tus preferencias.'}
                    {activeTab === 'notifications' && 'Controla qué notificaciones quieres recibir de Sparky.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <MobileFooter />
    </div>
  );
};

export default Settings;
