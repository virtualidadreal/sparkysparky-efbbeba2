import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Analyzing patterns for user ${user.id}`);

    // Fetch all user data for analysis
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [ideasRes, tasksRes, diaryRes, memoriesRes] = await Promise.all([
      supabase.from("ideas").select("*").eq("user_id", user.id).gte("created_at", thirtyDaysAgo),
      supabase.from("tasks").select("*").eq("user_id", user.id).gte("created_at", thirtyDaysAgo),
      supabase.from("diary_entries").select("*").eq("user_id", user.id).gte("created_at", thirtyDaysAgo),
      supabase.from("memory_entries").select("*").eq("user_id", user.id).eq("is_active", true),
    ]);

    const ideas = ideasRes.data || [];
    const tasks = tasksRes.data || [];
    const diaryEntries = diaryRes.data || [];
    const memories = memoriesRes.data || [];

    // Build analysis context
    const analysisContext = {
      ideas: ideas.map((i) => ({
        title: i.title,
        tags: i.tags,
        sentiment: i.sentiment,
        emotions: i.detected_emotions,
        category: i.category,
        created_at: i.created_at,
      })),
      tasks: tasks.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        due_date: t.due_date,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })),
      diary: diaryEntries.map((d) => ({
        mood: d.mood,
        entry_date: d.entry_date,
        content_preview: d.content?.substring(0, 200),
      })),
      existing_memories: memories.map((m) => ({
        type: m.entry_type,
        content: m.content,
        category: m.category,
      })),
      stats: {
        total_ideas: ideas.length,
        total_tasks: tasks.length,
        completed_tasks: tasks.filter((t) => t.status === "done").length,
        pending_tasks: tasks.filter((t) => t.status !== "done").length,
        high_priority_pending: tasks.filter((t) => t.priority === "high" && t.status !== "done").length,
      },
    };

    const systemPrompt = `Eres Sparky, un asistente personal inteligente especializado en detectar patrones de comportamiento, productividad y bienestar.

Analiza los datos del usuario y detecta patrones significativos. Responde SIEMPRE con un JSON válido:

{
  "patterns": [
    {
      "type": "recurring_theme|behavior|productivity|emotional|goal_progress|blocker",
      "title": "Nombre corto del patrón",
      "description": "Descripción detallada del patrón detectado",
      "evidence": ["Evidencia 1", "Evidencia 2"],
      "suggestions": ["Sugerencia 1", "Sugerencia 2"],
      "severity": "info|warning|critical"
    }
  ],
  "new_memories": [
    {
      "type": "fact|preference|pattern|insight|goal|habit",
      "category": "trabajo|personal|salud|relaciones|creatividad|productividad",
      "content": "Información a recordar sobre el usuario"
    }
  ],
  "overall_insights": {
    "productivity_trend": "improving|stable|declining",
    "emotional_trend": "positive|neutral|negative",
    "focus_areas": ["área 1", "área 2"],
    "strengths": ["fortaleza 1", "fortaleza 2"],
    "areas_to_improve": ["área a mejorar 1"]
  }
}

Sé observador pero no invasivo. Destaca patrones útiles y accionables.`;

    const userPrompt = `Analiza los siguientes datos del usuario de los últimos 30 días y detecta patrones:

${JSON.stringify(analysisContext, null, 2)}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content from AI");
    }

    let analysisResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      analysisResult = { patterns: [], new_memories: [], overall_insights: {} };
    }

    // Save detected patterns
    if (analysisResult.patterns?.length > 0) {
      for (const pattern of analysisResult.patterns) {
        // Check if similar pattern exists
        const { data: existingPattern } = await supabase
          .from("detected_patterns")
          .select("*")
          .eq("user_id", user.id)
          .eq("title", pattern.title)
          .eq("status", "active")
          .maybeSingle();

        if (existingPattern) {
          // Update occurrences
          await supabase
            .from("detected_patterns")
            .update({
              occurrences: existingPattern.occurrences + 1,
              last_detected_at: new Date().toISOString(),
              evidence: [...(existingPattern.evidence || []), ...pattern.evidence],
            })
            .eq("id", existingPattern.id);
        } else {
          await supabase.from("detected_patterns").insert({
            user_id: user.id,
            pattern_type: pattern.type,
            title: pattern.title,
            description: pattern.description,
            evidence: pattern.evidence,
            suggestions: pattern.suggestions,
          });
        }
      }
    }

    // Save new memory entries
    if (analysisResult.new_memories?.length > 0) {
      for (const memory of analysisResult.new_memories) {
        // Check if similar memory exists
        const { data: existingMemory } = await supabase
          .from("memory_entries")
          .select("*")
          .eq("user_id", user.id)
          .eq("content", memory.content)
          .maybeSingle();

        if (!existingMemory) {
          await supabase.from("memory_entries").insert({
            user_id: user.id,
            entry_type: memory.type,
            category: memory.category,
            content: memory.content,
            source_type: "ai_detected",
          });
        }
      }
    }

    console.log(`Pattern analysis completed for user ${user.id}`);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error analyzing patterns:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
