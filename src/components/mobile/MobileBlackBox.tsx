import { useState } from "react";
import { Box, Plus, Lock, Mic, Type, Send, Clock, Shield, AlertTriangle, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBlackBox } from "@/hooks/useBlackBox";

const MobileBlackBox = () => {
  const [newEntry, setNewEntry] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showEntries, setShowEntries] = useState(true);
  const { entries, isLoading, createEntry, deleteEntry, isCreating } = useBlackBox();

  const handleSaveEntry = () => {
    if (!newEntry.trim()) return;
    createEntry({ content: newEntry, isPrivate }, { onSuccess: () => setNewEntry("") });
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <div>
          <h1 className="text-xl font-bold font-display">BlackBox</h1>
          <p className="text-sm text-muted-foreground">Safe space for anonymous expression</p>
        </div>

        {/* Privacy Info */}
        <div className="p-4 rounded-2xl bg-gradient-eternia-subtle border border-border flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">All entries encrypted. Private entries never scanned.</p>
        </div>

        {/* New Entry */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />New Entry</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Private</span>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              {isPrivate && <Lock className="w-4 h-4 text-primary" />}
            </div>
          </div>
          <Textarea placeholder="Express yourself freely..." value={newEntry} onChange={(e) => setNewEntry(e.target.value)}
            className="min-h-[120px] bg-muted/30 border-border resize-none mb-3 text-sm" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-10 w-10"><Mic className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon" className="h-10 w-10"><Type className="w-4 h-4" /></Button>
            </div>
            <Button className="h-10 text-sm px-4" disabled={!newEntry.trim() || isCreating} onClick={handleSaveEntry}>
              {isCreating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}Save
            </Button>
          </div>
          {isPrivate && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Lock className="w-3 h-3" />Not analyzed by AI</p>}
        </div>

        {/* Past Entries */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Your Entries</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowEntries(!showEntries)} className="text-muted-foreground h-9 text-xs px-3">
              {showEntries ? <><EyeOff className="w-4 h-4 mr-1" />Hide</> : <><Eye className="w-4 h-4 mr-1" />Show</>}
            </Button>
          </div>
          {showEntries && (
            <div className="space-y-3">
              {isLoading ? <p className="text-center py-8 text-sm text-muted-foreground">Loading...</p>
                : entries.length === 0 ? <p className="text-center py-8 text-sm text-muted-foreground">No entries yet.</p>
                : entries.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-2xl bg-card border border-border">
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {entry.is_private && <span className="flex items-center gap-1 text-xs text-primary"><Lock className="w-3 h-3" />Private</span>}
                        {entry.ai_flag_level > 0 && (
                          <span className={`flex items-center gap-1 text-xs ${entry.ai_flag_level >= 2 ? "text-destructive" : "text-eternia-warning"}`}>
                            <AlertTriangle className="w-3 h-3" />{entry.ai_flag_level >= 2 ? "Support" : "Monitor"}
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-9 w-9 shrink-0" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{entry.content_encrypted}</p>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-border bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">If you're in crisis, AI may suggest connecting with a professional.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MobileBlackBox;
