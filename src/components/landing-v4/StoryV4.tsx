import { useEffect, useRef, useState } from 'react';
import { Award, Lightbulb, Code, Rocket } from 'lucide-react';

const StoryV4 = () => {
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

  const timelineSteps = [
    { icon: Lightbulb, year: '2024', label: 'La idea' },
    { icon: Award, year: 'Sherpa', label: 'Semifinales' },
    { icon: Code, year: '2025', label: 'Construcción' },
    { icon: Rocket, year: 'Hoy', label: 'Lanzamiento' },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 px-6 bg-[#1A1A2E]"
    >
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h2
          className={`font-serif text-3xl sm:text-4xl font-bold text-[#FAFAFA] text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Sparky nació de mi propio caos.
        </h2>

        {/* Story */}
        <div
          className={`space-y-6 text-lg text-[#FAFAFA]/80 mb-12 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p>
            Soy <span className="text-[#FFB800] font-semibold">Fran</span>. Llevo 15 años en desarrollo web y 3 especializándome en IA.
          </p>
          <p>
            Dirijo SAINI, soy VP de AI-CLM, tengo clientes, proyectos,
            y además hago música con La Résistance.
          </p>
          <p className="text-[#FAFAFA] font-semibold">
            Necesitaba algo que no existía.
          </p>
          <p>
            En 2024 presenté la idea de Sparky a los Premios Sherpa.
            Llegué a semifinales. Pero luego la vida pasó y el proyecto murió.
          </p>
          <p>
            Este año, con el poder de la IA, lo he construido yo solo.
            De concepto a producto real.
          </p>
          <p className="text-xl text-[#FF6B35] font-bold">
            Porque yo era el primer usuario que lo necesitaba.
          </p>
        </div>

        {/* Timeline */}
        <div
          className={`flex justify-between items-center max-w-md mx-auto transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {timelineSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center gap-2 relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB800] flex items-center justify-center">
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-[#FAFAFA]/60">{step.year}</span>
              <span className="text-xs text-[#FFB800] font-medium">{step.label}</span>
              {index < timelineSteps.length - 1 && (
                <div className="absolute top-6 left-12 w-16 sm:w-24 h-0.5 bg-gradient-to-r from-[#FF6B35] to-[#FFB800]/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoryV4;
