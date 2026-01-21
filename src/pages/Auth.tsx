import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

// Validación con Zod
const emailSchema = z.string().email('Email no válido');
const passwordSchema = z.string().min(6, 'Mínimo 6 caracteres');
const nameSchema = z.string().min(2, 'Mínimo 2 caracteres').optional();

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, resetPassword, signInWithGoogle, user, loading: authLoading } = useAuth();

  // Check URL param for initial mode
  const initialMode = searchParams.get('mode') as AuthMode | null;
  
  const [mode, setMode] = useState<AuthMode>(initialMode === 'forgot' ? 'forgot' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetEmailSent, setResetEmailSent] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    // Password validation only for login/signup
    if (mode !== 'forgot') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    if (mode === 'signup' && fullName) {
      const nameResult = nameSchema.safeParse(fullName);
      if (!nameResult.success) {
        newErrors.fullName = nameResult.error.errors[0].message;
      }
    }

    // Validar aceptación de términos en registro
    if (mode === 'signup' && !acceptedTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          setResetEmailSent(true);
          toast.success('¡Email enviado! Revisa tu bandeja de entrada.');
        }
      } else if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Email o contraseña incorrectos');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('¡Bienvenido!');
        }
      } else {
        const { error } = await signUp(email, password, fullName || undefined);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('Este email ya está registrado');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('¡Cuenta creada! Revisa tu email para confirmar.');
        }
      }
    } catch (err) {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    setResetEmailSent(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error('Error al iniciar sesión con Google');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  // Forgot password - email sent success view
  if (mode === 'forgot' && resetEmailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground">Sparky</h1>
            <p className="mt-2 text-muted-foreground">Tu asistente IA personal</p>
          </div>

          <div className="rounded-lg border bg-card p-8 shadow-sm text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <EnvelopeIcon className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">¡Revisa tu email!</h2>
            <p className="text-muted-foreground mb-6">
              Hemos enviado un enlace de recuperación a <strong className="text-foreground">{email}</strong>. 
              Haz clic en el enlace del email para establecer tu nueva contraseña.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              ¿No lo encuentras? Revisa tu carpeta de spam.
            </p>
            <button
              onClick={() => switchMode('login')}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver al inicio de sesión
            </button>
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
          <p className="mt-2 text-muted-foreground">Tu asistente IA personal</p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          {/* Forgot Password Mode */}
          {mode === 'forgot' ? (
            <>
              <button
                onClick={() => switchMode('login')}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Volver
              </button>
              
              <h2 className="text-lg font-semibold text-foreground mb-2">Recuperar Contraseña</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    autoFocus
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Tabs for Login/Signup */}
              <div className="mb-6 flex rounded-lg bg-muted p-1">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    mode === 'login'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    mode === 'signup'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
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
                      placeholder="Tu nombre"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>
                )}

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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-foreground">
                      Contraseña
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => switchMode('forgot')}
                        className="text-xs text-primary hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                {/* Términos y condiciones - solo en registro */}
                {mode === 'signup' && (
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        disabled={loading}
                        className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-primary disabled:opacity-50"
                      />
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        He leído y acepto los{' '}
                        <Link 
                          to="/terms" 
                          className="text-primary hover:underline"
                          target="_blank"
                        >
                          Términos de Servicio
                        </Link>
                        {' '}y la{' '}
                        <Link 
                          to="/privacy" 
                          className="text-primary hover:underline"
                          target="_blank"
                        >
                          Política de Privacidad
                        </Link>
                      </span>
                    </label>
                    {errors.terms && (
                      <p className="text-sm text-destructive">{errors.terms}</p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading
                    ? mode === 'login'
                      ? 'Iniciando sesión...'
                      : 'Creando cuenta...'
                    : mode === 'login'
                    ? 'Iniciar Sesión'
                    : 'Crear Cuenta'}
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">o continúa con</span>
                  </div>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || googleLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-md border border-input bg-background px-4 py-2.5 font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {googleLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground border-r-transparent" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {googleLoading ? 'Conectando...' : 'Google'}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer con enlaces legales */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Al usar Sparky, aceptas nuestros{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Términos
            </Link>
            {' '}y{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;