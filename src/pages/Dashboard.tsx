import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/common';
import { QuickCapture, RecentIdeas } from '@/components/dashboard';
import { useIdeas } from '@/hooks/useIdeas';
import {
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Página Dashboard
 * 
 * Vista principal del dashboard con:
 * - Saludo personalizado según hora del día
 * - Grid de widgets principales
 * - QuickCapture para captura rápida de ideas
 */
const Dashboard = () => {
  const { user } = useAuth();
  const { data: ideas } = useIdeas({ status: 'active' });

  /**
   * Obtener saludo según hora del día
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  /**
   * Obtener nombre del usuario
   */
  const getUserName = () => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) {
      return fullName.split(' ')[0]; // Primer nombre
    }
    return user?.email?.split('@')[0] || 'Usuario';
  };

  return (
    <DashboardLayout>
      {/* Header con saludo */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {getUserName()}
        </h1>
        <p className="text-gray-600">
          Aquí tienes un resumen de tu día
        </p>
      </div>

      {/* Quick Capture - Full Width */}
      <div className="mb-6">
        <QuickCapture />
      </div>

      {/* Grid de widgets */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {/* Widget: Upcoming Events */}
        <Card variant="hoverable" padding="lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <CalendarIcon className="h-6 w-6 text-secondary-dark" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Próximos Eventos
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                No hay eventos próximos
              </p>
              <p className="text-xs text-gray-500">
                Conecta tu calendario para ver eventos aquí
              </p>
            </div>
          </div>
        </Card>

        {/* Widget: MITs del día */}
        <Card variant="hoverable" padding="lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircleIcon className="h-6 w-6 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                MITs del Día
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Most Important Tasks de hoy
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  No hay tareas pendientes
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Widget: Recent Ideas */}
        <div className="md:col-span-2">
          <RecentIdeas />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Ideas capturadas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {ideas?.length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Proyectos activos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Tareas pendientes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">Personas activas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
