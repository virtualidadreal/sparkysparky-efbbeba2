import { useEffect, useRef, useState } from 'react';

const ProblemV4 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6 bg-[#FFF5EB]"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Title */}
        <h2
          className={`font-serif text-4xl sm:text-5xl font-bold text-[#2D3436] mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          El 90% de tus ideas nunca llegan a nada.
        </h2>

        {/* Copy with staggered animation */}
        <div className="space-y-6 text-lg sm:text-xl text-[#636E72]">
          <p
            className={`font-semibold text-[#2D3436] transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            No porque sean malas.
          </p>

          <p
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Sino porque las apuntas en una nota, las olvidas en una carpeta,
            o directamente se evaporan antes de que llegues a escribirlas.
          </p>

          <p
            className={`transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Tienes <span className="text-[#FF6B35] font-bold">47 notas</span> en el móvil.{' '}
            <span className="text-[#FF6B35] font-bold">12 documentos</span> abiertos.
            Una idea brillante de hace 3 meses que sabes que era buena pero no encuentras.
          </p>

          <div
            className={`pt-8 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-[#2D3436] font-medium mb-2">Y lo peor no es perderlas.</p>
            <p className="text-[#2D3436] italic">
              Lo peor es esa sensación a las 3 de la mañana:
            </p>
            <p className="text-2xl font-serif font-bold text-[#FF6B35] mt-4">
              "¿Cómo se llamaba aquello que pensé?"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemV4;
