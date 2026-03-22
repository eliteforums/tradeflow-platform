import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getVideoSDKToken } from "@/lib/videosdk";
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
  const [isConnecting, setIsConnecting] = useState(false);
  const tokenRef = useRef<string | null>(null);

  // Keep ref in sync
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Fetch token when session has room_id but no token yet
  const fetchTokenIfNeeded = useCallback(async (session: BlackBoxSession) => {
    if (
      (session.status === "accepted" || session.status === "active") &&
      session.room_id &&
      !tokenRef.current
    ) {
      setIsConnecting(true);
      try {
        console.log("[BlackBox] Fetching VideoSDK token for room:", session.room_id);
        const t = await getVideoSDKToken();
        console.log("[BlackBox] Token obtained, length:", t?.length);
        setToken(t);
      } catch (error: any) {
        console.error("[BlackBox] Token fetch failed:", error);
        toast.error(error.message || "Failed to connect to session");
      } finally {
        setIsConnecting(false);
      }
    }
  }, []);

  // Subscribe to realtime changes on the active session
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
          console.log("[BlackBox] Realtime update:", payload.new?.status, "room:", payload.new?.room_id);
          const updated = payload.new as unknown as BlackBoxSession;
          setActiveSession(updated);
          await fetchTokenIfNeeded(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession?.id, fetchTokenIfNeeded]);

  // Polling fallback: check session status every 5s while queued/accepted without token
  useEffect(() => {
    if (!activeSession?.id) return;
    // Only poll if we're waiting (queued, or accepted/active without token)
    const needsPoll =
      activeSession.status === "queued" ||
      ((activeSession.status === "accepted" || activeSession.status === "active") &&
        activeSession.room_id &&
        !token);

    if (!needsPoll) return;

    console.log("[BlackBox] Starting poll fallback for session:", activeSession.id);
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("blackbox_sessions")
        .select("id, student_id, therapist_id, status, room_id, flag_level, escalation_reason, escalation_history, session_notes_encrypted, started_at, ended_at, created_at")
        .eq("id", activeSession.id)
        .single();

      if (!data) return;
      const session = data as unknown as BlackBoxSession;

      // If status or room changed, update
      if (session.status !== activeSession.status || session.room_id !== activeSession.room_id) {
        console.log("[BlackBox] Poll detected change:", session.status, "room:", session.room_id);
        setActiveSession(session);
        await fetchTokenIfNeeded(session);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSession?.id, activeSession?.status, activeSession?.room_id, token, fetchTokenIfNeeded]);

  // Check for existing active session on mount
  useEffect(() => {
    if (!user) return;
    const checkExisting = async () => {
      const { data } = await supabase
        .from("blackbox_sessions")
        .select("id, student_id, therapist_id, status, room_id, flag_level, escalation_reason, escalation_history, session_notes_encrypted, started_at, ended_at, created_at")
        .eq("student_id", user.id)
        .in("status", ["queued", "accepted", "active"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const session = data[0] as unknown as BlackBoxSession;
        setActiveSession(session);
        await fetchTokenIfNeeded(session);
      }
    };
    checkExisting();
  }, [user, fetchTokenIfNeeded]);

  const requestSession = useCallback(async () => {
    if (!user) return;
    setIsRequesting(true);
    try {
      console.log("[BlackBox] Spending 30 ECC...");
      const spendResult = await spendCredits(30, "BlackBox Talk Now session");
      console.log("[BlackBox] Spend result:", spendResult);
      if (!spendResult.success) {
        toast.error("Insufficient credits for a BlackBox session");
        return;
      }

      console.log("[BlackBox] Creating session...");
      const { data, error } = await supabase
        .from("blackbox_sessions")
        .insert({ student_id: user.id, status: "queued" })
        .select()
        .single();

      if (error) {
        console.error("[BlackBox] Session insert error:", error);
        throw error;
      }
      console.log("[BlackBox] Session created:", data?.id);
      setActiveSession(data as unknown as BlackBoxSession);
      toast.success("You're in the queue. A therapist will connect shortly.");
    } catch (err: any) {
      const message = /insufficient credits/i.test(err?.message || "")
        ? "Insufficient credits for a BlackBox session (30 ECC required)."
        : err.message || "Failed to request session";
      toast.error(message);
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
    isConnecting,
    token,
    requestSession,
    cancelSession,
    endSession,
  };
};
