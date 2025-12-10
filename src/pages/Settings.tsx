import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile, useUpdatePassword } from '@/hooks/useProfile';
import {
  UserCircleIcon,
  KeyIcon,
  BellIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SettingsSection = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
    {children}
  </div>
);

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
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
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu perfil y preferencias de la aplicación
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted p-1 rounded-lg">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircleIcon className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4" />
              Seguridad
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <PaintBrushIcon className="h-4 w-4" />
              Apariencia
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellIcon className="h-4 w-4" />
              Notificaciones
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <SettingsSection
              title="Información del perfil"
              description="Actualiza tu información personal"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCircleIcon className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {profile?.display_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
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
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
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
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
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
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
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
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Resumen semanal</p>
                    <p className="text-sm text-muted-foreground">
                      Recibe un resumen de tu actividad semanal
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Actualizaciones del producto</p>
                    <p className="text-sm text-muted-foreground">
                      Recibe noticias sobre nuevas funcionalidades
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </SettingsSection>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
