import React, { useState, useRef, useEffect } from 'react';
import { useSparkyChat, ChatMessage } from '@/hooks/useSparkyChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { 
  SparklesIcon, 
  PaperAirplaneIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

const brainColors: Record<string, string> = {
  organizer: 'text-blue-500',
  mentor: 'text-purple-500',
  creative: 'text-orange-500',
  business: 'text-emerald-500',
};

const brainLabels: Record<string, string> = {
  organizer: 'Organizador',
  mentor: 'Mentor',
  creative: 'Creativo',
  business: 'Empresarial',
};

const formatMessageTime = (date: Date): string => {
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: es });
  } else if (isYesterday(date)) {
    return `Ayer ${format(date, 'HH:mm', { locale: es })}`;
  } else {
    return format(date, "d MMM HH:mm", { locale: es });
  }
};

const getDateLabel = (date: Date): string => {
  if (isToday(date)) {
    return 'Hoy';
  } else if (isYesterday(date)) {
    return 'Ayer';
  } else {
    return format(date, "d 'de' MMMM", { locale: es });
  }
};

interface MessageBubbleProps {
  message: ChatMessage;
  showDateSeparator?: boolean;
  dateSeparatorLabel?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  showDateSeparator, 
  dateSeparatorLabel 
}) => {
  const isUser = message.role === 'user';
  
  return (
    <>
      {showDateSeparator && dateSeparatorLabel && (
        <div className="flex items-center justify-center my-6">
          <span className="text-xs text-muted-foreground/60 font-medium">
            {dateSeparatorLabel}
          </span>
        </div>
      )}
      <div className={cn(
        'flex w-full mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}>
        <div className={cn(
          'max-w-[80%]',
          isUser ? 'text-right' : 'text-left'
        )}>
          {!isUser && message.brain && (
            <div className={cn(
              'text-[10px] font-medium mb-1 uppercase tracking-wider',
              brainColors[message.brain] || 'text-muted-foreground'
            )}>
              {brainLabels[message.brain] || message.brainName}
            </div>
          )}
          <div className={cn(
            'rounded-2xl px-4 py-3',
            isUser 
              ? 'bg-foreground text-background' 
              : 'bg-muted/50'
          )}>
            {isUser ? (
              <p className="text-sm">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="text-sm">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    code: ({ children }) => (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2 text-xs">{children}</pre>
                    ),
                    h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-sm font-bold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-primary/30 pl-3 italic my-2">{children}</blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {message.isStreaming && (
                  <span className="inline-block w-1 h-4 bg-foreground/60 ml-0.5 animate-pulse" />
                )}
              </div>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground/50 mt-1 block px-1">
            {formatMessageTime(message.timestamp)}
          </span>
        </div>
      </div>
    </>
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

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen]);

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

  const messagesWithSeparators = messages.map((message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const currentDate = message.timestamp;
    const prevDate = prevMessage?.timestamp;
    
    const showSeparator = !prevDate || 
      getDateLabel(currentDate) !== getDateLabel(prevDate);
    
    return {
      message,
      showDateSeparator: showSeparator,
      dateSeparatorLabel: showSeparator ? getDateLabel(currentDate) : undefined,
    };
  });

  const defaultTrigger = (
    <Button
      size="lg"
      className="gap-2 bg-foreground text-background hover:bg-foreground/90"
    >
      <SparklesIcon className="h-5 w-5" />
      Hablar con Sparky
    </Button>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || defaultTrigger}
      </div>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-none w-[90vw] md:w-[70vw] h-[80vh] p-0 gap-0 rounded-3xl border-0 shadow-2xl overflow-hidden bg-background/95 backdrop-blur-xl"
          hideCloseButton
        >
          <DialogTitle className="sr-only">Chat con Sparky</DialogTitle>
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-foreground/5 flex items-center justify-center">
                <SparklesIcon className="h-4 w-4 text-foreground/70" />
              </div>
              <div>
                <h2 className="font-medium text-sm">Sparky</h2>
                <p className="text-[10px] text-muted-foreground">
                  {messages.length > 0 ? `${messages.length} mensajes` : 'Asistente personal'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearChat}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                disabled={messages.length === 0}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea 
            ref={scrollRef}
            className="flex-1 h-[calc(80vh-8rem)]"
          >
            <div className="px-6 py-4">
              {messages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                  <div className="h-12 w-12 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
                    <SparklesIcon className="h-6 w-6 text-foreground/40" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    Tengo acceso a todas tus ideas, tareas, proyectos y más. ¿En qué puedo ayudarte?
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md">
                    {['¿Qué tengo pendiente?', 'Resume mis ideas', 'Ayúdame a priorizar'].map((suggestion) => (
                      <button
                        key={suggestion}
                        className="px-3 py-1.5 text-xs bg-muted/50 hover:bg-muted rounded-full transition-colors"
                        onClick={() => {
                          setInput(suggestion);
                          inputRef.current?.focus();
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {messagesWithSeparators.map(({ message, showDateSeparator, dateSeparatorLabel }) => (
                    <MessageBubble 
                      key={message.id} 
                      message={message}
                      showDateSeparator={showDateSeparator}
                      dateSeparatorLabel={dateSeparatorLabel}
                    />
                  ))}
                  {isLoading && !messages.some(m => m.isStreaming) && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs">Pensando...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-border/50">
            <div className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1 bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-xl"
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isLoading || !input.trim()}
                className="rounded-xl bg-foreground text-background hover:bg-foreground/90"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SparkyChat;
