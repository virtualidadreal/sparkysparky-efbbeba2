import { Folder, Target, Lightbulb, Briefcase, Smile, Tag, Link, Bell, Sparkles, MessageSquare } from 'lucide-react';

/**
 * Solution Section - Los 5 Cerebros + Features
 */

interface BrainCardProps {
  icon: string;
  name: string;
  description: string;
  trigger: string;
}

const BrainCard = ({ icon, name, description, trigger }: BrainCardProps) => (
  <div className="bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-border p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:scale-105 group">
    <div className="text-4xl mb-4">{icon}</div>
    <h4 className="text-lg font-bold text-foreground mb-2">{name}</h4>
    <p className="text-muted-foreground text-sm mb-4">{description}</p>
    <p className="text-xs text-primary/80 italic group-hover:text-primary transition-colors">
      {trigger}
    </p>
  </div>
);

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Feature = ({ icon, title, description }: FeatureProps) => (
  <div className="flex items-start gap-4 p-4 rounded-xl transition-all hover:bg-card/40">
    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const Solution = () => {
  const brains = [
    { icon: '🗂️', name: 'Organizador', description: 'Tareas, pendientes, planificación', trigger: '"¿Qué tengo para hoy?"' },
    { icon: '🎯', name: 'Mentor', description: 'Dudas personales, consejos, decisiones', trigger: '"No sé qué decisión tomar"' },
    { icon: '💡', name: 'Creativo', description: 'Brainstorming, nuevas ideas, inspiración', trigger: '"Dame ideas para mi proyecto"' },
    { icon: '💼', name: 'Empresarial', description: 'Negocios, estrategia, emprendimiento', trigger: '"¿Cómo monetizo esta idea?"' },
    { icon: '😊', name: 'Charleta', description: 'Conversación casual y relajada', trigger: '"Cuéntame algo interesante"' },
  ];

  const features = [
    { icon: <Target className="w-5 h-5" />, title: 'Reconoce', description: 'Detecta si es idea, tarea o reflexión' },
    { icon: <Tag className="w-5 h-5" />, title: 'Organiza', description: 'Etiqueta automáticamente. Sin carpetas.' },
    { icon: <Link className="w-5 h-5" />, title: 'Conecta', description: 'Une ideas entre sí, aunque tengan meses de diferencia' },
    { icon: <Bell className="w-5 h-5" />, title: 'Recuerda', description: 'Te avisa de ideas olvidadas que vuelven a ser relevantes' },
    { icon: <Lightbulb className="w-5 h-5" />, title: 'Sugiere', description: 'Cada día te propone una acción concreta' },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'Desafía', description: 'Te lleva la contraria cuando hace falta' },
  ];

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Un compañero que piensa contigo.
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Le hablas o escribes como a un amigo. Él se encarga del resto.
          </p>
        </div>

        {/* Los 5 Cerebros */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
          {brains.map((brain, index) => (
            <BrainCard key={index} {...brain} />
          ))}
        </div>

        {/* Nota */}
        <p className="text-center text-muted-foreground mb-16">
          <Sparkles className="inline w-4 h-4 mr-1 text-primary" />
          Sparky detecta automáticamente qué cerebro usar.
        </p>

        {/* Features Grid */}
        <div className="bg-card/40 backdrop-blur-sm rounded-2xl border-2 border-border p-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            ¿Qué hace Sparky con tus ideas?
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Feature key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
