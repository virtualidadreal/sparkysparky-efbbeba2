import { useEffect, useRef, useState } from 'react';

/**
 * Voice Section V3 - Conduciendo. Ducha. Caminando.
 */
const VoiceSectionV3 = () => {
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
      <div className="max-w-3xl mx-auto text-center">
        {/* Scenarios */}
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Conduciendo. Ducha. Caminando.
        </h2>
        
        {/* Subheadline */}
        <p
          className={`text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-8 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Donde las ideas llegan y se pierden.
        </p>

        {/* Copy */}
        <div
          className={`space-y-2 text-lg text-gray-500 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p>Sparky escucha cuando tú no puedes escribir.</p>
          <p className="font-medium text-gray-700">Sin apps. Sin carpetas. Solo tu voz.</p>
        </div>
      </div>
    </section>
  );
};

export default VoiceSectionV3;
