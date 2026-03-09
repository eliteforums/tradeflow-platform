import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Eye,
  Loader2,
  Plus,
  FileText,
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

      // Log to audit
      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        action_type: "escalation_request_created",
        target_table: "escalation_requests",
        metadata: { justification_length: justification.length },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escalation-requests"] });
      toast.success("Escalation request submitted");
      setJustification("");
      setShowNewForm(false);
    },
    onError: () => toast.error("Failed to submit escalation request"),
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
    pending: { icon: Clock, color: "text-eternia-warning bg-eternia-warning/10", label: "Pending Review" },
    approved: { icon: CheckCircle, color: "text-eternia-success bg-eternia-success/10", label: "Approved" },
    rejected: { icon: XCircle, color: "text-destructive bg-destructive/10", label: "Rejected" },
    resolved: { icon: Shield, color: "text-primary bg-primary/10", label: "Resolved" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          Escalation Requests ({escalations.length})
        </h2>
        {!isAdmin && (
          <Button size="sm" className="gap-2" onClick={() => setShowNewForm(!showNewForm)}>
            <Plus className="w-4 h-4" />
            New Request
          </Button>
        )}
      </div>

      {showNewForm && (
        <Card className="border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Formal Escalation Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-sm text-muted-foreground">
              <p className="font-medium text-destructive mb-1">⚠️ Important</p>
              This will initiate a formal identity reveal request. Provide detailed justification
              for why this escalation is necessary. All requests are logged and audited.
            </div>
            <Textarea
              placeholder="Provide detailed justification for this escalation request..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => createEscalation.mutate()}
                disabled={!justification.trim() || createEscalation.isPending}
                className="gap-2"
                variant="destructive"
              >
                {createEscalation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit Escalation
              </Button>
              <Button variant="ghost" onClick={() => setShowNewForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : escalations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No Escalation Requests</p>
            <p className="text-sm">No formal escalation requests have been submitted.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {escalations.map((esc: any) => {
            const config = statusConfig[esc.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <Card key={esc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${config.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        by {esc.spoc?.username || "SPOC"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(esc.created_at), "MMM d, h:mm a")}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 bg-muted/30 p-3 rounded-lg">
                    {esc.justification_encrypted}
                  </p>

                  {isAdmin && esc.status === "pending" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => updateEscalation.mutate({ id: esc.id, status: "approved" })}
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-destructive"
                        onClick={() => updateEscalation.mutate({ id: esc.id, status: "rejected" })}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1"
                        onClick={() => updateEscalation.mutate({ id: esc.id, status: "resolved" })}
                      >
                        <Eye className="w-4 h-4" />
                        Review & Resolve
                      </Button>
                    </div>
                  )}

                  {esc.resolved_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Resolved {format(new Date(esc.resolved_at), "MMM d, h:mm a")}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EscalationManager;
