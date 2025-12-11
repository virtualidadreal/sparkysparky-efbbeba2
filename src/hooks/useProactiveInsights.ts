import { useState, useCallback, useEffect } from 'react';
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

interface CachedInsights {
  date: string;
  morningBriefing?: MorningBriefing;
  suggestions?: Suggestion[];
  alerts?: Alert[];
  reminders?: Reminder[];
  usage?: UsageInfo;
  dismissedAlerts?: string[];
  dismissedSuggestions?: string[];
}

const CACHE_KEY = 'proactive_insights_cache';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const getCache = (): CachedInsights | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached) as CachedInsights;
    // Only return cache if it's from today
    if (parsed.date !== getTodayDate()) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const saveCache = (data: Partial<CachedInsights>) => {
  try {
    const existing = getCache() || { date: getTodayDate() };
    const updated = { ...existing, ...data, date: getTodayDate() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
};

export const useProactiveInsights = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [morningBriefing, setMorningBriefing] = useState<MorningBriefing | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Load cached data on mount
  useEffect(() => {
    const cached = getCache();
    if (cached) {
      if (cached.morningBriefing) setMorningBriefing(cached.morningBriefing);
      if (cached.suggestions) {
        const dismissed = cached.dismissedSuggestions || [];
        setSuggestions(cached.suggestions.filter(s => !dismissed.includes(s.id)));
      }
      if (cached.alerts) {
        const dismissed = cached.dismissedAlerts || [];
        setAlerts(cached.alerts.filter(a => !dismissed.includes(a.id)));
      }
      if (cached.reminders) setReminders(cached.reminders);
      if (cached.usage) setUsage(cached.usage);
    }
    setInitialized(true);
  }, []);

  const fetchInsight = useCallback(async (
    type: 'morning_briefing' | 'suggestions' | 'alerts' | 'reminders',
    forceRefresh = false
  ) => {
    // Check cache first (unless forcing refresh)
    const cached = getCache();
    if (!forceRefresh && cached) {
      if (type === 'morning_briefing' && cached.morningBriefing) {
        setMorningBriefing(cached.morningBriefing);
        if (cached.usage) setUsage(cached.usage);
        return cached.morningBriefing;
      }
      if (type === 'suggestions' && cached.suggestions) {
        const dismissed = cached.dismissedSuggestions || [];
        setSuggestions(cached.suggestions.filter(s => !dismissed.includes(s.id)));
        if (cached.usage) setUsage(cached.usage);
        return cached.suggestions;
      }
      if (type === 'alerts' && cached.alerts) {
        const dismissed = cached.dismissedAlerts || [];
        setAlerts(cached.alerts.filter(a => !dismissed.includes(a.id)));
        if (cached.usage) setUsage(cached.usage);
        return cached.alerts;
      }
      if (type === 'reminders' && cached.reminders) {
        setReminders(cached.reminders);
        if (cached.usage) setUsage(cached.usage);
        return cached.reminders;
      }
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('proactive-insights', {
        body: { type }
      });

      if (error) {
        console.log('Edge function error:', error);
        if (error.message?.includes('429') || error.message?.includes('límite')) {
          toast.error('Has alcanzado el límite diario');
          return null;
        }
        throw error;
      }

      if (!data) {
        console.log('No data returned from edge function');
        return null;
      }

      // Check for backend error responses
      if (data.success === false) {
        if (data.limit_reached) {
          // Don't show toast on initial load, only on explicit refresh
          if (forceRefresh) {
            toast.error(`Límite diario alcanzado (${data.current_count}/${data.limit})`);
          }
          setUsage({ current: data.current_count, limit: data.limit, remaining: 0 });
          return null;
        }
        if (data.disabled) {
          if (forceRefresh) {
            toast.error(data.error || 'Esta función está desactivada');
          }
          return null;
        }
        if (data.rate_limited) {
          toast.error('Límite de API alcanzado, intenta más tarde');
          return null;
        }
        console.log('Backend returned error:', data.error);
        if (forceRefresh) {
          toast.error(data.error || 'Error al obtener datos');
        }
        return null;
      }

      // Update usage info if provided
      if (data.usage) {
        setUsage(data.usage);
        saveCache({ usage: data.usage });
      }

      // Set and cache the data based on type
      switch (type) {
        case 'morning_briefing':
          setMorningBriefing(data.data);
          saveCache({ morningBriefing: data.data });
          break;
        case 'suggestions':
          setSuggestions(data.data.suggestions || []);
          saveCache({ suggestions: data.data.suggestions || [], dismissedSuggestions: [] });
          break;
        case 'alerts':
          setAlerts(data.data.alerts || []);
          saveCache({ alerts: data.data.alerts || [], dismissedAlerts: [] });
          break;
        case 'reminders':
          setReminders(data.data.reminders || []);
          saveCache({ reminders: data.data.reminders || [] });
          break;
      }
      
      return data.data;
    } catch (error: any) {
      console.error(`Error fetching ${type}:`, error);
      
      const errorMsg = error?.message || '';
      if (forceRefresh) {
        if (errorMsg.includes('límite') || errorMsg.includes('limit')) {
          toast.error('Has alcanzado el límite diario');
        } else if (errorMsg.includes('desactivad')) {
          toast.error('Esta función está desactivada');
        } else {
          toast.error(`Error al obtener ${type === 'morning_briefing' ? 'el briefing' : type}`);
        }
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load from cache or fetch (only fetch if no cache)
  const getMorningBriefing = useCallback((forceRefresh = true) => 
    fetchInsight('morning_briefing', forceRefresh), [fetchInsight]);
  
  const getSuggestions = useCallback((forceRefresh = false) => 
    fetchInsight('suggestions', forceRefresh), [fetchInsight]);
  
  const getAlerts = useCallback((forceRefresh = false) => 
    fetchInsight('alerts', forceRefresh), [fetchInsight]);
  
  const getReminders = useCallback((forceRefresh = false) => 
    fetchInsight('reminders', forceRefresh), [fetchInsight]);

  // Refresh all insights (force refresh)
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchInsight('alerts', true),
      fetchInsight('suggestions', true),
    ]);
  }, [fetchInsight]);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    // Update cache with dismissed alert
    const cached = getCache();
    if (cached) {
      const dismissed = [...(cached.dismissedAlerts || []), alertId];
      saveCache({ dismissedAlerts: dismissed });
    }
  }, []);

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    // Update cache with dismissed suggestion
    const cached = getCache();
    if (cached) {
      const dismissed = [...(cached.dismissedSuggestions || []), suggestionId];
      saveCache({ dismissedSuggestions: dismissed });
    }
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
    refreshAll,
    dismissAlert,
    dismissSuggestion,
    usage,
    initialized,
  };
};
