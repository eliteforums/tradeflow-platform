import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hmacSign(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

    // Verify user is SPOC
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, institution_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "spoc") throw new Error("Unauthorized: SPOC role required");
    if (!profile.institution_id) throw new Error("No institution linked");

    const timestamp = Date.now();
    const ttl = 24 * 60 * 60 * 1000; // 24 hours
    const expiresAt = timestamp + ttl;

    const payload = {
      institution_id: profile.institution_id,
      spoc_id: user.id,
      timestamp,
      expires_at: expiresAt,
    };

    const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const message = `${payload.institution_id}|${payload.spoc_id}|${payload.timestamp}|${payload.expires_at}`;
    const signature = await hmacSign(secret, message);

    const qrPayload = JSON.stringify({ ...payload, signature });

    // Audit log
    await supabase.from("audit_logs").insert({
      actor_id: user.id,
      action_type: "spoc_qr_generated",
      target_table: "institutions",
      target_id: profile.institution_id,
      metadata: { expires_at: new Date(expiresAt).toISOString() },
    });

    return new Response(JSON.stringify({ qr_payload: qrPayload, expires_at: expiresAt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
