import { useEffect, useRef, useState } from 'react';

/**
 * 5 Brains V3 - Cards coloridas estilo Notion
 */
const BrainsV3 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const brains = [
    { emoji: '📁', name: 'Organizador', desc: 'Cuando todo está mezclado y necesitas claridad.', bg: 'bg-blue-50 hover:bg-blue-100' },
    { emoji: '🧭', name: 'Mentor', desc: 'Cuando quieres pensar mejor, no más rápido.', bg: 'bg-violet-50 hover:bg-violet-100' },
    { emoji: '💡', name: 'Creativo', desc: 'Cuando las ideas empiezan a encajar.', bg: 'bg-amber-50 hover:bg-amber-100' },
    { emoji: '💼', name: 'Empresarial', desc: 'Cuando una idea necesita convertirse en algo real.', bg: 'bg-emerald-50 hover:bg-emerald-100' },
    { emoji: '💬', name: 'Charleta', desc: 'Cuando solo necesitas hablar y ordenar la cabeza.', bg: 'bg-rose-50 hover:bg-rose-100' },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            No siempre necesitas lo mismo.
          </h2>
        </div>

        {/* Brain cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brains.map((brain, i) => (
            <div 
              key={i}
              className={`${brain.bg} rounded-2xl p-6 transition-all duration-300 cursor-default ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <span className="text-3xl mb-4 block">{brain.emoji}</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{brain.name}</h3>
              <p className="text-gray-600 text-sm">{brain.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrainsV3;
