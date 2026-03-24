import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { institution_id, id_type, student_id } = await req.json();

    if (!institution_id || !id_type || !student_id) {
      throw new Error("Missing required fields");
    }

    if (!["apaar", "erp"].includes(id_type)) {
      throw new Error("Invalid id_type");
    }

    const trimmedId = student_id.trim();

    // Format validation
    if (id_type === "apaar" && !/^\d{12}$/.test(trimmedId)) {
      return new Response(
        JSON.stringify({ verified: false, reason: "invalid_format", message: "APAAR / ABC ID must be exactly 12 digits" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (id_type === "erp" && !/^[a-zA-Z0-9]{3,50}$/.test(trimmedId)) {
      return new Response(
        JSON.stringify({ verified: false, reason: "invalid_format", message: "ERP ID must be 3-50 alphanumeric characters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      _key: `verify_sid:${institution_id}:${trimmedId}`,
      _max_requests: 10,
      _window_seconds: 60,
    });
    if (!allowed) {
      return new Response(
        JSON.stringify({ verified: false, reason: "rate_limited", message: "Too many attempts. Please wait." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if institution has any uploaded IDs
    const { count: totalIds } = await supabase
      .from("institution_student_ids")
      .select("id", { count: "exact", head: true })
      .eq("institution_id", institution_id)
      .eq("id_type", id_type);

    if (!totalIds || totalIds === 0) {
      // Institution hasn't uploaded any IDs yet — allow with warning
      return new Response(
        JSON.stringify({ verified: false, reason: "no_records", message: "Institution has not uploaded verification records yet. You can proceed without verification." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up the student ID
    const { data: match, error: matchErr } = await supabase
      .from("institution_student_ids")
      .select("id, is_claimed")
      .eq("institution_id", institution_id)
      .eq("id_type", id_type)
      .eq("student_id_hash", trimmedId)
      .maybeSingle();

    if (matchErr) throw matchErr;

    if (!match) {
      return new Response(
        JSON.stringify({ verified: false, reason: "not_found", message: "ID not found in institution records" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (match.is_claimed) {
      return new Response(
        JSON.stringify({ verified: false, reason: "already_claimed", message: "This ID has already been claimed by another user" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ verified: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ verified: false, reason: "error", message: err.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
