import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'stats';

    // GET: Get early access stats (public) - Now counts actual registered users
    if (req.method === 'GET' && action === 'stats') {
      console.log('Fetching early access stats (counting registered users)...');
      
      // Get total spots from settings
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'early_access_limit')
        .single();
      
      const totalSpots = settingsData?.value ? parseInt(String(settingsData.value)) : 30;
      
      // Count actual registered users from profiles table
      const { count: userCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error counting users:', countError);
        throw countError;
      }

      const spotsTaken = userCount || 0;
      const result = {
        spots_taken: spotsTaken,
        total_spots: totalSpots,
        spots_remaining: Math.max(0, totalSpots - spotsTaken),
        is_available: spotsTaken < totalSpots
      };

      console.log('Early access stats:', result);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST: Claim an early access spot (requires auth)
    if (req.method === 'POST' && action === 'claim') {
      // Get auth header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No autorizado' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create client with user's token
      const supabaseUser = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      // Get user
      const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
      
      if (authError || !user) {
        console.error('Auth error:', authError);
        return new Response(
          JSON.stringify({ error: 'No autorizado' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('User claiming early access:', user.id);

      // Call the claim function with service role
      const { data, error } = await supabase.rpc('claim_early_access_spot', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error claiming spot:', error);
        throw error;
      }

      console.log('Claim result:', data);

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Acción no válida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Early access function error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
