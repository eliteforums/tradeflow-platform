import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Shield,
} from "lucide-react";
import { format } from "date-fns";

export default function ExpertManager() {
  const queryClient = useQueryClient();

  // Fetch all experts
  const { data: experts = [], isLoading } = useQuery({
    queryKey: ["admin-experts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, specialty, is_active, is_verified, total_sessions, institution_id")
        .eq("role", "expert")
        .order("username");
      if (error) throw error;
      return data;
    },
  });

  // Fetch availability for all experts
  const { data: availability = [] } = useQuery({
    queryKey: ["admin-expert-availability"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expert_availability")
        .select("*, expert:profiles!expert_availability_expert_id_fkey(username)")
        .gte("start_time", new Date().toISOString())
        .order("start_time")
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Toggle expert active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: !is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experts"] });
      toast.success("Expert status updated");
    },
    onError: () => toast.error("Failed to update expert"),
  });

  // Toggle expert verified status
  const toggleVerified = useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: !is_verified })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experts"] });
      toast.success("Verification status updated");
    },
    onError: () => toast.error("Failed to update verification"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Expert List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Experts / Therapists ({experts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {experts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No experts registered yet. Use the Roles tab to assign expert roles.
            </p>
          ) : (
            <div className="space-y-3">
              {experts.map((expert) => (
                <div
                  key={expert.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{expert.username}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {expert.specialty || "General"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {expert.total_sessions} sessions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 text-xs ${expert.is_verified ? "text-primary border-primary/30" : ""}`}
                      onClick={() => toggleVerified.mutate({ id: expert.id, is_verified: expert.is_verified })}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {expert.is_verified ? "Verified" : "Unverified"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 text-xs ${expert.is_active ? "text-emerald-500 border-emerald-500/30" : "text-destructive border-destructive/30"}`}
                      onClick={() => toggleActive.mutate({ id: expert.id, is_active: expert.is_active })}
                    >
                      {expert.is_active ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> Active</>
                      ) : (
                        <><XCircle className="w-3.5 h-3.5" /> Inactive</>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Availability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Expert Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availability.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No upcoming slots. Experts can set availability from their dashboard.
            </p>
          ) : (
            <div className="space-y-2">
              {availability.map((slot: any) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{slot.expert?.username || "Expert"}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(slot.start_time), "MMM d, h:mm a")} –{" "}
                        {format(new Date(slot.end_time), "h:mm a")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      slot.is_booked
                        ? "bg-primary/10 text-primary"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {slot.is_booked ? "Booked" : "Available"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
