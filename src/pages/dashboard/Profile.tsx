import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Profile = () => {
  const [notifications, setNotifications] = useState({
    sessions: true,
    credits: true,
    wellness: false,
  });

  const user = {
    username: "anonymous_user_42",
    institution: "Demo University",
    memberSince: "March 2024",
    totalSessions: 12,
    creditsEarned: 350,
    currentStreak: 7,
    verified: true,
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
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-eternia flex items-center justify-center">
              <User className="w-10 h-10 text-background" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold font-display">{user.username}</h2>
                {user.verified && (
                  <CheckCircle className="w-5 h-5 text-eternia-success" />
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {user.institution}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Member since {user.memberSince}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{user.totalSessions}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center">
              <Coins className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{user.creditsEarned}</p>
              <p className="text-sm text-muted-foreground">Credits Earned</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{user.currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>
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
              <Input value={user.username} disabled className="bg-muted/30" />
              <p className="text-xs text-muted-foreground mt-1">
                Username cannot be changed to protect anonymity
              </p>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get notified about upcoming appointments
                </p>
              </div>
              <Switch
                checked={notifications.sessions}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, sessions: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Credit Updates</p>
                <p className="text-sm text-muted-foreground">
                  Notifications for credits earned or spent
                </p>
              </div>
              <Switch
                checked={notifications.credits}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, credits: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Wellness Tips</p>
                <p className="text-sm text-muted-foreground">
                  Daily tips and reminders for self-care
                </p>
              </div>
              <Switch
                checked={notifications.wellness}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, wellness: checked })
                }
              />
            </div>
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
            <Button variant="outline" className="w-full justify-between">
              Manage Device Sessions
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">Your Data is Protected</p>
                <p className="text-xs text-muted-foreground">
                  All personal information is encrypted with AES-256 and stored separately 
                  from your anonymous profile. Only formal escalation protocols can reveal your identity.
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
