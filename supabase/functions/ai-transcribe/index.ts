import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Step 1: Check for sensitive keywords
    const lowerTranscript = transcript.toLowerCase();
    const detectedKeywords = SENSITIVE_KEYWORDS.filter((kw) => lowerTranscript.includes(kw));

    if (detectedKeywords.length === 0) {
      return new Response(JSON.stringify({ flag_level: 0, keywords: [], session_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 2: Classify severity using Groq
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
          {
            role: "user",
            content: transcript.substring(0, 2000),
          },
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

    // Step 3: Extract ±10s context around first keyword as trigger snippet
    const firstKeyword = detectedKeywords[0];
    const keywordIndex = lowerTranscript.indexOf(firstKeyword);
    const snippetStart = Math.max(0, keywordIndex - 200);
    const snippetEnd = Math.min(transcript.length, keywordIndex + firstKeyword.length + 200);
    const trigger_snippet = transcript.substring(snippetStart, snippetEnd);

    // Step 4: Update session flag level
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Update session flag level based on session type
    if (sType === "peer") {
      await fetch(`${SUPABASE_URL}/rest/v1/peer_sessions?id=eq.${session_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          is_flagged: flag_level >= 2,
          escalation_note_encrypted: `AI detected L${flag_level}: ${detectedKeywords.join(", ")} | ${trigger_snippet.substring(0, 500)}`,
        }),
      });
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/blackbox_sessions?id=eq.${session_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          flag_level,
          escalation_reason: `AI detected: ${detectedKeywords.join(", ")}`,
          escalation_history: [
            {
              level: flag_level,
              keywords: detectedKeywords,
              snippet: trigger_snippet,
              timestamp: new Date().toISOString(),
              auto: true,
            },
          ],
        }),
      });
    }

    // For L2+ create escalation request
    if (flag_level >= 2) {
      // Fetch session to get student_id
      const sessionResp = await fetch(`${SUPABASE_URL}/rest/v1/blackbox_sessions?id=eq.${session_id}&select=student_id`, {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      });
      const sessions = await sessionResp.json();
      const studentId = sessions?.[0]?.student_id;

      if (studentId) {
        // Find student's institution SPOC
        const profileResp = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${studentId}&select=institution_id`, {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        });
        const profiles = await profileResp.json();
        const institutionId = profiles?.[0]?.institution_id;

        if (institutionId) {
          const spocResp = await fetch(`${SUPABASE_URL}/rest/v1/profiles?institution_id=eq.${institutionId}&role=eq.spoc&limit=1&select=id`, {
            headers: {
              apikey: SUPABASE_SERVICE_ROLE_KEY,
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
          });
          const spocs = await spocResp.json();
          const spocId = spocs?.[0]?.id;

          if (spocId) {
            await fetch(`${SUPABASE_URL}/rest/v1/escalation_requests`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: SUPABASE_SERVICE_ROLE_KEY,
                Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                Prefer: "return=minimal",
              },
              body: JSON.stringify({
                spoc_id: spocId,
                justification_encrypted: `AI flagged L${flag_level}: ${detectedKeywords.join(", ")}`,
                escalation_level: flag_level,
                trigger_snippet,
                trigger_timestamp: new Date().toISOString(),
                status: flag_level >= 3 ? "critical" : "pending",
              }),
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        flag_level,
        keywords: detectedKeywords,
        trigger_snippet,
        session_id,
      }),
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
