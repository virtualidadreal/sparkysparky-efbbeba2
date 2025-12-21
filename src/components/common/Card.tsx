import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

/**
 * Props del componente Card
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Contenido de la tarjeta */
  children: ReactNode;
  /** Variante visual de la tarjeta */
  variant?: 'default' | 'hoverable' | 'selected';
  /** Padding personalizado (por defecto: p-6) */
  padding?: 'sm' | 'md' | 'lg' | 'none';
  /** Handler de click (hace la card interactiva) */
  onClick?: () => void;
}

/**
 * Componente Card para contenedores de contenido
 */
export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  onClick,
  className,
  ...props
}: CardProps) => {
  // Clases base - transparente con borde
  const baseClasses = clsx(
    'bg-transparent backdrop-blur-sm border-2 border-border/50 rounded-lg',
    'transition-all duration-200'
  );

  // Clases por variante
  const variantClasses = {
    default: '',
    hoverable: clsx(
      'hover:shadow-md hover:border-primary/30',
      onClick && 'cursor-pointer'
    ),
    selected: 'border-2 border-primary shadow-md',
  };

  // Clases por padding
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Agregar interactividad si hay onClick
  const interactiveClasses = onClick
    ? 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
    : '';

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        interactiveClasses,
        className
      )}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
};
