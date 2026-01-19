import { Badge } from '@/components/ui/badge';
import { Award, Code, Users } from 'lucide-react';

/**
 * Credibility Section - Historia del fundador
 */
const Credibility = () => {
  const badges = [
    { icon: Award, label: 'Semifinalista Premios Sherpa 2024' },
    { icon: Code, label: '15 años desarrollo web' },
    { icon: Users, label: 'VP AI-CLM' },
  ];

  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* Título */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-foreground">
          Sparky nació de mi propio caos.
        </h2>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Avatar y nombre */}
          <div className="md:col-span-1 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-4 border-primary/50 flex items-center justify-center text-5xl mb-4">
              👨‍💻
            </div>
            <h3 className="text-xl font-bold text-foreground">Fran</h3>
            <p className="text-muted-foreground">Creador de Sparky</p>
          </div>

          {/* Historia */}
          <div className="md:col-span-2 bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-border p-8">
            <div className="space-y-4 text-foreground">
              <p>
                <span className="font-bold">15 años en desarrollo web, 3 especializándome en IA.</span>
              </p>
              <p>
                Dirijo SAINI (agentes de IA para empresas), soy VP de AI-CLM, 
                tengo clientes, proyectos, y además hago música con La Résistance.
              </p>
              <p className="font-bold text-primary">
                Necesitaba algo que no existía.
              </p>
              <p>
                En 2024 presenté Sparky a los Premios Sherpa. Llegué a semifinales.
                Luego la vida pasó y el proyecto murió.
              </p>
              <p>
                Este año, con el poder de la IA, <span className="font-bold">lo he construido yo solo</span>.
                De concepto a producto real.
              </p>
              <p className="text-lg font-bold text-primary">
                Porque yo era el primer usuario que lo necesitaba.
              </p>
            </div>
          </div>
        </div>

        {/* Badges de credibilidad */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {badges.map((badge, index) => (
            <Badge 
              key={index}
              variant="outline" 
              className="px-4 py-2 text-sm bg-card/60 border-primary/30"
            >
              <badge.icon className="w-4 h-4 mr-2" />
              {badge.label}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Credibility;
