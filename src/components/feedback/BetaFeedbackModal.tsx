import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useBetaFeedback, FeedbackCategory } from '@/hooks/useBetaFeedback';
import {
  ComputerDesktopIcon,
  CursorArrowRaysIcon,
  CogIcon,
  BoltIcon,
  LightBulbIcon,
  BugAntIcon,
  QuestionMarkCircleIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories: { value: FeedbackCategory; label: string; icon: React.ElementType; description: string }[] = [
  {
    value: 'interfaz',
    label: 'Interfaz',
    icon: ComputerDesktopIcon,
    description: 'Diseño, colores, tipografía',
  },
  {
    value: 'usabilidad',
    label: 'Usabilidad',
    icon: CursorArrowRaysIcon,
    description: 'Navegación, facilidad de uso',
  },
  {
    value: 'funcionalidad',
    label: 'Funcionalidad',
    icon: CogIcon,
    description: 'Características, features',
  },
  {
    value: 'rendimiento',
    label: 'Rendimiento',
    icon: BoltIcon,
    description: 'Velocidad, optimización',
  },
  {
    value: 'sugerencia',
    label: 'Sugerencia',
    icon: LightBulbIcon,
    description: 'Ideas y mejoras',
  },
  {
    value: 'bug',
    label: 'Bug',
    icon: BugAntIcon,
    description: 'Errores encontrados',
  },
  {
    value: 'otro',
    label: 'Otro',
    icon: QuestionMarkCircleIcon,
    description: 'Cualquier otra cosa',
  },
];

export const BetaFeedbackModal = ({ isOpen, onClose }: BetaFeedbackModalProps) => {
  const { submitFeedback, isSubmitting } = useBetaFeedback();
  const [category, setCategory] = useState<FeedbackCategory>('sugerencia');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) return;

    const success = await submitFeedback({ category, message });
    if (success) {
      setMessage('');
      setCategory('sugerencia');
      onClose();
    }
  };

  const selectedCategory = categories.find((c) => c.value === category);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-primary" />
            Enviar Feedback
          </DialogTitle>
          <DialogDescription>
            Tu opinión nos ayuda a mejorar Sparky. ¡Gracias por ser beta tester!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label>¿Sobre qué quieres opinar?</Label>
            <RadioGroup
              value={category}
              onValueChange={(value) => setCategory(value as FeedbackCategory)}
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            >
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <div key={cat.value}>
                    <RadioGroupItem
                      value={cat.value}
                      id={cat.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={cat.value}
                      className={`
                        flex flex-col items-center gap-1 p-3 rounded-lg border cursor-pointer
                        transition-all text-center
                        ${isSelected 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }
                      `}
                    >
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
            {selectedCategory && (
              <p className="text-xs text-muted-foreground text-center">
                {selectedCategory.description}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Tu mensaje</Label>
            <Textarea
              id="message"
              placeholder="Cuéntanos qué piensas, qué mejorarías, o qué te gustaría ver en Sparky..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length} caracteres
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Enviando...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-4 w-4" />
                Enviar Feedback
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
