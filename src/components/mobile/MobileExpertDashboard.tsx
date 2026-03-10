import { useState } from "react";
import { Calendar, Clock, Users, FileText, CheckCircle, AlertTriangle, Video, Phone, Loader2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

const MobileExpertDashboard = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"schedule" | "sessions" | "notes">("schedule");
  const [sessionNotes, setSessionNotes] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const { data: myAppointments = [], isLoading } = useQuery({
    queryKey: ["expert-appointments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("appointments").select("*, student:profiles!appointments_student_id_fkey(username)").eq("expert_id", user.id).order("slot_time", { ascending: true });
      if (error) throw error; return data;
    }, enabled: !!user,
  });

  const { data: mySlots = [] } = useQuery({
    queryKey: ["expert-slots", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("expert_availability").select("*").eq("expert_id", user.id).order("start_time", { ascending: true });
      if (error) throw error; return data;
    }, enabled: !!user,
  });

  const completeSession = useMutation({
    mutationFn: async ({ appointmentId, notes }: { appointmentId: string; notes: string }) => {
      const { error } = await supabase.from("appointments").update({ status: "completed" as const, completed_at: new Date().toISOString(), session_notes_encrypted: notes }).eq("id", appointmentId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["expert-appointments"] }); toast.success("Session completed"); setSessionNotes(""); setSelectedAppointment(null); },
  });

  const upcoming = myAppointments.filter((a) => a.status === "pending" || a.status === "confirmed");
  const completed = myAppointments.filter((a) => a.status === "completed");

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <div>
          <h1 className="text-xl font-bold font-display">Expert Dashboard</h1>
          <p className="text-sm text-muted-foreground">Schedule, sessions & notes</p>
        </div>

        <div className="p-4 rounded-2xl bg-eternia-warning/10 border border-eternia-warning/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-eternia-warning shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">AI Risk Monitor Active</span></p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "text-primary" },
            { label: "Done", value: completed.length, icon: CheckCircle, color: "text-eternia-success" },
            { label: "Slots", value: mySlots.length, icon: Clock, color: "text-eternia-warning" },
            { label: "Total", value: profile?.total_sessions || 0, icon: BarChart3, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-2xl bg-card border border-border/50 text-center">
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <p className="text-base font-bold leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {(["schedule", "sessions", "notes"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "schedule" && (
          <div className="space-y-3">
            {upcoming.length === 0 ? <div className="text-center py-10 text-muted-foreground"><Calendar className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">No upcoming</p></div>
              : upcoming.map((apt: any) => (
                <div key={apt.id} className="p-4 rounded-2xl bg-card border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                      {apt.session_type === "video" ? <Video className="w-5 h-5 text-white" /> : <Phone className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{apt.student?.username}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(apt.slot_time), "EEE, MMM d · h:mm a")}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${apt.status === "confirmed" ? "bg-eternia-success/10 text-eternia-success" : "bg-eternia-warning/10 text-eternia-warning"}`}>{apt.status}</span>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 gap-1 h-8 text-xs px-2" onClick={() => toast.info("Escalation sent")}><AlertTriangle className="w-3 h-3" />Escalate</Button>
                        <Button size="sm" variant="outline" className="h-8 text-xs px-2" onClick={() => setSelectedAppointment(apt.id)}>Complete</Button>
                      </div>
                    </div>
                  </div>
                  {selectedAppointment === apt.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      <Textarea placeholder="Session notes..." value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} className="min-h-[80px] bg-muted/30 text-sm" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => completeSession.mutate({ appointmentId: apt.id, notes: sessionNotes })} disabled={completeSession.isPending} className="gap-1.5 h-9 text-xs">
                          {completeSession.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}Done
                        </Button>
                        <Button size="sm" variant="ghost" className="h-9 text-xs" onClick={() => setSelectedAppointment(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-2">
            {completed.length === 0 ? <div className="text-center py-10 text-muted-foreground"><CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">No completed sessions</p></div>
              : completed.map((apt: any) => (
                <div key={apt.id} className="p-4 rounded-2xl bg-card border border-border/50 flex items-center justify-between gap-3">
                  <div className="min-w-0"><p className="font-semibold text-sm truncate">{apt.student?.username}</p><p className="text-xs text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")}</p></div>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-eternia-success/10 text-eternia-success shrink-0">Done</span>
                </div>
              ))}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-2">
            {completed.filter((a: any) => a.session_notes_encrypted).length === 0
              ? <div className="text-center py-10 text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">No notes</p></div>
              : completed.filter((a: any) => a.session_notes_encrypted).map((apt: any) => (
                <div key={apt.id} className="p-4 rounded-2xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-2"><p className="font-semibold text-sm truncate">{apt.student?.username}</p><p className="text-xs text-muted-foreground">{format(new Date(apt.slot_time), "MMM d")}</p></div>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">{apt.session_notes_encrypted}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MobileExpertDashboard;
