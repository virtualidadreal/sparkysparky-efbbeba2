import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EarlyAccessStats {
  spots_taken: number;
  total_spots: number;
  spots_remaining: number;
  is_available: boolean;
}

interface ClaimResult {
  success: boolean;
  message: string;
  premium_expires_at?: string;
  spots_remaining: number;
}

export const useEarlyAccess = () => {
  const [stats, setStats] = useState<EarlyAccessStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: funcError } = await supabase.functions.invoke('early-access', {
        method: 'GET',
      });

      if (funcError) throw funcError;
      
      setStats(data as EarlyAccessStats);
    } catch (err) {
      console.error('Error fetching early access stats:', err);
      setError('Error al cargar las estadísticas');
      // Fallback to default values
      setStats({
        spots_taken: 0,
        total_spots: 30,
        spots_remaining: 30,
        is_available: true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const claimSpot = async (): Promise<ClaimResult> => {
    try {
      const { data, error: funcError } = await supabase.functions.invoke('early-access', {
        method: 'POST',
        body: {},
      });

      if (funcError) throw funcError;

      // Refresh stats after claiming
      await fetchStats();

      return data as ClaimResult;
    } catch (err) {
      console.error('Error claiming early access spot:', err);
      return {
        success: false,
        message: 'Error al reclamar la plaza',
        spots_remaining: stats?.spots_remaining || 0,
      };
    }
  };

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    claimSpot,
    refreshStats: fetchStats,
  };
};
