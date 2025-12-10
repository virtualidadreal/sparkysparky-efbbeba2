import { HTMLAttributes } from 'react';
import clsx from 'clsx';

/**
 * Props del componente Badge
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Texto del badge */
  text: string;
  /** Variante de color del badge */
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'neutral' | 'warning';
  /** Tamaño del badge */
  size?: 'sm' | 'md';
  /** Mostrar punto indicador */
  dot?: boolean;
}

/**
 * Componente Badge para etiquetas y estados
 * 
 * @example
 * ```tsx
 * <Badge text="Trabajo" variant="primary" size="sm" />
 * <Badge text="Activo" variant="success" dot />
 * ```
 */
export const Badge = ({
  text,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className,
  ...props
}: BadgeProps) => {
  // Clases base
  const baseClasses = clsx(
    'inline-flex items-center gap-1.5',
    'font-medium rounded-full',
    'whitespace-nowrap'
  );

  // Clases por variante con mejor contraste
  const variantClasses = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary-dark border border-secondary/20',
    success: 'bg-success/10 text-success border border-success/20',
    error: 'bg-error/10 text-error border border-error/20',
    warning: 'bg-warning/10 text-warning-dark border border-warning/20',
    neutral: 'bg-gray-100 text-gray-800 border border-gray-200',
  };

  // Clases por tamaño
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  // Color del punto según variante
  const dotColorClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
    neutral: 'bg-gray-500',
  };

  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx('h-2 w-2 rounded-full', dotColorClasses[variant])}
          aria-hidden="true"
        />
      )}
      {text}
    </span>
  );
};
