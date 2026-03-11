import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      const { data, error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      if (!data?.success) throw new Error("Deletion failed");
    },
    onSuccess: async () => {
      toast.success("Account deleted. Your data has been erased.");
      await signOut();
      navigate("/");
    },
    onError: () => toast.error("Failed to delete account. Please try again."),
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

      {!showForm ? (
        <Button variant="outline" size="sm" className="text-destructive h-8 text-xs" onClick={() => setShowForm(true)}>
          I want to delete my account
        </Button>
      ) : (
        <div className="space-y-2.5 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-destructive">
              Permanent and irreversible. Type "DELETE" to confirm.
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
              disabled={confirmText !== "DELETE" || deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
              className="gap-1.5 h-8 text-xs"
            >
              {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete Account
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
