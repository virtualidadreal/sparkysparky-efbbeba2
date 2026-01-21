import { useEffect, useRef, useState } from 'react';
import { Layers, Compass, Lightbulb, Briefcase, MessageCircle } from 'lucide-react';

/**
 * 5 Brains Section V2 - Mostrar profundidad sin complejidad
 * Cards limpias, iconos simples, nada técnico
 */
const BrainsV2 = () => {
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

  const brains = [
    {
      icon: Layers,
      name: 'Organizador',
      description: 'Cuando todo está mezclado y necesitas claridad.',
    },
    {
      icon: Compass,
      name: 'Mentor',
      description: 'Cuando quieres pensar mejor, no más rápido.',
    },
    {
      icon: Lightbulb,
      name: 'Creativo',
      description: 'Cuando las ideas empiezan a encajar.',
    },
    {
      icon: Briefcase,
      name: 'Empresarial',
      description: 'Cuando una idea necesita convertirse en algo real.',
    },
    {
      icon: MessageCircle,
      name: 'Charleta',
      description: 'Cuando solo necesitas hablar y ordenar la cabeza.',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-40 px-6 bg-muted/30"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div 
          className={`text-center mb-20 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground">
            No siempre necesitas lo mismo.
          </h2>
        </div>

        {/* Brain cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brains.map((brain, index) => {
            const Icon = brain.icon;
            return (
              <div 
                key={index}
                className={`p-8 rounded-2xl bg-background border border-border/50 transition-all duration-700 ease-out hover:border-primary/20 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <Icon className="w-6 h-6 text-primary mb-6" strokeWidth={1.5} />
                <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                  {brain.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {brain.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BrainsV2;
