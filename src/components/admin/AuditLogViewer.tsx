import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { FileText, Loader2, Shield } from "lucide-react";

const AuditLogViewer = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*, actor:profiles!audit_logs_actor_id_fkey(username)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const actionColors: Record<string, string> = {
    escalation_request_created: "bg-destructive/10 text-destructive",
    escalation_approved: "bg-emerald-500/10 text-emerald-500",
    escalation_rejected: "bg-amber-500/10 text-amber-500",
    escalation_resolved: "bg-primary/10 text-primary",
    account_deleted: "bg-destructive/10 text-destructive",
    credit_grant: "bg-emerald-500/10 text-emerald-500",
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        Audit Logs ({logs.length})
      </h2>

      {logs.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50">
          <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No Logs</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {logs.map((log: any) => (
            <div key={log.id} className="p-2.5 rounded-lg bg-card border border-border/50">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider shrink-0 ${actionColors[log.action_type] || "bg-muted text-muted-foreground"}`}>
                  {log.action_type.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {format(new Date(log.created_at), "MMM d, h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium">{log.actor?.username || "System"}</span>
                {log.target_table && <span className="text-muted-foreground">→ {log.target_table}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
