import { useState, useEffect } from 'react';
import { 
  LightBulbIcon, 
  ChatBubbleBottomCenterTextIcon,
  FolderIcon,
  CheckCircleIcon,
  MicrophoneIcon,
  SparklesIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface OnboardingStep {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  tip?: string;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    icon: SparklesIcon,
    title: '¡Bienvenido a Sparky!',
    description: 'Tu asistente personal inteligente que te conoce y te ayuda a organizar tu vida. Vamos a darte un tour rápido.',
    tip: 'Solo te tomará 1 minuto',
  },
  {
    id: 'capture',
    icon: MicrophoneIcon,
    title: 'Captura tus Ideas',
    description: 'Usa el botón "Captura rápida" para guardar ideas por texto o voz. Sparky las analiza automáticamente y extrae lo importante.',
    tip: 'Prueba diciendo: "Tengo una idea para un podcast sobre tecnología"',
  },
  {
    id: 'sparky',
    icon: ChatBubbleBottomCenterTextIcon,
    title: 'Habla con Sparky',
    description: 'Sparky conoce todas tus ideas, tareas y proyectos. Pregúntale lo que necesites y te dará respuestas personalizadas.',
    tip: 'Pregunta: "¿Qué tengo pendiente para hoy?"',
  },
  {
    id: 'organize',
    icon: FolderIcon,
    title: 'Organiza en Proyectos',
    description: 'Agrupa tus ideas en proyectos y crea tareas. Sparky te sugiere conexiones automáticamente.',
    tip: 'Las ideas sin proyecto van a "Ideas sueltas"',
  },
  {
    id: 'ready',
    icon: CheckCircleIcon,
    title: '¡Estás listo!',
    description: 'Ya conoces lo básico. Explora el resto de funciones: Diario personal, Contactos, Memoria y más.',
    tip: 'Tip: Cuanta más información agregues, más útil será Sparky',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  userName?: string;
}

export const OnboardingTour = ({ onComplete, userName }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Small delay for animation
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  // Personalize welcome message
  const title = isFirstStep && userName 
    ? `¡Bienvenido a Sparky, ${userName}!`
    : step.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
          aria-label="Saltar tour"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-12">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <step.icon className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              {title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
            {step.tip && (
              <p className="mt-4 text-sm text-primary/80 bg-primary/5 rounded-lg px-4 py-2 inline-block">
                💡 {step.tip}
              </p>
            )}
          </div>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentStep
                    ? 'w-6 bg-primary'
                    : index < currentStep
                    ? 'bg-primary/50'
                    : 'bg-muted-foreground/30'
                }`}
                aria-label={`Ir al paso ${index + 1}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {isLastStep ? (
                '¡Empezar!'
              ) : (
                <>
                  Siguiente
                  <ArrowRightIcon className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Skip link */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Saltar tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook to manage onboarding state
export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('sparky_onboarding_completed');
    
    if (!hasCompletedOnboarding) {
      // Small delay to let the dashboard load first
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
    
    setIsChecked(true);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('sparky_onboarding_completed', 'true');
    setShowOnboarding(false);
    setIsChecked(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('sparky_onboarding_completed');
    setShowOnboarding(true);
    setIsChecked(false);
  };

  return {
    showOnboarding,
    isChecked,
    completeOnboarding,
    resetOnboarding,
  };
};

export default OnboardingTour;