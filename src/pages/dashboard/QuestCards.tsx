import DashboardLayout from "@/components/layout/DashboardLayout";
import { useQuests } from "@/hooks/useQuests";
import { Award, ArrowLeft, AlertCircle, Loader2, Send, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useCallback } from "react";

const CARD_BACKS = ["🌊", "🔥", "🌿", "⭐", "🎯", "💎"];

const QuestCards = () => {
  const { quests, completions, isLoading, error, completeQuest, isCompleting, completedToday, totalXpToday } = useQuests();
  const completedIds = completions.map((c) => c.quest_id);

  // Pick 6 random quests, stable per day
  const dealtCards = useMemo(() => {
    if (quests.length === 0) return [];
    const shuffled = [...quests].sort(() => {
      // Seed based on today's date for consistent daily shuffle
      const today = new Date().toISOString().split("T")[0];
      const seed = today.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      return Math.sin(seed * quests.indexOf(quests.find(q => q === quests[0])!)) - 0.5;
    });
    // Use a seeded shuffle
    const todaySeed = new Date().toISOString().split("T")[0];
    const seedNum = todaySeed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const seededShuffle = [...quests].sort((a, b) => {
      const ha = (seedNum * a.id.charCodeAt(0) + a.id.charCodeAt(1)) % 1000;
      const hb = (seedNum * b.id.charCodeAt(0) + b.id.charCodeAt(1)) % 1000;
      return ha - hb;
    });
    return seededShuffle.slice(0, 6);
  }, [quests]);

  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");

  const handleFlip = useCallback((questId: string) => {
    if (completedIds.includes(questId)) return;
    if (flippedId === questId) {
      setFlippedId(null);
      setAnswer("");
    } else {
      setFlippedId(questId);
      setAnswer("");
    }
  }, [completedIds, flippedId]);

  const handleSubmit = useCallback(() => {
    if (!flippedId || !answer.trim()) return;
    const quest = dealtCards.find(q => q.id === flippedId);
    if (quest) {
      completeQuest({ quest, answer: answer.trim() });
      setFlippedId(null);
      setAnswer("");
    }
  }, [flippedId, answer, dealtCards, completeQuest]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard/self-help" className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center hover:border-primary/30 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-display">Quest Cards</h1>
            <p className="text-sm text-muted-foreground">Flip a card, answer the question, earn XP</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          <div className="rounded-xl bg-card border border-border/50 p-3 text-center flex-1">
            <p className="text-lg font-bold">{completedToday}</p>
            <p className="text-[11px] text-muted-foreground">Answered</p>
          </div>
          <div className="rounded-xl bg-card border border-border/50 p-3 text-center flex-1">
            <p className="text-lg font-bold">{totalXpToday}</p>
            <p className="text-[11px] text-muted-foreground">XP Today</p>
          </div>
          <div className="rounded-xl bg-card border border-border/50 p-3 text-center flex-1">
            <p className="text-lg font-bold">{dealtCards.length}</p>
            <p className="text-[11px] text-muted-foreground">Cards Dealt</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Failed to load quests. Please refresh the page.</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : dealtCards.length === 0 && !error ? (
          <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
            <Award className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No quests available right now. Check back later!</p>
          </div>
        ) : (
          <>
            {/* Card Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
              {dealtCards.map((quest, idx) => {
                const isCompleted = completedIds.includes(quest.id);
                const isFlipped = flippedId === quest.id;

                return (
                  <div key={quest.id} className="perspective-1000">
                    <button
                      onClick={() => handleFlip(quest.id)}
                      disabled={isCompleted || isCompleting}
                      className="w-full"
                    >
                      <div
                        className={`relative w-full aspect-[3/4] transition-transform duration-500 transform-style-3d ${
                          isFlipped || isCompleted ? "rotate-y-180" : ""
                        }`}
                      >
                        {/* Card Back */}
                        <div className={`absolute inset-0 backface-hidden rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                          isCompleted
                            ? "border-muted/30 bg-muted/10"
                            : "border-primary/30 bg-gradient-to-br from-primary/20 to-accent/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer active:scale-[0.97]"
                        }`}>
                          <span className="text-3xl sm:text-4xl">{CARD_BACKS[idx]}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                            {isCompleted ? "Done ✓" : "Tap to flip"}
                          </span>
                        </div>

                        {/* Card Front */}
                        <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl border-2 p-3 flex flex-col items-center justify-center text-center ${
                          isCompleted
                            ? "border-emerald-500/30 bg-emerald-500/5"
                            : "border-primary/40 bg-card"
                        }`}>
                          <p className="text-xs sm:text-sm font-semibold leading-tight mb-1">{quest.title}</p>
                          <p className="text-[10px] text-muted-foreground leading-snug line-clamp-3">{quest.description}</p>
                          <div className="mt-2">
                            <span className={`text-[10px] font-bold ${isCompleted ? "text-emerald-500" : "text-primary"}`}>
                              {isCompleted ? "✓ Completed" : `+${quest.xp_reward} XP`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Answer Input - shown when a card is flipped */}
            {flippedId && !completedIds.includes(flippedId) && (
              <div className="rounded-2xl border border-primary/30 bg-card p-4 space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-sm font-semibold">
                    {dealtCards.find(q => q.id === flippedId)?.title}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {dealtCards.find(q => q.id === flippedId)?.description}
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="flex-1 bg-background"
                    autoFocus
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || isCompleting}
                    size="icon"
                    className="shrink-0"
                  >
                    {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Deck indicator */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="relative w-10 h-14">
                {[2, 1, 0].map((i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-lg border border-border/50 bg-card"
                    style={{ transform: `translateX(${i * 2}px) translateY(${i * 2}px)` }}
                  />
                ))}
              </div>
              <p className="text-xs">
                {quests.length - dealtCards.length} more in deck · refreshes daily
              </p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuestCards;
