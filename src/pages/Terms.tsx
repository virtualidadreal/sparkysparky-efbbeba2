import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { SEOHead } from '@/components/seo';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Términos de Servicio"
        description="Términos y condiciones de uso de Sparky. Lee nuestros términos de servicio antes de crear tu cuenta."
        canonical="/terms"
        noindex={false}
      />
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            to="/auth" 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Volver"
          >
            <ArrowLeftIcon className="h-5 w-5 text-muted-foreground" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Términos de Servicio</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-sm mb-8">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Aceptación de los Términos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Al acceder y utilizar Sparky, aceptas estar sujeto a estos Términos de Servicio. 
              Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar el servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Descripción del Servicio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sparky es una aplicación de productividad personal con asistente de inteligencia artificial 
              que te permite gestionar ideas, tareas, proyectos, contactos y entradas de diario. 
              El servicio incluye funcionalidades de captura por voz, análisis de patrones y 
              recomendaciones personalizadas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Registro y Cuenta</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Debes proporcionar información veraz y actualizada al registrarte.</li>
              <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
              <li>Debes notificarnos inmediatamente cualquier uso no autorizado de tu cuenta.</li>
              <li>No puedes usar el servicio si eres menor de 16 años.</li>
              <li>Una persona solo puede tener una cuenta activa.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Uso Aceptable</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Al utilizar Sparky, te comprometes a NO:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Usar el servicio para actividades ilegales o no autorizadas.</li>
              <li>Intentar acceder a datos de otros usuarios.</li>
              <li>Interferir con el funcionamiento normal del servicio.</li>
              <li>Utilizar bots, scripts o herramientas automatizadas no autorizadas.</li>
              <li>Subir contenido malicioso, ofensivo o que viole derechos de terceros.</li>
              <li>Revender o redistribuir el servicio sin autorización.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Propiedad Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Tu contenido:</strong> Mantienes todos los derechos sobre el contenido que creas 
              en Sparky (ideas, tareas, proyectos, etc.). Nos otorgas una licencia limitada para 
              almacenar y procesar ese contenido únicamente para proporcionarte el servicio.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Nuestro servicio:</strong> Sparky, incluyendo su diseño, código, logotipos y 
              funcionalidades, es propiedad nuestra y está protegido por leyes de propiedad intelectual.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Planes y Pagos</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Plan Gratuito:</strong> Incluye 10 generaciones de IA por mes con funcionalidades básicas.</li>
              <li><strong>Plan Pro:</strong> Generaciones ilimitadas y acceso a todas las funcionalidades.</li>
              <li>Los precios pueden cambiar con previo aviso de 30 días.</li>
              <li>Los pagos son no reembolsables, excepto cuando la ley lo requiera.</li>
              <li>Puedes cancelar tu suscripción en cualquier momento.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Uso de Inteligencia Artificial</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El asistente Sparky utiliza modelos de IA para proporcionar respuestas y sugerencias:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Las respuestas de la IA son sugerencias y no deben considerarse asesoramiento profesional.</li>
              <li>No garantizamos la precisión, completitud o idoneidad de las respuestas de la IA.</li>
              <li>Eres responsable de las decisiones que tomes basándote en las sugerencias de Sparky.</li>
              <li>El servicio de IA puede tener límites de uso según tu plan.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Disponibilidad del Servicio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nos esforzamos por mantener Sparky disponible las 24 horas del día, los 7 días de la semana. 
              Sin embargo, no garantizamos una disponibilidad ininterrumpida. Podemos realizar 
              mantenimientos programados o enfrentar interrupciones técnicas. Te notificaremos 
              con antelación cuando sea posible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              En la máxima medida permitida por la ley, Sparky se proporciona "tal cual" y "según disponibilidad". 
              No seremos responsables de daños indirectos, incidentales, especiales o consecuentes 
              derivados del uso o la imposibilidad de uso del servicio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Terminación</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Podemos suspender o terminar tu acceso al servicio si:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Violas estos Términos de Servicio.</li>
              <li>Tu uso pone en riesgo el servicio o a otros usuarios.</li>
              <li>No pagas las tarifas correspondientes (para planes de pago).</li>
              <li>Lo requiere la ley o una autoridad competente.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Puedes eliminar tu cuenta en cualquier momento desde la configuración. 
              Al hacerlo, perderás acceso a todos tus datos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Cambios en los Términos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos modificar estos términos ocasionalmente. Los cambios significativos se 
              notificarán con al menos 30 días de antelación. El uso continuado del servicio 
              después de los cambios constituye tu aceptación de los nuevos términos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Ley Aplicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estos términos se rigen por las leyes aplicables. Cualquier disputa se resolverá 
              preferentemente mediante negociación directa. En caso de no alcanzar un acuerdo, 
              las partes se someterán a los tribunales competentes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos 
              a través de la aplicación o enviando un email a nuestro equipo de soporte.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <Link 
              to="/auth" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;