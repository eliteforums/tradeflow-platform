import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    // Validate calling user
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch user's profile
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("username, student_id, institution_id")
      .eq("id", user.id)
      .single();
    if (profileError || !profile) throw new Error("Profile not found");

    // Fetch institution name if linked
    let institutionName = "Independent";
    if (profile.institution_id) {
      const { data: inst } = await adminClient
        .from("institutions")
        .select("name")
        .eq("id", profile.institution_id)
        .single();
      if (inst) institutionName = inst.name;
    }

    // Find all admin user_ids via user_roles (service role bypasses RLS)
    const { data: adminRoles } = await adminClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      throw new Error("No administrators found in the system");
    }

    const requestedAt = new Date().toISOString();

    // Insert notifications to all admins
    const notifications = adminRoles.map((ar) => ({
      user_id: ar.user_id,
      type: "deletion_request",
      title: "Account Deletion Request",
      message: `User "${profile.username}" (${profile.student_id || "No Eternia ID"}) from ${institutionName} has requested account deletion under DPDP Act 2023.`,
      metadata: {
        requesting_user_id: user.id,
        requesting_username: profile.username,
        student_id: profile.student_id,
        institution_id: profile.institution_id,
        institution_name: institutionName,
        requested_at: requestedAt,
      },
    }));

    const { error: notifError } = await adminClient.from("notifications").insert(notifications);
    if (notifError) throw new Error("Failed to send notifications: " + notifError.message);

    // Set deletion_requested_at on profile
    await adminClient
      .from("profiles")
      .update({ deletion_requested_at: requestedAt })
      .eq("id", user.id);

    // Audit log
    await adminClient.from("audit_logs").insert({
      actor_id: user.id,
      action_type: "account_deletion_requested",
      target_table: "profiles",
      target_id: user.id,
      metadata: {
        username: profile.username,
        student_id: profile.student_id,
        institution_id: profile.institution_id,
        institution_name: institutionName,
        requested_at: requestedAt,
      },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Request account deletion error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
