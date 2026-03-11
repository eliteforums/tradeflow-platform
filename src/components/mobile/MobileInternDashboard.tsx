import { useState } from "react";
import {
  Home, MessageCircle, FileText, User, Clock, CheckCircle,
  AlertTriangle, Loader2, Search, LogOut, Lock,
  Play, Award, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// PRD tabs: Training, Peer Sessions, Notes, Profile
type TabType = "training" | "sessions" | "notes" | "profile";

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
  const [activeTab, setActiveTab] = useState<TabType>("training");
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  // Escalation
  const [escalationDialog, setEscalationDialog] = useState<{ open: boolean; sessionId?: string }>({ open: false });
  const [escalationReason, setEscalationReason] = useState("");

  // Notes
  const [notesSearch, setNotesSearch] = useState("");

  const trainingStatus = (profile as any)?.training_status || "not_started";
  const isTrainingComplete = trainingStatus === "completed" || completedModules.length >= MODULES.length;
  const progress = isTrainingComplete ? 100 : (completedModules.length / MODULES.length) * 100;
  const lockedTabs: TabType[] = isTrainingComplete ? [] : ["sessions", "notes"];

  const { data: mySessions = [], isLoading } = useQuery({
    queryKey: ["intern-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("peer_sessions").select("*, student:profiles!peer_sessions_student_id_fkey(username, institution_id)").eq("intern_id", user.id).order("created_at", { ascending: false });
      if (error) throw error; return data;
    }, enabled: !!user,
  });

  const submitEscalation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const session = mySessions.find(s => s.id === escalationDialog.sessionId);
      let spocId = user.id;
      if (session?.student?.institution_id) {
        const { data: spocs } = await supabase.from("profiles").select("id").eq("institution_id", (session.student as any).institution_id).eq("role", "spoc").limit(1);
        if (spocs && spocs.length > 0) spocId = spocs[0].id;
      }
      const { error } = await supabase.from("escalation_requests").insert({ spoc_id: spocId, justification_encrypted: escalationReason, session_id: escalationDialog.sessionId || null, entry_id: null });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Escalation submitted"); setEscalationDialog({ open: false }); setEscalationReason(""); },
    onError: (e) => toast.error(e.message),
  });

  const activeSessions = mySessions.filter((s) => s.status === "active");
  const completedSessions = mySessions.filter((s) => s.status === "completed");

  const tabs: { key: TabType; icon: typeof Home; label: string }[] = [
    { key: "training", icon: BookOpen, label: "Training" },
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

        {/* Tab bar with locking */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isLocked = lockedTabs.includes(tab.key);
            return (
              <button key={tab.key} onClick={() => {
                if (isLocked) { toast.info("Complete training to unlock"); return; }
                setActiveTab(tab.key);
              }} className={cn("shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium",
                activeTab === tab.key ? "bg-primary text-primary-foreground"
                  : isLocked ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                    : "bg-muted/50 text-muted-foreground"
              )}>
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <tab.icon className="w-3.5 h-3.5" />}{tab.label}
              </button>
            );
          })}
        </div>

        {/* TRAINING */}
        {activeTab === "training" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-eternia-warning/10 border border-eternia-warning/20">
              <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-eternia-warning" /><p className="font-medium text-sm">{isTrainingComplete ? "Training Complete! 🎉" : "Training Required"}</p></div>
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
                <div><p className="text-[10px] text-muted-foreground">CRR Verification</p>
                  {profile?.is_verified ? <span className="text-sm font-medium text-eternia-success flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Verified</span>
                    : <span className="text-sm font-medium text-eternia-warning flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Pending</span>}
                </div>
                <div><p className="text-[10px] text-muted-foreground">Training</p><p className={cn("text-sm font-medium", isTrainingComplete ? "text-eternia-success" : "text-eternia-warning")}>{isTrainingComplete ? "Complete" : `${completedModules.length}/7`}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Sessions</p><p className="text-sm font-medium">{completedSessions.length}</p></div>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2 h-10 text-sm text-destructive" onClick={signOut}><LogOut className="w-4 h-4" />Logout</Button>
          </div>
        )}
      </div>

      {/* Escalation Dialog */}
      <Dialog open={escalationDialog.open} onOpenChange={(o) => setEscalationDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />Submit Escalation</DialogTitle>
            <DialogDescription>Describe the reason</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Reason..." value={escalationReason} onChange={(e) => setEscalationReason(e.target.value)} className="min-h-[80px]" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalationDialog({ open: false })}>Cancel</Button>
            <Button variant="destructive" disabled={!escalationReason.trim() || submitEscalation.isPending} onClick={() => submitEscalation.mutate()}>
              {submitEscalation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MobileInternDashboard;
