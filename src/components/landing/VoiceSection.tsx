import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mic, Car, Droplets, Footprints, ArrowRight, Check } from 'lucide-react';

/**
 * VoiceSection - "Voz Viva" feature section
 * Ubicación: después del Hero, antes de Problem
 * Stage 3: Diferencia de notas de voz normales con mecanismo único
 */

// Componente de onda de audio animada
const AudioWave = ({ isActive }: { isActive: boolean }) => (
  <div className="flex items-center justify-center gap-1 h-12">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className={`w-1 bg-gradient-to-t from-primary to-primary/60 rounded-full transition-all duration-150 ${
          isActive ? 'animate-pulse' : ''
        }`}
        style={{
          height: isActive ? `${Math.random() * 100}%` : '20%',
          animationDelay: `${i * 50}ms`,
          animationDuration: '300ms',
        }}
      />
    ))}
  </div>
);

// Pasos de la demo animada
const demoSteps = [
  { id: 'audio', text: '"Oye Sparky, el webinar debería ser sobre casos reales..."', duration: 2500 },
  { id: 'classify', badge: '💡 IDEA', text: 'Clasificando...', duration: 1000 },
  { id: 'tags', tags: ['webinar', 'contenido', 'marketing'], text: 'Etiquetando...', duration: 1200 },
  { id: 'connect', connection: 'brainstorm marketing Q1', text: 'Conectando...', duration: 1500 },
  { id: 'done', text: 'Guardado en 8 segundos', duration: 2000 },
];

// Demo animada del flujo de voz
const VoiceDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;
    
    const step = demoSteps[currentStep];
    const timer = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStep, isAnimating]);

  const step = demoSteps[currentStep];

  return (
    <div 
      className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 max-w-lg mx-auto"
      onMouseEnter={() => setIsAnimating(true)}
    >
      {/* Audio wave */}
      <div className="mb-6">
        <AudioWave isActive={step.id === 'audio'} />
      </div>

      {/* Transcription text */}
      <div className="min-h-[60px] mb-4">
        {step.id === 'audio' && (
          <p className="text-lg text-foreground/90 font-medium animate-fade-in">
            {step.text}
          </p>
        )}
      </div>

      {/* Classification badge */}
      <div className="min-h-[40px] mb-3">
        {(step.id === 'classify' || step.id === 'tags' || step.id === 'connect' || step.id === 'done') && (
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium animate-scale-in">
            💡 IDEA
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="min-h-[36px] mb-3">
        {(step.id === 'tags' || step.id === 'connect' || step.id === 'done') && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {demoSteps[2].tags?.map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Connection */}
      <div className="min-h-[44px] mb-4">
        {(step.id === 'connect' || step.id === 'done') && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
            <span className="text-primary">🔗</span>
            <span>Conectado con: <span className="text-foreground">{demoSteps[3].connection}</span> (hace 3 semanas)</span>
          </div>
        )}
      </div>

      {/* Done state */}
      {step.id === 'done' && (
        <div className="flex items-center justify-center gap-2 text-green-500 font-medium animate-scale-in">
          <Check className="w-5 h-5" />
          <span>Guardado en 8 segundos</span>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mt-6">
        {demoSteps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentStep ? 'bg-primary w-6' : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Tarjeta de escenario
const ScenarioCard = ({ 
  icon: Icon, 
  emoji,
  title, 
  quote, 
  result 
}: { 
  icon?: React.ElementType;
  emoji?: string;
  title: string; 
  quote: string; 
  result: string;
}) => (
  <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-5 hover:border-primary/30 transition-all duration-300 group">
    <div className="flex items-center gap-3 mb-3">
      {emoji ? (
        <span className="text-2xl">{emoji}</span>
      ) : Icon ? (
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      ) : null}
      <h4 className="font-semibold text-foreground">{title}</h4>
    </div>
    <p className="text-sm text-muted-foreground italic mb-3">"{quote}"</p>
    <div className="flex items-center gap-2 text-xs text-primary">
      <span>🔗</span>
      <span>{result}</span>
    </div>
  </div>
);

// Paso del mecanismo
const MechanismStep = ({ icon, text, isLast }: { icon: string; text: string; isLast?: boolean }) => (
  <div className="flex items-center gap-2">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
        {icon}
      </div>
      <span className="text-xs text-muted-foreground mt-1 text-center">{text}</span>
    </div>
    {!isLast && (
      <ArrowRight className="w-4 h-4 text-muted-foreground mx-1 hidden sm:block" />
    )}
  </div>
);

const VoiceSection = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <Mic className="w-4 h-4" />
            Voz Viva
          </span>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Conduciendo. Ducha. Caminando.
            <span className="block text-primary mt-2">Donde las ideas llegan y se pierden.</span>
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground">
            Sparky escucha cuando tú no puedes escribir.
            <span className="block mt-1">Sin apps. Sin carpetas. Solo tu voz.</span>
          </p>
        </div>

        {/* Demo animada */}
        <div className="mb-16 md:mb-20">
          <VoiceDemo />
        </div>

        {/* Escenarios */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mb-16 md:mb-20">
          <ScenarioCard
            emoji="🚗"
            title="Conduciendo"
            quote="El webinar debería ser sobre casos reales, no teoría..."
            result="Conectado con brainstorm de hace 3 semanas"
          />
          <ScenarioCard
            emoji="🚿"
            title="En la ducha"
            quote="El cliente no ve el valor, necesito una demo más visual..."
            result="Vinculado a reunión pendiente"
          />
          <ScenarioCard
            emoji="🚶"
            title="Caminando"
            quote="Hoy fue productivo pero siento que no avanzo en lo importante..."
            result="Patrón detectado: 3ª vez esta semana"
          />
        </div>

        {/* Mecanismo explicado */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-lg font-medium text-foreground mb-6">Así funciona Voz Viva:</p>
          
          <div className="flex flex-wrap justify-center items-start gap-4 md:gap-2 mb-6">
            <MechanismStep icon="🎤" text="Hablas" />
            <MechanismStep icon="📝" text="Transcribe" />
            <MechanismStep icon="🏷️" text="Clasifica" />
            <MechanismStep icon="🔗" text="Conecta" isLast />
          </div>

          <p className="text-muted-foreground">
            <span className="text-primary font-semibold">30 segundos.</span> Cero esfuerzo. 
            <span className="block sm:inline"> Conexiones que tú solo no verías.</span>
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/25"
          >
            Deja de perder ideas
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Tu primera idea en menos de 1 minuto.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VoiceSection;
