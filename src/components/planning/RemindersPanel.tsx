import React from 'react';
import { Bell, Clock, Calendar, BookOpen, Target, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Reminder } from '@/hooks/useProactiveInsights';

interface RemindersPanelProps {
  reminders: Reminder[];
  onDismiss?: (id: string) => void;
}

export const RemindersPanel: React.FC<RemindersPanelProps> = ({ reminders, onDismiss }) => {
  const getReminderIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'follow_up':
        return <Bell className="h-4 w-4" />;
      case 'deadline':
        return <Clock className="h-4 w-4" />;
      case 'habit':
        return <Target className="h-4 w-4" />;
      case 'review':
        return <BookOpen className="h-4 w-4" />;
      case 'planning':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTimingLabel = (timing: Reminder['timing']) => {
    switch (timing) {
      case 'now':
        return { label: 'Ahora', color: 'bg-primary text-primary-foreground' };
      case 'later_today':
        return { label: 'Hoy', color: 'bg-warning/10 text-warning' };
      case 'tomorrow':
        return { label: 'Mañana', color: 'bg-muted text-muted-foreground' };
      case 'this_week':
        return { label: 'Esta semana', color: 'bg-muted text-muted-foreground' };
      default:
        return { label: timing, color: 'bg-muted text-muted-foreground' };
    }
  };

  const getTypeLabel = (type: Reminder['type']) => {
    switch (type) {
      case 'follow_up':
        return 'Seguimiento';
      case 'deadline':
        return 'Fecha límite';
      case 'habit':
        return 'Hábito';
      case 'review':
        return 'Revisión';
      case 'planning':
        return 'Planificación';
      default:
        return type;
    }
  };

  // Always show "Coming Soon" state
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Recordatorios Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground font-medium mb-1">Próximamente</p>
        <p className="text-sm text-muted-foreground">
          Recordatorios inteligentes basados en tu actividad.
        </p>
      </CardContent>
    </Card>
  );

  // Group by timing
  const groupedReminders = reminders.reduce((acc, reminder) => {
    const group = reminder.timing;
    if (!acc[group]) acc[group] = [];
    acc[group].push(reminder);
    return acc;
  }, {} as Record<string, Reminder[]>);

  const timingOrder = ['now', 'later_today', 'tomorrow', 'this_week'];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Recordatorios Inteligentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {timingOrder.map((timing) => {
          const group = groupedReminders[timing];
          if (!group || group.length === 0) return null;

          const timingInfo = getTimingLabel(timing as Reminder['timing']);

          return (
            <div key={timing} className="space-y-2">
              <Badge className={timingInfo.color}>{timingInfo.label}</Badge>
              <div className="space-y-2">
                {group.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                          {getReminderIcon(reminder.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{reminder.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(reminder.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{reminder.message}</p>
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            📊 {reminder.based_on}
                          </p>
                        </div>
                      </div>
                      {onDismiss && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => onDismiss(reminder.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
