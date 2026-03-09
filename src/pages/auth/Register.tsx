import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, User, Lock, Eye, EyeOff, ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    emergencyContact: "",
    emergencyRelation: "",
    studentId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedConsent, setAcceptedConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || formData.username.length < 4) {
      toast.error("Username must be at least 4 characters");
      return;
    }
    
    if (!formData.password || formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.emergencyContact) {
      toast.error("Emergency contact is required");
      return;
    }
    
    if (!formData.studentId) {
      toast.error("Student verification ID is required");
      return;
    }
    
    if (!acceptedConsent) {
      toast.error("Please accept the emergency escalation consent");
      return;
    }

    setIsLoading(true);

    try {
      const institutionCode = sessionStorage.getItem("eternia_institution_code");
      
      const { error } = await signUp(formData.username, formData.password, {
        institution_code: institutionCode,
      });

      if (error) throw error;

      // Store private data after signup
      // Small delay to ensure profile is created by trigger
      setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("user_private").insert({
            user_id: user.id,
            emergency_phone_encrypted: formData.emergencyContact,
            emergency_relation: formData.emergencyRelation,
            student_id_encrypted: formData.studentId,
          });

          // Link to institution if code exists
          if (institutionCode) {
            const { data: institution } = await supabase
              .from("institutions")
              .select("id")
              .eq("eternia_code_hash", institutionCode)
              .single();

            if (institution) {
              await supabase
                .from("profiles")
                .update({ institution_id: institution.id })
                .eq("id", user.id);
            }
          }
        }
      }, 500);

      toast.success("Account created successfully!");
      sessionStorage.removeItem("eternia_institution_code");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
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
        <button 
          onClick={() => step === 1 ? navigate("/institution-code") : setStep(1)}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? "Back to Institution Code" : "Back to Credentials"}
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-eternia flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-background" />
          </div>
          <span className="text-2xl font-bold font-display">Eternia</span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-gradient-eternia text-background' : 'bg-muted text-muted-foreground'} font-semibold text-sm`}>
            1
          </div>
          <div className={`flex-1 h-1 rounded ${step >= 2 ? 'bg-gradient-eternia' : 'bg-muted'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-gradient-eternia text-background' : 'bg-muted text-muted-foreground'} font-semibold text-sm`}>
            2
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          {step === 1 ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold font-display mb-2">Create Your Identity</h1>
                <p className="text-muted-foreground">
                  Choose a username and password. Your real name is never required.
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      name="username"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={handleChange}
                      className="input-eternia pl-12"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This will be your identity on the platform</p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-eternia pl-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-eternia pl-12"
                    />
                  </div>
                </div>

                <Button type="submit" className="btn-primary w-full py-6 text-lg mt-6">
                  Continue to Profile
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold font-display mb-2">Private Profile</h1>
                <p className="text-muted-foreground">
                  This information is encrypted and only accessed during emergencies.
                </p>
              </div>

              <form onSubmit={handleStep2Submit} className="space-y-5">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Emergency Contact Number</label>
                  <Input
                    type="tel"
                    name="emergencyContact"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="input-eternia"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Relation to Contact</label>
                  <Input
                    type="text"
                    name="emergencyRelation"
                    placeholder="e.g., Parent, Guardian, Self"
                    value={formData.emergencyRelation}
                    onChange={handleChange}
                    className="input-eternia"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Student ID (APAAR/ERP)</label>
                  <Input
                    type="text"
                    name="studentId"
                    placeholder="Your institutional verification ID"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="input-eternia"
                  />
                </div>

                {/* Consent */}
                <div className="p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consent"
                      checked={acceptedConsent}
                      onCheckedChange={(checked) => setAcceptedConsent(checked as boolean)}
                    />
                    <label htmlFor="consent" className="text-sm text-muted-foreground cursor-pointer">
                      <span className="flex items-center gap-2 font-medium text-foreground mb-1">
                        <AlertTriangle className="w-4 h-4 text-eternia-warning" />
                        Emergency Escalation Consent
                      </span>
                      If the platform detects a high-risk situation requiring intervention, the system may 
                      notify your institution's designated SPOC. Your username and emergency contact may be 
                      shared to enable immediate support action.
                    </label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="btn-primary w-full py-6 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Complete Registration
                    </div>
                  )}
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
