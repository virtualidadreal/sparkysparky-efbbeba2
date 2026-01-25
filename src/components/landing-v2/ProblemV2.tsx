import { useEffect, useRef, useState } from 'react';

/**
 * Problem Section V2 - El 90% de tus ideas nunca llegan a nada
 * Diseño emocional con estadísticas y dolor
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
      <div className="max-w-3xl mx-auto text-center">
        {/* Main headline */}
        <h2 
          className={`font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight mb-8 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          El 90% de tus ideas nunca llegan a nada.
        </h2>

        {/* Subheadline */}
        <p 
          className={`text-lg font-semibold text-foreground mb-6 transition-all duration-700 ease-out delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          No porque sean malas.
        </p>

        {/* Explanation */}
        <p 
          className={`text-muted-foreground text-lg leading-relaxed mb-8 transition-all duration-700 ease-out delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Sino porque las apuntas en una nota, las olvidas en una carpeta, o directamente se evaporan antes de que llegues a escribirlas.
        </p>

        {/* Stats */}
        <p 
          className={`text-muted-foreground text-lg leading-relaxed mb-12 transition-all duration-700 ease-out delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Tienes <span className="text-primary font-semibold">47 notas</span> en el móvil. <span className="text-primary font-semibold">12 documentos</span> abiertos. Una idea brillante de hace 3 meses que sabes que era buena pero no encuentras.
        </p>

        {/* Emotional punch */}
        <div 
          className={`space-y-3 transition-all duration-700 ease-out delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-foreground font-semibold text-lg">
            Y lo peor no es perderlas.
          </p>
          <p className="text-muted-foreground italic text-lg">
            Lo peor es esa sensación a las 3 de la mañana:
          </p>
          <p className="text-primary font-serif text-2xl sm:text-3xl font-medium">
            "¿Cómo se llamaba aquello que pensé?"
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemV2;
