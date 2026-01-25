import { useEffect, useRef, useState } from 'react';

/**
 * Problem V3 - El 90% de tus ideas nunca llegan a nada
 * With stat cards
 */
const ProblemV3 = () => {
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

  const stats = [
    { number: '47', label: 'notas en el móvil', sublabel: '(no sabes qué hay en 43)' },
    { number: '12', label: 'documentos abiertos', sublabel: '(sin revisar)' },
    { number: '∞', label: 'ideas perdidas', sublabel: '(que podrían haber sido algo)' },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-[#F5F3EE]">
      <div className="max-w-4xl mx-auto text-center">
        {/* Title */}
        <h2
          className={`text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          El 90% de tus ideas nunca llegan a nada.
        </h2>

        {/* Copy */}
        <div className="space-y-4 mb-12">
          <p
            className={`text-lg sm:text-xl font-semibold text-gray-900 transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            No porque sean malas.
          </p>

          <p
            className={`text-lg text-gray-500 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Sino porque las apuntas en una nota, las olvidas en una carpeta,
            o directamente se evaporan antes de que llegues a escribirlas.
          </p>
        </div>

        {/* Stat cards */}
        <div
          className={`grid sm:grid-cols-3 gap-4 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <span className="text-5xl sm:text-6xl font-bold text-primary block mb-2">
                {stat.number}
              </span>
              <p className="text-gray-900 font-medium">{stat.label}</p>
              <p className="text-sm text-gray-400">{stat.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemV3;
