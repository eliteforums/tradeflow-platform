import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiter
const rateStore = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, max = 20, windowMs = 60000): boolean {
  const now = Date.now();
  const e = rateStore.get(key);
  if (!e || now > e.resetAt) { rateStore.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  e.count++;
  return e.count <= max;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!rateLimit(`spend:${ip}`, 20)) {
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
    const userId = claims.claims.sub as string;

    const body = await req.json();
    const amount = parseInt(body?.amount);
    if (isNaN(amount) || amount <= 0 || amount > 500) throw new Error("Invalid amount (1-500)");

    const notes = typeof body?.notes === "string" ? body.notes.trim().slice(0, 200) : "Service usage";
    const reference_id = typeof body?.reference_id === "string" && /^[0-9a-f-]{36}$/i.test(body.reference_id)
      ? body.reference_id : null;

    // Get current balance atomically via DB function
    const { data: balance } = await supabase.rpc("get_credit_balance", { _user_id: userId });
    const currentBalance = balance || 0;

    if (currentBalance >= amount) {
      const { error } = await supabase.from("credit_transactions").insert({
        user_id: userId,
        delta: -amount,
        type: "spend",
        notes,
        reference_id,
      });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, source: "balance", remaining: currentBalance - amount }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check ECC Stability Pool fallback
    const { data: profile } = await supabase
      .from("profiles")
      .select("institution_id")
      .eq("id", userId)
      .single();

    if (profile?.institution_id) {
      const { data: poolBalance } = await supabase.rpc("get_pool_balance", {
        _institution_id: profile.institution_id,
      });

      if (poolBalance && poolBalance >= amount) {
        await supabase
          .from("ecc_stability_pool")
          .update({
            balance: poolBalance - amount,
            total_disbursed: poolBalance,
          })
          .eq("institution_id", profile.institution_id);

        const { error } = await supabase.from("credit_transactions").insert({
          user_id: userId,
          delta: -amount,
          type: "spend",
          notes: `${notes} (from stability pool)`,
          reference_id,
          institution_id: profile.institution_id,
        });
        if (error) throw error;

        return new Response(JSON.stringify({ success: true, source: "pool", remaining: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ success: false, error: "Insufficient credits" }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
