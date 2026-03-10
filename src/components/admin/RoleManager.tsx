import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Loader2, Shield } from "lucide-react";

const ASSIGNABLE_ROLES = [
  { value: "spoc", label: "SPOC" },
  { value: "expert", label: "Expert" },
  { value: "intern", label: "Intern" },
] as const;

export default function RoleManager() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("spoc");
  const [institutionId, setInstitutionId] = useState("");

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, username, role")
        .eq("username", username.trim())
        .single();
      if (profileErr || !profile) throw new Error("User not found.");
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          role: selectedRole as any,
          // Auto-verify experts and interns since admin is onboarding them
          is_verified: selectedRole === "expert" || selectedRole === "intern" ? true : undefined,
          is_active: true,
          ...(institutionId ? { institution_id: institutionId } : {}),
        })
        .eq("id", profile.id);
      if (updateErr) throw updateErr;
      const { error: roleErr } = await supabase.from("user_roles").insert({
        user_id: profile.id,
        role: selectedRole as any,
      });
      if (roleErr && !roleErr.message.includes("duplicate")) {
        console.warn("user_roles insert warning:", roleErr.message);
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          actor_id: user.id,
          action_type: "role_assigned",
          target_table: "profiles",
          target_id: profile.id,
          metadata: { new_role: selectedRole, username: profile.username },
        });
      }
      return profile.username;
    },
    onSuccess: (assignedUser) => {
      toast.success(`${assignedUser} → ${selectedRole}`);
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      setUsername("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="p-3 rounded-xl bg-card border border-border/50 space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        Assign Role
      </h3>
      <p className="text-xs text-muted-foreground">
        Assign SPOC, Expert, or Intern roles to existing users.
      </p>

      <div className="grid grid-cols-1 gap-2.5">
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Username</label>
          <Input placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} className="h-9" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Institution ID</label>
            <Input placeholder="UUID (optional)" value={institutionId} onChange={(e) => setInstitutionId(e.target.value)} className="h-9 font-mono text-[10px]" />
          </div>
        </div>
      </div>

      <Button
        onClick={() => assignMutation.mutate()}
        disabled={!username.trim() || assignMutation.isPending}
        className="gap-1.5 h-8 text-xs w-full"
        size="sm"
      >
        {assignMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
        Assign Role
      </Button>
    </div>
  );
}
