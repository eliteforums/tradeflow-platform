import { useState } from "react";
import {
  Home, MessageCircle, FileText, User, Clock, CheckCircle,
  AlertTriangle, Loader2, Search, Shield, LogOut, Lock,
  Play, Award, BookOpen, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// PRD tabs: Training Module, Peer Sessions, Notes, Profile
type TabType = "training" | "sessions" | "notes" | "profile";

const TABS: { key: TabType; label: string; icon: typeof Home }[] = [
  { key: "training", label: "Training", icon: BookOpen },
  { key: "sessions", label: "Peer Sessions", icon: MessageCircle },
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
  const [activeTab, setActiveTab] = useState<TabType>("training");

  // Load training progress from DB
  const savedProgress: number[] = (profile as any)?.training_progress || [];
  const [completedModules, setCompletedModules] = useState<number[]>(savedProgress);

  // Sync when profile loads
  const profileProgress = (profile as any)?.training_progress;
  const [lastSynced, setLastSynced] = useState<string>("");
  if (profileProgress && JSON.stringify(profileProgress) !== lastSynced && JSON.stringify(profileProgress) !== JSON.stringify(completedModules)) {
    setCompletedModules(profileProgress);
    setLastSynced(JSON.stringify(profileProgress));
  }

  // Escalation
  const [escalationDialog, setEscalationDialog] = useState<{ open: boolean; sessionId?: string }>({ open: false });
  const [escalationReason, setEscalationReason] = useState("");

  // Notes
  const [notesSearch, setNotesSearch] = useState("");
  const [notesFilterInstitution, setNotesFilterInstitution] = useState<string>("all");

  // training_status from DB
  const trainingStatus = (profile as any)?.training_status || "not_started";
  const isTrainingComplete = trainingStatus === "completed" || completedModules.length >= TRAINING_MODULES.length;
  const trainingProgress = isTrainingComplete ? 100 : (completedModules.length / TRAINING_MODULES.length) * 100;

  // Determine which tabs are locked
  const lockedTabs: TabType[] = isTrainingComplete ? [] : ["sessions", "notes"];

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

  const { data: institutions = [] } = useQuery({
    queryKey: ["institutions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("institutions").select("id, name").eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  // Mutations
  const submitEscalation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      // Find student's institution SPOC
      const session = mySessions.find(s => s.id === escalationDialog.sessionId);
      let spocId = user.id; // fallback
      if (session?.student?.institution_id) {
        const { data: spocs } = await supabase
          .from("profiles")
          .select("id")
          .eq("institution_id", session.student.institution_id)
          .eq("role", "spoc")
          .limit(1);
        if (spocs && spocs.length > 0) spocId = spocs[0].id;
      }
      const { error } = await supabase.from("escalation_requests").insert({
        spoc_id: spocId,
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

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">Intern Dashboard</h1>
            <p className="text-sm text-muted-foreground">Training & peer sessions</p>
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

        {/* Tab Bar — locked tabs show lock icon */}
        <div className="flex gap-1 bg-muted/30 p-1 rounded-xl">
          {TABS.map((tab) => {
            const isLocked = lockedTabs.includes(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (isLocked) {
                    toast.info("Complete training to unlock this tab");
                    return;
                  }
                  setActiveTab(tab.key);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isLocked
                      ? "text-muted-foreground/40 cursor-not-allowed"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <tab.icon className="w-4 h-4" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* =================== TRAINING TAB =================== */}
        {activeTab === "training" && (
          <div className="space-y-4">
            {/* Training progress */}
            <div className="p-4 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-eternia-warning" />
                <p className="font-medium text-sm">
                  {isTrainingComplete ? "Training Complete! 🎉" : "Training Required — Complete all 7 modules"}
                </p>
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
                        <p className="text-[10px] text-muted-foreground truncate">{mod.description} · {mod.duration}</p>
                      </div>
                      {isNext && (
                        <Button size="sm" className="h-6 text-[10px] px-2 gap-1" onClick={async () => {
                          const newModules = [...completedModules, mod.day];
                          setCompletedModules(newModules);
                          // Persist to DB
                          if (user) {
                            const newStatus = newModules.length >= TRAINING_MODULES.length ? "completed" : "in_progress";
                            await supabase.from("profiles").update({ training_progress: newModules, training_status: newStatus }).eq("id", user.id);
                          }
                        }}>
                          <Play className="w-3 h-3" />Start
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

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
          </div>
        )}

        {/* =================== PEER SESSIONS TAB =================== */}
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
