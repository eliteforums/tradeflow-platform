import { lazy, Suspense } from "react";
import { Shield, Loader2, Phone, X, Mic, MicOff, Video, VideoOff } from "lucide-react";
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
  const { activeSession, isRequesting, isConnecting, token, requestSession, cancelSession, endSession, retryConnection } = useBlackBoxSession();
  const { profile } = useAuth();

  if (isMobile) return <MobileBlackBox />;

  const isQueued = activeSession && activeSession.status === "queued";
  const isInSession = activeSession && activeSession.room_id && token && (activeSession.status === "accepted" || activeSession.status === "active");
  const isConnectingToSession = activeSession && activeSession.room_id && !token && (activeSession.status === "accepted" || activeSession.status === "active");

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] -mt-6">
        {/* Orb */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-lg">
          <NovaOrb
            isActive={!!isInSession}
            isPulsing={!!isQueued || isRequesting || !!isConnectingToSession}
            size={260}
          />

          {/* Status pill */}
          {isConnectingToSession && (
            <div className="px-5 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Connecting…
            </div>
          )}

          {isQueued && !isConnectingToSession && (
            <button
              onClick={cancelSession}
              className="px-5 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-sm text-muted-foreground hover:bg-card transition-colors"
            >
              Waiting for therapist… Tap to cancel
            </button>
          )}

          {isInSession && (
            <button className="px-5 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-sm text-muted-foreground">
              Tap to interrupt
            </button>
          )}

          {!isQueued && !isInSession && (
            <div className="px-5 py-2 rounded-full border border-border bg-card/60 backdrop-blur text-sm text-muted-foreground flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-primary" />
              Anonymous &amp; Encrypted
            </div>
          )}

          {/* Transcript / Status text */}
          <div className="text-center px-6 max-w-md">
            {isInSession ? (
              <p className="text-lg font-semibold font-display leading-relaxed text-foreground">
                Hello! I am Nova. How can I help you today?
              </p>
            ) : isConnectingToSession ? (
              <p className="text-base text-muted-foreground leading-relaxed">
                A therapist accepted. Setting up secure connection…
              </p>
            ) : isQueued ? (
              <p className="text-base text-muted-foreground leading-relaxed">
                You're in the queue. A professional will connect with you shortly.
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

        {/* Bottom controls */}
        <div className="pb-8 pt-6 flex items-center justify-center gap-4">
          {isInSession ? (
            <>
              {/* MeetingProvider — offscreen but DOM-present so WebRTC stays alive */}
              <div
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clip: "rect(0, 0, 0, 0)",
                  whiteSpace: "nowrap",
                  border: 0,
                }}
                aria-hidden="true"
              >
                <Suspense fallback={null}>
                  <LazyMeetingProvider
                    config={{
                      meetingId: activeSession.room_id!,
                      micEnabled: true,
                      webcamEnabled: false,
                      name: profile?.username || "Anonymous",
                      debugMode: false,
                    }}
                    token={token!}
                  >
                    <LazyMeetingView
                      meetingId={activeSession.room_id!}
                      onMeetingLeave={endSession}
                      audioOnly={true}
                      sessionId={activeSession.id}
                      enableMonitoring={true}
                      autoJoin={true}
                    />
                  </LazyMeetingProvider>
                </Suspense>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-14 h-14 bg-muted/30 border-border hover:bg-muted/50"
              >
                <Video className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-16 h-16 bg-accent/20 border-accent/30 hover:bg-accent/30"
              >
                <Mic className="w-6 h-6 text-accent" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-14 h-14"
                onClick={endSession}
              >
                <X className="w-6 h-6" />
              </Button>
            </>
          ) : isQueued ? (
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full px-8 gap-2"
              onClick={cancelSession}
            >
              <X className="w-5 h-5" />
              Cancel Request
            </Button>
          ) : (
            <Button
              size="lg"
              className="rounded-full px-8 gap-2 h-14 text-base"
              disabled={isRequesting}
              onClick={requestSession}
            >
              {isRequesting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Phone className="w-5 h-5" />
              )}
              Request Voice Call
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlackBox;
