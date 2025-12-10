import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

/**
 * Props del componente Button
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Texto o contenido del botón */
  label?: string;
  /** Variante visual del botón */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Tamaño del botón */
  size?: 'sm' | 'md' | 'lg';
  /** Estado de carga */
  loading?: boolean;
  /** Icono opcional (componente React) */
  icon?: ReactNode;
  /** Posición del icono */
  iconPosition?: 'left' | 'right';
  /** Ancho completo */
  fullWidth?: boolean;
}

/**
 * Componente Button reutilizable con múltiples variantes y estados
 * 
 * @example
 * ```tsx
 * <Button 
 *   variant="primary" 
 *   size="md" 
 *   onClick={handleClick}
 *   icon={<PlusIcon className="h-5 w-5" />}
 * >
 *   Crear Idea
 * </Button>
 * ```
 */
export const Button = ({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) => {
  // Clases base comunes
  const baseClasses = clsx(
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-md',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth && 'w-full'
  );

  // Clases por variante
  const variantClasses = {
    primary: clsx(
      'bg-primary text-white',
      'hover:bg-primary-dark active:bg-primary-dark',
      'focus:ring-primary'
    ),
    secondary: clsx(
      'border-2 border-primary text-primary bg-white',
      'hover:bg-primary/5 active:bg-primary/10',
      'focus:ring-primary'
    ),
    ghost: clsx(
      'text-gray-700 bg-transparent',
      'hover:bg-gray-100 active:bg-gray-200',
      'focus:ring-gray-400'
    ),
    danger: clsx(
      'bg-error text-white',
      'hover:bg-[#D32F21] active:bg-[#B71C1C]',
      'focus:ring-error'
    ),
  };

  // Clases por tamaño
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const content = label || children;

  return (
    <button
      className={clsx(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando...
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span aria-hidden="true">{icon}</span>}
          {content}
          {icon && iconPosition === 'right' && <span aria-hidden="true">{icon}</span>}
        </>
      )}
    </button>
  );
};
