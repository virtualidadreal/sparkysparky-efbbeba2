import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-xl font-semibold text-foreground">Política de Privacidad</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-muted-foreground text-sm mb-8">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introducción</h2>
            <p className="text-muted-foreground leading-relaxed">
              En Sparky nos tomamos muy en serio la privacidad de nuestros usuarios. Esta Política de Privacidad 
              explica cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando utilizas 
              nuestra aplicación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Información que Recopilamos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Recopilamos los siguientes tipos de información:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Información de cuenta:</strong> Email, nombre y contraseña encriptada al registrarte.</li>
              <li><strong>Contenido del usuario:</strong> Ideas, tareas, proyectos, entradas de diario y contactos que creas en la aplicación.</li>
              <li><strong>Datos de uso:</strong> Información sobre cómo interactúas con la aplicación para mejorar el servicio.</li>
              <li><strong>Grabaciones de voz:</strong> Audios que captures voluntariamente para transcripción, procesados de forma segura.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Cómo Usamos tu Información</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Utilizamos tu información para:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Proporcionar y mantener el servicio de Sparky.</li>
              <li>Personalizar tu experiencia con el asistente IA basándose en tu información.</li>
              <li>Procesar y transcribir capturas de voz.</li>
              <li>Detectar patrones y generar insights personalizados.</li>
              <li>Enviar notificaciones relacionadas con el servicio (si las activas).</li>
              <li>Mejorar y optimizar la aplicación.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Almacenamiento y Seguridad</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Tu seguridad es nuestra prioridad:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Todos los datos se almacenan en servidores seguros con encriptación.</li>
              <li>Las contraseñas se almacenan con hash seguro (nunca en texto plano).</li>
              <li>Utilizamos Row Level Security (RLS) para garantizar que solo tú puedas acceder a tus datos.</li>
              <li>Las conexiones se realizan mediante HTTPS/TLS.</li>
              <li>Las grabaciones de voz se procesan de forma segura y puedes eliminarlas en cualquier momento.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Inteligencia Artificial</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Sparky utiliza IA para proporcionarte una experiencia personalizada:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>El asistente IA accede a TU información personal dentro de la app para darte respuestas contextuales.</li>
              <li>No compartimos tu información con terceros para entrenar modelos de IA.</li>
              <li>Las conversaciones con Sparky se guardan en tu cuenta y puedes eliminarlas.</li>
              <li>Puedes controlar qué información comparte el asistente en cada interacción.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Compartir Información</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong>No vendemos ni compartimos tu información personal con terceros</strong> para fines de marketing. 
              Solo compartimos datos cuando es estrictamente necesario para proporcionar el servicio 
              (por ejemplo, servicios de procesamiento de IA) o cuando la ley lo requiera.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Tus Derechos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Acceso:</strong> Ver toda la información que tenemos sobre ti.</li>
              <li><strong>Rectificación:</strong> Corregir cualquier dato incorrecto.</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de tu cuenta y todos tus datos.</li>
              <li><strong>Portabilidad:</strong> Exportar tus datos en un formato estándar.</li>
              <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos en ciertos casos.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Retención de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conservamos tu información mientras tu cuenta esté activa. Si eliminas tu cuenta, 
              eliminaremos todos tus datos personales en un plazo de 30 días, excepto aquellos que 
              estemos legalmente obligados a conservar.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Cookies y Tecnologías Similares</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies y almacenamiento local para mantener tu sesión activa y recordar 
              tus preferencias (como el tema claro/oscuro). No utilizamos cookies de seguimiento 
              de terceros con fines publicitarios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Cambios en esta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios significativos 
              a través de la aplicación o por email. Te recomendamos revisar esta página periódicamente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Si tienes preguntas sobre esta Política de Privacidad o sobre cómo tratamos tus datos, 
              puedes contactarnos a través de la aplicación o enviando un email a nuestro equipo de soporte.
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

export default Privacy;