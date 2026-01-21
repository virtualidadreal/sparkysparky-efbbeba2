import { useEffect, useRef, useState } from 'react';

/**
 * How It Works Section V2 - Eliminar fricción
 * 3 pasos, numeración clara, visuales simples
 */
const HowItWorksV2 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const steps = [
    {
      number: '1',
      title: 'Habla',
      description: 'Dile a Sparky lo que se te pase por la cabeza.',
    },
    {
      number: '2',
      title: 'Sparky escucha',
      description: 'Capta el contexto, no solo las palabras.',
    },
    {
      number: '3',
      title: 'Sparky ordena',
      description: 'Conecta ideas, tareas y pensamientos sin carpetas ni etiquetas.',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-40 px-6"
    >
      <div className="max-w-3xl mx-auto">
        {/* Steps */}
        <div className="space-y-20 md:space-y-24">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex flex-col md:flex-row md:items-start gap-6 md:gap-12 transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {/* Number */}
              <div className="flex-shrink-0">
                <span className="font-serif text-6xl md:text-7xl font-light text-primary/60">
                  {step.number}
                </span>
              </div>
              
              {/* Content */}
              <div className="pt-2 md:pt-4">
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksV2;
