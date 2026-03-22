import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiter
const rateStore = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, max = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const e = rateStore.get(key);
  if (!e || now > e.resetAt) { rateStore.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  e.count++;
  return e.count <= max;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!rateLimit(`reset-device:${ip}`, 10)) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) throw new Error("Not authenticated");
    const callerId = claims.claims.sub as string;

    // Verify SPOC or admin role
    const { data: isSpoc } = await supabase.rpc("has_role", { _user_id: callerId, _role: "spoc" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: callerId, _role: "admin" });
    if (!isSpoc && !isAdmin) throw new Error("Unauthorized: SPOC or admin role required");

    const body = await req.json();
    const student_id = typeof body?.student_id === "string" && /^[0-9a-f-]{36}$/i.test(body.student_id) ? body.student_id : null;
    if (!student_id) throw new Error("Invalid student_id");

    // If SPOC, verify student belongs to same institution
    if (isSpoc && !isAdmin) {
      const { data: spocProfile } = await supabase
        .from("profiles")
        .select("institution_id")
        .eq("id", callerId)
        .single();

      const { data: studentProfile } = await supabase
        .from("profiles")
        .select("institution_id")
        .eq("id", student_id)
        .single();

      if (!spocProfile || !studentProfile || studentProfile.institution_id !== spocProfile.institution_id) {
        throw new Error("Student not in your institution");
      }
    }

    // Clear device fingerprint
    const { error } = await supabase
      .from("user_private")
      .update({ device_id_encrypted: null, updated_at: new Date().toISOString() })
      .eq("user_id", student_id);

    if (error) throw error;

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: callerId,
      action_type: "device_reset",
      target_table: "user_private",
      target_id: student_id,
      metadata: { reason: "SPOC/Admin-initiated device reset" },
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
