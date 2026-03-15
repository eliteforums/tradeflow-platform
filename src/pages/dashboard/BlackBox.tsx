import { useState } from "react";
import { Plus, Lock, Mic, Type, Send, Clock, Shield, AlertTriangle, Trash2, Eye, EyeOff, Loader2, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { lazy, Suspense } from "react";

const LazyMeetingProvider = lazy(() => import("@videosdk.live/react-sdk").then(m => ({ default: m.MeetingProvider })));
const LazyMeetingView = lazy(() => import("@/components/videosdk/MeetingView"));
import { useBlackBox } from "@/hooks/useBlackBox";
import { useBlackBoxSession } from "@/hooks/useBlackBoxSession";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBlackBox from "@/components/mobile/MobileBlackBox";

const BlackBox = () => {
  const isMobile = useIsMobile();
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

  if (isMobile) return <MobileBlackBox />;

  const getCrisisIndicator = (level: number) => {
    if (level === 0) return null;
    if (level === 1) return <span className="flex items-center gap-1 text-xs text-eternia-warning"><AlertTriangle className="w-3 h-3" />Monitoring</span>;
    return <span className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="w-3 h-3" />Support Available</span>;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div><h1 className="text-3xl font-bold font-display mb-1">BlackBox</h1><p className="text-base text-muted-foreground">A safe space for anonymous emotional expression & on-call support</p></div>

        {/* Talk Now — Queue-based */}
        {activeSession && (activeSession.status === "queued") ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="font-semibold font-display text-base mb-1">Waiting for a therapist...</h2>
                <p className="text-sm text-muted-foreground">You're in the queue. A professional will connect shortly.</p>
              </div>
              <Button variant="outline" onClick={cancelSession} className="gap-1.5">
                <X className="w-4 h-4" />Cancel Request
              </Button>
            </div>
          </div>
        ) : activeSession && activeSession.room_id && token && (activeSession.status === "accepted" || activeSession.status === "active") ? (
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <span className="font-semibold font-display text-sm">Audio Session</span>
              </div>
              <Button variant="destructive" size="sm" onClick={endSession}>End Call</Button>
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
              <MeetingView meetingId={activeSession.room_id} onMeetingLeave={endSession} />
            </MeetingProvider>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0"><Phone className="w-6 h-6 text-primary" /></div>
              <div className="flex-1">
                <h2 className="font-semibold font-display text-base mb-1">Talk to Someone Now</h2>
                <p className="text-sm text-muted-foreground mb-3">Connect anonymously with a professional — 24/7 on-call support.</p>
                <Button className="h-10 text-sm gap-1.5 px-5" disabled={isRequesting} onClick={requestSession}>
                  {isRequesting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Phone className="w-4 h-4 mr-1" />}
                  Request Voice Call
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-gradient-eternia-subtle border border-border">
          <div className="flex items-start gap-3"><Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" /><div><h3 className="font-semibold text-sm mb-0.5">Your Privacy is Protected</h3><p className="text-sm text-muted-foreground leading-relaxed">All entries are encrypted. Private entries are never scanned.</p></div></div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-display text-base flex items-center gap-2"><Plus className="w-5 h-5 text-primary" />New Entry</h2>
            <div className="flex items-center gap-3"><span className="text-sm text-muted-foreground">Private</span><Switch checked={isPrivate} onCheckedChange={setIsPrivate} />{isPrivate && <Lock className="w-4 h-4 text-primary" />}</div>
          </div>
          <Textarea placeholder="Express yourself freely..." value={newEntry} onChange={(e) => setNewEntry(e.target.value)} className="min-h-[150px] bg-muted/30 border-border resize-none mb-4 text-sm" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><Button variant="outline" size="icon" className="h-9 w-9"><Mic className="w-4 h-4" /></Button><Button variant="outline" size="icon" className="h-9 w-9"><Type className="w-4 h-4" /></Button></div>
            <Button className="btn-primary h-10 text-sm px-4" disabled={!newEntry.trim() || isCreating} onClick={handleSaveEntry}>{isCreating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Send className="w-4 h-4 mr-1.5" />}Save</Button>
          </div>
          {isPrivate && <p className="text-xs text-muted-foreground mt-2.5 flex items-center gap-1"><Lock className="w-3 h-3" />Private entries are not analyzed by AI</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold font-display text-base">Your Entries</h2>
            <Button variant="ghost" size="sm" onClick={() => setShowEntries(!showEntries)} className="text-muted-foreground h-8 text-xs">{showEntries ? <><EyeOff className="w-3.5 h-3.5 mr-1.5" />Hide</> : <><Eye className="w-3.5 h-3.5 mr-1.5" />Show</>}</Button>
          </div>
          {showEntries && (
            <div className="space-y-3">
              {isLoading ? <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
                : entries.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">No entries yet.</div>
                : entries.map((entry) => (
                  <div key={entry.id} className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        {entry.is_private && <span className="flex items-center gap-1 text-[11px] text-primary"><Lock className="w-3 h-3" />Private</span>}
                        {getCrisisIndicator(entry.ai_flag_level)}
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-7 w-7 shrink-0" onClick={() => deleteEntry(entry.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed">{entry.content_encrypted}</p>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl border border-border bg-muted/20"><p className="text-sm text-muted-foreground text-center leading-relaxed">If you're in crisis, our AI may suggest connecting with a professional.</p></div>
      </div>
    </DashboardLayout>
  );
};

export default BlackBox;
