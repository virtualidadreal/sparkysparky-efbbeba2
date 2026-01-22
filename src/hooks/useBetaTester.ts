import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useBetaTester = () => {
  const { user } = useAuth();
  const [isBetaTester, setIsBetaTester] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkBetaStatus = useCallback(async () => {
    if (!user) {
      setIsBetaTester(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_beta_tester', {
        p_user_id: user.id
      });

      if (error) throw error;
      setIsBetaTester(data === true);
    } catch (error) {
      console.error('Error checking beta status:', error);
      setIsBetaTester(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkBetaStatus();
  }, [checkBetaStatus]);

  return {
    isBetaTester,
    isLoading,
    refreshStatus: checkBetaStatus,
  };
};
