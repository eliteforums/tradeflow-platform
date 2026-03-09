import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  expert?: Expert;
}

export function useAppointments() {
  const { user, creditBalance, refreshCredits } = useAuth();
  const queryClient = useQueryClient();

  // Get all experts
  const { data: experts = [], isLoading: isLoadingExperts } = useQuery({
    queryKey: ["experts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "expert")
        .eq("is_active", true);

      if (error) throw error;
      return data as Expert[];
    },
  });

  // Get available slots
  const { data: slots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ["expert-slots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_availability")
        .select("*, expert:profiles!expert_availability_expert_id_fkey(*)")
        .eq("is_booked", false)
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data as ExpertSlot[];
    },
  });

  // Get user's appointments
  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select("*, expert:profiles!appointments_expert_id_fkey(*)")
        .eq("student_id", user.id)
        .order("slot_time", { ascending: false });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user,
  });

  // Book appointment
  const bookAppointment = useMutation({
    mutationFn: async ({
      expertId,
      slotId,
      slotTime,
      sessionType,
      creditCost,
    }: {
      expertId: string;
      slotId: string;
      slotTime: string;
      sessionType: "video" | "audio";
      creditCost: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      if (creditBalance < creditCost) throw new Error("Insufficient credits");

      // Create appointment
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

      // Mark slot as booked
      const { error: slotError } = await supabase
        .from("expert_availability")
        .update({ is_booked: true })
        .eq("id", slotId);

      if (slotError) throw slotError;

      // Deduct credits
      const { error: creditError } = await supabase.from("credit_transactions").insert({
        user_id: user.id,
        delta: -creditCost,
        type: "spend",
        notes: `Expert appointment booking`,
        reference_id: appointment.id,
      });

      if (creditError) throw creditError;

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

  // Cancel appointment
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
    experts,
    slots,
    appointments,
    upcomingAppointments,
    pastAppointments,
    isLoading: isLoadingExperts || isLoadingSlots || isLoadingAppointments,
    bookAppointment: bookAppointment.mutate,
    cancelAppointment: cancelAppointment.mutate,
    isBooking: bookAppointment.isPending,
  };
}
