import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Video,
  Phone,
  CheckCircle,
  Plus,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VideoCallModal from "@/components/videosdk/VideoCallModal";
import { useAuth } from "@/contexts/AuthContext";

const Appointments = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [callModal, setCallModal] = useState<{
    open: boolean;
    mode: "video" | "audio";
  }>({ open: false, mode: "video" });
  const { profile } = useAuth();

  const experts = [
    {
      id: 1,
      name: "Dr. Sharma",
      specialty: "Clinical Psychologist",
      available: true,
      nextSlot: "Today, 4:00 PM",
      rating: 4.9,
      sessions: 150,
      creditCost: 50,
    },
    {
      id: 2,
      name: "Dr. Patel",
      specialty: "Counseling Psychologist",
      available: true,
      nextSlot: "Tomorrow, 10:00 AM",
      rating: 4.8,
      sessions: 120,
      creditCost: 45,
    },
    {
      id: 3,
      name: "Dr. Kumar",
      specialty: "Mental Health Specialist",
      available: false,
      nextSlot: "Wed, 2:00 PM",
      rating: 4.7,
      sessions: 200,
      creditCost: 55,
    },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      expert: "Dr. Sharma",
      date: "Today",
      time: "4:00 PM",
      type: "Video Call" as const,
      status: "confirmed",
    },
    {
      id: 2,
      expert: "Dr. Patel",
      date: "Mar 15",
      time: "10:00 AM",
      type: "Audio Call" as const,
      status: "pending",
    },
  ];

  const pastAppointments = [
    {
      id: 1,
      expert: "Dr. Kumar",
      date: "Mar 5",
      time: "3:00 PM",
      type: "Video Call" as const,
      status: "completed",
    },
    {
      id: 2,
      expert: "Dr. Sharma",
      date: "Feb 28",
      time: "5:00 PM",
      type: "Video Call" as const,
      status: "completed",
    },
  ];

  const handleJoinCall = (type: "Video Call" | "Audio Call") => {
    setCallModal({
      open: true,
      mode: type === "Video Call" ? "video" : "audio",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display mb-2">Expert Appointments</h1>
            <p className="text-muted-foreground">
              Book sessions with verified mental health professionals
            </p>
          </div>
          <Button className="btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Book New Session
          </Button>
        </div>

        {/* My Appointments */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold font-display mb-4">My Appointments</h2>
          
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "upcoming" ? "default" : "ghost"}
              onClick={() => setActiveTab("upcoming")}
              className={activeTab === "upcoming" ? "bg-primary text-primary-foreground" : ""}
            >
              Upcoming
            </Button>
            <Button
              variant={activeTab === "past" ? "default" : "ghost"}
              onClick={() => setActiveTab("past")}
              className={activeTab === "past" ? "bg-primary text-primary-foreground" : ""}
            >
              Past Sessions
            </Button>
          </div>

          <div className="space-y-3">
            {(activeTab === "upcoming" ? upcomingAppointments : pastAppointments).map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{apt.expert}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </span>
                      <span className="flex items-center gap-1">
                        {apt.type === "Video Call" ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <Phone className="w-4 h-4" />
                        )}
                        {apt.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {apt.status === "confirmed" && (
                    <span className="px-3 py-1 rounded-full bg-eternia-success/10 text-eternia-success text-sm">
                      Confirmed
                    </span>
                  )}
                  {apt.status === "pending" && (
                    <span className="px-3 py-1 rounded-full bg-eternia-warning/10 text-eternia-warning text-sm">
                      Pending
                    </span>
                  )}
                  {apt.status === "completed" && (
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  )}
                  {activeTab === "upcoming" && apt.status === "confirmed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJoinCall(apt.type)}
                      className="gap-1"
                    >
                      {apt.type === "Video Call" ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <Phone className="w-4 h-4" />
                      )}
                      Join
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Experts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-display">Available Experts</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search experts..." className="pl-9 w-48 bg-card" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.map((expert) => (
              <div
                key={expert.id}
                className="p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      expert.available
                        ? "bg-eternia-success/10 text-eternia-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {expert.available ? "Available" : "Busy"}
                  </span>
                </div>

                <h3 className="font-semibold text-lg mb-1">{expert.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{expert.specialty}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span>⭐ {expert.rating}</span>
                  <span>{expert.sessions} sessions</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Next available</p>
                    <p className="font-medium">{expert.nextSlot}</p>
                  </div>
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    {expert.creditCost} ECC
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Call Modal */}
      <VideoCallModal
        isOpen={callModal.open}
        onClose={() => setCallModal({ open: false, mode: "video" })}
        participantName={profile?.username || "Student"}
        mode={callModal.mode}
      />
    </DashboardLayout>
  );
};

export default Appointments;
