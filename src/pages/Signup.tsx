import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordCheck } from '@/hooks/usePasswordCheck';
import { useEarlyAccess } from '@/hooks/useEarlyAccess';
import { Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading } = useAuth();
  const { checkPassword, isChecking } = usePasswordCheck();
  const { stats, claimSpot, loading: earlyAccessLoading } = useEarlyAccess();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordWarning, setPasswordWarning] = useState<string | null>(null);

  const spotsRemaining = stats?.spots_remaining ?? 30;
  const isEarlyAccessAvailable = stats?.is_available ?? true;

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'El nombre es requerido';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
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
    setPasswordWarning(null);

    try {
      // Check if password has been leaked
      const pwnedResult = await checkPassword(password);
      
      if (pwnedResult.isPwned) {
        setPasswordWarning(
          `⚠️ Esta contraseña apareció en ${pwnedResult.occurrences.toLocaleString()} filtraciones de datos. Te recomendamos usar otra.`
        );
        setLoading(false);
        return;
      }

      const { error } = await signUp(email, password, fullName);

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Ya existe una cuenta con este email');
        } else {
          toast.error(error.message);
        }
      } else {
        // After successful signup, try to claim early access spot
        if (isEarlyAccessAvailable) {
          try {
            const claimResult = await claimSpot();
            if (claimResult.success) {
              toast.success('🔥 ¡Felicidades! Tienes 3 meses de Sparky Pro gratis');
            }
          } catch (claimError) {
            // Silent fail for claim - user still got registered
            console.log('Could not claim early access spot:', claimError);
          }
        }
        
        toast.success('¡Cuenta creada! Redirigiendo...');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground">Sparky</h1>
          <p className="mt-2 text-muted-foreground">Tu asistente IA personal</p>
        </div>

        {/* Early Access Banner */}
        {isEarlyAccessAvailable && (
          <div className="mb-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Oferta de lanzamiento</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {earlyAccessLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Cargando...
                </span>
              ) : (
                <>
                  🔥 <strong>{spotsRemaining} plazas</strong> disponibles para 3 meses de Pro gratis
                </>
              )}
            </p>
          </div>
        )}

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-card-foreground">Crear Cuenta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Nombre completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                placeholder="Juan Pérez"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordWarning(null);
                }}
                disabled={loading || isChecking}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                placeholder="Mínimo 8 caracteres"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password}</p>
              )}
              {passwordWarning && (
                <div className="mt-2 rounded-md bg-primary/10 border border-primary/30 p-3">
                  <p className="text-sm text-primary">{passwordWarning}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Puedes continuar, pero te recomendamos elegir una contraseña más segura.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPasswordWarning(null)}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    Continuar de todos modos
                  </button>
                </div>
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
                placeholder="Repite tu contraseña"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || isChecking}
              className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isChecking ? 'Verificando seguridad...' : loading ? 'Creando cuenta...' : (
                isEarlyAccessAvailable ? '🔥 Registrarse y obtener Pro gratis' : 'Registrarse'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
