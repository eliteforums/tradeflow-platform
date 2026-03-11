import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, entry_id } = await req.json();
    if (!content || !entry_id) {
      return new Response(JSON.stringify({ error: "content and entry_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI gateway not configured");

    // Classify risk level using Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a mental health content safety classifier for a student wellness platform. Classify the emotional risk level of user-submitted text. Respond with ONLY a single digit 0-3:

0 = Normal/healthy expression (journaling, gratitude, mild stress)
1 = Mild distress (frustration, sadness, anxiety, loneliness)  
2 = Moderate concern (persistent hopelessness, isolation, self-harm ideation without plan)
3 = Critical/crisis (explicit self-harm intent, suicidal ideation with plan, danger to self or others)

Respond with ONLY the number. No explanation.`,
          },
          {
            role: "user",
            content: content.substring(0, 2000), // Limit input size
          },
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI gateway error:", await aiResponse.text());
      // Default to 0 on AI failure — don't block user
      return new Response(JSON.stringify({ flag_level: 0, entry_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawLevel = aiData.choices?.[0]?.message?.content?.trim() || "0";
    const flag_level = Math.min(3, Math.max(0, parseInt(rawLevel, 10) || 0));

    // Update the entry's flag level using service role
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    await fetch(`${SUPABASE_URL}/rest/v1/blackbox_entries?id=eq.${entry_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ ai_flag_level: flag_level }),
    });

    return new Response(JSON.stringify({ flag_level, entry_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI moderation error:", error);
    return new Response(JSON.stringify({ error: error.message, flag_level: 0 }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
