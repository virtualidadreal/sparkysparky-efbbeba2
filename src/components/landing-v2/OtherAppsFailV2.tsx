import { useEffect, useRef, useState } from 'react';
import { FileText, FolderOpen, Link2 } from 'lucide-react';

/**
 * Other Apps Fail Section V2 - El problema no es capturar
 * Diseño minimalista con iconos sutiles
 */
const OtherAppsFailV2 = () => {
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

  return (
    <section 
      ref={sectionRef}
      className="py-32 md:py-40 px-6 bg-muted/30"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Main headline */}
        <h2 
          className={`font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight mb-4 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Notion, Obsidian, notas de voz...
        </h2>
        <p 
          className={`font-serif text-2xl sm:text-3xl md:text-4xl text-foreground/80 mb-12 transition-all duration-700 ease-out delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          El problema no es capturar.
        </p>

        {/* Icons */}
        <div 
          className={`flex justify-center gap-8 mb-12 transition-all duration-700 ease-out delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center">
            <FileText className="w-6 h-6 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center">
            <Link2 className="w-6 h-6 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
        </div>

        {/* Problem explanation */}
        <p 
          className={`text-lg text-muted-foreground mb-3 transition-all duration-700 ease-out delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Es que luego esas ideas <span className="text-foreground font-semibold">no hacen nada solas.</span>
        </p>
        
        <p 
          className={`text-lg text-muted-foreground mb-8 transition-all duration-700 ease-out delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Tú tienes que organizarlas, etiquetarlas, conectarlas.
        </p>

        {/* Punch line */}
        <p 
          className={`text-primary font-semibold text-xl sm:text-2xl transition-all duration-700 ease-out delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Y no tienes tiempo.
        </p>
      </div>
    </section>
  );
};

export default OtherAppsFailV2;
