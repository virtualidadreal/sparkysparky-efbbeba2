import { useEffect, useRef, useState } from 'react';
import { Target, Tag, Link2, Bell, Lightbulb, Mic } from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Reconoce',
    description: 'Detecta si es una idea, una tarea o una reflexión personal',
    emoji: '🎯',
  },
  {
    icon: Tag,
    title: 'Organiza',
    description: 'Etiqueta y categoriza sin que hagas nada. Sin carpetas.',
    emoji: '🏷️',
  },
  {
    icon: Link2,
    title: 'Conecta',
    description: 'Une ideas entre sí aunque tengan meses de diferencia',
    emoji: '🔗',
  },
  {
    icon: Bell,
    title: 'Recuerda',
    description: 'Te avisa de ideas olvidadas que vuelven a ser relevantes',
    emoji: '🔔',
  },
  {
    icon: Lightbulb,
    title: 'Sugiere',
    description: 'Cada día te propone una acción basada en lo que le has contado',
    emoji: '💡',
  },
  {
    icon: Mic,
    title: 'Voice-first',
    description: 'Pensado para hablar. A las 2AM no quieres un teclado.',
    emoji: '🎤',
  },
];

const FeaturesV4 = () => {
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

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="py-24 px-6 bg-[#FFF5EB]"
    >
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <h2
            className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D3436] mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Sparky es tu compañero de IA
            <br />
            <span className="text-[#FF6B35]">que piensa contigo.</span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-[#636E72] transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Le hablas o escribes como a un amigo. Él se encarga del resto.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`bg-white rounded-2xl p-6 shadow-lg shadow-[#FF6B35]/5 border border-[#FFB800]/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB800]/10 flex items-center justify-center text-2xl">
                  {feature.emoji}
                </div>
                <h3 className="text-xl font-bold text-[#2D3436]">{feature.title}</h3>
              </div>
              <p className="text-[#636E72]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesV4;
