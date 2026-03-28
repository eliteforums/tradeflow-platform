import { useState, useCallback, useEffect, useRef } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { Loader2, Shield, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ParticipantView from "./ParticipantView";
import MeetingControls from "./MeetingControls";
import { useAudioMonitor } from "@/hooks/useAudioMonitor";
import { useSilenceDetection } from "@/hooks/useSilenceDetection";
import TherapistSessionControls from "@/components/blackbox/TherapistSessionControls";
import AISuggestionPopup from "@/components/blackbox/AISuggestionPopup";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MeetingViewProps {
  meetingId: string;
  onMeetingLeave: () => void;
  audioOnly?: boolean;
  sessionId?: string;
  sessionType?: "blackbox" | "peer";
  enableMonitoring?: boolean;
  onRiskDetected?: (level: number, snippet: string) => void;
  autoJoin?: boolean;
  onError?: (error: string) => void;
  isTherapistView?: boolean;
  onSilenceAutoEnd?: () => void;
  onJoined?: () => void;
  onJoinError?: (error: string) => void;
  onCaptureSnippetReady?: (captureFn: () => string) => void;
  onLeaveReady?: (leaveFn: () => void) => void;
  onEscalateFromSuggestion?: (snippet: string, riskLevel: number) => void;
  hideControls?: boolean;
  onToggleMicReady?: (toggleFn: () => void) => void;
  onMicStatusChange?: (micOn: boolean) => void;
  onEscalate?: () => void;
}

const riskColors: Record<number, string> = {
  0: "bg-muted text-muted-foreground",
  1: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  2: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  3: "bg-destructive/20 text-destructive border-destructive/30",
};

const riskLabels: Record<number, string> = {
  0: "Normal",
  1: "L1 — Mild",
  2: "L2 — Moderate",
  3: "L3 — Critical",
};

const MeetingView = ({
  meetingId,
  onMeetingLeave,
  audioOnly = false,
  sessionId,
  enableMonitoring = false,
  sessionType = "blackbox",
  onRiskDetected,
  autoJoin = false,
  onError,
  isTherapistView = false,
  onSilenceAutoEnd,
  onJoined,
  onJoinError,
  onCaptureSnippetReady,
  onLeaveReady,
  onEscalateFromSuggestion,
  hideControls = false,
  onToggleMicReady,
  onMicStatusChange,
  onEscalate,
}: MeetingViewProps) => {
  const [joined, setJoined] = useState<string | null>(null);
  const joinedRef = useRef<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const hasAutoJoined = useRef(false);
  const joinInFlightRef = useRef(false); // single in-flight join lock
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinSucceeded = useRef(false);
  const unmountedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    unmountedRef.current = false;
    return () => {
      unmountedRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const { join, leave, participants, localParticipant, toggleMic, localMicOn } = useMeeting({
    onMeetingJoined: () => {
      if (unmountedRef.current) return;
      console.log("[MeetingView] onMeetingJoined fired");
      joinSucceeded.current = true;
      joinInFlightRef.current = false;
      joinedRef.current = "JOINED";
      setJoined("JOINED");
      setTimedOut(false);
      setSdkError(null);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      onJoined?.();
    },
    onMeetingLeft: () => {
      console.log("[MeetingView] onMeetingLeft fired");
      joinInFlightRef.current = false;
      onMeetingLeave();
    },
    onError: (error: any) => {
      if (unmountedRef.current) return;
      console.error("[MeetingView] SDK onError:", error);
      const msg = error?.message || error?.code
        ? `VideoSDK error ${error.code || ""}: ${error.message || "Unknown"}`
        : "Video service connection failed";
      setSdkError(msg);
      joinedRef.current = null;
      joinInFlightRef.current = false;
      setJoined(null);
      setTimedOut(true);
      onError?.(msg);
      onJoinError?.(msg);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    onMeetingStateChanged: (data: any) => {
      console.log("[MeetingView] Meeting state changed:", data?.state || data);
    },
  });

  // Expose toggleMic to parent only after joined
  useEffect(() => {
    if (onToggleMicReady && toggleMic && joined === "JOINED") {
      onToggleMicReady(() => toggleMic());
    }
  }, [toggleMic, onToggleMicReady, joined]);

  // Notify parent of mic status changes
  useEffect(() => {
    if (onMicStatusChange !== undefined && localMicOn !== undefined && joined === "JOINED") {
      onMicStatusChange?.(localMicOn);
    }
  }, [localMicOn, onMicStatusChange, joined]);

  // Auto-join with single-attempt lock — no recursive retries
  useEffect(() => {
    if (!autoJoin || hasAutoJoined.current) return;
    if (!meetingId) return;

    hasAutoJoined.current = true;
    joinSucceeded.current = false;

    const doJoin = () => {
      if (unmountedRef.current || joinSucceeded.current || joinedRef.current === "JOINED" || joinInFlightRef.current) return;
      joinInFlightRef.current = true;
      console.log(`[MeetingView] Auto-join attempt, meetingId: ${meetingId}`);
      joinedRef.current = "JOINING";
      setJoined("JOINING");
      join();
    };

    // Request microphone permission before joining
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          if (!unmountedRef.current) {
            setTimeout(doJoin, 300);
          }
        })
        .catch((err) => {
          console.error("[MeetingView] Mic permission denied:", err);
          toast.error("Microphone access denied. Please allow microphone permission and try again.");
          onJoinError?.("Microphone permission denied");
        });
    } else {
      setTimeout(doJoin, 300);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [autoJoin, meetingId, join, onJoinError]);

  // Timeout
  useEffect(() => {
    if (joined === "JOINING") {
      timeoutRef.current = setTimeout(() => {
        if (unmountedRef.current) return;
        console.warn("[MeetingView] Join timed out after 20s");
        joinInFlightRef.current = false;
        setTimedOut(true);
        onJoinError?.("Connection timed out");
      }, 20000);
      return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }
  }, [joined, onJoinError]);

  // AI audio monitoring
  const audioMonitor = useAudioMonitor({
    sessionId: sessionId || meetingId,
    sessionType,
    enabled: enableMonitoring && joined === "JOINED",
    classifyIntervalMs: 10000,
    onRiskDetected: useCallback((level: number, snippet: string) => {
      onRiskDetected?.(level, snippet);
    }, [onRiskDetected]),
  });

  // Expose captureEscalationSnippet to parent
  useEffect(() => {
    if (joined === "JOINED" && enableMonitoring && onCaptureSnippetReady) {
      onCaptureSnippetReady(audioMonitor.captureEscalationSnippet);
    }
  }, [joined, enableMonitoring, onCaptureSnippetReady, audioMonitor.captureEscalationSnippet]);

  // Expose leave function to parent
  useEffect(() => {
    if (onLeaveReady) {
      onLeaveReady(leave);
    }
  }, [leave, onLeaveReady]);

  const handleSilenceAutoEnd = useCallback(async () => {
    if (!sessionId) return;
    try {
      await supabase.functions.invoke("refund-blackbox-session", {
        body: { session_id: sessionId, reason: "Auto-ended: 5 min silence" },
      });
      toast.info("Session ended due to inactivity. Student has been refunded.");
      onSilenceAutoEnd?.();
      onMeetingLeave();
    } catch {
      toast.error("Failed to auto-end session");
    }
  }, [sessionId, onSilenceAutoEnd, onMeetingLeave]);

  const silenceDetection = useSilenceDetection({
    enabled: isTherapistView && joined === "JOINED",
    warningThresholdSec: 120,
    autoEndThresholdSec: 300,
    onWarning: () => toast.warning("Student has been silent for 2+ minutes"),
    onAutoEnd: handleSilenceAutoEnd,
  });

  // Handle escalation from AI suggestion popup
  const handleEscalateFromSuggestion = useCallback(() => {
    const snippet = audioMonitor.captureEscalationSnippet();
    const riskLevel = audioMonitor.lastSuggestion?.risk_level || audioMonitor.riskLevel;
    audioMonitor.dismissSuggestion();
    
    if (onEscalateFromSuggestion) {
      onEscalateFromSuggestion(snippet, riskLevel);
    } else {
      toast.info("Escalation triggered — use the escalation panel to proceed.");
    }
  }, [audioMonitor, onEscalateFromSuggestion]);

  const joinMeeting = () => {
    if (joinInFlightRef.current) return;
    joinInFlightRef.current = true;
    joinedRef.current = "JOINING";
    setJoined("JOINING");
    setTimedOut(false);
    setSdkError(null);
    hasAutoJoined.current = true;
    joinSucceeded.current = false;
    join();
  };

  const retryJoin = () => {
    if (joinInFlightRef.current) return;
    setTimedOut(false);
    setSdkError(null);
    joinInFlightRef.current = true;
    joinedRef.current = "JOINING";
    setJoined("JOINING");
    hasAutoJoined.current = true;
    joinSucceeded.current = false;
    join();
  };

  if (joined === "JOINING" || (timedOut && joined !== "JOINED")) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        {timedOut ? (
          <>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <p className="text-muted-foreground text-sm">
              {sdkError || "Connection timed out — the video service may be unavailable"}
            </p>
            <Button onClick={retryJoin} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
            <Button onClick={onMeetingLeave} variant="ghost" size="sm" className="text-xs">
              Leave
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Joining the session...</p>
          </>
        )}
      </div>
    );
  }

  if (joined !== "JOINED") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-1">Session ID</p>
          <p className="text-lg font-mono text-foreground">{meetingId}</p>
        </div>
        <button onClick={joinMeeting} className="btn-primary text-lg px-10 py-4 rounded-xl">
          Join Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {enableMonitoring && (
        <div className="px-4 py-2 border-b border-border flex items-center justify-between bg-card/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              AI Monitor {audioMonitor.isListening ? "Active" : "Inactive"}
            </span>
            {audioMonitor.isProcessing && (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            )}
          </div>
          <Badge className={`text-[10px] ${riskColors[audioMonitor.riskLevel]}`}>
            {audioMonitor.riskLevel > 0 && <AlertTriangle className="w-3 h-3 mr-1" />}
            {riskLabels[audioMonitor.riskLevel]}
          </Badge>
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto">
        {(() => {
          const participantIds = [...participants.keys()].filter(
            (id) => !(audioOnly && localParticipant && id === localParticipant.id)
          );
          return (
            <div className={`grid gap-4 h-full ${
              participantIds.length <= 1 ? "grid-cols-1" : participantIds.length <= 4 ? "grid-cols-2" : "grid-cols-3"
            }`}>
              {participantIds.map((participantId) => (
                <ParticipantView key={participantId} participantId={participantId} audioOnly={audioOnly} />
              ))}
            </div>
          );
        })()}
      </div>
      {!hideControls && <MeetingControls audioOnly={audioOnly} onEscalate={onEscalate} />}
      {isTherapistView && sessionId && (
        <TherapistSessionControls
          sessionId={sessionId}
          silenceDurationSec={silenceDetection.silenceDurationSec}
          onSessionEnded={onMeetingLeave}
          captureEscalationSnippet={audioMonitor.captureEscalationSnippet}
        />
      )}

      {/* AI Suggestion Popup */}
      {enableMonitoring && audioMonitor.lastSuggestion && (
        <AISuggestionPopup
          suggestion={audioMonitor.lastSuggestion}
          onDismiss={audioMonitor.dismissSuggestion}
          onEscalate={handleEscalateFromSuggestion}
        />
      )}
    </div>
  );
};

export default MeetingView;
