import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Props del componente Input
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Etiqueta del input */
  label?: string;
  /** Mensaje de error */
  error?: string;
  /** Hint o descripción adicional */
  hint?: string;
}

/**
 * Props del componente Textarea
 */
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Etiqueta del textarea */
  label?: string;
  /** Mensaje de error */
  error?: string;
  /** Hint o descripción adicional */
  hint?: string;
}

/**
 * Componente Input de texto con estados de validación
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Título"
 *   type="text"
 *   placeholder="Escribe el título..."
 *   value={title}
 *   onChange={(e) => setTitle(e.target.value)}
 *   error={errors.title}
 *   required
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, required, className, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    
    const inputClasses = clsx(
      'w-full px-3 py-2',
      'border rounded-md',
      'text-gray-900 placeholder-gray-400',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2',
      'disabled:bg-gray-100 disabled:cursor-not-allowed',
      error
        ? 'border-2 border-error bg-red-50 focus:ring-error'
        : 'border-gray-300 focus:ring-primary focus:border-transparent',
      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-error ml-1" aria-label="requerido">*</span>}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-error flex items-center gap-1"
            role="alert"
          >
            <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="text-sm text-gray-500"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Componente Textarea con estados de validación
 * 
 * @example
 * ```tsx
 * <Textarea
 *   label="Descripción"
 *   rows={4}
 *   placeholder="Describe tu idea..."
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 * />
 * ```
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, required, className, rows = 4, ...props }, ref) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
    
    const textareaClasses = clsx(
      'w-full px-3 py-2',
      'border rounded-md',
      'text-gray-900 placeholder-gray-400',
      'transition-colors duration-200',
      'focus:outline-none focus:ring-2',
      'disabled:bg-gray-100 disabled:cursor-not-allowed',
      'resize-none',
      error
        ? 'border-2 border-error bg-red-50 focus:ring-error'
        : 'border-gray-300 focus:ring-primary focus:border-transparent',
      className
    );

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="text-error ml-1" aria-label="requerido">*</span>}
          </label>
        )}
        
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        
        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-sm text-error flex items-center gap-1"
            role="alert"
          >
            <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p
            id={`${textareaId}-hint`}
            className="text-sm text-gray-500"
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
