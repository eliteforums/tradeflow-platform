import { useState, useEffect } from "react";
import { Award, Zap, Music, Play, CheckCircle, ChevronRight, Trophy, Flame, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuests } from "@/hooks/useQuests";
import { useAuth } from "@/contexts/AuthContext";
import { useEccEarn } from "@/hooks/useEccEarn";
import { motion, AnimatePresence } from "framer-motion";

const tabs = [
  { id: "quest", label: "Quests", icon: Award, gradient: "from-amber-500 to-orange-500" },
  { id: "wreck", label: "Wreck", icon: Zap, gradient: "from-red-500 to-pink-500" },
  { id: "tibetan", label: "Bowl", icon: Music, gradient: "from-violet-500 to-purple-500" },
] as const;

const MobileSelfHelp = () => {
  const [activeTab, setActiveTab] = useState("quest");
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "idle">("idle");
  const [breathCount, setBreathCount] = useState(0);
  const [wreckClicks, setWreckClicks] = useState(0);

  const { earnFromActivity, canEarn } = useEccEarn();
  const { profile } = useAuth();
  const { quests, isLoading, completeQuest, isCompleting, getQuestStatus, completedToday, totalXpToday } = useQuests();

  const achievements = [
    { id: 1, name: "First Quest", icon: Trophy, unlocked: completedToday >= 1 },
    { id: 2, name: "7-Day Streak", icon: Flame, unlocked: (profile?.streak_days || 0) >= 7 },
    { id: 3, name: "Mindful Master", icon: Target, unlocked: completedToday >= 4 },
    { id: 4, name: "Wellness Warrior", icon: Award, unlocked: (profile?.total_sessions || 0) >= 10 },
  ];

  useEffect(() => {
    if (breathPhase === "idle") return;
    let timeout: ReturnType<typeof setTimeout>;
    if (breathPhase === "inhale") timeout = setTimeout(() => setBreathPhase("hold"), 4000);
    else if (breathPhase === "hold") timeout = setTimeout(() => setBreathPhase("exhale"), 7000);
    else if (breathPhase === "exhale") {
      timeout = setTimeout(() => {
        setBreathCount((prev) => prev + 1);
        if (breathCount < 2) setBreathPhase("inhale");
        else { setBreathPhase("idle"); setBreathCount(0); if (canEarn) earnFromActivity({ amount: 1, activity: "Tibetan Bowl breathing exercise" }); }
      }, 8000);
    }
    return () => clearTimeout(timeout);
  }, [breathPhase, breathCount, canEarn, earnFromActivity]);

  const handleWreckClick = () => {
    setWreckClicks((prev) => prev + 1);
    if (wreckClicks >= 29) { setWreckClicks(0); if (canEarn) earnFromActivity({ amount: 1, activity: "Wreck the Buddy completion" }); }
  };

  if (isLoading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <div>
          <h1 className="text-xl font-bold font-display">Self-Help Tools</h1>
          <p className="text-sm text-muted-foreground">Daily micro-wellbeing tools</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Flame, value: profile?.streak_days || 0, label: "Streak", color: "text-orange-500" },
            { icon: Award, value: totalXpToday, label: "XP", color: "text-primary" },
            { icon: CheckCircle, value: completedToday, label: "Done", color: "text-emerald-500" },
            { icon: Trophy, value: `${achievements.filter((a) => a.unlocked).length}/${achievements.length}`, label: "Badges", color: "text-amber-500" },
          ].map((s, i) => (
            <div key={i} className="p-3 rounded-2xl bg-card border border-border/50 text-center">
              <s.icon className={`w-4 h-4 ${s.color} mx-auto mb-1`} />
              <p className="text-base font-bold leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-muted/30 p-1.5 rounded-2xl">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id ? `bg-gradient-to-br ${tab.gradient} text-white shadow-sm` : "text-muted-foreground"
              }`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "quest" && (
            <motion.div key="quest" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
              {/* Progress */}
              <div className="p-4 rounded-2xl bg-card border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold font-display text-sm">Today's Progress</h3>
                  <span className="text-xs text-muted-foreground">{completedToday}/{quests.length}</span>
                </div>
                <Progress value={quests.length > 0 ? (completedToday / quests.length) * 100 : 0} className="h-2 mb-1.5" />
                <p className="text-xs text-muted-foreground">{completedToday === quests.length ? "🎉 All done!" : "Complete all quests for bonus XP!"}</p>
              </div>

              {/* Quest List */}
              {quests.map((quest) => {
                const done = getQuestStatus(quest.id);
                return (
                  <div key={quest.id} className={`p-4 rounded-2xl border ${done ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border/50"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-emerald-500/15" : "bg-gradient-to-br from-amber-500 to-orange-500"}`}>
                        {done ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Award className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-sm truncate">{quest.title}</h4>
                          <span className="text-xs font-medium text-primary shrink-0">+{quest.xp_reward} XP</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{quest.description}</p>
                      </div>
                      {!done && (
                        <Button size="sm" className="h-9 px-3 text-xs shrink-0" onClick={() => completeQuest(quest)} disabled={isCompleting}>
                          {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Do it<ChevronRight className="w-3.5 h-3.5 ml-1" /></>}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Achievements */}
              <div>
                <h3 className="font-semibold font-display mb-2 text-sm">Achievements</h3>
                <div className="grid grid-cols-4 gap-2">
                  {achievements.map((a) => (
                    <div key={a.id} className={`p-3 rounded-2xl text-center border ${a.unlocked ? "bg-card border-primary/30" : "bg-muted/20 border-border/50 opacity-40"}`}>
                      <a.icon className={`w-5 h-5 mx-auto mb-1 ${a.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-[10px] font-medium leading-tight">{a.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "wreck" && (
            <motion.div key="wreck" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <div className="rounded-2xl bg-card border border-border/50 p-5 text-center">
                <div
                  className="w-full aspect-square rounded-2xl bg-gradient-to-br from-red-500/10 to-pink-500/10 flex items-center justify-center mb-5 active:scale-95 transition-transform cursor-pointer select-none"
                  onClick={handleWreckClick}
                >
                  <div className="text-center">
                    <div className="text-7xl mb-3">🥊</div>
                    <p className="text-2xl font-bold font-display text-primary">{wreckClicks}/30</p>
                  </div>
                </div>
                <h2 className="text-base font-bold font-display mb-1">Wreck the Buddy</h2>
                <p className="text-sm text-muted-foreground mb-4">Tap to release stress. 30 hits = 1 ECC!</p>
                <Progress value={(wreckClicks / 30) * 100} className="h-2 mb-3" />
                <Button className="bg-gradient-to-br from-red-500 to-pink-500 text-white h-12 w-full text-sm" onClick={handleWreckClick}>
                  <Zap className="w-5 h-5 mr-2" />Tap! ({30 - wreckClicks} left)
                </Button>
                {wreckClicks >= 30 && (
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-emerald-500 font-semibold text-sm">
                    🎉 Great job releasing that energy!
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "tibetan" && (
            <motion.div key="tibetan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
              <div className="rounded-2xl bg-card border border-border/50 p-5 text-center">
                <div className="w-full aspect-square rounded-full flex items-center justify-center mb-5 mx-auto"
                  style={{
                    maxWidth: "75vw",
                    background: breathPhase !== "idle"
                      ? "radial-gradient(circle, hsl(var(--eternia-lavender) / 0.3), hsl(var(--eternia-teal) / 0.1))"
                      : "radial-gradient(circle, hsl(var(--muted) / 0.3), transparent)",
                    transform: breathPhase === "inhale" ? "scale(1.1)" : breathPhase === "exhale" ? "scale(0.9)" : "scale(1)",
                    transition: breathPhase === "inhale" ? "transform 4s ease-in-out" : breathPhase === "exhale" ? "transform 8s ease-in-out" : "transform 0.3s",
                  }}>
                  <div className="text-6xl">🔔</div>
                </div>

                <h2 className="text-base font-bold font-display mb-1">Tibetan Bowl</h2>

                <AnimatePresence mode="wait">
                  {breathPhase === "idle" ? (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-sm text-muted-foreground mb-4">4-7-8 breathing with Tibetan singing bowls.</p>
                      <Button className="bg-gradient-to-br from-violet-500 to-purple-500 text-white h-12 w-full text-sm" onClick={() => { setBreathCount(0); setBreathPhase("inhale"); }}>
                        <Play className="w-5 h-5 mr-2" />Begin Breathing
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">~2 minutes</p>
                    </motion.div>
                  ) : (
                    <motion.div key={breathPhase} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="py-3">
                      <p className="text-2xl font-bold font-display text-primary mb-2">
                        {breathPhase === "inhale" && "Breathe In..."}
                        {breathPhase === "hold" && "Hold..."}
                        {breathPhase === "exhale" && "Breathe Out..."}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {breathPhase === "inhale" && "4 seconds"}{breathPhase === "hold" && "7 seconds"}{breathPhase === "exhale" && "8 seconds"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">Cycle {breathCount + 1} of 3</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default MobileSelfHelp;
