import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("Not authenticated");

    // Verify SPOC role
    const { data: spocProfile } = await supabase
      .from("profiles")
      .select("role, institution_id")
      .eq("id", user.id)
      .single();

    if (!spocProfile || spocProfile.role !== "spoc") {
      throw new Error("Unauthorized: SPOC role required");
    }

    const { student_id } = await req.json();
    if (!student_id) throw new Error("Missing student_id");

    // Verify student belongs to same institution
    const { data: studentProfile } = await supabase
      .from("profiles")
      .select("institution_id")
      .eq("id", student_id)
      .single();

    if (!studentProfile || studentProfile.institution_id !== spocProfile.institution_id) {
      throw new Error("Student not in your institution");
    }

    // Clear device fingerprint
    const { error } = await supabase
      .from("user_private")
      .update({ device_id_encrypted: null, updated_at: new Date().toISOString() })
      .eq("user_id", student_id);

    if (error) throw error;

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action_type: "device_reset",
      target_table: "user_private",
      target_id: student_id,
      metadata: { reason: "SPOC-initiated device reset" },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
