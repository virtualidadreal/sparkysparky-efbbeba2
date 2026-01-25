import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';

/**
 * Comparison Section V2 - No es otra app de notas
 * Tabla de comparación Sparky vs Otras apps (Notion, Notas)
 */
const ComparisonV2 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const comparisons = [
    { 
      feature: 'Organización', 
      notion: 'Tú organizas todo',
      notas: 'Sin organización',
      sparky: 'Se organiza solo' 
    },
    { 
      feature: 'Estructura', 
      notion: 'Carpetas infinitas',
      notas: 'Lista plana',
      sparky: 'Solo 3 categorías' 
    },
    { 
      feature: 'Conexiones', 
      notion: 'Manuales',
      notas: 'No existen',
      sparky: 'Automáticas' 
    },
    { 
      feature: 'Comportamiento', 
      notion: 'Solo responde',
      notas: 'Pasivo total',
      sparky: 'Proactivo: recuerda y sugiere' 
    },
    { 
      feature: 'Input', 
      notion: 'Solo texto',
      notas: 'Solo texto/voz',
      sparky: 'Voz + texto' 
    },
    { 
      feature: 'Personalidad', 
      notion: 'Siempre de acuerdo',
      notas: 'Sin personalidad',
      sparky: 'Te desafía cuando hace falta' 
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-40 px-6 bg-muted/30"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <h2 
          className={`font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground text-center mb-16 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          No es otra app de notas.
        </h2>

        {/* Comparison table */}
        <div 
          className={`overflow-hidden rounded-2xl border border-border/50 bg-background transition-all duration-700 ease-out delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          {/* Header row */}
          <div className="grid grid-cols-4 gap-0">
            <div className="p-4 md:p-6 bg-muted/30" />
            <div className="p-4 md:p-6 bg-muted/50 text-center">
              <span className="font-semibold text-foreground/80 text-sm md:text-base">Notion</span>
            </div>
            <div className="p-4 md:p-6 bg-muted/50 text-center">
              <span className="font-semibold text-foreground/80 text-sm md:text-base">Notas</span>
            </div>
            <div className="p-4 md:p-6 bg-gradient-to-r from-primary/80 to-primary text-center">
              <span className="font-semibold text-primary-foreground text-sm md:text-base">Sparky</span>
            </div>
          </div>

          {/* Data rows */}
          {comparisons.map((row, index) => (
            <div 
              key={index}
              className={`grid grid-cols-4 gap-0 border-t border-border/30 ${
                index % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
              }`}
            >
              <div className="p-4 md:p-6 flex items-center">
                <span className="font-medium text-foreground text-sm md:text-base">{row.feature}</span>
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center gap-2 text-center">
                <X className="w-4 h-4 text-destructive/70 shrink-0 hidden sm:block" />
                <span className="text-muted-foreground text-xs md:text-sm">{row.notion}</span>
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center gap-2 text-center">
                <X className="w-4 h-4 text-destructive/70 shrink-0 hidden sm:block" />
                <span className="text-muted-foreground text-xs md:text-sm">{row.notas}</span>
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center gap-2 text-center bg-primary/5">
                <Check className="w-4 h-4 text-primary shrink-0 hidden sm:block" />
                <span className="text-foreground font-medium text-xs md:text-sm">{row.sparky}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonV2;
