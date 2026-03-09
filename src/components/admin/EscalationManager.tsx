import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertTriangle, CheckCircle, XCircle, Clock,
  Shield, Eye, Loader2, Plus, FileText,
} from "lucide-react";

const EscalationManager = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [showNewForm, setShowNewForm] = useState(false);
  const [justification, setJustification] = useState("");
  const isAdmin = profile?.role === "admin";

  const { data: escalations = [], isLoading } = useQuery({
    queryKey: ["escalation-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escalation_requests")
        .select("*, spoc:profiles!escalation_requests_spoc_id_fkey(username)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createEscalation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("escalation_requests").insert({
        spoc_id: user.id,
        justification_encrypted: justification,
      });
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        action_type: "escalation_request_created",
        target_table: "escalation_requests",
        metadata: { justification_length: justification.length },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-requests"] });
      toast.success("Escalation submitted");
      setJustification("");
      setShowNewForm(false);
    },
    onError: () => toast.error("Failed to submit"),
  });

  const updateEscalation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("escalation_requests")
        .update({
          status,
          admin_id: user.id,
          resolved_at: status === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        action_type: `escalation_${status}`,
        target_table: "escalation_requests",
        target_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-requests"] });
      toast.success("Escalation updated");
    },
  });

  const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
    pending: { icon: Clock, color: "text-amber-500 bg-amber-500/10", label: "Pending" },
    approved: { icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10", label: "Approved" },
    rejected: { icon: XCircle, color: "text-destructive bg-destructive/10", label: "Rejected" },
    resolved: { icon: Shield, color: "text-primary bg-primary/10", label: "Resolved" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          Escalations ({escalations.length})
        </h2>
        {!isAdmin && (
          <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="w-3.5 h-3.5" />
            New
          </Button>
        )}
      </div>

      {showNewForm && (
        <div className="p-3 rounded-xl bg-card border border-destructive/20 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-destructive" />
            <p className="font-medium text-sm">Escalation Request</p>
          </div>
          <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/10 text-xs text-muted-foreground">
            <p className="font-medium text-destructive mb-0.5">⚠️ Important</p>
            This initiates a formal identity reveal. All requests are audited.
          </div>
          <Textarea
            placeholder="Justification..."
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <div className="flex gap-2">
            <Button
              onClick={() => createEscalation.mutate()}
              disabled={!justification.trim() || createEscalation.isPending}
              className="gap-1.5 h-8 text-xs"
              variant="destructive"
              size="sm"
            >
              {createEscalation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Submit
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowNewForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : escalations.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50">
          <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No Escalations</p>
        </div>
      ) : (
        <div className="space-y-2">
          {escalations.map((esc: any) => {
            const config = statusConfig[esc.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div key={esc.id} className="p-3 rounded-xl bg-card border border-border/50">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1 ${config.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      by {esc.spoc?.username || "SPOC"}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {format(new Date(esc.created_at), "MMM d, h:mm a")}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-2.5 bg-muted/30 p-2.5 rounded-lg line-clamp-3">
                  {esc.justification_encrypted}
                </p>

                {isAdmin && esc.status === "pending" && (
                  <div className="flex items-center gap-1.5 pt-2 border-t border-border flex-wrap">
                    <Button size="sm" className="gap-1 h-7 text-[11px] px-2"
                      onClick={() => updateEscalation.mutate({ id: esc.id, status: "approved" })}>
                      <CheckCircle className="w-3 h-3" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 h-7 text-[11px] px-2 text-destructive"
                      onClick={() => updateEscalation.mutate({ id: esc.id, status: "rejected" })}>
                      <XCircle className="w-3 h-3" /> Reject
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1 h-7 text-[11px] px-2"
                      onClick={() => updateEscalation.mutate({ id: esc.id, status: "resolved" })}>
                      <Eye className="w-3 h-3" /> Resolve
                    </Button>
                  </div>
                )}

                {esc.resolved_at && (
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Resolved {format(new Date(esc.resolved_at), "MMM d, h:mm a")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EscalationManager;
