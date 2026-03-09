import { useState } from "react";
import {
  Sparkles,
  Award,
  Zap,
  Music,
  Play,
  CheckCircle,
  ChevronRight,
  Trophy,
  Flame,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";

const SelfHelp = () => {
  const [activeTab, setActiveTab] = useState("quest");

  const questCards = [
    {
      id: 1,
      title: "Morning Gratitude",
      description: "Write down 3 things you're grateful for today",
      xp: 10,
      completed: true,
    },
    {
      id: 2,
      title: "Mindful Breathing",
      description: "Take 5 deep breaths and focus on the present moment",
      xp: 15,
      completed: false,
    },
    {
      id: 3,
      title: "Connect with Someone",
      description: "Reach out to a friend or family member",
      xp: 20,
      completed: false,
    },
    {
      id: 4,
      title: "Physical Movement",
      description: "Do 10 minutes of light exercise or stretching",
      xp: 25,
      completed: false,
    },
  ];

  const achievements = [
    { id: 1, name: "First Quest", icon: Trophy, unlocked: true },
    { id: 2, name: "7-Day Streak", icon: Flame, unlocked: true },
    { id: 3, name: "Mindful Master", icon: Target, unlocked: false },
    { id: 4, name: "Wellness Warrior", icon: Award, unlocked: false },
  ];

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
            <p className="text-2xl font-bold">7</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <Award className="w-6 h-6 text-primary mb-2" />
            <p className="text-2xl font-bold">245</p>
            <p className="text-sm text-muted-foreground">Total XP</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <CheckCircle className="w-6 h-6 text-eternia-success mb-2" />
            <p className="text-2xl font-bold">18</p>
            <p className="text-sm text-muted-foreground">Quests Done</p>
          </div>
          <div className="p-4 rounded-xl bg-card border border-border">
            <Trophy className="w-6 h-6 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">2/4</p>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </div>
        </div>

        {/* Tools Tabs */}
        <div className="flex gap-2">
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
            {/* Daily Progress */}
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold font-display">Today's Progress</h3>
                <span className="text-sm text-muted-foreground">1/4 completed</span>
              </div>
              <Progress value={25} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                Complete all quests to earn bonus XP!
              </p>
            </div>

            {/* Quest List */}
            <div className="space-y-3">
              {questCards.map((quest) => (
                <div
                  key={quest.id}
                  className={`p-5 rounded-xl border transition-all ${
                    quest.completed
                      ? "bg-eternia-success/5 border-eternia-success/30"
                      : "bg-card border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          quest.completed
                            ? "bg-eternia-success/20"
                            : "bg-gradient-to-br from-amber-500 to-orange-500"
                        }`}
                      >
                        {quest.completed ? (
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
                      <span className="text-sm font-medium text-primary">+{quest.xp} XP</span>
                      {!quest.completed && (
                        <Button size="sm" className="btn-primary">
                          Start
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
          <div className="p-8 rounded-2xl bg-card border border-border text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">Wreck the Buddy</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              An interactive emotional release tool. Tap, shake, or interact to release 
              pent-up stress and frustration in a safe, controlled way.
            </p>
            <Button size="lg" className="bg-gradient-to-br from-red-500 to-pink-500 text-white">
              <Play className="w-5 h-5 mr-2" />
              Start Session
            </Button>
          </div>
        )}

        {activeTab === "tibetan" && (
          <div className="p-8 rounded-2xl bg-card border border-border text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Music className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-2xl font-bold font-display mb-2">Tibetan Bowl</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              A guided audio-visual breathing exercise using the soothing sounds of 
              Tibetan singing bowls. Perfect for quick stress relief.
            </p>
            <Button size="lg" className="bg-gradient-to-br from-violet-500 to-purple-500 text-white">
              <Play className="w-5 h-5 mr-2" />
              Begin Breathing
            </Button>
            <p className="text-sm text-muted-foreground mt-4">Duration: 5 minutes</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SelfHelp;
