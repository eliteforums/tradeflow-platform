import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller } } = await supabaseUser.auth.getUser();
    if (!caller) throw new Error("Unauthorized");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: hasAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });

    if (!hasAdmin) throw new Error("Only admins can add members");

    const { username, password, role, institution_id } = await req.json();

    if (!username || !password || !role) {
      throw new Error("username, password, and role are required");
    }

    const validRoles = ["intern", "expert", "spoc", "therapist"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    // SPOC requires institution_id; other roles are universal
    if (role === "spoc" && !institution_id) {
      throw new Error("SPOC role requires an institution");
    }
    const effectiveInstitutionId = role === "spoc" ? institution_id : null;

    const email = `${username.toLowerCase().replace(/\s+/g, "_")}@eternia.local`;

    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });

    if (createErr) {
      if (createErr.message.includes("already been registered")) {
        throw new Error("A user with this username already exists");
      }
      throw createErr;
    }

    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .update({
        role,
        ...(effectiveInstitutionId ? { institution_id: effectiveInstitutionId } : {}),
      })
      .eq("id", newUser.user.id);

    if (profileErr) console.error("Profile update error:", profileErr);

    const { error: roleErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: newUser.user.id,
      role,
    });
    if (roleErr && !roleErr.message.includes("duplicate")) {
      console.error("Role insert error:", roleErr);
    }

    await supabaseAdmin.from("audit_logs").insert({
      actor_id: caller.id,
      action_type: "member_created",
      target_table: "profiles",
      target_id: newUser.user.id,
      metadata: { username, role, institution_id: effectiveInstitutionId },
    });

    return new Response(
      JSON.stringify({ success: true, user_id: newUser.user.id, username }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
