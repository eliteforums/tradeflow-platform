import { useState, useCallback, useEffect, useRef } from "react";
// NOTE: autoJoin works via MeetingProvider's joinWithoutUserInteraction config flag
import { useMeeting } from "@videosdk.live/react-sdk";
import { Loader2, Shield, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ParticipantView from "./ParticipantView";
import MeetingControls from "./MeetingControls";
import { useAudioMonitor } from "@/hooks/useAudioMonitor";

interface MeetingViewProps {
  meetingId: string;
  onMeetingLeave: () => void;
  audioOnly?: boolean;
  sessionId?: string;
  enableMonitoring?: boolean;
  onRiskDetected?: (level: number, snippet: string) => void;
  autoJoin?: boolean;
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
}: MeetingViewProps) => {
  const [joined, setJoined] = useState<string | null>(autoJoin ? "JOINING" : null);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { join, participants } = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
      setTimedOut(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    onMeetingLeft: () => onMeetingLeave(),
  });

  // Timeout: if JOINING for > 15s, show retry
  useEffect(() => {
    if (joined === "JOINING") {
      timeoutRef.current = setTimeout(() => {
        setTimedOut(true);
      }, 15000);
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

  const joinMeeting = () => {
    setJoined("JOINING");
    setTimedOut(false);
    join();
  };

  const retryJoin = () => {
    setTimedOut(false);
    setJoined("JOINING");
    join();
  };

  if (joined === "JOINING") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        {timedOut ? (
          <>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
            <p className="text-muted-foreground text-sm">Connection timed out</p>
            <Button onClick={retryJoin} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
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
      {/* AI Monitoring Status Bar */}
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
    </div>
  );
};

export default MeetingView;
