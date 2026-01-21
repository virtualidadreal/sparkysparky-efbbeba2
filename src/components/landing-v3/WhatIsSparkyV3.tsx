import { useEffect, useRef, useState } from 'react';
import { Ear, FolderSync, Bell } from 'lucide-react';

/**
 * What Is Sparky V3 - Cards con iconos
 */
const WhatIsSparkyV3 = () => {
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

  const features = [
    { icon: Ear, text: 'Escucha tus ideas.', color: 'bg-violet-100 text-violet-600' },
    { icon: FolderSync, text: 'Las ordena sin que tengas que hacerlo tú.', color: 'bg-amber-100 text-amber-600' },
    { icon: Bell, text: 'Y vuelve a sacarlas cuando importa.', color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-lg text-gray-400 mb-4">Sparky no es una app de notas.</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">
            Es un compañero para<br />pensar mejor.
          </h2>
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div 
                key={i}
                className={`bg-gray-50 rounded-2xl p-8 text-center transition-all duration-700 hover:bg-gray-100 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${200 + i * 150}ms` }}
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-lg text-gray-700 font-medium">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSparkyV3;
