import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { spendCredits } from "./useSpendCredits";

export interface Expert {
  id: string;
  username: string;
  specialty: string | null;
  bio: string | null;
  total_sessions: number;
  is_active: boolean;
}

export interface ExpertSlot {
  id: string;
  expert_id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  expert?: Expert;
}

export interface Appointment {
  id: string;
  student_id: string;
  expert_id: string;
  slot_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  session_type: string;
  credits_charged: number;
  created_at: string;
  reschedule_reason?: string | null;
  rescheduled_from?: string | null;
  rescheduled_by?: string | null;
  expert?: Expert;
}

export function useAppointments() {
  const { user, refreshCredits } = useAuth();
  const queryClient = useQueryClient();

  const { data: experts = [], isLoading: isLoadingExperts } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, specialty, bio, total_sessions, is_active")
        .eq("role", "expert")
        .eq("is_active", true);
      if (error) throw error;
      return data as Expert[];
    },
    staleTime: 30_000,
  });

  const { data: slots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ["expert-slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_availability")
        .select("id, expert_id, start_time, end_time, is_booked, expert:profiles!expert_availability_expert_id_fkey(id, username, specialty, bio, total_sessions, is_active)")
        .eq("is_booked", false)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data as ExpertSlot[];
    },
    staleTime: 15_000,
  });

  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("id, student_id, expert_id, slot_time, status, session_type, credits_charged, created_at, expert:profiles!appointments_expert_id_fkey(id, username, specialty, bio, total_sessions, is_active)")
        .eq("student_id", user.id)
        .order("slot_time", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user,
    staleTime: 15_000,
  });

  const bookAppointment = useMutation({
    mutationFn: async ({
      expertId, slotId, slotTime, sessionType, creditCost,
    }: {
      expertId: string; slotId: string; slotTime: string;
      sessionType: "video" | "audio"; creditCost: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const result = await spendCredits(creditCost, "Expert Connect booking");
      if (!result.success) throw new Error("Insufficient credits");

      const { data: appointment, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          student_id: user.id,
          expert_id: expertId,
          slot_id: slotId,
          slot_time: slotTime,
          session_type: sessionType,
          credits_charged: creditCost,
          status: "pending",
        })
        .select()
        .single();
      if (appointmentError) throw appointmentError;

      await supabase.from("expert_availability").update({ is_booked: true }).eq("id", slotId);

      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["expert-slots"] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
      refreshCredits();
      toast.success("Appointment booked successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelAppointment = useMutation({
    mutationFn: async (appointmentId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", appointmentId)
        .eq("student_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment cancelled");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const upcomingAppointments = appointments.filter(
    (a) => a.status !== "completed" && a.status !== "cancelled" && new Date(a.slot_time) > new Date()
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === "completed" || new Date(a.slot_time) <= new Date()
  );

  return {
    experts, slots, appointments, upcomingAppointments, pastAppointments,
    isLoading: isLoadingExperts || isLoadingSlots || isLoadingAppointments,
    bookAppointment: bookAppointment.mutate,
    cancelAppointment: cancelAppointment.mutate,
    isBooking: bookAppointment.isPending,
  };
}
