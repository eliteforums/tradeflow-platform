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

    const { amount, notes, reference_id } = await req.json();
    if (!amount || amount <= 0) throw new Error("Invalid amount");

    // Get current balance atomically via DB function
    const { data: balance } = await supabase.rpc("get_credit_balance", { _user_id: user.id });
    const currentBalance = balance || 0;

    if (currentBalance >= amount) {
      // Normal deduction
      const { error } = await supabase.from("credit_transactions").insert({
        user_id: user.id,
        delta: -amount,
        type: "spend",
        notes: notes || "Service usage",
        reference_id: reference_id || null,
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
      .eq("id", user.id)
      .single();

    if (profile?.institution_id) {
      const { data: poolBalance } = await supabase.rpc("get_pool_balance", {
        _institution_id: profile.institution_id,
      });

      if (poolBalance && poolBalance >= amount) {
        // Debit from pool
        await supabase
          .from("ecc_stability_pool")
          .update({
            balance: poolBalance - amount,
            total_disbursed: poolBalance, // Will be incremented properly
          })
          .eq("institution_id", profile.institution_id);

        // Record as grant from pool
        const { error } = await supabase.from("credit_transactions").insert({
          user_id: user.id,
          delta: -amount,
          type: "spend",
          notes: `${notes || "Service usage"} (from stability pool)`,
          reference_id: reference_id || null,
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
