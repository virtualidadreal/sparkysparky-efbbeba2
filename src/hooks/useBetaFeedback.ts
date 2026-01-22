import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export type FeedbackCategory = 
  | 'interfaz'
  | 'usabilidad'
  | 'funcionalidad'
  | 'rendimiento'
  | 'sugerencia'
  | 'bug'
  | 'otro';

export interface FeedbackData {
  category: FeedbackCategory;
  message: string;
}

export const useBetaFeedback = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = useCallback(async (data: FeedbackData): Promise<boolean> => {
    if (!user) {
      toast.error('Debes iniciar sesión para enviar feedback');
      return false;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('beta_feedback')
        .insert({
          user_id: user.id,
          category: data.category,
          message: data.message,
        });

      if (error) throw error;

      toast.success('¡Gracias por tu feedback! 💜');
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Error al enviar el feedback');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user]);

  return {
    submitFeedback,
    isSubmitting,
  };
};
