import { useState } from "react";
import {
  Home, MessageCircle, FileText, User, Clock, CheckCircle,
  AlertTriangle, Loader2, Search, Shield, LogOut, Lock,
  Play, Award, BookOpen, ChevronRight, ChevronLeft, X
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

type TabType = "training" | "sessions" | "notes" | "profile";

const TABS: { key: TabType; label: string; icon: typeof Home }[] = [
  { key: "training", label: "Training", icon: BookOpen },
  { key: "sessions", label: "Peer Sessions", icon: MessageCircle },
  { key: "notes", label: "Notes", icon: FileText },
  { key: "profile", label: "Profile", icon: User },
];

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

const TRAINING_MODULES: TrainingModule[] = [
  {
    day: 1,
    title: "Platform Overview + Intro Assessment",
    description: "Understanding Eternia's mission, platform navigation, and peer support fundamentals",
    duration: "45 min",
    objectives: [
      "Understand Eternia's mission and the role of peer support in student wellbeing",
      "Navigate all platform features: BlackBox, PeerConnect, SoundTherapy, Quests",
      "Learn the ECC credit system and how sessions are managed",
    ],
    content: `Welcome to Eternia's Intern Training Program. As a peer support intern, you play a critical role in the wellbeing ecosystem of your institution.

**What is Eternia?**
Eternia is a privacy-first student wellbeing platform that provides anonymous mental health support through peer counseling, professional therapy sessions, and self-help tools. Every interaction is encrypted and anonymized.

**Your Role as an Intern**
You will serve as the first point of contact for students seeking peer support. You'll conduct text-based peer sessions via PeerConnect, identify when situations require escalation, and maintain session notes for continuity of care.

**Platform Features Overview**
• BlackBox — Anonymous journaling with optional AI sentiment monitoring
• PeerConnect — Queue-based text chat between students and trained interns
• SoundTherapy — Curated audio content for relaxation and mindfulness
• Quests — Daily wellbeing activities that earn ECC credits
• Appointments — Scheduled sessions with professional experts (therapists/psychologists)

**ECC Credit System**
Students earn credits (ECC) through completing quests and daily activities. Credits are spent on booking professional sessions. The Stability Pool ensures credits remain accessible across the institution.

**Privacy & Anonymity**
All student data is encrypted. You will never see a student's real identity — only their anonymous username. Session logs are encrypted and accessible only for clinical review through proper escalation channels.`,
    hasQuiz: true,
    quizQuestions: [
      {
        question: "What is the primary purpose of the BlackBox feature?",
        options: ["Scheduling appointments", "Anonymous journaling with AI monitoring", "Video calling with therapists", "Managing ECC credits"],
        correctIndex: 1,
      },
      {
        question: "As an intern, when should you escalate a session?",
        options: ["When the student asks personal questions", "When you identify high-risk situations like self-harm ideation", "When the session lasts more than 30 minutes", "When the student runs out of credits"],
        correctIndex: 1,
      },
      {
        question: "What does ECC stand for in the Eternia ecosystem?",
        options: ["Electronic Credit Currency", "Eternia Care Credits", "Emergency Contact Credits", "Eternia Credit Currency"],
        correctIndex: 3,
      },
    ],
  },
  {
    day: 2,
    title: "Active Listening & Empathetic Communication",
    description: "Core techniques for providing meaningful peer support through text-based conversations",
    duration: "60 min",
    objectives: [
      "Master active listening techniques adapted for text-based communication",
      "Practice reflective responses and empathetic validation",
      "Learn to manage your own emotional responses during difficult sessions",
    ],
    content: `Active listening is the cornerstone of effective peer support. In a text-based environment, this requires adapting traditional techniques to written communication.

**Core Active Listening Techniques**

1. **Reflective Responding** — Mirror back what the student has expressed to show understanding.
   Example: Student says "I feel like nobody understands me." 
   Response: "It sounds like you're feeling isolated and misunderstood. That must be really difficult."

2. **Open-Ended Questions** — Encourage deeper sharing without leading the conversation.
   ✅ "Can you tell me more about what's been on your mind?"
   ❌ "Are you feeling sad?" (closed/leading)

3. **Validation** — Acknowledge emotions without judgment.
   "It's completely understandable to feel overwhelmed during exam season. Your feelings are valid."

4. **Summarizing** — Periodically recap the conversation to ensure accuracy.
   "So what I'm hearing is that the pressure from coursework combined with family expectations has been weighing on you. Is that right?"

**Managing Your Own Emotions**
Peer support can be emotionally taxing. Practice:
• Taking brief pauses between sessions
• Using the SoundTherapy feature for self-care
• Discussing difficult cases with your supervisor (without sharing identifiable info)
• Recognizing when you need to step back

**Text-Based Communication Tips**
• Respond promptly but thoughtfully — don't rush
• Use warm, conversational language
• Avoid clinical jargon
• Use emojis sparingly to convey warmth when appropriate
• Never copy-paste generic responses`,
    hasQuiz: false,
    quizQuestions: [],
  },
  {
    day: 3,
    title: "Mid-Training Assessment",
    description: "Evaluate your understanding of platform tools, active listening, and peer support principles",
    duration: "30 min",
    objectives: [
      "Demonstrate understanding of Eternia's platform and privacy protocols",
      "Apply active listening concepts to scenario-based questions",
      "Identify appropriate responses in peer support contexts",
    ],
    content: `This assessment covers everything from Days 1 and 2. You must pass this assessment to continue to the advanced modules.

**Review Topics:**
• Platform features and navigation
• ECC credit system
• Privacy and anonymity protocols
• Active listening techniques
• Reflective responding
• Open-ended questioning
• Emotional validation
• Managing personal emotional responses

Take your time with each question. You need to answer all questions correctly to proceed.`,
    hasQuiz: true,
    quizQuestions: [
      {
        question: "A student says: 'Everything feels pointless.' What is the best reflective response?",
        options: [
          "Don't worry, things will get better!",
          "It sounds like you're feeling a deep sense of hopelessness right now. Can you tell me more about what's been going on?",
          "Have you tried exercising? It helps with mood.",
          "You should talk to a professional about this.",
        ],
        correctIndex: 1,
      },
      {
        question: "Which of the following violates Eternia's privacy protocols?",
        options: [
          "Using encrypted session notes",
          "Escalating through the SPOC channel",
          "Asking a student for their real name or phone number",
          "Summarizing session themes for supervisor review",
        ],
        correctIndex: 2,
      },
      {
        question: "What should you do if you feel emotionally overwhelmed after a session?",
        options: [
          "Continue taking sessions to stay productive",
          "Take a break, use self-care tools, and discuss with your supervisor",
          "Share the experience on social media for support",
          "Ignore the feeling and move on",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    day: 4,
    title: "Crisis Recognition & Escalation",
    description: "Identifying high-risk situations and using proper escalation protocols",
    duration: "60 min",
    objectives: [
      "Recognize verbal and behavioral indicators of crisis situations",
      "Understand the escalation pathway: Intern → SPOC → Expert",
      "Practice documenting escalation justifications accurately",
    ],
    content: `As a peer support intern, you are NOT a therapist. Your role is to provide empathetic listening and to escalate when situations exceed your training level.

**Red Flags Requiring Immediate Escalation**
• Expressions of self-harm or suicidal ideation ("I want to end it", "There's no point in living")
• Descriptions of abuse (physical, sexual, emotional)
• Substance abuse disclosures
• Severe panic attacks or dissociative episodes
• Threats of violence toward self or others

**The Escalation Pathway**
1. **During Session**: Click the escalation button (⚠) on the session interface
2. **Document**: Write a clear, factual justification — what the student said, your concern level
3. **Route**: The escalation goes to the institution's SPOC (Single Point of Contact)
4. **SPOC Review**: The SPOC assesses and either handles it or forwards to a professional expert
5. **Expert Intervention**: A therapist/psychologist takes over if needed

**What NOT to Do in a Crisis**
• Don't promise to "fix" the situation
• Don't share personal experiences of similar crises
• Don't attempt to provide therapy or diagnose
• Don't disconnect abruptly — stay calm and supportive while escalating
• Don't share crisis details with other interns

**Documenting Escalations**
Your justification should include:
• What the student expressed (quote if possible)
• Your assessment of risk level
• Any immediate safety concerns
• The student's current emotional state`,
    hasQuiz: false,
    quizQuestions: [],
  },
  {
    day: 5,
    title: "Ethics, Boundaries & Confidentiality",
    description: "Maintaining professional boundaries while providing compassionate peer support",
    duration: "45 min",
    objectives: [
      "Understand ethical guidelines specific to peer support roles",
      "Maintain appropriate boundaries in the intern-student relationship",
      "Navigate tricky situations: dual relationships, personal disclosures, and dependency",
    ],
    content: `Ethics and boundaries are fundamental to safe, effective peer support. As an intern, you operate within a specific scope — understanding this protects both you and the students you serve.

**Core Ethical Principles**
1. **Confidentiality** — Never discuss session content outside the platform. All information shared by students is strictly confidential, except in cases requiring escalation.
2. **Non-Maleficence** — Do no harm. If you're unsure whether something you're about to say could be harmful, err on the side of caution.
3. **Competence** — Stay within your training. You are a peer listener, not a therapist.
4. **Respect for Autonomy** — Support the student's right to make their own decisions (unless safety is at risk).

**Boundary Management**
• Never share personal contact information (phone, social media, email)
• Don't form personal relationships with students you've supported
• Maintain consistent session lengths (20-30 minutes recommended)
• Don't accept gifts or favors from students
• Avoid dual relationships — if you recognize a student, recuse yourself

**Handling Dependency**
If a student consistently seeks you specifically:
• Gently remind them that the platform has multiple trained peers available
• Encourage them to explore self-help tools (Quests, SoundTherapy)
• If appropriate, suggest scheduling with a professional expert
• Document the pattern in session notes for supervisor awareness

**Self-Disclosure**
Limited, purposeful self-disclosure can build rapport, but:
• Never share details that could identify you
• Keep disclosures brief and redirect focus to the student
• Don't share current personal struggles during sessions`,
    hasQuiz: false,
    quizQuestions: [],
  },
  {
    day: 6,
    title: "Comprehensive Final Assessment",
    description: "Full evaluation covering all training modules — crisis response, ethics, communication",
    duration: "45 min",
    objectives: [
      "Demonstrate mastery of all training topics from Days 1-5",
      "Apply knowledge to complex, multi-layered scenarios",
      "Prove readiness for the live interview on Day 7",
    ],
    content: `This is your final written assessment. It covers all material from the training program. You must pass to advance to the Day 7 live interview with a supervising expert.

**Topics Covered:**
• Platform navigation and features
• Active listening and empathetic communication
• Crisis recognition and escalation protocols
• Ethics, boundaries, and confidentiality
• Session management and documentation

Take your time. Read each scenario carefully before answering.`,
    hasQuiz: true,
    quizQuestions: [
      {
        question: "A student tells you they've been cutting themselves. What is your immediate response?",
        options: [
          "Tell them to stop and suggest they exercise instead",
          "Stay calm, validate their feelings, and initiate the escalation protocol immediately",
          "Ask them to describe the cutting in detail for documentation",
          "End the session and report to your friends",
        ],
        correctIndex: 1,
      },
      {
        question: "A student you've been chatting with asks for your Instagram handle. What do you do?",
        options: [
          "Share it — building rapport is important",
          "Politely decline, explain that maintaining anonymity protects both of you, and redirect to the session",
          "Give them a fake account to stay connected",
          "Report the student for inappropriate behavior",
        ],
        correctIndex: 1,
      },
      {
        question: "You recognize a student's writing style as someone from your class. What should you do?",
        options: [
          "Continue the session normally since they don't know it's you",
          "Mention that you think you know them to build trust",
          "Recuse yourself from the session and notify your supervisor about the dual relationship",
          "End the session without explanation",
        ],
        correctIndex: 2,
      },
      {
        question: "During a session, you feel emotionally triggered by the student's story. What is the appropriate action?",
        options: [
          "Push through — the student needs you",
          "Share your own similar experience to show empathy",
          "Acknowledge your limits, ensure the student is safe, and take a break. Discuss with your supervisor.",
          "Abruptly end the session",
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    day: 7,
    title: "Final Interview",
    description: "Live evaluation with a supervising expert — demonstrates readiness for active duty",
    duration: "30 min",
    objectives: [
      "Demonstrate communication skills in a live scenario with a supervising expert",
      "Show ability to handle real-time pressure and think on your feet",
      "Receive feedback and final certification status",
    ],
    content: `Congratulations on completing all written modules and assessments! 🎉

**What to Expect**
The Day 7 interview is a live, real-time conversation with a supervising expert (therapist or psychologist). They will:
• Present you with realistic peer support scenarios
• Evaluate your response quality, empathy, and escalation judgment
• Assess your communication style and boundary awareness
• Provide constructive feedback

**How to Prepare**
• Review all module content from Days 1-6
• Practice your reflective responding skills
• Be familiar with the escalation pathway
• Know the ethical guidelines by heart

**After the Interview**
• If you pass: Your status will be updated to **ACTIVE** and you'll be able to accept peer sessions
• If improvements are needed: You'll receive specific feedback and can retake after additional preparation

This interview cannot be self-completed. An expert will schedule and conduct it through the platform.`,
    hasQuiz: false,
    quizQuestions: [],
  },
];

const InternDashboardContent = () => {
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
  const [notesFilterInstitution, setNotesFilterInstitution] = useState<string>("all");

  const trainingStatus = (profile as any)?.training_status || "not_started";
  const isTrainingComplete = trainingStatus === "active" || trainingStatus === "completed";
  const isInterviewPending = trainingStatus === "interview_pending";
  const trainingProgress = isTrainingComplete ? 100 : isInterviewPending ? 95 : (completedModules.length / TRAINING_MODULES.length) * 100;
  const lockedTabs: TabType[] = isTrainingComplete ? [] : ["sessions", "notes"];

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

  const submitEscalation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const session = mySessions.find(s => s.id === escalationDialog.sessionId);
      let spocId = user.id;
      if (session?.student?.institution_id) {
        const { data: spocs } = await supabase
          .from("profiles").select("id")
          .eq("institution_id", session.student.institution_id)
          .eq("role", "spoc").limit(1);
        if (spocs && spocs.length > 0) spocId = spocs[0].id;
      }
      const { error } = await supabase.from("escalation_requests").insert({
        spoc_id: spocId, justification_encrypted: escalationReason,
        session_id: escalationDialog.sessionId || null, entry_id: null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Escalation submitted"); setEscalationDialog({ open: false }); setEscalationReason(""); },
    onError: (e) => toast.error(e.message),
  });

  const activeSessions = mySessions.filter((s) => s.status === "active");
  const completedSessions = mySessions.filter((s) => s.status === "completed");

  const currentModule = activeModule !== null ? TRAINING_MODULES.find(m => m.day === activeModule) : null;

  const handleCompleteModule = async (mod: TrainingModule) => {
    if (mod.hasQuiz && mod.quizQuestions.length > 0) {
      const allCorrect = mod.quizQuestions.every((q, i) => quizAnswers[i] === q.correctIndex);
      if (!allCorrect) {
        toast.error("Some answers are incorrect. Please review and try again.");
        return;
      }
    }
    const newModules = [...completedModules, mod.day];
    setCompletedModules(newModules);
    if (user) {
      const newStatus = newModules.length >= TRAINING_MODULES.length ? "interview_pending" : "in_progress";
      await supabase.from("profiles").update({ training_progress: newModules, training_status: newStatus }).eq("id", user.id);
    }
    setActiveModule(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    toast.success(`Day ${mod.day} completed!`);
  };

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

        {/* Tab Bar */}
        <div className="flex gap-1 bg-muted/30 p-1 rounded-xl">
          {TABS.map((tab) => {
            const isLocked = lockedTabs.includes(tab.key);
            return (
              <button
                key={tab.key}
                onClick={() => {
                  if (isLocked) { toast.info("Complete training to unlock this tab"); return; }
                  setActiveTab(tab.key);
                  setActiveModule(null);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center",
                  activeTab === tab.key ? "bg-primary text-primary-foreground shadow-sm"
                    : isLocked ? "text-muted-foreground/40 cursor-not-allowed"
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
        {activeTab === "training" && !currentModule && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-eternia-warning/10 border border-eternia-warning/20">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-eternia-warning" />
                <p className="font-medium text-sm">
                  {isTrainingComplete ? "Training Complete! 🎉" : isInterviewPending ? "Interview Pending — Awaiting expert evaluation" : "Training Required — Complete all 7 modules"}
                </p>
              </div>
              <Progress value={trainingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">{completedModules.length}/{TRAINING_MODULES.length} completed</p>
            </div>

            <div className="space-y-2">
              {TRAINING_MODULES.map((mod) => {
                const done = completedModules.includes(mod.day);
                const isNext = !done && completedModules.length + 1 === mod.day;
                const locked = !done && !isNext;
                const isDay7 = mod.day === 7;
                return (
                  <div key={mod.day} className={cn(
                    "p-4 rounded-xl border transition-all",
                    done ? "bg-eternia-success/5 border-eternia-success/20"
                      : isNext ? "bg-primary/5 border-primary/20"
                      : "bg-card border-border/50 opacity-50"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold",
                        done ? "bg-eternia-success/20 text-eternia-success" : isNext ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {done ? <CheckCircle className="w-5 h-5" /> : locked ? <Lock className="w-4 h-4" /> : mod.day}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold">Day {mod.day}: {mod.title}</p>
                          {mod.hasQuiz && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-eternia-warning/10 text-eternia-warning">Quiz</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{mod.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{mod.duration}</span>
                          <span>{mod.objectives.length} objectives</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {done ? (
                          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => { setActiveModule(mod.day); setQuizAnswers({}); setQuizSubmitted(false); }}>
                            Review <ChevronRight className="w-3 h-3" />
                          </Button>
                        ) : isNext && !isDay7 ? (
                          <Button size="sm" className="gap-1 text-xs" onClick={() => { setActiveModule(mod.day); setQuizAnswers({}); setQuizSubmitted(false); }}>
                            <Play className="w-3 h-3" />Start
                          </Button>
                        ) : isNext && isDay7 ? (
                          <span className="text-xs text-muted-foreground italic">Expert scheduled</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
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

        {/* =================== MODULE DETAIL VIEW =================== */}
        {activeTab === "training" && currentModule && (
          <div className="space-y-6">
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => { setActiveModule(null); setQuizAnswers({}); setQuizSubmitted(false); }}>
              <ChevronLeft className="w-4 h-4" />Back to modules
            </Button>

            <div className="p-6 rounded-xl bg-card border border-border/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                  {currentModule.day}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display mb-1">Day {currentModule.day}: {currentModule.title}</h2>
                  <p className="text-sm text-muted-foreground">{currentModule.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{currentModule.duration}</span>
                    {currentModule.hasQuiz && <span className="px-1.5 py-0.5 rounded bg-eternia-warning/10 text-eternia-warning font-medium">Includes Quiz</span>}
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div className="mb-6 p-4 rounded-lg bg-muted/30 border border-border/30">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Learning Objectives</h3>
                <ul className="space-y-1.5">
                  {currentModule.objectives.map((obj, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Content */}
              <div className="prose prose-sm prose-invert max-w-none mb-6">
                {currentModule.content.split("\n\n").map((paragraph, i) => (
                  <div key={i} className="mb-4">
                    {paragraph.split("\n").map((line, j) => {
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return <h3 key={j} className="text-base font-semibold text-foreground mt-4 mb-2">{line.replace(/\*\*/g, "")}</h3>;
                      }
                      if (line.startsWith("• ")) {
                        return <p key={j} className="text-sm text-muted-foreground ml-4 mb-1">• {line.slice(2)}</p>;
                      }
                      if (line.startsWith("✅ ") || line.startsWith("❌ ")) {
                        return <p key={j} className="text-sm text-muted-foreground ml-4 mb-1">{line}</p>;
                      }
                      if (line.match(/^\d+\. \*\*/)) {
                        const parts = line.match(/^(\d+\. \*\*)(.+?)(\*\*)(.*)/);
                        if (parts) return <p key={j} className="text-sm text-foreground mb-1"><span className="font-semibold">{parts[1].replace("**","")}{parts[2]}</span>{parts[4]}</p>;
                      }
                      return line.trim() ? <p key={j} className="text-sm text-muted-foreground leading-relaxed">{line}</p> : null;
                    })}
                  </div>
                ))}
              </div>

              {/* Quiz Section */}
              {currentModule.hasQuiz && currentModule.quizQuestions.length > 0 && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-eternia-warning" />Assessment Quiz
                  </h3>
                  <div className="space-y-6">
                    {currentModule.quizQuestions.map((q, qi) => (
                      <div key={qi} className="p-4 rounded-lg bg-muted/20 border border-border/30">
                        <p className="text-sm font-medium mb-3">{qi + 1}. {q.question}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => {
                            const selected = quizAnswers[qi] === oi;
                            const isCorrect = oi === q.correctIndex;
                            const showResult = quizSubmitted;
                            return (
                              <button
                                key={oi}
                                onClick={() => { if (!quizSubmitted) setQuizAnswers(prev => ({ ...prev, [qi]: oi })); }}
                                className={cn(
                                  "w-full text-left p-3 rounded-lg text-sm transition-all border",
                                  showResult && selected && isCorrect ? "bg-eternia-success/10 border-eternia-success/30 text-eternia-success"
                                    : showResult && selected && !isCorrect ? "bg-destructive/10 border-destructive/30 text-destructive"
                                    : showResult && isCorrect ? "bg-eternia-success/5 border-eternia-success/20"
                                    : selected ? "bg-primary/10 border-primary/30 text-foreground"
                                    : "bg-card border-border/50 text-muted-foreground hover:bg-muted/50"
                                )}
                                disabled={quizSubmitted}
                              >
                                <span className="font-medium mr-2">{String.fromCharCode(65 + oi)}.</span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                {completedModules.includes(currentModule.day) ? (
                  <span className="text-sm text-eternia-success flex items-center gap-1"><CheckCircle className="w-4 h-4" />Completed</span>
                ) : currentModule.day === 7 ? (
                  <span className="text-sm text-muted-foreground italic">This module requires a live interview with an expert</span>
                ) : currentModule.hasQuiz && !quizSubmitted ? (
                  <Button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(quizAnswers).length < currentModule.quizQuestions.length}
                  >
                    Submit Quiz
                  </Button>
                ) : currentModule.hasQuiz && quizSubmitted ? (
                  <>
                    {currentModule.quizQuestions.every((q, i) => quizAnswers[i] === q.correctIndex) ? (
                      <Button onClick={() => handleCompleteModule(currentModule)} className="gap-1">
                        <CheckCircle className="w-4 h-4" />Complete Module
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}>
                        Retry Quiz
                      </Button>
                    )}
                  </>
                ) : (
                  <Button onClick={() => handleCompleteModule(currentModule)} className="gap-1">
                    <CheckCircle className="w-4 h-4" />Complete Module
                  </Button>
                )}
              </div>
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
                      <div className="flex gap-2 mt-2">
                        {session.is_flagged && <span className="px-2 py-0.5 rounded-full text-[10px] bg-destructive/10 text-destructive">Flagged</span>}
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-eternia-success/10 text-eternia-success">Completed</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* =================== PROFILE TAB =================== */}
        {activeTab === "profile" && (
          <div className="space-y-4 max-w-md">
            <div className="p-6 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-eternia flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-background" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{profile?.username}</h2>
                  <p className="text-sm text-muted-foreground capitalize">{profile?.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">CRR Verification</p>
                  {profile?.is_verified ? (
                    <span className="text-sm font-medium text-eternia-success flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Verified</span>
                  ) : (
                    <span className="text-sm font-medium text-eternia-warning flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Pending</span>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Training</p>
                  <p className={cn("text-sm font-medium", isTrainingComplete ? "text-eternia-success" : "text-eternia-warning")}>
                    {isTrainingComplete ? "Complete" : isInterviewPending ? "Interview Pending" : `${completedModules.length}/7`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sessions</p>
                  <p className="text-sm font-medium">{completedSessions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Joined</p>
                  <p className="text-sm font-medium">{profile?.created_at ? format(new Date(profile.created_at), "MMM d, yyyy") : "—"}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full justify-start gap-2 h-11 text-sm text-destructive" onClick={signOut}>
              <LogOut className="w-4 h-4" />Logout
            </Button>
          </div>
        )}
      </div>

      {/* Escalation Dialog */}
      <Dialog open={escalationDialog.open} onOpenChange={(o) => setEscalationDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />Submit Escalation</DialogTitle>
            <DialogDescription>Describe why this session needs to be escalated to a SPOC or expert.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Describe the situation..." value={escalationReason} onChange={(e) => setEscalationReason(e.target.value)} className="min-h-[100px]" />
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

export default InternDashboardContent;
