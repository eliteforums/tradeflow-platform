import { useState } from "react";
import {
  BookOpen, MessageCircle, FileText, CheckCircle, Clock,
  AlertTriangle, Loader2, Play, Lock, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

const TRAINING_MODULES = [
  { day: 1, title: "Platform Overview", description: "Understanding Eternia's mission and tools", duration: "45 min" },
  { day: 2, title: "Active Listening", description: "Core techniques for empathetic peer support", duration: "60 min" },
  { day: 3, title: "Assessment Quiz", description: "Evaluate your understanding of modules 1-2", duration: "30 min" },
  { day: 4, title: "Crisis Recognition", description: "Identifying and escalating high-risk situations", duration: "60 min" },
  { day: 5, title: "Ethics & Boundaries", description: "Maintaining professional boundaries", duration: "45 min" },
  { day: 6, title: "Final Assessment", description: "Comprehensive evaluation of all modules", duration: "45 min" },
  { day: 7, title: "Final Interview", description: "Live evaluation with a supervising expert", duration: "30 min" },
];

const InternDashboard = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"training" | "sessions" | "notes">("training");
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  const { data: mySessions = [], isLoading } = useQuery({
    queryKey: ["intern-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("peer_sessions")
        .select("*, student:profiles!peer_sessions_student_id_fkey(username)")
        .eq("intern_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const isTrainingComplete = completedModules.length >= TRAINING_MODULES.length;
  const trainingProgress = (completedModules.length / TRAINING_MODULES.length) * 100;
  const activeSessions = mySessions.filter((s) => s.status === "active");
  const completedSessions = mySessions.filter((s) => s.status === "completed");

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold font-display">Intern Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Complete training to unlock Peer Connect sessions
          </p>
        </div>

        {/* Training Status */}
        {!isTrainingComplete && (
          <div className="p-3 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20">
            <div className="flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-eternia-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Training Required</p>
                <p className="text-[11px] text-muted-foreground">Complete all 7 modules to unlock Peer Connect</p>
                <Progress value={trainingProgress} className="h-1.5 mt-2" />
                <p className="text-[10px] text-muted-foreground mt-1">{completedModules.length}/{TRAINING_MODULES.length} done</p>
              </div>
            </div>
          </div>
        )}

        {isTrainingComplete && (
          <div className="p-3 rounded-xl bg-eternia-success/10 border border-eternia-success/20 flex items-center gap-2.5">
            <Award className="w-4 h-4 text-eternia-success shrink-0" />
            <div>
              <p className="font-medium text-sm text-eternia-success">Training Complete</p>
              <p className="text-[11px] text-muted-foreground">You are certified for Peer Connect</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: "Active", value: activeSessions.length, icon: MessageCircle, color: "text-primary" },
            { label: "Completed", value: completedSessions.length, icon: CheckCircle, color: "text-eternia-success" },
            { label: "Training", value: `${completedModules.length}/7`, icon: BookOpen, color: "text-eternia-warning" },
            { label: "Flagged", value: mySessions.filter((s) => s.is_flagged).length, icon: AlertTriangle, color: "text-destructive" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-card border border-border/50 text-center">
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-lg sm:text-xl font-bold leading-none">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
          {([
            { id: "training" as const, label: "Training", icon: BookOpen },
            { id: "sessions" as const, label: "Sessions", icon: MessageCircle },
            { id: "notes" as const, label: "Notes", icon: FileText },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "training" && (
          <div className="space-y-2">
            {TRAINING_MODULES.map((module) => {
              const isCompleted = completedModules.includes(module.day);
              const isNext = !isCompleted && completedModules.length + 1 === module.day;
              const isLocked = !isCompleted && !isNext;

              return (
                <div
                  key={module.day}
                  className={`p-3 rounded-xl border transition-all ${
                    isLocked ? "opacity-40 bg-muted/20 border-border/30" :
                    isCompleted ? "bg-eternia-success/5 border-eternia-success/20" :
                    "bg-card border-border/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isCompleted ? "bg-eternia-success/20" :
                      isNext ? "bg-primary/10" :
                      "bg-muted"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-eternia-success" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <span className="text-sm font-bold text-primary">{module.day}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">Day {module.day}: {module.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{module.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {module.duration}
                      </p>
                    </div>
                    {isNext && (
                      <Button
                        size="sm"
                        className="gap-1 h-7 text-[11px] px-2.5 shrink-0"
                        onClick={() => setCompletedModules((prev) => [...prev, module.day])}
                      >
                        <Play className="w-3 h-3" />
                        Start
                      </Button>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] text-eternia-success font-medium shrink-0">✓ Done</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : mySessions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No peer sessions yet</p>
                {!isTrainingComplete && (
                  <p className="text-xs mt-1">Complete training to start accepting sessions</p>
                )}
              </div>
            ) : (
              mySessions.map((session: any) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-xl border ${
                    session.is_flagged ? "bg-destructive/5 border-destructive/20" : "bg-card border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{session.student?.username || "Student"}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(session.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        session.is_flagged ? "bg-destructive/10 text-destructive" :
                        session.status === "active" ? "bg-eternia-success/10 text-eternia-success" :
                        session.status === "completed" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {session.is_flagged ? "⚠ Flagged" : session.status}
                      </span>
                      {session.status === "active" && !session.is_flagged && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive h-7 px-1.5"
                          onClick={async () => {
                            await supabase.from("peer_sessions").update({ is_flagged: true }).eq("id", session.id);
                            queryClient.invalidateQueries({ queryKey: ["intern-sessions"] });
                            toast.info("Session flagged for review");
                          }}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Session notes will appear after completing sessions</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InternDashboard;
