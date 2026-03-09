import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  QrCode, Coins, Users, Copy, Check, Loader2,
  BarChart3, TrendingUp, Activity, UserPlus,
} from "lucide-react";

const SPOCTools = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [creditAmount, setCreditAmount] = useState("50");
  const [copiedQR, setCopiedQR] = useState(false);

  const qrPayload = profile
    ? `ETERNIA-SPOC-${profile.institution_id}-${user?.id}-${Date.now()}`
    : "";

  const { data: institutionStudents = [] } = useQuery({
    queryKey: ["institution-students", profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, is_active")
        .eq("institution_id", profile.institution_id)
        .eq("role", "student");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.institution_id,
  });

  const { data: analytics } = useQuery({
    queryKey: ["spoc-analytics", profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return null;
      const { count: totalStudents } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("institution_id", profile.institution_id)
        .eq("role", "student");
      const { count: activeStudents } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("institution_id", profile.institution_id)
        .eq("role", "student")
        .eq("is_active", true);
      const { count: totalSessions } = await supabase
        .from("peer_sessions")
        .select("*", { count: "exact", head: true });
      const { count: flaggedCount } = await supabase
        .from("blackbox_entries")
        .select("*", { count: "exact", head: true })
        .gt("ai_flag_level", 1);
      return {
        totalStudents: totalStudents || 0,
        activeStudents: activeStudents || 0,
        totalSessions: totalSessions || 0,
        flaggedCount: flaggedCount || 0,
      };
    },
    enabled: !!profile?.institution_id,
  });

  const bulkGrantCredits = useMutation({
    mutationFn: async () => {
      if (!user || !profile?.institution_id) throw new Error("Not authorized");
      const amount = parseInt(creditAmount);
      if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");
      const inserts = institutionStudents
        .filter((s) => s.is_active)
        .map((student) => ({
          user_id: student.id,
          delta: amount,
          type: "grant" as const,
          institution_id: profile.institution_id,
          notes: `Institutional grant by SPOC`,
        }));
      if (inserts.length === 0) throw new Error("No active students found");
      const { error } = await supabase.from("credit_transactions").insert(inserts);
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        action_type: "credit_grant",
        target_table: "credit_transactions",
        metadata: { amount, student_count: inserts.length },
      });
      return inserts.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(`Granted ${creditAmount} ECC to ${count} students`);
    },
    onError: (err: any) => toast.error(err.message || "Failed to grant credits"),
  });

  const copyQRCode = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopiedQR(true);
    toast.success("SPOC QR payload copied!");
    setTimeout(() => setCopiedQR(false), 2000);
  };

  const activeCount = institutionStudents.filter((s) => s.is_active).length;

  return (
    <div className="space-y-4">
      {/* Analytics */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Institution Analytics
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Students", value: analytics?.totalStudents || 0, icon: Users, color: "text-primary" },
            { label: "Active", value: analytics?.activeStudents || 0, icon: Activity, color: "text-emerald-500" },
            { label: "Sessions", value: analytics?.totalSessions || 0, icon: TrendingUp, color: "text-amber-500" },
            { label: "AI Flags", value: analytics?.flaggedCount || 0, icon: Activity, color: "text-destructive" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-card border border-border/50">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color} mb-1`} />
              <p className="text-lg font-bold leading-none">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 italic">
          All data is aggregated and anonymous.
        </p>
      </div>

      {/* QR Code */}
      <div className="p-3 rounded-xl bg-card border border-border/50 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <QrCode className="w-4 h-4 text-primary" />
          SPOC Verification Code
        </h3>
        <p className="text-xs text-muted-foreground">
          Share this code with students during onboarding.
        </p>
        <div className="p-3 rounded-xl bg-muted/30 border border-border text-center">
          <div className="w-24 h-24 mx-auto bg-card rounded-xl border-2 border-dashed border-primary/30 flex items-center justify-center mb-2">
            <QrCode className="w-12 h-12 text-primary/60" />
          </div>
          <code className="text-[10px] font-mono text-muted-foreground break-all block mb-2">
            {qrPayload.slice(0, 36)}...
          </code>
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={copyQRCode}>
            {copiedQR ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            Copy Code
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">Valid for 24 hours.</p>
      </div>

      {/* Bulk Credit Allocation */}
      <div className="p-3 rounded-xl bg-card border border-border/50 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Coins className="w-4 h-4 text-primary" />
          Bulk Credit Allocation
        </h3>
        <p className="text-xs text-muted-foreground">
          Grant ECC credits to all {activeCount} active students.
        </p>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Credits per student</label>
          <Input
            type="number"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value)}
            min="1"
            max="500"
            className="h-9"
          />
        </div>
        <div className="p-2.5 rounded-lg bg-muted/30 text-xs">
          <p className="text-muted-foreground">
            Total: <span className="font-semibold text-foreground">
              {(parseInt(creditAmount) || 0) * activeCount} ECC
            </span>
          </p>
        </div>
        <Button
          className="w-full gap-2 h-9 text-xs"
          onClick={() => bulkGrantCredits.mutate()}
          disabled={bulkGrantCredits.isPending || !creditAmount}
        >
          {bulkGrantCredits.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
          Allocate Credits
        </Button>
      </div>
    </div>
  );
};

export default SPOCTools;
