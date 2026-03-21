import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Find profiles where deletion was requested > 30 days ago
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: profiles, error: fetchErr } = await adminClient
      .from("profiles")
      .select("id")
      .not("deletion_requested_at", "is", null)
      .lt("deletion_requested_at", thirtyDaysAgo)
      .eq("is_active", true);

    if (fetchErr) throw fetchErr;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ deleted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let deleted = 0;
    for (const profile of profiles) {
      const userId = profile.id;

      // Audit log
      await adminClient.from("audit_logs").insert({
        actor_id: userId,
        action_type: "account_deleted_auto",
        target_table: "profiles",
        target_id: userId,
        metadata: { reason: "30_day_grace_period_expired", dpdp_compliance: true, deleted_at: new Date().toISOString() },
      });

      // Hard-delete PII
      await adminClient.from("user_private").delete().eq("user_id", userId);
      await adminClient.from("recovery_credentials").delete().eq("user_id", userId);
      await adminClient.from("blackbox_entries").delete().eq("user_id", userId);

      // Soft-delete profile
      await adminClient.from("profiles").update({
        is_active: false,
        username: `deleted_${userId.slice(0, 8)}`,
        bio: null,
        avatar_url: null,
        specialty: null,
        deletion_requested_at: null,
      }).eq("id", userId);

      // Remove roles
      await adminClient.from("user_roles").delete().eq("user_id", userId);

      // Delete auth user
      await adminClient.auth.admin.deleteUser(userId);
      deleted++;
    }

    return new Response(JSON.stringify({ deleted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
