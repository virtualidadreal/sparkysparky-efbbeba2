import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

/**
 * Final CTA Section V2 - Cierre emocional
 * Repetir beneficio, CTA claro, mucho espacio
 */
const FinalCTAV2 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-48 px-6"
    >
      <div 
        className={`max-w-2xl mx-auto text-center transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Headline */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-12">
          Un lugar mejor para tus ideas.
        </h2>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-medium text-lg rounded-full hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            Empieza gratis
          </Link>
          
          {/* Microcopy */}
          <p className="text-sm text-muted-foreground/80">
            Puedes irte cuando quieras.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTAV2;
