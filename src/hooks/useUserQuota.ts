import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface QuotaInfo {
  can_generate: boolean;
  plan: 'free' | 'pro';
  used: number;
  limit: number;
  remaining: number;
}

export const useUserQuota = () => {
  const { user } = useAuth();
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuota = useCallback(async () => {
    if (!user) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('check_user_quota', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error fetching quota:', error);
        return null;
      }
      const quotaData = data as unknown as QuotaInfo;
      setQuota(quotaData);
      return quotaData;
    } catch (error) {
      console.error('Error fetching quota:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch quota on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchQuota();
    }
  }, [user, fetchQuota]);

  const isPro = quota?.plan === 'pro';
  const canGenerate = quota?.can_generate ?? true;
  const usageText = quota && quota.limit > 0 
    ? `${quota.used}/${quota.limit} usos este mes`
    : null;

  return {
    quota,
    isLoading,
    fetchQuota,
    isPro,
    canGenerate,
    usageText,
  };
};
