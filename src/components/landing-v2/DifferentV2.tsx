import { useEffect, useRef, useState } from 'react';

/**
 * Different Section V2 - Posicionamiento elegante
 * Comparación conceptual, texto humano
 */
const DifferentV2 = () => {
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

  const differentiators = [
    'No te pide que organices.',
    'No te obliga a crear sistemas.',
    'No se queda callado cuando algo no encaja.',
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-40 px-6"
    >
      <div className="max-w-2xl mx-auto">
        {/* Opening */}
        <div 
          className={`mb-20 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-lg sm:text-xl text-muted-foreground mb-4">
            Algunas herramientas esperan que trabajes.
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight">
            Sparky trabaja contigo.
          </h2>
        </div>

        {/* Differentiators */}
        <div className="space-y-8">
          {differentiators.map((item, index) => (
            <p 
              key={index}
              className={`text-xl sm:text-2xl text-foreground/90 leading-relaxed transition-all duration-700 ease-out ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${300 + index * 150}ms` }}
            >
              {item}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferentV2;
