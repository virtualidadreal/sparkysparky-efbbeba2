import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

export interface Alert {
  id: string;
  type: 'overdue' | 'deadline' | 'stale_idea' | 'blocked_project' | 'pattern_warning' | 'opportunity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action_label?: string;
  related_id?: string;
  related_type?: 'task' | 'idea' | 'project';
}

export interface Suggestion {
  id: string;
  type: 'task' | 'idea' | 'project' | 'habit';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_type: 'create_task' | 'review_idea' | 'update_project' | 'reschedule';
  related_items?: string[];
}

export interface Reminder {
  id: string;
  type: 'follow_up' | 'deadline' | 'habit' | 'review' | 'planning';
  title: string;
  message: string;
  timing: 'now' | 'later_today' | 'tomorrow' | 'this_week';
  based_on: string;
}

export interface MorningBriefing {
  greeting: string;
  summary: string;
  top_priorities: string[];
  alerts: { type: string; message: string; severity: string }[];
  suggestions: { action: string; reason: string }[];
  energy_tip: string;
}

export interface UsageInfo {
  current: number;
  limit: number;
  remaining: number;
}

export const useProactiveInsights = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [morningBriefing, setMorningBriefing] = useState<MorningBriefing | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  const fetchInsight = useCallback(async (type: 'morning_briefing' | 'suggestions' | 'alerts' | 'reminders') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('proactive-insights', {
        body: { type }
      });

      if (error) {
        // Handle specific error cases
        if (error.message?.includes('429') || error.message?.includes('límite')) {
          toast.error('Has alcanzado el límite diario');
          return null;
        }
        throw error;
      }

      // Check for backend error responses
      if (!data.success) {
        if (data.limit_reached) {
          toast.error(`Has alcanzado el límite diario de ${data.limit} generaciones`);
          setUsage({ current: data.current_count, limit: data.limit, remaining: 0 });
          return null;
        }
        if (data.disabled) {
          toast.error(data.error || 'Esta función está desactivada');
          return null;
        }
        if (data.rate_limited) {
          toast.error('Límite de API alcanzado, intenta más tarde');
          return null;
        }
        throw new Error(data.error || 'Error desconocido');
      }

      // Update usage info if provided
      if (data.usage) {
        setUsage(data.usage);
      }

      // Set the data based on type
      switch (type) {
        case 'morning_briefing':
          setMorningBriefing(data.data);
          break;
        case 'suggestions':
          setSuggestions(data.data.suggestions || []);
          break;
        case 'alerts':
          setAlerts(data.data.alerts || []);
          break;
        case 'reminders':
          setReminders(data.data.reminders || []);
          break;
      }
      
      return data.data;
    } catch (error: any) {
      console.error(`Error fetching ${type}:`, error);
      
      // Parse error message for specific cases
      const errorMsg = error?.message || '';
      if (errorMsg.includes('límite') || errorMsg.includes('limit')) {
        toast.error('Has alcanzado el límite diario');
      } else if (errorMsg.includes('desactivad')) {
        toast.error('Esta función está desactivada');
      } else {
        toast.error(`Error al obtener ${type === 'morning_briefing' ? 'el briefing' : type}`);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMorningBriefing = useCallback(() => fetchInsight('morning_briefing'), [fetchInsight]);
  const getSuggestions = useCallback(() => fetchInsight('suggestions'), [fetchInsight]);
  const getAlerts = useCallback(() => fetchInsight('alerts'), [fetchInsight]);
  const getReminders = useCallback(() => fetchInsight('reminders'), [fetchInsight]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  }, []);

  return {
    isLoading,
    morningBriefing,
    suggestions,
    alerts,
    reminders,
    getMorningBriefing,
    getSuggestions,
    getAlerts,
    getReminders,
    dismissAlert,
    dismissSuggestion,
    usage,
  };
};
