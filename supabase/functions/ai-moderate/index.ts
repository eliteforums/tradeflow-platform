import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiter
const rateStore = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, max = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const e = rateStore.get(key);
  if (!e || now > e.resetAt) { rateStore.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  e.count++;
  return e.count <= max;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!rateLimit(`ai-mod:${ip}`, 30)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const content = typeof body?.content === "string" ? body.content.trim().slice(0, 5000) : "";
    const entry_id = typeof body?.entry_id === "string" && /^[0-9a-f-]{36}$/i.test(body.entry_id) ? body.entry_id : null;

    if (!content || !entry_id) {
      return new Response(JSON.stringify({ error: "content and entry_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "system",
            content: `You are a mental health content safety classifier for a student wellness platform. Classify the emotional risk level of user-submitted text. Respond with ONLY a single digit 0-3:

0 = Normal/healthy expression (journaling, gratitude, mild stress)
1 = L1 Mild distress (frustration, sadness, anxiety, loneliness)  
2 = L2 Moderate concern (persistent hopelessness, isolation, self-harm ideation without plan)
3 = L3 Critical/crisis (explicit self-harm intent, suicidal ideation with plan, danger to self or others)

Respond with ONLY the number. No explanation.`,
          },
          {
            role: "user",
            content: content.substring(0, 2000),
          },
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    if (!aiResponse.ok) {
      console.error("Groq API error:", await aiResponse.text());
      return new Response(JSON.stringify({ flag_level: 0, entry_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawLevel = aiData.choices?.[0]?.message?.content?.trim() || "0";
    const flag_level = Math.min(3, Math.max(0, parseInt(rawLevel, 10) || 0));

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
    return new Response(JSON.stringify({ error: (error as Error).message, flag_level: 0 }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
