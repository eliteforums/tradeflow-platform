import { Phone, X, Mic, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import MeetingView from "@/components/videosdk/MeetingView";
import { useBlackBoxSession } from "@/hooks/useBlackBoxSession";
import { useAuth } from "@/contexts/AuthContext";
import NovaOrb from "@/components/blackbox/NovaOrb";

const MobileBlackBox = () => {
  const { activeSession, isRequesting, isConnecting, token, requestSession, cancelSession, endSession } = useBlackBoxSession();
  const { profile } = useAuth();

  const isQueued = activeSession && activeSession.status === "queued";
  const isInSession = activeSession && activeSession.room_id && token && (activeSession.status === "accepted" || activeSession.status === "active");
  const isConnectingToSession = activeSession && activeSession.room_id && !token && (activeSession.status === "accepted" || activeSession.status === "active");

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-between min-h-[calc(100vh-5rem)] pb-24 pt-4">
        {/* Orb area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full">
          <NovaOrb
            isActive={!!isInSession}
            isPulsing={!!isQueued || isRequesting || !!isConnectingToSession}
            size={200}
          />

          {/* Status pill */}
          {isConnectingToSession && (
            <div className="px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Connecting…
            </div>
          )}

          {isQueued && !isConnectingToSession && (
            <button
              onClick={cancelSession}
              className="px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground"
            >
              Waiting for therapist…
            </button>
          )}

          {isInSession && (
            <button className="px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground">
              Tap to interrupt
            </button>
          )}

          {!isQueued && !isInSession && (
            <div className="px-4 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-primary" />
              Anonymous &amp; Encrypted
            </div>
          )}

          {/* Text */}
          <div className="text-center px-6 max-w-xs">
            {isInSession ? (
              <p className="text-base font-semibold font-display leading-relaxed text-foreground">
                Hello! I am Nova. How can I help you today?
              </p>
            ) : isConnectingToSession ? (
              <p className="text-sm text-muted-foreground">
                A therapist accepted. Setting up secure connection…
              </p>
            ) : isQueued ? (
              <p className="text-sm text-muted-foreground">
                You're in the queue. A professional will connect shortly.
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

        {/* MeetingProvider — offscreen but DOM-present so WebRTC stays alive */}
        {isInSession && (
          <div
            style={{
              position: "fixed",
              top: -9999,
              left: -9999,
              width: 1,
              height: 1,
              opacity: 0,
              pointerEvents: "none",
            }}
            aria-hidden="true"
          >
            <MeetingProvider
              config={{
                meetingId: activeSession.room_id!,
                micEnabled: true,
                webcamEnabled: false,
                name: profile?.username || "Anonymous",
                debugMode: false,
              }}
              token={token!}
            >
              <MeetingView
                meetingId={activeSession.room_id!}
                onMeetingLeave={endSession}
                audioOnly={true}
                sessionId={activeSession.id}
                enableMonitoring={true}
                autoJoin={true}
              />
            </MeetingProvider>
          </div>
        )}

        {/* Bottom controls */}
        <div className="pt-4 flex items-center justify-center gap-4">
          {isInSession ? (
            <>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12 bg-muted/30 border-border"
              >
                <Video className="w-5 h-5 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-14 h-14 bg-accent/20 border-accent/30"
              >
                <Mic className="w-6 h-6 text-accent" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="rounded-full w-12 h-12"
                onClick={endSession}
              >
                <X className="w-5 h-5" />
              </Button>
            </>
          ) : isQueued ? (
            <Button
              variant="destructive"
              className="rounded-full px-6 gap-2"
              onClick={cancelSession}
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          ) : (
            <Button
              className="rounded-full px-6 gap-2 h-12"
              disabled={isRequesting}
              onClick={requestSession}
            >
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
