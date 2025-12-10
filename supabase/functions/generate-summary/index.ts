import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SummaryRequest {
  type: "weekly" | "monthly" | "topic" | "project";
  periodStart?: string;
  periodEnd?: string;
  topic?: string;
  projectId?: string;
}

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

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, periodStart, periodEnd, topic, projectId }: SummaryRequest = await req.json();
    console.log(`Generating ${type} summary for user ${user.id}`);

    // Fetch relevant data based on summary type
    let ideas: any[] = [];
    let tasks: any[] = [];
    let diaryEntries: any[] = [];
    let project: any = null;

    const startDate = periodStart || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const endDate = periodEnd || new Date().toISOString().split("T")[0];

    // Fetch ideas
    let ideasQuery = supabase
      .from("ideas")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59");

    if (projectId) {
      ideasQuery = ideasQuery.eq("project_id", projectId);
    }

    const { data: ideasData } = await ideasQuery;
    ideas = ideasData || [];

    // Fetch tasks
    let tasksQuery = supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate)
      .lte("created_at", endDate + "T23:59:59");

    if (projectId) {
      tasksQuery = tasksQuery.eq("project_id", projectId);
    }

    const { data: tasksData } = await tasksQuery;
    tasks = tasksData || [];

    // Fetch diary entries
    const { data: diaryData } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("entry_date", startDate)
      .lte("entry_date", endDate);

    diaryEntries = diaryData || [];

    // Fetch project if specified
    if (projectId) {
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
      project = projectData;
    }

    // Fetch existing memory entries for context
    const { data: memoryData } = await supabase
      .from("memory_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("reference_count", { ascending: false })
      .limit(20);

    const memories = memoryData || [];

    // Build context for AI
    const context = {
      period: { start: startDate, end: endDate },
      ideas: ideas.map((i) => ({
        title: i.title,
        summary: i.summary,
        tags: i.tags,
        sentiment: i.sentiment,
        created_at: i.created_at,
      })),
      tasks: tasks.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        due_date: t.due_date,
      })),
      diaryEntries: diaryEntries.map((d) => ({
        title: d.title,
        content: d.content?.substring(0, 500),
        mood: d.mood,
        entry_date: d.entry_date,
      })),
      project: project ? { title: project.title, description: project.description } : null,
      memories: memories.map((m) => ({
        type: m.entry_type,
        content: m.content,
        category: m.category,
      })),
    };

    const systemPrompt = `Eres Sparky, un asistente personal inteligente que ayuda a los usuarios a reflexionar sobre su progreso y detectar patrones.

Tu tarea es generar un superresumen ${type === "weekly" ? "semanal" : type === "monthly" ? "mensual" : type === "topic" ? "por tema" : "de proyecto"}.

Debes responder SIEMPRE con un objeto JSON válido con esta estructura:
{
  "title": "Título descriptivo del resumen",
  "content": "Resumen narrativo de 2-4 párrafos",
  "key_insights": ["Insight 1", "Insight 2", "Insight 3"],
  "patterns_detected": [
    {"type": "recurring_theme|behavior|productivity|emotional", "title": "Nombre del patrón", "description": "Descripción"}
  ],
  "action_items": ["Acción sugerida 1", "Acción sugerida 2"],
  "metrics": {
    "ideas_count": number,
    "tasks_completed": number,
    "tasks_pending": number,
    "dominant_mood": "string o null",
    "productivity_score": number 1-10
  }
}

Sé cálido, cercano y constructivo. Destaca logros y ofrece sugerencias accionables.`;

    const userPrompt = `Genera un superresumen para el período ${startDate} a ${endDate}.

Contexto del usuario:
${JSON.stringify(context, null, 2)}`;

    // Call Lovable AI
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later" }), {
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

    // Parse AI response
    let summaryData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      summaryData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      summaryData = {
        title: `Resumen ${type} - ${startDate} a ${endDate}`,
        content: content,
        key_insights: [],
        patterns_detected: [],
        action_items: [],
        metrics: {
          ideas_count: ideas.length,
          tasks_completed: tasks.filter((t) => t.status === "done").length,
          tasks_pending: tasks.filter((t) => t.status !== "done").length,
        },
      };
    }

    // Save summary to database
    const { data: savedSummary, error: saveError } = await supabase
      .from("summaries")
      .insert({
        user_id: user.id,
        summary_type: type,
        period_start: startDate,
        period_end: endDate,
        topic: topic || null,
        project_id: projectId || null,
        title: summaryData.title,
        content: summaryData.content,
        key_insights: summaryData.key_insights || [],
        patterns_detected: summaryData.patterns_detected || [],
        action_items: summaryData.action_items || [],
        metrics: summaryData.metrics || {},
        sources: {
          ideas_count: ideas.length,
          tasks_count: tasks.length,
          diary_count: diaryEntries.length,
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving summary:", saveError);
    }

    // Save detected patterns
    if (summaryData.patterns_detected?.length > 0) {
      for (const pattern of summaryData.patterns_detected) {
        await supabase.from("detected_patterns").insert({
          user_id: user.id,
          pattern_type: pattern.type || "recurring_theme",
          title: pattern.title,
          description: pattern.description,
          evidence: [{ summary_id: savedSummary?.id, period: { start: startDate, end: endDate } }],
        });
      }
    }

    console.log(`Summary generated successfully for user ${user.id}`);

    return new Response(JSON.stringify({ summary: savedSummary || summaryData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating summary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
