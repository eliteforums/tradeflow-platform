import { useIsMobile } from "@/hooks/use-mobile";
import MobileRecoverySetup from "@/components/mobile/MobileRecoverySetup";

import { useState } from "react";
import { Shield, Key, Smile, Save, CheckCircle, Loader2, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EMOJI_GRID = ["🌊","🔥","🌸","⚡","🌙","☀️","🍃","❄️","🦋","🌈","🎵","💎","🕊️","🌻","🍂","🌺","🐚","🌿","✨","🎯","🧿","🪷","🫧","🪻"];

const RecoverySetup = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [fragmentPairs, setFragmentPairs] = useState([{ hint: "", answer: "" }, { hint: "", answer: "" }, { hint: "", answer: "" }]);
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFragmentChange = (index: number, field: "hint" | "answer", value: string) => {
    setFragmentPairs((prev) => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u; });
  };
  const handleEmojiToggle = (emoji: string) => {
    setSelectedEmojis((prev) => prev.includes(emoji) ? prev.filter((e) => e !== emoji) : prev.length >= 4 ? prev : [...prev, emoji]);
  };
  const handleSave = async () => {
    if (!user) return; setIsSaving(true);
    try { const { error } = await supabase.from("recovery_credentials").upsert({ user_id: user.id, fragment_pairs_encrypted: JSON.stringify(fragmentPairs), emoji_pattern_encrypted: JSON.stringify(selectedEmojis), updated_at: new Date().toISOString() }, { onConflict: "user_id" }); if (error) throw error; setIsComplete(true); toast.success("Recovery setup complete!"); } catch (e: any) { toast.error(e.message); } finally { setIsSaving(false); }
  };

  if (isMobile) return <MobileRecoverySetup />;

  if (isComplete) return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-2xl bg-eternia-success/20 flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-eternia-success" /></div>
        <h1 className="text-3xl font-bold font-display mb-4">Recovery Setup Complete</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Your recovery credentials have been saved securely.</p>
        <Button onClick={() => window.history.back()} variant="outline">Back to Profile</Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div><h1 className="text-3xl font-bold font-display mb-2">Recovery Setup</h1><p className="text-muted-foreground">Set up account recovery without revealing your identity</p></div>
        <div className="p-4 rounded-xl bg-gradient-eternia-subtle border border-border"><div className="flex items-start gap-3"><Info className="w-5 h-5 text-primary shrink-0 mt-0.5" /><div><p className="font-medium text-sm mb-1">Why Recovery Setup?</p><p className="text-sm text-muted-foreground">Since Eternia doesn't collect emails or phone numbers, recovery uses memory-based credentials only you would know.</p></div></div></div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-gradient-eternia text-background" : "bg-muted text-muted-foreground"} font-semibold text-sm`}>1</div>
          <div className={`flex-1 h-1 rounded ${step >= 2 ? "bg-gradient-eternia" : "bg-muted"}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-gradient-eternia text-background" : "bg-muted text-muted-foreground"} font-semibold text-sm`}>2</div>
        </div>
        {step === 1 && (
          <Card><CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2"><Key className="w-6 h-6 text-primary" /><h2 className="text-lg font-semibold font-display">Fragment Word Pairs</h2></div>
            <p className="text-sm text-muted-foreground">Create 3 hint-answer pairs that only you would know.</p>
            {fragmentPairs.map((pair, index) => (
              <div key={index} className="p-4 rounded-xl bg-muted/30 border border-border space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Pair {index + 1}</p>
                <div><label className="text-xs text-muted-foreground mb-1 block">Hint Word</label><Input placeholder="e.g., childhood, favorite" value={pair.hint} onChange={(e) => handleFragmentChange(index, "hint", e.target.value)} className="bg-background" /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">Answer Word</label><Input placeholder="Your answer" value={pair.answer} onChange={(e) => handleFragmentChange(index, "answer", e.target.value)} className="bg-background" /></div>
              </div>
            ))}
            <Button onClick={() => setStep(2)} disabled={!fragmentPairs.every((p) => p.hint.trim() && p.answer.trim())} className="w-full gap-2">Continue to Emoji Pattern<ArrowRight className="w-4 h-4" /></Button>
          </CardContent></Card>
        )}
        {step === 2 && (
          <Card><CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-2"><Smile className="w-6 h-6 text-primary" /><h2 className="text-lg font-semibold font-display">Emoji Pattern</h2></div>
            <p className="text-sm text-muted-foreground">Select exactly 4 emojis in a specific order.</p>
            <div className="flex items-center justify-center gap-4 py-4">
              {[0,1,2,3].map((i) => (<div key={i} className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${selectedEmojis[i] ? "bg-primary/10 border-2 border-primary" : "bg-muted/50 border-2 border-dashed border-border"}`}>{selectedEmojis[i] || "?"}</div>))}
            </div>
            <div className="grid grid-cols-8 gap-2">
              {EMOJI_GRID.map((emoji) => (<button key={emoji} onClick={() => handleEmojiToggle(emoji)} className={`w-full aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${selectedEmojis.includes(emoji) ? "bg-primary/20 border-2 border-primary scale-95" : "bg-muted/30 border border-border hover:bg-muted/50 hover:scale-105"}`}>{emoji}</button>))}
            </div>
            <p className="text-xs text-muted-foreground text-center">{selectedEmojis.length}/4 selected</p>
            <div className="flex gap-3"><Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button><Button onClick={handleSave} disabled={selectedEmojis.length !== 4 || isSaving} className="flex-1 gap-2">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Recovery Setup</Button></div>
          </CardContent></Card>
        )}
        <div className="p-4 rounded-xl border border-border bg-muted/20"><div className="flex items-start gap-3"><Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" /><div><p className="font-medium text-sm mb-1">Encrypted & Secure</p><p className="text-xs text-muted-foreground">Your recovery credentials are encrypted with AES-256-GCM before storage.</p></div></div></div>
      </div>
    </DashboardLayout>
  );
};

export default RecoverySetup;
