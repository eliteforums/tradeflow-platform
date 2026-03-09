import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { UserPlus, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "intern", label: "Intern (Peer Counselor)" },
  { value: "expert", label: "Expert (Therapist / Psychologist)" },
  { value: "spoc", label: "SPOC / Grievance Officer" },
] as const;

export default function MemberManager() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");
  const [selectedInstitution, setSelectedInstitution] = useState("");

  // Fetch institutions for dropdown
  const { data: institutions = [] } = useQuery({
    queryKey: ["admin-institutions-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutions")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("add-member", {
        body: {
          username: username.trim(),
          password,
          role: selectedRole,
          institution_id: selectedInstitution || null,
        },
      });

      if (error) throw new Error(error.message || "Failed to add member");
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Member "${data.username}" created as ${selectedRole}`);
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      setUsername("");
      setPassword("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "student": return "Can access all student features (BlackBox, Peer Connect, Expert Appointments, Self-Help)";
      case "intern": return "Can accept peer session queue, conduct moderated chat sessions, flag for escalation";
      case "expert": return "Can view appointment calendar, conduct sessions, add encrypted session notes";
      case "spoc": return "Can onboard students via QR, allocate credits, view analytics, receive crisis alerts";
      default: return "";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Add New Member
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create a new user account with a specific role. Students can also self-register via the Eternia Code flow.
          For Interns, Experts, and SPOCs, use this tool to create their accounts directly.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Username *
            </label>
            <Input
              placeholder="e.g. dr_sharma"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-10"
            />
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Login: <code className="bg-muted px-1 rounded">{username.toLowerCase().replace(/\s+/g, '_') || 'username'}</code>
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Password *
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-10 w-10"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Role *
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Institution
            </label>
            <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select institution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {institutions.map((inst) => (
                  <SelectItem key={inst.id} value={inst.id}>
                    {inst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Role info */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground capitalize">{selectedRole}:</span>{" "}
            {getRoleDescription(selectedRole)}
          </p>
        </div>

        <Button
          onClick={() => addMutation.mutate()}
          disabled={!username.trim() || !password || password.length < 6 || addMutation.isPending}
          className="gap-2"
        >
          {addMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          Create Member
        </Button>
      </CardContent>
    </Card>
  );
}
