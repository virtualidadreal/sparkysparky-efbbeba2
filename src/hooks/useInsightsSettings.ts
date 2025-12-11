import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InsightsSettings {
  suggestionsEnabled: boolean;
  suggestionsDailyLimit: number;
  alertsEnabled: boolean;
  briefingEnabled: boolean;
}

/**
 * Hook para obtener las configuraciones de insights (público, sin requerir admin)
 * Usa una edge function para obtener los settings sin exponer la tabla admin_settings
 */
export const useInsightsSettings = () => {
  return useQuery({
    queryKey: ['insightsSettings'],
    queryFn: async (): Promise<InsightsSettings> => {
      const { data, error } = await supabase.functions.invoke('get-insights-settings');
      
      if (error) {
        console.error('Error fetching insights settings:', error);
        // Return defaults if error
        return {
          suggestionsEnabled: true,
          suggestionsDailyLimit: 10,
          alertsEnabled: true,
          briefingEnabled: true,
        };
      }
      
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
};

/**
 * Hook para verificar límite diario del usuario
 */
export const useUserDailyUsage = () => {
  return useQuery({
    queryKey: ['userDailyUsage'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { suggestions: 0, alerts: 0, briefings: 0 };

      const today = new Date().toISOString().split('T')[0];
      
      // Get usage from local storage (simple approach)
      const usageKey = `insights_usage_${user.id}_${today}`;
      const stored = localStorage.getItem(usageKey);
      
      if (stored) {
        return JSON.parse(stored);
      }
      
      return { suggestions: 0, alerts: 0, briefings: 0 };
    },
  });
};

/**
 * Incrementar el contador de uso diario
 */
export const incrementDailyUsage = (type: 'suggestions' | 'alerts' | 'briefings') => {
  const today = new Date().toISOString().split('T')[0];
  
  // Get current user ID from supabase
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) return;
    
    const usageKey = `insights_usage_${user.id}_${today}`;
    const stored = localStorage.getItem(usageKey);
    const usage = stored ? JSON.parse(stored) : { suggestions: 0, alerts: 0, briefings: 0 };
    
    usage[type] = (usage[type] || 0) + 1;
    localStorage.setItem(usageKey, JSON.stringify(usage));
  });
};
