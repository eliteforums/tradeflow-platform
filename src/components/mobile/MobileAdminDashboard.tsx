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
        <Shield className="w-10 h-10 text-muted-foreground mb-2" /><h2 className="text-sm font-semibold">Access Denied</h2>
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

  return (
    <DashboardLayout>
      <div className="space-y-3 pb-24">
        <div className="flex items-center justify-between">
          <div><h1 className="text-lg font-bold font-display">Admin</h1><p className="text-[10px] text-muted-foreground">{profile?.role === "admin" ? "Super Admin" : "SPOC"}</p></div>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0"><Settings className="w-3.5 h-3.5" /></Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Students", value: stats.totalStudents, icon: Users, color: "text-primary" },
            { label: "Sessions", value: stats.totalSessions, icon: Activity, color: "text-primary" },
            { label: "Credits", value: stats.totalCreditsIssued, icon: Coins, color: "text-eternia-warning" },
            { label: "Active", value: stats.activeToday, icon: TrendingUp, color: "text-eternia-success" },
          ].map((s) => (
            <div key={s.label} className="p-2 rounded-xl bg-card border border-border/50">
              <s.icon className={`w-3 h-3 ${s.color} mb-0.5`} />
              <p className="text-sm font-bold leading-none">{s.value}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Scrollable Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 shrink-0 px-2 py-1 rounded-full text-[10px] font-medium ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
              <tab.icon className="w-2.5 h-2.5" />{tab.label}
            </button>
          ))}
        </div>

        {isLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
          <>
            {activeTab === "overview" && (
              <div className="space-y-2.5">
                <div className="rounded-xl bg-card border border-border/50 p-2.5">
                  <h3 className="font-semibold text-xs flex items-center gap-1.5 mb-2"><Calendar className="w-3.5 h-3.5 text-primary" />Recent Appointments</h3>
                  {appointments.length === 0 ? <p className="text-center py-4 text-[10px] text-muted-foreground">None</p>
                    : appointments.slice(0, 5).map((apt: any) => (
                      <div key={apt.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 gap-1 mb-1 last:mb-0">
                        <div className="min-w-0"><p className="font-medium text-[10px] truncate">{apt.student?.username} → {apt.expert?.username}</p><p className="text-[8px] text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")}</p></div>
                        <span className={`px-1 py-0.5 rounded text-[8px] shrink-0 ${apt.status === "completed" ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"}`}>{apt.status}</span>
                      </div>
                    ))}
                </div>
                <div className="rounded-xl bg-card border border-border/50 p-2.5">
                  <h3 className="font-semibold text-xs flex items-center gap-1.5 mb-2"><MessageCircle className="w-3.5 h-3.5 text-primary" />Peer Sessions</h3>
                  {peerSessions.length === 0 ? <p className="text-center py-4 text-[10px] text-muted-foreground">None</p>
                    : peerSessions.slice(0, 5).map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 gap-1 mb-1 last:mb-0">
                        <div className="min-w-0"><p className="font-medium text-[10px] truncate">{s.student?.username} → {s.intern?.username || "Pending"}</p><p className="text-[8px] text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                        <span className={`px-1 py-0.5 rounded text-[8px] shrink-0 ${s.is_flagged ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{s.is_flagged ? "Flagged" : s.status}</span>
                      </div>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "Grant Credits", icon: Coins, tab: "spoc" as TabId },
                    { label: "Add Member", icon: UserPlus, tab: "roles" as TabId },
                    { label: "View Flags", icon: AlertTriangle, tab: "flags" as TabId },
                    { label: "Experts", icon: Users, tab: "experts" as TabId },
                  ].map((a) => (
                    <button key={a.label} className="p-2.5 rounded-xl bg-muted/30 border border-border text-left active:scale-[0.97]" onClick={() => setActiveTab(a.tab)}>
                      <a.icon className="w-3.5 h-3.5 text-primary mb-1" /><p className="font-medium text-[10px]">{a.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8 bg-card text-xs" /></div>
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setActiveTab("roles")}><UserPlus className="w-3.5 h-3.5" /></Button>
                </div>
                <p className="text-[9px] text-muted-foreground">{filteredMembers.length} members</p>
                {filteredMembers.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-card border border-border/50 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-3.5 h-3.5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">{m.username}</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1 py-0.5 rounded text-[8px] capitalize ${m.role === "admin" ? "bg-destructive/10 text-destructive" : m.role === "spoc" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{m.role}</span>
                        <span className="text-[8px] text-muted-foreground">{m.total_sessions}s · {m.streak_days}d</span>
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${m.is_active ? "bg-eternia-success" : "bg-muted-foreground"}`} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "sessions" && (
              <div className="space-y-2.5">
                <div className="rounded-xl bg-card border border-border/50 p-2.5">
                  <h3 className="font-semibold text-xs mb-2">Appointments ({appointments.length})</h3>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {appointments.map((apt: any) => (
                      <div key={apt.id} className="p-2 rounded-lg bg-muted/30 flex items-center justify-between gap-1">
                        <div className="min-w-0"><p className="font-medium text-[10px] truncate">{apt.student?.username} → {apt.expert?.username}</p><p className="text-[8px] text-muted-foreground">{format(new Date(apt.slot_time), "MMM d, h:mm a")}</p></div>
                        <span className={`px-1 py-0.5 rounded text-[8px] shrink-0 ${apt.status === "completed" ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"}`}>{apt.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-card border border-border/50 p-2.5">
                  <h3 className="font-semibold text-xs mb-2">Peer Sessions ({peerSessions.length})</h3>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {peerSessions.map((s: any) => (
                      <div key={s.id} className={`p-2 rounded-lg flex items-center justify-between gap-1 ${s.is_flagged ? "bg-destructive/5" : "bg-muted/30"}`}>
                        <div className="min-w-0"><p className="font-medium text-[10px] truncate">{s.student?.username} → {s.intern?.username || "—"}</p><p className="text-[8px] text-muted-foreground">{format(new Date(s.created_at), "MMM d, h:mm a")}</p></div>
                        <span className={`px-1 py-0.5 rounded text-[8px] shrink-0 ${s.is_flagged ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>{s.is_flagged ? "⚠" : s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "flags" && (
              <div className="space-y-2">
                <h3 className="font-semibold text-xs flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-destructive" />Flagged ({flaggedEntries.length})</h3>
                {flaggedEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground"><CheckCircle className="w-8 h-8 mx-auto mb-2 text-eternia-success" /><p className="text-xs">All Clear</p></div>
                ) : flaggedEntries.map((entry: any) => (
                  <div key={entry.id} className="p-2.5 rounded-xl border border-destructive/20 bg-destructive/5">
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${entry.ai_flag_level >= 3 ? "bg-destructive text-destructive-foreground" : "bg-eternia-warning/20 text-eternia-warning"}`}>
                        {entry.ai_flag_level >= 3 ? "🔴 Critical" : "🟡 Moderate"}
                      </span>
                      <span className="text-[8px] text-muted-foreground">{format(new Date(entry.created_at), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1.5">Requires review</p>
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="outline" className="gap-0.5 h-6 text-[9px] px-1.5"><Eye className="w-2.5 h-2.5" />Review</Button>
                      <Button size="sm" variant="ghost" className="gap-0.5 h-6 text-[9px] px-1.5 text-eternia-success"><CheckCircle className="w-2.5 h-2.5" />Dismiss</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "sounds" && <SoundManager />}
            {activeTab === "institutions" && <InstitutionManager />}
            {activeTab === "escalations" && <EscalationManager />}
            {activeTab === "spoc" && <SPOCTools />}
            {activeTab === "roles" && <div className="space-y-3"><MemberManager /><RoleManager /><CreditGrantTool /></div>}
            {activeTab === "experts" && <ExpertManager />}
            {activeTab === "audit" && <AuditLogViewer />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MobileAdminDashboard;
