import { useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Module-level Set para deduplicar emails entre renders y re-mounts
const globalWelcomeEmailSent = new Set<string>();

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Track processed users to avoid duplicate processing
  const processedUsersRef = useRef(new Set<string>());

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

  // Send welcome email to new users (with global deduplication)
  const sendWelcomeEmail = async (email: string, name?: string) => {
    // Deduplication: Don't send if already sent in this browser session
    if (globalWelcomeEmailSent.has(email)) {
      console.log('[AUTH] Welcome email already sent to:', email);
      return;
    }
    globalWelcomeEmailSent.add(email);
    
    try {
      const { error } = await supabase.functions.invoke('send-welcome-email', {
        body: { email, name }
      });
      if (error) {
        console.error('Error sending welcome email:', error);
        globalWelcomeEmailSent.delete(email); // Allow retry on error
      }
    } catch (err) {
      console.error('Failed to send welcome email:', err);
      globalWelcomeEmailSent.delete(email); // Allow retry on error
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    // Configurar listener PRIMERO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Create Stripe customer on sign up or first OAuth login
        if (event === 'SIGNED_IN' && session?.user) {
          const userId = session.user.id;
          
          // Avoid processing the same user multiple times
          if (processedUsersRef.current.has(userId)) {
            return;
          }
          processedUsersRef.current.add(userId);
          
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
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
    
    // Send welcome email on successful signup (check both data.user and data.session for auto-confirm)
    if (!error && (data.user || data.session)) {
      console.log('[AUTH] Signup successful, sending welcome email to:', email);
      setTimeout(() => sendWelcomeEmail(email, fullName), 100);
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
