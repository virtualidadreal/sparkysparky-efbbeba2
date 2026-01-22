import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionEmailRequest {
  email: string;
  name?: string;
}

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBSCRIPTION-EMAIL] ${step}${detailsStr}`);
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { email, name }: SubscriptionEmailRequest = await req.json();
    
    logStep("Sending subscription confirmation email", { email, name });

    const displayName = name || email.split('@')[0];
    const subscriptionDate = new Date().toLocaleString('es-ES', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Europe/Madrid'
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Sparky <onboarding@resend.dev>",
        to: [email],
        subject: "¡Bienvenido/a a Sparky Pro! ⚡",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: #1a1a1a; font-size: 28px; margin: 0; font-weight: 700;">
                  ⚡ ¡Eres Sparky Pro!
                </h1>
              </div>
              
              <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  ¡Hola <strong>${displayName}</strong>! 🎉
                </p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                  Tu suscripción a <strong>Sparky Pro</strong> se ha activado correctamente. Ahora tienes acceso ilimitado a todas las funcionalidades de tu segundo cerebro.
                </p>
                
                <div style="background-color: #fef3c7; padding: 20px; border-radius: 12px; margin: 24px 0;">
                  <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0;">✨ Ahora puedes disfrutar de:</h3>
                  <ul style="color: #78350f; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    <li><strong>Ideas ilimitadas</strong> con procesamiento IA</li>
                    <li><strong>Análisis de patrones</strong> avanzados</li>
                    <li><strong>Conexiones inteligentes</strong> entre tus ideas</li>
                    <li><strong>Asistente Sparky</strong> sin límites</li>
                    <li><strong>Resúmenes diarios</strong> personalizados</li>
                  </ul>
                </div>
                
                <div style="background-color: #ecfdf5; padding: 16px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #10b981;">
                  <p style="color: #065f46; font-size: 14px; margin: 0;">
                    <strong>📅 Fecha de activación:</strong><br>
                    ${subscriptionDate}
                  </p>
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://sparkysparky.lovable.app/dashboard" 
                     style="display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: #1a1a1a; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                    Empezar a usar Sparky Pro →
                  </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
                  Puedes gestionar tu suscripción en cualquier momento desde <a href="https://sparkysparky.lovable.app/settings" style="color: #f59e0b;">Ajustes → Suscripción</a>.
                </p>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 16px 0 0 0; text-align: center;">
                  ¿Necesitas ayuda? Escríbenos a 
                  <a href="mailto:hola@sparky.app" style="color: #f59e0b;">hola@sparky.app</a>
                </p>
              </div>
              
              <div style="text-align: center; padding: 24px;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Sparky. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      logStep("Resend API error", { status: res.status, error: errorData });
      throw new Error(`Resend API error: ${errorData}`);
    }

    const emailResponse = await res.json();
    logStep("Email sent successfully", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logStep("Error sending subscription email", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
