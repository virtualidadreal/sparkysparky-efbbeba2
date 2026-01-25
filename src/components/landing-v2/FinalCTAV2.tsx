import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Final CTA Section V2 - Tus ideas merecen algo mejor
 * Cierre emocional con CTA claro
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
      className="py-32 md:py-48 px-6 bg-muted/30"
    >
      <div 
        className={`max-w-3xl mx-auto text-center transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Headline */}
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-12 leading-tight">
          Tus ideas merecen algo mejor<br />
          que una nota olvidada.
        </h2>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-amber-500 text-primary-foreground font-medium text-lg rounded-full hover:opacity-90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            Guardar mi primera chispa
          </Link>
          
          {/* Microcopy */}
          <p className="text-sm text-muted-foreground/80 italic">
            Las chispas no se apagan si las guardas bien.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTAV2;
