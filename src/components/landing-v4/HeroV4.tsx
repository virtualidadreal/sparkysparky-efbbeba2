import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

// Spark particle component
const SparkParticle = ({ delay, left }: { delay: number; left: number }) => (
  <div
    className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-t from-[#FF6B35] to-[#FFD700] animate-spark"
    style={{
      left: `${left}%`,
      bottom: '10%',
      animationDelay: `${delay}s`,
    }}
  />
);

const HeroV4 = () => {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate random spark particles
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF8F0] to-[#FFF5EB] overflow-hidden pt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Warm gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#FFB800]/10 rounded-full blur-3xl" />
        
        {/* Spark particles */}
        {particles.map((p) => (
          <SparkParticle key={p.id} delay={p.delay} left={p.left} />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md mb-8 border border-[#FFB800]/30">
          <Sparkles className="w-4 h-4 text-[#FF6B35]" />
          <span className="text-sm font-medium text-[#2D3436]">
            50 plazas con 3 meses Premium gratis
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-[#2D3436] mb-6 leading-tight">
          Recuerda todo.
          <br />
          <span className="bg-gradient-to-r from-[#FF6B35] to-[#FFB800] bg-clip-text text-transparent">
            Sin organizar nada.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-[#636E72] max-w-2xl mx-auto mb-10">
          El compañero de IA que recuerda lo que tú olvidas.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <Link
            to="/signup"
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB800] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#FF6B35]/30 hover:shadow-2xl hover:shadow-[#FF6B35]/40 hover:-translate-y-1 transition-all duration-300"
          >
            <Sparkles className="w-5 h-5" />
            Guardar mi primera chispa
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FFD700]" />
            </span>
          </Link>
          <p className="text-sm text-[#636E72]">
            Gratis. Sin tarjeta.
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-[#FF6B35]/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-2.5 bg-[#FF6B35] rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Custom spark animation styles */}
      <style>{`
        @keyframes spark {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0);
          }
          10% {
            opacity: 1;
            transform: translateY(-10px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(0.5);
          }
        }
        .animate-spark {
          animation: spark 4s ease-out infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroV4;
