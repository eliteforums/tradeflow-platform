import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Loader2, CheckCircle } from "lucide-react";

const AccountDeletion = () => {
  const { user, profile } = useAuth();
  const [requested, setRequested] = useState(false);

  const requestDeletionMutation = useMutation({
    mutationFn: async () => {
      if (!user || !profile) throw new Error("Not authenticated");

      // Find SPOCs for user's institution
      const { data: spocs } = await supabase
        .from("profiles")
        .select("id")
        .eq("institution_id", profile.institution_id)
        .eq("role", "spoc");

      // Also notify admins
      const { data: admins } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const recipients = [
        ...(spocs || []).map((s) => s.id),
        ...(admins || []).map((a) => a.user_id),
      ];

      if (recipients.length === 0) {
        throw new Error("No coordinator found. Please contact support.");
      }

      const notifications = recipients.map((recipientId) => ({
        user_id: recipientId,
        type: "deletion_request",
        title: "Account Deletion Request",
        message: `User "${profile.username}" has requested account deletion under DPDP Act 2023.`,
        metadata: {
          requesting_user_id: user.id,
          requesting_username: profile.username,
          requested_at: new Date().toISOString(),
        },
      }));

      const { error } = await supabase.from("notifications").insert(notifications);
      if (error) throw error;
    },
    onSuccess: () => {
      setRequested(true);
      toast.success("Deletion request sent to your institution coordinator.");
    },
    onError: (err: any) => toast.error(err.message || "Failed to send request."),
  });

  return (
    <div className="p-3 rounded-xl bg-card border border-destructive/20 space-y-3">
      <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
        <Trash2 className="w-4 h-4" />
        Delete Account (DPDP)
      </h3>
      <p className="text-xs text-muted-foreground">
        Under DPDP Act 2023, you can request deletion of your personal data. Your institution coordinator will process the request.
      </p>
      <ul className="text-[10px] text-muted-foreground space-y-0.5 list-disc list-inside">
        <li>Emergency contacts & student ID removed</li>
        <li>BlackBox entries permanently deleted</li>
        <li>Recovery credentials destroyed</li>
        <li>Profile deactivated & anonymized</li>
      </ul>

      {requested ? (
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your deletion request has been sent to your institution coordinator. They will contact you to confirm.
          </p>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive h-8 text-xs gap-1.5"
          onClick={() => requestDeletionMutation.mutate()}
          disabled={requestDeletionMutation.isPending}
        >
          {requestDeletionMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Request Account Deletion
        </Button>
      )}
    </div>
  );
};

export default AccountDeletion;
