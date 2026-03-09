import { useIsMobile } from "@/hooks/use-mobile";
import MobileAdminDashboard from "@/components/mobile/MobileAdminDashboard";

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

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "sessions" | "flags" | "sounds" | "institutions" | "escalations" | "spoc" | "audit" | "roles" | "experts">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const { profile } = useAuth();
  const { isAdmin, isSuperAdmin, members, stats, appointments, peerSessions, flaggedEntries, isLoading } = useAdmin();

  if (isMobile) return <MobileAdminDashboard />;

  if (!isAdmin) return (
    <DashboardLayout><div className="flex flex-col items-center justify-center h-64"><Shield className="w-12 h-12 text-muted-foreground mb-3" /><h2 className="text-lg font-semibold">Access Denied</h2><p className="text-sm text-muted-foreground">You don't have permission.</p></div></DashboardLayout>
  );

  const filteredMembers = members.filter((m) => m.username.toLowerCase().includes(searchQuery.toLowerCase()));

  const adminTabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "members" as const, label: "Members", icon: Users },
    { id: "sessions" as const, label: "Sessions", icon: Calendar },
    { id: "flags" as const, label: "Flags", icon: AlertTriangle },
    { id: "escalations" as const, label: "Escalations", icon: Shield },
    { id: "spoc" as const, label: "SPOC", icon: QrCode },
    { id: "sounds" as const, label: "Sounds", icon: Music },
    { id: "roles" as const, label: "Roles", icon: UserPlus },
    { id: "experts" as const, label: "Experts", icon: Users },
    { id: "institutions" as const, label: "Institutions", icon: Building2 },
    { id: "audit" as const, label: "Audit", icon: FileText },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div><h1 className="text-2xl font-bold font-display">Admin Dashboard</h1><p className="text-xs text-muted-foreground">{profile?.role === "admin" ? "Super Admin" : "SPOC"}</p></div>
          <Button variant="outline" size="sm" className="gap-1.5 h-8"><Settings className="w-3.5 h-3.5" /><span className="text-xs">Settings</span></Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[{ label: "Students", value: stats.totalStudents, icon: Users, color: "text-primary" }, { label: "Sessions", value: stats.totalSessions, icon: Activity, color: "text-primary" }, { label: "Credits", value: stats.totalCreditsIssued, icon: Coins, color: "text-eternia-warning" }, { label: "Active", value: stats.activeToday, icon: TrendingUp, color: "text-eternia-success" }].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-card border border-border/50">
              <div className="flex items-center justify-between mb-1"><stat.icon className={`w-4 h-4 ${stat.color}`} /><span className="text-[9px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted">Today</span></div>
              <p className="text-lg font-bold leading-none">{stat.value}</p><p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {adminTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`}><tab.icon className="w-3 h-3" />{tab.label}</button>
          ))}
        </div>

        {isLoading ? <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-3">
                <div className="rounded-xl bg-card border border-border/50 p-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-primary" />Recent Appointments</h3>
                  {appointments.length === 0 ? <p className="text-center py-6 text-muted-foreground text-xs">No appointments</p>
                    : <div className="space-y-2">{appointments.slice(0, 5).map((apt: any) => (
                      <div key={apt.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 gap-2">
                        <div className="min-w-0"><p className="font-medium text-xs truncate">{apt.student?.username} → {apt.expert?.username}</p><p className="text-[10px] text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")}</p></div>
                        <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 ${apt.status === "completed" ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"}`}>{apt.status}</span>
                      </div>
                    ))}</div>}
                </div>
                <div className="rounded-xl bg-card border border-border/50 p-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><MessageCircle className="w-4 h-4 text-primary" />Recent Peer Sessions</h3>
                  {peerSessions.length === 0 ? <p className="text-center py-6 text-muted-foreground text-xs">No sessions</p>
                    : <div className="space-y-2">{peerSessions.slice(0, 5).map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 gap-2">
                        <div className="min-w-0"><p className="font-medium text-xs truncate">{s.student?.username} → {s.intern?.username || "Pending"}</p><p className="text-[10px] text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                        <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 ${s.is_flagged ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{s.is_flagged ? "Flagged" : s.status}</span>
                      </div>
                    ))}</div>}
                </div>
                <div className="rounded-xl bg-card border border-border/50 p-4">
                  <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: "Grant Credits", icon: Coins, tab: "spoc" as const }, { label: "Add Member", icon: UserPlus, tab: "roles" as const }, { label: "View Flags", icon: AlertTriangle, tab: "flags" as const }, { label: "Manage Experts", icon: Users, tab: "experts" as const }].map((a) => (
                      <button key={a.label} className="p-3 rounded-xl bg-muted/30 border border-border text-left hover:border-primary/50 transition-all" onClick={() => setActiveTab(a.tab)}><a.icon className="w-4 h-4 text-primary mb-1.5" /><p className="font-medium text-xs">{a.label}</p></button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-card text-sm" /></div>
                  <Button size="sm" variant="outline" className="gap-1 h-9 text-xs" onClick={() => setActiveTab("roles")}><UserPlus className="w-3.5 h-3.5" />Add</Button>
                </div>
                <p className="text-xs text-muted-foreground">{filteredMembers.length} members</p>
                {filteredMembers.length === 0 ? <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50"><Users className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No results</p></div>
                  : <div className="space-y-2">{filteredMembers.map((member) => (
                    <div key={member.id} className="p-3 rounded-xl bg-card border border-border/50 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-primary" /></div>
                      <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{member.username}</p><div className="flex items-center gap-2 mt-0.5 flex-wrap"><span className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${member.role === "admin" ? "bg-destructive/10 text-destructive" : member.role === "spoc" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{member.role}</span><span className="text-[10px] text-muted-foreground">{member.total_sessions} sessions</span></div></div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${member.is_active ? "bg-eternia-success" : "bg-muted-foreground"}`} />
                    </div>
                  ))}</div>}
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="space-y-3">
                <div className="rounded-xl bg-card border border-border/50 p-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-primary" />Expert Appointments ({appointments.length})</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {appointments.map((apt: any) => (
                      <div key={apt.id} className="p-2.5 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-between gap-2">
                        <div className="min-w-0"><p className="font-medium text-xs truncate">{apt.student?.username} → {apt.expert?.username}</p><p className="text-[10px] text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")} · {apt.session_type} · {apt.credits_charged} ECC</p></div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 ${apt.status === "completed" ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"}`}>{apt.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-card border border-border/50 p-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><MessageCircle className="w-4 h-4 text-primary" />Peer Sessions ({peerSessions.length})</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {peerSessions.map((s: any) => (
                      <div key={s.id} className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${s.is_flagged ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-border/30"}`}>
                        <div className="min-w-0"><p className="font-medium text-xs truncate">{s.student?.username} → {s.intern?.username || "Unassigned"}</p><p className="text-[10px] text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 ${s.is_flagged ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{s.is_flagged ? "⚠ Flagged" : s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "flags" && (
              <div className="space-y-2.5">
                <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" />Flagged Entries ({flaggedEntries.length})</h3>
                {flaggedEntries.length === 0 ? <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50"><CheckCircle className="w-10 h-10 mx-auto mb-2 text-eternia-success" /><p className="font-medium text-sm">All Clear</p></div>
                  : flaggedEntries.map((entry: any) => (
                    <div key={entry.id} className="p-3 rounded-xl border border-destructive/20 bg-destructive/5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${entry.ai_flag_level >= 3 ? "bg-destructive text-destructive-foreground" : "bg-eternia-warning/20 text-eternia-warning"}`}>{entry.ai_flag_level >= 3 ? "🔴 Critical" : entry.ai_flag_level === 2 ? "🟡 Moderate" : "🟢 Low"}</span>
                        <span className="text-[10px] text-muted-foreground">{format(new Date(entry.created_at), "MMM d, h:mm a")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2.5">Flagged by AI safety system — requires review.</p>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="gap-1 h-7 text-[11px] px-2"><Eye className="w-3 h-3" />Review</Button>
                        <Button size="sm" variant="ghost" className="gap-1 h-7 text-[11px] px-2 text-eternia-success"><CheckCircle className="w-3 h-3" />Dismiss</Button>
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

export default AdminDashboard;
