import React from 'react';
import { Sun, AlertTriangle, Lightbulb, Zap, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MorningBriefing } from '@/hooks/useProactiveInsights';

interface MorningBriefingCardProps {
  briefing: MorningBriefing;
}

export const MorningBriefingCard: React.FC<MorningBriefingCardProps> = ({ briefing }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{briefing.greeting}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-muted-foreground">{briefing.summary}</p>

        {/* Top Priorities */}
        {briefing.top_priorities?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Prioridades del día
            </h4>
            <ul className="space-y-1">
              {briefing.top_priorities.map((priority, idx) => (
                <li key={idx} className="text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {idx + 1}
                  </span>
                  {priority}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Alerts */}
        {briefing.alerts?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Alertas
            </h4>
            <div className="flex flex-wrap gap-2">
              {briefing.alerts.map((alert, idx) => (
                <Badge key={idx} variant="outline" className={getSeverityColor(alert.severity)}>
                  {alert.message}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {briefing.suggestions?.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Sugerencias
            </h4>
            <ul className="space-y-1">
              {briefing.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-medium">{suggestion.action}</span>
                  <span className="text-muted-foreground"> — {suggestion.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Energy Tip */}
        {briefing.energy_tip && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Zap className="h-4 w-4 text-primary mt-0.5" />
            <p className="text-sm">{briefing.energy_tip}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
