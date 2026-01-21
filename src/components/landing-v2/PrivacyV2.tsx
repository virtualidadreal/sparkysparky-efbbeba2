import { useEffect, useRef, useState } from 'react';
import { Shield, Lock, Trash2 } from 'lucide-react';

/**
 * Privacy Section V2 - Tranquilidad
 * Badges simples, iconos neutros, lenguaje claro
 */
const PrivacyV2 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const privacyPoints = [
    {
      icon: Shield,
      text: 'No entrenamos modelos con tu información.',
    },
    {
      icon: Lock,
      text: 'Tienes control total sobre lo que guardas.',
    },
    {
      icon: Trash2,
      text: 'Puedes borrar tu historial cuando quieras.',
    },
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-40 px-6 bg-muted/30"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div 
          className={`mb-16 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground">
            Tus ideas son tuyas.
          </h2>
        </div>

        {/* Privacy points */}
        <div className="space-y-8">
          {privacyPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div 
                key={index}
                className={`flex items-start gap-5 transition-all duration-700 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${200 + index * 150}ms` }}
              >
                <Icon className="w-5 h-5 text-primary/70 mt-1 flex-shrink-0" strokeWidth={1.5} />
                <p className="text-lg sm:text-xl text-foreground/90 leading-relaxed">
                  {point.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PrivacyV2;
