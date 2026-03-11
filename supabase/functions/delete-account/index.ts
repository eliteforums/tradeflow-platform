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
    if (!authHeader) throw new Error("Missing authorization");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user from JWT
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: user.id,
      action_type: "account_deleted",
      target_table: "profiles",
      target_id: user.id,
      metadata: { reason: "user_requested", dpdp_compliance: true, deleted_at: new Date().toISOString() },
    });

    // 2. Hard-delete PII
    await adminClient.from("user_private").delete().eq("user_id", user.id);
    await adminClient.from("recovery_credentials").delete().eq("user_id", user.id);

    // 3. Hard-delete BlackBox entries
    await adminClient.from("blackbox_entries").delete().eq("user_id", user.id);

    // 4. Anonymize credit transactions (keep for accounting, strip identity)
    // We can't truly anonymize without breaking FK, so we soft-delete profile instead
    
    // 5. Soft-delete profile (deactivate + anonymize)
    await adminClient.from("profiles").update({
      is_active: false,
      username: `deleted_${user.id.slice(0, 8)}`,
      bio: null,
      avatar_url: null,
      specialty: null,
    }).eq("id", user.id);

    // 6. Remove role assignments
    await adminClient.from("user_roles").delete().eq("user_id", user.id);

    // 7. Delete auth user (hard delete from auth.users)
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteAuthError) {
      console.error("Failed to delete auth user:", deleteAuthError);
      // Don't throw — profile is already deactivated
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
