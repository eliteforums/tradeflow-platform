import { useState, useCallback } from "react";
import { Phone, X, Mic, MicOff, Video, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import MeetingView from "@/components/videosdk/MeetingView";
import { useBlackBoxSession } from "@/hooks/useBlackBoxSession";
import { useAuth } from "@/contexts/AuthContext";
import NovaOrb from "@/components/blackbox/NovaOrb";

const MobileBlackBox = () => {
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

  const isQueued = callState === "waiting";
  const isReady = callState === "ready";
  const isJoining = callState === "joining";
  const isFailed = callState === "failed";
  const isJoined = callState === "joined" && !!token && !!activeSession?.room_id;

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-between min-h-[calc(100vh-5rem)] pb-24 pt-4">
        <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full">
          <NovaOrb
            isActive={isJoined}
            isPulsing={isQueued || isRequesting || isJoining}
            size={200}
          />

          {isJoining && (
            <div className="px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting…
            </div>
          )}

          {isFailed && (
            <div className="flex flex-col items-center gap-1.5">
              <div className="px-4 py-1.5 rounded-full border border-destructive/30 bg-destructive/10 text-xs text-destructive">
                Connection failed
              </div>
              {activeSession?.last_join_error && (
                <p className="text-[10px] text-muted-foreground max-w-[200px] text-center">{activeSession.last_join_error}</p>
              )}
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={retryConnection}>
                  <RefreshCw className="w-3 h-3" /> Retry
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={cancelSession}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isReady && (
            <div className="px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Therapist found — connecting…
            </div>
          )}

          {isQueued && (
            <button
              onClick={cancelSession}
              className="px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground"
            >
              Waiting for therapist…
            </button>
          )}

          {isJoined && (
            <button className="px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground">
              In session
            </button>
          )}

          {!activeSession && !isRequesting && (
            <div className="px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-primary" />
              Anonymous &amp; Encrypted
            </div>
          )}

          <div className="text-center px-6 max-w-xs">
            {isJoined ? (
              <p className="text-base font-semibold font-display leading-relaxed text-foreground">
                Hello! I am Nova. How can I help you today?
              </p>
            ) : isReady || isJoining ? (
              <p className="text-sm text-muted-foreground">
                Setting up secure connection…
              </p>
            ) : isQueued ? (
              <p className="text-sm text-muted-foreground">
                You're in the queue. A professional will connect shortly.
              </p>
            ) : isFailed ? (
              <p className="text-sm text-muted-foreground">
                Could not connect. Please retry.
              </p>
            ) : (
              <>
                <h2 className="text-lg font-bold font-display mb-1 text-foreground">Talk to Someone Now</h2>
                <p className="text-xs text-muted-foreground">
                  Connect anonymously with a professional — 24/7 on-call support.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Meeting provider — keyed so it remounts on session/room change */}
        {!!token && !!activeSession?.room_id && callState !== "idle" && (
          <div
            key={`${activeSession.id}-${activeSession.room_id}`}
            style={{
              position: "absolute", width: 1, height: 1, overflow: "hidden",
              clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0,
            }}
            aria-hidden="true"
          >
            <MeetingProvider
              config={{
                meetingId: activeSession.room_id,
                micEnabled: true,
                webcamEnabled: false,
                name: profile?.username || "Anonymous",
                debugMode: false,
              }}
              token={token}
              joinWithoutUserInteraction={true}
            >
              <MeetingView
                meetingId={activeSession.room_id}
                onMeetingLeave={endSession}
                audioOnly={true}
                sessionId={activeSession.id}
                enableMonitoring={true}
                autoJoin={true}
                onJoined={onCallJoined}
                onJoinError={onCallError}
                hideControls={true}
                onToggleMicReady={handleToggleMicReady}
                onMicStatusChange={handleMicStatusChange}
              />
            </MeetingProvider>
          </div>
        )}

        {/* Bottom controls */}
        <div className="pt-4 flex items-center justify-center gap-4">
          {isJoined ? (
            <>
              <Button variant="outline" size="icon" className="rounded-full w-12 h-12 bg-muted/30 border-border">
                <Video className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={`rounded-full w-14 h-14 ${micOn ? "bg-accent/20 border-accent/30" : "bg-destructive/20 border-destructive/30"}`}
                onClick={() => toggleMicFn?.()}
              >
                {micOn ? (
                  <Mic className="w-6 h-6 text-accent" />
                ) : (
                  <MicOff className="w-6 h-6 text-destructive" />
                )}
              </Button>
              <Button variant="destructive" size="icon" className="rounded-full w-12 h-12" onClick={endSession}>
                <X className="w-5 h-5" />
              </Button>
            </>
          ) : isQueued || isFailed ? (
            <Button variant="destructive" className="rounded-full px-6 gap-2" onClick={cancelSession}>
              <X className="w-4 h-4" />
              Cancel
            </Button>
          ) : isReady || isJoining ? null : (
            <Button className="rounded-full px-6 gap-2 h-12" disabled={isRequesting} onClick={requestSession}>
              {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              Request Voice Call
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MobileBlackBox;
