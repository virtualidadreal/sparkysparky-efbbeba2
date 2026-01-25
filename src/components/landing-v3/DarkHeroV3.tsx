import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Dark Hero V3 - Alternative hero section with dark background
 */
const DarkHeroV3 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-[#292524] relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Headline */}
        <h2
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#E7E5E4] mb-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Recuerda todo.
        </h2>
        <h3
          className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-8 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Sin organizar nada.
        </h3>

        {/* Subheadline */}
        <p
          className={`text-lg sm:text-xl text-[#A8A29E] max-w-2xl mx-auto mb-10 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Tu compañero de IA que captura ideas, conecta patrones y te devuelve lo importante cuando lo necesitas.
        </p>

        {/* CTAs */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium text-lg rounded-xl hover:bg-primary/90 transition-all duration-200"
          >
            <Sparkles className="w-5 h-5" />
            Empezar gratis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#44403C] text-[#E7E5E4] font-medium text-lg rounded-xl hover:bg-[#57534E] transition-all duration-200"
          >
            Ver cómo funciona
          </a>
        </div>
      </div>
    </section>
  );
};

export default DarkHeroV3;
