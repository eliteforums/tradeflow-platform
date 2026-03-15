import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createVideoSDKRoom, getVideoSDKToken } from "@/lib/videosdk";
import { toast } from "sonner";
import { spendCredits } from "./useSpendCredits";

export type BlackBoxSessionStatus = "queued" | "accepted" | "active" | "escalated" | "completed" | "cancelled";

export interface BlackBoxSession {
  id: string;
  student_id: string;
  therapist_id: string | null;
  status: BlackBoxSessionStatus;
  room_id: string | null;
  flag_level: number;
  escalation_reason: string | null;
  escalation_history: any[];
  session_notes_encrypted: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export const useBlackBoxSession = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<BlackBoxSession | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Subscribe to changes on the active session
  useEffect(() => {
    if (!activeSession?.id) return;

    const channel = supabase
      .channel(`blackbox-session-${activeSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "blackbox_sessions",
          filter: `id=eq.${activeSession.id}`,
        },
        async (payload) => {
          const updated = payload.new as BlackBoxSession;
          setActiveSession(updated);

          // Auto-join when therapist accepts and provides room_id
          if (
            (updated.status === "accepted" || updated.status === "active") &&
            updated.room_id &&
            !token
          ) {
            try {
              const t = await getVideoSDKToken();
              setToken(t);
            } catch (error: any) {
              toast.error(error.message || "Failed to connect to session");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession?.id, token]);

  // Check for existing active session on mount
  useEffect(() => {
    if (!user) return;
    const checkExisting = async () => {
      const { data } = await supabase
        .from("blackbox_sessions")
        .select("*")
        .eq("student_id", user.id)
        .in("status", ["queued", "accepted", "active"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const session = data[0] as unknown as BlackBoxSession;
        setActiveSession(session);
        if (session.room_id && (session.status === "accepted" || session.status === "active")) {
          try {
            const t = await getVideoSDKToken();
            setToken(t);
          } catch { /* silent */ }
        }
      }
    };
    checkExisting();
  }, [user]);

  const requestSession = useCallback(async () => {
    if (!user) return;
    setIsRequesting(true);
    try {
      // Server-side atomic credit deduction (BlackBox session costs 30 ECC)
      const spendResult = await spendCredits(30, "BlackBox Talk Now session");
      if (!spendResult.success) {
        toast.error("Insufficient credits for a BlackBox session");
        return;
      }

      const { data, error } = await supabase
        .from("blackbox_sessions")
        .insert({ student_id: user.id, status: "queued" })
        .select()
        .single();

      if (error) throw error;
      setActiveSession(data as unknown as BlackBoxSession);
      toast.success("You're in the queue. A therapist will connect shortly.");
    } catch (err: any) {
      toast.error(err.message || "Failed to request session");
    } finally {
      setIsRequesting(false);
    }
  }, [user]);

  const cancelSession = useCallback(async () => {
    if (!activeSession) return;
    await supabase
      .from("blackbox_sessions")
      .update({ status: "cancelled", ended_at: new Date().toISOString() })
      .eq("id", activeSession.id);
    setActiveSession(null);
    setToken(null);
    toast.info("Session cancelled");
  }, [activeSession]);

  const endSession = useCallback(async () => {
    if (!activeSession) return;
    await supabase
      .from("blackbox_sessions")
      .update({ status: "completed", ended_at: new Date().toISOString() })
      .eq("id", activeSession.id);
    setActiveSession(null);
    setToken(null);
  }, [activeSession]);

  return {
    activeSession,
    isRequesting,
    token,
    requestSession,
    cancelSession,
    endSession,
  };
};
