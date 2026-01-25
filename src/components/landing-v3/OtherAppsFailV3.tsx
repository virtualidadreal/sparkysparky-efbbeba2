import { useEffect, useRef, useState } from 'react';
import { FileText, Folder, Link2 } from 'lucide-react';

/**
 * Other Apps Fail V3 - Por qué otras apps no funcionan
 */
const OtherAppsFailV3 = () => {
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

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        {/* Title */}
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Notion, Obsidian, notas de voz...
        </h2>
        <p
          className={`text-2xl sm:text-3xl text-gray-400 mb-12 transition-all duration-700 delay-100 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          El problema no es capturar.
        </p>

        {/* Icons row */}
        <div
          className={`flex justify-center gap-6 mb-12 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center opacity-50">
            <FileText className="w-7 h-7 text-gray-400" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center opacity-50">
            <Folder className="w-7 h-7 text-gray-400" />
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center opacity-50">
            <Link2 className="w-7 h-7 text-gray-400" />
          </div>
        </div>

        {/* Copy */}
        <div
          className={`space-y-4 text-lg sm:text-xl text-gray-500 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p>
            Es que luego esas ideas <span className="text-gray-900 font-semibold">no hacen nada solas.</span>
          </p>
          <p>
            Tú tienes que organizarlas, etiquetarlas, conectarlas.
          </p>
          <div className="pt-6">
            <span className="inline-block bg-gray-100 rounded-2xl px-6 py-4 text-xl sm:text-2xl font-bold text-gray-900">
              Y no tienes tiempo. ⏰
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OtherAppsFailV3;
