import { useIsMobile } from "@/hooks/use-mobile";
import MobileAdminDashboard from "@/components/mobile/MobileAdminDashboard";

import { useState } from "react";
import {
  Users, Calendar, MessageCircle, AlertTriangle, TrendingUp, Coins,
  Shield, Activity, Eye, CheckCircle, Clock, BarChart3, Search, Loader2,
  UserPlus, Settings, Music, Building2, FileText, QrCode, Crown, UserCheck,
  Stethoscope, GraduationCap, Phone, Zap,
} from "lucide-react";
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

  // Derived stats
  const adminCount = members.filter(m => m.role === "admin").length;
  const spocCount = members.filter(m => m.role === "spoc").length;
  const expertCount = members.filter(m => m.role === "expert").length;
  const internCount = members.filter(m => m.role === "intern").length;
  const studentCount = members.filter(m => m.role === "student").length;

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
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-display">
              {isSuperAdmin ? "Super Admin Dashboard" : "SPOC Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isSuperAdmin ? "Full system overview — all users, all data, all modules" : "Institution management & student support"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-9 w-48 h-9 bg-card text-sm" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 h-9"><Settings className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Control Center Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/10 to-accent/15 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm font-display">
                {isSuperAdmin ? "Super Admin Control Center" : "SPOC Control Center"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isSuperAdmin ? "Full system overview — all users, all data, all modules" : "Manage your institution's students and services"}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {adminTabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-5">
                {/* Role Stat Cards — Row 1 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Admins", value: adminCount, icon: Crown, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
                    { label: "SPOCs", value: spocCount, icon: Shield, iconBg: "bg-primary/10", iconColor: "text-primary" },
                    { label: "Experts", value: expertCount, icon: Stethoscope, iconBg: "bg-eternia-success/10", iconColor: "text-eternia-success" },
                    { label: "Interns", value: internCount, icon: GraduationCap, iconBg: "bg-eternia-warning/10", iconColor: "text-eternia-warning" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center mb-3`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <p className="text-2xl font-bold leading-none">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Platform Stat Cards — Row 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Students", value: studentCount, icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
                    { label: "Total Sessions", value: stats.totalSessions, icon: Activity, iconBg: "bg-primary/10", iconColor: "text-primary" },
                    { label: "Credits Issued", value: stats.totalCreditsIssued, icon: Coins, iconBg: "bg-eternia-warning/10", iconColor: "text-eternia-warning" },
                    { label: "Active Today", value: stats.activeToday, icon: Zap, iconBg: "bg-eternia-success/10", iconColor: "text-eternia-success" },
                    { label: "Flagged", value: flaggedEntries.length, icon: AlertTriangle, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors">
                      <div className={`w-9 h-9 rounded-lg ${stat.iconBg} flex items-center justify-center mb-2.5`}>
                        <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                      </div>
                      <p className="text-xl font-bold leading-none">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Activity — 2 column */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Recent Appointments */}
                  <div className="rounded-2xl bg-card border border-border/50 p-5">
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                      <Calendar className="w-4 h-4 text-primary" />Recent Appointments
                    </h3>
                    {appointments.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground text-xs">No appointments yet</p>
                    ) : (
                      <div className="space-y-2">
                        {appointments.slice(0, 5).map((apt: any) => (
                          <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-xs truncate">{apt.student?.username} → {apt.expert?.username}</p>
                              <p className="text-[10px] text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${apt.status === "completed" ? "bg-eternia-success/10 text-eternia-success" : apt.status === "pending" ? "bg-eternia-warning/10 text-eternia-warning" : "bg-muted text-muted-foreground"}`}>
                              {apt.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Peer Sessions */}
                  <div className="rounded-2xl bg-card border border-border/50 p-5">
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                      <MessageCircle className="w-4 h-4 text-primary" />Recent Peer Sessions
                    </h3>
                    {peerSessions.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground text-xs">No sessions yet</p>
                    ) : (
                      <div className="space-y-2">
                        {peerSessions.slice(0, 5).map((s: any) => (
                          <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 gap-2">
                            <div className="min-w-0">
                              <p className="font-medium text-xs truncate">{s.student?.username} → {s.intern?.username || "Pending"}</p>
                              <p className="text-[10px] text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${s.is_flagged ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                              {s.is_flagged ? "Flagged" : s.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl bg-card border border-border/50 p-5">
                  <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Grant Credits", icon: Coins, tab: "spoc" as const, iconBg: "bg-eternia-warning/10", iconColor: "text-eternia-warning" },
                      { label: "Add Member", icon: UserPlus, tab: "roles" as const, iconBg: "bg-primary/10", iconColor: "text-primary" },
                      { label: "View Flags", icon: AlertTriangle, tab: "flags" as const, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
                      { label: "Manage Experts", icon: Stethoscope, tab: "experts" as const, iconBg: "bg-eternia-success/10", iconColor: "text-eternia-success" },
                    ].map((a) => (
                      <button key={a.label} className="p-4 rounded-xl bg-muted/20 border border-border/50 text-left hover:border-primary/30 hover:bg-muted/30 transition-all group" onClick={() => setActiveTab(a.tab)}>
                        <div className={`w-9 h-9 rounded-lg ${a.iconBg} flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform`}>
                          <a.icon className={`w-4 h-4 ${a.iconColor}`} />
                        </div>
                        <p className="font-medium text-sm">{a.label}</p>
                      </button>
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
                      <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{member.username}</p><div className="flex items-center gap-2 mt-0.5 flex-wrap"><span className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${member.role === "admin" ? "bg-destructive/10 text-destructive" : member.role === "spoc" ? "bg-primary/10 text-primary" : member.role === "expert" ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"}`}>{member.role}</span><span className="text-[10px] text-muted-foreground">{member.total_sessions} sessions</span></div></div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${member.is_active ? "bg-eternia-success" : "bg-muted-foreground"}`} />
                    </div>
                  ))}</div>}
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-card border border-border/50 p-5">
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Calendar className="w-4 h-4 text-primary" />Expert Appointments ({appointments.length})</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {appointments.length === 0 ? <p className="text-center py-8 text-muted-foreground text-xs">No appointments</p> : appointments.map((apt: any) => (
                      <div key={apt.id} className="p-3 rounded-xl bg-muted/30 border border-border/30 flex items-center justify-between gap-2">
                        <div className="min-w-0"><p className="font-medium text-xs truncate">{apt.student?.username} → {apt.expert?.username}</p><p className="text-[10px] text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")} · {apt.session_type} · {apt.credits_charged} ECC</p></div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${apt.status === "completed" ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"}`}>{apt.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-card border border-border/50 p-5">
                  <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><MessageCircle className="w-4 h-4 text-primary" />Peer Sessions ({peerSessions.length})</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {peerSessions.length === 0 ? <p className="text-center py-8 text-muted-foreground text-xs">No sessions</p> : peerSessions.map((s: any) => (
                      <div key={s.id} className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${s.is_flagged ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-border/30"}`}>
                        <div className="min-w-0"><p className="font-medium text-xs truncate">{s.student?.username} → {s.intern?.username || "Unassigned"}</p><p className="text-[10px] text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ${s.is_flagged ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{s.is_flagged ? "⚠ Flagged" : s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "flags" && (
              <div className="space-y-2.5">
                <h3 className="font-semibold text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" />Flagged Entries ({flaggedEntries.length})</h3>
                {flaggedEntries.length === 0 ? <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border/50"><CheckCircle className="w-10 h-10 mx-auto mb-2 text-eternia-success" /><p className="font-medium text-sm">All Clear</p><p className="text-xs text-muted-foreground mt-1">No flagged entries</p></div>
                  : flaggedEntries.map((entry: any) => (
                    <div key={entry.id} className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
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