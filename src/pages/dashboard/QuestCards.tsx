import { useIsMobile } from "@/hooks/use-mobile";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuests } from "@/hooks/useQuests";
import QuestCard3D from "@/components/selfhelp/QuestCard3D";
import { Award, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const QuestCards = () => {
  const { quests, completions, isLoading, completeQuest, completedToday, totalXpToday } = useQuests();
  const completedIds = completions.map((c) => c.quest_id);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5 pb-24">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/self-help" className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center hover:border-primary/30 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-display">Quest Cards</h1>
            <p className="text-sm text-muted-foreground">Daily micro-challenges for wellbeing</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="rounded-xl bg-card border border-border/50 p-3 text-center flex-1">
            <p className="text-lg font-bold">{completedToday}</p>
            <p className="text-[11px] text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-xl bg-card border border-border/50 p-3 text-center flex-1">
            <p className="text-lg font-bold">{totalXpToday}</p>
            <p className="text-[11px] text-muted-foreground">XP Today</p>
          </div>
          <div className="rounded-xl bg-card border border-border/50 p-3 text-center flex-1">
            <p className="text-lg font-bold">{quests.length}</p>
            <p className="text-[11px] text-muted-foreground">Available</p>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-[280px] w-full rounded-2xl" />
        ) : (
          <QuestCard3D
            quests={quests}
            completedIds={completedIds}
            onComplete={(id) => {
              const quest = quests.find((q) => q.id === id);
              if (quest) completeQuest(quest);
            }}
          />
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Quests</p>
          {quests.map((quest) => {
            const done = completedIds.includes(quest.id);
            return (
              <button
                key={quest.id}
                onClick={() => !done && completeQuest(quest)}
                disabled={done}
                className={`w-full text-left rounded-xl border p-3 flex items-center gap-3 transition-all ${
                  done ? "bg-emerald-500/10 border-emerald-500/30" : "bg-card border-border/40 hover:border-primary/30 active:scale-[0.99]"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  done ? "bg-emerald-500/20" : "bg-gradient-to-br from-amber-500 to-orange-500"
                }`}>
                  <Award className={`w-5 h-5 ${done ? "text-emerald-500" : "text-white"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{quest.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{quest.description}</p>
                </div>
                <span className={`text-xs font-medium shrink-0 ${done ? "text-emerald-500" : "text-primary"}`}>
                  {done ? "✓ Done" : `+${quest.xp_reward} XP`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuestCards;
