import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Trash2, RotateCcw } from "lucide-react";

const AccountDeletion = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState("");
  const [showForm, setShowForm] = useState(false);

  const deletionRequested = !!(profile as any)?.deletion_requested_at;
  const deletionDate = deletionRequested ? new Date((profile as any).deletion_requested_at) : null;
  const executionDate = deletionDate ? new Date(deletionDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
  const daysRemaining = executionDate ? Math.max(0, Math.ceil((executionDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  const requestDeletionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ deletion_requested_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deletion scheduled. Your account will be removed in 30 days.");
      window.location.reload();
    },
    onError: () => toast.error("Failed to schedule deletion. Please try again."),
  });

  const cancelDeletionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ deletion_requested_at: null })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deletion cancelled. Your account is safe.");
      window.location.reload();
    },
    onError: () => toast.error("Failed to cancel deletion."),
  });

  return (
    <div className="p-3 rounded-xl bg-card border border-destructive/20 space-y-3">
      <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
        <Trash2 className="w-4 h-4" />
        Delete Account (DPDP)
      </h3>
      <p className="text-xs text-muted-foreground">
        Under DPDP Act 2023, you can delete your personal data permanently.
      </p>
      <ul className="text-[10px] text-muted-foreground space-y-0.5 list-disc list-inside">
        <li>Emergency contacts & student ID hard-deleted</li>
        <li>BlackBox entries permanently removed</li>
        <li>Recovery credentials destroyed</li>
        <li>Profile deactivated & anonymized</li>
        <li>Auth account permanently deleted</li>
      </ul>

      {deletionRequested ? (
        <div className="space-y-2.5 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-destructive">
                Deletion scheduled — {daysRemaining} days remaining
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Your account will be permanently deleted on {executionDate?.toLocaleDateString()}. Log in anytime before then to cancel.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={() => cancelDeletionMutation.mutate()}
            disabled={cancelDeletionMutation.isPending}
          >
            {cancelDeletionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            Cancel Deletion
          </Button>
        </div>
      ) : !showForm ? (
        <Button variant="outline" size="sm" className="text-destructive h-8 text-xs" onClick={() => setShowForm(true)}>
          I want to delete my account
        </Button>
      ) : (
        <div className="space-y-2.5 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-destructive">
              Type "DELETE" to schedule account deletion. You have 30 days to cancel.
            </p>
          </div>
          <Input
            placeholder='Type "DELETE"'
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="border-destructive/30 h-9"
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              disabled={confirmText !== "DELETE" || requestDeletionMutation.isPending}
              onClick={() => requestDeletionMutation.mutate()}
              className="gap-1.5 h-8 text-xs"
            >
              {requestDeletionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Schedule Deletion
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setShowForm(false); setConfirmText(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDeletion;
