import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { checkSubscription } = useStripeSubscription();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const emailSentRef = useRef(false);

  useEffect(() => {
    // Verify subscription and send confirmation email
    const verifySubscription = async () => {
      await checkSubscription();
      
      // Send confirmation email only once
      if (user?.email && !emailSentRef.current) {
        emailSentRef.current = true;
        try {
          await supabase.functions.invoke('send-subscription-email', {
            body: { 
              email: user.email, 
              name: user.user_metadata?.full_name 
            }
          });
          console.log('Subscription confirmation email sent');
        } catch (error) {
          console.error('Error sending subscription email:', error);
        }
      }
      
      setIsVerifying(false);
    };
    
    verifySubscription();
  }, [checkSubscription, user]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-gradient-to-br from-primary to-primary/80 rounded-full p-6">
              <CheckCircle className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-foreground mb-4"
        >
          ¡Bienvenido a Sparky Pro! 🎉
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-8"
        >
          Tu suscripción se ha activado correctamente. Ahora tienes acceso ilimitado a todas las funcionalidades de Sparky.
        </motion.p>

        {/* Features unlocked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Ahora puedes disfrutar de:</span>
          </div>
          <ul className="space-y-3 text-left">
            {[
              'Ideas ilimitadas con IA',
              'Análisis de patrones avanzados',
              'Conexiones inteligentes entre ideas',
              'Asistente Sparky sin límites',
              'Resúmenes diarios personalizados',
            ].map((feature, index) => (
              <motion.li
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-3 text-muted-foreground"
              >
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          onClick={() => navigate('/dashboard')}
          disabled={isVerifying}
          className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isVerifying ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Verificando suscripción...
            </>
          ) : (
            <>
              Ir al Dashboard
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>

        {/* Support link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          ¿Tienes alguna pregunta?{' '}
          <a href="mailto:hola@soysparky.com" className="text-primary hover:underline">
            Contáctanos
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SubscriptionSuccess;
