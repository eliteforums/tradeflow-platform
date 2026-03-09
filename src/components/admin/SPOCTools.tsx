import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  QrCode,
  Coins,
  Users,
  Copy,
  Check,
  Loader2,
  BarChart3,
  TrendingUp,
  Activity,
  UserPlus,
} from "lucide-react";

const SPOCTools = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [creditAmount, setCreditAmount] = useState("50");
  const [copiedQR, setCopiedQR] = useState(false);

  // Generate SPOC QR code payload (HMAC-signed in production)
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

  // Anonymous aggregate analytics
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

      // Grant credits to all active students
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

      // Audit log
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

  return (
    <div className="space-y-6">
      {/* Anonymous Analytics */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Anonymous Institution Analytics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Students", value: analytics?.totalStudents || 0, icon: Users, color: "text-primary" },
            { label: "Active Students", value: analytics?.activeStudents || 0, icon: Activity, color: "text-eternia-success" },
            { label: "Total Sessions", value: analytics?.totalSessions || 0, icon: TrendingUp, color: "text-eternia-warning" },
            { label: "AI Flags (≥2)", value: analytics?.flaggedCount || 0, icon: Activity, color: "text-destructive" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-1.5`} />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2 italic">
          All data is aggregated and anonymous. No individual student identities are exposed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* QR Code for Student Onboarding */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              SPOC Verification Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this verification code with students during onboarding. Students scan or enter
              this code in Step 2 of registration.
            </p>
            <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
              <div className="w-32 h-32 mx-auto bg-card rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center mb-3">
                <QrCode className="w-16 h-16 text-primary/60" />
              </div>
              <code className="text-xs font-mono text-muted-foreground break-all block mb-3">
                {qrPayload.slice(0, 40)}...
              </code>
              <Button size="sm" variant="outline" className="gap-2" onClick={copyQRCode}>
                {copiedQR ? <Check className="w-4 h-4 text-eternia-success" /> : <Copy className="w-4 h-4" />}
                Copy Verification Code
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Code regenerates automatically. Valid for 24 hours.
            </p>
          </CardContent>
        </Card>

        {/* Bulk Credit Allocation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              Bulk Credit Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Grant ECC credits to all active students in your institution.
              Currently {institutionStudents.filter((s) => s.is_active).length} active students.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Credits per student
              </label>
              <Input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                min="1"
                max="500"
                className="h-10"
              />
            </div>
            <div className="p-3 rounded-lg bg-muted/30 text-sm">
              <p className="text-muted-foreground">
                Total credits to distribute:{" "}
                <span className="font-semibold text-foreground">
                  {(parseInt(creditAmount) || 0) * institutionStudents.filter((s) => s.is_active).length} ECC
                </span>
              </p>
            </div>
            <Button
              className="w-full gap-2"
              onClick={() => bulkGrantCredits.mutate()}
              disabled={bulkGrantCredits.isPending || !creditAmount}
            >
              {bulkGrantCredits.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Allocate Credits to All Students
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SPOCTools;
