import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Video,
  Phone,
  Plus,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

const ExpertDashboard = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"schedule" | "sessions" | "notes">("schedule");
  const [sessionNotes, setSessionNotes] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);

  const { data: myAppointments = [], isLoading } = useQuery({
    queryKey: ["expert-appointments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("appointments")
        .select("*, student:profiles!appointments_student_id_fkey(username)")
        .eq("expert_id", user.id)
        .order("slot_time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: mySlots = [] } = useQuery({
    queryKey: ["expert-slots", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("expert_availability")
        .select("*")
        .eq("expert_id", user.id)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const completeSession = useMutation({
    mutationFn: async ({ appointmentId, notes }: { appointmentId: string; notes: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "completed" as const,
          completed_at: new Date().toISOString(),
          session_notes_encrypted: notes,
        })
        .eq("id", appointmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-appointments"] });
      toast.success("Session marked as complete");
      setSessionNotes("");
      setSelectedAppointment(null);
    },
  });

  const upcomingAppointments = myAppointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed"
  );
  const completedAppointments = myAppointments.filter((a) => a.status === "completed");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Expert Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your schedule, sessions, and session notes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Upcoming", value: upcomingAppointments.length, icon: Calendar, color: "text-primary" },
            { label: "Completed", value: completedAppointments.length, icon: CheckCircle, color: "text-eternia-success" },
            { label: "Total Slots", value: mySlots.length, icon: Clock, color: "text-eternia-warning" },
            { label: "Total Sessions", value: profile?.total_sessions || 0, icon: BarChart3, color: "text-primary" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {([
            { id: "schedule", label: "Schedule", icon: Calendar },
            { id: "sessions", label: "Sessions", icon: Users },
            { id: "notes", label: "Notes", icon: FileText },
          ] as const).map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => setActiveTab(tab.id)}
              className={`gap-2 ${activeTab === tab.id ? "bg-primary text-primary-foreground" : ""}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-display">Upcoming Appointments</h2>
            </div>
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming appointments</p>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map((apt: any) => (
                <Card key={apt.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                          {apt.session_type === "video" ? (
                            <Video className="w-6 h-6 text-white" />
                          ) : (
                            <Phone className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">Session with {apt.student?.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.slot_time), "EEEE, MMMM d · h:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          apt.status === "confirmed" ? "bg-eternia-success/10 text-eternia-success" : "bg-eternia-warning/10 text-eternia-warning"
                        }`}>
                          {apt.status}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedAppointment(apt.id)}
                        >
                          Complete
                        </Button>
                      </div>
                    </div>

                    {selectedAppointment === apt.id && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <Textarea
                          placeholder="Add session notes (encrypted)..."
                          value={sessionNotes}
                          onChange={(e) => setSessionNotes(e.target.value)}
                          className="min-h-[100px] bg-muted/30"
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => completeSession.mutate({ appointmentId: apt.id, notes: sessionNotes })}
                            disabled={completeSession.isPending}
                            className="gap-2"
                          >
                            {completeSession.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Mark Complete
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedAppointment(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold font-display">Completed Sessions</h2>
            {completedAppointments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No completed sessions yet</p>
                </CardContent>
              </Card>
            ) : (
              completedAppointments.map((apt: any) => (
                <Card key={apt.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Session with {apt.student?.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(apt.slot_time), "MMM d, h:mm a")}
                          {apt.completed_at && ` · Completed ${format(new Date(apt.completed_at), "h:mm a")}`}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-eternia-success/10 text-eternia-success">
                        Completed
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold font-display">Session Notes</h2>
            {completedAppointments.filter((a: any) => a.session_notes_encrypted).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No session notes recorded</p>
                </CardContent>
              </Card>
            ) : (
              completedAppointments
                .filter((a: any) => a.session_notes_encrypted)
                .map((apt: any) => (
                  <Card key={apt.id}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-sm">Session with {apt.student?.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(apt.slot_time), "MMM d, yyyy")}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                        {apt.session_notes_encrypted}
                      </p>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExpertDashboard;
