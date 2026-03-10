import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Shield, Bell, Lock, Building2, Calendar, Coins, CheckCircle, Settings, ChevronRight, Save, Loader2, Phone, UserCircle, LogOut } from "lucide-react";
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

const MobileProfile = () => {
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
    if (!user) return; setIsSaving(true);
    try { await supabase.from("profiles").update({ bio, updated_at: new Date().toISOString() }).eq("id", user.id); await refreshProfile(); toast.success("Saved"); } catch (e: any) { toast.error(e.message); } finally { setIsSaving(false); }
  };

  const handleSaveEmergency = async () => {
    if (!user) return; setIsSavingEmergency(true);
    try { await supabase.from("user_private").upsert({ user_id: user.id, emergency_name_encrypted: emergencyName, emergency_phone_encrypted: emergencyPhone, emergency_relation: emergencyRelation, updated_at: new Date().toISOString() }, { onConflict: "user_id" }); toast.success("Saved"); } catch (e: any) { toast.error(e.message); } finally { setIsSavingEmergency(false); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        <h1 className="text-xl font-bold font-display">Profile</h1>

        {/* Profile Card */}
        <div className="p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-eternia flex items-center justify-center shrink-0"><User className="w-7 h-7 text-background" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold font-display truncate">{profile?.username || "User"}</h2>
                {profile?.is_verified && <CheckCircle className="w-4 h-4 text-eternia-success" />}
                <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary capitalize">{profile?.role}</span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Building2 className="w-3.5 h-3.5" />{profile?.institution_id ? "Institution" : "Independent"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
            {[
              { icon: Calendar, val: profile?.total_sessions || 0, label: "Sessions" },
              { icon: Coins, val: balance, label: "Credits" },
              { icon: Shield, val: profile?.streak_days || 0, label: "Streak" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-base font-bold">{s.val}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><UserCircle className="w-4 h-4 text-primary" />About</h3>
          <Textarea placeholder="About you (anonymous)..." value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[80px] bg-muted/30 resize-none text-sm" />
          <Button onClick={handleSaveProfile} disabled={isSaving} size="sm" className="gap-1.5 h-9 text-xs">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save
          </Button>
        </div>

        {/* Emergency */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Phone className="w-4 h-4 text-destructive" />Emergency Contact</h3>
          <p className="text-xs text-muted-foreground">Encrypted, only for escalation.</p>
          <div className="space-y-2">
            <Input placeholder="Contact Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="bg-muted/30 h-10 text-sm" />
            <Input placeholder="Relationship" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} className="bg-muted/30 h-10 text-sm" />
            <Input placeholder="+91 XXXXX XXXXX" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="bg-muted/30 h-10 text-sm" />
          </div>
          <Button onClick={handleSaveEmergency} disabled={isSavingEmergency} variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
            {isSavingEmergency ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save
          </Button>
        </div>

        {/* Settings */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Settings className="w-4 h-4 text-primary" />Settings</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Username</label>
            <Input value={profile?.username || ""} disabled className="bg-muted/30 h-10 text-sm" />
          </div>
          <Link to="/dashboard/recovery-setup"><Button variant="outline" className="w-full justify-between h-10 text-sm">Recovery setup<ChevronRight className="w-4 h-4" /></Button></Link>
          <Button variant="outline" className="w-full justify-between h-10 text-sm">Update password<ChevronRight className="w-4 h-4" /></Button>
        </div>

        {/* Notifications */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-primary" />Notifications</h3>
          {[
            { key: "sessions" as const, label: "Session Reminders", desc: "Upcoming appointments" },
            { key: "credits" as const, label: "Credit Updates", desc: "Credits earned/spent" },
            { key: "wellness" as const, label: "Wellness Tips", desc: "Daily reminders" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 py-1">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch checked={notifications[item.key]} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c })} />
            </div>
          ))}
        </div>

        {/* Privacy */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Lock className="w-4 h-4 text-primary" />Privacy</h3>
          <Button variant="outline" className="w-full justify-between h-10 text-sm">View Privacy Settings<ChevronRight className="w-4 h-4" /></Button>
          <Button variant="outline" className="w-full justify-between h-10 text-sm">Download My Data<ChevronRight className="w-4 h-4" /></Button>
          <div className="p-3 rounded-xl bg-muted/30 flex items-start gap-2">
            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">AES-256 encrypted. Identity only revealed via formal escalation.</p>
          </div>
        </div>

        <AccountDeletion />
      </div>
    </DashboardLayout>
  );
};

export default MobileProfile;
