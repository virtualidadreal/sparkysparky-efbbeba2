import { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';

const TestimonialV4 = () => {
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
    <section
      ref={sectionRef}
      className="py-24 px-6 bg-[#FFF5EB]"
    >
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h2
          className={`font-serif text-2xl sm:text-3xl font-bold text-[#636E72] text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          De mi propio uso:
        </h2>

        {/* Quote Card */}
        <div
          className={`relative bg-white rounded-3xl p-8 sm:p-12 shadow-xl transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Quote icon */}
          <div className="absolute -top-6 left-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB800] flex items-center justify-center">
              <Quote className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Quote text */}
          <blockquote className="text-xl sm:text-2xl text-[#2D3436] leading-relaxed mb-8 pt-4">
            "Ayer Sparky me conectó una idea de cliente que tuve en septiembre
            con un proyecto que empecé esta semana.
            <br /><br />
            <span className="text-[#636E72]">
              Llevaba meses ahí, esperando.
              Yo solo no la habría encontrado."
            </span>
          </blockquote>

          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB800] flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <div>
              <p className="font-bold text-[#2D3436]">Fran</p>
              <p className="text-sm text-[#636E72]">Creador de Sparky</p>
            </div>
          </div>
        </div>

        {/* Placeholder for future testimonials */}
        <div
          className={`mt-8 text-center text-[#636E72] transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-sm">
            🚀 Pronto: testimonios de los primeros 50 usuarios
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialV4;
