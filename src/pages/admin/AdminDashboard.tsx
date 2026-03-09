import { useState } from "react";
import {
  Users,
  Calendar,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Coins,
  Shield,
  Activity,
  Eye,
  CheckCircle,
  Clock,
  BarChart3,
  Search,
  Loader2,
  UserPlus,
  Settings,
  Music,
  Building2,
  FileText,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "sessions" | "flags" | "sounds" | "institutions" | "escalations" | "spoc" | "audit" | "roles" | "experts">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const { profile } = useAuth();
  const { isAdmin, members, stats, appointments, peerSessions, flaggedEntries, isLoading } = useAdmin();

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Shield className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Institution overview and management • {profile?.role === "admin" ? "Super Admin" : "SPOC"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Students", value: stats.totalStudents, icon: Users, color: "text-primary" },
            { label: "Total Sessions", value: stats.totalSessions, icon: Activity, color: "text-primary" },
            { label: "Credits Issued", value: stats.totalCreditsIssued, icon: Coins, color: "text-eternia-warning" },
            { label: "Active Today", value: stats.activeToday, icon: TrendingUp, color: "text-eternia-success" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">Today</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            { id: "overview" as const, label: "Overview", icon: BarChart3 },
            { id: "members" as const, label: `Members (${members.length})`, icon: Users },
            { id: "sessions" as const, label: "Sessions", icon: Calendar },
            { id: "flags" as const, label: `Flags (${flaggedEntries.length})`, icon: AlertTriangle },
            { id: "escalations" as const, label: "Escalations", icon: Shield },
            { id: "spoc" as const, label: "SPOC Tools", icon: QrCode },
            { id: "sounds" as const, label: "Sounds", icon: Music },
            { id: "roles" as const, label: "Roles", icon: UserPlus },
            { id: "institutions" as const, label: "Institutions", icon: Building2 },
            { id: "audit" as const, label: "Audit Log", icon: FileText },
          ]).map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`gap-2 shrink-0 ${activeTab === tab.id ? "bg-primary text-primary-foreground" : ""}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Appointments */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="w-5 h-5 text-primary" />
                      Recent Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {appointments.length === 0 ? (
                      <p className="text-center py-6 text-muted-foreground text-sm">No appointments yet</p>
                    ) : (
                      appointments.slice(0, 5).map((apt: any) => (
                        <div key={apt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {apt.student?.username || "Student"} → {apt.expert?.username || "Expert"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(apt.slot_time), "MMM d, h:mm a")}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs shrink-0 ml-2 ${
                            apt.status === "completed" ? "bg-eternia-success/10 text-eternia-success" :
                            apt.status === "confirmed" ? "bg-primary/10 text-primary" :
                            apt.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Recent Peer Sessions */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Recent Peer Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {peerSessions.length === 0 ? (
                      <p className="text-center py-6 text-muted-foreground text-sm">No peer sessions yet</p>
                    ) : (
                      peerSessions.slice(0, 5).map((session: any) => (
                        <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {session.student?.username || "Student"} → {session.intern?.username || "Pending"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(session.created_at), "MMM d, h:mm a")}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs shrink-0 ml-2 ${
                            session.is_flagged ? "bg-destructive/10 text-destructive" :
                            session.status === "active" ? "bg-eternia-success/10 text-eternia-success" :
                            session.status === "completed" ? "bg-primary/10 text-primary" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {session.is_flagged ? "Flagged" : session.status}
                          </span>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Grant Credits", icon: Coins, desc: "Allocate ECC to students" },
                        { label: "Add Member", icon: UserPlus, desc: "Invite new users" },
                        { label: "View Flags", icon: AlertTriangle, desc: "Review flagged entries" },
                        { label: "Manage Experts", icon: Users, desc: "Expert scheduling" },
                      ].map((action) => (
                        <button
                          key={action.label}
                          className="p-4 rounded-xl bg-muted/30 border border-border text-left hover:border-primary/50 transition-all"
                          onClick={() => {
                            if (action.label === "View Flags") setActiveTab("flags");
                            if (action.label === "Add Member") setActiveTab("roles");
                            if (action.label === "Grant Credits") setActiveTab("spoc");
                            if (action.label === "Manage Experts") setActiveTab("experts");
                          }}
                        >
                          <action.icon className="w-5 h-5 text-primary mb-2" />
                          <p className="font-medium text-sm">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.desc}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Institution Members</CardTitle>
                    <div className="relative w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-muted/30"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                          <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                          <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Sessions</th>
                          <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Streak</th>
                          <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground">
                              No members found
                            </td>
                          </tr>
                        ) : (
                          filteredMembers.map((member) => (
                            <tr key={member.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Users className="w-4 h-4 text-primary" />
                                  </div>
                                  <span className="font-medium text-sm">{member.username}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs capitalize ${
                                  member.role === "admin" || member.role === "spoc" ? "bg-primary/10 text-primary" :
                                  member.role === "expert" ? "bg-eternia-success/10 text-eternia-success" :
                                  member.role === "intern" ? "bg-eternia-warning/10 text-eternia-warning" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {member.role}
                                </span>
                              </td>
                              <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{member.total_sessions}</td>
                              <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{member.streak_days}d</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                                  member.is_active ? "bg-eternia-success/10 text-eternia-success" : "bg-muted text-muted-foreground"
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${member.is_active ? "bg-eternia-success" : "bg-muted-foreground"}`} />
                                  {member.is_active ? "Active" : "Inactive"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Expert Appointments ({appointments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                    {appointments.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground text-sm">No appointments</p>
                    ) : (
                      appointments.map((apt: any) => (
                        <div key={apt.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">{apt.student?.username} → {apt.expert?.username}</p>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              apt.status === "completed" ? "bg-eternia-success/10 text-eternia-success" :
                              apt.status === "confirmed" ? "bg-primary/10 text-primary" :
                              apt.status === "cancelled" ? "bg-destructive/10 text-destructive" :
                              "bg-muted text-muted-foreground"
                            }`}>{apt.status}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(apt.slot_time), "MMM d, h:mm a")}
                            </span>
                            <span>{apt.session_type}</span>
                            <span>{apt.credits_charged} ECC</span>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Peer Sessions ({peerSessions.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                    {peerSessions.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground text-sm">No peer sessions</p>
                    ) : (
                      peerSessions.map((session: any) => (
                        <div key={session.id} className={`p-3 rounded-lg border ${
                          session.is_flagged ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-border"
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-sm">
                              {session.student?.username} → {session.intern?.username || "Unassigned"}
                            </p>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              session.is_flagged ? "bg-destructive/10 text-destructive" :
                              session.status === "active" ? "bg-eternia-success/10 text-eternia-success" :
                              session.status === "completed" ? "bg-primary/10 text-primary" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {session.is_flagged ? "⚠ Flagged" : session.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(session.created_at), "MMM d, h:mm a")}
                            {session.ended_at && ` — ${format(new Date(session.ended_at), "h:mm a")}`}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Flags Tab */}
            {activeTab === "flags" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Flagged Entries ({flaggedEntries.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {flaggedEntries.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-eternia-success" />
                      <p className="font-medium">All Clear</p>
                      <p className="text-sm">No flagged entries requiring review</p>
                    </div>
                  ) : (
                    flaggedEntries.map((entry: any) => (
                      <div key={entry.id} className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              entry.ai_flag_level >= 3 ? "bg-destructive text-destructive-foreground" :
                              entry.ai_flag_level === 2 ? "bg-eternia-warning/20 text-eternia-warning" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {entry.ai_flag_level >= 3 ? "🔴 Critical" : entry.ai_flag_level === 2 ? "🟡 Moderate" : "🟢 Low"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Level {entry.ai_flag_level}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(entry.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          This entry has been flagged by the AI safety system and requires review.
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Eye className="w-4 h-4" /> Review Entry
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-1 text-eternia-success">
                            <CheckCircle className="w-4 h-4" /> Dismiss
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Sounds Tab */}
            {activeTab === "sounds" && <SoundManager />}

            {/* Institutions Tab */}
            {activeTab === "institutions" && <InstitutionManager />}

            {/* Escalations Tab */}
            {activeTab === "escalations" && <EscalationManager />}

            {/* SPOC Tools Tab */}
            {activeTab === "spoc" && <SPOCTools />}

            {/* Roles Tab */}
            {activeTab === "roles" && (
              <div className="space-y-6">
                <MemberManager />
                <RoleManager />
              </div>
            )}

            {/* Audit Log Tab */}
            {activeTab === "audit" && <AuditLogViewer />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
