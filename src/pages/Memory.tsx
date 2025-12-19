import { useState } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Card } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useSummaries,
  useGenerateSummary,
  useDetectedPatterns,
  useAnalyzePatterns,
  useMemoryEntries,
  useUpdatePatternStatus,
} from '@/hooks/useMemory';
import {
  SparklesIcon,
  DocumentTextIcon,
  LightBulbIcon,
  CpuChipIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDistanceToNow, format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

const patternTypeLabels: Record<string, string> = {
  recurring_theme: 'Tema recurrente',
  behavior: 'Comportamiento',
  productivity: 'Productividad',
  emotional: 'Emocional',
  goal_progress: 'Progreso de meta',
  blocker: 'Bloqueador',
};

const patternTypeColors: Record<string, string> = {
  recurring_theme: 'bg-primary/20 text-primary',
  behavior: 'bg-secondary/20 text-secondary-foreground',
  productivity: 'bg-success/20 text-success',
  emotional: 'bg-warning/20 text-warning',
  goal_progress: 'bg-primary/20 text-primary',
  blocker: 'bg-destructive/20 text-destructive',
};

const Memory = () => {
  const [activeTab, setActiveTab] = useState('summaries');
  
  const { data: summaries, isLoading: loadingSummaries } = useSummaries();
  const { data: patterns, isLoading: loadingPatterns } = useDetectedPatterns('active');
  const { data: memories, isLoading: loadingMemories } = useMemoryEntries();
  
  const generateSummary = useGenerateSummary();
  const analyzePatterns = useAnalyzePatterns();
  const updatePatternStatus = useUpdatePatternStatus();

  const handleGenerateWeeklySummary = () => {
    const today = new Date();
    const weekAgo = subDays(today, 7);
    
    generateSummary.mutate({
      type: 'weekly',
      periodStart: format(weekAgo, 'yyyy-MM-dd'),
      periodEnd: format(today, 'yyyy-MM-dd'),
    });
  };

  const handleAnalyzePatterns = () => {
    analyzePatterns.mutate();
  };

  const handleDismissPattern = (id: string) => {
    updatePatternStatus.mutate({ id, status: 'dismissed' });
  };

  const handleAcknowledgePattern = (id: string) => {
    updatePatternStatus.mutate({ id, status: 'acknowledged' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Memoria & Patrones</h1>
            <p className="text-muted-foreground">
              Tu asistente aprende de ti para ayudarte mejor
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleAnalyzePatterns}
              disabled={analyzePatterns.isPending}
              className="gap-2"
            >
              {analyzePatterns.isPending ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <CpuChipIcon className="h-4 w-4" />
              )}
              Analizar patrones
            </Button>
            <Button
              onClick={handleGenerateWeeklySummary}
              disabled={generateSummary.isPending}
              className="gap-2"
            >
              {generateSummary.isPending ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <SparklesIcon className="h-4 w-4" />
              )}
              Generar resumen semanal
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/60 dark:bg-card/60 backdrop-blur-lg p-1 rounded-xl border border-white/50 dark:border-white/10">
            <TabsTrigger value="summaries" className="gap-2">
              <DocumentTextIcon className="h-4 w-4" />
              Resúmenes
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-2">
              <LightBulbIcon className="h-4 w-4" />
              Patrones
              {patterns && patterns.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {patterns.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="memory" className="gap-2">
              <CpuChipIcon className="h-4 w-4" />
              Memoria
            </TabsTrigger>
          </TabsList>

          {/* Summaries Tab */}
          <TabsContent value="summaries" className="mt-6">
            {loadingSummaries ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : summaries && summaries.length > 0 ? (
              <div className="space-y-4">
                {summaries.map((summary) => (
                  <Card key={summary.id} padding="lg" className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {summary.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {summary.period_start && summary.period_end && (
                            <>
                              {format(new Date(summary.period_start), 'd MMM', { locale: es })} -{' '}
                              {format(new Date(summary.period_end), 'd MMM yyyy', { locale: es })}
                            </>
                          )}
                        </p>
                      </div>
                      <Badge variant="outline">{summary.summary_type}</Badge>
                    </div>

                    <p className="text-foreground whitespace-pre-line">{summary.content}</p>

                    {summary.key_insights && summary.key_insights.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Insights clave
                        </h4>
                        <ul className="space-y-1">
                          {summary.key_insights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <CheckCircleIcon className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {summary.action_items && summary.action_items.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Acciones sugeridas
                        </h4>
                        <ul className="space-y-1">
                          {summary.action_items.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary">→</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Generado {formatDistanceToNow(new Date(summary.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card padding="lg" className="text-center py-12">
                <DocumentTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay resúmenes aún
                </h3>
                <p className="text-muted-foreground mb-4">
                  Genera tu primer resumen semanal para obtener insights sobre tu progreso
                </p>
                <Button onClick={handleGenerateWeeklySummary} disabled={generateSummary.isPending}>
                  Generar resumen semanal
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="mt-6">
            {loadingPatterns ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : patterns && patterns.length > 0 ? (
              <div className="space-y-4">
                {patterns.map((pattern) => (
                  <Card key={pattern.id} padding="lg" className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {pattern.pattern_type === 'blocker' ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
                        ) : (
                          <InformationCircleIcon className="h-5 w-5 text-primary" />
                        )}
                        <h3 className="font-semibold text-foreground">{pattern.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${patternTypeColors[pattern.pattern_type]}`}>
                          {patternTypeLabels[pattern.pattern_type]}
                        </span>
                        {pattern.occurrences && pattern.occurrences > 1 && (
                          <Badge variant="outline">×{pattern.occurrences}</Badge>
                        )}
                      </div>
                    </div>

                    {pattern.description && (
                      <p className="text-muted-foreground">{pattern.description}</p>
                    )}

                    {pattern.suggestions && pattern.suggestions.length > 0 && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-foreground mb-1">Sugerencias</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {pattern.suggestions.map((suggestion, i) => (
                            <li key={i}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-muted-foreground">
                        Detectado {formatDistanceToNow(new Date(pattern.last_detected_at), { addSuffix: true, locale: es })}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismissPattern(pattern.id)}
                        >
                          Descartar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledgePattern(pattern.id)}
                        >
                          Entendido
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card padding="lg" className="text-center py-12">
                <LightBulbIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No hay patrones detectados
                </h3>
                <p className="text-muted-foreground mb-4">
                  Analiza tus datos para descubrir patrones de comportamiento y productividad
                </p>
                <Button onClick={handleAnalyzePatterns} disabled={analyzePatterns.isPending}>
                  Analizar patrones
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Memory Tab */}
          <TabsContent value="memory" className="mt-6">
            {loadingMemories ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : memories && memories.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {memories.map((memory) => (
                  <Card key={memory.id} padding="md" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {memory.entry_type}
                      </Badge>
                      {memory.category && (
                        <span className="text-xs text-muted-foreground">{memory.category}</span>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{memory.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(memory.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card padding="lg" className="text-center py-12">
                <CpuChipIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  La memoria está vacía
                </h3>
                <p className="text-muted-foreground">
                  A medida que uses Sparky, aprenderá sobre ti y guardará información relevante
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Memory;
