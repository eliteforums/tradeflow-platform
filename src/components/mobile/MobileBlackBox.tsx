import { Phone, X, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import MeetingView from "@/components/videosdk/MeetingView";
import { useBlackBoxSession } from "@/hooks/useBlackBoxSession";
import { useAuth } from "@/contexts/AuthContext";

const MobileBlackBox = () => {
  const { activeSession, isRequesting, token, requestSession, cancelSession, endSession } = useBlackBoxSession();
  const { profile } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <div>
          <h1 className="text-xl font-bold font-display">BlackBox</h1>
          <p className="text-sm text-muted-foreground">Safe space for anonymous support</p>
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
              <MeetingView meetingId={activeSession.room_id} onMeetingLeave={endSession} audioOnly={true} sessionId={activeSession.id} enableMonitoring={true} autoJoin={true} />
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
          <p className="text-sm text-muted-foreground leading-relaxed">All sessions are anonymous and encrypted end-to-end.</p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">If you're in crisis, request a voice call above to connect with a professional.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MobileBlackBox;
