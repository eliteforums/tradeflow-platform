import { useState, useEffect, lazy, Suspense } from "react";
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
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuests } from "@/hooks/useQuests";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const WreckBuddy3D = lazy(() => import("@/components/selfhelp/WreckBuddy3D"));
const TibetanBowl3D = lazy(() => import("@/components/selfhelp/TibetanBowl3D"));
const QuestCard3D = lazy(() => import("@/components/selfhelp/QuestCard3D"));

const ThreeDLoader = () => (
  <div className="w-full h-[300px] rounded-2xl bg-card border border-border flex items-center justify-center">
    <Loader2 className="w-6 h-6 animate-spin text-primary" />
  </div>
);

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

  // Breathing exercise logic
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
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Self-Help Tools</h1>
          <p className="text-muted-foreground">
            Daily micro-wellbeing tools for your mental wellness journey
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border">
            <Flame className="w-6 h-6 text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{profile?.streak_days || 0}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <Award className="w-6 h-6 text-primary mb-2" />
            <p className="text-2xl font-bold">{totalXpToday}</p>
            <p className="text-sm text-muted-foreground">XP Today</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <CheckCircle className="w-6 h-6 text-eternia-success mb-2" />
            <p className="text-2xl font-bold">{completedToday}</p>
            <p className="text-sm text-muted-foreground">Quests Done</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <Trophy className="w-6 h-6 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">
              {achievements.filter((a) => a.unlocked).length}/{achievements.length}
            </p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </div>
        </div>

        {/* Tools Tabs */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={activeTab === "quest" ? "default" : "outline"}
            onClick={() => setActiveTab("quest")}
            className={`gap-2 ${activeTab === "quest" ? "bg-gradient-to-br from-amber-500 to-orange-500" : ""}`}
          >
            <Award className="w-4 h-4" />
            Quest Cards
          </Button>
          <Button
            variant={activeTab === "wreck" ? "default" : "outline"}
            onClick={() => setActiveTab("wreck")}
            className={`gap-2 ${activeTab === "wreck" ? "bg-gradient-to-br from-red-500 to-pink-500" : ""}`}
          >
            <Zap className="w-4 h-4" />
            Wreck the Buddy
          </Button>
          <Button
            variant={activeTab === "tibetan" ? "default" : "outline"}
            onClick={() => setActiveTab("tibetan")}
            className={`gap-2 ${activeTab === "tibetan" ? "bg-gradient-to-br from-violet-500 to-purple-500" : ""}`}
          >
            <Music className="w-4 h-4" />
            Tibetan Bowl
          </Button>
        </div>

        {/* Content */}
        {activeTab === "quest" && (
          <div className="space-y-6">
            {/* 3D Quest Cards */}
            <Suspense fallback={<ThreeDLoader />}>
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
            </Suspense>

            {/* Daily Progress */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold font-display">Today's Progress</h3>
                <span className="text-sm text-muted-foreground">
                  {completedToday}/{quests.length} completed
                </span>
              </div>
              <Progress
                value={quests.length > 0 ? (completedToday / quests.length) * 100 : 0}
                className="h-3 mb-2"
              />
              <p className="text-sm text-muted-foreground">
                {completedToday === quests.length
                  ? "🎉 All quests completed! Amazing work!"
                  : "Complete all quests to earn bonus XP!"}
              </p>
            </div>

            {/* Quest List */}
            <div className="space-y-3">
              {quests.map((quest) => {
                const isCompleted = getQuestStatus(quest.id);
                return (
                  <div
                    key={quest.id}
                    className={`p-5 rounded-xl border transition-all ${
                      isCompleted
                        ? "bg-eternia-success/5 border-eternia-success/30"
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isCompleted
                              ? "bg-eternia-success/20"
                              : "bg-gradient-to-br from-amber-500 to-orange-500"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-eternia-success" />
                          ) : (
                            <Award className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{quest.title}</h4>
                          <p className="text-sm text-muted-foreground">{quest.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-primary">+{quest.xp_reward} XP</span>
                        {!isCompleted && (
                          <Button
                            size="sm"
                            className="btn-primary"
                            onClick={() => completeQuest(quest)}
                            disabled={isCompleting}
                          >
                            {isCompleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                Complete
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Achievements */}
            <div>
              <h3 className="font-semibold font-display mb-4">Achievements</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-xl text-center border ${
                      achievement.unlocked
                        ? "bg-card border-primary/30"
                        : "bg-muted/20 border-border opacity-50"
                    }`}
                  >
                    <achievement.icon
                      className={`w-8 h-8 mx-auto mb-2 ${
                        achievement.unlocked ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <p className="text-sm font-medium">{achievement.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "wreck" && (
          <div className="space-y-6">
            {/* 3D Buddy */}
            <Suspense fallback={<ThreeDLoader />}>
              <WreckBuddy3D hitCount={wreckClicks} onHit={handleWreckClick} />
            </Suspense>

            <div className="p-6 rounded-2xl bg-card border border-border text-center">
              <h2 className="text-2xl font-bold font-display mb-2">Wreck the Buddy</h2>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Click or tap the buddy to release pent-up stress. Hit it 30 times to earn 1 ECC!
              </p>
              <div className="max-w-xs mx-auto mb-4">
                <Progress value={(wreckClicks / 30) * 100} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">{wreckClicks}/30 interactions</p>
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-br from-red-500 to-pink-500 text-white"
                onClick={handleWreckClick}
              >
                <Zap className="w-5 h-5 mr-2" />
                Tap to Release ({30 - wreckClicks} left)
              </Button>
              {wreckClicks >= 30 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-eternia-success font-semibold"
                >
                  🎉 Great job releasing that energy! Feel better?
                </motion.p>
              )}
            </div>
          </div>
        )}

        {activeTab === "tibetan" && (
          <div className="space-y-6">
            {/* 3D Bowl */}
            <Suspense fallback={<ThreeDLoader />}>
              <TibetanBowl3D phase={breathPhase} />
            </Suspense>

            <div className="p-6 rounded-2xl bg-card border border-border text-center">
              <h2 className="text-2xl font-bold font-display mb-2">Tibetan Bowl Breathing</h2>
              <AnimatePresence mode="wait">
                {breathPhase === "idle" ? (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      A guided 4-7-8 breathing exercise using the soothing rhythm of Tibetan singing
                      bowls. Perfect for quick stress relief.
                    </p>
                    <Button
                      size="lg"
                      className="bg-gradient-to-br from-violet-500 to-purple-500 text-white"
                      onClick={startBreathing}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Begin Breathing
                    </Button>
                    <p className="text-sm text-muted-foreground mt-4">Duration: ~2 minutes</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key={breathPhase}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="py-4"
                  >
                    <p className="text-3xl font-bold font-display text-primary mb-2">
                      {breathPhase === "inhale" && "Breathe In..."}
                      {breathPhase === "hold" && "Hold..."}
                      {breathPhase === "exhale" && "Breathe Out..."}
                    </p>
                    <p className="text-muted-foreground">
                      {breathPhase === "inhale" && "4 seconds"}
                      {breathPhase === "hold" && "7 seconds"}
                      {breathPhase === "exhale" && "8 seconds"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      Cycle {breathCount + 1} of 3
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SelfHelp;
