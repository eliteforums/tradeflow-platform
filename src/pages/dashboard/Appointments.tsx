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
  Coins,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VideoCallModal from "@/components/videosdk/VideoCallModal";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/hooks/useAppointments";
import { useCredits } from "@/hooks/useCredits";
import { format } from "date-fns";

const Appointments = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [callModal, setCallModal] = useState<{ open: boolean; mode: "video" | "audio" }>({
    open: false,
    mode: "video",
  });
  const [bookingDialog, setBookingDialog] = useState<{
    open: boolean;
    expert?: any;
    slot?: any;
  }>({ open: false });
  const [sessionType, setSessionType] = useState<"video" | "audio">("video");

  const { profile } = useAuth();
  const { balance } = useCredits();
  const {
    experts,
    slots,
    upcomingAppointments,
    pastAppointments,
    isLoading,
    bookAppointment,
    cancelAppointment,
    isBooking,
  } = useAppointments();

  const handleJoinCall = (type: string) => {
    setCallModal({ open: true, mode: type === "video" ? "video" : "audio" });
  };

  const handleBookSlot = (expert: any, slot: any) => {
    setBookingDialog({ open: true, expert, slot });
  };

  const confirmBooking = () => {
    if (!bookingDialog.expert || !bookingDialog.slot) return;

    bookAppointment({
      expertId: bookingDialog.expert.id,
      slotId: bookingDialog.slot.id,
      slotTime: bookingDialog.slot.start_time,
      sessionType,
      creditCost: 50,
    });
    setBookingDialog({ open: false });
  };

  const getExpertSlots = (expertId: string) => slots.filter((s) => s.expert_id === expertId);

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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display mb-2">Expert Appointments</h1>
            <p className="text-muted-foreground">
              Book sessions with verified mental health professionals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border">
              <Coins className="w-5 h-5 text-primary" />
              <span className="font-semibold">{balance} ECC</span>
            </div>
          </div>
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
              Upcoming ({upcomingAppointments.length})
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
            {(activeTab === "upcoming" ? upcomingAppointments : pastAppointments).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {activeTab} appointments
              </div>
            ) : (
              (activeTab === "upcoming" ? upcomingAppointments : pastAppointments).map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{apt.expert?.username || "Expert"}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(apt.slot_time), "MMM d")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(apt.slot_time), "h:mm a")}
                        </span>
                        <span className="flex items-center gap-1">
                          {apt.session_type === "video" ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <Phone className="w-4 h-4" />
                          )}
                          {apt.session_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        apt.status === "confirmed"
                          ? "bg-eternia-success/10 text-eternia-success"
                          : apt.status === "pending"
                          ? "bg-eternia-warning/10 text-eternia-warning"
                          : apt.status === "completed"
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                    {activeTab === "upcoming" && (apt.status === "confirmed" || apt.status === "pending") && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJoinCall(apt.session_type)}
                          className="gap-1"
                        >
                          {apt.session_type === "video" ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <Phone className="w-4 h-4" />
                          )}
                          Join
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelAppointment(apt.id)}
                          className="text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
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

          {experts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No experts available at the moment</p>
              <p className="text-sm mt-1">Check back later for available slots</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experts.map((expert) => {
                const expertSlots = getExpertSlots(expert.id);
                const hasSlots = expertSlots.length > 0;

                return (
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
                          hasSlots
                            ? "bg-eternia-success/10 text-eternia-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {hasSlots ? "Available" : "No slots"}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{expert.username}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {expert.specialty || "Mental Health Professional"}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>⭐ 4.9</span>
                      <span>{expert.total_sessions} sessions</span>
                    </div>

                    {hasSlots && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs text-muted-foreground">Available slots:</p>
                        <div className="flex flex-wrap gap-2">
                          {expertSlots.slice(0, 3).map((slot) => (
                            <Button
                              key={slot.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleBookSlot(expert, slot)}
                              className="text-xs"
                            >
                              {format(new Date(slot.start_time), "MMM d, h:mm a")}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Cost per session</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Coins className="w-4 h-4 text-primary" /> 50 ECC
                        </p>
                      </div>
                      {hasSlots && (
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground"
                          onClick={() => handleBookSlot(expert, expertSlots[0])}
                        >
                          Book Now
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialog.open} onOpenChange={(open) => setBookingDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Confirm your appointment with {bookingDialog.expert?.username}
            </DialogDescription>
          </DialogHeader>

          {bookingDialog.slot && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {format(new Date(bookingDialog.slot.start_time), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>
                    {format(new Date(bookingDialog.slot.start_time), "h:mm a")} -{" "}
                    {format(new Date(bookingDialog.slot.end_time), "h:mm a")}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Session Type</p>
                <div className="flex gap-2">
                  <Button
                    variant={sessionType === "video" ? "default" : "outline"}
                    onClick={() => setSessionType("video")}
                    className="flex-1 gap-2"
                  >
                    <Video className="w-4 h-4" />
                    Video Call
                  </Button>
                  <Button
                    variant={sessionType === "audio" ? "default" : "outline"}
                    onClick={() => setSessionType("audio")}
                    className="flex-1 gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Audio Call
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <span>Cost</span>
                <span className="font-semibold flex items-center gap-2">
                  <Coins className="w-5 h-5 text-primary" />
                  50 ECC
                </span>
              </div>

              {balance < 50 && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  Insufficient credits. You need 50 ECC to book this appointment.
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingDialog({ open: false })}>
              Cancel
            </Button>
            <Button
              onClick={confirmBooking}
              disabled={isBooking || balance < 50}
              className="btn-primary"
            >
              {isBooking ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
