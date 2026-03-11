import { supabase } from "@/integrations/supabase/client";

interface SpendResult {
  success: boolean;
  source?: "balance" | "pool";
  remaining?: number;
  error?: string;
}

export async function spendCredits(amount: number, notes?: string, referenceId?: string): Promise<SpendResult> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase.functions.invoke("spend-credits", {
    body: { amount, notes, reference_id: referenceId },
  });

  if (error) throw new Error(error.message || "Credit spend failed");
  return data as SpendResult;
}
