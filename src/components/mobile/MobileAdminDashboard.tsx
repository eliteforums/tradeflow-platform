import { useState } from "react";
import { Users, Calendar, MessageCircle, AlertTriangle, TrendingUp, Coins, Shield, Activity, Eye, CheckCircle, Clock, BarChart3, Search, Loader2, UserPlus, Settings, Music, Building2, FileText, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

import SoundManager from "@/components/admin/SoundManager";
import InstitutionManager from "@/components/admin/InstitutionManager";
import EscalationManager from "@/components/admin/EscalationManager";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import SPOCTools from "@/components/admin/SPOCTools";
import RoleManager from "@/components/admin/RoleManager";
import MemberManager from "@/components/admin/MemberManager";
import ExpertManager from "@/components/admin/ExpertManager";
import CreditGrantTool from "@/components/admin/CreditGrantTool";

type TabId = "overview" | "members" | "sessions" | "flags" | "sounds" | "institutions" | "escalations" | "spoc" | "audit" | "roles" | "experts";

const MobileAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const { profile } = useAuth();
  const { isAdmin, members, stats, appointments, peerSessions, flaggedEntries, isLoading } = useAdmin();

  if (!isAdmin) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-64">
        <Shield className="w-12 h-12 text-muted-foreground mb-3" /><h2 className="text-base font-semibold">Access Denied</h2>
      </div>
    </DashboardLayout>
  );

  const filteredMembers = members.filter((m) => m.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "members", label: "Members", icon: Users },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "flags", label: "Flags", icon: AlertTriangle },
    { id: "escalations", label: "Escalations", icon: Shield },
    { id: "spoc", label: "SPOC", icon: QrCode },
    { id: "sounds", label: "Sounds", icon: Music },
    { id: "roles", label: "Roles", icon: UserPlus },
    { id: "experts", label: "Experts", icon: Users },
    { id: "institutions", label: "Institutions", icon: Building2 },
    { id: "audit", label: "Audit", icon: FileText },
  ];

  const roleCounts = {
    admin: members.filter((m) => m.role === "admin").length,
    spoc: members.filter((m) => m.role === "spoc").length,
    expert: members.filter((m) => m.role === "expert").length,
    intern: members.filter((m) => m.role === "intern").length,
    student: members.filter((m) => m.role === "student").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold font-display">Super Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9"><Settings className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Control Center Banner */}
        <div className="rounded-2xl p-5 border border-primary/20" style={{ background: "linear-gradient(135deg, hsl(var(--eternia-teal) / 0.15), hsl(var(--eternia-lavender) / 0.15))" }}>
          <h2 className="text-base font-bold font-display mb-1">Super Admin Control Center</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">Full system overview — all users, all data, all modules</p>
        </div>

        {/* Role Count Cards - 2 col grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Super Admins", value: roleCounts.admin, icon: Shield, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
            { label: "SPOCs", value: roleCounts.spoc, icon: Shield, iconBg: "bg-primary/10", iconColor: "text-primary" },
            { label: "Experts", value: roleCounts.expert, icon: CheckCircle, iconBg: "bg-eternia-success/10", iconColor: "text-eternia-success" },
            { label: "Interns", value: roleCounts.intern, icon: Users, iconBg: "bg-eternia-warning/10", iconColor: "text-eternia-warning" },
            { label: "Students", value: roleCounts.student, icon: Users, iconBg: "bg-eternia-lavender/10", iconColor: "text-eternia-lavender" },
            { label: "Sessions", value: stats.totalSessions, icon: Activity, iconBg: "bg-primary/10", iconColor: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-2xl bg-card border border-border/50">
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.iconColor}`} />
              </div>
              <p className="text-2xl font-bold leading-none">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Scrollable Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-full text-sm font-medium ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {isLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-card border border-border/50 p-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-primary" />Recent Appointments</h3>
                  {appointments.length === 0 ? <p className="text-center py-6 text-sm text-muted-foreground">None</p>
                    : appointments.slice(0, 5).map((apt: any) => (
                      <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 gap-2 mb-2 last:mb-0">
                        <div className="min-w-0"><p className="font-medium text-sm truncate">{apt.student?.username} → {apt.expert?.username}</p><p className="text-xs text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")}</p></div>
                        <span className={`px-2 py-0.5 rounded text-xs shrink-0 ${apt.status === "completed" ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"}`}>{apt.status}</span>
                      </div>
                    ))}
                </div>
                <div className="rounded-2xl bg-card border border-border/50 p-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><MessageCircle className="w-4 h-4 text-primary" />Peer Sessions</h3>
                  {peerSessions.length === 0 ? <p className="text-center py-6 text-sm text-muted-foreground">None</p>
                    : peerSessions.slice(0, 5).map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 gap-2 mb-2 last:mb-0">
                        <div className="min-w-0"><p className="font-medium text-sm truncate">{s.student?.username} → {s.intern?.username || "Pending"}</p><p className="text-xs text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                        <span className={`px-2 py-0.5 rounded text-xs shrink-0 ${s.is_flagged ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{s.is_flagged ? "Flagged" : s.status}</span>
                      </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Grant Credits", icon: Coins, tab: "spoc" as TabId },
                    { label: "Add Member", icon: UserPlus, tab: "roles" as TabId },
                    { label: "View Flags", icon: AlertTriangle, tab: "flags" as TabId },
                    { label: "Experts", icon: Users, tab: "experts" as TabId },
                  ].map((a) => (
                    <button key={a.label} className="p-4 rounded-2xl bg-muted/30 border border-border text-left active:scale-[0.97]" onClick={() => setActiveTab(a.tab)}>
                      <a.icon className="w-5 h-5 text-primary mb-2" /><p className="font-medium text-sm">{a.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10 bg-card text-sm" /></div>
                  <Button size="icon" variant="outline" className="h-10 w-10" onClick={() => setActiveTab("roles")}><UserPlus className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground">{filteredMembers.length} members</p>
                {filteredMembers.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-card border border-border/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{m.username}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-xs capitalize ${m.role === "admin" ? "bg-destructive/10 text-destructive" : m.role === "spoc" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{m.role}</span>
                        <span className="text-xs text-muted-foreground">{m.total_sessions}s · {m.streak_days}d</span>
                      </div>
                    </div>
                    <span className={`w-3 h-3 rounded-full shrink-0 ${m.is_active ? "bg-eternia-success" : "bg-muted-foreground"}`} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-card border border-border/50 p-4">
                  <h3 className="font-semibold text-sm mb-3">Appointments ({appointments.length})</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {appointments.map((apt: any) => (
                      <div key={apt.id} className="p-3 rounded-xl bg-muted/30 flex items-center justify-between gap-2">
                        <div className="min-w-0"><p className="font-medium text-sm truncate">{apt.student?.username} → {apt.expert?.username}</p><p className="text-xs text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")}</p></div>
                        <span className={`px-2 py-0.5 rounded text-xs shrink-0 ${apt.status === "completed" ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"}`}>{apt.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-card border border-border/50 p-4">
                  <h3 className="font-semibold text-sm mb-3">Peer Sessions ({peerSessions.length})</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {peerSessions.map((s: any) => (
                      <div key={s.id} className={`p-3 rounded-xl flex items-center justify-between gap-2 ${s.is_flagged ? "bg-destructive/5" : "bg-muted/30"}`}>
                        <div className="min-w-0"><p className="font-medium text-sm truncate">{s.student?.username} → {s.intern?.username || "—"}</p><p className="text-xs text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                        <span className={`px-2 py-0.5 rounded text-xs shrink-0 ${s.is_flagged ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{s.is_flagged ? "⚠" : s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "flags" && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" />Flagged ({flaggedEntries.length})</h3>
                {flaggedEntries.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground"><CheckCircle className="w-10 h-10 mx-auto mb-3 text-eternia-success" /><p className="text-sm">All Clear</p></div>
                ) : flaggedEntries.map((entry: any) => (
                  <div key={entry.id} className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${entry.ai_flag_level >= 3 ? "bg-destructive text-destructive-foreground" : "bg-eternia-warning/20 text-eternia-warning"}`}>
                        {entry.ai_flag_level >= 3 ? "🔴 Critical" : "🟡 Moderate"}
                      </span>
                      <span className="text-xs text-muted-foreground">{format(new Date(entry.created_at), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Requires review</p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-1 h-9 text-xs px-3"><Eye className="w-3.5 h-3.5" />Review</Button>
                      <Button size="sm" variant="ghost" className="gap-1 h-9 text-xs px-3 text-eternia-success"><CheckCircle className="w-3.5 h-3.5" />Dismiss</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "sounds" && <SoundManager />}
            {activeTab === "institutions" && <InstitutionManager />}
            {activeTab === "escalations" && <EscalationManager />}
            {activeTab === "spoc" && <SPOCTools />}
            {activeTab === "roles" && <div className="space-y-4"><MemberManager /><RoleManager /><CreditGrantTool /></div>}
            {activeTab === "experts" && <ExpertManager />}
            {activeTab === "audit" && <AuditLogViewer />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MobileAdminDashboard;
