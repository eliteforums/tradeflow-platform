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

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify caller is admin
    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) throw new Error("Admin access required");

    const { target_user_id } = await req.json();
    if (!target_user_id || typeof target_user_id !== "string") throw new Error("target_user_id required");

    // Prevent self-deletion
    if (target_user_id === user.id) throw new Error("Cannot delete your own account from admin panel");

    // 1. Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: user.id,
      action_type: "admin_deleted_member",
      target_table: "profiles",
      target_id: target_user_id,
      metadata: { deleted_by: user.id, deleted_at: new Date().toISOString() },
    });

    // 2. Delete PII
    await adminClient.from("user_private").delete().eq("user_id", target_user_id);
    await adminClient.from("recovery_credentials").delete().eq("user_id", target_user_id);

    // 3. Delete BlackBox entries
    await adminClient.from("blackbox_entries").delete().eq("user_id", target_user_id);

    // 4. Soft-delete profile
    await adminClient.from("profiles").update({
      is_active: false,
      username: `deleted_${target_user_id.slice(0, 8)}`,
      bio: null,
      avatar_url: null,
      specialty: null,
    }).eq("id", target_user_id);

    // 5. Remove role assignments
    await adminClient.from("user_roles").delete().eq("user_id", target_user_id);

    // 6. Recycle temp credential (return ID to pool)
    await adminClient
      .from("temp_credentials")
      .update({ status: "unused", auth_user_id: null, activated_at: null, assigned_at: null })
      .eq("auth_user_id", target_user_id);

    // 7. Delete auth user
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(target_user_id);
    if (deleteAuthError) {
      console.error("Failed to delete auth user:", deleteAuthError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin delete member error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
