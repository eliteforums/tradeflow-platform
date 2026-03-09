import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

const AccountDeletion = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [showForm, setShowForm] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Log the deletion to audit
      await supabase.from("audit_logs").insert({
        actor_id: user.id,
        action_type: "account_deleted",
        target_table: "profiles",
        target_id: user.id,
        metadata: { reason: "user_requested", dpdp_compliance: true },
      });

      // Delete private data (hard delete per DPDP)
      await supabase.from("user_private").delete().eq("user_id", user.id);

      // Delete recovery credentials
      await supabase.from("recovery_credentials").delete().eq("user_id", user.id);

      // Anonymize credit transactions (keep for ledger integrity but remove user link)
      // Note: RLS prevents this for regular users, but we soft-delete the profile instead

      // Delete blackbox entries
      await supabase.from("blackbox_entries").delete().eq("user_id", user.id);

      // Soft-delete profile
      await supabase
        .from("profiles")
        .update({ is_active: false, username: `deleted_${user.id.slice(0, 8)}`, bio: null, avatar_url: null })
        .eq("id", user.id);
    },
    onSuccess: async () => {
      toast.success("Your account has been deleted. We're sorry to see you go.");
      await signOut();
      navigate("/");
    },
    onError: () => toast.error("Failed to delete account. Please try again."),
  });

  return (
    <Card className="border-destructive/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-destructive flex items-center gap-2">
          <Trash2 className="w-5 h-5" />
          Delete Account (DPDP Act Compliance)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Under the Digital Personal Data Protection Act 2023, you have the right to request
          deletion of your personal data. This action will:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Permanently delete your emergency contact details</li>
          <li>Permanently delete your student verification ID</li>
          <li>Remove all BlackBox entries</li>
          <li>Remove your recovery credentials</li>
          <li>Deactivate your profile</li>
        </ul>

        {!showForm ? (
          <Button variant="outline" className="text-destructive" onClick={() => setShowForm(true)}>
            I want to delete my account
          </Button>
        ) : (
          <div className="space-y-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-destructive">
                This action is permanent and cannot be undone. Type "DELETE" to confirm.
              </p>
            </div>
            <Input
              placeholder='Type "DELETE" to confirm'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="border-destructive/30"
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                disabled={confirmText !== "DELETE" || deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
                className="gap-2"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Permanently Delete Account
              </Button>
              <Button variant="ghost" onClick={() => { setShowForm(false); setConfirmText(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountDeletion;
