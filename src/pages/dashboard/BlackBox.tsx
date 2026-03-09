import { useState } from "react";
import {
  Box,
  Plus,
  Lock,
  Mic,
  Type,
  Send,
  Clock,
  Shield,
  AlertTriangle,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBlackBox } from "@/hooks/useBlackBox";

const BlackBox = () => {
  const [newEntry, setNewEntry] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showEntries, setShowEntries] = useState(true);
  const { entries, isLoading, createEntry, deleteEntry, isCreating } = useBlackBox();

  const handleSaveEntry = () => {
    if (!newEntry.trim()) return;
    createEntry({ content: newEntry, isPrivate }, {
      onSuccess: () => setNewEntry(""),
    });
  };

  const getCrisisIndicator = (level: number) => {
    switch (level) {
      case 0:
        return null;
      case 1:
        return (
          <span className="flex items-center gap-1 text-xs text-eternia-warning">
            <AlertTriangle className="w-3 h-3" />
            Monitoring
          </span>
        );
      case 2:
        return (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertTriangle className="w-3 h-3" />
            Support Available
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1">BlackBox</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            A safe space for anonymous emotional expression
          </p>
        </div>

        {/* Info Banner */}
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-eternia-subtle border border-border">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-0.5">Your Privacy is Protected</h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                All entries are encrypted. Private entries are never scanned. Regular entries may be reviewed by AI for crisis detection.
              </p>
            </div>
          </div>
        </div>

        {/* New Entry */}
        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="font-semibold font-display text-sm sm:text-base flex items-center gap-2">
              <Plus className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
              New Entry
            </h2>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Private</span>
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>
              {isPrivate && <Lock className="w-4 h-4 text-primary" />}
            </div>
          </div>

          <Textarea
            placeholder="Express yourself freely... Your thoughts are safe here."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="min-h-[120px] sm:min-h-[150px] bg-muted/30 border-border resize-none mb-3 sm:mb-4 text-sm"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Mic className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Type className="w-4 h-4" />
              </Button>
            </div>
            <Button className="btn-primary h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4" disabled={!newEntry.trim() || isCreating} onClick={handleSaveEntry}>
              {isCreating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}
              Save
            </Button>
          </div>

          {isPrivate && (
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-2.5 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Private entries are not analyzed by AI
            </p>
          )}
        </div>

        {/* Past Entries */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold font-display text-sm sm:text-base">Your Entries</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEntries(!showEntries)}
              className="text-muted-foreground h-8 text-xs"
            >
              {showEntries ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Show
                </>
              )}
            </Button>
          </div>

          {showEntries && (
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading entries...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">No entries yet. Start expressing yourself.</div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 sm:p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 shrink-0" />
                          {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {entry.is_private && (
                          <span className="flex items-center gap-1 text-[11px] text-primary">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        )}
                        {getCrisisIndicator(entry.ai_flag_level)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{entry.content_encrypted}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Support Notice */}
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-muted/20">
          <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
            If you're in crisis, our AI may suggest connecting with a professional. Your identity remains protected.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlackBox;
