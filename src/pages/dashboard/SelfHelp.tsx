import { useState, useEffect } from "react";
import { useEccEarn } from "@/hooks/useEccEarn";
import {
  Award,
  Zap,
  Music,
  Play,
  CheckCircle,
  ChevronRight,
  Trophy,
  Flame,
  Target,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuests } from "@/hooks/useQuests";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import WreckBuddy3D from "@/components/selfhelp/WreckBuddy3D";
import TibetanBowl3D from "@/components/selfhelp/TibetanBowl3D";
import QuestCard3D from "@/components/selfhelp/QuestCard3D";

const tabs = [
  { id: "quest", label: "Quests", icon: Award, gradient: "from-amber-500 to-orange-500" },
  { id: "wreck", label: "Wreck", icon: Zap, gradient: "from-red-500 to-pink-500" },
  { id: "tibetan", label: "Bowl", icon: Music, gradient: "from-violet-500 to-purple-500" },
] as const;

const SelfHelp = () => {
  const [activeTab, setActiveTab] = useState("quest");
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale" | "idle">("idle");
  const [breathCount, setBreathCount] = useState(0);
  const [wreckClicks, setWreckClicks] = useState(0);

  const { earnFromActivity, canEarn } = useEccEarn();
  const { profile } = useAuth();
  const {
    quests,
    isLoading,
    completeQuest,
    isCompleting,
    getQuestStatus,
    completedToday,
    totalXpToday,
  } = useQuests();

  const achievements = [
    { id: 1, name: "First Quest", icon: Trophy, unlocked: completedToday >= 1 },
    { id: 2, name: "7-Day Streak", icon: Flame, unlocked: (profile?.streak_days || 0) >= 7 },
    { id: 3, name: "Mindful Master", icon: Target, unlocked: completedToday >= 4 },
    { id: 4, name: "Wellness Warrior", icon: Award, unlocked: (profile?.total_sessions || 0) >= 10 },
  ];

  useEffect(() => {
    if (breathPhase === "idle") return;
    let timeout: ReturnType<typeof setTimeout>;

    if (breathPhase === "inhale") {
      timeout = setTimeout(() => setBreathPhase("hold"), 4000);
    } else if (breathPhase === "hold") {
      timeout = setTimeout(() => setBreathPhase("exhale"), 7000);
    } else if (breathPhase === "exhale") {
      timeout = setTimeout(() => {
        setBreathCount((prev) => prev + 1);
        if (breathCount < 2) {
          setBreathPhase("inhale");
        } else {
          setBreathPhase("idle");
          setBreathCount(0);
          if (canEarn) {
            earnFromActivity({ amount: 1, activity: "Tibetan Bowl breathing exercise" });
          }
        }
      }, 8000);
    }
    return () => clearTimeout(timeout);
  }, [breathPhase, breathCount, canEarn, earnFromActivity]);

  const startBreathing = () => {
    setBreathCount(0);
    setBreathPhase("inhale");
  };

  const handleWreckClick = () => {
    setWreckClicks((prev) => prev + 1);
    if (wreckClicks >= 29) {
      setWreckClicks(0);
      if (canEarn) {
        earnFromActivity({ amount: 1, activity: "Wreck the Buddy completion" });
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const completedIds = quests.filter((q) => getQuestStatus(q.id)).map((q) => q.id);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Compact Header */}
        <div>
          <h1 className="text-lg sm:text-2xl font-bold font-display">Self-Help Tools</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Daily micro-wellbeing tools
          </p>
        </div>

        {/* Compact Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Flame, value: profile?.streak_days || 0, label: "Streak", color: "text-orange-500" },
            { icon: Award, value: totalXpToday, label: "XP", color: "text-primary" },
            { icon: CheckCircle, value: completedToday, label: "Done", color: "text-emerald-500" },
            { icon: Trophy, value: `${achievements.filter((a) => a.unlocked).length}/${achievements.length}`, label: "Badges", color: "text-amber-500" },
          ].map((stat, i) => (
            <div key={i} className="p-2 sm:p-3 rounded-xl bg-card border border-border/50 text-center">
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-base sm:text-lg font-bold leading-none">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tab Switcher — full width on mobile */}
        <div className="grid grid-cols-3 gap-1.5 bg-muted/30 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-br ${tab.gradient} text-white shadow-sm`
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "quest" && (
            <motion.div
              key="quest"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <QuestCard3D
                quests={quests.map((q) => ({ id: q.id, title: q.title, xp_reward: q.xp_reward }))}
                completedIds={completedIds}
                onComplete={(id) => {
                  const quest = quests.find((q) => q.id === id);
                  if (quest && !getQuestStatus(quest.id)) {
                    completeQuest(quest);
                  }
                }}
              />

              {/* Daily Progress */}
              <div className="p-3 sm:p-4 rounded-xl bg-card border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold font-display text-xs sm:text-sm">Today's Progress</h3>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {completedToday}/{quests.length}
                  </span>
                </div>
                <Progress
                  value={quests.length > 0 ? (completedToday / quests.length) * 100 : 0}
                  className="h-2 mb-1.5"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {completedToday === quests.length
                    ? "🎉 All quests completed!"
                    : "Complete all quests to earn bonus XP!"}
                </p>
              </div>

              {/* Quest List */}
              <div className="space-y-2">
                {quests.map((quest) => {
                  const isCompleted = getQuestStatus(quest.id);
                  return (
                    <div
                      key={quest.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isCompleted
                          ? "bg-emerald-500/5 border-emerald-500/20"
                          : "bg-card border-border/50 active:scale-[0.98]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? "bg-emerald-500/15"
                              : "bg-gradient-to-br from-amber-500 to-orange-500"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Award className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-medium text-[13px] sm:text-sm truncate">{quest.title}</h4>
                            <span className="text-[10px] sm:text-xs font-medium text-primary shrink-0">+{quest.xp_reward} XP</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{quest.description}</p>
                        </div>
                        {!isCompleted && (
                          <Button
                            size="sm"
                            className="h-7 px-2.5 text-[10px] sm:text-xs shrink-0"
                            onClick={() => completeQuest(quest)}
                            disabled={isCompleting}
                          >
                            {isCompleting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                Do it
                                <ChevronRight className="w-3 h-3 ml-0.5" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Achievements */}
              <div>
                <h3 className="font-semibold font-display mb-2 text-xs sm:text-sm">Achievements</h3>
                <div className="grid grid-cols-4 gap-2">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-2 sm:p-3 rounded-xl text-center border ${
                        achievement.unlocked
                          ? "bg-card border-primary/30"
                          : "bg-muted/20 border-border/50 opacity-40"
                      }`}
                    >
                      <achievement.icon
                        className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 ${
                          achievement.unlocked ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <p className="text-[9px] sm:text-xs font-medium leading-tight">{achievement.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "wreck" && (
            <motion.div
              key="wreck"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <WreckBuddy3D hitCount={wreckClicks} onHit={handleWreckClick} />

              <div className="p-3 sm:p-5 rounded-xl bg-card border border-border/50 text-center">
                <h2 className="text-base sm:text-xl font-bold font-display mb-1">Wreck the Buddy</h2>
                <p className="text-xs text-muted-foreground mb-3">
                  Tap to release stress. 30 hits = 1 ECC!
                </p>
                <div className="max-w-[200px] mx-auto mb-3">
                  <Progress value={(wreckClicks / 30) * 100} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1.5">{wreckClicks}/30 hits</p>
                </div>
                <Button
                  className="bg-gradient-to-br from-red-500 to-pink-500 text-white h-10 sm:h-11 px-5"
                  onClick={handleWreckClick}
                >
                  <Zap className="w-4 h-4 mr-1.5" />
                  Tap! ({30 - wreckClicks} left)
                </Button>
                {wreckClicks >= 30 && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-emerald-500 font-semibold text-xs"
                  >
                    🎉 Great job releasing that energy!
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "tibetan" && (
            <motion.div
              key="tibetan"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <TibetanBowl3D phase={breathPhase} />

              <div className="p-3 sm:p-5 rounded-xl bg-card border border-border/50 text-center">
                <h2 className="text-base sm:text-xl font-bold font-display mb-1">Tibetan Bowl</h2>
                <AnimatePresence mode="wait">
                  {breathPhase === "idle" ? (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
                        4-7-8 breathing with Tibetan singing bowls. Perfect for quick stress relief.
                      </p>
                      <Button
                        className="bg-gradient-to-br from-violet-500 to-purple-500 text-white h-10 sm:h-11 px-5"
                        onClick={startBreathing}
                      >
                        <Play className="w-4 h-4 mr-1.5" />
                        Begin Breathing
                      </Button>
                      <p className="text-[10px] text-muted-foreground mt-2.5">~2 minutes</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={breathPhase}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="py-3"
                    >
                      <p className="text-xl sm:text-2xl font-bold font-display text-primary mb-1">
                        {breathPhase === "inhale" && "Breathe In..."}
                        {breathPhase === "hold" && "Hold..."}
                        {breathPhase === "exhale" && "Breathe Out..."}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {breathPhase === "inhale" && "4 seconds"}
                        {breathPhase === "hold" && "7 seconds"}
                        {breathPhase === "exhale" && "8 seconds"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2.5">
                        Cycle {breathCount + 1} of 3
                      </p>
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

export default SelfHelp;
