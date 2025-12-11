import React, { useState, useRef, useEffect } from 'react';
import { useSparkyChat, ChatMessage } from '@/hooks/useSparkyChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  SparklesIcon, 
  PaperAirplaneIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const brainColors: Record<string, string> = {
  organizer: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  mentor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  creative: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  business: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

const brainLabels: Record<string, string> = {
  organizer: '🗂️ Organizador',
  mentor: '🧭 Mentor',
  creative: '💡 Creativo',
  business: '💼 Empresarial',
};

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn(
      'flex w-full mb-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <div className={cn(
        'max-w-[85%] rounded-2xl px-4 py-3',
        isUser 
          ? 'bg-primary text-primary-foreground rounded-br-md' 
          : 'bg-muted text-foreground rounded-bl-md'
      )}>
        {!isUser && message.brain && (
          <div className={cn(
            'text-xs font-medium mb-1 px-2 py-0.5 rounded-full inline-block',
            brainColors[message.brain] || 'bg-muted-foreground/10'
          )}>
            {brainLabels[message.brain] || message.brainName}
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-[10px] opacity-60 mt-1 block">
          {message.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

interface SparkyChatProps {
  trigger?: React.ReactNode;
}

export const SparkyChat: React.FC<SparkyChatProps> = ({ trigger }) => {
  const { messages, isLoading, sendMessage, clearChat } = useSparkyChat();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const defaultTrigger = (
    <Button
      size="lg"
      className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
    >
      <SparklesIcon className="h-5 w-5" />
      Hablar con Sparky
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-left">Sparky</SheetTitle>
                <p className="text-xs text-muted-foreground">Tu asistente personal IA</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="h-8 w-8"
              title="Limpiar chat"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea 
          ref={scrollRef}
          className="flex-1 p-4"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <SparklesIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">¡Hola! Soy Sparky</h3>
              <p className="text-sm text-muted-foreground max-w-[250px]">
                Tu asistente personal que conoce todas tus ideas, tareas y proyectos. ¿En qué puedo ayudarte?
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {['¿Qué tengo pendiente?', '¿Alguna idea para hoy?', 'Ayúdame a priorizar'].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Sparky está pensando...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default SparkyChat;
