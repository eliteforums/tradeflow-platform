import { useState } from "react";
import {
  Home, Calendar, MessageCircle, FileText, User, Clock, CheckCircle,
  AlertTriangle, Loader2, Plus, Trash2, Search, LogOut, Lock,
  Play, Award, BookOpen, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TabType = "home" | "schedule" | "sessions" | "notes" | "profile";

const MODULES = [
  { day: 1, title: "Platform Overview", desc: "Understanding Eternia's tools", dur: "45 min" },
  { day: 2, title: "Active Listening", desc: "Empathetic peer support", dur: "60 min" },
  { day: 3, title: "Assessment Quiz", desc: "Evaluate modules 1-2", dur: "30 min" },
  { day: 4, title: "Crisis Recognition", desc: "Escalating high-risk situations", dur: "60 min" },
  { day: 5, title: "Ethics & Boundaries", desc: "Professional boundaries", dur: "45 min" },
  { day: 6, title: "Final Assessment", desc: "Comprehensive evaluation", dur: "45 min" },
  { day: 7, title: "Final Interview", desc: "Live evaluation with expert", dur: "30 min" },
];

const MobileInternDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  // Slot dialog
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [slotDate, setSlotDate] = useState<Date>();
  const [slotStartTime, setSlotStartTime] = useState("09:00");
  const [slotEndTime, setSlotEndTime] = useState("10:00");
  const [slotInstitution, setSlotInstitution] = useState<string>("all");

  // Escalation
  const [escalationDialog, setEscalationDialog] = useState<{ open: boolean; sessionId?: string }>({ open: false });
  const [escalationReason, setEscalationReason] = useState("");

  // Notes
  const [notesSearch, setNotesSearch] = useState("");

  const isTrainingComplete = completedModules.length >= MODULES.length;
  const progress = (completedModules.length / MODULES.length) * 100;

  const { data: mySessions = [], isLoading } = useQuery({
    queryKey: ["intern-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("peer_sessions").select("*, student:profiles!peer_sessions_student_id_fkey(username, institution_id)").eq("intern_id", user.id).order("created_at", { ascending: false });
      if (error) throw error; return data;
    }, enabled: !!user,
  });

  const { data: mySlots = [] } = useQuery({
    queryKey: ["intern-slots", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("expert_availability").select("*").eq("expert_id", user.id).order("start_time", { ascending: true });
      if (error) throw error; return data;
    }, enabled: !!user,
  });

  const { data: institutions = [] } = useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("institutions").select("id, name").eq("is_active", true);
      if (error) throw error; return data;
    },
  });

  const createSlot = useMutation({
    mutationFn: async () => {
      if (!user || !slotDate) throw new Error("Select a date");
      const s = new Date(slotDate); const [sh, sm] = slotStartTime.split(":").map(Number); s.setHours(sh, sm, 0, 0);
      const e = new Date(slotDate); const [eh, em] = slotEndTime.split(":").map(Number); e.setHours(eh, em, 0, 0);
      if (e <= s) throw new Error("End > start");
      const { error } = await supabase.from("expert_availability").insert({ expert_id: user.id, start_time: s.toISOString(), end_time: e.toISOString(), institution_id: slotInstitution !== "all" ? slotInstitution : null });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["intern-slots"] }); toast.success("Slot created"); setSlotDialogOpen(false); setSlotDate(undefined); },
    onError: (e) => toast.error(e.message),
  });

  const deleteSlot = useMutation({
    mutationFn: async (slotId: string) => { const { error } = await supabase.from("expert_availability").delete().eq("id", slotId); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["intern-slots"] }); toast.success("Removed"); },
  });

  const submitEscalation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("escalation_requests").insert({ spoc_id: user.id, justification_encrypted: escalationReason, session_id: escalationDialog.sessionId || null, entry_id: null });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Escalation submitted"); setEscalationDialog({ open: false }); setEscalationReason(""); },
    onError: (e) => toast.error(e.message),
  });

  const activeSessions = mySessions.filter((s) => s.status === "active");
  const completedSessions = mySessions.filter((s) => s.status === "completed");
  const futureSlots = mySlots.filter((s) => new Date(s.start_time) > new Date());

  const tabs: { key: TabType; icon: typeof Home; label: string }[] = [
    { key: "home", icon: Home, label: "Home" },
    { key: "schedule", icon: Calendar, label: "Schedule" },
    { key: "sessions", icon: MessageCircle, label: "Sessions" },
    { key: "notes", icon: FileText, label: "Notes" },
    { key: "profile", icon: User, label: "Profile" },
  ];

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display">Intern Dashboard</h1>
            <p className="text-sm text-muted-foreground">Training & peer sessions</p>
          </div>
          {isTrainingComplete ? <Award className="w-5 h-5 text-eternia-success" /> : <Lock className="w-5 h-5 text-eternia-warning" />}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn("shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium", activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground")}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {/* HOME */}
        {activeTab === "home" && (
          <div className="space-y-4">
            {!isTrainingComplete && (
              <div className="p-4 rounded-2xl bg-eternia-warning/10 border border-eternia-warning/20">
                <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-eternia-warning" /><p className="font-medium text-sm">Training Required</p></div>
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{completedModules.length}/{MODULES.length} done</p>
                <div className="mt-2 space-y-1">
                  {MODULES.map((m) => {
                    const done = completedModules.includes(m.day);
                    const isNext = !done && completedModules.length + 1 === m.day;
                    const locked = !done && !isNext;
                    return (
                      <div key={m.day} className={cn("flex items-center gap-2 p-1.5 rounded-lg", locked && "opacity-40")}>
                        <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0",
                          done ? "bg-eternia-success/20 text-eternia-success" : isNext ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>{done ? <CheckCircle className="w-3 h-3" /> : locked ? <Lock className="w-2.5 h-2.5" /> : m.day}</div>
                        <p className="text-[11px] font-medium flex-1 truncate">{m.title}</p>
                        {isNext && <Button size="sm" className="h-5 text-[9px] px-1.5 gap-0.5" onClick={() => setCompletedModules((p) => [...p, m.day])}><Play className="w-2.5 h-2.5" />Start</Button>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Active", value: activeSessions.length, icon: MessageCircle, color: "text-primary" },
                { label: "Done", value: completedSessions.length, icon: CheckCircle, color: "text-eternia-success" },
                { label: "Training", value: `${completedModules.length}/7`, icon: BookOpen, color: "text-eternia-warning" },
                { label: "Flagged", value: mySessions.filter((s) => s.is_flagged).length, icon: AlertTriangle, color: "text-destructive" },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-2xl bg-card border border-border/50 text-center">
                  <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
                  <p className="text-base font-bold leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Peer Sessions</p>
              <Button size="sm" className="gap-1 h-8 text-xs" onClick={() => setSlotDialogOpen(true)}><Plus className="w-3.5 h-3.5" />Add Slot</Button>
            </div>

            {mySessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground"><MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No sessions</p></div>
            ) : mySessions.slice(0, 5).map((s: any) => (
              <div key={s.id} className={cn("p-3 rounded-2xl border", s.is_flagged ? "bg-destructive/5 border-destructive/20" : "bg-card border-border/50")}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0"><p className="font-medium text-sm truncate">{s.student?.username || "Student"}</p><p className="text-xs text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px]",
                      s.is_flagged ? "bg-destructive/10 text-destructive" : s.status === "active" ? "bg-eternia-success/10 text-eternia-success" : "bg-primary/10 text-primary"
                    )}>{s.is_flagged ? "⚠" : s.status}</span>
                    {s.status === "active" && !s.is_flagged && (
                      <Button size="sm" variant="ghost" className="text-destructive h-7 px-1.5" onClick={() => setEscalationDialog({ open: true, sessionId: s.id })}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SCHEDULE */}
        {activeTab === "schedule" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Slots ({futureSlots.length})</p>
              <Button size="sm" className="gap-1 h-8 text-xs" onClick={() => setSlotDialogOpen(true)}><Plus className="w-3.5 h-3.5" />Add</Button>
            </div>
            {futureSlots.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">No slots</p>
              : futureSlots.map((slot) => (
                <div key={slot.id} className="p-3 rounded-2xl bg-card border border-border/50 flex items-center justify-between">
                  <div><p className="text-sm font-medium">{format(new Date(slot.start_time), "EEE, MMM d")}</p><p className="text-xs text-muted-foreground">{format(new Date(slot.start_time), "h:mm a")} – {format(new Date(slot.end_time), "h:mm a")}</p></div>
                  {slot.is_booked ? <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">Booked</span>
                    : <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteSlot.mutate(slot.id)}><Trash2 className="w-4 h-4" /></Button>}
                </div>
              ))}
          </div>
        )}

        {/* SESSIONS */}
        {activeTab === "sessions" && (
          <div className="space-y-2">
            {mySessions.length === 0 ? <div className="text-center py-10 text-muted-foreground"><MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">No sessions</p></div>
              : mySessions.map((s: any) => (
                <div key={s.id} className={cn("p-3 rounded-2xl border", s.is_flagged ? "bg-destructive/5 border-destructive/20" : "bg-card border-border/50")}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0"><p className="font-medium text-sm truncate">{s.student?.username || "Student"}</p><p className="text-xs text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs shrink-0",
                      s.is_flagged ? "bg-destructive/10 text-destructive" : s.status === "active" ? "bg-eternia-success/10 text-eternia-success" : s.status === "completed" ? "bg-primary/10 text-primary" : "bg-eternia-warning/10 text-eternia-warning"
                    )}>{s.is_flagged ? "⚠ Flagged" : s.status}</span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* NOTES */}
        {activeTab === "notes" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={notesSearch} onChange={(e) => setNotesSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
            {completedSessions.length === 0 ? <div className="text-center py-10 text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">No history</p></div>
              : completedSessions.filter((s: any) => !notesSearch || (s.student?.username || "").toLowerCase().includes(notesSearch.toLowerCase())).map((s: any) => (
                <div key={s.id} className="p-3 rounded-2xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-1"><p className="font-medium text-sm">{s.student?.username || "Student"}</p><p className="text-xs text-muted-foreground">{format(new Date(s.created_at), "MMM d")}</p></div>
                  {s.escalation_note_encrypted && <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">{s.escalation_note_encrypted}</p>}
                  <div className="flex gap-2 mt-1.5">
                    {s.is_flagged && <span className="px-2 py-0.5 rounded-full text-[10px] bg-destructive/10 text-destructive">Flagged</span>}
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-eternia-success/10 text-eternia-success">Done</span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-eternia flex items-center justify-center shrink-0"><User className="w-7 h-7 text-background" /></div>
                <div><h2 className="text-lg font-bold">{profile?.username}</h2><p className="text-xs text-muted-foreground capitalize">{profile?.role}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div><p className="text-[10px] text-muted-foreground">Licence No.</p><p className="text-sm font-medium">—</p></div>
                <div><p className="text-[10px] text-muted-foreground">CRR Verification</p>
                  {profile?.is_verified ? <span className="text-sm font-medium text-eternia-success flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Verified</span>
                    : <span className="text-sm font-medium text-eternia-warning flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Pending</span>}
                </div>
                <div><p className="text-[10px] text-muted-foreground">Training</p><p className={cn("text-sm font-medium", isTrainingComplete ? "text-eternia-success" : "text-eternia-warning")}>{isTrainingComplete ? "Complete" : `${completedModules.length}/7`}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Sessions</p><p className="text-sm font-medium">{completedSessions.length}</p></div>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-between h-10 text-sm" onClick={() => setActiveTab("schedule")}>Edit Availability<ChevronRight className="w-4 h-4" /></Button>
            <Button variant="outline" className="w-full justify-between h-10 text-sm" onClick={() => toast.info("Coming soon")}>Change Password<ChevronRight className="w-4 h-4" /></Button>
            <Button variant="outline" className="w-full justify-between h-10 text-sm text-destructive" onClick={signOut}><span className="flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</span><ChevronRight className="w-4 h-4" /></Button>
          </div>
        )}
      </div>

      {/* Add Slot Dialog */}
      <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Slot</DialogTitle><DialogDescription>Create availability</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" className={cn("w-full justify-start h-10 text-sm", !slotDate && "text-muted-foreground")}><Calendar className="w-4 h-4 mr-2" />{slotDate ? format(slotDate, "PPP") : "Pick date"}</Button></PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start"><CalendarPicker mode="single" selected={slotDate} onSelect={setSlotDate} disabled={(d) => d < new Date()} initialFocus className={cn("p-3 pointer-events-auto")} /></PopoverContent>
            </Popover>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">Start</label><Input type="time" value={slotStartTime} onChange={(e) => setSlotStartTime(e.target.value)} className="h-10 text-sm" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">End</label><Input type="time" value={slotEndTime} onChange={(e) => setSlotEndTime(e.target.value)} className="h-10 text-sm" /></div>
            </div>
            <div><label className="text-xs text-muted-foreground mb-1 block">Institution</label>
              <Select value={slotInstitution} onValueChange={setSlotInstitution}><SelectTrigger className="h-10 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All</SelectItem>{institutions.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotDialogOpen(false)}>Cancel</Button>
            <Button disabled={!slotDate || createSlot.isPending} onClick={() => createSlot.mutate()}>{createSlot.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalation Dialog */}
      <Dialog open={escalationDialog.open} onOpenChange={(o) => setEscalationDialog({ open: o })}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />Escalate</DialogTitle><DialogDescription>Describe the reason</DialogDescription></DialogHeader>
          <Textarea placeholder="Reason..." value={escalationReason} onChange={(e) => setEscalationReason(e.target.value)} className="min-h-[80px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalationDialog({ open: false })}>Cancel</Button>
            <Button variant="destructive" disabled={!escalationReason.trim() || submitEscalation.isPending} onClick={() => submitEscalation.mutate()}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MobileInternDashboard;
