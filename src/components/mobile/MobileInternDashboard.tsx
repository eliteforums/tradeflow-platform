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
      <div className="space-y-3 pb-24">
        <div>
          <h1 className="text-lg font-bold font-display">Intern Dashboard</h1>
          <p className="text-[11px] text-muted-foreground">Complete training to unlock Peer Connect</p>
        </div>

        {!isTrainingComplete ? (
          <div className="p-2.5 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20">
            <div className="flex items-start gap-2">
              <Lock className="w-3.5 h-3.5 text-eternia-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-xs">Training Required</p>
                <Progress value={progress} className="h-1 mt-1.5" />
                <p className="text-[9px] text-muted-foreground mt-0.5">{completedModules.length}/{MODULES.length} done</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-eternia-success/10 border border-eternia-success/20 flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-eternia-success" /><p className="font-medium text-xs text-eternia-success">Certified for Peer Connect</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Active", value: mySessions.filter((s) => s.status === "active").length, icon: MessageCircle, color: "text-primary" },
            { label: "Done", value: mySessions.filter((s) => s.status === "completed").length, icon: CheckCircle, color: "text-eternia-success" },
            { label: "Training", value: `${completedModules.length}/7`, icon: BookOpen, color: "text-eternia-warning" },
            { label: "Flagged", value: mySessions.filter((s) => s.is_flagged).length, icon: AlertTriangle, color: "text-destructive" },
          ].map((s) => (
            <div key={s.label} className="p-2 rounded-xl bg-card border border-border/50 text-center">
              <s.icon className={`w-3.5 h-3.5 ${s.color} mx-auto mb-0.5`} />
              <p className="text-sm font-bold leading-none">{s.value}</p>
              <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {(["training", "sessions", "notes"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-medium ${activeTab === tab ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "training" && (
          <div className="space-y-1.5">
            {MODULES.map((m) => {
              const done = completedModules.includes(m.day);
              const isNext = !done && completedModules.length + 1 === m.day;
              const locked = !done && !isNext;
              return (
                <div key={m.day} className={`p-2.5 rounded-xl border ${locked ? "opacity-40 bg-muted/20 border-border/30" : done ? "bg-eternia-success/5 border-eternia-success/20" : "bg-card border-border/50"}`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-eternia-success/20" : isNext ? "bg-primary/10" : "bg-muted"}`}>
                      {done ? <CheckCircle className="w-3.5 h-3.5 text-eternia-success" /> : locked ? <Lock className="w-3 h-3 text-muted-foreground" /> : <span className="text-xs font-bold text-primary">{m.day}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs">Day {m.day}: {m.title}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{m.desc}</p>
                      <p className="text-[8px] text-muted-foreground mt-0.5 flex items-center gap-0.5"><Clock className="w-2 h-2" />{m.dur}</p>
                    </div>
                    {isNext && <Button size="sm" className="gap-0.5 h-6 text-[9px] px-2 shrink-0" onClick={() => setCompletedModules((p) => [...p, m.day])}><Play className="w-2.5 h-2.5" />Start</Button>}
                    {done && <span className="text-[8px] text-eternia-success font-medium shrink-0">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-1.5">
            {isLoading ? <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              : mySessions.length === 0 ? <div className="text-center py-8 text-muted-foreground"><MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">No sessions</p></div>
              : mySessions.map((s: any) => (
                <div key={s.id} className={`p-2.5 rounded-xl border ${s.is_flagged ? "bg-destructive/5 border-destructive/20" : "bg-card border-border/50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0"><p className="font-medium text-xs truncate">{s.student?.username || "Student"}</p><p className="text-[9px] text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${s.is_flagged ? "bg-destructive/10 text-destructive" : s.status === "active" ? "bg-eternia-success/10 text-eternia-success" : "bg-primary/10 text-primary"}`}>
                        {s.is_flagged ? "⚠" : s.status}
                      </span>
                      {s.status === "active" && !s.is_flagged && (
                        <Button size="sm" variant="ghost" className="text-destructive h-6 px-1" onClick={async () => {
                          await supabase.from("peer_sessions").update({ is_flagged: true }).eq("id", s.id);
                          queryClient.invalidateQueries({ queryKey: ["intern-sessions"] }); toast.info("Flagged");
                        }}><AlertTriangle className="w-3 h-3" /></Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="text-center py-8 text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-xs">Notes appear after completing sessions</p></div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MobileInternDashboard;
