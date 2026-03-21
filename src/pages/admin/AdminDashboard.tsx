import { useIsMobile } from "@/hooks/use-mobile";
import MobileAdminDashboard from "@/components/mobile/MobileAdminDashboard";

import { useState, useMemo } from "react";
import {
  Users, Calendar, MessageCircle, AlertTriangle, TrendingUp, Coins,
  Shield, Activity, Eye, CheckCircle, Clock, BarChart3, Search, Loader2,
  UserPlus, Settings, Music, Building2, FileText, QrCode, Crown, UserCheck,
  Stethoscope, GraduationCap, Phone, Zap, Filter, BookOpen,
} from "lucide-react";
import InstitutionManager from "@/components/admin/InstitutionManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

import SPOCTools from "@/components/admin/SPOCTools";
import RoleManager from "@/components/admin/RoleManager";
import MemberManager from "@/components/admin/MemberManager";
import CreditGrantTool from "@/components/admin/CreditGrantTool";
import SoundManager from "@/components/admin/SoundManager";
import AuditLogViewer from "@/components/admin/AuditLogViewer";
import EscalationManager from "@/components/admin/EscalationManager";
import AccountDeletion from "@/components/admin/AccountDeletion";
import TrainingModuleManager from "@/components/admin/TrainingModuleManager";
import InstitutionDetailView from "@/components/admin/InstitutionDetailView";

type TabId = "overview" | "members" | "sessions" | "spoc" | "roles" | "sounds" | "audit" | "escalations" | "training" | "institution-detail";
type RoleFilter = "all" | "spoc" | "expert" | "intern" | "therapist";
type SessionFilter = "all" | "appointment" | "peer" | "blackbox";

const AdminDashboard = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>("all");
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const { profile } = useAuth();
  const { isAdmin, isSuperAdmin, members, stats, appointments, peerSessions, flaggedEntries, blackboxSessions, institutions, isLoading } = useAdmin();

  if (isMobile) return <MobileAdminDashboard />;

  if (!isAdmin) return (
    <DashboardLayout><div className="flex flex-col items-center justify-center h-64"><Shield className="w-12 h-12 text-muted-foreground mb-3" /><h2 className="text-lg font-semibold">Access Denied</h2></div></DashboardLayout>
  );

  // Members filtering
  const filteredMembers = useMemo(() => {
    let filtered = members;
    if (roleFilter !== "all") {
      // "therapist" maps to expert with specialty
      if (roleFilter === "therapist") {
        filtered = filtered.filter((m) => m.role === "expert" && m.specialty);
      } else {
        filtered = filtered.filter((m) => m.role === roleFilter);
      }
    }
    if (searchQuery) {
      filtered = filtered.filter((m) => m.username.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [members, roleFilter, searchQuery]);

  // Unified session feed
  const unifiedSessions = useMemo(() => {
    const items: { id: string; type: "appointment" | "peer" | "blackbox"; description: string; date: string; status: string; flagged?: boolean }[] = [];

    if (sessionFilter === "all" || sessionFilter === "appointment") {
      appointments.forEach((apt: any) => {
        items.push({
          id: apt.id,
          type: "appointment",
          description: `${apt.expert?.username || "Expert"} took an appointment with ${apt.student?.username || "Student"}`,
          date: apt.slot_time,
          status: apt.status,
        });
      });
    }

    if (sessionFilter === "all" || sessionFilter === "peer") {
      peerSessions.forEach((s: any) => {
        items.push({
          id: s.id,
          type: "peer",
          description: `${s.student?.username || "Student"} connected with ${s.intern?.username || "Pending intern"}`,
          date: s.created_at,
          status: s.status,
          flagged: s.is_flagged,
        });
      });
    }

    if (sessionFilter === "all" || sessionFilter === "blackbox") {
      blackboxSessions.forEach((bs: any) => {
        items.push({
          id: bs.id,
          type: "blackbox",
          description: `BlackBox session${bs.therapist?.username ? ` — escalated to ${bs.therapist.username}` : ""}`,
          date: bs.created_at,
          status: bs.status,
          flagged: bs.flag_level > 0,
        });
      });
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, peerSessions, blackboxSessions, sessionFilter]);

  // Derived stats
  const roleCounts = {
    admin: members.filter(m => m.role === "admin").length,
    spoc: members.filter(m => m.role === "spoc").length,
    expert: members.filter(m => m.role === "expert").length,
    intern: members.filter(m => m.role === "intern").length,
    student: members.filter(m => m.role === "student").length,
  };

  // SPOC per institution
  const institutionData = useMemo(() => {
    return institutions.map((inst: any) => {
      const instMembers = members.filter(m => m.institution_id === inst.id);
      const spoc = instMembers.find(m => m.role === "spoc");
      const studentCount = instMembers.filter(m => m.role === "student").length;
      const sessionCount = appointments.filter((a: any) =>
        instMembers.some(m => m.id === a.student_id || m.id === a.expert_id)
      ).length;
      return { ...inst, spoc, studentCount, sessionCount, memberCount: instMembers.length };
    });
  }, [institutions, members, appointments]);

  const adminTabs: { id: TabId; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "members", label: "Members", icon: Users },
    { id: "sessions", label: "Sessions", icon: Calendar },
    { id: "spoc", label: "SPOC", icon: Building2 },
    { id: "roles", label: "Roles", icon: UserPlus },
    { id: "training", label: "Training", icon: BookOpen },
    { id: "sounds", label: "Sounds", icon: Music },
    { id: "escalations", label: "Escalations", icon: AlertTriangle },
    { id: "audit", label: "Audit Logs", icon: FileText },
  ];

  const roleFilterButtons: { id: RoleFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "spoc", label: "SPOC" },
    { id: "expert", label: "Expert" },
    { id: "intern", label: "Intern" },
    { id: "therapist", label: "Therapist" },
  ];

  const sessionFilterButtons: { id: SessionFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "appointment", label: "Appointments" },
    { id: "peer", label: "Peer" },
    { id: "blackbox", label: "BlackBox" },
  ];

  const getSessionTypeBadge = (type: string) => {
    const map: Record<string, string> = {
      appointment: "bg-primary/10 text-primary",
      peer: "bg-eternia-lavender/10 text-eternia-lavender",
      blackbox: "bg-eternia-warning/10 text-eternia-warning",
    };
    return map[type] || "bg-muted text-muted-foreground";
  };

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
          <Button variant="outline" size="sm" className="gap-1.5 h-9"><Settings className="w-4 h-4" /></Button>
        </div>

        {/* Control Center Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/10 to-accent/15 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm font-display">{isSuperAdmin ? "Super Admin Control Center" : "SPOC Control Center"}</h2>
              <p className="text-xs text-muted-foreground">{isSuperAdmin ? "Full system overview — all users, all data, all modules" : "Manage your institution"}</p>
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
            {/* ─── OVERVIEW ─── */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Admins", value: roleCounts.admin, icon: Crown, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
                    { label: "SPOCs", value: roleCounts.spoc, icon: Shield, iconBg: "bg-primary/10", iconColor: "text-primary" },
                    { label: "Experts", value: roleCounts.expert, icon: Stethoscope, iconBg: "bg-eternia-success/10", iconColor: "text-eternia-success" },
                    { label: "Interns", value: roleCounts.intern, icon: GraduationCap, iconBg: "bg-eternia-warning/10", iconColor: "text-eternia-warning" },
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

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { label: "Students", value: roleCounts.student, icon: Users, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
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

                {/* Flagged alerts */}
                {flaggedEntries.length > 0 && (
                  <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-5">
                    <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-destructive" />Flagged Entries ({flaggedEntries.length})
                    </h3>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {flaggedEntries.slice(0, 5).map((entry: any) => (
                        <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/30 gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${entry.ai_flag_level >= 3 ? "bg-destructive text-destructive-foreground" : "bg-eternia-warning/20 text-eternia-warning"}`}>
                              {entry.ai_flag_level >= 3 ? "Critical" : "Moderate"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{format(new Date(entry.created_at), "MMM d, h:mm a")}</span>
                          </div>
                          <Button size="sm" variant="outline" className="gap-1 h-7 text-[11px] px-2"><Eye className="w-3 h-3" />Review</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="rounded-2xl bg-card border border-border/50 p-5">
                  <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Grant Credits", icon: Coins, tab: "roles" as TabId, iconBg: "bg-eternia-warning/10", iconColor: "text-eternia-warning" },
                      { label: "Add Member", icon: UserPlus, tab: "roles" as TabId, iconBg: "bg-primary/10", iconColor: "text-primary" },
                      { label: "View Sessions", icon: Calendar, tab: "sessions" as TabId, iconBg: "bg-eternia-success/10", iconColor: "text-eternia-success" },
                      { label: "SPOC / Institutions", icon: Building2, tab: "spoc" as TabId, iconBg: "bg-eternia-lavender/10", iconColor: "text-eternia-lavender" },
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

            {/* ─── MEMBERS ─── */}
            {activeTab === "members" && (
              <div className="space-y-3">
                {/* Role filter pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {roleFilterButtons.map((rf) => (
                    <button key={rf.id} onClick={() => setRoleFilter(rf.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${roleFilter === rf.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                      {rf.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 bg-card text-sm" /></div>
                  <Button size="sm" variant="outline" className="gap-1 h-9 text-xs" onClick={() => setActiveTab("roles")}><UserPlus className="w-3.5 h-3.5" />Add</Button>
                </div>
                <p className="text-xs text-muted-foreground">{filteredMembers.length} members{roleFilter !== "all" ? ` (${roleFilter})` : ""}</p>
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50"><Users className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No results</p></div>
                ) : (
                  <div className="space-y-2">{filteredMembers.map((member) => (
                    <div key={member.id} className="p-3 rounded-xl bg-card border border-border/50 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.username}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] capitalize ${member.role === "admin" ? "bg-destructive/10 text-destructive" : member.role === "spoc" ? "bg-primary/10 text-primary" : member.role === "expert" ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"}`}>{member.role}</span>
                          <span className="text-[10px] text-muted-foreground">{member.total_sessions} sessions</span>
                          {member.institution_id && <span className="text-[10px] text-muted-foreground/60">• institution linked</span>}
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${member.is_active ? "bg-eternia-success" : "bg-muted-foreground"}`} />
                    </div>
                  ))}</div>
                )}
              </div>
            )}

            {/* ─── SESSIONS ─── */}
            {activeTab === "sessions" && (
              <div className="space-y-3">
                {/* Session type filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  {sessionFilterButtons.map((sf) => (
                    <button key={sf.id} onClick={() => setSessionFilter(sf.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${sessionFilter === sf.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                      {sf.label}
                    </button>
                  ))}
                  <span className="text-xs text-muted-foreground ml-auto">{unifiedSessions.length} sessions</span>
                </div>

                {unifiedSessions.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border/50"><Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No sessions found</p></div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {unifiedSessions.map((s) => (
                      <div key={s.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${s.flagged ? "bg-destructive/5 border-destructive/20" : "bg-card border-border/50"}`}>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{s.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(s.date), "MMM d, yyyy · h:mm a")}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] capitalize ${getSessionTypeBadge(s.type)}`}>{s.type}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${s.flagged ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                            {s.flagged ? "⚠ Flagged" : s.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── SPOC ─── */}
            {activeTab === "spoc" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <InstitutionManager onSelectInstitution={(inst) => {
                    setSelectedInstitution(inst);
                    setActiveTab("institution-detail");
                  }} />
                </div>
                <div>
                  <RoleManager />
                </div>
              </div>
            )}

            {/* ─── INSTITUTION DETAIL ─── */}
            {activeTab === "institution-detail" && selectedInstitution && (
              <InstitutionDetailView
                institution={selectedInstitution}
                onBack={() => setActiveTab("spoc")}
              />
            )}

            {/* ─── ROLES ─── */}
            {activeTab === "roles" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <MemberManager />
                <RoleManager />
                <CreditGrantTool />
              </div>
            )}

            {/* ─── SOUNDS ─── */}
            {activeTab === "sounds" && (
              <div className="max-w-2xl">
                <SoundManager />
              </div>
            )}

            {/* ─── ESCALATIONS ─── */}
            {activeTab === "escalations" && (
              <div className="max-w-3xl">
                <EscalationManager />
              </div>
            )}

            {/* ─── AUDIT LOGS ─── */}
            {activeTab === "audit" && (
              <div className="max-w-4xl space-y-4">
                <AuditLogViewer />
                <AccountDeletion />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
