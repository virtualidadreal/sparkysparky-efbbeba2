import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role to read admin settings (users can't read directly)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settings, error } = await supabaseAdmin
      .from('admin_settings')
      .select('key, value')
      .in('key', ['suggestions_enabled', 'suggestions_daily_limit', 'alerts_enabled', 'briefing_enabled']);

    if (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }

    // Parse settings into a clean object
    const result = {
      suggestionsEnabled: true,
      suggestionsDailyLimit: 10,
      alertsEnabled: true,
      briefingEnabled: true,
    };

    settings?.forEach((setting) => {
      switch (setting.key) {
        case 'suggestions_enabled':
          result.suggestionsEnabled = setting.value?.enabled ?? true;
          break;
        case 'suggestions_daily_limit':
          result.suggestionsDailyLimit = setting.value?.limit ?? 10;
          break;
        case 'alerts_enabled':
          result.alertsEnabled = setting.value?.enabled ?? true;
          break;
        case 'briefing_enabled':
          result.briefingEnabled = setting.value?.enabled ?? true;
          break;
      }
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-insights-settings:', error);
    return new Response(JSON.stringify({
      suggestionsEnabled: true,
      suggestionsDailyLimit: 10,
      alertsEnabled: true,
      briefingEnabled: true,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
