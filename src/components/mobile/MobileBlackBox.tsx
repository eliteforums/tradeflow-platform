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
      <div className="space-y-3 pb-24">
        <div>
          <h1 className="text-lg font-bold font-display">BlackBox</h1>
          <p className="text-[11px] text-muted-foreground">Safe space for anonymous expression</p>
        </div>

        {/* Privacy Info */}
        <div className="p-2.5 rounded-xl bg-gradient-eternia-subtle border border-border flex items-start gap-2">
          <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">All entries encrypted. Private entries never scanned.</p>
        </div>

        {/* New Entry */}
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-xs flex items-center gap-1.5"><Plus className="w-3.5 h-3.5 text-primary" />New Entry</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">Private</span>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
              {isPrivate && <Lock className="w-3 h-3 text-primary" />}
            </div>
          </div>
          <Textarea placeholder="Express yourself freely..." value={newEntry} onChange={(e) => setNewEntry(e.target.value)}
            className="min-h-[100px] bg-muted/30 border-border resize-none mb-2.5 text-xs" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7"><Mic className="w-3.5 h-3.5" /></Button>
              <Button variant="outline" size="icon" className="h-7 w-7"><Type className="w-3.5 h-3.5" /></Button>
            </div>
            <Button className="h-8 text-xs px-3" disabled={!newEntry.trim() || isCreating} onClick={handleSaveEntry}>
              {isCreating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}Save
            </Button>
          </div>
          {isPrivate && <p className="text-[9px] text-muted-foreground mt-1.5 flex items-center gap-0.5"><Lock className="w-2.5 h-2.5" />Not analyzed by AI</p>}
        </div>

        {/* Past Entries */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-xs">Your Entries</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowEntries(!showEntries)} className="text-muted-foreground h-6 text-[10px] px-1.5">
              {showEntries ? <><EyeOff className="w-3 h-3 mr-1" />Hide</> : <><Eye className="w-3 h-3 mr-1" />Show</>}
            </Button>
          </div>
          {showEntries && (
            <div className="space-y-2">
              {isLoading ? <p className="text-center py-6 text-[10px] text-muted-foreground">Loading...</p>
                : entries.length === 0 ? <p className="text-center py-6 text-[10px] text-muted-foreground">No entries yet.</p>
                : entries.map((entry) => (
                  <div key={entry.id} className="p-2.5 rounded-xl bg-card border border-border">
                    <div className="flex items-start justify-between mb-1.5 gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {entry.is_private && <span className="flex items-center gap-0.5 text-[9px] text-primary"><Lock className="w-2.5 h-2.5" />Private</span>}
                        {entry.ai_flag_level > 0 && (
                          <span className={`flex items-center gap-0.5 text-[9px] ${entry.ai_flag_level >= 2 ? "text-destructive" : "text-eternia-warning"}`}>
                            <AlertTriangle className="w-2.5 h-2.5" />{entry.ai_flag_level >= 2 ? "Support" : "Monitor"}
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-6 w-6 shrink-0" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed">{entry.content_encrypted}</p>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-xl border border-border bg-muted/20">
          <p className="text-[9px] text-muted-foreground text-center">If you're in crisis, AI may suggest connecting with a professional.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MobileBlackBox;
