import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { spendCredits } from "./useSpendCredits";

export interface Intern {
  id: string;
  username: string;
  specialty: string | null;
  is_active: boolean;
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
  intern?: Intern;
}

export interface PeerMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content_encrypted: string;
  created_at: string;
}

export function usePeerConnect() {
  const { user, refreshCredits } = useAuth();
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PeerMessage[]>([]);

  // Get available interns
  const { data: interns = [], isLoading: isLoadingInterns } = useQuery({
    queryKey: ["interns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "intern")
        .eq("is_active", true);

      if (error) throw error;
      return data as Intern[];
    },
  });

  // Get user's sessions
  const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["peer-sessions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("peer_sessions")
        .select("*, intern:profiles!peer_sessions_intern_id_fkey(*)")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PeerSession[];
    },
    enabled: !!user,
  });

  // Get active session
  const activeSession = sessions.find((s) => s.status === "active");

  // Fetch messages for active session
  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("peer_messages")
        .select("*")
        .eq("session_id", activeSessionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data as PeerMessage[]);
    };

    fetchMessages();

    // Subscribe to realtime messages
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
  }, [activeSessionId]);

  // Request session with intern
  const requestSession = useMutation({
    mutationFn: async (internId: string) => {
      if (!user) throw new Error("Not authenticated");

      // Deduct credits on session start (PRD requirement)
      await spendCredits(20, "Peer Connect session");

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

      if (error) throw error;
      return data;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["peer-sessions"] });
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

  // Flag/escalate session (intern only)
  const flagSession = useMutation({
    mutationFn: async ({ sessionId, reason }: { sessionId: string; reason?: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Set is_flagged on peer_sessions
      const { error: flagErr } = await supabase
        .from("peer_sessions")
        .update({ is_flagged: true, escalation_note_encrypted: reason || "Intern flagged session" })
        .eq("id", sessionId);
      if (flagErr) throw flagErr;

      // Get session to find student's SPOC
      const { data: session } = await supabase
        .from("peer_sessions")
        .select("student_id")
        .eq("id", sessionId)
        .single();

      if (session) {
        // Find student's institution SPOC
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
            await supabase.from("escalation_requests").insert({
              session_id: sessionId,
              spoc_id: spocs[0].id,
              justification_encrypted: reason || "Intern flagged peer session for review",
              escalation_level: 1,
              trigger_timestamp: new Date().toISOString(),
              trigger_snippet: "Peer Connect session flagged by intern",
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
        .update({
          status: "completed",
          ended_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peer-sessions"] });
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
    isLoading: isLoadingInterns || isLoadingSessions,
    activeSessionId,
    setActiveSessionId,
    requestSession: requestSession.mutate,
    sendMessage: sendMessage.mutate,
    endSession: endSession.mutate,
    isRequesting: requestSession.isPending,
    isSending: sendMessage.isPending,
  };
}
