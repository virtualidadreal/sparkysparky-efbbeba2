import React from 'react';
import { Lightbulb, Plus, RefreshCw, Calendar, CheckSquare, X, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Suggestion } from '@/hooks/useProactiveInsights';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  onDismiss: (id: string) => void;
  onAccept?: (suggestion: Suggestion) => void;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ suggestions, onDismiss, onAccept }) => {
  const getActionIcon = (actionType: Suggestion['action_type']) => {
    switch (actionType) {
      case 'create_task':
        return <Plus className="h-4 w-4" />;
      case 'review_idea':
        return <RefreshCw className="h-4 w-4" />;
      case 'update_project':
        return <CheckSquare className="h-4 w-4" />;
      case 'reschedule':
        return <Calendar className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-primary text-primary';
      case 'medium':
        return 'border-warning text-warning';
      default:
        return 'border-muted-foreground text-muted-foreground';
    }
  };

  const getTypeLabel = (type: Suggestion['type']) => {
    switch (type) {
      case 'task':
        return 'Tarea';
      case 'idea':
        return 'Idea';
      case 'project':
        return 'Proyecto';
      case 'habit':
        return 'Hábito';
      default:
        return type;
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No hay sugerencias en este momento.</p>
          <p className="text-sm text-muted-foreground mt-1">Sigue trabajando y te daremos ideas pronto.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Sugerencias Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {getTypeLabel(suggestion.type)}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority === 'high' ? 'Alta' : suggestion.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{suggestion.description}</p>
                {suggestion.related_items && suggestion.related_items.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {suggestion.related_items.map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {onAccept && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onAccept(suggestion)}
                    >
                      {getActionIcon(suggestion.action_type)}
                      <span className="ml-1">Aplicar</span>
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => onDismiss(suggestion.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
