import { useIsMobile } from "@/hooks/use-mobile";
import MobileExpertDashboard from "@/components/mobile/MobileExpertDashboard";

import { useState } from "react";
import { Calendar, Clock, FileText, CheckCircle, AlertTriangle, Video, Phone, Loader2, BarChart3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VideoCallModal from "@/components/videosdk/VideoCallModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ExpertDashboard = () => {
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"schedule" | "slots" | "sessions" | "notes">("schedule");
  const [sessionNotes, setSessionNotes] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [callModal, setCallModal] = useState<{ open: boolean; mode: "video" | "audio" }>({ open: false, mode: "video" });

  // Slot creation
  const [slotDate, setSlotDate] = useState<Date>();
  const [slotStartTime, setSlotStartTime] = useState("09:00");
  const [slotEndTime, setSlotEndTime] = useState("10:00");

  const { data: myAppointments = [], isLoading } = useQuery({
    queryKey: ["expert-appointments", user?.id],
    queryFn: async () => { if (!user) return []; const { data, error } = await supabase.from("appointments").select("*, student:profiles!appointments_student_id_fkey(username)").eq("expert_id", user.id).order("slot_time", { ascending: true }); if (error) throw error; return data; },
    enabled: !!user,
  });

  const { data: mySlots = [] } = useQuery({
    queryKey: ["expert-slots", user?.id],
    queryFn: async () => { if (!user) return []; const { data, error } = await supabase.from("expert_availability").select("*").eq("expert_id", user.id).order("start_time", { ascending: true }); if (error) throw error; return data; },
    enabled: !!user,
  });

  const createSlot = useMutation({
    mutationFn: async () => {
      if (!user || !slotDate) throw new Error("Select a date");
      const startDateTime = new Date(slotDate);
      const [sh, sm] = slotStartTime.split(":").map(Number);
      startDateTime.setHours(sh, sm, 0, 0);
      const endDateTime = new Date(slotDate);
      const [eh, em] = slotEndTime.split(":").map(Number);
      endDateTime.setHours(eh, em, 0, 0);
      if (endDateTime <= startDateTime) throw new Error("End time must be after start time");
      const { error } = await supabase.from("expert_availability").insert({ expert_id: user.id, start_time: startDateTime.toISOString(), end_time: endDateTime.toISOString() });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["expert-slots"] }); toast.success("Slot created"); setSlotDate(undefined); },
    onError: (e) => toast.error(e.message),
  });

  const deleteSlot = useMutation({
    mutationFn: async (slotId: string) => { const { error } = await supabase.from("expert_availability").delete().eq("id", slotId); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["expert-slots"] }); toast.success("Slot removed"); },
  });

  const completeSession = useMutation({
    mutationFn: async ({ appointmentId, notes }: { appointmentId: string; notes: string }) => { const { error } = await supabase.from("appointments").update({ status: "completed" as const, completed_at: new Date().toISOString(), session_notes_encrypted: notes }).eq("id", appointmentId); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["expert-appointments"] }); toast.success("Session marked as complete"); setSessionNotes(""); setSelectedAppointment(null); },
  });

  const upcoming = myAppointments.filter((a) => a.status === "pending" || a.status === "confirmed");
  const completed = myAppointments.filter((a) => a.status === "completed");
  const futureSlots = mySlots.filter((s) => new Date(s.start_time) > new Date());

  if (isMobile) return <MobileExpertDashboard />;

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div><h1 className="text-3xl font-bold font-display">Expert Dashboard</h1><p className="text-sm text-muted-foreground">Manage your schedule, sessions, and notes</p></div>

        <div className="p-3 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-eternia-warning shrink-0 mt-0.5" /><p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">AI Risk Monitor Active</span> — Sessions monitored for crisis indicators.</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[{ label: "Upcoming", value: upcoming.length, icon: Calendar, color: "text-primary" }, { label: "Completed", value: completed.length, icon: CheckCircle, color: "text-eternia-success" }, { label: "Slots", value: futureSlots.length, icon: Clock, color: "text-eternia-warning" }, { label: "Total", value: profile?.total_sessions || 0, icon: BarChart3, color: "text-primary" }].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-card border border-border/50 text-center"><stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} /><p className="text-xl font-bold leading-none">{stat.value}</p><p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p></div>
          ))}
        </div>

        <div className="flex gap-1.5">
          {(["schedule", "slots", "sessions", "notes"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
          ))}
        </div>

        {activeTab === "schedule" && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold font-display">Upcoming Appointments</h2>
            {upcoming.length === 0 ? <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50"><Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No upcoming appointments</p></div>
              : upcoming.map((apt: any) => (
                <div key={apt.id} className="p-4 rounded-xl bg-card border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">{apt.session_type === "video" ? <Video className="w-5 h-5 text-white" /> : <Phone className="w-5 h-5 text-white" />}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{apt.student?.username}</p>
                      <p className="text-[11px] text-muted-foreground">{format(new Date(apt.slot_time), "EEE, MMM d · h:mm a")}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${apt.status === "confirmed" ? "bg-eternia-success/10 text-eternia-success" : "bg-eternia-warning/10 text-eternia-warning"}`}>{apt.status}</span>
                        <Button size="sm" variant="outline" className="gap-1 h-7 text-[11px] px-2" onClick={() => setCallModal({ open: true, mode: apt.session_type === "video" ? "video" : "audio" })}>
                          {apt.session_type === "video" ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}Join Call
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30 gap-1 h-7 text-[11px] px-2" onClick={() => toast.info("Escalation request sent")}><AlertTriangle className="w-3 h-3" />Escalate</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[11px] px-2" onClick={() => setSelectedAppointment(apt.id)}>Complete</Button>
                      </div>
                    </div>
                  </div>
                  {selectedAppointment === apt.id && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2.5">
                      <Textarea placeholder="Add session notes (encrypted)..." value={sessionNotes} onChange={(e) => setSessionNotes(e.target.value)} className="min-h-[80px] bg-muted/30 text-sm" />
                      <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => completeSession.mutate({ appointmentId: apt.id, notes: sessionNotes })} disabled={completeSession.isPending} className="gap-1.5 h-8 text-xs">{completeSession.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}Mark Complete</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setSelectedAppointment(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {activeTab === "slots" && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-card border border-border/50 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Add Availability Slot</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10 text-sm", !slotDate && "text-muted-foreground")}>
                    <Calendar className="w-4 h-4 mr-2" />{slotDate ? format(slotDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker mode="single" selected={slotDate} onSelect={setSlotDate} disabled={(date) => date < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">Start Time</label><Input type="time" value={slotStartTime} onChange={(e) => setSlotStartTime(e.target.value)} className="h-10 text-sm" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">End Time</label><Input type="time" value={slotEndTime} onChange={(e) => setSlotEndTime(e.target.value)} className="h-10 text-sm" /></div>
              </div>
              <Button className="w-full h-10 text-sm" disabled={!slotDate || createSlot.isPending} onClick={() => createSlot.mutate()}>
                {createSlot.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Create Slot
              </Button>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Your Slots ({futureSlots.length})</h3>
              {futureSlots.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm bg-card rounded-xl border border-border/50">No upcoming slots</div>
                : <div className="space-y-2">{futureSlots.map((slot) => (
                  <div key={slot.id} className="p-3 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                    <div><p className="text-sm font-medium">{format(new Date(slot.start_time), "EEE, MMM d")}</p><p className="text-xs text-muted-foreground">{format(new Date(slot.start_time), "h:mm a")} – {format(new Date(slot.end_time), "h:mm a")}</p></div>
                    {slot.is_booked ? <span className="px-2 py-0.5 rounded-full text-xs bg-eternia-warning/10 text-eternia-warning">Booked</span>
                      : <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteSlot.mutate(slot.id)}><Trash2 className="w-4 h-4" /></Button>}
                  </div>
                ))}</div>}
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold font-display">Completed Sessions</h2>
            {completed.length === 0 ? <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50"><CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No completed sessions</p></div>
              : completed.map((apt: any) => (
                <div key={apt.id} className="p-3 rounded-xl bg-card border border-border/50 flex items-center justify-between gap-2">
                  <div className="min-w-0"><p className="font-semibold text-sm truncate">{apt.student?.username}</p><p className="text-[11px] text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")}</p></div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-eternia-success/10 text-eternia-success shrink-0">Completed</span>
                </div>
              ))}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold font-display">Session Notes</h2>
            {completed.filter((a: any) => a.session_notes_encrypted).length === 0 ? <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50"><FileText className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No session notes</p></div>
              : completed.filter((a: any) => a.session_notes_encrypted).map((apt: any) => (
                <div key={apt.id} className="p-3 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-2 gap-2"><p className="font-semibold text-sm truncate">{apt.student?.username}</p><p className="text-[10px] text-muted-foreground shrink-0">{format(new Date(apt.slot_time), "MMM d, yyyy")}</p></div>
                  <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg">{apt.session_notes_encrypted}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      <VideoCallModal isOpen={callModal.open} onClose={() => setCallModal({ open: false, mode: "video" })} participantName={profile?.username || "Expert"} mode={callModal.mode} />
    </DashboardLayout>
  );
};

export default ExpertDashboard;
