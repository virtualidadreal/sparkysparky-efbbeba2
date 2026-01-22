import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Create Stripe customer for new users
  const createStripeCustomer = async () => {
    try {
      const { error } = await supabase.functions.invoke('create-stripe-customer');
      if (error) {
        console.error('Error creating Stripe customer:', error);
      }
    } catch (err) {
      console.error('Failed to create Stripe customer:', err);
    }
  };

  // Send welcome email to new users
  const sendWelcomeEmail = async (email: string, name?: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-welcome-email', {
        body: { email, name }
      });
      if (error) {
        console.error('Error sending welcome email:', error);
      }
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }
  };

  useEffect(() => {
    // Configurar listener PRIMERO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create Stripe customer on sign up or first OAuth login
        if (event === 'SIGNED_IN' && session?.user) {
          // Use setTimeout to avoid blocking the auth flow
          setTimeout(() => createStripeCustomer(), 0);
          
          // Check if this is a new OAuth user (first login) - send welcome email
          const isOAuthUser = session.user.app_metadata?.provider !== 'email';
          const createdAt = new Date(session.user.created_at);
          const now = new Date();
          const isNewUser = (now.getTime() - createdAt.getTime()) < 60000; // Created less than 1 minute ago
          
          if (isOAuthUser && isNewUser) {
            const email = session.user.email;
            const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
            if (email) {
              setTimeout(() => sendWelcomeEmail(email, name), 0);
            }
          }
        }
      }
    );

    // LUEGO verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    
    // Send welcome email on successful signup
    if (!error && data.user) {
      setTimeout(() => sendWelcomeEmail(email, fullName), 0);
    }
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle,
  };
};
