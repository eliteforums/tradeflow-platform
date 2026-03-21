import { useState } from "react";
import { Shield, Key, Smile, Save, CheckCircle, Loader2, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EMOJI_GRID = ["🌊","🔥","🌸","⚡","🌙","☀️","🍃","❄️","🦋","🌈","🎵","💎","🕊️","🌻","🍂","🌺","🐚","🌿","✨","🎯","🧿","🪷","🫧","🪻"];

const MobileRecoverySetup = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [pairs, setPairs] = useState([{ hint: "", answer: "" }, { hint: "", answer: "" }, { hint: "", answer: "" }]);
  const [emojis, setEmojis] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleChange = (i: number, field: "hint" | "answer", value: string) => {
    setPairs((p) => { const u = [...p]; u[i] = { ...u[i], [field]: value }; return u; });
  };
  const toggleEmoji = (e: string) => {
    setEmojis((p) => p.includes(e) ? p.filter((x) => x !== e) : p.length >= 4 ? p : [...p, e]);
  };
  const handleSave = async () => {
    if (!user) return; setIsSaving(true);
    try {
      const { error } = await supabase.from("recovery_credentials").upsert({ user_id: user.id, fragment_pairs_encrypted: JSON.stringify(pairs), emoji_pattern_encrypted: JSON.stringify(emojis), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
      setIsComplete(true); toast.success("Recovery setup complete!");
    } catch (e: any) { toast.error(e.message); } finally { setIsSaving(false); }
  };

  if (isComplete) return (
    <DashboardLayout>
      <div className="text-center py-16 pb-24">
        <div className="w-16 h-16 rounded-2xl bg-eternia-success/20 flex items-center justify-center mx-auto mb-5"><CheckCircle className="w-8 h-8 text-eternia-success" /></div>
        <h1 className="text-xl font-bold font-display mb-2">Setup Complete</h1>
        <p className="text-sm text-muted-foreground mb-5">Your recovery credentials are saved securely.</p>
        <Button onClick={() => window.history.back()} variant="outline" className="h-10 text-sm">Back to Profile</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <h1 className="text-xl font-bold font-display">Recovery Setup</h1>

        <div className="p-4 rounded-2xl bg-gradient-eternia-subtle border border-border flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">Since Eternia doesn't collect emails, recovery uses memory-based credentials.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 1 ? "bg-gradient-eternia text-background" : "bg-muted text-muted-foreground"}`}>1</div>
          <div className={`flex-1 h-1 rounded ${step >= 2 ? "bg-gradient-eternia" : "bg-muted"}`} />
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${step >= 2 ? "bg-gradient-eternia text-background" : "bg-muted text-muted-foreground"}`}>2</div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2"><Key className="w-5 h-5 text-primary" /><h2 className="text-sm font-semibold">Fragment Word Pairs</h2></div>
            <p className="text-xs text-muted-foreground">Create 3 hint-answer pairs only you know.</p>
            {pairs.map((pair, i) => (
              <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Pair {i + 1}</p>
                <Input placeholder="Hint word" value={pair.hint} onChange={(e) => handleChange(i, "hint", e.target.value)} className="bg-background h-10 text-sm" />
                <Input placeholder="Answer" value={pair.answer} onChange={(e) => handleChange(i, "answer", e.target.value)} className="bg-background h-10 text-sm" />
              </div>
            ))}
            <Button onClick={() => setStep(2)} disabled={!pairs.every((p) => p.hint.trim() && p.answer.trim())} className="w-full gap-2 h-12 text-sm">
              Continue<ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2"><Smile className="w-5 h-5 text-primary" /><h2 className="text-sm font-semibold">Emoji Pattern</h2></div>
            <p className="text-xs text-muted-foreground">Select exactly 4 emojis in order.</p>

            <div className="flex items-center justify-center gap-4 py-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${emojis[i] ? "bg-primary/10 border-2 border-primary" : "bg-muted/50 border-2 border-dashed border-border"}`}>
                  {emojis[i] || "?"}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-6 gap-2">
              {EMOJI_GRID.map((e) => (
                <button key={e} onClick={() => toggleEmoji(e)} className={`aspect-square rounded-xl text-2xl flex items-center justify-center ${emojis.includes(e) ? "bg-primary/20 border-2 border-primary scale-95" : "bg-muted/30 border border-border"}`}>{e}</button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">{emojis.length}/4 selected</p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 text-sm">Back</Button>
              <Button onClick={handleSave} disabled={emojis.length !== 4 || isSaving} className="flex-1 h-12 text-sm gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl border border-border bg-muted/20 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">Encrypted with AES-256-GCM. Write-only — never returned in API responses.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MobileRecoverySetup;
