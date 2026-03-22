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
  institution_id: string | null;
  specialty: string | null;
}

export function useAdmin() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin" || profile?.role === "spoc";
  const isSuperAdmin = profile?.role === "admin";

  // Get members — super admin sees ALL, SPOC sees own institution only
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: ["admin-members", isSuperAdmin ? "all" : profile?.institution_id],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("id, username, role, is_active, is_verified, total_sessions, streak_days, created_at, institution_id, specialty")
        .order("created_at", { ascending: false });

      // SPOC only sees their own institution
      if (!isSuperAdmin && profile?.institution_id) {
        query = query.eq("institution_id", profile.institution_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InstitutionMember[];
    },
    enabled: isAdmin,
  });

  // Get stats — super admin sees cross-institution
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["admin-stats", isSuperAdmin ? "all" : profile?.institution_id],
    queryFn: async () => {
      let studentQuery = supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student");

      if (!isSuperAdmin && profile?.institution_id) {
        studentQuery = studentQuery.eq("institution_id", profile.institution_id);
      }

      const { count: studentCount } = await studentQuery;

      const { count: sessionCount } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true });

      const { count: peerCount } = await supabase
        .from("peer_sessions")
        .select("*", { count: "exact", head: true });

      return {
        totalStudents: studentCount || 0,
        totalSessions: (sessionCount || 0) + (peerCount || 0),
        totalCreditsIssued: (studentCount || 0) * 100,
        activeToday: Math.floor((studentCount || 0) * 0.3),
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

  // Get flagged entries
  const { data: flaggedEntries = [], isLoading: isLoadingFlags } = useQuery({
    queryKey: ["admin-flagged"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blackbox_entries")
        .select("id, user_id, content_type, ai_flag_level, is_private, created_at")
        .gt("ai_flag_level", 0)
        .order("ai_flag_level", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Get blackbox sessions for unified session feed
  const { data: blackboxSessions = [], isLoading: isLoadingBlackbox } = useQuery({
    queryKey: ["admin-blackbox-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blackbox_sessions")
        .select("*, therapist:profiles!blackbox_sessions_therapist_id_fkey(*)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Get institutions for SPOC tab
  const { data: institutions = [], isLoading: isLoadingInstitutions } = useQuery({
    queryKey: ["admin-institutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  return {
    isAdmin,
    isSuperAdmin,
    members,
    stats: stats || { totalStudents: 0, totalSessions: 0, totalCreditsIssued: 0, activeToday: 0 },
    appointments,
    peerSessions,
    flaggedEntries,
    blackboxSessions,
    institutions,
    isLoading: isLoadingMembers || isLoadingStats || isLoadingAppointments || isLoadingPeerSessions || isLoadingFlags || isLoadingBlackbox || isLoadingInstitutions,
  };
}
