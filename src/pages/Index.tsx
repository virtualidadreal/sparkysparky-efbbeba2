import { Link } from 'react-router-dom';
import { Button } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Página principal / Landing page
 * 
 * Muestra información de bienvenida y enlace a login/signup
 * Si el usuario ya está autenticado, muestra botón al dashboard
 */
const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-2xl">
        {/* Logo/Título */}
        <h1 className="mb-4 text-6xl font-bold text-gray-900">Sparky</h1>
        <p className="mb-8 text-xl text-gray-600">
          Tu asistente IA personal para capturar ideas, gestionar proyectos y mantener
          relaciones importantes
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Ir al Dashboard
            </Button>
          ) : (
            <>
              <Link to="/signup">
                <Button variant="primary" size="lg">
                  Crear cuenta
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Iniciar sesión
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Características */}
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Captura Ideas</h3>
            <p className="mt-2 text-sm text-gray-600">
              Por voz o texto, con análisis automático de IA
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <svg
                className="h-6 w-6 text-secondary-dark"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Gestiona Proyectos</h3>
            <p className="mt-2 text-sm text-gray-600">
              Organiza tareas y proyectos con seguimiento inteligente
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <svg
                className="h-6 w-6 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Mantén Relaciones</h3>
            <p className="mt-2 text-sm text-gray-600">
              CRM personal para no perder contacto con lo importante
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
