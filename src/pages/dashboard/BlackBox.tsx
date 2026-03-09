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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">BlackBox</h1>
          <p className="text-muted-foreground">
            A safe space for anonymous emotional expression
          </p>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-xl bg-gradient-eternia-subtle border border-border">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Your Privacy is Protected</h3>
              <p className="text-sm text-muted-foreground">
                All entries are encrypted with your personal key. Private entries are never scanned 
                or analyzed. Regular entries may be reviewed by AI for crisis detection to ensure your safety.
              </p>
            </div>
          </div>
        </div>

        {/* New Entry */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-display flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              New Entry
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Private</span>
                <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              </div>
              {isPrivate && (
                <Lock className="w-4 h-4 text-primary" />
              )}
            </div>
          </div>

          <Textarea
            placeholder="Express yourself freely... Your thoughts are safe here."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="min-h-[150px] bg-muted/30 border-border resize-none mb-4"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Mic className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Type className="w-5 h-5" />
              </Button>
            </div>
            <Button className="btn-primary" disabled={!newEntry.trim() || isCreating} onClick={handleSaveEntry}>
              {isCreating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
              Save Entry
            </Button>
          </div>

          {isPrivate && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Private entries are not analyzed by AI and remain fully encrypted
            </p>
          )}
        </div>

        {/* Past Entries */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-display">Your Entries</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEntries(!showEntries)}
              className="text-muted-foreground"
            >
              {showEntries ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show
                </>
              )}
            </Button>
          </div>

          {showEntries && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading entries...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No entries yet. Start expressing yourself.</div>
              ) : (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {entry.is_private && (
                          <span className="flex items-center gap-1 text-xs text-primary">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        )}
                        {getCrisisIndicator(entry.ai_flag_level)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-foreground/90 leading-relaxed">{entry.content_encrypted}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Support Notice */}
        <div className="p-4 rounded-xl border border-border bg-muted/20">
          <p className="text-sm text-muted-foreground text-center">
            If you're in crisis or need immediate support, our AI may suggest connecting 
            with a professional. Your identity remains protected unless you choose otherwise.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlackBox;
