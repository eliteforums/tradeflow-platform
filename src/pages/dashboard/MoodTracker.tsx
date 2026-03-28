import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useMoodTracker } from "@/hooks/useMoodTracker";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const moods = [
  { value: 1, emoji: "😢", label: "Awful" },
  { value: 2, emoji: "😕", label: "Bad" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😁", label: "Great" },
];

const MoodTracker = () => {
  const { entries, isLoading, todayEntry, logMood, isLogging, last7Days } = useMoodTracker();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (!selectedMood) return;
    logMood(
      { mood: selectedMood, note: note.trim() },
      { onSuccess: () => { setSelectedMood(null); setNote(""); } }
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5 pb-24">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/self-help" className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center hover:border-primary/30 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-display">Mood Tracker</h1>
            <p className="text-sm text-muted-foreground">Track your emotional patterns</p>
          </div>
        </div>

        {todayEntry ? (
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-5 text-center">
            <p className="text-4xl mb-2">{moods.find((m) => m.value === todayEntry.mood)?.emoji}</p>
            <p className="text-sm font-semibold">Today you feel: {moods.find((m) => m.value === todayEntry.mood)?.label}</p>
            {todayEntry.note && <p className="text-xs text-muted-foreground mt-1">"{todayEntry.note}"</p>}
            <p className="text-[10px] text-muted-foreground/60 mt-2">Come back tomorrow for another check-in</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card border border-border/40 p-5 space-y-4">
            <p className="text-sm font-semibold text-center">How are you feeling right now?</p>
            <div className="flex justify-center gap-3">
              {moods.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMood(m.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                    selectedMood === m.value
                      ? "bg-primary/20 border-primary/40 scale-110"
                      : "bg-card border-border/50 hover:border-primary/30"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Add a note (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="rounded-xl resize-none"
            />
            <Button onClick={handleSubmit} disabled={!selectedMood || isLogging} className="w-full rounded-xl">
              {isLogging ? "Saving..." : "Log Mood"}
            </Button>
          </div>
        )}

        {/* 7-day visual history */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Last 7 Days</p>
          {isLoading ? (
            <Skeleton className="h-20 rounded-xl" />
          ) : last7Days.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No mood data yet</p>
          ) : (
            <div className="flex gap-2 justify-center">
              {last7Days.map((entry) => {
                const m = moods.find((mo) => mo.value === entry.mood);
                const day = new Date(entry.created_at).toLocaleDateString("en-IN", { weekday: "short" });
                return (
                  <div key={entry.id} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-card border border-border/40 min-w-[52px]">
                    <span className="text-lg">{m?.emoji}</span>
                    <span className="text-[10px] text-muted-foreground">{day}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History list */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">History</p>
          {entries.slice(0, 14).map((entry) => {
            const m = moods.find((mo) => mo.value === entry.mood);
            return (
              <div key={entry.id} className="rounded-xl bg-card border border-border/40 p-3 flex items-center gap-3">
                <span className="text-xl">{m?.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{m?.label}</p>
                  {entry.note && <p className="text-xs text-muted-foreground truncate">{entry.note}</p>}
                </div>
                <span className="text-[10px] text-muted-foreground/60 shrink-0">
                  {new Date(entry.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MoodTracker;
