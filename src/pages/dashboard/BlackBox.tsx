import { lazy, Suspense } from "react";
import { Shield, Loader2, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";

const LazyMeetingProvider = lazy(() => import("@videosdk.live/react-sdk").then(m => ({ default: m.MeetingProvider })));
const LazyMeetingView = lazy(() => import("@/components/videosdk/MeetingView"));
import { useBlackBoxSession } from "@/hooks/useBlackBoxSession";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBlackBox from "@/components/mobile/MobileBlackBox";

const BlackBox = () => {
  const isMobile = useIsMobile();
  const { activeSession, isRequesting, token, requestSession, cancelSession, endSession } = useBlackBoxSession();
  const { profile } = useAuth();

  if (isMobile) return <MobileBlackBox />;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div><h1 className="text-3xl font-bold font-display mb-1">BlackBox</h1><p className="text-base text-muted-foreground">A safe space for anonymous on-call support</p></div>

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
            <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Connecting...</div>}>
              <LazyMeetingProvider
                config={{
                  meetingId: activeSession.room_id,
                  micEnabled: true,
                  webcamEnabled: false,
                  name: profile?.username || "Anonymous",
                  debugMode: false,
                  joinWithoutUserInteraction: true,
                }}
                token={token}
              >
                <LazyMeetingView meetingId={activeSession.room_id} onMeetingLeave={endSession} audioOnly={true} sessionId={activeSession.id} enableMonitoring={true} autoJoin={true} />
              </LazyMeetingProvider>
            </Suspense>
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
          <div className="flex items-start gap-3"><Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" /><div><h3 className="font-semibold text-sm mb-0.5">Your Privacy is Protected</h3><p className="text-sm text-muted-foreground leading-relaxed">All sessions are anonymous and encrypted end-to-end.</p></div></div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-muted/20"><p className="text-sm text-muted-foreground text-center leading-relaxed">If you're in crisis, our team is here to help — request a voice call above.</p></div>
      </div>
    </DashboardLayout>
  );
};

export default BlackBox;
