import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Coins, Loader2, Search } from "lucide-react";

export default function CreditGrantTool() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("50");
  const [notes, setNotes] = useState("");

  const grantMutation = useMutation({
    mutationFn: async () => {
      const credits = parseInt(amount);
      if (isNaN(credits) || credits <= 0) throw new Error("Invalid credit amount");

      // Find user by username
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", username.trim())
        .single();

      if (profileErr || !profile) throw new Error("User not found. Check the username.");

      // Insert credit transaction
      const { error: creditErr } = await supabase.from("credit_transactions").insert({
        user_id: profile.id,
        delta: credits,
        type: "grant" as const,
        notes: notes || `Admin grant: ${credits} ECC`,
      });
      if (creditErr) throw creditErr;

      // Audit log
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          actor_id: user.id,
          action_type: "credit_grant_individual",
          target_table: "credit_transactions",
          target_id: profile.id,
          metadata: { username: profile.username, amount: credits, notes },
        });
      }

      return { username: profile.username, credits };
    },
    onSuccess: (data) => {
      toast.success(`Granted ${data.credits} ECC to ${data.username}`);
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      setUsername("");
      setAmount("50");
      setNotes("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          Grant Credits to User
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Grant ECC credits to an individual user by username.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Username *</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Credits *</label>
            <Input
              type="number"
              placeholder="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max="1000"
              className="h-10"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Note (optional)</label>
            <Input
              placeholder="Reason for grant"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-10"
            />
          </div>
        </div>

        <Button
          onClick={() => grantMutation.mutate()}
          disabled={!username.trim() || !amount || grantMutation.isPending}
          className="gap-2"
        >
          {grantMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Coins className="w-4 h-4" />
          )}
          Grant Credits
        </Button>
      </CardContent>
    </Card>
  );
}
