import { useEffect, useRef, useState } from 'react';
import { Shield, Lock, History, Trash2 } from 'lucide-react';

const badges = [
  { icon: Shield, text: 'Tus datos son tuyos' },
  { icon: Lock, text: 'Sin acceso a terceros' },
  { icon: History, text: 'Historial controlado' },
  { icon: Trash2, text: 'Borrado cuando quieras' },
];

const PrivacyBadgesV4 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-12 px-6 bg-[#FFF8F0] border-y border-[#FFB800]/20"
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`flex flex-wrap justify-center gap-6 sm:gap-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {badges.map((badge, index) => (
            <div
              key={badge.text}
              className="flex items-center gap-2 text-[#636E72]"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <badge.icon className="w-5 h-5 text-[#00B894]" />
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrivacyBadgesV4;
