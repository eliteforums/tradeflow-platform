import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, Key, Smile, Lock, Eye, EyeOff, Loader2, CheckCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import EterniaLogo from "@/components/EterniaLogo";
import { motion } from "framer-motion";

const EMOJI_GRID = ["🌊","🔥","🌸","⚡","🌙","☀️","🍃","❄️","🦋","🌈","🎵","💎","🕊️","🌻","🍂","🌺","🐚","🌿","✨","🎯","🧿","🪷","🫧","🪻"];

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchHints = async () => {
    const trimmed = username.trim();
    if (!trimmed) { toast.error("Please enter your username"); return; }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-recovery-hints", {
        body: { username: trimmed },
      });
      if (error) throw new Error(data?.error || "Failed to fetch hints");
      if (data?.error) throw new Error(data.error);
      setHints(data.hints);
      setStep(2);
    } catch (e: any) {
      toast.error(e.message || "Username not found or no recovery credentials set up");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiToggle = (emoji: string) => {
    setSelectedEmojis((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : prev.length >= 4 ? prev : [...prev, emoji]
    );
  };

  const handleVerifyAndProceed = () => {
    if (answers.some((a) => !a.trim())) { toast.error("Please answer all hint questions"); return; }
    if (selectedEmojis.length !== 4) { toast.error("Please select exactly 4 emojis"); return; }
    setStep(3);
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setIsLoading(true);
    try {
      const fragmentPairs = hints.map((hint, i) => ({ hint, answer: answers[i] }));
      const { data, error } = await supabase.functions.invoke("recover-password", {
        body: { username: username.trim(), fragment_pairs: fragmentPairs, emoji_pattern: selectedEmojis, new_password: newPassword },
      });
      if (error) throw new Error(data?.error || "Failed to reset password");
      if (data?.error) throw new Error(data.error);
      toast.success("Password reset successfully! Please sign in.");
      navigate("/login");
    } catch (e: any) {
      toast.error(e.message || "Recovery credentials do not match");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-eternia-teal/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-eternia-lavender/10 rounded-full blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="flex items-center mb-6">
          <EterniaLogo size={44} />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1.5">Reset Password</h1>
          <p className="text-muted-foreground text-sm">
            {step === 1 && "Enter your username to begin recovery"}
            {step === 2 && "Verify your identity with recovery credentials"}
            {step === 3 && "Set your new password"}
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-1 rounded transition-colors ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Username */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground/70 mb-1.5 block uppercase tracking-wider">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-card/50 border-border/40 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleFetchHints()}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button onClick={handleFetchHints} disabled={isLoading || !username.trim()} className="w-full h-12 rounded-xl text-sm font-semibold gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-4 h-4" /></>}
            </Button>
          </div>
        )}

        {/* Step 2: Recovery Credentials */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Hint answers */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Key className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Answer Your Hint Questions</span>
              </div>
              {hints.map((hint, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{hint}</label>
                  <Input
                    placeholder="Your answer"
                    value={answers[i]}
                    onChange={(e) => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }}
                    className="h-10 rounded-xl bg-card/50 border-border/40 text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Emoji pattern */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Smile className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Select Your 4-Emoji Pattern</span>
              </div>
              <div className="flex items-center justify-center gap-3 py-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    selectedEmojis[i] ? "bg-primary/10 border-2 border-primary" : "bg-muted/50 border-2 border-dashed border-border"
                  }`}>{selectedEmojis[i] || "?"}</div>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {EMOJI_GRID.map((emoji) => (
                  <button key={emoji} onClick={() => handleEmojiToggle(emoji)} className={`aspect-square rounded-lg text-xl flex items-center justify-center transition-all ${
                    selectedEmojis.includes(emoji) ? "bg-primary/20 border-2 border-primary scale-95" : "bg-muted/30 border border-border hover:bg-muted/50"
                  }`}>{emoji}</button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">{selectedEmojis.length}/4 selected</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl text-sm">Back</Button>
              <Button onClick={handleVerifyAndProceed} disabled={answers.some((a) => !a.trim()) || selectedEmojis.length !== 4} className="flex-1 h-12 rounded-xl text-sm font-semibold gap-2">
                Verify <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-foreground/70 mb-1.5 block uppercase tracking-wider">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 rounded-xl bg-card/50 border-border/40 text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/70 mb-1.5 block uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-card/50 border-border/40 text-sm"
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive mt-1">Passwords do not match</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl text-sm">Back</Button>
              <Button onClick={handleResetPassword} disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword} className="flex-1 h-12 rounded-xl text-sm font-semibold gap-2">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" />Reset Password</>}
              </Button>
            </div>
          </div>
        )}

        {/* Trust footer */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-muted-foreground/50">
          <div className="flex items-center gap-1"><Shield className="w-3 h-3" /><span>Encrypted</span></div>
          <span>•</span><span>Anonymous</span><span>•</span><span>DPDP</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
