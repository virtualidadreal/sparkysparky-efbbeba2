import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInsightsSettings, incrementDailyUsage, useUserDailyUsage } from './useInsightsSettings';
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

export const useProactiveInsights = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [morningBriefing, setMorningBriefing] = useState<MorningBriefing | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const { data: settings } = useInsightsSettings();
  const { data: usage, refetch: refetchUsage } = useUserDailyUsage();

  const fetchInsight = useCallback(async (type: 'morning_briefing' | 'suggestions' | 'alerts' | 'reminders') => {
    // Check if feature is enabled
    if (settings) {
      if (type === 'suggestions' && !settings.suggestionsEnabled) {
        toast.error('Las sugerencias están desactivadas');
        return null;
      }
      if (type === 'alerts' && !settings.alertsEnabled) {
        toast.error('Las alertas están desactivadas');
        return null;
      }
      if (type === 'morning_briefing' && !settings.briefingEnabled) {
        toast.error('El briefing matutino está desactivado');
        return null;
      }
    }

    // Check daily limit for suggestions
    if (type === 'suggestions' && settings && usage) {
      if (usage.suggestions >= settings.suggestionsDailyLimit) {
        toast.error(`Has alcanzado el límite diario de ${settings.suggestionsDailyLimit} generaciones de sugerencias`);
        return null;
      }
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('proactive-insights', {
        body: { type }
      });

      if (error) throw error;

      if (data.success) {
        // Increment usage counter
        if (type === 'suggestions') {
          incrementDailyUsage('suggestions');
          refetchUsage();
        } else if (type === 'alerts') {
          incrementDailyUsage('alerts');
        } else if (type === 'morning_briefing') {
          incrementDailyUsage('briefings');
        }

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
      } else {
        throw new Error(data.error || 'Error fetching insights');
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast.error(`Error al obtener ${type === 'morning_briefing' ? 'el briefing' : type}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [settings, usage, refetchUsage]);

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

  // Compute remaining usage
  const remainingSuggestions = settings && usage 
    ? Math.max(0, settings.suggestionsDailyLimit - (usage.suggestions || 0))
    : null;

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
    // New exports for settings awareness
    settings,
    remainingSuggestions,
  };
};
