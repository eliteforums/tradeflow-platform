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
      <div className="space-y-3 pb-24">
        <div>
          <h1 className="text-lg font-bold font-display">Expert Dashboard</h1>
          <p className="text-[11px] text-muted-foreground">Schedule, sessions & notes</p>
        </div>

        <div className="p-2.5 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-eternia-warning shrink-0 mt-0.5" />
          <p className="text-[9px] text-muted-foreground"><span className="font-medium text-foreground">AI Risk Monitor Active</span></p>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "text-primary" },
            { label: "Done", value: completed.length, icon: CheckCircle, color: "text-eternia-success" },
            { label: "Slots", value: mySlots.length, icon: Clock, color: "text-eternia-warning" },
            { label: "Total", value: profile?.total_sessions || 0, icon: BarChart3, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="p-2 rounded-xl bg-card border border-border/50 text-center">
              <s.icon className={`w-3.5 h-3.5 ${s.color} mx-auto mb-0.5`} />
              <p className="text-sm font-bold leading-none">{s.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {(["schedule", "sessions", "notes"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "schedule" && (
          <div className="space-y-2">
            {upcoming.length === 0 ? <div className="text-center py-8 text-muted-foreground"><Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">No upcoming</p></div>
              : upcoming.map((apt: any) => (
                <div key={apt.id} className="p-2.5 rounded-xl bg-card border border-border/50">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                      {apt.session_type === "video" ? <Video className="w-4 h-4 text-white" /> : <Phone className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs truncate">{apt.student?.username}</p>
                      <p className="text-[9px] text-muted-foreground">{format(new Date(apt.slot_time), "EEE, MMM d · h:mm a")}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${apt.status === "confirmed" ? "bg-eternia-success/10 text-eternia-success" : "bg-eternia-warning/10 text-eternia-warning"}`}>{apt.status}</span>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 gap-0.5 h-6 text-[9px] px-1.5" onClick={() => toast.info("Escalation sent")}><AlertTriangle className="w-2.5 h-2.5" />Escalate</Button>
                        <Button size="sm" variant="outline" className="h-6 text-[9px] px-1.5" onClick={() => setSelectedAppointment(apt.id)}>Complete</Button>
                      </div>
                    </div>
                  </div>
                  {selectedAppointment === apt.id && (
                    <div className="mt-2 pt-2 border-t border-border space-y-2">
                      <Textarea placeholder="Session notes..." value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} className="min-h-[60px] bg-muted/30 text-xs" />
                      <div className="flex gap-1.5">
                        <Button size="sm" onClick={() => completeSession.mutate({ appointmentId: apt.id, notes: sessionNotes })} disabled={completeSession.isPending} className="gap-1 h-7 text-[10px]">
                          {completeSession.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}Done
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setSelectedAppointment(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-1.5">
            {completed.length === 0 ? <div className="text-center py-8 text-muted-foreground"><CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">No completed sessions</p></div>
              : completed.map((apt: any) => (
                <div key={apt.id} className="p-2.5 rounded-xl bg-card border border-border/50 flex items-center justify-between gap-2">
                  <div className="min-w-0"><p className="font-semibold text-xs truncate">{apt.student?.username}</p><p className="text-[9px] text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")}</p></div>
                  <span className="px-1.5 py-0.5 rounded-full text-[8px] bg-eternia-success/10 text-eternia-success shrink-0">Done</span>
                </div>
              ))}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-1.5">
            {completed.filter((a: any) => a.session_notes_encrypted).length === 0
              ? <div className="text-center py-8 text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">No notes</p></div>
              : completed.filter((a: any) => a.session_notes_encrypted).map((apt: any) => (
                <div key={apt.id} className="p-2.5 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-1"><p className="font-semibold text-xs truncate">{apt.student?.username}</p><p className="text-[9px] text-muted-foreground">{format(new Date(apt.slot_time), "MMM d")}</p></div>
                  <p className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded-lg">{apt.session_notes_encrypted}</p>
                </div>
              ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MobileExpertDashboard;
