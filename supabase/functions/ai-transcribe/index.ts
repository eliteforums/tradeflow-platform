import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SENSITIVE_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "want to die",
  "self-harm", "self harm", "cutting", "hurt myself",
  "depression", "depressed", "hopeless", "worthless",
  "abuse", "abused", "violence", "assault",
  "overdose", "pills", "jump off", "hang myself",
  "nobody cares", "better off dead", "can't go on",
  "panic attack", "anxiety attack", "breakdown",
];

const SYSTEM_ACTOR_ID = "00000000-0000-0000-0000-000000000000";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    if (detectedKeywords.length === 0) {
      return new Response(JSON.stringify({ flag_level: 0, keywords: [], session_id, suggestion: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Classify severity using Lovable AI gateway with structured output via tool calling
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a mental health crisis classifier for a student wellness platform. Given a conversation snippet from a voice call, analyze risk indicators and emotional distress signals. Detected keywords: ${detectedKeywords.join(", ")}`,
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
                    description: "1 = L1 Mild (general distress, sadness, frustration, mild anxiety), 2 = L2 Moderate (persistent hopelessness, isolation talk, passive self-harm ideation), 3 = L3 Critical (explicit self-harm intent, suicidal plan, immediate danger)",
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

    let flag_level = 1;
    let risk_indicators: string[] = [];
    let emotional_signals: string[] = [];
    let reasoning = "Keywords detected in conversation";

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          flag_level = Math.min(3, Math.max(1, args.risk_level || 1));
          risk_indicators = args.risk_indicators || [];
          emotional_signals = args.emotional_signals || [];
          reasoning = args.reasoning || reasoning;
        } catch {
          // Fallback to default L1
        }
      }
    } else {
      console.error("AI gateway error:", aiResponse.status, await aiResponse.text());
    }

    // Extract ±10s context around first keyword
    const firstKeyword = detectedKeywords[0];
    const keywordIndex = lowerTranscript.indexOf(firstKeyword);
    const snippetStart = Math.max(0, keywordIndex - 200);
    const snippetEnd = Math.min(transcript.length, keywordIndex + firstKeyword.length + 200);
    const trigger_snippet = transcript.substring(snippetStart, snippetEnd);

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
      // Fetch existing escalation_history and append
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
        escalation_reason: `AI detected: ${detectedKeywords.join(", ")}`,
        escalation_history: [...existingHistory, newHistoryEntry],
      }).eq("id", session_id);
    }

    // Audit log for L2+ AI-triggered detections (suggestion only, no auto-escalation)
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

      // NOTE: No auto-escalation requests created here.
      // The human (expert/intern/therapist) decides via the suggestion popup.
    }

    // Build suggestion object for the client popup
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
    return new Response(JSON.stringify({ error: error.message, flag_level: 0 }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
