import React from 'react';
import { AlertTriangle, Clock, FileQuestion, FolderX, TrendingDown, Sparkles, X, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Alert } from '@/hooks/useProactiveInsights';

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
  onAction?: (alert: Alert) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onDismiss, onAction }) => {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'overdue':
        return <Clock className="h-4 w-4" />;
      case 'deadline':
        return <AlertTriangle className="h-4 w-4" />;
      case 'stale_idea':
        return <FileQuestion className="h-4 w-4" />;
      case 'blocked_project':
        return <FolderX className="h-4 w-4" />;
      case 'pattern_warning':
        return <TrendingDown className="h-4 w-4" />;
      case 'opportunity':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-destructive/50 bg-destructive/5';
      case 'high':
        return 'border-destructive/30 bg-destructive/5';
      case 'medium':
        return 'border-warning/30 bg-warning/5';
      default:
        return 'border-border bg-muted/30';
    }
  };

  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-destructive/80">Alto</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-warning text-warning">Medio</Badge>;
      default:
        return <Badge variant="secondary">Bajo</Badge>;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">¡Todo está en orden! No hay alertas pendientes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertas Activas
          <Badge variant="secondary" className="ml-auto">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border ${getSeverityStyles(alert.severity)} transition-all`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded ${alert.severity === 'critical' || alert.severity === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{alert.title}</h4>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  {alert.action_label && onAction && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 mt-1 text-primary"
                      onClick={() => onAction(alert)}
                    >
                      {alert.action_label}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => onDismiss(alert.id)}
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
