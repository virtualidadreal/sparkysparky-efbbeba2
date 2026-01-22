import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/common/Input';
import { SparklesIcon, BeakerIcon, ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import sparkyLogo from '@/assets/sparky-logo.png';

const BetaSignup = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user, loading: authLoading } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      // Register as beta tester and redirect
      registerAsBetaTester();
    }
  }, [user, authLoading]);

  const registerAsBetaTester = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('register_beta_tester', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; message: string };
      if (result.success) {
        toast.success('¡Bienvenido al programa beta!');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error registering as beta tester:', error);
      navigate('/dashboard');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'El nombre es obligatorio';
    }

    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
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
      const { error } = await signUp(email, password, fullName);
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email ya está registrado. Inicia sesión.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      // The useEffect will handle the beta registration after auth
      toast.success('¡Cuenta creada! Registrándote como beta tester...');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la cuenta';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error('Error al iniciar sesión con Google');
      }
      // Redirect will happen via useEffect after auth
    } catch {
      toast.error('Error al iniciar sesión con Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex">
      {/* Left side - Welcome message */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
        <div className="max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src={sparkyLogo} alt="Sparky" className="h-14 w-auto" />
            <span className="px-3 py-1.5 bg-primary/20 text-primary text-sm font-semibold rounded-full">BETA</span>
          </div>

          {/* Thank you message */}
          <h1 className="text-4xl xl:text-5xl font-bold text-foreground mb-6">
            ¡Gracias por ser 
            <span className="text-primary"> Beta Tester</span>!
          </h1>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Tu participación es invaluable para nosotros. Estás ayudando a construir algo increíble. 
            Como beta tester, tendrás <strong className="text-foreground">6 meses de acceso Pro gratis</strong> con 
            todas las funciones premium de Sparky.
          </p>

          {/* Info cards */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <BeakerIcon className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Sparky está en construcción</h3>
                <p className="text-sm text-muted-foreground">
                  Ten paciencia con nosotros. Puede haber bugs o funciones incompletas. 
                  ¡Estamos trabajando duro para mejorar!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Tu feedback es oro</h3>
                <p className="text-sm text-muted-foreground">
                  En el menú lateral encontrarás un botón de <strong>Feedback</strong>. 
                  Úsalo para compartir cualquier sugerencia, bug o idea que tengas.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <HeartIcon className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Eres parte del equipo</h3>
                <p className="text-sm text-muted-foreground">
                  Los beta testers como tú son los que hacen posible que Sparky crezca y mejore. 
                  ¡Muchas gracias por confiar en nosotros!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign up form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src={sparkyLogo} alt="Sparky" className="h-12 w-auto" />
            <span className="px-3 py-1.5 bg-primary/20 text-primary text-sm font-semibold rounded-full">BETA</span>
          </div>

          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                <SparklesIcon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Únete como Beta Tester</h2>
              <p className="text-muted-foreground mt-2">Crea tu cuenta para empezar</p>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-6 gap-2"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
            >
              {googleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continuar con Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o con email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre completo"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                placeholder="Tu nombre"
                disabled={loading}
              />

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="tu@email.com"
                disabled={loading}
              />

              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />

              <Input
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                placeholder="Repite tu contraseña"
                disabled={loading}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Unirme al Beta
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              ¿Ya tienes cuenta?{' '}
              <a href="/auth" className="text-primary hover:underline font-medium">
                Inicia sesión
              </a>
            </p>
          </div>

          {/* Mobile info */}
          <div className="lg:hidden mt-8 text-center text-sm text-muted-foreground">
            <p>
              Como beta tester tendrás <strong className="text-foreground">6 meses de acceso Pro gratis</strong> con 
              todas las funciones premium y acceso al botón de Feedback para compartir tus ideas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaSignup;
