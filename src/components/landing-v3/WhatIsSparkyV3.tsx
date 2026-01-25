import { useEffect, useRef, useState } from 'react';
import { Ear, FolderSync, Link2, Bell, Lightbulb, Mic } from 'lucide-react';

/**
 * What Is Sparky V3 - 6 feature cards
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
    { icon: Ear, emoji: '👂', title: 'Reconoce', desc: 'Entiende de qué hablas sin que tú se lo expliques.', color: 'bg-violet-100 text-violet-600' },
    { icon: FolderSync, emoji: '📁', title: 'Organiza', desc: 'Clasifica y etiqueta automáticamente cada idea.', color: 'bg-amber-100 text-amber-600' },
    { icon: Link2, emoji: '🔗', title: 'Conecta', desc: 'Encuentra relaciones entre ideas que tú no veías.', color: 'bg-blue-100 text-blue-600' },
    { icon: Bell, emoji: '🔔', title: 'Recuerda', desc: 'Te avisa cuando una idea es relevante.', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Lightbulb, emoji: '💡', title: 'Sugiere', desc: 'Propone acciones basadas en lo que piensas.', color: 'bg-pink-100 text-pink-600' },
    { icon: Mic, emoji: '🎤', title: 'Voice-first', desc: 'Habla y Sparky hace el resto.', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-lg text-gray-400 mb-4">Sparky no es una app de notas.</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            Es un compañero para pensar mejor.
          </h2>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div 
                key={i}
                className={`bg-gray-50 rounded-2xl p-6 transition-all duration-700 hover:bg-gray-100 hover:-translate-y-1 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${200 + i * 100}ms` }}
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {feature.emoji} {feature.title}
                </h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhatIsSparkyV3;
