import { useState } from "react";
import {
  Home, MessageCircle, FileText, User, Clock, CheckCircle,
  AlertTriangle, Loader2, Search, LogOut, Lock,
  Play, Award, BookOpen, ChevronLeft, Shield
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

type TabType = "training" | "sessions" | "notes" | "profile";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface TrainingModule {
  day: number;
  title: string;
  description: string;
  duration: string;
  objectives: string[];
  content: string;
  hasQuiz: boolean;
  quizQuestions: QuizQuestion[];
}

const trainingModules: TrainingModule[] = [
  {
    day: 1, title: "Platform Overview + Assessment", description: "Eternia's mission, tools & intro quiz", duration: "45 min",
    objectives: ["Understand Eternia's mission and peer support role", "Navigate platform features", "Complete intro assessment"],
    content: `Welcome to Eternia's Intern Training.\n\n**Your Role**\nAs a peer support intern, you are the first point of contact for students seeking anonymous support via PeerConnect.\n\n**Platform Features**\n• BlackBox — Anonymous journaling with AI monitoring\n• PeerConnect — Text chat between students and interns\n• SoundTherapy — Audio content for relaxation\n• Quests — Daily wellbeing activities earning ECC\n• Appointments — Professional expert sessions\n\n**Privacy**\nAll data is encrypted. You never see real identities.`,
    hasQuiz: true,
    quizQuestions: [
      { question: "What is the primary purpose of BlackBox?", options: ["Scheduling appointments", "Anonymous journaling with AI monitoring", "Video calling", "Managing credits"], correctIndex: 1 },
      { question: "When should you escalate a session?", options: ["When it's too long", "When you identify high-risk situations", "When bored", "When credits run out"], correctIndex: 1 },
      { question: "What does ECC stand for?", options: ["Electronic Credit Currency", "Eternia Care Credits", "Emergency Contact Credits", "Eternia Credit Currency"], correctIndex: 3 },
    ],
  },
  {
    day: 2, title: "Active Listening", description: "Empathetic communication for text-based support", duration: "60 min",
    objectives: ["Master active listening for text", "Practice reflective responses", "Manage emotional responses"],
    content: `**Reflective Responding**\nMirror back what the student expressed.\nExample: "It sounds like you're feeling isolated."\n\n**Open-Ended Questions**\n✅ "Can you tell me more?"\n❌ "Are you sad?" (closed)\n\n**Validation**\nAcknowledge emotions without judgment.\n\n**Self-Care**\n• Take breaks between sessions\n• Use SoundTherapy\n• Talk to your supervisor about difficult cases`,
    hasQuiz: false, quizQuestions: [],
  },
  {
    day: 3, title: "Mid-Training Assessment", description: "Quiz on Days 1-2 material", duration: "30 min",
    objectives: ["Demonstrate platform knowledge", "Apply active listening concepts", "Identify appropriate responses"],
    content: `This assessment covers Days 1 and 2. You must pass to continue.\n\n**Review:**\n• Platform features & privacy\n• Active listening techniques\n• Reflective responding\n• Emotional validation`,
    hasQuiz: true,
    quizQuestions: [
      { question: "Best response to 'Everything feels pointless'?", options: ["Don't worry!", "Reflect feelings and ask more", "Try exercising", "See a professional"], correctIndex: 1 },
      { question: "Which violates privacy protocols?", options: ["Encrypted notes", "Escalating via SPOC", "Asking for real name", "Summarizing for supervisor"], correctIndex: 2 },
      { question: "Feeling overwhelmed after a session?", options: ["Keep going", "Take a break and discuss with supervisor", "Post on social media", "Ignore it"], correctIndex: 1 },
    ],
  },
  {
    day: 4, title: "Crisis Recognition", description: "Identifying and escalating high-risk situations", duration: "60 min",
    objectives: ["Recognize crisis indicators", "Understand escalation pathway", "Document escalations accurately"],
    content: `**Red Flags for Escalation**\n• Self-harm or suicidal ideation\n• Abuse disclosures\n• Substance abuse\n• Severe panic or dissociation\n• Violence threats\n\n**Escalation Pathway**\n1. Click ⚠ escalation button\n2. Write clear justification\n3. Routes to institution SPOC\n4. SPOC reviews and forwards if needed\n5. Expert intervenes\n\n**Don't:**\n• Promise to fix things\n• Share personal crisis experiences\n• Attempt therapy\n• Disconnect abruptly`,
    hasQuiz: false, quizQuestions: [],
  },
  {
    day: 5, title: "Ethics & Boundaries", description: "Professional boundaries in peer support", duration: "45 min",
    objectives: ["Understand ethical guidelines", "Maintain appropriate boundaries", "Navigate tricky situations"],
    content: `**Core Ethics**\n1. Confidentiality — Never discuss sessions outside platform\n2. Non-Maleficence — Do no harm\n3. Competence — Stay within training\n4. Respect Autonomy — Support decisions\n\n**Boundaries**\n• Never share contact info\n• No personal relationships with students\n• 20-30 min session length\n• No gifts or favors\n• Recuse if you recognize someone\n\n**Dependency**\nIf students seek you specifically, redirect to other resources.`,
    hasQuiz: false, quizQuestions: [],
  },
  {
    day: 6, title: "Final Assessment", description: "Comprehensive evaluation of all modules", duration: "45 min",
    objectives: ["Demonstrate mastery of all topics", "Apply to complex scenarios", "Prove readiness for interview"],
    content: `Final written assessment covering all material.\n\n**Topics:**\n• Platform & privacy\n• Active listening\n• Crisis recognition & escalation\n• Ethics & boundaries\n• Session management`,
    hasQuiz: true,
    quizQuestions: [
      { question: "Student discloses self-harm. Your response?", options: ["Tell them to stop", "Stay calm, validate, escalate immediately", "Ask for details", "End session"], correctIndex: 1 },
      { question: "Student asks for your Instagram. What do you do?", options: ["Share it", "Politely decline and explain why", "Give fake account", "Report student"], correctIndex: 1 },
      { question: "You recognize a student from class. Action?", options: ["Continue normally", "Mention you know them", "Recuse yourself and notify supervisor", "End without explanation"], correctIndex: 2 },
      { question: "You feel triggered during a session. What to do?", options: ["Push through", "Share your experience", "Ensure student safety, take break, talk to supervisor", "End abruptly"], correctIndex: 2 },
    ],
  },
  {
    day: 7, title: "Final Interview", description: "Live evaluation with supervising expert", duration: "30 min",
    objectives: ["Demonstrate live communication skills", "Handle real-time pressure", "Receive feedback and certification"],
    content: `Congratulations on completing all modules! 🎉\n\n**What to Expect**\nA live conversation with a supervising expert who will:\n• Present realistic scenarios\n• Evaluate response quality\n• Assess communication and boundaries\n• Provide feedback\n\n**After Interview**\n• Pass → Status updated to ACTIVE\n• Needs improvement → Specific feedback provided\n\nThis cannot be self-completed. An expert will schedule it.`,
    hasQuiz: false, quizQuestions: [],
  },
];

const MobileInternDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("training");
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const savedProgress: number[] = (profile as any)?.training_progress || [];
  const [completedModules, setCompletedModules] = useState<number[]>(savedProgress);

  const profileProgress = (profile as any)?.training_progress;
  const [lastSynced, setLastSynced] = useState<string>("");
  if (profileProgress && JSON.stringify(profileProgress) !== lastSynced && JSON.stringify(profileProgress) !== JSON.stringify(completedModules)) {
    setCompletedModules(profileProgress);
    setLastSynced(JSON.stringify(profileProgress));
  }

  const [escalationDialog, setEscalationDialog] = useState<{ open: boolean; sessionId?: string }>({ open: false });
  const [escalationReason, setEscalationReason] = useState("");
  const [notesSearch, setNotesSearch] = useState("");

  const trainingStatus = (profile as any)?.training_status || "not_started";
  const isTrainingComplete = trainingStatus === "active" || trainingStatus === "completed";
  const isInterviewPending = trainingStatus === "interview_pending";
  const progress = isTrainingComplete ? 100 : isInterviewPending ? 95 : (completedModules.length / trainingModules.length) * 100;
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
  const currentModule = activeModule !== null ? trainingModules.find(m => m.day_number === activeModule) : null;

  const handleCompleteModule = async (mod: TrainingModule) => {
    if (mod.has_quiz && mod.quiz_questions.length > 0) {
      const allCorrect = mod.quiz_questions.every((q, i) => quizAnswers[i] === q.correctIndex);
      if (!allCorrect) { toast.error("Some answers are incorrect. Try again."); return; }
    }
    const newModules = [...completedModules, mod.day_number];
    setCompletedModules(newModules);
    if (user) {
      const newStatus = newModules.length >= trainingModules.length ? "interview_pending" : "in_progress";
      await supabase.from("profiles").update({ training_progress: newModules, training_status: newStatus }).eq("id", user.id);
    }
    setActiveModule(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    toast.success(`Day ${mod.day_number} completed!`);
  };

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

        {/* Tab bar */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isLocked = lockedTabs.includes(tab.key);
            return (
              <button key={tab.key} onClick={() => {
                if (isLocked) { toast.info("Complete training to unlock"); return; }
                setActiveTab(tab.key);
                setActiveModule(null);
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

        {/* TRAINING — MODULE LIST */}
        {activeTab === "training" && !currentModule && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-eternia-warning/10 border border-eternia-warning/20">
              <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-eternia-warning" />
                <p className="font-medium text-sm">{isTrainingComplete ? "Training Complete! 🎉" : isInterviewPending ? "Interview Pending" : "Training Required"}</p>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{completedModules.length}/{trainingModules.length} done</p>
            </div>

            <div className="space-y-2">
              {trainingModules.map((m) => {
                const done = completedModules.includes(m.day_number);
                const isNext = !done && completedModules.length + 1 === m.day_number;
                const locked = !done && !isNext;
                return (
                  <div key={m.day_number} className={cn("p-3 rounded-2xl border", done ? "bg-eternia-success/5 border-eternia-success/20" : isNext ? "bg-primary/5 border-primary/20" : "bg-card border-border/50 opacity-50")}>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                        done ? "bg-eternia-success/20 text-eternia-success" : isNext ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>{done ? <CheckCircle className="w-4 h-4" /> : locked ? <Lock className="w-3 h-3" /> : m.day_number}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold truncate">Day {m.day_number}: {m.title}</p>
                          {m.has_quiz && <span className="px-1 py-0.5 rounded text-[8px] bg-eternia-warning/10 text-eternia-warning">Quiz</span>}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{m.duration}</p>
                      </div>
                      {done && <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => { setActiveModule(m.day_number); setQuizAnswers({}); setQuizSubmitted(false); }}>Review</Button>}
                      {isNext && m.day_number !== 7 && <Button size="sm" className="h-6 text-[10px] px-2 gap-0.5" onClick={() => { setActiveModule(m.day_number); setQuizAnswers({}); setQuizSubmitted(false); }}><Play className="w-2.5 h-2.5" />Start</Button>}
                      {isNext && m.day_number === 7 && <span className="text-[10px] text-muted-foreground italic">Expert</span>}
                    </div>
                  </div>
                );
              })}
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

        {/* TRAINING — MODULE DETAIL */}
        {activeTab === "training" && currentModule && (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" className="gap-1 text-xs -ml-1" onClick={() => { setActiveModule(null); setQuizAnswers({}); setQuizSubmitted(false); }}>
              <ChevronLeft className="w-4 h-4" />Back
            </Button>

            <div className="p-4 rounded-2xl bg-card border border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">{currentModule.day_number}</div>
                <div>
                  <h2 className="text-base font-bold font-display">Day {currentModule.day_number}: {currentModule.title}</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />{currentModule.duration}
                    {currentModule.has_quiz && <span className="px-1 py-0.5 rounded bg-eternia-warning/10 text-eternia-warning text-[10px]">Quiz</span>}
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/30">
                <h3 className="text-xs font-semibold mb-1.5 flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-primary" />Objectives</h3>
                <ul className="space-y-1">
                  {currentModule.objectives.map((obj, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <CheckCircle className="w-3 h-3 text-primary mt-0.5 shrink-0" />{obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Content */}
              <div className="mb-4">
                {currentModule.content.split("\\n\\n").map((p, i) => (
                  <div key={i} className="mb-3">
                    {p.split("\\n").map((line, j) => {
                      if (line.startsWith("**") && line.endsWith("**")) return <h3 key={j} className="text-sm font-semibold text-foreground mt-3 mb-1">{line.replace(/\*\*/g, "")}</h3>;
                      if (line.startsWith("• ")) return <p key={j} className="text-xs text-muted-foreground ml-3 mb-0.5">• {line.slice(2)}</p>;
                      if (line.startsWith("✅ ") || line.startsWith("❌ ")) return <p key={j} className="text-xs text-muted-foreground ml-3 mb-0.5">{line}</p>;
                      return line.trim() ? <p key={j} className="text-xs text-muted-foreground leading-relaxed">{line}</p> : null;
                    })}
                  </div>
                ))}
              </div>

              {/* Quiz */}
              {currentModule.has_quiz && currentModule.quiz_questions.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5"><Award className="w-4 h-4 text-eternia-warning" />Quiz</h3>
                  <div className="space-y-4">
                    {currentModule.quiz_questions.map((q, qi) => (
                      <div key={qi} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-xs font-medium mb-2">{qi + 1}. {q.question}</p>
                        <div className="space-y-1.5">
                          {q.options.map((opt, oi) => {
                            const selected = quizAnswers[qi] === oi;
                            const isCorrect = oi === q.correctIndex;
                            const show = quizSubmitted;
                            return (
                              <button key={oi}
                                onClick={() => { if (!quizSubmitted) setQuizAnswers(prev => ({ ...prev, [qi]: oi })); }}
                                disabled={quizSubmitted}
                                className={cn("w-full text-left p-2.5 rounded-lg text-xs border transition-all",
                                  show && selected && isCorrect ? "bg-eternia-success/10 border-eternia-success/30 text-eternia-success"
                                  : show && selected && !isCorrect ? "bg-destructive/10 border-destructive/30 text-destructive"
                                  : show && isCorrect ? "bg-eternia-success/5 border-eternia-success/20"
                                  : selected ? "bg-primary/10 border-primary/30"
                                  : "bg-card border-border/50 text-muted-foreground"
                                )}>
                                <span className="font-medium mr-1.5">{String.fromCharCode(65 + oi)}.</span>{opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
                {completedModules.includes(currentModule.day_number) ? (
                  <span className="text-xs text-eternia-success flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Completed</span>
                ) : currentModule.day_number === 7 ? (
                  <span className="text-xs text-muted-foreground italic">Requires live interview</span>
                ) : currentModule.has_quiz && !quizSubmitted ? (
                  <Button size="sm" onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < currentModule.quiz_questions.length} className="text-xs h-8">Submit Quiz</Button>
                ) : currentModule.has_quiz && quizSubmitted ? (
                  currentModule.quiz_questions.every((q, i) => quizAnswers[i] === q.correctIndex) ? (
                    <Button size="sm" onClick={() => handleCompleteModule(currentModule)} className="text-xs h-8 gap-1"><CheckCircle className="w-3 h-3" />Complete</Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }} className="text-xs h-8">Retry</Button>
                  )
                ) : (
                  <Button size="sm" onClick={() => handleCompleteModule(currentModule)} className="text-xs h-8 gap-1"><CheckCircle className="w-3 h-3" />Complete</Button>
                )}
              </div>
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
                <div><p className="text-[10px] text-muted-foreground">Training</p><p className={cn("text-sm font-medium", isTrainingComplete ? "text-eternia-success" : "text-eternia-warning")}>{isTrainingComplete ? "Complete" : isInterviewPending ? "Interview" : `${completedModules.length}/7`}</p></div>
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
