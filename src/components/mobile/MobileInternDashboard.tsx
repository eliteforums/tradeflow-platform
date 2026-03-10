import { useState } from "react";
import { BookOpen, MessageCircle, FileText, CheckCircle, Clock, AlertTriangle, Loader2, Play, Lock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

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
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"training" | "sessions" | "notes">("training");
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  const { data: mySessions = [], isLoading } = useQuery({
    queryKey: ["intern-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("peer_sessions").select("*, student:profiles!peer_sessions_student_id_fkey(username)").eq("intern_id", user.id).order("created_at", { ascending: false });
      if (error) throw error; return data;
    }, enabled: !!user,
  });

  const isTrainingComplete = completedModules.length >= MODULES.length;
  const progress = (completedModules.length / MODULES.length) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <div>
          <h1 className="text-xl font-bold font-display">Intern Dashboard</h1>
          <p className="text-sm text-muted-foreground">Complete training to unlock Peer Connect</p>
        </div>

        {!isTrainingComplete ? (
          <div className="p-4 rounded-2xl bg-eternia-warning/10 border border-eternia-warning/20">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-eternia-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Training Required</p>
                <Progress value={progress} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{completedModules.length}/{MODULES.length} done</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-eternia-success/10 border border-eternia-success/20 flex items-center gap-3">
            <Award className="w-5 h-5 text-eternia-success" /><p className="font-medium text-sm text-eternia-success">Certified for Peer Connect</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Active", value: mySessions.filter((s) => s.status === "active").length, icon: MessageCircle, color: "text-primary" },
            { label: "Done", value: mySessions.filter((s) => s.status === "completed").length, icon: CheckCircle, color: "text-eternia-success" },
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

        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {(["training", "sessions", "notes"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "training" && (
          <div className="space-y-2">
            {MODULES.map((m) => {
              const done = completedModules.includes(m.day);
              const isNext = !done && completedModules.length + 1 === m.day;
              const locked = !done && !isNext;
              return (
                <div key={m.day} className={`p-4 rounded-2xl border ${locked ? "opacity-40 bg-muted/20 border-border/30" : done ? "bg-eternia-success/5 border-eternia-success/20" : "bg-card border-border/50"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-eternia-success/20" : isNext ? "bg-primary/10" : "bg-muted"}`}>
                      {done ? <CheckCircle className="w-5 h-5 text-eternia-success" /> : locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : <span className="text-sm font-bold text-primary">{m.day}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Day {m.day}: {m.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{m.desc}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{m.dur}</p>
                    </div>
                    {isNext && <Button size="sm" className="gap-1 h-9 text-xs px-3 shrink-0" onClick={() => setCompletedModules((p) => [...p, m.day])}><Play className="w-3.5 h-3.5" />Start</Button>}
                    {done && <span className="text-xs text-eternia-success font-medium shrink-0">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-2">
            {isLoading ? <div className="flex items-center justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              : mySessions.length === 0 ? <div className="text-center py-10 text-muted-foreground"><MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">No sessions</p></div>
              : mySessions.map((s: any) => (
                <div key={s.id} className={`p-4 rounded-2xl border ${s.is_flagged ? "bg-destructive/5 border-destructive/20" : "bg-card border-border/50"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0"><p className="font-medium text-sm truncate">{s.student?.username || "Student"}</p><p className="text-xs text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${s.is_flagged ? "bg-destructive/10 text-destructive" : s.status === "active" ? "bg-eternia-success/10 text-eternia-success" : "bg-primary/10 text-primary"}`}>
                        {s.is_flagged ? "⚠" : s.status}
                      </span>
                      {s.status === "active" && !s.is_flagged && (
                        <Button size="sm" variant="ghost" className="text-destructive h-8 px-2" onClick={async () => {
                          await supabase.from("peer_sessions").update({ is_flagged: true }).eq("id", s.id);
                          queryClient.invalidateQueries({ queryKey: ["intern-sessions"] }); toast.info("Flagged");
                        }}><AlertTriangle className="w-4 h-4" /></Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="text-center py-10 text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-3 opacity-50" /><p className="text-sm">Notes appear after completing sessions</p></div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MobileInternDashboard;
