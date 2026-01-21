import { useEffect, useRef, useState } from 'react';

/**
 * Problem V3 - Estilo Notion con cards
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

  const moments = [
    { emoji: '💬', text: 'En medio de una conversación.' },
    { emoji: '🚶', text: 'Dando un paseo.' },
    { emoji: '🌙', text: 'Justo antes de dormir.' },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            No te faltan ideas.
          </h2>
          <p className="text-2xl sm:text-3xl text-gray-400">
            Te falta un lugar donde no se pierdan.
          </p>
        </div>

        {/* Problem cards */}
        <div className={`mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-center text-lg text-gray-500 mb-8">
            Aparecen cuando no toca.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {moments.map((item, i) => (
              <div 
                key={i}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                style={{ transitionDelay: `${300 + i * 100}ms` }}
              >
                <span className="text-4xl mb-4 block">{item.emoji}</span>
                <p className="text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div className={`text-center transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-block bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-100">
            <p className="text-lg text-gray-900 mb-2">Las apuntas rápido.</p>
            <p className="text-lg text-gray-400">Y luego desaparecen. 💨</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemV3;
