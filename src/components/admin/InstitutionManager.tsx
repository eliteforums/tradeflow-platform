import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Building2, Plus, Copy, Check, Loader2, Coins,
  ToggleLeft, ToggleRight,
} from "lucide-react";

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
  created_at: string;
}

const InstitutionManager = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPlan, setNewPlan] = useState("basic");
  const [newCredits, setNewCredits] = useState("5000");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ["admin-institutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Institution[];
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

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Institutions ({institutions.length})
        </h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5 h-8 text-xs" size="sm">
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      {showForm && (
        <div className="p-3 rounded-xl bg-card border border-primary/20 space-y-3">
          <p className="font-medium text-sm">New Institution</p>
          <Input
            placeholder="Institution Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-9"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Plan</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="w-full h-9 rounded-md border border-border bg-background px-2 text-xs"
              >
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
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!newName.trim() || createMutation.isPending}
              className="gap-1.5 h-8 text-xs"
              size="sm"
            >
              {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Create
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : institutions.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-medium">No institutions yet</p>
          <p className="text-xs">Create one to generate an Eternia code.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {institutions.map((inst) => (
            <div
              key={inst.id}
              className={`p-3 rounded-xl bg-card border border-border/50 transition-all ${!inst.is_active ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm truncate">{inst.name}</h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    inst.is_active ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                  }`}>
                    {inst.is_active ? "Active" : "Off"}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary uppercase">
                    {inst.plan_type}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><Coins className="w-2.5 h-2.5" />{inst.credits_pool}</span>
                  <span>{new Date(inst.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-muted/50 border border-border/50">
                    <code className="text-[10px] font-mono font-semibold tracking-wider">{inst.eternia_code_hash}</code>
                    <button onClick={() => copyCode(inst.eternia_code_hash, inst.id)} className="text-muted-foreground">
                      {copiedId === inst.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => toggleMutation.mutate({ id: inst.id, is_active: inst.is_active })}
                  >
                    {inst.is_active ? <ToggleRight className="w-4 h-4 text-emerald-500" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstitutionManager;
