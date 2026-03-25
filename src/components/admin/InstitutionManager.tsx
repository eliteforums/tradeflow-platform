import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Building2, Plus, Copy, Check, Loader2, Coins,
  ToggleLeft, ToggleRight, Users, Download, UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

function generateEterniaCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4);
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${year}${rand}`;
}

interface Institution {
  id: string;
  name: string;
  eternia_code_hash: string;
  credits_pool: number;
  is_active: boolean;
  plan_type: string;
  institution_type: string;
  created_at: string;
}

interface InstitutionManagerProps {
  onSelectInstitution?: (inst: Institution) => void;
}

interface BulkMember {
  user_id: string;
  username: string;
  password: string;
}

const InstitutionManager = ({ onSelectInstitution }: InstitutionManagerProps = {}) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPlan, setNewPlan] = useState("basic");
  const [newType, setNewType] = useState("university");
  const [newCredits, setNewCredits] = useState("5000");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bulk allocation state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkInstitution, setBulkInstitution] = useState<Institution | null>(null);
  const [bulkCount, setBulkCount] = useState("50");
  const [bulkPrefix, setBulkPrefix] = useState("");
  const [bulkRole, setBulkRole] = useState("student");
  const [bulkResults, setBulkResults] = useState<BulkMember[] | null>(null);

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ["admin-institutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutions")
        .select("id, name, eternia_code_hash, plan_type, credits_pool, is_active, institution_type, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Institution[];
    },
  });

  // Student counts per institution
  const { data: studentCounts = {} } = useQuery({
    queryKey: ["admin-inst-student-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("institution_id")
        .eq("role", "student");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((p: any) => {
        if (p.institution_id) {
          counts[p.institution_id] = (counts[p.institution_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const code = generateEterniaCode(newName);
      const { error } = await supabase.from("institutions").insert({
        name: newName.trim(),
        eternia_code_hash: code,
        credits_pool: parseInt(newCredits) || 5000,
        plan_type: newPlan,
        institution_type: newType,
      });
      if (error) throw error;
      return code;
    },
    onSuccess: (code) => {
      toast.success(`Institution created! Code: ${code}`);
      queryClient.invalidateQueries({ queryKey: ["admin-institutions"] });
      setNewName("");
      setNewCredits("5000");
      setShowForm(false);
    },
    onError: () => toast.error("Failed to create institution"),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("institutions")
        .update({ is_active: !is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-institutions"] });
      toast.success("Institution updated");
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      if (!bulkInstitution) throw new Error("No institution selected");
      const { data, error } = await supabase.functions.invoke("bulk-add-members", {
        body: {
          institution_id: bulkInstitution.id,
          count: parseInt(bulkCount),
          prefix: bulkPrefix.trim() || undefined,
          role: bulkRole,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.created_count} IDs created successfully${data.error_count > 0 ? ` (${data.error_count} errors)` : ""}`);
      setBulkResults(data.members);
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inst-student-counts"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openBulkDialog = (inst: Institution) => {
    setBulkInstitution(inst);
    setBulkPrefix(inst.name.replace(/[^a-zA-Z]/g, "").toLowerCase().slice(0, 4));
    setBulkCount("50");
    setBulkRole("student");
    setBulkResults(null);
    setBulkDialogOpen(true);
  };

  const downloadCSV = () => {
    if (!bulkResults || !bulkInstitution) return;
    const header = "Username,Password,Institution,Code\n";
    const rows = bulkResults.map((m) =>
      `${m.username},${m.password},${bulkInstitution.name},${bulkInstitution.eternia_code_hash}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bulkInstitution.name.replace(/\s+/g, "_")}_ids_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Institutions / Schools ({institutions.length})
        </h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5 h-8 text-xs" size="sm">
          <Plus className="w-3.5 h-3.5" />Add
        </Button>
      </div>

      {showForm && (
        <div className="p-3 rounded-xl bg-card border border-primary/20 space-y-3">
          <p className="font-medium text-sm">New Institution</p>
          <Input placeholder="Institution Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-9" />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Type</label>
              <select value={newType} onChange={(e) => setNewType(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-2 text-xs">
                <option value="university">University</option>
                <option value="school">School</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Plan</label>
              <select value={newPlan} onChange={(e) => setNewPlan(e.target.value)} className="w-full h-9 rounded-md border border-border bg-background px-2 text-xs">
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Credits</label>
              <Input type="number" value={newCredits} onChange={(e) => setNewCredits(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => createMutation.mutate()} disabled={!newName.trim() || createMutation.isPending} className="gap-1.5 h-8 text-xs" size="sm">
              {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}Create
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : institutions.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No institutions yet</p>
          <p className="text-xs">Create one to generate an Eternia code.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {institutions.map((inst) => {
            const planAccent = inst.plan_type === "enterprise"
              ? "border-l-amber-500 shadow-amber-500/5"
              : inst.plan_type === "premium"
              ? "border-l-violet-500 shadow-violet-500/5"
              : "border-l-primary shadow-primary/5";

            return (
              <div
                key={inst.id}
                className={`relative rounded-xl bg-card border border-border/50 border-l-4 ${planAccent} shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${!inst.is_active ? "opacity-60" : ""} ${onSelectInstitution ? "cursor-pointer" : ""}`}
                onClick={() => onSelectInstitution?.(inst)}
              >
                {/* Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base truncate text-foreground">{inst.name}</h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">{inst.institution_type}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${inst.is_active ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground border border-border"}`}>
                        {inst.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${
                        inst.plan_type === "enterprise" ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                        : inst.plan_type === "premium" ? "bg-violet-500/15 text-violet-400 border-violet-500/20"
                        : "bg-primary/15 text-primary border-primary/20"
                      }`}>
                        {inst.plan_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-muted/40 border border-border/30 p-2.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Users className="w-3 h-3" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Students</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{studentCounts[inst.id] || 0}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/30 p-2.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Coins className="w-3 h-3" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Credits</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{inst.credits_pool.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/30 p-2.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Copy className="w-3 h-3" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Eternia Code</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="text-xs font-mono font-bold tracking-wider text-foreground">{inst.eternia_code_hash}</code>
                      <button
                        onClick={(e) => { e.stopPropagation(); copyCode(inst.eternia_code_hash, inst.id); }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === inst.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted/40 border border-border/30 p-2.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Building2 className="w-3 h-3" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Created</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{new Date(inst.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-2 border-t border-border/30">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5 px-3"
                    onClick={(e) => { e.stopPropagation(); openBulkDialog(inst); }}
                  >
                    <UserPlus className="w-3.5 h-3.5" />Bulk IDs
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); toggleMutation.mutate({ id: inst.id, is_active: inst.is_active }); }}
                  >
                    {inst.is_active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk ID Allocation Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Bulk ID Allocation — {bulkInstitution?.name}
            </DialogTitle>
          </DialogHeader>

          {!bulkResults ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate student/member IDs in bulk with consistent Eternia codes. Each ID gets an auto-generated username and password.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Number of IDs *</label>
                  <Input type="number" value={bulkCount} onChange={(e) => setBulkCount(e.target.value)} className="h-9" min={1} max={500} />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Max 500 per batch</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                  <Select value={bulkRole} onValueChange={setBulkRole}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Username Prefix</label>
                <Input value={bulkPrefix} onChange={(e) => setBulkPrefix(e.target.value)} className="h-9" placeholder="e.g. demo" />
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Preview: <code className="bg-muted px-1 rounded">{bulkPrefix || "inst"}_0001@eternia.local</code>
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Eternia Code:</span>{" "}
                  <code className="bg-muted px-1 rounded font-mono">{bulkInstitution?.eternia_code_hash}</code>
                  {" "}— all IDs will be linked to this institution automatically.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => bulkMutation.mutate()}
                  disabled={!bulkCount || parseInt(bulkCount) < 1 || bulkMutation.isPending}
                  className="gap-1.5"
                >
                  {bulkMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
                  ) : (
                    <><UserPlus className="w-4 h-4" />Generate {bulkCount} IDs</>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm font-medium text-emerald-500">
                  ✓ {bulkResults.length} IDs created successfully
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium text-muted-foreground">#</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Username</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((m, i) => (
                      <tr key={m.user_id} className="border-t border-border/50">
                        <td className="p-2 text-muted-foreground">{i + 1}</td>
                        <td className="p-2 font-mono">{m.username}</td>
                        <td className="p-2 font-mono">{m.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={downloadCSV} className="gap-1.5">
                  <Download className="w-4 h-4" />Download CSV
                </Button>
                <Button onClick={() => { setBulkResults(null); setBulkDialogOpen(false); }}>Done</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstitutionManager;
