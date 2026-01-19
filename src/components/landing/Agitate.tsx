/**
 * Agitate Section - Escenario doloroso que conecta emocionalmente
 */
const Agitate = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Pregunta de conexión */}
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-foreground">
          ¿Te suena esto?
        </h2>

        {/* Escenario 1 */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-border p-8 mb-8 transition-all hover:border-primary/30">
          <p className="text-lg sm:text-xl text-foreground leading-relaxed">
            Son las <span className="font-bold text-primary">3AM</span>. 
            Te despiertas con una idea increíble.
            <br /><br />
            La apuntas medio dormido.
            <br /><br />
            Tres meses después la encuentras: 
            <span className="italic text-muted-foreground"> "Podcast cosa interesante con lo otro"</span>.
            <br /><br />
            No tienes ni idea de qué significaba.
            <br /><br />
            <span className="font-bold">La chispa se apagó.</span>
          </p>
        </div>

        {/* Escenario 2 */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-border p-8 mb-12 transition-all hover:border-primary/30">
          <p className="text-lg sm:text-xl text-foreground leading-relaxed">
            O peor: descubres que la idea que tuviste en marzo 
            <span className="font-bold text-primary"> conectaba perfectamente</span> con el proyecto que empezaste en octubre.
            <br /><br />
            Pero ya es tarde. 
            <span className="font-bold"> Esa conexión nunca ocurrió.</span>
          </p>
        </div>

        {/* Hook final */}
        <p className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          ¿Cuántas conexiones así pierdes cada año?
        </p>
      </div>
    </section>
  );
};

export default Agitate;
