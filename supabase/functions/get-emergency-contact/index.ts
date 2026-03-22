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
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller identity
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = claimsData.claims.sub;

    const { student_id, session_id } = await req.json();
    if (!student_id || !session_id) {
      return new Response(JSON.stringify({ error: "student_id and session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for privileged access
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Validate caller is the therapist on this session
    const { data: session, error: sessionError } = await adminClient
      .from("blackbox_sessions")
      .select("therapist_id, student_id, flag_level")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Session not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (session.therapist_id !== callerId) {
      return new Response(JSON.stringify({ error: "Not authorized for this session" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (session.student_id !== student_id) {
      return new Response(JSON.stringify({ error: "Student mismatch" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only allow for L3 escalations
    if (session.flag_level < 3) {
      return new Response(JSON.stringify({ error: "Emergency contact only available for L3 escalations" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch emergency contact
    const { data: privateData, error: privateError } = await adminClient
      .from("user_private")
      .select("emergency_name_encrypted, emergency_phone_encrypted, emergency_relation, contact_is_self")
      .eq("user_id", student_id)
      .single();

    if (privateError || !privateData) {
      return new Response(JSON.stringify({ contact: null, message: "No emergency contact on file" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        contact: {
          name: privateData.emergency_name_encrypted || "Not provided",
          phone: privateData.emergency_phone_encrypted || "Not provided",
          relation: privateData.emergency_relation || "Not specified",
          is_self: privateData.contact_is_self || false,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("get-emergency-contact error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
