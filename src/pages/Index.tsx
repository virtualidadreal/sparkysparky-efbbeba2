import { Sparkles, Zap, Star, Rocket } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo/Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 transform rotate-12 hover:rotate-0 transition-transform duration-500">
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-bounce" />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-center mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Sparky Sparkle
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground text-center max-w-2xl mb-12">
          Tu app de chispas creativas y magia digital ✨
        </p>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Rápido"
            description="Rendimiento ultrarrápido para una experiencia fluida"
          />
          <FeatureCard
            icon={<Star className="w-8 h-8" />}
            title="Brillante"
            description="Diseño moderno que destaca y cautiva"
          />
          <FeatureCard
            icon={<Rocket className="w-8 h-8" />}
            title="Potente"
            description="Funcionalidades que impulsan tus ideas"
          />
        </div>

        {/* CTA Button */}
        <button className="mt-12 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-full shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300">
          Comenzar ahora
        </button>
      </div>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => (
  <div className="group p-6 bg-card/80 backdrop-blur-sm rounded-2xl border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
