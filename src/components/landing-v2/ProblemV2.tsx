import { useEffect, useRef, useState } from 'react';

/**
 * Problem Section V2 - Identificación emocional
 * Mucho blanco, texto corto, ritmo pausado
 */
const ProblemV2 = () => {
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

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-40 px-6"
    >
      <div className="max-w-2xl mx-auto">
        {/* Opening statement */}
        <div 
          className={`transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight mb-16">
            No te faltan ideas.
          </h2>
          
          <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-foreground/80 leading-tight mb-20">
            Te falta un lugar donde no se pierdan.
          </p>
        </div>

        {/* Pain points - staggered */}
        <div className="space-y-8 text-lg sm:text-xl text-muted-foreground leading-relaxed">
          <p 
            className={`transition-all duration-700 delay-200 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Aparecen cuando no toca.
          </p>
          
          <p 
            className={`transition-all duration-700 delay-300 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            En medio de una conversación.
          </p>
          
          <p 
            className={`transition-all duration-700 delay-400 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Dando un paseo.
          </p>
          
          <p 
            className={`transition-all duration-700 delay-500 ease-out ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            Justo antes de dormir.
          </p>
        </div>

        {/* Conclusion */}
        <div 
          className={`mt-20 transition-all duration-700 delay-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-lg sm:text-xl text-foreground leading-relaxed mb-4">
            Las apuntas rápido.
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Y luego desaparecen.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemV2;
