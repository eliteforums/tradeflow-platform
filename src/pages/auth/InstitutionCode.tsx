import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import EterniaLogo from "@/components/EterniaLogo";

const InstitutionCode = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error("Please enter your institution code");
      return;
    }

    if (code.length < 6) {
      toast.error("Invalid institution code. Please check with your institution.");
      return;
    }

    setIsLoading(true);

    try {
      // Validate against institutions table
      const { data: institution, error } = await supabase
        .from("institutions")
        .select("id, name, is_active")
        .eq("eternia_code_hash", code)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (institution) {
        toast.success(`Institution verified: ${institution.name}`);
        sessionStorage.setItem("eternia_institution_code", code);
        sessionStorage.setItem("eternia_institution_id", institution.id);
        navigate("/qr-scan");
      } else {
        toast.error("Invalid institution code. Please check with your institution.");
      }
    } catch (error: any) {
      console.error("Validation error:", error);
      toast.error("Failed to verify institution code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-eternia-teal/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-eternia-lavender/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <EterniaLogo size={48} />
          <span className="text-2xl font-bold font-display">Eternia</span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-eternia text-background font-semibold text-sm">
            1
          </div>
          <div className="flex-1 h-1 rounded bg-muted" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
            2
          </div>
          <div className="flex-1 h-1 rounded bg-muted" />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-semibold text-sm">
            3
          </div>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-display mb-2">Enter Institution Code</h1>
            <p className="text-muted-foreground">
              Your institution provides a unique code for platform access. Contact your college or university if you don't have one.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your institution code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="input-eternia pl-12 text-lg tracking-wider uppercase"
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="btn-primary w-full py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            What is an Institution Code?
          </h3>
          <p className="text-sm text-muted-foreground">
            This code is provided by your college or university when they partner with Eternia. 
            It ensures only verified students from your institution can access the platform.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstitutionCode;
