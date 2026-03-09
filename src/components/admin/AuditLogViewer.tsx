import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
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
    escalation_approved: "bg-eternia-success/10 text-eternia-success",
    escalation_rejected: "bg-eternia-warning/10 text-eternia-warning",
    escalation_resolved: "bg-primary/10 text-primary",
    account_deleted: "bg-destructive/10 text-destructive",
    credit_grant: "bg-eternia-success/10 text-eternia-success",
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Audit Logs ({logs.length})
      </h2>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No Audit Logs</p>
            <p className="text-sm">System actions will be logged here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log: any) => (
            <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider shrink-0 ${actionColors[log.action_type] || "bg-muted text-muted-foreground"}`}>
                {log.action_type.replace(/_/g, " ")}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium">{log.actor?.username || "System"}</span>
                {log.target_table && (
                  <span className="text-xs text-muted-foreground ml-2">→ {log.target_table}</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {format(new Date(log.created_at), "MMM d, h:mm a")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;
