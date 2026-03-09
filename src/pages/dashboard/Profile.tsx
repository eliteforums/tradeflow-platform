import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User, Shield, Bell, Lock, Building2, Calendar, Coins, CheckCircle, Settings,
  ChevronRight, Save, Loader2, Phone, UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AccountDeletion from "@/components/admin/AccountDeletion";

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { balance } = useCredits();

  const [bio, setBio] = useState(profile?.bio || "");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingEmergency, setIsSavingEmergency] = useState(false);
  const [notifications, setNotifications] = useState({ sessions: true, credits: true, wellness: false });

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ bio, updated_at: new Date().toISOString() }).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated");
    } catch (error: any) { toast.error(error.message); } finally { setIsSaving(false); }
  };

  const handleSaveEmergency = async () => {
    if (!user) return;
    setIsSavingEmergency(true);
    try {
      const { error } = await supabase.from("user_private").upsert({
        user_id: user.id, emergency_name_encrypted: emergencyName,
        emergency_phone_encrypted: emergencyPhone, emergency_relation: emergencyRelation,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Emergency contacts saved");
    } catch (error: any) { toast.error(error.message); } finally { setIsSavingEmergency(false); }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>

        {/* Profile Card */}
        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-eternia flex items-center justify-center shrink-0">
              <User className="w-7 h-7 sm:w-10 sm:h-10 text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold font-display truncate">{profile?.username || "User"}</h2>
                {profile?.is_verified && <CheckCircle className="w-4 h-4 text-eternia-success shrink-0" />}
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs bg-primary/10 text-primary capitalize">{profile?.role || "student"}</span>
              </div>
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                <Building2 className="w-3.5 h-3.5" />
                {profile?.institution_id ? "Institution Member" : "Independent User"}
              </p>
              <p className="text-[11px] sm:text-sm text-muted-foreground mt-0.5">
                Since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
            <div className="text-center">
              <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-bold">{profile?.total_sessions || 0}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center">
              <Coins className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-bold">{balance}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Credits</p>
            </div>
            <div className="text-center">
              <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-bold">{profile?.streak_days || 0}</p>
              <p className="text-[10px] sm:text-sm text-muted-foreground">Streak</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2">
            <UserCircle className="w-4 h-4 text-primary" /> About You
          </h3>
          <Textarea placeholder="Tell us about yourself (anonymous)..." value={bio} onChange={(e) => setBio(e.target.value)}
            className="min-h-[80px] sm:min-h-[100px] bg-muted/30 border-border resize-none text-sm" />
          <Button onClick={handleSaveProfile} disabled={isSaving} size="sm" className="gap-1.5 h-8">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Bio
          </Button>
        </div>

        {/* Emergency Contacts */}
        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2">
            <Phone className="w-4 h-4 text-destructive" /> Emergency Contact
          </h3>
          <p className="text-xs text-muted-foreground">Encrypted and only accessible during escalation.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Contact Name</label>
              <Input placeholder="e.g., Parent / Guardian" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="bg-muted/30 h-9 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Relationship</label>
              <Input placeholder="e.g., Mother, Father" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} className="bg-muted/30 h-9 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
            <Input placeholder="+91 XXXXX XXXXX" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="bg-muted/30 h-9 text-sm" />
          </div>
          <Button onClick={handleSaveEmergency} disabled={isSavingEmergency} variant="outline" size="sm" className="gap-1.5 h-8">
            {isSavingEmergency ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
          </Button>
        </div>

        {/* Account Settings */}
        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" /> Account Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Username</label>
              <Input value={profile?.username || ""} disabled className="bg-muted/30 h-9 text-sm" />
              <p className="text-[11px] text-muted-foreground mt-1">Cannot be changed for anonymity</p>
            </div>
            <Link to="/dashboard/recovery-setup">
              <Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs">
                Set up recovery <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs">
              Update password <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" /> Notifications
          </h3>
          <div className="space-y-3">
            {[
              { key: "sessions" as const, label: "Session Reminders", desc: "Upcoming appointments" },
              { key: "credits" as const, label: "Credit Updates", desc: "Credits earned or spent" },
              { key: "wellness" as const, label: "Wellness Tips", desc: "Daily self-care reminders" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={notifications[item.key]} onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })} />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold font-display text-sm flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" /> Privacy & Security
          </h3>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs">View Privacy Settings <ChevronRight className="w-3.5 h-3.5" /></Button>
            <Button variant="outline" size="sm" className="w-full justify-between h-9 text-xs">Download My Data <ChevronRight className="w-3.5 h-3.5" /></Button>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-xs mb-0.5">Your Data is Protected</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">AES-256 encrypted. Only formal escalation can reveal identity.</p>
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
