import { useState } from 'react';
import { MobileFooter } from '@/components/layout/MobileFooter';
import { AppSidebar } from '@/components/layout/AppSidebar';
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
    <div className="h-screen bg-[hsl(220,14%,96%)] dark:bg-[hsl(222,84%,5%)] p-3 pb-24 lg:pb-3 overflow-hidden">
      {/* 3-column grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-3 max-w-[1800px] mx-auto h-[calc(100vh-24px)]">
        
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex flex-col gap-4 pt-4">
          {/* Header compacto */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <h1 className="text-2xl font-bold text-foreground">Memoria & Patrones</h1>
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
                Analizar
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
                Resumen semanal
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-transparent backdrop-blur-sm rounded-[24px] p-5 border-2 border-border/50 flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-muted/50 p-1 rounded-xl mb-4">
                <TabsTrigger value="summaries" className="gap-2 rounded-lg">
                  <DocumentTextIcon className="h-4 w-4" />
                  Resúmenes
                </TabsTrigger>
                <TabsTrigger value="patterns" className="gap-2 rounded-lg">
                  <LightBulbIcon className="h-4 w-4" />
                  Patrones
                  {patterns && patterns.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {patterns.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="memory" className="gap-2 rounded-lg">
                  <CpuChipIcon className="h-4 w-4" />
                  Memoria
                </TabsTrigger>
              </TabsList>

              {/* Summaries Tab */}
              <TabsContent value="summaries" className="mt-4">
                {loadingSummaries ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-48 w-full rounded-xl" />
                    ))}
                  </div>
                ) : summaries && summaries.length > 0 ? (
                  <div className="space-y-4">
                    {summaries.map((summary) => (
                      <Card key={summary.id} padding="lg" className="space-y-4 rounded-xl">
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
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
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
                  <Card padding="lg" className="text-center py-12 rounded-xl">
                    <DocumentTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No hay resúmenes aún
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Genera tu primer resumen semanal para obtener insights
                    </p>
                    <Button onClick={handleGenerateWeeklySummary} disabled={generateSummary.isPending}>
                      Generar resumen semanal
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* Patterns Tab */}
              <TabsContent value="patterns" className="mt-4">
                {loadingPatterns ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                  </div>
                ) : patterns && patterns.length > 0 ? (
                  <div className="space-y-4">
                    {patterns.map((pattern) => (
                      <Card key={pattern.id} padding="lg" className="space-y-3 rounded-xl">
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
                  <Card padding="lg" className="text-center py-12 rounded-xl">
                    <LightBulbIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No hay patrones detectados
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Analiza tus datos para descubrir patrones
                    </p>
                    <Button onClick={handleAnalyzePatterns} disabled={analyzePatterns.isPending}>
                      Analizar patrones
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* Memory Tab */}
              <TabsContent value="memory" className="mt-4">
                {loadingMemories ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-24 w-full rounded-xl" />
                    ))}
                  </div>
                ) : memories && memories.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {memories.map((memory) => (
                      <Card key={memory.id} padding="md" className="space-y-2 rounded-xl">
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
                  <Card padding="lg" className="text-center py-12 rounded-xl">
                    <CpuChipIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      La memoria está vacía
                    </h3>
                    <p className="text-muted-foreground">
                      A medida que uses Sparky, aprenderá sobre ti
                    </p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="bg-card rounded-[24px] p-5 shadow-sm flex flex-col">
          {/* Acciones */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              ACCIONES RÁPIDAS
            </h3>
            <div className="space-y-2">
              <Button 
                onClick={handleGenerateWeeklySummary}
                disabled={generateSummary.isPending}
                className="w-full gap-2"
              >
                <SparklesIcon className="h-4 w-4" />
                Resumen Semanal
              </Button>
              <Button 
                variant="outline"
                onClick={handleAnalyzePatterns}
                disabled={analyzePatterns.isPending}
                className="w-full gap-2"
              >
                <CpuChipIcon className="h-4 w-4" />
                Analizar Patrones
              </Button>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-border mb-6" />

          {/* Tips */}
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider mb-4">
              ¿CÓMO FUNCIONA?
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  🧠 Sparky analiza tus ideas y entradas para encontrar patrones.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  📊 Los resúmenes semanales te dan una visión general de tu progreso.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  💡 La memoria guarda información relevante para ayudarte mejor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <MobileFooter />
    </div>
  );
};

export default Memory;
