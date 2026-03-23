import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { spendCredits } from "./useSpendCredits";


export interface Intern {
  id: string;
  username: string;
  specialty: string | null;
  is_active: boolean;
  training_status?: string;
}

export interface PeerSession {
  id: string;
  student_id: string;
  intern_id: string | null;
  status: "pending" | "active" | "completed" | "flagged";
  is_flagged: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  room_id: string | null;
  intern?: Intern;
  student?: { id: string; username: string; specialty: string | null; role: string };
}

export interface PeerMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content_encrypted: string;
  created_at: string;
}

export type InternStatus = "online" | "busy" | "offline";

const MESSAGE_PAGE_SIZE = 50;

export function usePeerConnect(initialSessionId?: string | null) {
  const { user, profile, refreshCredits } = useAuth();
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<PeerMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isIntern = profile?.role === "intern";

  // Get available interns — show all active interns (relaxed filter for early platform stage)
  const { data: interns = [], isLoading: isLoadingInterns } = useQuery({
    queryKey: ["interns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, specialty, is_active, training_status")
        .eq("role", "intern")
        .eq("is_active", true);

      if (error) throw error;
      return data as Intern[];
    },
    staleTime: 30_000,
  });

  // Get active peer sessions for busy status derivation
  const { data: activeSessions = [] } = useQuery({
    queryKey: ["active-peer-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peer_sessions")
        .select("intern_id")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
    staleTime: 10_000,
  });

  // Derive real intern statuses
  const internStatuses = useMemo<Record<string, InternStatus>>(() => {
    const busyInternIds = new Set(activeSessions.map((s) => s.intern_id).filter(Boolean));
    const statuses: Record<string, InternStatus> = {};
    for (const intern of interns) {
      statuses[intern.id] = busyInternIds.has(intern.id) ? "busy" : "online";
    }
    return statuses;
  }, [interns, activeSessions]);

  // Get user's sessions (both as student AND as intern) — include student relation for intern view
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["peer-sessions", user?.id, isIntern],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from("peer_sessions")
        .select("id, student_id, intern_id, status, is_flagged, started_at, ended_at, created_at, room_id, escalation_note_encrypted, intern:profiles!peer_sessions_intern_id_fkey(id, username, specialty, is_active, training_status), student:profiles!peer_sessions_student_id_fkey(id, username, specialty, role)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (isIntern) {
        query = query.or(`student_id.eq.${user.id},intern_id.eq.${user.id}`);
      } else {
        query = query.eq("student_id", user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as PeerSession[];
    },
    enabled: !!user,
    staleTime: 10_000,
  });
  // Fetch last message per session for conversation list preview
  const { data: lastMessages = {} } = useQuery({
    queryKey: ["peer-last-messages", sessions.map(s => s.id).join(",")],
    queryFn: async () => {
      if (sessions.length === 0) return {};
      const result: Record<string, PeerMessage> = {};
      const promises = sessions.map(async (session) => {
        const { data } = await supabase
          .from("peer_messages")
          .select("id, session_id, sender_id, content_encrypted, created_at")
          .eq("session_id", session.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          result[session.id] = data[0] as PeerMessage;
        }
      });
      await Promise.all(promises);
      return result;
    },
    enabled: sessions.length > 0,
    staleTime: 10_000,
  });

  // Get active session — prefer initialSessionId if provided
  const activeSession = useMemo(() => {
    if (initialSessionId) {
      return sessions.find((s) => s.id === initialSessionId) || null;
    }
    return sessions.find((s) => s.status === "active") || null;
  }, [sessions, initialSessionId]);

  // Sync activeSessionId from activeSession
  useEffect(() => {
    if (activeSession && !activeSessionId) {
      setActiveSessionId(activeSession.id);
    }
  }, [activeSession, activeSessionId]);

  // Fetch messages with pagination
  const fetchMessages = useCallback(async (sessionId: string, before?: string) => {
    let query = supabase
      .from("peer_messages")
      .select("id, session_id, sender_id, content_encrypted, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(MESSAGE_PAGE_SIZE);

    if (before) {
      query = query.lt("created_at", before);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
    return (data as PeerMessage[]).reverse();
  }, []);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!activeSessionId || messages.length === 0 || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const oldest = messages[0];
      const older = await fetchMessages(activeSessionId, oldest.created_at);
      if (older.length < MESSAGE_PAGE_SIZE) setHasMoreMessages(false);
      if (older.length > 0) setMessages((prev) => [...older, ...prev]);
    } finally {
      setIsLoadingMore(false);
    }
  }, [activeSessionId, messages, isLoadingMore, fetchMessages]);

  // Fetch messages for active session
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      setHasMoreMessages(false);
      return;
    }

    const load = async () => {
      const msgs = await fetchMessages(activeSessionId);
      setMessages(msgs);
      setHasMoreMessages(msgs.length >= MESSAGE_PAGE_SIZE);
    };
    load();

    const channel = supabase
      .channel(`peer-messages-${activeSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "peer_messages",
          filter: `session_id=eq.${activeSessionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as PeerMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSessionId, fetchMessages]);

  // Helper: ensure a shared room_id exists on the session
  const ensureSessionRoom = useCallback(async (sessionId: string): Promise<string | null> => {
    // Check if session already has a room_id
      const { data: session } = await supabase
        .from("peer_sessions")
        .select("room_id")
        .eq("id", sessionId)
        .single();

      if (session?.room_id) return session.room_id;

    // Create a new room and persist it
    try {
      const { roomId } = await createVideoSDKRoom();
      await supabase
        .from("peer_sessions")
        .update({ room_id: roomId })
        .eq("id", sessionId);
      return roomId;
    } catch (err) {
      console.error("[PeerConnect] Failed to create room:", err);
      return null;
    }
  }, []);

  // Request session with intern
  const requestSession = useMutation({
    mutationFn: async (internId: string) => {
      if (!user) throw new Error("Not authenticated");
      if (isIntern) throw new Error("Interns cannot request peer sessions");

      // 1. Check if student already has an active/pending session
      const { data: existingStudentSession } = await supabase
        .from("peer_sessions")
        .select("*")
        .eq("student_id", user.id)
        .in("status", ["pending", "active"])
        .limit(1)
        .maybeSingle();

      if (existingStudentSession) {
        // Reuse existing session instead of creating a duplicate
        return existingStudentSession;
      }

      // 2. Check if the target intern already has an active/pending session
      const { data: existingInternSession } = await supabase
        .from("peer_sessions")
        .select("id")
        .eq("intern_id", internId)
        .in("status", ["pending", "active"])
        .limit(1)
        .maybeSingle();

      if (existingInternSession) {
        throw new Error("This intern is currently in a session. Please try another intern or wait.");
      }

      // 3. Spend credits
      await spendCredits(20, "Peer Connect session");

      // 4. Insert new session
      const { data, error } = await supabase
        .from("peer_sessions")
        .insert({
          student_id: user.id,
          intern_id: internId,
          status: "active",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // User-friendly message for constraint violations
        if (error.code === "23505") {
          throw new Error("You or this intern already have an active session.");
        }
        throw error;
      }
      return data;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["peer-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-peer-sessions"] });
      setActiveSessionId(session.id);
      toast.success("Session started!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("peer_messages").insert({
        session_id: sessionId,
        sender_id: user.id,
        content_encrypted: content,
      });
      if (error) throw error;
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error(error);
    },
  });

  // Flag/escalate session
  const flagSession = useMutation({
    mutationFn: async ({ sessionId, reason }: { sessionId: string; reason?: string }) => {
      if (!user) throw new Error("Not authenticated");

      const { error: flagErr } = await supabase
        .from("peer_sessions")
        .update({ is_flagged: true, escalation_note_encrypted: reason || "Intern flagged session" })
        .eq("id", sessionId);
      if (flagErr) throw flagErr;

      const { data: session } = await supabase
        .from("peer_sessions")
        .select("student_id")
        .eq("id", sessionId)
        .single();

      if (session) {
        const { data: studentProfile } = await supabase
          .from("profiles")
          .select("institution_id")
          .eq("id", session.student_id)
          .single();

        if (studentProfile?.institution_id) {
          const { data: spocs } = await supabase
            .from("profiles")
            .select("id")
            .eq("institution_id", studentProfile.institution_id)
            .eq("role", "spoc")
            .limit(1);

          if (spocs && spocs.length > 0) {
            const triggerSnippet = (reason || "Peer Connect session flagged by intern").substring(0, 500);
            await supabase.from("escalation_requests").insert({
              session_id: sessionId,
              spoc_id: spocs[0].id,
              justification_encrypted: reason || "Intern flagged peer session for review",
              escalation_level: 1,
              trigger_timestamp: new Date().toISOString(),
              trigger_snippet: triggerSnippet,
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peer-sessions"] });
      toast.success("Session flagged for review");
    },
    onError: (error) => {
      toast.error("Failed to flag session");
      console.error(error);
    },
  });

  // End session
  const endSession = useMutation({
    mutationFn: async (sessionId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("peer_sessions")
        .update({ status: "completed", ended_at: new Date().toISOString() })
        .eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peer-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["active-peer-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
      refreshCredits();
      setActiveSessionId(null);
      toast.success("Session ended");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    interns,
    sessions,
    activeSession,
    messages,
    internStatuses,
    lastMessages,
    hasMoreMessages,
    isLoadingMore,
    loadMoreMessages,
    isLoading: isLoadingInterns || isLoadingSessions,
    activeSessionId,
    setActiveSessionId,
    requestSession: requestSession.mutate,
    sendMessage: sendMessage.mutate,
    endSession: endSession.mutate,
    flagSession: flagSession.mutate,
    isRequesting: requestSession.isPending,
    isSending: sendMessage.isPending,
    isFlagging: flagSession.isPending,
    ensureSessionRoom,
  };
}
