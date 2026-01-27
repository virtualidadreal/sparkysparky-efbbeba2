import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'Mínimo 8 caracteres',
    validator: (p) => p.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Una letra mayúscula',
    validator: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'lowercase',
    label: 'Una letra minúscula',
    validator: (p) => /[a-z]/.test(p),
  },
  {
    id: 'number',
    label: 'Un número',
    validator: (p) => /[0-9]/.test(p),
  },
  {
    id: 'special',
    label: 'Un carácter especial (!@#$%...)',
    validator: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p),
  },
];

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator = ({ 
  password, 
  className = '' 
}: PasswordStrengthIndicatorProps) => {
  const results = useMemo(() => {
    return PASSWORD_REQUIREMENTS.map((req) => ({
      ...req,
      met: req.validator(password),
    }));
  }, [password]);

  const metCount = results.filter((r) => r.met).length;
  const totalCount = PASSWORD_REQUIREMENTS.length;
  const strengthPercent = (metCount / totalCount) * 100;

  const strengthColor = useMemo(() => {
    if (strengthPercent <= 20) return 'bg-destructive';
    if (strengthPercent <= 40) return 'bg-orange-500';
    if (strengthPercent <= 60) return 'bg-yellow-500';
    if (strengthPercent <= 80) return 'bg-lime-500';
    return 'bg-green-500';
  }, [strengthPercent]);

  const strengthLabel = useMemo(() => {
    if (strengthPercent <= 20) return 'Muy débil';
    if (strengthPercent <= 40) return 'Débil';
    if (strengthPercent <= 60) return 'Regular';
    if (strengthPercent <= 80) return 'Fuerte';
    return 'Muy fuerte';
  }, [strengthPercent]);

  if (!password) return null;

  return (
    <div className={`mt-2 space-y-3 ${className}`}>
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Seguridad</span>
          <span className={`font-medium ${
            strengthPercent >= 80 ? 'text-green-600' : 
            strengthPercent >= 60 ? 'text-lime-600' : 
            strengthPercent >= 40 ? 'text-yellow-600' : 
            'text-destructive'
          }`}>
            {strengthLabel}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <ul className="grid grid-cols-1 gap-1.5 text-xs">
        {results.map((req) => (
          <li
            key={req.id}
            className={`flex items-center gap-1.5 transition-colors ${
              req.met ? 'text-green-600' : 'text-muted-foreground'
            }`}
          >
            {req.met ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            <span>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  PASSWORD_REQUIREMENTS.forEach((req) => {
    if (!req.validator(password)) {
      errors.push(req.label);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default PasswordStrengthIndicator;
