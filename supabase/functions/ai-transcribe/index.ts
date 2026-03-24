import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

// System actor ID for AI-triggered audit logs
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

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const lowerTranscript = transcript.toLowerCase();
    const detectedKeywords = SENSITIVE_KEYWORDS.filter((kw) => lowerTranscript.includes(kw));

    if (detectedKeywords.length === 0) {
      return new Response(JSON.stringify({ flag_level: 0, keywords: [], session_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Classify severity using Groq
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
            content: `You are a mental health crisis classifier. Given a conversation snippet from a student wellness voice call, classify the escalation level. Respond with ONLY a single digit 1-3:

1 = L1 Mild: general distress, sadness, frustration, mild anxiety
2 = L2 Moderate: persistent hopelessness, isolation talk, passive self-harm ideation  
3 = L3 Critical: explicit self-harm intent, suicidal plan, immediate danger

Detected keywords: ${detectedKeywords.join(", ")}

Respond with ONLY the number.`,
          },
          { role: "user", content: transcript.substring(0, 2000) },
        ],
        max_tokens: 5,
        temperature: 0,
      }),
    });

    let flag_level = 1;
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const raw = aiData.choices?.[0]?.message?.content?.trim() || "1";
      flag_level = Math.min(3, Math.max(1, parseInt(raw, 10) || 1));
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

    // Audit log for L2+ AI-triggered escalations
    if (flag_level >= 2) {
      // Fetch student_id for the audit log
      const table = sType === "peer" ? "peer_sessions" : "blackbox_sessions";
      const { data: sessionData } = await adminClient
        .from(table)
        .select("student_id")
        .eq("id", session_id)
        .single();

      const studentId = sessionData?.student_id;

      // Insert audit log
      await adminClient.from("audit_logs").insert({
        actor_id: studentId || SYSTEM_ACTOR_ID,
        action_type: "ai_auto_escalation",
        target_table: table,
        target_id: session_id,
        metadata: {
          flag_level,
          keywords: detectedKeywords,
          session_type: sType,
          auto: true,
        },
      });

      // Create escalation request for SPOC
      if (studentId) {
        const { data: studentProfile } = await adminClient
          .from("profiles")
          .select("institution_id")
          .eq("id", studentId)
          .single();

        if (studentProfile?.institution_id) {
          const { data: spocs } = await adminClient
            .from("profiles")
            .select("id")
            .eq("institution_id", studentProfile.institution_id)
            .eq("role", "spoc")
            .limit(1);

          if (spocs && spocs.length > 0) {
            await adminClient.from("escalation_requests").insert({
              spoc_id: spocs[0].id,
              justification_encrypted: `AI flagged L${flag_level}: ${detectedKeywords.join(", ")}`,
              escalation_level: flag_level,
              trigger_snippet,
              trigger_timestamp: new Date().toISOString(),
              status: flag_level >= 3 ? "critical" : "pending",
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ flag_level, keywords: detectedKeywords, trigger_snippet, session_id }),
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
