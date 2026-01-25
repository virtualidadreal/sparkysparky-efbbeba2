import { useEffect, useRef, useState } from 'react';
import { Target, FolderKanban, GitBranch, Bell, Lightbulb, Mic } from 'lucide-react';

/**
 * What Is Sparky Section V2 - Compañero de IA que piensa contigo
 * 6 feature cards con iconos y descripciones
 */
const WhatIsSparkyV2 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Target,
      emoji: '🎯',
      name: 'Reconoce',
      description: 'Detecta si es una idea, una tarea o una reflexión personal',
    },
    {
      icon: FolderKanban,
      emoji: '📦',
      name: 'Organiza',
      description: 'Etiqueta y categoriza sin que hagas nada. Sin carpetas.',
    },
    {
      icon: GitBranch,
      emoji: '🔗',
      name: 'Conecta',
      description: 'Une ideas entre sí aunque tengan meses de diferencia',
    },
    {
      icon: Bell,
      emoji: '🔔',
      name: 'Recuerda',
      description: 'Te avisa de ideas olvidadas que vuelven a ser relevantes',
    },
    {
      icon: Lightbulb,
      emoji: '💡',
      name: 'Sugiere',
      description: 'Cada día te propone una acción basada en lo que le has contado',
    },
    {
      icon: Mic,
      emoji: '🎤',
      name: 'Voice-first',
      description: 'Pensado para hablar. A las 2AM no quieres un teclado.',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-40 px-6"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className={`font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Sparky es tu compañero de IA
          </h2>
          <p 
            className={`font-serif text-2xl sm:text-3xl md:text-4xl text-primary transition-all duration-700 ease-out delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            que piensa contigo.
          </p>
          <p 
            className={`text-lg text-muted-foreground mt-6 transition-all duration-700 ease-out delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Le hablas o escribes como a un amigo. Él se encarga del resto.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`p-6 rounded-2xl bg-background border border-border/50 transition-all duration-700 ease-out hover:border-primary/20 hover:shadow-sm ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${300 + index * 80}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{feature.emoji}</span>
                <h3 className="font-semibold text-foreground text-lg">
                  {feature.name}
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSparkyV2;
