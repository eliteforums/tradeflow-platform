import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Expanded keyword list (~80+ terms) covering diverse distress signals
const SENSITIVE_KEYWORDS = [
  // Original critical terms
  "suicide", "suicidal", "kill myself", "end my life", "want to die",
  "self-harm", "self harm", "cutting", "hurt myself",
  "abuse", "abused", "violence", "assault",
  "overdose", "pills", "jump off", "hang myself",
  "nobody cares", "better off dead", "can't go on",
  "panic attack", "anxiety attack", "breakdown",

  // Emotional distress
  "stress", "stressed", "anxious", "anxiety", "overwhelmed",
  "crying", "lonely", "loneliness", "scared", "terrified",
  "numb", "empty", "exhausted", "burned out", "burnout",
  "miserable", "suffering", "tormented", "frustrated",
  "angry", "furious", "rage", "shame", "guilty",
  "grief", "mourning", "heartbroken",
  "depressed", "depression", "hopeless", "worthless",

  // Academic / social pressure
  "failing", "dropped out", "bullied", "bullying", "ragging",
  "harassment", "humiliated", "rejected", "isolated",
  "no friends", "left out", "excluded",

  // Substance
  "drinking", "drunk", "alcohol", "drugs", "smoking",
  "addiction", "addicted",

  // Self-harm expanded
  "bleed", "bleeding", "scars", "razor", "bridge",
  "rooftop", "hanging", "drowning", "suffocating", "starving",

  // Family / relationship
  "divorce", "breakup", "broken up", "domestic violence",
  "beaten", "molested", "raped", "trauma", "ptsd",
  "flashbacks", "abusive",

  // Existential / hopelessness
  "no purpose", "meaningless", "pointless", "give up", "giving up",
  "lost hope", "no future", "trapped", "stuck", "can't breathe",
  "don't care anymore", "nothing matters", "why bother",
  "what's the point", "no one understands", "all alone",
  "want it to end", "can't take it", "falling apart",
];

const SYSTEM_ACTOR_ID = "00000000-0000-0000-0000-000000000000";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    const { data: { user }, error: userErr } = await supabaseAuth.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { transcript, session_id, timestamp_offset, session_type } = await req.json();
    const sType: "blackbox" | "peer" = session_type === "peer" ? "peer" : "blackbox";
    if (!transcript || !session_id) {
      return new Response(JSON.stringify({ error: "transcript and session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lowerTranscript = transcript.toLowerCase();
    const detectedKeywords = SENSITIVE_KEYWORDS.filter((kw) => lowerTranscript.includes(kw));
    const hasKeywords = detectedKeywords.length > 0;
    const isSubstantial = transcript.length > 50;

    // REMOVED HARD GATE: Only skip AI if transcript is too short AND has no keywords
    if (!hasKeywords && !isSubstantial) {
      return new Response(JSON.stringify({ flag_level: 0, keywords: [], session_id, suggestion: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Classify severity using Groq Llama 3.3 70B with tool calling for structured output
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    // Build system prompt — include keyword context if available, otherwise general analysis
    const keywordContext = hasKeywords
      ? `Detected distress keywords in transcript: ${detectedKeywords.join(", ")}. Use these as additional context but perform your own independent analysis.`
      : `No specific keywords were matched, but the transcript is substantial. Perform a thorough independent risk analysis looking for any signs of emotional distress, risk indicators, or concerning patterns.`;

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are a mental health crisis classifier for a student wellness platform. Given a conversation snippet from a voice call, analyze risk indicators and emotional distress signals. Look beyond just keywords — analyze tone, context, intent, and severity of statements. ${keywordContext}`,
          },
          { role: "user", content: transcript.substring(0, 2000) },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_risk",
              description: "Classify the risk level and provide analysis of the conversation snippet",
              parameters: {
                type: "object",
                properties: {
                  risk_level: {
                    type: "integer",
                    description: "0 = No risk detected (normal conversation), 1 = L1 Mild (general distress, sadness, frustration, mild anxiety), 2 = L2 Moderate (persistent hopelessness, isolation talk, passive self-harm ideation), 3 = L3 Critical (explicit self-harm intent, suicidal plan, immediate danger)",
                  },
                  risk_indicators: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific risk indicators detected in the text beyond just keywords, e.g. 'expressing finality in plans', 'giving away possessions'",
                  },
                  emotional_signals: {
                    type: "array",
                    items: { type: "string" },
                    description: "Emotional distress signals detected, e.g. 'tone of hopelessness', 'escalating despair', 'emotional numbness'",
                  },
                  reasoning: {
                    type: "string",
                    description: "1-2 sentence explanation of why this risk level was assigned",
                  },
                },
                required: ["risk_level", "risk_indicators", "emotional_signals", "reasoning"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_risk" } },
        temperature: 0,
      }),
    });

    let flag_level = hasKeywords ? 1 : 0;
    let risk_indicators: string[] = [];
    let emotional_signals: string[] = [];
    let reasoning = hasKeywords ? "Keywords detected in conversation" : "General analysis performed";

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          flag_level = Math.min(3, Math.max(0, args.risk_level ?? (hasKeywords ? 1 : 0)));
          risk_indicators = args.risk_indicators || [];
          emotional_signals = args.emotional_signals || [];
          reasoning = args.reasoning || reasoning;
        } catch {
          // Fallback to default
        }
      }
    } else {
      console.error("Groq API error:", aiResponse.status, await aiResponse.text());
    }

    // If AI determined no risk (level 0), return early without updating session
    if (flag_level === 0) {
      return new Response(JSON.stringify({ flag_level: 0, keywords: detectedKeywords, session_id, suggestion: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract ±200 char context around first keyword (or start of transcript if no keywords)
    let trigger_snippet: string;
    if (hasKeywords) {
      const firstKeyword = detectedKeywords[0];
      const keywordIndex = lowerTranscript.indexOf(firstKeyword);
      const snippetStart = Math.max(0, keywordIndex - 200);
      const snippetEnd = Math.min(transcript.length, keywordIndex + firstKeyword.length + 200);
      trigger_snippet = transcript.substring(snippetStart, snippetEnd);
    } else {
      trigger_snippet = transcript.substring(0, 400);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const newHistoryEntry = {
      level: flag_level,
      keywords: detectedKeywords,
      snippet: trigger_snippet,
      risk_indicators,
      emotional_signals,
      reasoning,
      timestamp: new Date().toISOString(),
      auto: true,
    };

    if (sType === "peer") {
      await adminClient.from("peer_sessions").update({
        is_flagged: flag_level >= 2,
        escalation_note_encrypted: `AI detected L${flag_level}: ${detectedKeywords.join(", ")} | ${trigger_snippet.substring(0, 500)}`,
      }).eq("id", session_id);
    } else {
      const { data: existingSession } = await adminClient
        .from("blackbox_sessions")
        .select("escalation_history")
        .eq("id", session_id)
        .single();

      const existingHistory = Array.isArray(existingSession?.escalation_history)
        ? existingSession.escalation_history
        : [];

      await adminClient.from("blackbox_sessions").update({
        flag_level,
        ...(flag_level >= 3 ? { status: "escalated" } : {}),
        escalation_reason: `AI detected: ${detectedKeywords.length > 0 ? detectedKeywords.join(", ") : "contextual risk signals"}`,
        escalation_history: [...existingHistory, newHistoryEntry],
      }).eq("id", session_id);
    }

    // Audit log for L2+ AI-triggered detections
    if (flag_level >= 2) {
      const table = sType === "peer" ? "peer_sessions" : "blackbox_sessions";
      const { data: sessionData } = await adminClient
        .from(table)
        .select("student_id")
        .eq("id", session_id)
        .single();

      const studentId = sessionData?.student_id;

      await adminClient.from("audit_logs").insert({
        actor_id: studentId || SYSTEM_ACTOR_ID,
        action_type: "ai_risk_suggestion",
        target_table: table,
        target_id: session_id,
        metadata: {
          flag_level,
          keywords: detectedKeywords,
          risk_indicators,
          emotional_signals,
          session_type: sType,
          auto: true,
          suggestion_only: true,
        },
      });
    }

    const suggestion = {
      risk_level: flag_level,
      keywords: detectedKeywords,
      risk_indicators,
      emotional_signals,
      reasoning,
      snippet: trigger_snippet,
    };

    return new Response(
      JSON.stringify({ flag_level, keywords: detectedKeywords, trigger_snippet, session_id, suggestion }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI transcribe error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message, flag_level: 0 }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
