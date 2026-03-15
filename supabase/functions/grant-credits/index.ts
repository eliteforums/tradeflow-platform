import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Authenticate caller
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) throw new Error("Not authenticated");

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Not authenticated");

    // Verify caller is admin or spoc
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    const { data: isSpoc } = await supabase.rpc("has_role", { _user_id: user.id, _role: "spoc" });
    if (!isAdmin && !isSpoc) throw new Error("Unauthorized: admin or SPOC role required");

    const { username, amount, notes, bulk, institution_id } = await req.json();

    // --- Bulk grant mode ---
    if (bulk && institution_id) {
      const credits = parseInt(amount);
      if (isNaN(credits) || credits <= 0) throw new Error("Invalid amount");

      const { data: students, error: studentsErr } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("institution_id", institution_id)
        .eq("role", "student")
        .eq("is_active", true);
      if (studentsErr) throw studentsErr;
      if (!students || students.length === 0) throw new Error("No active students found");

      const inserts = students.map((s: any) => ({
        user_id: s.id,
        delta: credits,
        type: "grant" as const,
        institution_id,
        notes: notes || "Institutional grant by SPOC",
      }));

      const { error: insertErr } = await supabase.from("credit_transactions").insert(inserts);
      if (insertErr) throw insertErr;

      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        action_type: "credit_grant_bulk",
        target_table: "credit_transactions",
        metadata: { amount: credits, student_count: students.length },
      });

      return new Response(JSON.stringify({ success: true, count: students.length, amount: credits }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Single user grant mode ---
    if (!username) throw new Error("Username is required");
    const credits = parseInt(amount);
    if (isNaN(credits) || credits <= 0) throw new Error("Invalid amount");

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, username")
      .ilike("username", username.trim())
      .maybeSingle();
    if (profileErr || !profile) throw new Error("User not found");

    const { data: isStudent } = await supabase.rpc("has_role", { _user_id: profile.id, _role: "student" });
    if (!isStudent) throw new Error("Credits can only be granted to students");

    const { error: creditErr } = await supabase.from("credit_transactions").insert({
      user_id: profile.id,
      delta: credits,
      type: "grant" as const,
      notes: notes || `Admin grant: ${credits} ECC`,
    });
    if (creditErr) throw creditErr;

    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action_type: "credit_grant_individual",
      target_table: "credit_transactions",
      target_id: profile.id,
      metadata: { username: profile.username, amount: credits, notes },
    });

    return new Response(JSON.stringify({ success: true, username: profile.username, amount: credits }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
