import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEccEarn } from "@/hooks/useEccEarn";

export interface QuestCard {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  category: string | null;
  is_active: boolean;
}

export interface QuestCompletion {
  id: string;
  user_id: string;
  quest_id: string;
  completed_date: string;
  completed_at: string;
}

export function useQuests() {
  const { user, refreshCredits } = useAuth();
  const queryClient = useQueryClient();

  const { data: quests = [], isLoading: isLoadingQuests } = useQuery({
    queryKey: ["quest-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quest_cards")
        .select("*")
        .eq("is_active", true)
        .order("xp_reward", { ascending: false });

      if (error) throw error;
      return data as QuestCard[];
    },
  });

  const { data: completions = [], isLoading: isLoadingCompletions } = useQuery({
    queryKey: ["quest-completions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get today's completions
      const today = new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("quest_completions")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed_date", today);

      if (error) throw error;
      return data as QuestCompletion[];
    },
    enabled: !!user,
  });

  const completeQuest = useMutation({
    mutationFn: async (quest: QuestCard) => {
      if (!user) throw new Error("Not authenticated");

      // Check if already completed today
      const alreadyCompleted = completions.some(c => c.quest_id === quest.id);
      if (alreadyCompleted) {
        throw new Error("Quest already completed today");
      }

      // Mark quest as completed
      const { error: completionError } = await supabase.from("quest_completions").insert({
        user_id: user.id,
        quest_id: quest.id,
      });

      if (completionError) throw completionError;

      // Award XP as credits
      const { error: creditError } = await supabase.from("credit_transactions").insert({
        user_id: user.id,
        delta: quest.xp_reward,
        type: "earn",
        notes: `Quest completed: ${quest.title}`,
        reference_id: quest.id,
      });

      if (creditError) throw creditError;

      return quest;
    },
    onSuccess: (quest) => {
      queryClient.invalidateQueries({ queryKey: ["quest-completions"] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
      refreshCredits();
      toast.success(`+${quest.xp_reward} XP earned!`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getQuestStatus = (questId: string) => {
    return completions.some(c => c.quest_id === questId);
  };

  const totalXpToday = completions.reduce((sum, c) => {
    const quest = quests.find(q => q.id === c.quest_id);
    return sum + (quest?.xp_reward || 0);
  }, 0);

  return {
    quests,
    completions,
    isLoading: isLoadingQuests || isLoadingCompletions,
    completeQuest: completeQuest.mutate,
    isCompleting: completeQuest.isPending,
    getQuestStatus,
    completedToday: completions.length,
    totalXpToday,
  };
}
