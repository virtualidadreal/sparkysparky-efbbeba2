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
    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch sidebar visibility setting
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'sidebar_visibility')
      .maybeSingle();

    if (error) {
      console.error('Error fetching sidebar visibility:', error);
      return new Response(
        JSON.stringify({ 
          visibility: {
            dashboard: true,
            ideas: true,
            projects: true,
            tasks: true,
            people: true,
            diary: true,
            memory: true,
            analytics: true,
            insights: true,
            settings: true,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        visibility: data?.value || {
          dashboard: true,
          ideas: true,
          projects: true,
          tasks: true,
          people: true,
          diary: true,
          memory: true,
          analytics: true,
          insights: true,
          settings: true,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-sidebar-visibility:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        visibility: {
          dashboard: true,
          ideas: true,
          projects: true,
          tasks: true,
          people: true,
          diary: true,
          memory: true,
          analytics: true,
          insights: true,
          settings: true,
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
