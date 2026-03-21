import { useState } from "react";
import { Plus, Lock, Mic, Type, Send, Clock, Shield, AlertTriangle, Trash2, Eye, EyeOff, Loader2, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import MeetingView from "@/components/videosdk/MeetingView";
import { useBlackBox } from "@/hooks/useBlackBox";
import { useBlackBoxSession } from "@/hooks/useBlackBoxSession";
import { useAuth } from "@/contexts/AuthContext";

const MobileBlackBox = () => {
  const [newEntry, setNewEntry] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showEntries, setShowEntries] = useState(true);
  const { entries, isLoading, createEntry, deleteEntry, isCreating } = useBlackBox();
  const { activeSession, isRequesting, token, requestSession, cancelSession, endSession } = useBlackBoxSession();
  const { profile } = useAuth();

  const handleSaveEntry = () => {
    if (!newEntry.trim()) return;
    createEntry({ content: newEntry, isPrivate }, { onSuccess: () => setNewEntry("") });
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <div>
          <h1 className="text-xl font-bold font-display">BlackBox</h1>
          <p className="text-sm text-muted-foreground">Safe space for anonymous expression & support</p>
        </div>

        {/* Talk Now — Queue-based */}
        {activeSession && activeSession.status === "queued" ? (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold text-sm">Waiting for a therapist...</h2>
                <p className="text-xs text-muted-foreground mt-1">You're in the queue.</p>
              </div>
              <Button variant="outline" size="sm" onClick={cancelSession} className="gap-1.5">
                <X className="w-4 h-4" />Cancel
              </Button>
            </div>
          </div>
        ) : activeSession && activeSession.room_id && token && (activeSession.status === "accepted" || activeSession.status === "active") ? (
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Audio Session</span>
              </div>
              <Button variant="destructive" size="sm" onClick={endSession} className="h-8 text-xs">End</Button>
            </div>
            <MeetingProvider
              config={{
                meetingId: activeSession.room_id,
                micEnabled: true,
                webcamEnabled: false,
                name: profile?.username || "Anonymous",
                debugMode: false,
              }}
              token={token}
            >
              <MeetingView meetingId={activeSession.room_id} onMeetingLeave={endSession} audioOnly={true} sessionId={activeSession.id} enableMonitoring={true} />
            </MeetingProvider>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <h2 className="font-semibold text-sm mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />Talk to Someone Now</h2>
            <p className="text-xs text-muted-foreground mb-3">Connect anonymously with a professional — 24/7 on-call support.</p>
            <Button className="w-full h-10 text-sm gap-1.5" disabled={isRequesting} onClick={requestSession}>
              {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              Request Voice Call
            </Button>
          </div>
        )}

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
