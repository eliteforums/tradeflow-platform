import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "intern", label: "Intern" },
  { value: "expert", label: "Expert" },
  { value: "spoc", label: "SPOC" },
] as const;

export default function MemberManager() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");
  const [selectedInstitution, setSelectedInstitution] = useState("");

  const { data: institutions = [] } = useQuery({
    queryKey: ["admin-institutions-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("institutions").select("id, name").eq("is_active", true).order("name");
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
          institution_id: selectedInstitution && selectedInstitution !== "none" ? selectedInstitution : null,
        },
      });
      if (error) throw new Error(error.message || "Failed");
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`"${data.username}" created as ${selectedRole}`);
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      setUsername("");
      setPassword("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const getRoleDesc = (role: string) => {
    const map: Record<string, string> = {
      student: "BlackBox, Peer Connect, Self-Help, Appointments",
      intern: "Peer sessions, escalation flagging",
      expert: "Appointments, session notes",
      spoc: "QR onboarding, credits, analytics, alerts",
    };
    return map[role] || "";
  };

  return (
    <div className="p-3 rounded-xl bg-card border border-border/50 space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-primary" />
        Add Member
      </h3>
      <p className="text-xs text-muted-foreground">
        Create a new account with a specific role.
      </p>

      <div className="grid grid-cols-1 gap-2.5">
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Username *</label>
          <Input placeholder="e.g. dr_sharma" value={username} onChange={(e) => setUsername(e.target.value)} className="h-9" />
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Login: <code className="bg-muted px-1 rounded">{username.toLowerCase().replace(/\s+/g, '_') || 'username'}</code>
          </p>
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Password *</label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Min 6 chars"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 pr-9"
            />
            <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Role *</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Institution</label>
            <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {institutions.map((inst) => <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-muted/30 border border-border flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
        <p className="text-[10px] text-muted-foreground">
          <span className="font-medium text-foreground capitalize">{selectedRole}:</span> {getRoleDesc(selectedRole)}
        </p>
      </div>

      <Button
        onClick={() => addMutation.mutate()}
        disabled={!username.trim() || !password || password.length < 6 || addMutation.isPending}
        className="gap-1.5 h-8 text-xs w-full"
        size="sm"
      >
        {addMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
        Create Member
      </Button>
    </div>
  );
}
