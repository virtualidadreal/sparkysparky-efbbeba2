import { Link } from 'react-router-dom';
import { Card, Badge } from '@/components/common';
import { LightBulbIcon } from '@heroicons/react/24/outline';

/**
 * Props del componente LooseIdeasCard
 */
interface LooseIdeasCardProps {
  ideasCount: number;
}

/**
 * Componente LooseIdeasCard
 * 
 * Tarjeta especial para mostrar ideas sin proyecto asignado
 */
export const LooseIdeasCard = ({ ideasCount }: LooseIdeasCardProps) => {
  return (
    <Link 
      to="/ideas?filter=unassigned"
      className="block group"
    >
      <Card 
        variant="hoverable" 
        padding="md" 
        className="h-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
      >
        {/* Header con ícono y título */}
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <LightBulbIcon className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              Ideas sueltas
            </h3>
            <Badge
              text="Por defecto"
              variant="warning"
              size="sm"
            />
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-4">
          Ideas que aún no están asignadas a ningún proyecto específico
        </p>

        {/* Contador de ideas */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-amber-600">
            {ideasCount}
          </span>
          <span className="text-sm text-gray-500">
            {ideasCount === 1 ? 'idea' : 'ideas'} sin asignar
          </span>
        </div>
      </Card>
    </Link>
  );
};
