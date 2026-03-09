import { useState } from "react";
import {
  BookOpen,
  MessageCircle,
  FileText,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Play,
  Lock,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

type TrainingStatus = "NOT_STARTED" | "IN_PROGRESS" | "ASSESSMENT_PENDING" | "ACTIVE";

const TRAINING_MODULES = [
  { day: 1, title: "Platform Overview", description: "Understanding Eternia's mission and tools", duration: "45 min" },
  { day: 2, title: "Active Listening", description: "Core techniques for empathetic peer support", duration: "60 min" },
  { day: 3, title: "Assessment Quiz", description: "Evaluate your understanding of modules 1-2", duration: "30 min" },
  { day: 4, title: "Crisis Recognition", description: "Identifying and escalating high-risk situations", duration: "60 min" },
  { day: 5, title: "Ethics & Boundaries", description: "Maintaining professional boundaries in peer support", duration: "45 min" },
  { day: 6, title: "Final Assessment", description: "Comprehensive evaluation of all modules", duration: "45 min" },
  { day: 7, title: "Final Interview", description: "Live evaluation with a supervising expert", duration: "30 min" },
];

const InternDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"training" | "sessions" | "notes">("training");
  // For demo purposes, training progress is stored in local state
  const [trainingStatus] = useState<TrainingStatus>("NOT_STARTED");
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Intern Dashboard</h1>
          <p className="text-muted-foreground">
            Complete training to unlock Peer Connect sessions
          </p>
        </div>

        {/* Training Status Banner */}
        {!isTrainingComplete && (
          <div className="p-4 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-eternia-warning shrink-0" />
              <div>
                <p className="font-medium text-sm">Training Required</p>
                <p className="text-xs text-muted-foreground">
                  Complete all 7 training modules to unlock Peer Connect access
                </p>
              </div>
            </div>
            <Progress value={trainingProgress} className="h-2 mt-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedModules.length}/{TRAINING_MODULES.length} modules completed
            </p>
          </div>
        )}

        {isTrainingComplete && (
          <div className="p-4 rounded-xl bg-eternia-success/10 border border-eternia-success/20">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-eternia-success" />
              <div>
                <p className="font-medium text-sm text-eternia-success">Training Complete</p>
                <p className="text-xs text-muted-foreground">
                  You are certified to conduct Peer Connect sessions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Sessions", value: activeSessions.length, icon: MessageCircle, color: "text-primary" },
            { label: "Completed", value: completedSessions.length, icon: CheckCircle, color: "text-eternia-success" },
            { label: "Training", value: `${completedModules.length}/7`, icon: BookOpen, color: "text-eternia-warning" },
            { label: "Flagged", value: mySessions.filter((s) => s.is_flagged).length, icon: AlertTriangle, color: "text-destructive" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {([
            { id: "training", label: "Training", icon: BookOpen },
            { id: "sessions", label: "Peer Sessions", icon: MessageCircle },
            { id: "notes", label: "Notes", icon: FileText },
          ] as const).map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`gap-2 ${activeTab === tab.id ? "bg-primary text-primary-foreground" : ""}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "training" && (
          <div className="space-y-3">
            {TRAINING_MODULES.map((module) => {
              const isCompleted = completedModules.includes(module.day);
              const isNext = !isCompleted && completedModules.length + 1 === module.day;
              const isLocked = !isCompleted && !isNext;

              return (
                <Card key={module.day} className={isLocked ? "opacity-50" : ""}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isCompleted ? "bg-eternia-success/20" :
                          isNext ? "bg-primary/10" :
                          "bg-muted"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-eternia-success" />
                          ) : isLocked ? (
                            <Lock className="w-6 h-6 text-muted-foreground" />
                          ) : (
                            <span className="text-lg font-bold text-primary">{module.day}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">Day {module.day}: {module.title}</p>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {module.duration}
                          </p>
                        </div>
                      </div>
                      {isNext && (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => setCompletedModules((prev) => [...prev, module.day])}
                        >
                          <Play className="w-4 h-4" />
                          Start
                        </Button>
                      )}
                      {isCompleted && (
                        <span className="text-xs text-eternia-success font-medium">✓ Complete</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : mySessions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No peer sessions yet</p>
                  {!isTrainingComplete && (
                    <p className="text-sm mt-1">Complete training to start accepting sessions</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              mySessions.map((session: any) => (
                <Card key={session.id} className={session.is_flagged ? "border-destructive/30" : ""}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Session with {session.student?.username || "Student"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        session.is_flagged ? "bg-destructive/10 text-destructive" :
                        session.status === "active" ? "bg-eternia-success/10 text-eternia-success" :
                        session.status === "completed" ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {session.is_flagged ? "⚠ Flagged" : session.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Session notes will appear here after completing peer sessions</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InternDashboard;
