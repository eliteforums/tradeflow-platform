import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Loader2, Eye, EyeOff, AlertCircle, Users, Building2, ChevronDown, ChevronRight } from "lucide-react";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "intern", label: "Intern" },
  { value: "expert", label: "Expert" },
  { value: "spoc", label: "SPOC" },
  { value: "therapist", label: "Therapist" },
] as const;

export default function MemberManager() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("intern");
  const [selectedInstitution, setSelectedInstitution] = useState("");
  const [expandedInstitution, setExpandedInstitution] = useState<string | null>(null);

  const { data: institutions = [] } = useQuery({
    queryKey: ["admin-institutions-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("institutions").select("id, name").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: allMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ["admin-all-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, role, institution_id, is_active, student_id, created_at")
        .order("created_at", { ascending: false });
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
          institution_id: selectedRole === "spoc" && selectedInstitution && selectedInstitution !== "none" ? selectedInstitution : null,
        },
      });
      if (error) {
        let msg = "Failed to create member";
        try {
          const json = await (error as any).context?.json();
          if (json?.error) msg = json.error;
        } catch {
          if (error.message) msg = error.message;
        }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`"${data.username}" created as ${selectedRole}`);
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      queryClient.invalidateQueries({ queryKey: ["admin-all-members"] });
      setUsername("");
      setPassword("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const getRoleDesc = (role: string) => {
    const map: Record<string, string> = {
      intern: "Universal — Peer sessions, escalation flagging",
      expert: "Universal — Appointments, session notes",
      spoc: "Institution-specific — QR onboarding, credits, analytics",
      therapist: "Universal — BlackBox queue, escalation, session notes",
    };
    return map[role] || "";
  };

  // Group members by institution
  const institutionMap = new Map<string, string>();
  institutions.forEach((inst) => institutionMap.set(inst.id, inst.name));

  const grouped: Record<string, typeof allMembers> = {};
  allMembers.forEach((m) => {
    const key = m.institution_id || "independent";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });

  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
    if (a === "independent") return 1;
    if (b === "independent") return -1;
    return (institutionMap.get(a) || "").localeCompare(institutionMap.get(b) || "");
  });

  return (
    <div className="space-y-4">
      {/* Add Member Form */}
      <div className="p-3 rounded-xl bg-card border border-border/50 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" />
          Add Member
        </h3>
        <p className="text-xs text-muted-foreground">
          Create a new staff account. Students are added via bulk institution onboarding.
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
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Role *</label>
            <Select value={selectedRole} onValueChange={(v) => { setSelectedRole(v); if (v !== "spoc") setSelectedInstitution(""); }}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {selectedRole === "spoc" && (
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Institution *</label>
              <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select institution" /></SelectTrigger>
                <SelectContent>
                  {institutions.map((inst) => <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-lg bg-muted/30 border border-border flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground">
            <span className="font-medium text-foreground capitalize">{selectedRole}:</span> {getRoleDesc(selectedRole)}
          </p>
        </div>

        <Button
          onClick={() => addMutation.mutate()}
          disabled={!username.trim() || !password || password.length < 6 || (selectedRole === "spoc" && !selectedInstitution) || addMutation.isPending}
          className="gap-1.5 h-8 text-xs w-full"
          size="sm"
        >
          {addMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
          Create Member
        </Button>
      </div>

      {/* Members grouped by institution */}
      <div className="p-3 rounded-xl bg-card border border-border/50 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Members by University
        </h3>

        {membersLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : sortedGroups.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No members yet</p>
        ) : (
          <div className="space-y-2">
            {sortedGroups.map(([instId, members]) => {
              const instName = instId === "independent" ? "Independent (No Institution)" : institutionMap.get(instId) || "Unknown";
              const isExpanded = expandedInstitution === instId;

              return (
                <div key={instId} className="rounded-lg border border-border/50 overflow-hidden">
                  <button
                    onClick={() => setExpandedInstitution(isExpanded ? null : instId)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-medium">{instName}</span>
                      <span className="text-[10px] text-muted-foreground">({members.length})</span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/50">
                      {members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between px-3 py-2 text-xs border-b border-border/30 last:border-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium truncate">{m.username}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary capitalize">{m.role}</span>
                            {!m.is_active && <span className="px-1.5 py-0.5 rounded text-[10px] bg-destructive/10 text-destructive">Inactive</span>}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                            {m.student_id || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}