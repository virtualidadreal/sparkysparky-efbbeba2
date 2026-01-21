import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

/**
 * Hero Section V2 - Impacto silencioso
 * Diseño minimalista con tipografía serif protagonista
 */
const HeroV2 = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-24 relative">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20 pointer-events-none" />
      
      <div 
        className={`max-w-3xl mx-auto text-center relative z-10 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Headline - Serif protagonista */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium text-foreground tracking-tight leading-[1.1] mb-8">
          Piensa mejor.
        </h1>

        {/* Subheadline - Sans-serif cercana */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
          Sparky es un compañero que captura tus ideas, las conecta y te ayuda a pensar sobre ellas.
        </p>

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
            Sin tarjetas. Sin configurar nada.
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div 
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-60' : 'opacity-0'
        }`}
      >
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroV2;
