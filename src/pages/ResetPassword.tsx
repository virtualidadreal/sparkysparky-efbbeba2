import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const passwordSchema = z.string().min(6, 'Mínimo 6 caracteres');

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check if user came from a password reset email
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL hash for recovery token (Supabase adds it as hash params)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        // Set the session from the recovery token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        
        if (!error) {
          setIsValidSession(true);
        } else {
          toast.error('El enlace de recuperación ha expirado o no es válido');
        }
      } else if (session) {
        // User might have a valid session already
        setIsValidSession(true);
      } else {
        toast.error('Enlace de recuperación inválido. Solicita uno nuevo.');
      }
      
      setCheckingSession(false);
    };

    checkSession();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        if (error.message.includes('same as the old password')) {
          toast.error('La nueva contraseña debe ser diferente a la anterior');
        } else {
          toast.error(error.message);
        }
      } else {
        // Get current user email to send notification
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          // Send password changed notification email
          supabase.functions.invoke('send-password-changed-email', {
            body: { 
              email: user.email, 
              name: user.user_metadata?.full_name || user.user_metadata?.display_name 
            }
          }).catch(err => console.error('Error sending password change email:', err));
        }
        
        setSuccess(true);
        toast.success('¡Contraseña actualizada correctamente!');
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Enlace Inválido</h2>
            <p className="text-muted-foreground mb-6">
              El enlace de recuperación ha expirado o no es válido. Por favor, solicita uno nuevo.
            </p>
            <Link
              to="/auth?mode=forgot"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">¡Contraseña Actualizada!</h2>
            <p className="text-muted-foreground mb-4">
              Tu contraseña ha sido cambiada correctamente. Redirigiendo al dashboard...
            </p>
            <div className="h-2 w-2 animate-ping bg-primary rounded-full mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground">Sparky</h1>
          <p className="mt-2 text-muted-foreground">Establece tu nueva contraseña</p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Nueva Contraseña</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ingresa tu nueva contraseña para completar el proceso
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                placeholder="••••••••"
                autoFocus
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;