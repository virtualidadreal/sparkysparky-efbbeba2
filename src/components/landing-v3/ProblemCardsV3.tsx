import { useEffect, useRef, useState } from 'react';
import { Brain, Search, Clock, Unlink } from 'lucide-react';

/**
 * Problem Cards V3 - Dark section with pain points
 */
const ProblemCardsV3 = () => {
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

  const problems = [
    {
      icon: Brain,
      title: 'Tienes demasiadas ideas',
      desc: 'En la ducha, conduciendo, a las 3am... pero cuando las necesitas, desaparecen.',
    },
    {
      icon: Search,
      title: 'No encuentras nada',
      desc: 'Notas en 5 apps diferentes. Capturas sin contexto. Folders que nunca abres.',
    },
    {
      icon: Clock,
      title: 'Organizar te agota',
      desc: 'Cada sistema que pruebas empieza bien y muere en 2 semanas.',
    },
    {
      icon: Unlink,
      title: 'Pierdes conexiones',
      desc: 'Esa idea de hace 3 meses era perfecta para el proyecto de hoy. Pero ya no la recuerdas.',
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-[#1C1917]">
      <div className="max-w-5xl mx-auto">
        {/* Badge */}
        <div
          className={`flex justify-center mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="px-4 py-2 bg-rose-500/20 text-rose-300 text-sm font-medium rounded-full">
            El problema
          </span>
        </div>

        {/* Headline */}
        <div
          className={`text-center mb-16 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#D4C8B8] mb-4">
            Tu cerebro es genial para crear.
          </h2>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
            Terrible para almacenar.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {problems.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <div
                key={i}
                className={`bg-[#292524] border border-[#44403C] rounded-2xl p-6 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${200 + i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-lg font-bold text-[#E7E5E4] mb-2">{problem.title}</h3>
                <p className="text-[#A8A29E]">{problem.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Closing statement */}
        <p
          className={`text-center mt-12 text-lg text-[#A8A29E] transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          El conocimiento que no puedes encontrar{' '}
          <span className="text-[#E7E5E4] font-semibold">es conocimiento que no tienes.</span>
        </p>
      </div>
    </section>
  );
};

export default ProblemCardsV3;
