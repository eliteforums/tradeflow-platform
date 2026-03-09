import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Shield, Bell, Lock, Building2, Calendar, Coins, CheckCircle, Settings, ChevronRight, Save, Loader2, Phone, UserCircle } from "lucide-react";
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
      <div className="space-y-3 pb-24">
        <h1 className="text-lg font-bold font-display">Profile</h1>

        {/* Profile Card */}
        <div className="p-3 rounded-xl bg-card border border-border">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-eternia flex items-center justify-center shrink-0"><User className="w-6 h-6 text-background" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm font-bold font-display truncate">{profile?.username || "User"}</h2>
                {profile?.is_verified && <CheckCircle className="w-3.5 h-3.5 text-eternia-success" />}
                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-primary/10 text-primary capitalize">{profile?.role}</span>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" />{profile?.institution_id ? "Institution" : "Independent"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
            {[
              { icon: Calendar, val: profile?.total_sessions || 0, label: "Sessions" },
              { icon: Coins, val: balance, label: "Credits" },
              { icon: Shield, val: profile?.streak_days || 0, label: "Streak" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-4 h-4 text-primary mx-auto mb-0.5" />
                <p className="text-sm font-bold">{s.val}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div className="p-3 rounded-xl bg-card border border-border space-y-2">
          <h3 className="font-semibold text-xs flex items-center gap-1.5"><UserCircle className="w-3.5 h-3.5 text-primary" />About</h3>
          <Textarea placeholder="About you (anonymous)..." value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[70px] bg-muted/30 resize-none text-xs" />
          <Button onClick={handleSaveProfile} disabled={isSaving} size="sm" className="gap-1 h-7 text-[10px]">
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
          </Button>
        </div>

        {/* Emergency */}
        <div className="p-3 rounded-xl bg-card border border-border space-y-2">
          <h3 className="font-semibold text-xs flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-destructive" />Emergency Contact</h3>
          <p className="text-[9px] text-muted-foreground">Encrypted, only for escalation.</p>
          <div className="space-y-2">
            <Input placeholder="Contact Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} className="bg-muted/30 h-8 text-xs" />
            <Input placeholder="Relationship" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} className="bg-muted/30 h-8 text-xs" />
            <Input placeholder="+91 XXXXX XXXXX" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} className="bg-muted/30 h-8 text-xs" />
          </div>
          <Button onClick={handleSaveEmergency} disabled={isSavingEmergency} variant="outline" size="sm" className="gap-1 h-7 text-[10px]">
            {isSavingEmergency ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}Save
          </Button>
        </div>

        {/* Settings */}
        <div className="p-3 rounded-xl bg-card border border-border space-y-2.5">
          <h3 className="font-semibold text-xs flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-primary" />Settings</h3>
          <div>
            <label className="text-[9px] text-muted-foreground mb-0.5 block">Username</label>
            <Input value={profile?.username || ""} disabled className="bg-muted/30 h-8 text-xs" />
          </div>
          <Link to="/dashboard/recovery-setup"><Button variant="outline" size="sm" className="w-full justify-between h-8 text-[10px]">Recovery setup<ChevronRight className="w-3 h-3" /></Button></Link>
          <Button variant="outline" size="sm" className="w-full justify-between h-8 text-[10px]">Update password<ChevronRight className="w-3 h-3" /></Button>
        </div>

        {/* Notifications */}
        <div className="p-3 rounded-xl bg-card border border-border space-y-2.5">
          <h3 className="font-semibold text-xs flex items-center gap-1.5"><Bell className="w-3.5 h-3.5 text-primary" />Notifications</h3>
          {[
            { key: "sessions" as const, label: "Session Reminders", desc: "Upcoming appointments" },
            { key: "credits" as const, label: "Credit Updates", desc: "Credits earned/spent" },
            { key: "wellness" as const, label: "Wellness Tips", desc: "Daily reminders" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-2">
              <div><p className="text-xs font-medium">{item.label}</p><p className="text-[9px] text-muted-foreground">{item.desc}</p></div>
              <Switch checked={notifications[item.key]} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c })} />
            </div>
          ))}
        </div>

        {/* Privacy */}
        <div className="p-3 rounded-xl bg-card border border-border space-y-2">
          <h3 className="font-semibold text-xs flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-primary" />Privacy</h3>
          <Button variant="outline" size="sm" className="w-full justify-between h-8 text-[10px]">View Privacy Settings<ChevronRight className="w-3 h-3" /></Button>
          <Button variant="outline" size="sm" className="w-full justify-between h-8 text-[10px]">Download My Data<ChevronRight className="w-3 h-3" /></Button>
          <div className="p-2 rounded-lg bg-muted/30 flex items-start gap-2">
            <Shield className="w-3 h-3 text-primary shrink-0 mt-0.5" />
            <p className="text-[9px] text-muted-foreground">AES-256 encrypted. Identity only revealed via formal escalation.</p>
          </div>
        </div>

        <AccountDeletion />
      </div>
    </DashboardLayout>
  );
};

export default MobileProfile;
