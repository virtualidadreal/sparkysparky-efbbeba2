import { useEffect, useRef, useState } from 'react';
import { X, Check, Minus } from 'lucide-react';

/**
 * Comparison V3 - Tabla comparativa Notion vs Notas vs Sparky
 */
const ComparisonV3 = () => {
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
    { feature: 'Organización', notion: 'Tú organizas todo', notas: 'Sin organización', sparky: 'Se organiza solo' },
    { feature: 'Estructura', notion: 'Carpetas + bases de datos', notas: 'Lista infinita', sparky: 'IA contextual' },
    { feature: 'Conexiones', notion: 'Manuales con links', notas: 'No existen', sparky: 'Automáticas' },
    { feature: 'Recordatorios', notion: 'Tú los configuras', notas: 'Básicos', sparky: 'Proactivos e inteligentes' },
    { feature: 'Voz', notion: 'No nativo', notas: 'Transcripción básica', sparky: 'Voz → Idea estructurada' },
    { feature: 'Curva de aprendizaje', notion: 'Alta', notas: 'Baja', sparky: 'Cero' },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-lg text-gray-400 mb-4">La comparación inevitable.</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            ¿Por qué Sparky y no otra cosa?
          </h2>
        </div>

        {/* Comparison table */}
        <div className={`bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Header row */}
          <div className="grid grid-cols-4 border-b border-gray-100">
            <div className="p-4 sm:p-6"></div>
            <div className="p-4 sm:p-6 text-center bg-gray-50">
              <span className="text-sm font-medium text-gray-500">📝 Notion</span>
            </div>
            <div className="p-4 sm:p-6 text-center bg-gray-50">
              <span className="text-sm font-medium text-gray-500">📱 Notas</span>
            </div>
            <div className="p-4 sm:p-6 text-center bg-primary/10">
              <span className="text-sm font-bold text-primary">✨ Sparky</span>
            </div>
          </div>
          
          {/* Rows */}
          {comparisons.map((row, i) => (
            <div key={i} className="grid grid-cols-4 border-b border-gray-50 last:border-0">
              <div className="p-4 sm:p-6 flex items-center text-gray-900 font-medium text-sm sm:text-base">
                {row.feature}
              </div>
              <div className="p-4 sm:p-6 flex items-center justify-center gap-2 text-gray-400 text-xs sm:text-sm text-center">
                <Minus className="w-4 h-4 text-gray-300 hidden sm:block flex-shrink-0" />
                <span>{row.notion}</span>
              </div>
              <div className="p-4 sm:p-6 flex items-center justify-center gap-2 text-gray-400 text-xs sm:text-sm text-center">
                <X className="w-4 h-4 text-gray-300 hidden sm:block flex-shrink-0" />
                <span>{row.notas}</span>
              </div>
              <div className="p-4 sm:p-6 flex items-center justify-center gap-2 text-gray-900 bg-primary/5 text-xs sm:text-sm text-center">
                <Check className="w-4 h-4 text-primary hidden sm:block flex-shrink-0" />
                <span className="font-medium">{row.sparky}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonV3;
