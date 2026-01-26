import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SubscriptionStatus {
  subscribed: boolean;
  plan: 'free' | 'pro';
  subscription_end: string | null;
  product_id: string | null;
}

const MAX_CONSECUTIVE_FAILURES = 3;

export const useStripeSubscription = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const consecutiveFailuresRef = useRef(0);

  const checkSubscription = useCallback(async () => {
    if (!user) return;
    
    // Stop polling if too many consecutive failures
    if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
      console.log('[SUBSCRIPTION] Skipping check due to consecutive failures');
      return;
    }
    
    setCheckingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscription(data as SubscriptionStatus);
      consecutiveFailuresRef.current = 0; // Reset on success
    } catch (error) {
      console.error('Error checking subscription:', error);
      consecutiveFailuresRef.current += 1;
    } finally {
      setCheckingStatus(false);
    }
  }, [user]);

  const createCheckout = useCallback(async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para suscribirte');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Error al crear la sesión de pago');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const openCustomerPortal = useCallback(async () => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Error al abrir el portal de gestión');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check subscription on mount and when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user, checkSubscription]);

  // Auto-refresh every minute
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return {
    subscription,
    loading,
    checkingStatus,
    isPro: subscription?.plan === 'pro',
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};
