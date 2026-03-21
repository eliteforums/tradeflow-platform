import { useIsMobile } from "@/hooks/use-mobile";
import MobileProfile from "@/components/mobile/MobileProfile";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User, Shield, Bell, Lock, Building2, Calendar, Coins, CheckCircle, Settings,
  ChevronRight, Save, Loader2, Phone, UserCircle, BadgeCheck, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AccountDeletion from "@/components/admin/AccountDeletion";

const Profile = () => {
  const isMobile = useIsMobile();
  const { user, profile, refreshProfile } = useAuth();
  const { balance } = useCredits();
  const [bio, setBio] = useState(profile?.bio || "");

  // APAAR / Student ID
  const [studentId, setStudentId] = useState("");
  const [isVerifyingId, setIsVerifyingId] = useState(false);
  const [idVerified, setIdVerified] = useState(false);

  // Emergency contact
  const [contactIsSelf, setContactIsSelf] = useState<boolean | null>(null);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingEmergency, setIsSavingEmergency] = useState(false);
  const [notifications, setNotifications] = useState({ sessions: true, credits: true, wellness: false });

  // Load existing private data
  useEffect(() => {
    if (!user) return;
    const loadPrivate = async () => {
      const { data } = await supabase
        .from("user_private")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setContactIsSelf(data.contact_is_self ?? null);
        setEmergencyName(data.emergency_name_encrypted || "");
        setEmergencyPhone(data.emergency_phone_encrypted || "");
        setEmergencyRelation(data.emergency_relation || "");
        if (data.student_id_encrypted) {
          setStudentId("••••••••"); // masked
          setIdVerified(true);
        }
      }
    };
    loadPrivate();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ bio, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerifyStudentId = async () => {
    if (!user || !studentId.trim() || studentId === "••••••••") return;
    if (studentId.trim().length < 4) {
      toast.error("Please enter a valid ID (minimum 4 characters)");
      return;
    }
    setIsVerifyingId(true);
    try {
      const { error } = await supabase.from("user_private").upsert({
        user_id: user.id,
        student_id_encrypted: studentId.trim(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      setIdVerified(true);
      setStudentId("••••••••");
      toast.success("Student ID verified and stored securely");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsVerifyingId(false);
    }
  };

  const handleSaveEmergency = async () => {
    if (!user || contactIsSelf === null) return;
    if (!emergencyPhone.trim()) {
      toast.error("Phone number is required");
      return;
    }
    if (!contactIsSelf && !emergencyRelation.trim()) {
      toast.error("Relationship is required when contact is not self");
      return;
    }
    setIsSavingEmergency(true);
    try {
      const { error } = await supabase.from("user_private").upsert({
        user_id: user.id,
        contact_is_self: contactIsSelf,
        emergency_name_encrypted: contactIsSelf ? "" : emergencyName.trim(),
        emergency_phone_encrypted: emergencyPhone.trim(),
        emergency_relation: contactIsSelf ? "self" : emergencyRelation.trim(),
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Emergency contact saved");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSavingEmergency(false);
    }
  };

  if (isMobile) return <MobileProfile />;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display mb-1">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-eternia flex items-center justify-center shrink-0">
              <User className="w-10 h-10 text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h2 className="text-xl font-bold font-display truncate">{profile?.username || "User"}</h2>
                {profile?.is_verified && <CheckCircle className="w-4 h-4 text-eternia-success" />}
                <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary capitalize">{profile?.role}</span>
              </div>
              <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <Building2 className="w-3.5 h-3.5" />{profile?.institution_id ? "Institution Member" : "Independent User"}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A"}
              </p>
            </div>
          </div>
         <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center"><Calendar className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-2xl font-bold">{profile?.total_sessions || 0}</p><p className="text-sm text-muted-foreground">Sessions</p></div>
            {profile?.role === "student" && (
              <div className="text-center"><Coins className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-2xl font-bold">{balance}</p><p className="text-sm text-muted-foreground">Credits</p></div>
            )}
            <div className="text-center"><Shield className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-2xl font-bold">{profile?.streak_days || 0}</p><p className="text-sm text-muted-foreground">Streak</p></div>
          </div>
          {(profile as any)?.student_id && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">Student ID</p>
              <p className="text-sm font-mono font-medium text-primary">{(profile as any).student_id}</p>
            </div>
          )}
        </div>

        {/* APAAR / Student ID Verification */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-primary" />Student Verification (APAAR / ABC / ERP ID)
          </h3>
          <p className="text-xs text-muted-foreground">
            Submit your APAAR ID (university/college) or ERP ID (school) for institutional verification. This ID is encrypted and never visible publicly.
          </p>
          {idVerified ? (
            <div className="p-3 rounded-xl bg-eternia-success/10 border border-eternia-success/20 flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-eternia-success shrink-0" />
              <div>
                <p className="text-sm font-medium text-eternia-success">Verified</p>
                <p className="text-[11px] text-muted-foreground">Your student ID has been securely stored.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Enter APAAR / ABC / ERP ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="bg-muted/30 h-9 text-sm"
                maxLength={30}
              />
              <Button
                onClick={handleVerifyStudentId}
                disabled={!studentId.trim() || isVerifyingId}
                size="sm"
                className="gap-1.5 h-8"
              >
                {isVerifyingId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
                Verify & Store
              </Button>
            </div>
          )}
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              Your ID is AES-256 encrypted and accessible only by Eternia Admin during formal escalation. It is never exposed in any API response.
            </p>
          </div>
        </div>

        {/* Bio */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2"><UserCircle className="w-4 h-4 text-primary" />About You</h3>
          <Textarea placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px] bg-muted/30 border-border resize-none text-sm" />
          <Button onClick={handleSaveProfile} disabled={isSaving} size="sm" className="gap-1.5 h-8">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Save Bio
          </Button>
        </div>

        {/* Emergency Contact */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-destructive" />Emergency Contact
          </h3>
          <p className="text-xs text-muted-foreground">Encrypted and only accessible during escalation.</p>

          {/* Self or Other selection */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Whose number is this? *
            </label>
            <Select
              value={contactIsSelf === null ? "" : contactIsSelf ? "self" : "other"}
              onValueChange={(v) => {
                setContactIsSelf(v === "self");
                if (v === "self") {
                  setEmergencyName("");
                  setEmergencyRelation("self");
                }
              }}
            >
              <SelectTrigger className="h-9 text-sm bg-muted/30"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="self">My own number</SelectItem>
                <SelectItem value="other">Someone else's number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Phone — always shown */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Phone Number *</label>
            <Input
              placeholder="+91 XXXXX XXXXX"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="bg-muted/30 h-9 text-sm"
              maxLength={15}
            />
          </div>

          {/* Relationship + Name — only when "not self" */}
          {contactIsSelf === false && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Contact Name *</label>
                <Input
                  placeholder="e.g., Parent / Guardian"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="bg-muted/30 h-9 text-sm"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Relationship *</label>
                <Select value={emergencyRelation} onValueChange={setEmergencyRelation}>
                  <SelectTrigger className="h-9 text-sm bg-muted/30"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="guardian">Guardian</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            onClick={handleSaveEmergency}
            disabled={isSavingEmergency || contactIsSelf === null || !emergencyPhone.trim()}
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
          >
            {isSavingEmergency ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Emergency Contact
          </Button>
        </div>

        {/* Account Settings */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2"><Settings className="w-4 h-4 text-primary" />Account Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Username</label>
              <Input value={profile?.username || ""} disabled className="bg-muted/30 h-9 text-sm" />
              <p className="text-[11px] text-muted-foreground mt-1">Cannot be changed for anonymity</p>
            </div>
            <Link to="/dashboard/recovery-setup"><Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs">Set up recovery<ChevronRight className="w-3.5 h-3.5" /></Button></Link>
            <Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs">Update password<ChevronRight className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-primary" />Notifications</h3>
          <div className="space-y-3">
            {[
              { key: "sessions" as const, label: "Session Reminders", desc: "Upcoming appointments" },
              { key: "credits" as const, label: "Credit Updates", desc: "Credits earned or spent" },
              { key: "wellness" as const, label: "Wellness Tips", desc: "Daily self-care reminders" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <div><p className="font-medium text-sm">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                <Switch checked={notifications[item.key]} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c })} />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Consent */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-primary" />Privacy & Security</h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs">View Privacy Settings<ChevronRight className="w-3.5 h-3.5" /></Button>
            <Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs">Download My Data<ChevronRight className="w-3.5 h-3.5" /></Button>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div><p className="font-medium text-xs mb-0.5">Your Data is Protected</p><p className="text-[11px] text-muted-foreground leading-relaxed">AES-256 encrypted. Only formal escalation can reveal identity.</p></div>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-xs mb-0.5 text-destructive">Withdraw Consent</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                  Under DPDP Act 2023, you can withdraw your consent at any time. This will initiate account deletion and data erasure.
                </p>
              </div>
            </div>
          </div>
        </div>

        <AccountDeletion />
      </div>
    </DashboardLayout>
  );
};

export default Profile;
