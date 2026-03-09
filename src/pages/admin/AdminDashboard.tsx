import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Users,
  Coins,
  BarChart3,
  AlertTriangle,
  Plus,
  Search,
  Settings,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { label: "Total Students", value: "1,234", icon: Users, trend: "+12%" },
    { label: "Active Sessions", value: "45", icon: BarChart3, trend: "+8%" },
    { label: "Credits Allocated", value: "50,000", icon: Coins, trend: "45% used" },
    { label: "Escalations", value: "3", icon: AlertTriangle, trend: "2 pending" },
  ];

  const recentAlerts = [
    { id: 1, type: "escalation", message: "High-risk flag detected in BlackBox module", time: "10 min ago", severity: "high" },
    { id: 2, type: "session", message: "Peer Connect session exceeded duration limit", time: "1 hour ago", severity: "medium" },
    { id: 3, type: "credit", message: "Bulk credit allocation completed for Batch 2024", time: "3 hours ago", severity: "low" },
  ];

  const institutions = [
    { name: "Demo University", students: 450, credits: 15000, plan: "Premium" },
    { name: "Tech Institute", students: 280, credits: 8000, plan: "Basic" },
    { name: "Medical College", students: 190, credits: 12000, plan: "Premium" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-eternia flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-background" />
            </div>
            <div>
              <span className="text-xl font-bold font-display">Eternia Admin</span>
              <p className="text-xs text-muted-foreground">
                {profile?.role === "spoc" ? "Institution SPOC" : "Platform Admin"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">Student View</Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut}>Logout</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Tabs */}
        <div className="flex gap-2">
          {["overview", "students", "credits", "escalations", "settings"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "bg-primary" : ""}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="p-5 rounded-xl bg-card border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className="w-6 h-6 text-primary" />
                    <span className="text-xs text-muted-foreground">{stat.trend}</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Alerts & Institutions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Alerts */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  Recent Alerts
                </h3>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                        alert.severity === "high" ? "bg-destructive" :
                        alert.severity === "medium" ? "bg-eternia-warning" :
                        "bg-primary"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Institutions */}
              <div className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="font-semibold font-display mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Institutions
                </h3>
                <div className="space-y-3">
                  {institutions.map((inst) => (
                    <div key={inst.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium">{inst.name}</p>
                        <p className="text-xs text-muted-foreground">{inst.students} students · {inst.plan}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{inst.credits.toLocaleString()} ECC</p>
                        <p className="text-xs text-muted-foreground">credits pool</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="p-6 h-auto flex-col items-start gap-2">
                <Users className="w-6 h-6 text-primary" />
                <span className="font-semibold">Onboard Students</span>
                <span className="text-xs text-muted-foreground">Generate QR code for batch onboarding</span>
              </Button>
              <Button variant="outline" className="p-6 h-auto flex-col items-start gap-2">
                <Coins className="w-6 h-6 text-primary" />
                <span className="font-semibold">Allocate Credits</span>
                <span className="text-xs text-muted-foreground">Bulk credit distribution to students</span>
              </Button>
              <Button variant="outline" className="p-6 h-auto flex-col items-start gap-2">
                <Shield className="w-6 h-6 text-primary" />
                <span className="font-semibold">View Analytics</span>
                <span className="text-xs text-muted-foreground">Anonymous aggregate wellbeing metrics</span>
              </Button>
            </div>
          </>
        )}

        {activeTab === "students" && (
          <div className="p-6 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold font-display">Student Management</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search students..." className="pl-9 w-64" />
                </div>
                <Button className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" /> Add Student
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-center py-12">
              Student management interface — search, view anonymous profiles, and manage access.
            </p>
          </div>
        )}

        {activeTab === "credits" && (
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold font-display mb-6">Credit Allocation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-eternia text-background">
                <p className="text-background/70 text-sm">Total Pool</p>
                <p className="text-2xl font-bold">50,000 ECC</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-muted-foreground text-sm">Distributed</p>
                <p className="text-2xl font-bold">22,500 ECC</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <p className="text-muted-foreground text-sm">Remaining</p>
                <p className="text-2xl font-bold">27,500 ECC</p>
              </div>
            </div>
            <Button className="btn-primary">
              <Coins className="w-4 h-4 mr-2" /> Bulk Allocate Credits
            </Button>
          </div>
        )}

        {activeTab === "escalations" && (
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold font-display mb-6">Escalation Management</h3>
            <div className="space-y-3">
              {recentAlerts.filter(a => a.type === "escalation").map((alert) => (
                <div key={alert.id} className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm text-muted-foreground">{alert.time}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Review</Button>
                      <Button variant="destructive" size="sm">Escalate</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h3 className="font-semibold font-display mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Institution Settings
            </h3>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Institution Name</label>
                <Input defaultValue="Demo University" className="bg-muted/30" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Eternia Code</label>
                <Input defaultValue="DEMO123" disabled className="bg-muted/30" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Plan Type</label>
                <Input defaultValue="Premium" disabled className="bg-muted/30" />
              </div>
              <Button className="btn-primary">Save Changes</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
