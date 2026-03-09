import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface BlackBoxEntry {
  id: string;
  user_id: string;
  content_encrypted: string;
  content_type: "text" | "voice";
  ai_flag_level: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export function useBlackBox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["blackbox-entries", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("blackbox_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlackBoxEntry[];
    },
    enabled: !!user,
  });

  const createEntry = useMutation({
    mutationFn: async ({ content, isPrivate }: { content: string; isPrivate: boolean }) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("blackbox_entries").insert({
        user_id: user.id,
        content_encrypted: content, // In production, encrypt before storing
        content_type: "text",
        is_private: isPrivate,
        ai_flag_level: 0,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blackbox-entries"] });
      toast.success("Entry saved securely");
    },
    onError: (error) => {
      toast.error("Failed to save entry");
      console.error(error);
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (entryId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("blackbox_entries")
        .delete()
        .eq("id", entryId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blackbox-entries"] });
      toast.success("Entry deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete entry");
      console.error(error);
    },
  });

  return {
    entries,
    isLoading,
    createEntry: createEntry.mutate,
    deleteEntry: deleteEntry.mutate,
    isCreating: createEntry.isPending,
    isDeleting: deleteEntry.isPending,
  };
}
