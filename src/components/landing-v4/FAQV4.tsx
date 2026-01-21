import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '¿Cuánto cuesta Sparky?',
    answer: 'Gratis hasta 10 ideas/mes. El plan Pro cuesta €3.99/mes e incluye ideas ilimitadas, conexiones avanzadas y sugerencias diarias.',
  },
  {
    question: '¿Sparky tiene acceso a toda mi información?',
    answer: 'Sí, pero SOLO la tuya. Sparky lee tus ideas, tareas, proyectos y diario para darte respuestas personalizadas. Nunca comparte tu información con terceros.',
  },
  {
    question: '¿Qué puede hacer Sparky?',
    answer: 'Captura ideas por voz o texto, las organiza automáticamente, conecta ideas entre sí, te recuerda cosas olvidadas, y te sugiere acciones diarias. También te lleva la contraria cuando hace falta.',
  },
  {
    question: '¿En qué se diferencia de Notion u Obsidian?',
    answer: 'Notion y Obsidian requieren que TÚ organices todo. Sparky lo hace automáticamente. Solo tienes 3 categorías (Ideas, Tareas, Diario), sin carpetas ni etiquetas manuales.',
  },
  {
    question: '¿Sparky puede crear tareas o ideas por mí?',
    answer: 'Aún no, pero está en desarrollo. Por ahora conversa, asesora, conecta y recuerda.',
  },
  {
    question: '¿Funciona sin internet?',
    answer: 'No, Sparky necesita conexión para procesar tus mensajes.',
  },
];

const FAQV4 = () => {
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
      id="faq"
      className="py-24 px-6 bg-[#FFF5EB]"
    >
      <div className="max-w-3xl mx-auto">
        {/* Title */}
        <h2
          className={`font-serif text-3xl sm:text-4xl font-bold text-[#2D3436] text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Preguntas frecuentes
        </h2>

        {/* Accordion */}
        <div
          className={`transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-xl border border-[#FFB800]/20 px-6 overflow-hidden"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-[#2D3436] hover:text-[#FF6B35] hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#636E72] pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQV4;
