import { useEffect, useRef, useState } from 'react';

/**
 * How It Works V3 - Timeline visual
 */
const HowItWorksV3 = () => {
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

  const steps = [
    { num: '01', title: 'Habla', desc: 'Dile a Sparky lo que se te pase por la cabeza.', emoji: '🎤' },
    { num: '02', title: 'Sparky escucha', desc: 'Capta el contexto, no solo las palabras.', emoji: '🧠' },
    { num: '03', title: 'Sparky ordena', desc: 'Conecta ideas, tareas y pensamientos sin carpetas ni etiquetas.', emoji: '✨' },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-20 left-[16%] right-[16%] h-0.5 bg-gray-200" />
          
          {steps.map((step, i) => (
            <div 
              key={i}
              className={`relative transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              {/* Number bubble */}
              <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center mx-auto mb-6 relative z-10">
                <span className="text-2xl">{step.emoji}</span>
              </div>
              
              {/* Content */}
              <div className="text-center">
                <span className="text-xs font-bold text-gray-300 tracking-widest">{step.num}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksV3;
