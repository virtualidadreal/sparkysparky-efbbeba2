import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';

const comparisonData = [
  { feature: 'Organización', others: 'Tú organizas todo', sparky: 'Se organiza solo' },
  { feature: 'Estructura', others: 'Carpetas infinitas', sparky: 'Solo 3 categorías' },
  { feature: 'Conexiones', others: 'Manuales', sparky: 'Automáticas' },
  { feature: 'Comportamiento', others: 'Solo responde', sparky: 'Proactivo: recuerda y sugiere' },
  { feature: 'Input', others: 'Solo texto', sparky: 'Voz + texto' },
  { feature: 'Personalidad', others: 'Siempre de acuerdo', sparky: 'Te desafía cuando hace falta' },
];

const ComparisonV4 = () => {
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
      className="py-24 px-6 bg-[#FFF8F0]"
    >
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2
          className={`font-serif text-3xl sm:text-4xl font-bold text-[#2D3436] text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          No es otra app de notas.
        </h2>

        {/* Comparison Table */}
        <div
          className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Header */}
          <div className="grid grid-cols-3 bg-[#2D3436] text-white">
            <div className="p-4 font-semibold" />
            <div className="p-4 font-semibold text-center border-l border-white/10">Otras apps</div>
            <div className="p-4 font-semibold text-center border-l border-white/10 bg-gradient-to-r from-[#FF6B35] to-[#FFB800]">
              Sparky
            </div>
          </div>

          {/* Rows */}
          {comparisonData.map((row, index) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 border-b border-[#FFB800]/10 last:border-b-0 ${
                index % 2 === 0 ? 'bg-[#FFF8F0]/50' : 'bg-white'
              }`}
            >
              <div className="p-4 font-medium text-[#2D3436]">{row.feature}</div>
              <div className="p-4 text-center border-l border-[#FFB800]/10 text-[#636E72] flex items-center justify-center gap-2">
                <X className="w-4 h-4 text-[#E17055] shrink-0" />
                <span className="text-sm">{row.others}</span>
              </div>
              <div className="p-4 text-center border-l border-[#FFB800]/10 text-[#2D3436] flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-[#00B894] shrink-0" />
                <span className="text-sm font-medium">{row.sparky}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonV4;
