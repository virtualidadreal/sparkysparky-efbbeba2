import { useEffect, useRef, useState } from 'react';
import { Shield, Lock, Trash2 } from 'lucide-react';

/**
 * Privacy V3 - Badges simples
 */
const PrivacyV3 = () => {
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

  const points = [
    { icon: Shield, text: 'No entrenamos modelos con tu información.' },
    { icon: Lock, text: 'Tienes control total sobre lo que guardas.' },
    { icon: Trash2, text: 'Puedes borrar tu historial cuando quieras.' },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="text-4xl mb-4 block">🔐</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Tus ideas son tuyas.
          </h2>
        </div>

        {/* Points */}
        <div className="flex flex-wrap justify-center gap-4">
          {points.map((point, i) => {
            const Icon = point.icon;
            return (
              <div 
                key={i}
                className={`inline-flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-full transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${200 + i * 100}ms` }}
              >
                <Icon className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">{point.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PrivacyV3;
