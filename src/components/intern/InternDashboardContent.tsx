import { useState } from "react";
import {
  Home, Calendar, MessageCircle, FileText, User, Clock, CheckCircle,
  AlertTriangle, Loader2, Plus, Trash2, Search, Shield, LogOut, Lock,
  Play, Award, BookOpen, RefreshCw, ChevronRight, Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TabType = "home" | "schedule" | "sessions" | "notes" | "profile";

const TABS: { key: TabType; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "schedule", label: "Schedule", icon: Calendar },
  { key: "sessions", label: "Sessions", icon: MessageCircle },
  { key: "notes", label: "Notes", icon: FileText },
  { key: "profile", label: "Profile", icon: User },
];

const TRAINING_MODULES = [
  { day: 1, title: "Platform Overview", description: "Understanding Eternia's mission and tools", duration: "45 min" },
  { day: 2, title: "Active Listening", description: "Core techniques for empathetic peer support", duration: "60 min" },
  { day: 3, title: "Assessment Quiz", description: "Evaluate your understanding of modules 1-2", duration: "30 min" },
  { day: 4, title: "Crisis Recognition", description: "Identifying and escalating high-risk situations", duration: "60 min" },
  { day: 5, title: "Ethics & Boundaries", description: "Maintaining professional boundaries", duration: "45 min" },
  { day: 6, title: "Final Assessment", description: "Comprehensive evaluation of all modules", duration: "45 min" },
  { day: 7, title: "Final Interview", description: "Live evaluation with a supervising expert", duration: "30 min" },
];

const InternDashboardContent = () => {
  const { user, profile, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  // Schedule state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week">("month");
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
  const [notesFilterInstitution, setNotesFilterInstitution] = useState<string>("all");

  // training_status from DB: 'not_started' | 'in_progress' | 'completed'
  const trainingStatus = (profile as any)?.training_status || "not_started";
  const isTrainingComplete = trainingStatus === "completed" || completedModules.length >= TRAINING_MODULES.length;
  const trainingProgress = isTrainingComplete ? 100 : (completedModules.length / TRAINING_MODULES.length) * 100;

  // Queries
  const { data: mySessions = [], isLoading } = useQuery({
    queryKey: ["intern-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("peer_sessions")
        .select("*, student:profiles!peer_sessions_student_id_fkey(username, institution_id)")
        .eq("intern_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: mySlots = [] } = useQuery({
    queryKey: ["intern-slots", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("expert_availability")
        .select("*")
        .eq("expert_id", user.id)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: institutions = [] } = useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("institutions").select("id, name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Mutations
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
      const { error } = await supabase.from("expert_availability").insert({
        expert_id: user.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        institution_id: slotInstitution !== "all" ? slotInstitution : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intern-slots"] });
      toast.success("Slot created");
      setSlotDialogOpen(false);
      setSlotDate(undefined);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteSlot = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase.from("expert_availability").delete().eq("id", slotId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intern-slots"] });
      toast.success("Slot removed");
    },
  });

  const submitEscalation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("escalation_requests").insert({
        spoc_id: user.id,
        justification_encrypted: escalationReason,
        session_id: escalationDialog.sessionId || null,
        entry_id: null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Escalation submitted");
      setEscalationDialog({ open: false });
      setEscalationReason("");
    },
    onError: (e) => toast.error(e.message),
  });

  // Derived
  const activeSessions = mySessions.filter((s) => s.status === "active");
  const completedSessions = mySessions.filter((s) => s.status === "completed");
  const futureSlots = mySlots.filter((s) => new Date(s.start_time) > new Date());

  // Calendar helpers
  const getCalendarDays = () => {
    if (calendarView === "month") {
      const start = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(calendarMonth), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfWeek(calendarMonth, { weekStartsOn: 1 });
      const end = endOfWeek(calendarMonth, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
  };

  const getSlotsForDay = (day: Date) => mySlots.filter((s) => isSameDay(new Date(s.start_time), day));

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Intern Dashboard</h1>
            <p className="text-sm text-muted-foreground">Training, peer sessions & schedule</p>
          </div>
          {isTrainingComplete ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-eternia-success/10 border border-eternia-success/20">
              <Award className="w-4 h-4 text-eternia-success" />
              <span className="text-xs font-medium text-eternia-success">Certified</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-eternia-warning/10 border border-eternia-warning/20">
              <Lock className="w-4 h-4 text-eternia-warning" />
              <span className="text-xs font-medium text-eternia-warning">{completedModules.length}/7 Training</span>
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 bg-muted/30 p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* =================== HOME TAB =================== */}
        {activeTab === "home" && (
          <div className="space-y-4">
            {/* Training progress */}
            {!isTrainingComplete && (
              <div className="p-4 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-eternia-warning" />
                  <p className="font-medium text-sm">Training Required — Complete all 7 modules</p>
                </div>
                <Progress value={trainingProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{completedModules.length}/{TRAINING_MODULES.length} completed</p>

                <div className="mt-3 space-y-1.5">
                  {TRAINING_MODULES.map((mod) => {
                    const done = completedModules.includes(mod.day);
                    const isNext = !done && completedModules.length + 1 === mod.day;
                    const locked = !done && !isNext;
                    return (
                      <div key={mod.day} className={cn("flex items-center gap-3 p-2 rounded-lg", locked && "opacity-40")}>
                        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-xs font-bold",
                          done ? "bg-eternia-success/20 text-eternia-success" : isNext ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {done ? <CheckCircle className="w-3.5 h-3.5" /> : locked ? <Lock className="w-3 h-3" /> : mod.day}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">Day {mod.day}: {mod.title}</p>
                        </div>
                        {isNext && <Button size="sm" className="h-6 text-[10px] px-2 gap-1" onClick={() => setCompletedModules((p) => [...p, mod.day])}><Play className="w-3 h-3" />Start</Button>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Active", value: activeSessions.length, icon: MessageCircle, color: "text-primary" },
                { label: "Completed", value: completedSessions.length, icon: CheckCircle, color: "text-eternia-success" },
                { label: "Training", value: `${completedModules.length}/7`, icon: BookOpen, color: "text-eternia-warning" },
                { label: "Flagged", value: mySessions.filter((s) => s.is_flagged).length, icon: AlertTriangle, color: "text-destructive" },
              ].map((stat) => (
                <div key={stat.label} className="p-3 rounded-xl bg-card border border-border/50 text-center">
                  <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
                  <p className="text-xl font-bold leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Active peer sessions */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-display">Peer Sessions</h2>
              <Button size="sm" className="gap-1.5" onClick={() => setActiveTab("schedule")}>
                <Plus className="w-4 h-4" />Add Availability
              </Button>
            </div>

            {mySessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border/50">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No peer sessions yet</p>
                {!isTrainingComplete && <p className="text-xs mt-1">Complete training to unlock</p>}
              </div>
            ) : (
              <div className="space-y-2">
                {mySessions.slice(0, 8).map((session: any) => (
                  <div key={session.id} className={cn("p-4 rounded-xl border", session.is_flagged ? "bg-destructive/5 border-destructive/20" : "bg-card border-border/50")}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{session.student?.username || "Student"}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(session.created_at), "EEE, MMM d · h:mm a")}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium",
                          session.is_flagged ? "bg-destructive/10 text-destructive"
                            : session.status === "active" ? "bg-eternia-success/10 text-eternia-success"
                              : session.status === "completed" ? "bg-primary/10 text-primary"
                                : "bg-eternia-warning/10 text-eternia-warning"
                        )}>{session.is_flagged ? "⚠ Flagged" : session.status}</span>
                        {session.status === "active" && !session.is_flagged && (
                          <Button size="sm" variant="ghost" className="text-destructive h-7 px-1.5" onClick={() => setEscalationDialog({ open: true, sessionId: session.id })}>
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================== SCHEDULE TAB =================== */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </Button>
                <h2 className="text-base font-semibold font-display min-w-[140px] text-center">{format(calendarMonth, "MMMM yyyy")}</h2>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-muted/50 rounded-lg p-0.5">
                  <button onClick={() => setCalendarView("month")} className={cn("px-3 py-1 rounded-md text-xs font-medium", calendarView === "month" ? "bg-background shadow-sm" : "text-muted-foreground")}>Month</button>
                  <button onClick={() => setCalendarView("week")} className={cn("px-3 py-1 rounded-md text-xs font-medium", calendarView === "week" ? "bg-background shadow-sm" : "text-muted-foreground")}>Week</button>
                </div>
                <Button size="sm" className="gap-1.5 h-8" onClick={() => setSlotDialogOpen(true)}><Plus className="w-3.5 h-3.5" />Add Slot</Button>
                <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => toast.info("Coming soon")}><Ban className="w-3.5 h-3.5" />Block</Button>
                <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => toast.info("Coming soon")}><RefreshCw className="w-3.5 h-3.5" />Recurring</Button>
              </div>
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-eternia-success/30 border border-eternia-success/50" />Free</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary/30 border border-primary/50" />Booked</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted border border-border" />Blocked</span>
            </div>

            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {getCalendarDays().map((day, i) => {
                  const daySlots = getSlotsForDay(day);
                  const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div key={i} className={cn("min-h-[80px] p-1.5 border-b border-r border-border/30", !isCurrentMonth && "opacity-30", isToday && "bg-primary/5")}>
                      <p className={cn("text-xs font-medium mb-1", isToday && "text-primary")}>{format(day, "d")}</p>
                      <div className="space-y-0.5">
                        {daySlots.map((slot) => (
                          <div key={slot.id} className={cn("px-1 py-0.5 rounded text-[9px] truncate",
                            slot.is_booked ? "bg-primary/20 text-primary border border-primary/30" : "bg-eternia-success/20 text-eternia-success border border-eternia-success/30"
                          )}>{format(new Date(slot.start_time), "HH:mm")}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3">Upcoming Slots ({futureSlots.length})</h3>
              {futureSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6 bg-card rounded-xl border border-border/50">No upcoming slots</p>
              ) : (
                <div className="space-y-2">
                  {futureSlots.map((slot) => (
                    <div key={slot.id} className="p-3 rounded-xl bg-card border border-border/50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{format(new Date(slot.start_time), "EEE, MMM d")}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(slot.start_time), "h:mm a")} – {format(new Date(slot.end_time), "h:mm a")}</p>
                      </div>
                      {slot.is_booked ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">Booked</span>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteSlot.mutate(slot.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================== SESSIONS TAB =================== */}
        {activeTab === "sessions" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-display">All Peer Sessions</h2>
            {mySessions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border/50">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No sessions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mySessions.map((session: any) => (
                  <div key={session.id} className={cn("p-4 rounded-xl border", session.is_flagged ? "bg-destructive/5 border-destructive/20" : "bg-card border-border/50")}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm truncate">{session.student?.username || "Student"}</p>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium",
                            session.is_flagged ? "bg-destructive/10 text-destructive"
                              : session.status === "active" ? "bg-eternia-success/10 text-eternia-success"
                                : session.status === "completed" ? "bg-primary/10 text-primary"
                                  : "bg-eternia-warning/10 text-eternia-warning"
                          )}>{session.is_flagged ? "⚠ Flagged" : session.status}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{format(new Date(session.created_at), "EEE, MMM d · h:mm a")}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {session.status === "active" && (
                          <>
                            <Button size="sm" className="gap-1 h-7 text-[11px] px-2.5" onClick={() => toast.info("Join session")}>Join</Button>
                            <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5" onClick={async () => {
                              await supabase.from("peer_sessions").update({ status: "completed" as any, ended_at: new Date().toISOString() }).eq("id", session.id);
                              queryClient.invalidateQueries({ queryKey: ["intern-sessions"] });
                              toast.success("Session ended");
                            }}>End</Button>
                            <Button size="sm" variant="outline" className="h-7 text-[11px] px-2.5 text-destructive border-destructive/30" onClick={() => setEscalationDialog({ open: true, sessionId: session.id })}>
                              <AlertTriangle className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================== NOTES TAB =================== */}
        {activeTab === "notes" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold font-display">Session History</h2>
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by student..." value={notesSearch} onChange={(e) => setNotesSearch(e.target.value)} className="pl-9 h-9 text-sm" />
              </div>
              <Select value={notesFilterInstitution} onValueChange={setNotesFilterInstitution}>
                <SelectTrigger className="w-[180px] h-9 text-sm"><SelectValue placeholder="Institution" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map((inst) => (<SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {completedSessions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border/50">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No session history yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {completedSessions
                  .filter((s: any) => !notesSearch || (s.student?.username || "").toLowerCase().includes(notesSearch.toLowerCase()))
                  .filter((s: any) => notesFilterInstitution === "all" || s.student?.institution_id === notesFilterInstitution)
                  .map((session: any) => (
                    <div key={session.id} className="p-4 rounded-xl bg-card border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-sm">{session.student?.username || "Student"}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(session.created_at), "MMM d, yyyy · h:mm a")}</p>
                      </div>
                      {session.escalation_note_encrypted && (
                        <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{session.escalation_note_encrypted}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {session.is_flagged && <span className="px-2 py-0.5 rounded-full text-[10px] bg-destructive/10 text-destructive">Flagged</span>}
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-eternia-success/10 text-eternia-success">Completed</span>
                        {session.ended_at && session.started_at && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)} min
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* =================== PROFILE TAB =================== */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-card border border-border/50">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-eternia flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-background" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold font-display">{profile?.username || "Intern"}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
                  {profile?.specialty && <p className="text-sm text-primary mt-1">{profile.specialty}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Licence No.</p>
                  <p className="text-sm font-medium">—</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">CRR Verification</p>
                  <div className="flex items-center gap-1.5">
                    {profile?.is_verified ? (
                      <><CheckCircle className="w-4 h-4 text-eternia-success" /><span className="text-sm font-medium text-eternia-success">Verified</span></>
                    ) : (
                      <><Clock className="w-4 h-4 text-eternia-warning" /><span className="text-sm font-medium text-eternia-warning">Pending</span></>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Training Status</p>
                  <p className={cn("text-sm font-medium", isTrainingComplete ? "text-eternia-success" : "text-eternia-warning")}>{isTrainingComplete ? "Completed" : "In Progress"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                  <p className="text-sm font-medium">{completedSessions.length}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-between h-10 text-sm" onClick={() => setActiveTab("schedule")}>
                Edit Availability<ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-10 text-sm" onClick={() => toast.info("Password change coming soon")}>
                Change Password<ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between h-10 text-sm text-destructive hover:text-destructive" onClick={signOut}>
                <span className="flex items-center gap-2"><LogOut className="w-4 h-4" />Logout</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Slot Dialog */}
      <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Availability Slot</DialogTitle>
            <DialogDescription>Create a new time slot for peer sessions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Institution</label>
              <Select value={slotInstitution} onValueChange={setSlotInstitution}>
                <SelectTrigger className="h-10 text-sm"><SelectValue placeholder="All institutions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map((inst) => (<SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotDialogOpen(false)}>Cancel</Button>
            <Button disabled={!slotDate || createSlot.isPending} onClick={() => createSlot.mutate()}>
              {createSlot.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalation Dialog */}
      <Dialog open={escalationDialog.open} onOpenChange={(o) => setEscalationDialog({ open: o })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />Submit Escalation</DialogTitle>
            <DialogDescription>Describe the reason for escalation</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Reason for escalation..." value={escalationReason} onChange={(e) => setEscalationReason(e.target.value)} className="min-h-[100px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalationDialog({ open: false })}>Cancel</Button>
            <Button variant="destructive" disabled={!escalationReason.trim() || submitEscalation.isPending} onClick={() => submitEscalation.mutate()}>
              {submitEscalation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default InternDashboardContent;
