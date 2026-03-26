import { lazy, Suspense, useState, useCallback } from "react";
import { Shield, Loader2, Phone, X, Mic, MicOff, Video, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import NovaOrb from "@/components/blackbox/NovaOrb";

const LazyMeetingProvider = lazy(() => import("@videosdk.live/react-sdk").then(m => ({ default: m.MeetingProvider })));
const LazyMeetingView = lazy(() => import("@/components/videosdk/MeetingView"));
import { useBlackBoxSession } from "@/hooks/useBlackBoxSession";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBlackBox from "@/components/mobile/MobileBlackBox";

const BlackBox = () => {
  const isMobile = useIsMobile();
  const {
    activeSession, isRequesting, callState, token,
    requestSession, cancelSession, endSession, retryConnection,
    fetchToken, onCallJoined, onCallError,
  } = useBlackBoxSession();
  const { profile } = useAuth();

  // Mic toggle wired from MeetingView SDK
  const [toggleMicFn, setToggleMicFn] = useState<(() => void) | null>(null);
  const [micOn, setMicOn] = useState(true);

  const handleToggleMicReady = useCallback((fn: () => void) => {
    setToggleMicFn(() => fn);
  }, []);

  const handleMicStatusChange = useCallback((on: boolean) => {
    setMicOn(on);
  }, []);

  if (isMobile) return <MobileBlackBox />;

  const isQueued = callState === "waiting";
  const isReady = callState === "ready";
  const isJoining = callState === "joining";
  const isFailed = callState === "failed";
  const isJoined = callState === "joined" && !!token && !!activeSession?.room_id;

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] -mt-6">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-lg">
          <NovaOrb
            isActive={isJoined}
            isPulsing={isQueued || isRequesting || isJoining}
            size={260}
          />

          {/* Status pills */}
          {isJoining && (
            <div className="px-5 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Connecting…
            </div>
          )}

          {isFailed && (
            <div className="flex flex-col items-center gap-2">
              <div className="px-5 py-2 rounded-full border border-destructive/30 bg-destructive/10 text-sm text-destructive flex items-center gap-2">
                Connection failed
              </div>
              {activeSession?.last_join_error && (
                <p className="text-xs text-muted-foreground max-w-xs text-center">{activeSession.last_join_error}</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={retryConnection}>
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </Button>
                <Button variant="ghost" size="sm" onClick={cancelSession}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isReady && (
            <div className="px-5 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Therapist found — connecting…
            </div>
          )}

          {isQueued && (
            <button
              onClick={cancelSession}
              className="px-5 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-sm text-muted-foreground hover:bg-card transition-colors"
            >
              Waiting for therapist… Tap to cancel
            </button>
          )}

          {isJoined && (
            <button className="px-5 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-sm text-muted-foreground">
              In session
            </button>
          )}

          {!activeSession && !isRequesting && (
            <div className="px-5 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-sm text-muted-foreground flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-primary" />
              Anonymous &amp; Encrypted
            </div>
          )}

          {/* Status text */}
          <div className="text-center px-6 max-w-md">
            {isJoined ? (
              <p className="text-lg font-semibold font-display leading-relaxed text-foreground">
                Hello! I am Nova. How can I help you today?
              </p>
            ) : isReady || isJoining ? (
              <p className="text-base text-muted-foreground leading-relaxed">
                Setting up secure connection…
              </p>
            ) : isQueued ? (
              <p className="text-base text-muted-foreground leading-relaxed">
                You're in the queue. A professional will connect with you shortly.
              </p>
            ) : isFailed ? (
              <p className="text-base text-muted-foreground leading-relaxed">
                Could not connect. Please retry or cancel and try again.
              </p>
            ) : (
              <>
                <h2 className="text-xl font-bold font-display mb-2 text-foreground">Talk to Someone Now</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect anonymously with a professional — 24/7 on-call support.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Meeting provider — keyed by session+room so it remounts on change */}
        {!!token && !!activeSession?.room_id && callState !== "idle" && (
          <div
            key={`${activeSession.id}-${activeSession.room_id}`}
            style={{
              position: "absolute", width: 1, height: 1, overflow: "hidden",
              clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0,
            }}
            aria-hidden="true"
          >
            <Suspense fallback={null}>
              <LazyMeetingProvider
                config={{
                  meetingId: activeSession.room_id,
                  micEnabled: true,
                  webcamEnabled: false,
                  name: profile?.username || "Anonymous",
                  debugMode: false,
                }}
                token={token}
                joinWithoutUserInteraction={false}
              >
                <LazyMeetingView
                  meetingId={activeSession.room_id}
                  onMeetingLeave={endSession}
                  audioOnly={true}
                  sessionId={activeSession.id}
                  enableMonitoring={false}
                  autoJoin={true}
                  onJoined={onCallJoined}
                  onJoinError={onCallError}
                  hideControls={true}
                  onToggleMicReady={handleToggleMicReady}
                  onMicStatusChange={handleMicStatusChange}
                />
              </LazyMeetingProvider>
            </Suspense>
          </div>
        )}

        {/* Bottom controls */}
        <div className="pb-8 pt-6 flex items-center justify-center gap-4">
          {isJoined ? (
            <>
              <Button variant="outline" size="icon" className="rounded-full w-14 h-14 bg-muted/30 border-border hover:bg-muted/50">
                <Video className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full w-16 h-16 ${micOn ? "bg-accent/20 border-accent/30 hover:bg-accent/30" : "bg-destructive/20 border-destructive/30 hover:bg-destructive/30"}`}
                onClick={() => toggleMicFn?.()}
              >
                {micOn ? (
                  <Mic className="w-6 h-6 text-accent" />
                ) : (
                  <MicOff className="w-6 h-6 text-destructive" />
                )}
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full w-14 h-14" onClick={endSession}>
                <X className="w-6 h-6" />
              </Button>
            </>
          ) : isQueued || isFailed ? (
            <Button variant="destructive" size="lg" className="rounded-full px-8 gap-2" onClick={cancelSession}>
              <X className="w-5 h-5" />
              Cancel Request
            </Button>
          ) : isReady || isJoining ? null : (
            <Button
              size="lg"
              className="rounded-full px-8 gap-2 h-14 text-base"
              disabled={isRequesting}
              onClick={requestSession}
            >
              {isRequesting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
              Request Voice Call
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlackBox;
