import { useEffect, useRef, useState } from 'react';
import { FileText, Folder, Link2 } from 'lucide-react';

const OtherAppsFailV4 = () => {
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
    <section
      ref={sectionRef}
      className="py-24 px-6 bg-[#FFF8F0]"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Title */}
        <h2
          className={`font-serif text-3xl sm:text-4xl font-bold text-[#2D3436] mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Notion, Obsidian, notas de voz...
          <br />
          <span className="text-[#636E72]">El problema no es capturar.</span>
        </h2>

        {/* Icons row */}
        <div
          className={`flex justify-center gap-6 mb-10 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-[#2D3436]/10 flex items-center justify-center opacity-40">
            <FileText className="w-6 h-6 text-[#636E72]" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#2D3436]/10 flex items-center justify-center opacity-40">
            <Folder className="w-6 h-6 text-[#636E72]" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#2D3436]/10 flex items-center justify-center opacity-40">
            <Link2 className="w-6 h-6 text-[#636E72]" />
          </div>
        </div>

        {/* Copy */}
        <div
          className={`space-y-4 text-lg sm:text-xl text-[#636E72] transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p>
            Es que luego esas ideas <span className="text-[#2D3436] font-semibold">no hacen nada solas.</span>
          </p>
          <p>
            Tú tienes que organizarlas, etiquetarlas, conectarlas.
          </p>
          <p className="text-[#FF6B35] font-bold text-2xl pt-4">
            Y no tienes tiempo.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OtherAppsFailV4;
