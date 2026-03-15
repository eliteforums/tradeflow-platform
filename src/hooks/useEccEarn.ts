import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const DAILY_CAP = 5;

export function useEccEarn() {
  const { user, refreshCredits } = useAuth();
  const queryClient = useQueryClient();

  const { data: dailyEarned = 0 } = useQuery({
    queryKey: ["daily-earn", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase.rpc("get_daily_earn_total", {
        _user_id: user.id,
      });
      if (error) throw error;
      return data || 0;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 60000,
  });

  const canEarn = dailyEarned < DAILY_CAP;
  const remainingToday = Math.max(0, DAILY_CAP - dailyEarned);

  const earnFromActivity = useMutation({
    mutationFn: async ({ amount, activity }: { amount: number; activity: string }) => {
      if (!user) throw new Error("Not authenticated");
      
      const actualAmount = Math.min(amount, remainingToday);
      if (actualAmount <= 0) {
        throw new Error("Daily earn cap reached (5 ECC/day)");
      }

      const { error } = await supabase.from("credit_transactions").insert({
        user_id: user.id,
        delta: actualAmount,
        type: "earn" as const,
        notes: activity,
      });

      if (error) throw error;
      return actualAmount;
    },
    onSuccess: (earned) => {
      queryClient.invalidateQueries({ queryKey: ["daily-earn"] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
      refreshCredits();
      toast.success(`+${earned} ECC earned!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    dailyEarned,
    dailyCap: DAILY_CAP,
    canEarn,
    remainingToday,
    earnFromActivity: earnFromActivity.mutate,
    isEarning: earnFromActivity.isPending,
  };
}
