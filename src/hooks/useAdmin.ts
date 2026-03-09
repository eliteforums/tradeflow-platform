import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface AdminStats {
  totalStudents: number;
  totalSessions: number;
  totalCreditsIssued: number;
  activeToday: number;
}

export interface InstitutionMember {
  id: string;
  username: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  total_sessions: number;
  streak_days: number;
  created_at: string;
}

export function useAdmin() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin" || profile?.role === "spoc";

  // Get institution members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ["admin-members", profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("institution_id", profile.institution_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InstitutionMember[];
    },
    enabled: isAdmin && !!profile?.institution_id,
  });

  // Get stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-stats", profile?.institution_id],
    queryFn: async () => {
      if (!profile?.institution_id) {
        return {
          totalStudents: 0,
          totalSessions: 0,
          totalCreditsIssued: 0,
          activeToday: 0,
        };
      }

      // Get student count
      const { count: studentCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("institution_id", profile.institution_id)
        .eq("role", "student");

      // Get total sessions
      const { count: sessionCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

      // Get peer sessions count
      const { count: peerCount } = await supabase
        .from("peer_sessions")
        .select("*", { count: "exact", head: true });

      return {
        totalStudents: studentCount || 0,
        totalSessions: (sessionCount || 0) + (peerCount || 0),
        totalCreditsIssued: (studentCount || 0) * 100, // 100 credits per student welcome bonus
        activeToday: Math.floor((studentCount || 0) * 0.3), // Mock ~30% active
      };
    },
    enabled: isAdmin,
  });

  // Get all appointments for admin view
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, student:profiles!appointments_student_id_fkey(*), expert:profiles!appointments_expert_id_fkey(*)")
        .order("slot_time", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Get peer sessions for admin view
  const { data: peerSessions = [], isLoading: isLoadingPeerSessions } = useQuery({
    queryKey: ["admin-peer-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peer_sessions")
        .select("*, student:profiles!peer_sessions_student_id_fkey(*), intern:profiles!peer_sessions_intern_id_fkey(*)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Get flagged entries (BlackBox with AI flag level > 0)
  const { data: flaggedEntries = [], isLoading: isLoadingFlags } = useQuery({
    queryKey: ["admin-flagged"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blackbox_entries")
        .select("*")
        .gt("ai_flag_level", 0)
        .order("ai_flag_level", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  return {
    isAdmin,
    members,
    stats: stats || { totalStudents: 0, totalSessions: 0, totalCreditsIssued: 0, activeToday: 0 },
    appointments,
    peerSessions,
    flaggedEntries,
    isLoading: isLoadingMembers || isLoadingStats || isLoadingAppointments || isLoadingPeerSessions || isLoadingFlags,
  };
}
