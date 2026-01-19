import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, X } from 'lucide-react';

/**
 * FAQ Section - Preguntas frecuentes + Disqualification
 */
const FAQ = () => {
  const faqs = [
    {
      question: '¿Sparky tiene acceso a toda mi información?',
      answer: 'Sí. Cuando chateas con Sparky, él puede ver tus tareas, ideas, proyectos, diario y contactos para darte respuestas personalizadas. Ese es el punto: que te conozca.',
    },
    {
      question: '¿Y mi privacidad?',
      answer: 'Tus datos son tuyos. Sin almacenamiento externo. Puedes borrar tu historial cuando quieras. Solo tú accedes a tu información.',
    },
    {
      question: '¿En qué se diferencia de ChatGPT?',
      answer: 'ChatGPT no te conoce. Cada conversación empiezas de cero. Sparky tiene tu contexto completo: sabe qué proyectos tienes, qué ideas guardaste hace 3 meses, cómo te sentiste la semana pasada.',
    },
    {
      question: '¿Puedo usar Sparky sin conexión?',
      answer: 'No. Sparky necesita conexión para funcionar. Procesa tus mensajes en la nube de forma segura.',
    },
    {
      question: '¿Sparky puede crear tareas o ideas por mí?',
      answer: 'Aún no, pero está en desarrollo. Por ahora conversa, analiza y sugiere. Tú decides qué hacer con sus recomendaciones.',
    },
    {
      question: '¿Por qué no usar Notion/Obsidian?',
      answer: 'Porque requieren que TÚ organices todo. Sparky lo hace automáticamente. Y además piensa contigo, sugiere conexiones y te recuerda lo olvidado.',
    },
  ];

  const isForYou = [
    'Tienes ideas constantemente y no sabes dónde guardarlas',
    'Manejas múltiples proyectos a la vez',
    'Quieres un compañero que piense contigo, no solo que ejecute',
  ];

  const isNotForYou = [
    'Prefieres organizar manualmente con carpetas y etiquetas',
    'Solo quieres un chatbot genérico',
    'No estás dispuesto a alimentar a Sparky con tus ideas',
  ];

  return (
    <section className="py-24 px-6 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        {/* FAQ */}
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-foreground">
          Preguntas frecuentes
        </h2>

        <Accordion type="single" collapsible className="mb-20">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border">
              <AccordionTrigger className="text-left text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Disqualification */}
        <div className="bg-card/60 backdrop-blur-sm rounded-2xl border-2 border-border p-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            ¿Es para ti?
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Es para ti */}
            <div>
              <h4 className="text-lg font-bold text-success mb-4 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Sparky ES para ti si:
              </h4>
              <ul className="space-y-3">
                {isForYou.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-foreground">
                    <span className="text-success shrink-0">✅</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* No es para ti */}
            <div>
              <h4 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
                <X className="w-5 h-5" />
                Sparky NO es para ti si:
              </h4>
              <ul className="space-y-3">
                {isNotForYou.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <span className="shrink-0">❌</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
