import { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle, Phone, PhoneCall, Loader2, Shield, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import VideoCallModal from "@/components/videosdk/VideoCallModal";

interface L3Session {
  id: string;
  student_id: string;
  therapist_id: string | null;
  flag_level: number;
  escalation_reason: string | null;
  room_id: string | null;
  status: string;
  created_at: string;
}

const ExpertL3AlertPanel = () => {
  const { user, profile } = useAuth();
  const [l3Sessions, setL3Sessions] = useState<L3Session[]>([]);
  const [joining, setJoining] = useState<string | null>(null);
  const [callModal, setCallModal] = useState<{ open: boolean; appointmentId?: string }>({ open: false });
  const [activeSession, setActiveSession] = useState<L3Session | null>(null);
  const [escalating, setEscalating] = useState(false);
  const [showEscalateConfirm, setShowEscalateConfirm] = useState(false);

  // Ref to hold the captureEscalationSnippet function from MeetingView's audio monitor
  const captureSnippetRef = useRef<(() => string) | null>(null);

  const handleCaptureSnippetReady = useCallback((captureFn: () => string) => {
    captureSnippetRef.current = captureFn;
  }, []);

  const handleRiskDetected = useCallback((level: number, snippet: string) => {
    if (level >= 2) {
      toast.warning(`⚠️ AI detected risk level L${level} during session`, { duration: 8000 });
    }
  }, []);

  // Fetch active L3 sessions
  useEffect(() => {
    if (!user) return;

    const fetchL3 = async () => {
      const { data } = await supabase
        .from("blackbox_sessions")
        .select("id, student_id, therapist_id, flag_level, escalation_reason, room_id, status, created_at")
        .gte("flag_level", 3)
        .in("status", ["active", "accepted", "queued", "escalated"])
        .order("created_at", { ascending: false });
      if (data) setL3Sessions(data);
    };

    fetchL3();

    const channel = supabase
      .channel("expert-l3-alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blackbox_sessions" },
        (payload) => {
          const session = (payload.new as any);
          if (session && session.flag_level >= 3 && ["active", "accepted", "queued", "escalated"].includes(session.status)) {
            setL3Sessions((prev) => {
              const exists = prev.find((s) => s.id === session.id);
              if (exists) return prev.map((s) => (s.id === session.id ? session : s));
              toast.error("🚨 CRITICAL: High-risk BlackBox session detected!", { duration: 10000 });
              return [session, ...prev];
            });
          } else if (session) {
            setL3Sessions((prev) => prev.filter((s) => s.id !== session.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleAcceptAndJoin = async (session: L3Session) => {
    if (!user) return;
    setJoining(session.id);
    try {
      const { error } = await supabase
        .from("blackbox_sessions")
        .update({ therapist_id: user.id, status: "accepted" })
        .eq("id", session.id);
      if (error) throw error;

      setActiveSession({ ...session, therapist_id: user.id, status: "accepted" });
      setCallModal({ open: true, appointmentId: session.id });
      toast.success("Session accepted — joining call");
    } catch (err: any) {
      toast.error(err.message || "Failed to join session");
    }
    setJoining(null);
  };

  const handleEmergencyEscalation = async () => {
    if (!user || !activeSession) return;
    setEscalating(true);
    try {
      // Capture ±10s transcript from the live audio monitor
      const transcriptSnippet = captureSnippetRef.current ? captureSnippetRef.current() : "";

      const { data, error } = await supabase.functions.invoke("escalate-emergency", {
        body: {
          session_id: activeSession.id,
          justification: `L3 Emergency escalation by expert during BlackBox session. ${activeSession.escalation_reason || "Critical risk detected by AI."}`,
          transcript_snippet: transcriptSnippet || null,
        },
      });

      if (error) throw new Error(error.message || "Escalation failed");
      if (data?.error) throw new Error(data.error);

      toast.success("Emergency contact shared with SPOC dashboard");
      setShowEscalateConfirm(false);
    } catch (err: any) {
      toast.error(err.message || "Escalation failed");
    }
    setEscalating(false);
  };

  if (l3Sessions.length === 0) return null;

  return (
    <>
      {/* Emergency Alert Banner */}
      <div className="space-y-3">
        {l3Sessions.map((session) => (
          <div
            key={session.id}
            className="p-4 rounded-xl border-2 border-destructive/50 bg-destructive/10 animate-pulse-slow"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm text-destructive">🚨 L3 Critical — Emergency Session</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground">
                    L{session.flag_level}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {session.escalation_reason || "High-risk content detected by AI safety system"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(session.created_at), "MMM d · h:mm a")} · Room: {session.room_id || "—"}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {activeSession?.id === session.id ? (
                    <>
                      <Button
                        size="sm"
                        className="gap-1.5 h-8 text-xs"
                        onClick={() => setCallModal({ open: true, appointmentId: session.id })}
                      >
                        <Video className="w-3.5 h-3.5" />
                        Rejoin Call
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1.5 h-8 text-xs"
                        onClick={() => setShowEscalateConfirm(true)}
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Escalate — Share Emergency Contact
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5 h-8 text-xs"
                      onClick={() => handleAcceptAndJoin(session)}
                      disabled={joining === session.id}
                    >
                      {joining === session.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Shield className="w-3.5 h-3.5" />
                      )}
                      Accept & Join Call
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Escalation Confirmation Dialog */}
      <Dialog open={showEscalateConfirm} onOpenChange={setShowEscalateConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <PhoneCall className="w-5 h-5" />
              Emergency Escalation
            </DialogTitle>
            <DialogDescription>
              This will fetch the student's emergency contact and share it with the SPOC dashboard. This action is audited and irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-muted-foreground">
            <p className="font-medium text-destructive mb-1">⚠️ Final escalation step</p>
            <p>The student's emergency contact information will be revealed to the institution SPOC for immediate intervention.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateConfirm(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={escalating}
              onClick={handleEmergencyEscalation}
              className="gap-1.5"
            >
              {escalating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
              Confirm Escalation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Call Modal — with AI monitoring enabled */}
      <VideoCallModal
        isOpen={callModal.open}
        onClose={() => {
          setCallModal({ open: false });
          captureSnippetRef.current = null;
        }}
        participantName={profile?.username || "Expert"}
        mode="video"
        existingRoomId={activeSession?.room_id || undefined}
        sessionId={activeSession?.id}
        sessionType="blackbox"
        enableMonitoring={true}
        isTherapistView={true}
        onRiskDetected={handleRiskDetected}
        onCaptureSnippetReady={handleCaptureSnippetReady}
      />
    </>
  );
};

export default ExpertL3AlertPanel;
