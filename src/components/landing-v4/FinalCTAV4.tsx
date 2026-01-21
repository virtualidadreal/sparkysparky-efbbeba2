import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const FinalCTAV4 = () => {
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
      className="py-32 px-6 bg-gradient-to-b from-[#FFF5EB] to-[#FFF8F0]"
    >
      <div className="max-w-3xl mx-auto text-center">
        {/* Headline */}
        <h2
          className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#2D3436] mb-6 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Tus ideas merecen algo mejor
          <br />
          que una nota olvidada.
        </h2>

        {/* CTA Button */}
        <div
          className={`transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB800] text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-xl shadow-[#FF6B35]/30 hover:shadow-2xl hover:shadow-[#FF6B35]/40 hover:-translate-y-1 transition-all duration-300"
          >
            <Sparkles className="w-6 h-6" />
            Guardar mi primera chispa
          </Link>
        </div>

        {/* Tagline */}
        <p
          className={`mt-6 text-lg text-[#636E72] italic transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Las chispas no se apagan si las guardas bien.
        </p>
      </div>
    </section>
  );
};

export default FinalCTAV4;
