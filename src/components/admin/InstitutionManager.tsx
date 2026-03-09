import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Building2,
  Plus,
  Copy,
  Check,
  Loader2,
  Users,
  Coins,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

function generateEterniaCode(name: string): string {
  const prefix = name
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 4);
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
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Institutions ({institutions.length})
        </h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          Add Institution
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create New Institution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Institution Name
              </label>
              <Input
                placeholder="e.g. IIT Bombay"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Plan Type
                </label>
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Credit Pool
                </label>
                <Input
                  type="number"
                  value={newCredits}
                  onChange={(e) => setNewCredits(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => createMutation.mutate()}
                disabled={!newName.trim() || createMutation.isPending}
                className="gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Generate Code & Create
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : institutions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No institutions yet</p>
            <p className="text-sm">Create your first institution to generate an Eternia code.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {institutions.map((inst) => (
            <Card
              key={inst.id}
              className={`transition-all ${
                !inst.is_active ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {inst.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                          inst.is_active
                            ? "bg-eternia-success/10 text-eternia-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {inst.is_active ? "Active" : "Inactive"}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-primary/10 text-primary">
                        {inst.plan_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        {inst.credits_pool} credits
                      </span>
                      <span>
                        Created{" "}
                        {new Date(inst.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Eternia Code display */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                      <code className="text-xs font-mono font-semibold tracking-widest text-foreground">
                        {inst.eternia_code_hash}
                      </code>
                      <button
                        onClick={() =>
                          copyCode(inst.eternia_code_hash, inst.id)
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedId === inst.id ? (
                          <Check className="w-3.5 h-3.5 text-eternia-success" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        toggleMutation.mutate({
                          id: inst.id,
                          is_active: inst.is_active,
                        })
                      }
                      className="gap-1 text-xs"
                    >
                      {inst.is_active ? (
                        <ToggleRight className="w-4 h-4 text-eternia-success" />
                      ) : (
                        <ToggleLeft className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstitutionManager;
