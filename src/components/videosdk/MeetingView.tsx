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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MeetingViewProps {
  meetingId: string;
  onMeetingLeave: () => void;
  audioOnly?: boolean;
  sessionId?: string;
  enableMonitoring?: boolean;
  onRiskDetected?: (level: number, snippet: string) => void;
  autoJoin?: boolean;
  onError?: (error: string) => void;
  isTherapistView?: boolean;
  onSilenceAutoEnd?: () => void;
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
  onRiskDetected,
  autoJoin = false,
  onError,
  isTherapistView = false,
  onSilenceAutoEnd,
}: MeetingViewProps) => {
  const [joined, setJoined] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const hasAutoJoined = useRef(false);
  const joinAttempts = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { join, participants, meetingId: sdkMeetingId } = useMeeting({
    onMeetingJoined: () => {
      console.log("[MeetingView] onMeetingJoined fired");
      setJoined("JOINED");
      setTimedOut(false);
      setSdkError(null);
      joinAttempts.current = 0;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    },
    onMeetingLeft: () => {
      console.log("[MeetingView] onMeetingLeft fired");
      onMeetingLeave();
    },
    onError: (error: any) => {
      console.error("[MeetingView] SDK onError:", error);
      const msg = error?.message || error?.code
        ? `VideoSDK error ${error.code || ""}: ${error.message || "Unknown"}`
        : "Video service connection failed";
      setSdkError(msg);
      setJoined(null);
      setTimedOut(true);
      onError?.(msg);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    },
    onMeetingStateChanged: (data: any) => {
      console.log("[MeetingView] Meeting state changed:", data?.state || data);
    },
  });

  // Auto-join: wait for SDK readiness (sdkMeetingId populated), then retry up to 3 times
  useEffect(() => {
    if (!autoJoin || hasAutoJoined.current) return;
    if (!sdkMeetingId) return;

    hasAutoJoined.current = true;
    joinAttempts.current = 0;

    const attemptJoin = () => {
      if (joinAttempts.current >= 3) return;
      joinAttempts.current += 1;
      console.log(`[MeetingView] Join attempt ${joinAttempts.current}, meetingId: ${sdkMeetingId}`);
      setJoined("JOINING");
      join();

      retryTimerRef.current = setTimeout(() => {
        if (joinAttempts.current < 3) {
          attemptJoin();
        }
      }, 5000);
    };

    attemptJoin();

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [autoJoin, sdkMeetingId, join]);

  // Timeout: if JOINING for > 20s, show retry
  useEffect(() => {
    if (joined === "JOINING") {
      timeoutRef.current = setTimeout(() => {
        console.warn("[MeetingView] Join timed out after 20s");
        setTimedOut(true);
      }, 20000);
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [joined]);

  // AI audio monitoring
  const audioMonitor = useAudioMonitor({
    sessionId: sessionId || meetingId,
    enabled: enableMonitoring && joined === "JOINED",
    classifyIntervalMs: 15000,
    onRiskDetected: useCallback((level: number, snippet: string) => {
      onRiskDetected?.(level, snippet);
    }, [onRiskDetected]),
  });

  // Silence detection for therapist view
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

  const joinMeeting = () => {
    setJoined("JOINING");
    setTimedOut(false);
    setSdkError(null);
    hasAutoJoined.current = true;
    join();
  };

  const retryJoin = () => {
    setTimedOut(false);
    setSdkError(null);
    setJoined("JOINING");
    hasAutoJoined.current = false;
    joinAttempts.current = 0;
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
        <button
          onClick={joinMeeting}
          className="btn-primary text-lg px-10 py-4 rounded-xl"
        >
          Join Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
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
        <div
          className={`grid gap-4 h-full ${
            participants.size <= 1
              ? "grid-cols-1"
              : participants.size <= 4
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {[...participants.keys()].map((participantId) => (
            <ParticipantView
              key={participantId}
              participantId={participantId}
              audioOnly={audioOnly}
            />
          ))}
        </div>
      </div>
      <MeetingControls audioOnly={audioOnly} />
      {isTherapistView && sessionId && (
        <TherapistSessionControls
          sessionId={sessionId}
          silenceDurationSec={silenceDetection.silenceDurationSec}
          onSessionEnded={onMeetingLeave}
        />
      )}
    </div>
  );
};

export default MeetingView;
