import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Final CTA V3 - Card grande emocional
 */
const FinalCTAV3 = () => {
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
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-gray-50">
      <div 
        className={`max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              Deja de perder ideas.
            </h2>
            <p className="text-xl text-gray-400 mb-8">
              Empieza a construir con ellas.
            </p>
            
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-medium text-lg rounded-xl hover:bg-primary/90 transition-all duration-200"
            >
              Empieza gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <p className="mt-4 text-sm text-gray-400">
              Sin tarjeta. Sin compromiso.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTAV3;
