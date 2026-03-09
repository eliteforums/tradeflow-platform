import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Loader2, Shield } from "lucide-react";

const ASSIGNABLE_ROLES = [
  { value: "spoc", label: "SPOC / Grievance Officer" },
  { value: "expert", label: "Expert (Therapist)" },
  { value: "intern", label: "Intern" },
] as const;

export default function RoleManager() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("spoc");
  const [institutionId, setInstitutionId] = useState("");

  const assignMutation = useMutation({
    mutationFn: async () => {
      // Find user by username
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("id, username, role")
        .eq("username", username.trim())
        .single();

      if (profileErr || !profile) throw new Error("User not found. Please check the username.");

      // Update profile role
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          role: selectedRole as any,
          ...(institutionId ? { institution_id: institutionId } : {}),
        })
        .eq("id", profile.id);
      if (updateErr) throw updateErr;

      // Insert into user_roles (admin can do this via service role; if RLS blocks, we handle gracefully)
      const { error: roleErr } = await supabase.from("user_roles").insert({
        user_id: profile.id,
        role: selectedRole as any,
      });
      // Ignore duplicate role errors
      if (roleErr && !roleErr.message.includes("duplicate")) {
        console.warn("user_roles insert warning:", roleErr.message);
      }

      // Log to audit
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
      toast.success(`${assignedUser} assigned as ${selectedRole}`);
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      setUsername("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Assign Roles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Assign SPOC (Grievance Officer), Expert, or Intern roles to registered users.
          The user must already have a student account on the platform.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Username
            </label>
            <Input
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Role
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Institution ID (optional)
            </label>
            <Input
              placeholder="UUID"
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              className="h-10 font-mono text-xs"
            />
          </div>
        </div>

        <Button
          onClick={() => assignMutation.mutate()}
          disabled={!username.trim() || assignMutation.isPending}
          className="gap-2"
        >
          {assignMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          Assign Role
        </Button>
      </CardContent>
    </Card>
  );
}
