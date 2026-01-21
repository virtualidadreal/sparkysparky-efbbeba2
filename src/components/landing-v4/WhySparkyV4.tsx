import { useEffect, useRef, useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';

const WhySparkyV4 = () => {
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
      className="py-24 px-6 bg-[#12121F]"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Title */}
        <h2
          className={`font-serif text-3xl sm:text-4xl font-bold text-[#FAFAFA] mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          ¿Por qué Sparky?
        </h2>

        {/* Poetic copy */}
        <div
          className={`space-y-6 text-xl sm:text-2xl text-[#FAFAFA]/80 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="flex items-center justify-center gap-3">
            <Sparkles className="w-6 h-6 text-[#FFB800]" />
            Cada pensamiento es una chispa.
          </p>
          <p>La mayoría se apagan antes de convertirse en algo.</p>
          <p className="text-[#FFB800]">
            Sparky las guarda, las protege, las conecta.
          </p>
          <p className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-bold text-[#FF6B35]">
            Y las convierte en fuego.
            <Flame className="w-8 h-8 text-[#FF6B35] animate-pulse" />
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhySparkyV4;
