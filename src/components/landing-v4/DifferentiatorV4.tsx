import { useEffect, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';

const DifferentiatorV4 = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-32 px-6 bg-gradient-to-br from-[#FF6B35] to-[#FFB800] relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-48 h-48 border-4 border-white rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border-4 border-white rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Icon */}
        <div
          className={`w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-700 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <MessageSquare className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h2
          className={`font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          No es complaciente.
        </h2>

        {/* Copy */}
        <div
          className={`space-y-6 text-xl sm:text-2xl text-white/90 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p>No quieres un asistente que solo diga que sí.</p>
          <p className="font-semibold text-white">
            Sparky te lleva la contraria cuando hace falta.
          </p>
          <p className="text-lg text-white/80 pt-4">
            Porque las mejores ideas sobreviven al escrutinio.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorV4;
