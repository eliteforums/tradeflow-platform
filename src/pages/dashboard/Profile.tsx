import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Shield,
  Bell,
  Lock,
  Building2,
  Calendar,
  Coins,
  CheckCircle,
  Settings,
  ChevronRight,
  AlertTriangle,
  Save,
  Loader2,
  Phone,
  UserCircle,
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

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { balance } = useCredits();

  const [bio, setBio] = useState(profile?.bio || "");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingEmergency, setIsSavingEmergency] = useState(false);
  const [notifications, setNotifications] = useState({
    sessions: true,
    credits: true,
    wellness: false,
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ bio, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEmergency = async () => {
    if (!user) return;
    setIsSavingEmergency(true);
    try {
      const { error } = await supabase
        .from("user_private")
        .upsert({
          user_id: user.id,
          emergency_name_encrypted: emergencyName,
          emergency_phone_encrypted: emergencyPhone,
          emergency_relation: emergencyRelation,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) throw error;
      toast.success("Emergency contacts saved");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingEmergency(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-eternia flex items-center justify-center shrink-0">
              <User className="w-10 h-10 text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl font-bold font-display">{profile?.username || "User"}</h2>
                {profile?.is_verified && (
                  <CheckCircle className="w-5 h-5 text-eternia-success" />
                )}
                <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary capitalize">
                  {profile?.role || "student"}
                </span>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4" />
                {profile?.institution_id ? "Institution Member" : "Independent User"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{profile?.total_sessions || 0}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center">
              <Coins className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{balance}</p>
              <p className="text-sm text-muted-foreground">Credits</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{profile?.streak_days || 0}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </div>

        {/* Edit Bio */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="font-semibold font-display flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-primary" />
            About You
          </h3>
          <Textarea
            placeholder="Tell us a bit about yourself (optional, stays anonymous)..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-[100px] bg-muted/30 border-border resize-none"
          />
          <Button onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Bio
          </Button>
        </div>

        {/* Emergency Contacts */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="font-semibold font-display flex items-center gap-2">
            <Phone className="w-5 h-5 text-destructive" />
            Emergency Contact
          </h3>
          <p className="text-sm text-muted-foreground">
            This information is encrypted and only accessible during formal escalation protocols.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Contact Name</label>
              <Input
                placeholder="e.g., Parent / Guardian"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="bg-muted/30"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Relationship</label>
              <Input
                placeholder="e.g., Mother, Father, Friend"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                className="bg-muted/30"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Phone Number</label>
            <Input
              placeholder="+91 XXXXX XXXXX"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="bg-muted/30"
            />
          </div>
          <Button onClick={handleSaveEmergency} disabled={isSavingEmergency} variant="outline" className="gap-2">
            {isSavingEmergency ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Emergency Contact
          </Button>
        </div>

        {/* Account Settings */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
          <h3 className="font-semibold font-display flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Account Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Username</label>
              <Input value={profile?.username || ""} disabled className="bg-muted/30" />
              <p className="text-xs text-muted-foreground mt-1">
                Username cannot be changed to protect anonymity
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Account Recovery</label>
              <Link to="/dashboard/recovery-setup">
                <Button variant="outline" className="w-full justify-between">
                  Set up recovery (Fragment Pairs + Emoji Pattern)
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Change Password</label>
              <Button variant="outline" className="w-full justify-between">
                Update your password
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
          <h3 className="font-semibold font-display flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h3>
          <div className="space-y-4">
            {[
              { key: "sessions" as const, label: "Session Reminders", desc: "Get notified about upcoming appointments" },
              { key: "credits" as const, label: "Credit Updates", desc: "Notifications for credits earned or spent" },
              { key: "wellness" as const, label: "Wellness Tips", desc: "Daily tips and reminders for self-care" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
          <h3 className="font-semibold font-display flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Privacy & Security
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-between">
              View Privacy Settings
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between">
              Download My Data
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">Your Data is Protected</p>
                <p className="text-xs text-muted-foreground">
                  All personal information is encrypted with AES-256. Only formal escalation protocols can reveal your identity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-4">
          <h3 className="font-semibold font-display flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
