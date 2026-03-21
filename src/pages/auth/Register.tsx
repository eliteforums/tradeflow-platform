import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, User, Lock, Eye, EyeOff, ArrowLeft, Shield, AlertTriangle, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EterniaLogo from "@/components/EterniaLogo";
import { generateDeviceFingerprint } from "@/lib/deviceFingerprint";

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    emergencyName: "",
    emergencyContact: "",
    emergencyRelation: "",
    contactIsSelf: false,
    studentId: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedConsent, setAcceptedConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [institutionType, setInstitutionType] = useState<string>("university");

  // Detect institution type on mount
  useState(() => {
    const instId = sessionStorage.getItem("eternia_institution_id");
    if (instId) {
      supabase.from("institutions").select("institution_type").eq("id", instId).single()
        .then(({ data }) => {
          if (data?.institution_type) setInstitutionType(data.institution_type);
        });
    }
  });

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
    if (!formData.emergencyName) {
      toast.error("Emergency contact name is required");
      return;
    }
    if (!formData.emergencyContact) {
      toast.error("Emergency contact number is required");
      return;
    }
    if (!formData.contactIsSelf && !formData.emergencyRelation) {
      toast.error("Please specify the relationship to the contact person");
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
      const institutionId = sessionStorage.getItem("eternia_institution_id");
      const { error } = await signUp(formData.username, formData.password, {
        institution_code: institutionCode,
      });
      if (error) throw error;

      // Wait for session to be established, then insert private data
      const waitForUser = (): Promise<string | null> => {
        return new Promise((resolve) => {
          let attempts = 0;
          const check = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser?.id) return resolve(authUser.id);
            if (++attempts >= 10) return resolve(null);
            setTimeout(check, 400);
          };
          check();
        });
      };

      const userId = await waitForUser();
      if (userId) {
        let deviceFingerprint = "";
        try {
          deviceFingerprint = await generateDeviceFingerprint();
        } catch (e) {
          console.warn("Device fingerprint generation failed:", e);
        }

        const isSchool = institutionType === "school";
        await supabase.from("user_private").insert({
          user_id: userId,
          emergency_name_encrypted: formData.emergencyName,
          emergency_phone_encrypted: formData.emergencyContact,
          emergency_relation: formData.contactIsSelf ? "Self" : formData.emergencyRelation,
          student_id_encrypted: formData.studentId,
          contact_is_self: formData.contactIsSelf,
          device_id_encrypted: deviceFingerprint || null,
          apaar_id_encrypted: !isSchool ? formData.studentId : null,
          erp_id_encrypted: isSchool ? formData.studentId : null,
        });

        if (institutionId) {
          await supabase
            .from("profiles")
            .update({ institution_id: institutionId })
            .eq("id", userId);
        }
      }

      toast.success("Account created successfully!");
      sessionStorage.removeItem("eternia_institution_code");
      sessionStorage.removeItem("eternia_institution_id");
      sessionStorage.removeItem("eternia_spoc_verified");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-background flex items-start sm:items-center justify-center px-4 py-6 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-eternia-teal/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-eternia-lavender/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <button
          onClick={() => step === 1 ? navigate("/qr-scan") : setStep(1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 1 ? "Back" : "Back to Credentials"}
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <EterniaLogo size={36} />
          <span className="text-lg font-bold font-display">Eternia</span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-eternia-success text-background text-xs">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 h-1 rounded bg-eternia-success" />
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-eternia-success text-background text-xs">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className={`flex-1 h-1 rounded ${step >= 2 ? "bg-gradient-eternia" : "bg-muted"}`} />
          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
            step >= 2 ? "bg-gradient-eternia text-background" : "bg-muted text-muted-foreground"
          }`}>
            3
          </div>
        </div>

        <div className="glass rounded-2xl p-4 sm:p-6">
          {step === 1 ? (
            <>
              <div className="mb-5">
                <h1 className="text-xl sm:text-2xl font-bold font-display mb-1">Create Your Identity</h1>
                <p className="text-sm text-muted-foreground">
                  Choose a username and password. Your real name is never required.
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      name="username"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={handleChange}
                      className="pl-10 h-11 rounded-xl bg-card/50 border-border/40 text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">This will be your identity</p>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="8+ characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 h-11 rounded-xl bg-card/50 border-border/40 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 h-11 rounded-xl bg-card/50 border-border/40 text-sm"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold gap-2 shadow-lg shadow-primary/15 active:scale-[0.98] transition-all mt-2">
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-5">
                <h1 className="text-xl sm:text-2xl font-bold font-display mb-1">Private Profile</h1>
                <p className="text-sm text-muted-foreground">
                  Encrypted and only accessed during emergencies.
                </p>
              </div>

              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Emergency Contact Name</label>
                  <Input
                    type="text"
                    name="emergencyName"
                    placeholder="Full name"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    className="h-11 rounded-xl bg-card/50 border-border/40 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Emergency Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      name="emergencyContact"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="pl-10 h-11 rounded-xl bg-card/50 border-border/40 text-sm"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="contactIsSelf"
                      checked={formData.contactIsSelf}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, contactIsSelf: checked as boolean, emergencyRelation: checked ? "Self" : "" }))
                      }
                    />
                    <label htmlFor="contactIsSelf" className="text-sm cursor-pointer">
                      This is my own phone number
                    </label>
                  </div>
                </div>

                {!formData.contactIsSelf && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Relation to Contact</label>
                    <Input
                      type="text"
                      name="emergencyRelation"
                      placeholder="e.g., Parent, Guardian"
                      value={formData.emergencyRelation}
                      onChange={handleChange}
                      className="h-11 rounded-xl bg-card/50 border-border/40 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">
                    {institutionType === "school" ? "ERP ID" : "Student ID (APAAR / ABC ID)"}
                  </label>
                  <Input
                    type="text"
                    name="studentId"
                    placeholder={institutionType === "school" ? "Your ERP ID" : "Your APAAR / ABC ID"}
                    value={formData.studentId}
                    onChange={handleChange}
                    className="h-11 rounded-xl bg-card/50 border-border/40 text-sm"
                  />
                </div>

                {/* Consent */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-start gap-2.5">
                    <Checkbox
                      id="consent"
                      checked={acceptedConsent}
                      onCheckedChange={(checked) => setAcceptedConsent(checked as boolean)}
                      className="mt-0.5"
                    />
                    <label htmlFor="consent" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                      <span className="flex items-center gap-1.5 font-medium text-foreground text-sm mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-eternia-warning" />
                        Emergency Escalation Consent
                      </span>
                      I consent to the platform sharing my username and emergency contact with my institution's SPOC (Single Point of Contact) if the system or a qualified professional detects a high-risk situation requiring immediate intervention. This disclosure will only occur when there is a credible threat to my safety or the safety of others.
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold gap-2 shadow-lg shadow-primary/15 active:scale-[0.98] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Complete Registration
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          <div className="mt-5 pt-4 border-t border-border/30 text-center">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
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
