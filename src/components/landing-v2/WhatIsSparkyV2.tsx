import { useEffect, useRef, useState } from 'react';

/**
 * What Is Sparky Section V2 - Reencuadre mental
 * Tres bloques conceptuales, mucho aire
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const concepts = [
    'Escucha tus ideas.',
    'Las ordena sin que tengas que hacerlo tú.',
    'Y vuelve a sacarlas cuando importa.',
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-40 px-6 bg-muted/30"
    >
      <div className="max-w-2xl mx-auto">
        {/* Opener */}
        <div 
          className={`mb-20 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-lg sm:text-xl text-muted-foreground mb-4">
            Sparky no es una app de notas.
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight">
            Es un compañero para pensar mejor.
          </h2>
        </div>

        {/* Three concepts */}
        <div className="space-y-12">
          {concepts.map((concept, index) => (
            <p 
              key={index}
              className={`text-xl sm:text-2xl text-foreground/90 leading-relaxed transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${300 + index * 150}ms` }}
            >
              {concept}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSparkyV2;
