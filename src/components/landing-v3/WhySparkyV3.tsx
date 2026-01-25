import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * Why Sparky V3 - Emotional section with CTA card
 */
const WhySparkyV3 = () => {
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
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-[#F5F3EE]">
      <div className="max-w-3xl mx-auto">
        {/* Headline */}
        <div
          className={`text-center mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ¿Por qué Sparky?
          </h2>
          <p className="text-lg text-gray-500 mb-2">Cada pensamiento es una chispa.</p>
          <p className="text-lg text-gray-500 mb-6">La mayoría se apagan antes de convertirse en algo.</p>
          <p className="text-xl text-gray-900 font-semibold mb-2">
            Sparky las guarda, las protege, las conecta.
          </p>
          <p className="text-xl text-primary font-semibold">
            Y las convierte en fuego. 🔥
          </p>
        </div>

        {/* CTA Card */}
        <div
          className={`bg-primary/10 border border-primary/30 rounded-3xl p-8 md:p-10 text-center transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Tus ideas merecen algo mejor que una nota olvidada.
          </h3>
          
          <Link
            to="/signup"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium text-lg rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20"
          >
            <Sparkles className="w-5 h-5" />
            Guardar mi primera chispa
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <p className="mt-4 text-sm text-gray-500">
            Gratis. Sin tarjeta. 10 ideas/mes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhySparkyV3;
