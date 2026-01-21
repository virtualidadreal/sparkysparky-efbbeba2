import { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';

/**
 * Different V3 - Comparación visual
 */
const DifferentV3 = () => {
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

  const comparisons = [
    { others: 'Te pide que organices', sparky: 'Se organiza solo' },
    { others: 'Te obliga a crear sistemas', sparky: 'Entiende tu caos' },
    { others: 'Se queda callado', sparky: 'Te avisa cuando importa' },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-lg text-gray-400 mb-4">Algunas herramientas esperan que trabajes.</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Sparky trabaja contigo.
          </h2>
        </div>

        {/* Comparison table */}
        <div className={`bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Header row */}
          <div className="grid grid-cols-2 border-b border-gray-100">
            <div className="p-6 text-center bg-gray-50">
              <span className="text-sm font-medium text-gray-400">Otras apps</span>
            </div>
            <div className="p-6 text-center bg-primary/10">
              <span className="text-sm font-bold text-primary">Sparky ✨</span>
            </div>
          </div>
          
          {/* Rows */}
          {comparisons.map((row, i) => (
            <div key={i} className="grid grid-cols-2 border-b border-gray-50 last:border-0">
              <div className="p-6 flex items-center gap-3 text-gray-400">
                <X className="w-5 h-5 text-gray-300" />
                <span>{row.others}</span>
              </div>
              <div className="p-6 flex items-center gap-3 text-gray-900 bg-primary/5">
                <Check className="w-5 h-5 text-primary" />
                <span className="font-medium">{row.sparky}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferentV3;
